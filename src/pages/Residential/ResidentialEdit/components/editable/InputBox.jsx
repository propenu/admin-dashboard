// //frontend/admin-dashboard/src/pages/Residential/ResidentialEdit/components/editable/InputBox.jsx
// // export default function InputBox({ label, children }) {
// //   return (
// //     <div className="border border-[#27AE60] rounded-lg p-1 bg-white transition-colors">
// //       <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
// //       {children}
// //     </div>
// //   );
// // }

// export default function InputBox({ label, children, units }) {
//   return (
//     <div className="space-y-2">
//       <p className="text-sm font-semibold text-slate-600">{label}</p>

//       <div className="flex items-center border border-slate-300 rounded-2xl overflow-hidden bg-white">
//         {/* INPUT */}
//         <div className="flex-1">{children}</div>

//         {/* DIVIDER */}
//         {units && (
//           <>
//             <div className="h-8 w-px bg-slate-300"></div>

//             {/* UNIT */}
//             <select className="px-4 py-3 outline-none bg-transparent text-sm font-medium">
//               {units.map((u) => (
//                 <option key={u}>{u}</option>
//               ))}
//             </select>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }

//ci

// export default function InputBox({ label, children, units }) {
//   return (
//     <div className="space-y-1.5">
//       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
//         {label}
//       </label>
//       <div className="flex items-center border-2 border-slate-100 rounded-xl overflow-hidden bg-white focus-within:border-[#27AE60]/30 transition-all">
//         <div className="flex-1">{children}</div>
//         {units && (
//           <>
//             <div className="h-8 w-px bg-slate-100" />
//             <select className="px-3 py-3 outline-none bg-transparent text-xs font-bold text-slate-500">
//               {units.map((u) => (
//                 <option key={u}>{u}</option>
//               ))}
//             </select>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }

export default function InputBox({ label, children, units }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
        {label}
      </label>
      <div className="flex items-center border-2 border-slate-100 rounded-xl overflow-hidden bg-white focus-within:border-[#27AE60]/30 transition-all">
        <div className="flex-1">{children}</div>
        {units && (
          <>
            <div className="h-8 w-px bg-slate-100" />
            <select className="px-3 py-3 outline-none bg-transparent text-xs font-bold text-slate-500">
              {units.map((u) => (
                <option key={u}>{u}</option>
              ))}
            </select>
          </>
        )}
      </div>
    </div>
  );
}