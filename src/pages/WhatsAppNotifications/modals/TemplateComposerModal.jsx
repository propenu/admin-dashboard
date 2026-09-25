import { useEffect, useMemo, useRef, useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import {
  Bold,
  Check,
  ChevronDown,
  Code2,
  Copy,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Italic,
  Loader2,
  MapPin,
  MessageCircle,
  Phone,
  PhoneCall,
  Plus,
  Reply,
  Sparkles,
  Strikethrough,
  Trash2,
  Type,
  Upload,
  UserRound,
  Video,
  Workflow,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { EMPTY_BUTTON, EMPTY_FORM } from "../common/EmptyForm";
import {
  CATEGORY_OPTIONS,
  HEADER_MEDIA_OPTIONS,
  LANGUAGES,
  MEDIA_ACCEPT,
  MEDIA_LIMITS,
  META_BUTTON_OPTIONS,
} from "../utils/constants";
import { uploadWhatsAppTemplateMedia } from "../../../features/user/userService";
import {
  buildPayload,
  validateTemplateBody,
} from "../utils/payloadBuilder";
import { applyVars, countVars } from "../utils/helper";
import { WhatsAppTemplatePreview } from "../preview/WhatsAppTemplatePreview";

const SAMPLE = {
  name: "welcome_customer",
  language: "en",
  category: "MARKETING",
  templateType: "cta",
  header: {
    enabled: false,
    format: "TEXT",
    text: "",
    example: "",
    mediaHandle: "",
    mediaPreview: null,
    locationName: "",
    locationAddress: "",
  },
  body: {
    text: "Hello {{1}}, welcome to Propenu. Your service city is {{2}}. Reply if you need help with listings.",
    examples: ["Priya", "Hyderabad"],
  },
  footer: { enabled: true, text: "Reply STOP to opt out" },
  buttons: [],
};

const fieldLabel =
  "mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.06em] text-emerald-700";
const fieldControl =
  "h-10 w-full rounded-xl border border-emerald-100 bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25";
const sectionCard =
  "rounded-2xl border border-emerald-100 bg-white p-4 shadow-[0_8px_24px_rgba(16,185,129,0.08)]";
const sectionTitle = "text-[14px] font-semibold text-slate-900";
const sectionHint = "mt-0.5 text-[12px] leading-relaxed text-slate-500";
const sectionKicker =
  "text-[11px] font-bold uppercase tracking-[0.08em] text-emerald-600";

const MEDIA_ICONS = {
  NONE: MessageCircle,
  TEXT: Type,
  IMAGE: ImageIcon,
  DOCUMENT: FileText,
  VIDEO: Video,
  LOCATION: MapPin,
};

const BUTTON_ICONS = {
  QUICK_REPLY: Reply,
  URL: ExternalLink,
  VOICE_CALL: PhoneCall,
  PHONE_NUMBER: Phone,
  FLOW: Workflow,
  COPY_CODE: Copy,
  SHARE_CONTACT: UserRound,
};

const BUTTON_DEFAULTS = {
  QUICK_REPLY: { ...EMPTY_BUTTON, type: "QUICK_REPLY", text: "Quick reply" },
  URL: {
    ...EMPTY_BUTTON,
    type: "URL",
    text: "Visit website",
    url: "https://example.com",
  },
  VOICE_CALL: {
    ...EMPTY_BUTTON,
    type: "VOICE_CALL",
    text: "Call on WhatsApp",
    ttlMinutes: "10080",
  },
  PHONE_NUMBER: {
    ...EMPTY_BUTTON,
    type: "PHONE_NUMBER",
    text: "Call now",
    phone: "+91",
  },
  FLOW: {
    ...EMPTY_BUTTON,
    type: "FLOW",
    text: "Complete flow",
  },
  COPY_CODE: {
    ...EMPTY_BUTTON,
    type: "COPY_CODE",
    text: "Copy offer code",
    exampleCode: "SAVE20",
  },
  SHARE_CONTACT: {
    ...EMPTY_BUTTON,
    type: "SHARE_CONTACT",
    text: "Share contact info",
  },
};

function languageLabel(code) {
  const found = LANGUAGES.find((l) => l.code === code);
  return found ? `${found.label} (${found.code})` : code;
}

function deepMergeForm(initial) {
  return {
    ...EMPTY_FORM,
    ...initial,
    header: { ...EMPTY_FORM.header, ...(initial?.header || {}) },
    body: {
      text: initial?.body?.text || "",
      examples: Array.isArray(initial?.body?.examples)
        ? [...initial.body.examples]
        : [],
    },
    footer: { ...EMPTY_FORM.footer, ...(initial?.footer || {}) },
    buttons: Array.isArray(initial?.buttons)
      ? initial.buttons.map((b) => ({ ...EMPTY_BUTTON, ...b }))
      : [],
  };
}

function extractVars(text = "") {
  const numbered = [...(String(text).match(/\{\{\d+\}\}/g) || [])];
  const invalid = [...(String(text).match(/\{\{(?!\d+\})[^}]+\}\}/g) || [])];
  return {
    numbered: [...new Set(numbered)],
    invalid: [...new Set(invalid)],
    nextIndex: countVars(text) + 1,
  };
}

function insertAtCursor(el, current, token, onChange) {
  if (!el) {
    onChange(`${current || ""}${token}`);
    return;
  }
  const start = el.selectionStart ?? (current || "").length;
  const end = el.selectionEnd ?? (current || "").length;
  const next = (current || "").slice(0, start) + token + (current || "").slice(end);
  onChange(next);
  setTimeout(() => {
    el.focus();
    const pos = start + token.length;
    el.setSelectionRange(pos, pos);
  }, 0);
}

