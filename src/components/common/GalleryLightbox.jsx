import { useEffect, useMemo, useState } from "react";
import { Check, Download, Image as ImageIcon, X } from "lucide-react";
import { saveAs } from "file-saver";
import { toast } from "sonner";
import Fallback from "../../assets/fallback.svg";

const filenameFromUrl = (url, fallback = "image.jpg") => {
  if (!url) return fallback;
  try {
    const path = decodeURIComponent(new URL(url).pathname);
    const base = path.split("/").filter(Boolean).pop();
    return base || fallback;
  } catch {
    return fallback;
  }
};

async function downloadOne(url, filename) {
  try {
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) throw new Error("fetch failed");
    const blob = await res.blob();
    saveAs(blob, filename);
    return true;
  } catch {
    // CORS / network fallback — open in a new tab so the user can save.
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    a.remove();
    return false;
  }
}

/**
 * Full-screen gallery: preview, multi-select, download selected / all.
 * @param {{ url: string, filename?: string, title?: string }[]} images
 */
export default function GalleryLightbox({
  open,
  images = [],
  initialIndex = 0,
  onClose,
  title = "Gallery",
}) {
  const list = useMemo(
    () =>
      (Array.isArray(images) ? images : [])
        .map((item, index) => {
          const url =
            typeof item === "string"
              ? item
              : item?.url || item?.src || item?.path || "";
          if (!url) return null;
          return {
            url,
            filename:
              item?.filename ||
              item?.title ||
              filenameFromUrl(url, `image-${index + 1}.jpg`),
            title: item?.title || item?.filename || `Image ${index + 1}`,
          };
        })
        .filter(Boolean),
    [images],
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [selected, setSelected] = useState(() => new Set());
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!open) return;
    const idx = Math.min(Math.max(initialIndex, 0), Math.max(list.length - 1, 0));
    setActiveIndex(idx);
    setSelected(new Set());
  }, [open, initialIndex, list.length]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
      if (e.key === "ArrowRight") {
        setActiveIndex((i) => (list.length ? (i + 1) % list.length : 0));
      }
      if (e.key === "ArrowLeft") {
        setActiveIndex((i) =>
          list.length ? (i - 1 + list.length) % list.length : 0,
        );
      }
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, list.length, onClose]);

  if (!open || list.length === 0) return null;

  const active = list[activeIndex] || list[0];
  const allSelected = selected.size === list.length && list.length > 0;

  const toggle = (index) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(list.map((_, i) => i)));
  };

  const runDownload = async (indexes) => {
    const targets = indexes
      .map((i) => list[i])
      .filter(Boolean);
    if (!targets.length) {
      toast.error("Select at least one image");
      return;
    }
    setDownloading(true);
    let ok = 0;
    for (const item of targets) {
      const success = await downloadOne(item.url, item.filename);
      if (success) ok += 1;
    }
    setDownloading(false);
    if (ok === targets.length) {
      toast.success(
        targets.length === 1
          ? "Image downloaded"
          : `${targets.length} images downloaded`,
      );
    } else if (ok > 0) {
      toast.success(`${ok} downloaded; others opened in a new tab`);
    } else {
      toast.message("Opened images in a new tab — use Save As if download is blocked");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-black/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div
        className="flex flex-col h-full max-h-full w-full max-w-6xl mx-auto p-3 sm:p-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 rounded-t-2xl bg-white px-4 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2 min-w-0">
            <ImageIcon className="w-4 h-4 text-[#27AE60] shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate">{title}</p>
              <p className="text-[11px] text-slate-400">
                {activeIndex + 1} / {list.length}
                {selected.size > 0 ? ` · ${selected.size} selected` : ""}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <button
              type="button"
              onClick={toggleAll}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              {allSelected ? "Clear all" : "Select all"}
            </button>
            <button
              type="button"
              disabled={downloading || selected.size === 0}
              onClick={() => runDownload([...selected].sort((a, b) => a - b))}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#27AE60] text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-3.5 h-3.5" />
              Download selected
            </button>
            <button
              type="button"
              disabled={downloading}
              onClick={() => runDownload([activeIndex])}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-[#27AE60] text-[#27AE60] hover:bg-green-50 disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              This image
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
              aria-label="Close gallery"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="flex-1 min-h-0 bg-slate-900 flex items-center justify-center relative">
          <img
            src={active.url}
            alt={active.title}
            className="max-h-full max-w-full object-contain"
            onError={(e) => {
              e.target.src = Fallback;
            }}
          />
          <button
            type="button"
            onClick={() => toggle(activeIndex)}
            className={`absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow ${
              selected.has(activeIndex)
                ? "bg-[#27AE60] text-white"
                : "bg-white/90 text-slate-700"
            }`}
          >
            {selected.has(activeIndex) ? (
              <>
                <Check className="w-3.5 h-3.5" /> Selected
              </>
            ) : (
              "Select"
            )}
          </button>
        </div>

        {/* Thumbnails */}
        <div className="rounded-b-2xl bg-white border-t border-slate-100 px-3 py-3 overflow-x-auto">
          <div className="flex gap-2 min-w-min">
            {list.map((img, i) => {
              const isActive = i === activeIndex;
              const isSel = selected.has(i);
              return (
                <button
                  key={`${img.url}-${i}`}
                  type="button"
                  onClick={() => setActiveIndex(i)}
                  onDoubleClick={() => toggle(i)}
                  className={`relative flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition ${
                    isActive
                      ? "border-[#27AE60] scale-105"
                      : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                  title="Click to preview · double-click to select"
                >
                  <img
                    src={img.url}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = Fallback;
                    }}
                  />
                  <span
                    role="checkbox"
                    aria-checked={isSel}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggle(i);
                    }}
                    className={`absolute top-1 right-1 w-4 h-4 rounded border flex items-center justify-center ${
                      isSel
                        ? "bg-[#27AE60] border-[#27AE60] text-white"
                        : "bg-white/90 border-slate-300"
                    }`}
                  >
                    {isSel && <Check className="w-3 h-3" />}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-[10px] text-slate-400">
            Tick images to select, then Download selected. Double-click a thumb to toggle.
          </p>
        </div>
      </div>
    </div>
  );
}
