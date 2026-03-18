// import React from "react";
// import {
//   Home,
//   Layers,
//   Zap,
//   Info,
//   Tag,
//   Clock,
//   Compass,
//   ArrowRightLeft,
//   ChevronDown,
// } from "lucide-react";
// import InputBox from "../components/editable/InputBox";

// // Import All Enums
// import * as Enums from "../components/editable/residentialEnums";
// import TotalArea from "../components/editable/TotalArea";


// export default function StepBasicDetails({ data, onChange, onSave }) {
//   if (!data) return null;

//   const category = data.propertyCategory || "residential";
//   const isLoading = data.loading; 

//   const handleUpdate = (field, value) => {
//     onChange(field, value, "basic");
//   };


//   const handleSubChildEdit = (field, value) => {
//     setData((prev) => {
//       if (field.includes(".")) {
//         const [parent, child] = field.split(".");
//         return {
//           ...prev,
//           [parent]: {
//             ...prev[parent],
//             [child]: value,
//           },
//         };
//       }

//       return {
//         ...prev,
//         [field]: value,
//       };
//     });
//   };
  

  
//   const getPropertyTypes = () => {
//     switch (category) {
//       case "commercial":
//         return Enums.COMMERCIAL_TYPES;
//       case "land":
//         return Enums.LAND_TYPES;
//       case "agricultural":
//         return Enums.AGRI_TYPES;
//       default:
//         return Enums.PROPERTY_TYPES;
//     }
//   };

//   const getPropertySubTypes = () => {
//     switch (category) {
//       case "commercial":
//         return Enums.COMMERCIAL_SUB_TYPES;
//       case "land":
//         return Enums.LAND_SUB_TYPES;
//       case "agricultural":
//         return Enums.AGRI_SUB_TYPES;
//       default:
//         return [];
//     }
//   };

//   /**
//    * Helper for Furnishing types based on category
//    */
//   const getFurnishingTypes = () => {
//     return category === "commercial"
//       ? Enums.FURNISHED_STATUS_COMMERCIAL
//       : Enums.FURNISHING_TYPES;
//   };

//   return (
//     <div className="space-y-10">
//       {/* 1. Primary Action: Listing & Property Type */}
//       <div className="grid grid-cols-1 gap-8">
//         <Section title="Intent" icon={<Tag className="w-4 h-4" />} required>
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
//             {Enums.LISTING_TYPES.map((item) => (
//               <SelectCard
//                 key={item.value}
//                 active={data.listingType === item.value}
//                 icon={item.icon}
//                 title={item.label}
//                 description={item.description}
//                 onClick={() => handleUpdate("listingType", item.value)}
//               />
//             ))}
//           </div>
//         </Section>

//         <Section title="Classification" icon={<Layers className="w-4 h-4" />}>
//           <div className="flex flex-wrap gap-2">
//             {getPropertyTypes().map((item) => (
//               <IconCard
//                 key={item.value}
//                 active={data.propertyType === item.value}
//                 icon={item.icon}
//                 label={item.label}
//                 onClick={() => handleUpdate("propertyType", item.value)}
//               />
//             ))}
//           </div>
//         </Section>
//         <Section title="Classification" icon={<Layers className="w-4 h-4" />}>
//           <div className="flex flex-wrap gap-2">
//             {getPropertySubTypes().map((item) => (
//               <IconCard
//                 key={item.value}
//                 active={data.propertySubType === item.value}
//                 icon={item.icon}
//                 label={item.label}
//                 onClick={() => handleUpdate("propertySubType", item.value)}
//               />
//             ))}
//           </div>
//         </Section>
//       </div>

//       {/* 2. Core Configurator: Only for Residential/Commercial */}
//       {(category === "residential" || category === "commercial") && (
//         <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-6">
//           <Counter
//             icon="🛏️"
//             label={category === "commercial" ? "Cabins" : "Bedrooms"}
//             value={
//               category === "commercial" ? data.cabins || 0 : data.bedrooms || 0
//             }
//             onChange={(v) =>
//               handleUpdate(category === "commercial" ? "cabins" : "bedrooms", v)
//             }
//           />
//           {category === "commercial" && (
//             <Counter
//               icon="🚿"
//               label="Seats"
//               value={data.seats || 0}
//               onChange={(v) => handleUpdate("seats", v)}
//             />
//           )}
//           {category === "residential" && (
//             <Counter
//               icon="🚿"
//               label="Bathrooms"
//               value={data.bathrooms || 0}
//               onChange={(v) => handleUpdate("bathrooms", v)}
//             />
//           )}
//           {category === "residential" && (
//             <Counter
//               icon="🏖️"
//               label="Balconies"
//               value={data.balconies || 0}
//               onChange={(v) => handleUpdate("balconies", v)}
//             />
//           )}
//         </div>
//       )}

