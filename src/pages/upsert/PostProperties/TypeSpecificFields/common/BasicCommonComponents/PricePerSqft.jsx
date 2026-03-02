
import { forwardRef } from "react";
import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";



const PricePerSqft = forwardRef(({error},ref) => {
  const { form, updateFieldValue } = useActivePropertySlice();

  return (
    

     
        
        <div ref={ref} className="space-y-3">
          <p className="text-[13px] font-weight-bold text-[#000000] uppercase font-poppins">
            Price per Sqft
          </p>
          <div className="relative">
            <span className="absolute left-3 top-3 text-[#525252] font-weight-bold">
              ₹
            </span>
            <input
              type="number"
              placeholder="Expected Price Per Sqft"
              value={form.pricePerSqft || ""}
              onChange={(e) => updateFieldValue("pricePerSqft", e.target.value)}
              className="w-full p-3 pl-7 border border-[#27AD75] placeholder:text-[#525252] rounded-lg text-sm font-weight-bold text-[#000000] outline-none bg-gray-50/30"
            />
          </div>
          {error && <p className="text-red-500 text-xs">{error}</p>}
        </div>
    
   
  );
});

export default PricePerSqft;
