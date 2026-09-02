// src/pages/post-property/featured-create/steps/GalleryStep.jsx
import { forwardRef, useImperativeHandle, useRef, useState ,useEffect, useMemo} from "react";
import { Upload, X, Images } from "lucide-react";
import { getDB, deleteImage, saveImage } from "../utils/indexedDB";
import { toast } from "sonner";
import {
  compressProjectImage,
  getImageRejectError,
  formatBytesMb,
  ONE_MB,
} from "../../../../utils/compressProjectImage";
import ImageLightbox from "../../../../components/ImageLightbox";

const GalleryStep = forwardRef(({ payload, update }, ref) => {
  const galleryFiles   = payload.galleryFiles   || [];
  const gallerySummary = payload.gallerySummary || [];
  const [errors, setErrors] = useState({});
  const [previewIndex, setPreviewIndex] = useState(null);
  const galleryRef = useRef(null);

  
 
  useImperativeHandle(ref, () => ({
    validate() {
      const e = {};

      if (galleryFiles.length < 5) {
        e.gallery = "Minimum 5 images are required";
      }

      if (galleryFiles.length > 50) {
        e.gallery = "Maximum 50 images are allowed";
      }

      setErrors(e);

      if (Object.keys(e).length) {
        galleryRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        return false;
      }

      return true;
    },

    // ✅ ADD THIS (IMPORTANT)
    isValid() {
      return galleryFiles.length >= 5;
    },
  }));


  const clr = (key) => setErrors((p) => { const c={...p}; delete c[key]; return c; });

  
  useEffect(() => {
    const loadImages = async () => {
      const db = await getDB();

      const keys = await db.getAllKeys("gallery-images");

      const files = await Promise.all(
        keys.map(async (key) => {
          const blob = await db.get("gallery-images", key);

          return {
            file: blob,
            key: key,
          };
        }),
      );

      const summary = files.map((item, i) => ({
        title: item.file.name?.replace(/\.[^/.]+$/, "") || "Image",
        category: "Gallery",
        order: i + 1,
        filename: item.file.name || "image.jpg",
      }));

      update({
        galleryFiles: files,
        gallerySummary: summary,
      });
    };

    loadImages(); // ✅ ALWAYS CALL
  }, []);

 const handleUpload = async (e) => {
   const files = Array.from(e.target.files || []);

   if (!files.length) return;

   const imageFiles = [];
   files.forEach((file) => {
     const reject = getImageRejectError(file, file.name);
     if (reject) {
       toast.error(reject);
     } else {
       imageFiles.push(file);
     }
   });

   if (!imageFiles.length) {
     e.target.value = "";
     return;
   }

   const existingImages = galleryFiles
     .filter((item) => item?.file?.name)
     .map((item) => item.file.name.toLowerCase());

   const seen = new Set(existingImages);

   const uniqueFiles = [];

   imageFiles.forEach((file) => {
     const key = file.name.toLowerCase();

     if (seen.has(key)) {
       toast.error(`${file.name} is already added. Please select a new image.`);
     } else {
       seen.add(key);
       uniqueFiles.push(file);
     }
   });

   if (galleryFiles.length + uniqueFiles.length > 50) {
     toast.error(
       `Maximum 50 images are allowed. You already have ${galleryFiles.length} images.`,
     );
     e.target.value = "";
     return;
   }

   if (uniqueFiles.length === 0) {
     e.target.value = "";
     return;
   }

   const toastId = toast.loading("Preparing images...⏳");

   try {
     const compressedFiles = await Promise.all(
       uniqueFiles.map((f) =>
         compressProjectImage(f, { silent: true, label: f.name }),
       ),
     );

     for (const file of compressedFiles) {
       if (file.size > ONE_MB) {
         toast.error(
           `${file.name} is ${(file.size / ONE_MB).toFixed(2)} MB.
Maximum allowed size is 1 MB.`,
           { id: toastId },
         );
         e.target.value = "";
         return;
       }
     }

     const items = await Promise.all(
       compressedFiles.map(async (file) => {
         const key = await saveImage(file, "gallery");

         return {
           file,
           key,
           name: file.name,
         };
       }),
     );

     const newSummary = items.map((item, i) => ({
       title: item.file.name.replace(/\.[^/.]+$/, ""),
       category: "Gallery",
       order: gallerySummary.length + i + 1,
       filename: item.file.name,
     }));

     update({
       galleryFiles: [...galleryFiles, ...items],
       gallerySummary: [...gallerySummary, ...newSummary],
     });

     e.target.value = "";

     const originalSize = uniqueFiles.reduce((sum, file) => sum + file.size, 0);
     const compressedSize = compressedFiles.reduce(
       (sum, file) => sum + file.size,
       0,
     );

     toast.success(
       `${uniqueFiles.length} image(s) ready
${(originalSize / ONE_MB).toFixed(2)} MB → ${(compressedSize / ONE_MB).toFixed(2)} MB
(under 1 MB kept original; over 1 MB → ~0.9 MB)`,
       { id: toastId },
     );
   } catch (err) {
     toast.error(err?.message || "Something went wrong!", {
       id: toastId,
     });
     e.target.value = "";
   }
 };

  const removeImage = async (index) => {
  const item = galleryFiles[index];

  if (!item?.key) return; // safety

  await deleteImage(item.key, "gallery");

  update({
    galleryFiles: galleryFiles.filter((_, i) => i !== index),
    gallerySummary: gallerySummary
      .filter((_, i) => i !== index)
      .map((item, idx) => ({ ...item, order: idx + 1 })),
  });

  toast.success("Image deleted successfully");
};

  const count  = galleryFiles.length;
  const needed = Math.max(0, 5 - count);
  const pct    = Math.min(100, (count / 5) * 100);

  const lightboxImages = useMemo(
    () =>
      galleryFiles.map((file, i) => ({
        url:
          payload.galleryPreviews?.[i] ||
          (file?.file instanceof Blob ? URL.createObjectURL(file.file) : ""),
        title: gallerySummary[i]?.title || `Image ${i + 1}`,
      })),
    [galleryFiles, gallerySummary, payload.galleryPreviews],
  );

  return (
    <div className="space-y-6" ref={galleryRef}>
      {/* Upload zone */}
      <label
        className={`flex flex-col items-center justify-center w-full py-12 px-6 rounded-2xl
        border-2 border-dashed cursor-pointer transition-all duration-200 group
        ${
          errors.gallery
            ? "border-red-400 bg-red-50"
            : "border-gray-300 bg-gray-50 hover:border-[#27AE60] hover:bg-[#f0fdf6]"
        }`}
      >
        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all
          ${errors.gallery ? "bg-red-100" : "bg-white shadow-sm group-hover:bg-[#27AE60]/10"}`}
        >
          <Upload
            size={28}
            className={`${errors.gallery ? "text-red-400" : "text-gray-400 group-hover:text-[#27AE60]"} transition-colors`}
          />
        </div>
        <p
          className={`text-sm font-black ${errors.gallery ? "text-red-600" : "text-gray-700 group-hover:text-[#27AE60]"} transition-colors`}
        >
          Click to upload or drag & drop
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Images only — under 1 MB kept original; over 1 MB → ~0.9 MB
        </p>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleUpload}
          className="hidden"
        />
      </label>

      {/* Progress */}
      <div className="bg-white border-2 border-gray-200 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-black text-gray-700">
            Upload Progress
          </span>
          <span
            className={`text-sm font-black ${count >= 5 ? "text-[#27AE60]" : "text-amber-500"}`}
          >
            {count} / 5 minimum {count >= 5 ? "✓" : `(${needed} more needed)`}
          </span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${pct}%`,
              background:
                count >= 5
                  ? "linear-gradient(90deg,#27AE60,#2ecc71)"
                  : "linear-gradient(90deg,#f59e0b,#fbbf24)",
            }}
          />
        </div>
      </div>

      {errors.gallery && (
        <div className="px-4 py-3 bg-red-50 border-2 border-red-200 rounded-xl text-red-600 text-sm font-semibold">
          ⚠ {errors.gallery}
        </div>
      )}

      {/* Image grid */}
      {count > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-6 lg:grid-cols-8 gap-4">
          {galleryFiles.map((file, i) => {
            const previewSrc =
              payload.galleryPreviews?.[i] ||
              (file?.file instanceof Blob
                ? URL.createObjectURL(file.file)
                : "");
            return (
            <div
              key={i}
              className="group w-[100px] relative rounded-2xl overflow-hidden border-2 border-gray-200 shadow-sm aspect-square bg-gray-100 cursor-pointer"
              onClick={() => setPreviewIndex(i)}
              title="Click to view full image"
            >
              <img
                src={previewSrc}
                alt="preview"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {file?.file?.size ? (
                <span className="absolute bottom-1 left-1 z-10 rounded bg-black/75 px-1 py-0.5 text-[8px] font-black text-white">
                  {formatBytesMb(file.file.size)}
                </span>
              ) : null}
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex flex-col justify-between p-3 pointer-events-none">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(i);
                  }}
                  className="self-end w-8 h-8 bg-red-500 rounded-xl flex items-center justify-center shadow-lg pointer-events-auto"
                >
                  <X size={14} className="text-white" strokeWidth={3} />
                </button>
                <div>
                  <p className="text-white text-xs font-bold truncate">
                    {gallerySummary[i]?.title}
                  </p>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-white/70 text-[10px]">
                      {gallerySummary[i]?.category}
                    </span>
                    <span className="text-white/70 text-[10px]">
                      #{gallerySummary[i]?.order}
                    </span>
                  </div>
                </div>
              </div>
              {/* Number badge */}
              <div
                className="absolute top-2 left-2 w-6 h-6 rounded-lg text-white flex items-center justify-center text-[10px] font-black shadow-md"
                style={{
                  background: "linear-gradient(135deg,#27AE60,#1e8449)",
                }}
              >
                {i + 1}
              </div>
            </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center py-8 text-gray-400">
          <Images size={40} className="mb-3 opacity-30" />
          <p className="text-sm font-bold">No images uploaded yet</p>
        </div>
      )}

      <ImageLightbox
        images={lightboxImages}
        openIndex={previewIndex}
        onClose={() => setPreviewIndex(null)}
        onChangeIndex={setPreviewIndex}
      />
    </div>
  );
});

export default GalleryStep;