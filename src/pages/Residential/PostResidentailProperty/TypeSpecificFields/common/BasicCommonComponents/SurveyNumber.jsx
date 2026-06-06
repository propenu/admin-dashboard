
// SurveyNumber.jsx
import { Info } from "lucide-react";
import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

const SurveyNumber = ({ error }) => {
  const { form, updateFieldValue } = useActivePropertySlice();

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <p className="text-xs font-bold text-[#374151] uppercase tracking-wide">
          Survey Number
        </p>

        <div className="relative group">
          <Info size={14} className="text-gray-400 cursor-pointer" />

          <div className="absolute left-5 top-0 hidden group-hover:block w-60 p-3 rounded-xl bg-gray-800 text-white text-xs shadow-xl z-50">
            Official survay or plot indentification number recorded in land revenue or registration documents of the property.
          </div>
        </div>
      </div>
      <input
        type="text"
        value={form.surveyNumber || ""}
        onChange={(e) => updateFieldValue("surveyNumber", e.target.value)}
        placeholder="e.g. 123/45A"
        className={`w-full px-4 py-3 border-2 rounded-xl outline-none text-sm font-semibold placeholder:text-[#c9c9c9] text-[#111827] transition-all ${
          error
            ? "border-red-300 focus:ring-2 focus:ring-red-100"
            : "border-[#e5e7eb] focus:border-[#27AE60] focus:ring-2 focus:ring-[#27AE60]/10 hover:border-[#bbf7d0]"
        }`}
      />
      {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
    </div>
  );
};

export default SurveyNumber;