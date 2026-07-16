export const departmentLabels = {
  "builder-success": "Builder Success",
  support: "Support",
};

export const statusLabels = {
  open: "Open",
  assigned: "Assigned",
  under_review: "Under Review",
  awaiting_user_response: "Awaiting User Response",
  in_progress: "In Progress",
  escalated: "Escalated",
  reopened: "Reopened",
  resolved: "Resolved",
  closed: "Closed",
};

export const priorityLabels = {
  urgent: "Urgent",
  high: "High",
  medium: "Medium",
  low: "Low",
};

export const roleLabels = {
  sales_agent: "Sales Executive",
  sales_manager: "Sales Manager",
  customer_care: "Customer Care",
  digital_marketing: "Digital Marketing",
};

export function formatLabel(value) {
  if (!value) return "Unassigned";
  return (
    departmentLabels[value] ||
    statusLabels[value] ||
    priorityLabels[value] ||
    roleLabels[value] ||
    String(value)
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase())
  );
}

export function formatDueDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatMinutes(value) {
  if (!value) return "-";
  const roundedMinutes = Math.round(Number(value));
  if (roundedMinutes < 60) return `${roundedMinutes}m`;
  const hours = Math.floor(roundedMinutes / 60);
  const minutes = roundedMinutes % 60;
  return minutes ? `${hours}h ${minutes}m` : `${hours}h`;
}

export function formatRelativeTime(value) {
  if (!value) return "-";
  const diffMs = Date.now() - new Date(value).getTime();
  const diffMinutes = Math.max(0, Math.round(diffMs / 60000));
  if (diffMinutes < 60) return `${diffMinutes || 1}m ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.round(diffHours / 24);
  return `${diffDays}d ago`;
}
