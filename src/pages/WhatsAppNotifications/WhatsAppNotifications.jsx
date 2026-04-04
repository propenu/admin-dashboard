// src/pages/WhatsAppNotifications/WhatsUpNotifications.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import {
  MessageSquare,
  Plus,
  X,
  Search,
  Trash2,
  Edit2,
  AlertCircle,
  Loader2,
  ChevronDown,
  PlusCircle,
  MinusCircle,
  Info,
  Globe,
  Hash,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Link2,
  Phone as PhoneIcon,
  Upload,
  Image as ImageIcon,
  Video,
  FileType,
  RefreshCw,
} from "lucide-react";
import { toast } from "react-hot-toast";
import {
  getAllWhatsAppNotifications,
  getWhatsAppNotificationByName,
  createWhatsAppNotification,
  deleteWhatsAppNotificationByName,
} from "../../features/user/userService";

// ─── constants ────────────────────────────────────────────────────────────────
const CATEGORIES = ["UTILITY", "MARKETING", "AUTHENTICATION"];
const HEADER_FORMATS = ["TEXT", "IMAGE", "VIDEO", "DOCUMENT"];
const BUTTON_TYPES = ["QUICK_REPLY", "URL", "PHONE_NUMBER"];
const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "en_US", label: "English (US)" },
  { code: "hi", label: "Hindi" },
  { code: "te", label: "Telugu" },
  { code: "ta", label: "Tamil" },
  { code: "kn", label: "Kannada" },
  { code: "ml", label: "Malayalam" },
  { code: "mr", label: "Marathi" },
  { code: "gu", label: "Gujarati" },
  { code: "bn", label: "Bengali" },
  { code: "ur", label: "Urdu" },
];
const STATUS_META = {
  APPROVED: {
    label: "Approved",
    color: "bg-green-50 text-green-700 border-green-200",
    icon: <CheckCircle2 size={11} />,
  },
  REJECTED: {
    label: "Rejected",
    color: "bg-red-50 text-red-600 border-red-200",
    icon: <XCircle size={11} />,
  },
  PENDING: {
    label: "Pending",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    icon: <Clock size={11} />,
  },
  PAUSED: {
    label: "Paused",
    color: "bg-gray-100 text-gray-500 border-gray-200",
    icon: <AlertCircle size={11} />,
  },
};
const CAT_COLOR = {
  UTILITY: "bg-blue-50 text-blue-700 border-blue-200",
  MARKETING: "bg-purple-50 text-purple-700 border-purple-200",
  AUTHENTICATION: "bg-amber-50 text-amber-700 border-amber-200",
};
const MEDIA_ACCEPT = {
  IMAGE: "image/jpeg,image/png,image/webp",
  VIDEO: "video/mp4,video/3gpp",
  DOCUMENT: "application/pdf",
};
const MEDIA_ICON = {
  IMAGE: <ImageIcon size={20} />,
  VIDEO: <Video size={20} />,
  DOCUMENT: <FileType size={20} />,
};

const getStatusMeta = (s) => STATUS_META[s] || STATUS_META["PENDING"];

// ─── helpers ──────────────────────────────────────────────────────────────────
const formatDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

const applyVars = (text = "", examples = []) => {
  let r = text;
  examples.forEach((val, i) => {
    r = r.replace(
      new RegExp(`\\{\\{${i + 1}\\}\\}`, "g"),
      val || `{{${i + 1}}}`,
    );
  });
  return r;
};

const countVars = (text = "") => {
  const m = text.match(/\{\{\d+\}\}/g) || [];
  const n = m.map((x) => parseInt(x.replace(/[{}]/g, ""), 10));
  return n.length ? Math.max(...n) : 0;
};

// ── Parse actual GET response: { success, data: { data: { data: [...] } } } ──
const parseTemplateList = (res) => {
  const d = res?.data;
  // nested data.data.data (your actual API structure)
  if (Array.isArray(d?.data?.data)) return d.data.data;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.templates)) return d.templates;
  if (Array.isArray(d)) return d;
  return [];
};

// ── Build exact Meta API payload ──────────────────────────────────────────────
const buildPayload = (form) => {
  const components = [];

  // HEADER
  if (form.header.enabled) {
    const h = { type: "HEADER", format: form.header.format };
    if (form.header.format === "TEXT") {
      h.text = form.header.text;
    } else {
      // For media headers, pass the uploaded handle or a placeholder
      h.example = {
        header_handle: [form.header.mediaHandle || "UPLOAD_HANDLE_PLACEHOLDER"],
      };
    }
    components.push(h);
  }

  // BODY
  const varCount = countVars(form.body.text);
  const bodyComp = { type: "BODY", text: form.body.text };
  if (varCount > 0) {
    bodyComp.example = { body_text: [form.body.examples.slice(0, varCount)] };
  }
  components.push(bodyComp);

  // FOOTER
  if (form.footer.enabled && form.footer.text.trim()) {
    components.push({ type: "FOOTER", text: form.footer.text });
  }

  // BUTTONS
  if (form.buttons.length > 0) {
    components.push({
      type: "BUTTONS",
      buttons: form.buttons.map((b) => {
        const btn = { type: b.type, text: b.text };
        if (b.type === "URL") btn.url = b.url;
        if (b.type === "PHONE_NUMBER") btn.phone_number = b.phone;
        return btn;
      }),
    });
  }

  return {
    name: form.name,
    language: form.language,
    category: form.category,
    components,
  };
};

