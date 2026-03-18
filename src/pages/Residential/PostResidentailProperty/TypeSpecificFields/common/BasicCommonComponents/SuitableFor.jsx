// import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

// const SuitableFor = ({ error }) => {
//   const { form, updateFieldValue } = useActivePropertySlice();

//   return (
//     <div className="space-y-2">
//       <p className="text-[13px] font-weight-bold uppercase text-[#000000]">
//         Suitable For
//       </p>
//       <input
//         type="text"
//         value={form.suitableFor || ""}
//         onChange={(e) => updateFieldValue("suitableFor", e.target.value)}
//         placeholder="e.g. Farming, Plantation, Farmhouse"
//         className="w-full p-3 border border-[#27AD75] rounded-lg text-sm font-weight-bold placeholder:text-[#524d4d] outline-none bg-white"
//       />
//       {error && <p className="text-red-500 text-xs">{error}</p>}
//     </div>
//   );
// };

// export default SuitableFor;

//ci 

// SuitableFor.jsx
import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

const SuitableFor = ({ error }) => {
  const { form, updateFieldValue } = useActivePropertySlice();

  return (
    <div className="space-y-2">
      <p className="text-xs font-bold text-[#374151] uppercase tracking-wide">Suitable For</p>
      <input
        type="text"
        value={form.suitableFor || ""}
        onChange={(e) => updateFieldValue("suitableFor", e.target.value)}
        placeholder="e.g. Farming, Plantation, Farmhouse"
        className={`w-full px-4 py-3 border-2 rounded-xl outline-none text-sm font-semibold placeholder:text-[#c9c9c9] text-[#111827] transition-all ${
          error
            ? "border-red-300 focus:ring-2 focus:ring-red-100"
            : "border-[#e5e7eb] focus:border-[#27AE60] focus:ring-2 focus:ring-[#27AE60]/10 hover:border-[#bbf7d0]"
        }`}
      />
      {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
    </div>
  );
};

export default SuitableFor;
