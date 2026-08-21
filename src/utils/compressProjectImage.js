import imageCompression from "browser-image-compression";
import { toast } from "sonner";

/** Skip compression at or under this size. */
export const ONE_MB = 1024 * 1024;

/** Aim for ~0.8–0.9 MB when original is over 1 MB. */
export const TARGET_MAX_MB = 0.9;
export const TARGET_MIN_MB = 0.8;
export const TARGET_MB = TARGET_MAX_MB;

const TARGET_MAX_BYTES = TARGET_MAX_MB * ONE_MB;

/** Hard ceiling for original image picks. */
export const MAX_ORIGINAL_MB = 15;

export const isImageFile = (file) =>
  Boolean(file?.type?.startsWith("image/"));

/** Format bytes as "0.85 MB" for overlays. */
export const formatBytesMb = (bytes) => {
  const n = Number(bytes);
  if (!Number.isFinite(n) || n <= 0) return "";
  return `${(n / ONE_MB).toFixed(2)} MB`;
};

/** Prefer compressed file size, then stored size fields. */
export const formatFileSizeMb = (item) => {
  if (!item) return "";
  if (typeof item === "number") return formatBytesMb(item);
  return formatBytesMb(
    item?.file?.size || item?.size || item?.compressedSize || item?.originalSize,
  );
};

/**
 * Reject non-images. Returns an error message or null.
 */
export const getImageRejectError = (file, label = "File") => {
  if (!file) return `${label}: nothing selected.`;
  if (!isImageFile(file)) {
    return `${label}: only images are allowed (PNG, JPG, WEBP).`;
  }
  if (file.size > MAX_ORIGINAL_MB * ONE_MB) {
    return `${label}: max ${MAX_ORIGINAL_MB} MB original size.`;
  }
  return null;
};

const toOutputFile = (blobOrFile, originalName, typeHint) =>
  new File([blobOrFile], originalName || "image.jpg", {
    type: blobOrFile.type || typeHint || "image/jpeg",
    lastModified: Date.now(),
  });

/**
 * Compress toward ~0.8–0.9 MB without over-crushing.
 *
 * Important: do NOT set maxSizeMB to 0.9 — browser-image-compression keeps
 * reducing until under that cap and often lands near ~0.4 MB.
 * Instead we set a high soft ceiling and only lower quality/size until
 * the first result ≤ 0.9 MB (highest quality wins).
 */
async function compressTowardPointNine(file) {
  const softCeilingMb = 12;
  // Larger side first, then quality high → low. First hit under 0.9 MB is best.
  const dimensions = [2560, 2200, 1920, 1600];
  const qualities = [0.92, 0.9, 0.88, 0.85, 0.82, 0.8];

  let smallestOver = null;

  for (const maxWidthOrHeight of dimensions) {
    for (const initialQuality of qualities) {
      const compressed = await imageCompression(file, {
        maxSizeMB: softCeilingMb,
        maxWidthOrHeight,
        useWebWorker: true,
        initialQuality,
      });

      const out = toOutputFile(compressed, file.name, file.type);

      if (out.size <= TARGET_MAX_BYTES) {
        // First under-cap at this (dim, quality) order = closest to 0.8–0.9.
        return out;
      }

      if (!smallestOver || out.size < smallestOver.size) {
        smallestOver = out;
      }
    }
  }

  // Still above 0.9 MB — one controlled pass to get under 1 MB (cap only).
  const lastPass = await imageCompression(file, {
    maxSizeMB: TARGET_MAX_MB,
    maxWidthOrHeight: 1600,
    useWebWorker: true,
    initialQuality: 0.8,
  });
  const finalTry = toOutputFile(lastPass, file.name, file.type);
  return finalTry.size <= (smallestOver?.size || Infinity) ? finalTry : smallestOver;
}

/**
 * Admin image rule (project + property):
 * - not an image → reject
 * - ≤ 1 MB → no compress (keep original)
 * - > 1 MB → compress to about 0.8–0.9 MB (do not crush far below)
 */
export async function compressProjectImage(
  file,
  { silent = false, label = "Image" } = {},
) {
  const reject = getImageRejectError(file, label);
  if (reject) {
    if (!silent) toast.error(reject);
    throw new Error(reject);
  }

  if (file.size <= ONE_MB) {
    if (!silent) {
      toast.success(
        `${label}: ${(file.size / ONE_MB).toFixed(2)} MB — under 1 MB, no compress`,
      );
    }
    return file instanceof File
      ? file
      : toOutputFile(file, file.name || "image.jpg", file.type);
  }

  try {
    const finalFile = await compressTowardPointNine(file);

    if (finalFile.size > ONE_MB) {
      const msg = `${label}: still over 1 MB after compression (${(finalFile.size / ONE_MB).toFixed(2)} MB). Try a smaller image.`;
      if (!silent) toast.error(msg);
      throw new Error(msg);
    }

    if (!silent) {
      toast.success(
        `${label}: ${(file.size / ONE_MB).toFixed(2)} MB → ${(finalFile.size / ONE_MB).toFixed(2)} MB`,
      );
    }

    return finalFile;
  } catch (error) {
    if (error?.message && String(error.message).includes(label)) throw error;
    const msg = `${label}: compression failed`;
    if (!silent) toast.error(msg);
    throw new Error(msg);
  }
}
