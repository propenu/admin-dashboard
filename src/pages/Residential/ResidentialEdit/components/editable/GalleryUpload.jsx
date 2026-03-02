// // // components/editable/GalleryUpload.jsx
// import { useRef, useEffect } from "react";
// import { X } from "lucide-react";

// export default function GalleryUpload({
//   existing = [], // 🔹 Existing images from backend [{url, key, filename}]
//   files = [], // 🔹 New uploaded File[]
//   onChange, // 🔹 Update new files
//   onRemoveExisting, // 🔹 Remove existing image (by key)
//   minRequired = 5, // 🔹 Minimum required images
// }) {
//   const inputRef = useRef(null);

//   /* ---------------- ADD FILES (NO LIMIT) ---------------- */
//   const handleFiles = (fileList) => {
//     const selected = Array.from(fileList || []);
//     if (!selected.length) return;

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

//   return (
//     <div className="space-y-4">
//       {/* ⚠️ MIN VALIDATION */}
//       {totalCount < minRequired && (
//         <p className="text-xs text-red-500">
//           Minimum {minRequired} images required ({totalCount} uploaded)
//         </p>
//       )}

//       {/* ================= EXISTING IMAGES ================= */}
//       {existing.length > 0 && (
//         <div>
//           <p className="text-xs text-gray-500 mb-2">Existing Images</p>
//           <div className="grid grid-cols-5 gap-3">
//             {existing.map((img, index) => (
//               <div
//                 key={img.key || index}
//                 className="relative h-24 rounded border overflow-hidden bg-gray-100"
//               >
//                 <img
//                   src={img.url}
//                   alt={img.filename || "existing-image"}
//                   className="w-full h-full object-cover"
//                 />

//                 {/* ❌ REMOVE EXISTING */}
//                 {onRemoveExisting && (
//                   <button
//                     type="button"
//                     onClick={() => onRemoveExisting(img.key)}
//                     className="absolute top-1 right-1 bg-white text-red-600 rounded-full p-1 shadow"
//                   >
//                     <X size={12} />
//                   </button>
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* ================= NEW UPLOADS ================= */}
//       {files.length > 0 && (
//         <div>
//           <p className="text-xs text-gray-500 mb-2">New Uploads</p>
//           <div className="grid grid-cols-5 gap-3">
//             {files.map((file, index) => (
//               <div
//                 key={index}
//                 className="relative h-24 rounded border overflow-hidden"
//               >
//                 <img
//                   src={URL.createObjectURL(file)}
//                   alt="preview"
//                   className="w-full h-full object-cover"
//                 />

//                 {/* ❌ REMOVE NEW */}
//                 <button
//                   type="button"
//                   onClick={() => removeNewFile(index)}
//                   className="absolute top-1 right-1 bg-white text-red-600 rounded-full p-1 shadow"
//                 >
//                   <X size={12} />
//                 </button>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* ================= DROP ZONE ================= */}
//       <div
//         onClick={() => inputRef.current?.click()}
//         onDragOver={(e) => e.preventDefault()}
//         onDrop={(e) => {
//           e.preventDefault();
//           handleFiles(e.dataTransfer.files);
//         }}
//         className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer text-sm text-gray-500"
//       >
//         Click to upload or drag & drop
//         <br />
//         <span className="text-xs text-gray-400">
//           Minimum {minRequired} images · No maximum limit
//         </span>
//       </div>

//       {/* ================= FILE INPUT ================= */}
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

import { useRef, useEffect } from "react";
import { X } from "lucide-react";

export default function GalleryUpload({
  existing = [], // 🔹 Existing images from backend [{url, key, filename}]
  files = [], // 🔹 New uploaded File[]
  onChange, // 🔹 Update new files
  onRemoveExisting, // 🔹 Remove existing image (by key)
  minRequired = 5, // 🔹 Minimum required images
}) {
  const inputRef = useRef(null);

  /* ---------------- ADD FILES (NO LIMIT) ---------------- */
  const handleFiles = (fileList) => {
    const selected = Array.from(fileList || []);
    if (!selected.length) return;

    onChange([...files, ...selected]);
  };

  /* ---------------- REMOVE NEW FILE ---------------- */
  const removeNewFile = (index) => {
    onChange(files.filter((_, i) => i !== index));
  };

  /* ---------------- CLEANUP OBJECT URLS ---------------- */
  useEffect(() => {
    return () => {
      files.forEach((file) => {
        if (file instanceof File) {
          URL.revokeObjectURL(file);
        }
      });
    };
  }, [files]);

  const totalCount = existing.length + files.length;
  const allImages = [
    ...existing.map((img) => ({ type: "existing", data: img })),
    ...files.map((file, index) => ({ type: "new", data: file, index })),
  ];

  return (
    <div className="space-y-4">
      {/* Upload Drop Zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
        className="border-2 border-dashed border-blue-300 rounded-2xl p-8 text-center cursor-pointer bg-white hover:bg-blue-50 transition-colors"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900 mb-1">
              Click to upload or drag and drop
            </div>
            <div className="text-xs text-gray-500">
              JPG, PNG up to 10MB each
            </div>
          </div>
        </div>
      </div>

      {/* Image Grid */}
      {allImages.length > 0 && (
        <div className="grid grid-cols-5 gap-3">
          {allImages.map((item, index) => {
            if (item.type === "existing") {
              const img = item.data;
              return (
                <div
                  key={`existing-${img.key || index}`}
                  className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100 border-2 border-gray-200"
                >
                  <img
                    src={img.url}
                    alt={img.filename || "existing-image"}
                    className="w-full h-full object-cover"
                  />

                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => onRemoveExisting(img.key)}
                      className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {/* Badge for existing */}
                  <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-medium px-2 py-1 rounded-md">
                    Uploaded
                  </div>
                </div>
              );
            } else {
              const file = item.data;
              const fileIndex = item.index;
              return (
                <div
                  key={`new-${fileIndex}`}
                  className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100 border-2 border-blue-300"
                >
                  <img
                    src={URL.createObjectURL(file)}
                    alt="preview"
                    className="w-full h-full object-cover"
                  />

                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => removeNewFile(fileIndex)}
                      className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {/* Badge for new */}
                  <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs font-medium px-2 py-1 rounded-md">
                    New
                  </div>
                </div>
              );
            }
          })}
        </div>
      )}

      {/* Validation Message */}
      {totalCount < minRequired && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2">
          <span className="text-red-500 text-lg">⚠️</span>
          <p className="text-xs text-red-600 font-medium">
            Minimum {minRequired} images required. You have uploaded{" "}
            {totalCount} image{totalCount !== 1 ? "s" : ""}.
          </p>
        </div>
      )}

      {totalCount >= minRequired && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2">
          <span className="text-green-500 text-lg">✓</span>
          <p className="text-xs text-green-600 font-medium">
            Great! You have {totalCount} images uploaded.
          </p>
        </div>
      )}

      {/* File Input */}
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