// import { ChevronDown } from "lucide-react";
// import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

// const AREA_UNITS = [
//   { label: "Acre", value: "acre" },
//   { label: "Hectare", value: "hectare" },
//   { label: "SQFT", value: "sqft" },
//   { label: "SQMT", value: "sqmt" },
//   { label: "Gunta", value: "gunta" },
//   { label: "Cent", value: "cent" },
// ];

// const TotalArea = () => {
//   const { form, updateFieldValue } = useActivePropertySlice();

//   const totalArea = form.totalArea || { value: "", unit: "acre" };

//   const updateValue = (val) => {
//     updateFieldValue("totalArea", { ...totalArea, value: val });
//   };

//   const updateUnit = (unit) => {
//     updateFieldValue("totalArea", { ...totalArea, unit });
//   };

//   return (
//     <div className="space-y-2">
//       <p className="text-[13px] font-weight-bold text-[#000000] uppercase font-poppins">
//         Total Area
//       </p>

//       <div className="grid grid-cols-3 gap-3">
//         {/* VALUE */}
//         <input
//           type="number"
//           value={totalArea.value}
//           onChange={(e) => updateValue(e.target.value)}
//           placeholder="Area"
//           className="col-span-2 w-full p-3 border border-[#27AD75] rounded-lg text-sm font-weight-bold outline-none bg-white"
//         />

//         {/* UNIT */}
//         <div className="relative">
//           <select
//             value={totalArea.unit}
//             onChange={(e) => updateUnit(e.target.value)}
//             className="w-full p-3 border border-[#27AD75] rounded-lg text-sm font-bold appearance-none bg-white outline-none"
//           >
//             {AREA_UNITS.map((u) => (
//               <option key={u.value} value={u.value}>
//                 {u.label}
//               </option>
//             ))}
//           </select>

//           <ChevronDown
//             size={16}
//             className="absolute right-3 top-3.5 text-[#000000] pointer-events-none"
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TotalArea;



import { ChevronDown } from "lucide-react";
import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

const AREA_UNITS = [
  { label: "sq.ft.", value: "sqft" },
  { label: "sq.mt.", value: "sqmt" },
  { label: "Acre", value: "acre" },
  { label: "Hectare", value: "hectare" },
  { label: "Gunta", value: "gunta" },
  { label: "Cent", value: "cent" },
];


const TotalArea = ({error}) => {
  const { form, updateFieldValue } = useActivePropertySlice();

  const totalArea = form.totalArea || { value: "", unit: "sqft" };

  const updateValue = (value) => {
    updateFieldValue("totalArea", { ...totalArea, value });
  };

  const updateUnit = (unit) => {
    updateFieldValue("totalArea", { ...totalArea, unit });
  };

  return (
    <div className="space-y-2">
      <p className="text-[13px] font-weight-bold uppercase text-black font-poppins">
        Total Area
      </p>

      {/* COMBINED INPUT */}
      <div className="flex items-center w-full border border-[#27AD75] rounded-lg bg-white overflow-hidden">
        {/* NUMBER INPUT */}
        <input
          type="number"
          value={totalArea.value}
          onChange={(e) => updateValue(e.target.value)}
          placeholder="0"
          className="flex-1 px-4 py-3 text-sm font-weight-bold placeholder:text-[#524d4d] outline-none bg-transparent"
        />

        {/* DIVIDER */}
        <div className="h-8 w-px bg-gray-300" />

        {/* UNIT SELECT */}
        <div className="relative">
          <select
            value={totalArea.unit}
            onChange={(e) => updateUnit(e.target.value)}
            className="appearance-none bg-transparent px-4 py-3 pr-8 text-sm font-semibold outline-none cursor-pointer"
          >
            {AREA_UNITS.map((u) => (
              <option key={u.value} value={u.value}>
                {u.label}
              </option>
            ))}
          </select>

          {/* CHEVRON */}
          <ChevronDown
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-black pointer-events-none"
          />
        </div>
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default TotalArea;
