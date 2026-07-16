export const TICKET_STATUSES = [
  "open",
  "assigned",
  "under_review",
  "awaiting_user_response",
  "in_progress",
  "escalated",
  "resolved",
  "closed",
  "reopened",
];

export const TICKET_PRIORITIES = ["urgent", "high", "medium", "low"];

export const TICKET_SOURCES = ["admin", "web", "email", "phone", "whatsapp", "system"];

export const TICKET_VISIBILITIES = ["public", "internal"];

export const TICKET_CATEGORY_OPTIONS = [
  { label: "Verification", value: "verification" },
  { label: "Listing Approval", value: "listing_approval" },
  { label: "Leads", value: "leads" },
  { label: "Payment", value: "payment" },
  { label: "Technical", value: "technical" },
];

export const TICKET_ASSIGNABLE_ROLES = [
  { label: "All Roles", value: "all" },
  { label: "Customer Care", value: "customer_care" },
  { label: "Admin", value: "admin" },
  { label: "Sales Manager", value: "sales_manager" },
  { label: "Sales Executive", value: "sales_agent" },
  { label: "Regional Manager", value: "regional_manager" },
  { label: "Relationship Manager", value: "relationship_manager" },
  { label: "Accounts", value: "accounts" },
  { label: "Digital Marketing", value: "digital_marketing" },
];

export const OPEN_TICKET_STATUSES = [
  "open",
  "assigned",
  "under_review",
  "awaiting_user_response",
  "in_progress",
  "escalated",
  "reopened",
];

export const statusTone = {
  open: "bg-blue-50 text-blue-700 border-blue-100",
  assigned: "bg-indigo-50 text-indigo-700 border-indigo-100",
  under_review: "bg-violet-50 text-violet-700 border-violet-100",
  awaiting_user_response: "bg-amber-50 text-amber-700 border-amber-100",
  in_progress: "bg-cyan-50 text-cyan-700 border-cyan-100",
  escalated: "bg-red-50 text-red-700 border-red-100",
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
  "assigned",
  "under_review",
  "awaiting_user_response",
  "in_progress",
  "escalated",
  "reopened",
  "resolved",
  "closed",
];

export const dashboardPriorityOrder = ["urgent", "high", "medium", "low"];
