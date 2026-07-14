import {
  dashboardPriorityOrder,
  dashboardStatusOrder,
} from "../constants/ticketOptions";

function mapCounts(items = []) {
  return items.reduce((acc, item) => {
    acc[item._id || "unassigned"] = item.count || 0;
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
  return {
    totals: data?.totals || 0,
    open: data?.open || 0,
    overdue: data?.overdue || 0,
    unassigned: data?.unassigned || 0,
    byStatus: orderedCounts(dashboardStatusOrder, data?.byStatus),
    byPriority: orderedCounts(dashboardPriorityOrder, data?.byPriority),
    byDepartment: Array.isArray(data?.byDepartment) ? data.byDepartment : [],
    assignmentLoad: Array.isArray(data?.assignmentLoad) ? data.assignmentLoad : [],
    sla: {
      avgFirstResponseMinutes: data?.sla?.avgFirstResponseMinutes || 0,
      avgResolutionMinutes: data?.sla?.avgResolutionMinutes || 0,
    },
    recent: Array.isArray(data?.recent) ? data.recent : [],
  };
}
