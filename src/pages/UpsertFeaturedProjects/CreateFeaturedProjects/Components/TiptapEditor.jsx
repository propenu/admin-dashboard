// frontend/admin-dashboard/src/pages/post-property/featured-create/steps/Components/TiptapEditor.jsx
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import Highlight from "@tiptap/extension-highlight";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import { TableKit } from "@tiptap/extension-table";
import {
  TextStyleKit,
} from "@tiptap/extension-text-style";
import Typography from "@tiptap/extension-typography";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link as LinkIcon,
  Unlink,
  Image as ImageIcon,
  Undo,
  Redo,
  Highlighter,
  Subscript as SubIcon,
  Superscript as SuperIcon,
  Type,
  Trash2,
  RefreshCw,
  Table as TableIcon,
  Quote,
  SeparatorHorizontal,
  BetweenHorizonalStart,
  BetweenHorizonalEnd,
  BetweenVerticalStart,
  BetweenVerticalEnd,
  Combine,
  Split,
  ChevronDown,
  Eraser,
  Wrench,
  ArrowRightToLine,
  ArrowLeftToLine,
  Baseline,
  CaseSensitive,
} from "lucide-react";

/* ── Toolbar button styles ─────────────────────────────────── */
const ToolBtn = ({ onClick, active, title, children, disabled, danger }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`
      relative p-2 rounded-lg transition-all duration-150 flex items-center justify-center
      disabled:opacity-30 disabled:cursor-not-allowed
      ${
        active
          ? "text-white shadow-sm"
          : danger
            ? "text-red-500 hover:text-red-700 hover:bg-red-50"
            : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
      }
    `}
    style={active ? { background: "linear-gradient(135deg,#27AE60,#1e8449)" } : {}}
  >
    {children}
  </button>
);

const ToolLabel = ({ children }) => (
  <span className="px-1 text-[9px] font-black uppercase tracking-wide text-emerald-700/80 self-center">
    {children}
  </span>
);

const Divider = () => (
  <div className="w-px h-6 bg-gray-200 mx-1 self-center flex-shrink-0" />
);

const MinusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M5 12h14" />
  </svg>
);

const TEXT_COLORS = [
  { label: "Default", value: "" },
  { label: "Black", value: "#111827" },
  { label: "Dark gray", value: "#374151" },
  { label: "Gray", value: "#6b7280" },
  { label: "Red", value: "#dc2626" },
  { label: "Orange", value: "#ea580c" },
  { label: "Amber", value: "#d97706" },
  { label: "Yellow", value: "#ca8a04" },
  { label: "Lime", value: "#65a30d" },
  { label: "Green", value: "#16a34a" },
  { label: "Propenu", value: "#27AE60" },
  { label: "Teal", value: "#0d9488" },
  { label: "Cyan", value: "#0891b2" },
  { label: "Blue", value: "#2563eb" },
  { label: "Indigo", value: "#4f46e5" },
  { label: "Violet", value: "#7c3aed" },
  { label: "Purple", value: "#9333ea" },
  { label: "Fuchsia", value: "#c026d3" },
  { label: "Pink", value: "#db2777" },
  { label: "Rose", value: "#e11d48" },
];

const HIGHLIGHT_COLORS = [
  { label: "None", value: "" },
  { label: "Yellow", value: "#fef08a" },
  { label: "Lime", value: "#d9f99d" },
  { label: "Green", value: "#bbf7d0" },
  { label: "Cyan", value: "#a5f3fc" },
  { label: "Sky", value: "#bae6fd" },
  { label: "Blue", value: "#bfdbfe" },
  { label: "Violet", value: "#ddd6fe" },
  { label: "Fuchsia", value: "#f5d0fe" },
  { label: "Pink", value: "#fbcfe8" },
  { label: "Rose", value: "#fecdd3" },
  { label: "Orange", value: "#fed7aa" },
  { label: "Amber", value: "#fde68a" },
  { label: "Gray", value: "#e5e7eb" },
];

const FONT_SIZES = [
  { label: "Default", value: "" },
  { label: "10", value: "10px" },
  { label: "12", value: "12px" },
  { label: "14", value: "14px" },
  { label: "16", value: "16px" },
  { label: "18", value: "18px" },
  { label: "20", value: "20px" },
  { label: "24", value: "24px" },
  { label: "28", value: "28px" },
  { label: "32", value: "32px" },
  { label: "36", value: "36px" },
  { label: "48", value: "48px" },
];

const FONT_FAMILIES = [
  { label: "Default", value: "" },
  { label: "Arial", value: "Arial, Helvetica, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Times", value: '"Times New Roman", Times, serif' },
  { label: "Courier", value: '"Courier New", Courier, monospace' },
  { label: "Verdana", value: "Verdana, Geneva, sans-serif" },
  { label: "Trebuchet", value: '"Trebuchet MS", sans-serif' },
  { label: "Comic", value: '"Comic Sans MS", cursive, sans-serif' },
];

