import { Minus, Plus } from "lucide-react";
import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";
import { forwardRef } from "react";

const Counter = forwardRef(({ label, reduxKey, isNested = false, parentKey = "", error }, ref) => {
  const { form, updateFieldValue } = useActivePropertySlice();

  const value = isNested
    ? Number(form?.[parentKey]?.[reduxKey] || 0)
    : Number(form?.[reduxKey] || 0);

  return (
    <div ref={ref} className="flex flex-col gap-2">
      <p className="text-[13px] font-poppins font-weight-bold text-[#000000] uppercase tracking-tight">
        {label}
      </p>

      <div className="flex items-center justify-between border border-[#27AD75] rounded-lg p-2 min-w-[120px] bg-white">
        <button
          type="button"
          onClick={() => {
            const newVal = Math.max(0, value - 1);
            isNested
              ? updateFieldValue(parentKey, {
                  ...form[parentKey],
                  [reduxKey]: newVal,
                })
              : updateFieldValue(reduxKey, newVal);
          }}
        >
          <Minus size={14} />
        </button>

        <span className="text-sm font-weight-bold">{value}</span>

        <button
          type="button"
          onClick={() => {
            const newVal = value + 1;
            isNested
              ? updateFieldValue(parentKey, {
                  ...form[parentKey],
                  [reduxKey]: newVal,
                })
              : updateFieldValue(reduxKey, newVal);
          }}
        >
          <Plus size={14} />
        </button>
      </div>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
});

export default Counter;

// ci 

// Counter.jsx
// import { Minus, Plus } from "lucide-react";
// import { forwardRef } from "react";
// import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

// const Counter = forwardRef(({ label, reduxKey, isNested = false, parentKey = "", error }, ref) => {
//   const { form, updateFieldValue } = useActivePropertySlice();

//   const value = isNested
//     ? Number(form?.[parentKey]?.[reduxKey] || 0)
//     : Number(form?.[reduxKey] || 0);

//   const handleDecrement = () => {
//     const newVal = Math.max(0, value - 1);
//     isNested ? updateFieldValue(parentKey, { ...form[parentKey], [reduxKey]: newVal }) : updateFieldValue(reduxKey, newVal);
//   };

//   const handleIncrement = () => {
//     const newVal = value + 1;
//     isNested ? updateFieldValue(parentKey, { ...form[parentKey], [reduxKey]: newVal }) : updateFieldValue(reduxKey, newVal);
//   };

//   return (
//     <div ref={ref} className="flex flex-col gap-2">
//       <p className="text-xs font-bold text-[#374151] uppercase tracking-wide">{label}</p>
//       <div className="flex items-center border-2 border-[#e5e7eb] rounded-xl overflow-hidden hover:border-[#bbf7d0] transition-colors">
//         <button
//           type="button"
//           onClick={handleDecrement}
//           className="w-11 h-11 flex items-center justify-center text-[#9ca3af] hover:bg-[#f0fdf4] hover:text-[#27AE60] transition-colors"
//         >
//           <Minus size={14} />
//         </button>
//         <span className="flex-1 text-center text-base font-bold text-[#111827]">{value}</span>
//         <button
//           type="button"
//           onClick={handleIncrement}
//           className="w-11 h-11 flex items-center justify-center text-[#9ca3af] hover:bg-[#f0fdf4] hover:text-[#27AE60] transition-colors"
//         >
//           <Plus size={14} />
//         </button>
//       </div>
//       {error && <span className="text-red-500 text-xs font-medium">{error}</span>}
//     </div>
//   );
// });

// export default Counter;