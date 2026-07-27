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

export const QUEUE_TABS = [
  { key: "all", label: "All" },
  { key: "open", label: "Open" },
  { key: "in_progress", label: "In Progress" },
  { key: "urgent", label: "Urgent" },
  { key: "awaiting", label: "Awaiting" },
  { key: "resolved", label: "Resolved" },
];

/** Maps KPI card keys → queue filter tabs */
export const KPI_QUEUE_TAB = {
  openTickets: "open",
  urgentCount: "urgent",
  awaitingCount: "awaiting",
  resolvedToday: "resolved",
};

export const getTicketStatus = (ticket = {}) =>
  normalize(ticket.status || ticket.ticketStatus || ticket.state || "");

export const getTicketPriority = (ticket = {}) =>
  normalize(ticket.priority || ticket.severity || ticket.urgency || "medium");

const getCallbackDate = (ticket = {}) =>
  ticket?.metadata?.callbackDate ||
  ticket?.callbackDate ||
  ticket?.callbackOn ||
  ticket?.scheduledCallbackAt ||
  ticket?.followUpDate ||
  ticket?.dueAt ||
  null;

export const getRequesterName = (ticket = {}) =>
  ticket?.requester?.name ||
  ticket?.customer?.name ||
  ticket?.createdBy?.name ||
  ticket?.name ||
  "Unnamed requester";

const getRequesterPhone = (ticket = {}) =>
  ticket?.requester?.phone ||
  ticket?.customer?.phone ||
  ticket?.createdBy?.phone ||
  ticket?.phone ||
  "";

const getRequesterContact = (ticket = {}) =>
  ticket?.requester?.email ||
  ticket?.customer?.email ||
  ticket?.createdBy?.email ||
  ticket?.email ||
  "";

const getProjectLabel = (ticket = {}) =>
  ticket?.project?.title ||
  ticket?.project?.name ||
  ticket?.property?.title ||
  ticket?.property?.name ||
  ticket?.subject ||
  ticket?.title ||
  "General inquiry";

const getUserRole = (user) => {
  if (!user || typeof user !== "object") return "";
  return normalize(user.roleName || user.role || user.roleId?.name || "");
};

const OPEN_STATUSES = new Set([
  "open",
  "new",
  "assigned",
  "pending",
  "under_review",
  "reopened",
]);

const IN_PROGRESS_STATUSES = new Set(["in_progress", "assigned", "under_review"]);
const AWAITING_STATUSES = new Set(["awaiting_user_response", "waiting_for_customer"]);
const RESOLVED_STATUSES = new Set(["resolved", "closed"]);

const ticketStatusTone = {
  open: "bg-blue-50 text-blue-700 border-blue-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  in_progress: "bg-cyan-50 text-cyan-700 border-cyan-200",
  awaiting_user_response: "bg-orange-50 text-orange-700 border-orange-200",
  resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  closed: "bg-slate-100 text-slate-700 border-slate-200",
  overdue: "bg-rose-50 text-rose-700 border-rose-200",
  due_in_2h: "bg-orange-50 text-orange-700 border-orange-200",
};

const priorityTone = {
  urgent: "bg-rose-50 text-rose-700 border-rose-200",
  high: "bg-orange-50 text-orange-700 border-orange-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  low: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const priorityRank = { urgent: 0, high: 1, medium: 2, low: 3 };

export const filterTicketsByTab = (tickets = [], tab = "all") => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  return tickets.filter((ticket) => {
    const status = getTicketStatus(ticket);
    const priority = getTicketPriority(ticket);
    if (tab === "open") {
      return (
        OPEN_STATUSES.has(status) ||
        IN_PROGRESS_STATUSES.has(status) ||
        AWAITING_STATUSES.has(status)
      );
    }
    if (tab === "in_progress") return IN_PROGRESS_STATUSES.has(status);
    if (tab === "urgent") return priority === "urgent" || priority === "high";
    if (tab === "awaiting") return AWAITING_STATUSES.has(status);
    if (tab === "resolved") {
      const updatedAt = safeDate(ticket.updatedAt || ticket.resolvedAt);
      return RESOLVED_STATUSES.has(status) && updatedAt && updatedAt >= todayStart;
    }
    return true;
  });
};

