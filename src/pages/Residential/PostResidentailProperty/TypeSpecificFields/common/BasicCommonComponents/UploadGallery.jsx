// //frontend/admin-dashboard/src/pages/Residential/PostResidentailProperty/TypeSpecificFields/common/BasicCommonComponents/UploadGallery.jsx

// import { X } from "lucide-react";
// import { forwardRef, useEffect, useState } from "react";
// import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";


// const MAX_FILES = 20;
// const MAX_SIZE_MB = 1;

// const UploadGallery = forwardRef(({ error }, ref) => {
//   const { form, updateFieldValue } = useActivePropertySlice();
//   const [previewUrls, setPreviewUrls] = useState([]);

//   /* ================= DEBUG ================= */
//   useEffect(() => {
//     console.log("📸 Current galleryFiles:", form.galleryFiles);
//   }, [form.galleryFiles]);

//   /* ================= UPLOAD ================= */
//   const handlePhotoUpload = (e) => {
//     const files = Array.from(e.target.files || []);

//     if (!files.length) return;

//     const validFiles = files.filter((file) => {
//       const sizeInMB = file.size / (1024 * 1024);
//       if (sizeInMB > MAX_SIZE_MB) {
//         alert(`${file.name} exceeds ${MAX_SIZE_MB}MB limit`);
//         return false;
//       }
//       return true;
//     });

//     const existing = form.galleryFiles || [];
//     const updated = [...existing, ...validFiles].slice(0, MAX_FILES);

//     console.log("✅ Files selected:", updated);

//     updateFieldValue("galleryFiles", updated);
//     e.target.value = "";
//   };


//   /* ================= REMOVE ================= */
//   const handleRemovePhoto = (index) => {
//     const updated = (form.galleryFiles || []).filter((_, i) => i !== index);
//     updateFieldValue("galleryFiles", updated);
//   };

//   /* ================= PREVIEW ================= */

//  useEffect(() => {
//    if (!form.galleryFiles || form.galleryFiles.length === 0) {
//      setPreviewUrls([]);
//      return;
//    }

//    const urls = form.galleryFiles.map((file) => {
//      if (file instanceof File) {
//        return URL.createObjectURL(file);
//      }
//      return file?.url || file;
//    });

//    setPreviewUrls(urls);

//    // cleanup only blob URLs
//    return () => {
//      urls.forEach((url) => {
//        if (url && url.startsWith("blob:")) {
//          URL.revokeObjectURL(url);
//        }
//      });
//    };
//  }, [form.galleryFiles]);





//   return (
//     <div ref={ref}>
//       <p className="text-sm font-medium text-gray-700 mb-3">
//         Add photos of your property
//       </p>

//       {/* Upload Box */}
//       <label className="relative flex flex-col items-center justify-center h-40 border-2 border-dashed border-[#27AE60] rounded-lg bg-[#F1FCF5] cursor-pointer">
//         <input
//           type="file"
//           multiple
//           hidden
//           accept="image/*"
//           onChange={handlePhotoUpload}
//         />

//         <p className="text-xs text-center text-[#27AE60]">
//           Drag and drop your photos here
//           <br />
//           Upto 20 photos · Max 10MB each · JPG PNG WEBP
//         </p>

//         <span className="mt-2 bg-[#27AE60] px-4 py-2 text-white rounded-lg">
//           Upload Photos
//         </span>
//       </label>

//       {/* Preview */}
//       {previewUrls.length > 0 && (
//         <div className="grid grid-cols-5 gap-4 mt-6">
//           {previewUrls.slice(0, 5).map((url, index) => {
//             const isLast = index === 4 && previewUrls.length > 5;

//             return (
//               <div
//                 key={index}
//                 className="relative h-24 rounded-xl overflow-hidden border shadow"
//               >
//                 <img
//                   src={url}
//                   alt="preview"
//                   className="w-full h-full object-cover"
//                 />

//                 <button
//                   type="button"
//                   onClick={() => handleRemovePhoto(index)}
//                   className="absolute top-1 right-1 bg-white text-red-500 rounded-full p-1"
//                 >
//                   <X size={12} />
//                 </button>

//                 {isLast && (
//                   <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-white font-bold">
//                     +{previewUrls.length - 5}
//                   </div>
//                 )}
//               </div>
//             );
//           })}
//         </div>
//       )}

//       {/* Error */}
//       {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
//     </div>
//   );
// });

// export default UploadGallery;


// frontend/admin-dashboard/src/pages/Residential/PostResidentailProperty/TypeSpecificFields/common/BasicCommonComponents/UploadGallery.jsx

