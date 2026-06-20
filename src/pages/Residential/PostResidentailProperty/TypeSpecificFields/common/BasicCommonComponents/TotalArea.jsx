

//TotalArea.jsx
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

  return (
    <div className="space-y-2">
      <p className="text-xs font-bold text-[#374151] uppercase tracking-wide">Total Area</p>
      <div className={`flex border-2 rounded-xl overflow-hidden bg-white transition-all ${error ? "border-red-300" : "border-[#e5e7eb] focus-within:border-[#27AE60] focus-within:ring-2 focus-within:ring-[#27AE60]/10"}`}>
        <input
          type="number"
          placeholder="0"
          value={totalArea.value}
          onChange={(e) => updateFieldValue("totalArea", { ...totalArea, value: e.target.value })}
          className="flex-1 px-4 py-3 outline-none text-sm font-semibold placeholder:text-[#c9c9c9] text-[#111827]"
        />
        <div className="relative flex items-center border-l border-[#e5e7eb] bg-[#f9fafb]">
          <select
            value={totalArea.unit}
            onChange={(e) => updateFieldValue("totalArea", { ...totalArea, unit: e.target.value })}
            className="appearance-none px-4 pr-8 py-3 text-xs font-bold text-[#6b7280] bg-transparent outline-none cursor-pointer"
          >
            {AREA_UNITS.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
          </select>
          <ChevronDown size={12} className="absolute right-2 text-[#9ca3af] pointer-events-none" />
        </div>
      </div>
      {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
    </div>
  );
};

export default TotalArea;
