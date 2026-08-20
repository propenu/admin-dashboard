import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  Globe,
  Image as ImageIcon,
  Loader2,
  MessageSquareText,
  Save,
  Shield,
  UserCheck,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  editBuilderProfile,
  getBuilderProfileById,
  requestOtpBuilderPhoneNumber,
  verifyBuilderPhoneNumberOTP,
} from "../../../../features/user/userService";

const SECTIONS = [
  { id: "basic", label: "Basic", icon: UserCheck },
  { id: "company", label: "Company", icon: Building2 },
  { id: "legal", label: "RERA / Legal", icon: Shield },
  { id: "media", label: "Images", icon: ImageIcon },
];

const normalizeProfilePhone = (phone = "") => {
  const value = String(phone || "").trim();
  if (!value) return "";
  if (value.startsWith("+")) return `+${value.slice(1).replace(/\D/g, "")}`;
  const digits = value.replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  return digits ? `+${digits}` : "";
};

const emptyForm = {
  companyName: "",
  name: "",
  email: "",
  phone: "",
  address: "",
  locality: "",
  city: "",
  state: "",
  pincode: "",
  bio: "",
  website: "",
  gstin: "",
  cin: "",
  officeLocations: "",
  reraId: "",
  reraVerified: false,
  avatarUrl: "",
  logoUrl: "",
  coverUrl: "",
  avatarFile: null,
  logoFile: null,
  coverFile: null,
};

const Field = ({ label, children, required }) => (
  <label className="block">
    <span className="mb-1.5 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-gray-400">
      {label}
      {required ? <span className="text-red-500">*</span> : null}
    </span>
    {children}
  </label>
);

const inputCls =
  "w-full rounded-xl border-2 border-gray-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-700 outline-none transition focus:border-[#27AE60] focus:ring-2 focus:ring-[#27AE60]/10";

const MediaPicker = ({ label, previewUrl, file, onPick }) => (
  <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-3">
    <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
      {label}
    </p>
    <div className="flex items-center gap-3">
      <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-white">
        {previewUrl || file ? (
          <img
            src={file ? URL.createObjectURL(file) : previewUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <ImageIcon size={18} className="text-gray-300" />
        )}
      </div>
      <label className="cursor-pointer rounded-xl border border-[#27AE60]/25 bg-white px-3 py-2 text-xs font-bold text-[#27AE60] hover:bg-[#f0fdf4]">
        Choose file
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onPick(e.target.files?.[0] || null)}
        />
      </label>
    </div>
  </div>
);

