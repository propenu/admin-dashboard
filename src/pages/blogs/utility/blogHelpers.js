// src/features/blogs/utility/blogHelpers.js

/**
 * Live article hero on propenu.com uses CSS aspect-[16/7.7] (~2.08:1)
 * inside a ~850px column. Upload exactly this ratio to avoid edge cropping.
 */
export const BLOG_FEATURED_IMAGE = {
  width: 1600,
  height: 770,
  ratio: 16 / 7.7,
  maxBytes: 1024 * 1024,
  minWidth: 1200,
  aspectTolerance: 0.04,
  accept: "image/png,image/jpeg,image/jpg,image/webp",
  label: "1600 × 770 px",
  ratioLabel: "16 : 7.7 landscape",
};

/** In-article / section images (content column ~850px wide). */
export const BLOG_CONTENT_IMAGE = {
  width: 1200,
  height: 675,
  maxBytes: 1024 * 1024,
  label: "1200 × 675 px (16:9)",
  hint: "Recommended 1200×675 px (16:9), max 1 MB. Full width of article.",
};

export const readImageDimensions = (file) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const width = img.naturalWidth || img.width;
      const height = img.naturalHeight || img.height;
      URL.revokeObjectURL(url);
      resolve({ width, height });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image dimensions."));
    };
    img.src = url;
  });

/** Returns error message or "" if featured image is acceptable (optional upload). */
export const validateBlogFeaturedImage = async (file) => {
  const spec = BLOG_FEATURED_IMAGE;
  if (!file) return "";
  if (!String(file.type || "").startsWith("image/")) {
    return "Only PNG, JPG, or WebP images are allowed.";
  }
  if (file.size > spec.maxBytes) {
    return `Image must be below 1 MB (yours is ${(file.size / (1024 * 1024)).toFixed(2)} MB).`;
  }
  try {
    const { width, height } = await readImageDimensions(file);
    if (!width || !height) return "Could not read image dimensions.";
    if (width < spec.minWidth) {
      return `Image is too small (${width}×${height}). Use at least ${spec.minWidth}px wide — recommended ${spec.label}.`;
    }
    const ratio = width / height;
    const diff = Math.abs(ratio - spec.ratio) / spec.ratio;
    if (diff > spec.aspectTolerance) {
      return `Wrong size ${width}×${height}. Live blog hero needs ${spec.label} (${spec.ratioLabel}) so edges are not cut on propenu.com.`;
    }
    return "";
  } catch {
    return "Could not validate image. Try another PNG/JPG/WebP file.";
  }
};

export const formatReadTime = (minutes) => `${minutes} min read`;

export const formatDate = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const resolveBlogImage = (image) => {
  if (!image) return "";
  if (typeof image === "string") return image;
  return (
    image.url ||
    image.location ||
    image.src ||
    image.secure_url ||
    image.path ||
    ""
  );
};

export const truncateText = (text, maxLength = 120) => {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "…";
};

export const getBlogStatusConfig = (published) => {
  if (published)
    return {
      label: "Published",
      color: "text-green-700 bg-green-50 border-green-200",
    };
  return {
    label: "Draft",
    color: "text-amber-700 bg-amber-50 border-amber-200",
  };
};

export const buildBlogSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
};

export const getTagColor = (index) => {
  const colors = [
    "bg-emerald-50 text-emerald-700 border-emerald-200",
    "bg-teal-50 text-teal-700 border-teal-200",
    "bg-cyan-50 text-cyan-700 border-cyan-200",
    "bg-green-50 text-green-700 border-green-200",
  ];
  return colors[index % colors.length];
};
