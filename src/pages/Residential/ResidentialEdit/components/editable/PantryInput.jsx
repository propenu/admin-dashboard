// // import React, { useState, useRef, useEffect } from "react";
// // import { ChevronDown, Coffee, Check } from "lucide-react";

// // const PANTRY_TYPES = [
// //   { label: "None", value: "none" },
// //   { label: "Shared Pantry", value: "shared" },
// //   { label: "Private Pantry", value: "private" },
// // ];

// // const PantryInput = ({ data, onChange }) => {
// //   // Ensure we have a default state if data.pantry is undefined
// //   const pantry = data.pantry || {
// //     type: "none",
// //     insidePremises: true,
// //     shared: false,
// //   };

// //   const [open, setOpen] = useState(false);
// //   const dropdownRef = useRef(null);

// //   useEffect(() => {
// //     const handleClickOutside = (e) => {
// //       if (dropdownRef.current && !dropdownRef.current.contains(e.target))
// //         setOpen(false);
// //     };
// //     document.addEventListener("mousedown", handleClickOutside);
// //     return () => document.removeEventListener("mousedown", handleClickOutside);
// //   }, []);

// //   const handleUpdate = (updates) => {
// //     onChange("pantry", { ...pantry, ...updates });
// //   };

// //   const selectedLabel =
// //     PANTRY_TYPES.find((o) => o.value === pantry.type)?.label || "Select Pantry";

// //   return (
// //     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //       {/* Custom Dropdown */}
// //       <div className="space-y-2" ref={dropdownRef}>
// //         <p className="text-[10px] font-black text-slate-400 ml-2 uppercase tracking-wider flex items-center gap-1">
// //           <Coffee className="w-3 h-3" /> Pantry Type
// //         </p>
// //         <div className="relative">
// //           <button
// //             type="button"
// //             onClick={() => setOpen(!open)}
// //             className={`w-full flex items-center justify-between bg-white border-2 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 transition-all ${
// //               open
// //                 ? "border-emerald-500 ring-4 ring-emerald-500/5"
// //                 : "border-transparent shadow-sm"
// //             }`}
// //           >
// //             {selectedLabel}
// //             <ChevronDown
// //               size={16}
// //               className={`text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
// //             />
// //           </button>

// //           {open && (
// //             <div className="absolute top-full left-0 mt-2 w-full rounded-2xl border border-slate-100 bg-white shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
// //               {PANTRY_TYPES.map((opt) => {
// //                 const isSelected = pantry.type === opt.value;
// //                 return (
// //                   <button
// //                     key={opt.value}
// //                     type="button"
// //                     onClick={() => {
// //                       handleUpdate({
// //                         type: opt.value,
// //                         shared: opt.value === "shared",
// //                       });
// //                       setOpen(false);
// //                     }}
// //                     className={`w-full px-5 py-4 text-sm font-bold flex items-center justify-between transition-colors ${
// //                       isSelected
// //                         ? "bg-emerald-50 text-emerald-600"
// //                         : "text-slate-600 hover:bg-slate-50"
// //                     }`}
// //                   >
// //                     {opt.label}
// //                     {isSelected && <Check size={14} />}
// //                   </button>
// //                 );
// //               })}
// //             </div>
// //           )}
// //         </div>
// //       </div>

// //       {/* Inside Premises Toggle */}
// //       <div className="space-y-2">
// //         <p className="text-[10px] font-black text-slate-400 ml-2 uppercase tracking-wider flex items-center gap-1">
// //           Location
// //         </p>
// //         <div className="flex items-center justify-between bg-white shadow-sm border-2 border-transparent rounded-2xl px-5 py-4">
// //           <span className="text-sm font-bold text-slate-700">
// //             Inside Premises
// //           </span>
// //           <button
// //             type="button"
// //             onClick={() =>
// //               handleUpdate({ insidePremises: !pantry.insidePremises })
// //             }
// //             className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
// //               pantry.insidePremises ? "bg-emerald-500" : "bg-slate-200"
// //             }`}
// //           >
// //             <span
// //               className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
// //                 pantry.insidePremises ? "translate-x-5" : ""
// //               }`}
// //             />
// //           </button>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default PantryInput;

// import { useEffect, useRef, useState } from "react";
// import { Coffee, Check } from "lucide-react";
// import { ChevronDown } from "lucide-react";


// const PANTRY_OPTS = [
//   { label: "None", value: "none" },
//   { label: "Shared Pantry", value: "shared" },
//   { label: "No Shared Pantry", value: "no-shared" },
// ];

// export default function PantryInput({ data, onChange }) {
//   const pantry = data.pantry || {
//     type: "none",
//     insidePremises: true,
//     shared: false,
//   };
//   const [open, setOpen] = useState(false);
//   const dropdownRef = useRef(null);

//   useEffect(() => {
//     const handleClick = (e) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(e.target))
//         setOpen(false);
//     };
//     document.addEventListener("mousedown", handleClick);
//     return () => document.removeEventListener("mousedown", handleClick);
//   }, []);

