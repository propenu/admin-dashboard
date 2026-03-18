// // //src/pages/Residential/ResidentialEdit/components/editable/TenantInfo.jsx

// // // frontend/admin-dashboard/src/pages/Residential/ResidentialEdit/components/editable/TenantInfo.jsx
// // import React, { useState } from "react";
// // import {
// //   Plus,
// //   X,
// //   Trash2,
// //   User,
// //   Calendar,
// //   IndianRupee,
// //   UserPlus2,
// //   Users2
// // } from "lucide-react";

// // const emptyTenant = {
// //   currentTenant: "",
// //   leaseStart: "",
// //   leaseEnd: "",
// //   rent: ""
// // };

// // const inputCls = "w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none text-sm font-bold text-slate-700 placeholder:text-slate-300 focus:border-emerald-500/20 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all";

// // const TenantInfo = ({ data, onUpdateTenant, errors = {} }) => {
// //   // Extract tenants from data prop passed from StepPropertyDetails
// //   const tenants = Array.isArray(data?.tenantInfo) ? data.tenantInfo : [];

// //   const [showModal, setShowModal] = useState(false);
// //   const [draft, setDraft] = useState(emptyTenant);

// //   const addTenant = () => {
// //     if (!draft.currentTenant.trim()) return;

// //     const newTenants = [
// //       ...tenants,
// //       {
// //         currentTenant: draft.currentTenant.trim(),
// //         leaseStart: draft.leaseStart || "",
// //         leaseEnd: draft.leaseEnd || "",
// //         rent: draft.rent ? Number(draft.rent) : 0,
// //       },
// //     ];

// //     // This triggers the handleUpdate in StepPropertyDetails, which triggers debouncedAutoSave
// //     onUpdateTenant(newTenants);
// //     setDraft(emptyTenant);
// //     setShowModal(false);
// //   };

// //   const removeTenant = (index) => {
// //     const filteredTenants = tenants.filter((_, i) => i !== index);
// //     onUpdateTenant(filteredTenants);
// //   };

// //   return (
// //     <div className="space-y-6">
// //       {/* Header Area */}
// //       <div className="flex items-center justify-between px-2">
// //         <div className="flex items-center gap-2">
// //           <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
// //             <Users2 className="w-4 h-4" />
// //           </div>
// //           <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
// //             Occupancy History
// //           </h4>
// //         </div>

// //         <button
// //           type="button"
// //           onClick={() => setShowModal(true)}
// //           className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black uppercase tracking-wider transition-all active:scale-95 shadow-lg shadow-emerald-200"
// //         >
// //           <Plus className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform duration-300" />
// //           Add Tenant
// //         </button>
// //       </div>

// //       {/* Tenant List Grid */}
// //       {tenants.length === 0 ? (
// //         <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50/30">
// //           <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm mb-3">
// //             <UserPlus2 className="w-6 h-6 text-slate-200" />
// //           </div>
// //           <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
// //             No active lease records found
// //           </p>
// //         </div>
// //       ) : (
// //         <div className="grid grid-cols-1 gap-3">
// //           {tenants.map((t, i) => (
// //             <div
// //               key={i}
// //               className="group flex items-center justify-between gap-4 p-5 bg-white border border-slate-100 rounded-3xl hover:border-emerald-200 hover:shadow-md hover:shadow-emerald-500/5 transition-all duration-300"
// //             >
// //               <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 flex-1">
// //                 <div className="space-y-1">
// //                   <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Current Tenant</p>
// //                   <p className="text-sm font-black text-slate-700 truncate">{t.currentTenant}</p>
// //                 </div>
// //                 <div className="space-y-1">
// //                   <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Monthly Yield</p>
// //                   <p className="text-sm font-black text-emerald-600 flex items-center gap-0.5">
// //                     <IndianRupee className="w-3 h-3" />
// //                     {Number(t.rent).toLocaleString('en-IN')}
// //                   </p>
// //                 </div>
// //                 <div className="space-y-1">
// //                   <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Lease Start</p>
// //                   <p className="text-sm font-bold text-slate-500">{t.leaseStart || "—"}</p>
// //                 </div>
// //                 <div className="space-y-1">
// //                   <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Lease Expiry</p>
// //                   <p className="text-sm font-bold text-slate-500">{t.leaseEnd || "—"}</p>
// //                 </div>
// //               </div>

// //               <button
// //                 type="button"
// //                 onClick={() => removeTenant(i)}
// //                 className="p-3 rounded-2xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
// //               >
// //                 <Trash2 className="w-4 h-4" />
// //               </button>
// //             </div>
// //           ))}
// //         </div>
// //       )}

// //       {/* Modern Modal Overlay */}
// //       {showModal && (
// //         <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
// //           <div
// //             className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity"
// //             onClick={() => setShowModal(false)}
// //           />

