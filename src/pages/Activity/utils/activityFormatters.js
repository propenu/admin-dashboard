const IST = "Asia/Kolkata";
export const WHAT_TRUNCATE_LEN = 42;

export const ROLE_FILTERS = [
  { value: "all", label: "Role (All)" },
  { value: "owner", label: "Owner" },
  { value: "agent", label: "Agent" },
  { value: "builder", label: "Builder" },
  { value: "builder_staff", label: "Builder Staff" },
];

export const TIME_FILTERS = [
  { value: "today", label: "Time (Today)", range: "today" },
  { value: "yesterday", label: "Yesterday", range: "yesterday" },
  { value: "7d", label: "Last 7 days", hours: 168 },
  { value: "30d", label: "Last 30 days", hours: 720 },
  { value: "custom", label: "Custom date range", custom: true },
];

export const ACTION_FILTERS = [
  { value: "all", label: "Action (All)" },
  { value: "browsing", label: "Browsing" },
  { value: "searches", label: "Searches" },
  { value: "views", label: "Property views" },
  { value: "gallery", label: "Gallery / Map / EMI" },
  { value: "shortlists", label: "Shortlists" },
  { value: "brochures", label: "Brochure downloads" },
  { value: "contacts", label: "Contacts" },
  { value: "leads", label: "Leads received" },
  { value: "visits", label: "Site visits" },
];

export const formatActivityTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  const diffMs = Date.now() - date.getTime();
  if (diffMs < 60_000) return "Just now";
  if (diffMs < 60 * 60_000) return `${Math.floor(diffMs / 60_000)} min ago`;
  if (diffMs < 24 * 60 * 60_000) {
    return `${date.toLocaleString("en-IN", {
      timeZone: IST,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })} IST`;
  }
  return date.toLocaleString("en-IN", {
    timeZone: IST,
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

export const formatExactTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return `${date.toLocaleString("en-IN", {
    timeZone: IST,
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  })} IST`;
};

export const truncateText = (value = "", max = WHAT_TRUNCATE_LEN) => {
  const text = String(value || "").trim();
  if (text.length <= max) return text;
  return `${text.slice(0, Math.max(0, max - 1)).trimEnd()}…`;
};

export const initialsFromName = (name = "?") =>
  String(name)
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?";

export const outcomeBadgeClass = (type) => {
  switch (type) {
    case "lead":
    case "visit":
    case "booking":
    case "saved":
    case "contact":
    case "brochure":
    case "view":
    case "search":
      return "border-[#12A150]/30 bg-[#EAF8F0] text-[#0B7A3A]";
    case "browse":
      return "border-slate-200 bg-slate-50 text-slate-500";
    default:
      return "border-slate-200 bg-slate-50 text-slate-400";
  }
};

export const maskPhone = (phone) => {
  const digits = String(phone || "").replace(/\D/g, "");
  if (digits.length < 4) return phone || "";
  return `••••${digits.slice(-4)}`;
};

export const buildActivityQueryParams = ({
  action,
  role,
  timeKey,
  customFrom,
  customTo,
  query,
  page,
  limit,
  groupBy = "user",
  userId,
}) => {
  const time = TIME_FILTERS.find((item) => item.value === timeKey) || TIME_FILTERS[0];
  const params = {
    action,
    role,
    q: query || undefined,
    page,
    limit,
    groupBy,
    userId: userId || undefined,
  };

  if (time.custom && customFrom && customTo) {
    params.from = new Date(`${customFrom}T00:00:00`).toISOString();
    params.to = new Date(`${customTo}T23:59:59.999`).toISOString();
    params.range = "custom";
  } else if (time.range) {
    params.range = time.range;
  } else if (time.hours) {
    params.hours = time.hours;
  } else {
    params.range = "today";
  }

  return params;
};

export const normalizeActivityRow = (row) => {
  const recentActions = Array.isArray(row?.recentActions)
    ? row.recentActions.map((action) => ({
        id: action?.id || "",
        what: action?.what || "Activity",
        when: action?.when || null,
        whenLabel: formatActivityTime(action?.when),
        exactWhen: formatExactTime(action?.when),
        gotType: action?.got?.type || "none",
        gotLabel: action?.got?.label || "—",
        eventType: action?.eventType || "",
        entity: action?.entity || null,
        pageUrl: action?.pageUrl || "",
        source: action?.source || "",
      }))
    : [];

  const what = row?.what || "Activity";
  const actionCount = Number(row?.actionCount || recentActions.length || 1);

  return {
    id: row?.id || "",
    userId: row?.who?.userId || "",
    userName: row?.who?.name || "Unknown",
    userAvatar: row?.who?.avatar || null,
    role: row?.who?.role || "User",
    roleKey: row?.who?.roleKey || "user",
    city: row?.who?.city || "",
    email: row?.who?.email || "",
    phone: row?.who?.phone || "",
    resolved: Boolean(row?.who?.resolved),
    what,
    whatPreview: truncateText(what, WHAT_TRUNCATE_LEN),
    when: row?.when || null,
    whenLabel: formatActivityTime(row?.when),
    exactWhen: formatExactTime(row?.when),
    gotType: row?.got?.type || "none",
    gotLabel: row?.got?.label || "—",
    gotId: row?.got?.id || "",
    entity: row?.entity || null,
    eventType: row?.eventType || "",
    pageUrl: row?.pageUrl || "",
    source: row?.source || "",
    actionKey: row?.actionKey || "other",
    actionCount,
    recentActions,
    raw: row,
  };
};
