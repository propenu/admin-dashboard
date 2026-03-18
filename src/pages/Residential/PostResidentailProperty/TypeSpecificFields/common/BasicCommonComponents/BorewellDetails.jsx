// import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

// const BorewellDetails = ({errors={}}) => {
//   const { form, updateNestedFieldValue } = useActivePropertySlice();

//   const borewell = form.borewellDetails || {};

//   return (
//     <div className="space-y-4 pt-6 border-t">
//       <p className="text-[13px] font-weight-bold uppercase text-[#000000]">
//         Borewell Details
//       </p>

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         {/* Depth */}
//         <div className="flex flex-col">
//           <input
//             type="number"
//             value={borewell.depthMeters || ""}
//             onChange={(e) =>
//               updateNestedFieldValue(
//                 "borewellDetails",
//                 "depthMeters",
//                 e.target.value ? Number(e.target.value) : "",
//               )
//             }
//             placeholder="Depth (Meters)"
//             className="p-3 border border-[#27AD75] rounded-lg text-sm font-weight-bold placeholder:text-[#524d4d] outline-none"
//           />
//           {errors.depthMeters && (
//             <p className="text-red-500 text-xs mt-1">{errors.depthMeters}</p>
//           )}
//         </div>
//         {/* Yield */}
//         <div className="flex flex-col">
//           <input
//             type="number"
//             value={borewell.yieldLpm || ""}
//             onChange={(e) =>
//               updateNestedFieldValue(
//                 "borewellDetails",
//                 "yieldLpm",
//                 e.target.value ? Number(e.target.value) : "",
//               )
//             }
//             placeholder="Yield (LPM)"
//             className="p-3 border border-[#27AD75] rounded-lg text-sm font-weight-bold placeholder:text-[#524d4d] outline-none"
//           />
//           {errors.yieldLpm && (
//             <p className="text-red-500 text-xs mt-1">{errors.yieldLpm}</p>
//           )}
//         </div>
//         {/* Year */}
//         <div className="flex flex-col">
//           <input
//             type="number"
//             min="1900"
//             max={new Date().getFullYear()}
//             value={borewell.drilledYear || ""}
//             onChange={(e) =>
//               updateNestedFieldValue(
//                 "borewellDetails",
//                 "drilledYear",
//                 e.target.value ? Number(e.target.value) : "",
//               )
//             }
//             placeholder="Drilled Year (e.g. 2020)"
//           />

//           {errors.drilledYear && (
//             <p className="text-red-500 text-xs mt-1">{errors.drilledYear}</p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BorewellDetails;

import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

const BorewellDetails = ({ errors = {} }) => {
  const { form, updateNestedFieldValue } = useActivePropertySlice();
  const borewell = form.borewellDetails || {};

  return (
    <div className="space-y-4 pt-6 border-t">
      <p className="text-[13px] font-bold uppercase text-[#000000]">
        Borewell Details
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Depth */}
        <div className="flex flex-col">
          <label className="text-sm font-semibold mb-1">Depth (Meters)</label>
          <input
            type="number"
            value={borewell.depthMeters || ""}
            placeholder="Enter DepthMeters"
            onChange={(e) =>
              updateNestedFieldValue(
                "borewellDetails",
                "depthMeters",
                e.target.value ? Number(e.target.value) : "",
              )
            }
            className="p-3 border border-[#27AD75] rounded-lg text-sm outline-none"
          />
          {errors.depthMeters && (
            <p className="text-red-500 text-xs mt-1">{errors.depthMeters}</p>
          )}
        </div>

        {/* Yield */}
        <div className="flex flex-col">
          <label className="text-sm font-semibold mb-1">
            Yield (Litres Per Minute)
          </label>
          <input
            type="number"
            value={borewell.yieldLpm || ""}
            placeholder="Enter Yield (LPM)"
            onChange={(e) =>
              updateNestedFieldValue(
                "borewellDetails",
                "yieldLpm",
                e.target.value ? Number(e.target.value) : "",
              )
            }
            className="p-3 border border-[#27AD75] rounded-lg text-sm outline-none"
          />
          {errors.yieldLpm && (
            <p className="text-red-500 text-xs mt-1">{errors.yieldLpm}</p>
          )}
        </div>

        {/* Drilled Year */}
        <div className="flex flex-col">
          <label className="text-sm font-semibold mb-1">Drilled Year</label>
          <input
            type="number"
            min="1900"
            max={new Date().getFullYear()}
            value={borewell.drilledYear || ""}
            placeholder="Enter Drilled Year"
            onChange={(e) =>
              updateNestedFieldValue(
                "borewellDetails",
                "drilledYear",
                e.target.value ? Number(e.target.value) : "",
              )
            }
            className="p-3 border border-[#27AD75] rounded-lg text-sm outline-none"
          />
          {errors.drilledYear && (
            <p className="text-red-500 text-xs mt-1">{errors.drilledYear}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BorewellDetails;