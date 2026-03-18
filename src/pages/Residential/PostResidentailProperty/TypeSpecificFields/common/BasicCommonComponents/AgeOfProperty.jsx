// import { ChevronDown } from "lucide-react";
// import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

 
// const PROPERTY_AGE_OPTS = [
//   { label: "Under Construction", value: "under-construction" },
//   { label: "0-1 Year", value: "0-1-year" },
//   { label: "1-5 Years", value: "1-5-years" },
//   { label: "5-10 Years", value: "5-10-years" },
//   { label: "10-20 Years", value: "10-20-years" },
//   { label: "20+ Years", value: "20-plus-years" }
// ];

// const AgeOfProperty = ({error}) => {
//   const { form, updateFieldValue } = useActivePropertySlice();

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//       <div className="space-y-3">
//         <p className="text-[13px] font-weight-bold text-[#000000] uppercase font-poppins">
//           Age of property
//         </p>
//         <div className="flex  gap-2">
//           {PROPERTY_AGE_OPTS.map((opt) => (
//             <button
//               key={opt.value}
//               type="button"
//               onClick={() => updateFieldValue("propertyAge", opt.value)}
//               className={`flex-1 p-3  text-nowrap rounded-lg border text-[13px]  font-weight-bold transition-all ${
//                 form.propertyAge === opt.value
//                   ? "border-[#27AE60] bg-[#F1FCF5] text-[#27AE60]"
//                   : "border-[#000000] text-[#000000]"
//               }`}
//             >
//               {opt.label}
//             </button>
//           ))}
//         </div>
//         {error && <div className="text-red-500">{error}</div>}
//       </div>
//     </div>
//   );

// };

// export default  AgeOfProperty;


//ci 

// AgeOfProperty.jsx
import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

const PROPERTY_AGE_OPTS = [
  { label: "Under Construction", value: "under-construction" },
  { label: "0–1 Year", value: "0-1-year" },
  { label: "1–5 Years", value: "1-5-years" },
  { label: "5–10 Years", value: "5-10-years" },
  { label: "10–20 Years", value: "10-20-years" },
  { label: "20+ Years", value: "20-plus-years" },
];

const AgeOfProperty = ({ error }) => {
  const { form, updateFieldValue } = useActivePropertySlice();

  return (
    <div className="space-y-2">
      <p className="text-xs font-bold text-[#374151] uppercase tracking-wide">
        Age of Property
      </p>
      <div className="flex flex-wrap gap-2">
        {PROPERTY_AGE_OPTS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => updateFieldValue("propertyAge", opt.value)}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold border-2 transition-all duration-150 whitespace-nowrap ${
              form.propertyAge === opt.value
                ? "border-[#27AE60] bg-[#f0fdf4] text-[#27AE60]"
                : "border-[#e5e7eb] text-[#6b7280] hover:border-[#bbf7d0] hover:text-[#27AE60]"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
    </div>
  );
};

export default AgeOfProperty;