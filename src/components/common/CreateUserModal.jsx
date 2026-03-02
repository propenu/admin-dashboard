// // frontend/admin-dashboard/src/components/common/CreateUserModal.jsx
// import { useState } from "react";
// import {
//   createRequestOtp,
//   createVerifyOtpService,
// } from "../../services/authService";
// import { toast } from "sonner";

// const roles = [
//   // {
//   //   value: "super_admin",
//   //   label: "Super Admin",
//   //   icon: "★",
//   //   desc: "Full system access",
//   // },
//   { value: "admin", label: "Admin", icon: "⬡", desc: "Manage users & config" },
//   {
//     value: "sales_manager",
//     label: "Sales Manager",
//     icon: "◎",
//     desc: "Lead & team oversight",
//   },
//   {
//     value: "sales_agent",
//     label: "Sales Agent",
//     icon: "◈",
//     desc: "Handle sales pipeline",
//   },
//   { value: "agent", label: "Agent", icon: "⊛", desc: "Support & operations" },
//   { value: "user", label: "User", icon: "○", desc: "Basic access only" },
//   { value: "accounts", label: "Accounts", icon: "⊙", desc: "Manage accounts" },
// ];

// export default function CreateUserModal({ onClose }) {
//   const [roleOpen, setRoleOpen] = useState(false);
//   const [step, setStep] = useState(1);
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [role, setRole] = useState("super_admin");
//   const [otp, setOtp] = useState("");
//   const [success, setSuccess] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [otpDigits, setOtpDigits] = useState(["", "", "", ""]);

//   const handleRequestOtp = async () => {
//     try {
//       setLoading(true);
//       await createRequestOtp(name, email, role);
//       setStep(2);
//     } catch (err) {
//       console.error(err);
//       toast.error(`${err.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleOtpChange = (i, val) => {
//     if (!/^\d*$/.test(val)) return;
//     const next = [...otpDigits];
//     next[i] = val.slice(-1);
//     setOtpDigits(next);
//     setOtp(next.join(""));
//     if (val && i < 3) document.getElementById(`otp-${i + 1}`)?.focus();
//   };

//   const handleOtpKeyDown = (i, e) => {
//     if (e.key === "Backspace" && !otpDigits[i] && i > 0)
//       document.getElementById(`otp-${i - 1}`)?.focus();
//   };

//   const handleVerify = async () => {
//     try {
//       setLoading(true);
//       await createVerifyOtpService(otp, email, name, role);
//       setSuccess(true);
//       setTimeout(() => onClose?.(), 2400);
//     } catch (err) {
//       console.error(err);
//       toast.error(`${err.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const selectedRole = roles.find((r) => r.value === role);

//   return (
//     <>

//       <div
//         className="cmu-overlay-anim fixed inset-0 flex items-center justify-center z-[9999] p-4"
//         style={{
//           background: "rgba(2,7,3,0.82)",
//           backdropFilter: "blur(14px)",
//           WebkitBackdropFilter: "blur(14px)",
//         }}
//         onClick={(e) => e.target === e.currentTarget && onClose?.()}
//       >
//         {/* ── Card ── */}
//         <div
//           className="cmu-card-anim cmu-scroll cmu-top-line font-dmsans relative w-full max-w-[460px] max-h-[calc(100vh-32px)] overflow-y-auto overflow-x-hidden rounded-[22px] px-7 pt-8 pb-7"
//           style={{
//             background: "#07100a",
//             border: "1px solid rgba(39,174,96,0.14)",
//           }}
//         >
//           {/* Glow blob */}
//           <div
//             className="pointer-events-none absolute -top-[70px] -right-[50px] w-[200px] h-[200px]"
//             style={{
//               background:
//                 "radial-gradient(circle, rgba(39,174,96,0.12) 0%, transparent 70%)",
//             }}
//           />

//           {/* Close button */}
//           <button
//             className="sticky top-0 right-0 float-right w-[30px] h-[30px] mb-1 flex items-center justify-center rounded-[8px] text-[12px] cursor-pointer transition-all duration-[180ms] flex-shrink-0"
//             style={{
//               background: "rgba(255,255,255,0.04)",
//               border: "1px solid rgba(255,255,255,0.07)",
//               color: "rgba(255,255,255,0.3)",
//             }}
//             onMouseEnter={(e) => {
//               e.currentTarget.style.background = "rgba(255,0,0,0.08)";
//               e.currentTarget.style.borderColor = "rgba(255,80,80,0.2)";
//               e.currentTarget.style.color = "rgba(255,120,120,0.8)";
//             }}
//             onMouseLeave={(e) => {
//               e.currentTarget.style.background = "rgba(255,255,255,0.04)";
//               e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
//               e.currentTarget.style.color = "rgba(255,255,255,0.3)";
//             }}
//             onClick={onClose}
//             aria-label="Close"
//           >
//             ✕
//           </button>

