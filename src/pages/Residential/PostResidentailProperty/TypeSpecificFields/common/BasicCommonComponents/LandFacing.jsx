import { ChevronDown } from "lucide-react";
import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

const FACING_OPTIONS = [
  "North",
  "South",
  "East",
  "West",
  "North-East",
  "North-West",
  "South-East",
  "South-West",
];

const LandFacing = ({ error }) => {
  const { form, updateFieldValue } = useActivePropertySlice();

  return (
    <div className="space-y-2">
      <p className="text-[13px] font-bold uppercase font-poppins">Facing</p>

      <div className="relative">
        <select
          value={form.facing || ""}
          onChange={(e) => updateFieldValue("facing", e.target.value)}
          className="w-full p-3 border border-[#27AD75] rounded-lg appearance-none bg-white"
        >
          <option value="">Select Facing</option>
          {FACING_OPTIONS.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>

        <ChevronDown
          className="absolute right-3 top-3.5 text-gray-400"
          size={16}
        />
      </div>

      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
};

export default LandFacing;
