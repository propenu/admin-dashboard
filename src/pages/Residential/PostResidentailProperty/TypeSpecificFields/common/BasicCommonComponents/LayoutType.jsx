import { Info } from "lucide-react";
import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";
import ColorfulSelect from "./ColorfulSelect";

const LAYOUT_TYPES = [
  { label: "Approved Layout", value: "approved-layout" },
  { label: "Unapproved Layout", value: "unapproved-layout" },
  { label: "Gated Layout", value: "gated-layout" },
  { label: "Individual Plot", value: "individual-plot" },
];

const LayoutType = ({ error }) => {
  const { form, updateFieldValue } = useActivePropertySlice();

  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <p className="text-xs font-bold uppercase tracking-wide text-[#374151]">
          Layout Type
        </p>
        <div className="relative group">
          <Info size={14} className="cursor-pointer text-gray-400" />
          <div className="absolute left-5 top-0 z-50 hidden w-60 rounded-xl bg-gray-800 p-3 text-xs text-white shadow-xl group-hover:block">
            Select the plot layout category, such as approved, unapproved,
            gated, or individual plot
          </div>
        </div>
      </div>
      <ColorfulSelect
        value={form.layoutType || ""}
        options={LAYOUT_TYPES}
        placeholder="Select layout type"
        error={error}
        onChange={(v) => updateFieldValue("layoutType", v)}
      />
    </div>
  );
};

export default LayoutType;
