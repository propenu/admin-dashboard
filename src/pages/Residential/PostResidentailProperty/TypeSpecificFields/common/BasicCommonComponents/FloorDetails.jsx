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
import { forwardRef, useEffect } from "react";
import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

const CounterBox = ({ label, value, onChange, onDecrement, onIncrement, error }) => (
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
      <input
        type="number"
        min="0"
        step="1"
        inputMode="numeric"
        value={value}
        onFocus={(event) => event.target.select()}
        onChange={(event) =>
          onChange(Math.max(0, Math.trunc(Number(event.target.value) || 0)))
        }
        className="min-w-0 flex-1 bg-transparent text-center text-sm font-bold text-[#111827] outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        aria-label={label}
      />
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

  useEffect(() => {
    if (form.totalFloors === "" || form.totalFloors === null || form.totalFloors === undefined) {
      updateFieldValue("totalFloors", 0);
    }
    if (form.floorNumber === "" || form.floorNumber === null || form.floorNumber === undefined) {
      updateFieldValue("floorNumber", 0);
    }
  }, [form.totalFloors, form.floorNumber]);

  return (
    <div ref={ref} className="grid grid-cols-2 gap-4">
      <CounterBox
        label="Total Floors"
        value={form.totalFloors || 0}
        onChange={(value) => updateFieldValue("totalFloors", value)}
        onDecrement={() => updateFieldValue("totalFloors", Math.max(0, (form.totalFloors || 0) - 1))}
        onIncrement={() => updateFieldValue("totalFloors", Number(form.totalFloors || 0) + 1)}
        error={errors.totalFloors}
      />
      <CounterBox
        label="Floor Number"
        value={form.floorNumber || 0}
        onChange={(value) => updateFieldValue("floorNumber", value)}
        onDecrement={() => updateFieldValue("floorNumber", Math.max(0, (form.floorNumber || 0) - 1))}
        onIncrement={() => updateFieldValue("floorNumber", Number(form.floorNumber || 0) + 1)}
        error={errors.floorNumber}
      />
    </div>
  );
});

export default FloorDetails;
