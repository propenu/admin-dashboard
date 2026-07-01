

// PricePerSqft.jsx
import { forwardRef } from "react";
import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

const PricePerSqft = forwardRef(({ error }, ref) => {
  const { form, updateFieldValue } = useActivePropertySlice();
  const getFormulaText = () => {
    switch (form.propertyCategory) {
      case "residential":
      case "commercial":
        return "Automatically calculated from Price ÷ Carpet Area";

      case "land":
        return "Automatically calculated from Price ÷ Plot Area converted to sq.ft";

      case "agricultural":
        return "Automatically calculated from Price ÷ Total Area";

      default:
        return "";
    }
  };
  return (
    <div ref={ref} className="space-y-2">
      <p className="text-xs font-bold text-[#374151] uppercase tracking-wide">
        Price per sq.ft
      </p>
      <div
        className={`flex border-2 rounded-xl overflow-hidden bg-white transition-all ${error ? "border-red-300" : "border-[#e5e7eb]  focus-within:ring-2 focus-within:ring-[#27AE60]/10"}`}
      >
        <div className="flex items-center px-4 bg-[#f9fafb] border-r border-[#e5e7eb] text-[#27AE60] font-bold text-sm">
          ₹
        </div>
        {/* <input
          type="number"
          placeholder="Auto calculated"
          readOnly
          value={form.pricePerSqft || ""}
          onChange={(e) => updateFieldValue("pricePerSqft", e.target.value)}
          className="flex-1 px-2 py-3 outline-none text-sm font-semibold placeholder:text-[#c9c9c9] text-[#111827] hover:cursor-not-allowed hover:border-none"
        /> */}
        <input
          type="text"
          placeholder="Auto calculated"
          readOnly
          value={
            form.pricePerSqft
              ? Number(form.pricePerSqft).toLocaleString("en-IN")
              : ""
          }
          className="flex-1 px-2 py-3 outline-none text-sm font-semibold bg-gray-50 text-[#111827] cursor-not-allowed"
        />
      </div>
      <p className="text-[10px] text-gray-500">{getFormulaText()}</p>

      {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
    </div>
  );
});

export default PricePerSqft;
