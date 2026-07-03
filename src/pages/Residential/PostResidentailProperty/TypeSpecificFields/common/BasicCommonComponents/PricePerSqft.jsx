import { forwardRef } from "react";
import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

const PricePerSqft = forwardRef(({ error }, ref) => {
  const { form, updateFieldValue } = useActivePropertySlice();
  const isAreaBased =
    form.propertyCategory === "residential" ||
    form.propertyCategory === "commercial";
  const calculationBasis =
    form.priceCalculationBasis === "builtUpArea"
      ? "builtUpArea"
      : "carpetArea";

  const getFormulaText = () => {
    switch (form.propertyCategory) {
      case "residential":
      case "commercial":
        return `Automatically calculated from Price ÷ ${
          calculationBasis === "builtUpArea" ? "Built-up Area" : "Carpet Area"
        }`;
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
      {isAreaBased && (
        <div>
          <p className="mb-2 text-[10px] font-semibold text-gray-500">
            Calculate using
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: "carpetArea", label: "Carpet Area" },
              { value: "builtUpArea", label: "Built-up Area" },
            ].map((option) => {
              const active = calculationBasis === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() =>
                    updateFieldValue("priceCalculationBasis", option.value)
                  }
                  className={`rounded-lg border-2 px-3 py-2 text-xs font-bold transition ${
                    active
                      ? "border-[#27AE60] bg-emerald-50 text-emerald-700"
                      : "border-gray-200 bg-white text-gray-600 hover:border-emerald-200"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
      <div
        className={`flex overflow-hidden rounded-xl border-2 bg-white transition-all ${
          error
            ? "border-red-300"
            : "border-[#e5e7eb] focus-within:ring-2 focus-within:ring-[#27AE60]/10"
        }`}
      >
        <div className="flex items-center border-r border-[#e5e7eb] bg-[#f9fafb] px-4 text-sm font-bold text-[#27AE60]">
          ₹
        </div>
        <input
          type="text"
          placeholder="Auto calculated"
          readOnly
          value={
            form.pricePerSqft
              ? Number(form.pricePerSqft).toLocaleString("en-IN")
              : ""
          }
          className="flex-1 cursor-not-allowed bg-gray-50 px-2 py-3 text-sm font-semibold text-[#111827] outline-none"
        />
      </div>
      <p className="text-[10px] text-gray-500">{getFormulaText()}</p>
      {error && <p className="text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
});

PricePerSqft.displayName = "PricePerSqft";

export default PricePerSqft;
