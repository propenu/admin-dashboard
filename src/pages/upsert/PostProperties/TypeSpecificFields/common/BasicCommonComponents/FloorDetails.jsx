import { useState, useEffect, forwardRef } from "react";

import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";



const FloorDetails = forwardRef(({errors={}},ref) => {
  const { form, updateFieldValue, toggleArrayValue } = useActivePropertySlice();
  

  
  return (
    <div ref={ref} className="pt-6 border-t border-gray-200">
      <p className="text-[13px] font-weight-bold text-[#000000] uppercase font-poppins mb-2">
        Floor Details
      </p>

      {errors.floorDetails && <p className="text-red-500 text-xs">{errors.floorDetails}</p>}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* TWO WHEELER PARKING */}
        <div className="space-y-2">
          <p className="text-sm font-weight-bold text-[#000000]">
            Total Floors
          </p>

          <div className="flex items-center justify-between px-4 py-2 border border-[#27AE60] outline-none rounded-lg">
            <button
              type="button"
              onClick={() =>
                updateFieldValue(
                  "totalFloors",
                  Math.max(0, (form.totalFloors || 0) - 1)
                )
              }
              className="text-xl text-[#000000]"
            >
              −
            </button>

            <span className="text-sm font-weight-bold text-gray-800">
              {form.totalFloors || 0}
            </span>

            <button
              type="button"
              onClick={() =>
                updateFieldValue("totalFloors", (form.totalFloors || 0) + 1)
              }
              className="text-xl text-[#000000]"
            >
              +
            </button>
          </div>
          {errors.totalFloors && <p className="text-red-500 text-xs">{errors.totalFloors}</p>}
        </div>

        {/* FOUR WHEELER PARKING */}
        <div className="space-y-2">
          <p className="text-sm font-weight-bold text-[#000000]">FloorNumber</p>

          <div className="flex items-center justify-between px-4 py-2 border border-[#27AE60] outline-none rounded-lg">
            <button
              type="button"
              onClick={() =>
                updateFieldValue(
                  "floorNumber",
                  Math.max(0, (form.floorNumber || 0) - 1)
                )
              }
              className="text-xl text-[#000000]"
            >
              −
            </button>

            <span className="text-sm font-weight-bold text-gray-800">
              {form.floorNumber || 0}
            </span>

            <button
              type="button"
              onClick={() =>
                updateFieldValue("floorNumber", (form.floorNumber || 0) + 1)
              }
              className="text-xl text-[#000000]"
            >
              +
            </button>
          </div>
          {errors.floorNumber && <p className="text-red-500 text-xs">{errors.floorNumber}</p>}
        </div>
      </div>
    </div>
  );
});

export default FloorDetails; 
