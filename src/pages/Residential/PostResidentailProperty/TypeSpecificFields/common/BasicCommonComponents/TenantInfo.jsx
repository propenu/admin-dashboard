// //  export default TenantInfo;
// import { forwardRef, useState } from "react";
// import { Plus, X } from "lucide-react";
// import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

// const emptyTenant = {
//   currentTenant: "",
//   leaseStart: "",
//   leaseEnd: "",
//   rent: "",
// };

// const TenantInfo = forwardRef(({ errors = {} }, ref) => {
//   const { form, updateFieldValue } = useActivePropertySlice();

//   // Ensure tenantInfo is always array
//   const tenants = Array.isArray(form.tenantInfo) ? form.tenantInfo : [];

//   const [showModal, setShowModal] = useState(false);
//   const [draft, setDraft] = useState(emptyTenant);

//   const addTenant = () => {
//     if (!draft.currentTenant.trim()) return;

//     const formattedTenant = {
//       currentTenant: draft.currentTenant.trim(),
//       leaseStart: draft.leaseStart || "",
//       leaseEnd: draft.leaseEnd || "",
//       rent: draft.rent ? Number(draft.rent) : 0,
//     };

//     updateFieldValue("tenantInfo", [...tenants, formattedTenant]);

//     setDraft(emptyTenant);
//     setShowModal(false);
//   };

//   const removeTenant = (index) => {
//     const updated = tenants.filter((_, i) => i !== index);
//     updateFieldValue("tenantInfo", updated);
//   };

//   return (
//     <div ref={ref} className="pt-3 space-y-4">
//       <div className="flex items-center justify-between">
//         <p className="text-[13px] font-bold uppercase">Tenant Information</p>

//         {errors.tenantInfo && (
//           <p className="text-red-500 text-sm">{errors.tenantInfo}</p>
//         )}

//         <button
//           type="button"
//           onClick={() => setShowModal(true)}
//           className="flex items-center gap-1 text-sm font-semibold text-green-600"
//         >
//           <Plus size={16} /> Add Tenant
//         </button>
//       </div>

//       {/* TENANT LIST */}
//       {tenants.length === 0 && (
//         <p className="text-sm text-gray-500">No tenants added</p>
//       )}

//       <div className="space-y-3">
//         {tenants.map((t, i) => (
//           <div key={i} className="relative border rounded-lg p-4 bg-white">
//             <button
//               type="button"
//               onClick={() => removeTenant(i)}
//               className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
//             >
//               <X size={14} />
//             </button>

//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
//               <div>
//                 <p className="text-gray-500">Tenant</p>
//                 <p className="font-semibold">{t.currentTenant}</p>
//               </div>

//               <div>
//                 <p className="text-gray-500">Lease Start</p>
//                 <p className="font-semibold">{t.leaseStart || "-"}</p>
//               </div>

//               <div>
//                 <p className="text-gray-500">Lease End</p>
//                 <p className="font-semibold">{t.leaseEnd || "-"}</p>
//               </div>

//               <div>
//                 <p className="text-gray-500">Rent</p>
//                 <p className="font-semibold">₹ {t.rent || 0}</p>

//                 {errors[`tenantInfo.${i}.rent`] && (
//                   <p className="text-xs text-red-500 mt-1">
//                     {errors[`tenantInfo.${i}.rent`]}
//                   </p>
//                 )}
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* MODAL */}
//       {showModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
//           <div className="bg-white rounded-xl w-full max-w-md p-6 space-y-4">
//             <div className="flex justify-between items-center">
//               <p className="font-bold">Add Tenant</p>
//               <button onClick={() => setShowModal(false)}>
//                 <X size={18} />
//               </button>
//             </div>

//             <div className="space-y-3">
//               <input
//                 type="text"
//                 placeholder="Tenant Name"
//                 value={draft.currentTenant}
//                 onChange={(e) =>
//                   setDraft({
//                     ...draft,
//                     currentTenant: e.target.value,
//                   })
//                 }
//                 className="w-full p-3 border rounded-lg text-sm"
//               />

//               <input
//                 type="date"
//                 value={draft.leaseStart}
//                 onChange={(e) =>
//                   setDraft({
//                     ...draft,
//                     leaseStart: e.target.value,
//                   })
//                 }
//                 className="w-full p-3 border rounded-lg text-sm"
//               />

//               <input
//                 type="date"
//                 value={draft.leaseEnd}
//                 onChange={(e) =>
//                   setDraft({
//                     ...draft,
//                     leaseEnd: e.target.value,
//                   })
//                 }
//                 className="w-full p-3 border rounded-lg text-sm"
//               />

//               <input
//                 type="number"
//                 placeholder="Monthly Rent"
//                 value={draft.rent}
//                 onChange={(e) =>
//                   setDraft({
//                     ...draft,
//                     rent: e.target.value,
//                   })
//                 }
//                 className="w-full p-3 border rounded-lg text-sm"
//               />
//             </div>

//             <div className="flex gap-3 pt-4">
//               <button
//                 onClick={() => setShowModal(false)}
//                 className="w-full border py-2 rounded-lg"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={addTenant}
//                 className="w-full bg-green-600 text-white py-2 rounded-lg"
//               >
//                 Save Tenant
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// });

// export default TenantInfo;

//ci 