//           {/* ── Success State ── */}
//           {success ? (
//             <div className="cmu-success-anim text-center pt-[18px] pb-[6px]">
//               <div
//                 className="cmu-pop-anim w-[78px] h-[78px] rounded-full flex items-center justify-center mx-auto mb-[18px] text-[32px] text-white"
//                 style={{
//                   background: "linear-gradient(135deg, #27AE60, #17703c)",
//                   boxShadow:
//                     "0 0 0 1px rgba(39,174,96,0.3), 0 0 40px rgba(39,174,96,0.35)",
//                 }}
//               >
//                 ✓
//               </div>
//               <div
//                 className="font-syne text-[20px] font-extrabold mb-2"
//                 style={{ color: "#e6ffee" }}
//               >
//                 Access Granted
//               </div>
//               <div
//                 className="text-[13px] leading-[1.7]"
//                 style={{ color: "rgba(255,255,255,0.28)" }}
//               >
//                 <span
//                   className="font-semibold"
//                   style={{ color: "rgba(255,255,255,0.6)" }}
//                 >
//                   {name}
//                 </span>{" "}
//                 has been added as{" "}
//                 <span
//                   className="font-semibold"
//                   style={{ color: "rgba(255,255,255,0.6)" }}
//                 >
//                   {selectedRole?.label || role}
//                 </span>
//               </div>
//               <div
//                 className="h-[2px] rounded-full overflow-hidden mt-6"
//                 style={{ background: "rgba(255,255,255,0.06)" }}
//               >
//                 <div
//                   className="cmu-fill-anim h-full"
//                   style={{
//                     background: "linear-gradient(90deg, #27AE60, #2ecc71)",
//                   }}
//                 />
//               </div>
//             </div>
//           ) : (
//             <>
//               {/* Eyebrow */}
//               <div
//                 className="font-syne text-[10px] font-bold tracking-[0.16em] uppercase mb-[6px]"
//                 style={{ color: "#27AE60" }}
//               >
//                 {step === 1 ? "User Management" : "Verification"}
//               </div>

//               {/* Title */}
//               <div
//                 className="font-poppins text-[20px] mb-5 leading-tight"
//                 style={{ color: "#e6ffee" }}
//               >
//                 {step === 1 ? "Create Credentials" : "Verify Identity"}
//               </div>

//               {/* Step indicators */}
//               <div className="flex gap-[5px] mb-6">
//                 <div
//                   className="h-[3px] flex-1 rounded-full transition-all duration-[350ms]"
//                   style={{
//                     background:
//                       step >= 1 ? "#27AE60" : "rgba(255,255,255,0.07)",
//                   }}
//                 />
//                 <div
//                   className="h-[3px] flex-1 rounded-full transition-all duration-[350ms]"
//                   style={{
//                     background:
//                       step === 2
//                         ? "#27AE60"
//                         : step > 2
//                           ? "rgba(39,174,96,0.3)"
//                           : "rgba(255,255,255,0.07)",
//                   }}
//                 />
//               </div>

//               {/* ── Step 1 ── */}
//               {step === 1 ? (
//                 <>
//                   {/* Full Name */}
//                   <label
//                     className="block text-[10px] font-semibold tracking-[0.1em] uppercase mb-[6px]"
//                     style={{ color: "rgba(255,255,255,0.26)" }}
//                   >
//                     Full Name
//                   </label>
//                   <input
//                     className="font-poppins w-full rounded-[11px] px-[14px] py-[11px] text-[14px] outline-none transition-all duration-[180ms] mb-3"
//                     style={{
//                       background: "rgba(255,255,255,0.03)",
//                       border: "1px solid rgba(255,255,255,0.07)",
//                       color: "#e6ffee",
//                     }}
//                     placeholder="e.g. Alex Johnson"
//                     value={name}
//                     onChange={(e) => setName(e.target.value)}
//                     onFocus={(e) => {
//                       e.currentTarget.style.borderColor = "rgba(39,174,96,0.5)";
//                       e.currentTarget.style.background = "rgba(39,174,96,0.04)";
//                       e.currentTarget.style.boxShadow =
//                         "0 0 0 3px rgba(39,174,96,0.09)";
//                     }}
//                     onBlur={(e) => {
//                       e.currentTarget.style.borderColor =
//                         "rgba(255,255,255,0.07)";
//                       e.currentTarget.style.background =
//                         "rgba(255,255,255,0.03)";
//                       e.currentTarget.style.boxShadow = "none";
//                     }}
//                   />

//                   {/* Email */}
//                   <label
//                     className="block text-[10px] font-semibold tracking-[0.1em] uppercase mb-[6px]"
//                     style={{ color: "rgba(255,255,255,0.26)" }}
//                   >
//                     Email Address
//                   </label>
//                   <input
//                     className="font-poppins w-full rounded-[11px] px-[14px] py-[11px] text-[14px] outline-none transition-all duration-[180ms] mb-3"
//                     style={{
//                       background: "rgba(255,255,255,0.03)",
//                       border: "1px solid rgba(255,255,255,0.07)",
//                       color: "#e6ffee",
//                     }}
//                     placeholder="alex@company.com"
//                     type="email"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     onFocus={(e) => {
//                       e.currentTarget.style.borderColor = "rgba(39,174,96,0.5)";
//                       e.currentTarget.style.background = "rgba(39,174,96,0.04)";
//                       e.currentTarget.style.boxShadow =
//                         "0 0 0 3px rgba(39,174,96,0.09)";
//                     }}
//                     onBlur={(e) => {
//                       e.currentTarget.style.borderColor =
//                         "rgba(255,255,255,0.07)";
//                       e.currentTarget.style.background =
//                         "rgba(255,255,255,0.03)";
//                       e.currentTarget.style.boxShadow = "none";
//                     }}
//                   />

