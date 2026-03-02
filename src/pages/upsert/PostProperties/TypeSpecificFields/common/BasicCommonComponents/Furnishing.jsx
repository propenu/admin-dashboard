
import { forwardRef } from "react";
import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

const FURNISHING_OPTS = [
  { label: "Unfurnished", value: "unfurnished" },
  { label: "Semi Furnished", value: "semi-furnished" },
  { label: "Fully Furnished", value: "fully-furnished" },
];


const Furnishing = forwardRef(({error},ref) => {
  const { form, updateFieldValue } = useActivePropertySlice();

  return (
    <div ref={ref} className="space-y-3">
      <p className="text-[13px] font-weight-bold text-[#000000] uppercase font-poppins">
        Furnishing
      </p>

      <div className="flex  gap-2">
        {FURNISHING_OPTS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => updateFieldValue("furnishing", opt.value)}
            className={`p-3 rounded-lg border text-sm font-weight-bold transition-all ${
              form.furnishing === opt.value
                ? "border-[#27AE60] bg-[#F1FCF5] text-[#27AE60]"
                : "border-[#000000] text-[#000000] hover:border-[#000000]"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {error && <div className="text-red-500">{error}</div>}
    </div>
  );
});

export default Furnishing;
