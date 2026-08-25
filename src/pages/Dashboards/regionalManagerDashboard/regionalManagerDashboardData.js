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

/**
 * Online = we heard from them recently (lastSeenAt / heartbeat).
 * Heartbeat ~45s; allow ~3 minutes of silence before Offline (no logout required).
 */
export const ONLINE_WINDOW_MS = 3 * 60 * 1000;

export const normalizeRmRole = (value = "") =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_");

export const roleGroupKey = (roleName = "") => {
  const role = normalizeRmRole(roleName);
  if (
    role === "super_admin" ||
    role === "ceo" ||
    role === "founder" ||
    role === "admin" ||
    role === "operations_head" ||
    role === "operation_head" ||
    role === "business_development_head"
  ) {
    return "leadership";
  }
  if (role === "regional_manager" || role === "regional_managers") {
    return "regional_manager";
  }
  if (role === "business_development_manager" || role === "business_development_executive") {
    return "bdm";
  }
  if (role === "sales_manager") return "sales_manager";
  if (
    role === "sales_executive" ||
    role === "sales_executives" ||
    role === "sales_agent"
  ) {
    return "sales_executive";
  }
  if (
    role === "customer_support_head" ||
    role === "customer_support_team_lead" ||
    role === "customer_support_team_leads" ||
    role === "team_lead" ||
    role === "team_leads"
  ) {
    return "support_lead";
  }
  if (
    role === "customer_care" ||
    role === "customer_care_executive" ||
    role === "customer_care_executives"
  ) {
    return "cce";
  }
  if (role === "relationship_manager" || role === "relationship_managers") {
    return "relationship_manager";
  }
  if (
    role === "marketing_head" ||
    role === "digital_marketing" ||
    role === "social_media" ||
    role === "content_team" ||
    role === "creative_team" ||
    role === "performance_marketing"
  ) {
    return "marketing";
  }
  if (
    role === "accounts" ||
    role === "accounts_finance" ||
    role === "legal_compliance" ||
    role === "hr_administration" ||
    role === "hr" ||
    role === "legal"
  ) {
    return "ops_functions";
  }
  if (role === "technical_support_head" || role === "technical_support_team") {
    return "tech";
  }
  return "other";
};

export const ROLE_GROUP_META = {
  all: { label: "All team", accent: "emerald" },
  leadership: { label: "Leadership", accent: "slate" },
  regional_manager: { label: "Regional Managers", accent: "indigo" },
  sales_executive: { label: "Sales Executives", accent: "teal" },
  bdm: { label: "BDMs", accent: "blue" },
  sales_manager: { label: "Sales Managers", accent: "amber" },
  support_lead: { label: "Support Leads", accent: "cyan" },
  cce: { label: "Care Executives", accent: "sky" },
  relationship_manager: { label: "Rel. Managers", accent: "violet" },
  marketing: { label: "Marketing", accent: "pink" },
  ops_functions: { label: "Accounts / HR / Legal", accent: "orange" },
  tech: { label: "Tech Support", accent: "zinc" },
  other: { label: "Other roles", accent: "violet" },
};

/** Super Admin Staff Floor — every Propenu staff role (not marketplace end users). */
export const SA_STAFF_ROLES = new Set([
  "super_admin",
  "ceo",
  "founder",
  "admin",
  "operations_head",
  "operation_head",
  "business_development_head",
  "regional_manager",
  "regional_managers",
  "business_development_manager",
  "business_development_executive",
  "sales_manager",
  "sales_agent",
  "sales_executive",
  "sales_executives",
  "customer_support_head",
  "customer_support_team_lead",
  "customer_support_team_leads",
  "team_lead",
  "team_leads",
  "customer_care",
  "customer_care_executive",
  "customer_care_executives",
  "relationship_manager",
  "relationship_managers",
  "marketing_head",
  "digital_marketing",
  "social_media",
  "content_team",
  "creative_team",
  "performance_marketing",
  "accounts",
  "accounts_finance",
  "legal_compliance",
  "hr_administration",
  "hr",
  "legal",
  "technical_support_head",
  "technical_support_team",
]);

