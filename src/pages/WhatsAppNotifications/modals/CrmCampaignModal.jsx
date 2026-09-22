import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Loader2,
  MapPin,
  MessageCircle,
  MoreVertical,
  Search,
  Send,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  getAllUsers,
  sentWhatsAppNotification,
  uploadWhatsAppCampaignImage,
} from "../../../features/user/userService";
import {
  INDIAN_STATES,
  getCitiesByState,
} from "../../../utils/countryStateCity";
import { componentsToForm } from "../utils/formMapper";
import { applyVars } from "../utils/helper";
import { WhatsAppTemplatePreview } from "../preview/WhatsAppTemplatePreview";

const PROFILE_PAGE_SIZE = 12;

/** Location targeting scopes for campaign audience. */
const LOCATION_SCOPES = [
  {
    id: "all_india",
    label: "All India",
    hint: "Every saved profile nationwide",
  },
  {
    id: "state",
    label: "State",
    hint: "Users in one state",
  },
  {
    id: "city",
    label: "City",
    hint: "Users in one city",
  },
  {
    id: "locality",
    label: "Locality",
    hint: "Users in one locality",
  },
];

/** Base profile columns for the Show field dropdown (user collection). */
const BASE_PROFILE_DISPLAY_FIELDS = [
  { id: "name", label: "Name", hint: "Show names only" },
  { id: "email", label: "Email", hint: "Show emails only" },
  { id: "phone", label: "Phone", hint: "Show phones only" },
  { id: "locality", label: "Locality", hint: "Show localities only" },
  { id: "city", label: "City", hint: "Show cities only" },
  { id: "state", label: "State", hint: "Show states only" },
  { id: "pincode", label: "Pincode", hint: "Show pincodes only" },
  { id: "accountStatus", label: "Account status", hint: "Show account status only" },
  { id: "phoneVerified", label: "Phone verified", hint: "Show verification status only" },
  { id: "role", label: "Role", hint: "Show roles only" },
  { id: "createdAt", label: "Created at", hint: "Show created dates only" },
  { id: "lastLoginAt", label: "Last login", hint: "Show last login only" },
];

const HIDDEN_DYNAMIC_KEYS = new Set([
  "_id",
  "id",
  "__v",
  "token",
  "password",
  "roleId",
  "managerId",
  "onboardedBy",
  "workingLocations",
]);

function humanizeFieldLabel(key) {
  return String(key)
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (c) => c.toUpperCase());
}

