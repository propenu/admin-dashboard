export const BANNER_SLOTS = [
  { key: "desktop", label: "Desktop", size: "1920 × 600", ratio: "3.2:1" },
  { key: "laptop", label: "Laptop", size: "1440 × 500", ratio: "2.88:1" },
  { key: "tablet", label: "Tablet", size: "1536 × 768", ratio: "2:1" },
  { key: "mobile", label: "Mobile", size: "1080 × 900", ratio: "6:5" },
];

export const LOGO_HINT = "GIF only · ~3.34:1 (e.g. 167×50, 334×100) · under 1 MB";

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

export function validateGifFile(file) {
  if (!file) return "GIF file is required";
  const name = String(file.name || "").toLowerCase();
  if (file.type !== "image/gif" && !name.endsWith(".gif")) {
    return "Only GIF files are allowed";
  }
  if (file.size > 1024 * 1024) {
    return "File must be below 1 MB";
  }
  return "";
}

export function isDeviceSaved(device) {
  return Boolean(device?.image);
}
