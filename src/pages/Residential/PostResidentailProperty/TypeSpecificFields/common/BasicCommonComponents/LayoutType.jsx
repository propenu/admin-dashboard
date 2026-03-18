// import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

// const LayoutType = ({error}) => {
//   const { form, updateFieldValue } = useActivePropertySlice();

//   return (
//     <div className="space-y-2">
//       <p className="text-[13px] font-weight-bold text-[#000000] uppercase font-poppins">
//         Layout Type
//       </p>

//       <input
//         type="text"
//         value={form.layoutType || ""}
//         onChange={(e) => updateFieldValue("layoutType", e.target.value)}
//         placeholder="DTCP / HMDA / Local"
//         className="w-full p-3 border placeholder:text-[#524d4d] text-[#000000] font-weight-bold text-sm outline-none border-[#27AD75] rounded-lg"
//       />

//       {error && <p className="text-red-500 text-xs">{error}</p>}
//     </div>
//   );
// };

// export default LayoutType;


//ci 

// LayoutType.jsx
import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

const LayoutType = ({ error }) => {
  const { form, updateFieldValue } = useActivePropertySlice();
  return (
    <div className="space-y-2">
      <p className="text-xs font-bold text-[#374151] uppercase tracking-wide">Layout Type</p>
      <input
        type="text"
        value={form.layoutType || ""}
        onChange={(e) => updateFieldValue("layoutType", e.target.value)}
        placeholder="DTCP / HMDA / Local"
        className="w-full px-4 py-3 border-2 border-[#e5e7eb] rounded-xl outline-none text-sm font-semibold placeholder:text-[#c9c9c9] text-[#111827] focus:border-[#27AE60] focus:ring-2 focus:ring-[#27AE60]/10 transition-all"
      />
      {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
    </div>
  );
};

export default LayoutType;