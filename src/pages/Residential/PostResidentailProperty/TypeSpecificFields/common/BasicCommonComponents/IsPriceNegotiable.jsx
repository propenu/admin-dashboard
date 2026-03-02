import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

const IsPriceNegotiable = () => {
  const { form, updateFieldValue } = useActivePropertySlice();

  const isNegotiable = !!form.isPriceNegotiable;

  return (
    <div className="pt-6 ">
      <div className="flex items-center justify-between h-[52px] px-4 border border-gray-200 rounded-lg">
        <span className="text-sm font-semibold text-[#000000]">
          Price Negotiable
        </span>

        {/* ✅ Stable Toggle Button */}
        <button
          type="button"
          role="switch"
          aria-checked={isNegotiable}
          onClick={() => updateFieldValue("isPriceNegotiable", !isNegotiable)}
          className={`relative w-11 h-6 rounded-full transition-colors ${
            isNegotiable ? "bg-[#27AE60]" : "bg-gray-300"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
              isNegotiable ? "translate-x-5" : ""
            }`}
          />
        </button>
      </div>
    </div>
  );
};

export default IsPriceNegotiable;




//ci 

// frontend/.../TypeSpecificFields/common/BasicCommonComponents/IsPriceNegotiable.jsx
// import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

// const IsPriceNegotiable = () => {
//   const { form, updateFieldValue } = useActivePropertySlice();
//   const isNegotiable = !!form.isPriceNegotiable;

//   return (
//     <div className="flex items-center justify-between px-4 py-3.5 border-2 border-[#e5e7eb] rounded-xl hover:border-[#bbf7d0] transition-colors">
//       <div>
//         <p className="text-sm font-bold text-[#111827]">Price Negotiable</p>
//         <p className="text-xs text-[#9ca3af] mt-0.5">Allow buyers to negotiate price</p>
//       </div>
//       <button
//         type="button"
//         role="switch"
//         aria-checked={isNegotiable}
//         onClick={() => updateFieldValue("isPriceNegotiable", !isNegotiable)}
//         className={`relative w-12 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${isNegotiable ? "bg-[#27AE60]" : "bg-[#e5e7eb]"}`}
//       >
//         <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${isNegotiable ? "translate-x-6" : ""}`} />
//       </button>
//     </div>
//   );
// };

// export default IsPriceNegotiable;