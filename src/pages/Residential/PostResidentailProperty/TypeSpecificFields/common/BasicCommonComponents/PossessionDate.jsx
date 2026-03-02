import { forwardRef } from "react";
import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

const PossessionDate = forwardRef(({error},ref) => {
  const { form, updateFieldValue } = useActivePropertySlice();

  return (
    <div ref={ref} className="space-y-3">
      <p className="text-[13px] font-weight-bold text-[#000000] uppercase font-poppins">
        Possession Date
      </p>
      <div className="relative">
        <input
          type="date"
          value={form.possessionDate || ""}
          onChange={(e) => updateFieldValue("possessionDate", e.target.value)}
          className="w-full p-3 border border-[#27AD75] outline-none rounded-lg text-sm font-weight-bold text-[#000000] appearance-none bg-white"
        />
      </div>
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
});

export default  PossessionDate;

///////////////////
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