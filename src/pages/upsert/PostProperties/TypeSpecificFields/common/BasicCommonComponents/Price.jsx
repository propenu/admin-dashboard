import { forwardRef } from "react";
import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";



const Price = forwardRef(({error},ref) => {
  const { form, updateFieldValue } = useActivePropertySlice();

  return (
        <div ref={ref} className="space-y-3">
          <p className="text-[13px] font-weight-bold text-[#000000] uppercase font-poppins">
            Price
          </p>
          <div className="relative">
            <span className="absolute left-3 top-3 text-[#525252] font-weight-bold">
              ₹
            </span>
            <input
              type="number"
              placeholder="Expected Price"
              value={form.price || ""}
              onChange={(e) => updateFieldValue("price", e.target.value)}
              className="w-full p-3 pl-7 border border-[#27AD75] rounded-lg text-sm placeholder:text-[#525252] font-weight-bold text-[#000000] outline-none bg-gray-50/30"
            />
          </div>

          {error && <p className="text-red-500 text-xs">{error}</p>}
        </div>
   
  );
});

export default  Price;
