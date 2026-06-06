
// PriceDetails.jsx
import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

const PriceDetails = ({ errors = {} }) => {
  const { form, updateFieldValue } = useActivePropertySlice();

  const fieldCls = (err) =>
    `flex border-2 rounded-xl overflow-hidden bg-white transition-all ${
      err ? "border-red-300" : "border-[#e5e7eb] focus-within:border-[#27AE60] focus-within:ring-2 focus-within:ring-[#27AE60]/10"
    }`;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Price */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-[#374151] uppercase tracking-wide">Price</p>
        <div className={fieldCls(errors.price)}>
          <div className="flex items-center px-4 bg-[#f9fafb] border-r border-[#e5e7eb] text-[#27AE60] font-bold text-sm">₹</div>
          <input
            type="number"
            placeholder="Expected price"
            value={form.price || ""}
            onChange={(e) => updateFieldValue("price", e.target.value)}
            className="flex-1 px-4 py-3 outline-none text-sm font-semibold placeholder:text-[#c9c9c9] text-[#111827]"
          />
        </div>
        {errors.price && <p className="text-red-500 text-xs font-medium">{errors.price}</p>}
      </div>

      {/* Price per Sqft */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-[#374151] uppercase tracking-wide">Price per sq.ft</p>
        <div className={fieldCls(errors.pricePerSqft)}>
          <div className="flex items-center px-4 bg-[#f9fafb] border-r border-[#e5e7eb] text-[#27AE60] font-bold text-sm">₹</div>
          <input
            type="number"
            placeholder="Price per sqft"
            value={form.pricePerSqft || ""}
            onChange={(e) => updateFieldValue("pricePerSqft", e.target.value)}
            className="flex-1 px-4 py-3 outline-none text-sm font-semibold placeholder:text-[#c9c9c9] text-[#111827]"
          />
        </div>
        {errors.pricePerSqft && <p className="text-red-500 text-xs font-medium">{errors.pricePerSqft}</p>}
      </div>
    </div>
  );
};

export default PriceDetails;