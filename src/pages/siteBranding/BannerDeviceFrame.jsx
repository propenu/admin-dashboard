import navDesktop from "../../assets/siteBranding/nav-desktop.png";
import navMobile from "../../assets/siteBranding/nav-mobile.png";
import { BannerTextOverlay } from "./BannerRichTextField";
import { openClickUrl } from "../../features/siteBranding/siteBrandingUtils";
import { ExternalLink } from "lucide-react";

/** Desktop / Laptop / Tablet use site desktop nav; Mobile uses mobile nav. */
export function navImageForSlot(slot) {
  return slot === "mobile" ? navMobile : navDesktop;
}

/**
 * Website-style preview: navbar on top, banner image below.
 */
export default function BannerDeviceFrame({
  slot = "desktop",
  imageSrc,
  heading,
  emptyHint = "Upload image to preview",
  className = "",
}) {
  const navSrc = navImageForSlot(slot);
  const isMobile = slot === "mobile";

  if (!imageSrc) {
    return (
      <div
        className={`overflow-hidden rounded-2xl border border-slate-200 bg-white ${className}`}
      >
        <img
          src={navSrc}
          alt={isMobile ? "Mobile navbar" : "Desktop navbar"}
          className="block w-full select-none"
          draggable={false}
        />
        <div className="flex h-40 items-center justify-center bg-slate-50 text-xs text-slate-400">
          {emptyHint}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}
    >
      <img
        src={navSrc}
        alt={isMobile ? "Mobile navbar" : "Desktop navbar"}
        className="block w-full select-none border-b border-slate-100"
        draggable={false}
      />
      <button
        type="button"
        className="relative block w-full"
        onClick={() => openClickUrl(imageSrc)}
        title="Open banner image in new tab"
      >
        <img
          src={imageSrc}
          alt={`${slot} banner`}
          className={`block w-full object-cover ${
            isMobile ? "max-h-[480px] object-contain bg-slate-50" : "max-h-72"
          }`}
        />
        <BannerTextOverlay heading={heading} />
        <span className="absolute bottom-3 right-3 z-10 inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-[10px] font-semibold text-white">
          <ExternalLink size={11} /> Open image
        </span>
      </button>
    </div>
  );
}
