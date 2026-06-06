
// LandUseZone.jsx
import { Info } from "lucide-react";
import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

const LandUseZone = ({ error }) => {
  const { form, updateFieldValue } = useActivePropertySlice();
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <p className="text-xs font-bold text-[#374151] uppercase tracking-wide">
          Land Use Zone
        </p>

        <div className="relative group">
          <Info size={14} className="text-gray-400 cursor-pointer" />

          <div className="absolute left-5 top-0 hidden group-hover:block w-60 p-3 rounded-xl bg-gray-800 text-white text-xs shadow-xl z-50">
            Zonining classification assigned to the land, such as residential, commercial, agricultural, or mixed use. 
          </div>
        </div>
      </div>
      <input
        type="text"
        value={form.landUseZone || ""}
        onChange={(e) => updateFieldValue("landUseZone", e.target.value)}
        placeholder="e.g. Residential / Commercial / Agricultural"
        className="w-full px-4 py-3 border-2 border-[#e5e7eb] rounded-xl outline-none text-sm font-semibold placeholder:text-[#c9c9c9] text-[#111827] focus:border-[#27AE60] focus:ring-2 focus:ring-[#27AE60]/10 transition-all"
      />
      {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
    </div>
  );
};

export default LandUseZone;