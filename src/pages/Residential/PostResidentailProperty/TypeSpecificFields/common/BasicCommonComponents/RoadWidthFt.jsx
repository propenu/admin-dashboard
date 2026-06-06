

// RoadWidthFt.jsx
import { Info } from "lucide-react";
import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

const RoadWidthFt = ({ error }) => {
  const { form, updateFieldValue } = useActivePropertySlice();

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <p className="text-xs font-bold text-[#374151] uppercase tracking-wide">
          Road Width(ft)
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
          value={form.roadWidthFt || ""}
          onChange={(e) => updateFieldValue("roadWidthFt", e.target.value)}
          className="flex-1 px-4 py-3 outline-none text-sm font-semibold placeholder:text-[#c9c9c9] text-[#111827]"
        />
        <div className="flex items-center px-4 bg-[#f9fafb] border-l border-[#e5e7eb] text-[#9ca3af] text-xs font-bold">
          ft
        </div>
      </div>
      {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
    </div>
  );
};

export default RoadWidthFt;