import { useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  Check,
  Image as ImageIcon,
  Loader2,
  MessageCircle,
  MoreVertical,
  Plus,
  Search,
  Send,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  sentWhatsAppNotification,
  uploadWhatsAppCampaignImage,
} from "../../../features/user/userService";
import { componentsToForm } from "../utils/formMapper";
import { applyVars } from "../utils/helper";
import { WhatsAppTemplatePreview } from "../preview/WhatsAppTemplatePreview";

const CRM_MODULES = [
  { id: "property_leads", label: "Property Leads" },
  { id: "properties", label: "Properties" },
  { id: "site_visits", label: "Site Visits" },
  { id: "bookings", label: "Bookings" },
  { id: "documents", label: "Documents" },
  { id: "payment_milestones", label: "Payment Milestones" },
  { id: "users", label: "Users" },
];

const MODULE_FIELDS = {
  property_leads: [
    { id: "customerName", label: "Customer Name" },
    { id: "contactNo", label: "Contact No", phone: true },
    { id: "email", label: "Email" },
    { id: "source", label: "Source" },
    { id: "status", label: "Status" },
    { id: "notes", label: "Notes" },
    { id: "budget", label: "Budget" },
    { id: "preferredLocation", label: "Preferred Location" },
    { id: "leadStage", label: "Lead Stage" },
    { id: "nextFollowUp", label: "Next Follow Up", date: true },
  ],
  properties: [
    { id: "title", label: "Title" },
    { id: "city", label: "City" },
    { id: "state", label: "State" },
    { id: "locality", label: "Locality" },
    { id: "ownerPhone", label: "Owner Phone", phone: true },
    { id: "heroImage", label: "Hero Image URL", image: true },
  ],
  site_visits: [
    { id: "visitorName", label: "Visitor Name" },
    { id: "phone", label: "Phone", phone: true },
    { id: "visitDate", label: "Visit Date", date: true },
    { id: "status", label: "Status" },
  ],
  bookings: [
    { id: "customerName", label: "Customer Name" },
    { id: "phone", label: "Phone", phone: true },
    { id: "bookingDate", label: "Booking Date", date: true },
    { id: "status", label: "Status" },
  ],
  documents: [
    { id: "name", label: "Document Name" },
    { id: "phone", label: "Contact Phone", phone: true },
    { id: "uploadedAt", label: "Uploaded At", date: true },
  ],
  payment_milestones: [
    { id: "customerName", label: "Customer Name" },
    { id: "phone", label: "Phone", phone: true },
    { id: "dueDate", label: "Due Date", date: true },
    { id: "status", label: "Status" },
  ],
  users: [
    { id: "name", label: "Name" },
    { id: "phone", label: "Phone", phone: true },
    { id: "email", label: "Email" },
    { id: "city", label: "City" },
    { id: "state", label: "State" },
    { id: "locality", label: "Locality" },
  ],
};

const DATE_CONDITIONS = [
  { id: "birthday_today", label: "Birthday today", hint: "Matches the day and month only." },
  { id: "today", label: "Is today", hint: "Exact calendar date match." },
  { id: "this_week", label: "This week", hint: "Within the current week." },
  { id: "this_month", label: "This month", hint: "Within the current month." },
  { id: "overdue", label: "Overdue", hint: "Date is before today." },
  { id: "upcoming_7", label: "Next 7 days", hint: "Within the next 7 days." },
];

const STATIC_IMAGE = "__uploaded__";

