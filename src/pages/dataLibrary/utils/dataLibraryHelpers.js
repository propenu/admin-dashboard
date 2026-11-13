import {
  FileText,
  FileSpreadsheet,
  FileType,
  ClipboardList,
  Presentation,
  Image as ImageIcon,
  File,
} from "lucide-react";

export const DOC_TYPES = [
  { id: "pdf", label: "PDF", Icon: FileText, tone: "bg-red-50 text-red-600 ring-red-100" },
  { id: "sheet", label: "Sheets", Icon: FileSpreadsheet, tone: "bg-emerald-50 text-emerald-600 ring-emerald-100" },
  { id: "doc", label: "Docs", Icon: FileType, tone: "bg-blue-50 text-blue-600 ring-blue-100" },
  { id: "form", label: "Forms", Icon: ClipboardList, tone: "bg-violet-50 text-violet-600 ring-violet-100" },
  { id: "slides", label: "Slides", Icon: Presentation, tone: "bg-amber-50 text-amber-600 ring-amber-100" },
  { id: "image", label: "Images", Icon: ImageIcon, tone: "bg-pink-50 text-pink-600 ring-pink-100" },
  { id: "other", label: "Other", Icon: File, tone: "bg-gray-100 text-gray-600 ring-gray-200" },
];

export const docTypeMeta = (id) => DOC_TYPES.find((t) => t.id === id) || DOC_TYPES[DOC_TYPES.length - 1];

export const CATEGORY_SUGGESTIONS = [
  "Leads",
  "Project Documents",
  "Price List",
  "Brochure",
  "Reports",
  "Agreements",
  "Forms",
  "Marketing",
];

export const ACCEPTED_FILE_TYPES =
  ".pdf,.xls,.xlsx,.csv,.tsv,.ods,.doc,.docx,.odt,.rtf,.txt,.md,.ppt,.pptx,.odp,.jpg,.jpeg,.png,.webp,.gif,.avif,.heic,.json,.xml,.zip";

export const MAX_FILE_MB = 25;

const pad = (n) => String(n).padStart(2, "0");

/** Local calendar day as YYYY-MM-DD. */
export const toDayKey = (value) => {
  const d = value instanceof Date ? value : new Date(value);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const todayKey = () => toDayKey(new Date());

const startOfLocalDay = (dayKey) => new Date(`${dayKey}T00:00:00`);
const endOfLocalDay = (dayKey) => new Date(`${dayKey}T23:59:59.999`);

export const DATE_PRESETS = [
  { id: "all", label: "All dates" },
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "7d", label: "Last 7 days" },
  { id: "30d", label: "Last 30 days" },
  { id: "month", label: "This month" },
  { id: "custom", label: "Custom range" },
];

/** Returns ISO { from, to } bounds for the API, or {} for all dates. */
export const presetRange = (preset, customFrom, customTo) => {
  const now = new Date();
  const shift = (days) => {
    const d = new Date(now);
    d.setDate(d.getDate() - days);
    return toDayKey(d);
  };
  let fromKey = "";
  let toKey = "";
  if (preset === "today") fromKey = toKey = todayKey();
  else if (preset === "yesterday") fromKey = toKey = shift(1);
  else if (preset === "7d") [fromKey, toKey] = [shift(6), todayKey()];
  else if (preset === "30d") [fromKey, toKey] = [shift(29), todayKey()];
  else if (preset === "month") [fromKey, toKey] = [`${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`, todayKey()];
  else if (preset === "custom") [fromKey, toKey] = [customFrom || "", customTo || ""];

  return {
    ...(fromKey ? { from: startOfLocalDay(fromKey).toISOString() } : {}),
    ...(toKey ? { to: endOfLocalDay(toKey).toISOString() } : {}),
  };
};

export const dayHeading = (dayKey) => {
  const today = todayKey();
  const y = new Date();
  y.setDate(y.getDate() - 1);
  const date = startOfLocalDay(dayKey);
  const full = date.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  if (dayKey === today) return { label: "Today", sub: full };
  if (dayKey === toDayKey(y)) return { label: "Yesterday", sub: full };
  return { label: full, sub: "" };
};

export const groupByDay = (items = []) => {
  const groups = new Map();
  items.forEach((item) => {
    const key = toDayKey(item.recordDate || item.createdAt);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  });
  return Array.from(groups.entries()).sort(([a], [b]) => (a < b ? 1 : -1));
};

export const formatBytes = (bytes = 0) => {
  if (!bytes) return "";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** i).toFixed(i ? 1 : 0)} ${units[i]}`;
};

export const formatTime = (value) =>
  value
    ? new Date(value).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })
    : "";

export const linkHost = (url = "") => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

/** Client-side mirror of the backend link detection, for the live hint in the form. */
export const detectLinkType = (value = "") => {
  try {
    const url = new URL(value.trim());
    const host = url.hostname.toLowerCase();
    const p = url.pathname.toLowerCase();
    if (host === "forms.gle" || p.startsWith("/forms")) return "form";
    if (host.endsWith("docs.google.com")) {
      if (p.startsWith("/spreadsheets")) return "sheet";
      if (p.startsWith("/document")) return "doc";
      if (p.startsWith("/presentation")) return "slides";
    }
    if (p.endsWith(".pdf")) return "pdf";
    return "other";
  } catch {
    return null;
  }
};

const GOOGLE_EXPORTS = {
  spreadsheets: "xlsx",
  document: "docx",
  presentation: "pptx",
};

/** Google Sheets/Docs/Slides export URL (works when the viewer has access); null otherwise. */
export const googleExportUrl = (link = "") => {
  const match = /docs\.google\.com\/(spreadsheets|document|presentation)\/d\/([^/?#]+)/.exec(link);
  if (!match) return null;
  const [, kind, id] = match;
  return `https://docs.google.com/${kind}/d/${id}/export?format=${GOOGLE_EXPORTS[kind]}`;
};

const csvCell = (value) => {
  const text = value === undefined || value === null ? "" : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

export const exportItemsCsv = (items = []) => {
  const header = [
    "Record date",
    "Title",
    "Type",
    "Category",
    "Project",
    "Source",
    "File / Link",
    "Size",
    "Uploaded by",
    "Uploaded at",
    "Downloads",
    "Notes",
  ];
  const rows = items.map((item) => [
    toDayKey(item.recordDate || item.createdAt),
    item.title,
    docTypeMeta(item.docType).label,
    item.category,
    item.project,
    item.sourceType === "file" ? "File" : "Link",
    item.sourceType === "file" ? item.file?.originalName : item.link,
    item.sourceType === "file" ? formatBytes(item.file?.size) : "",
    item.uploadedBy?.name,
    item.createdAt ? new Date(item.createdAt).toLocaleString("en-IN") : "",
    item.downloads || 0,
    item.notes,
  ]);
  const csv = [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `data-library-${todayKey()}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
