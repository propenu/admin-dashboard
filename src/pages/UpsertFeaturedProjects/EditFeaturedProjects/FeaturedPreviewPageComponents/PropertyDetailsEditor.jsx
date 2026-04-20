// frontend/admin-dashboard/src/pages/post-property/FeaturedPoperty/FeaturedPreviewPageComponents/PropertyDetailsEditor.jsx

import React, { useState, useEffect } from "react";

export default function PropertyDetailsEditor({
  formData,
  setFormData,
  setLivePreviewData,
  saving,
  onSave,
}) {
  if (!formData) return null;

  const [local, setLocal] = useState({});
  const [newBank, setNewBank] = useState("");
  const [newVideo, setNewVideo] = useState({ title: "", url: "", order: "" });
  const [brochureFile, setBrochureFile] = useState(null);

  useEffect(() => {
    setLocal({
      totalTowers: formData.totalTowers ?? "",
      totalFloors: formData.totalFloors ?? "",
      projectArea: formData.projectArea ?? "",
      totalUnits: formData.totalUnits ?? "",
      availableUnits: formData.availableUnits ?? "",
      possessionDate: formData.possessionDate ?? "",
      reraNumber: formData.reraNumber ?? "",
      redirectUrl: formData.redirectUrl ?? "",
      banksApproved: Array.isArray(formData.banksApproved)
        ? formData.banksApproved
        : [],
      youtubeVideos: Array.isArray(formData.youtubeVideos)
        ? formData.youtubeVideos
        : [],
      brochureUrl: formData.brochureUrl ?? "",
    });
  }, [formData]);

  function sync(patch) {
    const updated = { ...local, ...patch };
    setLocal(updated);
    setFormData((prev) => ({ ...prev, ...patch }));
    setLivePreviewData((prev) => ({ ...prev, ...patch }));
  }

  function change(field, value) {
    sync({ [field]: value });
  }

  /* ── Banks ── */
  function addBank() {
    const trimmed = newBank.trim();
    if (!trimmed) return;
    if (local.banksApproved.includes(trimmed)) {
      setNewBank("");
      return;
    }
    const updated = [...local.banksApproved, trimmed];
    sync({ banksApproved: updated });
    setNewBank("");
  }

  function removeBank(bank) {
    sync({ banksApproved: local.banksApproved.filter((b) => b !== bank) });
  }

  /* ── YouTube videos ── */
  function getYoutubeId(url) {
    if (!url) return null;
    const patterns = [
      /youtu\.be\/([^?&]+)/,
      /youtube\.com\/watch\?v=([^&]+)/,
      /youtube\.com\/embed\/([^?&]+)/,
      /youtube\.com\/shorts\/([^?&]+)/,
    ];
    for (const p of patterns) {
      const m = url.match(p);
      if (m) return m[1];
    }
    return null;
  }

  function addVideo() {
    if (!newVideo.url.trim() || !getYoutubeId(newVideo.url)) return;
    const entry = {
      title: newVideo.title.trim() || `Video ${local.youtubeVideos.length + 1}`,
      url: newVideo.url.trim(),
      order: newVideo.order
        ? Number(newVideo.order)
        : local.youtubeVideos.length + 1,
    };
    const updated = [...local.youtubeVideos, entry];
    sync({ youtubeVideos: updated });
    setNewVideo({ title: "", url: "", order: "" });
  }

  function removeVideo(index) {
    const updated = local.youtubeVideos
      .filter((_, i) => i !== index)
      .map((v, i) => ({ ...v, order: i + 1 }));
    sync({ youtubeVideos: updated });
  }

  /* ── Brochure ── */
  function handleBrochure(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBrochureFile(file);
    setFormData((prev) => ({ ...prev, brochureFile: file }));
    setLivePreviewData((prev) => ({
      ...prev,
      brochureUrl: URL.createObjectURL(file),
    }));
  }

  function handleSave() {
    const payload = {
      ...formData,
      ...local,
      ...(brochureFile ? { brochureFile } : {}),
    };
    onSave(payload);
  }

  const isValidYoutube = getYoutubeId(newVideo.url);

  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col"
      style={{ maxHeight: "90vh" }}
    >
      {/* ── Header ── */}
      <div className="bg-gradient-to-r from-[#27AE60]/8 to-transparent px-5 py-4 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#27AE60] rounded-lg flex items-center justify-center flex-shrink-0">
            <svg
              className="w-3.5 h-3.5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-800">
              Property Details Editor
            </h3>
            <p className="text-[10px] text-gray-400">
              Project stats, documents &amp; videos
            </p>
          </div>
        </div>
      </div>

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6 min-h-0">
        {/* ── Project Stats ── */}
        <div>
          <SectionLabel icon="📊" label="Project Stats" />
          <div className="grid grid-cols-2 gap-3 mt-3">
            <FieldGroup label="Total Towers">
              <input
                type="number"
                className={inputCls}
                placeholder="e.g. 4"
                value={local.totalTowers ?? ""}
                onChange={(e) => change("totalTowers", e.target.value)}
              />
            </FieldGroup>
            <FieldGroup label="Total Floors">
              <input
                type="number"
                className={inputCls}
                placeholder="e.g. 32"
                value={local.totalFloors ?? ""}
                onChange={(e) => change("totalFloors", e.target.value)}
              />
            </FieldGroup>
            <FieldGroup label="Project Area">
              <input
                className={inputCls}
                placeholder="e.g. 5 Acres"
                value={local.projectArea ?? ""}
                onChange={(e) => change("projectArea", e.target.value)}
              />
            </FieldGroup>
            <FieldGroup label="Total Units">
              <input
                type="number"
                className={inputCls}
                placeholder="e.g. 480"
                value={local.totalUnits ?? ""}
                onChange={(e) => change("totalUnits", e.target.value)}
              />
            </FieldGroup>
            <FieldGroup label="Available Units">
              <input
                type="number"
                className={inputCls}
                placeholder="e.g. 120"
                value={local.availableUnits ?? ""}
                onChange={(e) => change("availableUnits", e.target.value)}
              />
            </FieldGroup>
            <FieldGroup label="Possession Date">
              <input
                className={inputCls}
                placeholder="e.g. Dec 2026"
                value={local.possessionDate ?? ""}
                onChange={(e) => change("possessionDate", e.target.value)}
              />
            </FieldGroup>
          </div>
        </div>

        {/* ── Legal & Compliance ── */}
        <div>
          <SectionLabel icon="📋" label="Legal &amp; Compliance" />
          <div className="mt-3 space-y-3">
            <FieldGroup label="RERA Number" hint="Leave blank to hide badge">
              <input
                className={`${inputCls} font-mono`}
                placeholder="e.g. P52100XXXXXX"
                value={local.reraNumber ?? ""}
                onChange={(e) => change("reraNumber", e.target.value)}
              />
            </FieldGroup>

            {/* Banks Approved */}
            <FieldGroup label="Banks Approved">
              <div className="flex gap-2">
                <input
                  className={`${inputCls} flex-1`}
                  placeholder="e.g. HDFC, SBI…"
                  value={newBank}
                  onChange={(e) => setNewBank(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addBank();
                  }}
                />
                <button
                  type="button"
                  onClick={addBank}
                  disabled={!newBank.trim()}
                  className="px-3 py-2 bg-[#27AE60] text-white text-xs font-bold rounded-xl hover:bg-[#219150] transition disabled:opacity-40"
                >
                  Add
                </button>
              </div>
              {local.banksApproved?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {local.banksApproved.map((bank) => (
                    <span
                      key={bank}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border"
                      style={{
                        backgroundColor: "#27AE6012",
                        borderColor: "#27AE6030",
                        color: "#1a7a42",
                      }}
                    >
                      {bank}
                      <button
                        type="button"
                        onClick={() => removeBank(bank)}
                        className="ml-0.5 text-gray-400 hover:text-red-500 transition leading-none"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </FieldGroup>
          </div>
        </div>

        {/* ── Documents & Links ── */}
        <div>
          <SectionLabel icon="🔗" label="Documents &amp; Links" />
          <div className="mt-3 space-y-3">
            <FieldGroup label="Project Website URL">
              <input
                className={inputCls}
                placeholder="https://projectname.com"
                value={local.redirectUrl ?? ""}
                onChange={(e) => change("redirectUrl", e.target.value)}
              />
            </FieldGroup>

            {/* Brochure upload */}
            <FieldGroup label="Brochure (PDF / Image)">
              <label className="block cursor-pointer">
                <div
                  className={[
                    "flex flex-col items-center justify-center h-20 rounded-xl border-2 border-dashed transition group",
                    local.brochureUrl || brochureFile
                      ? "border-[#27AE60]/30 bg-[#27AE60]/5"
                      : "border-gray-200 hover:border-[#27AE60] bg-gray-50/50",
                  ].join(" ")}
                >
                  {local.brochureUrl || brochureFile ? (
                    <div className="flex flex-col items-center gap-1">
                      <svg
                        className="w-5 h-5 text-[#27AE60]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="text-[11px] font-bold text-[#27AE60]">
                        {brochureFile ? brochureFile.name : "Brochure uploaded"}
                      </span>
                      <span className="text-[9px] text-gray-400">
                        Click to replace
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <svg
                        className="w-5 h-5 text-gray-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                        />
                      </svg>
                      <span className="text-[11px] font-semibold text-gray-400">
                        Upload Brochure
                      </span>
                      <span className="text-[9px] text-gray-300">
                        PDF, PNG, JPG
                      </span>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept=".pdf,image/*"
                  className="hidden"
                  onChange={handleBrochure}
                />
              </label>
            </FieldGroup>
          </div>
        </div>

        {/* ── YouTube Videos ── */}
        <div>
          <SectionLabel icon="🎥" label="YouTube Videos" />
          <div className="mt-3 space-y-3">
            {local.youtubeVideos?.length > 0 && (
              <div className="space-y-2">
                {local.youtubeVideos.map((v, i) => {
                  const vid = getYoutubeId(v.url);
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50/50"
                    >
                      {/* Thumbnail */}
                      <div className="w-14 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 relative">
                        {vid ? (
                          <img
                            src={`https://img.youtube.com/vi/${vid}/mqdefault.jpg`}
                            alt={v.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-red-50 flex items-center justify-center">
                            <svg
                              className="w-4 h-4 text-red-300"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-800 truncate">
                          {v.title || "Untitled"}
                        </p>
                        <p className="text-[10px] text-gray-400 truncate">
                          {v.url}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeVideo(i)}
                        className="w-6 h-6 flex-shrink-0 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition"
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2.5"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add new video */}
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 bg-white border-b border-gray-100">
                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  Add Video
                </h4>
              </div>
              <div className="p-3.5 space-y-2.5 bg-gray-50/40">
                <input
                  className={inputCls}
                  placeholder="Video Title (optional)"
                  value={newVideo.title}
                  onChange={(e) =>
                    setNewVideo({ ...newVideo, title: e.target.value })
                  }
                />
                <input
                  className={`${inputCls} font-mono`}
                  placeholder="YouTube URL *"
                  value={newVideo.url}
                  onChange={(e) =>
                    setNewVideo({ ...newVideo, url: e.target.value })
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addVideo();
                  }}
                />
                {newVideo.url && (
                  <p
                    className={`text-[10px] font-semibold flex items-center gap-1 ${isValidYoutube ? "text-green-500" : "text-red-400"}`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full inline-block ${isValidYoutube ? "bg-green-500" : "bg-red-400"}`}
                    />
                    {isValidYoutube
                      ? "Valid YouTube URL"
                      : "Invalid YouTube URL"}
                  </p>
                )}
                <input
                  type="number"
                  className={inputCls}
                  placeholder="Display order (e.g. 1)"
                  value={newVideo.order}
                  onChange={(e) =>
                    setNewVideo({ ...newVideo, order: e.target.value })
                  }
                />
                <button
                  type="button"
                  onClick={addVideo}
                  disabled={!isValidYoutube}
                  className="w-full py-2.5 border-2 border-dashed border-red-200 text-red-500 rounded-xl text-xs font-bold hover:border-red-400 hover:bg-red-50/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Add Video
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Save footer ── */}
      <div className="px-5 pb-5 pt-3 border-t border-gray-100 flex-shrink-0">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 bg-[#27AE60] hover:bg-[#219150] text-white text-sm font-bold rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 shadow-md shadow-[#27AE60]/20 flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <svg
                className="w-4 h-4 animate-spin"
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
              Saving…
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Save Property Details
            </>
          )}
        </button>
      </div>
    </div>
  );
}

/* ── Helpers ── */
const inputCls =
  "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#27AE60]/30 focus:border-[#27AE60] transition bg-gray-50/50";

function FieldGroup({ label, hint, children }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
          {label}
        </label>
        {hint && (
          <span className="text-[10px] text-[#27AE60] font-medium">{hint}</span>
        )}
      </div>
      {children}
    </div>
  );
}

function SectionLabel({ icon, label }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm">{icon}</span>
      <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
        {label}
      </span>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  );
}
