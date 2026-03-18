



// // frontend/admin-dashboard/src/pages/Residential/PostResidentailProperty/TypeSpecificFields/common/BasicCommonComponents/Pantry.jsx

// import { useState, useRef, useEffect } from "react";
// import { ChevronDown } from "lucide-react";
// import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

// const PANTRY_TYPES = [
//   { label: "None", value: "none" },
//   { label: "Shared Pantry", value: "shared" },
//   { label: "Private Pantry", value: "private" },
// ];

// const Pantry = ({error}) => {
//   const { form, updateFieldValue } = useActivePropertySlice();

//   const pantry = form.pantry || {
//     type: "none",
//     insidePremises: true,
//     shared: false,
//   };

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
//     return () =>
//       document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const handleTypeChange = (value) => {
//     updateFieldValue("pantry", {
//       ...pantry,
//       type: value,
//       shared: value === "shared",
//     });
//   };

//   const toggleInsidePremises = () => {
//     updateFieldValue("pantry", {
//       ...pantry,
//       insidePremises: !pantry.insidePremises,
//     });
//   };

//   const selectedLabel =
//     PANTRY_TYPES.find((o) => o.value === pantry.type)?.label ||
//     "Select Pantry";

//   return (
//     <div className="space-y-3">
//       <p className="text-[13px] font-weight-bold text-[#000000] uppercase font-poppins">
//         Pantry
//       </p>

//       <div className="flex items-center gap-4">
//         {/* CUSTOM PANTRY DROPDOWN */}
//         <div className="relative w-[160px]" ref={dropdownRef}>
//           <div
//             onClick={() => setOpen(!open)}
//             className="relative cursor-pointer rounded-lg border border-[#27AD75] bg-white px-4 py-3 text-sm font-weight-bold text-[#000000]"
//           >
//             {selectedLabel}

//             <ChevronDown
//               size={16}
//               className={`absolute right-4 top-1/2 -translate-y-1/2 text-[#000000] transition-transform ${
//                 open ? "rotate-180" : ""
//               }`}
//             />

//           </div>

//           {open && (
//             <div
//               className="
//                 absolute top-full left-0 mt-2 w-full
//                 rounded-xl border border-[#27AD75]
//                 bg-white shadow-lg z-50
//                 overflow-hidden
//               "
//             >
//               {PANTRY_TYPES.map((opt, idx) => {
//                 const isSelected = pantry.type === opt.value;
//                 const isFirst = idx === 0;
//                 const isLast = idx === PANTRY_TYPES.length - 1;

//                 return (
//                   <div
//                     key={opt.value}
//                     onClick={() => {
//                       handleTypeChange(opt.value);
//                       setOpen(false);
//                     }}
//                     className={`
//                       px-4 py-3 text-sm cursor-pointer
//                       text-[#000000]
//                       hover:bg-green-100
//                       ${isSelected ? "bg-green-100 font-medium" : ""}
//                       ${isFirst ? "rounded-t-xl" : ""}
//                       ${isLast ? "rounded-b-xl" : ""}
//                       ${!isLast ? "border-b border-[#27AD75]" : ""}
//                     `}
//                   >
//                     {opt.label}
//                   </div>
//                 );
//               })}
//             </div>
//           )}
//         </div>
//         {error && <span className="text-red-600">{error}</span>}

//         {/* INSIDE PREMISES TOGGLE (UNCHANGED LOGIC) */}
//         <div className="flex items-center gap-2 min-w-max">
//           <span className="text-sm font-weight-bold text-[#000000]">
//             Inside Premises
//           </span>

//           <button
//             type="button"
//             role="switch"
//             aria-checked={pantry.insidePremises}
//             onClick={toggleInsidePremises}
//             className={`relative w-11 h-6 rounded-full transition-colors ${
//               pantry.insidePremises ? "bg-[#27AE60]" : "bg-gray-300"
//             }`}
//           >
//             <span
//               className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
//                 pantry.insidePremises ? "translate-x-5" : ""
//               }`}
//             />
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Pantry;


//ci

// Pantry.jsx
import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

const PANTRY_TYPES = [
  { label: "None", value: "none" },
  { label: "Shared Pantry", value: "shared" },
  { label: "Private Pantry", value: "private" },
];

const Pantry = ({ error }) => {
  const { form, updateFieldValue } = useActivePropertySlice();
  const pantry = form.pantry || { type: "none", insidePremises: true, shared: false };

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTypeChange = (value) => {
    updateFieldValue("pantry", { ...pantry, type: value, shared: value === "shared" });
    setOpen(false);
  };

  const toggleInsidePremises = () => {
    updateFieldValue("pantry", { ...pantry, insidePremises: !pantry.insidePremises });
  };

  const selectedLabel = PANTRY_TYPES.find((o) => o.value === pantry.type)?.label || "Select Pantry";

  return (
    <div className="space-y-3">
      <p className="text-xs font-bold text-[#374151] uppercase tracking-wide">Pantry</p>

      <div className="flex  items-center gap-3   max-sm:flex-wrap">
        {/* Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <div
            onClick={() => setOpen(!open)}
            className={`relative cursor-pointer rounded-xl border-2 bg-white px-4 py-3 text-sm font-semibold min-w-[160px] transition-all duration-150 ${
              error ? "border-red-300" : open ? "border-[#27AE60] ring-2 ring-[#27AE60]/10" : "border-[#e5e7eb] hover:border-[#bbf7d0]"
            } text-[#111827]`}
          >
            {selectedLabel}
            <ChevronDown size={15} className={`absolute right-4 top-1/2 -translate-y-1/2 text-[#9ca3af] transition-transform ${open ? "rotate-180" : ""}`} />
          </div>

          {open && (
            <div className="absolute top-full left-0 mt-2 w-full rounded-xl border border-[#e5e7eb] bg-white shadow-xl z-50 overflow-hidden">
              {PANTRY_TYPES.map((opt) => {
                const isSelected = pantry.type === opt.value;
                return (
                  <div
                    key={opt.value}
                    onClick={() => handleTypeChange(opt.value)}
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

        {/* Inside Premises Toggle */}
        <div className="flex items-center gap-3 px-4 py-3 border-2 border-[#e5e7eb] rounded-xl hover:border-[#bbf7d0] transition-colors">
          <span className="text-sm font-semibold text-[#374151] whitespace-nowrap">Inside Premises</span>
          <button
            type="button"
            role="switch"
            aria-checked={pantry.insidePremises}
            onClick={toggleInsidePremises}
            className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${pantry.insidePremises ? "bg-[#27AE60]" : "bg-[#e5e7eb]"}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${pantry.insidePremises ? "translate-x-5" : ""}`} />
          </button>
        </div>
      </div>

      {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
    </div>
  );
};

export default Pantry;