import { forwardRef } from "react";
import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

const FURNISHING_OPTS = [
  { label: "Unfurnished", value: "unfurnished" },
  { label: "Semi Furnished", value: "semi-furnished" },
  { label: "Fully Furnished", value: "fully-furnished" },
];

const FurnishedStatus = forwardRef(({ error }, ref) => {
  const { form, updateFieldValue } = useActivePropertySlice();
  return (
    <div ref={ref} className="space-y-2">
      <p className="text-xs font-bold text-[#374151] uppercase tracking-wide">
        Furnished Status
      </p>
      <div className="flex flex-wrap gap-2">
        {FURNISHING_OPTS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => updateFieldValue("furnishedStatus", opt.value)}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all duration-150 ${
              form?.furnishedStatus === opt.value
                ? "border-[#27AE60] bg-[#f0fdf4] text-[#27AE60]"
                : "border-[#e5e7eb] text-[#6b7280] hover:border-[#bbf7d0] hover:text-[#27AE60]"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
    </div>
  );
});

export default FurnishedStatus;