function wrapSelection(el, current, before, after, onChange) {
  if (!el) {
    onChange(`${current || ""}${before}${after}`);
    return;
  }
  const start = el.selectionStart ?? 0;
  const end = el.selectionEnd ?? 0;
  const selected = (current || "").slice(start, end) || "text";
  const next =
    (current || "").slice(0, start) +
    before +
    selected +
    after +
    (current || "").slice(end);
  onChange(next);
  setTimeout(() => {
    el.focus();
    el.setSelectionRange(
      start + before.length,
      start + before.length + selected.length,
    );
  }, 0);
}

function FieldMenu({
  open,
  onOpenChange,
  trigger,
  children,
  align = "start",
  contentClassName = "",
}) {
  return (
    <Popover.Root open={open} onOpenChange={onOpenChange} modal={false}>
      <Popover.Trigger asChild>{trigger}</Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align={align}
          side="bottom"
          sideOffset={6}
          avoidCollisions={false}
          hideWhenDetached
          onOpenAutoFocus={(e) => e.preventDefault()}
          className={`z-[80] max-h-72 w-[var(--radix-popover-trigger-width)] min-w-[240px] overflow-auto rounded-xl border border-emerald-100 bg-white p-1 shadow-[0_16px_40px_rgba(15,23,42,0.16)] outline-none ${contentClassName}`}
        >
          {children}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

function MenuButton({ open, children, className = "", ...props }) {
  return (
    <button
      type="button"
      className={`${fieldControl} flex items-center justify-between gap-2 text-left ${className}`}
      aria-expanded={open}
      aria-haspopup="listbox"
      {...props}
    >
      <span className="min-w-0 truncate">{children}</span>
      <ChevronDown
        size={16}
        className={`shrink-0 text-slate-400 transition ${open ? "rotate-180" : ""}`}
      />
    </button>
  );
}

function nowLabel() {
  return new Date().toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Meta Business Suite–style Create WhatsApp Template composer.
 */
export function TemplateComposerModal({
  mode = "create",
  initial = EMPTY_FORM,
  submitting = false,
  onClose,
  onSubmit,
}) {
  const [form, setForm] = useState(() => deepMergeForm(initial));
  const [openMenu, setOpenMenu] = useState("");
  const [copied, setCopied] = useState(false);
  const [payloadOpen, setPayloadOpen] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [langQuery, setLangQuery] = useState("");
  const bodyRef = useRef(null);
  const headerRef = useRef(null);
  const mediaInputRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller || !openMenu) return undefined;
    const close = () => setOpenMenu("");
    scroller.addEventListener("scroll", close, { passive: true });
    return () => scroller.removeEventListener("scroll", close);
  }, [openMenu]);

  useEffect(() => {
    setForm(deepMergeForm(initial));
  }, [initial]);

  const setField = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const bodyVars = useMemo(() => extractVars(form.body.text), [form.body.text]);
  const headerVars = useMemo(
    () => extractVars(form.header.text || ""),
    [form.header.text],
  );
  const bodyValidation = useMemo(
    () => validateTemplateBody(form.body.text),
    [form.body.text],
  );

  const mediaSampleValue = !form.header.enabled
    ? "NONE"
    : ["TEXT", "IMAGE", "VIDEO", "DOCUMENT", "LOCATION"].includes(
        form.header.format,
      )
      ? form.header.format
      : "NONE";

  const mediaOption =
    HEADER_MEDIA_OPTIONS.find((o) => o.value === mediaSampleValue) ||
    HEADER_MEDIA_OPTIONS[0];
  const MediaIcon = MEDIA_ICONS[mediaSampleValue] || MessageCircle;
  const categoryOption =
    CATEGORY_OPTIONS.find((c) => c.value === form.category) ||
    CATEGORY_OPTIONS[0];

  const setMediaSample = (value) => {
    setOpenMenu("");
    if (value === "NONE") {
      setForm((prev) => ({
        ...prev,
        header: {
          ...EMPTY_FORM.header,
          text: prev.header.text,
          example: prev.header.example,
          enabled: Boolean(String(prev.header.text || "").trim()),
          format: "TEXT",
        },
      }));
      return;
    }
    setForm((prev) => ({
      ...prev,
      header: {
        ...EMPTY_FORM.header,
        enabled: true,
        format: value,
        text: value === "TEXT" ? prev.header.text : "",
        example: value === "TEXT" ? prev.header.example : "",
        locationName: value === "LOCATION" ? prev.header.locationName : "",
        locationAddress:
          value === "LOCATION" ? prev.header.locationAddress : "",
      },
    }));
  };

  const uploadMediaSample = async (file) => {
    if (!file) return;
    const format = form.header.format;
    const maxMB = MEDIA_LIMITS[format]?.maxMB || 5;
    if (file.size > maxMB * 1024 * 1024) {
      toast.error(`File too large. Max ${maxMB}MB for ${format}.`);
      return;
    }

    if (!["IMAGE", "VIDEO", "DOCUMENT"].includes(format)) {
      toast.error("Select Image, Video, or Document before uploading a sample.");
      return;
    }

    try {
      setUploadingMedia(true);
      const localPreview = URL.createObjectURL(file);

      setForm((prev) => ({
        ...prev,
        header: {
          ...prev.header,
          enabled: true,
          format,
          mediaPreview: localPreview,
        },
      }));

      // Meta requires Resumable Upload handle — public S3 URLs are rejected.
      const res = await uploadWhatsAppTemplateMedia(file, format);
      const handle = String(res?.data?.handle || "").trim();
      const previewUrl = String(res?.data?.previewUrl || "").trim();
      if (!handle || handle.startsWith("http")) {
        throw new Error(
          "Meta did not return a valid media handle. Try a JPEG/PNG under 5MB.",
        );
      }

      setForm((prev) => ({
        ...prev,
        header: {
          ...prev.header,
          enabled: true,
          format,
          mediaHandle: handle,
          mediaPreview: previewUrl || localPreview,
        },
      }));
      if (previewUrl && localPreview.startsWith("blob:")) {
        URL.revokeObjectURL(localPreview);
      }
      // Keep create-time S3 preview for campaign modal (Meta handle is not an image URL).
      if (previewUrl) {
        try {
          const key = "propenu.wa.templateMediaPreview.v1";
          const name = String(form.name || "").trim();
          const map = JSON.parse(localStorage.getItem(key) || "{}");
          if (name) map[name] = previewUrl;
          map.__last = previewUrl;
          localStorage.setItem(key, JSON.stringify(map));
        } catch {
          /* ignore */
        }
      }
      toast.success(`${format} sample uploaded for Meta review`);    } catch (err) {
      toast.error(
        err?.response?.data?.message || err?.message || "Media upload failed",
        { duration: 8000 },
      );
    } finally {
      setUploadingMedia(false);
    }
  };

  const payload = useMemo(() => {
    try {
      const soft = {
        ...form,
        body: {
          ...form.body,
          examples: Array.from({ length: countVars(form.body.text) }, (_, i) =>
            form.body.examples[i] || `Sample ${i + 1}`,
          ),
        },
      };
      if (!soft.name?.trim()) soft.name = "template_name";
      if (!soft.body.text?.trim()) {
        soft.body.text = "Your template message body goes here.";
      }
      return buildPayload(soft);
    } catch {
      return {
        name: form.name || "template_name",
        language: form.language || "en",
        category: form.category || "MARKETING",
        components: [
          {
            type: "BODY",
            text: form.body.text || "Your template message body",
          },
        ],
      };
    }
  }, [form]);

  const previewBody = useMemo(() => {
    const examples = Array.from(
      { length: countVars(form.body.text) },
      (_, i) => form.body.examples[i] || `{{${i + 1}}}`,
    );
    return applyVars(form.body.text, examples) || "";
  }, [form.body.text, form.body.examples]);

  const previewHeaderText = useMemo(() => {
    if (!form.header.enabled || form.header.format !== "TEXT") return "";
    const sample = form.header.example || "{{1}}";
    return applyVars(form.header.text || "", [sample]);
  }, [form.header]);

  const missingMedia =
    form.header.enabled &&
    ["IMAGE", "VIDEO", "DOCUMENT"].includes(form.header.format) &&
    !form.header.mediaHandle;

  const incompleteButton = form.buttons.findIndex((b) => {
    const type = String(b.type || "").toUpperCase();
    if (type === "URL" && !String(b.url || "").trim()) return true;
    if (type === "PHONE_NUMBER" && !String(b.phone || "").trim()) return true;
    if (type === "FLOW" && !String(b.flowId || "").trim()) return true;
    if (type === "COPY_CODE" && !String(b.exampleCode || "").trim()) return true;
    if (type !== "COPY_CODE" && type !== "SHARE_CONTACT" && !String(b.text || "").trim()) {
      return true;
    }
    return false;
  });

  const canSubmit =
    Boolean(form.name?.trim()) &&
    Boolean(form.body.text?.trim()) &&
    bodyVars.invalid.length === 0 &&
    headerVars.invalid.length === 0 &&
    bodyValidation.ok &&
    !missingMedia &&
    incompleteButton < 0 &&
    (form.header.format !== "TEXT" ||
      !form.header.enabled ||
      Boolean(String(form.header.text || "").trim()) ||
      mediaSampleValue === "NONE");

  const statusHint = !form.name?.trim()
    ? "Add a template name to continue."
    : !form.body.text?.trim()
      ? "Add a message body to continue."
      : !bodyValidation.ok
        ? bodyValidation.errors[0]?.message || "Fix variable issues to continue."
        : bodyVars.invalid.length || headerVars.invalid.length
          ? "Use numbered variables like {{1}}, not named tokens."
          : mediaSampleValue === "TEXT" &&
              !String(form.header.text || "").trim()
            ? "Add header text or choose None."
            : missingMedia
            ? form.header.format === "DOCUMENT"
              ? "Upload a PDF document header to continue."
              : form.header.format === "VIDEO"
                ? "Upload a sample MP4 video header to continue."
                : "Upload a sample image header to continue."
            : incompleteButton >= 0 &&
                form.buttons[incompleteButton]?.type === "FLOW"
              ? `Add a Flow ID to Button ${incompleteButton + 1}.`
              : incompleteButton >= 0
                ? `Finish Button ${incompleteButton + 1} to continue.`
                : "Ready to submit to Meta for review.";

  const syncExamples = (text, examples) => {
    const n = countVars(text);
    return Array.from({ length: n }, (_, i) => examples[i] || "");
  };

  const setBodyText = (text) => {
    setForm((prev) => ({
      ...prev,
      body: { text, examples: syncExamples(text, prev.body.examples) },
    }));
  };

  const setHeaderText = (text) => {
    setForm((prev) => ({
      ...prev,
      header: {
        ...prev.header,
        text,
        enabled:
          ["IMAGE", "VIDEO", "DOCUMENT", "LOCATION"].includes(prev.header.format) ||
          Boolean(String(text || "").trim()),
        format: ["IMAGE", "VIDEO", "DOCUMENT", "LOCATION"].includes(
          prev.header.format,
        )
          ? prev.header.format
          : "TEXT",
      },
    }));
  };

  const insertBodyVar = () => {
    insertAtCursor(
      bodyRef.current,
      form.body.text,
      `{{${Math.max(1, bodyVars.nextIndex)}}}`,
      setBodyText,
    );
  };

  const insertHeaderVar = () => {
    if ((form.header.text || "").includes("{{")) {
      toast.error("Header can include at most one variable {{1}}");
      return;
    }
    insertAtCursor(headerRef.current, form.header.text || "", "{{1}}", setHeaderText);
  };

  const applySample = () => {
    setForm(deepMergeForm(SAMPLE));
    toast.success("Sample template loaded");
  };

  const addButton = (type) => {
    setForm((prev) => {
      if (prev.buttons.length >= 10) {
        toast.error("Meta allows at most 10 buttons");
        return prev;
      }
      const countOf = (t) => prev.buttons.filter((b) => b.type === t).length;
      if (type === "URL" && countOf("URL") >= 2) {
        toast.error("At most 2 Visit website buttons");
        return prev;
      }
      if (type === "PHONE_NUMBER" && countOf("PHONE_NUMBER") >= 1) {
        toast.error("At most 1 Call phone number button");
        return prev;
      }
      if (type === "VOICE_CALL" && countOf("VOICE_CALL") >= 1) {
        toast.error("At most 1 Call on WhatsApp button");
        return prev;
      }
      if (type === "FLOW" && countOf("FLOW") >= 1) {
        toast.error("At most 1 Complete flow button");
        return prev;
      }
      if (type === "COPY_CODE" && countOf("COPY_CODE") >= 1) {
        toast.error("At most 1 Copy offer code button");
        return prev;
      }
      return {
        ...prev,
        buttons: [...prev.buttons, { ...BUTTON_DEFAULTS[type] }],
      };
    });
    setOpenMenu("");
  };

  const updateButton = (index, patch) => {
    setForm((prev) => ({
      ...prev,
      buttons: prev.buttons.map((b, i) => {
        if (i !== index) return b;
        if (patch.type && patch.type !== b.type) {
          return { ...BUTTON_DEFAULTS[patch.type], ...patch };
        }
        return { ...b, ...patch };
      }),
    }));
  };

  const removeButton = (index) => {
    setForm((prev) => ({
      ...prev,
      buttons: prev.buttons.filter((_, i) => i !== index),
    }));
  };

  const copyPayload = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
      setCopied(true);
      toast.success("Payload copied");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Could not copy payload");
    }
  };

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    try {
      if (bodyVars.invalid.length || headerVars.invalid.length) {
        toast.error("Use numbered variables like {{1}}, not named tokens.");
        return;
      }
      if (!bodyValidation.ok) {
        const first = bodyValidation.errors[0];
        toast.error(`${first.message} ${first.fix}`, { duration: 7000 });
        return;
      }
      const vc = countVars(form.body.text);
      const examples = Array.from({ length: vc }, (_, i) => {
        const v = form.body.examples[i];
        return v && String(v).trim() ? v : `Sample ${i + 1}`;
      });
      const previewHttp = String(form.header.mediaPreview || "").trim();
      if (previewHttp.startsWith("http") && form.name?.trim()) {
        try {
          const key = "propenu.wa.templateMediaPreview.v1";
          const map = JSON.parse(localStorage.getItem(key) || "{}");
          map[String(form.name).trim()] = previewHttp;
          localStorage.setItem(key, JSON.stringify(map));
        } catch {
          /* ignore */
        }
      }
      onSubmit?.(
        buildPayload({
          ...form,
          body: { ...form.body, examples },
        }),
      );
    } catch (err) {
      toast.error(err?.message || "Something went wrong", { duration: 7000 });
    }
  };

  const title =
    mode === "edit" ? "Edit WhatsApp Template" : "Create WhatsApp Template";
  const filteredLanguages = LANGUAGES.filter((l) => {
    const q = langQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      l.label.toLowerCase().includes(q) || l.code.toLowerCase().includes(q)
    );
  });
  const showTextHeader =
    mediaSampleValue === "NONE" || mediaSampleValue === "TEXT";
  const languageName =
    LANGUAGES.find((l) => l.code === form.language)?.label || "English";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/25 p-4 backdrop-blur-[2px]"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div className="flex h-[min(820px,88vh)] w-full max-w-[960px] flex-col overflow-hidden rounded-[28px] bg-[#f7fbf8] shadow-[0_24px_80px_rgba(16,185,129,0.16)]">
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-emerald-100 bg-white px-6 py-4">
          <div className="flex min-w-0 items-start gap-3">
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#27AE60] text-white shadow-[0_8px_18px_rgba(37,211,102,0.35)]">
              <MessageCircle size={20} />
            </div>
            <div className="min-w-0 pt-0.5">
              <h2 className="text-[18px] font-semibold leading-tight tracking-tight text-slate-900">
                {title}
              </h2>
              <p className="mt-1 text-[12px] text-slate-500">
                Submit a template to Meta for review.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-2 text-slate-400 transition hover:bg-emerald-50 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </header>

        <div
          ref={scrollRef}
          className="min-h-0 flex-1 overflow-y-auto px-5 pb-4 pt-4"
        >
          <section className="mb-4 flex items-start justify-between gap-4 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-lime-50 px-4 py-3.5 shadow-[0_8px_24px_rgba(16,185,129,0.10)]">
            <div className="flex min-w-0 items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#27AE60] text-white shadow-[0_6px_16px_rgba(37,211,102,0.35)]">
                <MessageCircle size={16} />
              </div>
              <div className="min-w-0">
                <h3 className="text-[14px] font-semibold text-emerald-900">
                  WhatsApp template composer
                </h3>
                <p className="mt-0.5 text-[12px] leading-relaxed text-emerald-800/70">
                  Create Meta templates with numbered variables like {"{{1}}"}.
                  Project carousel cards reuse the same title and description
                  variables for every project.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={applySample}
              className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-[#27AE60] px-3 text-[12px] font-semibold text-white shadow-[0_6px_16px_rgba(18,161,80,0.28)] hover:bg-[#1e8f4d]"
            >
              <Sparkles size={13} />
              Sample
            </button>
          </section>

          <section className={`${sectionCard} mb-4`}>
            <div className="mb-3">
              <p className={sectionKicker}>01 · Details</p>
              <h3 className={sectionTitle}>Template identity</h3>
            </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <div>
                  <label className={fieldLabel} htmlFor="tpl-name">
                    Template Name
                  </label>
                  <input
                    id="tpl-name"
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
                    placeholder="welcome_customer"
                    className={`${fieldControl} font-mono text-[13px]`}
                  />
                </div>

                <div>
                  <label className={fieldLabel}>Category</label>
                  <FieldMenu
                    open={openMenu === "category"}
                    onOpenChange={(next) =>
                      setOpenMenu(next ? "category" : "")
                    }
                    contentClassName="min-w-[320px]"
                    trigger={
                      <MenuButton open={openMenu === "category"}>
                        {categoryOption.label}
                      </MenuButton>
                    }
                  >
                    {CATEGORY_OPTIONS.map((opt) => {
                      const active = form.category === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setField("category", opt.value);
                            setOpenMenu("");
                          }}
                          className={`flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left ${
                            active ? "bg-emerald-50" : "hover:bg-slate-50"
                          }`}
                        >
                          <span
                            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                              active
                                ? "border-emerald-500 bg-emerald-500 text-white"
                                : "border-slate-300"
                            }`}
                          >
                            {active ? <Check size={11} strokeWidth={3} /> : null}
                          </span>
                          <span>
                            <span className="block text-[14px] font-semibold text-slate-800">
                              {opt.label}
                            </span>
                            <span className="mt-0.5 block text-[12px] leading-snug text-slate-500">
                              {opt.description}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                    <p className="px-3 pb-2 pt-1 text-[11px] leading-relaxed text-slate-400">
                      Choose the message&apos;s purpose. Meta reviews and may
                      price templates by category.
                    </p>
                  </FieldMenu>
                </div>

                <div>
                  <label className={fieldLabel}>Language</label>
                  <FieldMenu
                    open={openMenu === "language"}
                    onOpenChange={(next) => {
                      setOpenMenu(next ? "language" : "");
                      if (!next) setLangQuery("");
                    }}
                    contentClassName="min-w-[256px] p-0"
                    trigger={
                      <MenuButton open={openMenu === "language"}>
                        {languageLabel(form.language)}
                      </MenuButton>
                    }
                  >
                    <div className="sticky top-0 border-b border-slate-100 bg-white p-2">
                      <input
                        value={langQuery}
                        onChange={(e) => setLangQuery(e.target.value)}
                        placeholder="Search language"
                        className="h-8 w-full rounded-lg border border-slate-200 px-2.5 text-[12px] outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="py-1">
                      {filteredLanguages.map((l) => {
                        const active = form.language === l.code;
                        return (
                          <button
                            key={l.code}
                            type="button"
                            onClick={() => {
                              setField("language", l.code);
                              setLangQuery("");
                              setOpenMenu("");
                            }}
                            className={`flex w-full items-center justify-between px-3 py-2 text-left text-[13px] ${
                              active
                                ? "bg-slate-100 font-semibold text-slate-900"
                                : "text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            {l.label} ({l.code})
                          </button>
                        );
                      })}
                    </div>
                  </FieldMenu>
                </div>

                <div>
                  <label className={fieldLabel}>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Variables
                    </span>
                  </label>
                  <div className="flex min-h-10 flex-wrap items-center gap-1.5">
                    {bodyVars.numbered.length ? (
                      bodyVars.numbered.map((token) => (
                        <span
                          key={token}
                          className="rounded-full bg-emerald-50 px-2.5 py-1 font-mono text-[12px] font-semibold text-emerald-700"
                        >
                          {token}
                        </span>
                      ))
                    ) : (
                      <span className="text-[12px] text-slate-400">None yet</span>
                    )}
                  </div>
                </div>
          </div>
          </section>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="min-w-0 space-y-4">
              <section className={sectionCard}>
                <div className="mb-3">
                  <p className={sectionKicker}>02 · Header and buttons</p>
                  <h3 className={sectionTitle}>Media and customer actions</h3>
                  <p className={sectionHint}>
                    Add optional media and customer actions to the message.
                  </p>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className={fieldLabel}>Media sample (optional)</label>
                    <FieldMenu
                      open={openMenu === "media"}
                      onOpenChange={(next) => setOpenMenu(next ? "media" : "")}
                      contentClassName="min-w-[320px]"
                      trigger={
                        <MenuButton open={openMenu === "media"}>
                          <span className="flex min-w-0 items-center gap-2">
                            <MediaIcon
                              size={16}
                              className="shrink-0 text-slate-400"
                            />
                            <span className="truncate">
                              <span className="block text-[13px] font-medium text-slate-800">
                                {mediaOption.label}
                              </span>
                              <span className="block truncate text-[11px] text-slate-400">
                                {mediaOption.description}
                              </span>
                            </span>
                          </span>
                        </MenuButton>
                      }
                    >
                      {HEADER_MEDIA_OPTIONS.map((opt) => {
                        const Icon = MEDIA_ICONS[opt.value];
                        const active = mediaSampleValue === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setMediaSample(opt.value)}
                            className={`flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left ${
                              active ? "bg-emerald-50" : "hover:bg-slate-50"
                            }`}
                          >
                            <Icon
                              size={16}
                              className={`mt-0.5 shrink-0 ${
                                active ? "text-emerald-600" : "text-slate-400"
                              }`}
                            />
                            <span className="min-w-0 flex-1">
                              <span className="block text-[13px] font-semibold text-slate-800">
                                {opt.label}
                              </span>
                              <span className="block text-[12px] text-slate-500">
                                {opt.description}
                              </span>
                            </span>
                            {active ? (
                              <Check
                                size={16}
                                className="mt-0.5 text-emerald-600"
                              />
                            ) : null}
                          </button>
                        );
                      })}
                    </FieldMenu>
                  </div>

                  <div>
                    <label className={fieldLabel}>Buttons (optional)</label>
                    <div className="flex items-center gap-2">
                      <span className="hidden text-[12px] text-slate-400 sm:inline">
                        Quick reply, website, or phone
                      </span>
                      <FieldMenu
                        open={openMenu === "add-button"}
                        onOpenChange={(next) =>
                          setOpenMenu(next ? "add-button" : "")
                        }
                        align="end"
                        contentClassName="min-w-[280px]"
                        trigger={
                          <button
                            type="button"
                            disabled={form.buttons.length >= 10}
                            className="ml-auto inline-flex h-10 items-center gap-1.5 rounded-full bg-[#27AE60] px-3.5 text-[13px] font-semibold text-white shadow-[0_6px_16px_rgba(18,161,80,0.28)] hover:bg-[#1e8f4d] disabled:opacity-50"
                          >
                            <Plus size={15} />
                            Add button
                            <ChevronDown
                              size={14}
                              className={`transition ${
                                openMenu === "add-button" ? "rotate-180" : ""
                              }`}
                            />
                          </button>
                        }
                      >
                        {META_BUTTON_OPTIONS.map((opt) => {
                          const Icon = BUTTON_ICONS[opt.type];
                          return (
                            <button
                              key={opt.type}
                              type="button"
                              onClick={() => addButton(opt.type)}
                              className="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-slate-50"
                            >
                              <Icon
                                size={16}
                                className="mt-0.5 shrink-0 text-slate-400"
                              />
                              <span>
                                <span className="block text-[13px] font-semibold text-slate-800">
                                  {opt.label}
                                </span>
                                <span className="block text-[12px] text-slate-500">
                                  {opt.description}
                                </span>
                              </span>
                            </button>
                          );
                        })}
                      </FieldMenu>
                    </div>
                  </div>
                </div>

                {["IMAGE", "VIDEO", "DOCUMENT"].includes(mediaSampleValue) ? (
                  <div className="mt-3">
                    {form.header.mediaHandle || form.header.mediaPreview ? (
                      <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-600">
                          <MediaIcon size={18} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] font-semibold text-emerald-800">
                            {form.header.mediaHandle || "Sample attached"}
                          </p>
                          <p className="text-[12px] text-emerald-600">
                            {mediaOption.label} header ready
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              header: {
                                ...prev.header,
                                mediaHandle: "",
                                mediaPreview: null,
                              },
                            }))
                          }
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-rose-600"
                        >
                          <X size={15} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={uploadingMedia}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setDragOver(true);
                        }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setDragOver(false);
                          uploadMediaSample(e.dataTransfer.files?.[0]);
                        }}
                        onClick={() => mediaInputRef.current?.click()}
                        className={`flex w-full flex-col items-center justify-center gap-1 rounded-2xl border border-dashed px-4 py-8 text-center transition ${
                          dragOver
                            ? "border-emerald-400 bg-emerald-50"
                            : "border-slate-300 bg-slate-50/60 hover:border-emerald-300"
                        }`}
                      >
                        {uploadingMedia ? (
                          <Loader2
                            size={20}
                            className="animate-spin text-emerald-600"
                          />
                        ) : (
                          <Upload size={20} className="text-slate-400" />
                        )}
                        <p className="text-[13px] font-medium text-slate-600">
                          Drag and drop to upload
                        </p>
                        <p className="text-[13px] text-slate-500">
                          Or{" "}
                          <span className="font-semibold text-sky-600">
                            choose a file on your device
                          </span>
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {MEDIA_LIMITS[mediaSampleValue]?.hint}
                        </p>
                      </button>
                    )}
                    <input
                      ref={mediaInputRef}
                      type="file"
                      accept={MEDIA_ACCEPT[mediaSampleValue]}
                      className="hidden"
                      onChange={(e) => {
                        uploadMediaSample(e.target.files?.[0]);
                        e.target.value = "";
                      }}
                    />
                  </div>
                ) : null}

                {mediaSampleValue === "LOCATION" ? (
                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <input
                      value={form.header.locationName || ""}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          header: {
                            ...prev.header,
                            locationName: e.target.value,
                          },
                        }))
                      }
                      placeholder="Propenu office"
                      className={fieldControl}
                    />
                    <input
                      value={form.header.locationAddress || ""}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          header: {
                            ...prev.header,
                            locationAddress: e.target.value,
                          },
                        }))
                      }
                      placeholder="Hyderabad, Telangana"
                      className={fieldControl}
                    />
                  </div>
                ) : null}

                {form.buttons.length ? (
                  <div className="mt-4 space-y-3">
                    {form.buttons.map((btn, i) => {
                      const lockedText = btn.type === "SHARE_CONTACT";
                      return (
                        <div
                          key={`${btn.type}-${i}`}
                          className="rounded-2xl border border-slate-200 bg-white p-3.5"
                        >
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)_auto]">
                            <div>
                              <label className={fieldLabel}>Type</label>
                              <select
                                value={btn.type}
                                onChange={(e) =>
                                  updateButton(i, { type: e.target.value })
                                }
                                className={fieldControl}
                              >
                                {META_BUTTON_OPTIONS.map((opt) => (
                                  <option key={opt.type} value={opt.type}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <div className="mb-1.5 flex items-center justify-between">
                                <label className="text-[13px] font-medium text-slate-600">
                                  Button text
                                </label>
                                <span className="text-[11px] text-slate-400">
                                  {(btn.text || "").length}/25
                                </span>
                              </div>
                              <input
                                maxLength={25}
                                disabled={lockedText}
                                value={btn.text}
                                onChange={(e) =>
                                  updateButton(i, { text: e.target.value })
                                }
                                className={`${fieldControl} disabled:bg-slate-50 disabled:text-slate-400`}
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeButton(i)}
                              className="mt-7 rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>

                          {btn.type === "URL" ? (
                            <div className="mt-3">
                              <label className={fieldLabel}>Website URL</label>
                              <input
                                value={btn.url || ""}
                                onChange={(e) =>
                                  updateButton(i, { url: e.target.value })
                                }
                                placeholder="https://example.com"
                                className={fieldControl}
                              />
                            </div>
                          ) : null}
                          {btn.type === "VOICE_CALL" ? (
                            <div className="mt-3">
                              <label className={fieldLabel}>Active minutes</label>
                              <input
                                value={btn.ttlMinutes || "10080"}
                                onChange={(e) =>
                                  updateButton(i, {
                                    ttlMinutes: e.target.value.replace(/\D/g, ""),
                                  })
                                }
                                placeholder="10080"
                                className={fieldControl}
                              />
                            </div>
                          ) : null}
                          {btn.type === "PHONE_NUMBER" ? (
                            <div className="mt-3">
                              <label className={fieldLabel}>Phone number</label>
                              <input
                                value={btn.phone || ""}
                                onChange={(e) =>
                                  updateButton(i, { phone: e.target.value })
                                }
                                placeholder="+919999999999"
                                className={fieldControl}
                              />
                            </div>
                          ) : null}
                          {btn.type === "FLOW" ? (
                            <div className="mt-3">
                              <label className={fieldLabel}>Flow ID</label>
                              <input
                                value={btn.flowId || ""}
                                onChange={(e) =>
                                  updateButton(i, { flowId: e.target.value })
                                }
                                placeholder="Meta Flow ID"
                                className={fieldControl}
                              />
                            </div>
                          ) : null}
                          {btn.type === "COPY_CODE" ? (
                            <div className="mt-3">
                              <label className={fieldLabel}>Example code</label>
                              <input
                                value={btn.exampleCode || ""}
                                onChange={(e) =>
                                  updateButton(i, {
                                    exampleCode: e.target.value,
                                  })
                                }
                                placeholder="SAVE20"
                                className={fieldControl}
                              />
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </section>

              {showTextHeader ? (
                <section className={sectionCard}>
                  <div className="mb-3">
                    <p className={sectionKicker}>Header · Optional</p>
                  </div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className={fieldLabel}>
                      Short heading
                    </label>
                    <span className="text-[11px] text-slate-400">
                      {(form.header.text || "").length}/60
                    </span>
                  </div>
                  <input
                    ref={headerRef}
                    maxLength={60}
                    value={form.header.text || ""}
                    onChange={(e) => setHeaderText(e.target.value)}
                    placeholder={`Add a short heading in ${languageName}`}
                    className={fieldControl}
                  />
                  {headerVars.numbered.length > 0 ? (
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <input
                        value={form.header.example || ""}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            header: { ...prev.header, example: e.target.value },
                          }))
                        }
                        placeholder="Sample value for header {{1}}"
                        className={fieldControl}
                      />
                      <button
                        type="button"
                        onClick={insertHeaderVar}
                        className="shrink-0 text-[12px] font-semibold text-emerald-600"
                      >
                        + Add variable
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={insertHeaderVar}
                      className="mt-2 text-[12px] font-semibold text-emerald-600"
                    >
                      + Add variable
                    </button>
                  )}
                </section>
              ) : null}

              <section className={sectionCard}>
                <div className="mb-3">
                  <p className={sectionKicker}>03 · Message</p>
                  <h3 className={sectionTitle}>Body and footer</h3>
                </div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className={fieldLabel}>Body</label>
                  <span className="text-[11px] text-slate-400">
                    {(form.body.text || "").length}/1024
                  </span>
                </div>
                <div className="overflow-hidden rounded-2xl border border-slate-200 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/15">
                  <textarea
                    ref={bodyRef}
                    rows={5}
                    maxLength={1024}
                    value={form.body.text}
                    onChange={(e) => setBodyText(e.target.value)}
                    placeholder={`Hello {{1}}, welcome to Propenu. Your service city is {{2}}.`}
                    className="w-full resize-y border-0 px-3.5 py-3 text-[14px] leading-relaxed text-slate-800 outline-none"
                  />
                  <div className="flex flex-wrap items-center gap-1 border-t border-slate-100 px-2 py-1.5">
                    {[
                      { icon: Bold, label: "Bold", before: "*", after: "*" },
                      { icon: Italic, label: "Italic", before: "_", after: "_" },
                      {
                        icon: Strikethrough,
                        label: "Strikethrough",
                        before: "~",
                        after: "~",
                      },
                      {
                        icon: Code2,
                        label: "Monospace",
                        before: "```",
                        after: "```",
                      },
                    ].map(({ icon: Icon, label, before, after }) => (
                      <button
                        key={label}
                        type="button"
                        title={label}
                        onClick={() =>
                          wrapSelection(
                            bodyRef.current,
                            form.body.text,
                            before,
                            after,
                            setBodyText,
                          )
                        }
                        className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                      >
                        <Icon size={14} />
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={insertBodyVar}
                      className="ml-auto inline-flex items-center gap-1 rounded-md px-2 py-1 text-[12px] font-semibold text-emerald-600 hover:bg-emerald-50"
                    >
                      <Plus size={13} />
                      Add variable
                    </button>
                  </div>
                </div>
                <p className="mt-2 text-[12px] leading-relaxed text-slate-400">
                  Use numbered variables only, like {"{{1}}"} and {"{{2}}"}. Map
                  them to CRM fields after template approval.
                </p>

                {bodyVars.invalid.length > 0 ? (
                  <p className="mt-2 text-[12px] font-semibold text-rose-600">
                    Use numbered variables like {"{{1}}"}, not {bodyVars.invalid[0]}.
                  </p>
                ) : null}

                {form.body.text.trim() && !bodyValidation.ok ? (
                  <div className="mt-3 space-y-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-rose-600">
                      Fix before submit
                    </p>
                    {bodyValidation.errors.map((err) => (
                      <div key={err.code} className="text-[12px] text-rose-800">
                        <p className="font-semibold">{err.message}</p>
                        <p className="mt-0.5 text-rose-700/90">{err.fix}</p>
                      </div>
                    ))}
                  </div>
                ) : null}

                {bodyVars.numbered.length > 0 ? (
                  <div className="mt-3 space-y-2">
                    {bodyVars.numbered.map((token, i) => (
                      <div
                        key={token}
                        className="grid grid-cols-[64px_minmax(0,1fr)] items-center gap-2"
                      >
                        <span className="rounded-lg bg-slate-100 px-2 py-2 text-center font-mono text-[11px] font-semibold text-slate-600">
                          {token}
                        </span>
                        <input
                          value={form.body.examples[i] || ""}
                          onChange={(e) => {
                            const next = [...form.body.examples];
                            next[i] = e.target.value;
                            setForm((prev) => ({
                              ...prev,
                              body: { ...prev.body, examples: next },
                            }));
                          }}
                          placeholder={
                            i === 0 ? "Customer name" : `Sample for ${token}`
                          }
                          className={fieldControl}
                        />
                      </div>
                    ))}
                  </div>
                ) : null}
              <div className="mt-4 border-t border-slate-100 pt-4">
                <div className="mb-1.5 flex items-center justify-between">
                  <label className={fieldLabel}>Footer · Optional</label>
                  <span className="text-[11px] text-slate-400">
                    {(form.footer.text || "").length}/60
                  </span>
                </div>
                <input
                  maxLength={60}
                  value={form.footer.text}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      footer: {
                        text: e.target.value,
                        enabled: Boolean(e.target.value.trim()),
                      },
                    }))
                  }
                  placeholder="Reply STOP to opt out"
                  className={fieldControl}
                />
              </div>
              </section>
            </div>

            <aside className="min-w-0 lg:sticky lg:top-0 lg:self-start">
              <div className="rounded-2xl border border-emerald-100 bg-white p-3.5 shadow-[0_8px_24px_rgba(16,185,129,0.10)]">
              <p className={`${sectionKicker} mb-1`}>04 · Live preview</p>
              <h3 className="mb-3 text-[14px] font-semibold text-slate-900">
                Preview
              </h3>
              <WhatsAppTemplatePreview
                headerFormat={form.header.enabled ? form.header.format : ""}
                headerText={previewHeaderText}
                headerImage={
                  form.header.enabled && form.header.format === "IMAGE"
                    ? form.header.mediaPreview || form.header.mediaHandle
                    : ""
                }
                locationName={form.header.locationName}
                locationAddress={form.header.locationAddress}
                bodyText={previewBody || ""}
                footerText={form.footer.enabled ? form.footer.text : ""}
                buttons={form.buttons}
                timeLabel={nowLabel()}
              />
              <button
                type="button"
                onClick={() => setPayloadOpen((v) => !v)}
                className="mt-3 flex w-full items-center justify-between text-left text-[12px] font-semibold text-emerald-700 hover:text-emerald-800"
              >
                Payload checkout
                <ChevronDown
                  size={14}
                  className={`transition ${payloadOpen ? "rotate-180" : ""}`}
                />
              </button>
              {payloadOpen ? (
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={copyPayload}
                    className="mb-2 inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100"
                  >
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    Copy
                  </button>
                  <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-all rounded-xl bg-slate-900 p-3 font-mono text-[11px] leading-relaxed text-emerald-100">
                    {JSON.stringify(payload, null, 2)}
                  </pre>
                </div>
              ) : null}
              </div>
            </aside>
          </div>
        </div>

        <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-emerald-100 bg-white px-6 py-3">
          <p
            className={`text-[13px] ${
              canSubmit ? "text-emerald-700" : "font-medium text-slate-400"
            }`}
          >
            {statusHint}
          </p>
          <button
            type="button"
            disabled={!canSubmit || submitting}
            onClick={handleSubmit}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#27AE60] px-5 text-[14px] font-semibold text-white shadow-[0_8px_20px_rgba(18,161,80,0.28)] transition hover:bg-[#1e8f4d] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
          >
            {submitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <FileText size={16} />
            )}
            {submitting ? "Submitting…" : "Submit Template"}
          </button>
        </footer>
      </div>
    </div>
  );
}

export default TemplateComposerModal;
