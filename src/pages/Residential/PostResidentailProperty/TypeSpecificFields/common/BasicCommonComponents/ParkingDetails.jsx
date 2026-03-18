

// // frontend/admin-dashboard/src/pages/Residential/PostResidentailProperty/TypeSpecificFields/common/BasicCommonComponents/ParkingDetails.jsx

// import { useState, useRef, useEffect } from "react";
// import { ChevronDown } from "lucide-react";
// import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

// export const PARKING_TYPES = [
//   { label: "Covered", value: "covered" },
//   { label: "Open", value: "open" },
//   { label: "Stilt", value: "stilt" },
//   { label: "Basement", value: "basement" },
//   { label: "Street", value: "street" },
//   { label: "Dedicated", value: "dedicated" },
//   { label: "Shared", value: "shared" },
// ];

// const ParkingDetails = ({ errors = {} }) => {
//   const { form, updateFieldValue } = useActivePropertySlice();

//   const [open, setOpen] = useState(false);
//   const dropdownRef = useRef(null);

//   // Close on outside click (same as Facing)
//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
//         setOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const selectedParking =
//     PARKING_TYPES.find((p) => p.value === form.parkingType)?.label ||
//     "Select Parking Type";

//   return (
//     <div className=" border-gray-200">
//       <p className="text-[13px] font-weight-bold text-[#000000] uppercase font-poppins mb-2">
//         Parking Details (Optional)
//       </p>

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         {/* PARKING TYPE */}
//         <div className="space-y-2 relative" ref={dropdownRef}>
//           <p className="text-sm font-weight-bold text-[#000000]">
//             Parking Type
//           </p>

//           {/* INPUT BOX (same as Facing) */}
//           <div
//             onClick={() => setOpen(!open)}
//             className="relative cursor-pointer rounded-lg border border-[#27AD75] bg-white px-4 py-3 text-sm font-weight-bold text-[#000000]"
//           >
//             {selectedParking}

//             <ChevronDown
//               size={16}
//               className={`absolute right-4 top-1/2 -translate-y-1/2 text-[#000000] transition-transform ${
//                 open ? "rotate-180" : ""
//               }`}
//             />
//           </div>
//           {errors.parkingType && (
//             <p className="text-red-500 text-xs">{errors.parkingType}</p>
//           )}

//           {/* DROPDOWN LIST */}
//           {open && (
//             <div
//               className="absolute text-[#000000] top-full left-0 mt-2 w-full rounded-xl border border-[#27AD75] bg-white shadow-lg z-50 overflow-y-auto custom-scrollbar1"
//               style={{ maxHeight: "150px" }}
//             >
//               {PARKING_TYPES.map((opt, idx) => {
//                 const isSelected = form.parkingType === opt.value;
//                 const isFirst = idx === 0;
//                 const isLast = idx === PARKING_TYPES.length - 1;

//                 return (
//                   <div
//                     key={opt.value}
//                     onClick={() => {
//                       updateFieldValue("parkingType", opt.value);
//                       setOpen(false);
//                     }}
//                     className={`
//                       px-4 py-3 text-sm cursor-pointer
//                       text-[#000000]
//                       hover:bg-green-100
//                       ${isSelected ? "bg-green-100 font-medium" : ""}
//                       ${isFirst ? "rounded-t-xl" : ""}
//                       ${isLast ? "rounded-b-xl" : ""}
//                       ${!isLast ? "border-b border-[#27AD75]" : ""}
//                     `}
//                   >
//                     {opt.label}
//                   </div>
//                 );
//               })}
//             </div>
//           )}
//         </div>

//         {/* TWO WHEELER PARKING */}
//         <div className="space-y-2">
//           <p className="text-sm font-weight-bold text-[#000000]">
//             Two-Wheeler Parking
//           </p>

//           <div className="flex items-center justify-between px-4 py-2 border border-[#27AD75] rounded-lg">
//             <button
//               type="button"
//               onClick={() =>
//                 updateFieldValue(
//                   "twoWheeler",
//                   Math.max(0, Number(form.twoWheeler || 0) - 1)
//                 )
//               }
//               className="text-xl text-[#000000]"
//             >
//               −
//             </button>

//             <span className="text-sm font-weight-bold text-gray-800">
//               {form.twoWheeler || 0}
//             </span>

//             <button
//               type="button"
//               onClick={() =>
//                 updateFieldValue("twoWheeler", Number(form.twoWheeler || 0) + 1)
//               }
//               className="text-xl text-[#000000]"
//             >
//               +
//             </button>
//           </div>
//           {errors.twoWheeler && (
//             <p className="text-red-500 text-xs">{errors.twoWheeler}</p>
//           )}
//         </div>

//         {/* FOUR WHEELER PARKING */}
//         <div className="space-y-2">
//           <p className="text-sm font-weight-bold text-[#000000]">
//             Four-Wheeler Parking
//           </p>

