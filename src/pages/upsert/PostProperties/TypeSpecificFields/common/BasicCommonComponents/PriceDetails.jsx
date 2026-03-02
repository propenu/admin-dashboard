
import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";



const PriceDetails = ({errors={}}) => {
  const { form, updateFieldValue } = useActivePropertySlice();

  return (
    

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PRICE */}
        <div className="space-y-3">
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

          {errors.price && <p className="text-red-500 text-xs">{errors.price}</p>}
        </div>

        {/* PRICE PER SQFT */}
        <div className="space-y-3">
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
          {errors.pricePerSqft && <p className="text-red-500 text-xs">{errors.pricePerSqft}</p>}
        </div>

      </div>
   
  );
};

export default  PriceDetails;
