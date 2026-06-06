

// LayoutType.jsx
import { Info } from "lucide-react";
import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";
const LAYOUT_TYPES = [
  { label: "Approved Layout", value: "approved-layout" },
  { label: "Unapproved Layout", value: "unapproved-layout" },
  { label: "Gated Layout", value: "gated-layout" },
  { label: "Individual Plot", value: "individual-plot" },
];

const LayoutType = ({ error }) => {
  const { form, updateFieldValue } = useActivePropertySlice();
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <p className="text-xs font-bold text-[#374151] uppercase tracking-wide">
          Layout Type
        </p>

        <div className="relative group">
          <Info size={14} className="text-gray-400 cursor-pointer" />

          <div className="absolute left-5 top-0 hidden group-hover:block w-60 p-3 rounded-xl bg-gray-800 text-white text-xs shadow-xl z-50">
            select the plot layout gategory, such as approved, un-approved
            gated, or individual plot
          </div>
        </div>
      </div>
      <div className="relative">
        <select
          value={form.layoutType || ""}
          onChange={(e) => updateFieldValue("layoutType", e.target.value)}
          className="w-full px-4 py-3 border-2 border-[#e5e7eb] rounded-xl outline-none text-sm font-semibold text-[#111827] focus:border-[#27AE60] focus:ring-2 focus:ring-[#27AE60]/10 transition-all"
        >
          <option value="">Select layout type</option>

          {LAYOUT_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>
      {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
    </div>
  );
};

export default LayoutType;