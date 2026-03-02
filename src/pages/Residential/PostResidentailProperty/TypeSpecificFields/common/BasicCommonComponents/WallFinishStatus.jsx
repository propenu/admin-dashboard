
import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

const WALL_FINISH_STATUS = [
    { lable:"No-Partitions", value:"no-partitions"},
    { lable:"Brick-Walls", value:"brick-walls"},
    { lable:"Plastered-Walls", value:"plastered-walls"},
    

]

const WallFinishStatus = ({ error }) => {
  const { form, updateFieldValue } = useActivePropertySlice();

  return (
    <div className="space-y-3">
      <p className="text-[13px] font-weight-bold text-[#000000] uppercase font-poppins">
        Wall Finish Status
      </p>
      <div className="flex  gap-2">
        {WALL_FINISH_STATUS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => updateFieldValue("wallFinishStatus", opt.value)}
            className={`p-3 rounded-lg border text-sm font-weight-bold transition-all ${
              form.wallFinishStatus === opt.value
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
  );
};

export default WallFinishStatus;
 


//ci 

// WallFinishStatus.jsx
// import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

// const WALL_FINISH_STATUS = [
//   { label: "No Partitions", value: "no-partitions" },
//   { label: "Brick Walls", value: "brick-walls" },
//   { label: "Plastered Walls", value: "plastered-walls" },
// ];

// const WallFinishStatus = ({ error }) => {
//   const { form, updateFieldValue } = useActivePropertySlice();
//   return (
//     <div className="space-y-2">
//       <p className="text-xs font-bold text-[#374151] uppercase tracking-wide">Wall Finish Status</p>
//       <div className="flex flex-wrap gap-2">
//         {WALL_FINISH_STATUS.map((opt) => (
//           <button
//             key={opt.value}
//             type="button"
//             onClick={() => updateFieldValue("wallFinishStatus", opt.value)}
//             className={`px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all duration-150 ${
//               form.wallFinishStatus === opt.value
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

// export default WallFinishStatus;