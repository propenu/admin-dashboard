export const TICKET_STATUSES = [
  "open",
  "in_progress",
  "waiting_for_customer",
  "waiting_for_internal_team",
  "resolved",
  "closed",
  "reopened",
];

export const TICKET_PRIORITIES = ["urgent", "high", "medium", "low"];

export const TICKET_SOURCES = ["admin", "web", "email", "phone", "whatsapp", "system"];

export const TICKET_VISIBILITIES = ["public", "internal"];

export const OPEN_TICKET_STATUSES = [
  "open",
  "in_progress",
  "waiting_for_customer",
  "waiting_for_internal_team",
  "reopened",
];

export const statusTone = {
  open: "bg-blue-50 text-blue-700 border-blue-100",
  in_progress: "bg-cyan-50 text-cyan-700 border-cyan-100",
  waiting_for_customer: "bg-amber-50 text-amber-700 border-amber-100",
  waiting_for_internal_team: "bg-violet-50 text-violet-700 border-violet-100",
  resolved: "bg-emerald-50 text-emerald-700 border-emerald-100",
  closed: "bg-slate-100 text-slate-600 border-slate-200",
  reopened: "bg-orange-50 text-orange-700 border-orange-100",
};

export const priorityTone = {
  urgent: "bg-red-50 text-red-700 border-red-100",
  high: "bg-orange-50 text-orange-700 border-orange-100",
  medium: "bg-amber-50 text-amber-700 border-amber-100",
  low: "bg-emerald-50 text-emerald-700 border-emerald-100",
};

export const dashboardStatusOrder = [
  "open",
  "in_progress",
  "waiting_for_customer",
  "waiting_for_internal_team",
  "reopened",
  "resolved",
  "closed",
];

export const dashboardPriorityOrder = ["urgent", "high", "medium", "low"];
