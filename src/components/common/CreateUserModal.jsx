// src/components/common/CreateUserModal.jsx
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";

import {
  createRequestOtp,
  createVerifyOtpService,
  createUserLocationDetails,
} from "../../features/user/userService";

/* ─── Constants ─────────────────────────────────────────────── */
const PRIMARY       = "#27AE60";
const PRIMARY_DARK  = "#1d8646";
const PRIMARY_LIGHT = "#e8f7ee";
const PRIMARY_MID   = "#d1f0df";

/* ─── Zod Schema ─────────────────────────────────────────────── */
const schema = z.object({
  name:     z.string().min(3, "Full name is required"),
  email:    z.string().email("Invalid email address"),
  phone:    z.string().refine((val) => isValidPhoneNumber(val), {
    message: "Invalid phone number",
  }),
  role:     z.string(),
  pincode:  z.string().length(6, "Pincode must be 6 digits"),
  city:     z.string().min(2, "City is required"),
  locality: z.string().min(2, "Locality is required"),
  state:    z.string().min(2, "State is required"),
});

/* ─── Roles ──────────────────────────────────────────────────── */
const ROLES = [
  { value: "customer_care",  label: "Customer Care" },
  { value: "admin",          label: "Admin" },
  { value: "sales_manager",  label: "Sales Manager" },
  { value: "sales_agent",    label: "Sales Agent" },
  { value: "agent",          label: "Agent" },
  { value: "user",           label: "User" },
  { value: "accounts",       label: "Accounts" },
];

const STEP_LABELS = ["Info", "Verify", "Location"];

