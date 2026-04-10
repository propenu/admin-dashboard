
// frontend/admin-dashboard/src/pages/Residential/PostResidentailProperty/TypeSpecificFields/common/BasicCommonComponents/UploadGallery.jsx
import { X } from "lucide-react";
import { forwardRef, useEffect, useState } from "react";
import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";
import { deletePropertyGalleryImagesIndex } from "../../../../../../features/property/propertyService";
import { toast } from "sonner";

const MAX_FILES = 20;
const TARGET_KB = 200; // Each image will be compressed to ~200KB max
const TARGET_BYTES = TARGET_KB * 1024;

const compressImageToTarget = (file) => {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`Failed to load: ${file.name}`));
    };

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const compress = (maxDimension, quality) => {
        return new Promise((res) => {
          const canvas = document.createElement("canvas");
          let w = img.naturalWidth;
          let h = img.naturalHeight;

          // Scale down if bigger than maxDimension
          if (w > maxDimension || h > maxDimension) {
            const ratio = Math.min(maxDimension / w, maxDimension / h);
            w = Math.floor(w * ratio);
            h = Math.floor(h * ratio);
          }

          canvas.width = w;
          canvas.height = h;

          const ctx = canvas.getContext("2d");
          // White background (for transparent PNGs)
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, w, h);
          ctx.drawImage(img, 0, 0, w, h);

          canvas.toBlob(
            (blob) => res(blob),
            "image/jpeg",
            quality
          );
        });
      };

      // Strategy: try dimension steps × quality steps until under target
      const dimensionSteps = [1920, 1280, 960, 640, 480];
      const qualitySteps = [0.8, 0.65, 0.5, 0.35, 0.2];

      const tryNext = async (dIdx, qIdx) => {
        if (dIdx >= dimensionSteps.length) {
          // Exhausted all options — return smallest possible
          const blob = await compress(480, 0.1);
          return blob;
        }

        const blob = await compress(dimensionSteps[dIdx], qualitySteps[qIdx]);

        if (blob.size <= TARGET_BYTES) {
          return blob;
        }

        // Move to next quality at same dimension
        if (qIdx + 1 < qualitySteps.length) {
          return tryNext(dIdx, qIdx + 1);
        }

        // Move to next smaller dimension, reset quality
        return tryNext(dIdx + 1, 0);
      };

      tryNext(0, 0).then((finalBlob) => {
        const outputName = file.name.replace(/\.[^.]+$/, ".jpg");
        const finalFile = new File([finalBlob], outputName, {
          type: "image/jpeg",
          lastModified: Date.now(),
        });

        

        resolve(finalFile);
      }).catch(reject);
    };

    img.src = objectUrl;
  });
};