// //           <div className="relative bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl shadow-black/20 overflow-hidden animate-in fade-in zoom-in duration-300">
// //             {/* Modal Header */}
// //             <div className="px-8 pt-8 pb-4 flex items-center justify-between">
// //               <div>
// //                 <h3 className="text-xl font-black text-slate-800 tracking-tight">Add New Tenant</h3>
// //                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Registry Entry</p>
// //               </div>
// //               <button
// //                 onClick={() => setShowModal(false)}
// //                 className="p-3 rounded-2xl hover:bg-slate-50 text-slate-400 transition-colors"
// //               >
// //                 <X className="w-5 h-5" />
// //               </button>
// //             </div>

// //             {/* Modal Body */}
// //             <div className="p-8 space-y-6">
// //               <div className="space-y-2">
// //                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Full Name / Entity</label>
// //                 <input
// //                   type="text"
// //                   placeholder="e.g. Acme Corp or John Doe"
// //                   value={draft.currentTenant}
// //                   onChange={(e) => setDraft({ ...draft, currentTenant: e.target.value })}
// //                   className={inputCls}
// //                 />
// //               </div>

// //               <div className="grid grid-cols-2 gap-4">
// //                 <div className="space-y-2">
// //                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Lease Start</label>
// //                   <input
// //                     type="date"
// //                     value={draft.leaseStart}
// //                     onChange={(e) => setDraft({ ...draft, leaseStart: e.target.value })}
// //                     className={inputCls}
// //                   />
// //                 </div>
// //                 <div className="space-y-2">
// //                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Lease End</label>
// //                   <input
// //                     type="date"
// //                     value={draft.leaseEnd}
// //                     onChange={(e) => setDraft({ ...draft, leaseEnd: e.target.value })}
// //                     className={inputCls}
// //                   />
// //                 </div>
// //               </div>

// //               <div className="space-y-2">
// //                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Monthly Rent (₹)</label>
// //                 <div className="relative flex items-center">
// //                   <IndianRupee className="absolute left-5 w-4 h-4 text-emerald-500" />
// //                   <input
// //                     type="number"
// //                     placeholder="0.00"
// //                     value={draft.rent}
// //                     onChange={(e) => setDraft({ ...draft, rent: e.target.value })}
// //                     className={`${inputCls} pl-12`}
// //                   />
// //                 </div>
// //               </div>
// //             </div>

// //             {/* Modal Footer */}
// //             <div className="px-8 py-6 bg-slate-50 flex gap-3">
// //               <button
// //                 onClick={() => setShowModal(false)}
// //                 className="flex-1 py-4 rounded-2xl text-sm font-black text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest"
// //               >
// //                 Cancel
// //               </button>
// //               <button
// //                 onClick={addTenant}
// //                 className="flex-1 py-4 rounded-2xl bg-slate-900 text-white text-sm font-black shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all uppercase tracking-widest active:scale-95"
// //               >
// //                 Confirm Addition
// //               </button>
// //             </div>
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // };

// // export default TenantInfo;

// //ci

// import { useState } from "react";

// import {
//   Plus,
//   Trash2,
//   User,
//   IndianRupee,
//   UserPlus2,
//   Users2,
//   X as XIcon,
//   Calendar as CalendarIcon
// } from "lucide-react";

// const emptyTenant = {
//   currentTenant: "",
//   leaseStart: "",
//   leaseEnd: "",
//   rent: "",
// };
// const tenantInputCls =
//   "w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl outline-none text-sm font-bold text-slate-700 placeholder:text-slate-300 focus:border-[#27AE60]/25 focus:bg-white focus:ring-4 focus:ring-[#27AE60]/8 transition-all";

// export default function TenantInfo({ data, onUpdateTenant }) {
//   const tenants = Array.isArray(data?.tenantInfo) ? data.tenantInfo : [];
//   const [showModal, setShowModal] = useState(false);
//   const [draft, setDraft] = useState(emptyTenant);

//   const addTenant = () => {
//     if (!draft.currentTenant.trim()) return;
//     onUpdateTenant([
//       ...tenants,
//       {
//         ...draft,
//         currentTenant: draft.currentTenant.trim(),
//         rent: draft.rent ? Number(draft.rent) : 0,
//       },
//     ]);
//     setDraft(emptyTenant);
//     setShowModal(false);
//   };
//   const removeTenant = (index) =>
//     onUpdateTenant(tenants.filter((_, i) => i !== index));