/** Docs-style color / highlight palette popover */
const ColorPaletteMenu = ({
  open,
  title,
  colors,
  activeValue,
  onPick,
  onClose,
  showNone = true,
}) => {
  const menuRef = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) onClose?.();
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open, onClose]);

  if (!open) return null;
  const list = showNone ? colors : colors.filter((c) => c.value);

  return (
    <div
      ref={menuRef}
      className="absolute top-full left-0 z-50 mt-2 w-[200px] rounded-2xl border-2 border-gray-200 bg-white p-3 shadow-xl"
    >
      <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-gray-500">
        {title}
      </p>
      <div className="grid grid-cols-5 gap-1.5">
        {list.map((c) => {
          const isActive =
            (activeValue || "") === (c.value || "") ||
            (!activeValue && !c.value);
          return (
            <button
              key={c.label}
              type="button"
              title={c.label}
              onClick={() => {
                onPick(c.value);
                onClose?.();
              }}
              className={`relative h-7 w-7 rounded-md border-2 transition hover:scale-105 ${
                isActive ? "border-emerald-500 ring-2 ring-emerald-200" : "border-gray-200"
              }`}
              style={{
                background: c.value || "#ffffff",
                backgroundImage: !c.value
                  ? "linear-gradient(135deg, transparent 46%, #ef4444 48%, #ef4444 52%, transparent 54%)"
                  : undefined,
              }}
            />
          );
        })}
      </div>
      <label className="mt-2 flex items-center gap-2 text-[10px] font-semibold text-gray-500">
        Custom
        <input
          type="color"
          className="h-7 w-full cursor-pointer rounded border border-gray-200 bg-white"
          value={activeValue && /^#/.test(activeValue) ? activeValue : "#27AE60"}
          onChange={(e) => {
            onPick(e.target.value);
            onClose?.();
          }}
        />
      </label>
    </div>
  );
};

/** Size grid picker for inserting a new table */
const InsertTableMenu = ({ editor, open, onClose }) => {
  const [hover, setHover] = useState({ r: 3, c: 3 });
  const menuRef = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) onClose?.();
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open, onClose]);

  if (!open) return null;
  const maxR = 8;
  const maxC = 8;
  return (
    <div
      ref={menuRef}
      className="absolute top-full left-0 z-50 mt-2 w-[220px] rounded-2xl border-2 border-gray-200 bg-white p-3 shadow-xl"
    >
      <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-gray-500">
        Insert table · {hover.r}×{hover.c}
      </p>
      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: `repeat(${maxC}, 1fr)` }}
        onMouseLeave={() => setHover({ r: 3, c: 3 })}
      >
        {Array.from({ length: maxR * maxC }, (_, i) => {
          const r = Math.floor(i / maxC) + 1;
          const c = (i % maxC) + 1;
          const on = r <= hover.r && c <= hover.c;
          return (
            <button
              key={i}
              type="button"
              className={`h-4 w-4 rounded-sm border transition ${
                on ? "border-emerald-500 bg-emerald-400" : "border-gray-200 bg-gray-50"
              }`}
              onMouseEnter={() => setHover({ r, c })}
              onClick={() => {
                editor
                  .chain()
                  .focus()
                  .insertTable({ rows: r, cols: c, withHeaderRow: true })
                  .run();
                onClose();
              }}
            />
          );
        })}
      </div>
      <p className="mt-2 text-[10px] text-gray-400">
        Or paste a table from Google Docs / Excel
      </p>
    </div>
  );
};