/* ══════════════════════════════════════════════════════════
   COMPONENT
══════════════════════════════════════════════════════════ */
const UploadGallery = forwardRef(({ error }, ref) => {
  const { form, updateFieldValue } = useActivePropertySlice();
  const [previewUrls, setPreviewUrls] = useState([]);
  const [compressing, setCompressing] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [currentFileName, setCurrentFileName] = useState("");

  /* ── DEBUG ── */
  useEffect(() => {
    
  }, [form.galleryFiles]);

  /* ── UPLOAD & COMPRESS ── */
  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    // Check slot availability
    const existing = form.galleryFiles || [];
    const slotsLeft = MAX_FILES - existing.length;
    if (slotsLeft <= 0) {
      alert(`Maximum ${MAX_FILES} photos allowed.`);
      e.target.value = "";
      return;
    }

    const filesToProcess = files.slice(0, slotsLeft);

    setCompressing(true);
    setProgress({ done: 0, total: filesToProcess.length });

    const compressedFiles = [];

    for (const file of filesToProcess) {
      setCurrentFileName(file.name);
      try {
        const compressed = await compressImageToTarget(file);
        compressedFiles.push(compressed);
      } catch (err) {
        console.error(`❌ Failed: ${file.name}`, err);
        // Skip failed files — do NOT push originals (they may be huge)
      }
      setProgress((prev) => ({ ...prev, done: prev.done + 1 }));
    }

    const updated = [...existing, ...compressedFiles].slice(0, MAX_FILES);


    updateFieldValue("galleryFiles", updated);
    setCompressing(false);
    setCurrentFileName("");
    setProgress({ done: 0, total: 0 });
    e.target.value = "";
  };


const handleRemovePhoto = async (index) => {
  try {
    const currentFiles = form.galleryFiles || [];
    const fileToRemove = currentFiles[index];

    const isNewFile = fileToRemove instanceof File;

    // 🔥 SCENARIO 1: BEFORE SAVE (NEW FILE)
    if (isNewFile) {
      const updated = currentFiles.filter((_, i) => i !== index);
      updateFieldValue("galleryFiles", updated);
      return;
    }

    // 🔥 SCENARIO 2: AFTER SAVE (EXISTING FILE)
    const propertyId = form._id || form.id;
    const category = form.propertyCategory;

    

    await deletePropertyGalleryImagesIndex(category, propertyId, index);

    const updated = currentFiles.filter((_, i) => i !== index);
    updateFieldValue("galleryFiles", updated);

    toast.success("Image deleted!");
  } catch (err) {
    console.error("DELETE ERROR:", err.response?.data || err);
    toast.error("Delete failed");
  }
};
  /* ── PREVIEW URLs ── */
  useEffect(() => {
    if (!form.galleryFiles?.length) {
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

  const photoCount = form.galleryFiles?.length || 0;

  /* ── RENDER ── */
  return (
    <div ref={ref}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-gray-700">
          Add photos of your property
        </p>
        <span className="text-xs text-gray-400">
          {photoCount}/{MAX_FILES} photos
        </span>
      </div>

      {/* Upload Box */}
      <label
        className={`relative flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-lg transition-all duration-200 ${
          compressing
            ? "border-gray-300 bg-gray-50 cursor-not-allowed pointer-events-none"
            : photoCount >= MAX_FILES
            ? "border-gray-200 bg-gray-50 cursor-not-allowed pointer-events-none opacity-50"
            : "border-[#27AE60] bg-[#F1FCF5] cursor-pointer hover:bg-[#e8f9ee]"
        }`}
      >
        <input
          type="file"
          multiple
          hidden
          accept="image/*"
          onChange={handlePhotoUpload}
          disabled={compressing || photoCount >= MAX_FILES}
        />

        {compressing ? (
          /* ── Compression progress UI ── */
          <div className="flex flex-col items-center gap-2 px-4">
            <svg
              className="animate-spin h-7 w-7 text-[#27AE60]"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12" cy="12" r="10"
                stroke="currentColor" strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              />
            </svg>

            {/* Progress bar */}
            <div className="w-48 bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-[#27AE60] h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: `${progress.total > 0 ? (progress.done / progress.total) * 100 : 0}%`,
                }}
              />
            </div>

            <p className="text-xs text-gray-500 font-medium text-center">
              Compressing {progress.done + 1}/{progress.total}
            </p>
            {currentFileName && (
              <p className="text-[10px] text-gray-400 truncate max-w-[180px] text-center">
                {currentFileName}
              </p>
            )}
          </div>
        ) : (
          /* ── Default UI ── */
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-[#27AE60] mb-2 opacity-70"
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path
                strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-xs text-center text-[#27AE60]">
              Drag and drop your photos here
              <br />
              <span className="text-gray-400">
                Up to {MAX_FILES} photos · Auto-compressed · JPG PNG WEBP
              </span>
            </p>
            <span className="mt-3 bg-[#27AE60] px-4 py-2 text-white rounded-lg text-sm font-medium">
              Upload Photos
            </span>
          </>
        )}
      </label>

      {/* Preview Grid */}
      {previewUrls.length > 0 && (
        <div className="grid grid-cols-5 gap-3 mt-4">
          {previewUrls.slice(0, 5).map((url, index) => {
            const isLast = index === 4 && previewUrls.length > 5;
            return (
              <div
                key={index}
                className="relative h-24 rounded-xl overflow-hidden border border-gray-200 shadow-sm"
              >
                <img
                  src={url}
                  alt={`preview-${index}`}
                  className="w-full h-full object-cover"
                />

                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => handleRemovePhoto(index)}
                  className="absolute top-1 right-1 bg-white text-red-500 rounded-full p-0.5 shadow"
                >
                  <X size={12} />
                </button>

                {/* +N overlay */}
                {isLast && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-sm rounded-xl">
                    +{previewUrls.length - 5}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-sm text-red-500 mt-2">{error}</p>
      )}
    </div>
  );
});

export default UploadGallery;

