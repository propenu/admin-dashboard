// import { useState } from "react";
// import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

// const Specifications = ({error}) => {
//   const { form, updateFieldValue, toggleArrayValue } = useActivePropertySlice();

//   const [specCategory, setSpecCategory] = useState("");
//   const [specTitle, setSpecTitle] = useState("");
//   const [specDescription, setSpecDescription] = useState("");

//   const [specErrors, setSpecErrors] = useState({});

  
  

//   return (
//     <div className="space-y-4">
//       <p className="text-[13px] font-weight-bold uppercase text-[#000000] font-poppins">
//         Specifications
//       </p>

//       {error && <p className="text-red-500 text-xs">{error}</p>}

//       {/* CATEGORY + TITLE (ROW) */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         {/* CATEGORY */}
//         <div className="space-y-2">
//           <label className="text-sm font-weight-bold text-[#000000]">
//             Category
//           </label>
//           <input
//             type="text"
//             placeholder="e.g. Interior"
//             value={specCategory}
//             onChange={(e) => {
//               setSpecCategory(e.target.value);
//               setSpecErrors((prev) => {
//                 if (!prev.specCategory) return prev;
//                 const updated = { ...prev };
//                 delete updated.specCategory;
//                 return updated;
//               });
//             }}
//             className="w-full p-3 border border-[#27AE60] rounded-lg text-sm text-[#000000] placeholder:text-[#524d4d] outline-none"
//           />
//           {specErrors.specCategory && (
//             <p className="text-red-500 text-xs">{specErrors.specCategory}</p>
//           )}
//         </div>

//         {/* TITLE */}
//         <div className="space-y-2">
//           <label className="text-sm font-weight-bold text-[#000000]">
//             Title
//           </label>
//           <input
//             type="text"
//             placeholder="e.g. Flooring"
//             value={specTitle}
//             onChange={(e) => {
//               setSpecTitle(e.target.value);
//               setSpecErrors((prev) => {
//                 if (!prev.specTitle) return prev;
//                 const updated = { ...prev };
//                 delete updated.specTitle;
//                 return updated;
//               });
//             }}
//             className="w-full p-3 border border-[#27AE60] rounded-lg text-sm text-[#000000] placeholder:text-[#524d4d] outline-none"
//           />
//           {specErrors.specTitle && (
//             <p className="text-red-500 text-xs">{specErrors.specTitle}</p>
//           )}
//         </div>
//       </div>

//       {/* DESCRIPTION */}
//       <div className="space-y-2">
//         <label className="text-sm font-weight-bold text-[#000000]">
//           Description
//         </label>
//         <textarea
//           placeholder="e.g. Vitrified tiles in all rooms"
//           value={specDescription}
//           onChange={(e) => {
//             setSpecDescription(e.target.value);
//             setSpecErrors((prev) => {
//               if (!prev.specDescription) return prev;
//               const updated = { ...prev };
//               delete updated.specDescription;
//               return updated;
//             });
//           }}
//           className="w-full p-3 border border-[#27AE60] placeholder:text-[#524d4d] rounded-lg text-sm outline-none resize-none"
//           rows={3}
//         />
//         {specErrors.specDescription && (
//           <p className="text-red-500 text-xs">{specErrors.specDescription}</p>
//         )}
//       </div>

//       {/* ADD BUTTON */}
//       <button
//         type="button"
//         onClick={() => {
//           const newErrors = {};
//           if (!specCategory.trim()) newErrors.specCategory = "Enter Category";
//           if (!specTitle.trim()) newErrors.specTitle = "Enter Title";
//           if (!specDescription.trim())
//             newErrors.specDescription = "Enter Description";

//           if (Object.keys(newErrors).length > 0) {
//             setSpecErrors(newErrors);
//             return;
//           }

//            if (!specCategory || !specTitle) return;
//           const nextOrder = (form.specifications?.length || 0) + 1;
//           const newSpec = {
//             category: specCategory,
//             order: nextOrder,
//             items: [
//               {
//                 title: specTitle,
//                 description: specDescription || "",
//               },
//             ],
//           };
//           updateFieldValue("specifications", [
//             ...(form.specifications || []),
//             newSpec,
//           ]);

//           // 5️⃣ reset inputs
//           setSpecCategory("");
//           setSpecTitle("");
//           setSpecDescription("");
//         }}
//         className="px-5 py-2 rounded-lg bg-[#27AE60] text-white text-sm font-semibold"
//       >
//         Add Specification
//       </button>
//     </div>
//   );
// };