export const computeSlaLabel = (ticket = {}) => {
  const status = getTicketStatus(ticket);
  const dueAt = safeDate(ticket.dueAt || getCallbackDate(ticket));
  if (ticket.slaStatus) return titleCase(String(ticket.slaStatus));
  if (status === "overdue") return "Overdue";
  if (!dueAt) return "On Track";
  const diffMs = dueAt.getTime() - Date.now();
  if (diffMs < 0) return "Overdue";
  const hours = Math.round(diffMs / 3_600_000);
  if (hours <= 2) return `Due in ${hours}h`;
  return "On Track";
};

export const computeSlaTone = (slaLabel = "") => {
  const normalized = normalize(slaLabel);
  if (normalized.includes("overdue")) return ticketStatusTone.overdue;
  if (normalized.includes("due")) return ticketStatusTone.due_in_2h;
  return "bg-emerald-50 text-emerald-700 border-emerald-200";
};

export const mapTicketQueueItem = (ticket = {}) => {
  const status = getTicketStatus(ticket);
  const priority = getTicketPriority(ticket);
  const updatedAt = safeDate(ticket.updatedAt || ticket.createdAt);
  const sla = computeSlaLabel(ticket);
  return {
    id: ticket._id || ticket.id,
    raw: ticket,
    ticketId:
      ticket.ticketId ||
      ticket.code ||
      ticket.reference ||
      `TK-${String(ticket._id || ticket.id || "0000").slice(-5).toUpperCase()}`,
    title: ticket.title || ticket.subject || getProjectLabel(ticket),
    customerName: getRequesterName(ticket),
    customerPhone: getRequesterPhone(ticket),
    issueType: ticket.issueType || ticket.category || ticket.type || "General enquiry",
    project: getProjectLabel(ticket),
    priority: titleCase(priority),
    priorityKey: priority,
    priorityTone: priorityTone[priority] || priorityTone.medium,
    status,
    statusLabel: titleCase(status),
    statusTone: ticketStatusTone[status] || ticketStatusTone.open,
    sla,
    slaTone: computeSlaTone(sla),
    updatedAt,
    updatedLabel: updatedAt
      ? formatRelativeClock(updatedAt)
      : "Just now",
    assignedToName: ticket.assignedTo?.name || "",
    assignedAtLabel: ticket.metadata?.autoAssignedAt
      ? formatRelativeClock(ticket.metadata.autoAssignedAt)
      : ticket.activities?.find?.((a) => a.action === "ticket.assigned")
        ? formatRelativeClock(
            ticket.activities.find((a) => a.action === "ticket.assigned")?.createdAt,
          )
        : "",
    autoAssigned: Boolean(ticket.metadata?.autoAssigned),
  };
};

export const mapLeadRows = (leads = []) =>
  (Array.isArray(leads) ? leads : [])
    .filter((lead) => !lead.status || !["sale", "not_interested"].includes(normalize(lead.status)))
    .slice(0, 5)
    .map((lead) => ({
      id: lead._id || lead.id,
      name: lead.name || lead.customer?.name || "Lead",
      phone: lead.phone || lead.customer?.phone || "",
      email: lead.email || lead.customer?.email || "",
      project:
        lead.project?.title ||
        lead.property?.title ||
        lead.projectName ||
        "Property enquiry",
      status: titleCase(lead.status || "new_lead"),
      heroImage:
        lead.project?.heroImage ||
        lead.property?.heroImage ||
        lead.heroImage ||
        "",
      createdAt: safeDate(lead.createdAt),
    }));

