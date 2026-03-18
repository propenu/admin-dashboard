// // src/pages/Residential/ResidentialEdit/components/editable/SpecificationsInput.jsx
// import { useState } from "react";
// import { Plus, Trash2, ClipboardList } from "lucide-react";

// const inputCls =
//   "w-full px-4 py-3 bg-white border-2 border-slate-100 rounded-xl outline-none text-sm font-semibold placeholder:text-slate-300 text-slate-700 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/5 transition-all";

// export default function SpecificationsInput({ value = [], onChange }) {
//   const [specCategory, setSpecCategory] = useState("");
//   const [specTitle, setSpecTitle] = useState("");
//   const [specDescription, setSpecDescription] = useState("");
//   const [specErrors, setSpecErrors] = useState({});

//   const handleAdd = () => {
//     const newErrors = {};
//     if (!specCategory.trim()) newErrors.specCategory = "Required";
//     if (!specTitle.trim()) newErrors.specTitle = "Required";
//     if (!specDescription.trim()) newErrors.specDescription = "Required";

//     if (Object.keys(newErrors).length > 0) {
//       setSpecErrors(newErrors);
//       return;
//     }

//     const newSpec = {
//       category: specCategory.trim(),
//       order: value.length + 1,
//       items: [{ title: specTitle.trim(), description: specDescription.trim() }],
//     };

//     onChange([...value, newSpec]);
//     setSpecCategory("");
//     setSpecTitle("");
//     setSpecDescription("");
//     setSpecErrors({});
//   };

//   const removeSpec = (index) => {
//     onChange(value.filter((_, i) => i !== index));
//   };

//   return (
//     <div className="space-y-6">
//       {/* Input Form */}
//       <div className="bg-emerald-50/30 border-2 border-emerald-100/50 rounded-[2rem] p-6 space-y-4">
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//           <div className="space-y-1.5">
//             <label className="text-[10px] font-black text-emerald-700 uppercase ml-2">
//               Category
//             </label>
//             <input
//               type="text"
//               placeholder="e.g. Interior"
//               value={specCategory}
//               onChange={(e) => setSpecCategory(e.target.value)}
//               className={
//                 inputCls + (specErrors.specCategory ? " !border-red-300" : "")
//               }
//             />
//           </div>
//           <div className="space-y-1.5">
//             <label className="text-[10px] font-black text-emerald-700 uppercase ml-2">
//               Title
//             </label>
//             <input
//               type="text"
//               placeholder="e.g. Flooring"
//               value={specTitle}
//               onChange={(e) => setSpecTitle(e.target.value)}
//               className={
//                 inputCls + (specErrors.specTitle ? " !border-red-300" : "")
//               }
//             />
//           </div>
//         </div>

//         <div className="space-y-1.5">
//           <label className="text-[10px] font-black text-emerald-700 uppercase ml-2">
//             Description
//           </label>
//           <textarea
//             placeholder="e.g. Italian marble flooring in living area..."
//             value={specDescription}
//             onChange={(e) => setSpecDescription(e.target.value)}
//             rows={2}
//             className={
//               inputCls +
//               " resize-none" +
//               (specErrors.specDescription ? " !border-red-300" : "")
//             }
//           />
//         </div>

//         <button
//           type="button"
//           onClick={handleAdd}
//           className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-emerald-600 text-white text-xs font-black shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-[0.98]"
//         >
//           <Plus size={16} />
//           ADD TO SPECIFICATIONS
//         </button>
//       </div>

//       {/* List Display */}
//       <div className="grid grid-cols-1 gap-3">
//         {value.map((spec, i) => (
//           <div
//             key={i}
//             className="group flex items-center justify-between gap-4 p-4 bg-white border border-slate-100 rounded-2xl hover:border-emerald-200 transition-all shadow-sm"
//           >
//             <div className="flex items-center gap-4">
//               <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
//                 <ClipboardList size={18} />
//               </div>
//               <div>
//                 <div className="flex items-center gap-2">
//                   <span className="text-[9px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
//                     {spec.category}
//                   </span>
//                   <h4 className="text-sm font-bold text-slate-700">
//                     {spec.items?.[0]?.title}
//                   </h4>
//                 </div>
//                 <p className="text-xs text-slate-400 font-medium mt-0.5">
//                   {spec.items?.[0]?.description}
//                 </p>
//               </div>
//             </div>
//             <button
//               onClick={() => removeSpec(i)}
//               className="p-2 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
//             >
//               <Trash2 size={16} />
//             </button>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }




// src/pages/Residential/ResidentialEdit/components/editable/SpecificationsInput.jsx
import { useState } from "react";
import { Plus, Trash2, ClipboardList, Layers } from "lucide-react";

export default function SpecificationsInput({ value = [], onChange }) {
  const [specCategory, setSpecCategory] = useState("");
  const [specTitle, setSpecTitle] = useState("");
  const [specDescription, setSpecDescription] = useState("");

  const handleAdd = () => {
    if (!specCategory || !specTitle || !specDescription) return;

    const existingCategoryIndex = value.findIndex(
      (s) => s.category.toLowerCase() === specCategory.toLowerCase()
    );

    let updatedSpecs;
    if (existingCategoryIndex > -1) {
      // Add item to existing category
      updatedSpecs = [...value];
      updatedSpecs[existingCategoryIndex] = {
        ...updatedSpecs[existingCategoryIndex],
        items: [
          ...updatedSpecs[existingCategoryIndex].items,
          { title: specTitle.trim(), description: specDescription.trim() },
        ],
      };
    } else {
      // Create new category block
      updatedSpecs = [
        ...value,
        {
          category: specCategory.trim(),
          items: [{ title: specTitle.trim(), description: specDescription.trim() }],
        },
      ];
    }

    onChange(updatedSpecs);
    setSpecTitle("");
    setSpecDescription("");
  };

  const removeItem = (catIndex, itemIndex) => {
    const updatedSpecs = [...value];
    const category = { ...updatedSpecs[catIndex] };
    category.items = category.items.filter((_, i) => i !== itemIndex);

    if (category.items.length === 0) {
      updatedSpecs.splice(catIndex, 1);
    } else {
      updatedSpecs[catIndex] = category;
    }
    onChange(updatedSpecs);
  };

  return (
    <div className="space-y-8">
      {/* Input Section */}
      <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 ml-2 uppercase">Category Group</span>
            <input
              list="spec-categories"
              placeholder="e.g. Flooring, Electrical..."
              value={specCategory}
              onChange={(e) => setSpecCategory(e.target.value)}
              className="w-full px-5 py-3 rounded-xl border-2 border-white bg-white shadow-sm focus:border-emerald-400 outline-none text-sm font-bold transition-all"
            />
            <datalist id="spec-categories">
              <option value="Flooring" />
              <option value="Windows & Doors" />
              <option value="Electrical & Power" />
              <option value="Kitchen Fittings" />
              <option value="Wall Finish" />
            </datalist>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 ml-2 uppercase">Specific Feature</span>
            <input
              placeholder="e.g. Master Bedroom, Main Switch..."
              value={specTitle}
              onChange={(e) => setSpecTitle(e.target.value)}
              className="w-full px-5 py-3 rounded-xl border-2 border-white bg-white shadow-sm focus:border-emerald-400 outline-none text-sm font-bold transition-all"
            />
          </div>
        </div>
        <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 ml-2 uppercase">Full Details</span>
            <textarea
              placeholder="e.g. Anti-skid vitrified tiles with 4-inch skirting..."
              value={specDescription}
              onChange={(e) => setSpecDescription(e.target.value)}
              rows={2}
              className="w-full px-5 py-3 rounded-xl border-2 border-white bg-white shadow-sm focus:border-emerald-400 outline-none text-sm font-medium transition-all resize-none"
            />
        </div>
        <button
          onClick={handleAdd}
          className="w-full bg-white text-emerald-600 border-2 border-emerald-100 hover:bg-emerald-600 hover:text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-95"
        >
          Add to {specCategory || "Category"}
        </button>
      </div>

      {/* Category-Wise Display List */}
      <div className="space-y-6">
        {value.map((catGroup, catIdx) => (
          <div key={catIdx} className="bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-sm">
            <div className="bg-slate-50/80 px-6 py-3 border-b border-slate-100 flex justify-between items-center">
              <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Layers className="w-3 h-3 text-emerald-500" /> {catGroup.category}
              </h4>
              <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded-lg border border-slate-100">
                {catGroup.items.length} Points
              </span>
            </div>
            <div className="p-4 space-y-3">
              {catGroup.items.map((item, itemIdx) => (
                <div key={itemIdx} className="flex items-start justify-between group p-3 hover:bg-emerald-50/50 rounded-2xl transition-colors">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-700">{item.title}</p>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">{item.description}</p>
                  </div>
                  <button
                    onClick={() => removeItem(catIdx, itemIdx)}
                    className="p-2 opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}