//       {/* 3. Status & Attributes */}
//       {(category === "residential" || category === "commercial") && (
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
//           <Section
//             title="Furnishing Details"
//             icon={<Home className="w-4 h-4" />}
//           >
//             <div className="grid grid-cols-3 gap-3">
//               {getFurnishingTypes().map((item) => (
//                 <SelectCard
//                   key={item.value}
//                   active={
//                     data.furnishing === item.value ||
//                     data.furnishedStatus === item.value
//                   }
//                   icon={item.icon}
//                   title={item.label}
//                   compact
//                   onClick={() =>
//                     handleUpdate(
//                       category === "commercial"
//                         ? "furnishedStatus"
//                         : "furnishing",
//                       item.value,
//                     )
//                   }
//                 />
//               ))}
//             </div>
//           </Section>

//           {(category === "residential" || category === "commercial") && (
//             <Section title="Availability" icon={<Zap className="w-4 h-4" />}>
//               <div className="grid grid-cols-2 gap-3">
//                 {Enums.AVAILABILITY_TYPES.map((item) => (
//                   <StatusCard
//                     key={item.value}
//                     active={data.constructionStatus === item.value}
//                     icon={item.icon}
//                     title={item.label}
//                     onClick={() =>
//                       handleUpdate("constructionStatus", item.value)
//                     }
//                   />
//                 ))}
//               </div>
//             </Section>
//           )}
//         </div>
//       )}

