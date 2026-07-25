const asNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const isKnown = (v) => {
  const s = String(v ?? "")
    .trim()
    .toLowerCase();
  return Boolean(s) && !["unknown", "not specified", "not_specified", "n/a", "na", "null", "undefined"].includes(s);
};

const titleCase = (value = "") =>
  String(value || "")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const pct = (part, whole) => {
  if (!whole) return null;
  return Math.round((part / whole) * 1000) / 10;
};

export const RM_TEAM_ROLES = new Set([
  "sales_manager",
  "sales_agent",
  "sales_executive",
  "sales_executives",
  "business_development_manager",
  "business_development_executive",
  "relationship_manager",
]);

export const RM_DATE_PRESETS = [
  { key: "all", label: "All time" },
  { key: "today", label: "Today" },
  { key: "7d", label: "7 days" },
  { key: "30d", label: "30 days" },
  { key: "custom", label: "Custom" },
];

export const formatRelativeClock = (value) => {
  if (!value) return "just now";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "just now";
  const seconds = Math.max(0, Math.round((Date.now() - date.getTime()) / 1000));
  if (seconds < 45) return "just now";
  if (seconds < 3600) return `${Math.round(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)}h ago`;
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const unpackList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.users)) return payload.users;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
};

const mergeGeoRows = (projectRows = [], propertyRows = [], keyName = "city") => {
  const map = new Map();
  [...projectRows, ...propertyRows].forEach((row) => {
    const key = String(row?._id ?? "");
    if (!isKnown(key)) return;
    const existing = map.get(key) || {
      [keyName]: key,
      label: key,
      total: 0,
      active: 0,
      pending: 0,
      draft: 0,
    };
    existing.total += asNumber(row?.total);
    existing.active += asNumber(row?.active);
    existing.pending += asNumber(row?.pending);
    existing.draft += asNumber(row?.draft);
    map.set(key, existing);
  });
  const sorted = [...map.values()].sort((a, b) => b.total - a.total);
  const max = sorted[0]?.total || 1;
  return sorted.map((row) => ({
    ...row,
    pct: Math.round((row.total / max) * 100),
  }));
};

