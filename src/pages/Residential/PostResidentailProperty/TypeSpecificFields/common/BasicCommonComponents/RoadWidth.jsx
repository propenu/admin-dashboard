


// RoadWidth.jsx
import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

import { useState} from "react";
import { Info } from "lucide-react";

const ROAD_WIDTH_UNITS = [
  { label: "ft", value: "ft" },
  { label: "m", value: "m" },
];

const RoadWidth = ({ error }) => {
  const { form, updateFieldValue } = useActivePropertySlice();
  const roadWidth = form.roadWidth || { value: "", unit: "ft" };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <p className="text-xs font-bold text-[#374151] uppercase tracking-wide">
          Road Width
        </p>

        <div className="relative group">
          <Info size={14} className="text-gray-400 cursor-pointer" />
          <div className="absolute left-5 top-0 hidden group-hover:block w-60 p-3 rounded-xl bg-gray-800 text-white text-xs shadow-xl z-50">
            Road width is the width of the road in front of the property.
          </div>
        </div>
      </div>

      <div
        className={`flex border-2 rounded-xl overflow-hidden bg-white transition-all ${
          error
            ? "border-red-300"
            : "border-[#e5e7eb] focus-within:border-[#27AE60] focus-within:ring-2 focus-within:ring-[#27AE60]/10"
        }`}
      >
        <input
          type="number"
          placeholder="0"
          value={roadWidth.value}
          onChange={(e) =>
            updateFieldValue("roadWidth", {
              ...roadWidth,
              value: e.target.value,
            })
          }
          className="flex-1 px-4 py-3 outline-none text-sm font-semibold placeholder:text-[#c9c9c9] text-[#111827]"
        />
        <div className="flex border-l border-[#e5e7eb]">
          {ROAD_WIDTH_UNITS.map((u) => (
            <button
              key={u.value}
              type="button"
              onClick={() =>
                updateFieldValue("roadWidth", { ...roadWidth, unit: u.value })
              }
              className={`px-4 py-3 text-xs font-bold transition-colors ${
                roadWidth.unit === u.value
                  ? "bg-[#f0fdf4] text-[#27AE60]"
                  : "bg-[#f9fafb] text-[#000000]"
              }`}
            >
              {u.label}
            </button>
          ))}
        </div>
      </div>
      {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
    </div>
  );
};

export default RoadWidth;