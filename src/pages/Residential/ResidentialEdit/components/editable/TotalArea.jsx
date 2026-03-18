// // Optimized TotalArea.jsx
// import { ChevronDown } from "lucide-react";

// const AREA_UNITS = [
//   { label: "sq.ft", value: "sqft" },
//   { label: "sq.mt", value: "sqmt" },
//   { label: "Acre", value: "acre" },
//   { label: "Hectare", value: "hectare" },
//   { label: "Gunta", value: "gunta" },
//   { label: "Cent", value: "cent" },
// ];

// const TotalArea = ({ value, onChange, error }) => {
//   // Ensure we have fallback values to prevent "uncontrolled to controlled" input warnings
//   const area = value || { value: "", unit: "sqft" };

//   return (
//     <div className="space-y-2">
//       <p className="text-[10px] font-black text-slate-400 ml-2 uppercase tracking-wider">
//         Total Area
//       </p>
//       <div
//         className={`flex border-2 rounded-2xl overflow-hidden bg-white transition-all ${
//           error
//             ? "border-red-300"
//             : "border-slate-100 focus-within:border-blue-400 shadow-sm"
//         }`}
//       >
//         <input
//           type="number"
//           placeholder="0.00"
//           value={area.value}
//           onChange={(e) => onChange({ ...area, value: e.target.value })}
//           className="flex-1 px-5 py-4 outline-none text-sm font-bold text-slate-700 placeholder:text-slate-300 bg-transparent"
//         />
//         <div className="relative flex items-center border-l border-slate-100 bg-slate-50/50">
//           <select
//             value={area.unit}
//             onChange={(e) => onChange({ ...area, unit: e.target.value })}
//             className="appearance-none px-4 pr-10 py-4 text-xs font-black text-slate-500 bg-transparent outline-none cursor-pointer"
//           >
//             {AREA_UNITS.map((u) => (
//               <option key={u.value} value={u.value}>
//                 {u.label}
//               </option>
//             ))}
//           </select>
//           <ChevronDown
//             size={14}
//             className="absolute right-3 text-slate-400 pointer-events-none"
//           />
//         </div>
//       </div>
//       {error && (
//         <p className="text-red-500 text-[10px] font-bold ml-2 uppercase">
//           {error}
//         </p>
//       )}
//     </div>
//   );
// };

// export default TotalArea;



import { ChevronDown } from "lucide-react";

const AREA_UNITS = [
  { label: "sq.ft", value: "sqft" },
  { label: "sq.mt", value: "sqmt" },
  { label: "Acre", value: "acre" },
  { label: "Hectare", value: "hectare" },
  { label: "Gunta", value: "gunta" },
  { label: "Cent", value: "cent" },
];

export default function TotalArea({ value, onChange, error }) {
  const area = value || { value: "", unit: "sqft" };
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Total Area</label>
      <div className={`flex border-2 rounded-xl overflow-hidden bg-white transition-all shadow-sm ${error ? "border-red-300" : "border-slate-100 focus-within:border-[#27AE60]/30"}`}>
        <input
          type="number"
          placeholder="0.00"
          value={area.value}
          onChange={(e) => onChange({ ...area, value: e.target.value })}
          className="flex-1 px-4 py-3 outline-none text-sm font-bold text-slate-700 placeholder:text-slate-300 bg-transparent"
        />
        <div className="relative flex items-center border-l border-slate-100 bg-slate-50">
          <select
            value={area.unit}
            onChange={(e) => onChange({ ...area, unit: e.target.value })}
            className="appearance-none pl-3 pr-8 py-3 text-xs font-black text-slate-500 bg-transparent outline-none cursor-pointer"
          >
            {AREA_UNITS.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
          </select>
          <ChevronDown size={12} className="absolute right-2.5 text-slate-400 pointer-events-none" />
        </div>
      </div>
      {error && <p className="text-red-500 text-[10px] font-bold ml-1 uppercase">{error}</p>}
    </div>
  );
}