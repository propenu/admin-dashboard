// frontend/admin-dashboard/src/pages/Residential/PostResidentailProperty/TypeSpecificFields/common/BasicCommonComponents/Amenities.jsx
import { useState, useEffect } from "react";
import { X, ChevronDown, Check } from "lucide-react";
import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";
import { useRef } from "react";

const RESIDENTIAL_AMENITIES = [
  "Swimming Pool",
  "Gymnasium",
  "Club House",
  "Jogging Track",
  "Power Backup",
  "Elevator",
  "Intercom",
  "Gas Pipeline",
  "Children Play Area",
  "Park",
];

const Amenities = ({error}) => {
  const { form, updateFieldValue, toggleArrayValue } = useActivePropertySlice();
 const amenityRef = useRef(null);
 const [isAmenityOpen, setIsAmenityOpen] = useState(false);

 useEffect(() => {
     const handleClick = (e) => {
       if (amenityRef.current && !amenityRef.current.contains(e.target)) setIsAmenityOpen(false);
     };
     document.addEventListener("mousedown", handleClick);
     return () => document.removeEventListener("mousedown", handleClick);
   }, []);


  return (
    <div className="space-y-2" ref={amenityRef}>
      <p className="text-[13px] font-weight-bold text-[#000000] uppercase font-poppins">
        Amenities
      </p>
      <div className="relative ">
        <div
          onClick={() => setIsAmenityOpen(!isAmenityOpen)}
          className="w-full border border-[#27AD75] rounded-lg p-3 min-h-[45px] flex flex-wrap gap-2 items-center cursor-pointer bg-white"
        >
          {form.amenities?.length > 0 ? (
            form.amenities.map((item) => (
              <span
                key={item.title}
                className="bg-[#F1FCF5]  text-[#27AE60] text-[10px] font-bold px-2 py-1 rounded border border-[#DEFAEA] flex items-center gap-1"
              >
                {item.title}
                <X
                  size={12}
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleArrayValue("amenities", item.title);
                  }}
                />
              </span>
            ))
          ) : (
            <span className="text-[#524d4d] text-sm font-medium">
              Select Amenities
            </span>
          )}
          <ChevronDown size={16} className="ml-auto text-[#000000]" />
        </div>
        {isAmenityOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-[#524d4d] rounded-lg shadow-xl max-h-60 overflow-y-auto">
            {RESIDENTIAL_AMENITIES.map((name) => {
              const isSelected = form.amenities?.some((a) => a.title === name);
              return (
                <div
                  key={name}
                  onClick={() => toggleArrayValue("amenities", name)}
                  className="px-4 py-3 hover:bg-[#F1FCF5] flex justify-between items-center cursor-pointer border-b last:border-none"
                >
                  <span
                    className={`text-sm ${
                      isSelected ? "text-[#27AE60] font-bold" : "text-gray-700"
                    }`}
                  >
                    {name}
                  </span>
                  {isSelected && <Check size={16} className="text-[#27AE60]" />}
                </div>
              );
            })}
          </div>
        )}
      </div>
      {error && <p className="text-red-500 text-xs">{error}</p>} 
    </div>
  );
};

export default Amenities;


// frontend/.../TypeSpecificFields/common/BasicCommonComponents/Amenities.jsx
// import { useState, useEffect, useRef } from "react";
// import { X, ChevronDown, Check } from "lucide-react";
// import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

// const RESIDENTIAL_AMENITIES = [
//   "Swimming Pool", "Gymnasium", "Club House", "Jogging Track",
//   "Power Backup", "Elevator", "Intercom", "Gas Pipeline",
//   "Children Play Area", "Park",
// ];

// const Amenities = ({ error }) => {
//   const { form, toggleArrayValue } = useActivePropertySlice();
//   const amenityRef = useRef(null);
//   const [isOpen, setIsOpen] = useState(false);

//   useEffect(() => {
//     const handleClick = (e) => {
//       if (amenityRef.current && !amenityRef.current.contains(e.target)) setIsOpen(false);
//     };
//     document.addEventListener("mousedown", handleClick);
//     return () => document.removeEventListener("mousedown", handleClick);
//   }, []);

//   return (
//     <div className="space-y-2" ref={amenityRef}>
//       <div className="relative">
//         <div
//           onClick={() => setIsOpen(!isOpen)}
//           className={`w-full border-2 rounded-xl px-3.5 py-3 min-h-[50px] flex flex-wrap gap-2 items-center cursor-pointer bg-white transition-all duration-150 ${
//             error ? "border-red-300" : isOpen ? "border-[#27AE60] ring-2 ring-[#27AE60]/10" : "border-[#e5e7eb] hover:border-[#bbf7d0]"
//           }`}
//         >
//           {form.amenities?.length > 0 ? (
//             form.amenities.map((item) => (
//               <span
//                 key={item.title}
//                 className="bg-[#f0fdf4] text-[#27AE60] text-xs font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 border border-[#bbf7d0]"
//               >
//                 {item.title}
//                 <X
//                   size={11}
//                   className="cursor-pointer hover:text-red-500 transition-colors"
//                   onClick={(e) => { e.stopPropagation(); toggleArrayValue("amenities", item.title); }}
//                 />
//               </span>
//             ))
//           ) : (
//             <span className="text-[#9ca3af] text-sm font-medium">Select amenities...</span>
//           )}
//           <ChevronDown size={16} className={`ml-auto text-[#9ca3af] transition-transform ${isOpen ? "rotate-180" : ""}`} />
//         </div>

//         {isOpen && (
//           <div className="absolute z-50 w-full mt-2 bg-white border border-[#e5e7eb] rounded-xl shadow-xl overflow-hidden">
//             <div className="max-h-56 overflow-y-auto">
//               {RESIDENTIAL_AMENITIES.map((name) => {
//                 const isSelected = form.amenities?.some((a) => a.title === name);
//                 return (
//                   <div
//                     key={name}
//                     onClick={() => toggleArrayValue("amenities", name)}
//                     className={`px-4 py-3 hover:bg-[#f0fdf4] flex justify-between items-center cursor-pointer border-b border-[#f5f5f5] last:border-none transition-colors ${isSelected ? "bg-[#f0fdf4]" : ""}`}
//                   >
//                     <span className={`text-sm font-medium ${isSelected ? "text-[#27AE60] font-bold" : "text-[#374151]"}`}>{name}</span>
//                     {isSelected && <Check size={15} className="text-[#27AE60]" />}
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         )}
//       </div>
//       {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
//     </div>
//   );
// };

// export default Amenities;