//   return (
//     <div className="space-y-5">
//       <div className="flex items-center justify-between">
//         <div className="flex items-center gap-2">
//           <div className="w-8 h-8 rounded-xl bg-[#27AE60]/10 flex items-center justify-center text-[#27AE60]">
//             <Users2 className="w-4 h-4" />
//           </div>
//           <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
//             Occupancy History
//           </h4>
//         </div>
//         <button
//           type="button"
//           onClick={() => setShowModal(true)}
//           className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#27AE60] hover:bg-[#219150] text-white text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 shadow-md shadow-[#27AE60]/25"
//         >
//           <Plus className="w-3.5 h-3.5" /> Add Tenant
//         </button>
//       </div>

//       {tenants.length === 0 ? (
//         <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/30">
//           <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm mb-2">
//             <UserPlus2 className="w-5 h-5 text-slate-200" />
//           </div>
//           <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
//             No active lease records
//           </p>
//         </div>
//       ) : (
//         <div className="space-y-2.5">
//           {tenants.map((t, i) => (
//             <div
//               key={i}
//               className="group flex items-center justify-between gap-4 p-4 bg-white border border-slate-100 rounded-2xl hover:border-[#27AE60]/20 transition-all"
//             >
//               <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1 text-sm">
//                 <div>
//                   <p className="text-[9px] font-black text-slate-300 uppercase mb-0.5">
//                     Tenant
//                   </p>
//                   <p className="font-black text-slate-700 truncate">
//                     {t.currentTenant}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-[9px] font-black text-slate-300 uppercase mb-0.5">
//                     Rent
//                   </p>
//                   <p className="font-black text-[#27AE60] flex items-center gap-0.5">
//                     <IndianRupee className="w-3 h-3" />
//                     {Number(t.rent).toLocaleString("en-IN")}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-[9px] font-black text-slate-300 uppercase mb-0.5">
//                     Start
//                   </p>
//                   <p className="font-bold text-slate-500">
//                     {t.leaseStart || "—"}
//                   </p>
//                 </div>
//                 <div>
//                   <p className="text-[9px] font-black text-slate-300 uppercase mb-0.5">
//                     Expiry
//                   </p>
//                   <p className="font-bold text-slate-500">
//                     {t.leaseEnd || "—"}
//                   </p>
//                 </div>
//               </div>
//               <button
//                 type="button"
//                 onClick={() => removeTenant(i)}
//                 className="p-2.5 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
//               >
//                 <Trash2 className="w-4 h-4" />
//               </button>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Modal */}
//       {showModal && (
//         <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
//           <div
//             className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
//             onClick={() => setShowModal(false)}
//           />
//           <div className="relative bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
//             <div className="px-7 pt-7 pb-4 flex items-center justify-between">
//               <div>
//                 <h3 className="text-lg font-black text-slate-800">
//                   Add New Tenant
//                 </h3>
//                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
//                   Registry Entry
//                 </p>
//               </div>
//               <button
//                 onClick={() => setShowModal(false)}
//                 className="p-2.5 rounded-xl hover:bg-slate-50 text-slate-400 transition-colors"
//               >
//                 <XIcon className="w-5 h-5" />
//               </button>
//             </div>
//             <div className="px-7 pb-7 space-y-5">
//               <div className="space-y-1.5">
//                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
//                   Full Name / Entity
//                 </label>
//                 <input
//                   type="text"
//                   placeholder="e.g. Acme Corp or John Doe"
//                   value={draft.currentTenant}
//                   onChange={(e) =>
//                     setDraft({ ...draft, currentTenant: e.target.value })
//                   }
//                   className={tenantInputCls}
//                 />
//               </div>
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-1.5">
//                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
//                     Lease Start
//                   </label>
//                   <input
//                     type="date"
//                     value={draft.leaseStart}
//                     onChange={(e) =>
//                       setDraft({ ...draft, leaseStart: e.target.value })
//                     }
//                     className={tenantInputCls}
//                   />
//                 </div>
//                 <div className="space-y-1.5">
//                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
//                     Lease End
//                   </label>
//                   <input
//                     type="date"
//                     value={draft.leaseEnd}
//                     onChange={(e) =>
//                       setDraft({ ...draft, leaseEnd: e.target.value })
//                     }
//                     className={tenantInputCls}
//                   />
//                 </div>
//               </div>
//               <div className="space-y-1.5">
//                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
//                   Monthly Rent (₹)
//                 </label>
//                 <div className="relative">
//                   <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#27AE60]" />
//                   <input
//                     type="number"
//                     placeholder="0"
//                     value={draft.rent}
//                     onChange={(e) =>
//                       setDraft({ ...draft, rent: e.target.value })
//                     }
//                     className={`${tenantInputCls} pl-11`}
//                   />
//                 </div>
//               </div>
//               <div className="flex gap-3 pt-2">
//                 <button
//                   onClick={() => setShowModal(false)}
//                   className="flex-1 py-3.5 rounded-xl text-sm font-black text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all uppercase tracking-widest"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={addTenant}
//                   className="flex-1 py-3.5 rounded-xl bg-[#27AE60] text-white text-sm font-black hover:bg-[#219150] transition-all uppercase tracking-widest shadow-lg shadow-[#27AE60]/20 active:scale-95"
//                 >
//                   Confirm
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }





// ── TenantInfo ──
import { useState } from "react";
import { Plus, Trash2, Users2, UserPlus2, IndianRupee, } from "lucide-react";
const empty = { currentTenant:"", leaseStart:"", leaseEnd:"", rent:"" };
const iCls = "w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-xl outline-none text-sm font-bold text-slate-700 placeholder:text-slate-300 focus:border-[#27AE60]/25 focus:bg-white transition-all";
export default function TenantInfo({ data, onUpdateTenant }) {
  const tenants = Array.isArray(data?.tenantInfo) ? data.tenantInfo : [];
  const [show, setShow] = useState(false);
  const [draft, setDraft] = useState(empty);
  const add = () => { if (!draft.currentTenant.trim()) return; onUpdateTenant([...tenants, { ...draft, currentTenant: draft.currentTenant.trim(), rent: draft.rent ? Number(draft.rent) : 0 }]); setDraft(empty); setShow(false); };
  const rm = (i) => onUpdateTenant(tenants.filter((_,idx) => idx!==i));
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#27AE60]/10 flex items-center justify-center text-[#27AE60]"><Users2 className="w-4 h-4" /></div>
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Occupancy History</h4>
        </div>
        <button type="button" onClick={() => setShow(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 shadow-md"
          style={{ background: "linear-gradient(135deg,#27AE60,#1e9e52)", boxShadow: "0 4px 14px #27AE6030" }}>
          <Plus className="w-3.5 h-3.5" /> Add Tenant
        </button>
      </div>
      {tenants.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/30">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm mb-2"><UserPlus2 className="w-5 h-5 text-slate-200" /></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">No active lease records</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {tenants.map((t, i) => (
            <div key={i} className="group flex items-center justify-between gap-4 p-4 bg-white border border-slate-100 rounded-2xl hover:border-[#27AE60]/20 transition-all">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1">
                <div><p className="text-[9px] font-black text-slate-300 uppercase mb-0.5">Tenant</p><p className="font-black text-slate-700 text-sm truncate">{t.currentTenant}</p></div>
                <div><p className="text-[9px] font-black text-slate-300 uppercase mb-0.5">Rent</p><p className="font-black text-[#27AE60] text-sm flex items-center gap-0.5"><IndianRupee className="w-3 h-3" />{Number(t.rent).toLocaleString("en-IN")}</p></div>
                <div><p className="text-[9px] font-black text-slate-300 uppercase mb-0.5">Start</p><p className="font-bold text-slate-500 text-sm">{t.leaseStart||"—"}</p></div>
                <div><p className="text-[9px] font-black text-slate-300 uppercase mb-0.5">Expiry</p><p className="font-bold text-slate-500 text-sm">{t.leaseEnd||"—"}</p></div>
              </div>
              <button type="button" onClick={() => rm(i)} className="p-2.5 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      )}
      {show && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShow(false)} />
          <div className="relative bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden" style={{ boxShadow: "0 40px 80px rgba(0,0,0,0.25)" }}>
            <div className="px-7 pt-7 pb-4 flex items-center justify-between">
              <div><h3 className="text-lg font-black text-slate-800">Add New Tenant</h3><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Registry Entry</p></div>
              <button onClick={() => setShow(false)} className="p-2.5 rounded-xl hover:bg-slate-50 text-slate-400 transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="px-7 pb-7 space-y-5">
              <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name / Entity</label><input type="text" placeholder="e.g. Acme Corp or John Doe" value={draft.currentTenant} onChange={(e) => setDraft({...draft,currentTenant:e.target.value})} className={iCls} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Lease Start</label><input type="date" value={draft.leaseStart} onChange={(e) => setDraft({...draft,leaseStart:e.target.value})} className={iCls} /></div>
                <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Lease End</label><input type="date" value={draft.leaseEnd} onChange={(e) => setDraft({...draft,leaseEnd:e.target.value})} className={iCls} /></div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Monthly Rent (₹)</label>
                <div className="relative"><IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#27AE60]" /><input type="number" placeholder="0" value={draft.rent} onChange={(e) => setDraft({...draft,rent:e.target.value})} className={`${iCls} pl-11`} /></div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShow(false)} className="flex-1 py-3.5 rounded-xl text-sm font-black text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all uppercase tracking-widest">Cancel</button>
                <button onClick={add} className="flex-1 py-3.5 rounded-xl text-white text-sm font-black transition-all uppercase tracking-widest active:scale-95"
                  style={{ background: "linear-gradient(135deg,#27AE60,#1e9e52)", boxShadow: "0 6px 20px #27AE6030" }}>Confirm</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}