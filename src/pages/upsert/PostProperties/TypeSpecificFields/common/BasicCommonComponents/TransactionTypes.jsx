 

import { forwardRef } from "react";
import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

const TRANSACTION_TYPES = [
  { lable: "New-Sale", value: "new-sale" },
  { lable: "Resale", value: "resale" },
];

const TransactionTypes = forwardRef(({error},ref) => {
  const { form, updateFieldValue } = useActivePropertySlice();

  return (
    <div ref={ref} className="flex justify-between md:flex-row gap-8 ">
      <div className="space-y-3">
        <p className="text-[13px] font-weight-bold text-[#000000] uppercase font-poppins">
          Transaction Types
        </p>

        <div className="flex  gap-2">
          {TRANSACTION_TYPES.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => updateFieldValue("transactionType", opt.value)}
              className={`p-3 rounded-lg border text-sm font-weight-bold transition-all ${
                form.transactionType === opt.value
                  ? "border-[#27AE60] bg-[#F1FCF5] text-[#27AE60]"
                  : "border-[#000000] text-[#000000] hover:border-[#000000]"
              }`}
            >
              {opt.lable}
            </button>
          ))}
        </div>
        {error && <div className="text-red-500">{error}</div>}
      </div>
    </div>
  );
});

export default  TransactionTypes
