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

const rangeBoundsMs = (range = {}) => {
  const from = range.from ? new Date(`${range.from}T00:00:00`).getTime() : null;
  const to = range.to ? new Date(`${range.to}T23:59:59.999`).getTime() : null;
  return {
    from: Number.isFinite(from) ? from : null,
    to: Number.isFinite(to) ? to : null,
  };
};

const inRange = (value, range = {}) => {
  const t = safeDate(value)?.getTime();
  if (!t) return false;
  const { from, to } = rangeBoundsMs(range);
  if (from != null && t < from) return false;
  if (to != null && t > to) return false;
  return true;
};

/** Platform end-user roles shown on Super Admin "Users by role" list. */
const PLATFORM_USER_ROLES = [
  { key: "user", label: "Users", aliases: ["user", "users", "owner", "buyer", "tenant", "propenu_user"] },
  { key: "builder", label: "Builders", aliases: ["builder", "builders"] },
  { key: "builder_staff", label: "Builder Staff", aliases: ["builder_staff", "builderstaff", "builder_staffs"] },
  { key: "agent", label: "Agents", aliases: ["agent", "agents", "ahnet"] },
];

const normalizePlatformRole = (value = "") => {
  const raw = String(value || "").toLowerCase().trim();
  const match = PLATFORM_USER_ROLES.find((role) => role.aliases.includes(raw));
  return match?.key || null;
};

export const formatINR = (value) => `₹${asNumber(value).toLocaleString("en-IN")}`;

export const DATE_PRESETS = [
  { key: "today", label: "Today" },
  { key: "7d", label: "7 days" },
  { key: "30d", label: "30 days" },
  { key: "90d", label: "90 days" },
  { key: "custom", label: "Custom" },
];

const isoDay = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const rangeFromPreset = (preset = "30d", custom = {}) => {
  const to = new Date();
  to.setHours(23, 59, 59, 999);
  const from = new Date(to);
  from.setHours(0, 0, 0, 0);

  if (preset === "today") {
    return { from: isoDay(from), to: isoDay(to), days: 1, label: "Today" };
  }

  if (preset === "custom") {
    const customFrom = custom.from || isoDay(from);
    const customTo = custom.to || isoDay(to);
    const start = new Date(`${customFrom}T00:00:00`);
    const end = new Date(`${customTo}T23:59:59`);
    const safeStart = Number.isNaN(start.getTime()) ? from : start;
    const safeEnd = Number.isNaN(end.getTime()) ? to : end;
    const orderedFrom = safeStart <= safeEnd ? safeStart : safeEnd;
    const orderedTo = safeStart <= safeEnd ? safeEnd : safeStart;
    const days = Math.max(
      1,
      Math.round((orderedTo.getTime() - orderedFrom.getTime()) / 86400000) + 1,
    );
    return {
      from: isoDay(orderedFrom),
      to: isoDay(orderedTo),
      days,
      label: `${isoDay(orderedFrom)} → ${isoDay(orderedTo)}`,
    };
  }

  const days = preset === "7d" ? 7 : preset === "90d" ? 90 : 30;
  from.setDate(from.getDate() - (days - 1));
  return {
    from: isoDay(from),
    to: isoDay(to),
    days,
    label: `Last ${days} days`,
  };
};

const unpackList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.users)) return payload.users;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.blogs)) return payload.blogs;
  return [];
};

const overviewBucket = (overview = {}) => {
  const active = asNumber(overview.activeProjects ?? overview.activeProperties ?? overview.active);
  const pending = asNumber(overview.pendingProjects ?? overview.pendingProperties ?? overview.pending);
  const draft = asNumber(
    overview.draftProjects ?? overview.draftProperties ?? overview.inactive ?? overview.draft,
  );
  const rejected = asNumber(
    overview.rejectedProjects ?? overview.rejectedProperties ?? overview.rejected,
  );
  const total =
    asNumber(overview.totalProjects ?? overview.totalProperties ?? overview.total) ||
    active + pending + draft + rejected;
  const views = asNumber(overview.totalViews ?? overview.views);
  return { total, active, pending, draft, rejected, views };
};

