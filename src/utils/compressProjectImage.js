import imageCompression from "browser-image-compression";
import { createElement } from "react";
import { Minimize2, CheckCircle2 } from "lucide-react";
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

/** How many images to compress at once (keeps UI responsive). */
export const COMPRESS_CONCURRENCY = 3;

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
export const getImageRejectError = (file, label = "Image") => {
  if (!file) return `${label}: nothing selected.`;
  if (!isImageFile(file)) {
    return `${label}: only images are allowed (PNG, JPG, WEBP).`;
  }
  if (file.size > MAX_ORIGINAL_MB * ONE_MB) {
    return `${label}: max ${MAX_ORIGINAL_MB} MB original size.`;
  }
  return null;
};

const compressIcon = (className = "h-4 w-4 text-emerald-600") =>
  createElement(Minimize2, {
    className: `${className} animate-pulse`,
    "aria-hidden": true,
  });

const compressDoneIcon = () =>
  createElement(CheckCircle2, {
    className: "h-4 w-4 text-emerald-600",
    "aria-hidden": true,
  });

const toOutputFile = (blobOrFile, originalName, typeHint) =>
  new File([blobOrFile], originalName || "image.jpg", {
    type: blobOrFile.type || typeHint || "image/jpeg",
    lastModified: Date.now(),
  });

const runPass = (file, { maxWidthOrHeight, initialQuality, maxSizeMB }) =>
  imageCompression(file, {
    maxSizeMB,
    maxWidthOrHeight,
    useWebWorker: true,
    initialQuality,
  }).then((blob) => toOutputFile(blob, file.name, file.type));

/**
 * Fast path to ~0.8–0.9 MB: usually 1 pass, at most 3.
 * Avoids the old 24-pass grid that made multi-upload feel stuck.
 */
async function compressTowardPointNine(file) {
  const mb = file.size / ONE_MB;
  // Heavier originals start slightly more aggressive so pass 1 lands under 0.9.
  const firstQuality = mb > 6 ? 0.84 : mb > 3 ? 0.88 : 0.9;
  const firstDim = mb > 8 ? 1920 : 2200;

  const first = await runPass(file, {
    maxWidthOrHeight: firstDim,
    initialQuality: firstQuality,
    maxSizeMB: 12,
  });

  if (first.size <= TARGET_MAX_BYTES) return first;

  const second = await runPass(file, {
    maxWidthOrHeight: 1600,
    initialQuality: 0.82,
    maxSizeMB: 12,
  });

  if (second.size <= TARGET_MAX_BYTES) return second;

  // Last resort: hard ceiling under 0.9 MB.
  return runPass(file, {
    maxWidthOrHeight: 1440,
    initialQuality: 0.8,
    maxSizeMB: TARGET_MAX_MB,
  });
}

/**
 * Admin image rule (project + property):
 * - not an image → reject
 * - ≤ 1 MB → no compress (keep original)
 * - > 1 MB → compress to about 0.8–0.9 MB (do not crush far below)
 *
 * Shows a compressing toast with compress icon while work runs (edit + create).
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
        { icon: compressDoneIcon(), duration: 3200 },
      );
    }
    return file instanceof File
      ? file
      : toOutputFile(file, file.name || "image.jpg", file.type);
  }

  const fromMb = (file.size / ONE_MB).toFixed(2);
  const toastId = silent
    ? null
    : toast.loading(`${label}: Compressing ${fromMb} MB…`, {
        icon: compressIcon(),
      });

  try {
    const finalFile = await compressTowardPointNine(file);

    if (finalFile.size > ONE_MB) {
      const msg = `${label}: still over 1 MB after compression (${(finalFile.size / ONE_MB).toFixed(2)} MB). Try a smaller image.`;
      if (!silent) {
        if (toastId != null) toast.dismiss(toastId);
        toast.error(msg, { duration: 4500 });
      }
      throw new Error(msg);
    }

    if (!silent) {
      // Replace loading toast — explicit duration so it auto-closes (industry default ~3s)
      if (toastId != null) toast.dismiss(toastId);
      toast.success(
        `${label}: compressed ${fromMb} MB → ${(finalFile.size / ONE_MB).toFixed(2)} MB`,
        { icon: compressDoneIcon(), duration: 3500 },
      );
    }

    return finalFile;
  } catch (error) {
    if (error?.message && String(error.message).includes(label)) {
      throw error;
    }
    const msg = `${label}: compression failed`;
    if (!silent) {
      if (toastId != null) toast.dismiss(toastId);
      toast.error(msg, { duration: 4500 });
    }
    throw new Error(msg);
  }
}

/**
 * Compress many files with limited concurrency (default 3).
 * Calls onProgress({ done, total, currentName }) as each file finishes.
 */
export async function compressProjectImages(
  files,
  {
    concurrency = COMPRESS_CONCURRENCY,
    silent = true,
    onProgress,
  } = {},
) {
  const list = Array.from(files || []);
  const total = list.length;
  const results = new Array(total);
  let nextIndex = 0;
  let done = 0;

  const worker = async () => {
    while (nextIndex < total) {
      const index = nextIndex++;
      const file = list[index];
      onProgress?.({ done, total, currentName: file?.name || "" });
      try {
        results[index] = {
          ok: true,
          file: await compressProjectImage(file, {
            silent,
            label: file.name,
          }),
          original: file,
        };
      } catch (error) {
        results[index] = { ok: false, error, original: file };
      }
      done += 1;
      onProgress?.({ done, total, currentName: file?.name || "" });
    }
  };

  const pool = Math.min(Math.max(1, concurrency), total || 1);
  await Promise.all(Array.from({ length: pool }, () => worker()));
  return results;
}
