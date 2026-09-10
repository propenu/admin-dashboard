import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  ImagePlus,
  Loader2,
  Monitor,
  Pencil,
  Plus,
  RefreshCw,
  Smartphone,
  Tablet,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { INDIAN_STATES, getCitiesByState } from "../../utils/countryStateCity";
import {
  clearSiteBannerDevice,
  createSiteBanner,
  deleteSiteBanner,
  getSiteLogo,
  listSiteBanners,
  updateSiteBannerMeta,
  upsertSiteBannerDevice,
  upsertSiteLogo,
} from "../../features/siteBranding/siteBrandingService";
import {
  BANNER_SLOTS,
  LOGO_ACCEPT,
  LOGO_ALLOWED_PIXEL_SIZES,
  LOGO_HINT,
  deviceFormFromSaved,
  emptyDeviceForm,
  isDeviceSaved,
  isLogoVideoMedia,
  locationSummary,
  validateLogoFileAsync,
  validateWebpFile,
} from "../../features/siteBranding/siteBrandingUtils";
import BannerRichTextField from "./BannerRichTextField";
import BannerDeviceFrame from "./BannerDeviceFrame";
import {
  getHtmlLines,
  validateHeadingLines,
} from "./bannerTextExtensions";

const DEVICE_ICONS = {
  desktop: Monitor,
  laptop: Monitor,
  tablet: Tablet,
  mobile: Smartphone,
};

const safeStates = Array.isArray(INDIAN_STATES) ? INDIAN_STATES : [];

function DeviceEditor({
  slot,
  form,
  setForm,
  existingImage,
  saving,
  error,
  onSave,
  onCancel,
}) {
  const cities = useMemo(
    () => (form.state ? getCitiesByState(form.state) : []),
    [form.state],
  );
  const previewSrc = form.preview || existingImage || "";
  const meta = BANNER_SLOTS.find((s) => s.key === slot) || BANNER_SLOTS[0];

  const pickImage = (file) => {
    if (!file) return;
    const msg = validateWebpFile(file);
    if (msg) {
      setForm((p) => ({ ...p, fileError: msg }));
      return;
    }
    setForm((p) => ({
      ...p,
      file,
      preview: URL.createObjectURL(file),
      fileError: "",
    }));
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-3">
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-3">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">
            {meta.label} image · {meta.size} · WebP &lt; 1 MB
          </p>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">
            <Upload size={14} /> Choose WebP / Add image
            <input
              type="file"
              accept="image/webp,.webp"
              className="hidden"
              onChange={(e) => pickImage(e.target.files?.[0] || null)}
            />
          </label>
          {form.fileError && (
            <p className="mt-2 text-xs font-medium text-red-500">{form.fileError}</p>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3">
          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-400">
            Click URL <span className="font-medium normal-case text-slate-400">(optional)</span>
          </label>
          <input
            type="url"
            value={form.clickUrl || ""}
            onChange={(e) => setForm((p) => ({ ...p, clickUrl: e.target.value }))}
            placeholder="https://example.com/listing or /path"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400"
          />
          <p className="mt-1.5 text-[10px] text-slate-400">
            When set, banner click opens this link. Empty = open image URL.
          </p>
        </div>

        <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-3">
          <input
            type="checkbox"
            checked={Boolean(form.addHeading)}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                addHeading: e.target.checked,
                headingHtml: e.target.checked ? p.headingHtml : "",
              }))
            }
            className="h-4 w-4 rounded border-slate-300 text-[#27AE60] focus:ring-[#27AE60]"
          />
          <span className="text-sm font-semibold text-slate-700">
            Add heading text on this banner
          </span>
        </label>

        {form.addHeading && (
          <BannerRichTextField
            label="Heading"
            enabled
            showEnableToggle={false}
            enforceHeadingLimits
            value={form.headingHtml}
            onChange={(html) => setForm((p) => ({ ...p, headingHtml: html }))}
            placeholder={`${meta.label} headline…`}
          />
        )}

        <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-3">
          <input
            type="checkbox"
            checked={Boolean(form.addLocation)}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                addLocation: e.target.checked,
                ...(e.target.checked
                  ? {}
                  : { state: "", city: "", locality: "", subLocality: "" }),
              }))
            }
            className="h-4 w-4 rounded border-slate-300 text-[#27AE60] focus:ring-[#27AE60]"
          />
          <span className="text-sm font-semibold text-slate-700">
            Add location (optional — empty = all)
          </span>
        </label>

        {form.addLocation && (
          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">
              Location details
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              <select
                value={form.state}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    state: e.target.value,
                    city: "",
                    locality: "",
                    subLocality: "",
                  }))
                }
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
              >
                <option value="">All states</option>
                {safeStates.map((s) => (
                  <option key={s.isoCode || s.name} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
              <select
                value={form.city}
                disabled={!form.state}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    city: e.target.value,
                    locality: "",
                    subLocality: "",
                  }))
                }
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm disabled:opacity-50"
              >
                <option value="">All cities</option>
                {(cities || []).map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
              <input
                value={form.locality}
                onChange={(e) => setForm((p) => ({ ...p, locality: e.target.value }))}
                placeholder="Locality"
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
              />
              <input
                value={form.subLocality}
                onChange={(e) => setForm((p) => ({ ...p, subLocality: e.target.value }))}
                placeholder="Sub-locality"
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
              />
            </div>
          </div>
        )}

        {error && <p className="text-xs font-medium text-red-500">{error}</p>}

        <div className="flex gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600"
            >
              Close
            </button>
          )}
          <button
            type="button"
            disabled={saving}
            onClick={onSave}
            className="inline-flex items-center gap-2 rounded-xl bg-[#27AE60] px-4 py-2.5 text-xs font-bold text-white disabled:opacity-60"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            Save {meta.label}
          </button>
        </div>
      </div>

      <div className="space-y-2 rounded-2xl border border-slate-100 bg-gradient-to-b from-slate-50 to-white p-4">
        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
          {meta.label} preview ·{" "}
          {slot === "mobile" ? "mobile nav" : "desktop / tablet nav"} on top
        </p>
        <BannerDeviceFrame
          slot={slot}
          imageSrc={previewSrc || ""}
          clickUrl={form.clickUrl}
          heading={{
            enabled: Boolean(form.addHeading),
            html: form.headingHtml,
          }}
          emptyHint={`Upload ${meta.label} image to preview`}
        />
      </div>
    </div>
  );
}

