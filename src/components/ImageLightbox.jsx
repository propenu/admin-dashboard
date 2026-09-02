import { useEffect, useRef } from "react";

/**
 * Full-screen image/video lightbox for gallery upload previews.
 * images: [{ url, title?, isVideo? }]
 */
export default function ImageLightbox({
  images = [],
  openIndex = null,
  onClose,
  onChangeIndex,
}) {
  const startX = useRef(null);
  const items = Array.isArray(images) ? images.filter((i) => i?.url) : [];
  const active = openIndex === null ? null : items[openIndex] || null;

  useEffect(() => {
    if (openIndex === null) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
      if (e.key === "ArrowLeft" && items.length) {
        onChangeIndex?.((openIndex - 1 + items.length) % items.length);
      }
      if (e.key === "ArrowRight" && items.length) {
        onChangeIndex?.((openIndex + 1) % items.length);
      }
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [openIndex, items.length, onClose, onChangeIndex]);

  if (openIndex === null || !active) return null;

  const prev = (e) => {
    e?.stopPropagation?.();
    if (!items.length) return;
    onChangeIndex?.((openIndex - 1 + items.length) % items.length);
  };
  const next = (e) => {
    e?.stopPropagation?.();
    if (!items.length) return;
    onChangeIndex?.((openIndex + 1) % items.length);
  };

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={() => onClose?.()}
      onTouchStart={(e) => {
        startX.current = e.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(e) => {
        if (startX.current === null) return;
        const delta = (e.changedTouches[0]?.clientX ?? 0) - startX.current;
        if (Math.abs(delta) > 50) {
          if (delta > 0) prev();
          else next();
        }
        startX.current = null;
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative max-w-5xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="absolute -top-12 right-0 z-30 w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white"
          onClick={() => onClose?.()}
          aria-label="Close"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="absolute -top-12 left-0 z-30 text-white/70 text-sm font-medium">
          {openIndex + 1} / {items.length}
        </div>

        {items.length > 1 ? (
          <>
            <button
              type="button"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white"
              onClick={prev}
              aria-label="Previous"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white"
              onClick={next}
              aria-label="Next"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        ) : null}

        <div className="rounded-2xl overflow-hidden bg-black/50 border border-white/10">
          {active.isVideo ? (
            <video
              src={active.url}
              className="w-full max-h-[75vh] object-contain mx-auto"
              controls
              autoPlay
            />
          ) : (
            <img
              src={active.url}
              className="w-full max-h-[75vh] object-contain mx-auto"
              alt={active.title || "Full image"}
            />
          )}
        </div>

        {active.title ? (
          <p className="mt-3 text-center text-white text-sm font-semibold truncate">
            {active.title}
          </p>
        ) : null}
      </div>
    </div>
  );
}
