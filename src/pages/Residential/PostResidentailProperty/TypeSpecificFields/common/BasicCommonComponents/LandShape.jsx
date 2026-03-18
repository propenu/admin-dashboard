// // frontend/admin-dashboard/src/pages/Residential/PostResidentailProperty/TypeSpecificFields/common/BasicCommonComponents/LandShape.jsx

// import { useState, useRef, useEffect } from "react";
// import { ChevronDown } from "lucide-react";
// import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

// const LAND_SHAPES = [
//   { label: "Select Shape", value: "" },
//   { label: "Square", value: "square" },
//   { label: "Rectangle", value: "rectangle" },
//   { label: "Irregular", value: "irregular" },
//   { label: "Triangular", value: "triangular" },
//   { label: "Polygon", value: "polygon" },
// ];

// const LandShape = ({error}) => {
//   const { form, updateFieldValue } = useActivePropertySlice();

//   const [open, setOpen] = useState(false);
//   const dropdownRef = useRef(null);

//   // Outside click close (same pattern everywhere)
//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
//         setOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const selectedLabel =
//     LAND_SHAPES.find((o) => o.value === form.landShape)?.label ||
//     "Select Shape";

//   return (
//     <div className="space-y-2">
//       <p className="text-[13px] font-weight-bold uppercase text-[#000000]">
//         Land Shape
//       </p>

//       {/* CUSTOM DROPDOWN */}
//       <div className="relative" ref={dropdownRef}>
//         <div
//           onClick={() => setOpen(!open)}
//           className="relative cursor-pointer rounded-lg border border-[#27AD75] bg-white px-4 py-3 text-sm font-weight-bold text-[#000000]"
//         >
//           {selectedLabel}

//           <ChevronDown
//             size={16}
//             className={`absolute right-4 top-1/2 -translate-y-1/2 text-[#000000] transition-transform ${
//               open ? "rotate-180" : ""
//             }`}
//           />
//         </div>

//         {open && (
//           <div
//             className="
//               absolute top-full left-0 mt-2 w-full
//               rounded-xl border border-[#27AD75]
//               bg-white shadow-lg z-50
//               overflow-y-auto custom-scrollbar1
//             "
//             style={{maxHeight:"150px"}}
//           >
//             {LAND_SHAPES.map((opt, idx) => {
//               const isSelected = form.landShape === opt.value;
//               const isFirst = idx === 0;
//               const isLast = idx === LAND_SHAPES.length - 1;

//               return (
//                 <div
//                   key={opt.value || "default"}
//                   onClick={() => {
//                     updateFieldValue("landShape", opt.value);
//                     setOpen(false);
//                   }}
//                   className={`
//                     px-4 py-3 text-sm cursor-pointer
//                     text-[#000000]
//                     hover:bg-green-100
//                     ${isSelected ? "bg-green-100 font-medium" : ""}
//                     ${isFirst ? "rounded-t-xl" : ""}
//                     ${isLast ? "rounded-b-xl" : ""}
//                     ${!isLast ? "border-b border-[#27AD75]" : ""}
//                   `}
//                 >
//                   {opt.label}
//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </div>
//       {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
//     </div>
//   );
// };

// export default LandShape;

//ci 

// LandShape.jsx
import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

const LAND_SHAPES = [
  { label: "Square", value: "square" },
  { label: "Rectangle", value: "rectangle" },
  { label: "Irregular", value: "irregular" },
  { label: "Triangular", value: "triangular" },
  { label: "Polygon", value: "polygon" },
];

const LandShape = ({ error }) => {
  const { form, updateFieldValue } = useActivePropertySlice();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel = LAND_SHAPES.find((o) => o.value === form.landShape)?.label || "";

  return (
    <div className="space-y-2">
      <p className="text-xs font-bold text-[#374151] uppercase tracking-wide">Land Shape</p>
      <div className="relative" ref={dropdownRef}>
        <div
          onClick={() => setOpen(!open)}
          className={`relative cursor-pointer rounded-xl border-2 bg-white px-4 py-3 text-sm font-semibold transition-all duration-150 ${
            error ? "border-red-300" : open ? "border-[#27AE60] ring-2 ring-[#27AE60]/10" : "border-[#e5e7eb] hover:border-[#bbf7d0]"
          } ${selectedLabel ? "text-[#111827]" : "text-[#9ca3af]"}`}
        >
          {selectedLabel || "Select land shape"}
          <ChevronDown size={15} className={`absolute right-4 top-1/2 -translate-y-1/2 text-[#9ca3af] transition-transform ${open ? "rotate-180" : ""}`} />
        </div>

        {open && (
          <div className="absolute top-full left-0 mt-2 w-full rounded-xl border border-[#e5e7eb] bg-white shadow-xl z-50 overflow-hidden">
            {LAND_SHAPES.map((opt) => {
              const isSelected = form.landShape === opt.value;
              return (
                <div
                  key={opt.value}
                  onClick={() => { updateFieldValue("landShape", opt.value); setOpen(false); }}
                  className={`px-4 py-3 text-sm cursor-pointer flex items-center justify-between border-b border-[#f5f5f5] last:border-none transition-colors hover:bg-[#f0fdf4] ${isSelected ? "bg-[#f0fdf4] text-[#27AE60] font-bold" : "text-[#374151]"}`}
                >
                  {opt.label}
                  {isSelected && <div className="w-2 h-2 rounded-full bg-[#27AE60]" />}
                </div>
              );
            })}
          </div>
        )}
      </div>
      {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
    </div>
  );
};

export default LandShape;