export const SA_GROUP_TABS = [
  { key: "all", label: "All" },
  { key: "leadership", label: "Leadership" },
  { key: "regional_manager", label: "Regional Managers" },
  { key: "bdm", label: "BDMs" },
  { key: "sales_manager", label: "Sales Managers" },
  { key: "sales_executive", label: "Sales Executives" },
  { key: "support_lead", label: "Support Leads" },
  { key: "cce", label: "Care Executives" },
  { key: "relationship_manager", label: "Rel. Managers" },
  { key: "marketing", label: "Marketing" },
  { key: "ops_functions", label: "Accounts / HR / Legal" },
  { key: "tech", label: "Tech Support" },
];

/** Roles BDH oversees on Team Floor (RMs + their sales pod). */
export const BDH_TEAM_ROLES = new Set([
  "regional_manager",
  "regional_managers",
  "sales_manager",
  "sales_agent",
  "sales_executive",
  "sales_executives",
  "business_development_manager",
  "business_development_executive",
]);

export const BDH_GROUP_TABS = [
  { key: "all", label: "All" },
  { key: "regional_manager", label: "Regional Managers" },
  { key: "bdm", label: "BDMs" },
  { key: "sales_manager", label: "Sales Managers" },
  { key: "sales_executive", label: "Sales Executives" },
];

const safeDate = (value) => {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

/** True if lastSeenAt is within ONLINE_WINDOW_MS ("we heard from them recently"). */
export const isRecentlyHeard = (lastSeenAt, nowMs = Date.now()) => {
  const seen = safeDate(lastSeenAt);
  if (!seen) return false;
  return nowMs - seen.getTime() < ONLINE_WINDOW_MS;
};

export const enrichTeamMember = (user = {}, now = Date.now()) => {
  // Prefer lastSeenAt (heartbeat / API activity). Fallback: lastLoginAt only.
  // Never use updatedAt — profile edits must not look like presence.
  const lastSeenAt = safeDate(
    user.lastSeenAt || user.last_seen_at || user.lastLoginAt || user.last_login_at,
  );
  const isAccountActive = user.isActive !== false;
  const isOnline = Boolean(isAccountActive && isRecentlyHeard(lastSeenAt, now));
  const role = normalizeRmRole(user.roleName);
  const group = roleGroupKey(role);
  return {
    ...user,
    id: String(user._id || user.id || ""),
    role,
    group,
    groupLabel: ROLE_GROUP_META[group]?.label || "Other",
    lastLoginAt: safeDate(user.lastLoginAt || user.last_login_at),
    lastSeenAt,
    isAccountActive,
    isOnline,
    presence: !isAccountActive ? "inactive" : isOnline ? "online" : "offline",
    city: user.city || "",
    state: user.state || "",
  };
};
/** Next working assignee: prefer online same-group, else any online, else first active. */
export const pickNextWorkingAssignee = (members = [], excludeId = "") => {
  const pool = members.filter(
    (m) => m.id && m.id !== String(excludeId) && m.isAccountActive !== false,
  );
  const online = pool.filter((m) => m.isOnline);
  if (online.length) return online[0];
  const hour = new Date().getHours();
  const isMidnightWindow = hour >= 22 || hour < 7;
  if (isMidnightWindow) {
    // Night / midnight: prefer sales executives for next morning handoff
    const se = pool.find((m) => m.group === "sales_executive") || pool[0];
    return se || null;
  }
  return pool[0] || null;
};

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
  const now = Date.now();
  const teamMembersRaw = users
    .filter((u) => RM_TEAM_ROLES.has(String(u.roleName || "").toLowerCase()))
    .map((u) => enrichTeamMember(u, now));
  const teamMembers = teamMembersRaw;
  const activeTeam = teamMembers.filter((u) => u.isAccountActive).length;
  const teamOnline = teamMembers.filter((u) => u.isOnline).length;
  const teamOffline = teamMembers.filter(
    (u) => u.isAccountActive && !u.isOnline,
  ).length;

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
    teamOnline,
    teamOffline,
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
    teamFloor: teamMembers,
    roleBreakdown,
    allCities,
  };
}

export { asNumber, isKnown, titleCase, unpackList };
