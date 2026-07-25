import {
  CSH_KPI_QUEUE_TAB,
  filterTicketsByTab,
  formatClockTime,
  getTicketPriority,
  getTicketStatus,
  mapTicketQueueItem,
} from "../customerSupportHeadDashboard/customerSupportHeadDashboardData";

export {
  CSH_KPI_QUEUE_TAB as TL_KPI_QUEUE_TAB,
  filterTicketsByTab,
  formatClockTime,
  getTicketPriority,
  getTicketStatus,
  mapTicketQueueItem,
};

export const TL_QUEUE_TABS = [
  { key: "all", label: "All" },
  { key: "open", label: "Open" },
  { key: "urgent", label: "Urgent" },
  { key: "unassigned", label: "Unassigned" },
  { key: "overdue", label: "Overdue" },
  { key: "awaiting", label: "Reply pending" },
  { key: "resolved", label: "Resolved" },
];

const normalize = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const titleCase = (value = "") =>
  String(value || "")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const asNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const safeDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const OPEN_STATUSES = new Set([
  "open",
  "new",
  "assigned",
  "pending",
  "under_review",
  "reopened",
  "in_progress",
  "escalated",
  "awaiting_user_response",
  "waiting_for_customer",
  "waiting_for_internal_team",
]);

const AWAITING_STATUSES = new Set(["awaiting_user_response", "waiting_for_customer"]);
const RESOLVED_STATUSES = new Set(["resolved", "closed"]);

/** Direct reports for a Customer Support Team Lead (not peers / head). */
const TEAM_LEAD_REPORT_ROLES = new Set([
  "customer_care",
  "customer_care_executive",
  "customer_care_executives",
  "relationship_manager",
  "relationship_managers",
]);

const priorityRank = { urgent: 0, high: 1, medium: 2, low: 3 };

const getAssigneeId = (ticket = {}) =>
  ticket?.assignedTo?.userId || ticket?.assignedTo?._id || ticket?.assigneeId || null;

const isOverdue = (ticket = {}) => {
  const status = getTicketStatus(ticket);
  if (RESOLVED_STATUSES.has(status)) return false;
  const dueAt = safeDate(ticket.dueAt || ticket.slaDueAt);
  return Boolean(dueAt && dueAt.getTime() < Date.now());
};

const isUnassigned = (ticket = {}) => !getAssigneeId(ticket);

const getUserRole = (user) =>
  normalize(user?.roleName || user?.role || user?.roleId?.name || "");

const mapPerformanceWeek = (trends = {}, tickets = []) => {
  const dayKeys = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const week = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));
    return {
      key: date.toISOString().slice(0, 10),
      day: dayKeys[date.getDay()],
      resolved: 0,
    };
  });
  const byDay = new Map(week.map((item) => [item.key, item]));

  const trendRows = Array.isArray(trends)
    ? trends
    : Array.isArray(trends?.daily)
      ? trends.daily
      : [];

  trendRows.forEach((row) => {
    const dayKey = row?._id?.day || row?.day || row?.date;
    const status = normalize(row?._id?.status || row?.status || "");
    if (!dayKey || !byDay.has(dayKey)) return;
    if (RESOLVED_STATUSES.has(status)) {
      byDay.get(dayKey).resolved += asNumber(row.count || row.resolved || 0);
    }
  });

  if (!trendRows.length) {
    (Array.isArray(tickets) ? tickets : []).forEach((ticket) => {
      if (!RESOLVED_STATUSES.has(getTicketStatus(ticket))) return;
      const resolvedAt = safeDate(ticket.resolvedAt || ticket.updatedAt);
      if (!resolvedAt) return;
      const key = resolvedAt.toISOString().slice(0, 10);
      if (byDay.has(key)) byDay.get(key).resolved += 1;
    });
  }

  return week;
};

