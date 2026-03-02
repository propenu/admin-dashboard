// export default function InputBox({ label, children }) {
//   return (
//     <div className="border rounded-lg p-3">
//       <p className="text-xs text-gray-500 mb-1">{label}</p>
//       {children}
//     </div>
//   );
// }


//frontend/admin-dashboard/src/pages/Residential/ResidentialEdit/components/editable/InputBox.jsx
export default function InputBox({ label, children }) {
  return (
    <div className="border border-[#27AE60] rounded-lg p-1 bg-white transition-colors">
      <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
      {children}
    </div>
  );
}