const asNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const titleCase = (value = "") =>
  String(value || "")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const safeDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const pct = (part, whole) => {
  if (!whole) return null;
  return Math.round((part / whole) * 1000) / 10;
};

const startOfTodayMs = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

export { DATE_PRESETS, rangeFromPreset } from "../shared/dashboardDateRange";

const unpackList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.users)) return payload.users;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
};

const overviewBucket = (overview = {}) => {
  const active = asNumber(overview.activeProjects ?? overview.activeProperties ?? overview.active);
  const pending = asNumber(overview.pendingProjects ?? overview.pendingProperties ?? overview.pending);
  const draft = asNumber(
    overview.draftProjects ?? overview.draftProperties ?? overview.inactive ?? overview.draft,
  );
  const total =
    asNumber(overview.totalProjects ?? overview.totalProperties ?? overview.total) ||
    active + pending + draft;
  const views = asNumber(overview.totalViews ?? overview.views);
  return { total, active, pending, draft, views };
};

const roleBucket = (roleName = "") => {
  const role = String(roleName || "").toLowerCase();
  if (role.includes("builder")) return "builders";
  if (role.includes("agent") || role.includes("sales")) return "agents";
  if (role === "user" || role === "owner" || role === "buyer" || role === "tenant") return "owners";
  return "staff";
};

