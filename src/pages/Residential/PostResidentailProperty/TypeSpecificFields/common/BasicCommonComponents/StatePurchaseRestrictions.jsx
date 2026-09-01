import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

const RESTRICTION_OPTIONS = ["Applicable", "Not Applicable"];

const StatePurchaseRestrictions = ({ error }) => {
  const { form, updateFieldValue } = useActivePropertySlice();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const selected = form.statePurchaseRestrictions || "";

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (event) => {
      if (!dropdownRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div className="space-y-2">
      <p className="text-xs font-bold uppercase tracking-wide text-[#374151]">
        State Purchase Restrictions
      </p>
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={`flex w-full items-center justify-between rounded-xl border-2 bg-white px-4 py-3 text-left text-sm font-semibold transition ${
            error
              ? "border-red-300"
              : open
                ? "border-[#27AE60] ring-2 ring-[#27AE60]/10"
                : "border-[#e5e7eb] hover:border-[#bbf7d0]"
          } ${selected ? "text-[#111827]" : "text-[#9ca3af]"}`}
        >
          <span>{selected || "Select Applicable / Not Applicable"}</span>
          <ChevronDown
            size={15}
            className={`shrink-0 text-[#9ca3af] transition-transform ${
              open ? "rotate-180 text-[#27AE60]" : ""
            }`}
          />
        </button>

        {open ? (
          <div className="absolute left-0 top-[calc(100%+6px)] z-50 w-full overflow-hidden rounded-xl border border-[#d9ebe0] bg-white p-1.5 shadow-xl">
            {RESTRICTION_OPTIONS.map((opt) => {
              const isSelected = selected === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    updateFieldValue("statePurchaseRestrictions", opt);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition ${
                    isSelected
                      ? "bg-[#27AE60] text-white"
                      : "text-[#374151] hover:bg-[#f0fdf4] hover:text-[#27AE60]"
                  }`}
                >
                  <span>{opt}</span>
                  {isSelected ? <Check size={15} /> : null}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
      {error ? <p className="text-xs font-medium text-red-500">{error}</p> : null}
    </div>
  );
};

export default StatePurchaseRestrictions;
