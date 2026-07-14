export const departmentLabels = {
  "builder-success": "Builder Success",
  support: "Support",
};

export const statusLabels = {
  open: "Open",
  in_progress: "In Progress",
  waiting_for_customer: "Waiting Customer",
  waiting_for_internal_team: "Waiting Team",
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

export function formatLabel(value) {
  if (!value) return "Unassigned";
  return (
    departmentLabels[value] ||
    statusLabels[value] ||
    priorityLabels[value] ||
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
  if (value < 60) return `${value}m`;
  const hours = Math.floor(value / 60);
  const minutes = value % 60;
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
