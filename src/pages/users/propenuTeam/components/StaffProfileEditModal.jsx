import { useEffect, useState } from "react";
import {
  Building2,
  Hash,
  Loader2,
  Mail,
  MapPin,
  MessageSquareText,
  Phone,
  Save,
  Shield,
  UserCheck,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  editUserProfile,
  requestOtpUserPhoneNumber,
  verifyUserPhoneNumberOTP,
} from "../../../../features/user/userService";

const FIELDS = [
  { name: "name", label: "Name", icon: UserCheck },
  { name: "email", label: "Email", icon: Mail, type: "email" },
  { name: "phone", label: "Phone", icon: Phone, span: true },
  { name: "locality", label: "Locality", icon: MapPin },
  { name: "city", label: "City", icon: Building2 },
  { name: "state", label: "State", icon: MapPin },
  { name: "pincode", label: "Pincode", icon: Hash },
];

const normalizeProfilePhone = (phone = "") => {
  const value = String(phone || "").trim();
  if (!value) return "";
  if (value.startsWith("+")) return `+${value.slice(1).replace(/\D/g, "")}`;
  const digits = value.replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  return digits ? `+${digits}` : "";
};

const payloadFromUser = (user = {}) =>
  FIELDS.reduce((acc, field) => {
    const raw = user?.[field.name];
    acc[field.name] = raw === undefined || raw === null ? "" : String(raw);
    return acc;
  }, {});

/**
 * Super Admin / Admin — edit ops staff profile (name, email, phone, location).
 * Phone changes require WhatsApp OTP, same as marketplace profile edit.
 */
