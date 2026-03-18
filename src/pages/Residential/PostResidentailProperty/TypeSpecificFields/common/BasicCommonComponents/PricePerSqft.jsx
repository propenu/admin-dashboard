
// import { forwardRef } from "react";
// import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";



// const PricePerSqft = forwardRef(({error},ref) => {
//   const { form, updateFieldValue } = useActivePropertySlice();

//   return (
    

     
        
//         <div ref={ref} className="space-y-3">
//           <p className="text-[13px] font-weight-bold text-[#000000] uppercase font-poppins">
//             Price per Sqft
//           </p>
//           <div className="relative">
//             <span className="absolute left-3 top-3 text-[#525252] font-weight-bold">
//               ₹
//             </span>
//             <input
//               type="number"
//               placeholder="Expected Price Per Sqft"
//               value={form.pricePerSqft || ""}
//               onChange={(e) => updateFieldValue("pricePerSqft", e.target.value)}
//               className="w-full p-3 pl-7 border border-[#27AD75] placeholder:text-[#525252] rounded-lg text-sm font-weight-bold text-[#000000] outline-none bg-gray-50/30"
//             />
//           </div>
//           {error && <p className="text-red-500 text-xs">{error}</p>}
//         </div>
    
   
//   );
// });

// export default PricePerSqft; 

//ci 

// PricePerSqft.jsx
import { forwardRef } from "react";
import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

const PricePerSqft = forwardRef(({ error }, ref) => {
  const { form, updateFieldValue } = useActivePropertySlice();
  return (
    <div ref={ref} className="space-y-2">
      <p className="text-xs font-bold text-[#374151] uppercase tracking-wide">Price per sq.ft</p>
      <div className={`flex border-2 rounded-xl overflow-hidden bg-white transition-all ${error ? "border-red-300" : "border-[#e5e7eb] focus-within:border-[#27AE60] focus-within:ring-2 focus-within:ring-[#27AE60]/10"}`}>
        <div className="flex items-center px-4 bg-[#f9fafb] border-r border-[#e5e7eb] text-[#27AE60] font-bold text-sm">₹</div>
        <input
          type="number"
          placeholder="Price per sqft"
          value={form.pricePerSqft || ""}
          onChange={(e) => updateFieldValue("pricePerSqft", e.target.value)}
          className="flex-1 px-4 py-3 outline-none text-sm font-semibold placeholder:text-[#c9c9c9] text-[#111827]"
        />
      </div>
      {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
    </div>
  );
});

export default PricePerSqft;