//       {/* 4. Categorical Dropdowns */}

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         {(category === "residential" || category === "commercial") && (
//           <DropdownField
//             label="Property Age"
//             icon={<Clock className="w-4 h-4" />}
//             value={data.propertyAge}
//             options={Enums.PROPERTY_AGE_TYPES}
//             onChange={(v) => handleUpdate("propertyAge", v)}
//           />
//         )}
//         {category === "residential" ||
//           category === "commercial" ||
//           (category === "land" && (
//             <DropdownField
//               label="Transaction"
//               icon={<ArrowRightLeft className="w-4 h-4" />}
//               value={data.transactionType}
//               options={Enums.TRANSACTION_TYPES}
//               onChange={(v) => handleUpdate("transactionType", v)}
//             />
//           ))}
//         {category === "residential" && (
//           <DropdownField
//             label="Facing"
//             icon={<Compass className="w-4 h-4" />}
//             value={data.facing}
//             options={Enums.FACING_TYPES}
//             onChange={(v) => handleUpdate("facing", v)}
//           />
//         )}

//         {category === "commercial" && (
//           <DropdownField
//             label="wallFinishStatus"
//             icon={<Compass className="w-4 h-4" />}
//             value={data.wallFinishStatus}
//             options={Enums.WALL_FINISH_STATUS}
//             onChange={(v) => handleUpdate("wallFinishStatus", v)}
//           />
//         )}
//       </div>

//       {/* 5. Financials & Space */}
//       {category === "residential" ||
//         category === "commercial" ||
//         (category === "land" && (
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//             <div className="group bg-white p-1 rounded-[2rem] border-2 border-slate-100 hover:border-green-200 transition-all duration-300">
//               <div className="bg-green-50/40 rounded-[1.8rem] p-6">
//                 <h4 className="text-green-700 font-bold text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
//                   <span className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
//                     ₹
//                   </span>
//                   Commercial Terms
//                 </h4>
//                 <div className="grid grid-cols-2 gap-4">
//                   <InputBox label="Expected Price">
//                     <input
//                       type="number"
//                       placeholder="0.00"
//                       value={data.price || ""}
//                       onChange={(e) => handleUpdate("price", e.target.value)}
//                       className="w-full bg-white px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-green-500 outline-none font-bold text-slate-700"
//                     />
//                   </InputBox>
//                   <InputBox label="Price per sqft">
//                     <input
//                       type="number"
//                       placeholder="0.00"
//                       value={data.pricePerSqft || ""}
//                       onChange={(e) =>
//                         handleUpdate("pricePerSqft", e.target.value)
//                       }
//                       className="w-full bg-white px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-green-500 outline-none font-bold text-slate-700"
//                     />
//                   </InputBox>
//                 </div>
//               </div>
//             </div>

//             {(category === "residential" || category === "commercial") && (
//               <div className="group bg-white p-1 rounded-[2rem] border-2 border-slate-100 hover:border-blue-200 transition-all duration-300">
//                 <div className="bg-blue-50/40 rounded-[1.8rem] p-6">
//                   <h4 className="text-blue-700 font-bold text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
//                     <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
//                       📐
//                     </span>
//                     Dimension Metrics
//                   </h4>
//                   <div className="grid grid-cols-2 gap-4">
//                     <InputBox label="Built-up Area (sqft)">
//                       <input
//                         type="number"
//                         placeholder="0.00"
//                         value={data.builtUpArea || ""}
//                         onChange={(e) =>
//                           handleUpdate("builtUpArea", e.target.value)
//                         }
//                         className="w-full bg-white px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700"
//                       />
//                     </InputBox>
//                     <InputBox label="Carpet Area (sqft)">
//                       <input
//                         type="number"
//                         placeholder="0.00"
//                         value={data.carpetArea || ""}
//                         onChange={(e) =>
//                           handleUpdate("carpetArea", e.target.value)
//                         }
//                         className="w-full bg-white px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700"
//                       />
//                     </InputBox>
//                   </div>
//                 </div>
//               </div>
//             )}
//             {category === "land" && (
//               <div className="group bg-white p-1 rounded-[2rem] border-2 border-slate-100 hover:border-blue-200 transition-all duration-300">
//                 <div className="bg-blue-50/40 rounded-[1.8rem] p-6">
//                   <h4 className="text-blue-700 font-bold text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
//                     <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
//                       📐
//                     </span>
//                     Dimension Metrics
//                   </h4>
//                   <div className="grid grid-cols-2 gap-4">
//                     <InputBox label="Length">
//                       <input
//                         type="number"
//                         placeholder="0"
//                         value={data.dimensions?.length || ""}
//                         onChange={(e) =>
//                           handleUpdate("dimensions", {
//                             ...data.dimensions,
//                             length: e.target.value,
//                           })
//                         }
//                         className="w-full bg-white px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700"
//                       />
//                     </InputBox>
//                     <InputBox label="width">
//                       <input
//                         type="number"
//                         placeholder="0"
//                         value={data.dimensions?.width || ""}
//                         onChange={(e) =>
//                           handleUpdate("dimensions", {
//                             ...data.dimensions,
//                             width: e.target.value,
//                           })
//                         }
//                         className="w-full bg-white px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700"
//                       />
//                     </InputBox>
//                   </div>
//                   <div className="grid grid-cols-2 gap-4 ">
//                     <InputBox label="Road Width (ft)" units={["Ft"]}>
//                       <input
//                         type="number"
//                         placeholder="0"
//                         value={data.roadWidthFt || ""}
//                         onChange={(e) =>
//                           handleUpdate("roadWidthFt", e.target.value)
//                         }
//                         className="w-full bg-white px-4 py-3 rounded-xl 
//                       outline-none font-bold text-slate-700"
//                       />
//                     </InputBox>
//                     {/* <InputBox label="Plot Area" units={["sqft"]}>
//                   <input
//                     type="number"
//                     placeholder="0"
//                     value={data.plotArea || ""}
//                     onChange={(e) => handleUpdate("plotArea", e.target.value)}
//                     className="w-full bg-white px-4 py-3 rounded-xl 
//                       outline-none font-bold text-slate-700"
//                   />
//                 </InputBox> */}
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         ))}

//       {category === "agricultural" && (
//         <div className="group bg-white p-1 rounded-[2rem] border-2 border-slate-100 hover:border-blue-200 transition-all duration-300">
//           <div className="bg-blue-50/40 rounded-[1.8rem] p-6">
//             <h4 className="text-blue-700 font-bold text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
//               <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
//                 📐
//               </span>
//               Dimension Metrics
//             </h4>
//             <div className="grid grid-cols-2 gap-4 ">
//               <InputBox label="Road Width (ft)" units={["ft", "metter"]}>
//                 <input
//                   type="number"
//                   placeholder="0"
//                   value={data.roadWidthFt || ""}
//                   onChange={(e) => handleUpdate("roadWidthFt", e.target.value)}
//                   className="w-full bg-white px-4 py-3 rounded-xl 
//                       outline-none font-bold text-slate-700"
//                 />
//               </InputBox>
//               {/* Total Area Input */}
              
//                 <TotalArea
//                   value={data.totalArea}
//                   onChange={(val) => handleUpdate("totalArea", val)}
//                 />
//             </div>
//           </div>
//         </div>
//       )}

//       {/* 6. ACTION FOOTER (Updated with Save Button) */}
//       <div className="pt-10 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
//         <div className="flex items-center gap-3">
//           <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
//             <Info className="w-5 h-5" />
//           </div>
//           <div>
//             <p className="text-sm font-black text-slate-700">Basic Details</p>
//             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
//               Cloud sync ensures your progress is never lost
//             </p>
//           </div>
//         </div>

