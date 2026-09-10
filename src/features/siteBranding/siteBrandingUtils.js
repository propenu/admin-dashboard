export const BANNER_SLOTS = [
  { key: "desktop", label: "Desktop", size: "1920 × 600", ratio: "3.2:1" },
  { key: "laptop", label: "Laptop", size: "1440 × 500", ratio: "2.88:1" },
  { key: "tablet", label: "Tablet", size: "1536 × 768", ratio: "2:1" },
  { key: "mobile", label: "Mobile", size: "1080 × 900", ratio: "6:5" },
];

/** Recommended logo pixel sizes (GIF and other rasters). */
export const LOGO_ALLOWED_PIXEL_SIZES = [
  { width: 220, height: 80, label: "220 × 80" },
  { width: 300, height: 120, label: "300 × 120" },
  { width: 500, height: 165, label: "500 × 165" },
  { width: 670, height: 220, label: "670 × 220" },
];

export const LOGO_HINT =
  "PNG · SVG · GIF · WebP · MP4 · WebM · sizes 220×80 · 300×120 · 500×165 · 670×220 · under 4 MB";

export const LOGO_ACCEPT =
  "image/png,image/svg+xml,image/gif,image/webp,video/mp4,video/webm,.png,.svg,.gif,.webp,.mp4,.webm";

const LOGO_IMAGE_EXT = [".png", ".svg", ".gif", ".webp"];
const LOGO_VIDEO_EXT = [".mp4", ".webm"];
const LOGO_ALLOWED_EXT = [...LOGO_IMAGE_EXT, ...LOGO_VIDEO_EXT];
const LOGO_ALLOWED_MIME = new Set([
  "image/png",
  "image/svg+xml",
  "image/gif",
  "image/webp",
  "video/mp4",
  "video/webm",
]);
const LOGO_ASPECT_RATIO = 167 / 50;
const LOGO_ASPECT_TOLERANCE = 0.12;
const LOGO_SIZE_TOLERANCE_PX = 4;
const LOGO_MAX_BYTES = 4 * 1024 * 1024;

function logoExtension(name = "") {
  const match = String(name).toLowerCase().match(/(\.[a-z0-9]+)$/);
  return match?.[1] || "";
}

export function isLogoVideoMedia(fileOrUrl) {
  if (!fileOrUrl) return false;
  if (typeof File !== "undefined" && fileOrUrl instanceof File) {
    const mime = String(fileOrUrl.type || "").toLowerCase();
    const ext = logoExtension(fileOrUrl.name);
    return mime.startsWith("video/") || LOGO_VIDEO_EXT.includes(ext);
  }
  const value = String(fileOrUrl).toLowerCase().split("?")[0];
  return LOGO_VIDEO_EXT.some((ext) => value.endsWith(ext));
}

export function emptyDeviceForm() {
  return {
    addLocation: false,
    state: "",
    city: "",
    locality: "",
    subLocality: "",
    addHeading: false,
    headingHtml: "",
    clickUrl: "",
    file: null,
    preview: "",
    fileError: "",
  };
}

export function deviceFormFromSaved(device = {}) {
  const loc = device.location || {};
  const hasLocation = Boolean(
    loc.state || loc.city || loc.locality || loc.subLocality,
  );
  return {
    addLocation: hasLocation,
    state: loc.state || "",
    city: loc.city || "",
    locality: loc.locality || "",
    subLocality: loc.subLocality || "",
    addHeading: device.heading?.enabled === true,
    headingHtml: device.heading?.html || "",
    clickUrl: device.clickUrl || "",
    file: null,
    preview: "",
    fileError: "",
  };
}

export function locationSummary(location = {}) {
  const parts = [
    location.state,
    location.city,
    location.locality,
    location.subLocality,
  ].filter(Boolean);
  return parts.length ? parts.join(" › ") : "All locations (default)";
}

export function openClickUrl(url) {
  const href = String(url || "").trim();
  if (!href) return;
  window.open(href, "_blank", "noopener,noreferrer");
}

export function validateWebpFile(file) {
  if (!file) return "Image is required";
  const name = String(file.name || "").toLowerCase();
  if (file.type !== "image/webp" && !name.endsWith(".webp")) {
    return "Only WebP images are allowed";
  }
  if (file.size > 1024 * 1024) {
    return "Image must be below 1 MB";
  }
  return "";
}

/** Logo: PNG / SVG / GIF / WebP / MP4 / WebM under 4 MB. */
export function validateLogoFile(file) {
  if (!file) return "Logo file is required";
  const mime = String(file.type || "").toLowerCase();
  const ext = logoExtension(file.name);
  const allowed =
    LOGO_ALLOWED_MIME.has(mime) || LOGO_ALLOWED_EXT.includes(ext);
  if (!allowed) {
    return "Allowed formats: PNG, SVG, GIF, WebP, MP4, WebM";
  }
  if (file.size > LOGO_MAX_BYTES) {
    return "File must be below 4 MB";
  }
  return "";
}

function readImageDimensions(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const width = img.naturalWidth || 0;
      const height = img.naturalHeight || 0;
      URL.revokeObjectURL(url);
      resolve({ width, height });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image dimensions"));
    };
    img.src = url;
  });
}

/**
 * Raster logos (incl. GIF): allow 220×80 / 300×120 / 500×165 or ~3.34:1.
 * Videos and SVG skip pixel checks here.
 */
export async function validateLogoFileAsync(file) {
  const basic = validateLogoFile(file);
  if (basic) return basic;
  if (isLogoVideoMedia(file)) return "";
  const ext = logoExtension(file.name);
  if (ext === ".svg" || String(file.type || "").toLowerCase() === "image/svg+xml") {
    return "";
  }
  try {
    const { width, height } = await readImageDimensions(file);
    if (!width || !height) return "Could not read logo dimensions";
    const matchesSize = LOGO_ALLOWED_PIXEL_SIZES.some(
      (size) =>
        Math.abs(width - size.width) <= LOGO_SIZE_TOLERANCE_PX &&
        Math.abs(height - size.height) <= LOGO_SIZE_TOLERANCE_PX,
    );
    if (matchesSize) return "";
    const ratio = width / height;
    if (Math.abs(ratio - LOGO_ASPECT_RATIO) <= LOGO_ASPECT_TOLERANCE) return "";
    const sizeList = LOGO_ALLOWED_PIXEL_SIZES.map((s) => s.label).join(", ");
    return `Use GIF sizes ${sizeList} (or ~3.34:1). Got ${width}×${height}`;
  } catch {
    return "Could not read logo dimensions";
  }
}

/** @deprecated use validateLogoFile */
export function validateGifFile(file) {
  return validateLogoFile(file);
}

export function isDeviceSaved(device) {
  return Boolean(device?.image);
}
