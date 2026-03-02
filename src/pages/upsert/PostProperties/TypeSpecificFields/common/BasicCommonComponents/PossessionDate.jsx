
import { forwardRef } from "react";
import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";



const PossessionDate = forwardRef(({error},ref) => {
  const { form, updateFieldValue } = useActivePropertySlice();

  return (
    <div ref={ref} className="space-y-3">
      <p className="text-[13px] font-weight-bold text-[#000000] uppercase font-poppins">
        Possession Date
      </p>
      <div className="relative">
        <input
          type="date"
          value={form.possessionDate || ""}
          onChange={(e) => updateFieldValue("possessionDate", e.target.value)}
          className="w-full p-3 border border-[#27AD75] outline-none rounded-lg text-sm font-weight-bold text-[#000000] appearance-none bg-white"
        />
      </div>
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
});

export default  PossessionDate;
