//frontend/admin-dashboard/src/pages/Residential/PostResidentailProperty/TypeSpecificFields/common/BasicCommonComponents/UploadGallery.jsx

import { X } from "lucide-react";
import { forwardRef, useEffect, useState } from "react";
import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";
import imageCompression from "browser-image-compression";

const MAX_FILES = 20;
const MAX_SIZE_MB = 1;

const UploadGallery = forwardRef(({ error }, ref) => {
  const { form, updateFieldValue } = useActivePropertySlice();
  const [previewUrls, setPreviewUrls] = useState([]);

  /* ================= DEBUG ================= */
  useEffect(() => {
    console.log("📸 Current galleryFiles:", form.galleryFiles);
  }, [form.galleryFiles]);

  /* ================= UPLOAD ================= */
  // const handlePhotoUpload = (e) => {
  //   const files = Array.from(e.target.files || []);

  //   if (!files.length) return;

  //   const validFiles = files.filter((file) => {
  //     const sizeInMB = file.size / (1024 * 1024);
  //   //   if (sizeInMB > MAX_SIZE_MB) {
  //   //     alert(`${file.name} exceeds ${MAX_SIZE_MB}MB limit`);
  //   //     return false;
  //   //   }
  //     return true;
  //   });

  //   const existing = form.galleryFiles || [];
  //   const updated = [...existing, ...validFiles].slice(0, MAX_FILES);

  //   console.log("✅ Files selected:", updated);

  //   updateFieldValue("galleryFiles", updated);
  //   e.target.value = "";
  // };

  

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const compressedFiles = [];

    for (let file of files) {
      try {
        const options = {
          maxSizeMB: 1, // 🔥 ensure below 1MB
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        };

        const compressedFile = await imageCompression(file, options);

        console.log(
          `📉 ${file.name}: ${(file.size / 1024 / 1024).toFixed(
            2,
          )}MB → ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`,
        );

        compressedFiles.push(compressedFile);
      } catch (error) {
        console.error("Compression error:", error);
      }
    }

    const existing = form.galleryFiles || [];
    const updated = [...existing, ...compressedFiles].slice(0, MAX_FILES);

    updateFieldValue("galleryFiles", updated);
    e.target.value = "";
  };
  
  /* ================= REMOVE ================= */
  const handleRemovePhoto = (index) => {
    const updated = (form.galleryFiles || []).filter((_, i) => i !== index);
    updateFieldValue("galleryFiles", updated);
  };

  /* ================= PREVIEW ================= */

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

  useEffect(() => {
    if (!form.galleryFiles || form.galleryFiles.length === 0) {
      setPreviewUrls([]);
      return;
    }

    const urls = form.galleryFiles.map((file) => {
      if (file instanceof File) {
        return URL.createObjectURL(file);
      }

      if (typeof file === "string") {
        return file;
      }

      return file?.url || "";
    });

    setPreviewUrls(urls);

    return () => {
      urls.forEach((url) => {
        if (typeof url === "string" && url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
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




