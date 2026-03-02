import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

const PlantationAge = ({ error }) => {
  const { form, updateFieldValue } = useActivePropertySlice();

  return (
    <div className="space-y-2">
      <p className="text-[13px] font-weight-bold uppercase text-[#000000]">
        Plantation Age (Years)
      </p>
      <input
        type="number"
        value={form.plantationAge || ""}
        onChange={(e) => updateFieldValue("plantationAge", e.target.value)}
        placeholder="e.g. 5"
        className="w-full p-3 border border-[#27AD75] rounded-lg text-sm font-weight-bold placeholder:text-[#524d4d] outline-none bg-white"
      />
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
};

export default PlantationAge;