//         <button
//           type="button"
//           disabled={isLoading}
//           onClick={onSave}
//           className={`group relative inline-flex items-center justify-center gap-3 px-10 py-4 bg-slate-900 hover:bg-black text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-slate-200 ${
//             isLoading ? "opacity-70 cursor-not-allowed" : ""
//           }`}
//         >
//           {isLoading ? (
//             <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
//           ) : (
//             <Zap className="w-4 h-4 text-yellow-400 group-hover:animate-pulse" />
//           )}
//           {isLoading ? "Syncing..." : "Save & Sync Changes"}
//         </button>
//       </div>
//     </div>
//   );
// }

// /* ==========================================================================
//    INTERNAL UI COMPONENTS
//    ========================================================================== */

// function Section({ title, icon, required, children }) {
//   return (
//     <div className="space-y-4">
//       <div className="flex items-center gap-2 px-1">
//         <span className="text-slate-400">{icon}</span>
//         <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">
//           {title}
//         </h3>
//         {required && (
//           <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
//         )}
//       </div>
//       {children}
//     </div>
//   );
// }

// function SelectCard({ active, icon, title, description, compact, onClick }) {
//   return (
//     <button
//       type="button"
//       onClick={onClick}
//       className={`relative w-full text-left transition-all duration-300 group ${
//         compact ? "p-3 rounded-xl" : "p-5 rounded-2xl"
//       } border-2 ${
//         active
//           ? "border-[#27AE60] bg-green-50/50 ring-4 ring-green-500/5"
//           : "border-slate-100 bg-white hover:border-slate-200"
//       }`}
//     >
//       <div className="flex items-center gap-3">
//         <span
//           className={`text-2xl transition-transform duration-500 ${active ? "scale-110" : "group-hover:scale-110"}`}
//         >
//           {icon}
//         </span>
//         <div>
//           <p
//             className={`font-bold text-sm ${active ? "text-green-800" : "text-slate-700"}`}
//           >
//             {title}
//           </p>
//           {!compact && description && (
//             <p className="text-[10px] text-slate-400 font-medium leading-tight mt-0.5">
//               {description}
//             </p>
//           )}
//         </div>
//       </div>
//       {active && (
//         <div className="absolute top-2 right-2">
//           <div className="w-4 h-4 bg-[#27AE60] rounded-full flex items-center justify-center">
//             <div className="w-1.5 h-1.5 bg-white rounded-full" />
//           </div>
//         </div>
//       )}
//     </button>
//   );
// }

// function IconCard({ active, icon, label, onClick }) {
//   return (
//     <button
//       type="button"
//       onClick={onClick}
//       className={`px-4 py-3 rounded-xl border-2 transition-all flex items-center gap-2 shrink-0 ${
//         active
//           ? "border-[#27AE60] bg-green-50 text-green-700 shadow-sm"
//           : "border-slate-100 bg-white text-slate-500 hover:border-slate-200"
//       }`}
//     >
//       <span className="text-lg">{icon}</span>
//       <span className="text-xs font-bold whitespace-nowrap">{label}</span>
//     </button>
//   );
// }

// function Counter({ icon, label, value, onChange }) {
//   return (
//     <div className="flex flex-col gap-2">
//       <div className="flex items-center gap-2 px-1">
//         <span className="text-sm">{icon}</span>
//         <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
//           {label}
//         </span>
//       </div>
//       <div className="flex items-center bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
//         <button
//           type="button"
//           onClick={() => onChange(Math.max(0, value - 1))}
//           className="w-10 h-10 flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors"
//         >
//           −
//         </button>
//         <span className="flex-1 text-center font-black text-slate-700">
//           {value}
//         </span>
//         <button
//           type="button"
//           onClick={() => onChange(value + 1)}
//           className="w-10 h-10 flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors"
//         >
//           +
//         </button>
//       </div>
//     </div>
//   );
// }

// function DropdownField({ label, icon, value, options, onChange }) {
//   const [isOpen, setIsOpen] = React.useState(false);
//   const selected = options.find((o) => o.value === value);

