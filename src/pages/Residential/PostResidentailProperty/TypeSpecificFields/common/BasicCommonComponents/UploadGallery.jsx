
// frontend/admin-dashboard/src/pages/Residential/PostResidentailProperty/TypeSpecificFields/common/BasicCommonComponents/UploadGallery.jsx
import { X } from "lucide-react";
import { forwardRef, useEffect, useState } from "react";
import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";
import { deletePropertyGalleryImagesIndex } from "../../../../../../features/property/propertyService";
import { toast } from "sonner";
import {
  compressProjectImages,
  formatFileSizeMb,
  getImageRejectError,
  ONE_MB,
} from "../../../../../../utils/compressProjectImage";

const MIN_FILES = 5;
const MAX_FILES = 12;

/* ══════════════════════════════════════════════════════════
   COMPONENT
══════════════════════════════════════════════════════════ */
const UploadGallery = forwardRef(({ error, onCompressingChange }, ref) => {
  const { form, updateFieldValue } = useActivePropertySlice();
  const [previewUrls, setPreviewUrls] = useState([]);
  const [compressing, setCompressing] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [currentFileName, setCurrentFileName] = useState("");

  useEffect(() => {
    onCompressingChange?.(compressing);
  }, [compressing, onCompressingChange]);



// useEffect(() => {
//   if (!form.gallery || !form.gallery.length) return;

//   const serverImages = form.gallery.map((img) => ({
//     preview: img.url,
//     name: img.filename,
//     key: img.key,
//     source: "server",
//   }));

//   console.log("🔥 RESET galleryFiles from backend:", serverImages);

//   updateFieldValue("galleryFiles", serverImages);
// }, [form.gallery]);

const [initialized, setInitialized] = useState(false);

useEffect(() => {
  if (initialized) return;
  if (!form.gallery?.length) return;

  const serverImages = form.gallery.map((img) => ({
    preview: img.url,
    name: img.filename,
    key: img.key,
    source: "server",
  }));

  updateFieldValue("galleryFiles", serverImages);
  setInitialized(true);
}, [form.gallery, initialized]);
  

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const existing = form.galleryFiles || [];

    const slotsLeft = MAX_FILES - existing.length;
    if (slotsLeft <= 0) {
      alert(`Maximum ${MAX_FILES} photos allowed.`);
      e.target.value = "";
      return;
    }

    const filesToProcess = files.slice(0, slotsLeft).filter((file) => {
      const duplicate = existing.some((item) => {
        if (item.source === "server") return item.name === file.name;
        if (item.source === "local") {
          return (
            item.originalName === file.name &&
            item.originalSize === file.size &&
            item.originalLastModified === file.lastModified
          );
        }
        return false;
      });
      if (duplicate) {
        toast.error(`${file.name} has already been uploaded.`);
        return false;
      }
      const reject = getImageRejectError(file, file.name);
      if (reject) {
        toast.error(reject);
        return false;
      }
      return true;
    });

    if (!filesToProcess.length) {
      e.target.value = "";
      return;
    }

    setCompressing(true);
    setProgress({ done: 0, total: filesToProcess.length });
    setCurrentFileName(filesToProcess[0]?.name || "");

    const results = await compressProjectImages(filesToProcess, {
      silent: true,
      onProgress: ({ done, total, currentName }) => {
        setProgress({ done, total });
        if (currentName) setCurrentFileName(currentName);
      },
    });

    const newItems = [];
    for (const result of results) {
      const original = result.original;
      if (!result.ok) {
        toast.error(result.error?.message || `Failed to process ${original.name}`);
        continue;
      }
      const compressed = result.file;
      if (compressed.size > ONE_MB) {
        toast.error(
          `${original.name} could not be compressed below 1MB. Please choose another image.`,
        );
        continue;
      }
      toast.success(
        `${original.name}: ${(original.size / ONE_MB).toFixed(2)} MB → ${(compressed.size / ONE_MB).toFixed(2)} MB`,
      );
      newItems.push({
        file: compressed,
        source: "local",
        name: compressed.name,
        size: compressed.size,
        originalName: original.name,
        originalSize: original.size,
        originalLastModified: original.lastModified,
        preview: URL.createObjectURL(compressed),
      });
    }

    const updated = [...existing, ...newItems].slice(0, MAX_FILES);
    updateFieldValue("galleryFiles", updated);

    setCompressing(false);
    setCurrentFileName("");
    setProgress({ done: 0, total: 0 });
    e.target.value = "";
  };

// const handleRemovePhoto = async (index) => {
//   console.log("BEFORE REMOVE", form.galleryFiles);

//   const updated = currentFiles.filter((_, i) => i !== index);

//   console.log("AFTER REMOVE", updated);
//   try {
//     const currentFiles = form.galleryFiles || [];
//     const fileToRemove = currentFiles[index];

//     const isNewFile = fileToRemove?.source === "local";

//     // 🔥 SCENARIO 1: BEFORE SAVE (NEW FILE)
//     if (isNewFile) {
//       const updated = currentFiles.filter((_, i) => i !== index);
//       updateFieldValue("galleryFiles", updated);
//       return;
//     }

//     // 🔥 SCENARIO 2: AFTER SAVE (EXISTING FILE)
//     const propertyId = form._id || form.id;
//     const category = form.propertyCategory;

//     await deletePropertyGalleryImagesIndex(category, propertyId, index);

//     const updated = currentFiles.filter((_, i) => i !== index);
//     updateFieldValue("galleryFiles", updated);

//     toast.success("Image deleted!");
//   } catch (err) {
//     console.error("DELETE ERROR:", err.response?.data || err);
//     toast.error("Delete failed");
//   }
// };
   

// const handleRemovePhoto = async (index) => {
//   try {
//     const currentFiles = form.galleryFiles || [];

//     console.log("BEFORE REMOVE", currentFiles);

//     const updated = currentFiles.filter((_, i) => i !== index);

//     console.log("AFTER REMOVE", updated);

//     const fileToRemove = currentFiles[index];

//     const isNewFile = fileToRemove?.source === "local";

//     if (isNewFile) {
//       updateFieldValue("galleryFiles", updated);
//       return;
//     }

//     const propertyId = form._id || form.id;
//     const category = form.propertyCategory;

//     await deletePropertyGalleryImagesIndex(category, propertyId, index);

//     updateFieldValue("galleryFiles", updated);

//     toast.success("Image deleted!");
//   } catch (err) {
//     console.error("DELETE ERROR:", err.response?.data || err);
//     toast.error("Delete failed");
//   }
// };


const handleRemovePhoto = async (index) => {
  try {
    const currentFiles = form.galleryFiles || [];

    console.log("BEFORE REMOVE", currentFiles);

    const fileToRemove = currentFiles[index];

    const updated = currentFiles.filter((_, i) => i !== index);

    console.log("AFTER REMOVE", updated);

    const isNewFile = fileToRemove?.source === "local";

    // ===== BEFORE SAVE =====
    if (isNewFile) {
      // Revoke ONLY the deleted image
      if (fileToRemove?.preview && fileToRemove.preview.startsWith("blob:")) {
        URL.revokeObjectURL(fileToRemove.preview);
      }

      updateFieldValue("galleryFiles", updated);

      return;
    }

    // ===== AFTER SAVE =====
    const propertyId = form._id || form.id;
    const category = form.propertyCategory;

    await deletePropertyGalleryImagesIndex(category, propertyId, index);

    updateFieldValue("galleryFiles", updated);

    toast.success("Image deleted!");
  } catch (err) {
    console.error("DELETE ERROR:", err?.response?.data || err);

    toast.error("Delete failed");
  }
};


  useEffect(() => {
    if (!form.galleryFiles?.length) {
      setPreviewUrls([]);
      return;
    }

    const urls = form.galleryFiles
      .map((item) => {
        // Local image preview
        if (item?.source === "local" && item.preview) {
          return item.preview;
        }

        // Server image preview
        if (item?.source === "server" && item.preview) {
          return item.preview;
        }

        // Fallback
        if (item?.url) {
          return item.url;
        }

        console.error("❌ INVALID PREVIEW ITEM:", item);
        return null;
      })
      .filter(Boolean);

    setPreviewUrls(urls);

    // ❌ DO NOT revoke blob URLs here
  }, [form.galleryFiles]);


  const photoCount = form.galleryFiles?.length || 0;

  /* ── RENDER ── */
  return (
    <div ref={ref}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-gray-700">
          Add photos of your property{" "}
          <span className="text-red-500">*</span>
          <span className="ml-1 text-xs font-normal text-gray-400">
            (min {MIN_FILES} required)
          </span>
        </p>
        <span
          className={`text-xs ${
            error || photoCount < MIN_FILES ? "text-red-500 font-semibold" : "text-gray-400"
          }`}
        >
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
            : error
            ? "border-red-400 bg-red-50 cursor-pointer hover:bg-red-50/80"
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
              Compressing {progress.done}/{progress.total} done
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
                Min {MIN_FILES} · max {MAX_FILES} · under 1MB kept · over → ~0.9MB
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
            const sizeLabel = formatFileSizeMb(form.galleryFiles?.[index]);
            return (
              <div
                key={index}
                className="relative h-24 rounded-xl overflow-hidden border border-gray-200 shadow-sm"
              >
                

                {url ? (
                  <img
                    src={url}
                    alt={`preview-${index}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                    No Preview
                  </div>
                )}

                {sizeLabel && (
                  <span className="absolute left-1 bottom-1 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-white shadow">
                    {sizeLabel}
                  </span>
                )}

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
        <p className="text-sm text-red-500 mt-2 font-medium">{error}</p>
      )}
      {!error && photoCount > 0 && photoCount < MIN_FILES && (
        <p className="text-sm text-amber-600 mt-2">
          Upload at least {MIN_FILES - photoCount} more photo
          {MIN_FILES - photoCount === 1 ? "" : "s"} to continue.
        </p>
      )}
    </div>
  );
});

export default UploadGallery;