const countFromStatusWise = (statusWise = [], statusKey = "") => {
  const row = (Array.isArray(statusWise) ? statusWise : []).find(
    (item) => normalize(item._id || item.name || "") === normalize(statusKey),
  );
  return asNumber(row?.total || row?.count || 0);
};

export const mapInventoryCounts = (payload = {}, kind = "project") => {
  const overview = payload?.overview || payload || {};
  const statusWise = payload?.statusWise || [];
  const isProject = kind === "project";

  const created = asNumber(isProject ? overview.totalProjects : overview.totalProperties);
  const onboarding = isProject
    ? countFromStatusWise(statusWise, "draft") || asNumber(overview.inactiveProjects)
    : asNumber(overview.draftProperties) || countFromStatusWise(statusWise, "draft");
  const active = asNumber(isProject ? overview.activeProjects : overview.activeProperties);
  const pending = asNumber(isProject ? overview.pendingProjects : overview.pendingProperties);

  return { created, onboarding, active, pending };
};

export const mapLoginAttemptRows = (users = [], todayStart = new Date()) => {
  const start = new Date(todayStart);
  start.setHours(0, 0, 0, 0);

  return (Array.isArray(users) ? users : [])
    .filter(Boolean)
    .map((user) => {
      const lastLoginAt = safeDate(user.lastLoginAt || user.last_login_at);
      return {
        id: user._id || user.id || user.email,
        name: user.name || user.fullName || "Unknown user",
        email: user.email || "",
        role: titleCase(getUserRole(user)),
        lastLoginAt,
        successful: Boolean(lastLoginAt && lastLoginAt >= start),
      };
    })
    .filter((row) => row.successful)
    .sort((a, b) => (b.lastLoginAt?.getTime?.() || 0) - (a.lastLoginAt?.getTime?.() || 0));
};

export const mapTodayInteractions = ({
  tickets = [],
  leads = [],
  users = [],
  todayStart = new Date(),
}) => {
  const start = new Date(todayStart);
  start.setHours(0, 0, 0, 0);
  const isToday = (value) => {
    const date = safeDate(value);
    return Boolean(date && date >= start);
  };

  const ticketItems = (Array.isArray(tickets) ? tickets : []).flatMap((ticket) => {
    const rows = [];
    const ticketLabel = ticket.title || ticket.subject || "Support ticket";
    const requester = getRequesterName(ticket);

    if (isToday(ticket.createdAt)) {
      rows.push({
        id: `ticket-new-${ticket._id || ticket.id}`,
        type: "ticket",
        tone: "emerald",
        title: "New ticket created",
        summary: `${requester} • ${ticketLabel}`,
        details: [
          `Ticket ID: ${ticket.ticketId || ticket.code || ticket._id || "—"}`,
          `Priority: ${titleCase(getTicketPriority(ticket))}`,
          `Status: ${titleCase(getTicketStatus(ticket))}`,
        ],
        time: safeDate(ticket.createdAt),
      });
    }

    if (isToday(ticket.updatedAt) && !isToday(ticket.createdAt)) {
      rows.push({
        id: `ticket-update-${ticket._id || ticket.id}`,
        type: "ticket",
        tone: "blue",
        title: `Ticket ${titleCase(getTicketStatus(ticket))}`,
        summary: `${requester} • ${ticketLabel}`,
        details: [`Latest status: ${titleCase(getTicketStatus(ticket))}`],
        time: safeDate(ticket.updatedAt),
      });
    }

    (ticket.comments || []).forEach((comment, index) => {
      if (!isToday(comment.createdAt || comment.timestamp)) return;
      rows.push({
        id: `ticket-comment-${ticket._id || ticket.id}-${comment._id || index}`,
        type: "message",
        tone: "violet",
        title: comment.visibility === "internal" ? "Internal note added" : "Ticket reply sent",
        summary: `${comment.author?.name || "Agent"} • ${ticketLabel}`,
        details: [comment.message || "No message body"],
        time: safeDate(comment.createdAt || comment.timestamp),
      });
    });

    return rows;
  });

  const leadItems = (Array.isArray(leads) ? leads : [])
    .filter((lead) => isToday(lead.createdAt))
    .map((lead) => ({
      id: `lead-${lead._id || lead.id}`,
      type: "lead",
      tone: "amber",
      title: "New lead captured",
      summary: `${lead.name || lead.customer?.name || "Lead"} • ${lead.project?.title || lead.property?.title || lead.projectName || "Property enquiry"}`,
      details: [
        `Phone: ${lead.phone || lead.customer?.phone || "—"}`,
        `Status: ${titleCase(lead.status || "new_lead")}`,
      ],
      time: safeDate(lead.createdAt),
    }));

  const loginItems = mapLoginAttemptRows(users, start).map((user) => ({
    id: `login-${user.id}`,
    type: "login",
    tone: "slate",
    title: `${user.name} logged in`,
    summary: `${user.role} • ${user.email || "No email"}`,
    details: [`Login time: ${formatClockTime(user.lastLoginAt)}`],
    time: user.lastLoginAt,
  }));

  return [...ticketItems, ...leadItems, ...loginItems]
    .filter((item) => item.time)
    .sort((a, b) => (b.time?.getTime?.() || 0) - (a.time?.getTime?.() || 0));
};

