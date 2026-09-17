import { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  Copy,
  FileText,
  Image as ImageIcon,
  Loader2,
  MessageCircle,
  Sparkles,
  Tag,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { EMPTY_FORM } from "../common/EmptyForm";
import { CATEGORIES, LANGUAGES } from "../utils/constants";
import { uploadWhatsAppCampaignImage } from "../../../features/user/userService";
import {
  buildPayload,
  validateTemplateBody,
} from "../utils/payloadBuilder";
import { applyVars, countVars } from "../utils/helper";

const TEMPLATE_TYPES = [
  {
    id: "text",
    label: "Text",
    description: "Simple approved message with variables.",
  },
  {
    id: "media",
    label: "Media",
    description: "One image or document header with body text.",
  },
  {
    id: "quick_replies",
    label: "Quick replies",
    description: "Tap buttons that return text replies.",
  },
  {
    id: "cta",
    label: "CTA buttons",
    description: "Website URL and phone call buttons.",
  },
  {
    id: "carousel",
    label: "Project carousel",
    description: "Multiple project cards with shared title/description vars.",
  },
  {
    id: "authentication",
    label: "Authentication",
    description: "OTP / copy-code verification template.",
  },
];

const SAMPLE = {
  name: "welcome_customer",
  language: "en",
  category: "MARKETING",
  templateType: "text",
  header: {
    enabled: false,
    format: "TEXT",
    text: "",
    mediaHandle: "",
    mediaPreview: null,
  },
  body: {
    text: "Hi {{1}}, welcome to Propenu. Your service city is {{2}}. Thank you!",
    examples: ["Ramana", "Hyderabad"],
  },
  footer: { enabled: true, text: "Reply STOP to opt out" },
  buttons: [],
};

const fieldLabel =
  "mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.04em] text-slate-500";
const fieldControl =
  "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15";
const sectionCard =
  "rounded-xl border border-slate-200/90 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]";

function deepMergeForm(initial) {
  const base = {
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
      ? initial.buttons.map((b) => ({ ...b }))
      : [],
  };
  if (!base.templateType) {
    if (base.category === "AUTHENTICATION") base.templateType = "authentication";
    else if (base.header?.enabled && base.header.format !== "TEXT")
      base.templateType = "media";
    else if (base.buttons?.some((b) => b.type === "QUICK_REPLY"))
      base.templateType = "quick_replies";
    else if (
      base.buttons?.some((b) => b.type === "URL" || b.type === "PHONE_NUMBER")
    )
      base.templateType = "cta";
    else base.templateType = "text";
  }
  return base;
}

function extractVars(text = "") {
  const numbered = [...(String(text).match(/\{\{\d+\}\}/g) || [])];
  const invalid = [
    ...(String(text).match(/\{\{(?!\d+\})[^}]+\}\}/g) || []),
  ];
  return {
    numbered: [...new Set(numbered)],
    invalid: [...new Set(invalid)],
    nextIndex: countVars(text) + 1,
  };
}

function renderPreviewHtml(text) {
  return String(text || "")
    .replace(/\*(.*?)\*/g, "<strong>$1</strong>")
    .replace(/_(.*?)_/g, "<em>$1</em>")
    .replace(/~(.*?)~/g, "<s>$1</s>")
    .replace(/\n/g, "<br/>");
}

/**
 * Create / Edit WhatsApp template composer — industry-aligned layout.
 */
