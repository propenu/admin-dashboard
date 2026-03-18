// import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

// const LandDimensions = ({errors={}}) => {
//   const { form, updateNestedFieldValue } = useActivePropertySlice();

//   const dimensions = form.dimensions || { length: "", width: "", landName: "" };

//   return (
//     <div className="pt-6 border-t space-y-3">
//       <p className="text-[13px] font-weight-bold text-[#000000] uppercase font-poppins">
//         Land Dimensions
//       </p>
//       <div className="grid grid-cols-2 gap-4">
//         <div className="flex flex-col">
//           <input
//             type="number"
//             placeholder="Length"
//             value={dimensions.length}
//             onChange={(e) =>
//               updateNestedFieldValue("dimensions", "length", e.target.value)
//             }
//             className="w-full p-3 border border-[#27AD75] rounded-lg placeholder:text-[#524d4d] text-[#000000] text-sm font-weight-bold outline-none"
//           />
//           {errors.length && (
//             <p className="text-red-500 text-xs mt-2">{errors.length}</p>
//           )}
//         </div>
//         <div className="flex flex-col">
//           <input
//             type="number"
//             placeholder="Width"
//             value={dimensions.width}
//             onChange={(e) =>
//               updateNestedFieldValue("dimensions", "width", e.target.value)
//             }
//             className="w-full p-3 border border-[#27AD75] rounded-lg placeholder:text-[#524d4d] text-[#000000] text-sm font-weight-bold outline-none"
//           />
//           {errors && <p className="text-red-500 text-xs mt-2">{errors.width}</p>}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LandDimensions;


//ci 

// LandDimensions.jsx
import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

const inputCls = (hasError) =>
  `w-full px-4 py-3 border-2 rounded-xl outline-none text-sm font-semibold placeholder:text-[#c9c9c9] text-[#111827] transition-all ${
    hasError
      ? "border-red-300 focus:ring-2 focus:ring-red-100"
      : "border-[#e5e7eb] focus:border-[#27AE60] focus:ring-2 focus:ring-[#27AE60]/10 hover:border-[#bbf7d0]"
  }`;

const LandDimensions = ({ errors = {} }) => {
  const { form, updateNestedFieldValue } = useActivePropertySlice();
  const dimensions = form.dimensions || { length: "", width: "" };

  return (
    <div className="space-y-2">
      <p className="text-xs font-bold text-[#374151] uppercase tracking-wide">Land Dimensions</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#6b7280]">Length</label>
          <div className={`flex border-2 rounded-xl overflow-hidden bg-white transition-all ${errors.length ? "border-red-300" : "border-[#e5e7eb] focus-within:border-[#27AE60] focus-within:ring-2 focus-within:ring-[#27AE60]/10"}`}>
            <input
              type="number"
              placeholder="0"
              value={dimensions.length}
              onChange={(e) => updateNestedFieldValue("dimensions", "length", e.target.value)}
              className="flex-1 px-4 py-3 outline-none text-sm font-semibold placeholder:text-[#c9c9c9] text-[#111827]"
            />
            <div className="flex items-center px-3 bg-[#f9fafb] border-l border-[#e5e7eb] text-[#9ca3af] text-xs font-bold">ft</div>
          </div>
          {errors.length && <p className="text-red-500 text-xs font-medium">{errors.length}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#6b7280]">Width</label>
          <div className={`flex border-2 rounded-xl overflow-hidden bg-white transition-all ${errors.width ? "border-red-300" : "border-[#e5e7eb] focus-within:border-[#27AE60] focus-within:ring-2 focus-within:ring-[#27AE60]/10"}`}>
            <input
              type="number"
              placeholder="0"
              value={dimensions.width}
              onChange={(e) => updateNestedFieldValue("dimensions", "width", e.target.value)}
              className="flex-1 px-4 py-3 outline-none text-sm font-semibold placeholder:text-[#c9c9c9] text-[#111827]"
            />
            <div className="flex items-center px-3 bg-[#f9fafb] border-l border-[#e5e7eb] text-[#9ca3af] text-xs font-bold">ft</div>
          </div>
          {errors.width && <p className="text-red-500 text-xs font-medium">{errors.width}</p>}
        </div>
      </div>
    </div>
  );
};

export default LandDimensions;