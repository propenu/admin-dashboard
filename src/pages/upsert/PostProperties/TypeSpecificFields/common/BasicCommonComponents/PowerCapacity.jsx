
import { Power } from "lucide-react";
import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";



const PowerCapacity = ({error}) => {
  const { form, updateFieldValue } = useActivePropertySlice();

  return (
    <div className="space-y-3">
      <p className="text-[13px] font-weight-bold text-[#000000] uppercase font-poppins">
        Power Capacity
      </p>
      <div className="relative">
        <input
          type="number"
          placeholder="e.g. 1000"
          value={form.powerCapacityKw || ""}
          onChange={(e) => updateFieldValue("powerCapacityKw", e.target.value)}
          className="w-full p-3 border border-[#27AD75] placeholder:text-[#524d4d] outline-none rounded-lg text-sm font-weight-bold text-[#000000] appearance-none bg-white"
        />
      </div>
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
};

export default  PowerCapacity;
