
// import { forwardRef, useMemo } from "react";
// import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

// const PossessionDate = forwardRef(({ error }, ref) => {
//   const { form, updateFieldValue } = useActivePropertySlice();

//   // Get today's date in YYYY-MM-DD format to disable past dates
//   const today = useMemo(() => new Date().toISOString().split("T")[0], []);

//   return (
//     <div ref={ref} className="flex flex-col gap-2">
//       <label
//         htmlFor="possessionDate"
//         className="text-[13px] font-bold text-gray-900 uppercase font-poppins tracking-wide"
//       >
//         Possession Date
//       </label>

//       <div className="relative group">
//         <input
//           id="possessionDate"
//           type="date"
//           min={today} // Prevents selecting a date in the past
//           value={form.possessionDate || ""}
//           onChange={(e) => updateFieldValue("possessionDate", e.target.value)}
//           className={`
//             w-full p-3 bg-white border rounded-lg text-sm font-semibold transition-all outline-none
//             ${error ? "border-red-500 ring-1 ring-red-500" : "border-[#27AD75] focus:ring-2 focus:ring-[#27AD75]/50"}
//             hover:border-[#1e8a5d] cursor-pointer
//           `}
//         />
//       </div>

//       {error && (
//         <span className="text-red-500 text-xs font-medium animate-in fade-in slide-in-from-top-1">
//           {error}
//         </span>
//       )}
//     </div>
//   );
// });

// PossessionDate.displayName = "PossessionDate";

// export default PossessionDate;


//ci 

// PossessionDate.jsx
import { forwardRef, useMemo } from "react";
import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

const PossessionDate = forwardRef(({ error }, ref) => {
  const { form, updateFieldValue } = useActivePropertySlice();
  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  return (
    <div ref={ref} className="space-y-2">
      <label
        htmlFor="possessionDate"
        className="block text-xs font-bold text-[#374151] uppercase tracking-wide"
      >
        Possession Date
      </label>
      <input
        id="possessionDate"
        type="date"
        min={today}
        value={form.possessionDate || ""}
        onChange={(e) => updateFieldValue("possessionDate", e.target.value)}
        className={`w-full px-4 py-3 border-2 rounded-xl outline-none text-sm font-semibold cursor-pointer transition-all ${
          error
            ? "border-red-300 focus:ring-2 focus:ring-red-100"
            : "border-[#e5e7eb] focus:border-[#27AE60] focus:ring-2 focus:ring-[#27AE60]/10 hover:border-[#bbf7d0]"
        } text-[#111827]`}
      />
      {error && (
        <p className="text-red-500 text-xs font-medium animate-in fade-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  );
});

PossessionDate.displayName = "PossessionDate";

export default PossessionDate;