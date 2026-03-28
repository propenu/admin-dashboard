
// frontend/admin-dashboard/src/pages/post-property/FeaturedPoperty/FeaturedPreviewPageComponents/YoutubeEditor.jsx
import React, { useState } from "react";
import { toast } from "react-hot-toast";

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

function YoutubeThumbnail({ url }) {
  const vid = getYoutubeId(url);
  if (!vid)
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300 text-xs">
        Invalid URL
      </div>
    );
  return (
    <img
      src={`https://img.youtube.com/vi/${vid}/mqdefault.jpg`}
      alt="thumb"
      className="w-full h-full object-cover"
      onError={(e) => {
        e.target.style.display = "none";
      }}
    />
  );
}

export default function YoutubeEditor({
  formData,
  setFormData,
  setLivePreviewData,
  saving,
  onSave,
}) {
   
    const videos = formData?.youtubeVideos ?? [];

  const [newVideo, setNewVideo] = useState({ title: "", url: "", order: "" });
  const [editingIndex, setEditingIndex] = useState(null);
function sync(updated) {
  setFormData((prev) => {
    const next = { ...prev, youtubeVideos: updated };
    setLivePreviewData(next);
    return next;
  });
}

  function updateVideo(index, field, value) {
    const updated = videos.map((v, i) =>
      i === index ? { ...v, [field]: value } : v
    );
    sync(updated);
  }

  function deleteVideo(index) {
    const updated = videos
      .filter((_, i) => i !== index)
      .map((v, i) => ({ ...v, order: i + 1 }));
    sync(updated);
    if (editingIndex === index) setEditingIndex(null);
  }

  function addVideo() {
    if (!newVideo.url.trim()) {
      toast.error("Please enter a YouTube URL");
      return;
    }
    if (!getYoutubeId(newVideo.url)) {
      toast.error("Invalid YouTube URL");
      return;
    }
    const entry = {
      title: newVideo.title.trim() || `Video ${videos.length + 1}`,
      url: newVideo.url.trim(),
      order: newVideo.order ? Number(newVideo.order) : videos.length + 1,
    };
    sync([...videos, entry]);
    setNewVideo({ title: "", url: "", order: "" });
    toast.success("Video added!");
  }

 async function saveVideos() {
   const latest = [...(formData?.youtubeVideos || [])];
   console.log("Saving latest:", latest);
   await onSave({ youtubeVideos: latest });
 }

 

  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col"
      style={{ maxHeight: "82vh" }}
    >
      {/* ── Header ── */}
      <div className="bg-gradient-to-r from-red-500/8 to-transparent px-5 py-4 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-800">YouTube Videos Editor</h3>
              <p className="text-[10px] text-gray-400">
                {videos.length} video{videos.length !== 1 ? "s" : ""} · Live preview synced
              </p>
            </div>
          </div>
          {videos.length > 0 && (
            <span className="text-xs font-black px-2.5 py-1 rounded-full flex-shrink-0 bg-red-50 text-red-500">
              {videos.length} added
            </span>
          )}
        </div>
      </div>

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4 min-h-0">

        {/* Empty state */}
        {videos.length === 0 && (
          <div className="rounded-xl border-2 border-dashed border-gray-100 py-12 text-center">
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </div>
            <p className="text-sm text-gray-400 font-semibold">No videos added yet</p>
            <p className="text-xs text-gray-300 mt-1">Add YouTube URLs below to get started</p>
          </div>
        )}

        {/* ── Video cards ── */}
        {videos.map((video, index) => {
          const vid = getYoutubeId(video.url);
          const isEditing = editingIndex === index;

          return (
            <div key={index} className="rounded-xl border border-gray-100 overflow-hidden">
              {/* Card header */}
              <div
                className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 transition bg-white"
                onClick={() => setEditingIndex(isEditing ? null : index)}
              >
                {/* Thumbnail */}
                <div className="w-16 h-11 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 relative">
                  {vid ? (
                    <>
                      <YoutubeThumbnail url={video.url} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-5 h-5 bg-red-500/80 rounded-full flex items-center justify-center">
                          <svg className="w-2.5 h-2.5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M5 3v18l15-9L5 3z" />
                          </svg>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full bg-red-50 flex items-center justify-center">
                      <svg className="w-5 h-5 text-red-300" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-800 truncate">
                    {video.title || "Untitled Video"}
                  </p>
                  <p className="text-[10px] text-gray-400 truncate">{video.url || "No URL"}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-400">
                    #{video.order || index + 1}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteVideo(index); }}
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 transition-all flex-shrink-0"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform ${isEditing ? "rotate-180" : ""}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Expanded edit form */}
              {isEditing && (
                <div className="p-4 border-t border-gray-100 space-y-3 bg-gray-50/40">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">
                      Video Title
                    </label>
                    <input
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400/30 focus:border-red-400 transition bg-white"
                      placeholder="e.g. Project Overview"
                      value={video.title}
                      onChange={(e) => updateVideo(index, "title", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">
                      YouTube URL
                    </label>
                    <input
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400/30 focus:border-red-400 transition bg-white font-mono"
                      placeholder="https://youtube.com/watch?v=..."
                      value={video.url}
                      onChange={(e) => updateVideo(index, "url", e.target.value)}
                    />
                    {getYoutubeId(video.url) && (
                      <p className="text-[10px] text-green-500 font-semibold mt-1 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                        Valid YouTube URL detected
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">
                      Display Order
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400/30 focus:border-red-400 transition bg-white"
                      placeholder="e.g. 1"
                      value={video.order ?? ""}
                      onChange={(e) => updateVideo(index, "order", Number(e.target.value))}
                    />
                  </div>

                  {/* Inline preview */}
                  {getYoutubeId(video.url) && (
                    <div className="rounded-xl overflow-hidden border border-gray-100 aspect-video">
                      <iframe
                        src={`https://www.youtube.com/embed/${getYoutubeId(video.url)}`}
                        className="w-full h-full"
                        title={video.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* ── Add new video ── */}
        <div className="border border-gray-100 rounded-xl overflow-hidden">
          <div className="px-4 py-2.5 bg-white border-b border-gray-100">
            <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
              </svg>
              Add New Video
            </h4>
          </div>
          <div className="p-3.5 space-y-2.5 bg-gray-50/40">
            <input
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400/30 focus:border-red-400 transition bg-white"
              placeholder="Video Title (e.g. Project Walkthrough)"
              value={newVideo.title}
              onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
            />
            <input
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400/30 focus:border-red-400 transition bg-white font-mono"
              placeholder="https://youtube.com/watch?v=... *"
              value={newVideo.url}
              onChange={(e) => setNewVideo({ ...newVideo, url: e.target.value })}
              onKeyDown={(e) => { if (e.key === "Enter") addVideo(); }}
            />
            {newVideo.url && getYoutubeId(newVideo.url) && (
              <p className="text-[10px] text-green-500 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                Valid YouTube URL
              </p>
            )}
            {newVideo.url && !getYoutubeId(newVideo.url) && (
              <p className="text-[10px] text-red-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
                Invalid YouTube URL
              </p>
            )}
            <input
              type="number"
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400/30 focus:border-red-400 transition bg-white"
              placeholder="Display Order (e.g. 1)"
              value={newVideo.order}
              onChange={(e) => setNewVideo({ ...newVideo, order: e.target.value })}
            />
            <button
              onClick={addVideo}
              className="w-full py-2.5 border-2 border-dashed border-red-200 text-red-500 rounded-xl text-sm font-bold hover:border-red-400 hover:bg-red-50/50 transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
              </svg>
              Add Video
            </button>
          </div>
        </div>
      </div>

      {/* ── Save footer ── */}
      <div className="px-5 pb-5 pt-3 border-t border-gray-100 flex-shrink-0">
        <button
          onClick={saveVideos}
          disabled={saving}
          className="w-full py-3 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 shadow-md shadow-red-500/20 flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Saving…
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
              Save Videos
            </>
          )}
        </button>
      </div>
    </div>
  );
}