// src/features/blogs/components/BlogDetailDrawer.jsx
import React from "react";
import {
  X,
  Clock,
  Tag,
  Heart,
  Share2,
  Globe,
  Linkedin,
  Twitter,
  ChevronRight,
  BookOpen,
  HelpCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  formatDate,
  formatReadTime,
  getBlogStatusConfig,
  getTagColor,
} from "../utility/blogHelpers";

const BlogDetailDrawer = ({ blog, isOpen, onClose, onLike, onShare }) => {
  if (!isOpen || !blog) return null;

  const status = getBlogStatusConfig(blog?.published);

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="w-full max-w-xl bg-white h-full overflow-y-auto shadow-2xl flex flex-col animate-slide-in">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-emerald-600" />
            <span className="text-sm font-semibold text-gray-700">
              Blog Detail
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* <button
              onClick={() => onLike?.(blog?._id || blog?.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-pink-600 hover:bg-pink-50 transition-colors border border-pink-100"
            >
              <Heart size={13} /> Like
            </button> */}
            <button
              onClick={() => onShare?.(blog)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-600 hover:bg-indigo-50 transition-colors border border-indigo-100"
            >
              <Share2 size={13} /> Share
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Featured Image */}
        {blog?.featuredImage && (
          <div className="h-52 overflow-hidden">
            <img
              src={blog.featuredImage}
              alt={blog?.imageAlt || blog?.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="px-6 py-5 space-y-6">
          {/* Status + Category + Time */}
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${status.color}`}
            >
              {status.label}
            </span>
            {blog?.featured && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                Featured
              </span>
            )}
            {blog?.category && (
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                {blog.category}
              </span>
            )}
            <span className="flex items-center gap-1 text-xs text-gray-400 ml-auto">
              <Clock size={11} /> {formatReadTime(blog?.readTime)}
            </span>
          </div>

          {/* Title */}
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-snug">
              {blog?.title}
            </h1>
            <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
              {blog?.excerpt}
            </p>
          </div>

          {/* Tags */}
          {blog?.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {blog.tags.map((tag, i) => (
                <span
                  key={tag}
                  className={`text-xs font-medium px-2.5 py-1 rounded-full border ${getTagColor(i)}`}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Main Content */}
          {blog?.content && (
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Overview
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {blog.content}
              </p>
            </div>
          )}

          {/* Article Sections */}
          {blog?.articleSections?.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Article Sections
              </h3>
              {blog.articleSections.map((sec, idx) => (
                <div
                  key={idx}
                  className="border border-gray-100 rounded-xl p-4 bg-gray-50/40"
                >
                  <div className="flex items-start gap-2">
                    <ChevronRight
                      size={14}
                      className="text-emerald-500 mt-0.5 flex-shrink-0"
                    />
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700">
                        {sec.heading}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                        {sec.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* FAQs */}
          {blog?.faqs?.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <HelpCircle size={13} /> FAQs
              </h3>
              {blog.faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="border border-emerald-100 rounded-xl p-4 bg-emerald-50/30"
                >
                  <p className="text-sm font-semibold text-gray-700">
                    {faq.question}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Author */}
          {blog?.author?.name && (
            <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/40">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Author
              </h3>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm flex-shrink-0">
                  {blog.author.name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">
                    {blog.author.name}
                  </p>
                  <p className="text-xs text-emerald-600">
                    {blog.author.designation}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    {blog.author.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    {blog.author.socialLinks?.linkedin && (
                      <a
                        href={blog.author.socialLinks.linkedin}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Linkedin size={14} />
                      </a>
                    )}
                    {blog.author.socialLinks?.twitter && (
                      <a
                        href={blog.author.socialLinks.twitter}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sky-500 hover:text-sky-600"
                      >
                        <Twitter size={14} />
                      </a>
                    )}
                    {blog.author.socialLinks?.website && (
                      <a
                        href={blog.author.socialLinks.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <Globe size={14} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SEO Meta */}
          {(blog?.metaTitle || blog?.canonicalUrl) && (
            <div className="border border-gray-100 rounded-xl p-4 space-y-2">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                SEO Meta
              </h3>
              <MetaRow label="Meta Title" value={blog?.metaTitle} />
              <MetaRow label="Meta Desc" value={blog?.metaDescription} />
              <MetaRow label="Canonical" value={blog?.canonicalUrl} link />
              {blog?.metaKeywords?.length > 0 && (
                <div className="flex items-start gap-2">
                  <span className="text-xs text-gray-400 w-20 flex-shrink-0">
                    Keywords
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {(Array.isArray(blog.metaKeywords)
                      ? blog.metaKeywords
                      : blog.metaKeywords.split(",")
                    ).map((k) => (
                      <span
                        key={k}
                        className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                      >
                        {k.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Dates */}
          <div className="text-xs text-gray-400 space-y-1">
            {blog?.createdAt && <p>Created: {formatDate(blog.createdAt)}</p>}
            {blog?.updatedAt && <p>Updated: {formatDate(blog.updatedAt)}</p>}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slide-in { from { transform: translateX(100%) } to { transform: translateX(0) } }
        .animate-slide-in { animation: slide-in 0.25s ease-out; }
      `}</style>
    </div>
  );
};

const MetaRow = ({ label, value, link }) => {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2">
      <span className="text-xs text-gray-400 w-20 flex-shrink-0">{label}</span>
      {link ? (
        <a
          href={value}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-emerald-600 hover:underline break-all"
        >
          {value}
        </a>
      ) : (
        <span className="text-xs text-gray-600 break-words">{value}</span>
      )}
    </div>
  );
};

export default BlogDetailDrawer;
