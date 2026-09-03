import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

const PLOT_AREA_UNITS = [
  { label: "sq.ft", value: "sqft" },
  { label: "sq.mt", value: "sqmt" },
  { label: "sq.yd", value: "sqyd" },
  { label: "Acre", value: "acre" },
  { label: "Guntha", value: "guntha" },
  { label: "Cent", value: "cent" },
  { label: "Kanal", value: "kanal" },
  { label: "Hectare", value: "hectare" },
];

const PlotArea = ({ error }) => {
  const { form, updateFieldValue } = useActivePropertySlice();
  const [open, setOpen] = useState(false);
  const unitRef = useRef(null);
  const unit = form.plotAreaUnit || "sqft";
  const unitLabel =
    PLOT_AREA_UNITS.find((u) => u.value === unit)?.label || "sq.ft";

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
      <p className="text-xs font-bold text-[#374151] uppercase tracking-wide">
        Plot Area
      </p>

      <div
        className={`flex flex-col overflow-visible rounded-xl border-2 bg-white transition-all sm:flex-row ${
          error
            ? "border-red-300"
            : open
              ? "border-[#27AE60] ring-2 ring-[#27AE60]/10"
              : "border-[#e5e7eb] focus-within:border-[#27AE60] focus-within:ring-2 focus-within:ring-[#27AE60]/10"
        }`}
      >
        <input
          type="number"
          min="0"
          step="any"
          inputMode="decimal"
          placeholder="0"
          value={form.plotArea || ""}
          onChange={(e) => updateFieldValue("plotArea", e.target.value)}
          className="min-w-0 flex-1 px-4 py-3 text-sm font-semibold text-[#111827] outline-none placeholder:text-[#c9c9c9]"
        />

        <div
          className="relative w-full border-t border-[#e5e7eb] sm:w-36 sm:border-l sm:border-t-0"
          ref={unitRef}
        >
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex w-full items-center justify-between bg-[#f9fafb] px-4 py-3 text-sm font-semibold text-[#111827]"
          >
            <span>{unitLabel}</span>
            <ChevronDown
              size={14}
              className={`text-[#9ca3af] transition-transform ${open ? "rotate-180 text-[#27AE60]" : ""}`}
            />
          </button>

          {open ? (
            <div className="absolute right-0 top-full z-[90] mt-1 w-full min-w-[9rem] overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-xl">
              <div className="max-h-48 overflow-y-auto">
                {PLOT_AREA_UNITS.map((u) => {
                  const isSelected = unit === u.value;
                  return (
                    <div
                      key={u.value}
                      onClick={() => {
                        updateFieldValue("plotAreaUnit", u.value);
                        setOpen(false);
                      }}
                      className={`flex cursor-pointer items-center justify-between border-b border-[#f5f5f5] px-3 py-2.5 text-sm last:border-none hover:bg-[#f0fdf4] ${
                        isSelected
                          ? "bg-[#f0fdf4] font-bold text-[#27AE60]"
                          : "text-[#374151]"
                      }`}
                    >
                      {u.label}
                      {isSelected ? (
                        <div className="h-2 w-2 rounded-full bg-[#27AE60]" />
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {error ? <p className="text-xs font-medium text-red-500">{error}</p> : null}
    </div>
  );
};

export default PlotArea;