//   return (
//     <div className="space-y-2">
//       <div className="flex items-center gap-2 px-1 text-slate-400">
//         {icon}
//         <span className="text-[11px] font-black uppercase tracking-widest">
//           {label}
//         </span>
//       </div>
//       <div className="relative">
//         <button
//           type="button"
//           onClick={() => setIsOpen(!isOpen)}
//           className={`w-full flex items-center justify-between px-4 py-3 bg-white border-2 rounded-xl transition-all ${
//             isOpen
//               ? "border-green-500 ring-4 ring-green-500/5"
//               : "border-slate-100"
//           }`}
//         >
//           <div className="flex items-center gap-2">
//             {selected ? (
//               <>
//                 <span className="text-lg">{selected.icon}</span>
//                 <span className="text-sm font-bold text-slate-700">
//                   {selected.label}
//                 </span>
//               </>
//             ) : (
//               <span className="text-sm text-slate-400">Select {label}</span>
//             )}
//           </div>
//           <ChevronDown
//             className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
//           />
//         </button>

//         {isOpen && (
//           <>
//             <div
//               className="fixed inset-0 z-[60]"
//               onClick={() => setIsOpen(false)}
//             />
//             <div className="absolute z-[70] w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden py-2 animate-in fade-in zoom-in-95 duration-200">
//               {options.map((opt) => (
//                 <button
//                   key={opt.value}
//                   type="button"
//                   onClick={() => {
//                     onChange(opt.value);
//                     setIsOpen(false);
//                   }}
//                   className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors ${
//                     value === opt.value ? "bg-green-50/50" : ""
//                   }`}
//                 >
//                   <span className="text-lg">{opt.icon}</span>
//                   <span
//                     className={`text-sm ${value === opt.value ? "font-bold text-green-700" : "font-medium text-slate-600"}`}
//                   >
//                     {opt.label}
//                   </span>
//                 </button>
//               ))}
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }

// function StatusCard({ active, icon, title, onClick }) {
//   return (
//     <button
//       type="button"
//       onClick={onClick}
//       className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
//         active
//           ? "border-green-500 bg-green-50/50"
//           : "border-slate-100 bg-white hover:border-slate-200"
//       }`}
//     >
//       <span className="text-2xl">{icon}</span>
//       <span
//         className={`text-sm font-black ${active ? "text-green-800" : "text-slate-600"}`}
//       >
//         {title}
//       </span>
//     </button>
//   );
// }


//ci 


// StepBasicDetails.jsx — Premium Emerald Theme, Full Responsive
import React from "react";
import {
  Home, Layers, Zap, Info, Tag, Clock, Compass,
  ArrowRightLeft, ChevronDown, Save, Minus, Plus
} from "lucide-react";
import * as Enums from "../components/editable/residentialEnums";
import TotalArea from "../components/editable/TotalArea";

const ROAD_WIDTH_UNITS = [
  { label: "Feet", value: "ft", icon: "📏" },
  { label: "Meters", value: "m", icon: "📐" },
];

