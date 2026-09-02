
// frontend/admin-dashboard/src/pages/post-property/FeaturedPoperty/FeaturedPreviewPageComponents/AboutUsEditor.jsx
import React, { useState, useEffect } from "react";
import { compressImage } from "./imageCompressor";
import TiptapEditor from "../../CreateFeaturedProjects/Components/TiptapEditor";
import ImageLightbox from "../../../../components/ImageLightbox";

export default function AboutUsEditor({ formData, setFormData, setLivePreviewData, saving, onSave }) {
  if (!formData) return null;

  const about = formData.aboutSummary?.[0] || {
    builderName: "",
    aboutDescription: "",
    rightContent: "",
    url: "",
  };

  const [localState, setLocalState] = useState({
    builderName: about.builderName || "",
    aboutDescription: about.aboutDescription || "",
    rightContent:     about.rightContent     || "",
    imageFile:        null,
    imagePreview:     about.url              || "",
  });
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    if (about.url && !localState.imageFile) {
      setLocalState((p) => ({ ...p, imagePreview: about.url }));
    }
  }, [about.url]);

  useEffect(() => {
    setLocalState((p) => ({
      ...p,
      builderName: about.builderName || "",
      aboutDescription: about.aboutDescription || "",
      rightContent: about.rightContent || "",
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [about.builderName, about.aboutDescription, about.rightContent]);

  const syncAbout = (patch) => {
    const next = { ...localState, ...patch };
    setLocalState((p) => ({ ...p, ...patch }));
    setLivePreviewData({
      ...formData,
      aboutSummary: [
        {
          builderName: next.builderName,
          aboutDescription: next.aboutDescription,
          rightContent: next.rightContent,
          url: next.imagePreview,
        },
      ],
    });
  };

  const handleBuilderNameChange = (e) => {
    syncAbout({ builderName: e.target.value });
  };

  const handleDescriptionChange = (e) => {
    syncAbout({ aboutDescription: e.target.value });
  };

  const handleRichTextChange = (html) => {
    syncAbout({ rightContent: html });
  };

  // function handleImageChange(e) {
  //   const file = e.target.files[0];
  //   if (!file) return;
  //   const previewUrl = URL.createObjectURL(file);
  //   setLocalState((p) => ({ ...p, imageFile: file, imagePreview: previewUrl }));
  //   setLivePreviewData({
  //     ...formData,
  //     aboutSummary: [{ aboutDescription: localState.aboutDescription, rightContent: localState.rightContent, url: previewUrl }],
  //   });
  // }

  async function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const compressed = await compressImage(
        file,
        "gallery",
        "About Section Image",
      );
      const previewUrl = URL.createObjectURL(compressed);
      syncAbout({
        imageFile: compressed,
        imagePreview: previewUrl,
        imageSize: compressed.size,
      });
    } catch {
      e.target.value = "";
    }
  }

  function saveAbout() {
    onSave({
      ...formData,
      aboutSummary: [
        {
          builderName: localState.builderName,
          aboutDescription: localState.aboutDescription,
          rightContent: localState.rightContent,
        },
      ],
      aboutImage: localState.imageFile || undefined,
    });
  }

  const titleText = String(formData?.title || "").trim();
  const builderNameText = String(localState.builderName || "").trim();
  const sameAsPropertyTitle =
    titleText &&
    builderNameText &&
    titleText.toLowerCase() === builderNameText.toLowerCase();

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#27AE60]/8 to-transparent px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#27AE60] rounded-lg flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-800">About Section Editor</h3>
            <p className="text-[10px] text-gray-400">Rich text & image support</p>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-5 max-h-[85vh] overflow-y-auto">

        {/* Builder Name */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
            Builder Name
          </label>
          <input
            type="text"
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#27AE60]/30 focus:border-[#27AE60] transition bg-gray-50/50"
            placeholder="e.g. company / builder display name"
            value={localState.builderName}
            onChange={handleBuilderNameChange}
          />
          {builderNameText ? (
            <p className="text-xs font-semibold text-slate-600">
              Showing as:{" "}
              <span className="text-[#27AE60]">{builderNameText}</span>
              {sameAsPropertyTitle ? (
                <span className="ml-1.5 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                  Same as Property Title
                </span>
              ) : null}
            </p>
          ) : (
            <p className="text-[11px] text-gray-400">
              Optional. Saved separately from Property Title.
            </p>
          )}
        </div>

        {/* Main description */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
            Main Overview
          </label>
          <textarea
            rows={4}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#27AE60]/30 focus:border-[#27AE60] transition bg-gray-50/50 resize-none"
            placeholder="Write the main property overview text…"
            value={localState.aboutDescription}
            onChange={handleDescriptionChange}
          />
        </div>

        {/* Rich text */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
            Key Highlights (Rich Text)
          </label>
          <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#27AE60]/30 focus-within:border-[#27AE60] transition">
            <TiptapEditor value={localState.rightContent} onChange={handleRichTextChange} />
          </div>
        </div>

        {/* Image upload */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
            Section Image
          </label>

          <div className="space-y-2">
            {localState.imagePreview ? (
              <div className="relative rounded-xl overflow-hidden border-2 border-[#27AE60]/20 group">
                <button
                  type="button"
                  className="block w-full cursor-zoom-in"
                  onClick={() => setPreviewOpen(true)}
                  title="View full image"
                >
                  <img
                    src={localState.imagePreview}
                    alt="Preview"
                    className="w-full h-40 object-cover"
                  />
                </button>
                {(localState.imageSize || localState.imageFile?.size) ? (
                  <span className="absolute bottom-2 left-2 z-10 rounded-md bg-black/75 px-1.5 py-0.5 text-[9px] font-black text-white pointer-events-none">
                    {((localState.imageSize || localState.imageFile?.size) / (1024 * 1024)).toFixed(2)} MB
                  </span>
                ) : null}
                <div className="absolute top-2 right-2 z-10 flex gap-1.5 opacity-0 group-hover:opacity-100 transition">
                  <button
                    type="button"
                    onClick={() => setPreviewOpen(true)}
                    className="px-2 py-1 rounded-lg bg-black/60 text-white text-[10px] font-bold"
                  >
                    View
                  </button>
                  <label className="px-2 py-1 rounded-lg bg-[#27AE60] text-white text-[10px] font-bold cursor-pointer">
                    Replace
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                </div>
                <ImageLightbox
                  images={[{ url: localState.imagePreview, title: "About Image" }]}
                  openIndex={previewOpen ? 0 : null}
                  onClose={() => setPreviewOpen(false)}
                  onChangeIndex={() => {}}
                />
              </div>
            ) : (
              <label className="block cursor-pointer">
                <div className="relative rounded-xl overflow-hidden border-2 border-dashed border-gray-200 hover:border-[#27AE60] transition">
                  <div className="flex flex-col items-center justify-center h-32 gap-2">
                    <div className="w-10 h-10 bg-[#27AE60]/10 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-[#27AE60]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="text-xs font-semibold text-[#27AE60]">Upload Section Image</span>
                    <span className="text-[10px] text-gray-400">PNG, JPG — Recommended 800×600</span>
                  </div>
                </div>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            )}
          </div>
        </div>

        {/* Save */}
        <button
          onClick={saveAbout}
          disabled={saving}
          className="w-full py-3 bg-[#27AE60] hover:bg-[#219150] text-white text-sm font-bold rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 shadow-md shadow-[#27AE60]/20 flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              Saving…
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
              Save About Section
            </>
          )}
        </button>
      </div>
    </div>
  );
}