/** Full table editing strip — shows only when cursor is inside a table */
const AdvancedTableBar = ({ editor }) => {
  if (!editor?.isActive("table")) return null;
  const canCmd = (name) => {
    try {
      const fn = editor.can()[name];
      return typeof fn === "function" ? Boolean(fn()) : editor.isActive("table");
    } catch {
      return editor.isActive("table");
    }
  };

  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-0.5 rounded-xl border border-emerald-200 bg-emerald-50/70 px-2 py-1.5">
      <ToolLabel>Table edit</ToolLabel>

      <ToolBtn
        title="Add row above"
        disabled={!canCmd("addRowBefore")}
        onClick={() => editor.chain().focus().addRowBefore().run()}
      >
        <BetweenHorizonalStart size={15} />
      </ToolBtn>
      <ToolBtn
        title="Add row below"
        disabled={!canCmd("addRowAfter")}
        onClick={() => editor.chain().focus().addRowAfter().run()}
      >
        <BetweenHorizonalEnd size={15} />
      </ToolBtn>
      <ToolBtn
        title="Delete row"
        danger
        disabled={!canCmd("deleteRow")}
        onClick={() => editor.chain().focus().deleteRow().run()}
      >
        <Trash2 size={14} />
      </ToolBtn>

      <Divider />

      <ToolBtn
        title="Add column left"
        disabled={!canCmd("addColumnBefore")}
        onClick={() => editor.chain().focus().addColumnBefore().run()}
      >
        <BetweenVerticalStart size={15} />
      </ToolBtn>
      <ToolBtn
        title="Add column right"
        disabled={!canCmd("addColumnAfter")}
        onClick={() => editor.chain().focus().addColumnAfter().run()}
      >
        <BetweenVerticalEnd size={15} />
      </ToolBtn>
      <ToolBtn
        title="Delete column"
        danger
        disabled={!canCmd("deleteColumn")}
        onClick={() => editor.chain().focus().deleteColumn().run()}
      >
        <MinusIcon />
      </ToolBtn>

      <Divider />

      <ToolBtn
        title="Merge cells (select multiple first)"
        disabled={!canCmd("mergeCells")}
        onClick={() => editor.chain().focus().mergeCells().run()}
      >
        <Combine size={15} />
      </ToolBtn>
      <ToolBtn
        title="Split cell"
        disabled={!canCmd("splitCell")}
        onClick={() => editor.chain().focus().splitCell().run()}
      >
        <Split size={15} />
      </ToolBtn>
      <ToolBtn
        title="Merge or split"
        disabled={!canCmd("mergeOrSplit")}
        onClick={() => editor.chain().focus().mergeOrSplit().run()}
      >
        <Combine size={14} className="opacity-70" />
      </ToolBtn>

      <Divider />

      <ToolBtn
        title="Toggle header row"
        onClick={() => editor.chain().focus().toggleHeaderRow().run()}
      >
        <Type size={14} />
      </ToolBtn>
      <ToolBtn
        title="Toggle header column"
        onClick={() => editor.chain().focus().toggleHeaderColumn().run()}
      >
        <CaseSensitive size={14} />
      </ToolBtn>
      <ToolBtn
        title="Toggle header cell"
        onClick={() => editor.chain().focus().toggleHeaderCell().run()}
      >
        <Highlighter size={14} />
      </ToolBtn>

      <Divider />

      <ToolBtn
        title="Previous cell"
        onClick={() => editor.chain().focus().goToPreviousCell().run()}
      >
        <ArrowLeftToLine size={14} />
      </ToolBtn>
      <ToolBtn
        title="Next cell"
        onClick={() => editor.chain().focus().goToNextCell().run()}
      >
        <ArrowRightToLine size={14} />
      </ToolBtn>
      <ToolBtn
        title="Fix table structure"
        onClick={() => {
          editor.chain().focus().fixTables().run();
          toast.success("Table structure checked");
        }}
      >
        <Wrench size={14} />
      </ToolBtn>
      <ToolBtn
        title="Delete entire table"
        danger
        onClick={() => editor.chain().focus().deleteTable().run()}
      >
        <TableIcon size={14} />
      </ToolBtn>
    </div>
  );
};

/** TipTap Image with an always-visible red ✕ remove control on every image. */
const BlogImage = Image.extend({
  name: "image",
  addNodeView() {
    return ({ node, getPos, editor }) => {
      const outer = document.createElement("div");
      outer.className = "blog-image-node";
      outer.style.cssText =
        "position:relative;display:flex;justify-content:center;margin:12px 0;padding:4px;";

      const wrap = document.createElement("div");
      wrap.style.cssText =
        "position:relative;display:inline-block;max-width:100%;line-height:0;";

      const img = document.createElement("img");
      img.src = node.attrs.src || "";
      img.alt = node.attrs.alt || "";
      if (node.attrs.title) img.title = node.attrs.title;
      img.className = "blog-editor-image";
      img.draggable = false;
      img.style.cssText =
        "display:block;height:auto;max-height:10rem;width:auto;max-width:220px;border-radius:0.5rem;border:1px solid #e5e7eb;object-fit:contain;box-shadow:0 1px 2px rgba(0,0,0,.06);";

      const btn = document.createElement("button");
      btn.type = "button";
      btn.contentEditable = "false";
      btn.title = "Remove this image";
      btn.setAttribute("aria-label", "Remove this image");
      btn.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';
      btn.style.cssText = [
        "position:absolute",
        "top:6px",
        "right:6px",
        "z-index:50",
        "width:28px",
        "height:28px",
        "display:flex",
        "align-items:center",
        "justify-content:center",
        "border-radius:9999px",
        "border:2px solid #ffffff",
        "background:#dc2626",
        "color:#ffffff",
        "cursor:pointer",
        "box-shadow:0 4px 14px rgba(0,0,0,.28)",
        "padding:0",
        "line-height:0",
      ].join(";");

      const remove = (event) => {
        event.preventDefault();
        event.stopPropagation();
        const pos = typeof getPos === "function" ? getPos() : null;
        if (typeof pos !== "number") return;
        editor
          .chain()
          .focus()
          .deleteRange({ from: pos, to: pos + node.nodeSize })
          .run();
        toast.success("Image removed");
      };

      const stop = (event) => {
        event.preventDefault();
        event.stopPropagation();
      };
      btn.addEventListener("mousedown", stop);
      btn.addEventListener("pointerdown", stop);
      btn.addEventListener("click", remove);

      wrap.appendChild(img);
      wrap.appendChild(btn);
      outer.appendChild(wrap);

      return {
        dom: outer,
        // Keep custom ✕ UI; ProseMirror must not sync/replace our wrapper DOM.
        ignoreMutation: () => true,
        stopEvent: (event) => {
          if (btn.contains(event.target) || event.target === btn) return true;
          return false;
        },
        update: (updatedNode) => {
          if (updatedNode.type.name !== "image") return false;
          node = updatedNode;
          img.src = updatedNode.attrs.src || "";
          img.alt = updatedNode.attrs.alt || "";
          img.title = updatedNode.attrs.title || "";
          return true;
        },
        selectNode: () => {
          wrap.style.outline = "2px solid #27AE60";
          wrap.style.outlineOffset = "2px";
          wrap.style.borderRadius = "0.5rem";
        },
        deselectNode: () => {
          wrap.style.outline = "";
          wrap.style.outlineOffset = "";
        },
        destroy: () => {
          btn.removeEventListener("mousedown", stop);
          btn.removeEventListener("pointerdown", stop);
          btn.removeEventListener("click", remove);
        },
      };
    };
  },
});

