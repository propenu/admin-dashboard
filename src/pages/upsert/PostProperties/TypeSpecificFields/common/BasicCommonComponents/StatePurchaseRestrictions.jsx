// frontend/admin-dashboard/src/pages/Residential/PostResidentailProperty/TypeSpecificFields/common/BasicCommonComponents/StatePurchaseRestrictions.jsx

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

const RESTRICTION_OPTIONS = [
  "No Restrictions",
  "Local Residents Only",
  "Farmer Only",
  "State Approval Required",
  "Other Restrictions",
];

const StatePurchaseRestrictions = ({error}) => {
  const { form, updateFieldValue } = useActivePropertySlice();

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Outside click close (same pattern everywhere)
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel = form.statePurchaseRestrictions || "No Restrictions";

  return (
    <div className="space-y-2">
      <p className="text-[13px] font-weight-bold uppercase text-[#000000]">
        State Purchase Restrictions
      </p>

      {/* CUSTOM DROPDOWN */}
      <div className="relative" ref={dropdownRef}>
        <div
          onClick={() => setOpen(!open)}
          className="relative w-[200px] cursor-pointer rounded-lg border border-[#27AD75] bg-white px-4 py-3 text-sm font-weight-bold text-[#000000]"
        >
          {selectedLabel}

          <ChevronDown
            size={16}
            className={`absolute right-4 top-1/2 -translate-y-1/2 text-[#000000] transition-transform ${
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
              overflow-y-auto custom-scrollbar1
            "
            style={{ maxHeight: "150px" }}
          >
            {RESTRICTION_OPTIONS.map((opt, idx) => {
              const isSelected = form.statePurchaseRestrictions === opt;
              const isFirst = idx === 0;
              const isLast = idx === RESTRICTION_OPTIONS.length - 1;

              return (
                <div
                  key={opt}
                  onClick={() => {
                    updateFieldValue("statePurchaseRestrictions", opt);
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
                  {opt}
                </div>
              );
            })}
          </div>
        )}
      </div>
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};

export default StatePurchaseRestrictions;