export const mapPerformanceWeek = (trends = {}, tickets = []) => {
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
    if (RESOLVED_STATUSES.has(status) || status === "resolved" || status === "closed") {
      byDay.get(dayKey).resolved += asNumber(row.count || row.resolved || 0);
    }
  });

  if (!trendRows.length) {
    (Array.isArray(tickets) ? tickets : []).forEach((ticket) => {
      const status = getTicketStatus(ticket);
      if (!RESOLVED_STATUSES.has(status)) return;
      const resolvedAt = safeDate(ticket.resolvedAt || ticket.updatedAt);
      if (!resolvedAt) return;
      const key = resolvedAt.toISOString().slice(0, 10);
      if (byDay.has(key)) byDay.get(key).resolved += 1;
    });
  }

  return week;
};

const rangeBounds = (range = {}) => {
  const from = range?.from ? new Date(`${range.from}T00:00:00`).getTime() : null;
  const to = range?.to ? new Date(`${range.to}T23:59:59.999`).getTime() : null;
  return {
    from: Number.isFinite(from) ? from : null,
    to: Number.isFinite(to) ? to : null,
  };
};

const dateInRange = (value, range = {}) => {
  const t = safeDate(value)?.getTime();
  if (!t) return false;
  const { from, to } = rangeBounds(range);
  if (from == null && to == null) return true;
  if (from != null && t < from) return false;
  if (to != null && t > to) return false;
  return true;
};

/** Ticket belongs to period if created or updated inside the selected date range. */
const ticketInRange = (ticket, range = {}) => {
  if (!range?.from && !range?.to) return true;
  return (
    dateInRange(ticket.createdAt, range) ||
    dateInRange(ticket.updatedAt, range) ||
    dateInRange(ticket.resolvedAt, range)
  );
};

