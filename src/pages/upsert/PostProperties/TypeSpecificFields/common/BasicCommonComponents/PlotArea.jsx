import { ChevronDown } from "lucide-react";
import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

const PLOT_AREA_UNITS = [
  { label: "Sq.ft", value: "sqft" },
  
];

const PlotArea = ({ error }) => {
  const { form, updateFieldValue } = useActivePropertySlice();

  return (
    <div className="space-y-2">
      <p className="text-[13px] font-weight-bold text-[#000000] uppercase font-poppins">
        Plot Area
      </p>

      <div className="flex border border-[#27AD75] rounded-lg overflow-hidden bg-white">
        {/* Plot Area Input */}
        <input
          type="number"
          placeholder="0"
          value={form.plotArea || ""}
          onChange={(e) => updateFieldValue("plotArea", e.target.value)}
          className="w-full p-3 outline-none placeholder:text-[#524d4d] text-sm font-weight-bold"
        />

        {/* Unit Selector */}
        <div className="relative min-w-[90px] border-l-[1px] m-1 h-[35px] border-[#27AD75]">
          <select
            value={form.plotAreaUnit || "sqft"}
            onChange={(e) => updateFieldValue("plotAreaUnit", e.target.value)}
            className="w-full h-full px-3 pr-8 text-xs font-weight-bold uppercase appearance-none bg-gray-50 outline-none cursor-pointer"
          >
            {PLOT_AREA_UNITS.map((unit) => (
              <option key={unit.value} className="font-poppins font-weight-bold text-[#000000] border bottom-3 " value={unit.value}>
                {unit.label}
              </option>
            ))}
          </select>

          <ChevronDown
            size={14}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[#524d4d] pointer-events-none"
          />
        </div>
      </div>

      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
};

export default PlotArea;
