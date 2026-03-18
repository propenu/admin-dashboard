// import { useState, useEffect, forwardRef } from "react";

// import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";



// const FloorDetails = forwardRef(({errors={}},ref) => {
//   const { form, updateFieldValue, toggleArrayValue } = useActivePropertySlice();
  

  
//   return (
//     <div ref={ref} className=" border-gray-200">
//       <p className="text-[13px] font-weight-bold text-[#000000] uppercase font-poppins mb-2">
//         Floor Details
//       </p>

//       {errors.floorDetails && <p className="text-red-500 text-xs">{errors.floorDetails}</p>}
      
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         {/* TWO WHEELER PARKING */}
//         <div className="space-y-2">
//           <p className="text-sm font-weight-bold text-[#000000]">
//             Total Floors
//           </p>

//           <div className="flex items-center justify-between px-4 py-2 border border-[#27AE60] outline-none rounded-lg">
//             <button
//               type="button"
//               onClick={() =>
//                 updateFieldValue(
//                   "totalFloors",
//                   Math.max(0, (form.totalFloors || 0) - 1)
//                 )
//               }
//               className="text-xl text-[#000000]"
//             >
//               −
//             </button>

//             <span className="text-sm font-weight-bold text-gray-800">
//               {form.totalFloors || 0}
//             </span>

//             <button
//               type="button"
//               onClick={() =>
//                 updateFieldValue("totalFloors", (form.totalFloors || 0) + 1)
//               }
//               className="text-xl text-[#000000]"
//             >
//               +
//             </button>
//           </div>
//           {errors.totalFloors && <p className="text-red-500 text-xs">{errors.totalFloors}</p>}
//         </div>

//         {/* FOUR WHEELER PARKING */}
//         <div className="space-y-2">
//           <p className="text-sm font-weight-bold text-[#000000]">FloorNumber</p>

//           <div className="flex items-center justify-between px-4 py-2 border border-[#27AE60] outline-none rounded-lg">
//             <button
//               type="button"
//               onClick={() =>
//                 updateFieldValue(
//                   "floorNumber",
//                   Math.max(0, (form.floorNumber || 0) - 1)
//                 )
//               }
//               className="text-xl text-[#000000]"
//             >
//               −
//             </button>

//             <span className="text-sm font-weight-bold text-gray-800">
//               {form.floorNumber || 0}
//             </span>

//             <button
//               type="button"
//               onClick={() =>
//                 updateFieldValue("floorNumber", (form.floorNumber || 0) + 1)
//               }
//               className="text-xl text-[#000000]"
//             >
//               +
//             </button>
//           </div>
//           {errors.floorNumber && <p className="text-red-500 text-xs">{errors.floorNumber}</p>}
//         </div>
//       </div>
//     </div>
//   );
// });

// export default FloorDetails; 


//ci 

// frontend/.../TypeSpecificFields/common/BasicCommonComponents/FloorDetails.jsx
import { forwardRef } from "react";
import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

const CounterBox = ({ label, value, onDecrement, onIncrement, error }) => (
  <div className="space-y-2">
    <p className="text-xs font-bold text-[#374151]">{label}</p>
    <div className="flex items-center border-2 border-[#e5e7eb] rounded-xl overflow-hidden hover:border-[#bbf7d0] transition-colors">
      <button
        type="button"
        onClick={onDecrement}
        className="w-11 h-11 flex items-center justify-center text-[#6b7280] hover:bg-[#f0fdf4] hover:text-[#27AE60] text-xl font-light transition-colors"
      >
        −
      </button>
      <span className="flex-1 text-center text-sm font-bold text-[#111827]">{value}</span>
      <button
        type="button"
        onClick={onIncrement}
        className="w-11 h-11 flex items-center justify-center text-[#6b7280] hover:bg-[#f0fdf4] hover:text-[#27AE60] text-xl font-light transition-colors"
      >
        +
      </button>
    </div>
    {error && <p className="text-red-500 text-xs font-medium mt-1">{error}</p>}
  </div>
);

const FloorDetails = forwardRef(({ errors = {} }, ref) => {
  const { form, updateFieldValue } = useActivePropertySlice();

  return (
    <div ref={ref} className="grid grid-cols-2 gap-4">
      <CounterBox
        label="Total Floors"
        value={form.totalFloors || 0}
        onDecrement={() => updateFieldValue("totalFloors", Math.max(0, (form.totalFloors || 0) - 1))}
        onIncrement={() => updateFieldValue("totalFloors", (form.totalFloors || 0) + 1)}
        error={errors.totalFloors}
      />
      <CounterBox
        label="Floor Number"
        value={form.floorNumber || 0}
        onDecrement={() => updateFieldValue("floorNumber", Math.max(0, (form.floorNumber || 0) - 1))}
        onIncrement={() => updateFieldValue("floorNumber", (form.floorNumber || 0) + 1)}
        error={errors.floorNumber}
      />
    </div>
  );
});

export default FloorDetails;