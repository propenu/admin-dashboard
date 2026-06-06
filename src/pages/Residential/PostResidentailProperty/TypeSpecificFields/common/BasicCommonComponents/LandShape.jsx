

// // LandShape.jsx
// import { useState, useRef, useEffect } from "react";
// import { ChevronDown } from "lucide-react";
// import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

// const LAND_SHAPES = [
//   { label: "Square", value: "square" },
//   { label: "Rectangle", value: "rectangle" },
//   { label: "Irregular", value: "irregular" },
//   { label: "Triangular", value: "triangular" },
//   { label: "Polygon", value: "polygon" },
// ];

// const LandShape = ({ error }) => {
//   const { form, updateFieldValue } = useActivePropertySlice();
//   const [open, setOpen] = useState(false);
//   const dropdownRef = useRef(null);

//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false);
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const selectedLabel = LAND_SHAPES.find((o) => o.value === form.landShape)?.label || "";

//   return (
//     <div className="space-y-2">
//       <p className="text-xs font-bold text-[#374151] uppercase tracking-wide">Land Shape</p>
//       <div className="relative" ref={dropdownRef}>
//         <div
//           onClick={() => setOpen(!open)}
//           className={`relative cursor-pointer rounded-xl border-2 bg-white px-4 py-3 text-sm font-semibold transition-all duration-150 ${
//             error ? "border-red-300" : open ? "border-[#27AE60] ring-2 ring-[#27AE60]/10" : "border-[#e5e7eb] hover:border-[#bbf7d0]"
//           } ${selectedLabel ? "text-[#111827]" : "text-[#9ca3af]"}`}
//         >
//           {selectedLabel || "Select land shape"}
//           <ChevronDown size={15} className={`absolute right-4 top-1/2 -translate-y-1/2 text-[#9ca3af] transition-transform ${open ? "rotate-180" : ""}`} />
//         </div>

//         {open && (
//           <div className="absolute top-full left-0 mt-2 w-full rounded-xl border border-[#e5e7eb] bg-white shadow-xl z-50 overflow-hidden">
//             {LAND_SHAPES.map((opt) => {
//               const isSelected = form.landShape === opt.value;
//               return (
//                 <div
//                   key={opt.value}
//                   onClick={() => { updateFieldValue("landShape", opt.value); setOpen(false); }}
//                   className={`px-4 py-3 text-sm cursor-pointer flex items-center justify-between border-b border-[#f5f5f5] last:border-none transition-colors hover:bg-[#f0fdf4] ${isSelected ? "bg-[#f0fdf4] text-[#27AE60] font-bold" : "text-[#374151]"}`}
//                 >
//                   {opt.label}
//                   {isSelected && <div className="w-2 h-2 rounded-full bg-[#27AE60]" />}
//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </div>
//       {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
//     </div>
//   );
// };

// export default LandShape;  


import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

const LandShape = ({ error }) => {
  const { form, updateFieldValue } = useActivePropertySlice();

  return (
    <div className="space-y-2">
      <p className="text-xs font-bold text-[#374151] uppercase tracking-wide">
        Land Shape
      </p>

      <input
        type="text"
        placeholder="Enter land shape"
        value={form.landShape || ""}
        onChange={(e) => updateFieldValue("landShape", e.target.value)}
        className={`w-full px-4 py-3 border-2 rounded-xl outline-none text-sm font-semibold placeholder:text-[#c9c9c9] text-[#111827] transition-all ${
          error
            ? "border-red-300"
            : "border-[#e5e7eb] focus:border-[#27AE60] focus:ring-2 focus:ring-[#27AE60]/10"
        }`}
      />

      {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
    </div>
  );
};

export default LandShape;