function uid(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

function toLocalDateTimeValue(date = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatDisplayDateTime(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * Full CRM Records campaign popup — matches Bizrow-style mockup:
 * settings (left) + live WhatsApp preview (right), with Field/Date rule flow.
 */
export function CrmCampaignModal({
  templates = [],
  initialTemplate = null,
  onClose,
}) {
  const approved = useMemo(
    () => (templates || []).filter((t) => t.status === "APPROVED"),
    [templates],
  );

  const [templateName, setTemplateName] = useState(
    initialTemplate?.name || approved[0]?.name || "",
  );
  const selectedTemplate = useMemo(
    () =>
      approved.find((t) => t.name === templateName) ||
      initialTemplate ||
      null,
    [approved, templateName, initialTemplate],
  );

  const previewForm = useMemo(
    () => (selectedTemplate ? componentsToForm(selectedTemplate) : null),
    [selectedTemplate],
  );

  const [headerUrl, setHeaderUrl] = useState("");
  const [headerPreview, setHeaderPreview] = useState("");
  const [uploadedImages, setUploadedImages] = useState([]);
  const [selectedImageId, setSelectedImageId] = useState("");
  const fileRef = useRef(null);

  const [moduleId, setModuleId] = useState("property_leads");
  const fields = MODULE_FIELDS[moduleId] || MODULE_FIELDS.property_leads;
  const phoneFields = fields.filter((f) => f.phone);
  const dateFields = fields.filter((f) => f.date);
  const imageFields = fields.filter((f) => f.image);

  const [dynamicImageField, setDynamicImageField] = useState(STATIC_IMAGE);
  const [fieldRules, setFieldRules] = useState([]);
  const [dateRules, setDateRules] = useState([]);
  const [sendMode, setSendMode] = useState("now"); // now | schedule
  const [scheduleAt, setScheduleAt] = useState(toLocalDateTimeValue());
  const [recipientField, setRecipientField] = useState(
    phoneFields[0]?.id || "",
  );
  const [sending, setSending] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    setRecipientField((prev) => {
      if (phoneFields.some((f) => f.id === prev)) return prev;
      return phoneFields[0]?.id || "";
    });
    setDynamicImageField(STATIC_IMAGE);
    setFieldRules([]);
    setDateRules([]);
  }, [moduleId]); // eslint-disable-line react-hooks/exhaustive-deps

  const activeRuleCount = fieldRules.length + dateRules.length;

  const selectedUpload = uploadedImages.find((i) => i.id === selectedImageId);
  const templateSampleImage =
    previewForm?.header?.mediaPreview ||
    (String(previewForm?.header?.mediaHandle || "").startsWith("http")
      ? previewForm.header.mediaHandle
      : "");
  const effectivePreview =
    selectedUpload?.url ||
    selectedUpload?.preview ||
    headerPreview ||
    (headerUrl.startsWith("http") ? headerUrl : "") ||
    templateSampleImage ||
    "";

  const bodyPreview = previewForm
    ? applyVars(previewForm.body.text, previewForm.body.examples)
    : "";

  const nowLabel = new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const addFieldRule = () => {
    const first = fields[0];
    setFieldRules((prev) => [
      ...prev,
      { id: uid("fr"), fieldId: first?.id || "", valuesText: "" },
    ]);
  };

  const addDateRule = () => {
    const first = dateFields[0] || fields.find((f) => f.date) || fields[0];
    setDateRules((prev) => [
      ...prev,
      {
        id: uid("dr"),
        fieldId: first?.id || "",
        condition: DATE_CONDITIONS[0].id,
      },
    ]);
  };

  const handleUploadFiles = async (fileList) => {
    const files = Array.from(fileList || []).filter((f) =>
      f.type.startsWith("image/"),
    );
    if (!files.length) {
      toast.error("Please choose an image file");
      return;
    }

    const file = files[0];
    const localPreview = URL.createObjectURL(file);
    const tempId = uid("img");

    setUploadedImages((prev) => [
      {
        id: tempId,
        name: file.name,
        preview: localPreview,
        file,
        url: "",
      },
      ...prev,
    ]);
    setSelectedImageId(tempId);
    setHeaderPreview(localPreview);

    try {
      setUploadingImage(true);
      const res = await uploadWhatsAppCampaignImage(file);
      const publicUrl = res?.data?.url || res?.data?.data?.url || "";
      if (!publicUrl) {
        throw new Error(res?.data?.message || "Upload did not return a URL");
      }

      setHeaderUrl(publicUrl);
      setHeaderPreview(publicUrl);
      setUploadedImages((prev) =>
        prev.map((img) =>
          img.id === tempId
            ? { ...img, url: publicUrl, preview: publicUrl }
            : img,
        ),
      );
      if (localPreview.startsWith("blob:")) URL.revokeObjectURL(localPreview);
      toast.success("Image uploaded — public URL added");
    } catch (err) {
      setHeaderUrl("");
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Image upload failed. Paste a public URL instead.",
      );
    } finally {
      setUploadingImage(false);
    }
  };

  const clearSelectedImage = () => {
    setSelectedImageId("");
    setHeaderPreview("");
    setHeaderUrl("");
  };

  const removeUploaded = (id) => {
    setUploadedImages((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item?.preview?.startsWith("blob:")) URL.revokeObjectURL(item.preview);
      return prev.filter((i) => i.id !== id);
    });
    if (selectedImageId === id) clearSelectedImage();
  };

  const handleSubmit = async () => {
    if (!selectedTemplate?.name) {
      toast.error("Select an approved WhatsApp template");
      return;
    }
    if (!recipientField) {
      toast.error("Select a recipient number field");
      return;
    }
    if (sendMode === "schedule" && !scheduleAt) {
      toast.error("Pick a campaign date and time");
      return;
    }

    const payload = {
      templateName: selectedTemplate.name,
      module: moduleId,
      dynamicHeaderImageField:
        dynamicImageField === STATIC_IMAGE ? null : dynamicImageField,
      headerImageUrl:
        dynamicImageField === STATIC_IMAGE ? headerUrl.trim() || "" : "",
      audienceFilters: {
        fieldRules: fieldRules.map((r) => ({
          field: r.fieldId,
          values: String(r.valuesText || "")
            .split(/[\n,]/)
            .map((v) => v.trim())
            .filter(Boolean),
        })),
        dateRules: dateRules.map((r) => ({
          field: r.fieldId,
          condition: r.condition,
        })),
      },
      sendMode,
      scheduleAt: sendMode === "schedule" ? new Date(scheduleAt).toISOString() : null,
      recipientField,
    };

    try {
      setSending(true);
      // Backend currently supports templateName (+ optional city/state/roleId).
      // Extra CRM fields are sent for forward compatibility.
      await sentWhatsAppNotification(payload);
      toast.success(
        sendMode === "schedule"
          ? "WhatsApp campaign scheduled"
          : "WhatsApp campaign queued",
      );
      onClose?.();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err?.message || "Campaign failed",
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/45 p-0 md:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div className="flex h-[96vh] w-full max-w-6xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl md:h-[90vh] md:rounded-2xl">
        {/* Header */}
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div className="flex min-w-0 items-start gap-3">
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#2563eb]/10 text-[#2563eb]">
              <MessageCircle size={20} />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-extrabold text-slate-900">
                WhatsApp Campaign
              </h2>
              <p className="text-sm text-slate-500">
                Create and send personalized WhatsApp campaigns.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-2">
          {/* LEFT — settings */}
          <div className="min-h-0 overflow-y-auto border-r border-slate-100 p-4 sm:p-5 space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Campaign Settings
              </h3>
              <p className="text-sm text-slate-500">
                Configure your WhatsApp campaign.
              </p>
            </div>

            {/* Template */}
            <section className="space-y-2">
              <label className="text-xs font-bold text-slate-700">
                WhatsApp Template
              </label>
              <select
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-400"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
              >
                <option value="">Select template</option>
                {approved.map((t) => (
                  <option key={t.name} value={t.name}>
                    {t.name}
                  </option>
                ))}
              </select>
              {selectedTemplate ? (
                <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
                  Template status: {selectedTemplate.status || "APPROVED"}
                </div>
              ) : null}
            </section>

            {/* Header image — only when selected template is Media */}
            {previewForm?.header?.enabled &&
            ["IMAGE", "VIDEO", "DOCUMENT"].includes(
              String(previewForm.header.format || "").toUpperCase(),
            ) ? (
            <section className="space-y-3 rounded-xl border border-slate-200 p-3.5">
              <div className="flex items-center gap-2">
                <ImageIcon size={16} className="text-slate-500" />
                <p className="text-sm font-bold text-slate-800">Header Image</p>
              </div>

              <button
                type="button"
                disabled={uploadingImage}
                onClick={() => fileRef.current?.click()}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-600 hover:border-emerald-300 hover:bg-emerald-50/40 disabled:opacity-60"
              >
                {uploadingImage ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Uploading to S3…
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    Upload campaign image
                  </>
                )}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  handleUploadFiles(e.target.files);
                  e.target.value = "";
                }}
              />

              <input
                type="url"
                value={headerUrl}
                onChange={(e) => {
                  setHeaderUrl(e.target.value);
                  if (e.target.value) {
                    setSelectedImageId("");
                    setHeaderPreview(e.target.value);
                  }
                }}
                placeholder="Paste public image URL (S3 / CDN)…"
                className="h-10 w-full rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-emerald-400"
              />
              {headerUrl ? (
                <p className="truncate text-[11px] text-emerald-700">
                  Public URL ready for Meta: {headerUrl}
                </p>
              ) : (
                <p className="text-[11px] text-slate-400">
                  Upload fills this URL automatically from the backend.
                </p>
              )}

              {effectivePreview ? (
                <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                  <img
                    src={effectivePreview}
                    alt="Selected campaign"
                    className="max-h-44 w-full object-contain bg-white"
                  />
                  <div className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-1 text-[11px] font-bold text-white">
                    <Check size={12} /> Selected for campaign
                  </div>
                  <button
                    type="button"
                    onClick={clearSelectedImage}
                    className="absolute bottom-2 right-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-600"
                  >
                    Clear
                  </button>
                </div>
              ) : null}

              {uploadedImages.length > 0 ? (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                    Uploaded images
                  </p>
                  <p className="mb-2 text-[11px] text-slate-400">
                    Select one for this campaign.
                  </p>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {uploadedImages.map((img) => {
                      const active = img.id === selectedImageId;
                      return (
                        <div key={img.id} className="relative shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedImageId(img.id);
                              setHeaderPreview(img.url || img.preview);
                              if (img.url) setHeaderUrl(img.url);
                            }}
                            className={`block h-16 w-16 overflow-hidden rounded-lg border-2 ${
                              active
                                ? "border-emerald-500"
                                : "border-slate-200"
                            }`}
                          >
                            <img
                              src={img.preview}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          </button>
                          {active ? (
                            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white">
                              <Check size={11} />
                            </span>
                          ) : null}
                          <button
                            type="button"
                            onClick={() => removeUploaded(img.id)}
                            className="absolute -bottom-1 -right-1 rounded-full bg-white p-1 text-rose-500 shadow"
                          >
                            <Trash2 size={11} />
                          </button>
                          {active ? (
                            <p className="mt-1 text-center text-[10px] font-bold text-emerald-600">
                              Selected
                            </p>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </section>
            ) : null}

            {/* Module */}
            <section className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Module</label>
              <select
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-400"
                value={moduleId}
                onChange={(e) => setModuleId(e.target.value)}
              >
                <option value="">Select Module</option>
                {CRM_MODULES.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </section>

            {/* Dynamic header image field */}
            <section className="space-y-2 rounded-xl border border-emerald-200 bg-emerald-50/40 p-3.5">
              <label className="text-sm font-bold text-emerald-800">
                Dynamic header image field
              </label>
              <select
                className="h-11 w-full rounded-xl border border-emerald-100 bg-white px-3 text-sm outline-none focus:border-emerald-400"
                value={dynamicImageField}
                onChange={(e) => setDynamicImageField(e.target.value)}
              >
                <option value={STATIC_IMAGE}>
                  Use uploaded/pasted image for all records
                </option>
                {fields.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label}
                  </option>
                ))}
                {imageFields.length === 0 ? null : null}
              </select>
              <p className="text-[11px] leading-snug text-emerald-700/80">
                For scheduled CRM campaigns, this field is read again at send
                time so each record can use its latest property image URL.
              </p>
            </section>

            {/* Audience filters */}
            <section className="space-y-3 rounded-xl border border-slate-200 p-3.5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-extrabold text-slate-900">
                      Audience Filters
                    </h4>
                    {activeRuleCount > 0 ? (
                      <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-700">
                        {activeRuleCount} active
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Filter recipients using fields from the selected module.
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={addFieldRule}
                    className="inline-flex items-center gap-1 rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-1.5 text-xs font-bold text-sky-700 hover:bg-sky-100"
                  >
                    <Plus size={12} /> Field rule
                  </button>
                  <button
                    type="button"
                    onClick={addDateRule}
                    disabled={!dateFields.length}
                    className="inline-flex items-center gap-1 rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-1.5 text-xs font-bold text-sky-700 hover:bg-sky-100 disabled:opacity-40"
                  >
                    <Plus size={12} /> Date rule
                  </button>
                </div>
              </div>

              {fieldRules.map((rule, index) => {
                const fieldMeta = fields.find((f) => f.id === rule.fieldId);
                return (
                  <div
                    key={rule.id}
                    className="rounded-xl border border-slate-200 bg-white p-3 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                          Field rule {index + 1}
                        </p>
                        <p className="text-xs text-slate-500">
                          Match records by a selected module field.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setFieldRules((prev) =>
                            prev.filter((r) => r.id !== rule.id),
                          )
                        }
                        className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-rose-500"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-[11px] font-bold text-slate-600">
                          Module field
                        </label>
                        <select
                          className="h-10 w-full rounded-lg border border-slate-200 px-2.5 text-sm"
                          value={rule.fieldId}
                          onChange={(e) =>
                            setFieldRules((prev) =>
                              prev.map((r) =>
                                r.id === rule.id
                                  ? { ...r, fieldId: e.target.value, valuesText: "" }
                                  : r,
                              ),
                            )
                          }
                        >
                          {fields.map((f) => (
                            <option key={f.id} value={f.id}>
                              {f.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="mb-1 block text-[11px] font-bold text-slate-600">
                          Matching values
                        </label>
                        <textarea
                          rows={2}
                          className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-sm outline-none focus:border-emerald-400"
                          placeholder={
                            fieldMeta
                              ? `No values found for ${fieldMeta.label}.`
                              : "Enter values (comma or new line)"
                          }
                          value={rule.valuesText}
                          onChange={(e) =>
                            setFieldRules((prev) =>
                              prev.map((r) =>
                                r.id === rule.id
                                  ? { ...r, valuesText: e.target.value }
                                  : r,
                              ),
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>
                );
              })}

              {dateRules.map((rule, index) => {
                const cond = DATE_CONDITIONS.find((c) => c.id === rule.condition);
                return (
                  <div
                    key={rule.id}
                    className="rounded-xl border border-slate-200 bg-white p-3 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <CalendarDays size={14} className="text-slate-400" />
                        <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                          Date rule {index + 1}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setDateRules((prev) =>
                            prev.filter((r) => r.id !== rule.id),
                          )
                        }
                        className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-rose-500"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-[11px] font-bold text-slate-600">
                          Date field
                        </label>
                        <select
                          className="h-10 w-full rounded-lg border border-slate-200 px-2.5 text-sm"
                          value={rule.fieldId}
                          onChange={(e) =>
                            setDateRules((prev) =>
                              prev.map((r) =>
                                r.id === rule.id
                                  ? { ...r, fieldId: e.target.value }
                                  : r,
                              ),
                            )
                          }
                        >
                          {(dateFields.length ? dateFields : fields).map((f) => (
                            <option key={f.id} value={f.id}>
                              {f.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="mb-1 block text-[11px] font-bold text-slate-600">
                          Condition
                        </label>
                        <select
                          className="h-10 w-full rounded-lg border border-slate-200 px-2.5 text-sm"
                          value={rule.condition}
                          onChange={(e) =>
                            setDateRules((prev) =>
                              prev.map((r) =>
                                r.id === rule.id
                                  ? { ...r, condition: e.target.value }
                                  : r,
                              ),
                            )
                          }
                        >
                          {DATE_CONDITIONS.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {cond?.hint || "Date filter for CRM records."}
                    </p>
                  </div>
                );
              })}
            </section>

            {/* Send time */}
            <section className="space-y-3 rounded-xl border border-slate-200 p-3.5">
              <div>
                <h4 className="text-sm font-extrabold text-slate-900">
                  Send Time
                </h4>
                <p className="text-xs text-slate-500">
                  Send immediately or schedule this campaign for a specific date
                  and time.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSendMode("now")}
                  className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-bold transition ${
                    sendMode === "now"
                      ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                      : "border-slate-200 bg-white text-slate-600"
                  }`}
                >
                  <Send size={14} /> Send now
                </button>
                <button
                  type="button"
                  onClick={() => setSendMode("schedule")}
                  className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-bold transition ${
                    sendMode === "schedule"
                      ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                      : "border-slate-200 bg-white text-slate-600"
                  }`}
                >
                  <CalendarDays size={14} /> Schedule
                </button>
              </div>
              {sendMode === "schedule" ? (
                <div>
                  <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                    Campaign date and time
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduleAt}
                    onChange={(e) => setScheduleAt(e.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-emerald-400"
                  />
                  <p className="mt-1 text-[11px] text-slate-400">
                    Scheduled for {formatDisplayDateTime(scheduleAt)}
                  </p>
                </div>
              ) : null}
            </section>

            {/* Recipient number */}
            <section className="space-y-2 rounded-xl border border-slate-200 p-3.5">
              <h4 className="text-sm font-extrabold text-slate-900">
                Recipient Number
              </h4>
              <p className="text-xs text-slate-500">
                Select the field that contains WhatsApp numbers. Spaces,
                hyphens, and +91 are accepted.
              </p>
              <label className="mb-1 block text-[11px] font-bold text-slate-600">
                Select Number Field
              </label>
              <select
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-400"
                value={recipientField}
                onChange={(e) => setRecipientField(e.target.value)}
              >
                <option value="">Select number field</option>
                {(phoneFields.length ? phoneFields : fields).map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label}
                  </option>
                ))}
              </select>
            </section>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={sending || !selectedTemplate}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3.5 text-sm font-extrabold text-white shadow-[0_4px_14px_rgba(37,211,102,.3)] hover:bg-[#1EAF54] disabled:opacity-50"
            >
              {sending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {sendMode === "schedule" ? "Scheduling…" : "Sending…"}
                </>
              ) : (
                <>
                  {sendMode === "schedule" ? (
                    <CalendarDays size={16} />
                  ) : (
                    <Send size={16} />
                  )}
                  {sendMode === "schedule"
                    ? "Schedule WhatsApp Campaign"
                    : "Send WhatsApp Campaign"}
                </>
              )}
            </button>
          </div>

          {/* RIGHT — preview */}
          <div className="hidden min-h-0 overflow-y-auto bg-[#f7f8fa] p-4 sm:p-5 lg:block">
            <div className="mb-3">
              <h3 className="text-base font-extrabold text-slate-900">
                WhatsApp Preview
              </h3>
              <p className="text-sm text-slate-500">
                Template as it will appear in chat.
              </p>
            </div>

            <div className="mx-auto w-full max-w-[340px] overflow-hidden rounded-2xl border border-slate-200 bg-[#ECE5DD] shadow-sm">
              <div className="flex items-center gap-2 bg-[#075E54] px-3 py-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-sm font-bold text-white">
                  W
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-white">
                    WhatsApp Business
                  </p>
                  <p className="text-[11px] text-emerald-200">online</p>
                </div>
                <Search size={16} className="text-white/80" />
                <MoreVertical size={16} className="text-white/80" />
              </div>

              <div className="min-h-[480px] bg-[#efeae2] p-2.5">
                {selectedTemplate ? (
                  <WhatsAppTemplatePreview
                    headerFormat={previewForm?.header?.format}
                    headerText={previewForm?.header?.text}
                    headerImage={
                      previewForm?.header?.format === "IMAGE" ||
                      effectivePreview
                        ? effectivePreview
                        : ""
                    }
                    bodyText={bodyPreview}
                    footerText={
                      previewForm?.footer?.enabled
                        ? previewForm.footer.text
                        : ""
                    }
                    buttons={previewForm?.buttons || []}
                    timeLabel={nowLabel}
                  />
                ) : (
                  <div className="rounded-lg border border-dashed border-slate-300 bg-white/80 p-6 text-center text-sm text-slate-400">
                    Select a template to preview the message.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CrmCampaignModal;
