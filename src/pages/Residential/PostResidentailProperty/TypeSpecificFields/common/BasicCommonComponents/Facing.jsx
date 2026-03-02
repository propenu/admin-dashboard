
// frontend/admin-dashboard/src/pages/Residential/PostResidentailProperty/TypeSpecificFields/common/BasicCommonComponents/Facing.jsx
import { useState, useRef, useEffect, forwardRef } from "react";
import { ChevronDown } from "lucide-react";
import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

const FACING_OPTS = ["East", "West", "North", "South"];

const Facing = forwardRef(({error},ref) => {
  const { form, updateFieldValue } = useActivePropertySlice();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div  className="space-y-3 relative" ref={(node) => {
    dropdownRef.current = node;
    if (typeof ref === "function") {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  }}>
      <p className="text-[13px] font-weight-bold text-[#000000] uppercase font-poppins">
        Facing
      </p>

      {/* INPUT BOX */}
      <div
        onClick={() => setOpen(!open)}
        className="relative w-[200px] cursor-pointer rounded-lg border border-[#27AD75] bg-white px-4 py-3 text-sm font-weight-bold text-[#000000]"
      >
        {form.facing || "Select Facing"}

        <ChevronDown
          size={16}
          className={`absolute right-4 top-1/2 -translate-y-1/2 text-[#000000]  transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </div>
      {error && <div className="text-red-500">{error}</div>}
      {/* DROPDOWN LIST */}
      {open && (
        <div
          className="
      absolute top-full left-0 mt-2
      w-[200px]
      rounded-xl
      border border-[#27EA60]
      bg-white
      shadow-lg
      z-50
      overflow-y-auto custom-scrollbar1
    "
          style={{ maxHeight: "150px" }}
        >
          {FACING_OPTS.map((opt, idx) => {
            const isSelected = form.facing === opt;
            const isFirst = idx === 0;
            const isLast = idx === FACING_OPTS.length - 1;

            return (
              <div
                key={opt}
                onClick={() => {
                  updateFieldValue("facing", opt);
                  setOpen(false);
                }}
                className={`
            px-4 py-3 text-sm cursor-pointer
            text-[#000000]
            hover:bg-green-100
            ${isSelected ? "bg-green-100 font-medium" : ""}
            ${isFirst ? "rounded-t-xl" : ""}
            ${isLast ? "rounded-b-xl" : ""}
            ${!isLast ? "border-b border-[#27EA60]" : ""}
          `}
              >
                {opt}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});

export default Facing;


// ci 

// Facing.jsx
// import { useState, useRef, useEffect, forwardRef } from "react";
// import { ChevronDown } from "lucide-react";
// import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

// const FACING_OPTS = ["East", "West", "North", "South"];

// const Facing = forwardRef(({ error }, ref) => {
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

//   return (
//     <div className="space-y-2 relative" ref={(node) => {
//       dropdownRef.current = node;
//       if (typeof ref === "function") ref(node);
//       else if (ref) ref.current = node;
//     }}>
//       <p className="text-xs font-bold text-[#374151] uppercase tracking-wide">Facing Direction</p>
//       <div
//         onClick={() => setOpen(!open)}
//         className={`relative cursor-pointer rounded-xl border-2 bg-white px-4 py-3 text-sm font-semibold transition-all duration-150 ${
//           error ? "border-red-300" : open ? "border-[#27AE60] ring-2 ring-[#27AE60]/10" : "border-[#e5e7eb] hover:border-[#bbf7d0]"
//         } ${form.facing ? "text-[#111827]" : "text-[#9ca3af]"}`}
//       >
//         {form.facing || "Select direction"}
//         <ChevronDown size={15} className={`absolute right-4 top-1/2 -translate-y-1/2 text-[#9ca3af] transition-transform ${open ? "rotate-180" : ""}`} />
//       </div>
//       {error && <p className="text-red-500 text-xs font-medium">{error}</p>}

//       {open && (
//         <div className="absolute top-full left-0 mt-2 w-full rounded-xl border border-[#e5e7eb] bg-white shadow-xl z-50 overflow-hidden">
//           {FACING_OPTS.map((opt) => {
//             const isSelected = form.facing === opt;
//             return (
//               <div
//                 key={opt}
//                 onClick={() => { updateFieldValue("facing", opt); setOpen(false); }}
//                 className={`px-4 py-3 text-sm cursor-pointer flex items-center justify-between border-b border-[#f5f5f5] last:border-none transition-colors hover:bg-[#f0fdf4] ${isSelected ? "bg-[#f0fdf4] text-[#27AE60] font-bold" : "text-[#374151]"}`}
//               >
//                 {opt}
//                 {isSelected && <div className="w-2 h-2 rounded-full bg-[#27AE60]" />}
//               </div>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// });

// export default Facing;