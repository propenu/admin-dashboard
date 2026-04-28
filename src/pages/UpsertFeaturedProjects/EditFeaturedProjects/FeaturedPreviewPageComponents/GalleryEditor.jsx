// frontend/admin-dashboard/src/pages/post-property/FeaturedPoperty/FeaturedPreviewPageComponents/GalleryEditor.jsx
import React, { useRef } from "react";
import { toast } from "react-hot-toast";

import { deleteFeaturedProjectGalleryImage } from "../../../../features/property/propertyService";

const FALLBACK = "";

export default function GalleryEditor({
  formData,
  setFormData,
  saving,
  onSave,
  setLivePreviewData,
}) {
  if (!formData) return null;

  const gallery = formData.gallerySummary || [];
  const fileMapRef = useRef({});
  const addingRef = useRef(false);

  


  const uid = (item, index) => {
    return (
      item.id || // for new uploads
      item._id || // if backend provides it
      item.key || // if stored
      `${item.filename}-${index}` // safe fallback
    );
  };

  const autoTitle = (file) =>
    file.name
      .replace(/\.[^/.]+$/, "")
      .replace(/[-_]/g, " ")
      .trim();

  const autoCategory = (file) =>
    file.type.startsWith("video/") ? "Video" : "Gallery";

  function getFilenameFromUrl(url) {
    if (!url) return "";
    const decoded = decodeURIComponent(url);
    return decoded.substring(decoded.lastIndexOf("/") + 1);
  }

  function buildPayload(currentFormData, currentGallery) {
    const cleanedGallery = currentGallery.map((item) => {
      const itemId = uid(item);
      const file = fileMapRef.current[itemId];
      const isBlob = item.url?.startsWith("blob:");

      return {
        title: item.title || "",
        category: item.category || "",
        order: item.order || 0,

        filename:
          file instanceof File
            ? file.name
            : item.filename || getFilenameFromUrl(item.url),

        // 🔥 send file for new uploads
        file: file instanceof File ? file : undefined,

        // 🔥 send real URL for existing images
        ...(item.url && !isBlob ? { url: item.url } : {}),
      };
    });

    return {
      ...currentFormData,
      gallerySummary: cleanedGallery,
    };
  }

  function updateItem(id, field, value) {
    setFormData((prev) => {
      const updatedGallery = (prev.gallerySummary || []).map((item) =>
        uid(item) === id ? { ...item, [field]: value } : item
      );
      const next = { ...prev, gallerySummary: updatedGallery };
      setLivePreviewData(next);
      return next;
    });
  }

  function handleFileUpload(id, file) {
    if (!file) return;

    const blobUrl = URL.createObjectURL(file);
    fileMapRef.current[id] = file;

    setFormData((prev) => {
      const updatedGallery = (prev.gallerySummary || []).map((item) => {
        if (uid(item) !== id) return item;
        if (item.url?.startsWith("blob:")) URL.revokeObjectURL(item.url);
        return {
          ...item,
          url: blobUrl,
          isVideo: file.type.startsWith("video/"),
          isDirty: true,
        };
      });
      const next = { ...prev, gallerySummary: updatedGallery };
      setLivePreviewData(next);
      return next;
    });
  }

  function handleNewFiles(e) {
    if (addingRef.current) return;
    addingRef.current = true;

    const files = Array.from(e.target.files);
    e.target.value = "";

    if (!files.length) {
      addingRef.current = false;
      return;
    }

    const prepared = files.map((file) => {
      const newId = crypto.randomUUID();
      fileMapRef.current[newId] = file;
      return {
        id: newId,
        title: autoTitle(file),
        category: autoCategory(file),
        url: URL.createObjectURL(file),
        thumbUrl: "",
        isVideo: file.type.startsWith("video/"),
        isDirty: true,
      };
    });

    setFormData((prev) => {
      const existingGallery = prev.gallerySummary || [];
      const existingIds = new Set(existingGallery.map(uid));
      const newOnes = prepared.filter((e) => !existingIds.has(e.id));

      if (!newOnes.length) {
        addingRef.current = false;
        return prev;
      }

      const withOrder = newOnes.map((entry, i) => ({
        ...entry,
        order: existingGallery.length + i + 1,
      }));

      const next = {
        ...prev,
        gallerySummary: [...existingGallery, ...withOrder],
      };
      setLivePreviewData(next);
      return next;
    });

    setTimeout(() => {
      addingRef.current = false;
    }, 100);
  }

  // ✅ FIXED: Cleaned up the double logic and properly ordered execution
  async function handleDelete(item, index) {
    try {
      if (!window.confirm("Delete this item?")) return;

      const propertyId = formData._id || formData.id;

      // 🔥 FINAL FIX: backend uses index
      const correctIndex = index 

      

      await deleteFeaturedProjectGalleryImage(propertyId, correctIndex);

      // update UI
      setFormData((prev) => {
        const updatedGallery = (prev.gallerySummary || [])
          .filter((_, i) => i !== index)
          .map((item, idx) => ({
            ...item,
            order: idx + 1, // optional for UI
          }));

        const next = { ...prev, gallerySummary: updatedGallery };
        setLivePreviewData(next);
        return next;
      });

      toast.success("Deleted successfully");
    } catch (err) {
      console.error("DELETE ERROR:", err.response?.data);
      toast.error("Delete failed");
    }
  }

  async function saveGallery() {
    const payload = buildPayload(formData, gallery);
    try {
      await onSave(payload);
      toast.success("Gallery saved successfully!");
    } catch {
      toast.error("Save failed");
    }
  }

  async function saveOneItem() {
    const payload = buildPayload(formData, gallery);
    try {
      await onSave(payload);
      toast.success("Image updated!");
    } catch {
      toast.error("Save failed");
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#27AE60]/8 to-transparent px-5 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#27AE60] rounded-lg flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-gray-800">Gallery Manager</h3>
          </div>
          <span className="text-xs font-bold text-[#27AE60] bg-[#27AE60]/10 px-2.5 py-1 rounded-full">
            {gallery.length} items
          </span>
        </div>
      </div>

      <div className="p-5 space-y-5 max-h-[620px] overflow-y-auto">
        {gallery.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {gallery.map((item, index) => {
               const itemId = uid(item, index);
              const isDirty = !!(fileMapRef.current[itemId] || item.url?.startsWith("blob:"));
              const previewUrl = item.url;

              return (
                <div
                  key={itemId}
                  className="relative group rounded-xl border border-gray-100 overflow-hidden bg-gray-50"
                >
                  <div className="h-28 w-full relative">
                    {item.isVideo ? (
                      <video
                        src={previewUrl}
                        className="w-full h-full object-cover"
                        muted
                      />
                    ) : (
                      <img
                        src={previewUrl}
                        alt={item.title || "Preview"}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = FALLBACK;
                        }}
                      />
                    )}
                    {item.isVideo && (
                      <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-md font-bold">
                        VIDEO
                      </span>
                    )}
                    {isDirty && (
                      <span className="absolute top-1.5 left-1.5 bg-amber-500 text-white text-[9px] px-1.5 py-0.5 rounded-md font-bold">
                        UNSAVED
                      </span>
                    )}
                  </div>

                  <div className="p-2.5 space-y-1.5">
                    <input
                      className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#27AE60]/30 bg-white"
                      placeholder="Title"
                      value={item.title || ""}
                      onChange={(e) =>
                        updateItem(itemId, "title", e.target.value)
                      }
                    />
                    <input
                      className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#27AE60]/30 bg-white"
                      placeholder="Category"
                      value={item.category || ""}
                      onChange={(e) =>
                        updateItem(itemId, "category", e.target.value)
                      }
                    />
                    <input
                      className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#27AE60]/30 bg-white"
                      type="number"
                      placeholder="Order"
                      value={item.order || ""}
                      onChange={(e) =>
                        updateItem(itemId, "order", Number(e.target.value))
                      }
                    />
                  </div>

                  {isDirty && (
                    <div className="px-2.5 pb-2.5">
                      <button
                        onClick={saveOneItem}
                        disabled={saving}
                        className="w-full py-1.5 bg-[#27AE60] text-white text-[11px] font-bold rounded-lg hover:bg-[#219150] transition disabled:opacity-50"
                      >
                        {saving ? "Saving…" : "💾 Save Change"}
                      </button>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2 rounded-xl">
                    <label className="bg-white text-gray-800 text-xs px-3 py-1.5 rounded-lg shadow cursor-pointer font-semibold hover:bg-gray-50 transition">
                      Replace
                      <input
                        type="file"
                        accept="image/*,video/*"
                        className="hidden"
                        onChange={(e) =>
                          handleFileUpload(itemId, e.target.files[0])
                        }
                      />
                    </label>
                    <button
                      className="bg-red-500 text-white text-xs px-3 py-1.5 rounded-lg shadow font-semibold hover:bg-red-600 transition"
                      onClick={() => handleDelete(item, index)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-300 text-sm border-2 border-dashed border-gray-100 rounded-xl">
            No gallery items yet. Upload images below.
          </div>
        )}

        <div className="border border-gray-100 rounded-xl bg-gray-50/50 overflow-hidden">
          <div className="px-4 py-3 bg-white border-b border-gray-100">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-widest flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-[#27AE60]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
              </svg>
              Add Images
            </h4>
          </div>
          <div className="p-4">
            <label className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-gray-200 hover:border-[#27AE60] hover:bg-[#27AE60]/5 rounded-xl cursor-pointer transition bg-white group">
              <div className="w-10 h-10 bg-[#27AE60]/10 rounded-xl flex items-center justify-center mb-2 group-hover:bg-[#27AE60]/20 transition">
                <svg className="w-5 h-5 text-[#27AE60]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <span className="text-xs font-bold text-[#27AE60]">Click to upload images</span>
              <p className="text-[10px] text-gray-400 mt-1">PNG, JPG, WEBP, Video — multiple supported</p>
              <input type="file" accept="image/*,video/*" multiple className="hidden" onChange={handleNewFiles} />
            </label>
          </div>
        </div>

        <button
          onClick={saveGallery}
          disabled={saving}
          className="w-full py-3 bg-[#27AE60] hover:bg-[#219150] text-white text-sm font-bold rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 shadow-md shadow-[#27AE60]/20 flex items-center justify-center gap-2"
        >
          {saving ? "Saving…" : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
              Save Gallery
            </>
          )}
        </button>
      </div>
    </div>
  );
}