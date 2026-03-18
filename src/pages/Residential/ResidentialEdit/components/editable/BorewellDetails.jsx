// // BorewellDetails.jsx (Refactored for consistency)
// const BorewellDetails = ({ data, onChange, errors = {} }) => {
//   // Use the data passed from StepPropertyDetails
//   const borewell = data.borewellDetails || {};

//    const handleLocalUpdate = (field, value) => {
//     onChange("borewellDetails", {
//       ...borewell,
//       [field]: value ? Number(value) : "",
//     });
//   };

//   return (
//     <div className="space-y-6 pt-8 border-t border-slate-200/60">
//       <h3 className="text-slate-700 font-black text-xs uppercase tracking-widest flex items-center gap-2 px-2">
//         <span className="w-2 h-2 rounded-full bg-blue-500" />
//         Borewell Infrastructure
//       </h3>

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         {/* Depth */}
//         <div className="space-y-2">
//           <p className="text-[10px] font-black text-slate-400 ml-2 uppercase tracking-wider">
//             Depth (Meters)
//           </p>
//           <input
//             type="number"
//             value={borewell.depthMeters || ""}
//             placeholder="0"
//             onChange={(e) => handleLocalUpdate("depthMeters", e.target.value)}
//             className="w-full bg-white border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 shadow-sm focus:border-emerald-200 focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none"
//           />
//           {errors.depthMeters && (
//             <p className="text-red-500 text-[10px] font-bold ml-2 uppercase">
//               {errors.depthMeters}
//             </p>
//           )}
//         </div>

//         {/* Yield */}
//         <div className="space-y-2">
//           <p className="text-[10px] font-black text-slate-400 ml-2 uppercase tracking-wider">
//             Yield (LPM)
//           </p>
//           <input
//             type="number"
//             value={borewell.yieldLpm || ""}
//             placeholder="0"
//             onChange={(e) => handleLocalUpdate("yieldLpm", e.target.value)}
//             className="w-full bg-white border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 shadow-sm focus:border-emerald-200 focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none"
//           />
//         </div>

//         {/* Year */}
//         <div className="space-y-2">
//           <p className="text-[10px] font-black text-slate-400 ml-2 uppercase tracking-wider">
//             Drilled Year
//           </p>
//           <input
//             type="number"
//             min="1900"
//             max={new Date().getFullYear()}
//             value={borewell.drilledYear || ""}
//             placeholder="YYYY"
//             onChange={(e) => handleLocalUpdate("drilledYear", e.target.value)}
//             className="w-full bg-white border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 shadow-sm focus:border-emerald-200 focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none"
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BorewellDetails

//ci

// ═══════════════════════════════════════════════════════════
// BorewellDetails.jsx
// ═══════════════════════════════════════════════════════════
// export  function BorewellDetails({ data, onChange }) {
//   const borewell = data.borewellDetails || {};
//   const handleLocalUpdate = (field, value) => {
//     onChange("borewellDetails", { ...borewell, [field]: value ? Number(value) : "" });
//   };
//   return (
//     <div className="col-span-full space-y-4 pt-6 border-t border-slate-200/60">
//       <div className="flex items-center gap-2">
//         <span className="w-2 h-2 rounded-full bg-blue-500" />
//         <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Borewell Infrastructure</h3>
//       </div>
//       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//         {[
//           { label: "Depth (Meters)", field: "depthMeters" },
//           { label: "Yield (LPM)", field: "yieldLpm" },
//           { label: "Drilled Year", field: "drilledYear", placeholder: "YYYY" },
//         ].map(({ label, field, placeholder }) => (
//           <div key={field} className="space-y-1.5">
//             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
//             <input
//               type="number"
//               value={borewell[field] || ""}
//               placeholder={placeholder || "0"}
//               onChange={(e) => handleLocalUpdate(field, e.target.value)}
//               className="w-full bg-white border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:border-[#27AE60]/30 focus:ring-4 focus:ring-[#27AE60]/8 outline-none transition-all shadow-sm"
//             />
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// export default BorewellDetails;

export  function BorewellDetails({ data, onChange }) {
  const bw = data.borewellDetails || {};
  const upd = (f, v) =>
    onChange("borewellDetails", { ...bw, [f]: v ? Number(v) : "" });
  return (
    <div className="col-span-full space-y-4 pt-6 border-t border-slate-200/60">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#27AE60]" />
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Borewell Infrastructure
        </h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Depth (Meters)", field: "depthMeters" },
          { label: "Yield (LPM)", field: "yieldLpm" },
          { label: "Drilled Year", field: "drilledYear", placeholder: "YYYY" },
        ].map(({ label, field, placeholder }) => (
          <div key={field} className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              {label}
            </label>
            <input
              type="number"
              value={bw[field] || ""}
              placeholder={placeholder || "0"}
              onChange={(e) => upd(field, e.target.value)}
              className="w-full bg-white border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:border-[#27AE60]/30 focus:ring-4 focus:ring-[#27AE60]/8 outline-none transition-all"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
export default BorewellDetails;