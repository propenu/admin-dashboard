import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

const RoadWidthFt = ({error}) => {
  const { form, updateFieldValue } = useActivePropertySlice();

  return (
    <div className="space-y-2">
      <p className="text-[13px] font-weight-bold text-[#000000] uppercase font-poppins">
        Road Width
      </p>

      <div className="flex border border-[#27AD75] rounded-lg overflow-hidden bg-white">
        {/* Road Width Input */}
        <input
          type="number"
          placeholder="0"
          value={form.roadWidthFt || ""}
          onChange={(e) => updateFieldValue("roadWidthFt", e.target.value)}
          className="w-full p-3 outline-none placeholder:text-[#524d4d] text-sm font-semibold"
        />

        
      </div>
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
};

export default RoadWidthFt;