export function mapAdminData({
  currentUser = null,
  adminAnalytics = {},
  projectsAnalytics = {},
  propertiesAnalytics = {},
  leadSummary = {},
  ticketOverview = {},
  usersPayload = [],
  range = {},
}) {
  const hasDateWindow = Boolean(range?.from && range?.to);
  const periodLabel =
    range?.label || (range?.days === 1 ? "Today" : `Last ${range?.days || 30} days`);
  const projectCounts = overviewBucket(projectsAnalytics.overview || projectsAnalytics);
  const propertyCounts = overviewBucket(propertiesAnalytics.overview || propertiesAnalytics);

  // Prefer richer analytics; fall back to legacy admin endpoint only when no date filter.
  if (!hasDateWindow && !propertyCounts.total) {
    propertyCounts.total = asNumber(adminAnalytics.totalProperties);
    propertyCounts.active = asNumber(adminAnalytics.active);
    propertyCounts.pending = asNumber(adminAnalytics.pending);
    propertyCounts.draft = asNumber(adminAnalytics.draft);
    propertyCounts.views = asNumber(adminAnalytics.totalViews);
  }

  const byStatus = leadSummary.byStatus || {};
  const bySource = leadSummary.bySource || {};
  const byCategory = leadSummary.byCategory || {};
  const totalLeads = asNumber(leadSummary.total);
  const newLeads = asNumber(byStatus.new_lead);
  const qualifiedLeads = ["qualified", "site_visit", "negotiation", "sale", "booked"].reduce(
    (sum, key) => sum + asNumber(byStatus[key]),
    0,
  );
  const dailyTrend = Array.isArray(leadSummary.dailyTrend) ? leadSummary.dailyTrend : [];
  const leadTrend = dailyTrend.slice(-14).map((row) => ({
    date: String(row.date || "").slice(5),
    leads: asNumber(row.leads),
    converted: asNumber(row.converted),
  }));

  const openTickets = asNumber(ticketOverview.open ?? ticketOverview.openTickets);
  const overdueTickets = asNumber(ticketOverview.overdue);
  const unassignedTickets = asNumber(ticketOverview.unassigned);
  const ticketByStatus = Array.isArray(ticketOverview.byStatus) ? ticketOverview.byStatus : [];

  const users = unpackList(usersPayload);
  const buckets = { builders: 0, agents: 0, owners: 0, staff: 0 };
  let onboarding = 0;
  let joinedToday = 0;
  users.forEach((u) => {
    buckets[roleBucket(u.roleName || u.role)] += 1;
    const status = String(u.accountStatus || "").toLowerCase();
    if (["location_pending", "kyc_pending", "pending", "incomplete"].includes(status)) onboarding += 1;
    const t = safeDate(u.createdAt)?.getTime();
    if (t && t >= startOfTodayMs()) joinedToday += 1;
  });

  const usersPeriodHref =
    hasDateWindow && range.from && range.to && range.from === range.to
      ? `/users?date=${encodeURIComponent(range.from)}`
      : hasDateWindow && range.from && range.to
        ? `/users?from=${encodeURIComponent(range.from)}&to=${encodeURIComponent(range.to)}`
        : "/users?joined=today";

  const approvalQueue = [
    {
      key: "pending-listings",
      label: "Pending listings",
      count: propertyCounts.pending,
      href: "/properties?status=pending",
      tone: "amber",
      hint: "Awaiting review / go-live",
    },
    {
      key: "draft-listings",
      label: "Draft listings",
      count: propertyCounts.draft,
      href: "/properties?status=draft",
      tone: "blue",
      hint: "Incomplete inventory",
    },
    {
      key: "pending-projects",
      label: "Pending projects",
      count: projectCounts.pending,
      href: "/projects?status=pending",
      tone: "amber",
      hint: "Project approvals",
    },
    {
      key: "draft-projects",
      label: "Draft projects",
      count: projectCounts.draft,
      href: "/projects?status=draft",
      tone: "blue",
      hint: "Not submitted",
    },
    {
      key: "new-leads",
      label: "New leads",
      count: newLeads,
      href: "/leads",
      tone: "emerald",
      hint: "Needs assignment / contact",
    },
    {
      key: "unassigned-tickets",
      label: "Unassigned tickets",
      count: unassignedTickets,
      href: "/tickets",
      tone: "rose",
      hint: "Support queue gap",
    },
    {
      key: "overdue-tickets",
      label: "Overdue tickets",
      count: overdueTickets,
      href: "/tickets",
      tone: "rose",
      hint: "SLA breach risk",
    },
    {
      key: "onboarding-users",
      label: "Users onboarding",
      count: onboarding,
      href: "/users?filter=onboarding",
      tone: "violet",
      hint: "KYC / location pending",
    },
    {
      key: "joined-today",
      label: "Users joined today",
      count: joinedToday,
      href: "/users?joined=today",
      tone: "emerald",
      hint: "New accounts created today",
    },
  ];

  const propertyStatus = [
    { key: "active", label: "Active", value: propertyCounts.active, fill: "#10b981" },
    { key: "pending", label: "Pending", value: propertyCounts.pending, fill: "#f59e0b" },
    { key: "draft", label: "Draft", value: propertyCounts.draft, fill: "#3b82f6" },
  ];

  const projectStatus = [
    { key: "active", label: "Active", value: projectCounts.active, fill: "#10b981" },
    { key: "pending", label: "Pending", value: projectCounts.pending, fill: "#f59e0b" },
    { key: "draft", label: "Draft", value: projectCounts.draft, fill: "#6366f1" },
  ];

  const sourceRows = Object.entries(bySource)
    .map(([key, count]) => ({ key, label: titleCase(key), value: asNumber(count) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const categoryRows = Object.entries(byCategory)
    .map(([key, count]) => ({ key, label: titleCase(key), value: asNumber(count) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const ticketRows = ticketByStatus
    .map((row) => ({
      key: String(row._id || "unknown"),
      label: titleCase(row._id || "unknown"),
      value: asNumber(row.count),
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const userMix = [
    { key: "builders", label: "Builders", value: buckets.builders },
    { key: "agents", label: "Agents / sales", value: buckets.agents },
    { key: "owners", label: "Owners / buyers", value: buckets.owners },
    { key: "staff", label: "Staff / other", value: buckets.staff },
  ];

  const liveRate = pct(propertyCounts.active, propertyCounts.total);
  const approvalLoad = propertyCounts.pending + projectCounts.pending + unassignedTickets + overdueTickets;

  const alerts = [];
  if (propertyCounts.pending > 0) {
    alerts.push({
      id: "pending-props",
      severity: propertyCounts.pending > 15 ? "high" : "medium",
      title: `${propertyCounts.pending} listings pending approval`,
      impact: "Supply stuck before customers can enquire.",
      action: "Clear the property review queue first.",
      href: "/properties?status=pending",
    });
  }
  if (projectCounts.pending > 0) {
    alerts.push({
      id: "pending-proj",
      severity: "medium",
      title: `${projectCounts.pending} projects pending`,
      impact: "Campaigns and listings may wait on project go-live.",
      action: "Review project documents and activate.",
      href: "/projects?status=pending",
    });
  }
  if (unassignedTickets > 0) {
    alerts.push({
      id: "unassigned",
      severity: "high",
      title: `${unassignedTickets} unassigned tickets`,
      impact: "Buyers waiting without an owner.",
      action: "Assign to customer care / support desk.",
      href: "/tickets",
    });
  }
  if (overdueTickets > 0) {
    alerts.push({
      id: "overdue",
      severity: "high",
      title: `${overdueTickets} overdue tickets`,
      impact: "SLA and reputation risk.",
      action: "Escalate overdue items immediately.",
      href: "/tickets",
    });
  }
  if (newLeads > 10) {
    alerts.push({
      id: "leads",
      severity: "medium",
      title: `${newLeads} new leads waiting`,
      impact: "Speed-to-lead affects conversion.",
      action: "Assign and contact new enquiries.",
      href: "/leads",
    });
  }
  if (onboarding > 5) {
    alerts.push({
      id: "onboard",
      severity: "low",
      title: `${onboarding} users still onboarding`,
      impact: "Incomplete profiles reduce marketplace quality.",
      action: "Follow up KYC / location completion.",
      href: "/users?filter=onboarding",
    });
  }
  if (!alerts.length) {
    alerts.push({
      id: "ok",
      severity: "opportunity",
      title: "Ops queues look manageable",
      impact: "No critical approval or support backlog.",
      action: "Focus on inventory quality and lead follow-up.",
      href: "/properties?status=active",
    });
  }

  const workstreams = [
    {
      key: "inventory",
      label: "Inventory ops",
      metric: `${propertyCounts.active}/${propertyCounts.total}`,
      detail: `${propertyCounts.pending} pending · ${propertyCounts.draft} draft`,
      score: liveRate,
      href: propertyCounts.pending > 0 ? "/properties?status=pending" : "/properties?status=active",
      tone: liveRate != null && liveRate < 40 ? "amber" : "emerald",
    },
    {
      key: "projects",
      label: "Project ops",
      metric: String(projectCounts.total),
      detail: `${projectCounts.active} live · ${projectCounts.pending} pending`,
      score: pct(projectCounts.active, projectCounts.total),
      href: projectCounts.pending > 0 ? "/projects?status=pending" : "/projects?status=active",
      tone: "blue",
    },
    {
      key: "leads",
      label: "Lead ops",
      metric: String(totalLeads),
      detail: `${newLeads} new · ${qualifiedLeads} qualified`,
      score: pct(qualifiedLeads, totalLeads),
      href: "/leads",
      tone: "violet",
    },
    {
      key: "support",
      label: "Support ops",
      metric: String(openTickets),
      detail: `${unassignedTickets} unassigned · ${overdueTickets} overdue`,
      score: openTickets ? Math.max(0, 100 - overdueTickets * 8) : 100,
      href: "/tickets",
      tone: overdueTickets > 0 ? "rose" : "emerald",
    },
    {
      key: "users",
      label: "User ops",
      metric: String(users.length),
      detail: `${onboarding} onboarding · ${joinedToday} joined today`,
      score: users.length ? Math.round(100 - (onboarding / users.length) * 40) : null,
      href: onboarding > 0 ? "/users?filter=onboarding" : usersPeriodHref,
      tone: "blue",
    },
    {
      key: "approvals",
      label: "Approval load",
      metric: String(approvalLoad),
      detail: "Pending + support backlog items",
      score: approvalLoad > 40 ? 35 : approvalLoad > 15 ? 60 : 85,
      href: "/properties?status=pending",
      tone: approvalLoad > 25 ? "amber" : "emerald",
    },
  ];

  const kpis = [
    {
      key: "listings",
      label: "Total listings",
      value: propertyCounts.total,
      hint: `${liveRate ?? 0}% live`,
      tone: "emerald",
      href: "/properties",
    },
    {
      key: "active",
      label: "Active listings",
      value: propertyCounts.active,
      hint: "Live on marketplace",
      tone: "blue",
      href: "/properties?status=active",
    },
    {
      key: "pending",
      label: "Pending review",
      value: propertyCounts.pending,
      hint: "Needs admin action",
      tone: "amber",
      href: "/properties?status=pending",
    },
    {
      key: "draft",
      label: "Drafts",
      value: propertyCounts.draft,
      hint: "Incomplete listings",
      tone: "violet",
      href: "/properties?status=draft",
    },
    {
      key: "views",
      label: "Listing views",
      value: propertyCounts.views,
      hint: "Demand signal",
      tone: "emerald",
      href: "/properties?status=active",
    },
    {
      key: "projects",
      label: "Projects",
      value: projectCounts.total,
      hint: `${projectCounts.active} active`,
      tone: "blue",
      href: "/projects?status=active",
    },
    {
      key: "leads",
      label: "Leads (period)",
      value: totalLeads,
      hint: `${newLeads} new`,
      tone: "amber",
      href: "/leads",
    },
    {
      key: "tickets",
      label: "Open tickets",
      value: openTickets,
      hint: `${overdueTickets} overdue`,
      tone: "rose",
      href: "/tickets",
    },
  ];

  const modules = [
    { label: "Properties", href: "/properties?status=pending", hint: `${propertyCounts.pending} pending` },
    { label: "Projects", href: "/projects?status=pending", hint: `${projectCounts.pending} pending` },
    { label: "Leads", href: "/leads", hint: `${newLeads} new` },
    { label: "Tickets", href: "/tickets", hint: `${openTickets} open` },
    { label: "Users", href: usersPeriodHref, hint: `${joinedToday} joined today` },
    { label: "Onboarding", href: "/users?filter=onboarding", hint: `${onboarding} pending` },
    { label: "Builders", href: "/builders", hint: `${buckets.builders} accounts` },
    { label: "Agents", href: "/all-agents", hint: `${buckets.agents} accounts` },
    { label: "Owners", href: "/owners", hint: `${buckets.owners} accounts` },
    { label: "Team directory", href: "/propenu-team-members", hint: "Staff hierarchy" },
    { label: "Locations", href: "/locations", hint: "Geo coverage" },
    { label: "Blogs", href: "/blogs", hint: "Content desk" },
    { label: "Access control", href: "/access-control/users", hint: "Roles" },
  ];

  return {
    currentUserName: currentUser?.name || currentUser?.fullName || "Admin",
    rangeLabel: periodLabel,
    refreshedAt: new Date(),
    kpis,
    workstreams,
    approvalQueue,
    propertyStatus,
    projectStatus,
    leadTrend,
    sourceRows,
    categoryRows,
    ticketRows,
    userMix,
    alerts: alerts.slice(0, 6),
    modules,
    summary: {
      propertyCounts,
      projectCounts,
      totalLeads,
      newLeads,
      qualifiedLeads,
      openTickets,
      overdueTickets,
      unassignedTickets,
      usersTotal: users.length,
      builders: buckets.builders,
      agents: buckets.agents,
      owners: buckets.owners,
      onboarding,
      joinedToday,
      liveRate,
      approvalLoad,
    },
  };
}

export const formatRelativeClock = (value) => {
  const date = safeDate(value);
  if (!date) return "Just now";
  const minutes = Math.round((Date.now() - date.getTime()) / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
};

export { titleCase, asNumber, pct };