//                   {/* Divider */}
//                   <div
//                     className="h-px my-1 mb-4"
//                     style={{ background: "rgba(255,255,255,0.05)" }}
//                   />

//                   {/* Role label */}
//                   <span
//                     className="block text-[10px] font-semibold tracking-[0.1em] uppercase mb-[10px]"
//                     style={{ color: "rgba(255,255,255,0.26)" }}
//                   >
//                     Assign Role
//                   </span>

//                   {/* Dropdown */}
//                   <div className="relative mb-[10px]">
//                     <div
//                       className="w-full rounded-[11px] px-[14px] py-3 flex justify-between items-center cursor-pointer"
//                       style={{
//                         background: "rgba(255,255,255,0.03)",
//                         border: "1px solid rgba(255,255,255,0.07)",
//                         color: "#e6ffee",
//                       }}
//                       onClick={() => setRoleOpen(!roleOpen)}
//                     >
//                       <span>
//                         {selectedRole?.icon} {selectedRole?.label}
//                       </span>
//                       <span>{roleOpen ? "▲" : "▼"}</span>
//                     </div>

//                     {roleOpen && (
//                       <div
//                         className="absolute top-[110%] left-0 w-full rounded-[12px] max-h-[220px] overflow-y-auto z-20"
//                         style={{
//                           background: "#07100a",
//                           border: "1px solid rgba(39,174,96,0.14)",
//                           boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
//                         }}
//                       >
//                         {roles.map((r) => (
//                           <div
//                             key={r.value}
//                             className="px-[14px] py-[10px] cursor-pointer text-[13px] flex justify-between transition-all duration-[180ms]"
//                             style={{ color: "rgba(255,255,255,0.6)" }}
//                             onMouseEnter={(e) => {
//                               e.currentTarget.style.background =
//                                 "rgba(39,174,96,0.08)";
//                               e.currentTarget.style.color = "#d4ffe2";
//                             }}
//                             onMouseLeave={(e) => {
//                               e.currentTarget.style.background = "transparent";
//                               e.currentTarget.style.color =
//                                 "rgba(255,255,255,0.6)";
//                             }}
//                             onClick={() => {
//                               setRole(r.value);
//                               setRoleOpen(false);
//                             }}
//                           >
//                             <span>
//                               {r.icon} {r.label}
//                             </span>
//                           </div>
//                         ))}
//                       </div>
//                     )}
//                   </div>

//                   {/* Send OTP Button */}
//                   <button
//                     className="cmu-btn-inner w-full mt-4 py-[13px] rounded-[12px] border-none text-white font-dmsans text-[14px] font-semibold tracking-[0.04em] cursor-pointer transition-all duration-[180ms] relative overflow-hidden flex items-center justify-center gap-2 disabled:opacity-35 disabled:cursor-not-allowed disabled:shadow-none"
//                     style={{
//                       background: "linear-gradient(135deg, #27AE60, #1d8646)",
//                       boxShadow: "0 4px 20px rgba(39,174,96,0.26)",
//                     }}
//                     onMouseEnter={(e) => {
//                       if (!e.currentTarget.disabled) {
//                         e.currentTarget.style.transform = "translateY(-1px)";
//                         e.currentTarget.style.boxShadow =
//                           "0 6px 28px rgba(39,174,96,0.38)";
//                       }
//                     }}
//                     onMouseLeave={(e) => {
//                       e.currentTarget.style.transform = "translateY(0)";
//                       e.currentTarget.style.boxShadow =
//                         "0 4px 20px rgba(39,174,96,0.26)";
//                     }}
//                     onMouseDown={(e) => {
//                       if (!e.currentTarget.disabled)
//                         e.currentTarget.style.transform = "scale(0.99)";
//                     }}
//                     onMouseUp={(e) => {
//                       e.currentTarget.style.transform = "translateY(-1px)";
//                     }}
//                     onClick={handleRequestOtp}
//                     disabled={!name || !email || loading}
//                   >
//                     {loading ? (
//                       <div
//                         className="cmu-spin-anim w-[15px] h-[15px] rounded-full border-2"
//                         style={{
//                           borderColor: "rgba(255,255,255,0.25)",
//                           borderTopColor: "white",
//                         }}
//                       />
//                     ) : (
//                       <>Send OTP →</>
//                     )}
//                   </button>
//                 </>
//               ) : (
//                 /* ── Step 2: OTP ── */
//                 <>
//                   <p
//                     className="text-[13px] leading-[1.6] mb-[22px]"
//                     style={{ color: "rgba(255,255,255,0.28)" }}
//                   >
//                     We sent a 4-digit code to{" "}
//                     <span className="font-medium" style={{ color: "#6fcf97" }}>
//                       {email}
//                     </span>
//                   </p>

