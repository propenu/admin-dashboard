/**
 * Convert rich clipboard HTML (Word / Docs / Excel lists) into plain text
 * that keeps bullets, numbers, and arrow characters visible in a <textarea>.
 */
export function htmlClipboardToPlainText(html = "") {
  if (!html || typeof document === "undefined") return "";

  const doc = new DOMParser().parseFromString(html, "text/html");
  doc.querySelectorAll("style, script, meta, link, title").forEach((n) => n.remove());

  const blockTags = new Set([
    "P",
    "DIV",
    "SECTION",
    "ARTICLE",
    "H1",
    "H2",
    "H3",
    "H4",
    "H5",
    "H6",
    "TR",
    "TABLE",
    "BLOCKQUOTE",
  ]);

  const walk = (node, listPrefix = "") => {
    if (!node) return "";

    if (node.nodeType === Node.TEXT_NODE) {
      return String(node.nodeValue || "").replace(/\u00a0/g, " ");
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return "";

    const tag = node.tagName;

    if (tag === "BR") return "\n";

    if (tag === "LI") {
      const parent = node.parentElement;
      const isOrdered = parent?.tagName === "OL";
      let marker = "• ";
      if (isOrdered) {
        const items = Array.from(parent.children).filter((c) => c.tagName === "LI");
        const idx = items.indexOf(node);
        const start = Number(parent.getAttribute("start") || "1") || 1;
        marker = `${start + Math.max(0, idx)}. `;
      } else {
        // Nested list depth → different bullet styles
        let depth = 0;
        let p = parent;
        while (p) {
          if (p.tagName === "UL" || p.tagName === "OL") depth += 1;
          p = p.parentElement;
        }
        marker = depth <= 1 ? "• " : depth === 2 ? "○ " : "▪ ";
      }
      const body = Array.from(node.childNodes)
        .map((c) => walk(c, marker))
        .join("")
        .replace(/\n+/g, "\n")
        .trim();
      return `${listPrefix}${marker}${body}\n`;
    }

    if (tag === "UL" || tag === "OL") {
      return Array.from(node.childNodes)
        .map((c) => walk(c, listPrefix))
        .join("");
    }

    const inner = Array.from(node.childNodes)
      .map((c) => walk(c, listPrefix))
      .join("");

    if (blockTags.has(tag)) {
      const trimmed = inner.replace(/\s+$/g, "");
      return trimmed ? `${trimmed}\n` : "";
    }

    return inner;
  };

  let text = walk(doc.body);
  text = text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+\n/g, "\n")
    .trimEnd();

  return text;
}

/** Normalize common pasted bullet / arrow glyphs so they stay visible. */
export function normalizePlainBulletText(text = "") {
  return String(text || "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    // Word / Outlook private-use bullets → real bullets
    .replace(/[\uF0A7\uF0B7\uF0A8\uF06C\uF06E]/g, "•")
    .replace(/^\s*[·∙‣‣▸►▶➢➔⇒→]\s+/gm, (m) => {
      const t = m.trim();
      if ("→⇒➔".includes(t[0])) return "→ ";
      if ("▸►▶➢".includes(t[0])) return "▸ ";
      return "• ";
    })
    // Lines that start with "* " or "- " keep as-is (already plain bullets)
    .replace(/\n{3,}/g, "\n\n");
}

/**
 * Paste handler for textarea: prefers HTML clipboard, converts lists/arrows
 * to plain text with visible bullets, then inserts at the caret.
 */
export function pasteRichAsPlainText(e, currentValue, setValue) {
  e.preventDefault();
  const html = e.clipboardData?.getData("text/html") || "";
  const plain = e.clipboardData?.getData("text/plain") || "";

  let pasted = "";
  if (html.trim()) {
    pasted = htmlClipboardToPlainText(html);
  }
  if (!pasted.trim()) {
    pasted = plain;
  }
  pasted = normalizePlainBulletText(pasted);

  const el = e.target;
  const value = String(currentValue || "");
  const start =
    typeof el.selectionStart === "number" ? el.selectionStart : value.length;
  const end =
    typeof el.selectionEnd === "number" ? el.selectionEnd : value.length;
  const next = `${value.slice(0, start)}${pasted}${value.slice(end)}`;
  setValue(next);

  requestAnimationFrame(() => {
    try {
      const pos = start + pasted.length;
      el.selectionStart = pos;
      el.selectionEnd = pos;
    } catch {
      /* ignore */
    }
  });
}
