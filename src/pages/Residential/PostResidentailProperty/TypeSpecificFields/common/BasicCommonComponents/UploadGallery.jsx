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
const TARGET_SIZE_BYTES = 900 * 1024; // 900KB — safely under 1MB

/* ─────────────────────────────────────────────────────────────
   Draw image onto canvas and return a blob at given quality
───────────────────────────────────────────────────────────── */
const canvasToBlob = (canvas, type, quality) => {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("toBlob returned null"));
      },
      type,
      quality
    );
  });
};

/* ─────────────────────────────────────────────────────────────
   Load a File into an HTMLImageElement
───────────────────────────────────────────────────────────── */
const loadImage = (file) => {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Cannot load image: ${file.name}`));
    };
    img.src = url;
  });
};

/* ─────────────────────────────────────────────────────────────
   Compress a single File to below TARGET_SIZE_BYTES.
   Strategy:
     1. Scale dimensions down (max 1280px on longest side)
     2. Convert PNG → JPEG (lossless PNGs can't be quality-reduced)
     3. Binary-search quality between 0.9 → 0.05
     4. If still too big after quality reduction, halve dimensions and retry
───────────────────────────────────────────────────────────── */
const compressImage = async (file) => {
  if (!file.type.startsWith("image/")) return file;

  // Already small enough — skip
  if (file.size <= TARGET_SIZE_BYTES) return file;

  const img = await loadImage(file);

  // Always output as JPEG for maximum compression
  const outputType = "image/jpeg";
  const ext = "jpg";
  const baseName = file.name.replace(/\.[^.]+$/, "");

  const MAX_DIMENSION = 1280;

  // Helper: compress at given dimensions + quality
  const compressAtSize = async (maxDim) => {
    const canvas = document.createElement("canvas");
    let { naturalWidth: w, naturalHeight: h } = img;

    if (w > maxDim || h > maxDim) {
      const ratio = Math.min(maxDim / w, maxDim / h);
      w = Math.round(w * ratio);
      h = Math.round(h * ratio);
    }

    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, w, h);

    // Binary search for the right quality
    let lo = 0.05;
    let hi = 0.9;
    let bestBlob = null;

    // First try at hi quality — if already fits, great
    const hiBlob = await canvasToBlob(canvas, outputType, hi);
    if (hiBlob.size <= TARGET_SIZE_BYTES) return hiBlob;

    // Try lowest quality — if still too big at this dimension, return it anyway
    // (caller will retry with smaller dimensions)
    const loBlob = await canvasToBlob(canvas, outputType, lo);
    if (loBlob.size > TARGET_SIZE_BYTES) return loBlob; // signal to retry

    // Binary search between lo and hi
    for (let i = 0; i < 8; i++) {
      const mid = (lo + hi) / 2;
      const blob = await canvasToBlob(canvas, outputType, mid);
      if (blob.size <= TARGET_SIZE_BYTES) {
        bestBlob = blob;
        lo = mid; // try higher quality
      } else {
        hi = mid; // need lower quality
      }
    }

    return bestBlob || loBlob;
  };

  // Try progressively smaller dimensions until under target
  let finalBlob = null;
  for (const dim of [MAX_DIMENSION, 1024, 800, 640, 480]) {
    const blob = await compressAtSize(dim);
    if (blob.size <= TARGET_SIZE_BYTES) {
      finalBlob = blob;
      break;
    }
    // Still too big — try next smaller dimension
    finalBlob = blob; // fallback: keep last attempt
  }

  const compressedFile = new File(
    [finalBlob],
    `${baseName}_compressed.${ext}`,
    { type: outputType, lastModified: Date.now() }
  );

  console.log(
    `🗜️ ${file.name}: ${(file.size / 1024).toFixed(0)}KB → ${(
      compressedFile.size / 1024
    ).toFixed(0)}KB`
  );

  return compressedFile;
};

/* ─────────────────────────────────────────────────────────────
   Component
───────────────────────────────────────────────────────────── */
const UploadGallery = forwardRef(({ error }, ref) => {
  const { form, updateFieldValue } = useActivePropertySlice();
  const [previewUrls, setPreviewUrls] = useState([]);
  const [compressing, setCompressing] = useState(false);
  const [compressProgress, setCompressProgress] = useState({ done: 0, total: 0 });

  /* ── DEBUG ── */
  useEffect(() => {
    console.log("📸 Current galleryFiles:", form.galleryFiles);
  }, [form.galleryFiles]);

  /* ── UPLOAD & COMPRESS ── */
  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setCompressing(true);
    setCompressProgress({ done: 0, total: files.length });

    const compressedFiles = [];

    for (const file of files) {
      try {
        const compressed = await compressImage(file);
        compressedFiles.push(compressed);
      } catch (err) {
        console.warn(`⚠️ Skipping ${file.name}:`, err);
      }
      setCompressProgress((prev) => ({ ...prev, done: prev.done + 1 }));
    }

    const existing = form.galleryFiles || [];
    const updated = [...existing, ...compressedFiles].slice(0, MAX_FILES);

    console.log("✅ Final files:", updated.map((f) => `${f.name} (${(f.size/1024).toFixed(0)}KB)`));
    updateFieldValue("galleryFiles", updated);

    setCompressing(false);
    setCompressProgress({ done: 0, total: 0 });
    e.target.value = "";
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
        if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
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
      <label
        className={`relative flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
          compressing
            ? "border-gray-300 bg-gray-50 cursor-not-allowed"
            : "border-[#27AE60] bg-[#F1FCF5]"
        }`}
      >
        <input
          type="file"
          multiple
          hidden
          accept="image/*"
          onChange={handlePhotoUpload}
          disabled={compressing}
        />

        {compressing ? (
          <div className="flex flex-col items-center gap-2">
            {/* Spinner */}
            <svg
              className="animate-spin h-6 w-6 text-[#27AE60]"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              />
            </svg>
            <p className="text-xs text-gray-500">
              Compressing {compressProgress.done}/{compressProgress.total} images…
            </p>
          </div>
        ) : (
          <>
            <p className="text-xs text-center text-[#27AE60]">
              Drag and drop your photos here
              <br />
              Up to 20 photos · Auto-compressed under 1MB · JPG PNG WEBP
            </p>
            <span className="mt-2 bg-[#27AE60] px-4 py-2 text-white rounded-lg text-sm">
              Upload Photos
            </span>
          </>
        )}
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
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-white font-bold text-sm">
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