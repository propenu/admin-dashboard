// import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

// const BOOLEAN_FIELDS = [
//   { key: "readyToConstruct", label: "Ready to Construct" },
//   { key: "waterConnection", label: "Water Connection Available" },
//   { key: "electricityConnection", label: "Electricity Connection Available" },
//   { key: "fencing", label: "Fencing Done" },
//   { key: "cornerPlot", label: "Corner Plot" },
//   { key: "isPriceNegotiable", label: "Price Negotiable" },
// ];

// const LandBooleanFeatures = () => {
//   const { form, updateFieldValue } = useActivePropertySlice();

//   const toggleValue = (key) => {
//     updateFieldValue(key, !form[key]);
//   };

//   return (
//     <div className="pt-6 border-t space-y-4">
//       <p className="text-[13px] font-weight-bold text-[#000000] uppercase font-poppins">
//         Land Features
//       </p>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         {BOOLEAN_FIELDS.map((item) => {
//           const checked = !!form[item.key];

//           return (
//             <div
//               key={item.key}
//               className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
//             >
//               <span className="text-sm font-weight-bold text-[#000000]">
//                 {item.label}
//               </span>

//               {/* ✅ STABLE BUTTON TOGGLE */}
//               <button
//                 type="button"
//                 role="switch"
//                 aria-checked={checked}
//                 onClick={() => toggleValue(item.key)}
//                 className={`relative w-11 h-6 rounded-full transition-colors ${
//                   checked ? "bg-[#27AE60]" : "bg-gray-300"
//                 }`}
//               >
//                 <span
//                   className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
//                     checked ? "translate-x-5" : ""
//                   }`}
//                 />
//               </button>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// export default LandBooleanFeatures;
//

//ci 

// LandBooleanFeatures.jsx
import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

const BOOLEAN_FIELDS = [
  { key: "readyToConstruct", label: "Ready to Construct" },
  { key: "waterConnection", label: "Water Connection Available" },
  { key: "electricityConnection", label: "Electricity Connection" },
  { key: "fencing", label: "Fencing Done" },
  { key: "cornerPlot", label: "Corner Plot" },
  { key: "isPriceNegotiable", label: "Price Negotiable" },
];

const LandBooleanFeatures = () => {
  const { form, updateFieldValue } = useActivePropertySlice();

  return (
    <div className="space-y-3">
      <p className="text-xs font-bold text-[#374151] uppercase tracking-wide">Land Features</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {BOOLEAN_FIELDS.map((item) => {
          const checked = !!form[item.key];
          return (
            <div
              key={item.key}
              className="flex items-center justify-between px-4 py-3.5 border-2 border-[#e5e7eb] rounded-xl hover:border-[#bbf7d0] transition-colors"
            >
              <span className="text-sm font-semibold text-[#374151]">{item.label}</span>
              <button
                type="button"
                role="switch"
                aria-checked={checked}
                onClick={() => updateFieldValue(item.key, !checked)}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${checked ? "bg-[#27AE60]" : "bg-[#e5e7eb]"}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${checked ? "translate-x-5" : ""}`} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LandBooleanFeatures;