export default function StepBasicDetails({ data, onChange, onSave }) {
  if (!data) return null;
  const cat = data.propertyCategory || "residential";
  const isLoading = data.loading;
  const upd = (f, v) => onChange(f, v, "basic");

  const propertyTypes = () => ({ commercial: Enums.COMMERCIAL_TYPES, land: Enums.LAND_TYPES, agricultural: Enums.AGRI_TYPES })[cat] || Enums.PROPERTY_TYPES;
  const subTypes = () => ({ commercial: Enums.COMMERCIAL_SUB_TYPES, land: Enums.LAND_SUB_TYPES, agricultural: Enums.AGRI_SUB_TYPES })[cat] || [];
  const furnishTypes = () => cat === "commercial" ? Enums.FURNISHED_STATUS_COMMERCIAL : Enums.FURNISHING_TYPES;

  return (
    <div className="space-y-8">
      {/* Intent */}
      <Block
        label="Listing Intent"
        icon={<Tag className="w-3.5 h-3.5" />}
        required
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Enums.LISTING_TYPES.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => upd("listingType", item.value)}
              className="relative text-left p-4 rounded-2xl border-2 transition-all"
              style={{
                borderColor:
                  data.listingType === item.value ? "#27AE60" : "#f1f5f9",
                background:
                  data.listingType === item.value
                    ? "linear-gradient(135deg,#f0fdf4,#f8fffe)"
                    : "#fff",
                boxShadow:
                  data.listingType === item.value
                    ? "0 4px 20px #27AE6018"
                    : "none",
              }}
            >
              <span
                className={`text-2xl block mb-2 transition-transform ${data.listingType === item.value ? "scale-110" : ""}`}
              >
                {item.icon}
              </span>
              <p
                className={`font-black text-sm ${data.listingType === item.value ? "text-[#1a7a43]" : "text-slate-700"}`}
              >
                {item.label}
              </p>
              {item.description && (
                <p className="text-[10px] text-slate-400 mt-0.5 font-medium leading-tight">
                  {item.description}
                </p>
              )}
              {data.listingType === item.value && (
                <span className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-[#27AE60] flex items-center justify-center">
                  <span className="w-1.5 h-1.5 bg-white rounded-full" />
                </span>
              )}
            </button>
          ))}
        </div>
      </Block>

      {/* Property Type */}
      <Block label="Property Type" icon={<Layers className="w-3.5 h-3.5" />}>
        <div className="flex flex-wrap gap-2">
          {propertyTypes().map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => upd("propertyType", item.value)}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all border-2"
              style={{
                borderColor:
                  data.propertyType === item.value ? "#27AE60" : "#f1f5f9",
                background:
                  data.propertyType === item.value ? "#f0fdf4" : "#fff",
                color: data.propertyType === item.value ? "#15803d" : "#64748b",
                boxShadow:
                  data.propertyType === item.value
                    ? "0 2px 12px #27AE6020"
                    : "none",
              }}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      </Block>

      {/* Sub-type */}
      {subTypes().length > 0 && (
        <Block label="Sub Type" icon={<Layers className="w-3.5 h-3.5" />}>
          <div className="flex flex-wrap gap-2">
            {subTypes().map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => upd("propertySubType", item.value)}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all border-2"
                style={{
                  borderColor:
                    data.propertySubType === item.value ? "#27AE60" : "#f1f5f9",
                  background:
                    data.propertySubType === item.value ? "#f0fdf4" : "#fff",
                  color:
                    data.propertySubType === item.value ? "#15803d" : "#64748b",
                }}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        </Block>
      )}

      {/* Room Counters */}
      {(cat === "residential" || cat === "commercial") && (
        <div
          className="rounded-2xl border border-[#27AE60]/15 p-5"
          style={{ background: "linear-gradient(135deg, #f0fdf4, #f8fffe)" }}
        >
          <p className="text-[10px] font-black text-[#27AE60] uppercase tracking-widest mb-4">
            Room Configuration
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <RoomCounter
              icon="🛏️"
              label={cat === "commercial" ? "Cabins" : "Bedrooms"}
              value={
                cat === "commercial" ? data.cabins || 0 : data.bedrooms || 0
              }
              onChange={(v) =>
                upd(cat === "commercial" ? "cabins" : "bedrooms", v)
              }
            />
            {cat === "commercial" && (
              <RoomCounter
                icon="💺"
                label="Seats"
                value={data.seats || 0}
                onChange={(v) => upd("seats", v)}
              />
            )}
            {cat === "residential" && (
              <RoomCounter
                icon="🚿"
                label="Bathrooms"
                value={data.bathrooms || 0}
                onChange={(v) => upd("bathrooms", v)}
              />
            )}
            {cat === "residential" && (
              <RoomCounter
                icon="🏖️"
                label="Balconies"
                value={data.balconies || 0}
                onChange={(v) => upd("balconies", v)}
              />
            )}
          </div>
        </div>
      )}

      {/* Furnishing + Availability */}
      {(cat === "residential" || cat === "commercial") && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Block label="Furnishing" icon={<Home className="w-3.5 h-3.5" />}>
            <div className="grid grid-cols-3 gap-2">
              {furnishTypes().map((item) => {
                const active =
                  data.furnishing === item.value ||
                  data.furnishedStatus === item.value;
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() =>
                      upd(
                        cat === "commercial" ? "furnishedStatus" : "furnishing",
                        item.value,
                      )
                    }
                    className="p-3 rounded-xl border-2 text-center transition-all"
                    style={{
                      borderColor: active ? "#27AE60" : "#f1f5f9",
                      background: active ? "#f0fdf4" : "#fff",
                    }}
                  >
                    <span className="text-xl block mb-1">{item.icon}</span>
                    <span
                      className={`text-[10px] font-black uppercase tracking-tight ${active ? "text-[#15803d]" : "text-slate-400"}`}
                    >
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </Block>
          <Block label="Availability" icon={<Zap className="w-3.5 h-3.5" />}>
            <div className="grid grid-cols-2 gap-2">
              {Enums.AVAILABILITY_TYPES.map((item) => {
                const active = data.constructionStatus === item.value;
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => upd("constructionStatus", item.value)}
                    className="flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all"
                    style={{
                      borderColor: active ? "#27AE60" : "#f1f5f9",
                      background: active
                        ? "linear-gradient(135deg,#f0fdf4,#f8fffe)"
                        : "#fff",
                    }}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span
                      className={`text-sm font-black ${active ? "text-[#15803d]" : "text-slate-600"}`}
                    >
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </Block>
        </div>
      )}

      {/* Dropdowns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {(cat === "residential" || cat === "commercial") && (
          <ElegantDrop
            label="Property Age"
            icon={<Clock className="w-3.5 h-3.5" />}
            value={data.propertyAge}
            options={Enums.PROPERTY_AGE_TYPES}
            onChange={(v) => upd("propertyAge", v)}
          />
        )}
        {(cat === "residential" || cat === "commercial" || cat === "land") && (
          <ElegantDrop
            label="Transaction"
            icon={<ArrowRightLeft className="w-3.5 h-3.5" />}
            value={data.transactionType}
            options={Enums.TRANSACTION_TYPES}
            onChange={(v) => upd("transactionType", v)}
          />
        )}
        {cat === "residential" && (
          <ElegantDrop
            label="Facing"
            icon={<Compass className="w-3.5 h-3.5" />}
            value={data.facing}
            options={Enums.FACING_TYPES}
            onChange={(v) => upd("facing", v)}
          />
        )}
        {cat === "commercial" && (
          <ElegantDrop
            label="Wall Finish"
            icon={<Compass className="w-3.5 h-3.5" />}
            value={data.wallFinishStatus}
            options={Enums.WALL_FINISH_STATUS}
            onChange={(v) => upd("wallFinishStatus", v)}
          />
        )}
      </div>

      {/* Financials */}
      {(cat === "residential" || cat === "commercial" || cat === "land") && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <FinCard
            headerColor="#27AE60"
            headerIcon="₹"
            headerLabel="Price Terms"
          >
            <div className="grid grid-cols-2 gap-3 mt-4">
              <NumField
                label="Expected Price"
                value={data.price || ""}
                onChange={(v) => upd("price", v)}
                prefix="₹"
              />
              <NumField
                label="Price / sqft"
                value={data.pricePerSqft || ""}
                onChange={(v) => upd("pricePerSqft", v)}
                prefix="₹"
              />
            </div>
          </FinCard>
          <FinCard
            headerColor="#3B82F6"
            headerIcon="📐"
            headerLabel="Dimension Metrics"
          >
            <div className="grid grid-cols-2 gap-3 mt-4">
              {(cat === "residential" || cat === "commercial") && (
                <>
                  <NumField
                    label="Built-up (sqft)"
                    value={data.builtUpArea || ""}
                    onChange={(v) => upd("builtUpArea", v)}
                  />
                  <NumField
                    label="Carpet (sqft)"
                    value={data.carpetArea || ""}
                    onChange={(v) => upd("carpetArea", v)}
                  />
                </>
              )}
              {cat === "land" && (
                <>
                  <NumField
                    label="Length"
                    value={data.dimensions?.length || ""}
                    onChange={(v) =>
                      upd("dimensions", { ...data.dimensions, length: v })
                    }
                  />
                  <NumField
                    label="Width"
                    value={data.dimensions?.width || ""}
                    onChange={(v) =>
                      upd("dimensions", { ...data.dimensions, width: v })
                    }
                  />
                  <NumField
                    label="Road Width (ft)"
                    value={data.roadWidthFt || ""}
                    onChange={(v) => upd("roadWidthFt", v)}
                  />
                  <NumField
                    label="Plot Area"
                    value={data.plotArea || ""}
                    onChange={(v) => upd("plotArea", v)}
                  />
                </>
              )}
            </div>
          </FinCard>
        </div>
      )}

      {cat === "agricultural" && (
        <FinCard
          headerColor="#3B82F6"
          headerIcon="📐"
          headerLabel="Dimension Metrics"
        >
          <div className="grid grid-cols-2 gap-3 mt-4">
            {/* <NumField label="Road Width (ft)" value={data.roadWidth || ""} onChange={(v) => upd("roadWidth", v)} /> */}
            <div className="grid grid-cols-2 gap-3">
              <NumField
                label="Road Width"
                value={data.roadWidth?.value || ""}
                onChange={(v) =>
                  upd("roadWidth", { ...data.roadWidth, value: v })
                }
              />

              <ElegantDrop
                label="Unit"
                icon={<Compass className="w-3.5 h-3.5" />}
                value={data.roadWidth?.unit}
                options={ROAD_WIDTH_UNITS}
                onChange={(v) =>
                  upd("roadWidth", { ...data.roadWidth, unit: v })
                }
              />
            </div>
            <TotalArea
              value={data.totalArea}
              onChange={(val) => upd("totalArea", val)}
            />
            <FinCard
              headerColor="#27AE60"
              headerIcon="₹"
              headerLabel="Commercial Terms"
            >
              <div className="grid grid-cols-2 gap-3 mt-4">
                <NumField
                  label="Expected Price"
                  value={data.price || ""}
                  onChange={(v) => upd("price", v)}
                  prefix="₹"
                />
                
              </div>
            </FinCard>
          </div>
        </FinCard>
      )}

      {/* Footer */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6 border-t border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-[#27AE60]/10 flex items-center justify-center shrink-0">
            <Info className="w-4 h-4 text-[#27AE60]" />
          </div>
          <div>
            <p className="text-xs font-black text-slate-700">Basic Details</p>
            <p className="text-[10px] text-slate-400 font-medium">
              Progress auto-saved to cloud
            </p>
          </div>
        </div>
        <button
          type="button"
          disabled={isLoading}
          onClick={onSave}
          className="flex items-center gap-2.5 px-7 py-3.5 rounded-2xl text-white text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
          style={{
            background: isLoading
              ? "#94a3b8"
              : "linear-gradient(135deg, #27AE60, #1e9e52)",
            boxShadow: isLoading ? "none" : "0 8px 25px #27AE6035",
          }}
        >
          {isLoading ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Syncing...
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              Save & Sync
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function Block({ label, icon, required, children }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-slate-400">{icon}</span>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.18em]">{label}</span>
        {required && <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />}
      </div>
      {children}
    </div>
  );
}

function RoomCounter({ icon, label, value, onChange }) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center gap-1.5"><span className="text-sm">{icon}</span><span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">{label}</span></div>
      <div className="flex items-center bg-white rounded-xl border border-[#27AE60]/20 overflow-hidden shadow-sm">
        <button type="button" onClick={() => onChange(Math.max(0, value - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-red-50 hover:text-red-500 text-slate-400 transition-colors border-r border-slate-100"><Minus className="w-3.5 h-3.5" /></button>
        <span className="flex-1 text-center font-black text-slate-800 tabular-nums">{value}</span>
        <button type="button" onClick={() => onChange(value + 1)} className="w-10 h-10 flex items-center justify-center hover:bg-[#27AE60]/10 hover:text-[#27AE60] text-slate-400 transition-colors border-l border-slate-100"><Plus className="w-3.5 h-3.5" /></button>
      </div>
    </div>
  );
}

function ElegantDrop({ label, icon, value, options, onChange }) {
  const [open, setOpen] = React.useState(false);
  const sel = options.find((o) => o.value === value);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 text-slate-400">{icon}<span className="text-[10px] font-black uppercase tracking-widest">{label}</span></div>
      <div className="relative">
        <button type="button" onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-4 py-3 bg-white border-2 rounded-xl text-sm transition-all"
          style={{ borderColor: open ? "#27AE60" : "#f1f5f9", boxShadow: open ? "0 0 0 4px #27AE6010" : "none" }}>
          <div className="flex items-center gap-2">
            {sel ? <><span className="text-base">{sel.icon}</span><span className="font-bold text-slate-700">{sel.label}</span></> : <span className="text-slate-400 font-medium">Select {label}</span>}
          </div>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-[60]" onClick={() => setOpen(false)} />
            <div className="absolute z-[70] w-full mt-1.5 bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden py-1" style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.12)" }}>
              {options.map((opt) => (
                <button key={opt.value} type="button" onClick={() => { onChange(opt.value); setOpen(false); }}
                  className="w-full px-4 py-3 flex items-center gap-3 text-sm hover:bg-[#f0fdf4] transition-colors"
                  style={{ background: value === opt.value ? "#f0fdf4" : "" }}>
                  <span className="text-base">{opt.icon}</span>
                  <span className={value === opt.value ? "font-black text-[#15803d]" : "font-medium text-slate-600"}>{opt.label}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function FinCard({ children, headerColor, headerIcon, headerLabel }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-xl flex items-center justify-center text-white text-sm font-black" style={{ background: headerColor }}>{headerIcon}</div>
        <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: headerColor }}>{headerLabel}</span>
      </div>
      {children}
    </div>
  );
}

function NumField({ label, value, onChange, prefix }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
      <div className="flex items-center bg-slate-50 rounded-xl border-2 border-transparent focus-within:border-[#27AE60]/30 focus-within:bg-white transition-all overflow-hidden">
        {prefix && <span className="pl-3 text-slate-400 font-bold text-sm shrink-0">{prefix}</span>}
        <input type="number" placeholder="0" value={value} onChange={(e) => onChange(e.target.value)} className="flex-1 px-3 py-3 outline-none font-bold text-slate-700 text-sm bg-transparent" />
      </div>
    </div>
  );
}