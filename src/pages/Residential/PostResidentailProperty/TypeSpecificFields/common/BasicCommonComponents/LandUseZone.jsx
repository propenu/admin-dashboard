// import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

// const LandUseZone = ({error}) => {
//   const { form, updateFieldValue } = useActivePropertySlice();

//   return (
//     <div className="space-y-3">
//       <p className="text-[13px] font-weight-bold text-[#000000] uppercase font-poppins">
//         Land Use Zone
//       </p>

//       <input
//         type="text"
//         value={form.landUseZone || ""}
//         onChange={(e) => updateFieldValue("landUseZone", e.target.value)}
//         placeholder="Ex. Residential/Commercial/Agricultural"
//         className="w-full font-weight-bold text-sm placeholder:text-[#524d4d] outline-none p-3 border border-[#27AD75] rounded-lg"
//       />

//       {error && <p className="text-red-500 text-xs">{error}</p>}
//     </div>
//   );
// };

// export default LandUseZone;


// ci 

// LandUseZone.jsx
import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

const LandUseZone = ({ error }) => {
  const { form, updateFieldValue } = useActivePropertySlice();
  return (
    <div className="space-y-2">
      <p className="text-xs font-bold text-[#374151] uppercase tracking-wide">Land Use Zone</p>
      <input
        type="text"
        value={form.landUseZone || ""}
        onChange={(e) => updateFieldValue("landUseZone", e.target.value)}
        placeholder="e.g. Residential / Commercial / Agricultural"
        className="w-full px-4 py-3 border-2 border-[#e5e7eb] rounded-xl outline-none text-sm font-semibold placeholder:text-[#c9c9c9] text-[#111827] focus:border-[#27AE60] focus:ring-2 focus:ring-[#27AE60]/10 transition-all"
      />
      {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
    </div>
  );
};

export default LandUseZone;