const charColor = (count, limit) => {
  const pct = count / limit;
  if (pct >= 0.95) return "#ef4444";
  if (pct >= 0.80) return "#f59e0b";
  return "#27AE60";
};

/* ── Link modal ────────────────────────────────────────────── */
const LinkModal = ({ onConfirm, onCancel, initial }) => {
  const [url, setUrl] = useState(initial || "");
  return (
    <div className="absolute top-full left-0 mt-2 z-50 bg-white border-2 border-gray-200 rounded-2xl shadow-xl p-4 w-80">
      <p className="text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Insert Link</p>
      <input
        autoFocus
        className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-900
          outline-none focus:border-[#27AE60] focus:ring-4 focus:ring-[#27AE60]/10 placeholder:text-gray-400 mb-3"
        placeholder="https://example.com"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") onConfirm(url); if (e.key === "Escape") onCancel(); }}
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onConfirm(url)}
          className="flex-1 py-2 rounded-xl text-white text-xs font-black transition-all hover:opacity-90"
          style={{ background: "linear-gradient(135deg,#27AE60,#1e8449)" }}
        >
          Apply
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2 rounded-xl border-2 border-gray-200 text-gray-600 text-xs font-black hover:bg-gray-50 transition-all"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

/* ── Main Component ────────────────────────────────────────── */
const CHAR_LIMIT = 20000;

const TiptapEditor = ({
  value,
  onChange,
  placeholder = "Start writing your property description here...",
  /** Shown under toolbar — e.g. blog content image size guidance */
  imageHint = "",
  /** Max in-editor image upload size in bytes (default 1 MB) */
  maxImageBytes = 1024 * 1024,
  /** async (file) => imageUrl — required for working uploads in admin dashboard */
  uploadImage = null,
}) => {
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showTableMenu, setShowTableMenu] = useState(false);
  const [showColorMenu, setShowColorMenu] = useState(false);
  const [showHighlightMenu, setShowHighlightMenu] = useState(false);
  const [showSizeMenu, setShowSizeMenu] = useState(false);
  const [showFontMenu, setShowFontMenu] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [, setSelectionTick] = useState(0);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      TextStyleKit,
      Typography,
      Underline,
      Highlight.configure({
        multicolor: true,
      }),
      Subscript,
      Superscript,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-[#27AE60] underline" },
      }),
      BlogImage.configure({
        allowBase64: false,
        HTMLAttributes: { class: "blog-editor-image" },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right", "justify"],
      }),
      TableKit.configure({
        table: {
          resizable: true,
          allowTableNodeSelection: true,
          HTMLAttributes: {
            class: "blog-editor-table",
          },
        },
      }),
      Placeholder.configure({ placeholder }),
      CharacterCount.configure({ limit: CHAR_LIMIT }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
      const text = editor.getText();
      setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
    },
    onSelectionUpdate: () => {
      setSelectionTick((n) => n + 1);
    },
    editorProps: {
      attributes: {
        class: "outline-none",
      },
      transformPastedHTML(html) {
        if (!html) return html;
        return String(html)
          .replace(/<!--\[if[\s\S]*?<!\[endif\]-->/gi, "")
          .replace(/<!--[\s\S]*?-->/g, "");
      },
    },
  });

  

  // Sync external value changes
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "", false);
    }
  }, [value, editor]);

  if (!editor)
    return (
      <div className="w-full border-2 border-gray-200 rounded-2xl bg-white animate-pulse">
        <div className="h-12 bg-gray-100 border-b border-gray-200 rounded-t-2xl" />
        <div className="h-48 p-5 space-y-3">
          <div className="h-3 bg-gray-100 rounded-full w-3/4" />
          <div className="h-3 bg-gray-100 rounded-full w-1/2" />
          <div className="h-3 bg-gray-100 rounded-full w-5/6" />
        </div>
      </div>
    );

  const chars = editor.storage.characterCount.characters();
  const remaining = CHAR_LIMIT - chars;
  const pct = Math.min(100, (chars / CHAR_LIMIT) * 100);

  const handleLinkConfirm = (url) => {
    setShowLinkModal(false);
    if (!url.trim()) return;
    editor.chain().focus().setLink({ href: url.trim() }).run();
  };

  const handleImageUpload = async (e, { replace = false } = {}) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length || !editor) return;
    if (typeof uploadImage !== "function") {
      toast.error("Image upload is not configured for this editor.");
      return;
    }

    const shouldReplace = replace && editor.isActive("image") && files.length === 1;
    setUploadingImage(true);
    const toastId = toast.loading(
      shouldReplace
        ? "Replacing image…"
        : files.length > 1
          ? `Uploading ${files.length} images…`
          : "Uploading image…",
    );

    let uploaded = 0;
    try {
      for (const file of files) {
        if (!String(file.type || "").startsWith("image/")) {
          toast.error(`${file.name || "File"}: only image files are allowed.`);
          continue;
        }
        if (file.size > maxImageBytes) {
          toast.error(
            `${file.name || "Image"} must be under ${(maxImageBytes / (1024 * 1024)).toFixed(0)} MB.`,
          );
          continue;
        }

        const imageUrl = await uploadImage(file);
        if (!imageUrl || typeof imageUrl !== "string") {
          throw new Error("No image URL returned");
        }

        if (shouldReplace && uploaded === 0) {
          editor.chain().focus().setImage({ src: imageUrl }).run();
        } else if (editor.isActive("image")) {
          // Keep existing image; insert the new one after it (unlimited images).
          const insertPos = editor.state.selection.to;
          editor
            .chain()
            .focus()
            .insertContentAt(insertPos, [
              { type: "image", attrs: { src: imageUrl } },
              { type: "paragraph" },
            ])
            .run();
        } else {
          editor
            .chain()
            .focus()
            .setImage({ src: imageUrl })
            .createParagraphNear()
            .run();
        }
        uploaded += 1;
      }

      if (!uploaded) {
        toast.error("No images uploaded.", { id: toastId });
      } else if (shouldReplace) {
        toast.success("Image replaced", { id: toastId });
      } else {
        toast.success(
          uploaded === 1 ? "Image added" : `${uploaded} images added`,
          { id: toastId },
        );
      }
    } catch (err) {
      toast.error(err?.message || "Image upload failed.", { id: toastId });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    if (!editor || !editor.isActive("image")) return;
    editor.chain().focus().deleteSelection().run();
    toast.success("Image removed");
  };

  return (
    <div className="w-full overflow-visible rounded-2xl border-2 border-gray-200 bg-white shadow-sm">
      {/* ── Toolbar ── */}
      <div className="px-3 py-2.5 border-b border-gray-100 bg-gray-50">
        {/* Row 1: History + Formatting + Headings */}
        <div className="flex flex-wrap items-center gap-0.5 mb-1">
          {/* History */}
          <ToolBtn
            title="Undo (Ctrl+Z)"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
          >
            <Undo size={16} />
          </ToolBtn>
          <ToolBtn
            title="Redo (Ctrl+Y)"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
          >
            <Redo size={16} />
          </ToolBtn>

          <Divider />

          {/* Text formatting */}
          <ToolBtn
            title="Bold (Ctrl+B)"
            active={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            {" "}
            <Bold size={16} />
          </ToolBtn>
          <ToolBtn
            title="Italic (Ctrl+I)"
            active={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            {" "}
            <Italic size={16} />
          </ToolBtn>
          <ToolBtn
            title="Underline (Ctrl+U)"
            active={editor.isActive("underline")}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            {" "}
            <UnderlineIcon size={16} />
          </ToolBtn>
          <ToolBtn
            title="Strikethrough"
            active={editor.isActive("strike")}
            onClick={() => editor.chain().focus().toggleStrike().run()}
          >
            <Strikethrough size={16} />
          </ToolBtn>

          {/* Font family */}
          <div className="relative">
            <ToolBtn
              title="Font"
              active={Boolean(editor.getAttributes("textStyle")?.fontFamily)}
              onClick={() => {
                setShowFontMenu((v) => !v);
                setShowSizeMenu(false);
                setShowColorMenu(false);
                setShowHighlightMenu(false);
              }}
            >
              <span className="inline-flex items-center gap-0.5">
                <CaseSensitive size={16} />
                <ChevronDown size={11} />
              </span>
            </ToolBtn>
            {showFontMenu ? (
              <div className="absolute top-full left-0 z-50 mt-2 max-h-56 w-44 overflow-auto rounded-2xl border-2 border-gray-200 bg-white py-1 shadow-xl">
                {FONT_FAMILIES.map((f) => (
                  <button
                    key={f.label}
                    type="button"
                    className="block w-full px-3 py-1.5 text-left text-xs font-semibold text-gray-700 hover:bg-emerald-50"
                    style={{ fontFamily: f.value || "inherit" }}
                    onClick={() => {
                      if (!f.value) editor.chain().focus().unsetFontFamily().run();
                      else editor.chain().focus().setFontFamily(f.value).run();
                      setShowFontMenu(false);
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          {/* Font size */}
          <div className="relative">
            <ToolBtn
              title="Text size"
              active={Boolean(editor.getAttributes("textStyle")?.fontSize)}
              onClick={() => {
                setShowSizeMenu((v) => !v);
                setShowFontMenu(false);
                setShowColorMenu(false);
                setShowHighlightMenu(false);
              }}
            >
              <span className="inline-flex items-center gap-0.5 px-0.5 text-[11px] font-black">
                {String(editor.getAttributes("textStyle")?.fontSize || "Size").replace("px", "")}
                <ChevronDown size={11} />
              </span>
            </ToolBtn>
            {showSizeMenu ? (
              <div className="absolute top-full left-0 z-50 mt-2 max-h-56 w-28 overflow-auto rounded-2xl border-2 border-gray-200 bg-white py-1 shadow-xl">
                {FONT_SIZES.map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    className="block w-full px-3 py-1.5 text-left text-xs font-semibold text-gray-700 hover:bg-emerald-50"
                    onClick={() => {
                      if (!s.value) editor.chain().focus().unsetFontSize().run();
                      else editor.chain().focus().setFontSize(s.value).run();
                      setShowSizeMenu(false);
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          {/* Text color */}
          <div className="relative">
            <ToolBtn
              title="Text color"
              active={Boolean(editor.getAttributes("textStyle")?.color)}
              onClick={() => {
                setShowColorMenu((v) => !v);
                setShowHighlightMenu(false);
                setShowSizeMenu(false);
                setShowFontMenu(false);
              }}
            >
              <span className="relative inline-flex flex-col items-center">
                <Baseline size={16} />
                <span
                  className="mt-0.5 h-1 w-4 rounded-sm"
                  style={{
                    background:
                      editor.getAttributes("textStyle")?.color || "#111827",
                  }}
                />
              </span>
            </ToolBtn>
            <ColorPaletteMenu
              open={showColorMenu}
              title="Text color"
              colors={TEXT_COLORS}
              activeValue={editor.getAttributes("textStyle")?.color || ""}
              onClose={() => setShowColorMenu(false)}
              onPick={(value) => {
                if (!value) editor.chain().focus().unsetColor().run();
                else editor.chain().focus().setColor(value).run();
              }}
            />
          </div>

          {/* Highlight color */}
          <div className="relative">
            <ToolBtn
              title="Highlight color"
              active={editor.isActive("highlight")}
              onClick={() => {
                setShowHighlightMenu((v) => !v);
                setShowColorMenu(false);
                setShowSizeMenu(false);
                setShowFontMenu(false);
              }}
            >
              <span className="relative inline-flex flex-col items-center">
                <Highlighter size={16} />
                <span
                  className="mt-0.5 h-1 w-4 rounded-sm border border-gray-200"
                  style={{
                    background:
                      editor.getAttributes("highlight")?.color || "#fef08a",
                  }}
                />
              </span>
            </ToolBtn>
            <ColorPaletteMenu
              open={showHighlightMenu}
              title="Highlight color"
              colors={HIGHLIGHT_COLORS}
              activeValue={editor.getAttributes("highlight")?.color || ""}
              onClose={() => setShowHighlightMenu(false)}
              onPick={(value) => {
                if (!value) editor.chain().focus().unsetHighlight().run();
                else editor.chain().focus().setHighlight({ color: value }).run();
              }}
            />
          </div>

          <ToolBtn
            title="Clear formatting"
            onClick={() =>
              editor
                .chain()
                .focus()
                .unsetAllMarks()
                .unsetColor()
                .unsetHighlight()
                .unsetFontSize()
                .unsetFontFamily()
                .clearNodes()
                .run()
            }
          >
            <Eraser size={16} />
          </ToolBtn>
          <ToolBtn
            title="Subscript"
            active={editor.isActive("subscript")}
            onClick={() => editor.chain().focus().toggleSubscript().run()}
          >
            {" "}
            <SubIcon size={16} />
          </ToolBtn>
          <ToolBtn
            title="Superscript"
            active={editor.isActive("superscript")}
            onClick={() => editor.chain().focus().toggleSuperscript().run()}
          >
            <SuperIcon size={16} />
          </ToolBtn>

          <Divider />

          {/* Headings */}
          <ToolBtn
            title="Heading 1"
            active={editor.isActive("heading", { level: 1 })}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
          >
            <Heading1 size={16} />
          </ToolBtn>
          <ToolBtn
            title="Heading 2"
            active={editor.isActive("heading", { level: 2 })}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
          >
            <Heading2 size={16} />
          </ToolBtn>
          <ToolBtn
            title="Heading 3"
            active={editor.isActive("heading", { level: 3 })}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
          >
            <Heading3 size={16} />
          </ToolBtn>
          <ToolBtn
            title="Paragraph"
            active={editor.isActive("paragraph") && !editor.isActive("heading")}
            onClick={() => editor.chain().focus().setParagraph().run()}
          >
            <Type size={16} />
          </ToolBtn>

          <Divider />

          {/* Lists */}
          <ToolBtn
            title="Bullet List"
            active={editor.isActive("bulletList")}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            {" "}
            <List size={16} />
          </ToolBtn>
          <ToolBtn
            title="Ordered List"
            active={editor.isActive("orderedList")}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            {" "}
            <ListOrdered size={16} />
          </ToolBtn>
          <ToolBtn
            title="Quote"
            active={editor.isActive("blockquote")}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          >
            <Quote size={16} />
          </ToolBtn>
          <ToolBtn
            title="Horizontal line"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
          >
            <SeparatorHorizontal size={16} />
          </ToolBtn>

          <Divider />

          {/* Tables — size picker + paste; advanced edit bar when inside table */}
          <div className="relative">
            <ToolBtn
              title="Insert table"
              active={editor.isActive("table") || showTableMenu}
              onClick={() => setShowTableMenu((v) => !v)}
            >
              <span className="inline-flex items-center gap-0.5">
                <TableIcon size={16} />
                <ChevronDown size={12} />
              </span>
            </ToolBtn>
            <InsertTableMenu
              editor={editor}
              open={showTableMenu}
              onClose={() => setShowTableMenu(false)}
            />
          </div>

          <Divider />

          {/* Alignment */}
          <ToolBtn
            title="Align Left"
            active={editor.isActive({ textAlign: "left" })}
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
          >
            {" "}
            <AlignLeft size={16} />
          </ToolBtn>
          <ToolBtn
            title="Align Center"
            active={editor.isActive({ textAlign: "center" })}
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
          >
            {" "}
            <AlignCenter size={16} />
          </ToolBtn>
          <ToolBtn
            title="Align Right"
            active={editor.isActive({ textAlign: "right" })}
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
          >
            {" "}
            <AlignRight size={16} />
          </ToolBtn>
          <ToolBtn
            title="Justify"
            active={editor.isActive({ textAlign: "justify" })}
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          >
            <AlignJustify size={16} />
          </ToolBtn>

          <Divider />

          {/* Link */}
          <div className="relative">
            <ToolBtn
              title="Insert Link"
              active={editor.isActive("link")}
              onClick={() => setShowLinkModal((v) => !v)}
            >
              <LinkIcon size={16} />
            </ToolBtn>
            {showLinkModal && (
              <LinkModal
                initial={editor.getAttributes("link").href || ""}
                onConfirm={handleLinkConfirm}
                onCancel={() => setShowLinkModal(false)}
              />
            )}
          </div>
          <ToolBtn
            title="Remove Link"
            onClick={() => editor.chain().focus().unsetLink().run()}
            disabled={!editor.isActive("link")}
          >
            <Unlink size={16} />
          </ToolBtn>

          {/* Image: add any number · replace selected · remove selected */}
          <label
            className={`
            relative p-2 rounded-lg transition-all duration-150 flex items-center justify-center
            ${
              uploadingImage || typeof uploadImage !== "function"
                ? "cursor-not-allowed opacity-40"
                : "cursor-pointer text-gray-500 hover:text-gray-900 hover:bg-gray-100"
            }
          `}
            title="Add image(s) — any number in this post"
          >
            <ImageIcon size={16} />
            <input
              type="file"
              hidden
              multiple
              accept="image/png,image/jpeg,image/jpg,image/webp"
              disabled={uploadingImage || typeof uploadImage !== "function"}
              onChange={(e) => handleImageUpload(e, { replace: false })}
            />
          </label>
          <label
            className={`
            relative p-2 rounded-lg transition-all duration-150 flex items-center justify-center
            ${
              uploadingImage ||
              typeof uploadImage !== "function" ||
              !editor.isActive("image")
                ? "cursor-not-allowed opacity-40"
                : "cursor-pointer text-gray-500 hover:text-gray-900 hover:bg-gray-100"
            }
          `}
            title="Replace selected image"
          >
            <RefreshCw size={16} />
            <input
              type="file"
              hidden
              accept="image/png,image/jpeg,image/jpg,image/webp"
              disabled={
                uploadingImage ||
                typeof uploadImage !== "function" ||
                !editor.isActive("image")
              }
              onChange={(e) => handleImageUpload(e, { replace: true })}
            />
          </label>
          <ToolBtn
            title="Remove selected image"
            onClick={handleRemoveImage}
            disabled={!editor.isActive("image")}
          >
            <Trash2 size={16} />
          </ToolBtn>
        </div>

        <AdvancedTableBar editor={editor} />

        {imageHint ? (
          <p className="mt-1.5 px-1 text-[10px] font-medium leading-snug text-emerald-700">
            Image tip: {imageHint}. Tables: open the table button to pick size,
            or paste from Docs/Excel. Click inside a table for advanced row /
            column / merge tools.
          </p>
        ) : (
          <p className="mt-1.5 px-1 text-[10px] font-medium leading-snug text-gray-400">
            Insert or paste tables · edit rows/columns/merge when selected ·
            text color, highlight colors, font size &amp; family, bold, lists
            &amp; images all supported.
          </p>
        )}
      </div>

      {/* ── Editor body ── */}
      <EditorContent
        editor={editor}
        className="px-5 py-4 min-h-[220px] overflow-visible text-gray-800 text-sm leading-relaxed
          [&_.ProseMirror]:outline-none [&_.ProseMirror]:overflow-visible [&_.ProseMirror]:min-h-[180px]
          [&_.blog-image-node]:relative [&_.blog-image-node]:z-10
          [&_.ProseMirror_h1]:text-2xl [&_.ProseMirror_h1]:font-black [&_.ProseMirror_h1]:text-gray-900 [&_.ProseMirror_h1]:mb-2 [&_.ProseMirror_h1]:mt-4
          [&_.ProseMirror_h2]:text-xl  [&_.ProseMirror_h2]:font-black [&_.ProseMirror_h2]:text-gray-900 [&_.ProseMirror_h2]:mb-2 [&_.ProseMirror_h2]:mt-3
          [&_.ProseMirror_h3]:text-lg  [&_.ProseMirror_h3]:font-bold  [&_.ProseMirror_h3]:text-gray-900 [&_.ProseMirror_h3]:mb-1 [&_.ProseMirror_h3]:mt-3
          [&_.ProseMirror_p]:mb-2 [&_.ProseMirror_p]:text-gray-700
          [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-5 [&_.ProseMirror_ul]:mb-2 [&_.ProseMirror_ul_li]:mb-1
          [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-5 [&_.ProseMirror_ol]:mb-2 [&_.ProseMirror_ol_li]:mb-1
          [&_.ProseMirror_blockquote]:border-l-4 [&_.ProseMirror_blockquote]:border-[#27AE60] [&_.ProseMirror_blockquote]:pl-4 [&_.ProseMirror_blockquote]:text-gray-500 [&_.ProseMirror_blockquote]:italic [&_.ProseMirror_blockquote]:my-3
          [&_.ProseMirror_a]:text-[#27AE60] [&_.ProseMirror_a]:underline [&_.ProseMirror_a]:font-semibold
          [&_.ProseMirror_mark]:rounded [&_.ProseMirror_mark]:px-0.5
          [&_.ProseMirror_span]:leading-inherit
          [&_.ProseMirror_hr]:my-4 [&_.ProseMirror_hr]:border-gray-200
          [&_.ProseMirror_strong]:font-bold [&_.ProseMirror_strong]:text-gray-900
          [&_.ProseMirror_s]:line-through
          [&_.ProseMirror_.tableWrapper]:my-4 [&_.ProseMirror_.tableWrapper]:w-full [&_.ProseMirror_.tableWrapper]:overflow-x-auto
          [&_.ProseMirror_table]:w-full [&_.ProseMirror_table]:border-collapse [&_.ProseMirror_table]:table-fixed
          [&_.ProseMirror_td]:border [&_.ProseMirror_td]:border-gray-300 [&_.ProseMirror_td]:bg-gray-50 [&_.ProseMirror_td]:px-2 [&_.ProseMirror_td]:py-1.5 [&_.ProseMirror_td]:align-top [&_.ProseMirror_td]:min-w-[80px]
          [&_.ProseMirror_th]:border [&_.ProseMirror_th]:border-gray-400 [&_.ProseMirror_th]:bg-gray-200 [&_.ProseMirror_th]:px-2 [&_.ProseMirror_th]:py-1.5 [&_.ProseMirror_th]:font-bold [&_.ProseMirror_th]:text-gray-900 [&_.ProseMirror_th]:text-center
          [&_.ProseMirror_td.selectedCell]:bg-emerald-50 [&_.ProseMirror_th.selectedCell]:bg-emerald-100
          [&_.ProseMirror_.column-resize-handle]:absolute [&_.ProseMirror_.column-resize-handle]:top-0 [&_.ProseMirror_.column-resize-handle]:right-[-2px] [&_.ProseMirror_.column-resize-handle]:bottom-0 [&_.ProseMirror_.column-resize-handle]:w-1 [&_.ProseMirror_.column-resize-handle]:bg-emerald-400 [&_.ProseMirror_.column-resize-handle]:pointer-events-none
          [&_.ProseMirror.resize-cursor]:cursor-col-resize
          [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-gray-400 [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0
        "
      />

      {/* ── Footer: char count + progress bar ── */}
      <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
        {/* Progress bar */}
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mb-2">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${pct}%`,
              background:
                pct >= 95
                  ? "#ef4444"
                  : pct >= 80
                    ? "#f59e0b"
                    : "linear-gradient(90deg,#27AE60,#2ecc71)",
            }}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-gray-500">
              <span
                className="font-black"
                style={{ color: charColor(chars, CHAR_LIMIT) }}
              >
                {chars}
              </span>
              <span className="text-gray-400">
                {" "}
                / {CHAR_LIMIT.toLocaleString()} chars
              </span>
            </span>
            <span className="text-xs font-bold text-gray-500">
              <span className="font-black text-gray-700">{wordCount}</span>
              <span className="text-gray-400"> words</span>
            </span>
          </div>

          {remaining <= 200 && (
            <span
              className="text-xs font-black px-2.5 py-1 rounded-lg"
              style={{
                background: remaining <= 50 ? "#fef2f2" : "#fffbeb",
                color: remaining <= 50 ? "#ef4444" : "#d97706",
              }}
            >
              {remaining} chars remaining
            </span>
          )}
        </div>
      </div>
    </div>
  );
};;

export default TiptapEditor;
