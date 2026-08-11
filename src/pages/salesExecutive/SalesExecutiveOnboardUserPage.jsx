import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Mail, RefreshCw, Smartphone } from "lucide-react";
import { toast } from "sonner";
import OtpFourDigitInput from "../../components/common/OtpFourDigitInput";
import {
  getUserDetails,
  seClaimClient,
  seCreateRequestOtp,
  seCreateUpdateLocation,
  seCreateVerifyOtp,
} from "../../features/user/userService";

const STEPS = [
  { id: 1, title: "Details" },
  { id: 2, title: "Verify OTP" },
  { id: 3, title: "Location" },
  { id: 4, title: "Review" },
  { id: 5, title: "Done" },
];

const INTENT_OPTIONS = [
  { value: "user", label: "Owner", role: "user" },
  { value: "agent", label: "Agent", role: "agent" },
  { value: "builder", label: "Builder", role: "builder" },
];

const intentToRole = (intent) =>
  INTENT_OPTIONS.find((item) => item.value === intent)?.role || "user";

const intentLabel = (intent) =>
  INTENT_OPTIONS.find((item) => item.value === intent)?.label || intent;

const normalizePhone = (value) => String(value || "").replace(/\D/g, "").slice(-10);
const maskPhone = (phone) => {
  const p = normalizePhone(phone);
  if (p.length !== 10) return phone || "—";
  return `+91 ${p.slice(0, 2)}••••${p.slice(-2)}`;
};

export default function SalesExecutiveOnboardUserPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const seIdFromQuery = searchParams.get("seId") || "";

  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [onboardingToken, setOnboardingToken] = useState("");
  const [createdUserId, setCreatedUserId] = useState("");
  const [actorSeId, setActorSeId] = useState(seIdFromQuery);
  const [actorSeName, setActorSeName] = useState("");
  const [otpError, setOtpError] = useState("");
  const [resendIn, setResendIn] = useState(0);
  const lastAutoOtp = useRef("");

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    intent: "user",
    companyName: "",
    otp: "",
    state: "",
    city: "",
    locality: "",
    pincode: "",
  });

  const phone10 = useMemo(() => normalizePhone(form.phone), [form.phone]);
  const signupRole = useMemo(() => intentToRole(form.intent), [form.intent]);
  const update = (patch) => setForm((f) => ({ ...f, ...patch }));

  useEffect(() => {
    if (resendIn <= 0) return undefined;
    const t = setTimeout(() => setResendIn((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  const ensureActorSeId = async () => {
    if (actorSeId && actorSeName) return actorSeId;
    const me = await getUserDetails();
    const user = me?.data?.user || me?.data || me?.user || null;
    const id = String(actorSeId || user?._id || user?.id || "");
    const name = String(user?.name || user?.fullName || "").trim();
    if (id) setActorSeId(id);
    if (name) setActorSeName(name);
    return id;
  };

  useEffect(() => {
    void ensureActorSeId();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendOtp = async ({ silent } = {}) => {
    if (!form.name.trim()) return toast.error("Full name is required");
    if (phone10.length !== 10) return toast.error("Enter a valid 10-digit mobile number");
    if (signupRole === "builder" && !form.companyName.trim()) {
      return toast.error("Company name is required for Builder");
    }
    setBusy(true);
    setOtpError("");
    try {
      await ensureActorSeId();
      await seCreateRequestOtp({ phone: phone10 });
      if (!silent) toast.success("4-digit OTP sent to client mobile");
      setResendIn(30);
      setForm((f) => ({ ...f, otp: "" }));
      lastAutoOtp.current = "";
      setStep(2);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to send OTP");
    } finally {
      setBusy(false);
    }
  };

  const verifyOtp = async () => {
    const otp = String(form.otp || "").trim();
    if (otp.length !== 4) {
      setOtpError("Enter the 4-digit OTP");
      return toast.error("Enter the 4-digit OTP");
    }
    setBusy(true);
    setOtpError("");
    try {
      const res = await seCreateVerifyOtp({
        phone: phone10,
        otp,
        name: form.name.trim(),
        email: form.email.trim().toLowerCase() || undefined,
        role: signupRole,
        ...(signupRole === "builder"
          ? { companyName: form.companyName.trim() }
          : {}),
      });
      const data = res?.data || res;
      const token = data?.token;
      if (!token) throw new Error(data?.message || "OTP verification failed");
      setOnboardingToken(token);
      let userId = String(data?.userId || data?.user?._id || "");
      if (!userId) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1] || ""));
          userId = String(payload.sub || payload.id || payload.userId || "");
        } catch {
          userId = "";
        }
      }
      setCreatedUserId(userId);
      toast.success("Phone verified — continue with location");
      setStep(3);
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || "OTP verification failed";
      setOtpError(msg);
      toast.error(msg);
      lastAutoOtp.current = "";
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (step !== 2 || form.otp.length !== 4 || busy) return;
    if (lastAutoOtp.current === form.otp) return;
    lastAutoOtp.current = form.otp;
    void verifyOtp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.otp, step]);

  const saveLocation = async () => {
    if (!form.state.trim() || !form.city.trim() || !form.locality.trim() || !form.pincode.trim()) {
      return toast.error("State, city, locality and pincode are required");
    }
    if (!onboardingToken) return toast.error("Session missing — verify OTP again");
    setBusy(true);
    try {
      const res = await seCreateUpdateLocation(
        {
          state: form.state.trim(),
          city: form.city.trim(),
          locality: form.locality.trim(),
          pincode: form.pincode.trim(),
        },
        onboardingToken,
      );
      const data = res?.data || res;
      const userId =
        createdUserId || String(data?.user?._id || data?.user?.id || data?.userId || "");
      if (userId) setCreatedUserId(userId);
      toast.success("Location saved");
      setStep(4);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Location update failed");
    } finally {
      setBusy(false);
    }
  };

  const assignToSe = async () => {
    setBusy(true);
    try {
      const seId = await ensureActorSeId();
      let userId = createdUserId;
      if (!userId && onboardingToken) {
        try {
          const payload = JSON.parse(atob(onboardingToken.split(".")[1] || ""));
          userId = String(payload.sub || payload.id || payload.userId || "");
        } catch {
          /* ignore */
        }
      }
      if (!userId) throw new Error("Created user id missing — verify OTP again");

      const claim = await seClaimClient({
        userId,
        salesExecutiveId: seIdFromQuery || seId,
      });
      const claimedId = claim?.data?.client?._id || userId;
      setCreatedUserId(String(claimedId));
      toast.success("Client assigned to Sales Executive");
      setStep(5);
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || "Assign failed");
    } finally {
      setBusy(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setOnboardingToken("");
    setCreatedUserId("");
    setOtpError("");
    setResendIn(0);
    lastAutoOtp.current = "";
    setForm({
      name: "",
      phone: "",
      email: "",
      intent: "user",
      companyName: "",
      otp: "",
      state: "",
      city: "",
      locality: "",
      pincode: "",
    });
  };

  return (
    <div className="min-h-[calc(100dvh-4rem)] bg-[#eef1f4] px-3 py-5 sm:px-4 sm:py-7">
      <div className="mx-auto max-w-[720px]">
        <div className="mb-3 flex items-center justify-between gap-3 px-1">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to dashboard
          </button>
          <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
            <span className="inline-flex h-2 w-2 rounded-full bg-[#27AE60]" />
            SE client onboarding
          </p>
        </div>

        <div className="overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.08)]">
          <div className="flex items-center justify-between border-b border-slate-100 bg-[#f8faf9] px-5 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#27AE60] text-sm font-black text-white">
                P
              </div>
              <div>
                <p className="text-sm font-black tracking-wide text-slate-900">PROPENU</p>
                <p className="text-[10px] font-semibold text-slate-500">
                  Onboard marketplace user
                </p>
              </div>
            </div>
            <p className="hidden text-[10px] font-bold uppercase tracking-widest text-[#27AE60] sm:block">
              Same as propenu.com signup
            </p>
          </div>

          <div className="px-5 py-6 sm:px-8 sm:py-7">
            <div className="mb-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#27AE60]">
                Sales Executive
              </p>
              <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-[28px]">
                Onboard Propenu user
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                Owner / Agent / Builder · 4-digit OTP · Location · Assign to you
              </p>
            </div>

            <div className="mb-6 flex flex-wrap gap-2">
              {STEPS.map((item) => (
                <div
                  key={item.id}
                  className={`rounded-full px-3 py-1 text-[11px] font-bold ${
                    step === item.id
                      ? "bg-[#27AE60] text-white"
                      : step > item.id
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {item.id}. {item.title}
                </div>
              ))}
            </div>

            {step === 1 && (
              <div className="space-y-4">
                <Field
                  label="Full name"
                  value={form.name}
                  onChange={(v) => update({ name: v })}
                  placeholder="e.g. Aarav Sharma"
                />
                <Field
                  label="Mobile number"
                  value={form.phone}
                  onChange={(v) => update({ phone: v.replace(/\D/g, "").slice(0, 10) })}
                  placeholder="10-digit mobile"
                  icon={<Smartphone className="h-4 w-4" />}
                  hint="OTP will be sent to this number"
                />
                <Field
                  label="Email"
                  value={form.email}
                  onChange={(v) => update({ email: v })}
                  placeholder="name@email.com"
                  icon={<Mail className="h-4 w-4" />}
                  type="email"
                />
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Intent
                  <select
                    value={form.intent}
                    onChange={(e) => update({ intent: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold outline-none focus:border-[#27AE60] focus:ring-4 focus:ring-[#27AE60]/15"
                  >
                    {INTENT_OPTIONS.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>
                {signupRole === "builder" ? (
                  <Field
                    label="Company name"
                    value={form.companyName}
                    onChange={(v) => update({ companyName: v })}
                    placeholder="Builder company name"
                  />
                ) : null}
                <PrimaryButton disabled={busy} onClick={() => sendOtp()}>
                  {busy ? "Sending…" : "Send 4-digit OTP"}
                </PrimaryButton>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <div className="rounded-[18px] border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-sm font-black text-emerald-900">Verify mobile</p>
                  <p className="mt-0.5 text-xs font-semibold text-emerald-700">
                    Enter the 4-digit OTP sent to {maskPhone(phone10)}
                  </p>
                </div>

                <div className="space-y-3 text-center">
                  <OtpFourDigitInput
                    value={form.otp}
                    onChange={(otp) => {
                      setOtpError("");
                      lastAutoOtp.current = "";
                      update({ otp });
                    }}
                    disabled={busy}
                    error={Boolean(otpError)}
                    autoFocus
                  />
                  {otpError ? (
                    <p className="text-xs font-semibold text-red-500">{otpError}</p>
                  ) : (
                    <p className="text-xs font-semibold text-slate-500">
                      Exactly 4 digits · auto-verifies when complete
                    </p>
                  )}

                  <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs font-semibold">
                    {resendIn > 0 ? (
                      <span className="text-slate-500">
                        Resend code in 00:{String(resendIn).padStart(2, "0")}
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => sendOtp({ silent: true })}
                        className="text-[#27AE60] hover:underline"
                      >
                        Resend OTP
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => {
                        setStep(1);
                        update({ otp: "" });
                        setOtpError("");
                      }}
                      className="text-slate-500 hover:underline"
                    >
                      Change mobile number
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <GhostButton disabled={busy} onClick={() => setStep(1)}>
                    Back
                  </GhostButton>
                  <PrimaryButton
                    disabled={busy || form.otp.length !== 4}
                    onClick={verifyOtp}
                    className="flex-1"
                  >
                    {busy ? "Verifying…" : "Verify OTP & Continue"}
                  </PrimaryButton>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="State" value={form.state} onChange={(v) => update({ state: v })} />
                  <Field label="City" value={form.city} onChange={(v) => update({ city: v })} />
                  <Field
                    label="Locality"
                    value={form.locality}
                    onChange={(v) => update({ locality: v })}
                  />
                  <Field
                    label="Pincode"
                    value={form.pincode}
                    onChange={(v) => update({ pincode: v.replace(/\D/g, "").slice(0, 6) })}
                    placeholder="6-digit pincode"
                  />
                </div>
                <div className="flex gap-2">
                  <GhostButton disabled={busy} onClick={() => setStep(2)}>
                    Back
                  </GhostButton>
                  <PrimaryButton disabled={busy} onClick={saveLocation} className="flex-1">
                    {busy ? "Saving…" : "Save location"}
                  </PrimaryButton>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <div className="rounded-[18px] border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                  <Row label="Name" value={form.name} />
                  <Row label="Intent" value={intentLabel(form.intent)} />
                  <Row label="Role" value={signupRole} />
                  {signupRole === "builder" ? (
                    <Row label="Company" value={form.companyName || "—"} />
                  ) : null}
                  <Row label="Phone" value={`+91 ${phone10}`} />
                  <Row label="Email" value={form.email || "—"} />
                  <Row
                    label="Location"
                    value={[form.locality, form.city, form.state, form.pincode]
                      .filter(Boolean)
                      .join(", ")}
                  />
                  <Row
                    label="Assign to"
                    value={
                      actorSeName
                        ? `${actorSeName} (Sales Executive)`
                        : "This Sales Executive"
                    }
                  />
                </div>
                <div className="flex gap-2">
                  <GhostButton disabled={busy} onClick={() => setStep(3)}>
                    Back
                  </GhostButton>
                  <PrimaryButton disabled={busy} onClick={assignToSe} className="flex-1">
                    {busy ? "Assigning…" : "Create & assign to me"}
                  </PrimaryButton>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-5 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#27AE60] text-white">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-950">Client onboarded</h2>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">
                    {form.name} ({intentLabel(form.intent)}) can login on{" "}
                    <strong>propenu.com</strong>
                    {actorSeName ? (
                      <>
                        {" "}
                        and is assigned to <strong>{actorSeName}</strong>
                      </>
                    ) : null}
                    . You will see them under My clients.
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
                  <Link
                    to={`/sales-executives/work/${encodeURIComponent(actorSeId || "me")}?tab=clients`}
                    className="rounded-xl bg-[#27AE60] px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700"
                  >
                    View My clients
                  </Link>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700"
                  >
                    Onboard another
                  </button>
                </div>
              </div>
            )}

            {busy ? (
              <p className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-slate-500">
                <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Working…
              </p>
            ) : null}
          </div>

          <div className="border-t border-slate-100 bg-[#f8faf9] px-5 py-4 text-center">
            <p className="text-xs font-bold text-slate-900">
              Focused onboarding — sidebar hidden for this flow
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              Phone OTP is 4 digits · Staff session stays signed in
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <p className="border-b border-slate-200/80 py-2 last:border-0">
      <span className="font-bold text-slate-900">{label}:</span> {value}
    </p>
  );
}

function Field({ label, value, onChange, placeholder, icon, hint, type = "text" }) {
  return (
    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
      {label}
      <div className="relative mt-1.5">
        {icon ? (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </span>
        ) : null}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:border-[#27AE60] focus:ring-4 focus:ring-[#27AE60]/15 ${
            icon ? "pl-10 pr-3" : "px-3"
          }`}
        />
      </div>
      {hint ? <p className="mt-1 text-[11px] font-semibold normal-case tracking-normal text-slate-400">{hint}</p> : null}
    </label>
  );
}

function PrimaryButton({ children, className = "", ...props }) {
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex w-full items-center justify-center rounded-xl bg-[#27AE60] px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60 ${className}`}
    >
      {children}
    </button>
  );
}

function GhostButton({ children, ...props }) {
  return (
    <button
      type="button"
      {...props}
      className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 disabled:opacity-60"
    >
      {children}
    </button>
  );
}