const statusWiseCount = (rows = [], key) => {
  const match = (Array.isArray(rows) ? rows : []).find(
    (row) => String(row?._id || "").toLowerCase() === String(key).toLowerCase(),
  );
  return asNumber(match?.total ?? match?.count);
};

/** Build /properties or /projects href with dashboard period filters applied. */
export const inventoryPeriodHref = (path, range = {}, extras = {}) => {
  const params = new URLSearchParams();
  if (extras.status && extras.status !== "all") params.set("status", extras.status);
  if (range?.from) params.set("createdFrom", range.from);
  if (range?.to) params.set("createdTo", range.to);
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
};

/** Build /users list href with period + status/role filters. */
export const usersPeriodHref = (range = {}, extras = {}) => {
  const params = new URLSearchParams();
  if (extras.status) params.set("status", extras.status);
  if (extras.filter) params.set("filter", extras.filter);
  if (extras.kyc) params.set("kyc", extras.kyc);
  if (extras.role && extras.role !== "all") params.set("role", extras.role);
  if (extras.active) params.set("active", extras.active);
  if (range?.from) params.set("createdFrom", range.from);
  if (range?.to) params.set("createdTo", range.to);
  const qs = params.toString();
  return qs ? `/users?${qs}` : "/users";
};

/** Deep-link into Follow-up Tracking page for a single track. */
export const followUpTrackHref = (trackKey, range = {}, extras = {}) => {
  const params = new URLSearchParams();
  params.set("track", trackKey);
  const preset = extras.preset || range?.preset;
  if (preset) params.set("preset", preset);
  if (range?.from) params.set("from", range.from);
  if (range?.to) params.set("to", range.to);
  return `/follow-up-tracking?${params.toString()}`;
};

const normalizeRoleName = (value = "") =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const accountStatusOf = (u) => String(u?.accountStatus || "").toLowerCase();
const isLoginToday = (u) => {
  const t = safeDate(u?.lastLoginAt)?.getTime();
  return Boolean(t && t >= startOfTodayMs());
};

const healthScore = (score) => {
  if (score == null) return { status: "N/A", tone: "slate" };
  if (score >= 80) return { status: "Healthy", tone: "emerald" };
  if (score >= 55) return { status: "Watch", tone: "amber" };
  return { status: "Risk", tone: "rose" };
};

const buildAlerts = (ctx) => {
  const alerts = [];
  const {
    failedPayments,
    openTickets,
    overdueTickets,
    pendingProperties,
    draftBlogs,
    newLeads,
    todayRevenue,
    activeSubs,
    qualifyRate,
  } = ctx;

  if (failedPayments > 0) {
    alerts.push({
      id: "failed-pay",
      severity: "high",
      title: `${failedPayments} failed payments`,
      impact: "Revenue leakage in billing pipeline.",
      action: "Open payments desk and retry failed charges.",
      href: "/payments-list",
    });
  }
  if (overdueTickets > 0) {
    alerts.push({
      id: "sla",
      severity: "high",
      title: `${overdueTickets} overdue tickets`,
      impact: "Support SLA breach risk.",
      action: "Escalate unassigned / overdue queue.",
      href: "/tickets",
    });
  }
  if (pendingProperties > 10) {
    alerts.push({
      id: "pending-inv",
      severity: "medium",
      title: `${pendingProperties} properties pending review`,
      impact: "Listing supply stuck before go-live.",
      action: "Clear pending approvals in properties.",
      href: "/properties?status=pending",
    });
  }
  if (draftBlogs > 5) {
    alerts.push({
      id: "content",
      severity: "low",
      title: `${draftBlogs} blog drafts waiting`,
      impact: "SEO / demand content backlog.",
      action: "Push content team publish cadence.",
      href: "/blogs",
    });
  }
  if (newLeads > 0 && (qualifyRate == null || qualifyRate < 25)) {
    alerts.push({
      id: "lead-quality",
      severity: "medium",
      title: "Lead qualification under pressure",
      impact: `${newLeads} new leads · qualify ${qualifyRate ?? "N/A"}%.`,
      action: "Review acquisition sources with marketing.",
      href: "/leads",
    });
  }
  if (todayRevenue === 0 && activeSubs > 0) {
    alerts.push({
      id: "no-today-rev",
      severity: "medium",
      title: "No collections today",
      impact: `${activeSubs} active subscriptions, ₹0 today.`,
      action: "Check renewals and pending invoices.",
      href: "/accounts-summary",
    });
  }
  if (openTickets === 0 && failedPayments === 0 && pendingProperties < 5) {
    alerts.push({
      id: "platform-ok",
      severity: "opportunity",
      title: "Platform operating smoothly",
      impact: "No critical finance or support blockers.",
      action: "Focus on growth — campaigns and inventory expansion.",
      href: "/",
    });
  }
  return alerts.slice(0, 7);
};

