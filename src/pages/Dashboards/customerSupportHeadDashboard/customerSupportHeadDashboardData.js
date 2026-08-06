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

export const CSH_QUEUE_TABS = [
  { key: "all", label: "All" },
  { key: "open", label: "Open" },
  { key: "urgent", label: "Urgent" },
  { key: "unassigned", label: "Unassigned" },
  { key: "overdue", label: "Overdue" },
  { key: "awaiting", label: "Awaiting" },
  { key: "resolved", label: "Resolved" },
];

export const CSH_KPI_QUEUE_TAB = {
  openTickets: "open",
  urgentCount: "urgent",
  unassignedCount: "unassigned",
  overdueCount: "overdue",
  awaitingCount: "awaiting",
  resolvedToday: "resolved",
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

const SUPPORT_TEAM_ROLES = new Set([
  "customer_care",
  "customer_care_executive",
  "customer_care_executives",
  "customer_support_team_lead",
  "customer_support_team_leads",
  "team_lead",
  "team_leads",
  "relationship_manager",
  "relationship_managers",
  "customer_support_head",
]);

const ticketStatusTone = {
  open: "bg-blue-50 text-blue-700",
  pending: "bg-amber-50 text-amber-700",
  in_progress: "bg-cyan-50 text-cyan-700",
  awaiting_user_response: "bg-orange-50 text-orange-700",
  resolved: "bg-emerald-50 text-emerald-700",
  closed: "bg-slate-100 text-slate-700",
  escalated: "bg-rose-50 text-rose-700",
  unassigned: "bg-violet-50 text-violet-700",
};

const priorityRank = { urgent: 0, high: 1, medium: 2, low: 3 };

export const getTicketStatus = (ticket = {}) =>
  normalize(ticket.status || ticket.ticketStatus || ticket.state || "");

export const getTicketPriority = (ticket = {}) =>
  normalize(ticket.priority || ticket.severity || ticket.urgency || "medium");

const getAssigneeId = (ticket = {}) =>
  ticket?.assignedTo?.userId || ticket?.assignedTo?._id || ticket?.assigneeId || null;

const getAssigneeName = (ticket = {}) =>
  ticket?.assignedTo?.name || ticket?.assigneeName || "Unassigned";

const getRequesterName = (ticket = {}) =>
  ticket?.requester?.name ||
  ticket?.customer?.name ||
  ticket?.createdBy?.name ||
  ticket?.name ||
  "Buyer / requester";

const formatRelativeClock = (value) => {
  const date = safeDate(value);
  if (!date) return "Just now";
  const minutes = Math.round((Date.now() - date.getTime()) / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
};

export const formatClockTime = (value) => {
  const date = safeDate(value);
  if (!date) return "—";
  return date.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
};

const isOverdue = (ticket = {}) => {
  const status = getTicketStatus(ticket);
  if (RESOLVED_STATUSES.has(status)) return false;
  const dueAt = safeDate(ticket.dueAt || ticket.slaDueAt);
  return Boolean(dueAt && dueAt.getTime() < Date.now());
};

const isUnassigned = (ticket = {}) => !getAssigneeId(ticket);

/** Ticket counts toward the selected period if any activity date falls in range. */
const ticketInPeriod = (ticket = {}, range = {}) => {
  if (!range?.from && !range?.to) return true;
  const dates = [ticket.createdAt, ticket.updatedAt, ticket.resolvedAt, ticket.assignedAt];
  return dates.some((value) => {
    if (!value) return false;
    const ms = new Date(value).getTime();
    if (!Number.isFinite(ms)) return false;
    if (range.from && ms < new Date(`${range.from}T00:00:00`).getTime()) return false;
    if (range.to && ms > new Date(`${range.to}T23:59:59.999`).getTime()) return false;
    return true;
  });
};

export const filterTicketsByTab = (tickets = [], tab = "all") => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  return tickets.filter((ticket) => {
    const status = getTicketStatus(ticket);
    const priority = getTicketPriority(ticket);
    if (tab === "open") return OPEN_STATUSES.has(status);
    if (tab === "urgent") return priority === "urgent" || priority === "high";
    if (tab === "unassigned") return isUnassigned(ticket) && OPEN_STATUSES.has(status);
    if (tab === "overdue") return isOverdue(ticket);
    if (tab === "awaiting") return AWAITING_STATUSES.has(status);
    if (tab === "resolved") {
      const updatedAt = safeDate(ticket.updatedAt || ticket.resolvedAt);
      return RESOLVED_STATUSES.has(status) && updatedAt && updatedAt >= todayStart;
    }
    return true;
  });
};

export const mapTicketQueueItem = (ticket = {}) => {
  const status = getTicketStatus(ticket);
  const priority = getTicketPriority(ticket);
  const updatedAt = safeDate(ticket.updatedAt || ticket.createdAt);
  const unassigned = isUnassigned(ticket);
  const overdue = isOverdue(ticket);

  const assignedToId = getAssigneeId(ticket);

  return {
    id: ticket._id || ticket.id,
    raw: ticket,
    ticketId:
      ticket.ticketId ||
      ticket.code ||
      `TK-${String(ticket._id || ticket.id || "0000").slice(-5).toUpperCase()}`,
    title: ticket.title || ticket.subject || "Support enquiry",
    customerName: getRequesterName(ticket),
    assigneeName: unassigned ? "Unassigned" : getAssigneeName(ticket),
    assignedToId: assignedToId ? String(assignedToId) : null,
    priority: titleCase(priority),
    priorityKey: priority,
    status,
    statusLabel: unassigned ? "Unassigned" : titleCase(status),
    statusTone: unassigned
      ? ticketStatusTone.unassigned
      : overdue
        ? "bg-rose-50 text-rose-700"
        : ticketStatusTone[status] || ticketStatusTone.open,
    overdue,
    unassigned,
    updatedAt,
    updatedLabel: updatedAt ? formatRelativeClock(updatedAt) : "Just now",
  };
};

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

const getUserRole = (user) =>
  normalize(user?.roleName || user?.role || user?.roleId?.name || "");

export const mapCustomerSupportHeadData = ({
  overview = {},
  tickets = [],
  teamUsers = [],
  agentPerformance = [],
  currentUser = null,
  trends = [],
  range = {},
}) => {
  const allTickets = Array.isArray(tickets) ? tickets : [];
  const normalizedTickets = allTickets.filter((t) => ticketInPeriod(t, range));
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
    .filter((user) => SUPPORT_TEAM_ROLES.has(getUserRole(user)))
    .map((user) => {
      const id = String(user._id || user.id || user.userId || "");
      const stats = performanceByAgent.get(id) || {
        total: 0,
        open: 0,
        resolved: 0,
        overdue: 0,
      };
      const lastLoginAt = safeDate(user.lastLoginAt || user.last_login_at || user.updatedAt);
      const managerRaw = user.managerId || user.reportsTo;
      const managerId = String(
        managerRaw?._id || managerRaw?.id || managerRaw || "",
      ).trim();
      return {
        id,
        name: user.name || user.fullName || "Team member",
        email: user.email || "",
        role: titleCase(getUserRole(user)),
        roleKey: getUserRole(user),
        managerId: managerId || null,
        open: stats.open,
        resolved: stats.resolved,
        overdue: stats.overdue,
        total: stats.total,
        lastLoginAt,
        isOnline: Boolean(lastLoginAt && now - lastLoginAt.getTime() < 15 * 60 * 1000),
      };
    })
    .sort((a, b) => b.open - a.open || b.overdue - a.overdue);

  teamMembers.sort((a, b) => b.open - a.open || b.overdue - a.overdue);

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

  const pickOverviewCount = (keys, fallback) => {
    for (const key of keys) {
      if (overview[key] != null && overview[key] !== "") return asNumber(overview[key]);
    }
    return fallback;
  };

  return {
    summary: {
      openTickets: pickOverviewCount(["open", "openTickets"], openTickets),
      urgentCount,
      unassignedCount: pickOverviewCount(["unassigned"], unassignedCount),
      overdueCount: pickOverviewCount(["overdue"], overdueCount),
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
    periodTickets: normalizedTickets,
    currentUserName: currentUser?.name || currentUser?.fullName || "Support Head",
    currentRole: "Customer Support Head",
  };
};