// ── Reconstruct internal form from API response ───────────────────────────────
const componentsToForm = (item) => {
  const bodyComp = item.components?.find((c) => c.type === "BODY") || {};
  const headerComp = item.components?.find((c) => c.type === "HEADER") || {};
  const footerComp = item.components?.find((c) => c.type === "FOOTER") || {};
  const btnComp = item.components?.find((c) => c.type === "BUTTONS") || {};
  return {
    _id: item._id || item.id,
    name: item.name || "",
    language: item.language || "en",
    category: item.category || "UTILITY",
    header: {
      enabled: !!item.components?.find((c) => c.type === "HEADER"),
      format: headerComp.format || "TEXT",
      text: headerComp.text || "",
      mediaHandle: headerComp.example?.header_handle?.[0] || "",
      mediaPreview: null,
    },
    body: {
      text: bodyComp.text || "",
      examples: bodyComp.example?.body_text?.[0] || [],
    },
    footer: {
      enabled: !!item.components?.find((c) => c.type === "FOOTER"),
      text: footerComp.text || "",
    },
    buttons: (btnComp.buttons || []).map((b) => ({
      type: b.type || "QUICK_REPLY",
      text: b.text || "",
      url: b.url || "",
      phone: b.phone_number || "",
    })),
  };
};

const EMPTY_FORM = {
  name: "",
  language: "en",
  category: "UTILITY",
  header: {
    enabled: false,
    format: "TEXT",
    text: "",
    mediaHandle: "",
    mediaPreview: null,
  },
  body: { text: "", examples: [] },
  footer: { enabled: false, text: "" },
  buttons: [],
};

