// import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

// const RoadWidthFt = ({error}) => {
//   const { form, updateFieldValue } = useActivePropertySlice();

//   return (
//     <div className="space-y-2">
//       <p className="text-[13px] font-weight-bold text-[#000000] uppercase font-poppins">
//         Road Width
//       </p>

//       <div className="flex border border-[#27AD75] rounded-lg overflow-hidden bg-white">
//         {/* Road Width Input */}
//         <input
//           type="number"
//           placeholder="0"
//           value={form.roadWidthFt || ""}
//           onChange={(e) => updateFieldValue("roadWidthFt", e.target.value)}
//           className="w-full p-3 outline-none placeholder:text-[#524d4d] text-sm font-semibold"
//         />

        
//       </div>
//       {error && <p className="text-red-500 text-xs">{error}</p>}
//     </div>
//   );
// };

// export default RoadWidthFt;


//ci 

// RoadWidthFt.jsx
import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

const RoadWidthFt = ({ error }) => {
  const { form, updateFieldValue } = useActivePropertySlice();

  return (
    <div className="space-y-2">
      <p className="text-xs font-bold text-[#374151] uppercase tracking-wide">Road Width</p>
      <div className={`flex border-2 rounded-xl overflow-hidden bg-white transition-all ${
        error ? "border-red-300" : "border-[#e5e7eb] focus-within:border-[#27AE60] focus-within:ring-2 focus-within:ring-[#27AE60]/10"
      }`}>
        <input
          type="number"
          placeholder="0"
          value={form.roadWidthFt || ""}
          onChange={(e) => updateFieldValue("roadWidthFt", e.target.value)}
          className="flex-1 px-4 py-3 outline-none text-sm font-semibold placeholder:text-[#c9c9c9] text-[#111827]"
        />
        <div className="flex items-center px-4 bg-[#f9fafb] border-l border-[#e5e7eb] text-[#9ca3af] text-xs font-bold">
          ft
        </div>
      </div>
      {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
    </div>
  );
};

export default RoadWidthFt;