import { X } from "lucide-react";
import { forwardRef, useEffect, useState } from "react";
import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";

const MAX_FILES = 20;
const TARGET_SIZE_MB = 1;
const TARGET_SIZE_BYTES = TARGET_SIZE_MB * 1024 * 1024;

/* ─────────────────────────────────────────────
   Compress a single File to below TARGET_SIZE_BYTES
   using canvas + iterative quality reduction.
───────────────────────────────────────────── */
const compressImage = (file) => {
  return new Promise((resolve, reject) => {
    // Skip non-image or already-small files
    if (!file.type.startsWith("image/")) return resolve(file);
    if (file.size <= TARGET_SIZE_BYTES) return resolve(file);

    const img = new Image();
    const originalUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(originalUrl);

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // Start at original dimensions; scale down if very large
      let { width, height } = img;
      const MAX_DIMENSION = 1920;
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      // Iteratively reduce quality until under target
      const outputType = file.type === "image/png" ? "image/jpeg" : file.type;
      let quality = 0.85;
      const MIN_QUALITY = 0.1;
      const QUALITY_STEP = 0.1;

      const tryCompress = () => {
        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error("Compression failed"));

            if (blob.size <= TARGET_SIZE_BYTES || quality <= MIN_QUALITY) {
              // Build a new File from the compressed blob
              const ext = outputType === "image/jpeg" ? "jpg" : "png";
              const baseName = file.name.replace(/\.[^.]+$/, "");
              const compressedFile = new File(
                [blob],
                `${baseName}_compressed.${ext}`,
                { type: outputType, lastModified: Date.now() }
              );
              resolve(compressedFile);
            } else {
              quality = Math.max(MIN_QUALITY, quality - QUALITY_STEP);
              tryCompress();
            }
          },
          outputType,
          quality
        );
      };

      tryCompress();
    };

    img.onerror = () => {
      URL.revokeObjectURL(originalUrl);
      reject(new Error(`Failed to load image: ${file.name}`));
    };

    img.src = originalUrl;
  });
};

/* ─────────────────────────────────────────────
   Component
───────────────────────────────────────────── */
const UploadGallery = forwardRef(({ error }, ref) => {
  const { form, updateFieldValue } = useActivePropertySlice();
  const [previewUrls, setPreviewUrls] = useState([]);
  const [compressing, setCompressing] = useState(false);

  /* ── DEBUG ── */
  useEffect(() => {
    console.log("📸 Current galleryFiles:", form.galleryFiles);
  }, [form.galleryFiles]);

  /* ── UPLOAD & COMPRESS ── */
  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setCompressing(true);

    try {
      const compressed = await Promise.all(
        files.map((file) =>
          compressImage(file).catch((err) => {
            console.warn(`Skipping ${file.name}:`, err);
            return null;
          })
        )
      );

      const validFiles = compressed.filter(Boolean);
      const existing = form.galleryFiles || [];
      const updated = [...existing, ...validFiles].slice(0, MAX_FILES);

      console.log("✅ Files after compression:", updated);
      updateFieldValue("galleryFiles", updated);
    } finally {
      setCompressing(false);
      e.target.value = "";
    }
  };

  /* ── REMOVE ── */
  const handleRemovePhoto = (index) => {
    const updated = (form.galleryFiles || []).filter((_, i) => i !== index);
    updateFieldValue("galleryFiles", updated);
  };

  /* ── PREVIEW ── */
  useEffect(() => {
    if (!form.galleryFiles || form.galleryFiles.length === 0) {
      setPreviewUrls([]);
      return;
    }

    const urls = form.galleryFiles.map((file) => {
      if (file instanceof File) return URL.createObjectURL(file);
      return file?.url || file;
    });

    setPreviewUrls(urls);

    return () => {
      urls.forEach((url) => {
        if (url && url.startsWith("blob:")) URL.revokeObjectURL(url);
      });
    };
  }, [form.galleryFiles]);

  /* ── RENDER ── */
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
          disabled={compressing}
        />

        {compressing ? (
          <p className="text-xs text-center text-[#27AE60] animate-pulse">
            Compressing images…
          </p>
        ) : (
          <p className="text-xs text-center text-[#27AE60]">
            Drag and drop your photos here
            <br />
            Upto 20 photos · Compressed to under 1MB · JPG PNG WEBP
          </p>
        )}

        <span
          className={`mt-2 px-4 py-2 text-white rounded-lg ${
            compressing ? "bg-gray-400 cursor-not-allowed" : "bg-[#27AE60]"
          }`}
        >
          {compressing ? "Compressing…" : "Upload Photos"}
        </span>
      </label>

      {/* Preview Grid */}
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