/* ─── Styles ─────────────────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');

  .cum-overlay-anim { animation: cumOverlayIn 0.22s ease; }
  @keyframes cumOverlayIn { from{opacity:0} to{opacity:1} }

  .cum-card-anim { animation: cumCardIn 0.28s cubic-bezier(0.34,1.56,0.64,1); }
  @keyframes cumCardIn {
    from { opacity:0; transform:scale(0.93) translateY(12px); }
    to   { opacity:1; transform:scale(1)    translateY(0);    }
  }

  .cum-success-anim { animation: cumFadeUp 0.3s ease; }
  @keyframes cumFadeUp {
    from { opacity:0; transform:translateY(10px); }
    to   { opacity:1; transform:translateY(0);    }
  }

  .cum-pop-anim { animation: cumPop 0.4s cubic-bezier(0.34,1.56,0.64,1) 0.05s both; }
  @keyframes cumPop {
    from { transform:scale(0); opacity:0; }
    to   { transform:scale(1); opacity:1; }
  }

  .cum-fill-anim { animation: cumFill 2.6s linear forwards; width:0%; }
  @keyframes cumFill { from{width:0%} to{width:100%} }

  .cum-spin-anim { animation: cumSpin 0.7s linear infinite; }
  @keyframes cumSpin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }

  .cum-step-anim { animation: cumStepIn 0.22s ease; }
  @keyframes cumStepIn {
    from { opacity:0; transform:translateX(14px); }
    to   { opacity:1; transform:translateX(0);    }
  }

  .cum-top-line::before {
    content: '';
    position: absolute;
    top: 0; left: 10%; width: 80%; height: 2px;
    background: linear-gradient(90deg, transparent, #27AE60, transparent);
    border-radius: 999px;
  }

  .cum-scroll::-webkit-scrollbar { width: 4px; }
  .cum-scroll::-webkit-scrollbar-track { background: transparent; }
  .cum-scroll::-webkit-scrollbar-thumb { background: rgba(39,174,96,0.2); border-radius: 4px; }

  .cum-input {
    width: 100%; box-sizing: border-box;
    padding: 11px 14px;
    background: #f9fafb;
    border: 1.5px solid #e5e7eb;
    border-radius: 11px;
    font-size: 14px;
    font-family: Poppins, sans-serif;
    color: #111827;
    outline: none;
    transition: all 0.18s;
    display: block;
  }
  .cum-input:focus {
    border-color: #27AE60;
    background: #e8f7ee;
    box-shadow: 0 0 0 3px rgba(39,174,96,0.10);
  }
  .cum-input.cum-error { border-color: #fca5a5; background: #fff5f5; }
  .cum-input::placeholder { color: #9ca3af; }

  .cum-select {
    width: 100%; box-sizing: border-box;
    padding: 11px 36px 11px 14px;
    background: #f9fafb;
    border: 1.5px solid #e5e7eb;
    border-radius: 11px;
    font-size: 14px;
    font-family: Poppins, sans-serif;
    color: #111827;
    outline: none;
    appearance: none;
    cursor: pointer;
    transition: all 0.18s;
  }
  .cum-select:focus {
    border-color: #27AE60;
    background: #e8f7ee;
    box-shadow: 0 0 0 3px rgba(39,174,96,0.10);
  }

  .cum-phone-wrap {
    display: flex; align-items: center; gap: 8px;
    padding: 11px 14px;
    background: #f9fafb;
    border: 1.5px solid #e5e7eb;
    border-radius: 11px;
    transition: all 0.18s;
    box-sizing: border-box;
  }
  .cum-phone-wrap:focus-within {
    border-color: #27AE60;
    background: #e8f7ee;
    box-shadow: 0 0 0 3px rgba(39,174,96,0.10);
  }
  .cum-phone-wrap.cum-error { border-color: #fca5a5; background: #fff5f5; }
  .cum-phone-wrap .PhoneInputInput {
    background: transparent; border: none; outline: none;
    font-size: 14px; font-family: Poppins, sans-serif;
    color: #111827; width: 100%;
  }
  .cum-phone-wrap .PhoneInputInput::placeholder { color: #9ca3af; }
  .cum-phone-wrap .PhoneInputCountrySelect { background: transparent; border: none; outline: none; cursor: pointer; }
  .cum-phone-wrap .PhoneInputCountrySelectArrow { display: none; }

  .cum-otp-input {
    width: 52px; height: 60px;
    text-align: center; font-size: 22px; font-weight: 700;
    font-family: Poppins, sans-serif;
    background: #f9fafb;
    border: 1.5px solid #e5e7eb;
    border-radius: 12px;
    outline: none; transition: all 0.18s;
    color: #111827; box-sizing: border-box;
  }
  .cum-otp-input:focus {
    border-color: #27AE60;
    background: #e8f7ee;
    box-shadow: 0 0 0 3px rgba(39,174,96,0.10);
    transform: translateY(-2px);
  }
  .cum-otp-input:not(:placeholder-shown) {
    border-color: #27AE60;
    background: #e8f7ee;
    color: #1d8646;
  }

  .cum-btn-primary {
    width: 100%; padding: 13px 0;
    border-radius: 12px; border: none; color: #fff;
    font-family: DM Sans, sans-serif;
    font-size: 14px; font-weight: 600; letter-spacing: 0.04em;
    cursor: pointer;
    background: linear-gradient(135deg, #27AE60, #1d8646);
    box-shadow: 0 4px 20px rgba(39,174,96,0.28);
    transition: all 0.18s;
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .cum-btn-primary:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 28px rgba(39,174,96,0.38);
  }
  .cum-btn-primary:active:not(:disabled) { transform: scale(0.99); }
  .cum-btn-primary:disabled { opacity: 0.35; cursor: not-allowed; }

  .cum-btn-dark {
    width: 100%; padding: 13px 0;
    border-radius: 12px; border: none; color: #fff;
    font-family: DM Sans, sans-serif;
    font-size: 14px; font-weight: 600; letter-spacing: 0.04em;
    cursor: pointer;
    background: linear-gradient(135deg, #111827, #1f2937);
    box-shadow: 0 4px 20px rgba(0,0,0,0.18);
    transition: all 0.18s;
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .cum-btn-dark:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 28px rgba(0,0,0,0.28);
  }
  .cum-btn-dark:disabled { opacity: 0.35; cursor: not-allowed; }

  .cum-cancel-btn {
    background: transparent; border: none;
    font-size: 13px; cursor: pointer; padding: 0;
    display: flex; align-items: center; gap: 5px;
    margin-top: 12px; color: #9ca3af;
    font-family: DM Sans, sans-serif; transition: all 0.18s;
  }
  .cum-cancel-btn:hover { color: #374151; }
`;

/* ─── Field wrapper ──────────────────────────────────────────── */
function Field({ label, error, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{
        display: "block", fontSize: 10, fontWeight: 600,
        letterSpacing: "0.1em", textTransform: "uppercase",
        marginBottom: 6, color: "#9ca3af",
        fontFamily: "DM Sans, sans-serif",
      }}>
        {label}
      </label>
      {children}
      {error && (
        <p style={{
          margin: "5px 0 0", fontSize: 11, fontWeight: 500,
          color: "#ef4444", fontFamily: "DM Sans, sans-serif",
        }}>
          {error.message}
        </p>
      )}
    </div>
  );
}

