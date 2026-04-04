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
import { useEffect, useState } from "react";

import {
  Bold, Italic, Underline as UnderlineIcon,
  List, ListOrdered,
  Heading1, Heading2, Heading3,
  AlignLeft, AlignCenter, AlignRight,
  Link as LinkIcon, Unlink,
  Image as ImageIcon,
  Undo, Redo,
  Highlighter,
  Subscript as SubIcon,
  Superscript as SuperIcon,
  Type,
} from "lucide-react";

/* ── Toolbar button styles ─────────────────────────────────── */
const ToolBtn = ({ onClick, active, title, children, disabled }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`
      relative p-2 rounded-lg transition-all duration-150 flex items-center justify-center
      disabled:opacity-30 disabled:cursor-not-allowed
      ${active
        ? "text-white shadow-sm"
        : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
      }
    `}
    style={active ? { background: "linear-gradient(135deg,#27AE60,#1e8449)" } : {}}
  >
    {children}
  </button>
);

const Divider = () => (
  <div className="w-px h-6 bg-gray-200 mx-1 self-center flex-shrink-0" />
);

/* ── Character count color ─────────────────────────────────── */
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
const CHAR_LIMIT = 5000;

const TiptapEditor = ({ value, onChange }) => {
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Highlight.configure({ multicolor: false }),
      Subscript,
      Superscript,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-[#27AE60] underline" },
      }),
      Image.configure({
        HTMLAttributes: { class: "rounded-xl max-w-full my-2" },
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({
        placeholder: "Start writing your property description here…",
      }),
      CharacterCount.configure({ limit: CHAR_LIMIT }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
      // word count
      const text = editor.getText();
      setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
    },
    editorProps: {
      attributes: {
        class: "outline-none",
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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      editor.chain().focus().setImage({ src: data.imageUrl }).run();
    } catch {
      alert("Image upload failed.");
    }
  };

  return (
    <div className="w-full border-2 border-gray-200 rounded-2xl bg-white overflow-hidden shadow-sm">
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
            title="Highlight"
            active={editor.isActive("highlight")}
            onClick={() => editor.chain().focus().toggleHighlight().run()}
          >
            {" "}
            <Highlighter size={16} />
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

          {/* Image upload */}
          <label
            className={`
            relative p-2 rounded-lg transition-all duration-150 flex items-center justify-center cursor-pointer
            text-gray-500 hover:text-gray-900 hover:bg-gray-100
          `}
            title="Insert Image"
          >
            <ImageIcon size={16} />
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handleImageUpload}
            />
          </label>
        </div>
      </div>

      {/* ── Editor body ── */}
      <EditorContent
        editor={editor}
        className="px-5 py-4 min-h-[220px] text-gray-800 text-sm leading-relaxed
          [&_.ProseMirror]:outline-none
          [&_.ProseMirror_h1]:text-2xl [&_.ProseMirror_h1]:font-black [&_.ProseMirror_h1]:text-gray-900 [&_.ProseMirror_h1]:mb-2 [&_.ProseMirror_h1]:mt-4
          [&_.ProseMirror_h2]:text-xl  [&_.ProseMirror_h2]:font-black [&_.ProseMirror_h2]:text-gray-900 [&_.ProseMirror_h2]:mb-2 [&_.ProseMirror_h2]:mt-3
          [&_.ProseMirror_h3]:text-lg  [&_.ProseMirror_h3]:font-bold  [&_.ProseMirror_h3]:text-gray-900 [&_.ProseMirror_h3]:mb-1 [&_.ProseMirror_h3]:mt-3
          [&_.ProseMirror_p]:mb-2 [&_.ProseMirror_p]:text-gray-700
          [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-5 [&_.ProseMirror_ul]:mb-2 [&_.ProseMirror_ul_li]:mb-1
          [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-5 [&_.ProseMirror_ol]:mb-2 [&_.ProseMirror_ol_li]:mb-1
          [&_.ProseMirror_blockquote]:border-l-4 [&_.ProseMirror_blockquote]:border-[#27AE60] [&_.ProseMirror_blockquote]:pl-4 [&_.ProseMirror_blockquote]:text-gray-500 [&_.ProseMirror_blockquote]:italic [&_.ProseMirror_blockquote]:my-3
          [&_.ProseMirror_a]:text-[#27AE60] [&_.ProseMirror_a]:underline [&_.ProseMirror_a]:font-semibold
          [&_.ProseMirror_mark]:bg-yellow-200 [&_.ProseMirror_mark]:rounded [&_.ProseMirror_mark]:px-0.5
          [&_.ProseMirror_img]:rounded-xl [&_.ProseMirror_img]:max-w-full [&_.ProseMirror_img]:my-2 [&_.ProseMirror_img]:shadow-sm
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
