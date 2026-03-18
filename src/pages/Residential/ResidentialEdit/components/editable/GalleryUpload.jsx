// // // components/editable/GalleryUpload.jsx
// import { useRef, useEffect } from "react";
// import { X } from "lucide-react";

// export default function GalleryUpload({
//   existing = [],
//   files = [],
//   onChange,
//   onRemoveExisting,
//   minRequired = 5,
// }) {
//   const inputRef = useRef(null);

//   /* ---------------- ADD FILES (NO LIMIT) ---------------- */
//   // const handleFiles = (fileList) => {
//   //   const selected = Array.from(fileList || []);
//   //   if (!selected.length) return;

//   //   onChange([...files, ...selected]);
//   // };

//   const handleFiles = (fileList) => {
//     const selected = Array.from(fileList || []).map((file) => ({
//       file,
//       preview: URL.createObjectURL(file),
//     }));

//     onChange([...files, ...selected]);
//   };

//   /* ---------------- REMOVE NEW FILE ---------------- */
//   const removeNewFile = (index) => {
//     onChange(files.filter((_, i) => i !== index));
//   };

//   /* ---------------- CLEANUP OBJECT URLS ---------------- */
//   useEffect(() => {
//     return () => {
//       files.forEach((file) => {
//         if (file instanceof File) {
//           URL.revokeObjectURL(file);
//         }
//       });
//     };
//   }, [files]);

//   const totalCount = existing.length + files.length;
//   const allImages = [
//     ...existing.map((img) => ({ type: "existing", data: img })),
//     ...files.map((file, index) => ({ type: "new", data: file, index })),
//   ];

//   return (
//     <div className="space-y-4">
//       {/* Upload Drop Zone */}
//       <div
//         onClick={() => inputRef.current?.click()}
//         onDragOver={(e) => e.preventDefault()}
//         onDrop={(e) => {
//           e.preventDefault();
//           handleFiles(e.dataTransfer.files);
//         }}
//         className="border-2 border-dashed border-blue-300 rounded-2xl p-8 text-center cursor-pointer bg-white hover:bg-blue-50 transition-colors"
//       >
//         <div className="flex flex-col items-center gap-3">
//           <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
//             <svg
//               className="w-8 h-8 text-white"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
//               />
//             </svg>
//           </div>
//           <div>
//             <div className="text-sm font-semibold text-gray-900 mb-1">
//               Click to upload or drag and drop
//             </div>
//             <div className="text-xs text-gray-500">
//               JPG, PNG up to 10MB each
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Image Grid */}
//       {allImages.length > 0 && (
//         <div className="grid grid-cols-5 gap-3">
//           {allImages.map((item, index) => {
//             if (item.type === "existing") {
//               const img = item.data;
//               return (
//                 <div
//                   key={`existing-${img.key || index}`}
//                   className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100 border-2 border-gray-200"
//                 >
//                   <img
//                     src={img.url}
//                     alt={img.filename || "existing-image"}
//                     className="w-full h-full object-cover"
//                   />

//                   {/* Overlay on hover */}
//                   <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
//                     <button
//                       type="button"
//                       onClick={() => onRemoveExisting(img.key)}
//                       className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
//                     >
//                       <X size={16} />
//                     </button>
//                   </div>

//                   {/* Badge for existing */}
//                   <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-medium px-2 py-1 rounded-md">
//                     Uploaded
//                   </div>
//                 </div>
//               );
//             } else {
//               const file = item.data;
//               const fileIndex = item.index;
//               return (
//                 <div
//                   key={`new-${fileIndex}`}
//                   className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100 border-2 border-blue-300"
//                 >
//                   {/* <img
//                     src={URL.createObjectURL(file)}
//                     alt="preview"
//                     className="w-full h-full object-cover"
//                   /> */}
//                   <img
//                     src={file.preview}
//                     alt="preview"
//                     className="w-full h-full object-cover"
//                   />

//                   {/* Overlay on hover */}
//                   <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
//                     <button
//                       type="button"
//                       onClick={() => removeNewFile(fileIndex)}
//                       className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
//                     >
//                       <X size={16} />
//                     </button>
//                   </div>

//                   {/* Badge for new */}
//                   <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs font-medium px-2 py-1 rounded-md">
//                     New
//                   </div>
//                 </div>
//               );
//             }
//           })}
//         </div>
//       )}

//       {/* Validation Message */}
//       {totalCount < minRequired && (
//         <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2">
//           <span className="text-red-500 text-lg">⚠️</span>
//           <p className="text-xs text-red-600 font-medium">
//             Minimum {minRequired} images required. You have uploaded{" "}
//             {totalCount} image{totalCount !== 1 ? "s" : ""}.
//           </p>
//         </div>
//       )}

//       {totalCount >= minRequired && (
//         <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2">
//           <span className="text-green-500 text-lg">✓</span>
//           <p className="text-xs text-green-600 font-medium">
//             Great! You have {totalCount} images uploaded.
//           </p>
//         </div>
//       )}