function formatProfileFieldValue(user, fieldId) {
  if (!user) return "—";

  if (fieldId === "role") {
    const role = user.roleId;
    if (role && typeof role === "object") {
      const label = role.label || role.name;
      if (label != null && String(label).trim()) return String(label);
    }
    if (typeof role === "string" && role.trim()) return role;
    return "—";
  }

  if (fieldId === "phoneVerified") {
    if (user.phoneVerified === true) return "Verified";
    if (user.phoneVerified === false) return "Unverified";
    return "—";
  }

  if (fieldId === "createdAt" || fieldId === "lastLoginAt" || fieldId === "lastLogin") {
    const raw = user[fieldId] ?? (fieldId === "lastLoginAt" ? user.lastLogin : null);
    if (!raw) return "—";
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return String(raw);
    return d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const raw = user[fieldId];
  if (raw == null) return "—";
  if (typeof raw === "boolean") return raw ? "Yes" : "No";
  if (typeof raw === "object") return "—";
  const text = String(raw).trim();
  return text || "—";
}

const fieldLabel =
  "mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.06em] text-emerald-700";
const fieldControl =
  "h-10 w-full rounded-xl border border-emerald-100 bg-white px-3.5 text-sm text-[#0f3d2e] outline-none transition placeholder:text-[#5c7d6d] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25";
const sectionCard =
  "rounded-2xl border border-emerald-100 bg-white p-4 shadow-[0_8px_24px_rgba(16,185,129,0.08)]";
const sectionTitle = "text-[14px] font-semibold text-[#0f3d2e]";
const sectionHint = "mt-0.5 text-[12px] leading-relaxed text-[#5c7d6d]";
const sectionKicker =
  "text-[11px] font-bold uppercase tracking-[0.08em] text-emerald-600";

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

  const [profilePage, setProfilePage] = useState(1);
  const [locationScope, setLocationScope] = useState("all_india");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedLocality, setSelectedLocality] = useState("");
  const [displayFieldId, setDisplayFieldId] = useState("name");
  const [displayFieldMenuOpen, setDisplayFieldMenuOpen] = useState(false);
  const displayFieldMenuRef = useRef(null);

  const [sendMode, setSendMode] = useState("now"); // now | schedule
  const [scheduleAt, setScheduleAt] = useState(toLocalDateTimeValue());
  const [sending, setSending] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const cityOptions = useMemo(
    () => (selectedState ? getCitiesByState(selectedState) : []),
    [selectedState],
  );

  const audienceReady = useMemo(() => {
    if (locationScope === "all_india") return true;
    if (locationScope === "state") return Boolean(selectedState);
    if (locationScope === "city")
      return Boolean(selectedState && selectedCity);
    if (locationScope === "locality")
      return Boolean(selectedState && selectedCity && selectedLocality.trim());
    return false;
  }, [locationScope, selectedState, selectedCity, selectedLocality]);

  const audienceLabel = useMemo(() => {
    if (locationScope === "all_india") return "All India";
    if (locationScope === "state") return selectedState || "Select state";
    if (locationScope === "city") {
      if (!selectedState) return "Select state";
      if (!selectedCity) return "Select city";
      return `${selectedCity}, ${selectedState}`;
    }
    if (locationScope === "locality") {
      if (!selectedState) return "Select state";
      if (!selectedCity) return "Select city";
      if (!selectedLocality.trim()) return "Select locality";
      return `${selectedLocality.trim()}, ${selectedCity}`;
    }
    return "Audience";
  }, [locationScope, selectedState, selectedCity, selectedLocality]);

  useEffect(() => {
    setProfilePage(1);
  }, [locationScope, selectedState, selectedCity, selectedLocality]);

  useEffect(() => {
    setSelectedCity("");
    setSelectedLocality("");
  }, [selectedState]);

  useEffect(() => {
    setSelectedLocality("");
  }, [selectedCity]);

  useEffect(() => {
    if (locationScope === "all_india") {
      setSelectedState("");
      setSelectedCity("");
      setSelectedLocality("");
    } else if (locationScope === "state") {
      setSelectedCity("");
      setSelectedLocality("");
    } else if (locationScope === "city") {
      setSelectedLocality("");
    }
  }, [locationScope]);

  useEffect(() => {
    if (!displayFieldMenuOpen) return;
    const onDoc = (e) => {
      if (!displayFieldMenuRef.current?.contains(e.target)) {
        setDisplayFieldMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [displayFieldMenuOpen]);

  const locationQueryParams = useMemo(() => {
    const params = { platformOnly: 1, role: "all" };
    if (locationScope === "state" && selectedState) {
      params.state = selectedState;
    } else if (locationScope === "city" && selectedState && selectedCity) {
      params.state = selectedState;
      params.city = selectedCity;
    } else if (
      locationScope === "locality" &&
      selectedState &&
      selectedCity &&
      selectedLocality.trim()
    ) {
      params.state = selectedState;
      params.city = selectedCity;
      params.locality = selectedLocality.trim();
    }
    return params;
  }, [locationScope, selectedState, selectedCity, selectedLocality]);

  /** Paginated audience matching the selected location scope. */
  const profileListQuery = useQuery({
    queryKey: [
      "crm-campaign-profiles",
      locationScope,
      selectedState,
      selectedCity,
      selectedLocality.trim(),
      profilePage,
      PROFILE_PAGE_SIZE,
    ],
    enabled: audienceReady,
    queryFn: async () => {
      const res = await getAllUsers({
        ...locationQueryParams,
        page: profilePage,
        limit: PROFILE_PAGE_SIZE,
      });
      const body = res?.data ?? res;
      const rows = Array.isArray(body?.data)
        ? body.data
        : Array.isArray(body)
          ? body
          : [];
      const meta = body?.meta || {};
      const total = Number(meta.total ?? rows.length) || 0;
      const page = Math.max(1, Number(meta.page) || profilePage);
      const pages = Math.max(
        1,
        Number(meta.pages) ||
          Math.ceil(total / PROFILE_PAGE_SIZE) ||
          1,
      );
      return { rows, total, page, pages };
    },
    placeholderData: (prev) => prev,
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  /** Distinct localities from users already saved in the selected city. */
  const localityOptionsQuery = useQuery({
    queryKey: ["crm-campaign-localities", selectedState, selectedCity],
    enabled:
      locationScope === "locality" &&
      Boolean(selectedState && selectedCity),
    queryFn: async () => {
      const res = await getAllUsers({
        platformOnly: 1,
        role: "all",
        state: selectedState,
        city: selectedCity,
        page: 1,
        limit: 200,
      });
      const body = res?.data ?? res;
      const rows = Array.isArray(body?.data)
        ? body.data
        : Array.isArray(body)
          ? body
          : [];
      return [
        ...new Set(
          rows
            .map((u) => String(u?.locality || "").trim())
            .filter(Boolean),
        ),
      ].sort((a, b) => a.localeCompare(b));
    },
    staleTime: 60_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const localityOptions = localityOptionsQuery.data || [];
  const profileRows = profileListQuery.data?.rows || [];
  const profileTotal = profileListQuery.data?.total || 0;
  const profilePages = Math.max(1, profileListQuery.data?.pages || 1);
  const safeProfilePage = Math.min(Math.max(1, profilePage), profilePages);
  const isInitialAudienceLoad =
    profileListQuery.isLoading && !profileListQuery.data;
  const isPageFetching =
    profileListQuery.isFetching && !isInitialAudienceLoad;

  /** Show field options: base user fields + any extra simple keys from loaded rows. */
  const profileDisplayFields = useMemo(() => {
    const byId = new Map(
      BASE_PROFILE_DISPLAY_FIELDS.map((f) => [f.id, f]),
    );
    for (const row of profileRows) {
      if (!row || typeof row !== "object") continue;
      for (const key of Object.keys(row)) {
        if (HIDDEN_DYNAMIC_KEYS.has(key) || byId.has(key)) continue;
        const val = row[key];
        if (val != null && typeof val === "object") continue;
        byId.set(key, {
          id: key,
          label: humanizeFieldLabel(key),
          hint: `Show ${humanizeFieldLabel(key).toLowerCase()} only`,
        });
      }
      if (row.roleId && !byId.has("role")) {
        byId.set(
          "role",
          BASE_PROFILE_DISPLAY_FIELDS.find((f) => f.id === "role"),
        );
      }
    }
    return Array.from(byId.values()).filter(Boolean);
  }, [profileRows]);

  const selectedDisplayField =
    profileDisplayFields.find((f) => f.id === displayFieldId) ||
    profileDisplayFields[0] ||
    BASE_PROFILE_DISPLAY_FIELDS[0];

  useEffect(() => {
    if (
      profileDisplayFields.length &&
      !profileDisplayFields.some((f) => f.id === displayFieldId)
    ) {
      setDisplayFieldId(profileDisplayFields[0].id);
    }
  }, [profileDisplayFields, displayFieldId]);

  // Keep UI page in sync if API clamps page number.
  useEffect(() => {
    const apiPage = profileListQuery.data?.page;
    if (apiPage != null && apiPage !== profilePage && audienceReady) {
      setProfilePage(apiPage);
    }
  }, [profileListQuery.data?.page, profilePage, audienceReady]);

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
    if (sendMode === "schedule" && !scheduleAt) {
      toast.error("Pick a campaign date and time");
      return;
    }
    if (!audienceReady) {
      if (locationScope === "state") {
        toast.error("Select a state for this campaign");
      } else if (locationScope === "city") {
        toast.error("Select state and city for this campaign");
      } else {
        toast.error("Select state, city, and locality for this campaign");
      }
      return;
    }
    if (audienceReady && profileTotal === 0 && !profileListQuery.isLoading) {
      toast.error("No recipients found for this location");
      return;
    }

    const payload = {
      templateName: selectedTemplate.name,
      module: "all",
      roleName: undefined,
      dynamicHeaderImageField: null,
      headerImageUrl: headerUrl.trim() || "",
      audienceFilters: {
        fieldRules: [],
        dateRules: [],
      },
      sendMode,
      scheduleAt:
        sendMode === "schedule" ? new Date(scheduleAt).toISOString() : null,
      recipientField: "phone",
      state:
        locationScope === "all_india"
          ? undefined
          : selectedState || undefined,
      city:
        locationScope === "city" || locationScope === "locality"
          ? selectedCity || undefined
          : undefined,
      locality:
        locationScope === "locality"
          ? selectedLocality.trim() || undefined
          : undefined,
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
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/25 p-0 backdrop-blur-[2px] md:items-center md:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div className="flex h-[min(820px,88vh)] w-full max-w-[980px] flex-col overflow-hidden rounded-t-[28px] bg-[#f7fbf8] shadow-[0_24px_80px_rgba(16,185,129,0.16)] md:rounded-[28px]">
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-emerald-100 bg-white px-5 py-4">
          <div className="flex min-w-0 items-start gap-3">
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#25D366] text-white shadow-[0_8px_18px_rgba(37,211,102,0.35)]">
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

        {/* Body */}
        <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-2">
          {/* LEFT — settings */}
          <div className="min-h-0 space-y-4 overflow-y-auto border-r border-emerald-100 p-4 sm:p-5">
            <section className={sectionCard}>
              <p className={sectionKicker}>01 · Template</p>
              <h3 className={`mt-1 ${sectionTitle}`}>Campaign template</h3>
              <p className={`${sectionHint} mb-3`}>
                Choose an approved Meta template for this send.
              </p>
              <label className={fieldLabel}>WhatsApp Template</label>
              <select
                className={fieldControl}
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
                <div className="mt-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-[13px] font-semibold text-emerald-700">
                  Template status: {selectedTemplate.status || "APPROVED"}
                </div>
              ) : null}
            </section>

            {previewForm?.header?.enabled &&
            ["IMAGE", "VIDEO", "DOCUMENT"].includes(
              String(previewForm.header.format || "").toUpperCase(),
            ) ? (
            <section className={`${sectionCard} space-y-3`}>
              <p className={sectionKicker}>02 · Media</p>
              <div className="flex items-center gap-2">
                <ImageIcon size={16} className="text-emerald-600" />
                <h3 className={sectionTitle}>Header image</h3>
              </div>

              <button
                type="button"
                disabled={uploadingImage}
                onClick={() => fileRef.current?.click()}
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
                className="h-10 w-full rounded-xl border border-emerald-100 px-3 text-xs outline-none focus:border-emerald-400"
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
                <div className="relative overflow-hidden rounded-xl border border-emerald-100 bg-slate-50">
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
                    className="absolute bottom-2 right-2 rounded-lg border border-emerald-100 bg-white px-2.5 py-1 text-xs font-bold text-slate-600"
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
                                : "border-emerald-100"
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

            {/* Send time */}
            <section className={`${sectionCard} space-y-3`}>
              <div>
                <p className={sectionKicker}>03 · Delivery</p>
                <h4 className={`mt-1 ${sectionTitle}`}>Send time</h4>
                <p className={sectionHint}>
                  Send immediately or schedule this campaign for a specific date
                  and time.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSendMode("now")}
                  className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                    sendMode === "now"
                      ? "border-emerald-300 bg-emerald-50 text-emerald-800 shadow-[0_6px_14px_rgba(16,185,129,0.12)]"
                      : "border-emerald-100 bg-white text-[#5c7d6d]"
                  }`}
                >
                  <Send size={14} /> Send now
                </button>
                <button
                  type="button"
                  onClick={() => setSendMode("schedule")}
                  className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                    sendMode === "schedule"
                      ? "border-emerald-300 bg-emerald-50 text-emerald-800 shadow-[0_6px_14px_rgba(16,185,129,0.12)]"
                      : "border-emerald-100 bg-white text-[#5c7d6d]"
                  }`}
                >
                  <CalendarDays size={14} /> Schedule
                </button>
              </div>
              {sendMode === "schedule" ? (
                <div>
                  <label className={fieldLabel}>
                    Campaign date and time
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduleAt}
                    onChange={(e) => setScheduleAt(e.target.value)}
                    className={fieldControl}
                  />
                  <p className="mt-1 text-[11px] text-[#5c7d6d]">
                    Scheduled for {formatDisplayDateTime(scheduleAt)}
                  </p>
                </div>
              ) : null}
            </section>

            <section className={`${sectionCard} space-y-3`}>
              <p className={sectionKicker}>04 · Recipients</p>
              <h4 className={`mt-1 ${sectionTitle}`}>Audience</h4>
              <p className={sectionHint}>
                Pick location, then any profile field. The list shows only that
                column for matching users (paginated). All matches are
                auto-added; WhatsApp sends to Phone.
              </p>

              <label className={fieldLabel}>Location scope</label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {LOCATION_SCOPES.map((scope) => {
                  const active = locationScope === scope.id;
                  return (
                    <button
                      key={scope.id}
                      type="button"
                      onClick={() => setLocationScope(scope.id)}
                      className={`rounded-xl border px-2.5 py-2.5 text-left transition ${
                        active
                          ? "border-emerald-300 bg-emerald-50 shadow-[0_6px_14px_rgba(16,185,129,0.12)]"
                          : "border-emerald-100 bg-white hover:border-emerald-200 hover:bg-emerald-50/50"
                      }`}
                    >
                      <span
                        className={`block text-[12px] font-bold ${
                          active ? "text-emerald-800" : "text-[#0f3d2e]"
                        }`}
                      >
                        {scope.label}
                      </span>
                      <span className="mt-0.5 block text-[10px] leading-snug text-[#5c7d6d]">
                        {scope.hint}
                      </span>
                    </button>
                  );
                })}
              </div>

              {locationScope !== "all_india" ? (
                <div className="space-y-2.5 rounded-xl border border-emerald-100 bg-emerald-50/40 p-3">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800">
                    <MapPin size={13} />
                    Choose {locationScope}
                  </div>

                  <div>
                    <label className={fieldLabel}>State</label>
                    <select
                      className={fieldControl}
                      value={selectedState}
                      onChange={(e) => setSelectedState(e.target.value)}
                    >
                      <option value="">Select state</option>
                      {INDIAN_STATES.map((s) => (
                        <option key={s.isoCode || s.name} value={s.name}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {locationScope === "city" || locationScope === "locality" ? (
                    <div>
                      <label className={fieldLabel}>City</label>
                      <select
                        className={fieldControl}
                        value={selectedCity}
                        disabled={!selectedState}
                        onChange={(e) => setSelectedCity(e.target.value)}
                      >
                        <option value="">
                          {selectedState ? "Select city" : "Select state first"}
                        </option>
                        {cityOptions.map((c) => (
                          <option key={c.name} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : null}

                  {locationScope === "locality" ? (
                    <div>
                      <label className={fieldLabel}>Locality</label>
                      <input
                        className={fieldControl}
                        list="crm-campaign-locality-options"
                        placeholder={
                          selectedCity
                            ? "Select or type locality"
                            : "Select city first"
                        }
                        value={selectedLocality}
                        disabled={!selectedCity}
                        onChange={(e) => setSelectedLocality(e.target.value)}
                      />
                      <datalist id="crm-campaign-locality-options">
                        {localityOptions.map((loc) => (
                          <option key={loc} value={loc} />
                        ))}
                      </datalist>
                      {localityOptionsQuery.isFetching ? (
                        <p className="mt-1 text-[10px] text-[#5c7d6d]">
                          Loading saved localities…
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              ) : null}

              <label className={fieldLabel}>Show field</label>
              <div className="relative" ref={displayFieldMenuRef}>
                <button
                  type="button"
                  onClick={() => setDisplayFieldMenuOpen((v) => !v)}
                  className="flex h-12 w-full items-center justify-between gap-2 rounded-xl border border-emerald-100 bg-white px-3 text-left shadow-sm outline-none transition hover:border-emerald-300 focus:ring-2 focus:ring-emerald-500/25"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-[#0f3d2e]">
                      {selectedDisplayField.label}
                    </span>
                    <span className="block truncate text-[11px] text-[#5c7d6d]">
                      {selectedDisplayField.hint}
                    </span>
                  </span>
                  <ChevronDown
                    size={16}
                    className={`shrink-0 text-emerald-600 transition ${
                      displayFieldMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {displayFieldMenuOpen ? (
                  <div className="absolute left-0 right-0 z-40 mt-1.5 max-h-72 overflow-auto rounded-2xl border border-emerald-100 bg-white p-1.5 shadow-[0_16px_40px_rgba(15,23,42,0.16)]">
                    {profileDisplayFields.map((opt) => {
                      const active = displayFieldId === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            setDisplayFieldId(opt.id);
                            setDisplayFieldMenuOpen(false);
                          }}
                          className={`mb-1 flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left last:mb-0 ${
                            active
                              ? "bg-emerald-50"
                              : "hover:bg-emerald-50/60"
                          }`}
                        >
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-bold text-[#0f3d2e]">
                              {opt.label}
                            </span>
                            <span className="block text-[11px] text-[#5c7d6d]">
                              {opt.hint}
                            </span>
                          </span>
                          {active ? (
                            <Check
                              size={16}
                              className="shrink-0 text-emerald-600"
                            />
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>

              <div className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-white">
                <div className="flex items-center justify-between gap-2 border-b border-emerald-100 bg-emerald-50/70 px-3 py-2">
                  <p className="min-w-0 text-[11px] text-[#5c7d6d]">
                    <span className="font-bold text-emerald-800">
                      {selectedDisplayField.label}
                    </span>
                    {" · "}
                    <span className="font-bold text-emerald-800">
                      {audienceLabel}
                    </span>
                    {audienceReady ? (
                      <>
                        {" · "}
                        {profileTotal.toLocaleString("en-IN")} recipients
                        {" · "}
                        auto-added · page {safeProfilePage}/{profilePages}
                        {" · "}
                        {PROFILE_PAGE_SIZE}/page
                      </>
                    ) : (
                      <span className="text-[#5c7d6d]">
                        {" · "}Complete location to preview audience
                      </span>
                    )}
                  </p>
                  {profileListQuery.isFetching ? (
                    <Loader2
                      size={14}
                      className="shrink-0 animate-spin text-emerald-600"
                    />
                  ) : null}
                </div>

                {!audienceReady ? (
                  <p className="px-3 py-8 text-center text-xs text-[#5c7d6d]">
                    Select a location above to load matching recipients.
                  </p>
                ) : isInitialAudienceLoad ? (
                  <div className="space-y-2 p-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-10 animate-pulse rounded-xl bg-emerald-50"
                      />
                    ))}
                  </div>
                ) : profileListQuery.isError ? (
                  <div className="px-3 py-8 text-center text-xs text-rose-600">
                    Could not load recipients.{" "}
                    <button
                      type="button"
                      className="font-semibold underline"
                      onClick={() => profileListQuery.refetch()}
                    >
                      Retry
                    </button>
                  </div>
                ) : !profileRows.length ? (
                  <p className="px-3 py-8 text-center text-xs text-slate-400">
                    No users found for this location
                  </p>
                ) : (
                  <div className="relative">
                    {isPageFetching ? (
                      <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60">
                        <Loader2
                          size={18}
                          className="animate-spin text-emerald-600"
                        />
                      </div>
                    ) : null}
                    <ul className="max-h-80 divide-y divide-emerald-50 overflow-y-auto">
                      {profileRows.map((user, idx) => (
                        <li
                          key={user._id || user.id || idx}
                          className="flex items-center gap-2.5 px-3 py-2.5"
                        >
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-[11px] font-bold text-white">
                            {(safeProfilePage - 1) * PROFILE_PAGE_SIZE +
                              idx +
                              1}
                          </span>
                          <p className="min-w-0 flex-1 truncate text-sm font-semibold text-[#0f3d2e]">
                            {formatProfileFieldValue(user, displayFieldId)}
                          </p>
                          <Check
                            size={14}
                            className="shrink-0 text-emerald-600"
                            aria-label="Included in campaign"
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {audienceReady && profilePages > 1 ? (
                  <div className="flex items-center justify-between gap-2 border-t border-emerald-100 px-3 py-2">
                    <button
                      type="button"
                      disabled={
                        safeProfilePage <= 1 || profileListQuery.isFetching
                      }
                      onClick={() =>
                        setProfilePage((p) => Math.max(1, p - 1))
                      }
                      className="inline-flex items-center gap-0.5 rounded-lg border border-emerald-200 px-2 py-1 text-[11px] font-semibold text-emerald-800 hover:bg-emerald-50 disabled:opacity-40"
                    >
                      <ChevronLeft size={13} /> Prev
                    </button>
                    <span className="text-[11px] font-semibold tabular-nums text-[#5c7d6d]">
                      {(safeProfilePage - 1) * PROFILE_PAGE_SIZE + 1}–
                      {Math.min(
                        safeProfilePage * PROFILE_PAGE_SIZE,
                        profileTotal,
                      )}{" "}
                      of {profileTotal.toLocaleString("en-IN")}
                    </span>
                    <button
                      type="button"
                      disabled={
                        safeProfilePage >= profilePages ||
                        profileListQuery.isFetching
                      }
                      onClick={() =>
                        setProfilePage((p) =>
                          Math.min(profilePages, p + 1),
                        )
                      }
                      className="inline-flex items-center gap-0.5 rounded-lg border border-emerald-200 px-2 py-1 text-[11px] font-semibold text-emerald-800 hover:bg-emerald-50 disabled:opacity-40"
                    >
                      Next <ChevronRight size={13} />
                    </button>
                  </div>
                ) : null}
              </div>

              {audienceReady && profileTotal > 0 ? (
                <p className="rounded-xl border border-emerald-100 bg-emerald-50/60 px-3 py-2 text-[11px] leading-relaxed text-emerald-800">
                  <span className="font-bold">
                    {profileTotal.toLocaleString("en-IN")} recipients
                  </span>{" "}
                  for <span className="font-bold">{audienceLabel}</span> will
                  receive this campaign when you send.
                </p>
              ) : null}
            </section>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={sending || !selectedTemplate}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#12A150] px-4 py-3.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(18,161,80,0.24)] hover:bg-[#0e8a43] disabled:opacity-50"
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
