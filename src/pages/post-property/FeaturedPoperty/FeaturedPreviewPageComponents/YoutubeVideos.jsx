// frontend/admin-dashboard/src/pages/post-property/FeaturedPoperty/FeaturedPreviewPageComponents/YoutubeSection.jsx
import React, { useState } from "react";

const PRIMARY = "#27AE60";

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

export default function YoutubeSection({ youtubeVideos = [], primaryColor }) {
  const color = primaryColor || PRIMARY;

  // Sort by order
  const sorted = [...youtubeVideos].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const [activeIndex, setActiveIndex] = useState(0);

  if (!sorted.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: "#fee2e2" }}
        >
          <svg className="w-7 h-7 text-red-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-gray-400">No videos added yet</p>
        <p className="text-xs text-gray-300 mt-1">Use the editor to add YouTube videos</p>
      </div>
    );
  }

  const active = sorted[activeIndex];
  const activeVid = getYoutubeId(active?.url);

  return (
    <section className="p-5 lg:p-6 space-y-5">
      {/* Active player */}
      {activeVid && (
        <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm aspect-video">
          <iframe
            key={activeVid}
            src={`https://www.youtube.com/embed/${activeVid}?autoplay=0&rel=0`}
            className="w-full h-full"
            title={active.title || "Project Video"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      {/* Title row */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-gray-800">
            {active?.title || "Project Video"}
          </h3>
          <p className="text-[10px] text-gray-400 mt-0.5">
            {activeIndex + 1} of {sorted.length} video{sorted.length !== 1 ? "s" : ""}
          </p>
        </div>
        <a
          href={active?.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition"
          style={{ backgroundColor: "#fee2e2", color: "#ef4444" }}
        >
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
          YouTube
        </a>
      </div>

      {/* Playlist thumbnails (only when more than 1 video) */}
      {sorted.length > 0 && (
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">
            More Videos
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {sorted.map((v, i) => {
              const vid = getYoutubeId(v.url);
              const isActive = i === activeIndex;
              return (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className="group relative rounded-xl overflow-hidden border-2 transition-all"
                  style={{
                    borderColor: isActive ? color : "transparent",
                    boxShadow: isActive ? `0 0 0 2px ${color}30` : "none",
                  }}
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-gray-100">
                    {vid ? (
                      <img
                        src={`https://img.youtube.com/vi/${vid}/mqdefault.jpg`}
                        alt={v.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200" />
                    )}

                    {/* Overlay */}
                    <div
                      className={`absolute inset-0 transition-opacity ${isActive ? "opacity-20" : "opacity-0 group-hover:opacity-30"}`}
                      style={{ backgroundColor: color }}
                    />

                    {/* Play icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isActive ? "opacity-100 scale-100" : "opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"}`}
                        style={{ backgroundColor: isActive ? color : "rgba(0,0,0,0.6)" }}
                      >
                        <svg
                          className="w-3.5 h-3.5 text-white ml-0.5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M5 3v18l15-9L5 3z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Label */}
                  <div
                    className="px-2.5 py-2 text-left"
                    style={{ backgroundColor: isActive ? `${color}08` : "white" }}
                  >
                    <p
                      className="text-xs font-bold truncate"
                      style={{ color: isActive ? color : "#374151" }}
                    >
                      {v.title || `Video ${i + 1}`}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}