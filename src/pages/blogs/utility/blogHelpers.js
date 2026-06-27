// src/features/blogs/utility/blogHelpers.js
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
