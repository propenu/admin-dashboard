import { ChevronDown } from "lucide-react";
import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";
import { forwardRef } from "react";

const CarpetArea = forwardRef(({error},ref) => {
  const { form, updateFieldValue } = useActivePropertySlice();


return (
  <div ref={ref} className="space-y-2">
    <p className="text-[13px] font-poppins font-weight-bold text-[#000000] uppercase font-poppins">
      Carpet Area
    </p>
    <div className="flex border border-[#27AD75] rounded-lg overflow-hidden bg-white">
      <input
        type="number"
        placeholder="0"
        value={form.carpetArea || ""}
        onChange={(e) => updateFieldValue("carpetArea", e.target.value)}
        className="w-full p-3 outline-none placeholder:text-[#524d4d] text-sm font-semibold"
      />
      <div className="flex items-center gap-2 px-4 bg-gray-50 border-l-[1px] m-1 border-[#524d4d] text-[#524d4d] text-xs font-bold">
        sq.ft. <ChevronDown size={14} />
      </div>
    </div>
    {error && <p className="text-red-500 text-xs">{error}</p>}
  </div>
);


});

export default CarpetArea