//                   {/* OTP Inputs */}
//                   <div className="flex gap-[10px] justify-center">
//                     {otpDigits.map((d, i) => (
//                       <input
//                         key={i}
//                         id={`otp-${i}`}
//                         className="otp-cell font-syne text-center outline-none transition-all duration-[180ms]"
//                         style={{
//                           width: 68,
//                           height: 70,
//                           background: d
//                             ? "rgba(39,174,96,0.05)"
//                             : "rgba(255,255,255,0.03)",
//                           border: d
//                             ? "1.5px solid rgba(39,174,96,0.45)"
//                             : "1.5px solid rgba(255,255,255,0.07)",
//                           borderRadius: 13,
//                           fontSize: 26,
//                           fontWeight: 800,
//                           color: d ? "#6fcf97" : "#e6ffee",
//                         }}
//                         maxLength={1}
//                         value={d}
//                         inputMode="numeric"
//                         onChange={(e) => handleOtpChange(i, e.target.value)}
//                         onKeyDown={(e) => handleOtpKeyDown(i, e)}
//                         onFocus={(e) => {
//                           e.target.select();
//                           e.currentTarget.style.borderColor =
//                             "rgba(39,174,96,0.6)";
//                           e.currentTarget.style.background =
//                             "rgba(39,174,96,0.05)";
//                           e.currentTarget.style.boxShadow =
//                             "0 0 0 3px rgba(39,174,96,0.11)";
//                         }}
//                         onBlur={(e) => {
//                           e.currentTarget.style.boxShadow = "none";
//                           if (!d) {
//                             e.currentTarget.style.borderColor =
//                               "rgba(255,255,255,0.07)";
//                             e.currentTarget.style.background =
//                               "rgba(255,255,255,0.03)";
//                           }
//                         }}
//                       />
//                     ))}
//                   </div>

//                   {/* Resend hint */}
//                   <p
//                     className="text-[12px] text-center mt-3"
//                     style={{ color: "rgba(255,255,255,0.2)" }}
//                   >
//                     Didn't receive it?{" "}
//                     <span
//                       className="cursor-pointer transition-all duration-[180ms] hover:underline"
//                       style={{ color: "#27AE60" }}
//                       onMouseEnter={(e) =>
//                         (e.currentTarget.style.color = "#2ecc71")
//                       }
//                       onMouseLeave={(e) =>
//                         (e.currentTarget.style.color = "#27AE60")
//                       }
//                       onClick={() => {
//                         setOtpDigits(["", "", "", ""]);
//                         handleRequestOtp();
//                       }}
//                     >
//                       Resend code
//                     </span>
//                   </p>

//                   {/* Verify Button */}
//                   <button
//                     className="cmu-btn-inner w-full mt-4 py-[13px] rounded-[12px] border-none text-white font-dmsans text-[14px] font-semibold tracking-[0.04em] cursor-pointer transition-all duration-[180ms] relative overflow-hidden flex items-center justify-center gap-2 disabled:opacity-35 disabled:cursor-not-allowed disabled:shadow-none"
//                     style={{
//                       background: "linear-gradient(135deg, #27AE60, #1d8646)",
//                       boxShadow: "0 4px 20px rgba(39,174,96,0.26)",
//                     }}
//                     onMouseEnter={(e) => {
//                       if (!e.currentTarget.disabled) {
//                         e.currentTarget.style.transform = "translateY(-1px)";
//                         e.currentTarget.style.boxShadow =
//                           "0 6px 28px rgba(39,174,96,0.38)";
//                       }
//                     }}
//                     onMouseLeave={(e) => {
//                       e.currentTarget.style.transform = "translateY(0)";
//                       e.currentTarget.style.boxShadow =
//                         "0 4px 20px rgba(39,174,96,0.26)";
//                     }}
//                     onMouseDown={(e) => {
//                       if (!e.currentTarget.disabled)
//                         e.currentTarget.style.transform = "scale(0.99)";
//                     }}
//                     onMouseUp={(e) => {
//                       e.currentTarget.style.transform = "translateY(-1px)";
//                     }}
//                     onClick={handleVerify}
//                     disabled={otpDigits.join("").length < 4 || loading}
//                   >
//                     {loading ? (
//                       <div
//                         className="cmu-spin-anim w-[15px] h-[15px] rounded-full border-2"
//                         style={{
//                           borderColor: "rgba(255,255,255,0.25)",
//                           borderTopColor: "white",
//                         }}
//                       />
//                     ) : (
//                       <>Verify & Create</>
//                     )}
//                   </button>

//                   {/* Back */}
//                   <button
//                     className="font-dmsans bg-transparent border-none text-[13px] cursor-pointer p-0 flex items-center gap-[5px] mt-3 transition-all duration-[180ms]"
//                     style={{ color: "rgba(255,255,255,0.2)" }}
//                     onMouseEnter={(e) =>
//                       (e.currentTarget.style.color = "rgba(255,255,255,0.55)")
//                     }
//                     onMouseLeave={(e) =>
//                       (e.currentTarget.style.color = "rgba(255,255,255,0.2)")
//                     }
//                     onClick={() => setStep(1)}
//                   >
//                     ← Back
//                   </button>
//                 </>
//               )}
//             </>
//           )}
//         </div>
//       </div>
//     </>
//   );
// }

// export function App() {
//   const [open, setOpen] = useState(true);

//   return (
//     <div
//       className="min-h-screen flex items-center justify-center font-dmsans"
//       style={{
//         background: "linear-gradient(135deg, #030804 0%, #08100a 100%)",
//         fontFamily: "poppins, sans-serif",
//       }}
//     >
//       {!open && (
//         <button
//           className="font-dmsans text-[14px] font-semibold cursor-pointer tracking-[0.04em] text-white border-none rounded-[12px] px-7 py-[13px]"
//           style={{
//             background: "linear-gradient(135deg, #27AE60, #1E8449)",
//             boxShadow: "0 4px 24px rgba(39,174,96,0.32)",
//             fontFamily: "DM Sans, sans-serif",
//           }}
//           onClick={() => setOpen(true)}
//         >
//           + Create User
//         </button>
//       )}
//       {open && <CreateUserModal onClose={() => setOpen(false)} />}
//     </div>
//   );
// }




