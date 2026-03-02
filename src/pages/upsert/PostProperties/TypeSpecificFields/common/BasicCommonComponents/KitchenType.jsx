

// // frontend/admin-dashboard/src/pages/Residential/PostResidentailProperty/TypeSpecificFields/common/BasicCommonComponents/KitchenType.jsx
// import { ChevronDown } from "lucide-react";
// import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

// const KITCHEN_OPTS = [
//   { label: "Open", value: "open" },
//   { label: "Closed", value: "closed" },
//   { label: "Semi-Open", value: "semi-open" },
//   { label: "Island", value: "island" },
//   { label: "Parallel", value: "parallel" },
//   { label: "U-Shaped", value: "u-shaped" },
//   { label: "L-Shaped", value: "l-shaped" },
// ];

// const KitchenType = () => {
//   const { form, updateFieldValue } = useActivePropertySlice();

//   const isModular = !!form.isModularKitchen;

//   return (
//     <div className="space-y-3">
//       <p className="text-[13px] font-weight-bold text-[#000000] uppercase font-poppins">
//         Kitchen Type
//       </p>

//       <div className="flex items-center gap-4">
//         {/* Kitchen Select */}
//         <div className="relative flex-1">
//           <select
//             value={form.kitchenType || ""}
//             onChange={(e) => updateFieldValue("kitchenType", e.target.value)}
//             className="w-full p-3 border border-[#27AD75] rounded-lg text-sm font-weight-bold text-[#000000] appearance-none bg-white outline-none"
//           >
//             <option value="">Select</option>
//             {KITCHEN_OPTS.map((opt) => (
//               <option key={opt.value} value={opt.value}>
//                 {opt.label}
//               </option>
//             ))}
//           </select>

//           <ChevronDown
//             size={16}
//             className="absolute right-3 top-3.5 text-gray-400 pointer-events-none"
//           />
//         </div>

//         {/* ✅ Stable Modular Kitchen Toggle */}
//         <div className="flex items-center gap-2 min-w-max">
//           <span className="text-xs font-bold text-[#000000]">
//             Modular Kitchen
//           </span>

//           <button
//             type="button"
//             role="switch"
//             aria-checked={isModular}
//             onClick={() => updateFieldValue("isModularKitchen", !isModular)}
//             className={`relative w-10 h-5 rounded-full transition-colors ${
//               isModular ? "bg-[#27AE60]" : "bg-gray-300"
//             }`}
//           >
//             <span
//               className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
//                 isModular ? "translate-x-5" : ""
//               }`}
//             />
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default KitchenType;


// frontend/admin-dashboard/src/pages/Residential/PostResidentailProperty/TypeSpecificFields/common/BasicCommonComponents/KitchenType.jsx

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

const KITCHEN_OPTS = [
  { label: "Open", value: "open" },
  { label: "Closed", value: "closed" },
  { label: "Semi-Open", value: "semi-open" },
  { label: "Island", value: "island" },
  { label: "Parallel", value: "parallel" },
  { label: "U-Shaped", value: "u-shaped" },
  { label: "L-Shaped", value: "l-shaped" },
];

const KitchenType = ({error}) => {
  const { form, updateFieldValue } = useActivePropertySlice();

  const isModular = !!form.isModularKitchen;

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Outside click close (same pattern)
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel =
    KITCHEN_OPTS.find((o) => o.value === form.kitchenType)?.label ||
    "Select Kitchen Type";

  return (
    <div className="space-y-3">
      <p className="text-[13px] font-weight-bold text-[#000000] uppercase font-poppins">
        Kitchen Type
      </p>

      <div className="flex items-center gap-4">
        {/* CUSTOM DROPDOWN (Facing style) */}
        <div className="relative flex-1 " ref={dropdownRef}>
          <div
            onClick={() => setOpen(!open)}
            className="relative  cursor-pointer rounded-lg border border-[#27AD75] bg-white px-1  py-3 text-sm font-weight-bold text-[#000000]"
          >
            {selectedLabel}

            <ChevronDown
              size={16}
              className={`absolute right-1 top-1/2 -translate-y-1/2 text-[#000000] transition-transform ${
                open ? "rotate-180" : ""
              }`}
            />
          </div>

          {open && (
            <div
              className="
                absolute top-full left-0 mt-2 w-full
                rounded-xl border border-[#27AD75]
                bg-white shadow-lg z-50
                overflow-y-auto custom-scrollbar
              "
              style={{ maxHeight: "150px" }}
            >
              {KITCHEN_OPTS.map((opt, idx) => {
                const isSelected = form.kitchenType === opt.value;
                const isFirst = idx === 0;
                const isLast = idx === KITCHEN_OPTS.length - 1;

                return (
                  <div
                    key={opt.value}
                    onClick={() => {
                      updateFieldValue("kitchenType", opt.value);
                      setOpen(false);
                    }}
                    className={`
                      px-4 py-3 text-sm cursor-pointer
                      text-[#000000]
                      hover:bg-green-100
                      ${isSelected ? "bg-green-100 font-medium" : ""}
                      ${isFirst ? "rounded-t-xl" : ""}
                      ${isLast ? "rounded-b-xl" : ""}
                      ${!isLast ? "border-b border-[#27AD75]" : ""}
                    `}
                  >
                    {opt.label}
                  </div>
                );
              })}
            </div>
          )}
           {error && <div className="text-red-500">{error}</div>}
        </div>

        {/* MODULAR KITCHEN TOGGLE (UNCHANGED) */}
        <div className="flex items-center gap-2 min-w-max">
          <span className="text-xs font-bold text-[#000000]">
            Modular Kitchen
          </span>

          <button
            type="button"
            role="switch"
            aria-checked={isModular}
            onClick={() =>
              updateFieldValue("isModularKitchen", !isModular)
            }
            className={`relative w-10 h-5 rounded-full transition-colors ${
              isModular ? "bg-[#27AE60]" : "bg-gray-300"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                isModular ? "translate-x-5" : ""
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default KitchenType;