//       {/* File Input */}
//       <input
//         ref={inputRef}
//         type="file"
//         multiple
//         accept="image/*"
//         hidden
//         onChange={(e) => {
//           handleFiles(e.target.files);
//           e.target.value = "";
//         }}
//       />
//     </div>
//   );
// }

//ge



import { useRef, useEffect } from "react";
import { X, UploadCloud, CheckCircle2, AlertCircle } from "lucide-react";

// Persistent cache for previews
const previewCache = new WeakMap();

export default function GalleryUpload({
  existing = [],
  files = [], // Expected to be [File, File...]
  onChange,
  onRemoveExisting,
  minRequired = 5,
}) {
  const inputRef = useRef(null);

  /* ================= HANDLERS ================= */

  const handleFiles = (fileList) => {
    if (!fileList) return;
    const newFiles = Array.from(fileList);

    newFiles.forEach((file) => {
      // Ensure it's a valid File object before caching
      if (
        (file instanceof File || file instanceof Blob) &&
        !previewCache.has(file)
      ) {
        previewCache.set(file, URL.createObjectURL(file));
      }
    });

    onChange([...files, ...newFiles]);
  };

  const removeNewFile = (index) => {
    const fileToRemove = files[index];
    const blobUrl = previewCache.get(fileToRemove);
    if (blobUrl) {
      URL.revokeObjectURL(blobUrl);
      previewCache.delete(fileToRemove);
    }
    const updatedFiles = files.filter((_, i) => i !== index);
    onChange(updatedFiles);
  };

  /* ================= CLEANUP ================= */
  useEffect(() => {
    return () => {
      // Optional: Cleanup logic if you want to revoke URLs on unmount
    };
  }, []);

  const totalCount = (existing?.length || 0) + (files?.length || 0);

  return (
    <div className="space-y-6">
      {/* Upload Drop Zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
        className="border-2 border-dashed border-blue-200 rounded-[2rem] p-10 text-center cursor-pointer bg-slate-50/50 hover:bg-blue-50 hover:border-blue-400 transition-all group"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform shadow-blue-100">
            <UploadCloud className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-black text-slate-700">
              Drop property photos here
            </p>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
              Supports JPG, PNG (Max 10MB)
            </p>
          </div>
        </div>
      </div>

      {/* Image Grid */}
      {totalCount > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {/* Existing (Live) Images from Backend */}
          {existing?.map((img) => (
            <div
              key={img.key || img.url}
              className="relative aspect-square rounded-2xl overflow-hidden border-2 border-slate-100 group shadow-sm"
            >
              <img
                src={img.url}
                className="w-full h-full object-cover"
                alt="Property"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveExisting(img.key);
                  }}
                  className="p-2 bg-red-500 text-white rounded-xl hover:bg-red-600 shadow-lg"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="absolute top-2 left-2 bg-emerald-500 text-[8px] font-black text-white px-2 py-1 rounded-lg uppercase tracking-tighter">
                Live
              </div>
            </div>
          ))}

          {/* New Files - Added Safety Checks */}
          {Array.isArray(files) &&
            files.map((file, index) => {
              // 🛡️ VALIDATION: Prevent "Overload resolution failed"
              // If the item is not a real File (e.g., it's a server object), skip it.
              if (!(file instanceof File) && !(file instanceof Blob)) {
                return null;
              }

              // RECOVERY LOGIC: Get or create preview URL
              let previewUrl = previewCache.get(file);
              if (!previewUrl) {
                try {
                  previewUrl = URL.createObjectURL(file);
                  previewCache.set(file, previewUrl);
                } catch (err) {
                  console.error("Preview failed for file", file);
                  return null;
                }
              }

              return (
                <div
                  key={`new-${file.name || index}-${index}`}
                  className="relative aspect-square rounded-2xl overflow-hidden border-2 border-blue-200 group animate-in fade-in zoom-in duration-300 shadow-sm"
                >
                  <img
                    src={previewUrl}
                    className="w-full h-full object-cover"
                    alt="Preview"
                    onError={(e) => {
                      const fallbackUrl = URL.createObjectURL(file);
                      previewCache.set(file, fallbackUrl);
                      e.target.src = fallbackUrl;
                    }}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeNewFile(index);
                      }}
                      className="p-2 bg-red-500 text-white rounded-xl hover:bg-red-600 shadow-lg"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <div className="absolute top-2 left-2 bg-blue-500 text-[8px] font-black text-white px-2 py-1 rounded-lg uppercase tracking-tighter">
                    New
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* Status Banner */}
      <div
        className={`flex items-center gap-3 p-4 rounded-2xl border transition-colors ${
          totalCount < minRequired
            ? "bg-amber-50 border-amber-100 text-amber-700"
            : "bg-emerald-50 border-emerald-100 text-emerald-700"
        }`}
      >
        {totalCount < minRequired ? (
          <AlertCircle className="w-5 h-5 shrink-0" />
        ) : (
          <CheckCircle2 className="w-5 h-5 shrink-0" />
        )}
        <p className="text-[11px] font-bold uppercase tracking-wider">
          {totalCount < minRequired
            ? `Need ${minRequired - totalCount} more photos`
            : `Requirement met (${totalCount} images)`}
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*"
        hidden
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}