export function TemplateComposerModal({
  mode = "create", // create | edit
  initial = EMPTY_FORM,
  submitting = false,
  onClose,
  onSubmit,
}) {
  const [form, setForm] = useState(() => deepMergeForm(initial));
  const [typeOpen, setTypeOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [payloadOpen, setPayloadOpen] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const bodyRef = useRef(null);
  const typeRef = useRef(null);
  const mediaInputRef = useRef(null);

  const uploadMediaSample = async (file) => {
    if (!file) return;
    if (!file.type?.startsWith("image/")) {
      toast.error("Please choose an image file");
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
          format: "IMAGE",
          mediaPreview: localPreview,
        },
      }));
      const res = await uploadWhatsAppCampaignImage(file);
      const publicUrl = res?.data?.url || "";
      if (!publicUrl) throw new Error("Upload did not return a URL");
      setForm((prev) => ({
        ...prev,
        header: {
          ...prev.header,
          enabled: true,
          format: "IMAGE",
          mediaHandle: publicUrl,
          mediaPreview: publicUrl,
        },
      }));
      if (localPreview.startsWith("blob:")) URL.revokeObjectURL(localPreview);
      toast.success("Media uploaded — URL added");
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err?.message || "Image upload failed",
      );
    } finally {
      setUploadingMedia(false);
    }
  };

  useEffect(() => {
    setForm(deepMergeForm(initial));
  }, [initial]);

  useEffect(() => {
    const onDoc = (e) => {
      if (typeRef.current && !typeRef.current.contains(e.target)) {
        setTypeOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const setField = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const vars = useMemo(() => extractVars(form.body.text), [form.body.text]);

  const bodyValidation = useMemo(
    () => validateTemplateBody(form.body.text),
    [form.body.text],
  );

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
        soft.body.text = "Your template message body";
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

  const previewText = useMemo(() => {
    const examples = Array.from(
      { length: countVars(form.body.text) },
      (_, i) => form.body.examples[i] || `{{${i + 1}}}`,
    );
    return applyVars(form.body.text, examples) || "WhatsApp message preview";
  }, [form.body.text, form.body.examples]);

  const selectedType =
    TEMPLATE_TYPES.find((t) => t.id === form.templateType) || TEMPLATE_TYPES[0];

  const canSubmit =
    Boolean(form.name?.trim()) &&
    Boolean(form.body.text?.trim()) &&
    vars.invalid.length === 0 &&
    bodyValidation.ok;

  const statusHint = !form.name?.trim()
    ? "Add a template name to continue."
    : !form.body.text?.trim()
      ? "Add a message body to continue."
      : !bodyValidation.ok
        ? bodyValidation.errors[0]?.message || "Fix variable issues to continue."
        : vars.invalid.length
          ? "Use numbered variables like {{1}}, not named tokens."
          : "Ready to submit to Meta for review.";

  const syncExamples = (text, examples) => {
    const n = countVars(text);
    return Array.from({ length: n }, (_, i) => examples[i] || "");
  };

  const setBodyText = (text) => {
    setForm((prev) => ({
      ...prev,
      body: {
        text,
        examples: syncExamples(text, prev.body.examples),
      },
    }));
  };

  const insertNextVar = () => {
    const el = bodyRef.current;
    const n = Math.max(1, vars.nextIndex);
    const token = `{{${n}}}`;
    const current = form.body.text || "";
    if (!el) {
      setBodyText(`${current}${token}`);
      return;
    }
    const start = el.selectionStart ?? current.length;
    const end = el.selectionEnd ?? current.length;
    const next = current.slice(0, start) + token + current.slice(end);
    setBodyText(next);
    setTimeout(() => {
      el.focus();
      const pos = start + token.length;
      el.setSelectionRange(pos, pos);
    }, 0);
  };

  const applySample = () => {
    setForm(deepMergeForm(SAMPLE));
    toast.success("Sample template loaded");
  };

  const selectType = (typeId) => {
    setForm((prev) => {
      const next = { ...prev, templateType: typeId };
      if (typeId === "media") {
        next.header = {
          ...prev.header,
          enabled: true,
          format: prev.header.format === "TEXT" ? "IMAGE" : prev.header.format,
        };
      } else if (typeId === "text" || typeId === "authentication") {
        next.header = { ...EMPTY_FORM.header };
        if (typeId === "authentication") next.category = "AUTHENTICATION";
      } else if (typeId === "quick_replies") {
        next.buttons =
          prev.buttons?.length > 0
            ? prev.buttons
            : [
                { type: "QUICK_REPLY", text: "Yes", url: "", phone: "" },
                { type: "QUICK_REPLY", text: "No", url: "", phone: "" },
              ];
      } else if (typeId === "cta") {
        next.buttons =
          prev.buttons?.some((b) => b.type === "URL")
            ? prev.buttons
            : [
                {
                  type: "URL",
                  text: "For More Details",
                  url: "https://propenu.com/",
                  phone: "",
                },
              ];
      }
      return next;
    });
    setTypeOpen(false);
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
      if (vars.invalid.length) {
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
      const payloadOut = buildPayload({
        ...form,
        body: { ...form.body, examples },
      });
      onSubmit?.(payloadOut);
    } catch (err) {
      toast.error(err?.message || "Something went wrong", { duration: 7000 });
    }
  };

  const title =
    mode === "edit" ? "Edit Template Copy" : "Create WhatsApp Template";
  const subtitle =
    mode === "edit"
      ? "Meta templates cannot be changed after approval; submit a revised copy."
      : "Submit a template to Meta for review.";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 backdrop-blur-[2px] md:items-center md:p-5"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div className="flex h-[100dvh] w-full max-w-6xl flex-col overflow-hidden bg-white shadow-2xl md:h-[min(900px,92vh)] md:rounded-2xl">
        {/* Header */}
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 md:px-6">
          <div className="flex min-w-0 items-start gap-3">
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
              <MessageCircle size={20} />
            </div>
            <div className="min-w-0 pt-0.5">
              <h2 className="text-[17px] font-bold leading-tight tracking-tight text-slate-900">
                {title}
              </h2>
              <p className="mt-1 text-[13px] leading-snug text-slate-500">
                {subtitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="mt-0.5 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </header>

        {/* Tip strip */}
        <div className="shrink-0 border-b border-emerald-100/80 bg-emerald-50/70 px-5 py-3 md:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#25D366] text-white">
                <MessageCircle size={14} />
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-emerald-950">
                  WhatsApp template composer
                </p>
                <p className="mt-0.5 text-[12px] leading-relaxed text-emerald-900/75">
                  Use numbered variables like {"{{1}}"}. After approval, map
                  them to CRM fields when sending.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={applySample}
              className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 self-start rounded-lg border border-emerald-200 bg-white px-3 text-[12px] font-semibold text-emerald-700 transition hover:bg-emerald-50 sm:self-auto"
            >
              <Sparkles size={13} />
              Sample
            </button>
          </div>
        </div>

        {/* Two-pane workspace — no page-level horizontal scroll */}
        <div className="grid min-h-0 flex-1 overflow-hidden lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
          {/* LEFT: form */}
          <div className="min-h-0 overflow-y-auto overflow-x-hidden border-b border-slate-100 px-5 py-5 md:px-6 lg:border-b-0 lg:border-r lg:border-slate-100">
            <div className="mx-auto flex max-w-xl flex-col gap-5">
              {/* Identity */}
              <section className={sectionCard}>
                <div className="mb-4">
                  <h3 className="text-[13px] font-semibold text-slate-900">
                    Template details
                  </h3>
                  <p className="mt-0.5 text-[12px] text-slate-500">
                    Name, category, and language sent to Meta.
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  <div>
                    <label className={fieldLabel} htmlFor="tpl-name">
                      Template name
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

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="min-w-0">
                      <label className={fieldLabel} htmlFor="tpl-category">
                        Category
                      </label>
                      <select
                        id="tpl-category"
                        value={form.category}
                        onChange={(e) => setField("category", e.target.value)}
                        className={fieldControl}
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="min-w-0">
                      <label className={fieldLabel} htmlFor="tpl-language">
                        Language
                      </label>
                      <select
                        id="tpl-language"
                        value={form.language}
                        onChange={(e) => setField("language", e.target.value)}
                        className={fieldControl}
                      >
                        {LANGUAGES.map((l) => (
                          <option key={l.code} value={l.code}>
                            {l.label || l.code}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </section>

              {/* Template type */}
              <section className={sectionCard} ref={typeRef}>
                <label className={fieldLabel}>Template type</label>
                <button
                  type="button"
                  onClick={() => setTypeOpen((v) => !v)}
                  className="mt-0.5 flex w-full items-start justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50/60 px-3.5 py-3 text-left transition hover:border-emerald-300 hover:bg-emerald-50/40"
                >
                  <div className="min-w-0">
                    <p className="text-[14px] font-semibold text-slate-900">
                      {selectedType.label}
                    </p>
                    <p className="mt-0.5 text-[12px] leading-snug text-slate-500">
                      {selectedType.description}
                    </p>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`mt-1 shrink-0 text-slate-400 transition ${
                      typeOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {typeOpen ? (
                  <div className="mt-2 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                    {TEMPLATE_TYPES.map((t) => {
                      const active = t.id === form.templateType;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => selectType(t.id)}
                          className={`flex w-full items-start gap-2.5 border-b border-slate-100 px-3.5 py-2.5 text-left last:border-0 hover:bg-slate-50 ${
                            active ? "bg-emerald-50" : ""
                          }`}
                        >
                          <span
                            className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                              active
                                ? "border-emerald-500 bg-emerald-500 text-white"
                                : "border-slate-300"
                            }`}
                          >
                            {active ? (
                              <Check size={10} strokeWidth={3} />
                            ) : null}
                          </span>
                          <span className="min-w-0">
                            <span className="block text-[13px] font-semibold text-slate-800">
                              {t.label}
                            </span>
                            <span className="block text-[12px] text-slate-500">
                              {t.description}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </section>

              {form.templateType === "media" ? (
                <section className={sectionCard}>
                  <div className="mb-3 flex items-center gap-2">
                    <ImageIcon size={14} className="text-slate-500" />
                    <h3 className="text-[13px] font-semibold text-slate-900">
                      Header image
                    </h3>
                  </div>
                  <p className="mb-3 text-[12px] text-slate-500">
                    Shown only for Media templates. Upload fills the sample URL
                    automatically.
                  </p>
                  <button
                    type="button"
                    disabled={uploadingMedia}
                    onClick={() => mediaInputRef.current?.click()}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-[13px] font-semibold text-slate-600 hover:border-emerald-300 disabled:opacity-60"
                  >
                    {uploadingMedia ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        Uploading…
                      </>
                    ) : (
                      <>
                        <Upload size={15} />
                        Upload header image
                      </>
                    )}
                  </button>
                  <input
                    ref={mediaInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      uploadMediaSample(e.target.files?.[0]);
                      e.target.value = "";
                    }}
                  />
                  <input
                    type="url"
                    value={form.header.mediaHandle || ""}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        header: {
                          ...prev.header,
                          enabled: true,
                          format: "IMAGE",
                          mediaHandle: e.target.value,
                          mediaPreview: e.target.value,
                        },
                      }))
                    }
                    placeholder="Public image URL (filled after upload)"
                    className={`${fieldControl} mt-3 text-[12px]`}
                  />
                  {form.header.mediaPreview || form.header.mediaHandle ? (
                    <img
                      src={form.header.mediaPreview || form.header.mediaHandle}
                      alt=""
                      className="mt-3 max-h-40 w-full rounded-lg border border-slate-200 object-contain bg-slate-50"
                    />
                  ) : null}
                </section>
              ) : null}

              {/* Message body */}
              <section className={sectionCard}>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-[13px] font-semibold text-slate-900">
                      Message body
                    </h3>
                    <p className="mt-0.5 text-[12px] text-slate-500">
                      Up to 1024 characters
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={insertNextVar}
                    className="inline-flex h-8 shrink-0 items-center rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 font-mono text-[12px] font-semibold text-emerald-700 transition hover:bg-emerald-100"
                  >
                    + {`{{${Math.max(1, vars.nextIndex)}}}`}
                  </button>
                </div>

                <textarea
                  ref={bodyRef}
                  rows={8}
                  maxLength={1024}
                  value={form.body.text}
                  onChange={(e) => setBodyText(e.target.value)}
                  placeholder="Hello {{1}}, your service is scheduled for {{2}}."
                  className="w-full resize-y rounded-lg border border-slate-200 px-3.5 py-3 text-[13px] leading-relaxed text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
                />

                <p className="mt-2.5 text-[12px] leading-relaxed text-slate-500">
                  Use numbered variables only ({"{{1}}"}, {"{{2}}"}). Map them
                  to CRM fields after approval.
                </p>

                {vars.invalid.length > 0 ? (
                  <p className="mt-2 text-[12px] font-semibold text-rose-600">
                    Use numbered variables like {"{{1}}"}, not {vars.invalid[0]}
                    .
                  </p>
                ) : null}

                {form.body.text.trim() && !bodyValidation.ok ? (
                  <div className="mt-3 space-y-2 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-3">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-rose-600">
                      Fix before submit
                    </p>
                    {bodyValidation.errors.map((err) => (
                      <div key={err.code} className="text-[12px] text-rose-800">
                        <p className="font-semibold">{err.message}</p>
                        <p className="mt-0.5 text-rose-700/90">{err.fix}</p>
                      </div>
                    ))}
                    <div className="rounded-md border border-rose-100 bg-white/80 px-3 py-2 text-[11px] leading-relaxed text-slate-600">
                      <p className="font-semibold text-slate-800">
                        Good example
                      </p>
                      <p className="mt-0.5 font-mono text-[11px] text-slate-700">
                        Hi {"{{1}}"}, your visit is booked in {"{{2}}"}. See you
                        soon!
                      </p>
                      <p className="mt-2 font-semibold text-slate-800">
                        Rejected by Meta
                      </p>
                      <p className="mt-0.5 font-mono text-[11px] text-rose-600">
                        {"{{1}}"} welcome… · …city is {"{{2}}"} · Hi {"{{1}}"}
                        {"{{2}}"}
                      </p>
                    </div>
                  </div>
                ) : null}

                {vars.numbered.length > 0 ? (
                  <div className="mt-4 space-y-2.5 border-t border-slate-100 pt-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.04em] text-slate-500">
                      Variable samples
                    </p>
                    {vars.numbered.map((token, i) => (
                      <div
                        key={token}
                        className="grid grid-cols-[56px_minmax(0,1fr)] items-center gap-2.5"
                      >
                        <span className="rounded-md bg-slate-100 px-1.5 py-1.5 text-center font-mono text-[11px] font-semibold text-slate-600">
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
                          placeholder={`Sample for ${token}`}
                          className={fieldControl}
                        />
                      </div>
                    ))}
                  </div>
                ) : null}
              </section>

              {/* Footer text */}
              <section className={sectionCard}>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-[13px] font-semibold text-slate-900">
                      Footer
                    </h3>
                    <p className="mt-0.5 text-[12px] text-slate-500">
                      Optional small text under the message
                    </p>
                  </div>
                  <label className="inline-flex cursor-pointer items-center gap-2 text-[12px] font-medium text-slate-600">
                    <input
                      type="checkbox"
                      checked={form.footer.enabled}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          footer: {
                            ...prev.footer,
                            enabled: e.target.checked,
                          },
                        }))
                      }
                      className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    Enable
                  </label>
                </div>
                <input
                  disabled={!form.footer.enabled}
                  value={form.footer.text}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      footer: { ...prev.footer, text: e.target.value },
                    }))
                  }
                  placeholder="Reply STOP to opt out"
                  className={`${fieldControl} disabled:bg-slate-50 disabled:text-slate-400`}
                />
              </section>
            </div>
          </div>

          {/* RIGHT: preview + payload */}
          <div className="flex min-h-0 flex-col overflow-y-auto overflow-x-hidden bg-slate-50/80 px-5 py-5 md:px-6">
            <div className="flex flex-col gap-4">
              {/* Variables */}
              <section className={sectionCard}>
                <div className="mb-3 flex items-center gap-2">
                  <Tag size={14} className="text-emerald-600" />
                  <h3 className="text-[13px] font-semibold text-slate-900">
                    Variables
                  </h3>
                </div>
                {vars.numbered.length === 0 && vars.invalid.length === 0 ? (
                  <p className="text-[12px] text-slate-400">
                    No variables yet — insert {"{{1}}"} in the message body.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {vars.numbered.map((v) => (
                      <span
                        key={v}
                        className="rounded-md bg-emerald-50 px-2 py-1 font-mono text-[11px] font-semibold text-emerald-700"
                      >
                        {v}
                      </span>
                    ))}
                    {vars.invalid.map((v) => (
                      <span
                        key={v}
                        className="rounded-md bg-rose-50 px-2 py-1 font-mono text-[11px] font-semibold text-rose-600"
                      >
                        Invalid {v}
                      </span>
                    ))}
                  </div>
                )}
              </section>

              {/* Preview */}
              <section className={sectionCard}>
                <div className="mb-3">
                  <h3 className="text-[13px] font-semibold text-slate-900">
                    Live preview
                  </h3>
                  <p className="mt-0.5 text-[12px] text-slate-500">
                    How the message will appear in WhatsApp
                  </p>
                </div>
                <div className="rounded-xl bg-[#e5ddd5] p-4">
                  <div className="ml-auto max-w-[280px] rounded-lg rounded-tr-sm bg-[#dcf8c6] px-3 py-2.5 shadow-sm">
                    <p
                      className="whitespace-pre-wrap break-words text-[13px] leading-relaxed text-slate-800"
                      dangerouslySetInnerHTML={{
                        __html: renderPreviewHtml(previewText),
                      }}
                    />
                    {form.footer.enabled && form.footer.text ? (
                      <p className="mt-1.5 break-words text-[11px] text-slate-500">
                        {form.footer.text}
                      </p>
                    ) : null}
                    <p className="mt-1 text-right text-[10px] text-slate-400">
                      Preview
                    </p>
                  </div>
                </div>
              </section>

              {/* Payload — collapsed by default to avoid nested scroll clutter */}
              <section className={sectionCard}>
                <button
                  type="button"
                  onClick={() => setPayloadOpen((v) => !v)}
                  className="flex w-full items-start justify-between gap-3 text-left"
                >
                  <div className="min-w-0">
                    <h3 className="text-[13px] font-semibold text-slate-900">
                      Payload check
                    </h3>
                    <p className="mt-0.5 text-[12px] text-slate-500">
                      Meta API JSON before submit
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        copyPayload();
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          e.stopPropagation();
                          copyPayload();
                        }
                      }}
                      className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      {copied ? <Check size={12} /> : <Copy size={12} />}
                      {copied ? "Copied" : "Copy"}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`mt-0.5 text-slate-400 transition ${
                        payloadOpen ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </button>
                {payloadOpen ? (
                  <pre className="mt-3 max-h-52 overflow-auto whitespace-pre-wrap break-all rounded-lg bg-slate-950 p-3.5 font-mono text-[11px] leading-relaxed text-emerald-100">
                    {JSON.stringify(payload, null, 2)}
                  </pre>
                ) : null}
              </section>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <footer className="flex shrink-0 flex-col gap-3 border-t border-slate-100 bg-white px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between md:px-6">
          <p
            className={`text-[12px] leading-snug ${
              canSubmit ? "text-slate-500" : "font-medium text-amber-700"
            }`}
          >
            {statusHint}
          </p>
          <button
            type="button"
            disabled={!canSubmit || submitting}
            onClick={handleSubmit}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 text-[13px] font-bold text-white transition hover:bg-[#1EAF54] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
          >
            {submitting ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <FileText size={15} />
            )}
            {submitting ? "Submitting…" : "Submit Template"}
          </button>
        </footer>
      </div>
    </div>
  );
}

export default TemplateComposerModal;
