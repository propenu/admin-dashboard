export const FONT_SIZES = [
  "12px",
  "14px",
  "16px",
  "18px",
  "20px",
  "24px",
  "28px",
  "32px",
  "40px",
  "48px",
  "64px",
];

export const FONT_FAMILIES = [
  { label: "Default", value: "" },
  { label: "Inter", value: "Inter, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Times", value: '"Times New Roman", Times, serif' },
  { label: "Arial", value: "Arial, Helvetica, sans-serif" },
  { label: "Verdana", value: "Verdana, Geneva, sans-serif" },
  { label: "Courier", value: '"Courier New", Courier, monospace' },
  { label: "Comic Sans", value: '"Comic Sans MS", cursive' },
];

export const TEXT_COLORS = [
  "#111827",
  "#ffffff",
  "#27AE60",
  "#e74c3c",
  "#f39c12",
  "#3498db",
  "#9b59b6",
  "#1abc9c",
  "#e67e22",
  "#2c3e50",
];

export const HIGHLIGHT_COLORS = [
  "#fef08a",
  "#bbf7d0",
  "#bfdbfe",
  "#fecaca",
  "#e9d5ff",
  "#fde68a",
  "#ffffff",
];

/** Heading: max 4 lines — 50 / 60 / 60 / 60 characters */
export const HEADING_LINE_LIMITS = [50, 60, 60, 60];
export const HEADING_MAX_LINES = 4;

export function lineLimitFor(index) {
  return HEADING_LINE_LIMITS[index] ?? 60;
}

function trimTrailingEmpty(lines) {
  const next = [...lines];
  while (next.length > 1 && next[next.length - 1] === "") {
    next.pop();
  }
  return next.length ? next : [""];
}

export function getDocLines(doc) {
  const lines = [];
  if (!doc) return lines;
  doc.forEach((node) => {
    if (node.type.name === "paragraph") {
      lines.push(node.textContent || "");
    }
  });
  return trimTrailingEmpty(lines);
}

export function validateHeadingLines(lines = []) {
  const list = Array.isArray(lines) ? lines : [];
  if (list.length > HEADING_MAX_LINES) {
    return `Only ${HEADING_MAX_LINES} lines allowed — extra lines not allowed`;
  }
  for (let i = 0; i < list.length; i += 1) {
    const max = lineLimitFor(i);
    const len = String(list[i] || "").length;
    if (len > max) {
      return `Line ${i + 1} max ${max} characters — extra characters not allowed`;
    }
  }
  return "";
}

export function isHeadingDocAllowed(doc) {
  return !validateHeadingLines(getDocLines(doc));
}

/** Would inserting `text` at from–to exceed the active line limit? */
export function wouldExceedLineLimit(doc, from, to, text) {
  try {
    const $from = doc.resolve(from);
    const depth = $from.depth;
    if (depth < 1) return "";
    const lineIndex = $from.index(0);
    if (lineIndex >= HEADING_MAX_LINES) {
      return `Only ${HEADING_MAX_LINES} lines allowed — extra lines not allowed`;
    }
    const start = $from.start(1);
    const end = $from.end(1);
    const before = doc.textBetween(start, Math.min(from, end), "");
    const after = doc.textBetween(Math.min(to, end), end, "");
    const nextLen = before.length + String(text || "").length + after.length;
    const max = lineLimitFor(lineIndex);
    if (nextLen > max) {
      return `Line ${lineIndex + 1} max ${max} characters — extra characters not allowed`;
    }
    return "";
  } catch {
    return "";
  }
}

/** Plain-text lines from heading HTML (each `<p>` = one line). */
export function getHtmlLines(html) {
  if (typeof document === "undefined") {
    const text = String(html || "")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<[^>]+>/g, "");
    return trimTrailingEmpty(text.split("\n"));
  }
  const div = document.createElement("div");
  div.innerHTML = html || "";
  const paragraphs = Array.from(div.querySelectorAll("p"));
  if (paragraphs.length) {
    return trimTrailingEmpty(paragraphs.map((p) => p.textContent || ""));
  }
  const text = div.textContent || "";
  return text ? [text] : [""];
}

const CUSTOM_TEXT_KEY = "propenu:banner-custom-text-colors";
const CUSTOM_HIGHLIGHT_KEY = "propenu:banner-custom-highlight-colors";

/** Normalize user hex to #RRGGBB (accepts #abc, abc, #aabbcc). */
export function normalizeHex(raw) {
  let value = String(raw || "").trim();
  if (!value) return "";
  if (!value.startsWith("#")) value = `#${value}`;
  if (/^#[0-9a-fA-F]{3}$/.test(value)) {
    const [, r, g, b] = value;
    value = `#${r}${r}${g}${g}${b}${b}`;
  }
  if (!/^#[0-9a-fA-F]{6}$/.test(value)) return "";
  return value.toLowerCase();
}

export function loadCustomColors(kind = "text") {
  try {
    const key = kind === "highlight" ? CUSTOM_HIGHLIGHT_KEY : CUSTOM_TEXT_KEY;
    const parsed = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(parsed)
      ? parsed.map(normalizeHex).filter(Boolean).slice(0, 24)
      : [];
  } catch {
    return [];
  }
}

export function saveCustomColor(kind, hex) {
  const clean = normalizeHex(hex);
  if (!clean) return loadCustomColors(kind);
  const key = kind === "highlight" ? CUSTOM_HIGHLIGHT_KEY : CUSTOM_TEXT_KEY;
  const next = [clean, ...loadCustomColors(kind).filter((c) => c !== clean)].slice(0, 24);
  try {
    localStorage.setItem(key, JSON.stringify(next));
  } catch {
    /* ignore quota */
  }
  return next;
}

export function removeCustomColor(kind, hex) {
  const clean = normalizeHex(hex);
  const key = kind === "highlight" ? CUSTOM_HIGHLIGHT_KEY : CUSTOM_TEXT_KEY;
  const next = loadCustomColors(kind).filter((c) => c !== clean);
  try {
    localStorage.setItem(key, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  return next;
}