// export default Specifications;


//ci 

// Specifications.jsx
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

const inputCls = "w-full px-4 py-3 border-2 border-[#e5e7eb] rounded-xl outline-none text-sm font-semibold placeholder:text-[#c9c9c9] text-[#111827] focus:border-[#27AE60] focus:ring-2 focus:ring-[#27AE60]/10 transition-all";

const Specifications = ({ error }) => {
  const { form, updateFieldValue } = useActivePropertySlice();

  const [specCategory, setSpecCategory] = useState("");
  const [specTitle, setSpecTitle] = useState("");
  const [specDescription, setSpecDescription] = useState("");
  const [specErrors, setSpecErrors] = useState({});

  const specs = form.specifications || [];

  const handleAdd = () => {
    const newErrors = {};
    if (!specCategory.trim()) newErrors.specCategory = "Required";
    if (!specTitle.trim()) newErrors.specTitle = "Required";
    if (!specDescription.trim()) newErrors.specDescription = "Required";

    if (Object.keys(newErrors).length > 0) {
      setSpecErrors(newErrors);
      return;
    }

    const newSpec = {
      category: specCategory.trim(),
      order: specs.length + 1,
      items: [{ title: specTitle.trim(), description: specDescription.trim() }],
    };

    updateFieldValue("specifications", [...specs, newSpec]);
    setSpecCategory("");
    setSpecTitle("");
    setSpecDescription("");
    setSpecErrors({});
  };

  const clearError = (key) =>
    setSpecErrors((prev) => {
      if (!prev[key]) return prev;
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });

  const removeSpec = (index) => {
    updateFieldValue(
      "specifications",
      specs.filter((_, i) => i !== index)
    );
  };

  return (
    <div className="space-y-4">
      <p className="text-xs font-bold text-[#374151] uppercase tracking-wide">
        Specifications
      </p>

      {error && <p className="text-red-500 text-xs font-medium">{error}</p>}

      {/* Input Form */}
      <div className="bg-[#f9fafb] border-2 border-[#e5e7eb] rounded-2xl p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#6b7280]">Category</label>
            <input
              type="text"
              placeholder="e.g. Interior"
              value={specCategory}
              onChange={(e) => { setSpecCategory(e.target.value); clearError("specCategory"); }}
              className={inputCls + (specErrors.specCategory ? " !border-red-300" : "")}
            />
            {specErrors.specCategory && <p className="text-red-500 text-xs">{specErrors.specCategory}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#6b7280]">Title</label>
            <input
              type="text"
              placeholder="e.g. Flooring"
              value={specTitle}
              onChange={(e) => { setSpecTitle(e.target.value); clearError("specTitle"); }}
              className={inputCls + (specErrors.specTitle ? " !border-red-300" : "")}
            />
            {specErrors.specTitle && <p className="text-red-500 text-xs">{specErrors.specTitle}</p>}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#6b7280]">Description</label>
          <textarea
            placeholder="e.g. Vitrified tiles in all rooms"
            value={specDescription}
            onChange={(e) => { setSpecDescription(e.target.value); clearError("specDescription"); }}
            rows={2}
            className={inputCls + " resize-none" + (specErrors.specDescription ? " !border-red-300" : "")}
          />
          {specErrors.specDescription && <p className="text-red-500 text-xs">{specErrors.specDescription}</p>}
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#27AE60] to-[#52D689] text-white text-xs font-bold shadow-sm hover:opacity-90 transition-opacity"
        >
          <Plus size={14} />
          Add Specification
        </button>
      </div>

      {/* Spec List */}
      {specs.length > 0 && (
        <div className="space-y-2">
          {specs.map((spec, i) => (
            <div key={i} className="flex items-start justify-between gap-3 px-4 py-3 bg-white border-2 border-[#e6f4ec] rounded-xl">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#27AE60] bg-[#f0fdf4] px-2 py-0.5 rounded-full">
                    {spec.category}
                  </span>
                  <span className="text-sm font-bold text-[#111827]">{spec.items?.[0]?.title}</span>
                </div>
                <p className="text-xs text-[#6b7280] mt-1 truncate">{spec.items?.[0]?.description}</p>
              </div>
              <button
                type="button"
                onClick={() => removeSpec(i)}
                className="p-1.5 rounded-lg text-[#9ca3af] hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Specifications;