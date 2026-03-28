// import { ChevronDown } from "lucide-react";
// import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";
// import { forwardRef } from "react";

// const CarpetArea = forwardRef(({error},ref) => {
//   const { form, updateFieldValue } = useActivePropertySlice();


// return (
//   <div ref={ref} className="space-y-2">
//     <p className="text-[13px] font-poppins font-weight-bold text-[#000000] uppercase font-poppins">
//       Carpet Area
//     </p>
//     <div className="flex border border-[#27AD75] rounded-lg overflow-hidden bg-white">
//       <input
//         type="number"
//         placeholder="0"
//         value={form.carpetArea || ""}
//         onChange={(e) => updateFieldValue("carpetArea", e.target.value)}
//         className="w-full p-3 outline-none placeholder:text-[#524d4d] text-sm font-semibold"
//       />
//       <div className="flex items-center gap-2 px-4 bg-gray-50 border-l-[1px] m-1 border-[#524d4d] text-[#524d4d] text-xs font-bold">
//         sq.ft. <ChevronDown size={14} />
//       </div>
//     </div>
//     {error && <p className="text-red-500 text-xs">{error}</p>}
//   </div>
// );


// });

// export default CarpetArea 



// CarpetArea.jsx
import { forwardRef } from "react";
import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

const CarpetArea = forwardRef(({ error }, ref) => {
  const { form, updateFieldValue } = useActivePropertySlice();
  return (
    <div ref={ref} className="space-y-2">
      <p className="text-xs font-bold text-[#374151] uppercase tracking-wide">Carpet Area</p>
      <div className={`flex border-2 rounded-xl overflow-hidden bg-white transition-all ${error ? "border-red-300" : "border-[#e5e7eb] focus-within:border-[#27AE60] focus-within:ring-2 focus-within:ring-[#27AE60]/10"}`}>
        <input
          type="number"
          placeholder="0"
          value={form.carpetArea || ""}
          onChange={(e) => updateFieldValue("carpetArea", e.target.value)}
          className="flex-1 px-4 py-3 outline-none text-sm font-semibold placeholder:text-[#c9c9c9] text-[#111827]"
        />
        <div className="flex items-center px-2 bg-[#f9fafb] border-l border-[#e5e7eb] text-[#9ca3af] text-xs font-bold whitespace-nowrap">
          sq.ft
        </div>
      </div>
      {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
    </div>
  );
});

export default CarpetArea;