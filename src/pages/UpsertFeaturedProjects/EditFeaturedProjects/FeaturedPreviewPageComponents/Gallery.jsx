// frontend/admin-dashboard/src/pages/post-property/FeaturedPreviewPageComponents/Gallery.jsx
import React, { useEffect, useRef, useState, useMemo } from "react";

const FALLBACK_IMG = "https://upload.wikimedia.org/wikipedia/commons/7/75/No_image_available.png";
const PRIMARY = "#27AE60";

function normalizeGallery(incoming, explicitColor) {
  if (Array.isArray(incoming)) {
    return { items: incoming.slice(), color: explicitColor ?? PRIMARY };
  }
  const obj = incoming || {};
  return {
    items: Array.isArray(obj.gallerySummary) ? obj.gallerySummary.slice() : [],
    color: explicitColor ?? obj.color ?? PRIMARY,
  };
}

export default function Gallery(props) {
  const { gallerySummary: raw, primaryColor } = props;

  const { items: rawItems, color } = useMemo(
    () => normalizeGallery(raw, primaryColor),
    [raw, primaryColor]
  );

  const items = rawItems.slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const [openIndex, setOpenIndex] = useState(null);
  const startX = useRef(null);

  /* Keyboard navigation */
  useEffect(() => {
    function onKey(e) {
      if (openIndex === null) return;
      if (e.key === "Escape")     setOpenIndex(null);
      if (e.key === "ArrowLeft")  setOpenIndex((i) => (i - 1 + items.length) % items.length);
      if (e.key === "ArrowRight") setOpenIndex((i) => (i + 1) % items.length);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openIndex, items.length]);

  const prev = () => setOpenIndex((i) => (i - 1 + items.length) % items.length);
  const next = () => setOpenIndex((i) => (i + 1) % items.length);

  function onTouchStart(e) { startX.current = e.touches[0]?.clientX ?? null; }
  function onTouchEnd(e) {
    if (startX.current === null || openIndex === null) return;
    const delta = (e.changedTouches[0]?.clientX ?? 0) - startX.current;
    if (Math.abs(delta) > 50) { delta > 0 ? prev() : next(); }
    startX.current = null;
  }

  /* Category badge */
  const renderCategoryPill = (it) => {
    if (!it?.category) return null;
    return (
      <div className="absolute left-3 bottom-3 flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full bg-black/50 text-white backdrop-blur-sm">
        {it.isVideo && (
          <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="white">
            <path d="M5 3v18l15-9L5 3z" />
          </svg>
        )}
        {it.category}
      </div>
    );
  };

  /* Empty state */
  if (!items.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-300">
        <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-sm font-medium">No gallery images yet</p>
        <p className="text-xs mt-1">Upload images from the editor</p>
      </div>
    );
  }

  /* ── MAIN GALLERY GRID ── */
  return (
    <section className="p-5">
      {/* Count badge */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
          {items.length} {items.length === 1 ? "Photo" : "Photos"}
        </span>
        <span
          className="text-xs font-bold px-3 py-1 rounded-full"
          style={{ backgroundColor: `${color}15`, color }}
        >
          Click to view
        </span>
      </div>

      {/* Grid layout: 1 large + 4 small */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">

        {/* Large featured image */}
        <div className="md:col-span-7">
          <div
            className="relative rounded-2xl  overflow-hidden cursor-pointer group shadow-sm border border-gray-100"
            onClick={() => setOpenIndex(0)}
            style={{ height: "360px" }}
          >
            <img
              src={items[0]?.url ?? FALLBACK_IMG}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              alt={items[0]?.title || "Gallery Main"}
            />
            {renderCategoryPill(items[0])}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

            {/* Play button for video */}
            {items[0]?.isVideo && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                  <svg className="w-6 h-6 text-white ml-1" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M5 3v18l15-9L5 3z" />
                  </svg>
                </div>
              </div>
            )}

            {/* Hover overlay */}
            <div className="absolute  inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${color}cc` }}
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* 4 small images on right */}
        <div className="md:col-span-5 grid grid-cols-2 gap-3">
          {items.slice(1, 20).map((it, i) => (
            <div
              key={i}
              className="relative rounded-xl overflow-hidden cursor-pointer group shadow-sm border border-gray-100"
              style={{ height: "172px" }}
              onClick={() => setOpenIndex(i + 1)}
            >
              <img
                src={it?.url ?? FALLBACK_IMG}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                alt={it?.title || `Gallery ${i + 2}`}
              />
              {renderCategoryPill(it)}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

              {/* "View all" overlay on last visible if more exist */}
              {i === 3 && items.length > 5 && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
                  <span className="text-white text-xl font-black">+{items.length - 5}</span>
                  <span className="text-white/80 text-xs mt-0.5">more</span>
                </div>
              )}

              {/* Video indicator */}
              {it?.isVideo && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-white ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M5 3v18l15-9L5 3z" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── LIGHTBOX MODAL ── */}
      {openIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setOpenIndex(null)}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div
            className="relative max-w-5xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              className="absolute -top-15 -right-20 z-30 w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition"
              onClick={() => setOpenIndex(null)}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Counter */}
            <div className="absolute -top-12 left-0 z-30 text-white/70 text-sm font-medium">
              {openIndex + 1} / {items.length}
            </div>

            {/* Prev button */}
            <button
              className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition"
              onClick={prev}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Next button */}
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition"
              onClick={next}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Main media */}
            <div className="rounded-2xl overflow-hidden bg-black/50 border border-white/10">
              {items[openIndex]?.isVideo ? (
                <video
                  src={items[openIndex]?.url}
                  className="w-full max-h-[65vh] object-contain"
                  controls
                  autoPlay
                />
              ) : (
                <img
                  src={items[openIndex]?.url ?? FALLBACK_IMG}
                  className="w-full max-h-[65vh] object-contain"
                  alt={items[openIndex]?.title || ""}
                />
              )}
            </div>

            {/* Caption bar */}
            {(items[openIndex]?.title || items[openIndex]?.category) && (
              <div className="mt-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div>
                  {items[openIndex]?.title && (
                    <p className="text-white text-sm font-semibold">{items[openIndex].title}</p>
                  )}
                  {items[openIndex]?.category && (
                    <p className="text-white/50 text-xs mt-0.5">{items[openIndex].category}</p>
                  )}
                </div>
                {/* Dot indicators */}
                <div className="flex gap-1.5">
                  {items.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setOpenIndex(idx)}
                      className="transition-all rounded-full"
                      style={{
                        width:           openIndex === idx ? 20 : 6,
                        height:          6,
                        backgroundColor: openIndex === idx ? color : "rgba(255,255,255,0.3)",
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Thumbnail strip */}
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {items.map((it, idx) => (
                <button
                  key={idx}
                  onClick={() => setOpenIndex(idx)}
                  className="flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all"
                  style={{
                    width:       80,
                    height:      54,
                    borderColor: openIndex === idx ? color : "transparent",
                    opacity:     openIndex === idx ? 1 : 0.5,
                  }}
                >
                  <img
                    src={it?.thumbUrl ?? it?.url ?? FALLBACK_IMG}
                    className="w-full h-full object-cover"
                    alt=""
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}  

