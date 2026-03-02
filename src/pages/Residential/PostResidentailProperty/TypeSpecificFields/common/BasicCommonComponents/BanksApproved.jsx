
import { forwardRef } from "react";
import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

const BANK_APPROVED = [
  { label: "HDFC", value: "HDFC" },
  { label: "ICICI", value: "ICICI" },
  { label: "SBI", value: "SBI" },
  { label: "Axis", value: "Axis" },
  { label: "PNB", value: "PNB" },
];

const BanksApproved = forwardRef(({error},ref) => {
  const { form, toggleStringArrayValue } = useActivePropertySlice();

  return (
    <div ref={ref} className="pt-3 space-y-4">
      <p className="text-[13px] font-weight-bold text-[#000000] uppercase font-poppins">
        Banks Approved
      </p>

      <div className="flex flex-wrap gap-3">
        {BANK_APPROVED.map((opt) => {
          const selected = form.banksApproved?.includes(opt.value);

          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggleStringArrayValue("banksApproved", opt.value)}
              className={`px-4 py-2 rounded-lg border text-sm font-weight-bold transition ${
                selected
                  ? "border-[#27AE60] bg-[#F1FCF5] text-[#27AE60]"
                  : "border-[#000000] text-[#000000] "
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {error && <div className="text-red-500">{error}</div>}
    </div>
  );
});

export default  BanksApproved;
