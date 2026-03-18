// import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

// const PlantationAge = ({ error }) => {
//   const { form, updateFieldValue } = useActivePropertySlice();

//   return (
//     <div className="space-y-2">
//       <p className="text-[13px] font-weight-bold uppercase text-[#000000]">
//         Plantation Age (Years)
//       </p>
//       <input
//         type="number"
//         value={form.plantationAge || ""}
//         onChange={(e) => updateFieldValue("plantationAge", e.target.value)}
//         placeholder="e.g. 5"
//         className="w-full p-3 border border-[#27AD75] rounded-lg text-sm font-weight-bold placeholder:text-[#524d4d] outline-none bg-white"
//       />
//       {error && <p className="text-red-500 text-xs">{error}</p>}
//     </div>
//   );
// };

// export default PlantationAge;


// ci

// PlantationAge.jsx
import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

const PlantationAge = ({ error }) => {
  const { form, updateFieldValue } = useActivePropertySlice();
  return (
    <div className="space-y-2">
      <p className="text-xs font-bold text-[#374151] uppercase tracking-wide">Plantation Age</p>
      <div className={`flex border-2 rounded-xl overflow-hidden bg-white transition-all ${error ? "border-red-300" : "border-[#e5e7eb] focus-within:border-[#27AE60] focus-within:ring-2 focus-within:ring-[#27AE60]/10"}`}>
        <input
          type="number"
          placeholder="e.g. 5"
          value={form.plantationAge || ""}
          onChange={(e) => updateFieldValue("plantationAge", e.target.value)}
          className="flex-1 px-4 py-3 outline-none text-sm font-semibold placeholder:text-[#c9c9c9] text-[#111827]"
        />
        <div className="flex items-center px-4 bg-[#f9fafb] border-l border-[#e5e7eb] text-[#9ca3af] text-xs font-bold whitespace-nowrap">
          Years
        </div>
      </div>
      {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
    </div>
  );
};

export default PlantationAge;