export function mapSuperAdminData({
  currentUser = null,
  summary = {},
  revenueByPlan = [],
  subscriptions = [],
  paidPayments = [],
  failedPayments = [],
  platformAnalytics = {},
  projectsAnalytics = {},
  propertiesAnalytics = {},
  leadSummary = {},
  ticketOverview = {},
  blogsPayload = {},
  usersPayload = [],
  range = {},
  preset = "today",
}) {
  const fuRange = { ...range, preset };
  const hasDateWindow = Boolean(range?.from && range?.to);
  const lifetimeRevenue = asNumber(summary.lifetimeRevenue ?? summary.totalRevenue);
  const periodRevenue = asNumber(
    summary.periodRevenue != null
      ? summary.periodRevenue
      : hasDateWindow
        ? summary.totalRevenue
        : lifetimeRevenue,
  );
  // Keep 0 as a valid period total — do not fall back to lifetime when window is set.
  const totalRevenue = hasDateWindow ? periodRevenue : lifetimeRevenue;
  const todayRevenue = asNumber(summary.todayRevenue);
  // Prefer period-filtered summary count; keep 0 (do not fall back to unfiltered list).
  const activeSubs =
    summary.activeSubscriptions != null
      ? asNumber(summary.activeSubscriptions)
      : unpackList(subscriptions).length;

  const paidList = unpackList(paidPayments);
  const failedList = unpackList(failedPayments);
  const paidCount = asNumber(paidPayments?.total) || paidList.length;
  const failedCount =
    asNumber(summary.failedPayments) ||
    asNumber(failedPayments?.total) ||
    failedList.length;
  const failedPayCount = failedCount;
  const paymentSuccess = pct(paidCount, paidCount + failedCount);

  const platformUsers = asNumber(platformAnalytics.users);
  const platformAgents = asNumber(platformAnalytics.agents);
  const platformManagers = asNumber(platformAnalytics.managers);
  const legacyProps = {
    total: asNumber(platformAnalytics.totalProperties),
    active: asNumber(platformAnalytics.active),
    pending: asNumber(platformAnalytics.pending),
    draft: asNumber(platformAnalytics.draft),
    views: asNumber(platformAnalytics.totalViews),
  };

  const projectCounts = overviewBucket(projectsAnalytics.overview || projectsAnalytics);
  const propertyCounts = overviewBucket(propertiesAnalytics.overview || propertiesAnalytics);
  // Never mix lifetime platform totals into a day-filtered inventory window.
  if (!hasDateWindow && !propertyCounts.total && legacyProps.total) {
    propertyCounts.total = legacyProps.total;
    propertyCounts.active = legacyProps.active;
    propertyCounts.pending = legacyProps.pending;
    propertyCounts.draft = legacyProps.draft;
    propertyCounts.views = legacyProps.views;
  }
  if (!propertyCounts.rejected) {
    propertyCounts.rejected = statusWiseCount(propertiesAnalytics.statusWise, "rejected");
  }
  if (!projectCounts.rejected) {
    projectCounts.rejected = statusWiseCount(projectsAnalytics.statusWise, "rejected");
  }

  const byStatus = leadSummary.byStatus || {};
  const bySource = leadSummary.bySource || {};
  const totalLeads = asNumber(leadSummary.total);
  const newLeads = asNumber(byStatus.new_lead);
  const qualifiedLeads = ["qualified", "site_visit", "negotiation", "sale", "booked"].reduce(
    (sum, key) => sum + asNumber(byStatus[key]),
    0,
  );
  const convertedLeads = ["sale", "booked", "closed"].reduce(
    (sum, key) => sum + asNumber(byStatus[key]),
    0,
  );
  const qualifyRate = pct(qualifiedLeads, totalLeads);

  const openTickets = asNumber(ticketOverview.open ?? ticketOverview.openTickets);
  const totalTickets = asNumber(ticketOverview.totals ?? ticketOverview.total);
  const overdueTickets = asNumber(ticketOverview.overdue);
  const unassignedTickets = asNumber(ticketOverview.unassigned);
  const ticketByStatus = Array.isArray(ticketOverview.byStatus) ? ticketOverview.byStatus : [];

  const blogsAll = unpackList(blogsPayload);
  const blogs = blogsAll.filter((b) => inRange(b.createdAt || b.publishedAt || b.updatedAt, range));
  const publishedBlogs = blogs.filter((b) => b.published).length;
  const draftBlogs = blogs.filter((b) => !b.published).length;
  const blogViews = blogs.reduce((sum, b) => sum + asNumber(b.views), 0);

  const usersAll = unpackList(usersPayload);
  const platformUsersAll = usersAll.filter((u) =>
    Boolean(normalizePlatformRole(u.roleName || u.role)),
  );
  const users = platformUsersAll.filter((u) => inRange(u.createdAt, range));

  const roleMap = Object.fromEntries(PLATFORM_USER_ROLES.map((role) => [role.key, 0]));
  users.forEach((u) => {
    const key = normalizePlatformRole(u.roleName || u.role);
    if (key) roleMap[key] += 1;
  });
  // Fixed list only: Users, Builders, Builder Staff, Agents (even when count is 0).
  const roleRows = PLATFORM_USER_ROLES.map((role) => ({
    key: role.key,
    label: role.label,
    count: asNumber(roleMap[role.key]),
  }));

  const onboardingList = platformUsersAll.filter((u) =>
    ["location_pending", "kyc_pending", "pending", "incomplete"].includes(accountStatusOf(u)),
  );
  const onboardingUsers = onboardingList.filter((u) => inRange(u.createdAt, range)).length;

  const usersToday = platformUsersAll.filter((u) => {
    const t = safeDate(u.createdAt)?.getTime();
    return t && t >= startOfTodayMs();
  }).length;
  const usersInPeriod = users.length;

  const createdTodayList = platformUsersAll.filter((u) => {
    const t = safeDate(u.createdAt)?.getTime();
    return t && t >= startOfTodayMs();
  });
  const loginTodayList = platformUsersAll.filter(isLoginToday);
  const stuckLocationList = platformUsersAll.filter(
    (u) => accountStatusOf(u) === "location_pending" && inRange(u.createdAt, range),
  );
  const stuckKycList = platformUsersAll.filter(
    (u) => accountStatusOf(u) === "kyc_pending" && inRange(u.createdAt, range),
  );
  const kycRejectedList = platformUsersAll.filter(
    (u) => accountStatusOf(u) === "kyc_rejected" && inRange(u.createdAt, range),
  );
  const activeSuccessList = platformUsersAll.filter(
    (u) => accountStatusOf(u) === "active" && inRange(u.createdAt, range),
  );
  const ownersPeriod = users.filter((u) => normalizePlatformRole(u.roleName || u.role) === "user");
  const agentsPeriod = users.filter((u) => normalizePlatformRole(u.roleName || u.role) === "agent");
  const buildersPeriod = users.filter((u) => normalizePlatformRole(u.roleName || u.role) === "builder");
  const builderStaffPeriod = users.filter(
    (u) => normalizePlatformRole(u.roleName || u.role) === "builder_staff",
  );

  const followUpTracks = [
    {
      group: "User journey",
      hint: "Signup → location → KYC → active (CCE follow-up)",
      items: [
        {
          key: "created_today",
          label: "Created today",
          count: createdTodayList.length,
          tone: "emerald",
          stage: "Account created",
          href: followUpTrackHref("created_today", {
            from: isoDay(new Date()),
            to: isoDay(new Date()),
            preset: "today",
          }),
          listHref: usersPeriodHref(
            { from: isoDay(new Date()), to: isoDay(new Date()) },
            {},
          ),
        },
        {
          key: "created_period",
          label: "Created (period)",
          count: usersInPeriod,
          tone: "emerald",
          stage: "Successfully created",
          href: followUpTrackHref("created_period", fuRange),
          listHref: usersPeriodHref(range, {}),
        },
        {
          key: "login_today",
          label: "Login today",
          count: loginTodayList.length,
          tone: "blue",
          stage: "Logged in today",
          href: followUpTrackHref("login_today", fuRange),
          listHref: followUpTrackHref("login_today", fuRange),
        },
        {
          key: "active_success",
          label: "Active success",
          count: activeSuccessList.length,
          tone: "emerald",
          stage: "Active account",
          href: followUpTrackHref("active_success", fuRange),
          listHref: usersPeriodHref(range, { status: "active" }),
        },
        {
          key: "stuck_location",
          label: "Stuck · location",
          count: stuckLocationList.length,
          tone: "amber",
          stage: "Location pending",
          href: followUpTrackHref("stuck_location", fuRange),
          listHref: usersPeriodHref(range, { status: "location_pending" }),
        },
        {
          key: "stuck_kyc",
          label: "Stuck · KYC",
          count: stuckKycList.length,
          tone: "amber",
          stage: "KYC pending",
          href: followUpTrackHref("stuck_kyc", fuRange),
          listHref: usersPeriodHref(range, { status: "kyc_pending" }),
        },
        {
          key: "kyc_rejected",
          label: "KYC rejected",
          count: kycRejectedList.length,
          tone: "rose",
          stage: "KYC rejected",
          href: followUpTrackHref("kyc_rejected", fuRange),
          listHref: usersPeriodHref(range, { status: "kyc_rejected" }),
        },
        {
          key: "onboarding_all",
          label: "All onboarding",
          count: onboardingUsers,
          tone: "violet",
          stage: "Any stuck step",
          href: followUpTrackHref("onboarding_all", fuRange),
          listHref: usersPeriodHref(range, { filter: "onboarding" }),
        },
      ],
    },
    {
      group: "Roles",
      hint: "Owners, agents, builders & builder staff",
      items: [
        {
          key: "owners",
          label: "Owners",
          count: ownersPeriod.length,
          tone: "emerald",
          stage: "Owner / user",
          href: followUpTrackHref("owners", fuRange),
          listHref:
            range?.from && range?.to
              ? `/owners?createdFrom=${encodeURIComponent(range.from)}&createdTo=${encodeURIComponent(range.to)}`
              : "/owners",
        },
        {
          key: "agents",
          label: "Agents",
          count: agentsPeriod.length,
          tone: "blue",
          stage: "Agent signup",
          href: followUpTrackHref("agents", fuRange),
          listHref:
            range?.from && range?.to
              ? `/all-agents?createdFrom=${encodeURIComponent(range.from)}&createdTo=${encodeURIComponent(range.to)}`
              : "/all-agents",
        },
        {
          key: "builders",
          label: "Builders",
          count: buildersPeriod.length,
          tone: "amber",
          stage: "Builder signup",
          href: followUpTrackHref("builders", fuRange),
          listHref:
            range?.from && range?.to
              ? `/builders?createdFrom=${encodeURIComponent(range.from)}&createdTo=${encodeURIComponent(range.to)}`
              : "/builders",
        },
        {
          key: "builder_staff",
          label: "Builder staff",
          count: builderStaffPeriod.length,
          tone: "violet",
          stage: "Builder staff",
          href: followUpTrackHref("builder_staff", fuRange),
          listHref:
            range?.from && range?.to
              ? `/builder-staff?createdFrom=${encodeURIComponent(range.from)}&createdTo=${encodeURIComponent(range.to)}`
              : "/builder-staff",
        },
      ],
    },
    {
      group: "Inventory follow-up",
      hint: "Property / project lists — open table + Excel for CCE follow-up",
      items: [
        {
          key: "property_pending",
          label: "Property pending",
          count: propertyCounts.pending,
          tone: "amber",
          stage: "Awaiting approval",
          href: followUpTrackHref("property_pending", fuRange),
          listHref: inventoryPeriodHref("/properties", range, { status: "pending" }),
        },
        {
          key: "property_active",
          label: "Property active",
          count: propertyCounts.active,
          tone: "emerald",
          stage: "Live listings",
          href: followUpTrackHref("property_active", fuRange),
          listHref: inventoryPeriodHref("/properties", range, { status: "active" }),
        },
        {
          key: "property_draft",
          label: "Property draft",
          count: propertyCounts.draft,
          tone: "blue",
          stage: "Draft / incomplete",
          href: followUpTrackHref("property_draft", fuRange),
          listHref: inventoryPeriodHref("/properties", range, { status: "draft" }),
        },
        {
          key: "property_rejected",
          label: "Property rejected",
          count: propertyCounts.rejected,
          tone: "rose",
          stage: "Needs rework",
          href: followUpTrackHref("property_rejected", fuRange),
          listHref: inventoryPeriodHref("/properties", range, { status: "rejected" }),
        },
        {
          key: "project_pending",
          label: "Project pending",
          count: projectCounts.pending,
          tone: "amber",
          stage: "Awaiting approval",
          href: followUpTrackHref("project_pending", fuRange),
          listHref: inventoryPeriodHref("/projects", range, { status: "pending" }),
        },
        {
          key: "project_active",
          label: "Project active",
          count: projectCounts.active,
          tone: "emerald",
          stage: "Live projects",
          href: followUpTrackHref("project_active", fuRange),
          listHref: inventoryPeriodHref("/projects", range, { status: "active" }),
        },
        {
          key: "project_draft",
          label: "Project draft",
          count: projectCounts.draft,
          tone: "violet",
          stage: "Draft / onboarding",
          href: followUpTrackHref("project_draft", fuRange),
          listHref: inventoryPeriodHref("/projects", range, { status: "inactive" }),
        },
      ],
    },
  ];

  const planRows = (Array.isArray(revenueByPlan) ? revenueByPlan : unpackList(revenueByPlan))
    .map((row) => ({
      id: String(row._id || row.planId || Math.random()),
      label: row.plan?.name || row.planId?.name || "Plan",
      category: row.plan?.category || "",
      revenue: asNumber(row.totalRevenue),
      count: asNumber(row.count),
      displayName: `${row.plan?.name || "Plan"}${row.plan?.category ? ` (${row.plan.category})` : ""}`,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8);

  const paymentDonut = [
    { name: "Paid", value: Math.max(paidCount, 0), fill: "#10b981" },
    { name: "Failed", value: Math.max(failedCount, 0), fill: "#f43f5e" },
  ];

  const propertyStatus = [
    { key: "active", label: "Active", value: propertyCounts.active, fill: "#10b981" },
    { key: "pending", label: "Pending", value: propertyCounts.pending, fill: "#f59e0b" },
    { key: "draft", label: "Draft", value: propertyCounts.draft, fill: "#3b82f6" },
  ];

  const projectStatus = [
    { key: "active", label: "Active", value: projectCounts.active, fill: "#10b981" },
    { key: "pending", label: "Pending", value: projectCounts.pending, fill: "#f59e0b" },
    { key: "draft", label: "Draft", value: projectCounts.draft, fill: "#3b82f6" },
  ];

  const leadSourceRows = Object.entries(bySource)
    .map(([key, count]) => ({ key, label: titleCase(key), leads: asNumber(count) }))
    .sort((a, b) => b.leads - a.leads)
    .slice(0, 6);

  const ticketStatusRows = ticketByStatus
    .map((row) => ({
      key: String(row._id || row.status || "unknown"),
      label: titleCase(row._id || row.status || "unknown"),
      count: asNumber(row.count),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  // Domain health scores 0-100
  const financeHealth = Math.max(
    0,
    Math.min(100, Math.round((paymentSuccess ?? 100) - failedPayCount * 2)),
  );
  const inventoryHealth = propertyCounts.total
    ? Math.round((propertyCounts.active / propertyCounts.total) * 100)
    : null;
  const supportHealth =
    totalTickets > 0
      ? Math.max(0, Math.round(100 - (overdueTickets / Math.max(totalTickets, 1)) * 100))
      : 100;
  const acquisitionHealth = qualifyRate;
  const contentHealth = blogs.length
    ? Math.round((publishedBlogs / blogs.length) * 100)
    : null;

  // Selected date range (Today / Last 7 days / custom dates) — shown instead of "window".
  const periodLabel = range.label || (range.days === 1 ? "Today" : `Last ${range.days || 30} days`);

  const domains = [
    {
      key: "finance",
      label: "Finance",
      score: financeHealth,
      metric: formatINR(totalRevenue),
      detail: `${activeSubs} active subs · ${failedPayCount} failed · ${periodLabel}`,
      href: "/accounts-summary",
      ...healthScore(financeHealth),
    },
    {
      key: "inventory",
      label: "Inventory",
      score: inventoryHealth,
      metric: String(propertyCounts.total + projectCounts.total),
      detail: `${propertyCounts.active} live properties · ${projectCounts.active} live projects`,
      href: inventoryPeriodHref("/properties", range),
      navItems: [
        {
          key: "properties",
          label: "Properties",
          value: propertyCounts.total,
          hint: `${propertyCounts.active} live`,
          href: inventoryPeriodHref("/properties", range),
        },
        {
          key: "projects",
          label: "Projects",
          value: projectCounts.total,
          hint: `${projectCounts.active} live`,
          href: inventoryPeriodHref("/projects", range),
        },
      ],
      ...healthScore(inventoryHealth),
    },
    {
      key: "acquisition",
      label: "Acquisition",
      score: acquisitionHealth,
      metric: String(totalLeads),
      detail: `${newLeads} new · qualify ${qualifyRate ?? "N/A"}%`,
      href: "/leads",
      ...healthScore(acquisitionHealth),
    },
    {
      key: "support",
      label: "Support",
      score: supportHealth,
      metric: String(openTickets),
      detail: `${overdueTickets} overdue · ${unassignedTickets} unassigned`,
      href: "/tickets",
      ...healthScore(supportHealth),
    },
    {
      key: "content",
      label: "Content",
      score: contentHealth,
      metric: String(publishedBlogs),
      detail: `${draftBlogs} drafts · ${blogViews} views · ${periodLabel}`,
      href: "/blogs",
      ...healthScore(contentHealth),
    },
    {
      key: "people",
      label: "People",
      score: platformUsersAll.length
        ? Math.round(100 - (onboardingUsers / platformUsersAll.length) * 40)
        : null,
      metric: String(usersInPeriod),
      detail: `${usersInPeriod} joined · ${onboardingUsers} onboarding · ${periodLabel}`,
      href:
        onboardingUsers > 0
          ? "/users?filter=onboarding"
          : range?.from && range?.to
            ? range.from === range.to
              ? `/users?date=${encodeURIComponent(range.from)}`
              : `/users?from=${encodeURIComponent(range.from)}&to=${encodeURIComponent(range.to)}`
            : "/users?joined=today",
      ...healthScore(
        platformUsersAll.length
          ? Math.round(100 - (onboardingUsers / platformUsersAll.length) * 40)
          : null,
      ),
    },
  ];

  const modules = [
    {
      label: "Users",
      href:
        range?.from && range?.to
          ? range.from === range.to
            ? `/users?date=${encodeURIComponent(range.from)}`
            : `/users?from=${encodeURIComponent(range.from)}&to=${encodeURIComponent(range.to)}`
          : "/users?joined=today",
      hint: `${usersInPeriod} joined · ${periodLabel}`,
    },
    { label: "Onboarding", href: "/users?filter=onboarding", hint: `${onboardingUsers} pending` },
    { label: "Client Progress Queue", href: followUpTrackHref("onboarding_all", fuRange), hint: "CCE journey lists" },
    {
      label: "Projects",
      href: inventoryPeriodHref("/projects", range),
      hint: `${projectCounts.total} · ${periodLabel}`,
    },
    {
      label: "Properties",
      href: inventoryPeriodHref("/properties", range),
      hint: `${propertyCounts.total} listings · ${periodLabel}`,
    },
    { label: "Leads", href: "/leads", hint: `${totalLeads} · ${periodLabel}` },
    { label: "Tickets", href: "/tickets", hint: `${openTickets} open · ${periodLabel}` },
    { label: "Payments", href: "/payments-list", hint: formatINR(totalRevenue) },
    { label: "Subscriptions", href: "/active-subscriptions", hint: `${activeSubs} active` },
    { label: "Blogs", href: "/blogs", hint: `${publishedBlogs} · ${periodLabel}` },
    { label: "Access control", href: "/access-control/users", hint: "Roles & permissions" },
    { label: "Team directory", href: "/propenu-team-members", hint: "Org hierarchy" },
    { label: "Email campaigns", href: "/email-notifications", hint: "Outreach" },
    { label: "Locations", href: "/locations", hint: "Geo coverage" },
  ];

  const alerts = buildAlerts({
    failedPayments: failedPayCount,
    openTickets,
    overdueTickets,
    pendingProperties: propertyCounts.pending,
    draftBlogs,
    newLeads,
    todayRevenue,
    activeSubs,
    qualifyRate,
  });

  const kpis = [
    {
      key: "revenue",
      label: "Period revenue",
      value: formatINR(totalRevenue),
      hint: `Collections · ${periodLabel} · lifetime ${formatINR(lifetimeRevenue)}`,
      tone: "emerald",
      href: "/accounts-summary",
    },
    {
      key: "users",
      label: "New users",
      value: usersInPeriod,
      hint: `${roleRows.map((row) => `${row.label} ${row.count}`).join(" · ")} · ${periodLabel}`,
      tone: "violet",
      href:
        range?.from && range?.to
          ? range.from === range.to
            ? `/users?date=${encodeURIComponent(range.from)}`
            : `/users?from=${encodeURIComponent(range.from)}&to=${encodeURIComponent(range.to)}`
          : "/users?joined=today",
    },
    {
      key: "listings",
      label: "Listings",
      value: propertyCounts.total,
      hint: `${propertyCounts.active} active · ${periodLabel}`,
      tone: "emerald",
      href: inventoryPeriodHref("/properties", range),
    },
    {
      key: "projects",
      label: "Projects",
      value: projectCounts.total,
      hint: `${projectCounts.active} live · ${periodLabel}`,
      tone: "blue",
      href: inventoryPeriodHref("/projects", range),
    },
    {
      key: "leads",
      label: "Leads",
      value: totalLeads,
      hint: `${convertedLeads} converted · ${periodLabel}`,
      tone: "amber",
      href: "/leads",
    },
    {
      key: "tickets",
      label: "Open tickets",
      value: openTickets,
      hint: `${overdueTickets} overdue · ${periodLabel}`,
      tone: "rose",
      href: "/tickets",
    },
    {
      key: "subs",
      label: "Active subs",
      value: activeSubs,
      hint: `Started · ${periodLabel} · ${failedPayCount} failed pays`,
      tone: "violet",
      href: "/active-subscriptions",
    },
  ];

  return {
    currentUserName: currentUser?.name || currentUser?.fullName || "Super Admin",
    rangeLabel: periodLabel,
    refreshedAt: new Date(),
    kpis,
    domains,
    modules,
    alerts,
    summary: {
      totalRevenue,
      lifetimeRevenue,
      periodRevenue,
      todayRevenue,
      activeSubs,
      failedPayCount,
      paymentSuccess,
      platformUsers: platformUsers || platformUsersAll.length,
      platformAgents,
      platformManagers,
      usersInPeriod,
      propertyCounts,
      projectCounts,
      totalLeads,
      newLeads,
      qualifiedLeads,
      convertedLeads,
      qualifyRate,
      openTickets,
      overdueTickets,
      unassignedTickets,
      publishedBlogs,
      draftBlogs,
      blogViews,
      onboardingUsers,
      usersToday,
      listingViews: propertyCounts.views || legacyProps.views,
    },
    paymentDonut,
    planRows,
    propertyStatus,
    projectStatus,
    leadSourceRows,
    ticketStatusRows,
    roleRows,
    followUpTracks,
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
