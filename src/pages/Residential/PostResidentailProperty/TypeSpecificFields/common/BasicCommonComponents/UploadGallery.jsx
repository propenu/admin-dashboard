//frontend/admin-dashboard/src/pages/Residential/PostResidentailProperty/TypeSpecificFields/common/BasicCommonComponents/UploadGallery.jsx

import { X } from "lucide-react";
import { forwardRef, useEffect, useState } from "react";
import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

const MAX_FILES = 20;
const MAX_SIZE_MB = 10;

const UploadGallery = forwardRef(({ error }, ref) => {
  const { form, updateFieldValue } = useActivePropertySlice();
  const [previewUrls, setPreviewUrls] = useState([]);

  /* ================= DEBUG ================= */
  useEffect(() => {
    console.log("📸 Current galleryFiles:", form.galleryFiles);
  }, [form.galleryFiles]);

  /* ================= UPLOAD ================= */
  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files || []);

    if (!files.length) return;

    const validFiles = files.filter((file) => {
      const sizeInMB = file.size / (1024 * 1024);
    //   if (sizeInMB > MAX_SIZE_MB) {
    //     alert(`${file.name} exceeds ${MAX_SIZE_MB}MB limit`);
    //     return false;
    //   }
      return true;
    });

    const existing = form.galleryFiles || [];
    const updated = [...existing, ...validFiles].slice(0, MAX_FILES);

    console.log("✅ Files selected:", updated);

    updateFieldValue("galleryFiles", updated);
    e.target.value = "";
  };

  /* ================= REMOVE ================= */
  const handleRemovePhoto = (index) => {
    const updated = (form.galleryFiles || []).filter((_, i) => i !== index);
    updateFieldValue("galleryFiles", updated);
  };

  /* ================= PREVIEW ================= */
  useEffect(() => {
    if (!form.galleryFiles) {
      setPreviewUrls([]);
      return;
    }

    const urls = form.galleryFiles.map((file) => URL.createObjectURL(file));

    setPreviewUrls(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [form.galleryFiles]);

  return (
    <div ref={ref}>
      <p className="text-sm font-medium text-gray-700 mb-3">
        Add photos of your property
      </p>

      {/* Upload Box */}
      <label className="relative flex flex-col items-center justify-center h-40 border-2 border-dashed border-[#27AE60] rounded-lg bg-[#F1FCF5] cursor-pointer">
        <input
          type="file"
          multiple
          hidden
          accept="image/*"
          onChange={handlePhotoUpload}
        />

        <p className="text-xs text-center text-[#27AE60]">
          Drag and drop your photos here
          <br />
          Upto 20 photos · Max 10MB each · JPG PNG WEBP
        </p>

        <span className="mt-2 bg-[#27AE60] px-4 py-2 text-white rounded-lg">
          Upload Photos
        </span>
      </label>

      {/* Preview */}
      {previewUrls.length > 0 && (
        <div className="grid grid-cols-5 gap-4 mt-6">
          {previewUrls.slice(0, 5).map((url, index) => {
            const isLast = index === 4 && previewUrls.length > 5;

            return (
              <div
                key={index}
                className="relative h-24 rounded-xl overflow-hidden border shadow"
              >
                <img
                  src={url}
                  alt="preview"
                  className="w-full h-full object-cover"
                />

                <button
                  type="button"
                  onClick={() => handleRemovePhoto(index)}
                  className="absolute top-1 right-1 bg-white text-red-500 rounded-full p-1"
                >
                  <X size={12} />
                </button>

                {isLast && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-white font-bold">
                    +{previewUrls.length - 5}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Error */}
      {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
    </div>
  );
});

export default UploadGallery;




// frontend/.../TypeSpecificFields/common/BasicCommonComponents/UploadGallery.jsx
// import { X, ImagePlus, Images } from "lucide-react";
// import { forwardRef, useEffect, useState } from "react";
// import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

// const MAX_FILES = 20;

// const UploadGallery = forwardRef(({ error }, ref) => {
//   const { form, updateFieldValue } = useActivePropertySlice();
//   const [previewUrls, setPreviewUrls] = useState([]);

//   const handlePhotoUpload = (e) => {
//     const files = Array.from(e.target.files || []);
//     if (!files.length) return;
//     const existing = form.galleryFiles || [];
//     const updated = [...existing, ...files].slice(0, MAX_FILES);
//     updateFieldValue("galleryFiles", updated);
//     e.target.value = "";
//   };

//   const handleRemovePhoto = (index) => {
//     updateFieldValue("galleryFiles", (form.galleryFiles || []).filter((_, i) => i !== index));
//   };

//   useEffect(() => {
//     if (!form.galleryFiles?.length) { setPreviewUrls([]); return; }
//     const urls = form.galleryFiles.map((file) => URL.createObjectURL(file));
//     setPreviewUrls(urls);
//     return () => { urls.forEach((url) => URL.revokeObjectURL(url)); };
//   }, [form.galleryFiles]);

//   const count = form.galleryFiles?.length || 0;

//   return (
//     <div ref={ref} className="space-y-4">
//       {/* Upload Drop Zone */}
//       <label className={`relative flex flex-col items-center justify-center py-10 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 group ${
//         count > 0 ? "border-[#27AE60] bg-[#f0fdf4]" : "border-[#d1d5db] bg-[#fafafa] hover:border-[#27AE60] hover:bg-[#f0fdf4]"
//       }`}>
//         <input type="file" multiple hidden accept="image/*" onChange={handlePhotoUpload} />
//         <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 transition-colors ${
//           count > 0 ? "bg-[#27AE60]/10 border border-[#bbf7d0]" : "bg-white border border-[#e5e7eb] group-hover:border-[#bbf7d0]"
//         }`}>
//           <ImagePlus size={24} className={count > 0 ? "text-[#27AE60]" : "text-[#9ca3af] group-hover:text-[#27AE60] transition-colors"} />
//         </div>
//         <p className="text-sm font-bold text-[#374151]">
//           {count > 0 ? `${count} photo${count > 1 ? "s" : ""} selected — add more` : "Upload property photos"}
//         </p>
//         <p className="text-xs text-[#9ca3af] mt-1">Up to 20 photos · JPG PNG WEBP · Max 10MB each</p>
//         <div className={`mt-3 px-5 py-2 rounded-xl text-xs font-bold transition-colors ${
//           count > 0 ? "bg-[#27AE60] text-white" : "bg-white border border-[#e5e7eb] text-[#6b7280] group-hover:border-[#27AE60] group-hover:text-[#27AE60]"
//         }`}>
//           {count > 0 ? "Add More Photos" : "Choose Photos"}
//         </div>
//       </label>

//       {/* Preview Grid */}
//       {previewUrls.length > 0 && (
//         <div>
//           <div className="flex items-center gap-2 mb-3">
//             <Images size={14} className="text-[#27AE60]" />
//             <p className="text-xs font-bold text-[#374151]">Photo Preview ({count}/{MAX_FILES})</p>
//           </div>
//           <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
//             {previewUrls.slice(0, 5).map((url, index) => {
//               const isLast = index === 4 && previewUrls.length > 5;
//               return (
//                 <div key={index} className="relative group h-20 rounded-xl overflow-hidden border border-[#e6f4ec] shadow-sm">
//                   <img src={url} alt={`preview ${index + 1}`} className="w-full h-full object-cover" />
//                   {!isLast && (
//                     <button
//                       type="button"
//                       onClick={() => handleRemovePhoto(index)}
//                       className="absolute top-1 right-1 bg-white/90 text-red-500 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm border border-red-100"
//                     >
//                       <X size={11} />
//                     </button>
//                   )}
//                   {isLast && (
//                     <div className="absolute inset-0 bg-[#111827]/70 backdrop-blur-sm flex items-center justify-center">
//                       <span className="text-white font-bold text-sm">+{previewUrls.length - 5}</span>
//                     </div>
//                   )}
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       )}

//       {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
//     </div>
//   );
// });

// export default UploadGallery;
