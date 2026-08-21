import imageCompression from "browser-image-compression";
import { toast } from "sonner";

/** Skip compression at or under this size. */
export const ONE_MB = 1024 * 1024;

/** When over 1 MB, aim for ~0.9 MB (quality 0.8). */
export const TARGET_MB = 0.9;

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

/**
 * Admin image rule (project + property):
 * - not an image → reject
 * - ≤ 1 MB → no compress (keep original)
 * - > 1 MB → compress to ~0.9 MB (initialQuality 0.8)
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
      : new File([file], file.name || "image.jpg", {
          type: file.type,
          lastModified: Date.now(),
        });
  }

  try {
    const compressed = await imageCompression(file, {
      maxSizeMB: TARGET_MB,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      initialQuality: 0.8,
    });

    const finalFile = new File([compressed], file.name, {
      type: compressed.type || file.type,
      lastModified: Date.now(),
    });

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