export const mapCustomerSupportTeamLeadData = ({
  overview = {},
  tickets = [],
  teamUsers = [],
  agentPerformance = [],
  currentUser = null,
  trends = [],
}) => {
  const normalizedTickets = Array.isArray(tickets) ? tickets : [];
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const now = Date.now();

  const openTickets = normalizedTickets.filter((t) => OPEN_STATUSES.has(getTicketStatus(t))).length;
  const urgentCount = normalizedTickets.filter((t) => {
    const p = getTicketPriority(t);
    return p === "urgent" || p === "high";
  }).length;
  const unassignedCount = normalizedTickets.filter(
    (t) => isUnassigned(t) && OPEN_STATUSES.has(getTicketStatus(t)),
  ).length;
  const overdueCount = normalizedTickets.filter((t) => isOverdue(t)).length;
  const awaitingCount = normalizedTickets.filter((t) =>
    AWAITING_STATUSES.has(getTicketStatus(t)),
  ).length;
  const resolvedToday = normalizedTickets.filter((t) => {
    const status = getTicketStatus(t);
    const updatedAt = safeDate(t.updatedAt || t.resolvedAt);
    return RESOLVED_STATUSES.has(status) && updatedAt && updatedAt >= todayStart;
  }).length;

  const queueItems = normalizedTickets
    .map(mapTicketQueueItem)
    .sort((a, b) => {
      if (a.unassigned !== b.unassigned) return a.unassigned ? -1 : 1;
      if (a.overdue !== b.overdue) return a.overdue ? -1 : 1;
      const priorityDiff =
        (priorityRank[a.priorityKey] ?? 9) - (priorityRank[b.priorityKey] ?? 9);
      if (priorityDiff !== 0) return priorityDiff;
      return (b.updatedAt?.getTime?.() || 0) - (a.updatedAt?.getTime?.() || 0);
    });

  const performanceByAgent = new Map(
    (Array.isArray(agentPerformance) ? agentPerformance : []).map((row) => [
      String(row._id || row.agent?.userId || ""),
      {
        total: asNumber(row.total),
        open: asNumber(row.open),
        resolved: asNumber(row.resolved),
        overdue: asNumber(row.overdue),
        name: row.agent?.name || "Agent",
        email: row.agent?.email || "",
      },
    ]),
  );

  const teamMembers = (Array.isArray(teamUsers) ? teamUsers : [])
    .filter((user) => TEAM_LEAD_REPORT_ROLES.has(getUserRole(user)))
    .map((user) => {
      const id = String(user._id || user.id || user.userId || "");
      const stats = performanceByAgent.get(id) || {
        total: 0,
        open: 0,
        resolved: 0,
        overdue: 0,
      };
      const lastLoginAt = safeDate(user.lastLoginAt || user.last_login_at || user.updatedAt);
      const openFromTickets = normalizedTickets.filter(
        (t) =>
          String(getAssigneeId(t) || "") === id && OPEN_STATUSES.has(getTicketStatus(t)),
      ).length;
      return {
        id,
        name: user.name || user.fullName || "Team member",
        email: user.email || "",
        role: titleCase(getUserRole(user)),
        roleKey: getUserRole(user),
        open: stats.open || openFromTickets,
        resolved: stats.resolved,
        overdue: stats.overdue,
        total: stats.total,
        lastLoginAt,
        isOnline: Boolean(lastLoginAt && now - lastLoginAt.getTime() < 15 * 60 * 1000),
      };
    })
    .sort((a, b) => b.open - a.open || b.overdue - a.overdue);

  const performanceWeek = mapPerformanceWeek(trends, normalizedTickets);
  const firstResponseMinutes = Math.round(
    asNumber(
      overview.sla?.avgFirstResponseMinutes ??
        overview.avgFirstResponseMinutes ??
        overview.avgResponseMinutes ??
        0,
    ),
  );
  const avgResolutionMinutes = Math.round(
    asNumber(overview.sla?.avgResolutionMinutes ?? overview.avgResolutionMinutes ?? 0),
  );

  return {
    summary: {
      openTickets: asNumber(overview.open ?? overview.openTickets) || openTickets,
      urgentCount,
      unassignedCount: asNumber(overview.unassigned) || unassignedCount,
      overdueCount: asNumber(overview.overdue) || overdueCount,
      awaitingCount,
      resolvedToday,
      firstResponseMinutes,
      avgResolutionMinutes,
      weeklyResolved: performanceWeek.reduce((sum, item) => sum + asNumber(item.resolved), 0),
      teamOnline: teamMembers.filter((m) => m.isOnline).length,
      teamSize: teamMembers.length,
    },
    queueItems,
    teamMembers,
    performanceWeek,
    currentUserName: currentUser?.name || currentUser?.fullName || "Team Lead",
    currentRole: "Customer Support Team Lead",
  };
};
