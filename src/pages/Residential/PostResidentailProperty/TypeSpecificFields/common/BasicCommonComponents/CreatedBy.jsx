// import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";
// import { forwardRef } from "react";

// const CreatedBy = forwardRef(({ error }, ref) => {
//   const { form, updateFieldValue } = useActivePropertySlice();

//   console.log("CreatedBy Value:", form.createdBy);


//   return (
//     <div ref={ref} className="space-y-2">
//       <p className="text-[13px] font-poppins font-weight-bold text-[#000000] uppercase">
//         User ID
//       </p>

//       <div className="flex border border-[#27AD75] rounded-lg overflow-hidden bg-white">
//         <input
//           type="text"
//           placeholder="Enter User ID"
//           value={form.createdBy || ""}
//           onChange={(e) => updateFieldValue("createdBy", e.target.value)}
//           className="w-full p-3 outline-none placeholder:text-[#524d4d] text-sm font-semibold"
//         />
//       </div>

//       {error && <p className="text-red-500 text-xs">{error}</p>}
//     </div>
//   );
// });

// export default CreatedBy;

//ci ai

// CreatedBy.jsx
import { forwardRef } from "react";
import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

const CreatedBy = forwardRef(({ error }, ref) => {
  const { form, updateFieldValue } = useActivePropertySlice();
  return (
    <div ref={ref} className="space-y-2">
      <p className="text-xs font-bold text-[#374151] uppercase tracking-wide">User ID</p>
      <div className={`flex border-2 rounded-xl overflow-hidden bg-white transition-all ${error ? "border-red-300" : "border-[#e5e7eb] focus-within:border-[#27AE60] focus-within:ring-2 focus-within:ring-[#27AE60]/10"}`}>
        <input
          type="text"
          placeholder="Enter user ID"
          value={form.createdBy || ""}
          onChange={(e) => updateFieldValue("createdBy", e.target.value)}
          className="flex-1 px-4 py-3 outline-none text-sm font-semibold placeholder:text-[#c9c9c9] text-[#111827]"
        />
      </div>
      {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
    </div>
  );
});

export default CreatedBy;