// ════════════════════════════════════════════════════════════════════════════
// REUSABLE: TOGGLE
// ════════════════════════════════════════════════════════════════════════════
const Toggle = ({ on, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${on ? "bg-[#27AE60]" : "bg-gray-300"}`}
  >
    <span
      className={`absolute right-6 top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${on ? "translate-x-5" : "translate-x-0.5"}`}
    />
  </button>
);

// ════════════════════════════════════════════════════════════════════════════
// MEDIA UPLOAD ZONE — used inside HeaderSection for IMAGE/VIDEO/DOCUMENT
// ════════════════════════════════════════════════════════════════════════════
const MediaUploadZone = ({ format, header, onChange }) => {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(
    async (file) => {
      if (!file) return;

      // Validate size
      const maxMB = format === "VIDEO" ? 16 : format === "DOCUMENT" ? 100 : 5;
      if (file.size > maxMB * 1024 * 1024) {
        toast.error(`File too large. Max ${maxMB}MB for ${format}.`);
        return;
      }

      // Create local preview URL
      const previewUrl = URL.createObjectURL(file);

      // For now: store file name as "handle" and preview locally.
      // Your backend /notifications/whatsapp/media-upload endpoint should
      // accept the file, upload to Meta, and return the handle string.
      // Replace the block below with your actual upload API call:
      try {
        setUploading(true);

        // ── REPLACE THIS BLOCK with your actual media upload API ──────────────
        // const formData = new FormData();
        // formData.append("file", file);
        // formData.append("type", format);
        // const res = await apiClient.post(`${SERVICES.USER}/notifications/whatsapp/media-upload`, formData);
        // const handle = res.data.handle;  // e.g. "4:abc123..."
        // ─────────────────────────────────────────────────────────────────────

        // Temporary: use file name as placeholder handle (replace with real handle above)
        const handle = file.name;

        onChange({ ...header, mediaHandle: handle, mediaPreview: previewUrl });
        toast.success("Media ready — handle set.");
      } catch (err) {
        toast.error(err?.response?.data?.message || "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [format, header, onChange],
  );

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const clearMedia = () =>
    onChange({ ...header, mediaHandle: "", mediaPreview: null });

  return (
    <div className="flex flex-col gap-2">
      <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-0.5">
        {format} File
      </label>

      {/* If media already set → show preview */}
      {header.mediaPreview || header.mediaHandle ? (
        <div className="relative flex items-center gap-3 p-3 bg-[#E8F8EF] border border-[#C2EDD6] rounded-xl">
          <div className="w-10 h-10 rounded-lg bg-[#27AE60] flex items-center justify-center text-white flex-shrink-0">
            {MEDIA_ICON[format]}
          </div>
          <div className="flex-1 min-w-0">
            {format === "IMAGE" && header.mediaPreview && (
              <img
                src={header.mediaPreview}
                alt="preview"
                className="w-full max-h-24 object-cover rounded-lg mb-1"
              />
            )}
            {format === "VIDEO" && header.mediaPreview && (
              <video
                src={header.mediaPreview}
                className="w-full max-h-24 rounded-lg mb-1"
                controls
              />
            )}
            <p className="text-xs font-semibold text-[#1A7A43] truncate">
              {header.mediaHandle || "Media ready"}
            </p>
            <p className="text-[10px] text-[#27AE60]">{format} file loaded</p>
          </div>
          <button
            type="button"
            onClick={clearMedia}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-[#C2EDD6] text-red-400 hover:bg-red-50 hover:border-red-200 transition-colors flex-shrink-0"
          >
            <X size={13} />
          </button>
        </div>
      ) : (
        /* Drop zone */
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => fileRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-2 p-5 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
            dragOver
              ? "border-[#27AE60] bg-[#E8F8EF]"
              : "border-gray-300 bg-gray-50 hover:border-[#27AE60] hover:bg-[#E8F8EF]"
          }`}
        >
          {uploading ? (
            <Loader2 size={22} className="animate-spin text-[#27AE60]" />
          ) : (
            <Upload
              size={22}
              className={dragOver ? "text-[#27AE60]" : "text-gray-400"}
            />
          )}
          <div className="text-center">
            <p
              className={`text-xs font-semibold ${dragOver ? "text-[#27AE60]" : "text-gray-500"}`}
            >
              {uploading
                ? "Uploading…"
                : `Drop ${format.toLowerCase()} here or click to browse`}
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">
              {format === "IMAGE" && "JPEG, PNG, WEBP · max 5MB"}
              {format === "VIDEO" && "MP4, 3GPP · max 16MB"}
              {format === "DOCUMENT" && "PDF · max 100MB"}
            </p>
          </div>
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept={MEDIA_ACCEPT[format]}
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {/* Manual handle input */}
      <div>
        <label className="block text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-1">
          Or paste Meta media handle directly
        </label>
        <input
          className="w-full px-3 py-2 text-xs font-mono border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#27AE60] placeholder-gray-300"
          placeholder="e.g. 4:abc123def456..."
          value={header.mediaHandle || ""}
          onChange={(e) => onChange({ ...header, mediaHandle: e.target.value })}
        />
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
// SECTION 1 — HEADER
// ════════════════════════════════════════════════════════════════════════════
const HeaderSection = ({ header, onChange }) => (
  <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
      <div className="flex items-center gap-3">
        <span className="w-6 h-6 rounded-full bg-[#27AE60] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
          1
        </span>
        <div>
          <p className="text-sm font-semibold text-gray-800">
            Header{" "}
            <span className="text-xs text-gray-400 font-normal ml-1">
              · Optional
            </span>
          </p>
          <p className="text-xs text-gray-400">Top section of the template</p>
        </div>
      </div>
      <Toggle
        on={header.enabled}
        onToggle={() => onChange({ ...header, enabled: !header.enabled })}
      />
    </div>

    {header.enabled && (
      <div className="p-4 flex flex-col gap-3">
        {/* Format selector */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1.5">
            Format
          </label>
          <div className="grid grid-cols-4 gap-2">
            {HEADER_FORMATS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() =>
                  onChange({
                    ...header,
                    format: f,
                    text: "",
                    mediaHandle: "",
                    mediaPreview: null,
                  })
                }
                className={`py-2 text-xs font-bold rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                  header.format === f
                    ? "border-[#27AE60] bg-[#E8F8EF] text-[#1A7A43]"
                    : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                }`}
              >
                {f === "TEXT" && <FileText size={14} />}
                {f === "IMAGE" && <ImageIcon size={14} />}
                {f === "VIDEO" && <Video size={14} />}
                {f === "DOCUMENT" && <FileType size={14} />}
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* TEXT */}
        {header.format === "TEXT" && (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1.5">
              Header Text
            </label>
            <input
              maxLength={60}
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#27AE60] focus:border-transparent placeholder-gray-300"
              placeholder="e.g. Inquiry Submitted"
              value={header.text}
              onChange={(e) => onChange({ ...header, text: e.target.value })}
            />
            <p className="text-[10px] text-gray-400 mt-1 text-right">
              {header.text.length}/60
            </p>
          </div>
        )}

        {/* IMAGE / VIDEO / DOCUMENT */}
        {["IMAGE", "VIDEO", "DOCUMENT"].includes(header.format) && (
          <MediaUploadZone
            format={header.format}
            header={header}
            onChange={onChange}
          />
        )}
      </div>
    )}
  </div>
);

// ════════════════════════════════════════════════════════════════════════════
// SECTION 2 — BODY
// ════════════════════════════════════════════════════════════════════════════
const BodySection = ({ body, onChange }) => {
  const textareaRef = useRef(null);
  const varCount = countVars(body.text);

  const syncExamples = (text, examples) => {
    const n = countVars(text);
    return Array.from({ length: n }, (_, i) => examples[i] || "");
  };

  const handleTextChange = (val) =>
    onChange({
      ...body,
      text: val,
      examples: syncExamples(val, body.examples),
    });

  const insertToken = (n) => {
    const el = textareaRef.current;
    if (!el) return;
    const pos = el.selectionStart ?? body.text.length;
    const token = `{{${n}}}`;
    handleTextChange(body.text.slice(0, pos) + token + body.text.slice(pos));
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(pos + token.length, pos + token.length);
    }, 0);
  };

  const updateExample = (i, val) => {
    const next = [...body.examples];
    next[i] = val;
    onChange({ ...body, examples: next });
  };

  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-gray-50">
        <span className="w-6 h-6 rounded-full bg-[#27AE60] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
          2
        </span>
        <div>
          <p className="text-sm font-semibold text-gray-800">
            Body <span className="text-red-400">*</span>
          </p>
          <p className="text-xs text-gray-400">
            Main message — use {"{{1}}"}, {"{{2}}"}… for dynamic values
          </p>
        </div>
      </div>
      <div className="p-4 flex flex-col gap-3">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Message Body
            </label>
            <span className="text-[10px] text-gray-400">
              {body.text.length}/1024
            </span>
          </div>
          <textarea
            ref={textareaRef}
            required
            rows={6}
            maxLength={1024}
            className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#27AE60] focus:border-transparent placeholder-gray-300 resize-none font-mono leading-relaxed"
            placeholder={
              "Hello {{1}},\n\nYour inquiry for *{{2}}* has been submitted.\n\nReference ID: {{3}}."
            }
            value={body.text}
            onChange={(e) => handleTextChange(e.target.value)}
          />
        </div>

        {/* Variable insert pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-gray-400">
            Insert variable:
          </span>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => insertToken(n)}
              className="font-mono text-xs px-2.5 py-1 rounded-lg bg-[#E8F8EF] border border-[#C2EDD6] text-[#27AE60] hover:bg-[#C2EDD6] transition-colors"
            >{`{{${n}}}`}</button>
          ))}
          <span className="text-[10px] text-gray-400">
            click to insert at cursor
          </span>
        </div>

        {/* Formatting tips */}
        <div className="flex items-center gap-4 text-[10px] text-gray-400 flex-wrap">
          <span>
            *text* → <strong>bold</strong>
          </span>
          <span>
            _text_ → <em>italic</em>
          </span>
          <span>
            ~text~ → <s>strikethrough</s>
          </span>
        </div>

        {/* Variable samples table — exact Meta format */}
        {varCount > 0 && (
          <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                Variable Samples
              </p>
              <div className="flex-1 h-px bg-gray-100" />
            </div>
            <p className="text-xs text-gray-400">
              Required by Meta for template review. Don't use real customer
              data.
            </p>
            <div className="flex items-center gap-3 px-1 mb-0.5">
              <div className="w-14 text-[10px] font-bold uppercase tracking-wider text-gray-400 text-center">
                Token
              </div>
              <div className="flex-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Sample value
              </div>
            </div>
            {Array.from({ length: varCount }, (_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-14 h-9 flex items-center justify-center bg-white border border-gray-300 rounded-lg font-mono text-xs font-semibold text-gray-600 flex-shrink-0 select-none">
                  {`{{${i + 1}}}`}
                </div>
                <input
                  className="flex-1 h-9 px-3 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#27AE60] focus:border-transparent placeholder-gray-300"
                  placeholder={`Sample for {{${i + 1}}}`}
                  value={body.examples[i] || ""}
                  onChange={(e) => updateExample(i, e.target.value)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
// SECTION 3 — FOOTER
// ════════════════════════════════════════════════════════════════════════════
const FooterSection = ({ footer, onChange }) => (
  <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
      <div className="flex items-center gap-3">
        <span className="w-6 h-6 rounded-full bg-[#27AE60] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
          3
        </span>
        <div>
          <p className="text-sm font-semibold text-gray-800">
            Footer{" "}
            <span className="text-xs text-gray-400 font-normal ml-1">
              · Optional
            </span>
          </p>
          <p className="text-xs text-gray-400">
            Short text at the bottom (max 60 chars)
          </p>
        </div>
      </div>
      <Toggle
        on={footer.enabled}
        onToggle={() => onChange({ ...footer, enabled: !footer.enabled })}
      />
    </div>
    {footer.enabled && (
      <div className="p-4">
        <input
          maxLength={60}
          className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#27AE60] focus:border-transparent placeholder-gray-300"
          placeholder="e.g. Thank you for using Propenu."
          value={footer.text}
          onChange={(e) => onChange({ ...footer, text: e.target.value })}
        />
        <p className="text-[10px] text-gray-400 mt-1 text-right">
          {footer.text.length}/60
        </p>
      </div>
    )}
  </div>
);

// ════════════════════════════════════════════════════════════════════════════
// SECTION 4 — BUTTONS
// ════════════════════════════════════════════════════════════════════════════
const ButtonsSection = ({ buttons, onChange }) => {
  const addBtn = () => {
    if (buttons.length >= 3) {
      toast.error("Max 3 buttons");
      return;
    }
    onChange([
      ...buttons,
      { type: "QUICK_REPLY", text: "", url: "", phone: "" },
    ]);
  };
  const removeBtn = (i) => onChange(buttons.filter((_, idx) => idx !== i));
  const updateBtn = (i, patch) =>
    onChange(buttons.map((b, idx) => (idx === i ? { ...b, ...patch } : b)));

  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-gray-50">
        <span className="w-6 h-6 rounded-full bg-[#27AE60] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
          4
        </span>
        <div>
          <p className="text-sm font-semibold text-gray-800">
            Buttons{" "}
            <span className="text-xs text-gray-400 font-normal ml-1">
              · Optional, max 3
            </span>
          </p>
          <p className="text-xs text-gray-400">
            Quick Reply, URL or Phone Number
          </p>
        </div>
      </div>
      <div className="p-4 flex flex-col gap-3">
        {buttons.map((btn, i) => (
          <div
            key={i}
            className="flex flex-col gap-2 p-3 bg-gray-50 border border-gray-200 rounded-xl"
          >
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <select
                  className="w-full appearance-none px-3 py-2 text-xs font-semibold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#27AE60] bg-white cursor-pointer pr-7"
                  value={btn.type}
                  onChange={(e) => updateBtn(i, { type: e.target.value })}
                >
                  {BUTTON_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={11}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
              <input
                maxLength={25}
                className="flex-[2] h-9 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#27AE60] placeholder-gray-300 bg-white"
                placeholder="Button label"
                value={btn.text}
                onChange={(e) => updateBtn(i, { text: e.target.value })}
              />
              <button
                type="button"
                onClick={() => removeBtn(i)}
                className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
              >
                <MinusCircle size={15} />
              </button>
            </div>
            {btn.type === "URL" && (
              <input
                className="w-full h-9 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#27AE60] placeholder-gray-300 bg-white"
                placeholder="https://example.com"
                value={btn.url}
                onChange={(e) => updateBtn(i, { url: e.target.value })}
              />
            )}
            {btn.type === "PHONE_NUMBER" && (
              <input
                className="w-full h-9 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#27AE60] placeholder-gray-300 bg-white"
                placeholder="+91XXXXXXXXXX"
                value={btn.phone}
                onChange={(e) => updateBtn(i, { phone: e.target.value })}
              />
            )}
          </div>
        ))}
        {buttons.length < 3 && (
          <button
            type="button"
            onClick={addBtn}
            className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-[#27AE60] bg-[#E8F8EF] border border-dashed border-[#27AE60] rounded-xl hover:bg-[#C2EDD6] transition-colors w-full justify-center"
          >
            <PlusCircle size={15} /> Add Button
          </button>
        )}
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
// SECTION 5 — TEMPLATE INFO
// ════════════════════════════════════════════════════════════════════════════
const InfoSection = ({ form, setField }) => (
  <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
    <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-gray-50">
      <span className="w-6 h-6 rounded-full bg-[#27AE60] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
        5
      </span>
      <div>
        <p className="text-sm font-semibold text-gray-800">Template Info</p>
        <p className="text-xs text-gray-400">
          Name, language and category — submitted to Meta
        </p>
      </div>
    </div>
    <div className="p-4 flex flex-col gap-3">
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1.5">
          Template Name <span className="text-red-400">*</span>
        </label>
        <input
          required
          className="w-full px-3 py-2.5 text-sm font-mono border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#27AE60] focus:border-transparent placeholder-gray-300"
          placeholder="e.g. property_inquiry_response_v1"
          value={form.name}
          onChange={(e) =>
            setField(
              "name",
              e.target.value
                .toLowerCase()
                .replace(/\s+/g, "_")
                .replace(/[^a-z0-9_]/g, ""),
            )
          }
        />
        <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
          <Info size={10} /> Lowercase, numbers and underscores only. Each name
          must be unique across languages.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1.5">
            Language
          </label>
          <div className="relative">
            <select
              className="w-full appearance-none px-3 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#27AE60] bg-white cursor-pointer pr-8"
              value={form.language}
              onChange={(e) => setField("language", e.target.value)}
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={13}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1.5">
            Category
          </label>
          <div className="relative">
            <select
              className="w-full appearance-none px-3 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#27AE60] bg-white cursor-pointer pr-8"
              value={form.category}
              onChange={(e) => setField("category", e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <ChevronDown
              size={13}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>
        </div>
      </div>
      {/* Meta error hint */}
      <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
        <Info size={13} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700">
          If you get <strong>"Content in this language already exists"</strong>,
          change the template name or increment the version suffix (e.g. _v2).
        </p>
      </div>
    </div>
  </div>
);

// ════════════════════════════════════════════════════════════════════════════
// PREVIEW PANEL — WhatsApp bubble with sample values applied
// ════════════════════════════════════════════════════════════════════════════
const PreviewPanel = ({ form }) => {
  const bodyText = applyVars(form.body.text, form.body.examples);
  const headerText =
    form.header.enabled && form.header.format === "TEXT"
      ? form.header.text
      : "";

  const renderHtml = (text) =>
    text
      .replace(/\*(.*?)\*/g, "<strong>$1</strong>")
      .replace(/_(.*?)_/g, "<em>$1</em>")
      .replace(/~(.*?)~/g, "<s>$1</s>")
      .replace(/\n/g, "<br/>");

  return (
    <div className="w-72 flex-shrink-0 hidden lg:flex flex-col gap-3 sticky top-4 self-start max-h-[calc(100vh-2rem)] overflow-y-auto pb-4">
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wide text-gray-400">
          Template Preview
        </span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* WhatsApp UI mock */}
      <div className="bg-[#ECE5DD] rounded-2xl p-3 border border-gray-200">
        <div className="flex items-center gap-2 bg-[#075E54] rounded-xl px-3 py-2 mb-3">
          <div className="w-7 h-7 rounded-full bg-[#25D366] flex items-center justify-center flex-shrink-0">
            <MessageSquare size={13} className="text-white" />
          </div>
          <div>
            <p className="text-white text-xs font-bold leading-none">Propenu</p>
            <p className="text-green-300 text-[9px]">Business Account</p>
          </div>
        </div>
        <div className="flex justify-start">
          <div className="bg-white rounded-2xl rounded-tl-sm shadow-sm max-w-[92%] overflow-hidden">
            {/* Header preview */}
            {form.header.enabled && (
              <div
                className={`px-3 pt-3 pb-1 ${form.header.format !== "TEXT" ? "bg-gray-100" : ""}`}
              >
                {form.header.format === "TEXT" ? (
                  <p className="text-sm font-bold text-gray-900">
                    {headerText || (
                      <span className="text-gray-300 italic font-normal text-xs">
                        Header text…
                      </span>
                    )}
                  </p>
                ) : form.header.format === "IMAGE" &&
                  form.header.mediaPreview ? (
                  <img
                    src={form.header.mediaPreview}
                    alt="header"
                    className="w-full h-24 object-cover rounded-lg"
                  />
                ) : form.header.format === "VIDEO" &&
                  form.header.mediaPreview ? (
                  <video
                    src={form.header.mediaPreview}
                    className="w-full h-24 rounded-lg"
                  />
                ) : (
                  <div className="w-full h-20 bg-gray-200 rounded-lg flex flex-col items-center justify-center gap-1">
                    {MEDIA_ICON[form.header.format]}
                    <span className="text-xs text-gray-400">
                      {form.header.format}
                    </span>
                  </div>
                )}
              </div>
            )}
            {/* Body */}
            <div className="px-3 py-2">
              {form.body.text ? (
                <p
                  className="text-xs text-gray-800 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: renderHtml(bodyText) }}
                />
              ) : (
                <p className="text-xs text-gray-300 italic">
                  Message body will appear here…
                </p>
              )}
            </div>
            {/* Footer */}
            {form.footer.enabled && form.footer.text && (
              <div className="px-3 pb-1">
                <p className="text-[10px] text-gray-400">{form.footer.text}</p>
              </div>
            )}
            <div className="flex justify-end px-3 pb-2">
              <span className="text-[9px] text-gray-400">12:15 ✓✓</span>
            </div>
            {/* Buttons */}
            {form.buttons.length > 0 && (
              <div className="border-t border-gray-100">
                {form.buttons.map((btn, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#075E54] ${i > 0 ? "border-t border-gray-100" : ""}`}
                  >
                    {btn.type === "URL" && <Link2 size={11} />}
                    {btn.type === "PHONE_NUMBER" && <PhoneIcon size={11} />}
                    {btn.text || (
                      <span className="text-gray-300 italic">Button label</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* JSON Payload */}
      <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
        <div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-100 bg-gray-50">
          <FileText size={13} className="text-gray-400" />
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
            API Payload
          </span>
        </div>
        <pre className="p-3 text-[10px] text-gray-600 font-mono whitespace-pre-wrap break-all leading-relaxed bg-gray-50 max-h-52 overflow-y-auto">
          {JSON.stringify(buildPayload(form), null, 2)}
        </pre>
      </div>

      {/* Summary */}
      <div className="border border-gray-200 rounded-2xl p-3 bg-white">
        <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-2">
          Summary
        </p>
        {[
          ["Name", form.name || "—"],
          [
            "Language",
            LANGUAGES.find((l) => l.code === form.language)?.label ||
              form.language,
          ],
          ["Category", form.category],
          ["Variables", countVars(form.body.text)],
          ["Buttons", form.buttons.length],
          ["Header", form.header.enabled ? form.header.format : "None"],
        ].map(([k, v]) => (
          <div
            key={k}
            className="flex items-center justify-between text-xs py-1.5 border-b border-gray-50 last:border-0"
          >
            <span className="text-gray-400 font-semibold">{k}</span>
            <span className="font-bold text-gray-700">{String(v)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
// TEMPLATE FORM
// ════════════════════════════════════════════════════════════════════════════
const TemplateForm = ({ initial, onSubmit, submitting }) => {
  const [form, setForm] = useState({ ...EMPTY_FORM, ...initial });
  const setField = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.body.text.trim()) {
      toast.error("Body text is required");
      return;
    }
    const vc = countVars(form.body.text);
    if (vc > 0 && form.body.examples.filter(Boolean).length < vc) {
      toast.error(`Add sample values for all ${vc} variable(s)`);
      return;
    }
    if (!form.name.trim()) {
      toast.error("Template name is required");
      return;
    }
    if (
      form.header.enabled &&
      form.header.format !== "TEXT" &&
      !form.header.mediaHandle.trim()
    ) {
      toast.error(`Please upload or provide a ${form.header.format} handle`);
      return;
    }
    onSubmit(buildPayload(form));
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-6">
      <div className="flex-1 min-w-0 flex flex-col gap-4">
        <HeaderSection
          header={form.header}
          onChange={(v) => setField("header", v)}
        />
        <BodySection body={form.body} onChange={(v) => setField("body", v)} />
        <FooterSection
          footer={form.footer}
          onChange={(v) => setField("footer", v)}
        />
        <ButtonsSection
          buttons={form.buttons}
          onChange={(v) => setField("buttons", v)}
        />
        <InfoSection form={form} setField={setField} />
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 bg-[#27AE60] text-white font-bold text-sm rounded-2xl hover:bg-[#1A7A43] active:scale-[.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{ boxShadow: "0 4px 14px rgba(39,174,96,.3)" }}
        >
          {submitting && <Loader2 size={16} className="animate-spin" />}
          {submitting
            ? "Submitting to Meta…"
            : initial._id
              ? "Update Template"
              : "Submit Template to Meta"}
        </button>
      </div>
      <PreviewPanel form={form} />
    </form>
  );
};

// ════════════════════════════════════════════════════════════════════════════
// MODAL
// ════════════════════════════════════════════════════════════════════════════
const Modal = ({ title, icon, wide, onClose, children }) => (
  <div
    className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/40 backdrop-blur-sm"
    onClick={(e) => e.target === e.currentTarget && onClose()}
  >
    <style>{`@keyframes slideUp{from{transform:translateY(40px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
    <div
      style={{ animation: "slideUp .25s cubic-bezier(.22,1,.36,1)" }}
      className={`bg-white rounded-t-2xl md:rounded-2xl w-full ${wide ? "md:max-w-4xl" : "md:max-w-lg"} max-h-[94vh] flex flex-col shadow-2xl`}
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
          {icon} {title}
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
        >
          <X size={14} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-5">{children}</div>
    </div>
  </div>
);

// ════════════════════════════════════════════════════════════════════════════
// VIEW MODAL
// ════════════════════════════════════════════════════════════════════════════
const ViewModal = ({ item, onClose, onEdit }) => {
  const bodyComp = item.components?.find((c) => c.type === "BODY");
  const headerComp = item.components?.find((c) => c.type === "HEADER");
  const footerComp = item.components?.find((c) => c.type === "FOOTER");
  const btnComp = item.components?.find((c) => c.type === "BUTTONS");
  const sm = getStatusMeta(item.status);

  return (
    <Modal
      title={item.name}
      icon={<MessageSquare size={16} />}
      onClose={onClose}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#E8F8EF] flex items-center justify-center flex-shrink-0">
            <MessageSquare size={22} className="text-[#27AE60]" />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-bold text-gray-900 font-mono break-all">
              {item.name}
            </h2>
            <p className="text-[10px] text-gray-400 mt-0.5 font-mono">
              ID: {item.id || item._id || "—"}
            </p>
            <div className="flex gap-2 mt-2 flex-wrap">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${sm.color}`}
              >
                {sm.icon} {sm.label}
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${CAT_COLOR[item.category] || "bg-gray-100 text-gray-500 border-gray-200"}`}
              >
                {item.category}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border bg-gray-50 text-gray-500 border-gray-200">
                <Globe size={10} /> {item.language}
              </span>
            </div>
          </div>
        </div>

        {headerComp && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
            <p className="text-[10px] font-bold uppercase text-gray-400 mb-1">
              Header · {headerComp.format}
            </p>
            <p className="text-sm font-semibold text-gray-700">
              {headerComp.text || `[${headerComp.format} media]`}
            </p>
          </div>
        )}

        {bodyComp && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
            <p className="text-[10px] font-bold uppercase text-gray-400 mb-1">
              Body
            </p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
              {bodyComp.text}
            </p>
            {bodyComp.example?.body_text?.[0]?.length > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-200">
                <p className="text-[10px] font-bold uppercase text-gray-400 mb-1.5">
                  Variable Samples
                </p>
                {bodyComp.example.body_text[0].map((val, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs mb-1">
                    <span className="font-mono text-[#27AE60] font-semibold">{`{{${i + 1}}}`}</span>
                    <span className="text-gray-400">→</span>
                    <span className="text-gray-600">{val}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {footerComp && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
            <p className="text-[10px] font-bold uppercase text-gray-400 mb-1">
              Footer 
            </p>
            <p className="text-sm text-gray-500">{footerComp.text}</p>
          </div>
        )}

        {btnComp?.buttons?.length > 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
            <p className="text-[10px] font-bold uppercase text-gray-400 mb-2">
              Buttons
            </p>
            <div className="flex flex-wrap gap-2">
              {btnComp.buttons.map((b, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-[#075E54] font-semibold"
                >
                  {b.type === "URL" && <Link2 size={11} />}
                  {b.type === "PHONE_NUMBER" && <PhoneIcon size={11} />}
                  {b.text}
                  {b.url && (
                    <span className="text-gray-400 font-normal truncate max-w-[120px]">
                      · {b.url}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Raw JSON */}
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-3 py-2 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
            <FileText size={12} className="text-gray-400" />
            <p className="text-[10px] font-bold uppercase text-gray-400">
              Raw API Response
            </p>
          </div>
          <pre className="p-3 text-[10px] text-gray-600 font-mono whitespace-pre-wrap bg-white max-h-44 overflow-y-auto">
            {JSON.stringify(item, null, 2)}
          </pre>
        </div>

        <button
          onClick={onEdit}
          className="w-full py-2.5 bg-[#27AE60] text-white text-sm font-bold rounded-xl hover:bg-[#1A7A43] transition-colors flex items-center justify-center gap-2"
        >
          <Edit2 size={15} /> Edit Template
        </button>
      </div>
    </Modal>
  );
};

// ════════════════════════════════════════════════════════════════════════════
// DELETE CONFIRM
// ════════════════════════════════════════════════════════════════════════════
const DeleteConfirm = ({ item, onClose, onConfirm, deleting }) => (
  <Modal title="Delete Template" icon={<Trash2 size={16} />} onClose={onClose}>
    <div className="flex flex-col items-center text-center gap-4 py-4">
      <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
        <Trash2 size={28} className="text-red-400" />
      </div>
      <div>
        <p className="text-base font-bold text-gray-800">
          Delete <span className="text-red-500 font-mono">"{item.name}"</span>?
        </p>
        <p className="text-sm text-gray-400 mt-1">
          This will permanently delete the template from Meta. This cannot be
          undone.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 w-full mt-2">
        <button
          onClick={onClose}
          className="py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={deleting}
          className="py-2.5 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
        >
          {deleting && <Loader2 size={14} className="animate-spin" />}
          {deleting ? "Deleting…" : "Delete from Meta"}
        </button>
      </div>
    </div>
  </Modal>
);

// ════════════════════════════════════════════════════════════════════════════
// TEMPLATE CARD
// ════════════════════════════════════════════════════════════════════════════
const TemplateCard = ({ item, onView, onEdit, onDelete }) => {
  const sm = getStatusMeta(item.status);
  const bodyComp = item.components?.find((c) => c.type === "BODY");
  const btnComp = item.components?.find((c) => c.type === "BUTTONS");
  const hdrComp = item.components?.find((c) => c.type === "HEADER");
  const varCount = countVars(bodyComp?.text || "");

  return (
    <div
      onClick={() => onView(item)}
      className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md hover:border-[#C2EDD6] transition-all cursor-pointer group"
    >
      <div className="flex items-start gap-3 p-4">
        <div className="w-10 h-10 rounded-xl bg-[#E8F8EF] border border-[#C2EDD6] flex items-center justify-center text-[#27AE60] flex-shrink-0">
          <MessageSquare size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-800 truncate font-mono">
            {item.name}
          </p>
          <div className="flex gap-1.5 mt-1.5 flex-wrap">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${sm.color}`}
            >
              {sm.icon} {sm.label}
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${CAT_COLOR[item.category] || "bg-gray-100 text-gray-500 border-gray-200"}`}
            >
              {item.category}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-gray-50 text-gray-500 border-gray-200">
              <Globe size={9} /> {item.language}
            </span>
            {hdrComp && hdrComp.format !== "TEXT" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-blue-50 text-blue-600 border-blue-200">
                {hdrComp.format}
              </span>
            )}
          </div>
        </div>
        <div
          className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
         
          <button
            onClick={() => onDelete(item)}
            className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {bodyComp?.text && (
        <div className="mx-4 mb-3 px-3 py-2 bg-gray-50 rounded-xl border border-gray-100">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">
            Body
          </p>
          <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
            {bodyComp.text}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-2">
          {varCount > 0 && (
            <span className="flex items-center gap-1 text-[10px] text-gray-400 font-semibold">
              <Hash size={9} /> {varCount} var{varCount > 1 ? "s" : ""}
            </span>
          )}
          {btnComp?.buttons?.length > 0 && (
            <span className="text-[10px] text-gray-400 font-semibold">
              · {btnComp.buttons.length} btn
              {btnComp.buttons.length > 1 ? "s" : ""}
            </span>
          )}
          <span className="text-[10px] font-mono text-gray-300">
            #{item.id || item._id || ""}
          </span>
        </div>
        <span className="text-[10px] text-gray-400">
          {formatDate(item.createdAt)}
        </span>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ════════════════════════════════════════════════════════════════════════════
const WhatsUpNotifications = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [viewItem, setViewItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);

  // ── GET ALL — parses real response: { success, data: { data: { data: [...] } } }
  const fetchAll = async () => {
    try {
      setLoading(true);
      const res = await getAllWhatsAppNotifications();
      console.log(res);
      const list = parseTemplateList(res);
      setTemplates(list);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to fetch WhatsApp templates",
      );
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // ── CREATE — POST /notifications/whatsapp/template
  const handleCreate = async (payload) => {
    try {
      setSubmitting(true);
      await createWhatsAppNotification(payload);
      toast.success("Template submitted to Meta for review!");
      setShowCreate(false);
      fetchAll();
    } catch (err) {
      const msg =
        err?.response?.data?.message?.error?.error_user_msg ||
        err?.response?.data?.message?.error?.message ||
        err?.response?.data?.message ||
        "Failed to create template";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ── UPDATE — PUT /notifications/whatsapp/template
//   const handleUpdate = async (payload) => {
//     try {
//       setSubmitting(true);
//       await updateWhatsAppNotification(payload);
//       toast.success("Template updated!");
//       setEditItem(null);
//       fetchAll();
//     } catch (err) {
//       const msg =
//         err?.response?.data?.message?.error?.error_user_msg ||
//         err?.response?.data?.message?.error?.message ||
//         err?.response?.data?.message ||
//         "Failed to update template";
//       toast.error(msg);
//     } finally {
//       setSubmitting(false);
//     }
//   };

  // ── DELETE — DELETE /whatsapp/template/:name  (uses Meta `name` field)
  const handleDelete = async () => {
    try {
      setDeleting(true);
      const identifier = deleteItem.name;
      await deleteWhatsAppNotificationByName(identifier);
      toast.success("Template deleted from Meta!");
      setDeleteItem(null);
      fetchAll();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  // ── GET BY NAME — GET /whatsapp/template/:name (full detail for view/edit)
  const openView = async (item) => {
    try {
      const res = await getWhatsAppNotificationByName(item.name);
      const data = res?.data?.data || res?.data || item;
      setViewItem(data);
    } catch {
      setViewItem(item);
    }
  };

  const openEdit = async (item) => {
    setViewItem(null);
    try {
      const res = await getWhatsAppNotificationByName(item.name);
      const data = res?.data?.data || res?.data || item;
      setEditItem(componentsToForm(data));
    } catch {
      setEditItem(componentsToForm(item));
    }
  };

  // ── filter
  const filtered = templates.filter((t) => {
    const q = search.toLowerCase();
    return (
      (t.name || "").toLowerCase().includes(q) &&
      (statusFilter ? t.status === statusFilter : true) &&
      (categoryFilter ? t.category === categoryFilter : true)
    );
  });

  const approvedCount = templates.filter((t) => t.status === "APPROVED").length;
  const rejectedCount = templates.filter((t) => t.status === "REJECTED").length;
  const pendingCount = templates.filter((t) => t.status === "PENDING").length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modals */}
      {showCreate && (
        <Modal
          title="Create WhatsApp Template"
          icon={<MessageSquare size={16} />}
          wide
          onClose={() => setShowCreate(false)}
        >
          <TemplateForm
            initial={EMPTY_FORM}
            onSubmit={handleCreate}
            submitting={submitting}
          />
        </Modal>
      )}
      {/* {editItem && (
        <Modal
          title="Edit Template"
          icon={<Edit2 size={16} />}
          wide
          onClose={() => setEditItem(null)}
        >
          <TemplateForm
            initial={editItem}
            onSubmit={handleUpdate}
            submitting={submitting}
          />
        </Modal>
      )} */}
      {viewItem && (
        <ViewModal
          item={viewItem}
          onClose={() => setViewItem(null)}
          onEdit={() => openEdit(viewItem)}
        />
      )}
      {deleteItem && (
        <DeleteConfirm
          item={deleteItem}
          onClose={() => setDeleteItem(null)}
          onConfirm={handleDelete}
          deleting={deleting}
        />
      )}

      {/* Topbar */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 h-16 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#25D366] flex items-center justify-center flex-shrink-0">
            <MessageSquare size={18} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">
              WhatsApp Templates
            </p>
            <p className="text-xs text-gray-400">
              Meta Business API · {templates.length} templates
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchAll}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-400 hover:text-[#27AE60] hover:border-[#C2EDD6] transition-colors"
            title="Refresh"
          >
            {loading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <RefreshCw size={15} />
            )}
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#27AE60] text-white text-sm font-bold rounded-xl hover:bg-[#1A7A43] transition-colors"
            style={{ boxShadow: "0 4px 12px rgba(39,174,96,.3)" }}
          >
            <Plus size={15} /> New Template
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            {
              label: "Total",
              value: templates.length,
              icon: <MessageSquare size={18} />,
              bg: "bg-blue-50 text-blue-600",
            },
            {
              label: "Approved",
              value: approvedCount,
              icon: <CheckCircle2 size={18} />,
              bg: "bg-green-50 text-green-600",
            },
            {
              label: "Pending",
              value: pendingCount,
              icon: <Clock size={18} />,
              bg: "bg-amber-50 text-amber-600",
            },
            {
              label: "Rejected",
              value: rejectedCount,
              icon: <XCircle size={18} />,
              bg: "bg-red-50 text-red-500",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-3 hover:shadow-sm transition-shadow"
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${s.bg}`}
              >
                {s.icon}
              </div>
              <div>
                <p className="text-xl font-extrabold text-gray-900 leading-none">
                  {s.value}
                </p>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mt-0.5">
                  {s.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-5">
          <div className="relative flex-1 min-w-[160px] max-w-xs">
            <Search
              size={14}
              className="absolute right-6 left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#27AE60] focus:border-transparent placeholder-gray-300"
              placeholder="Search templates…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="relative">
            <select
              className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#27AE60] cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              {Object.keys(STATUS_META).map((s) => (
                <option key={s} value={s}>
                  {STATUS_META[s].label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={13}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>
          <div className="relative">
            <select
              className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#27AE60] cursor-pointer"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <ChevronDown
              size={13}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>
          {(search || statusFilter || categoryFilter) && (
            <button
              onClick={() => {
                setSearch("");
                setStatusFilter("");
                setCategoryFilter("");
              }}
              className="px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors"
            >
              <X size={13} /> Clear
            </button>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-[#27AE60]" />
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center">
              <MessageSquare size={36} className="text-gray-300" />
            </div>
            <p className="text-sm font-semibold text-gray-400">
              {templates.length === 0
                ? "No templates yet. Create your first one!"
                : "No templates match your filters."}
            </p>
            {templates.length === 0 && (
              <button
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#27AE60] text-white text-sm font-bold rounded-xl hover:bg-[#1A7A43] transition-colors"
              >
                <Plus size={15} /> Create Template
              </button>
            )}
          </div>
        )}

        {/* Cards */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((item) => (
              <TemplateCard
                key={item.id || item._id || item.name}
                item={item}
                onView={openView}
                onEdit={openEdit}
                onDelete={setDeleteItem}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WhatsUpNotifications;