// frontend/admin-dashboard/src/components/common/CreateUserModal.jsx
import { useState } from "react";
import {
  createRequestOtp,
  createVerifyOtpService,
} from "../../services/authService";
import { toast } from "sonner";

const roles = [
  // {
  //   value: "super_admin",
  //   label: "Super Admin",
  //   icon: "★",
  //   desc: "Full system access",
  // },
  { value: "admin", label: "Admin", icon: "⬡", desc: "Manage users & config" },
  {
    value: "sales_manager",
    label: "Sales Manager",
    icon: "◎",
    desc: "Lead & team oversight",
  },
  {
    value: "sales_agent",
    label: "Sales Agent",
    icon: "◈",
    desc: "Handle sales pipeline",
  },
  { value: "agent", label: "Agent", icon: "⊛", desc: "Support & operations" },
  { value: "user", label: "User", icon: "○", desc: "Basic access only" },
  { value: "accounts", label: "Accounts", icon: "⊙", desc: "Manage accounts" },
];

const PRIMARY      = "#27AE60";
const PRIMARY_DARK = "#1d8646";
const PRIMARY_LIGHT = "#e8f7ee";
const PRIMARY_MID  = "#d1f0df";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');

  .cmu-overlay-anim { animation: overlayIn 0.22s ease; }
  @keyframes overlayIn { from{opacity:0} to{opacity:1} }

  .cmu-card-anim { animation: cardIn 0.28s cubic-bezier(0.34,1.56,0.64,1); }
  @keyframes cardIn {
    from { opacity:0; transform:scale(0.93) translateY(12px); }
    to   { opacity:1; transform:scale(1)    translateY(0);    }
  }

  .cmu-success-anim { animation: fadeUp 0.3s ease; }
  @keyframes fadeUp {
    from { opacity:0; transform:translateY(10px); }
    to   { opacity:1; transform:translateY(0);    }
  }

  .cmu-pop-anim { animation: pop 0.4s cubic-bezier(0.34,1.56,0.64,1) 0.05s both; }
  @keyframes pop {
    from { transform:scale(0); opacity:0; }
    to   { transform:scale(1); opacity:1; }
  }

  .cmu-fill-anim { animation: fill 2.4s linear forwards; width:0%; }
  @keyframes fill { from{width:0%} to{width:100%} }

  .cmu-spin-anim { animation: spin 0.7s linear infinite; }
  @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }

  .cmu-top-line::before {
    content: '';
    position: absolute;
    top: 0; left: 10%; width: 80%; height: 2px;
    background: linear-gradient(90deg, transparent, #27AE60, transparent);
    border-radius: 999px;
  }

  .cmu-scroll::-webkit-scrollbar { width: 4px; }
  .cmu-scroll::-webkit-scrollbar-track { background: transparent; }
  .cmu-scroll::-webkit-scrollbar-thumb { background: rgba(39,174,96,0.2); border-radius: 4px; }

  .otp-cell { caret-color: #27AE60; }
`;

export default function CreateUserModal({ onClose }) {
  const [roleOpen, setRoleOpen]   = useState(false);
  const [step, setStep]           = useState(1);
  const [name, setName]           = useState("");
  const [email, setEmail]         = useState("");
  const [role, setRole]           = useState("super_admin");
  const [otp, setOtp]             = useState("");
  const [success, setSuccess]     = useState(false);
  const [loading, setLoading]     = useState(false);
  const [otpDigits, setOtpDigits] = useState(["", "", "", ""]);

  /* ── API Calls — identical to original ── */
  const handleRequestOtp = async () => {
    try {
      setLoading(true);
      await createRequestOtp(name, email, role);
      setStep(2);
    } catch (err) {
      console.error(err);
      toast.error(`${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (i, val) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otpDigits];
    next[i] = val.slice(-1);
    setOtpDigits(next);
    setOtp(next.join(""));
    if (val && i < 3) document.getElementById(`otp-${i + 1}`)?.focus();
  };

  const handleOtpKeyDown = (i, e) => {
    if (e.key === "Backspace" && !otpDigits[i] && i > 0)
      document.getElementById(`otp-${i - 1}`)?.focus();
  };

  const handleVerify = async () => {
    try {
      setLoading(true);
      await createVerifyOtpService(otp, email, name, role);
      setSuccess(true);
      setTimeout(() => onClose?.(), 2400);
    } catch (err) {
      console.error(err);
      toast.error(`${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const selectedRole = roles.find((r) => r.value === role);

  /* ── Shared input style helpers ── */
  const inputStyle = {
    background: "#f9fafb",
    border: "1.5px solid #e5e7eb",
    color: "#111827",
    borderRadius: 11,
    padding: "11px 14px",
    fontSize: 14,
    width: "100%",
    outline: "none",
    fontFamily: "Poppins, sans-serif",
    transition: "all 0.18s",
    display: "block",
    boxSizing: "border-box",
  };

  const onFocusInput = (e) => {
    e.currentTarget.style.borderColor = PRIMARY;
    e.currentTarget.style.background  = PRIMARY_LIGHT;
    e.currentTarget.style.boxShadow   = "0 0 0 3px rgba(39,174,96,0.12)";
  };
  const onBlurInput = (e) => {
    e.currentTarget.style.borderColor = "#e5e7eb";
    e.currentTarget.style.background  = "#f9fafb";
    e.currentTarget.style.boxShadow   = "none";
  };

  return (
    <>
      <style>{styles}</style>

      <div
        className="cmu-overlay-anim"
        style={{
          position: "fixed",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          padding: 16,
          background: "rgba(220,240,228,0.55)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
        }}
        onClick={(e) => e.target === e.currentTarget && onClose?.()}
      >
        {/* ── Card ── */}
        <div
          className="cmu-card-anim cmu-scroll cmu-top-line"
          style={{
            position: "relative",
            width: "100%",
            maxWidth: 460,
            maxHeight: "calc(100vh - 32px)",
            overflowY: "auto",
            overflowX: "hidden",
            borderRadius: 22,
            padding: "32px 28px 28px",
            background: "#ffffff",
            border: "1px solid rgba(39,174,96,0.18)",
            boxShadow:
              "0 8px 48px rgba(39,174,96,0.10), 0 2px 16px rgba(0,0,0,0.06)",
            fontFamily: "DM Sans, sans-serif",
          }}
        >
          {/* Glow blob */}
          <div
            style={{
              pointerEvents: "none",
              position: "absolute",
              top: -70,
              right: -50,
              width: 200,
              height: 200,
              background:
                "radial-gradient(circle, rgba(39,174,96,0.10) 0%, transparent 70%)",
            }}
          />

          {/* Close button */}
          <button
            style={{
              position: "sticky",
              top: 0,
              float: "right",
              width: 30,
              height: 30,
              marginBottom: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 8,
              fontSize: 12,
              cursor: "pointer",
              background: "#f3f4f6",
              border: "1px solid #e5e7eb",
              color: "#9ca3af",
              transition: "all 0.18s",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background   = "#fee2e2";
              e.currentTarget.style.borderColor  = "#fca5a5";
              e.currentTarget.style.color        = "#ef4444";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background   = "#f3f4f6";
              e.currentTarget.style.borderColor  = "#e5e7eb";
              e.currentTarget.style.color        = "#9ca3af";
            }}
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>

          {/* ── Success State ── */}
          {success ? (
            <div
              className="cmu-success-anim"
              style={{ textAlign: "center", paddingTop: 18, paddingBottom: 6 }}
            >
              <div
                className="cmu-pop-anim"
                style={{
                  width: 78,
                  height: 78,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 18px",
                  fontSize: 32,
                  color: "#fff",
                  background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_DARK})`,
                  boxShadow: `0 0 0 6px ${PRIMARY_MID}, 0 0 40px rgba(39,174,96,0.25)`,
                }}
              >
                ✓
              </div>
              <div
                style={{
                  fontFamily: "Syne, sans-serif",
                  fontSize: 20,
                  fontWeight: 800,
                  marginBottom: 8,
                  color: "#111827",
                }}
              >
                Access Granted
              </div>
              <div style={{ fontSize: 13, lineHeight: 1.7, color: "#6b7280" }}>
                <span style={{ fontWeight: 600, color: "#374151" }}>{name}</span>{" "}
                has been added as{" "}
                <span style={{ fontWeight: 600, color: PRIMARY_DARK }}>
                  {selectedRole?.label || role}
                </span>
              </div>
              <div
                style={{
                  height: 2,
                  borderRadius: 999,
                  overflow: "hidden",
                  marginTop: 24,
                  background: "#e5e7eb",
                }}
              >
                <div
                  className="cmu-fill-anim"
                  style={{
                    height: "100%",
                    background: `linear-gradient(90deg, ${PRIMARY}, #2ecc71)`,
                  }}
                />
              </div>
            </div>
          ) : (
            <>
              {/* Eyebrow */}
              <div
                style={{
                  fontFamily: "Syne, sans-serif",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  marginBottom: 6,
                  color: PRIMARY,
                }}
              >
                {step === 1 ? "User Management" : "Verification"}
              </div>

              {/* Title */}
              <div
                style={{
                  fontFamily: "Poppins, sans-serif",
                  fontSize: 20,
                  fontWeight: 600,
                  marginBottom: 20,
                  lineHeight: 1.3,
                  color: "#111827",
                }}
              >
                {step === 1 ? "Create Credentials" : "Verify Identity"}
              </div>

              {/* Step indicators */}
              <div style={{ display: "flex", gap: 5, marginBottom: 24 }}>
                {[1, 2].map((s) => (
                  <div
                    key={s}
                    style={{
                      height: 3,
                      flex: 1,
                      borderRadius: 999,
                      background: step >= s ? PRIMARY : "#e5e7eb",
                      transition: "all 0.35s",
                    }}
                  />
                ))}
              </div>

              {/* ── Step 1 ── */}
              {step === 1 ? (
                <>
                  {/* Full Name */}
                  <label
                    style={{
                      display: "block",
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      marginBottom: 6,
                      color: "#9ca3af",
                    }}
                  >
                    Full Name
                  </label>
                  <input
                    style={{ ...inputStyle, marginBottom: 12 }}
                    placeholder="e.g. Alex Johnson"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onFocus={onFocusInput}
                    onBlur={onBlurInput}
                  />

                  {/* Email */}
                  <label
                    style={{
                      display: "block",
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      marginBottom: 6,
                      color: "#9ca3af",
                    }}
                  >
                    Email Address
                  </label>
                  <input
                    style={{ ...inputStyle, marginBottom: 12 }}
                    placeholder="alex@company.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={onFocusInput}
                    onBlur={onBlurInput}
                  />

                  {/* Divider */}
                  <div
                    style={{ height: 1, background: "#f3f4f6", margin: "4px 0 16px" }}
                  />

                  {/* Role label */}
                  <span
                    style={{
                      display: "block",
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      marginBottom: 10,
                      color: "#9ca3af",
                    }}
                  >
                    Assign Role
                  </span>

                  {/* Dropdown */}
                  <div style={{ position: "relative", marginBottom: 10 }}>
                    <div
                      style={{
                        width: "100%",
                        borderRadius: 11,
                        padding: "11px 14px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        cursor: "pointer",
                        background: roleOpen ? PRIMARY_LIGHT : "#f9fafb",
                        border: `1.5px solid ${roleOpen ? PRIMARY : "#e5e7eb"}`,
                        color: "#111827",
                        fontSize: 14,
                        fontFamily: "Poppins, sans-serif",
                        transition: "all 0.18s",
                        boxSizing: "border-box",
                        boxShadow: roleOpen
                          ? "0 0 0 3px rgba(39,174,96,0.12)"
                          : "none",
                      }}
                      onClick={() => setRoleOpen(!roleOpen)}
                    >
                      <span>
                        {selectedRole?.icon} {selectedRole?.label}
                      </span>
                      <span style={{ color: "#9ca3af", fontSize: 10 }}>
                        {roleOpen ? "▲" : "▼"}
                      </span>
                    </div>

                    {roleOpen && (
                      <div
                        style={{
                          position: "absolute",
                          top: "110%",
                          left: 0,
                          width: "100%",
                          borderRadius: 12,
                          maxHeight: 220,
                          overflowY: "auto",
                          zIndex: 20,
                          background: "#fff",
                          border: "1.5px solid rgba(39,174,96,0.18)",
                          boxShadow: "0 12px 40px rgba(0,0,0,0.10)",
                        }}
                      >
                        {roles.map((r) => (
                          <div
                            key={r.value}
                            style={{
                              padding: "10px 14px",
                              cursor: "pointer",
                              fontSize: 13,
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              color: r.value === role ? PRIMARY_DARK : "#374151",
                              background:
                                r.value === role ? PRIMARY_LIGHT : "transparent",
                              fontFamily: "DM Sans, sans-serif",
                              transition: "all 0.18s",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = PRIMARY_LIGHT;
                              e.currentTarget.style.color      = PRIMARY_DARK;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background =
                                r.value === role ? PRIMARY_LIGHT : "transparent";
                              e.currentTarget.style.color =
                                r.value === role ? PRIMARY_DARK : "#374151";
                            }}
                            onClick={() => {
                              setRole(r.value);
                              setRoleOpen(false);
                            }}
                          >
                            <span>
                              {r.icon} {r.label}
                            </span>
                            <span style={{ fontSize: 11, color: "#9ca3af" }}>
                              {r.desc}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Send OTP Button */}
                  <button
                    style={{
                      width: "100%",
                      marginTop: 16,
                      padding: "13px 0",
                      borderRadius: 12,
                      border: "none",
                      color: "#fff",
                      fontFamily: "DM Sans, sans-serif",
                      fontSize: 14,
                      fontWeight: 600,
                      letterSpacing: "0.04em",
                      cursor: !name || !email || loading ? "not-allowed" : "pointer",
                      opacity: !name || !email || loading ? 0.35 : 1,
                      background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_DARK})`,
                      boxShadow: "0 4px 20px rgba(39,174,96,0.28)",
                      transition: "all 0.18s",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                    onMouseEnter={(e) => {
                      if (name && email && !loading) {
                        e.currentTarget.style.transform  = "translateY(-1px)";
                        e.currentTarget.style.boxShadow =
                          "0 6px 28px rgba(39,174,96,0.38)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform  = "translateY(0)";
                      e.currentTarget.style.boxShadow =
                        "0 4px 20px rgba(39,174,96,0.28)";
                    }}
                    onMouseDown={(e) => {
                      if (name && email && !loading)
                        e.currentTarget.style.transform = "scale(0.99)";
                    }}
                    onMouseUp={(e) => {
                      e.currentTarget.style.transform = "translateY(-1px)";
                    }}
                    onClick={handleRequestOtp}
                    disabled={!name || !email || loading}
                  >
                    {loading ? (
                      <div
                        className="cmu-spin-anim"
                        style={{
                          width: 15,
                          height: 15,
                          borderRadius: "50%",
                          border: "2px solid rgba(255,255,255,0.25)",
                          borderTopColor: "white",
                        }}
                      />
                    ) : (
                      <>Send OTP →</>
                    )}
                  </button>
                </>
              ) : (
                /* ── Step 2: OTP ── */
                <>
                  <p
                    style={{
                      fontSize: 13,
                      lineHeight: 1.6,
                      marginBottom: 22,
                      color: "#6b7280",
                    }}
                  >
                    We sent a 4-digit code to{" "}
                    <span style={{ fontWeight: 600, color: PRIMARY_DARK }}>
                      {email}
                    </span>
                  </p>

                  {/* OTP Inputs */}
                  <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                    {otpDigits.map((d, i) => (
                      <input
                        key={i}
                        id={`otp-${i}`}
                        className="otp-cell"
                        style={{
                          width: 68,
                          height: 70,
                          background: d ? PRIMARY_LIGHT : "#f9fafb",
                          border: `1.5px solid ${d ? PRIMARY : "#e5e7eb"}`,
                          borderRadius: 13,
                          fontSize: 26,
                          fontWeight: 800,
                          color: d ? PRIMARY_DARK : "#374151",
                          textAlign: "center",
                          outline: "none",
                          fontFamily: "Syne, sans-serif",
                          transition: "all 0.18s",
                        }}
                        maxLength={1}
                        value={d}
                        inputMode="numeric"
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        onFocus={(e) => {
                          e.target.select();
                          e.currentTarget.style.borderColor = PRIMARY;
                          e.currentTarget.style.background  = PRIMARY_LIGHT;
                          e.currentTarget.style.boxShadow   =
                            "0 0 0 3px rgba(39,174,96,0.12)";
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.boxShadow = "none";
                          if (!d) {
                            e.currentTarget.style.borderColor = "#e5e7eb";
                            e.currentTarget.style.background  = "#f9fafb";
                          }
                        }}
                      />
                    ))}
                  </div>

                  {/* Resend hint */}
                  <p
                    style={{
                      fontSize: 12,
                      textAlign: "center",
                      marginTop: 12,
                      color: "#9ca3af",
                    }}
                  >
                    Didn't receive it?{" "}
                    <span
                      style={{ color: PRIMARY, cursor: "pointer", transition: "all 0.18s" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color           = PRIMARY_DARK;
                        e.currentTarget.style.textDecoration  = "underline";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color           = PRIMARY;
                        e.currentTarget.style.textDecoration  = "none";
                      }}
                      onClick={() => {
                        setOtpDigits(["", "", "", ""]);
                        handleRequestOtp();
                      }}
                    >
                      Resend code
                    </span>
                  </p>

                  {/* Verify Button */}
                  <button
                    style={{
                      width: "100%",
                      marginTop: 16,
                      padding: "13px 0",
                      borderRadius: 12,
                      border: "none",
                      color: "#fff",
                      fontFamily: "DM Sans, sans-serif",
                      fontSize: 14,
                      fontWeight: 600,
                      letterSpacing: "0.04em",
                      cursor:
                        otpDigits.join("").length < 4 || loading
                          ? "not-allowed"
                          : "pointer",
                      opacity:
                        otpDigits.join("").length < 4 || loading ? 0.35 : 1,
                      background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_DARK})`,
                      boxShadow: "0 4px 20px rgba(39,174,96,0.28)",
                      transition: "all 0.18s",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                    onMouseEnter={(e) => {
                      if (otpDigits.join("").length >= 4 && !loading) {
                        e.currentTarget.style.transform  = "translateY(-1px)";
                        e.currentTarget.style.boxShadow =
                          "0 6px 28px rgba(39,174,96,0.38)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform  = "translateY(0)";
                      e.currentTarget.style.boxShadow =
                        "0 4px 20px rgba(39,174,96,0.28)";
                    }}
                    onMouseDown={(e) => {
                      if (otpDigits.join("").length >= 4 && !loading)
                        e.currentTarget.style.transform = "scale(0.99)";
                    }}
                    onMouseUp={(e) => {
                      e.currentTarget.style.transform = "translateY(-1px)";
                    }}
                    onClick={handleVerify}
                    disabled={otpDigits.join("").length < 4 || loading}
                  >
                    {loading ? (
                      <div
                        className="cmu-spin-anim"
                        style={{
                          width: 15,
                          height: 15,
                          borderRadius: "50%",
                          border: "2px solid rgba(255,255,255,0.25)",
                          borderTopColor: "white",
                        }}
                      />
                    ) : (
                      <>Verify & Create</>
                    )}
                  </button>

                  {/* Back */}
                  <button
                    style={{
                      background: "transparent",
                      border: "none",
                      fontSize: 13,
                      cursor: "pointer",
                      padding: 0,
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      marginTop: 12,
                      color: "#9ca3af",
                      fontFamily: "DM Sans, sans-serif",
                      transition: "all 0.18s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "#374151")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "#9ca3af")
                    }
                    onClick={() => setStep(1)}
                  >
                    ← Back
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

export function CreateModel() {
  const [open, setOpen] = useState(true);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #f9fafb 100%)",
        fontFamily: "DM Sans, sans-serif",
      }}
    >
      {!open && (
        <button
          style={{
            fontFamily: "DM Sans, sans-serif",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            letterSpacing: "0.04em",
            color: "#fff",
            border: "none",
            borderRadius: 12,
            padding: "13px 28px",
            background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_DARK})`,
            boxShadow: "0 4px 24px rgba(39,174,96,0.32)",
          }}
          onClick={() => setOpen(true)}
        >
          + Create User
        </button>
      )}
      {open && <CreateUserModal onClose={() => setOpen(false)} />}
    </div>
  );
}