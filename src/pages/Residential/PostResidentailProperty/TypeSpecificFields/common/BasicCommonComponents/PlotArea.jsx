

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

  return (
    <div className="space-y-2">
      <p className="text-xs font-bold text-[#374151] uppercase tracking-wide">
        Plot Area
      </p>

      <div
        className={`flex border-2 rounded-xl overflow-hidden bg-white transition-all ${
          error
            ? "border-red-300"
            : "border-[#e5e7eb] focus-within:border-[#27AE60] focus-within:ring-2 focus-within:ring-[#27AE60]/10"
        }`}
      >
        {/* Plot Area Input */}
        <input
          type="number"
          placeholder="0"
          value={form.plotArea || ""}
          onChange={(e) => updateFieldValue("plotArea", e.target.value)}
          className="flex-1 px-4 py-3 outline-none text-sm font-semibold placeholder:text-[#c9c9c9] text-[#111827]"
        />

        {/* Dropdown */}
        <select
          value={form.plotAreaUnit || "sqft"}
          onChange={(e) => updateFieldValue("plotAreaUnit", e.target.value)}
          className="px-4 py-3 border-l border-[#e5e7eb] bg-[#f9fafb] text-sm font-semibold outline-none cursor-pointer"
        >
          {PLOT_AREA_UNITS.map((unit) => (
            <option key={unit.value} value={unit.value}>
              {unit.label}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
    </div>
  );
};

export default PlotArea;