import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import {
  TextStyle,
  Color,
  FontFamily,
  FontSize,
} from "@tiptap/extension-text-style";
import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Highlighter,
  Italic,
  Plus,
  Redo2,
  Strikethrough,
  Type,
  Underline as UnderlineIcon,
  Undo2,
  X,
} from "lucide-react";
import {
  FONT_FAMILIES,
  FONT_SIZES,
  HEADING_LINE_LIMITS,
  HEADING_MAX_LINES,
  HIGHLIGHT_COLORS,
  TEXT_COLORS,
  getDocLines,
  loadCustomColors,
  normalizeHex,
  removeCustomColor,
  saveCustomColor,
  validateHeadingLines,
} from "./bannerTextExtensions";
import { HeadingLimitExtension } from "./headingLimitExtension";

function ToolbarButton({ active, disabled, onClick, title, children, buttonRef }) {
  return (
    <button
      ref={buttonRef}
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-600 transition disabled:opacity-40 ${
        active ? "bg-emerald-100 text-[#27AE60]" : "hover:bg-slate-100"
      }`}
    >
      {children}
    </button>
  );
}

function ToolbarGroup({ children }) {
  return (
    <div className="flex shrink-0 items-center gap-0.5 rounded-xl bg-slate-50/80 px-1 py-0.5 ring-1 ring-slate-100">
      {children}
    </div>
  );
}

/** Full color card portaled above modal/overflow containers. */
function ColorPalette({
  kind,
  presets,
  activeColor,
  anchorEl,
  onPick,
  onClear,
  clearLabel,
  onClose,
}) {
  const panelRef = useRef(null);
  const [customColors, setCustomColors] = useState(() => loadCustomColors(kind));
  const [hexInput, setHexInput] = useState(normalizeHex(activeColor) || "#27AE60");
  const [error, setError] = useState("");
  const [pos, setPos] = useState({ top: 0, left: 0 });

  const place = () => {
    if (!anchorEl) return;
    const rect = anchorEl.getBoundingClientRect();
    const width = 260;
    const pad = 8;
    let left = rect.left;
    let top = rect.bottom + 6;
    left = Math.min(left, window.innerWidth - width - pad);
    left = Math.max(pad, left);
    const approxHeight = 320;
    if (top + approxHeight > window.innerHeight - pad) {
      top = Math.max(pad, rect.top - approxHeight - 6);
    }
    setPos({ top, left });
  };

  useLayoutEffect(() => {
    place();
    const onScroll = () => place();
    window.addEventListener("resize", onScroll);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [anchorEl]);

  useEffect(() => {
    const onDown = (e) => {
      if (panelRef.current?.contains(e.target)) return;
      if (anchorEl?.contains?.(e.target)) return;
      onClose?.();
    };
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [anchorEl, onClose]);

  const applyHex = (raw, { save = false } = {}) => {
    const clean = normalizeHex(raw);
    if (!clean) {
      setError("Enter a valid hex like #27AE60");
      return;
    }
    setError("");
    setHexInput(clean);
    onPick(clean);
    if (save) setCustomColors(saveCustomColor(kind, clean));
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={panelRef}
      style={{ top: pos.top, left: pos.left }}
      className="fixed z-[200] w-[260px] rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl"
    >
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
          {kind === "highlight" ? "Highlight" : "Text color"}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-0.5 text-slate-400 hover:bg-slate-100"
        >
          <X size={12} />
        </button>
      </div>

      <div className="mb-3 grid grid-cols-8 gap-1.5">
        {presets.map((c) => (
          <button
            key={`preset-${c}`}
            type="button"
            title={c}
            className={`h-6 w-6 rounded-md border transition ${
              normalizeHex(activeColor) === normalizeHex(c)
                ? "border-[#27AE60] ring-2 ring-emerald-100"
                : "border-slate-200 hover:scale-105"
            }`}
            style={{ background: c }}
            onClick={() => applyHex(c)}
          />
        ))}
      </div>

      {customColors.length > 0 && (
        <div className="mb-3">
          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-400">
            Your colors
          </p>
          <div className="grid grid-cols-8 gap-1.5">
            {customColors.map((c) => (
              <div key={`custom-${c}`} className="relative">
                <button
                  type="button"
                  title={c}
                  className={`h-6 w-6 rounded-md border transition ${
                    normalizeHex(activeColor) === c
                      ? "border-[#27AE60] ring-2 ring-emerald-100"
                      : "border-slate-200 hover:scale-105"
                  }`}
                  style={{ background: c }}
                  onClick={() => applyHex(c)}
                />
                <button
                  type="button"
                  title="Remove"
                  className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-slate-700 text-[8px] text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCustomColors(removeCustomColor(kind, c));
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-1.5 border-t border-slate-100 pt-2">
        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
          Custom hex
        </p>
        <div className="flex items-center gap-1.5">
          <input
            type="color"
            value={normalizeHex(hexInput) || "#27AE60"}
            onChange={(e) => {
              setHexInput(e.target.value);
              setError("");
              applyHex(e.target.value, { save: true });
            }}
            className="h-8 w-8 shrink-0 cursor-pointer rounded-lg border border-slate-200 bg-white p-0.5"
            title="Pick color"
          />
          <input
            value={hexInput}
            onChange={(e) => {
              setHexInput(e.target.value);
              setError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                applyHex(hexInput, { save: true });
              }
            }}
            placeholder="#27AE60"
            className="h-8 min-w-0 flex-1 rounded-lg border border-slate-200 px-2 font-mono text-[11px] uppercase outline-none focus:border-[#27AE60]"
          />
          <button
            type="button"
            title="Add & apply hex"
            onClick={() => applyHex(hexInput, { save: true })}
            className="inline-flex h-8 shrink-0 items-center gap-1 rounded-lg bg-[#27AE60] px-2 text-[10px] font-bold text-white hover:bg-[#219653]"
          >
            <Plus size={12} /> Add
          </button>
        </div>
        {error ? (
          <p className="text-[10px] font-medium text-red-500">{error}</p>
        ) : (
          <p className="text-[10px] text-slate-400">
            Type hex (#RGB / #RRGGBB), then Add
          </p>
        )}
      </div>

      {onClear && (
        <button
          type="button"
          className="mt-2 w-full rounded-lg bg-slate-100 px-2 py-1.5 text-[10px] font-semibold text-slate-600 hover:bg-slate-200"
          onClick={() => {
            onClear();
            onClose();
          }}
        >
          {clearLabel || "Clear"}
        </button>
      )}
    </div>,
    document.body,
  );
}

export default function BannerRichTextField({
  label,
  enabled,
  onEnabledChange,
  value,
  onChange,
  placeholder = "Type here…",
  compact = false,
  showEnableToggle = true,
  enforceHeadingLimits = false,
  onLimitError,
}) {
  const [colorOpen, setColorOpen] = useState(false);
  const [highlightOpen, setHighlightOpen] = useState(false);
  const [limitError, setLimitError] = useState("");
  const [lineStats, setLineStats] = useState([""]);
  const colorBtnRef = useRef(null);
  const highlightBtnRef = useRef(null);
  const enforceRef = useRef(enforceHeadingLimits);
  const onChangeRef = useRef(onChange);
  const onLimitErrorRef = useRef(onLimitError);
  const reportLimitErrorRef = useRef((msg) => {
    setLimitError(msg || "");
  });

  useEffect(() => {
    enforceRef.current = enforceHeadingLimits;
  }, [enforceHeadingLimits]);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);
  useEffect(() => {
    onLimitErrorRef.current = onLimitError;
  }, [onLimitError]);

  const reportLimitError = (msg) => {
    const next = msg || "";
    setLimitError(next);
    onLimitErrorRef.current?.(next);
  };
  reportLimitErrorRef.current = reportLimitError;

  const extensions = useMemo(
    () => {
      const list = [
        StarterKit.configure({
          heading: false,
          codeBlock: false,
          blockquote: false,
          bulletList: false,
          orderedList: false,
          listItem: false,
          horizontalRule: false,
          code: false,
          hardBreak: enforceHeadingLimits ? false : undefined,
        }),
        Underline,
        TextStyle,
        Color,
        FontSize,
        FontFamily,
        Highlight.configure({ multicolor: true }),
        TextAlign.configure({
          types: ["paragraph"],
          alignments: ["left", "center", "right", "justify"],
          defaultAlignment: "left",
        }),
        Placeholder.configure({
          placeholder,
          emptyEditorClass: "is-editor-empty",
          emptyNodeClass: "is-empty",
        }),
      ];
      if (enforceHeadingLimits) {
        list.push(HeadingLimitExtension(() => reportLimitErrorRef.current));
      }
      return list;
    },
    [placeholder, enforceHeadingLimits],
  );

  const editor = useEditor({
    extensions,
    content: value || "<p></p>",
    editable: enabled,
    editorProps: {
      attributes: {
        class: `banner-tiptap-editor max-w-none focus:outline-none px-3 py-2.5 text-slate-800 ${
          compact ? "min-h-[56px] text-sm" : "min-h-[88px] text-base"
        }`,
      },
    },
    onUpdate: ({ editor: ed }) => {
      if (enforceRef.current) {
        const lines = getDocLines(ed.state.doc);
        setLineStats(lines);
        // Clear error only when content is valid; keep reject message until then
        const err = validateHeadingLines(lines);
        if (!err) reportLimitErrorRef.current("");
        else reportLimitErrorRef.current(err);
      }
      onChangeRef.current?.(ed.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(Boolean(enabled));
  }, [editor, enabled]);

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const next = value || "";
    if (next !== current) {
      editor.commands.setContent(next || "<p></p>", { emitUpdate: false });
      if (enforceHeadingLimits) {
        const lines = getDocLines(editor.state.doc);
        setLineStats(lines);
        reportLimitError(validateHeadingLines(lines));
      }
    }
  }, [editor, value, enforceHeadingLimits]);

  // Keep counters in sync on selection/doc changes without relying on blocked txs
  useEffect(() => {
    if (!editor || !enforceHeadingLimits) return undefined;
    const sync = () => {
      const lines = getDocLines(editor.state.doc);
      setLineStats(lines);
    };
    sync();
    editor.on("transaction", sync);
    return () => editor.off("transaction", sync);
  }, [editor, enforceHeadingLimits]);

  if (!editor) return null;

  const currentTextColor = editor.getAttributes("textStyle").color || "#111827";
  const currentHighlight = editor.getAttributes("highlight").color || "";
  const paddedLines = Array.from({ length: HEADING_MAX_LINES }, (_, i) => lineStats[i] || "");

  return (
    <div
      className={`rounded-2xl border transition ${
        enabled ? "border-slate-200 bg-white" : "border-slate-100 bg-slate-50 opacity-80"
      }`}
    >
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-3 py-2">
        <div className="flex items-center gap-2">
          <Type size={14} className="text-[#27AE60]" />
          <span className="text-xs font-bold text-slate-800">{label}</span>
        </div>
        {showEnableToggle && (
          <label className="inline-flex cursor-pointer items-center gap-2 text-[11px] font-semibold text-slate-600">
            <span>{enabled ? "Enabled" : "Disabled"}</span>
            <button
              type="button"
              role="switch"
              aria-checked={enabled}
              onClick={() => onEnabledChange?.(!enabled)}
              className={`relative h-5 w-9 rounded-full transition ${
                enabled ? "bg-[#27AE60]" : "bg-slate-300"
              }`}
            >
              <span
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition ${
                  enabled ? "left-4" : "left-0.5"
                }`}
              />
            </button>
          </label>
        )}
      </div>

      <div
        className={`flex flex-wrap items-center gap-1.5 border-b border-slate-100 px-2 py-2 ${
          enabled ? "" : "pointer-events-none opacity-50"
        }`}
      >
        <ToolbarGroup>
          <ToolbarButton title="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
            <Bold size={14} />
          </ToolbarButton>
          <ToolbarButton title="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
            <Italic size={14} />
          </ToolbarButton>
          <ToolbarButton title="Underline" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
            <UnderlineIcon size={14} />
          </ToolbarButton>
          <ToolbarButton title="Strike" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
            <Strikethrough size={14} />
          </ToolbarButton>
        </ToolbarGroup>

        <ToolbarGroup>
          <select
            className="h-8 max-w-[110px] rounded-lg border-0 bg-transparent px-1.5 text-[11px] text-slate-700 outline-none"
            value={editor.getAttributes("textStyle").fontFamily || ""}
            onChange={(e) => {
              const v = e.target.value;
              if (!v) editor.chain().focus().unsetFontFamily().run();
              else editor.chain().focus().setFontFamily(v).run();
            }}
          >
            {FONT_FAMILIES.map((f) => (
              <option key={f.label} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
          <select
            className="h-8 rounded-lg border-0 bg-transparent px-1.5 text-[11px] text-slate-700 outline-none"
            value={editor.getAttributes("textStyle").fontSize || ""}
            onChange={(e) => {
              const v = e.target.value;
              if (!v) editor.chain().focus().unsetFontSize().run();
              else editor.chain().focus().setFontSize(v).run();
            }}
          >
            <option value="">Size</option>
            {FONT_SIZES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </ToolbarGroup>

        <ToolbarGroup>
          <div className="relative">
            <ToolbarButton
              buttonRef={colorBtnRef}
              title="Text color"
              onClick={() => {
                setColorOpen((v) => !v);
                setHighlightOpen(false);
              }}
            >
              <span className="flex flex-col items-center leading-none">
                <span className="text-[11px] font-black">A</span>
                <span className="mt-0.5 h-1 w-3 rounded-full" style={{ background: currentTextColor }} />
              </span>
            </ToolbarButton>
            {colorOpen && (
              <ColorPalette
                kind="text"
                presets={TEXT_COLORS}
                activeColor={currentTextColor}
                anchorEl={colorBtnRef.current}
                onPick={(c) => editor.chain().focus().setColor(c).run()}
                onClear={() => editor.chain().focus().unsetColor().run()}
                clearLabel="Reset text color"
                onClose={() => setColorOpen(false)}
              />
            )}
          </div>

          <div className="relative">
            <ToolbarButton
              buttonRef={highlightBtnRef}
              title="Highlight"
              active={editor.isActive("highlight")}
              onClick={() => {
                setHighlightOpen((v) => !v);
                setColorOpen(false);
              }}
            >
              <Highlighter size={14} />
            </ToolbarButton>
            {highlightOpen && (
              <ColorPalette
                kind="highlight"
                presets={HIGHLIGHT_COLORS}
                activeColor={currentHighlight}
                anchorEl={highlightBtnRef.current}
                onPick={(c) => editor.chain().focus().setHighlight({ color: c }).run()}
                onClear={() => editor.chain().focus().unsetHighlight().run()}
                clearLabel="Clear highlight"
                onClose={() => setHighlightOpen(false)}
              />
            )}
          </div>
        </ToolbarGroup>

        <ToolbarGroup>
          <ToolbarButton
            title="Align left"
            active={editor.isActive({ textAlign: "left" }) || (!editor.isActive({ textAlign: "center" }) && !editor.isActive({ textAlign: "right" }) && !editor.isActive({ textAlign: "justify" }))}
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
          >
            <AlignLeft size={14} />
          </ToolbarButton>
          <ToolbarButton
            title="Align center"
            active={editor.isActive({ textAlign: "center" })}
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
          >
            <AlignCenter size={14} />
          </ToolbarButton>
          <ToolbarButton
            title="Align right"
            active={editor.isActive({ textAlign: "right" })}
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
          >
            <AlignRight size={14} />
          </ToolbarButton>
          <ToolbarButton
            title="Justify"
            active={editor.isActive({ textAlign: "justify" })}
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          >
            <AlignJustify size={14} />
          </ToolbarButton>
        </ToolbarGroup>

        <ToolbarGroup>
          <ToolbarButton title="Undo" onClick={() => editor.chain().focus().undo().run()}>
            <Undo2 size={14} />
          </ToolbarButton>
          <ToolbarButton title="Redo" onClick={() => editor.chain().focus().redo().run()}>
            <Redo2 size={14} />
          </ToolbarButton>
        </ToolbarGroup>
      </div>

      <div className={enabled ? "" : "pointer-events-none"}>
        <style>{`
          .banner-tiptap-editor.ProseMirror {
            outline: none;
            width: 100%;
          }
          .banner-tiptap-editor.ProseMirror p {
            margin: 0.2rem 0;
            line-height: 1.45;
            text-align: left;
          }
          .banner-tiptap-editor.ProseMirror p[style*="text-align: left"],
          .banner-tiptap-editor.ProseMirror p[style*="text-align:left"] {
            text-align: left !important;
          }
          .banner-tiptap-editor.ProseMirror p[style*="text-align: center"],
          .banner-tiptap-editor.ProseMirror p[style*="text-align:center"] {
            text-align: center !important;
          }
          .banner-tiptap-editor.ProseMirror p[style*="text-align: right"],
          .banner-tiptap-editor.ProseMirror p[style*="text-align:right"] {
            text-align: right !important;
          }
          .banner-tiptap-editor.ProseMirror p[style*="text-align: justify"],
          .banner-tiptap-editor.ProseMirror p[style*="text-align:justify"] {
            text-align: justify !important;
          }
          .banner-tiptap-editor.ProseMirror p.is-empty::before,
          .banner-tiptap-editor.ProseMirror p.is-editor-empty::before {
            color: #94a3b8;
            content: attr(data-placeholder);
            pointer-events: none;
            float: left;
            height: 0;
          }
          .banner-tiptap-editor.ProseMirror p.is-empty[style*="text-align: center"]::before,
          .banner-tiptap-editor.ProseMirror p.is-editor-empty[style*="text-align: center"]::before,
          .banner-tiptap-editor.ProseMirror p.is-empty[style*="text-align:center"]::before,
          .banner-tiptap-editor.ProseMirror p.is-editor-empty[style*="text-align:center"]::before {
            float: none;
            display: block;
            width: 100%;
            text-align: center;
            height: auto;
          }
          .banner-tiptap-editor.ProseMirror p.is-empty[style*="text-align: right"]::before,
          .banner-tiptap-editor.ProseMirror p.is-editor-empty[style*="text-align: right"]::before,
          .banner-tiptap-editor.ProseMirror p.is-empty[style*="text-align:right"]::before,
          .banner-tiptap-editor.ProseMirror p.is-editor-empty[style*="text-align:right"]::before {
            float: none;
            display: block;
            width: 100%;
            text-align: right;
            height: auto;
          }
          .banner-tiptap-editor.ProseMirror mark {
            border-radius: 2px;
            padding: 0 2px;
          }
          .banner-rich-preview p {
            margin: 0.15rem 0;
          }
          .banner-rich-preview mark {
            border-radius: 2px;
            padding: 0 2px;
          }
        `}</style>
        <EditorContent editor={editor} />
        {enforceHeadingLimits && (
          <div className="space-y-1 border-t border-slate-100 px-3 py-2">
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] font-semibold text-slate-500">
              {HEADING_LINE_LIMITS.map((max, i) => {
                const len = String(paddedLines[i] || "").length;
                const atOrOver = len >= max;
                const active = i < Math.max(lineStats.length, 1);
                return (
                  <span
                    key={`line-limit-${i}`}
                    className={
                      atOrOver ? "text-red-500" : active ? "text-slate-600" : "text-slate-400"
                    }
                  >
                    Line {i + 1}: {len}/{max}
                  </span>
                );
              })}
              <span className="text-slate-400">
                · max {HEADING_MAX_LINES} lines
              </span>
            </div>
            {limitError ? (
              <p className="text-[11px] font-semibold text-red-500">{limitError}</p>
            ) : (
              <p className="text-[10px] text-slate-400">
                Extra characters blocked · Line 1: 50 · Lines 2–4: 60 each · Max 4 lines
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function BannerTextOverlay({ heading }) {
  const showHeading = heading?.enabled && heading?.html && heading.html !== "<p></p>";
  if (!showHeading) return null;

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-center gap-1 bg-gradient-to-t from-black/35 via-transparent to-black/20 px-4">
      <div
        className="banner-rich-preview w-full max-w-full text-white drop-shadow"
        dangerouslySetInnerHTML={{ __html: heading.html }}
      />
    </div>
  );
}
