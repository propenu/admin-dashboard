
// import { forwardRef } from "react";
// import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

// const BANK_APPROVED = [
//   { label: "HDFC", value: "HDFC" },
//   { label: "ICICI", value: "ICICI" },
//   { label: "SBI", value: "SBI" },
//   { label: "Axis", value: "Axis" },
//   { label: "PNB", value: "PNB" },
// ];

// const BanksApproved = forwardRef(({error},ref) => {
//   const { form, toggleStringArrayValue } = useActivePropertySlice();

//   return (
//     <div ref={ref} className="pt-3 space-y-4">
//       <p className="text-[13px] font-weight-bold text-[#000000] uppercase font-poppins">
//         Banks Approved
//       </p>

//       <div className="flex flex-wrap gap-3">
//         {BANK_APPROVED.map((opt) => {
//           const selected = form.banksApproved?.includes(opt.value);

//           return (
//             <button
//               key={opt.value}
//               type="button"
//               onClick={() => toggleStringArrayValue("banksApproved", opt.value)}
//               className={`px-4 py-2 rounded-lg border text-sm font-weight-bold transition ${
//                 selected
//                   ? "border-[#27AE60] bg-[#F1FCF5] text-[#27AE60]"
//                   : "border-[#000000] text-[#000000] "
//               }`}
//             >
//               {opt.label}
//             </button>
//           );
//         })}
//       </div>

//       {error && <div className="text-red-500">{error}</div>}
//     </div>
//   );
// });

// export default  BanksApproved;


//ci 

// BanksApproved.jsx
import { forwardRef } from "react";
import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

const BANK_OPTIONS = [
  { label: "HDFC", value: "HDFC" },
  { label: "ICICI", value: "ICICI" },
  { label: "SBI", value: "SBI" },
  { label: "Axis", value: "Axis" },
  { label: "PNB", value: "PNB" },
];

const BanksApproved = forwardRef(({ error }, ref) => {
  const { form, toggleStringArrayValue } = useActivePropertySlice();

  return (
    <div ref={ref} className="space-y-3">
      <p className="text-xs font-bold text-[#374151] uppercase tracking-wide">Banks Approved</p>
      <div className="flex flex-wrap gap-2">
        {BANK_OPTIONS.map((opt) => {
          const isSelected = form.banksApproved?.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggleStringArrayValue("banksApproved", opt.value)}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all duration-150 ${
                isSelected
                  ? "border-[#27AE60] bg-[#f0fdf4] text-[#27AE60]"
                  : "border-[#e5e7eb] text-[#6b7280] hover:border-[#bbf7d0] hover:text-[#27AE60]"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
    </div>
  );
});

export default BanksApproved;