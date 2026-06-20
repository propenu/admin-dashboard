// // PlotArea.jsx
// import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

// const PLOT_AREA_UNITS = [
//   { label: "sq.ft", value: "sqft" },
//   { label: "sq.mt", value: "sqmt" },
//   { label: "Acre", value: "acre" },
//   { label: "Hectare", value: "hectare" },
//   { label: "Gunta", value: "gunta" },
//   { label: "Cent", value: "cent" },
// ];

// const PlotArea = ({ error }) => {
//   const { form, updateFieldValue } = useActivePropertySlice();

//   return (
//     <div className="space-y-2">
//       <p className="text-xs font-bold text-[#374151] uppercase tracking-wide">Plot Area</p>
//       <div className={`flex border-2 rounded-xl overflow-hidden bg-white transition-all ${
//         error ? "border-red-300" : "border-[#e5e7eb] focus-within:border-[#27AE60] focus-within:ring-2 focus-within:ring-[#27AE60]/10"
//       }`}>
//         <input
//           type="number"
//           placeholder="0"
//           value={form.plotArea || ""}
//           onChange={(e) => updateFieldValue("plotArea", e.target.value)}
//           className="flex-1 px-4 py-3 outline-none text-sm font-semibold placeholder:text-[#c9c9c9] text-[#111827]"
//         />
//         <div className="flex border-l border-[#e5e7eb]">
//           {PLOT_AREA_UNITS.map((unit) => (
//             <button
//               key={unit.value}
//               type="button"
//               onClick={() => updateFieldValue("plotAreaUnit", unit.value)}
//               className={`px-3 py-3 text-xs font-bold transition-colors border-r border-[#e5e7eb] last:border-none ${
//                 (form.plotAreaUnit || "sqft") === unit.value
//                   ? "bg-[#f0fdf4] text-[#27AE60]"
//                   : "bg-[#f9fafb] text-[#000000] "
//               }`}
//             >
//               {unit.label}
//             </button>
//           ))}
//         </div>
//       </div>
//       {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
//     </div>
//   );
// };

// export default PlotArea;

import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

const PLOT_AREA_UNITS = [
  { label: "sq.ft", value: "sqft" },
  { label: "sq.mt", value: "sqmt" },
  { label: "Acre", value: "acre" },
  { label: "Hectare", value: "hectare" },
  { label: "Gunta", value: "gunta" },
  { label: "Cent", value: "cent" },
];

const PlotArea = ({ error }) => {
  const { form, updateFieldValue } = useActivePropertySlice();

  return (
    <div className="space-y-2">
      <p className="text-xs font-bold text-[#374151] uppercase tracking-wide">
        Plot Area
      </p>

      <div
        className={`flex border-2 rounded-xl overflow-hidden bg-white transition-all ${
          error
            ? "border-red-300"
            : "border-[#e5e7eb] focus-within:border-[#27AE60] focus-within:ring-2 focus-within:ring-[#27AE60]/10"
        }`}
      >
        {/* Plot Area Input */}
        <input
          type="number"
          placeholder="0"
          value={form.plotArea || ""}
          onChange={(e) => updateFieldValue("plotArea", e.target.value)}
          className="flex-1 px-4 py-3 outline-none text-sm font-semibold placeholder:text-[#c9c9c9] text-[#111827]"
        />

        {/* Dropdown */}
        <select
          value={form.plotAreaUnit || "sqft"}
          onChange={(e) => updateFieldValue("plotAreaUnit", e.target.value)}
          className="px-4 py-3 border-l border-[#e5e7eb] bg-[#f9fafb] text-sm font-semibold outline-none cursor-pointer"
        >
          {PLOT_AREA_UNITS.map((unit) => (
            <option key={unit.value} value={unit.value}>
              {unit.label}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
    </div>
  );
};

export default PlotArea;