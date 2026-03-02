// import { forwardRef, memo, useMemo } from "react";
// import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

// const MAX_CHAR_LIMIT = 500;

// const DescriptionMain = forwardRef(({ error = "" }, ref) => {
//   const { form, updateFieldValue } = useActivePropertySlice();

//   const description = form?.description || "";

//   const handleChange = (e) => {
//     const value = e.target.value;

//     // Prevent exceeding max limit
//     if (value.length <= MAX_CHAR_LIMIT) {
//       updateFieldValue("description", value);
//     }
//   };

//   // Character count
//   const charCount = useMemo(() => description.length, [description]);

//   // Word count (optional)
//   const wordCount = useMemo(() => {
//     return description.trim() ? description.trim().split(/\s+/).length : 0;
//   }, [description]);

//   const isNearLimit = charCount > MAX_CHAR_LIMIT * 0.8;

//   return (
//     <section ref={ref} className="space-y-3 border-gray-200">
//       {/* Label */}
//       <label
//         htmlFor="property-description"
//         className="block text-xs font-semibold text-gray-700 uppercase tracking-wide"
//       >
//         Property Description
//       </label>

//       {/* Textarea */}
//       <textarea
//         id="property-description"
//         value={description}
//         onChange={handleChange}
//         rows={5}
//         placeholder="Enter property details, highlights, amenities..."
//         className={`w-full p-3 rounded-lg text-sm bg-gray-50 border outline-none transition-all duration-200
//           ${
//             error
//               ? "border-red-500 focus:ring-2 focus:ring-red-200"
//               : "border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
//           }`}
//       />

//       {/* Footer Section */}
//       <div className="flex justify-between items-center text-xs">
//         {/* Error */}
//         {error ? <p className="text-red-600 font-medium">{error}</p> : <div />}

//         {/* Counter */}
//         <div
//           className={`flex gap-3 font-medium ${
//             isNearLimit ? "text-orange-500" : "text-gray-500"
//           }`}
//         >
//           <span>{wordCount} words</span>
//           <span>
//             {charCount}/{MAX_CHAR_LIMIT} characters
//           </span>
//         </div>
//       </div>
//     </section>
//   );
// });

// export default memo(DescriptionMain);



// ci 

// frontend/.../TypeSpecificFields/common/BasicCommonComponents/DescriptionMain.jsx
import { forwardRef, memo, useMemo } from "react";
import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

const MAX_CHAR_LIMIT = 500;

const DescriptionMain = forwardRef(({ error = "" }, ref) => {
  const { form, updateFieldValue } = useActivePropertySlice();
  const description = form?.description || "";

  const handleChange = (e) => {
    if (e.target.value.length <= MAX_CHAR_LIMIT) updateFieldValue("description", e.target.value);
  };

  const charCount = useMemo(() => description.length, [description]);
  const wordCount = useMemo(() => description.trim() ? description.trim().split(/\s+/).length : 0, [description]);
  const isNearLimit = charCount > MAX_CHAR_LIMIT * 0.8;
  const pct = Math.round((charCount / MAX_CHAR_LIMIT) * 100);

  return (
    <div ref={ref} className="space-y-2">
      <label htmlFor="property-description" className="block text-xs font-bold text-[#374151] uppercase tracking-widest">
        Property Description
      </label>

      <textarea
        id="property-description"
        value={description}
        onChange={handleChange}
        rows={5}
        placeholder="Describe your property — key highlights, features, nearby facilities, and why it's the perfect choice..."
        className={`w-full px-4 py-3.5 rounded-xl text-sm font-medium border-2 outline-none transition-all resize-none leading-relaxed ${
          error
            ? "border-red-300 focus:ring-2 focus:ring-red-100"
            : "border-[#e5e7eb] focus:border-[#27AE60] focus:ring-2 focus:ring-[#27AE60]/10"
        } placeholder:text-[#c9c9c9] text-[#111827]`}
      />

      <div className="flex items-center justify-between">
        {error ? (
          <p className="text-red-500 text-xs font-medium">{error}</p>
        ) : (
          <span className="text-[10px] text-[#9ca3af] font-medium">{wordCount} words</span>
        )}
        <div className="flex items-center gap-2">
          <div className="w-16 h-1.5 bg-[#f0f0f0] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${isNearLimit ? "bg-orange-400" : "bg-[#27AE60]"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className={`text-[10px] font-bold ${isNearLimit ? "text-orange-500" : "text-[#9ca3af]"}`}>
            {charCount}/{MAX_CHAR_LIMIT}
          </span>
        </div>
      </div>
    </div>
  );
});

export default memo(DescriptionMain);