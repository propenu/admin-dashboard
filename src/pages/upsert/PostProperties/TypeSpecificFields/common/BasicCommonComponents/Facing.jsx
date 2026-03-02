
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