//           <div className="flex items-center justify-between px-4 py-2 border border-[#27AD75] rounded-lg">
//             <button
//               type="button"
//               onClick={() =>
//                 updateFieldValue(
//                   "fourWheeler",
//                   Math.max(0, Number(form.fourWheeler || 0) - 1)
//                 )
//               }
//               className="text-xl text-[#000000]"
//             >
//               −
//             </button>

//             <span className="text-sm font-weight-bold text-[#000000]">
//               {form.fourWheeler || 0}
//             </span>

//             <button
//               type="button"
//               onClick={() =>
//                 updateFieldValue("fourWheeler", Number(form.fourWheeler || 0) + 1)
//               }
//               className="text-xl text-[#000000]"
//             >
//               +
//             </button>
//           </div>
//           {errors.fourWheeler && (
//             <p className="text-red-500 text-xs">{errors.fourWheeler}</p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ParkingDetails;


//ci 

//frontend/.../TypeSpecificFields/common/BasicCommonComponents/ParkingDetails.jsx
import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

export const PARKING_TYPES = [
  { label: "Covered", value: "covered" },
  { label: "Open", value: "open" },
  { label: "Stilt", value: "stilt" },
  { label: "Basement", value: "basement" },
  { label: "Street", value: "street" },
  { label: "Dedicated", value: "dedicated" },
  { label: "Shared", value: "shared" },
];

const CounterField = ({ label, value, onDecrement, onIncrement, error }) => (
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
    {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
  </div>
);

const ParkingDetails = ({ errors = {} }) => {
  const { form, updateFieldValue, updateNestedFieldValue } = useActivePropertySlice();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedParking = PARKING_TYPES.find((p) => p.value === form.parkingType)?.label || "Select parking type";

  return (
    <div className="space-y-5">
      {/* Parking Type Dropdown */}
      {form.propertyCategory === "residential" && (
        <div className="relative" ref={dropdownRef}>
        <p className="text-xs font-bold text-[#374151] mb-2">Parking Type</p>
        <div
          onClick={() => setOpen(!open)}
          className={`relative cursor-pointer rounded-xl border-2 bg-white px-4 py-3 text-sm font-semibold transition-all duration-150 ${
            errors.parkingType
              ? "border-red-300"
              : open
                ? "border-[#27AE60] ring-2 ring-[#27AE60]/10"
                : "border-[#e5e7eb] hover:border-[#bbf7d0]"
          } ${form.parkingType ? "text-[#111827]" : "text-[#9ca3af]"}`}
        >
          {selectedParking}
          <ChevronDown
            size={15}
            className={`absolute right-4 top-1/2 -translate-y-1/2 text-[#9ca3af] transition-transform ${open ? "rotate-180" : ""}`}
          />
        </div>
        {errors.parkingType && (
          <p className="text-red-500 text-xs font-medium mt-1">
            {errors.parkingType}
          </p>
        )}

        {open && (
          <div className="absolute top-full left-0 mt-2 w-full rounded-xl border border-[#e5e7eb] bg-white shadow-xl z-50 overflow-hidden">
            <div className="max-h-48 overflow-y-auto">
              {PARKING_TYPES.map((opt, idx) => {
                const isSelected = form.parkingType === opt.value;
                return (
                  <div
                    key={opt.value}
                    onClick={() => {
                      updateFieldValue("parkingType", opt.value);
                      setOpen(false);
                    }}
                    className={`px-4 py-3 text-sm cursor-pointer flex items-center justify-between border-b border-[#f5f5f5] last:border-none transition-colors hover:bg-[#f0fdf4] ${isSelected ? "bg-[#f0fdf4] text-[#27AE60] font-bold" : "text-[#374151]"}`}
                  >
                    {opt.label}
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-[#27AE60]" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      )}
       

      {/* Two & Four Wheeler Counters */}
      <div className="grid grid-cols-2 gap-4">
        <CounterField
          label="Two-Wheeler Parking"
          value={form.parkingDetails?.twoWheeler || 0}
          onDecrement={() =>
            updateNestedFieldValue(
              "parkingDetails",
              "twoWheeler",
              Math.max(0, Number(form.parkingDetails?.twoWheeler || 0) - 1),
            )
          }
          onIncrement={() =>
            updateNestedFieldValue(
              "parkingDetails",
              "twoWheeler",
              Number(form.parkingDetails?.twoWheeler || 0) + 1,
            )
          }
        />

        <CounterField
          label="Four-Wheeler Parking"
          value={form.parkingDetails?.fourWheeler || 0}
          onDecrement={() =>
            updateNestedFieldValue(
              "parkingDetails",
              "fourWheeler",
              Math.max(0, Number(form.parkingDetails?.fourWheeler || 0) - 1),
            )
          }
          onIncrement={() =>
            updateNestedFieldValue(
              "parkingDetails",
              "fourWheeler",
              Number(form.parkingDetails?.fourWheeler || 0) + 1,
            )
          }
        />
      </div>
    </div>
  );
};

export default ParkingDetails;