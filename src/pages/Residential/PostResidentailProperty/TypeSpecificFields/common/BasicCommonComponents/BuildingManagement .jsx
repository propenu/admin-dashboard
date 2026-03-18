
// import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

// const BuildingManagement = ({errors={}}) => {
//   const { form, updateNestedFieldValue } = useActivePropertySlice();

//   const buildingManagement = form.buildingManagement || {
//     security: false,
//     managedBy: "",
//     contact: "",
//   };

//   const isSecurityEnabled = !!buildingManagement.security;

//   return (
//     <div  className="pt-3 space-y-4">
//       <p className="text-[13px] font-weight-bold text-[#000000] uppercase font-poppins">
//         Building Management
//       </p>

//       {/* ✅ Security Toggle (STABLE) */}
//       <div className="flex items-center justify-between h-[52px] px-4 border border-gray-200 rounded-lg">
//         <span className="text-sm font-weight-bold text-[#000000]">
//           Managed Security
//         </span>

//         <button
//           type="button"
//           role="switch"
//           aria-checked={isSecurityEnabled}
//           onClick={() =>
//             updateNestedFieldValue(
//               "buildingManagement",
//               "security",
//               !isSecurityEnabled
//             )
//           }
//           className={`relative w-11 h-6 rounded-full transition-colors ${
//             isSecurityEnabled ? "bg-[#27AE60]" : "bg-gray-300"
//           }`}
//         >
//           <span
//             className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
//               isSecurityEnabled ? "translate-x-5" : ""
//             }`}
//           />
//         </button>

        
//       </div>

//       {/* Managed By */}
//       <div className="space-y-2">
//         <p className="text-[12px] font-weight-bold text-[#000000] uppercase">
//           Managed By
//         </p>
//         <input
//           type="text"
//           value={buildingManagement.managedBy || ""}
//           onChange={(e) =>
//             updateNestedFieldValue(
//               "buildingManagement",
//               "managedBy",
//               e.target.value
//             )
//           }
//           placeholder="e.g. Facility Management Company"
//           className="w-full p-3 border border-[#27AD75] rounded-lg text-sm font-weight-bold outline-none bg-white"
//         />
//         {errors.managedBy && (
//           <p className="text-red-500 text-xs">{errors.managedBy}</p>
//         )}
//       </div>

//       {/* Contact */}
//       <div className="space-y-2">
//         <p className="text-[12px] font-weight-bold text-[#000000] uppercase">
//           Contact Number
//         </p>
//         <input
//           type="text"
//           value={buildingManagement.contact || ""}
//           onChange={(e) =>
//             updateNestedFieldValue(
//               "buildingManagement",
//               "contact",
//               e.target.value
//             )
//           }
//           placeholder="Contact person / number"
//           className="w-full p-3 border placeholder:text[#525252] border-[#27AD75] rounded-lg text-sm font-weight-bold outline-none bg-white"
//         />
//         {errors.contact && (
//           <p className="text-red-500 text-xs">{errors.contact}</p>
//         )}
//       </div>

       
//     </div>
//   );
// };

// export default BuildingManagement;


//ci 

// BuildingManagement.jsx
import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

const inputCls = "w-full px-4 py-3 border-2 border-[#e5e7eb] rounded-xl outline-none text-sm font-semibold placeholder:text-[#c9c9c9] text-[#111827] focus:border-[#27AE60] focus:ring-2 focus:ring-[#27AE60]/10 transition-all";

const BuildingManagement = ({ errors = {} }) => {
  const { form, updateNestedFieldValue } = useActivePropertySlice();
  const bm = form.buildingManagement || { security: false, managedBy: "", contact: "" };
  const isSecurityEnabled = !!bm.security;

  return (
    <div className="space-y-4">
      <p className="text-xs font-bold text-[#374151] uppercase tracking-wide">Building Management</p>

      {/* Security Toggle */}
      <div className="flex items-center justify-between px-4 py-3.5 border-2 border-[#e5e7eb] rounded-xl hover:border-[#bbf7d0] transition-colors">
        <div>
          <p className="text-sm font-bold text-[#111827]">Managed Security</p>
          <p className="text-xs text-[#9ca3af] mt-0.5">24/7 security personnel on premises</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={isSecurityEnabled}
          onClick={() => updateNestedFieldValue("buildingManagement", "security", !isSecurityEnabled)}
          className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${isSecurityEnabled ? "bg-[#27AE60]" : "bg-[#e5e7eb]"}`}
        >
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${isSecurityEnabled ? "translate-x-5" : ""}`} />
        </button>
      </div>

      {/* Managed By */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-[#374151]">Managed By</label>
        <input
          type="text"
          value={bm.managedBy || ""}
          onChange={(e) => updateNestedFieldValue("buildingManagement", "managedBy", e.target.value)}
          placeholder="e.g. Facility Management Company"
          className={inputCls}
        />
        {errors.managedBy && <p className="text-red-500 text-xs font-medium">{errors.managedBy}</p>}
      </div>

      {/* Contact */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-[#374151]">Contact Number</label>
        <input
          type="text"
          value={bm.contact || ""}
          onChange={(e) => updateNestedFieldValue("buildingManagement", "contact", e.target.value)}
          placeholder="Contact person / number"
          className={inputCls}
        />
        {errors.contact && <p className="text-red-500 text-xs font-medium">{errors.contact}</p>}
      </div>
    </div>
  );
};

export default BuildingManagement;