export const mapCustomerCareData = ({
  overview = {},
  tickets = [],
  users = [],
  leads = [],
  currentUser = null,
  trends = [],
  projectsToday = {},
  propertiesToday = {},
  range = {},
}) => {
  const periodLabel =
    range?.label || (range?.days === 1 ? "Today" : `Last ${range?.days || 30} days`);
  const allTickets = Array.isArray(tickets) ? tickets : [];
  const normalizedTickets = allTickets.filter((ticket) => ticketInRange(ticket, range));
  const normalizedUsers = Array.isArray(users) ? users : [];
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const now = new Date();
  const periodStart = range?.from
    ? new Date(`${range.from}T00:00:00`)
    : todayStart;

  const byStatus = overview.byStatus || {};
  const countStatus = (...keys) =>
    keys.reduce((sum, key) => {
      if (Array.isArray(byStatus)) {
        const row = byStatus.find((item) => normalize(item._id || item.status) === normalize(key));
        return sum + asNumber(row?.count || row?.total);
      }
      return sum + asNumber(byStatus[key]);
    }, 0);

  const openFromTickets = normalizedTickets.filter((ticket) => {
    const status = getTicketStatus(ticket);
    return OPEN_STATUSES.has(status) || IN_PROGRESS_STATUSES.has(status) || AWAITING_STATUSES.has(status);
  }).length;

  const urgentCount = normalizedTickets.filter((ticket) => {
    const priority = getTicketPriority(ticket);
    return priority === "urgent" || priority === "high";
  }).length;

  const awaitingFromTickets = normalizedTickets.filter((ticket) =>
    AWAITING_STATUSES.has(getTicketStatus(ticket)),
  ).length;

  const resolvedInPeriod = normalizedTickets.filter((ticket) => {
    const status = getTicketStatus(ticket);
    return (
      RESOLVED_STATUSES.has(status) &&
      (dateInRange(ticket.resolvedAt || ticket.updatedAt, range) ||
        (!range?.from && safeDate(ticket.updatedAt || ticket.resolvedAt) >= todayStart))
    );
  }).length;

  const openCreatedInPeriod = normalizedTickets.filter((ticket) => {
    if (!dateInRange(ticket.createdAt, range)) return false;
    const status = getTicketStatus(ticket);
    return !RESOLVED_STATUSES.has(status);
  }).length;

  const hasRange = Boolean(range?.from && range?.to);
  const isTodayPeriod = range?.days === 1 || periodLabel === "Today";
  const overviewOpen =
    asNumber(overview.open ?? overview.openTickets) ||
    countStatus("open", "assigned", "reopened", "in_progress", "under_review", "awaiting_user_response");
  const overviewAwaiting =
    asNumber(overview.awaiting ?? overview.awaitingUser) ||
    countStatus("awaiting_user_response", "waiting_for_customer");
  const overviewResolvedToday = asNumber(overview.resolvedToday);

  const pendingCallbacks = normalizedTickets.filter((ticket) => {
    const callback = safeDate(getCallbackDate(ticket));
    if (!callback) return false;
    const status = getTicketStatus(ticket);
    return callback >= todayStart && !RESOLVED_STATUSES.has(status);
  }).length;

  const loginRows = normalizedUsers
    .filter(Boolean)
    .map((user) => {
      const lastLoginAt = safeDate(user.lastLoginAt || user.last_login_at || user.updatedAt);
      return {
        id: user._id || user.id || user.userId || user.email,
        name: user.name || user.fullName || "Unknown user",
        email: user.email || "",
        role: titleCase(getUserRole(user)),
        lastLoginAt,
        isOnline: lastLoginAt && now.getTime() - lastLoginAt.getTime() < 15 * 60 * 1000,
      };
    })
    .sort((a, b) => (b.lastLoginAt?.getTime?.() || 0) - (a.lastLoginAt?.getTime?.() || 0));

  const loginAttemptRows = mapLoginAttemptRows(normalizedUsers, periodStart);
  const loginAttemptsToday = loginAttemptRows;

  const projectCounts = mapInventoryCounts(projectsToday, "project");
  const propertyCounts = mapInventoryCounts(propertiesToday, "property");
  const periodLeads = (Array.isArray(leads) ? leads : []).filter((lead) =>
    dateInRange(lead.createdAt, range),
  );
  const todayInteractions = mapTodayInteractions({
    tickets: normalizedTickets,
    leads: periodLeads,
    users: normalizedUsers.filter((user) =>
      dateInRange(user.lastLoginAt || user.last_login_at || user.updatedAt, range),
    ),
    todayStart: periodStart,
  });

  const queueItems = normalizedTickets
    .map(mapTicketQueueItem)
    .sort((a, b) => {
      const priorityDiff =
        (priorityRank[a.priorityKey] ?? 9) - (priorityRank[b.priorityKey] ?? 9);
      if (priorityDiff !== 0) return priorityDiff;
      return (b.updatedAt?.getTime?.() || 0) - (a.updatedAt?.getTime?.() || 0);
    });

  const activityRows = [
    ...normalizedTickets.slice(0, 5).map((ticket) => ({
      id: `ticket-${ticket._id || ticket.id}`,
      title:
        getTicketStatus(ticket) === "resolved"
          ? "Resolved ticket"
          : `Ticket ${titleCase(getTicketStatus(ticket))}`,
      description: `${getRequesterName(ticket)} • ${getProjectLabel(ticket)}`,
      time: safeDate(ticket.updatedAt || ticket.createdAt),
      tone: "bg-emerald-500",
    })),
    ...loginRows.slice(0, 4).map((user) => ({
      id: `login-${user.id}`,
      title: `${user.name} logged in`,
      description: `${user.role} • ${user.email || "No email"}`,
      time: user.lastLoginAt,
      tone: "bg-blue-500",
    })),
  ]
    .filter((item) => item.time)
    .sort((a, b) => (b.time?.getTime?.() || 0) - (a.time?.getTime?.() || 0))
    .slice(0, 8);

  const performanceWeek = mapPerformanceWeek(trends, normalizedTickets);
  const firstResponseMinutes = asNumber(
    overview.avgFirstResponseMinutes ??
      overview.sla?.avgFirstResponseMinutes ??
      overview.avgResponseMinutes ??
      0,
  );
  const overdue = asNumber(overview.overdue);
  const openFromOverview = asNumber(overview.open ?? overview.openTickets ?? openFromTickets);
  const slaCompliance = asNumber(
    overview.slaCompliance ??
      overview.slaComplianceRate ??
      overview.sla?.slaComplianceRate ??
      (openFromOverview > 0
        ? Math.max(0, Math.round(((openFromOverview - overdue) / openFromOverview) * 100))
        : 0),
  );
  const resolvedRole = getUserRole(currentUser);

  return {
    summary: {
      // Prefer period-filtered ticket list so Custom/7d/30d/90d stay accurate.
      openTickets: hasRange ? openFromTickets || overviewOpen : overviewOpen || openFromTickets,
      openTicketsTodayDelta: openCreatedInPeriod,
      urgentCount,
      awaitingCount: hasRange
        ? awaitingFromTickets || overviewAwaiting
        : overviewAwaiting || awaitingFromTickets,
      resolvedToday: hasRange
        ? resolvedInPeriod || (isTodayPeriod ? overviewResolvedToday : 0)
        : overviewResolvedToday || resolvedInPeriod,
      pendingCallbacks,
      successfulLogins: loginAttemptsToday.length,
      failedAttempts: asNumber(overview.failedAttempts),
      firstResponseMinutes,
      slaCompliance,
      csatScore: asNumber(overview.csatScore),
      csatResponses: asNumber(overview.csatResponses),
      weeklyResolved: performanceWeek.reduce((sum, item) => sum + asNumber(item.resolved || item.count || 0), 0),
      periodLabel,
    },
    queueItems,
    leadRows: mapLeadRows(periodLeads),
    recentLogins: loginRows
      .filter((row) => dateInRange(row.lastLoginAt, range))
      .slice(0, 6),
    loginAttemptRows,
    projectCounts,
    propertyCounts,
    todayInteractions,
    activityRows,
    performanceWeek,
    rangeLabel: periodLabel,
    currentUserName: currentUser?.name || currentUser?.fullName || "Executive",
    currentRole: resolvedRole ? titleCase(resolvedRole) : "Customer Care Executive",
  };
};

export const formatRelativeClock = (value) => {
  const date = safeDate(value);
  if (!date) return "Just now";
  const minutes = Math.round((Date.now() - date.getTime()) / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
};

export const formatClockTime = (value) => {
  const date = safeDate(value);
  if (!date) return "—";
  return date.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
};

export const formatTimeRange = (value) => formatClockTime(value);