export default function BuilderProfileEditModal({
  user,
  cfg,
  onClose,
  onSave,
}) {
  const userId = user?.userId || user?._id;
  const [activeSection, setActiveSection] = useState("basic");
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [verifiedPhone, setVerifiedPhone] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  useEffect(() => {
    let mounted = true;
    const hydrate = async () => {
      setLoading(true);
      try {
        let profile = null;
        try {
          const res = await getBuilderProfileById(userId);
          profile = res?.data?.profile || res?.profile || null;
        } catch {
          profile = null;
        }

        const bp = profile?.builderProfile || user?.builderProfile || {};
        const next = {
          companyName: profile?.companyName || user?.companyName || "",
          name: profile?.name || user?.name || "",
          email: profile?.email || user?.email || "",
          phone: normalizeProfilePhone(profile?.phone || user?.phone || ""),
          address: profile?.address || user?.address || "",
          locality: profile?.locality || user?.locality || "",
          city: profile?.city || user?.city || "",
          state: profile?.state || user?.state || "",
          pincode: profile?.pincode || user?.pincode || "",
          bio: bp.bio || "",
          website: bp.website || "",
          gstin: bp.gstin || "",
          cin: bp.cin || "",
          officeLocations: Array.isArray(bp.officeLocations)
            ? bp.officeLocations.join(", ")
            : "",
          reraId: bp.rera?.reraId || "",
          reraVerified: bp.rera?.isVerified === true,
          avatarUrl: bp.avatar?.url || "",
          logoUrl: bp.logo?.url || "",
          coverUrl: bp.coverImage?.url || "",
          avatarFile: null,
          logoFile: null,
          coverFile: null,
        };
        if (!mounted) return;
        setForm(next);
        setVerifiedPhone(next.phone);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    hydrate();
    return () => {
      mounted = false;
    };
  }, [user, userId]);

  const normalizedPhone = useMemo(
    () => normalizeProfilePhone(form.phone),
    [form.phone],
  );
  const originalPhone = useMemo(
    () => normalizeProfilePhone(user?.phone),
    [user?.phone],
  );
  const phoneChanged = normalizedPhone !== originalPhone;
  const phoneVerified = !phoneChanged || verifiedPhone === normalizedPhone;

  const setField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
    if (name === "phone") {
      setOtp("");
      setOtpSent(false);
    }
  };

  const handleSendOtp = async () => {
    if (!/^\+\d{10,15}$/.test(normalizedPhone)) {
      setError("Enter phone with country code, e.g. +919876543224");
      return;
    }
    setSendingOtp(true);
    setError("");
    try {
      await requestOtpBuilderPhoneNumber(userId, { phone: normalizedPhone });
      setField("phone", normalizedPhone);
      setOtpSent(true);
      setVerifiedPhone("");
      toast.success("OTP sent to builder phone");
    } catch (err) {
      const message =
        err?.response?.data?.message || "Failed to send phone OTP";
      setError(message);
      toast.error(message);
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    const cleanOtp = String(otp || "").replace(/\D/g, "").slice(0, 4);
    if (!/^\d{4}$/.test(cleanOtp)) {
      setError("Enter the 4 digit OTP.");
      return;
    }
    setVerifyingOtp(true);
    setError("");
    try {
      await verifyBuilderPhoneNumberOTP(userId, {
        phone: normalizedPhone,
        phoneOtp: cleanOtp,
      });
      setVerifiedPhone(normalizedPhone);
      toast.success("Builder phone verified");
    } catch (err) {
      const message =
        err?.response?.data?.message || "Invalid OTP. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.companyName.trim() || !form.name.trim() || !form.email.trim()) {
      setError("Company name, contact name and email are required.");
      setActiveSection("basic");
      return;
    }
    if (!normalizedPhone || !/^\+\d{10,15}$/.test(normalizedPhone)) {
      setError("Enter a valid phone with country code.");
      setActiveSection("basic");
      return;
    }
    if (!phoneVerified) {
      setError("Verify the new phone number before saving.");
      setActiveSection("basic");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const data = new FormData();
      data.append("companyName", form.companyName.trim());
      data.append("name", form.name.trim());
      data.append("email", form.email.trim());
      data.append("address", form.address.trim());
      data.append("locality", form.locality.trim());
      data.append("city", form.city.trim());
      data.append("state", form.state.trim());
      data.append("pincode", form.pincode.trim());
      data.append("bio", form.bio.trim());
      data.append("website", form.website.trim());
      data.append("gstin", form.gstin.trim());
      data.append("cin", form.cin.trim());
      data.append("rera[reraId]", form.reraId.trim());
      data.append("rera[isVerified]", String(Boolean(form.reraVerified)));
      form.officeLocations
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean)
        .forEach((loc) => data.append("officeLocations[]", loc));

      if (form.avatarFile) data.append("avatar", form.avatarFile);
      if (form.logoFile) data.append("logo", form.logoFile);
      if (form.coverFile) data.append("coverImage", form.coverFile);

      const result = await editBuilderProfile(userId, data);
      const saved = result?.data?.profile || result?.profile || null;
      onSave?.(userId, {
        companyName: form.companyName.trim(),
        name: form.name.trim(),
        email: form.email.trim(),
        phone: normalizedPhone,
        address: form.address.trim(),
        locality: form.locality.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
        builderProfile:
          saved?.builderProfile || {
            bio: form.bio.trim(),
            website: form.website.trim(),
            gstin: form.gstin.trim(),
            cin: form.cin.trim(),
            officeLocations: form.officeLocations
              .split(",")
              .map((x) => x.trim())
              .filter(Boolean),
            rera: {
              reraId: form.reraId.trim(),
              isVerified: Boolean(form.reraVerified),
            },
          },
      });
      toast.success("Builder profile updated");
      onClose?.();
    } catch (err) {
      const message =
        err?.response?.data?.message || "Failed to update builder profile";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      style={{
        backgroundColor: "rgba(15,23,42,0.55)",
        backdropFilter: "blur(8px)",
      }}
      onClick={(e) => e.target === e.currentTarget && !saving && onClose?.()}
    >
      <form
        onSubmit={handleSubmit}
        className="flex h-full w-full max-w-2xl flex-col overflow-hidden bg-white shadow-2xl sm:rounded-l-3xl"
        style={{ animation: "drawerIn 0.28s ease both" }}
      >
        <div
          className="h-1.5 w-full"
          style={{
            background: `linear-gradient(to right, ${cfg.gradientFrom}, ${cfg.gradientTo})`,
          }}
        />

        <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-5 py-4">
          <div>
            <p
              className="text-[10px] font-black uppercase tracking-[2px]"
              style={{ color: cfg.accent }}
            >
              Super Admin · Full Builder Profile
            </p>
            <h2 className="mt-1 text-xl font-black text-gray-800">
              {form.companyName || form.name || "Builder"}
            </h2>
            <p className="mt-1 text-xs text-gray-400">
              Edit company details, RERA/GST, bio, website and profile images.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-100 bg-gray-50 text-gray-400 hover:bg-gray-100 disabled:opacity-50"
          >
            <X size={15} />
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto border-b border-gray-100 px-4 py-3">
          {SECTIONS.map((section) => {
            const Icon = section.icon;
            const active = activeSection === section.id;
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id)}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-black uppercase tracking-wide transition ${
                  active
                    ? "bg-[#27AE60] text-white"
                    : "bg-gray-50 text-gray-500 hover:bg-gray-100"
                }`}
              >
                <Icon size={12} />
                {section.label}
              </button>
            );
          })}
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {loading ? (
            <div className="flex h-40 items-center justify-center text-[#27AE60]">
              <Loader2 className="animate-spin" size={22} />
            </div>
          ) : (
            <div className="space-y-4">
              {activeSection === "basic" && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="Company Name" required>
                    <input
                      className={inputCls}
                      value={form.companyName}
                      onChange={(e) => setField("companyName", e.target.value)}
                    />
                  </Field>
                  <Field label="Contact Name" required>
                    <input
                      className={inputCls}
                      value={form.name}
                      onChange={(e) => setField("name", e.target.value)}
                    />
                  </Field>
                  <Field label="Email" required>
                    <input
                      type="email"
                      className={inputCls}
                      value={form.email}
                      onChange={(e) => setField("email", e.target.value)}
                    />
                  </Field>
                  <Field label="Phone" required>
                    <input
                      className={inputCls}
                      value={form.phone}
                      placeholder="+919876543224"
                      onChange={(e) => setField("phone", e.target.value)}
                      onBlur={() =>
                        setField("phone", normalizeProfilePhone(form.phone))
                      }
                    />
                  </Field>
                  <div className="sm:col-span-2 rounded-2xl border border-[#27AE60]/20 bg-[#f0fdf4] p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <button
                        type="button"
                        disabled={!phoneChanged || sendingOtp || verifyingOtp || saving}
                        onClick={handleSendOtp}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#27AE60] px-4 py-2.5 text-xs font-black text-white disabled:opacity-50"
                      >
                        {sendingOtp ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <MessageSquareText size={13} />
                        )}
                        Send WhatsApp OTP
                      </button>
                      <span
                        className={`text-[11px] font-bold ${
                          phoneVerified ? "text-green-600" : "text-gray-500"
                        }`}
                      >
                        {phoneVerified
                          ? "Phone verified"
                          : phoneChanged
                            ? "Verification required for new phone"
                            : "Current phone already verified"}
                      </span>
                    </div>
                    {otpSent && !phoneVerified ? (
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <input
                          className={`${inputCls} max-w-[140px]`}
                          value={otp}
                          maxLength={4}
                          placeholder="OTP"
                          onChange={(e) =>
                            setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))
                          }
                        />
                        <button
                          type="button"
                          disabled={verifyingOtp || !/^\d{4}$/.test(otp)}
                          onClick={handleVerifyOtp}
                          className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-black text-white disabled:opacity-50"
                        >
                          {verifyingOtp ? "Verifying…" : "Verify OTP"}
                        </button>
                      </div>
                    ) : null}
                  </div>
                  <Field label="Locality">
                    <input
                      className={inputCls}
                      value={form.locality}
                      onChange={(e) => setField("locality", e.target.value)}
                    />
                  </Field>
                  <Field label="City">
                    <input
                      className={inputCls}
                      value={form.city}
                      onChange={(e) => setField("city", e.target.value)}
                    />
                  </Field>
                  <Field label="State">
                    <input
                      className={inputCls}
                      value={form.state}
                      onChange={(e) => setField("state", e.target.value)}
                    />
                  </Field>
                  <Field label="Pincode">
                    <input
                      className={inputCls}
                      value={form.pincode}
                      onChange={(e) => setField("pincode", e.target.value)}
                    />
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="Address">
                      <textarea
                        rows={3}
                        className={inputCls}
                        value={form.address}
                        onChange={(e) => setField("address", e.target.value)}
                      />
                    </Field>
                  </div>
                </div>
              )}

              {activeSection === "company" && (
                <div className="grid grid-cols-1 gap-3">
                  <Field label="About / Bio">
                    <textarea
                      rows={5}
                      className={inputCls}
                      value={form.bio}
                      onChange={(e) => setField("bio", e.target.value)}
                      placeholder="Company description for public profile"
                    />
                  </Field>
                  <Field label="Website">
                    <div className="relative">
                      <Globe
                        size={14}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        className={`${inputCls} pl-9`}
                        value={form.website}
                        onChange={(e) => setField("website", e.target.value)}
                        placeholder="https://example.com"
                      />
                    </div>
                  </Field>
                  <Field label="Office Locations (comma separated)">
                    <input
                      className={inputCls}
                      value={form.officeLocations}
                      onChange={(e) =>
                        setField("officeLocations", e.target.value)
                      }
                      placeholder="Hyderabad HQ, Bangalore Branch"
                    />
                  </Field>
                </div>
              )}

              {activeSection === "legal" && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="RERA ID">
                    <input
                      className={inputCls}
                      value={form.reraId}
                      onChange={(e) => setField("reraId", e.target.value)}
                      placeholder="RERA registration number"
                    />
                  </Field>
                  <label className="mt-6 flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm font-semibold text-gray-700">
                    <input
                      type="checkbox"
                      checked={form.reraVerified}
                      onChange={(e) =>
                        setField("reraVerified", e.target.checked)
                      }
                    />
                    RERA verified
                  </label>
                  <Field label="GSTIN">
                    <input
                      className={inputCls}
                      value={form.gstin}
                      onChange={(e) => setField("gstin", e.target.value)}
                      placeholder="22AAAAA0000A1Z5"
                    />
                  </Field>
                  <Field label="CIN / MCA">
                    <input
                      className={inputCls}
                      value={form.cin}
                      onChange={(e) => setField("cin", e.target.value)}
                      placeholder="Company Identification Number"
                    />
                  </Field>
                </div>
              )}

              {activeSection === "media" && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <MediaPicker
                    label="Profile Avatar"
                    previewUrl={form.avatarUrl}
                    file={form.avatarFile}
                    onPick={(file) => setField("avatarFile", file)}
                  />
                  <MediaPicker
                    label="Company Logo"
                    previewUrl={form.logoUrl}
                    file={form.logoFile}
                    onPick={(file) => setField("logoFile", file)}
                  />
                  <div className="sm:col-span-2">
                    <MediaPicker
                      label="Cover Image"
                      previewUrl={form.coverUrl}
                      file={form.coverFile}
                      onPick={(file) => setField("coverFile", file)}
                    />
                  </div>
                </div>
              )}

              {error ? (
                <p className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">
                  {error}
                </p>
              ) : null}
            </div>
          )}
        </div>

        <div className="flex gap-3 border-t border-gray-100 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex-1 rounded-2xl border-2 border-gray-200 py-3 text-sm font-bold text-gray-500 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || loading}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#27AE60] py-3 text-sm font-black text-white hover:bg-[#219653] disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Save size={15} />
                Save Full Profile
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
