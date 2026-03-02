import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

const IsPriceNegotiable = () => {
  const { form, updateFieldValue } = useActivePropertySlice();

  const isNegotiable = !!form.isPriceNegotiable;

  return (
    <div className="pt-6 ">
      <div className="flex items-center justify-between h-[52px] px-4 border border-gray-200 rounded-lg">
        <span className="text-sm font-semibold text-[#000000]">
          Price Negotiable
        </span>

        {/* ✅ Stable Toggle Button */}
        <button
          type="button"
          role="switch"
          aria-checked={isNegotiable}
          onClick={() => updateFieldValue("isPriceNegotiable", !isNegotiable)}
          className={`relative w-11 h-6 rounded-full transition-colors ${
            isNegotiable ? "bg-[#27AE60]" : "bg-gray-300"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
              isNegotiable ? "translate-x-5" : ""
            }`}
          />
        </button>
      </div>
    </div>
  );
};

export default IsPriceNegotiable;