export function mapRegionalManagerData({
  currentUser = null,
  projectsAnalytics = {},
  propertiesAnalytics = {},
  usersPayload = [],
  range = {},
  selectedCity = "All Cities",
  selectedStatus = "All Statuses",
}) {
  const projectOverview = projectsAnalytics?.overview || {};
  const propertyOverview = propertiesAnalytics?.overview || {};

  const totalListings =
    asNumber(projectOverview.totalProjects) + asNumber(propertyOverview.totalProperties);
  const activeListings =
    asNumber(projectOverview.activeProjects) + asNumber(propertyOverview.activeProperties);
  const pendingCount =
    asNumber(projectOverview.pendingProjects) + asNumber(propertyOverview.pendingProperties);
  const draftCount =
    asNumber(projectOverview.draftProjects || projectOverview.inactiveProjects) +
    asNumber(propertyOverview.draftProperties);
  const totalViews =
    asNumber(projectOverview.totalViews) + asNumber(propertyOverview.totalViews);
  const totalInquiries =
    asNumber(projectOverview.totalInquiries) + asNumber(propertyOverview.totalInquiries);
  const totalClicks =
    asNumber(projectOverview.totalClicks) + asNumber(propertyOverview.totalClicks);

  const leadByStatus =
    projectsAnalytics?.leadSummary?.byStatus ||
    propertiesAnalytics?.leadSummary?.byStatus ||
    {};
  const newLeads = asNumber(leadByStatus.new_lead);
  const conversions = asNumber(leadByStatus.sale);
  const inquiries = totalInquiries || newLeads;

  const users = unpackList(usersPayload);
  const teamMembers = users.filter((u) =>
    RM_TEAM_ROLES.has(String(u.roleName || "").toLowerCase()),
  );
  const activeTeam = teamMembers.filter((u) => u.isActive !== false).length;

  const cityRows = mergeGeoRows(
    projectsAnalytics?.cityWise,
    propertiesAnalytics?.cityWise,
    "city",
  );
  const localityRows = mergeGeoRows(
    projectsAnalytics?.localityWise,
    propertiesAnalytics?.localityWise,
    "locality",
  );

  const statusRows = (() => {
    const raw = [
      ...(projectsAnalytics?.statusWise || []),
      ...(propertiesAnalytics?.statusWise || []),
    ];
    const map = new Map();
    raw.forEach((row) => {
      const key = String(row?._id ?? "unknown").toLowerCase();
      if (!key) return;
      map.set(key, (map.get(key) || 0) + asNumber(row?.total));
    });
    return [...map.entries()]
      .map(([status, total]) => ({ status, total, label: titleCase(status) }))
      .sort((a, b) => b.total - a.total);
  })();

  const inventoryRows = (localityRows.length ? localityRows : cityRows)
    .map((row) => ({
      key: row.city || row.locality || row.label,
      label: row.city || row.locality || row.label,
      type: row.city ? "City" : "Locality",
      total: row.total,
      active: row.active,
      pending: row.pending,
      draft: row.draft,
    }))
    .filter((row) => {
      if (selectedCity !== "All Cities" && row.type === "City") {
        return String(row.label).toLowerCase() === selectedCity.toLowerCase();
      }
      if (selectedStatus === "All Statuses") return true;
      if (selectedStatus === "active") return asNumber(row.active) > 0;
      if (selectedStatus === "pending") return asNumber(row.pending) > 0;
      if (selectedStatus === "draft") return asNumber(row.draft) > 0;
      return true;
    });

  const liveRate = pct(activeListings, totalListings);
  const regionLabel = currentUser?.state || "Your region";
  const periodLabel = range?.label || "All time";

  const roleBreakdown = (() => {
    const map = new Map();
    teamMembers.forEach((member) => {
      const role = String(member.roleName || "unknown").toLowerCase();
      map.set(role, (map.get(role) || 0) + 1);
    });
    return [...map.entries()]
      .map(([role, count]) => ({ role, label: titleCase(role), count }))
      .sort((a, b) => b.count - a.count);
  })();

  const kpis = [
    {
      key: "listings",
      label: "Total inventory",
      value: totalListings.toLocaleString("en-IN"),
      tone: "emerald",
      hint: "Projects + properties in region",
      href: "/properties",
    },
    {
      key: "active",
      label: "Active listings",
      value: activeListings.toLocaleString("en-IN"),
      tone: "blue",
      hint: liveRate == null ? "Live share N/A" : `${liveRate}% live`,
      href: "/properties?status=active",
    },
    {
      key: "pending",
      label: "Pending review",
      value: pendingCount.toLocaleString("en-IN"),
      tone: "amber",
      hint: `${draftCount.toLocaleString("en-IN")} drafts`,
      href: "/properties?status=pending",
    },
    {
      key: "inquiries",
      label: "Inquiries",
      value: inquiries.toLocaleString("en-IN"),
      tone: "violet",
      hint:
        conversions > 0
          ? `${conversions.toLocaleString("en-IN")} converted`
          : `${totalClicks.toLocaleString("en-IN")} clicks`,
      href: "/leads",
    },
    {
      key: "views",
      label: "Total views",
      value: totalViews.toLocaleString("en-IN"),
      tone: "emerald",
      hint: "Across regional listings",
      href: "/properties",
    },
    {
      key: "team",
      label: "Team members",
      value: teamMembers.length.toLocaleString("en-IN"),
      tone: "blue",
      hint: `${activeTeam} active sales roles`,
      href: "/sales-managers",
    },
  ];

  const summary = {
    totalListings,
    activeListings,
    pendingCount,
    draftCount,
    inquiries,
    totalViews,
    conversions,
    liveRate,
    teamCount: teamMembers.length,
    activeTeam,
    regionLabel,
    periodLabel,
  };

  const allCities = [
    ...new Set([
      ...users.map((u) => u.city).filter(isKnown),
      ...cityRows.map((r) => r.city).filter(isKnown),
    ]),
  ].sort();

  return {
    currentUserName: currentUser?.name || currentUser?.fullName || "Regional Manager",
    regionLabel,
    rangeLabel: periodLabel,
    summary,
    kpis,
    cityRows,
    localityRows,
    statusRows,
    inventoryRows,
    teamMembers: teamMembers.slice(0, 12),
    roleBreakdown,
    allCities,
  };
}

export { asNumber, isKnown, titleCase, unpackList };
