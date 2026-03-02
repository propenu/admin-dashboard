// frontend/admin-dashboard/src/pages/Residential/PostResidentailProperty/TypeSpecificFields/common/BasicCommonComponents/Currency.jsx

import { useState, useRef, useEffect, forwardRef } from "react";
import { ChevronDown } from "lucide-react";
import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

const CURRENCY = [
  { label: "INR", value: "INR" },
  { label: "USD", value: "USD" },
  { label: "EUR", value: "EUR" },
];

const Currency = forwardRef(({error},ref) => {
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

  const selectedLabel =
    CURRENCY.find((c) => c.value === form.currency)?.label || "Select Currency";

  return (
    <div ref={ref} className="space-y-3">
      <p className="text-[13px] font-weight-bold text-[#000000] uppercase font-poppins">
        Currency
      </p>

      {/* CUSTOM DROPDOWN */}
      <div className="relative" ref={dropdownRef}>
        <div
          onClick={() => setOpen(!open)}
          className="relative cursor-pointer rounded-lg border border-[#27AE60] bg-white px-4 py-3 text-sm font-medium text-[#000000]"
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
              rounded-xl border border-[#27AE60]
              bg-white shadow-lg z-50
              overflow-hidden
            "
          >
            {CURRENCY.map((opt, idx) => {
              const isSelected = form.currency === opt.value;
              const isFirst = idx === 0;
              const isLast = idx === CURRENCY.length - 1;

              return (
                <div
                  key={opt.value}
                  onClick={() => {
                    updateFieldValue("currency", opt.value);
                    setOpen(false);
                  }}
                  className={`
                    px-4 py-3 text-sm cursor-pointer
                    text-[#000000]
                    hover:bg-green-100
                    ${isSelected ? "bg-green-100 font-medium" : ""}
                    ${isFirst ? "rounded-t-xl" : ""}
                    ${isLast ? "rounded-b-xl" : ""}
                    ${!isLast ? "border-b border-[#27AE60]" : ""}
                  `}
                >
                  {opt.label}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {error && <div className="text-red-500">{error}</div>}
    </div>
  );
});

export default Currency;
