import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

const SuitableFor = ({ error }) => {
  const { form, updateFieldValue } = useActivePropertySlice();

  return (
    <div className="space-y-2">
      <p className="text-[13px] font-weight-bold uppercase text-[#000000]">
        Suitable For
      </p>
      <input
        type="text"
        value={form.suitableFor || ""}
        onChange={(e) => updateFieldValue("suitableFor", e.target.value)}
        placeholder="e.g. Farming, Plantation, Farmhouse"
        className="w-full p-3 border border-[#27AD75] rounded-lg text-sm font-weight-bold placeholder:text-[#524d4d] outline-none bg-white"
      />
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
};

export default SuitableFor;
