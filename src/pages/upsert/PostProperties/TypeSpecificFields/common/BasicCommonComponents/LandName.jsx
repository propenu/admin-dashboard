import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

const LandName = ({error}) => {
  const { form, updateFieldValue } = useActivePropertySlice();

  return (
    <div className="space-y-2">
      <p className="text-[13px] font-weight-bold uppercase text-[#000000]">
        Land Name
      </p>
      <input
        type="text"
        value={form.landName || ""}
        onChange={(e) => updateFieldValue("landName", e.target.value)}
        placeholder="e.g. Green Valley Farm"
        className="w-full p-3 border border-[#27AD75] rounded-lg text-sm font-weight-bold placeholder:text-[#524d4d] outline-none bg-white"
      />
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
};

export default LandName;
