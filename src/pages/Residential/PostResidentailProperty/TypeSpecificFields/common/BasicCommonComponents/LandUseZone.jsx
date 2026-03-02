import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

const LandUseZone = ({error}) => {
  const { form, updateFieldValue } = useActivePropertySlice();

  return (
    <div className="space-y-3">
      <p className="text-[13px] font-weight-bold text-[#000000] uppercase font-poppins">
        Land Use Zone
      </p>

      <input
        type="text"
        value={form.landUseZone || ""}
        onChange={(e) => updateFieldValue("landUseZone", e.target.value)}
        placeholder="Ex. Residential/Commercial/Agricultural"
        className="w-full font-weight-bold text-sm placeholder:text-[#524d4d] outline-none p-3 border border-[#27AD75] rounded-lg"
      />

      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
};

export default LandUseZone;
