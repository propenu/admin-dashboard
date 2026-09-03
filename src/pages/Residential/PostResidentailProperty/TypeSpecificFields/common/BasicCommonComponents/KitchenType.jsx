import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";
import ColorfulSelect from "./ColorfulSelect";

const KITCHEN_OPTS = [
  { label: "Open", value: "open" },
  { label: "Closed", value: "closed" },
  { label: "Semi-Open", value: "semi-open" },
  { label: "Island", value: "island" },
  { label: "Parallel", value: "parallel" },
  { label: "U-Shaped", value: "u-shaped" },
  { label: "L-Shaped", value: "l-shaped" },
];

const KitchenType = ({ error }) => {
  const { form, updateFieldValue } = useActivePropertySlice();
  const isModular = !!form.isModularKitchen;

  return (
    <div className="space-y-2">
      <p className="text-xs font-bold text-[#374151]">Kitchen Type</p>
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <ColorfulSelect
            value={form.kitchenType || ""}
            options={KITCHEN_OPTS}
            placeholder="Select kitchen type"
            error={error}
            onChange={(v) => updateFieldValue("kitchenType", v)}
          />
        </div>

        <div className="flex flex-shrink-0 flex-col items-center gap-1.5">
          <span className="text-center text-[10px] font-bold leading-tight text-[#374151]">
            Modular
            <br />
            Kitchen
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={isModular}
            onClick={() => updateFieldValue("isModularKitchen", !isModular)}
            className={`relative h-6 w-11 rounded-full transition-colors duration-200 ${
              isModular ? "bg-[#27AE60]" : "bg-[#e5e7eb]"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                isModular ? "translate-x-5" : ""
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default KitchenType;
