// /blogs/components/BlogCard.jsx
import React from "react";
import {
  Clock,
  Tag,
  Heart,
  Share2,
  Eye,
  Trash2,
  Pencil,
  Loader2,
} from "lucide-react";
import {
  formatDate,
  formatReadTime,
  getBlogStatusConfig,
  getTagColor,
  truncateText,
} from "../utility/blogHelpers";

const BlogCard = ({
  blog,
  onEdit,
  onDelete,
  onLike,
  onShare,
  onView,
  likeLoading,
}) => {
  const status = getBlogStatusConfig(blog?.published);

  return (
    <div className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col">
      {/* Featured Image */}
      <div className="relative h-44 overflow-hidden bg-gray-100">
        {blog?.featuredImage ? (
          <img
            src={blog.featuredImage}
            alt={blog?.imageAlt || blog?.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100">
            <Tag size={36} className="text-emerald-300" />
          </div>
        )}

        {/* Status Badge */}
        <span
          className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full border ${status.color}`}
        >
          {status.label}
        </span>

        {/* Featured Badge */}
        {blog?.featured && (
          <span className="absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            Featured
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        {/* Category */}
        {blog?.category && (
          <span className="text-xs font-medium text-emerald-600 uppercase tracking-wide">
            {blog.category}
          </span>
        )}

        {/* Title */}
        <h3 className="text-sm font-semibold text-gray-800 leading-snug line-clamp-2 group-hover:text-emerald-700 transition-colors">
          {blog?.title}
        </h3>

        {/* Excerpt */}
        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
          {truncateText(blog?.excerpt, 100)}
        </p>

        {/* Tags */}
        {blog?.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {blog.tags.slice(0, 3).map((tag, i) => (
              <span
                key={tag}
                className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${getTagColor(i)}`}
              >
                {tag}
              </span>
            ))}
            {blog.tags.length > 3 && (
              <span className="text-[10px] text-gray-400">
                +{blog.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Meta row */}
        <div className="flex items-center gap-3 text-[11px] text-gray-400 mt-auto pt-2 border-t border-gray-50">
          <span className="flex items-center gap-1">
            <Clock size={11} />
            {formatReadTime(blog?.readTime)}
          </span>
          <span className="flex items-center gap-1">
            {formatDate(blog?.createdAt || blog?.updatedAt)}
          </span>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-100 bg-gray-50/60">
        <div className="flex items-center gap-1">
          <ActionBtn
            icon={<Eye size={13} />}
            label="View"
            onClick={() => onView?.(blog)}
          />
          <ActionBtn
            icon={<Pencil size={13} />}
            label="Edit"
            onClick={() => onEdit?.(blog)}
            color="text-blue-500 hover:bg-blue-50"
          />
          <ActionBtn
            icon={<Trash2 size={13} />}
            label="Delete"
            onClick={() => onDelete?.(blog)}
            color="text-red-500 hover:bg-red-50"
          />
        </div>
        <div className="flex items-center gap-1">
          {/* <ActionBtn
            icon={
              likeLoading ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Heart size={13} />
              )
            }
            label="Like"
            onClick={() => {
              if (!likeLoading) {
                onLike?.(blog?._id);
              }
            }}
            color="text-pink-500 hover:bg-pink-50"
          /> */}
          <ActionBtn
            icon={<Share2 size={13} />}
            label="Share"
            onClick={() => onShare?.(blog)}
            color="text-indigo-500 hover:bg-indigo-50"
          />
        </div>
      </div>
    </div>
  );
};


const ActionBtn = ({
  icon,
  label,
  onClick,
  color = "text-emerald-600 hover:bg-emerald-50",
  disabled = false,
}) => (
  <button
    disabled={disabled}
    onClick={onClick}
    title={label}
    className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium transition-colors
      ${color}
      ${disabled ? "opacity-50 cursor-not-allowed" : ""}
    `}
  >
    {icon}
    <span className="hidden sm:inline">{label}</span>
  </button>
);

export default BlogCard;