//   const handleUpdate = (updates) =>
//     onChange("pantry", { ...pantry, ...updates });
//   const selectedLabel =
//     PANTRY_OPTS.find((o) => o.value === pantry.type)?.label || "Select Pantry";

//   return (
//     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//       <div className="space-y-1.5" ref={dropdownRef}>
//         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
//           <Coffee className="w-3 h-3" /> Pantry Type
//         </label>
//         <div className="relative">
//           <button
//             type="button"
//             onClick={() => setOpen(!open)}
//             className={`w-full flex items-center justify-between bg-slate-50 border-2 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 transition-all ${open ? "border-[#27AE60]/40 bg-white ring-4 ring-[#27AE60]/8" : "border-transparent"}`}
//           >
//             {selectedLabel}
//             <ChevronDown
//               size={15}
//               className={`text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
//             />
//           </button>
//           {open && (
//             <div className="absolute top-full left-0 mt-1.5 w-full rounded-xl border border-slate-100 bg-white shadow-xl z-50 overflow-hidden py-1">
//               {PANTRY_OPTS.map((opt) => {
//                 const isSel = pantry.type === opt.value;
//                 return (
//                   <button
//                     key={opt.value}
//                     type="button"
//                     onClick={() => {
//                       handleUpdate({
//                         type: opt.value,
//                         shared: opt.value === "shared",
//                       });
//                       setOpen(false);
//                     }}
//                     className={`w-full px-4 py-3 text-sm font-bold flex items-center justify-between transition-colors ${isSel ? "bg-[#27AE60]/8 text-[#1A7A43]" : "text-slate-600 hover:bg-slate-50"}`}
//                   >
//                     {opt.label} {isSel && <Check size={13} />}
//                   </button>
//                 );
//               })}
//             </div>
//           )}
//         </div>
//       </div>

//       <div className="space-y-1.5">
//         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
//           Location
//         </label>
//         <div className="flex items-center justify-between bg-slate-50 border-2 border-transparent rounded-xl px-4 py-3">
//           <span className="text-sm font-bold text-slate-700">
//             Inside Premises
//           </span>
//           <button
//             type="button"
//             onClick={() =>
//               handleUpdate({ insidePremises: !pantry.insidePremises })
//             }
//             className={`relative w-10 h-5 rounded-full transition-colors ${pantry.insidePremises ? "bg-[#27AE60]" : "bg-slate-200"}`}
//           >
//             <span
//               className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${pantry.insidePremises ? "translate-x-5" : ""}`}
//             />
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }



// ── PantryInput ──
import { useEffect as uE, useRef as uR, useState } from "react";
import { Coffee, ChevronDown, Check } from "lucide-react";
const PANTRY = [{ label: "None", value: "none" }, { label: "Shared", value: "shared" }, { label: "Private", value: "private" }];
export default function PantryInput({ data, onChange }) {
  const p = data.pantry || { type: "none", insidePremises: true, shared: false };
  const [open, setOpen] = useState(false);
  const ref = uR(null);
  uE(() => { const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }; document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h); }, []);
  const upd = (u) => onChange("pantry", { ...p, ...u });
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="space-y-1.5" ref={ref}>
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1"><Coffee className="w-3 h-3" /> Pantry Type</label>
        <div className="relative">
          <button type="button" onClick={() => setOpen(!open)} className="w-full flex items-center justify-between bg-slate-50 border-2 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 transition-all" style={{ borderColor: open ? "#27AE60" : "transparent", boxShadow: open ? "0 0 0 4px #27AE6010" : "" }}>
            {PANTRY.find((o) => o.value === p.type)?.label || "Select"}
            <ChevronDown size={15} className={`text-slate-400 transition-transform ${open?"rotate-180":""}`} />
          </button>
          {open && (
            <div className="absolute top-full left-0 mt-1.5 w-full rounded-xl border border-slate-100 bg-white shadow-xl z-50 overflow-hidden py-1" style={{ boxShadow: "0 20px 50px rgba(0,0,0,0.12)" }}>
              {PANTRY.map((opt) => (
                <button key={opt.value} type="button" onClick={() => { upd({ type: opt.value, shared: opt.value==="shared" }); setOpen(false); }}
                  className="w-full px-4 py-3 text-sm font-bold flex items-center justify-between transition-colors hover:bg-[#f0fdf4]"
                  style={{ background: p.type===opt.value ? "#f0fdf4" : "", color: p.type===opt.value ? "#15803d" : "#475569" }}>
                  {opt.label} {p.type===opt.value && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Location</label>
        <div className="flex items-center justify-between bg-slate-50 border-2 border-transparent rounded-xl px-4 py-3">
          <span className="text-sm font-bold text-slate-700">Inside Premises</span>
          <button type="button" onClick={() => upd({ insidePremises: !p.insidePremises })} className="relative w-10 h-5 rounded-full transition-colors shrink-0" style={{ background: p.insidePremises ? "#27AE60" : "#cbd5e1" }}>
            <span className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all" style={{ left: p.insidePremises ? "calc(100% - 18px)" : "2px" }} />
          </button>
        </div>
      </div>
    </div>
  );
}