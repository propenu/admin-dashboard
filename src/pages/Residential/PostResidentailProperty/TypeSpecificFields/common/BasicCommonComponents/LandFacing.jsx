// import { ChevronDown } from "lucide-react";
// import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

// const FACING_OPTIONS = [
//   "North",
//   "South",
//   "East",
//   "West",
//   "North-East",
//   "North-West",
//   "South-East",
//   "South-West",
// ];

// const LandFacing = ({ error }) => {
//   const { form, updateFieldValue } = useActivePropertySlice();

//   return (
//     <div className="space-y-2">
//       <p className="text-[13px] font-bold uppercase font-poppins">Facing</p>

//       <div className="relative">
//         <select
//           value={form.facing || ""}
//           onChange={(e) => updateFieldValue("facing", e.target.value)}
//           className="w-full p-3 border border-[#27AD75] rounded-lg appearance-none bg-white"
//         >
//           <option value="">Select Facing</option>
//           {FACING_OPTIONS.map((f) => (
//             <option key={f} value={f}>
//               {f}
//             </option>
//           ))}
//         </select>

//         <ChevronDown
//           className="absolute right-3 top-3.5 text-gray-400"
//           size={16}
//         />
//       </div>

//       {error && <p className="text-red-500 text-xs">{error}</p>}
//     </div>
//   );
// };

// export default LandFacing;



//ci 

// LandFacing.jsx
import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

const FACING_OPTIONS = [
  
  "Corner",
  "Road Fasing",
  "Two Side Open",
  "Three Side Open",
];

const LandFacing = ({ error }) => {
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

  const selected = form.facing || "";

  return (
    <div className="space-y-2">
      <p className="text-xs font-bold text-[#374151] uppercase tracking-wide">Facing</p>
      <div className="relative" ref={dropdownRef}>
        <div
          onClick={() => setOpen(!open)}
          className={`relative cursor-pointer rounded-xl border-2 bg-white px-4 py-3 text-sm font-semibold transition-all duration-150 ${
            error ? "border-red-300" : open ? "border-[#27AE60] ring-2 ring-[#27AE60]/10" : "border-[#e5e7eb] hover:border-[#bbf7d0]"
          } ${selected ? "text-[#111827]" : "text-[#9ca3af]"}`}
        >
          {selected || "Select facing direction"}
          <ChevronDown size={15} className={`absolute right-4 top-1/2 -translate-y-1/2 text-[#9ca3af] transition-transform ${open ? "rotate-180" : ""}`} />
        </div>

        {open && (
          <div className="absolute top-full left-0 mt-2 w-full rounded-xl border border-[#e5e7eb] bg-white shadow-xl z-50 overflow-hidden">
            <div className="max-h-48 overflow-y-auto">
              {FACING_OPTIONS.map((f) => {
                const isSelected = form.facing === f;
                return (
                  <div
                    key={f}
                    onClick={() => { updateFieldValue("", f); setOpen(false); }}
                    className={`px-4 py-3 text-sm cursor-pointer flex items-center justify-between border-b border-[#f5f5f5] last:border-none transition-colors hover:bg-[#f0fdf4] ${isSelected ? "bg-[#f0fdf4] text-[#27AE60] font-bold" : "text-[#374151]"}`}
                  >
                    {f}
                    {isSelected && <div className="w-2 h-2 rounded-full bg-[#27AE60]" />}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
    </div>
  );
};

export default LandFacing;