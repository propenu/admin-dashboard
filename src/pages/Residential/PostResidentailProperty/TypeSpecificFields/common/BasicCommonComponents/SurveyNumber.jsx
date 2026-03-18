// import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

// const SurveyNumber = ({ error }) => {
//   const { form, updateFieldValue } = useActivePropertySlice();

//   return (
//     <div className="space-y-2">
//       <p className="text-[13px] font-weight-bold text-[#000000] uppercase font-poppins">
//         Survey Number
//       </p>

//       <input
//         type="text"
//         value={form.surveyNumber || ""}
//         onChange={(e) => updateFieldValue("surveyNumber", e.target.value)}
//         placeholder="e.g. 123/45A"
//         className="w-full p-3 border text-sm outline-none font-weight-bold placeholder:text-[#524d4d] text-[#000000] border-[#27AD75] rounded-lg"
//       />

//       {error && <p className="text-red-500 text-xs">{error}</p>}
//     </div>
//   );
// };

// export default SurveyNumber;


// ci

// SurveyNumber.jsx
import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

const SurveyNumber = ({ error }) => {
  const { form, updateFieldValue } = useActivePropertySlice();

  return (
    <div className="space-y-2">
      <p className="text-xs font-bold text-[#374151] uppercase tracking-wide">Survey Number</p>
      <input
        type="text"
        value={form.surveyNumber || ""}
        onChange={(e) => updateFieldValue("surveyNumber", e.target.value)}
        placeholder="e.g. 123/45A"
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

export default SurveyNumber;