/* ─── Main Modal ─────────────────────────────────────────────── */
export default function CreateUserModal({ onClose }) {
  const [step,    setStep]    = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [otp,     setOtp]     = useState(["", "", "", ""]);
  const [locationToken, setLocationToken] = useState("");

  const {
    register, watch, trigger, control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { role: "admin", phone: "", pincode: "", city: "", locality: "", state: "" },
    mode: "onChange",
  });

  const formData = watch();

  /* ── Handlers ── */
  const handleRequestOtp = async () => {
    const ok = await trigger(["name", "email", "phone", "role"]);
    if (!ok) return;
    try {
      setLoading(true);
      await createRequestOtp(formData.phone);
      toast.success(`OTP sent to ${formData.phone}`);
      setStep(2);
    } catch (err) {
      toast.error(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const finalOtp = otp.join("");
    if (finalOtp.length < 4) return toast.error("Enter 4-digit code");
    try {
      setLoading(true);
      const response = await createVerifyOtpService({
        otp:   finalOtp,
        email: formData.email,
        name:  formData.name,
        role:  formData.role,
        phone: formData.phone,
      });
      if (response.token) {
        setLocationToken(response.token);
        localStorage.setItem("locationToken", response.token);
        toast.success("Identity Verified!");
        setStep(3);
      }
    } catch (err) {
      toast.error(err.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleFinalSubmit = async () => {
    const ok = await trigger(["pincode", "city", "locality", "state"]);
    if (!ok) return;
    try {
      setLoading(true);
      await createUserLocationDetails({
        pincode:  formData.pincode,
        city:     formData.city,
        locality: formData.locality,
        state:    formData.state,
      });
      setSuccess(true);
      setTimeout(() => onClose?.(), 2800);
    } catch (err) {
      toast.error(err.message || "Location update failed");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    if (value && index < 3) document.getElementById(`otp-${index + 1}`)?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0)
      document.getElementById(`otp-${index - 1}`)?.focus();
  };

  const Spinner = () => (
    <div className="cum-spin-anim" style={{
      width: 15, height: 15, borderRadius: "50%",
      border: "2px solid rgba(255,255,255,0.25)",
      borderTopColor: "white",
    }} />
  );

  return (
    <>
      <style>{styles}</style>

      {/* ── Overlay ── */}
      <div
        className="cum-overlay-anim"
        style={{
          position: "fixed", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 9999, padding: 16,
          background: "rgba(220,240,228,0.55)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
        }}
        onClick={(e) => e.target === e.currentTarget && onClose?.()}
      >
        {/* ── Card ── */}
        <div
          className="cum-card-anim cum-scroll cum-top-line"
          style={{
            position: "relative",
            width: "100%", maxWidth: 460,
            maxHeight: "calc(100vh - 32px)",
            overflowY: "auto", overflowX: "hidden",
            borderRadius: 22, padding: "32px 28px 28px",
            background: "#ffffff",
            border: "1px solid rgba(39,174,96,0.18)",
            boxShadow: "0 8px 48px rgba(39,174,96,0.10), 0 2px 16px rgba(0,0,0,0.06)",
            fontFamily: "DM Sans, sans-serif",
          }}
        >
          {/* Glow blob */}
          <div style={{
            pointerEvents: "none", position: "absolute",
            top: -70, right: -50, width: 200, height: 200,
            background: "radial-gradient(circle, rgba(39,174,96,0.10) 0%, transparent 70%)",
          }} />

          {/* ── Close ── */}
          <button
            style={{
              position: "sticky", top: 0, float: "right",
              width: 30, height: 30, marginBottom: 4,
              display: "flex", alignItems: "center", justifyContent: "center",
              borderRadius: 8, fontSize: 12, cursor: "pointer",
              background: "#f3f4f6", border: "1px solid #e5e7eb",
              color: "#9ca3af", transition: "all 0.18s", flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background  = "#fee2e2";
              e.currentTarget.style.borderColor = "#fca5a5";
              e.currentTarget.style.color       = "#ef4444";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background  = "#f3f4f6";
              e.currentTarget.style.borderColor = "#e5e7eb";
              e.currentTarget.style.color       = "#9ca3af";
            }}
            onClick={onClose}
            aria-label="Close"
          >✕</button>

          {/* ── SUCCESS ── */}
          {success ? (
            <div className="cum-success-anim"
              style={{ textAlign: "center", paddingTop: 18, paddingBottom: 6 }}>
              <div className="cum-pop-anim" style={{
                width: 78, height: 78, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 18px", fontSize: 32, color: "#fff",
                background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_DARK})`,
                boxShadow: `0 0 0 6px ${PRIMARY_MID}, 0 0 40px rgba(39,174,96,0.25)`,
              }}>✓</div>

              <div style={{
                fontFamily: "Syne, sans-serif", fontSize: 20,
                fontWeight: 800, marginBottom: 8, color: "#111827",
              }}>
                Account Created!
              </div>

              <div style={{ fontSize: 13, lineHeight: 1.8, color: "#6b7280" }}>
                <span style={{ fontWeight: 600, color: "#374151" }}>
                  {formData.name}
                </span>{" "}has been registered as a{" "}
                <span style={{ fontWeight: 600, color: PRIMARY_DARK }}>
                  {ROLES.find((r) => r.value === formData.role)?.label}
                </span>
              </div>

              {/* Progress bar */}
              <div style={{
                height: 2, borderRadius: 999, overflow: "hidden",
                marginTop: 24, background: "#e5e7eb",
              }}>
                <div className="cum-fill-anim" style={{
                  height: "100%",
                  background: `linear-gradient(90deg, ${PRIMARY}, #2ecc71)`,
                }} />
              </div>
            </div>

          ) : (
            <>
              {/* Eyebrow */}
              <div style={{
                fontFamily: "Syne, sans-serif", fontSize: 10, fontWeight: 700,
                letterSpacing: "0.16em", textTransform: "uppercase",
                marginBottom: 6, color: PRIMARY,
              }}>
                User Management
              </div>

              {/* Title */}
              <div style={{
                fontFamily: "Poppins, sans-serif", fontSize: 20, fontWeight: 600,
                marginBottom: 4, lineHeight: 1.3, color: "#111827",
              }}>
                Create New User
              </div>

              {/* Sub */}
              <div style={{
                fontSize: 12, fontWeight: 500, color: "#9ca3af",
                fontFamily: "DM Sans, sans-serif", marginBottom: 18,
              }}>
                Step {step} of 3 —{" "}
                {["Basic Information", "Verify Identity", "Location Details"][step - 1]}
              </div>

              {/* ── Step Progress bars ── */}
              <div style={{ display: "flex", gap: 6, marginBottom: 22 }}>
                {STEP_LABELS.map((label, i) => {
                  const s      = i + 1;
                  const done   = step > s;
                  const active = step === s;
                  return (
                    <div key={s} style={{ flex: 1 }}>
                      <div style={{
                        height: 4, borderRadius: 999, overflow: "hidden",
                        background: "#f3f4f6",
                      }}>
                        <div style={{
                          height: "100%", borderRadius: 999,
                          background: done || active
                            ? `linear-gradient(90deg, ${PRIMARY}, #2ecc71)`
                            : "transparent",
                          transition: "width 0.4s ease",
                          width: done || active ? "100%" : "0%",
                        }} />
                      </div>
                      <div style={{
                        marginTop: 5, fontSize: 10, fontWeight: 600,
                        letterSpacing: "0.06em", textTransform: "uppercase",
                        fontFamily: "DM Sans, sans-serif",
                        color: active ? PRIMARY : done ? PRIMARY_DARK : "#d1d5db",
                        transition: "color 0.3s",
                      }}>
                        {done ? "✓ " : ""}{label}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: "#f3f4f6", margin: "0 0 20px" }} />

              {/* ══ STEP 1 ══ */}
              {step === 1 && (
                <div className="cum-step-anim">
                  <Field label="Full Name" error={errors.name}>
                    <input
                      {...register("name")}
                      placeholder="e.g. Ravi Kumar"
                      className={`cum-input${errors.name ? " cum-error" : ""}`}
                    />
                  </Field>

                  <Field label="Phone Number" error={errors.phone}>
                    <div className={`cum-phone-wrap${errors.phone ? " cum-error" : ""}`}>
                      <Controller
                        name="phone"
                        control={control}
                        render={({ field }) => (
                          <PhoneInput
                            {...field}
                            defaultCountry="IN"
                            placeholder="Enter phone number"
                            style={{ width: "100%" }}
                          />
                        )}
                      />
                    </div>
                  </Field>

                  <Field label="Email Address" error={errors.email}>
                    <input
                      {...register("email")}
                      placeholder="example@company.com"
                      className={`cum-input${errors.email ? " cum-error" : ""}`}
                    />
                  </Field>

                  <Field label="Assigned Role">
                    <div style={{ position: "relative" }}>
                      <select {...register("role")} className="cum-select">
                        {ROLES.map((r) => (
                          <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                      </select>
                      <div style={{
                        position: "absolute", right: 12, top: "50%",
                        transform: "translateY(-50%)", pointerEvents: "none",
                        color: "#9ca3af", fontSize: 11,
                      }}>▼</div>
                    </div>
                  </Field>

                  <button
                    className="cum-btn-primary"
                    style={{ marginTop: 6 }}
                    onClick={handleRequestOtp}
                    disabled={loading}
                  >
                    {loading ? <Spinner /> : <>Send Verification Code →</>}
                  </button>

                  <button className="cum-cancel-btn" onClick={onClose}>
                    ← Cancel
                  </button>
                </div>
              )}

              {/* ══ STEP 2 ══ */}
              {step === 2 && (
                <div className="cum-step-anim">
                  <div style={{ textAlign: "center", marginBottom: 22 }}>
                    <div style={{
                      width: 64, height: 64, borderRadius: 18,
                      background: PRIMARY_LIGHT,
                      border: `1px solid rgba(39,174,96,0.25)`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      margin: "0 auto 14px", fontSize: 28,
                    }}>🛡️</div>
                    <div style={{
                      fontFamily: "Poppins, sans-serif", fontSize: 15,
                      fontWeight: 600, color: "#111827", marginBottom: 5,
                    }}>
                      Verify Identity
                    </div>
                    <div style={{ fontSize: 13, color: "#6b7280", fontFamily: "DM Sans, sans-serif" }}>
                      Enter the 4-digit code sent to{" "}
                      <span style={{ fontWeight: 600, color: "#374151" }}>{formData.phone}</span>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 20 }}>
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        id={`otp-${i}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        placeholder="·"
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        className="cum-otp-input"
                      />
                    ))}
                  </div>

                  <button className="cum-btn-primary" onClick={handleVerifyOtp} disabled={loading}>
                    {loading ? <Spinner /> : "Verify Code →"}
                  </button>

                  <button className="cum-cancel-btn" onClick={() => setStep(1)}>
                    ← Back to edit info
                  </button>
                </div>
              )}

              {/* ══ STEP 3 ══ */}
              {step === 3 && (
                <div className="cum-step-anim">
                  <Field label="Locality" error={errors.locality}>
                    <input
                      {...register("locality")}
                      placeholder="e.g. Madhapur"
                      className={`cum-input${errors.locality ? " cum-error" : ""}`}
                    />
                  </Field>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <Field label="City" error={errors.city}>
                      <input
                        {...register("city")}
                        placeholder="Hyderabad"
                        className={`cum-input${errors.city ? " cum-error" : ""}`}
                      />
                    </Field>
                    <Field label="Pincode" error={errors.pincode}>
                      <input
                        {...register("pincode")}
                        placeholder="500033"
                        maxLength={6}
                        className={`cum-input${errors.pincode ? " cum-error" : ""}`}
                      />
                    </Field>
                  </div>

                  <Field label="State" error={errors.state}>
                    <input
                      {...register("state")}
                      placeholder="Telangana"
                      className={`cum-input${errors.state ? " cum-error" : ""}`}
                    />
                  </Field>

                  {/* Account summary preview */}
                  <div style={{
                    marginTop: 4, marginBottom: 18,
                    padding: "12px 14px",
                    background: PRIMARY_LIGHT,
                    border: `1px solid rgba(39,174,96,0.22)`,
                    borderRadius: 12,
                    fontFamily: "DM Sans, sans-serif",
                  }}>
                    <p style={{
                      margin: "0 0 10px", fontSize: 10, fontWeight: 700,
                      letterSpacing: "0.1em", textTransform: "uppercase", color: PRIMARY,
                    }}>
                      Account Summary
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                        background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_DARK})`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#fff", fontSize: 15, fontWeight: 700,
                      }}>
                        {formData.name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{
                          margin: 0, fontSize: 13, fontWeight: 600, color: "#111827",
                          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                        }}>
                          {formData.name || "—"}
                        </p>
                        <p style={{
                          margin: 0, fontSize: 11, color: "#6b7280",
                          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                        }}>
                          {formData.email || "—"}
                        </p>
                      </div>
                      <span style={{
                        fontSize: 10, fontWeight: 600, padding: "3px 8px",
                        borderRadius: 999, background: "rgba(39,174,96,0.15)",
                        color: PRIMARY_DARK, whiteSpace: "nowrap", flexShrink: 0,
                      }}>
                        {ROLES.find((r) => r.value === formData.role)?.label}
                      </span>
                    </div>
                  </div>

                  <button className="cum-btn-dark" onClick={handleFinalSubmit} disabled={loading}>
                    {loading ? <Spinner /> : "Finish & Create Account →"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}