// TenantInfo.jsx
import { forwardRef, useState } from "react";
import { Plus, X, Trash2, User, Calendar, IndianRupee } from "lucide-react";
import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

const emptyTenant = { currentTenant: "", leaseStart: "", leaseEnd: "", rent: "" };

const inputCls = "w-full px-4 py-3 border-2 border-[#e5e7eb] rounded-xl outline-none text-sm font-semibold placeholder:text-[#c9c9c9] text-[#111827] focus:border-[#27AE60] focus:ring-2 focus:ring-[#27AE60]/10 transition-all";

const TenantInfo = forwardRef(({ errors = {} }, ref) => {
  const { form, updateFieldValue } = useActivePropertySlice();
  const tenants = Array.isArray(form.tenantInfo) ? form.tenantInfo : [];

  const [showModal, setShowModal] = useState(false);
  const [draft, setDraft] = useState(emptyTenant);

  const addTenant = () => {
    if (!draft.currentTenant.trim()) return;
    updateFieldValue("tenantInfo", [
      ...tenants,
      {
        currentTenant: draft.currentTenant.trim(),
        leaseStart: draft.leaseStart || "",
        leaseEnd: draft.leaseEnd || "",
        rent: draft.rent ? Number(draft.rent) : 0,
      },
    ]);
    setDraft(emptyTenant);
    setShowModal(false);
  };

  const removeTenant = (index) => {
    updateFieldValue("tenantInfo", tenants.filter((_, i) => i !== index));
  };

  return (
    <div ref={ref} className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-[#374151] uppercase tracking-wide">Tenant Information</p>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 border-[#27AE60] text-[#27AE60] text-xs font-bold hover:bg-[#f0fdf4] transition-colors"
        >
          <Plus size={13} />
          Add Tenant
        </button>
      </div>

      {errors.tenantInfo && <p className="text-red-500 text-xs font-medium">{errors.tenantInfo}</p>}

      {/* Tenant List */}
      {tenants.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-[#e5e7eb] rounded-2xl text-[#9ca3af]">
          <User size={24} className="mb-2 opacity-40" />
          <p className="text-xs font-semibold">No tenants added yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tenants.map((t, i) => (
            <div key={i} className="flex items-start justify-between gap-3 px-4 py-3.5 bg-white border-2 border-[#e6f4ec] rounded-xl">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-1 flex-1 min-w-0">
                <div>
                  <p className="text-[10px] font-bold text-[#9ca3af] uppercase">Tenant</p>
                  <p className="text-sm font-bold text-[#111827] truncate">{t.currentTenant}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#9ca3af] uppercase">Lease Start</p>
                  <p className="text-sm font-semibold text-[#374151]">{t.leaseStart || "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#9ca3af] uppercase">Lease End</p>
                  <p className="text-sm font-semibold text-[#374151]">{t.leaseEnd || "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#9ca3af] uppercase">Rent</p>
                  <p className="text-sm font-bold text-[#27AE60]">₹{t.rent || 0}</p>
                  {errors[`tenantInfo.${i}.rent`] && (
                    <p className="text-xs text-red-500 mt-0.5">{errors[`tenantInfo.${i}.rent`]}</p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeTenant(i)}
                className="p-1.5 rounded-lg text-[#9ca3af] hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e7eb]">
              <div>
                <p className="font-bold text-[#111827] text-sm">Add Tenant</p>
                <p className="text-xs text-[#9ca3af] mt-0.5">Fill in the tenant details below</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-xl hover:bg-[#f9fafb] text-[#9ca3af] transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#374151] uppercase tracking-wide">Tenant Name *</label>
                <input
                  type="text"
                  placeholder="Enter tenant name"
                  value={draft.currentTenant}
                  onChange={(e) => setDraft({ ...draft, currentTenant: e.target.value })}
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#374151] uppercase tracking-wide">Lease Start</label>
                  <input
                    type="date"
                    value={draft.leaseStart}
                    onChange={(e) => setDraft({ ...draft, leaseStart: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#374151] uppercase tracking-wide">Lease End</label>
                  <input
                    type="date"
                    value={draft.leaseEnd}
                    onChange={(e) => setDraft({ ...draft, leaseEnd: e.target.value })}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#374151] uppercase tracking-wide">Monthly Rent</label>
                <div className="flex border-2 border-[#e5e7eb] rounded-xl overflow-hidden focus-within:border-[#27AE60] focus-within:ring-2 focus-within:ring-[#27AE60]/10 transition-all">
                  <div className="flex items-center px-4 bg-[#f9fafb] border-r border-[#e5e7eb] text-[#27AE60] font-bold text-sm">₹</div>
                  <input
                    type="number"
                    placeholder="Monthly rent amount"
                    value={draft.rent}
                    onChange={(e) => setDraft({ ...draft, rent: e.target.value })}
                    className="flex-1 px-4 py-3 outline-none text-sm font-semibold placeholder:text-[#c9c9c9] text-[#111827]"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 px-6 py-4 border-t border-[#e5e7eb] bg-[#f9fafb]">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 rounded-xl border-2 border-[#e5e7eb] text-sm font-bold text-[#6b7280] hover:bg-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addTenant}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#27AE60] to-[#52D689] text-white text-sm font-bold shadow-sm hover:opacity-90 transition-opacity"
              >
                Save Tenant
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default TenantInfo;