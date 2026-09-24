import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Ban,
  CalendarDays,
  Check,
  Copy,
  Image as ImageIcon,
  ImageOff,
  Loader2,
  MessageCircle,
  MoreVertical,
  PhoneOff,
  Search,
  Send,
  Trash2,
  Upload,
  UserMinus,
  X,
} from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import {
  sentBulkWhatsAppNotification,
  uploadWhatsAppCampaignImage,
} from "../../../features/user/userService";
import { componentsToForm } from "../utils/formMapper";
import { applyVars, countVars } from "../utils/helper";
import { WhatsAppTemplatePreview } from "../preview/WhatsAppTemplatePreview";
import {
  analyzeContactRows,
  VALIDATION_CATEGORY_META,
} from "../utils/contactFileValidation";

const CONTACT_ACCEPT =
  ".csv,.xlsx,.xls,.xlsm,.tsv,.txt,.ods,text/csv,text/plain,text/tab-separated-values,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.oasis.opendocument.spreadsheet";

const CONTACT_EXTS = [".csv", ".xlsx", ".xls", ".xlsm", ".tsv", ".txt", ".ods"];

function contactExt(name = "") {
  const lower = String(name).toLowerCase();
  return CONTACT_EXTS.find((ext) => lower.endsWith(ext)) || "";
}

function rowsToCsvFile(headers, rows, filename) {
  const esc = (value) => {
    const text = String(value ?? "");
    if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
    return text;
  };
  const lines = [headers.map(esc).join(",")];
  for (const row of rows) {
    lines.push(headers.map((header) => esc(row[header])).join(","));
  }
  const blob = new Blob([lines.join("\n")], { type: "text/csv" });
  const safeName = String(filename || "contacts")
    .replace(/\.[^.]+$/, "")
    .replace(/[^\w.-]+/g, "_");
  return new File([blob], `${safeName || "contacts"}.csv`, { type: "text/csv" });
}

async function parseContactFile(file) {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array", raw: false });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) throw new Error("The file has no sheets");
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: "", raw: false });
  const headerRow = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" })[0];
  const headers = (
    rows[0] ? Object.keys(rows[0]) : Array.isArray(headerRow) ? headerRow : []
  )
    .map((header) => String(header || "").trim())
    .filter(Boolean);

  return {
    headers,
    rows: rows.map((row) => {
      const next = {};
      headers.forEach((header) => {
        next[header] = row[header] ?? "";
      });
      return next;
    }),
  };
}

/** Guess phone column from headers (Phone, Mobile, …). */
function guessPhoneHeader(headers = []) {
  const list = headers.map((h) => String(h || "").trim()).filter(Boolean);
  const exact = list.find((h) =>
    /^(phone|mobile|whatsapp|wa[_-]?id|msisdn)$/i.test(h),
  );
  if (exact) return exact;
  return (
    list.find((h) => /phone|mobile|whatsapp|msisdn/i.test(h)) || list[0] || ""
  );
}

/**
 * Auto-map {{1}}, {{2}}, … to file columns (skip phone).
 * Prefers columns that actually have data in the uploaded rows.
 */
function columnFillScore(headers, rows, header) {
  if (!header || !rows?.length) return 0;
  let filled = 0;
  for (const row of rows) {
    const key = Object.keys(row).find(
      (k) => k.trim().toLowerCase() === header.trim().toLowerCase(),
    );
    if (key && String(row[key] ?? "").trim()) filled += 1;
  }
  return filled / rows.length;
}

