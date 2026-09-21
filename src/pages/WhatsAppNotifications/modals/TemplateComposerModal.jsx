import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bold,
  Check,
  ChevronDown,
  Code2,
  Copy,
  FileText,
  Italic,
  Loader2,
  MessageCircle,
  Phone,
  Plus,
  Sparkles,
  Strikethrough,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { EMPTY_FORM } from "../common/EmptyForm";
import {
  CATEGORIES,
  HEADER_MEDIA_OPTIONS,
  LANGUAGES,
  MEDIA_ACCEPT,
  META_BUTTON_OPTIONS,
} from "../utils/constants";
import { uploadWhatsAppCampaignImage } from "../../../features/user/userService";
import {
  buildPayload,
  validateTemplateBody,
} from "../utils/payloadBuilder";
import { applyVars, countVars } from "../utils/helper";
import { WhatsAppTemplatePreview } from "../preview/WhatsAppTemplatePreview";

/** Real-estate sample aligned with Meta component metadata. */
const SAMPLE = {
  name: "property_inquiry_followup",
  language: "en",
  category: "MARKETING",
  templateType: "cta",
  header: {
    enabled: true,
    format: "TEXT",
    text: "New property update",
    example: "",
    mediaHandle: "",
    mediaPreview: null,
  },
  body: {
    text: "Hi {{1}}, thank you for your interest in *{{2}}* at {{3}}. Our advisor will share floor plans and pricing shortly. Reply if you want a site visit.",
    examples: ["Priya", "Green Valley Residences", "Gachibowli, Hyderabad"],
  },
  footer: { enabled: true, text: "Propenu Real Estate" },
  buttons: [
    {
      type: "URL",
      text: "View property",
      url: "https://propenu.com/",
      phone: "",
    },
    {
      type: "PHONE_NUMBER",
      text: "Call advisor",
      url: "",
      phone: "+919876543210",
    },
    { type: "QUICK_REPLY", text: "Book site visit", url: "", phone: "" },
  ],
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
  const [buttonMenuOpen, setButtonMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [payloadOpen, setPayloadOpen] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const bodyRef = useRef(null);
  const headerRef = useRef(null);
  const buttonMenuRef = useRef(null);
  const mediaInputRef = useRef(null);

  useEffect(() => {
    setForm(deepMergeForm(initial));
  }, [initial]);

  useEffect(() => {
    const onDoc = (e) => {
      if (buttonMenuRef.current && !buttonMenuRef.current.contains(e.target)) {
        setButtonMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

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
    : ["IMAGE", "VIDEO", "DOCUMENT", "LOCATION"].includes(form.header.format)
      ? form.header.format
      : "NONE";

  const setMediaSample = (value) => {
    if (value === "NONE") {
      setForm((prev) => ({
        ...prev,
        header: {
          ...prev.header,
          enabled: Boolean(String(prev.header.text || "").trim()),
          format: "TEXT",
          mediaHandle: "",
          mediaPreview: null,
        },
      }));
      return;
    }
    setForm((prev) => ({
      ...prev,
      header: {
        ...prev.header,
        enabled: true,
        format: value,
        text: "",
        example: "",
        mediaHandle: "",
        mediaPreview: null,
      },
    }));
  };

  const uploadMediaSample = async (file) => {
    if (!file) return;
    const format = form.header.format;
    const maxMB = format === "VIDEO" ? 16 : format === "DOCUMENT" ? 100 : 5;
    if (file.size > maxMB * 1024 * 1024) {
      toast.error(`File too large. Max ${maxMB}MB for ${format}.`);
      return;
    }

    try {
      setUploadingMedia(true);
      const localPreview = URL.createObjectURL(file);

      if (format === "IMAGE") {
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
        toast.success("Header image uploaded");
      } else {
        // Video / document: store public URL or local name; Meta prefers upload handle.
        setForm((prev) => ({
          ...prev,
          header: {
            ...prev.header,
            enabled: true,
            format,
            mediaHandle: file.name,
            mediaPreview: localPreview,
          },
        }));
        toast.success(
          `${format} sample attached. For Meta approval, use a valid media handle/URL.`,
        );
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err?.message || "Media upload failed",
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

  const canSubmit =
    Boolean(form.name?.trim()) &&
    Boolean(form.body.text?.trim()) &&
    bodyVars.invalid.length === 0 &&
    headerVars.invalid.length === 0 &&
    bodyValidation.ok &&
    !(
      form.header.enabled &&
      form.header.enabled &&
      ["IMAGE", "VIDEO", "DOCUMENT"].includes(form.header.format) &&
      !form.header.mediaHandle
    );

  const statusHint = !form.name?.trim()
    ? "Add a template name to continue."
    : !form.body.text?.trim()
      ? "Add a message body to continue."
      : !bodyValidation.ok
        ? bodyValidation.errors[0]?.message || "Fix variable issues to continue."
        : bodyVars.invalid.length || headerVars.invalid.length
          ? "Use numbered variables like {{1}}, not named tokens."
          : form.header.enabled &&
              ["IMAGE", "VIDEO", "DOCUMENT"].includes(form.header.format) &&
              !form.header.mediaHandle
            ? `Upload a ${form.header.format.toLowerCase()} sample for the header.`
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

  const setHeaderText = (text) => {
    setForm((prev) => {
      const hasMedia = ["IMAGE", "VIDEO", "DOCUMENT", "LOCATION"].includes(
        prev.header.format,
      );
      const trimmed = String(text || "").trim();
      return {
        ...prev,
        header: {
          ...prev.header,
          text,
          enabled: hasMedia || Boolean(trimmed),
          format: hasMedia ? prev.header.format : "TEXT",
        },
      };
    });
  };

  const insertBodyVar = () => {
    const n = Math.max(1, bodyVars.nextIndex);
    insertAtCursor(bodyRef.current, form.body.text, `{{${n}}}`, setBodyText);
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
    toast.success("Real-estate sample template loaded");
  };

  const addButton = (type) => {
    setForm((prev) => {
      if (prev.buttons.length >= 10) {
        toast.error("Meta allows at most 10 buttons");
        return prev;
      }
      const urlCount = prev.buttons.filter((b) => b.type === "URL").length;
      const phoneCount = prev.buttons.filter(
        (b) => b.type === "PHONE_NUMBER",
      ).length;
      if (type === "URL" && urlCount >= 2) {
        toast.error("At most 2 Visit website buttons");
        return prev;
      }
      if (type === "PHONE_NUMBER" && phoneCount >= 1) {
        toast.error("At most 1 Call phone number button");
        return prev;
      }
      const defaults = {
        QUICK_REPLY: { type, text: "Interested", url: "", phone: "" },
        URL: {
          type,
          text: "View property",
          url: "https://propenu.com/",
          phone: "",
        },
        PHONE_NUMBER: {
          type,
          text: "Call now",
          url: "",
          phone: "+91",
        },
      };
      return {
        ...prev,
        buttons: [...prev.buttons, defaults[type] || defaults.QUICK_REPLY],
      };
    });
    setButtonMenuOpen(false);
  };

  const updateButton = (index, patch) => {
    setForm((prev) => ({
      ...prev,
      buttons: prev.buttons.map((b, i) => (i === index ? { ...b, ...patch } : b)),
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
    mode === "edit" ? "Edit Template Copy" : "Create template";
  const subtitle =
    mode === "edit"
      ? "Meta templates cannot be changed after approval; submit a revised copy."
      : "Templates will be reviewed by Meta to ensure they follow guidelines.";

  const showTextHeader =
    form.header.enabled &&
    (form.header.format === "TEXT" || mediaSampleValue === "NONE");

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 backdrop-blur-[2px] md:items-center md:p-5"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div className="flex h-[100dvh] w-full max-w-6xl flex-col overflow-hidden bg-white shadow-2xl md:h-[min(920px,94vh)] md:rounded-2xl">
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 md:px-6">
          <div className="flex min-w-0 items-start gap-3">
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#25D366]/15 text-[#128C7E]">
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
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={applySample}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 text-[12px] font-semibold text-emerald-700 hover:bg-emerald-100"
            >
              <Sparkles size={13} />
              Sample
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <X size={18} />
            </button>
          </div>
        </header>

        <div className="grid min-h-0 flex-1 overflow-hidden lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)]">
          {/* LEFT — Meta content form */}
          <div className="min-h-0 overflow-y-auto overflow-x-hidden border-b border-slate-100 px-5 py-5 md:px-6 lg:border-b-0 lg:border-r">
            <div className="mx-auto flex max-w-2xl flex-col gap-5">
              {/* Template details */}
              <section className={sectionCard}>
                <div className="mb-4">
                  <h3 className="text-[14px] font-semibold text-slate-900">
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
                      placeholder="property_inquiry_followup"
                      className={`${fieldControl} font-mono text-[13px]`}
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
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
                    <div>
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

              {/* Content — Meta parity */}
              <section className={sectionCard}>
                <div className="mb-4">
                  <h3 className="text-[14px] font-semibold text-slate-900">
                    Content
                  </h3>
                  <p className="mt-0.5 text-[12px] leading-relaxed text-slate-500">
                    Fill in the header, body and footer sections of your
                    template. Templates require review by Meta.
                  </p>
                </div>

                {/* Media sample */}
                <div className="mb-5">
                  <label className={fieldLabel}>Media sample (optional)</label>
                  <div className="mt-1 grid grid-cols-2 gap-2 sm:grid-cols-5">
                    {HEADER_MEDIA_OPTIONS.map((opt) => {
                      const active = mediaSampleValue === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setMediaSample(opt.value)}
                          className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-left text-[13px] font-semibold transition ${
                            active
                              ? "border-sky-500 bg-sky-50 text-sky-800"
                              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                          }`}
                        >
                          <span
                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                              active
                                ? "border-sky-500 bg-sky-500 text-white"
                                : "border-slate-300"
                            }`}
                          >
                            {active ? (
                              <Check size={10} strokeWidth={3} />
                            ) : null}
                          </span>
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>

                  {["IMAGE", "VIDEO", "DOCUMENT"].includes(mediaSampleValue) ? (
                    <div className="mt-3 space-y-2">
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
                            Upload {mediaSampleValue.toLowerCase()} sample
                          </>
                        )}
                      </button>
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
                      <input
                        type="url"
                        value={form.header.mediaHandle || ""}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            header: {
                              ...prev.header,
                              enabled: true,
                              format: mediaSampleValue,
                              mediaHandle: e.target.value,
                              mediaPreview: e.target.value,
                            },
                          }))
                        }
                        placeholder="Or paste public media URL / Meta header handle"
                        className={`${fieldControl} text-[12px]`}
                      />
                      {form.header.format === "IMAGE" &&
                      (form.header.mediaPreview || form.header.mediaHandle) ? (
                        <img
                          src={
                            form.header.mediaPreview || form.header.mediaHandle
                          }
                          alt=""
                          className="max-h-36 w-full rounded-lg border border-slate-200 object-contain bg-slate-50"
                        />
                      ) : null}
                    </div>
                  ) : null}

                  {mediaSampleValue === "LOCATION" ? (
                    <p className="mt-3 rounded-lg border border-sky-100 bg-sky-50 px-3 py-2.5 text-[12px] leading-relaxed text-sky-900">
                      Location header shows a map pin in WhatsApp. You do not
                      upload a sample here — lat/long, name, and address are
                      sent when the template is used (e.g. project site visit).
                    </p>
                  ) : null}
                </div>

                {/* Header text */}
                <div className="mb-5 border-t border-slate-100 pt-5">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div>
                      <h4 className="text-[13px] font-semibold text-slate-900">
                        Header{" "}
                        <span className="font-normal text-slate-400">
                          · Optional
                        </span>
                      </h4>
                      <p className="text-[12px] text-slate-500">
                        Add a short line of text to the header of your message.
                      </p>
                    </div>
                    {showTextHeader || mediaSampleValue === "NONE" ? (
                      <button
                        type="button"
                        onClick={insertHeaderVar}
                        className="shrink-0 text-[12px] font-semibold text-sky-600 hover:text-sky-700"
                      >
                        + Add variable
                      </button>
                    ) : null}
                  </div>
                  {(showTextHeader || mediaSampleValue === "NONE") &&
                  mediaSampleValue === "NONE" ? (
                    <>
                      <input
                        ref={headerRef}
                        maxLength={60}
                        value={form.header.text || ""}
                        onChange={(e) => setHeaderText(e.target.value)}
                        placeholder="Enter the text for the header of your message"
                        className={fieldControl}
                      />
                      <p className="mt-1 text-right text-[11px] text-slate-400">
                        {(form.header.text || "").length}/60
                      </p>
                      {headerVars.numbered.length > 0 ? (
                        <input
                          value={form.header.example || ""}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              header: {
                                ...prev.header,
                                example: e.target.value,
                              },
                            }))
                          }
                          placeholder="Sample value for header {{1}}"
                          className={`${fieldControl} mt-2`}
                        />
                      ) : null}
                    </>
                  ) : mediaSampleValue !== "NONE" ? (
                    <p className="rounded-lg bg-slate-50 px-3 py-2 text-[12px] text-slate-500">
                      Media header selected — text header is disabled for this
                      format (Meta rule).
                    </p>
                  ) : null}
                </div>

                {/* Body */}
                <div className="mb-5 border-t border-slate-100 pt-5">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div>
                      <h4 className="text-[13px] font-semibold text-slate-900">
                        Body
                      </h4>
                      <p className="text-[12px] text-slate-500">
                        Enter the text for your message in{" "}
                        {LANGUAGES.find((l) => l.code === form.language)
                          ?.label || "English"}
                        .
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={insertBodyVar}
                      className="shrink-0 text-[12px] font-semibold text-sky-600 hover:text-sky-700"
                    >
                      + Add variable
                    </button>
                  </div>
                  <div className="overflow-hidden rounded-lg border border-slate-200 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/15">
                    <textarea
                      ref={bodyRef}
                      rows={7}
                      maxLength={1024}
                      value={form.body.text}
                      onChange={(e) => setBodyText(e.target.value)}
                      placeholder="Hi {{1}}, thank you for your interest in {{2}}…"
                      className="w-full resize-y border-0 px-3.5 py-3 text-[13px] leading-relaxed text-slate-800 outline-none"
                    />
                    <div className="flex flex-wrap items-center gap-1 border-t border-slate-100 bg-slate-50/80 px-2 py-1.5">
                      {[
                        {
                          icon: Bold,
                          label: "Bold",
                          action: () =>
                            wrapSelection(
                              bodyRef.current,
                              form.body.text,
                              "*",
                              "*",
                              setBodyText,
                            ),
                        },
                        {
                          icon: Italic,
                          label: "Italic",
                          action: () =>
                            wrapSelection(
                              bodyRef.current,
                              form.body.text,
                              "_",
                              "_",
                              setBodyText,
                            ),
                        },
                        {
                          icon: Strikethrough,
                          label: "Strikethrough",
                          action: () =>
                            wrapSelection(
                              bodyRef.current,
                              form.body.text,
                              "~",
                              "~",
                              setBodyText,
                            ),
                        },
                        {
                          icon: Code2,
                          label: "Monospace",
                          action: () =>
                            wrapSelection(
                              bodyRef.current,
                              form.body.text,
                              "```",
                              "```",
                              setBodyText,
                            ),
                        },
                      ].map(({ icon: Icon, label, action }) => (
                        <button
                          key={label}
                          type="button"
                          title={label}
                          onClick={action}
                          className="rounded-md p-1.5 text-slate-500 hover:bg-white hover:text-slate-800"
                        >
                          <Icon size={14} />
                        </button>
                      ))}
                      <span className="ml-auto text-[11px] text-slate-400">
                        {(form.body.text || "").length}/1024
                      </span>
                    </div>
                  </div>

                  {bodyVars.invalid.length > 0 ? (
                    <p className="mt-2 text-[12px] font-semibold text-rose-600">
                      Use numbered variables like {"{{1}}"}, not{" "}
                      {bodyVars.invalid[0]}.
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
                    </div>
                  ) : null}

                  {bodyVars.numbered.length > 0 ? (
                    <div className="mt-4 space-y-2.5">
                      <p className={fieldLabel}>Samples for body variables</p>
                      {bodyVars.numbered.map((token, i) => (
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
                            placeholder={
                              i === 0
                                ? "Customer name"
                                : i === 1
                                  ? "Project name"
                                  : `Sample for ${token}`
                            }
                            className={fieldControl}
                          />
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>

                {/* Footer */}
                <div className="mb-5 border-t border-slate-100 pt-5">
                  <div className="mb-2 flex items-center justify-between">
                    <div>
                      <h4 className="text-[13px] font-semibold text-slate-900">
                        Footer{" "}
                        <span className="font-normal text-slate-400">
                          · Optional
                        </span>
                      </h4>
                      <p className="text-[12px] text-slate-500">
                        Add a short line of text to the bottom of your message.
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
                    maxLength={60}
                    value={form.footer.text}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        footer: {
                          ...prev.footer,
                          text: e.target.value,
                          enabled: true,
                        },
                      }))
                    }
                    placeholder="Propenu Real Estate"
                    className={`${fieldControl} disabled:bg-slate-50 disabled:text-slate-400`}
                  />
                  {form.footer.enabled ? (
                    <p className="mt-1 text-right text-[11px] text-slate-400">
                      {(form.footer.text || "").length}/60
                    </p>
                  ) : null}
                </div>

                {/* Buttons */}
                <div className="border-t border-slate-100 pt-5">
                  <div className="mb-3">
                    <h4 className="text-[13px] font-semibold text-slate-900">
                      Buttons{" "}
                      <span className="font-normal text-slate-400">
                        · Optional
                      </span>
                    </h4>
                    <p className="text-[12px] text-slate-500">
                      Create buttons that let customers respond or take action.
                      You can add up to 10 buttons.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {form.buttons.map((btn, i) => (
                      <div
                        key={i}
                        className="rounded-xl border border-slate-200 bg-slate-50/60 p-3"
                      >
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                            {btn.type === "URL"
                              ? "Visit website"
                              : btn.type === "PHONE_NUMBER"
                                ? "Call phone number"
                                : "Custom"}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeButton(i)}
                            className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <div className="flex flex-col gap-2">
                          <input
                            maxLength={25}
                            value={btn.text}
                            onChange={(e) =>
                              updateButton(i, { text: e.target.value })
                            }
                            placeholder="Button text"
                            className={fieldControl}
                          />
                          <p className="text-right text-[11px] text-slate-400">
                            {(btn.text || "").length}/25
                          </p>
                          {btn.type === "URL" ? (
                            <input
                              value={btn.url || ""}
                              onChange={(e) =>
                                updateButton(i, { url: e.target.value })
                              }
                              placeholder="https://propenu.com/property/…"
                              className={fieldControl}
                            />
                          ) : null}
                          {btn.type === "PHONE_NUMBER" ? (
                            <div className="relative">
                              <Phone
                                size={14}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                              />
                              <input
                                value={btn.phone || ""}
                                onChange={(e) =>
                                  updateButton(i, { phone: e.target.value })
                                }
                                placeholder="+919876543210"
                                className={`${fieldControl} pl-9`}
                              />
                            </div>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="relative mt-3" ref={buttonMenuRef}>
                    <button
                      type="button"
                      onClick={() => setButtonMenuOpen((v) => !v)}
                      disabled={form.buttons.length >= 10}
                      className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 text-[13px] font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >
                      <Plus size={15} />
                      Add button
                      <ChevronDown
                        size={14}
                        className={`text-slate-400 transition ${
                          buttonMenuOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {buttonMenuOpen ? (
                      <div className="absolute left-0 top-full z-20 mt-1 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                        {META_BUTTON_OPTIONS.map((opt) => (
                          <button
                            key={opt.type}
                            type="button"
                            onClick={() => addButton(opt.type)}
                            className="flex w-full flex-col items-start border-b border-slate-100 px-3.5 py-2.5 text-left last:border-0 hover:bg-slate-50"
                          >
                            <span className="text-[13px] font-semibold text-slate-800">
                              {opt.label}
                            </span>
                            <span className="text-[12px] text-slate-500">
                              {opt.description}
                            </span>
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* RIGHT — Template preview */}
          <div className="flex min-h-0 flex-col overflow-y-auto bg-[#f0f2f5] px-5 py-5 md:px-6">
            <div className="mb-3">
              <h3 className="text-[13px] font-semibold text-slate-900">
                Template preview
              </h3>
              <p className="mt-0.5 text-[12px] text-slate-500">
                How the message will appear in WhatsApp
              </p>
            </div>

            <div
              className="rounded-2xl p-4"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 20% 20%, rgba(0,0,0,0.03) 0, transparent 40%), radial-gradient(circle at 80% 60%, rgba(0,0,0,0.04) 0, transparent 35%)",
                backgroundColor: "#e5ddd5",
              }}
            >
              <WhatsAppTemplatePreview
                headerFormat={
                  form.header.enabled ? form.header.format : ""
                }
                headerText={previewHeaderText}
                headerImage={
                  form.header.enabled && form.header.format === "IMAGE"
                    ? form.header.mediaPreview || form.header.mediaHandle
                    : ""
                }
                bodyText={previewBody || "Message preview"}
                footerText={
                  form.footer.enabled ? form.footer.text : ""
                }
                buttons={form.buttons}
                timeLabel="09:45"
              />
            </div>

            <section className={`${sectionCard} mt-4`}>
              <button
                type="button"
                onClick={() => setPayloadOpen((v) => !v)}
                className="flex w-full items-start justify-between gap-3 text-left"
              >
                <div>
                  <h3 className="text-[13px] font-semibold text-slate-900">
                    Meta payload
                  </h3>
                  <p className="mt-0.5 text-[12px] text-slate-500">
                    API JSON submitted for review
                  </p>
                </div>
                <div className="flex items-center gap-2">
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
                    className={`text-slate-400 transition ${
                      payloadOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </button>
              {payloadOpen ? (
                <pre className="mt-3 max-h-56 overflow-auto whitespace-pre-wrap break-all rounded-lg bg-slate-950 p-3.5 font-mono text-[11px] leading-relaxed text-emerald-100">
                  {JSON.stringify(payload, null, 2)}
                </pre>
              ) : null}
            </section>
          </div>
        </div>

        <footer className="flex shrink-0 flex-col gap-3 border-t border-slate-100 bg-white px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between md:px-6">
          <p
            className={`text-[12px] leading-snug ${
              canSubmit ? "text-slate-500" : "font-medium text-amber-700"
            }`}
          >
            {statusHint}
          </p>
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-[13px] font-semibold text-slate-700 hover:bg-slate-50"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={!canSubmit || submitting}
              onClick={handleSubmit}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#1877F2] px-4 text-[13px] font-bold text-white transition hover:bg-[#166fe5] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
            >
              {submitting ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <FileText size={15} />
              )}
              {submitting ? "Submitting…" : "Submit for Review"}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default TemplateComposerModal;
