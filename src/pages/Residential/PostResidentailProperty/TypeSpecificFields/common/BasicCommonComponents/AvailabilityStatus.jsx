import { ChevronDown } from "lucide-react";
import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";


const AVAILABILITY_OPTS = [
  { label: "Ready to move", value: "ready-to-move" },
  { label: "Under construction", value: "under-construction" },
];
const AvailabilityStatus = ({error}) => {
  const { form, updateFieldValue } = useActivePropertySlice();

  return (
    <div >
      <div className="space-y-3">
        <p className="text-[13px]  font-weight-bold text-[#000000] uppercase font-poppins">
          Availability Status
        </p>
        <div className="flex gap-2">
          {AVAILABILITY_OPTS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => updateFieldValue("constructionStatus", opt.value)}
              className={`w-full flex-1 py-3 rounded-lg border text-[13px] t font-weight-bold transition-all ${
                form.constructionStatus === opt.value
                  ? "border-[#27AE60] bg-[#F1FCF5] text-[#27AE60]"
                  : "border-[#000000] text-[#000000] "
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      {error && <div className="text-red-500">{error}</div>}
    </div>
  );
};

export default AvailabilityStatus;  



// AvailabilityStatus.jsx
// import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

// const AVAILABILITY_OPTS = [
//   { label: "Ready to Move", value: "ready-to-move" },
//   { label: "Under Construction", value: "under-construction" },
// ];

// const AvailabilityStatus = ({ error }) => {
//   const { form, updateFieldValue } = useActivePropertySlice();
//   return (
//     <div className="space-y-2">
//       <p className="text-xs font-bold text-[#374151] uppercase tracking-wide">Availability Status</p>
//       <div className="flex flex-wrap gap-2">
//         {AVAILABILITY_OPTS.map((opt) => (
//           <button
//             key={opt.value}
//             type="button"
//             onClick={() => updateFieldValue("constructionStatus", opt.value)}
//             className={`flex-1 py-2.5 px-3 rounded-xl border-2 text-xs font-bold text-center transition-all duration-150 ${
//               form.constructionStatus === opt.value
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
// };

// export default AvailabilityStatus;
