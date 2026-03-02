import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

const LandDimensions = ({errors={}}) => {
  const { form, updateNestedFieldValue } = useActivePropertySlice();

  const dimensions = form.dimensions || { length: "", width: "", landName: "" };

  return (
    <div className="pt-6 border-t space-y-3">
      <p className="text-[13px] font-weight-bold text-[#000000] uppercase font-poppins">
        Land Dimensions
      </p>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col">
          <input
            type="number"
            placeholder="Length"
            value={dimensions.length}
            onChange={(e) =>
              updateNestedFieldValue("dimensions", "length", e.target.value)
            }
            className="w-full p-3 border border-[#27AD75] rounded-lg placeholder:text-[#524d4d] text-[#000000] text-sm font-weight-bold outline-none"
          />
          {errors.length && (
            <p className="text-red-500 text-xs mt-2">{errors.length}</p>
          )}
        </div>
        <div className="flex flex-col">
          <input
            type="number"
            placeholder="Width"
            value={dimensions.width}
            onChange={(e) =>
              updateNestedFieldValue("dimensions", "width", e.target.value)
            }
            className="w-full p-3 border border-[#27AD75] rounded-lg placeholder:text-[#524d4d] text-[#000000] text-sm font-weight-bold outline-none"
          />
          {errors && <p className="text-red-500 text-xs mt-2">{errors.width}</p>}
        </div>
      </div>
    </div>
  );
};

export default LandDimensions;


// ci 


// LandDimensions.jsx
// import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

// const LandDimensions = ({ errors = {} }) => {
//   const { form, updateNestedFieldValue } = useActivePropertySlice();
//   const dimensions = form.dimensions || { length: "", width: "" };

//   const inputCls = "w-full px-4 py-3 border-2 border-[#e5e7eb] rounded-xl outline-none text-sm font-semibold placeholder:text-[#c9c9c9] text-[#111827] focus:border-[#27AE60] focus:ring-2 focus:ring-[#27AE60]/10 transition-all";

//   return (
//     <div className="space-y-2">
//       <p className="text-xs font-bold text-[#374151] uppercase tracking-wide">Land Dimensions</p>
//       <div className="grid grid-cols-2 gap-4">
//         <div>
//           <input
//             type="number"
//             placeholder="Length (ft)"
//             value={dimensions.length}
//             onChange={(e) => updateNestedFieldValue("dimensions", "length", e.target.value)}
//             className={inputCls}
//           />
//           {errors.length && <p className="text-red-500 text-xs font-medium mt-1">{errors.length}</p>}
//         </div>
//         <div>
//           <input
//             type="number"
//             placeholder="Width (ft)"
//             value={dimensions.width}
//             onChange={(e) => updateNestedFieldValue("dimensions", "width", e.target.value)}
//             className={inputCls}
//           />
//           {errors.width && <p className="text-red-500 text-xs font-medium mt-1">{errors.width}</p>}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LandDimensions;