function guessVarMapping(headers = [], varCount = 0, phoneHeader = "", rows = []) {
  const mapping = {};
  if (!varCount) return mapping;
  const phoneLc = String(phoneHeader || "").trim().toLowerCase();
  const usable = headers
    .map((h) => String(h || "").trim())
    .filter((h) => h && h.toLowerCase() !== phoneLc)
    // Skip status/role-ish columns for early vars unless nothing else exists
    .filter((h) => !/^(no|s\.?\s*no|sl\.?\s*no|#|id)$/i.test(h));

  const preferFor = [
    /^(name|full.?name|first.?name|customer|client)$/i,
    /^(city|location|place|area|locality)$/i,
    /^(state|region)$/i,
    /^(email|mail)$/i,
    /^(role|company|business|org)$/i,
  ];

  const used = new Set();
  for (let i = 1; i <= varCount; i++) {
    const prefer = preferFor[i - 1];
    let candidates = usable.filter((h) => !used.has(h));
    // Prefer preferred name match with data
    let pick = null;
    if (prefer) {
      const preferred = candidates.filter((h) => prefer.test(h));
      preferred.sort(
        (a, b) =>
          columnFillScore(headers, rows, b) - columnFillScore(headers, rows, a),
      );
      pick = preferred.find((h) => columnFillScore(headers, rows, h) > 0) || null;
    }
    // Else any unused column that has data
    if (!pick) {
      candidates = candidates
        .slice()
        .sort(
          (a, b) =>
            columnFillScore(headers, rows, b) -
            columnFillScore(headers, rows, a),
        );
      pick =
        candidates.find((h) => columnFillScore(headers, rows, h) > 0) ||
        candidates[0] ||
        null;
    }
    if (pick) {
      mapping[String(i)] = pick;
      used.add(pick);
    }
  }
  return mapping;
}

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
 * CSV bulk WhatsApp campaign popup — same chrome as CRM modal,
 * with CSV file picker + send/schedule + live preview.
 */
export function CsvCampaignModal({
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

  const imageInputRef = useRef(null);
  const csvInputRef = useRef(null);

  const [headerUrl, setHeaderUrl] = useState("");
  const [headerPreview, setHeaderPreview] = useState("");
  const [uploadedImages, setUploadedImages] = useState([]);
  const [selectedImageId, setSelectedImageId] = useState("");
  const [csvFile, setCsvFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [parsingFile, setParsingFile] = useState(false);
  const [phoneField, setPhoneField] = useState("");
  /** {{1}} → column header, {{2}} → column header, … */
  const [fieldMapping, setFieldMapping] = useState({});
  const [sendMode, setSendMode] = useState("now");
  const [scheduleAt, setScheduleAt] = useState(toLocalDateTimeValue());
  const [sending, setSending] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [reviewCategory, setReviewCategory] = useState("invalid_numbers");

  const selectedUpload = uploadedImages.find((i) => i.id === selectedImageId);
  const templateSampleImage =
    previewForm?.header?.mediaPreview ||
    (String(previewForm?.header?.mediaHandle || "").startsWith("http")
      ? previewForm.header.mediaHandle
      : "");
  const campaignHeaderUrl = String(
    selectedUpload?.url || headerUrl || "",
  ).trim();
  // Prefer upload/paste; else Meta create-time sample (header_handle CDN URL).
  const resolvedHeaderImageUrl =
    (campaignHeaderUrl.startsWith("http") ? campaignHeaderUrl : "") ||
    (String(templateSampleImage || "").startsWith("http")
      ? String(templateSampleImage)
      : "");
  const usingTemplateMedia =
    Boolean(resolvedHeaderImageUrl) &&
    !campaignHeaderUrl.startsWith("http") &&
    String(templateSampleImage || "").startsWith("http");

  const effectivePreview =
    selectedUpload?.url ||
    selectedUpload?.preview ||
    headerPreview ||
    (headerUrl.startsWith("http") ? headerUrl : "") ||
    templateSampleImage ||
    "";

  const templateVarCount = useMemo(
    () => countVars(previewForm?.body?.text || ""),
    [previewForm?.body?.text],
  );

  const fileHeaders = filePreview?.headers || [];

  // When template or file headers change, refresh default mappings
  useEffect(() => {
    if (!fileHeaders.length) {
      setPhoneField("");
      setFieldMapping({});
      return;
    }
    setPhoneField((prev) =>
      prev && fileHeaders.includes(prev) ? prev : guessPhoneHeader(fileHeaders),
    );
  }, [fileHeaders.join("|")]);

  useEffect(() => {
    if (!fileHeaders.length || !templateVarCount) {
      setFieldMapping({});
      return;
    }
    const rows = filePreview?.rows || [];
    setFieldMapping((prev) => {
      const next = { ...prev };
      let changed = false;
      // Drop mappings beyond var count
      Object.keys(next).forEach((key) => {
        if (parseInt(key, 10) > templateVarCount) {
          delete next[key];
          changed = true;
        }
      });
      const phone = phoneField || guessPhoneHeader(fileHeaders);
      const guessed = guessVarMapping(
        fileHeaders,
        templateVarCount,
        phone,
        rows,
      );
      for (let i = 1; i <= templateVarCount; i++) {
        const k = String(i);
        const current = next[k];
        const currentOk =
          current &&
          fileHeaders.includes(current) &&
          columnFillScore(fileHeaders, rows, current) > 0;
        if (!currentOk) {
          const better = guessed[k] || "";
          if (better !== current) {
            next[k] = better;
            changed = true;
          }
        }
      }
      return changed ? next : prev;
    });
  }, [
    fileHeaders.join("|"),
    templateVarCount,
    phoneField,
    filePreview?.rows?.length,
  ]);

  const mappedExamples = useMemo(() => {
    if (!templateVarCount) return previewForm?.body?.examples || [];
    const row = filePreview?.rows?.[0];
    if (!row) {
      return Array.from(
        { length: templateVarCount },
        (_, i) => previewForm?.body?.examples?.[i] || `Sample ${i + 1}`,
      );
    }
    return Array.from({ length: templateVarCount }, (_, i) => {
      const header = fieldMapping[String(i + 1)];
      const fromFile = header ? String(row[header] ?? "").trim() : "";
      return (
        fromFile ||
        previewForm?.body?.examples?.[i] ||
        `{{${i + 1}}}`
      );
    });
  }, [
    templateVarCount,
    filePreview?.rows,
    fieldMapping,
    previewForm?.body?.examples,
  ]);

  const needsHeaderImage = Boolean(
    previewForm?.header?.enabled &&
      ["IMAGE", "VIDEO", "DOCUMENT"].includes(
        String(previewForm?.header?.format || "").toUpperCase(),
      ),
  );

  const recipientCheck = useMemo(() => {
    if (!filePreview?.rows?.length || !phoneField) {
      return null;
    }
    return analyzeContactRows({
      rows: filePreview.rows,
      headers: fileHeaders,
      phoneField,
      fieldMapping,
      templateVarCount,
      needsHeaderImage,
      hasHeaderImage: resolvedHeaderImageUrl.startsWith("http"),
    });
  }, [
    filePreview?.rows,
    fileHeaders,
    phoneField,
    fieldMapping,
    templateVarCount,
    needsHeaderImage,
    resolvedHeaderImageUrl,
  ]);

  useEffect(() => {
    if (!recipientCheck) return;
    const order = [
      "invalid_numbers",
      "missing_numbers",
      "duplicates",
      "opted_out",
      "missing_values",
      "missing_images",
    ];
    const firstWithRows = order.find((key) => recipientCheck.counts[key] > 0);
    if (firstWithRows) setReviewCategory(firstWithRows);
  }, [recipientCheck?.totalRows, phoneField, csvFile?.name]);

  const bodyPreview = previewForm
    ? applyVars(previewForm.body.text, mappedExamples)
    : "";

  const nowLabel = new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const handleUploadImages = async (fileList) => {
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

  const acceptContactFile = async (file) => {
    if (!file) return;
    if (!contactExt(file.name)) {
      toast.error("Use CSV, Excel, TSV, TXT, or ODS");
      return;
    }
    try {
      setParsingFile(true);
      const parsed = await parseContactFile(file);
      if (!parsed.headers.length || !parsed.rows.length) {
        toast.error("No rows found. Add a header row and at least one contact.");
        return;
      }
      setCsvFile(file);
      setFilePreview(parsed);
      toast.success(`${parsed.rows.length} contacts ready`);
    } catch (err) {
      setCsvFile(null);
      setFilePreview(null);
      toast.error(err?.message || "Could not read that file");
    } finally {
      setParsingFile(false);
    }
  };

  const clearContactFile = () => {
    setCsvFile(null);
    setFilePreview(null);
    setPhoneField("");
    setFieldMapping({});
    if (csvInputRef.current) csvInputRef.current.value = "";
  };

  const setVarMapping = (varIndex, header) => {
    setFieldMapping((prev) => ({
      ...prev,
      [String(varIndex)]: header,
    }));
  };

  const handleSubmit = async () => {
    if (!selectedTemplate?.name) {
      toast.error("Select an approved WhatsApp template");
      return;
    }
    if (!csvFile) {
      toast.error("Choose a contacts file first");
      return;
    }
    if (!phoneField) {
      toast.error("Select which column has the WhatsApp / phone number");
      return;
    }
    if (templateVarCount > 0) {
      for (let i = 1; i <= templateVarCount; i++) {
        if (!fieldMapping[String(i)]) {
          toast.error(`Map a file column to {{${i}}}`);
          return;
        }
      }
    }
    if (sendMode === "schedule" && !scheduleAt) {
      toast.error("Pick a campaign date and time");
      return;
    }

    const needsHeaderImageSubmit =
      previewForm?.header?.enabled &&
      previewForm.header.format !== "TEXT" &&
      Boolean(previewForm.header.format);

    if (
      needsHeaderImageSubmit &&
      !resolvedHeaderImageUrl.startsWith("http")
    ) {
      toast.error(
        "This template needs a public header image. Meta sample is missing — upload or paste an S3/CDN URL.",
      );
      return;
    }

    if (!recipientCheck) {
      toast.error("Upload a contact file and select the phone column first");
      return;
    }

    if (recipientCheck.readyCount === 0) {
      toast.error(
        `No contacts ready to send. Check Recipient check: ${recipientCheck.excludedCount} excluded (invalid / missing / duplicate / opted out).`,
      );
      return;
    }

    if (recipientCheck.excludedCount > 0) {
      toast.message(
        `Sending ${recipientCheck.readyCount} ready contact(s). ${recipientCheck.excludedCount} row(s) excluded automatically.`,
      );
    }

    try {
      setSending(true);
      const fd = new FormData();
      const readyRows = recipientCheck.ready.map((item) => item.row);
      const sendFile = filePreview?.headers?.length
        ? rowsToCsvFile(filePreview.headers, readyRows, csvFile.name)
        : csvFile;
      fd.append("file", sendFile);
      fd.append("templateName", selectedTemplate.name);
      fd.append("sendMode", sendMode);
      fd.append("phoneField", phoneField);
      fd.append(
        "validationSummary",
        JSON.stringify({
          totalRows: recipientCheck.totalRows,
          readyCount: recipientCheck.readyCount,
          excludedCount: recipientCheck.excludedCount,
          counts: recipientCheck.counts,
        }),
      );
      if (templateVarCount > 0) {
        fd.append("fieldMapping", JSON.stringify(fieldMapping));
      }
      if (sendMode === "schedule") {
        fd.append("scheduleAt", new Date(scheduleAt).toISOString());
      }
      if (resolvedHeaderImageUrl) {
        fd.append("headerImageUrl", resolvedHeaderImageUrl);
      }

      const res = await sentBulkWhatsAppNotification(fd);
      const data = res?.data;
      toast.success(
        data?.message ||
          (sendMode === "schedule"
            ? "Bulk WhatsApp campaign scheduled — queuing in background"
            : `Campaign accepted for ${recipientCheck.readyCount} contact(s)`),
      );
      onClose?.();
    } catch (err) {
      const apiMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        (typeof err?.response?.data === "string" ? err.response.data : null);
      toast.error(apiMsg || err?.message || "Bulk send failed");
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/25 p-0 backdrop-blur-[2px] md:items-center md:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div className="flex h-[min(820px,88vh)] w-full max-w-[980px] flex-col overflow-hidden rounded-t-[28px] bg-[#f7fbf8] shadow-[0_24px_80px_rgba(16,185,129,0.16)] md:rounded-[28px]">
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-emerald-100 bg-white px-5 py-4">
          <div className="flex min-w-0 items-start gap-3">
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#27AE60] text-white shadow-[0_8px_18px_rgba(37,211,102,0.35)]">
              <MessageCircle size={20} />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold tracking-tight text-[#0f3d2e]">
                WhatsApp Campaign
              </h2>
              <p className="text-[13px] text-[#5c7d6d]">
                Create and send personalized WhatsApp campaigns.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-emerald-50 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-2">
          {/* LEFT */}
          <div className="min-h-0 space-y-4 overflow-y-auto border-r border-emerald-100 p-4 sm:p-5">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-emerald-600">
                01 · Settings
              </p>
              <h3 className="mt-1 text-base font-semibold text-[#0f3d2e]">
                Campaign Settings
              </h3>
              <p className="text-[13px] text-[#5c7d6d]">
                Configure your WhatsApp campaign.
              </p>
            </div>

            {/* Template */}
            <section className="space-y-2">
              <label className="text-xs font-bold text-slate-700">
                WhatsApp Template
              </label>
              <select
                className="h-11 w-full rounded-xl border border-emerald-100 bg-white px-3 text-sm outline-none focus:border-emerald-400"
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
            <section className="space-y-3 rounded-2xl border border-emerald-100 bg-white p-3.5 shadow-[0_8px_24px_rgba(16,185,129,0.08)]">
              <div className="flex items-center gap-2">
                <ImageIcon size={16} className="text-[#5c7d6d]" />
                <p className="text-sm font-bold text-slate-800">Header Image</p>
              </div>

              <button
                type="button"
                disabled={uploadingImage}
                onClick={() => imageInputRef.current?.click()}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-emerald-200 bg-emerald-50/50 px-3 py-3 text-sm font-semibold text-[#0f3d2e] hover:border-emerald-400 hover:bg-emerald-50 disabled:opacity-60"
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
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  handleUploadImages(e.target.files);
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
                className="h-10 w-full rounded-xl border border-emerald-100 px-3 text-xs outline-none focus:border-emerald-400"
              />
              {campaignHeaderUrl.startsWith("http") ? (
                <p className="truncate text-[11px] text-emerald-700">
                  Public URL ready for Meta: {campaignHeaderUrl}
                </p>
              ) : usingTemplateMedia ? (
                <p className="text-[11px] text-emerald-700">
                  Using template create-time media from Meta. Server converts it
                  before send. Upload only to replace it.
                </p>
              ) : (
                <p className="text-[11px] text-slate-400">
                  Upload fills this URL automatically from the backend.
                </p>
              )}

              {effectivePreview ? (
                <div className="relative overflow-hidden rounded-xl border border-emerald-100 bg-slate-50">
                  <img
                    src={effectivePreview}
                    alt="Selected campaign"
                    className="max-h-44 w-full object-contain bg-white"
                  />
                  <div className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-1 text-[11px] font-bold text-white">
                    <Check size={12} />{" "}
                    {usingTemplateMedia
                      ? "Template media (Meta)"
                      : "Selected for campaign"}
                  </div>
                  {!usingTemplateMedia ? (
                    <button
                      type="button"
                      onClick={clearSelectedImage}
                      className="absolute bottom-2 right-2 rounded-lg border border-emerald-100 bg-white px-2.5 py-1 text-xs font-bold text-slate-600"
                    >
                      Clear
                    </button>
                  ) : null}
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
                              active ? "border-emerald-500" : "border-emerald-100"
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
                  <p className="mt-2 rounded-lg border border-emerald-100 bg-emerald-50/70 px-2.5 py-2 text-[11px] leading-snug text-emerald-700">
                    Uploaded images are stored on S3. The public URL is filled
                    automatically for Meta template headers.
                  </p>
                </div>
              ) : null}
            </section>
            ) : null}

            {/* Contacts file */}
            <section className="space-y-2 rounded-2xl border border-emerald-100 bg-white p-3.5 shadow-[0_8px_24px_rgba(16,185,129,0.08)]">
              <h4 className="text-sm font-extrabold text-[#0f3d2e]">
                Contact file
              </h4>
              <p className="text-xs text-[#5c7d6d]">
                CSV, Excel (.xlsx, .xls), TSV, TXT, or ODS. First row must be
                headers. After upload, map the phone column and each {"{{n}}"}
                placeholder.
              </p>
              <input
                ref={csvInputRef}
                type="file"
                accept={CONTACT_ACCEPT}
                disabled={parsingFile}
                className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-slate-700 hover:file:bg-slate-200 disabled:opacity-60"
                onChange={(e) => {
                  acceptContactFile(e.target.files?.[0]);
                }}
              />
              {parsingFile ? (
                <p className="inline-flex items-center gap-1.5 text-[11px] text-[#5c7d6d]">
                  <Loader2 size={12} className="animate-spin" />
                  Reading file…
                </p>
              ) : null}
              {csvFile ? (
                <div className="flex items-center justify-between gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-emerald-800">
                      {csvFile.name}
                    </p>
                    <p className="text-[11px] text-emerald-600">
                      {(csvFile.size / 1024).toFixed(1)} KB ·{" "}
                      {filePreview?.rows?.length || 0} rows
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={clearContactFile}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-rose-500"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <p className="text-[11px] text-slate-400">No file chosen</p>
              )}

              {fileHeaders.length ? (
                <div className="space-y-3 rounded-xl border border-emerald-100 bg-slate-50/80 p-3">
                  <div>
                    <p className="text-xs font-extrabold text-slate-800">
                      Map file columns
                    </p>
                    <p className="text-[11px] text-[#5c7d6d]">
                      Choose which uploaded column is the phone number, and which
                      columns fill each template placeholder like {"{{1}}"}.
                    </p>
                  </div>

                  <div>
                    <label className="mb-1 block text-[10px] font-black uppercase tracking-[0.12em] text-[#5c7d6d]">
                      Select number field
                    </label>
                    <select
                      value={phoneField}
                      onChange={(e) => setPhoneField(e.target.value)}
                      className="h-10 w-full rounded-xl border border-emerald-100 bg-white px-3 text-sm outline-none focus:border-emerald-400"
                    >
                      <option value="">Select phone / WhatsApp column</option>
                      {fileHeaders.map((header) => (
                        <option key={header} value={header}>
                          {header}
                        </option>
                      ))}
                    </select>
                  </div>

                  {templateVarCount > 0 ? (
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#5c7d6d]">
                        Template variables
                      </p>
                      {Array.from({ length: templateVarCount }, (_, i) => {
                        const index = i + 1;
                        const key = String(index);
                        return (
                          <div
                            key={key}
                            className="grid grid-cols-[72px_1fr] items-center gap-2"
                          >
                            <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-2 text-center text-xs font-extrabold text-emerald-800">
                              {`{{${index}}}`}
                            </span>
                            <select
                              value={fieldMapping[key] || ""}
                              onChange={(e) =>
                                setVarMapping(index, e.target.value)
                              }
                              className="h-10 w-full rounded-xl border border-emerald-100 bg-white px-3 text-sm outline-none focus:border-emerald-400"
                            >
                              <option value="">Select column</option>
                              {fileHeaders.map((header) => (
                                <option key={header} value={header}>
                                  {header}
                                </option>
                              ))}
                            </select>
                          </div>
                        );
                      })}
                      <p className="text-[11px] text-slate-400">
                        Preview uses the first row with these mappings.
                      </p>
                    </div>
                  ) : selectedTemplate ? (
                    <p className="text-[11px] text-[#5c7d6d]">
                      This template has no {"{{n}}"} placeholders — only the
                      phone column is required.
                    </p>
                  ) : (
                    <p className="text-[11px] text-amber-700">
                      Select a template to map its {"{{1}}"}, {"{{2}}"}, …
                      fields.
                    </p>
                  )}
                </div>
              ) : null}

              {recipientCheck ? (
                <div className="space-y-3 rounded-xl border border-emerald-100 bg-white p-3">
                  <div>
                    <p className="text-xs font-extrabold text-[#0f3d2e]">
                      Recipient check
                    </p>
                    <p className="text-[11px] text-[#5c7d6d]">
                      Phone, duplicates, and opt-outs are excluded. Empty
                      template fields are warnings only — send still works.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5">
                      <p className="text-[10px] font-black uppercase tracking-wide text-emerald-700">
                        Ready to send
                      </p>
                      <p className="text-lg font-extrabold text-emerald-900">
                        {recipientCheck.readyCount}
                      </p>
                    </div>
                    <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5">
                      <p className="text-[10px] font-black uppercase tracking-wide text-rose-700">
                        Excluded
                      </p>
                      <p className="text-lg font-extrabold text-rose-900">
                        {recipientCheck.excludedCount}
                      </p>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Checked {recipientCheck.totalRows} uploaded row
                    {recipientCheck.totalRows === 1 ? "" : "s"}.
                  </p>

                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#5c7d6d]">
                    Issues found
                  </p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {[
                      ["duplicates", Copy, false],
                      ["invalid_numbers", PhoneOff, false],
                      ["missing_numbers", UserMinus, false],
                      ["opted_out", Ban, false],
                      ["missing_values", AlertTriangle, true],
                      ["missing_images", ImageOff, false],
                    ].map(([key, Icon, soft]) => {
                      const count = Number(recipientCheck.counts[key] || 0);
                      const active = reviewCategory === key;
                      const warnColor = soft ? "text-amber-600" : "text-rose-500";
                      const warnNum = soft ? "text-amber-700" : "text-rose-700";
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setReviewCategory(key)}
                          className={`rounded-xl border px-2.5 py-2 text-left transition ${
                            active
                              ? soft
                                ? "border-amber-400 bg-amber-50 shadow-sm"
                                : "border-emerald-400 bg-emerald-50 shadow-sm"
                              : "border-emerald-100 bg-slate-50/80 hover:border-emerald-200"
                          }`}
                        >
                          <div className="mb-1 flex items-center gap-1.5">
                            <Icon
                              size={14}
                              className={
                                count > 0 ? warnColor : "text-slate-400"
                              }
                            />
                            <span className="text-[10px] font-bold text-slate-700">
                              {VALIDATION_CATEGORY_META[key].label}
                            </span>
                          </div>
                          <p
                            className={`text-base font-extrabold ${
                              count > 0 ? warnNum : "text-slate-500"
                            }`}
                          >
                            {count}
                          </p>
                        </button>
                      );
                    })}
                  </div>

                  <div className="rounded-xl border border-emerald-100 bg-slate-50/80 p-2.5">
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-slate-800">
                        {VALIDATION_CATEGORY_META[reviewCategory]?.label ||
                          "Details"}
                      </p>
                      <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-slate-500">
                        {recipientCheck.counts[reviewCategory] || 0} rows
                      </span>
                    </div>
                    <p className="mb-2 text-[11px] text-[#5c7d6d]">
                      {VALIDATION_CATEGORY_META[reviewCategory]?.description}
                    </p>
                    {(recipientCheck.categories[reviewCategory] || []).length ? (
                      <div className="max-h-36 overflow-auto rounded-lg border border-emerald-100 bg-white">
                        <table className="w-full text-left text-[11px]">
                          <thead className="sticky top-0 bg-slate-50">
                            <tr>
                              <th className="px-2 py-1.5 font-semibold text-slate-500">
                                Excel row
                              </th>
                              <th className="px-2 py-1.5 font-semibold text-slate-500">
                                Detected value
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {(recipientCheck.categories[reviewCategory] || [])
                              .slice(0, 50)
                              .map((item, idx) => (
                                <tr
                                  key={`${item.excelRow}-${idx}`}
                                  className="border-t border-slate-100"
                                >
                                  <td className="px-2 py-1.5 font-semibold text-slate-700">
                                    {item.excelRow ?? "—"}
                                  </td>
                                  <td className="max-w-[180px] truncate px-2 py-1.5 text-slate-600">
                                    {item.detectedValue}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-[11px] text-emerald-700">
                        No rows in this category.
                      </p>
                    )}
                  </div>
                </div>
              ) : null}

              {filePreview?.headers?.length ? (
                <div className="overflow-hidden rounded-xl border border-emerald-100">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 bg-slate-50 px-3 py-2">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-[#5c7d6d]">
                      File preview
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {Math.min(8, filePreview.rows.length)} of{" "}
                      {filePreview.rows.length}
                    </p>
                  </div>
                  <div className="max-h-52 overflow-auto">
                    <table className="w-full min-w-[280px] border-collapse text-left text-[11px]">
                      <thead className="sticky top-0 bg-white">
                        <tr>
                          {filePreview.headers.map((header) => (
                            <th
                              key={header}
                              className="border-b border-r border-slate-100 px-2 py-1.5 font-semibold text-emerald-700 last:border-r-0"
                            >
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filePreview.rows.slice(0, 8).map((row, index) => (
                          <tr key={index} className="odd:bg-slate-50/60">
                            {filePreview.headers.map((header) => (
                              <td
                                key={header}
                                className="max-w-[140px] truncate border-b border-r border-slate-100 px-2 py-1.5 text-slate-700 last:border-r-0"
                                title={String(row[header] ?? "")}
                              >
                                {String(row[header] ?? "") || "—"}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}
            </section>

            {/* Send time */}
            <section className="space-y-3 rounded-2xl border border-emerald-100 bg-white p-3.5 shadow-[0_8px_24px_rgba(16,185,129,0.08)]">
              <div>
                <h4 className="text-sm font-extrabold text-[#0f3d2e]">
                  Send Time
                </h4>
                <p className="text-xs text-[#5c7d6d]">
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
                      : "border-emerald-100 bg-white text-slate-600"
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
                      : "border-emerald-100 bg-white text-slate-600"
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
                    className="h-11 w-full rounded-xl border border-emerald-100 px-3 text-sm outline-none focus:border-emerald-400"
                  />
                  <p className="mt-1 text-[11px] text-slate-400">
                    Scheduled for {formatDisplayDateTime(scheduleAt)}
                  </p>
                </div>
              ) : null}
            </section>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={
                sending ||
                parsingFile ||
                !selectedTemplate ||
                !csvFile ||
                !phoneField ||
                (recipientCheck
                  ? recipientCheck.readyCount === 0 || !recipientCheck.canSend
                  : true) ||
                (templateVarCount > 0 &&
                  Array.from({ length: templateVarCount }, (_, i) =>
                    fieldMapping[String(i + 1)],
                  ).some((v) => !v))
              }
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#27AE60] px-4 py-3.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(18,161,80,0.24)] hover:bg-[#1e8f4d] disabled:opacity-50"
            >
              {sending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {sendMode === "schedule" ? "Scheduling…" : "Sending…"}
                </>
              ) : (
                <>
                  <Send size={16} />
                  {sendMode === "schedule"
                    ? `Schedule ${recipientCheck?.readyCount || 0} contacts`
                    : `Send to ${recipientCheck?.readyCount || 0} ready contacts`}
                </>
              )}
            </button>
          </div>

          {/* RIGHT — preview */}
          <div className="hidden min-h-0 overflow-y-auto bg-[#f7fbf8] p-4 sm:p-5 lg:block">
            <div className="mb-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-emerald-600">
                02 · Preview
              </p>
              <h3 className="mt-1 text-base font-semibold text-[#0f3d2e]">
                WhatsApp Preview
              </h3>
              <p className="text-[13px] text-[#5c7d6d]">
                Template as it will appear in chat.
              </p>
            </div>

            <div className="mx-auto w-full max-w-[340px] overflow-hidden rounded-2xl border border-emerald-100 bg-[#ECE5DD] shadow-[0_12px_32px_rgba(16,185,129,0.14)]">
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

              <div className="min-h-[480px] bg-[#efeae2] bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,.35),transparent_28%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,.25),transparent_22%)] p-2.5">
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

export default CsvCampaignModal;
