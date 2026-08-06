import {
  dashboardPriorityOrder,
  dashboardStatusOrder,
} from "../constants/ticketOptions";

function mapCounts(items = []) {
  return items.reduce((acc, item) => {
    const legacyStatusMap = {
      waiting_for_customer: "awaiting_user_response",
      waiting_for_internal_team: "under_review",
    };
    const key = legacyStatusMap[item._id] || item._id || "unassigned";
    acc[key] = (acc[key] || 0) + (item.count || 0);
    return acc;
  }, {});
}

function orderedCounts(order, items = []) {
  const counts = mapCounts(items);
  return order.map((key) => ({
    key,
    count: counts[key] || 0,
  }));
}

export function normalizeTicketOverview(data = {}) {
  const assignmentLoad = Array.isArray(data?.assignmentLoad)
    ? data.assignmentLoad.map((row) => ({
        ...row,
        agentName:
          row?.agent?.name ||
          row?.agent?.email ||
          (row?._id ? `Agent ${String(row._id).slice(-6)}` : "Unassigned"),
        agentRole: row?.agent?.role || "",
        count: Number(row?.count || 0),
      }))
    : [];

  return {
    totals: Number(data?.totals || 0),
    open: Number(data?.open || 0),
    overdue: Number(data?.overdue || 0),
    unassigned: Number(data?.unassigned || 0),
    reassigned: Number(data?.reassigned || 0),
    byStatus: orderedCounts(dashboardStatusOrder, data?.byStatus),
    byPriority: orderedCounts(dashboardPriorityOrder, data?.byPriority),
    byDepartment: Array.isArray(data?.byDepartment) ? data.byDepartment : [],
    assignmentLoad,
    sla: {
      avgFirstResponseMinutes: Number(data?.sla?.avgFirstResponseMinutes || 0),
      avgResolutionMinutes: Number(data?.sla?.avgResolutionMinutes || 0),
    },
    recent: Array.isArray(data?.recent)
      ? data.recent.map((ticket) => ({
          ...ticket,
          status:
            ticket.status === "waiting_for_customer"
              ? "awaiting_user_response"
              : ticket.status === "waiting_for_internal_team"
                ? "under_review"
                : ticket.status,
        }))
      : [],
  };
}

/** Aggregate trends API rows into one count per day. */
export function normalizeTicketTrends(rows = []) {
  const list = Array.isArray(rows) ? rows : [];
  const byDay = new Map();
  list.forEach((row) => {
    const day = row?._id?.day || row?.day;
    if (!day) return;
    byDay.set(day, (byDay.get(day) || 0) + Number(row?.count || 0));
  });
  return [...byDay.entries()]
    .map(([day, count]) => ({ day, count }))
    .sort((a, b) => String(a.day).localeCompare(String(b.day)));
}
