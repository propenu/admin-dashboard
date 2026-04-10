// src/pages/post-property/featured-create/steps/GalleryStep.jsx
import { forwardRef, useImperativeHandle, useRef, useState ,useEffect} from "react";
import { Upload, X, Images } from "lucide-react";
import imageCompression from "browser-image-compression";
import { getDB, deleteImage, saveImage } from "../utils/indexedDB";


const compressImage = async (file) => {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  };

  try {
    return await imageCompression(file, options);
  } catch (e) {
    return file;
  }
};

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });
};

const GalleryStep = forwardRef(({ payload, update }, ref) => {
  const galleryFiles   = payload.galleryFiles   || [];
  const gallerySummary = payload.gallerySummary || [];
  const [errors, setErrors] = useState({});
  const galleryRef = useRef(null);

  useImperativeHandle(ref, () => ({
    validate() {
      const e = {};
      if (galleryFiles.length < 5) e.gallery = "Minimum 5 images are required";
      setErrors(e);
      if (Object.keys(e).length) {
        galleryRef.current?.scrollIntoView({ behavior:"smooth", block:"center" });
        return false;
      }
      return true;
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
   const files = Array.from(e.target.files);
   if (!files.length) return;

   const compressedFiles = await Promise.all(
     files.map((f) => compressImage(f)),
   );

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
     galleryFiles: [...galleryFiles, ...items], // ✅ now contains key
     gallerySummary: [...gallerySummary, ...newSummary],
   });
 };

  // const removeImage = (index) => {
  //   update({
  //     galleryFiles:   galleryFiles.filter((_,i) => i !== index),
  //     gallerySummary: gallerySummary.filter((_,i) => i !== index).map((item,idx) => ({ ...item, order:idx+1 })),
  //   });
  // };


  // const removeImage = (index) => {
  //   update({
  //     galleryFiles: galleryFiles.filter((_, i) => i !== index),
  //     galleryPreviews: (payload.galleryPreviews || []).filter(
  //       (_, i) => i !== index,
  //     ),
  //     gallerySummary: gallerySummary
  //       .filter((_, i) => i !== index)
  //       .map((item, idx) => ({ ...item, order: idx + 1 })),
  //   });
  // };
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
};

  const count  = galleryFiles.length;
  const needed = Math.max(0, 5 - count);
  const pct    = Math.min(100, (count / 5) * 100);

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
          PNG, JPG, WEBP — multiple files supported
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {galleryFiles.map((file, i) => (
            <div
              key={i}
              className="group relative rounded-2xl overflow-hidden border-2 border-gray-200 shadow-sm aspect-square bg-gray-100"
            >
              <img
                src={
                  payload.galleryPreviews?.[i] ||
                  (file?.file instanceof Blob
                    ? URL.createObjectURL(file.file)
                    : "")
                }
                alt="preview"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex flex-col justify-between p-3">
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="self-end w-8 h-8 bg-red-500 rounded-xl flex items-center justify-center shadow-lg"
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
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center py-8 text-gray-400">
          <Images size={40} className="mb-3 opacity-30" />
          <p className="text-sm font-bold">No images uploaded yet</p>
        </div>
      )}
    </div>
  );
});

export default GalleryStep;