function BannerWorkspace({ banner, onChanged, onDeleted }) {
  const [activeSlot, setActiveSlot] = useState("desktop");
  const [editingSlot, setEditingSlot] = useState(null);
  const [title, setTitle] = useState(banner.title || "");
  const [priority, setPriority] = useState(banner.priority ?? 0);
  const [form, setForm] = useState(emptyDeviceForm());
  const [saving, setSaving] = useState(false);
  const [metaSaving, setMetaSaving] = useState(false);
  const [error, setError] = useState("");

  const devices = banner.devices || {};
  const saved = BANNER_SLOTS.filter((s) => isDeviceSaved(devices[s.key]));

  useEffect(() => {
    setTitle(banner.title || "");
    setPriority(banner.priority ?? 0);
  }, [banner._id, banner.title, banner.priority]);

  const openEditor = (slot) => {
    setActiveSlot(slot);
    setEditingSlot(slot);
    setError("");
    const savedDevice = devices[slot];
    setForm(
      isDeviceSaved(savedDevice)
        ? deviceFormFromSaved(savedDevice)
        : emptyDeviceForm(),
    );
  };

  useEffect(() => {
    const anySaved = BANNER_SLOTS.some((s) => isDeviceSaved(banner.devices?.[s.key]));
    if (!anySaved) {
      setActiveSlot("desktop");
      setEditingSlot("desktop");
      setForm(emptyDeviceForm());
      setError("");
    }
  }, [banner._id]);

  const saveMeta = async () => {
    setMetaSaving(true);
    try {
      const res = await updateSiteBannerMeta(banner._id, {
        title: title.trim(),
        priority: Number(priority) || 0,
      });
      onChanged?.(res?.data?.data || { ...banner, title, priority });
      toast.success("Banner title saved");
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "Meta save failed";
      setError(message);
      toast.error(message);
    } finally {
      setMetaSaving(false);
    }
  };

  const saveDevice = async () => {
    setError("");
    const existingImage = devices[activeSlot]?.image;
    if (!form.file && !existingImage) return setError("WebP image is required");
    if (form.file) {
      const msg = validateWebpFile(form.file);
      if (msg) return setError(msg);
    }
    if (form.addHeading) {
      const headingErr = validateHeadingLines(getHtmlLines(form.headingHtml));
      if (headingErr) return setError(headingErr);
    }

    const fd = new FormData();
    fd.append("state", form.addLocation ? form.state.trim() : "");
    fd.append("city", form.addLocation ? form.city.trim() : "");
    fd.append("locality", form.addLocation ? form.locality.trim() : "");
    fd.append("subLocality", form.addLocation ? form.subLocality.trim() : "");
    fd.append("headingEnabled", String(Boolean(form.addHeading)));
    fd.append("headingHtml", form.addHeading ? form.headingHtml || "" : "");
    fd.append("clickUrl", String(form.clickUrl || "").trim());
    fd.append("subheadingEnabled", "false");
    fd.append("subheadingHtml", "");
    if (form.file) fd.append("image", form.file);

    setSaving(true);
    try {
      const res = await upsertSiteBannerDevice(banner._id, activeSlot, fd);
      const next = res?.data?.data;
      onChanged?.(next);
      setEditingSlot(null);
      setForm(emptyDeviceForm());
      toast.success(`${activeSlot} creative saved`);
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "Save failed";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const runClearDevice = async (slot) => {
    try {
      const res = await clearSiteBannerDevice(banner._id, slot);
      onChanged?.(res?.data?.data);
      if (editingSlot === slot) {
        setEditingSlot(null);
        setForm(emptyDeviceForm());
      }
      toast.success(`${slot} device cleared`);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Clear failed");
    }
  };

  const clearDevice = (slot) => {
    toast.warning(`Clear ${slot} device data?`, {
      description: "This removes the creative for that device.",
      duration: 8000,
      action: {
        label: "Clear",
        onClick: () => {
          void runClearDevice(slot);
        },
      },
      cancel: { label: "Cancel" },
    });
  };

  return (
    <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="grid flex-1 gap-2 sm:grid-cols-[1fr_100px_auto]">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold"
            placeholder="Banner title"
          />
          <input
            type="number"
            min={0}
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            placeholder="Priority"
          />
          <button
            type="button"
            disabled={metaSaving}
            onClick={saveMeta}
            className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            {metaSaving ? "Saving…" : "Save title"}
          </button>
        </div>
        <button
          type="button"
          onClick={() => onDeleted?.(banner._id)}
          className="inline-flex items-center gap-1 rounded-xl border border-red-100 px-3 py-2 text-xs font-bold text-red-500"
        >
          <Trash2 size={13} /> Delete banner
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {BANNER_SLOTS.map((slot) => {
          const Icon = DEVICE_ICONS[slot.key];
          const done = isDeviceSaved(devices[slot.key]);
          const active = activeSlot === slot.key;
          return (
            <button
              key={slot.key}
              type="button"
              onClick={() => openEditor(slot.key)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                active
                  ? "bg-[#27AE60] text-white"
                  : done
                    ? "bg-emerald-50 text-[#219653] ring-1 ring-emerald-200"
                    : "bg-slate-100 text-slate-600"
              }`}
            >
              <Icon size={13} />
              {slot.label}
              {done && <CheckCircle2 size={12} />}
            </button>
          );
        })}
      </div>

      {editingSlot && (
        <DeviceEditor
          slot={editingSlot}
          form={form}
          setForm={setForm}
          existingImage={devices[editingSlot]?.image}
          saving={saving}
          error={error}
          onSave={saveDevice}
          onCancel={() => {
            setEditingSlot(null);
            setError("");
          }}
        />
      )}

      {saved.length > 0 && (
        <div className="space-y-3 border-t border-slate-100 pt-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
            Saved devices ({saved.length}/4)
          </p>
          <ul className="space-y-3">
            {saved.map((slot) => {
              const device = devices[slot.key];
              const Icon = DEVICE_ICONS[slot.key];
              return (
                <li
                  key={slot.key}
                  className="grid gap-3 rounded-2xl border border-slate-100 bg-slate-50/50 p-3 lg:grid-cols-[minmax(220px,320px)_1fr_auto] lg:items-start"
                >
                  <BannerDeviceFrame
                    slot={slot.key}
                    imageSrc={device.image}
                    clickUrl={device.clickUrl}
                    heading={device.heading}
                    className="w-full"
                  />
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                      <Icon size={14} className="text-[#27AE60]" />
                      {slot.label}
                      <span className="text-[10px] font-semibold text-slate-400">
                        · {slot.key === "mobile" ? "mobile nav" : "desktop nav"}
                      </span>
                    </p>
                    <p className="mt-1 truncate text-xs text-slate-500">{device.image}</p>
                    {device.clickUrl ? (
                      <p className="mt-1 truncate text-xs text-[#27AE60]">
                        Click → {device.clickUrl}
                      </p>
                    ) : null}
                    <p className="mt-1 text-[11px] text-slate-400">
                      {locationSummary(device.location)}
                      {device.heading?.enabled ? " · heading on" : " · heading off"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => openEditor(slot.key)}
                      className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600"
                    >
                      <Pencil size={12} /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => clearDevice(slot.key)}
                      className="rounded-xl border border-red-100 px-3 py-2 text-xs font-bold text-red-500"
                    >
                      Clear
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {!editingSlot && saved.length === 0 && (
        <p className="py-8 text-center text-sm text-slate-400">
          Select Desktop to add the first device creative
        </p>
      )}
    </div>
  );
}

export default function SiteBrandingPage() {
  const [mainTab, setMainTab] = useState("logo"); // logo | banner
  const [logo, setLogo] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [logoError, setLogoError] = useState("");
  const [logoSaving, setLogoSaving] = useState(false);

  const [banners, setBanners] = useState([]);
  const [openBannerId, setOpenBannerId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const openBanner = useMemo(
    () => banners.find((b) => String(b._id) === String(openBannerId)) || null,
    [banners, openBannerId],
  );

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [logoRes, bannerRes] = await Promise.all([
        getSiteLogo(),
        listSiteBanners(),
      ]);
      setLogo(logoRes?.data?.data || null);
      setBanners(Array.isArray(bannerRes?.data?.data) ? bannerRes.data.data : []);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onLogoPick = async (file) => {
    if (!file) return;
    const msg = await validateLogoFileAsync(file);
    setLogoError(msg);
    if (msg) {
      toast.warning(msg);
      return;
    }
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const saveLogo = async () => {
    if (!logoFile) {
      const message = "Choose a logo file first";
      setLogoError(message);
      toast.warning(message);
      return;
    }
    const msg = await validateLogoFileAsync(logoFile);
    if (msg) {
      setLogoError(msg);
      toast.warning(msg);
      return;
    }
    setLogoSaving(true);
    setLogoError("");
    try {
      const res = await upsertSiteLogo(logoFile, { preferCreate: !logo?.logoUrl });
      setLogo(res?.data?.data || null);
      setLogoFile(null);
      setLogoPreview("");
      toast.success("Logo saved");
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "Logo save failed";
      setLogoError(message);
      toast.error(message);
    } finally {
      setLogoSaving(false);
    }
  };

  const createBanner = async () => {
    const title = newTitle.trim() || `Banner ${new Date().toLocaleString()}`;
    setCreating(true);
    try {
      const res = await createSiteBanner({ title, priority: 0 });
      const created = res?.data?.data;
      if (created) {
        setBanners((prev) => [created, ...prev]);
        setOpenBannerId(created._id);
      }
      setNewTitle("");
      setMainTab("banner");
      toast.success("Banner created");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Create failed");
    } finally {
      setCreating(false);
    }
  };

  const onBannerChanged = (next) => {
    if (!next?._id) return load();
    setBanners((prev) => prev.map((b) => (b._id === next._id ? next : b)));
  };

  const runBannerDelete = async (id) => {
    try {
      await deleteSiteBanner(id);
      setBanners((prev) => prev.filter((b) => b._id !== id));
      if (String(openBannerId) === String(id)) setOpenBannerId(null);
      toast.success("Banner deleted");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed");
    }
  };

  const onBannerDeleted = (id) => {
    toast.warning("Delete this banner and all device creatives?", {
      description: "This cannot be undone.",
      duration: 10000,
      action: {
        label: "Delete",
        onClick: () => {
          void runBannerDelete(id);
        },
      },
      cancel: { label: "Cancel" },
    });
  };

  return (
    <div className="min-h-screen bg-[#f6f8f7] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#27AE60]">
              Site branding
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Banner & Logo</h1>
          </div>
          <button
            type="button"
            onClick={load}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-600"
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </header>

        <div className="inline-flex rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
          {[
            { key: "logo", label: "Logo" },
            { key: "banner", label: "Banner" },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setMainTab(tab.key)}
              className={`rounded-xl px-5 py-2 text-sm font-bold transition ${
                mainTab === tab.key
                  ? "bg-[#27AE60] text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-20 text-sm text-slate-400">
            <Loader2 className="animate-spin" size={16} /> Loading…
          </div>
        ) : error ? (
          <p className="rounded-2xl border border-red-100 bg-red-50 px-4 py-6 text-center text-sm text-red-600">
            {error}
          </p>
        ) : mainTab === "logo" ? (
          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-2 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Company logo</h2>
                <p className="text-xs text-slate-500">{LOGO_HINT}</p>
              </div>
              <button
                type="button"
                disabled={logoSaving || !logoFile}
                onClick={saveLogo}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white disabled:opacity-50"
              >
                {logoSaving ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                Save logo
              </button>
            </div>
            <div className="grid gap-5 p-5 lg:grid-cols-2">
              <div className="space-y-3">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                  Upload (left)
                </p>
                <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 hover:border-emerald-300">
                  <ImagePlus size={22} className="text-slate-400" />
                  <span className="text-xs font-bold text-slate-600">
                    Choose logo file
                  </span>
                  <span className="text-[10px] font-medium text-slate-400">
                    PNG · SVG · GIF · WebP · MP4 · WebM
                  </span>
                  <div className="mt-1 flex flex-wrap justify-center gap-1.5">
                    {LOGO_ALLOWED_PIXEL_SIZES.map((size) => (
                      <span
                        key={size.label}
                        className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700"
                      >
                        GIF {size.label}
                      </span>
                    ))}
                  </div>
                  <input
                    type="file"
                    accept={LOGO_ACCEPT}
                    className="hidden"
                    onChange={(e) => onLogoPick(e.target.files?.[0] || null)}
                  />
                </label>
                {logoError && <p className="text-xs font-medium text-red-500">{logoError}</p>}
              </div>
              <div className="space-y-3">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                  Preview (right)
                </p>
                <div className="flex min-h-[180px] items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-6">
                  {logoPreview || logo?.logoUrl ? (
                    isLogoVideoMedia(logoFile || logoPreview || logo?.logoUrl) ? (
                      <video
                        src={logoPreview || logo.logoUrl}
                        className="max-h-24 max-w-full object-contain"
                        autoPlay
                        muted
                        loop
                        playsInline
                      />
                    ) : (
                      <img
                        src={logoPreview || logo.logoUrl}
                        alt="Company logo"
                        className="max-h-24 max-w-full object-contain"
                      />
                    )
                  ) : (
                    <span className="text-xs text-slate-400">No logo yet</span>
                  )}
                </div>
              </div>
            </div>
          </section>
        ) : (
          <div className="space-y-4">
            <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="New banner title (optional)"
                  className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                />
                <button
                  type="button"
                  disabled={creating}
                  onClick={createBanner}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#27AE60] px-4 py-2.5 text-xs font-bold text-white disabled:opacity-60"
                >
                  {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                  New banner
                </button>
              </div>
            </section>

            {openBanner ? (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setOpenBannerId(null)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  <ArrowLeft size={14} /> Back to banner list
                </button>
                <BannerWorkspace
                  key={openBanner._id}
                  banner={openBanner}
                  onChanged={onBannerChanged}
                  onDeleted={onBannerDeleted}
                />
              </div>
            ) : banners.length === 0 ? (
              <p className="rounded-3xl border border-slate-200 bg-white py-16 text-center text-sm text-slate-400">
                No banners yet — create one, then save Desktop / Laptop / Tablet / Mobile separately
              </p>
            ) : (
              <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-5 py-4">
                  <h2 className="text-sm font-bold text-slate-900">Saved banners</h2>
                  <p className="text-xs text-slate-500">
                    {banners.length} banner{banners.length === 1 ? "" : "s"} · click one to open
                  </p>
                </div>
                <ul className="divide-y divide-slate-100">
                  {banners.map((banner) => {
                    const devices = banner.devices || {};
                    const savedCount = BANNER_SLOTS.filter((s) =>
                      isDeviceSaved(devices[s.key]),
                    ).length;
                    const thumb =
                      devices.desktop?.image ||
                      devices.laptop?.image ||
                      devices.tablet?.image ||
                      devices.mobile?.image ||
                      "";
                    const updated = banner.updatedAt
                      ? new Date(banner.updatedAt).toLocaleString()
                      : "";
                    return (
                      <li key={banner._id}>
                        <button
                          type="button"
                          onClick={() => setOpenBannerId(banner._id)}
                          className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-emerald-50/50 sm:gap-4 sm:px-5"
                        >
                          <div className="flex h-14 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                            {thumb ? (
                              <img
                                src={thumb}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <ImagePlus size={16} className="text-slate-300" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-slate-900">
                              {banner.title || "Untitled banner"}
                            </p>
                            <p className="mt-0.5 text-[11px] font-medium text-slate-500">
                              Priority {banner.priority ?? 0}
                              {" · "}
                              {savedCount}/4 devices
                              {updated ? ` · ${updated}` : ""}
                            </p>
                            <div className="mt-1.5 flex flex-wrap gap-1">
                              {BANNER_SLOTS.map((slot) => {
                                const done = isDeviceSaved(devices[slot.key]);
                                return (
                                  <span
                                    key={slot.key}
                                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                      done
                                        ? "bg-emerald-50 text-emerald-700"
                                        : "bg-slate-100 text-slate-400"
                                    }`}
                                  >
                                    {slot.label}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                          <ChevronRight
                            size={18}
                            className="shrink-0 text-slate-300"
                          />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
