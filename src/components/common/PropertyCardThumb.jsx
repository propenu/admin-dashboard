import { useEffect, useState } from "react";
import { ImageOff } from "lucide-react";

/** First usable cover URL from gallery / images (or empty). */
export function getPropertyCoverUrl(property) {
  const first =
    (Array.isArray(property?.gallery) && property.gallery[0]) ||
    (Array.isArray(property?.images) && property.images[0]) ||
    null;
  if (!first) return "";
  if (typeof first === "string") return first.trim();
  return String(
    first.url ||
      first.preview ||
      first.secureUrl ||
      first.location ||
      first.path ||
      "",
  ).trim();
}

/**
 * Listing thumb — fixed width, stretches to full card height.
 * Image always fills the frame with object-fit:cover (no empty gaps).
 */
const VARIANT_BOX = {
  list: "relative h-[120px] w-[128px] shrink-0 overflow-hidden bg-slate-100",
  dashboard:
    "relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-slate-100 sm:aspect-auto sm:h-auto sm:min-h-[168px] sm:w-[172px] sm:self-stretch",
};

const IMG_FILL = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover",
  objectPosition: "center center",
  display: "block",
};

export default function PropertyCardThumb({
  property,
  alt = "",
  variant = "list",
  className = "",
  children,
}) {
  const url = getPropertyCoverUrl(property);
  const [failed, setFailed] = useState(false);
  const propertyKey = property?._id || property?.id || url;

  useEffect(() => {
    setFailed(false);
  }, [propertyKey]);

  const showImage = Boolean(url) && !failed;
  const boxClass = `${VARIANT_BOX[variant] || VARIANT_BOX.list} ${className}`.trim();

  return (
    <div className={boxClass}>
      {showImage ? (
        <img
          key={propertyKey}
          src={url}
          alt={alt || property?.title || "Property"}
          loading="lazy"
          decoding="async"
          style={IMG_FILL}
          className="z-[1]"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="absolute inset-0 z-[1] flex flex-col items-center justify-center gap-1 bg-slate-100 px-1.5 text-center">
          <ImageOff className="h-5 w-5 text-slate-400" strokeWidth={1.75} />
          <span className="text-[8px] font-bold uppercase tracking-wide text-slate-500">
            No images
          </span>
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 z-[2] [&_a]:pointer-events-auto [&_button]:pointer-events-auto">
        {children}
      </div>
    </div>
  );
}
