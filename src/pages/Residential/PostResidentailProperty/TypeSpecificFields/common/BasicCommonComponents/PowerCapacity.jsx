
// import { Power } from "lucide-react";
// import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";



// const PowerCapacity = ({error}) => {
//   const { form, updateFieldValue } = useActivePropertySlice();

//   return (
//     <div className="space-y-3">
//       <p className="text-[13px] font-weight-bold text-[#000000] uppercase font-poppins">
//         Power Capacity
//       </p>
//       <div className="relative">
//         <input
//           type="number"
//           placeholder="e.g. 1000"
//           value={form.powerCapacityKw || ""}
//           onChange={(e) => updateFieldValue("powerCapacityKw", e.target.value)}
//           className="w-full p-3 border border-[#27AD75] placeholder:text-[#524d4d] outline-none rounded-lg text-sm font-weight-bold text-[#000000] appearance-none bg-white"
//         />
//       </div>
//       {error && <p className="text-red-500 text-xs">{error}</p>}
//     </div>
//   );
// };

// export default  PowerCapacity;


//ci 

// PowerCapacity.jsx
import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

const PowerCapacity = ({ error }) => {
  const { form, updateFieldValue } = useActivePropertySlice();
  return (
    <div className="space-y-2">
      <p className="text-xs font-bold text-[#374151] uppercase tracking-wide">Power Capacity</p>
      <div className={`flex border-2 rounded-xl overflow-hidden bg-white transition-all ${error ? "border-red-300" : "border-[#e5e7eb] focus-within:border-[#27AE60] focus-within:ring-2 focus-within:ring-[#27AE60]/10"}`}>
        <input
          type="number"
          placeholder="e.g. 1000"
          value={form.powerCapacityKw || ""}
          onChange={(e) => updateFieldValue("powerCapacityKw", e.target.value)}
          className="flex-1 px-4 py-3 outline-none text-sm font-semibold placeholder:text-[#c9c9c9] text-[#111827]"
        />
        <div className="flex items-center px-4 bg-[#f9fafb] border-l border-[#e5e7eb] text-[#9ca3af] text-xs font-bold">kW</div>
      </div>
      {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
    </div>
  );
};

export default PowerCapacity;