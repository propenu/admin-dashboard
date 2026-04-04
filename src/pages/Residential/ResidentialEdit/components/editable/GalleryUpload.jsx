// frontend/admin-dashboard/src/pages/Residential/PostResidentailProperty/TypeSpecificFields/common/BasicCommonComponents/UploadGallery.jsx
import { X, UploadCloud, CheckCircle2, AlertCircle } from "lucide-react";
import { forwardRef, useEffect, useRef, useState } from "react";
import { useActivePropertySlice } from "../../../PostResidentailProperty/TypeSpecificFields/UsePropertySlice/useActivePropertySlice";
import { deletePropertyGalleryImagesIndex } from "../../../../../features/property/propertyService";
import { toast } from "sonner";

/* ══════════════════════════════════════════════════════════
   CONSTANTS
══════════════════════════════════════════════════════════ */
const MAX_FILES = 20;
const MIN_REQUIRED = 5;
const TARGET_KB = 200;
const TARGET_BYTES = TARGET_KB * 1024;

// Persistent WeakMap cache for blob preview URLs
const previewCache = new WeakMap();

/* ══════════════════════════════════════════════════════════
   IMAGE COMPRESSION UTILITY
══════════════════════════════════════════════════════════ */
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

          if (w > maxDimension || h > maxDimension) {
            const ratio = Math.min(maxDimension / w, maxDimension / h);
            w = Math.floor(w * ratio);
            h = Math.floor(h * ratio);
          }

          canvas.width = w;
          canvas.height = h;

          const ctx = canvas.getContext("2d");
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, w, h);
          ctx.drawImage(img, 0, 0, w, h);

          canvas.toBlob((blob) => res(blob), "image/jpeg", quality);
        });
      };

      const dimensionSteps = [1920, 1280, 960, 640, 480];
      const qualitySteps = [0.8, 0.65, 0.5, 0.35, 0.2];

      const tryNext = async (dIdx, qIdx) => {
        if (dIdx >= dimensionSteps.length) {
          const blob = await compress(480, 0.1);
          return blob;
        }

        const blob = await compress(dimensionSteps[dIdx], qualitySteps[qIdx]);

        if (blob.size <= TARGET_BYTES) return blob;

        if (qIdx + 1 < qualitySteps.length) return tryNext(dIdx, qIdx + 1);

        return tryNext(dIdx + 1, 0);
      };

      tryNext(0, 0)
        .then((finalBlob) => {
          const outputName = file.name.replace(/\.[^.]+$/, ".jpg");
          const finalFile = new File([finalBlob], outputName, {
            type: "image/jpeg",
            lastModified: Date.now(),
          });

          console.log(
            `✅ ${file.name}: ${(file.size / 1024).toFixed(0)}KB → ${(
              finalFile.size / 1024
            ).toFixed(0)}KB`
          );

          resolve(finalFile);
        })
        .catch(reject);
    };

    img.src = objectUrl;
  });
};

