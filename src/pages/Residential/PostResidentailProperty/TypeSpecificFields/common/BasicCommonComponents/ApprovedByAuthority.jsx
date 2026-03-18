// import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

// const AUTHORITY_OPTIONS = [
//   "HMDA",
//   "GHMC",
//   "DTCP",
//   "RERA",
//   "CMDA",
//   "BDA",
//   "Panchayat",
// ];

// const ApprovedByAuthority = ({error}) => {
//   const { form, updateFieldValue } = useActivePropertySlice();

//   const selected = Array.isArray(form.approvedByAuthority)
//     ? form.approvedByAuthority
//     : [];

//   const toggleAuthority = (value) => {
//     const updated = selected.includes(value)
//       ? selected.filter((v) => v !== value)
//       : [...selected, value];

//     updateFieldValue("approvedByAuthority", updated);
//   };

//   return (
//     <div className="pt-6 border-t space-y-4">
//       <p className="text-[13px] font-weight-bold text-[#000000] uppercase font-poppins">
//         Approved By Authority
//       </p>

//       <div className="flex flex-wrap gap-3">
//         {AUTHORITY_OPTIONS.map((opt) => {
//           const isActive = selected.includes(opt);

//           return (
//             <button
//               key={opt}
//               type="button"
//               onClick={() => toggleAuthority(opt)}
//               className={`px-4 py-2 rounded-lg border text-sm font-weight-bold transition-all ${
//                 isActive
//                   ? "border-[#27AE60] bg-[#F1FCF5] text-[#27AE60]"
//                   : "border-[#000000] text-[#000000] hover:border-[#000000]"
//               }`}
//             >
//               {opt}
//             </button>
//           );
//         })}
//       </div>

//       {error && <div className="text-red-500">{error}</div>}
//     </div>
//   );
// };

// export default ApprovedByAuthority;


//ci 

// ApprovedByAuthority.jsx
import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

const AUTHORITY_OPTIONS = ["HMDA", "GHMC", "DTCP", "RERA", "CMDA", "BDA", "Panchayat"];

const ApprovedByAuthority = ({ error }) => {
  const { form, updateFieldValue } = useActivePropertySlice();
  const selected = Array.isArray(form.approvedByAuthority) ? form.approvedByAuthority : [];

  const toggle = (value) => {
    updateFieldValue(
      "approvedByAuthority",
      selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]
    );
  };

  return (
    <div className="space-y-3">
      <p className="text-xs font-bold text-[#374151] uppercase tracking-wide">Approved By Authority</p>
      <div className="flex flex-wrap gap-2">
        {AUTHORITY_OPTIONS.map((opt) => {
          const isActive = selected.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all duration-150 ${
                isActive
                  ? "border-[#27AE60] bg-[#f0fdf4] text-[#27AE60]"
                  : "border-[#e5e7eb] text-[#6b7280] hover:border-[#bbf7d0] hover:text-[#27AE60]"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
    </div>
  );
};

export default ApprovedByAuthority;