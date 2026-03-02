 

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


//ci 

// TransactionTypes.jsx
// import { forwardRef } from "react";
// import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

// const TRANSACTION_TYPES = [
//   { label: "New Sale", value: "new-sale" },
//   { label: "Resale", value: "resale" },
// ];

// const TransactionTypes = forwardRef(({ error }, ref) => {
//   const { form, updateFieldValue } = useActivePropertySlice();
//   return (
//     <div ref={ref} className="space-y-2">
//       <p className="text-xs font-bold text-[#374151] uppercase tracking-wide">Transaction Type</p>
//       <div className="flex gap-2 flex-wrap">
//         {TRANSACTION_TYPES.map((opt) => (
//           <button
//             key={opt.value}
//             type="button"
//             onClick={() => updateFieldValue("transactionType", opt.value)}
//             className={`px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all duration-150 ${
//               form.transactionType === opt.value
//                 ? "border-[#27AE60] bg-[#f0fdf4] text-[#27AE60]"
//                 : "border-[#e5e7eb] text-[#6b7280] hover:border-[#bbf7d0] hover:text-[#27AE60]"
//             }`}
//           >
//             {opt.label}
//           </button>
//         ))}
//       </div>
//       {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
//     </div>
//   );
// });

// export default TransactionTypes;