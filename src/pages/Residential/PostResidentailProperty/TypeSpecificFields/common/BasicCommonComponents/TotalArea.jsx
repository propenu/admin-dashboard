import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

const AREA_UNITS = [
  { label: "sq.ft", value: "sqft" },
  { label: "sq.mt", value: "sqmt" },
  { label: "Acre", value: "acre" },
  { label: "Hectare", value: "hectare" },
  { label: "Gunta", value: "gunta" },
  { label: "Cent", value: "cent" },
];

const TotalArea = ({ error }) => {
  const { form, updateFieldValue } = useActivePropertySlice();
  const totalArea = form.totalArea || { value: "", unit: "sqft" };
  const [open, setOpen] = useState(false);
  const unitRef = useRef(null);
  const unitLabel =
    AREA_UNITS.find((u) => u.value === totalArea.unit)?.label || "sq.ft";

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => {
      if (unitRef.current && !unitRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div className={`relative space-y-2 ${open ? "z-[80]" : "z-10"}`}>
      <p className="text-xs font-bold uppercase tracking-wide text-[#374151]">
        Total Area
      </p>
      <div
        className={`flex overflow-visible rounded-xl border-2 bg-white transition-all ${
          error
            ? "border-red-300"
            : open
              ? "border-[#27AE60] ring-2 ring-[#27AE60]/10"
              : "border-[#e5e7eb] focus-within:border-[#27AE60] focus-within:ring-2 focus-within:ring-[#27AE60]/10"
        }`}
      >
        <input
          type="number"
          placeholder="0"
          value={totalArea.value}
          onChange={(e) =>
            updateFieldValue("totalArea", {
              ...totalArea,
              value: e.target.value,
            })
          }
          className="flex-1 px-4 py-3 text-sm font-semibold text-[#111827] outline-none placeholder:text-[#c9c9c9]"
        />
        <div
          className="relative flex items-center border-l border-[#e5e7eb] bg-[#f9fafb]"
          ref={unitRef}
        >
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-3 text-xs font-bold text-[#6b7280]"
          >
            {unitLabel}
            <ChevronDown
              size={12}
              className={`text-[#9ca3af] transition-transform ${
                open ? "rotate-180 text-[#27AE60]" : ""
              }`}
            />
          </button>
          {open ? (
            <div className="absolute right-0 top-full z-[90] mt-1 min-w-[8.5rem] overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-xl">
              {AREA_UNITS.map((u) => {
                const isSelected = totalArea.unit === u.value;
                return (
                  <button
                    key={u.value}
                    type="button"
                    onClick={() => {
                      updateFieldValue("totalArea", {
                        ...totalArea,
                        unit: u.value,
                      });
                      setOpen(false);
                    }}
                    className={`flex w-full cursor-pointer items-center justify-between border-b border-[#f5f5f5] px-3 py-2.5 text-left text-sm last:border-none hover:bg-[#f0fdf4] ${
                      isSelected
                        ? "bg-[#f0fdf4] font-bold text-[#27AE60]"
                        : "text-[#374151]"
                    }`}
                  >
                    {u.label}
                    {isSelected ? (
                      <span className="h-2 w-2 rounded-full bg-[#27AE60]" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
      {error ? <p className="text-xs font-medium text-red-500">{error}</p> : null}
    </div>
  );
};

export default TotalArea;
