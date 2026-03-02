//src/Auth/SignIn.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { requestOtp, verifyOtpService } from "../services/authService";
import { Mail, Loader2, AlertCircle, ChevronLeft } from "lucide-react";

const OTP_LENGTH = 4;

export default function SignIn() {
  const navigate = useNavigate();

  // State
  const [step, setStep] = useState(1); // 1: Email, 2: OTP
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(new Array(OTP_LENGTH).fill(""));
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Simple email validation
  const isValidEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  // Logic: Request OTP via email
  const handleRequestOtp = async () => {
    if (!isValidEmail(email)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    try {
      console.log("📤 SEND OTP EMAIL:", email);
      await requestOtp(email);
      setStep(2);
    } catch (err) {
      setErrorMsg(err?.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  // Logic: OTP Box Handling
  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return;
    const newOtp = [...otp];
    newOtp[index] = element.value.substring(element.value.length - 1);
    setOtp(newOtp);

    // Move to next box
    if (element.value && element.nextSibling) {
      element.nextSibling.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && e.target.previousSibling) {
      e.target.previousSibling.focus();
    }
  };

  // Logic: Auto-Verify when last OTP box is filled
  useEffect(() => {
    const fullOtp = otp.join("");
    if (fullOtp.length === OTP_LENGTH) {
      const verify = async () => {
        setLoading(true);
        setErrorMsg("");
        try {
          const res = await verifyOtpService(fullOtp, email);
          Cookies.set("token", res.token, {
            path: "/",
            expires: 30,
            secure: window.location.protocol === "https:",
            sameSite: "strict",
          });
          navigate("/", { replace: true });
        } catch (err) {
          setErrorMsg(err?.message || "Invalid OTP.");
          setOtp(new Array(OTP_LENGTH).fill(""));
        } finally {
          setLoading(false);
        }
      };
      verify();
    }
  }, [otp]);

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row font-sans">

      {/* LEFT SECTION - Brand Hero */}
      <section className="flex-[1.2] bg-gradient-to-br from-green-500 to-green-600 p-8 lg:p-16 flex flex-col justify-center text-white relative overflow-hidden">
        {/* Decorative Circle */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          <div className="mb-12">
            <div className="text-2xl font-bold tracking-tighter mb-1">
              PRO<span className="opacity-70">PE</span>NU
            </div>
            <div className="w-12 h-1 bg-white rounded-full"></div>
          </div>

          <h1 className="text-4xl lg:text-6xl font-extrabold mb-6 leading-tight">
            {step === 1 ? "Hey, Hello!" : "Verify Your Identity"}
          </h1>
          <p className="text-xl lg:text-2xl font-medium mb-8 text-green-50">
            {step === 1
              ? "Your admin dashboard starts here"
              : "One step away from your dashboard"}
          </p>
          <p className="max-w-md text-green-100/80 leading-relaxed">
            {step === 1
              ? "Login with your registered email to receive a secure access code."
              : `We've sent a 4-digit code to ${email}. Please enter it to continue.`}
          </p>
        </div>
      </section>

      {/* RIGHT SECTION - Auth Card */}
      <section className="flex-1 flex items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-[420px] bg-white rounded-[2.5rem] shadow-xl shadow-green-900/5 p-8 md:p-12 relative">

          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center">
              <img
                src="src/assets/hero-icon.png"
                alt="Logo"
                className="w-10 h-10 object-contain"
              />
            </div>
          </div>

          <h2 className="text-xl font-bold text-center text-slate-800 mb-8">
            {step === 1 ? "Admin Login" : "Enter Code"}
          </h2>

          {/* Form Content */}
          <div className="space-y-6">
            {step === 1 ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Email Field */}
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <Mail size={18} />
                    </span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setErrorMsg("");
                      }}
                      onKeyDown={(e) => e.key === "Enter" && handleRequestOtp()}
                      placeholder="admin@example.com"
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 outline-none transition-all font-medium"
                    />
                  </div>
                </div>

                <button
                  onClick={handleRequestOtp}
                  disabled={loading || !isValidEmail(email)}
                  className="w-full bg-green-500 hover:bg-green-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-4 rounded-2xl shadow-lg shadow-green-500/30 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    "Request OTP"
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
                {/* OTP Boxes */}
                <div className="flex justify-between gap-3">
                  {otp.map((data, index) => (
                    <input
                      key={index}
                      type="text"
                      inputMode="numeric"
                      maxLength="1"
                      className="w-14 h-16 text-center text-2xl font-bold bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all"
                      value={data}
                      onChange={(e) => handleOtpChange(e.target, index)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      autoFocus={index === 0}
                    />
                  ))}
                </div>

                {/* Sent-to hint */}
                <p className="text-center text-sm text-slate-400">
                  Code sent to{" "}
                  <span className="font-semibold text-slate-600">{email}</span>
                </p>

                <div className="flex flex-col items-center gap-4">
                  <button
                    onClick={() => {
                      setStep(1);
                      setOtp(new Array(OTP_LENGTH).fill(""));
                      setErrorMsg("");
                    }}
                    className="text-sm font-bold text-green-600 hover:text-green-700 flex items-center gap-1"
                  >
                    <ChevronLeft size={16} /> Edit Email Address
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Feedback & Error */}
          <div className="mt-6 min-h-[40px]">
            {errorMsg && (
              <div className="flex items-center gap-2 text-red-500 text-sm font-semibold justify-center bg-red-50 p-3 rounded-xl">
                <AlertCircle size={16} /> {errorMsg}
              </div>
            )}
            {loading && step === 2 && (
              <div className="flex items-center gap-2 text-green-600 text-sm font-semibold justify-center">
                <Loader2 className="animate-spin" size={16} /> Validating
                code...
              </div>
            )}
          </div>

          {/* Support Footer */}
          <footer className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400">
              Technical issues?{" "}
              <a
                href="mailto:propenu@gmail.com"
                className="text-green-600 font-bold hover:underline"
              >
                propenu@gmail.com
              </a>
            </p>
          </footer>
        </div>
      </section>
    </div>
  );
}