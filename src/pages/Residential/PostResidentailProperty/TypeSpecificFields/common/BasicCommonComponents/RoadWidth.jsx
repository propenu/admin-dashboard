 import { ChevronDown } from "lucide-react";
 import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

 const ROAD_WIDTH_UNITS = [
   { label: "ft", value: "ft" },
   { label: "m", value: "m" },
 ];

 const RoadWidth = ({ error }) => {
   const { form, updateFieldValue } = useActivePropertySlice();

   const roadWidth = form.roadWidth || { value: "", unit: "ft" };

   const updateValue = (value) => {
     updateFieldValue("roadWidth", { ...roadWidth, value });
   };

   const updateUnit = (unit) => {
     updateFieldValue("roadWidth", { ...roadWidth, unit });
   };

   return (
     <div className="space-y-2">
       <p className="text-[13px] font-weight-bold uppercase text-black font-poppins">
         Road Width
       </p>

       {/* COMBINED INPUT (LIKE IMAGE) */}
       <div className="flex items-center w-full border border-[#27AD75] rounded-lg bg-white overflow-hidden">
         {/* VALUE */}
         <input
           type="number"
           value={roadWidth.value}
           onChange={(e) => updateValue(e.target.value)}
           placeholder="0"
           className="flex-1 px-4 py-3 text-sm font-weight-bold placeholder:text-[#524d4d] outline-none bg-transparent"
         />

         {/* DIVIDER */}
         <div className="h-8 w-px bg-gray-300" />

         {/* UNIT */}
         <div className="relative">
           <select
             value={roadWidth.unit}
             onChange={(e) => updateUnit(e.target.value)}
             className="appearance-none bg-transparent px-4 py-3 pr-8 text-sm font-weight-bold outline-none cursor-pointer"
           >
             {ROAD_WIDTH_UNITS.map((u) => (
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

       {error && <p className="text-red-500 text-xs">{error}</p>}
     </div>
   );
 };

 export default RoadWidth;


//ci 

// RoadWidthFt.jsx
// import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

// const RoadWidthFt = ({ error }) => {
//   const { form, updateFieldValue } = useActivePropertySlice();
//   return (
//     <div className="space-y-2">
//       <p className="text-xs font-bold text-[#374151] uppercase tracking-wide">Road Width</p>
//       <div className={`flex border-2 rounded-xl overflow-hidden bg-white transition-all ${error ? "border-red-300" : "border-[#e5e7eb] focus-within:border-[#27AE60] focus-within:ring-2 focus-within:ring-[#27AE60]/10"}`}>
//         <input
//           type="number"
//           placeholder="0"
//           value={form.roadWidthFt || ""}
//           onChange={(e) => updateFieldValue("roadWidthFt", e.target.value)}
//           className="flex-1 px-4 py-3 outline-none text-sm font-semibold placeholder:text-[#c9c9c9] text-[#111827]"
//         />
//         <div className="flex items-center px-4 bg-[#f9fafb] border-l border-[#e5e7eb] text-[#9ca3af] text-xs font-bold">ft</div>
//       </div>
//       {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
//     </div>
//   );
// };

// export default RoadWidthFt;