/* ══════════════════════════════════════════════════════════
   COMPONENT
══════════════════════════════════════════════════════════ */
const UploadGallery = forwardRef(({ error }, ref) => {
  const { form, updateFieldValue } = useActivePropertySlice();
  const inputRef = useRef(null);

  const [compressing, setCompressing] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [currentFileName, setCurrentFileName] = useState("");

  /* ── DEBUG ── */
  useEffect(() => {
    console.log("📸 galleryFiles:", form?.galleryFiles);
  }, [form?.galleryFiles]);

  /* ── Separate existing (server) vs new (File) entries ── */
  const allFiles = form?.galleryFiles || [];
  const existingImages = allFiles.filter((f) => !(f instanceof File));
  const newFiles = allFiles.filter((f) => f instanceof File);

  const totalCount = allFiles.length;

  /* ── UPLOAD & COMPRESS ── */
  const handleFiles = async (fileList) => {
    if (!fileList) return;
    const files = Array.from(fileList);
    if (!files.length) return;

    const slotsLeft = MAX_FILES - totalCount;
    if (slotsLeft <= 0) {
      alert(`Maximum ${MAX_FILES} photos allowed.`);
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
        // Cache preview URL immediately after compression
        if (!previewCache.has(compressed)) {
          previewCache.set(compressed, URL.createObjectURL(compressed));
        }
        compressedFiles.push(compressed);
      } catch (err) {
        console.error(`❌ Failed: ${file.name}`, err);
      }
      setProgress((prev) => ({ ...prev, done: prev.done + 1 }));
    }

    const updated = [...allFiles, ...compressedFiles].slice(0, MAX_FILES);

    console.log(
      "📦 Final gallery:",
      updated.map((f) =>
        f instanceof File
          ? `${f.name} (${(f.size / 1024).toFixed(0)}KB)`
          : f?.url || f
      )
    );

    updateFieldValue("galleryFiles", updated);
    setCompressing(false);
    setCurrentFileName("");
    setProgress({ done: 0, total: 0 });
  };

  /* ── REMOVE PHOTO ── */
  const handleRemovePhoto = async (index) => {
    try {
      const fileToRemove = allFiles[index];
      const isNewFile = fileToRemove instanceof File;

      // SCENARIO 1: New (unsaved) file
      if (isNewFile) {
        const blobUrl = previewCache.get(fileToRemove);
        if (blobUrl) {
          URL.revokeObjectURL(blobUrl);
          previewCache.delete(fileToRemove);
        }
        const updated = allFiles.filter((_, i) => i !== index);
        updateFieldValue("galleryFiles", updated);
        return;
      }

      // SCENARIO 2: Existing (server) file
      const propertyId = form._id || form.id;
      const category = form.propertyCategory;

      console.log("DELETE API:", category, propertyId, index);

      await deletePropertyGalleryImagesIndex(category, propertyId, index);

      const updated = allFiles.filter((_, i) => i !== index);
      updateFieldValue("galleryFiles", updated);

      toast.success("Image deleted!");
    } catch (err) {
      console.error("DELETE ERROR:", err.response?.data || err);
      toast.error("Delete failed");
    }
  };

  /* ── GET PREVIEW URL ── */
  const getPreviewUrl = (file) => {
    if (file instanceof File) {
      if (!previewCache.has(file)) {
        try {
          previewCache.set(file, URL.createObjectURL(file));
        } catch {
          return null;
        }
      }
      return previewCache.get(file);
    }
    return file?.url || file;
  };

  /* ── RENDER ── */
  return (
    <div ref={ref} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-700">
          Add photos of your property
        </p>
        <span className="text-xs text-gray-400">
          {totalCount}/{MAX_FILES} photos
        </span>
      </div>

      {/* Upload Drop Zone */}
      <div
        onClick={() => !compressing && totalCount < MAX_FILES && inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (!compressing && totalCount < MAX_FILES) {
            handleFiles(e.dataTransfer.files);
          }
        }}
        className={`relative flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-2xl transition-all duration-200 ${
          compressing
            ? "border-gray-300 bg-gray-50 cursor-not-allowed pointer-events-none"
            : totalCount >= MAX_FILES
            ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-50"
            : "border-[#27AE60] bg-[#F1FCF5] cursor-pointer hover:bg-[#e8f9ee] hover:border-[#1e9a50]"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          hidden
          accept="image/*"
          disabled={compressing || totalCount >= MAX_FILES}
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />

        {compressing ? (
          /* ── Compression Progress UI ── */
          <div className="flex flex-col items-center gap-2 px-4">
            <svg
              className="animate-spin h-7 w-7 text-[#27AE60]"
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

            <div className="w-48 bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-[#27AE60] h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: `${
                    progress.total > 0
                      ? (progress.done / progress.total) * 100
                      : 0
                  }%`,
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
          /* ── Default Upload UI ── */
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-[#27AE60] shadow-green-100">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-xs text-center text-[#27AE60] font-medium">
              Drop property photos here
              <br />
              <span className="text-gray-400 font-normal">
                Up to {MAX_FILES} photos · Auto-compressed · JPG PNG WEBP
              </span>
            </p>
            <span className="mt-1 bg-[#27AE60] px-4 py-1.5 text-white rounded-lg text-sm font-medium">
              Upload Photos
            </span>
          </div>
        )}
      </div>

      {/* Image Grid */}
      {totalCount > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {allFiles.map((file, index) => {
            const isNewFile = file instanceof File;
            const previewUrl = getPreviewUrl(file);

            if (!previewUrl) return null;

            return (
              <div
                key={isNewFile ? `new-${index}-${file.name}` : `existing-${index}`}
                className={`relative aspect-square rounded-2xl overflow-hidden border-2 group shadow-sm ${
                  isNewFile ? "border-blue-200" : "border-slate-100"
                }`}
              >
                <img
                  src={previewUrl}
                  alt={`gallery-${index}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    if (isNewFile) {
                      try {
                        const fallback = URL.createObjectURL(file);
                        previewCache.set(file, fallback);
                        e.target.src = fallback;
                      } catch {}
                    }
                  }}
                />

                {/* Hover Overlay with Remove Button */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemovePhoto(index);
                    }}
                    className="p-2 bg-red-500 text-white rounded-xl hover:bg-red-600 shadow-lg"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Live / New Badge */}
                <div
                  className={`absolute top-2 left-2 text-[8px] font-black text-white px-2 py-0.5 rounded-lg uppercase tracking-tighter ${
                    isNewFile ? "bg-blue-500" : "bg-emerald-500"
                  }`}
                >
                  {isNewFile ? "New" : "Live"}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Status Banner */}
      <div
        className={`flex items-center gap-3 p-3 rounded-2xl border transition-colors ${
          totalCount < MIN_REQUIRED
            ? "bg-amber-50 border-amber-100 text-amber-700"
            : "bg-emerald-50 border-emerald-100 text-emerald-700"
        }`}
      >
        {totalCount < MIN_REQUIRED ? (
          <AlertCircle className="w-4 h-4 shrink-0" />
        ) : (
          <CheckCircle2 className="w-4 h-4 shrink-0" />
        )}
        <p className="text-[11px] font-bold uppercase tracking-wider">
          {totalCount < MIN_REQUIRED
            ? `Need ${MIN_REQUIRED - totalCount} more photo${
                MIN_REQUIRED - totalCount !== 1 ? "s" : ""
              }`
            : `Requirement met (${totalCount} image${totalCount !== 1 ? "s" : ""})`}
        </p>
      </div>

      {/* Error */}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
});

export default UploadGallery;