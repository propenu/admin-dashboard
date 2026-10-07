/**
 * Keep in sync with backend siteBranding.constants.ts
 * (BANNER_SLOTS + BANNER_LEGACY_SLOT_SIZES).
 * `width`/`height` is the required size. `legacySizes` are older creatives
 * the API still accepts.
 */
export const BANNER_SIZE_TOLERANCE_PX = 4;
export const BANNER_MAX_BYTES = 1 * 1024 * 1024;

export const BANNER_SLOTS = [
  {
    key: "desktop",
    label: "Desktop",
    width: 1920,
    height: 330,
    size: "1920 × 330",
    legacySizes: [
      { width: 1920, height: 360 },
      { width: 1920, height: 300 },
      { width: 1920, height: 420 },
      { width: 1920, height: 600 },
    ],
  },
  {
    key: "laptop",
    label: "Laptop",
    width: 1440,
    height: 275,
    size: "1440 × 275",
    legacySizes: [
      { width: 1440, height: 300 },
      { width: 1440, height: 250 },
      { width: 1440, height: 350 },
      { width: 1440, height: 500 },
    ],
  },
  {
    key: "tablet",
    label: "Tablet",
    width: 1536,
    height: 422,
    size: "1536 × 422",
    legacySizes: [
      { width: 1536, height: 461 },
      { width: 1536, height: 384 },
      { width: 1536, height: 538 },
      { width: 1536, height: 768 },
    ],
  },
  {
    key: "mobile",
    label: "Mobile",
    width: 1080,
    height: 495,
    size: "1080 × 495",
    legacySizes: [
      { width: 1080, height: 540 },
      { width: 1080, height: 450 },
      { width: 1080, height: 630 },
      { width: 1080, height: 900 },
    ],
  },
];

export function bannerSlotMeta(slot) {
  return BANNER_SLOTS.find((item) => item.key === slot) || BANNER_SLOTS[0];
}

export function allowedBannerSizes(slot) {
  const meta = bannerSlotMeta(slot);
  return [
    { width: meta.width, height: meta.height },
    ...(meta.legacySizes || []),
  ];
}

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
    addHeading: false,
    headingHtml: "",
    clickUrl: "",
    file: null,
    preview: "",
    fileError: "",
  };
}

export function deviceFormFromSaved(device = {}) {
  return {
    addHeading: device.heading?.enabled === true,
    headingHtml: device.heading?.html || "",
    clickUrl: device.clickUrl || "",
    file: null,
    preview: "",
    fileError: "",
  };
}

export function locationFromBanner(banner = {}) {
  const loc = banner.location || {};
  let coverage = {};
  if (loc.coverage && typeof loc.coverage === "object" && !Array.isArray(loc.coverage)) {
    coverage = loc.coverage;
  } else if (typeof loc.coverage === "string") {
    try {
      const parsed = JSON.parse(loc.coverage);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        coverage = parsed;
      }
    } catch {
      coverage = {};
    }
  }
  const hasCoverage = Object.keys(coverage).length > 0;
  const hasFlat = Boolean(loc.state || loc.city || loc.locality || loc.subLocality);
  const migratedCoverage = hasCoverage
    ? coverage
    : loc.state && loc.city
      ? {
          [loc.state]: {
            [loc.city]: loc.locality ? [loc.locality] : [],
          },
        }
      : {};
  return {
    addLocation: hasCoverage || hasFlat,
    coverage: migratedCoverage,
    subLocality: loc.subLocality || "",
  };
}

export function locationSummary(location = {}) {
  const coverage = location.coverage;
  if (coverage && typeof coverage === "object" && !Array.isArray(coverage)) {
    const states = Object.keys(coverage);
    if (states.length) {
      let cities = 0;
      let localities = 0;
      for (const cityMap of Object.values(coverage)) {
        if (!cityMap || typeof cityMap !== "object") continue;
        for (const locs of Object.values(cityMap)) {
          cities += 1;
          localities += Array.isArray(locs) ? locs.length : 0;
        }
      }
      const base = `${states.length} ${states.length === 1 ? "state" : "states"} · ${cities} ${cities === 1 ? "city" : "cities"} · ${localities} ${localities === 1 ? "locality" : "localities"}`;
      return location.subLocality
        ? `${base} · sub: ${location.subLocality}`
        : base;
    }
  }
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
  if (file.size > BANNER_MAX_BYTES) {
    return "Image must be below 1 MB";
  }
  return "";
}

function bannerSizeMatches(width, height, size) {
  return (
    Math.abs(width - size.width) <= BANNER_SIZE_TOLERANCE_PX &&
    Math.abs(height - size.height) <= BANNER_SIZE_TOLERANCE_PX
  );
}

/**
 * Same checks as the banner API: WebP, under 1 MB, and a pixel size
 * from the current slot (required size or an older accepted size).
 */
export async function validateBannerFileAsync(file, slot) {
  const basic = validateWebpFile(file);
  if (basic) return basic;
  const meta = bannerSlotMeta(slot);
  try {
    const { width, height } = await readImageDimensions(file);
    const ok = allowedBannerSizes(slot).some((size) =>
      bannerSizeMatches(width, height, size),
    );
    if (ok) return "";
    const accepted = allowedBannerSizes(slot)
      .map((size) => `${size.width}×${size.height}`)
      .join(", ");
    return `${meta.label}: use ${accepted} px (±${BANNER_SIZE_TOLERANCE_PX}px). Got ${width}×${height}px`;
  } catch {
    return `${meta.label}: could not read image dimensions`;
  }
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