export default function StaffProfileEditModal({ user, roleLabel = "Staff", onClose, onSaved }) {
  const userId = String(user?._id || user?.id || "");
  const [formData, setFormData] = useState(() => payloadFromUser(user));
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [verifiedPhone, setVerifiedPhone] = useState(() => normalizeProfilePhone(user?.phone));
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setFormData(payloadFromUser(user));
    setOtp("");
    setOtpSent(false);
    setVerifiedPhone(normalizeProfilePhone(user?.phone));
    setError("");
  }, [user?._id]);

  if (!userId) return null;

  const normalizedPhone = normalizeProfilePhone(formData.phone);
  const originalPhone = normalizeProfilePhone(user?.phone);
  const phoneChanged = normalizedPhone !== originalPhone;
  const hasPhoneInput = Boolean(normalizedPhone);
  // Empty phone is allowed — OTP only when a new non-empty phone is set.
  const phoneVerified = !hasPhoneInput || !phoneChanged || verifiedPhone === normalizedPhone;

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "phone") {
      setOtp("");
      setOtpSent(false);
      setVerifiedPhone("");
    }
  };

  const handleSendOtp = async () => {
    const phone = normalizeProfilePhone(formData.phone);
    if (!/^\+\d{10,15}$/.test(phone)) {
      setError("Enter phone with country code, e.g. +919876543224.");
      return;
    }
    setSendingOtp(true);
    setError("");
    try {
      await requestOtpUserPhoneNumber(userId, { phone });
      setFormData((prev) => ({ ...prev, phone }));
      setOtpSent(true);
      toast.success("OTP sent to staff phone");
    } catch (err) {
      const message = err?.response?.data?.message || "Failed to send phone OTP";
      setError(message);
      toast.error(message);
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    const phone = normalizeProfilePhone(formData.phone);
    const cleanOtp = String(otp || "").replace(/\D/g, "").slice(0, 4);
    if (!/^\d{4}$/.test(cleanOtp)) {
      setError("Enter the 4-digit OTP.");
      return;
    }
    setVerifyingOtp(true);
    setError("");
    try {
      await verifyUserPhoneNumberOTP(userId, { phone, phoneOtp: cleanOtp });
      setFormData((prev) => ({ ...prev, phone }));
      setVerifiedPhone(phone);
      toast.success("Phone verified");
    } catch (err) {
      const message = err?.response?.data?.message || "OTP verification failed";
      setError(message);
      toast.error(message);
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleOtpDigitChange = (index, raw, input) => {
    const digit = String(raw || "").replace(/\D/g, "").slice(-1);
    const digits = otp.padEnd(4, " ").split("");
    digits[index] = digit || " ";
    setOtp(digits.join("").trimEnd());
    if (digit && index < 3) input.parentElement.children[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, event) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      event.currentTarget.parentElement.children[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (event) => {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (!pasted) return;
    event.preventDefault();
    setOtp(pasted);
    const inputs = event.currentTarget.querySelectorAll("input");
    inputs[Math.min(pasted.length, 4) - 1]?.focus();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(
      Object.entries(formData).map(([key, value]) => [key, String(value || "").trim()]),
    );

    if (!payload.name || !payload.email) {
      setError("Name and email are required.");
      return;
    }

    // Phone is optional — validate / OTP only when a number is provided.
    const hasPhone = Boolean(payload.phone);
    if (hasPhone) {
      payload.phone = normalizeProfilePhone(payload.phone);
      if (!/^\+\d{10,15}$/.test(payload.phone)) {
        setError("Enter phone with country code, e.g. +919876543224.");
        return;
      }
      if (phoneChanged && !phoneVerified) {
        setError("Verify the new phone number before saving.");
        return;
      }
    } else {
      payload.phone = "";
    }

    if (payload.pincode && !/^\d{6}$/.test(payload.pincode)) {
      setError("Pincode must be 6 digits.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const body = { ...payload };
      if (!hasPhone) {
        // Explicitly clear optional phone when left blank.
        body.phone = "";
      } else if (phoneChanged && verifiedPhone === payload.phone) {
        // Phone was already persisted by the OTP verify step — don't re-send OTP.
        delete body.phone;
      } else if (phoneChanged) {
        body.phoneOtp = String(otp || "").replace(/\D/g, "").slice(0, 4);
      }
      await editUserProfile(userId, body);
      toast.success("Staff profile updated");
      onSaved?.(userId, payload);
      onClose?.();
    } catch (err) {
      const message = err?.response?.data?.message || "Failed to update staff profile";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/55 backdrop-blur-sm"
      onClick={(event) => event.target === event.currentTarget && !saving && onClose?.()}
    >
      <form
        onSubmit={handleSubmit}
        className="flex h-full w-full max-w-xl flex-col overflow-hidden bg-white shadow-2xl sm:rounded-l-3xl"
      >
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-600 via-emerald-400 to-emerald-200" />
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-600">
              Edit staff profile
            </p>
            <h2 className="mt-1 truncate text-xl font-black text-slate-800">
              {user?.name || "Team member"}
            </h2>
            <p className="mt-1 text-xs font-medium text-slate-400">
              {roleLabel} · update name, email, optional phone, and work location
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-slate-100 bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
          >
            <X size={15} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {FIELDS.map((field) => {
              const Icon = field.icon;
              const isPhone = field.name === "phone";
              return (
                <label key={field.name} className={field.span ? "sm:col-span-2" : ""}>
                  <span className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <Icon size={12} className="text-emerald-600" />
                    {field.label}
                    {isPhone ? (
                      <span className="font-semibold normal-case tracking-normal text-slate-400">
                        (optional)
                      </span>
                    ) : null}
                  </span>
                  <input
                    type={field.type || "text"}
                    value={formData[field.name]}
                    onChange={(event) => handleChange(field.name, event.target.value)}
                    onBlur={() => {
                      if (isPhone) {
                        setFormData((prev) => ({
                          ...prev,
                          phone: normalizeProfilePhone(prev.phone),
                        }));
                      }
                    }}
                    className="w-full rounded-xl border-2 border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    placeholder={
                      isPhone
                        ? "Optional · +919876543224"
                        : `Enter ${field.label.toLowerCase()}`
                    }
                  />
                  {isPhone ? (
                    <div className="mt-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          disabled={!hasPhoneInput || !phoneChanged || sendingOtp || verifyingOtp || saving}
                          className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                            hasPhoneInput && phoneChanged
                              ? "bg-emerald-600 text-white hover:bg-emerald-700"
                              : "bg-slate-200 text-slate-400"
                          }`}
                        >
                          {sendingOtp ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <MessageSquareText size={13} />
                          )}
                          Send WhatsApp OTP
                        </button>
                        <span
                          className={`flex-1 text-[11px] font-bold ${
                            phoneVerified ? "text-emerald-600" : "text-slate-400"
                          }`}
                        >
                          {!hasPhoneInput
                            ? "Phone is optional — leave blank if not needed"
                            : phoneVerified
                              ? "Phone verified"
                              : phoneChanged
                                ? "Verification required for new phone"
                                : "Current phone already verified"}
                        </span>
                      </div>
                      {otpSent && !phoneVerified ? (
                        <div className="mt-4 flex flex-col gap-3 border-t border-emerald-100/80 pt-4 sm:flex-row sm:items-center">
                          <div
                            className="flex items-center justify-between gap-2 sm:justify-start"
                            onPaste={handleOtpPaste}
                          >
                            {[0, 1, 2, 3].map((index) => (
                              <input
                                key={index}
                                type="text"
                                inputMode="numeric"
                                autoComplete={index === 0 ? "one-time-code" : "off"}
                                maxLength={1}
                                aria-label={`OTP digit ${index + 1}`}
                                value={otp[index] || ""}
                                onChange={(event) =>
                                  handleOtpDigitChange(index, event.target.value, event.currentTarget)
                                }
                                onKeyDown={(event) => handleOtpKeyDown(index, event)}
                                className="h-12 w-12 rounded-xl border-2 border-white bg-white text-center text-lg font-black text-slate-700 shadow-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                              />
                            ))}
                          </div>
                          <button
                            type="button"
                            onClick={handleVerifyOtp}
                            disabled={verifyingOtp || saving || !/^\d{4}$/.test(otp)}
                            className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
                          >
                            {verifyingOtp ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : (
                              <Shield size={13} />
                            )}
                            Verify OTP
                          </button>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </label>
              );
            })}
          </div>
          {error ? (
            <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-3 py-2">
              <p className="text-xs font-semibold text-red-500">{error}</p>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 bg-white px-5 py-4 sm:flex-row sm:px-7">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex-1 rounded-2xl border-2 border-slate-200 py-3 text-sm font-bold text-slate-500 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3 text-sm font-black text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={15} />
                Save profile
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
