
// // frontend/admin-dashboard/src/pages/Residential/PostResidentailProperty/TypeSpecificFields/common/BasicCommonComponents/FlooringType.jsx
// import { useState, useRef, useEffect } from "react";
// import { ChevronDown } from "lucide-react";
// import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

// const RESIDENTIAL_FLOORING = [
//   { label: "Vitrified", value: "vitrified" },
//   { label: "Marble", value: "marble" },
//   { label: "Granite", value: "granite" },
//   { label: "Wooden", value: "wooden" },
//   { label: "Ceramic-Tiles", value: "ceramic-tiles" },
//   { label: "Cement", value: "cement" },
//   { label: "Mosaic", value: "mosaic" },
//   { label: "Normal-Tiles", value: "normal-tiles" },
//   { label: "Other", value: "other" },
// ];

// const COMMERCIAL_FLOORING = [
//   { label: "Vitrified-Tiles", value: "vitrified-tiles" },
//   { label: "Ceramic-Tiles", value: "ceramic-tiles" },
//   { label: "Bare-Cement", value: "bare-cement" },
//   { label: "Marble", value: "marble" },
//   { label: "Granite", value: "granite" },
//   { label: "Carpet", value: "carpet" },
//   { label: "Epoxy", value: "epoxy" },
//   { label: "Wooden", value: "wooden" },
// ];

// const FlooringType = ({error}) => {
//   const { form, updateFieldValue, activeCategory } =
//     useActivePropertySlice();

//   const options =
//     activeCategory === "commercial"
//       ? COMMERCIAL_FLOORING
//       : RESIDENTIAL_FLOORING;

//   const [open, setOpen] = useState(false);
//   const dropdownRef = useRef(null);

//   // Close on outside click
//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
//         setOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () =>
//       document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const selectedLabel =
//     options.find((o) => o.value === form.flooringType)?.label ||
//     "Select Flooring Type";

//   return (
//     <div className="space-y-3 relative" ref={dropdownRef}>
//       <p className="text-[13px] font-weight-bold text-[#000000] uppercase font-poppins">
//         Flooring Type
//       </p>

//       {/* INPUT BOX */}
//       <div
//         onClick={() => setOpen(!open)}
//         className="relative cursor-pointer rounded-lg border border-[#27AD75] bg-white px-4 py-3 text-sm font-weight-bold text-[#000000]"
//       >
//         {selectedLabel}

//         <ChevronDown
//           size={16}
//           className={`absolute right-4 top-1/2 -translate-y-1/2 text-[#000000] transition-transform ${
//             open ? "rotate-180" : ""
//           }`}
//         />
//       </div>

//       {/* DROPDOWN LIST (SCROLLABLE) */}
//       {open && (
//         <div
//           className="
//             absolute top-full left-0 mt-2 w-full
//             rounded-xl border border-[#27AD75]
//             bg-white shadow-lg z-50
//             overflow-y-auto custom-scrollbar1
//           "
//           style={{ maxHeight: "150px" }}
//         >
//           {options.map((opt, idx) => {
//             const isSelected = form.flooringType === opt.value;
//             const isFirst = idx === 0;
//             const isLast = idx === options.length - 1;

//             return (
//               <div
//                 key={opt.value}
//                 onClick={() => {
//                   updateFieldValue("flooringType", opt.value);
//                   setOpen(false);
//                 }}
//                 className={`
//                   px-4 py-3 text-sm cursor-pointer
//                   text-[#000000]
//                   hover:bg-green-100
//                   ${isSelected ? "bg-green-100 font-medium" : ""}
//                   ${isFirst ? "rounded-t-xl" : ""}
//                   ${isLast ? "rounded-b-xl" : ""}
//                   ${!isLast ? "border-b border-[#27AD75]" : ""}
//                 `}
//               >
//                 {opt.label}
//               </div>
//             );
//           })}
//         </div>
//       )}

//       {error && <p className="text-red-500">{error}</p>}
//     </div>
//   );
// };

// export default FlooringType;

//ci 

// FlooringType.jsx — updated to match new design system
import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

const RESIDENTIAL_FLOORING = [
  { label: "Vitrified", value: "vitrified" },
  { label: "Marble", value: "marble" },
  { label: "Granite", value: "granite" },
  { label: "Wooden", value: "wooden" },
  { label: "Ceramic Tiles", value: "ceramic-tiles" },
  { label: "Cement", value: "cement" },
  { label: "Mosaic", value: "mosaic" },
  { label: "Normal Tiles", value: "normal-tiles" },
  { label: "Other", value: "other" },
];

const COMMERCIAL_FLOORING = [
  { label: "Vitrified Tiles", value: "vitrified-tiles" },
  { label: "Ceramic Tiles", value: "ceramic-tiles" },
  { label: "Bare Cement", value: "bare-cement" },
  { label: "Marble", value: "marble" },
  { label: "Granite", value: "granite" },
  { label: "Carpet", value: "carpet" },
  { label: "Epoxy", value: "epoxy" },
  { label: "Wooden", value: "wooden" },
];

const FlooringType = ({ error }) => {
  const { form, updateFieldValue, activeCategory } = useActivePropertySlice();
  const options = activeCategory === "commercial" ? COMMERCIAL_FLOORING : RESIDENTIAL_FLOORING;
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel = options.find((o) => o.value === form.flooringType)?.label || "";

  return (
    <div className="space-y-2 relative" ref={dropdownRef}>
      <p className="text-xs font-bold text-[#374151] uppercase tracking-wide">Flooring Type</p>
      <div
        onClick={() => setOpen(!open)}
        className={`relative cursor-pointer rounded-xl border-2 bg-white px-4 py-3 text-sm font-semibold transition-all duration-150 ${
          error ? "border-red-300" : open ? "border-[#27AE60] ring-2 ring-[#27AE60]/10" : "border-[#e5e7eb] hover:border-[#bbf7d0]"
        } ${selectedLabel ? "text-[#111827]" : "text-[#9ca3af]"}`}
      >
        {selectedLabel || "Select flooring type"}
        <ChevronDown size={15} className={`absolute right-4 top-1/2 -translate-y-1/2 text-[#9ca3af] transition-transform ${open ? "rotate-180" : ""}`} />
      </div>
      {error && <p className="text-red-500 text-xs font-medium">{error}</p>}

      {open && (
        <div className="absolute top-full left-0 mt-2 w-full rounded-xl border border-[#e5e7eb] bg-white shadow-xl z-50 overflow-hidden">
          <div className="max-h-48 overflow-y-auto">
            {options.map((opt) => {
              const isSelected = form.flooringType === opt.value;
              return (
                <div
                  key={opt.value}
                  onClick={() => { updateFieldValue("flooringType", opt.value); setOpen(false); }}
                  className={`px-4 py-3 text-sm cursor-pointer flex items-center justify-between border-b border-[#f5f5f5] last:border-none transition-colors hover:bg-[#f0fdf4] ${isSelected ? "bg-[#f0fdf4] text-[#27AE60] font-bold" : "text-[#374151]"}`}
                >
                  {opt.label}
                  {isSelected && <div className="w-2 h-2 rounded-full bg-[#27AE60]" />}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default FlooringType;
