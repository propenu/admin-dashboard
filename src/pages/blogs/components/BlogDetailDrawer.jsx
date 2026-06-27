// src/features/blogs/components/BlogDetailDrawer.jsx
import React from "react";
import {
  X,
  Clock,
  Tag,
  Share2,
  Globe,
  Linkedin,
  Twitter,
  ChevronRight,
  BookOpen,
  HelpCircle,
  CalendarDays,
  Hash,
  Image as ImageIcon,
  Link as LinkIcon,
  UserRound,
} from "lucide-react";
import {
  formatDate,
  formatReadTime,
  getBlogStatusConfig,
  getTagColor,
  resolveBlogImage,
} from "../utility/blogHelpers";

const BlogDetailDrawer = ({ blog, isOpen, onClose, onShare }) => {
  if (!isOpen || !blog) return null;

  const status = getBlogStatusConfig(blog?.published);
  const featuredImage = resolveBlogImage(blog?.featuredImage);
  const tags = toList(blog?.tags);
  const metaKeywords = toList(blog?.metaKeywords);

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-slate-950/40 backdrop-blur-sm" onClick={onClose} />

      <div className="w-full max-w-4xl bg-white h-full overflow-y-auto shadow-2xl flex flex-col animate-slide-in">
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-gray-100 px-5 sm:px-7 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <span className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <BookOpen size={17} />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800">Blog Preview</p>
              <p className="text-xs text-gray-400 truncate">
                {blog?.slug || blog?._id || "Blog details"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onShare?.(blog)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors border border-indigo-100"
            >
              <Share2 size={13} /> Share
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
              title="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <article>
          {featuredImage ? (
            <div className="relative h-64 sm:h-80 bg-gray-100 overflow-hidden">
              <img
                src={featuredImage}
                alt={blog?.imageAlt || blog?.title || "Blog image"}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent px-5 sm:px-7 py-5">
                <HeroBadges status={status} blog={blog} />
              </div>
            </div>
          ) : (
            <div className="h-36 bg-emerald-50 flex items-center justify-center text-emerald-500">
              <ImageIcon size={34} />
            </div>
          )}

          <div className="px-5 sm:px-7 py-6 space-y-6">
            {!featuredImage && <HeroBadges status={status} blog={blog} />}

            <header className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                {blog?.category && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-700 border border-emerald-100">
                    <Tag size={12} /> {blog.category}
                  </span>
                )}
                <span className="inline-flex items-center gap-1">
                  <Clock size={12} /> {formatReadTime(blog?.readTime || 0)}
                </span>
                {blog?.createdAt && (
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays size={12} /> {formatDate(blog.createdAt)}
                  </span>
                )}
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-950 leading-tight">
                  {blog?.title || "Untitled blog"}
                </h1>
                {blog?.excerpt && (
                  <p className="mt-3 text-sm sm:text-base text-gray-600 leading-7">
                    {blog.excerpt}
                  </p>
                )}
              </div>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag, i) => (
                    <span
                      key={`${tag}-${i}`}
                      className={`text-xs font-medium px-2.5 py-1 rounded-full border ${getTagColor(i)}`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </header>

            <InfoGrid blog={blog} imageUrl={featuredImage} />

            {blog?.content && (
              <ContentPanel title="Main Content">
                <RichTextBlock value={blog.content} />
              </ContentPanel>
            )}

            {blog?.articleSections?.length > 0 && (
              <ContentPanel title={`Article Sections (${blog.articleSections.length})`}>
                <div className="space-y-4">
                  {blog.articleSections.map((sec, idx) => (
                    <section
                      key={`${sec.heading || "section"}-${idx}`}
                      className="rounded-xl border border-gray-100 bg-gray-50/60 p-4"
                    >
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                          {idx + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-bold text-gray-800">
                            {sec.heading || `Section ${idx + 1}`}
                          </h3>
                          <RichTextBlock value={sec.content} compact />
                        </div>
                      </div>
                    </section>
                  ))}
                </div>
              </ContentPanel>
            )}

            {blog?.faqs?.length > 0 && (
              <ContentPanel
                title={`FAQs (${blog.faqs.length})`}
                icon={<HelpCircle size={15} />}
              >
                <div className="space-y-3">
                  {blog.faqs.map((faq, idx) => (
                    <section
                      key={`${faq.question || "faq"}-${idx}`}
                      className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4"
                    >
                      <h3 className="text-sm font-bold text-gray-800">
                        {faq.question || `Question ${idx + 1}`}
                      </h3>
                      <RichTextBlock value={faq.answer} compact />
                    </section>
                  ))}
                </div>
              </ContentPanel>
            )}

            {blog?.author && hasAuthor(blog.author) && (
              <ContentPanel title="Author" icon={<UserRound size={15} />}>
                <div className="flex items-start gap-4 rounded-xl border border-gray-100 bg-gray-50/50 p-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-base flex-shrink-0">
                    {blog.author.name?.charAt(0) || "A"}
                  </div>
                  <div className="flex-1 min-w-0">
                    {blog.author.name && (
                      <p className="text-sm font-bold text-gray-900">
                        {blog.author.name}
                      </p>
                    )}
                    {blog.author.designation && (
                      <p className="text-xs font-semibold text-emerald-600 mt-0.5">
                        {blog.author.designation}
                      </p>
                    )}
                    {blog.author.description && (
                      <p className="text-sm text-gray-600 mt-2 leading-6">
                        {blog.author.description}
                      </p>
                    )}
                    <SocialLinks links={blog.author.socialLinks} />
                  </div>
                </div>
              </ContentPanel>
            )}

            <ContentPanel title="SEO And Record Info">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <MetaRow label="Meta Title" value={blog?.metaTitle} />
                <MetaRow label="Canonical" value={blog?.canonicalUrl} link />
                <MetaRow label="Meta Description" value={blog?.metaDescription} wide />
                {metaKeywords.length > 0 && (
                  <div className="sm:col-span-2 rounded-xl border border-gray-100 p-3">
                    <p className="text-[11px] uppercase tracking-wide font-semibold text-gray-400">
                      Meta Keywords
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {metaKeywords.map((keyword, idx) => (
                        <span
                          key={`${keyword}-${idx}`}
                          className="rounded-full bg-gray-100 px-2 py-1 text-[11px] font-medium text-gray-600"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <MetaRow label="Image Alt" value={blog?.imageAlt} />
                <MetaRow label="Created" value={formatDate(blog?.createdAt)} />
                <MetaRow label="Updated" value={formatDate(blog?.updatedAt)} />
                <MetaRow label="Blog ID" value={blog?._id || blog?.id} wide />
              </div>
            </ContentPanel>
          </div>
        </article>
      </div>

      <style>{`
        @keyframes slide-in { from { transform: translateX(100%) } to { transform: translateX(0) } }
        .animate-slide-in { animation: slide-in 0.25s ease-out; }
        .blog-rich-text :where(p, ul, ol, blockquote) { margin-top: 0.55rem; }
        .blog-rich-text :where(ul, ol) { padding-left: 1.25rem; }
        .blog-rich-text ul { list-style: disc; }
        .blog-rich-text ol { list-style: decimal; }
        .blog-rich-text :where(h1, h2, h3) { margin-top: 0.9rem; font-weight: 700; color: #111827; }
        .blog-rich-text h1 { font-size: 1.35rem; }
        .blog-rich-text h2 { font-size: 1.15rem; }
        .blog-rich-text h3 { font-size: 1rem; }
        .blog-rich-text a { color: #059669; text-decoration: underline; }
        .blog-rich-text img { max-width: 100%; border-radius: 0.75rem; margin-top: 0.75rem; }
      `}</style>
    </div>
  );
};

const HeroBadges = ({ status, blog }) => (
  <div className="flex items-center gap-2 flex-wrap">
    <span
      className={`text-xs font-semibold px-2.5 py-1 rounded-full border bg-white ${status.color}`}
    >
      {status.label}
    </span>
    {blog?.featured && (
      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
        Featured
      </span>
    )}
  </div>
);

const InfoGrid = ({ blog, imageUrl }) => {
  const rows = [
    {
      icon: <Hash size={14} />,
      label: "Slug",
      value: blog?.slug,
    },
    {
      icon: <Clock size={14} />,
      label: "Read Time",
      value: formatReadTime(blog?.readTime || 0),
    },
    {
      icon: <CalendarDays size={14} />,
      label: "Updated",
      value: formatDate(blog?.updatedAt),
    },
    {
      icon: <ImageIcon size={14} />,
      label: "Image",
      value: imageUrl ? "Available" : "Not uploaded",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {rows.map((row) => (
        <div
          key={row.label}
          className="rounded-xl border border-gray-100 bg-gray-50/70 p-3"
        >
          <div className="flex items-center gap-2 text-gray-400">
            {row.icon}
            <span className="text-[11px] font-semibold uppercase tracking-wide">
              {row.label}
            </span>
          </div>
          <p className="mt-2 text-sm font-semibold text-gray-800 break-words">
            {row.value || "-"}
          </p>
        </div>
      ))}
    </div>
  );
};

const ContentPanel = ({ title, icon, children }) => (
  <section className="space-y-3">
    <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-gray-500">
      {icon || <ChevronRight size={14} className="text-emerald-500" />}
      {title}
    </h2>
    {children}
  </section>
);

const RichTextBlock = ({ value, compact = false }) => {
  if (!value) return null;
  const className = `blog-rich-text text-sm text-gray-600 leading-7 break-words ${compact ? "mt-2" : "rounded-xl border border-gray-100 bg-white p-4"}`;

  if (isHtml(value)) {
    return <div className={className} dangerouslySetInnerHTML={{ __html: value }} />;
  }

  return <p className={`${className} whitespace-pre-wrap`}>{value}</p>;
};

const MetaRow = ({ label, value, link, wide }) => {
  if (!value) return null;
  return (
    <div className={`rounded-xl border border-gray-100 p-3 ${wide ? "sm:col-span-2" : ""}`}>
      <p className="text-[11px] uppercase tracking-wide font-semibold text-gray-400">
        {label}
      </p>
      {link ? (
        <a
          href={value}
          target="_blank"
          rel="noreferrer"
          className="mt-1 flex items-start gap-1.5 text-sm font-medium text-emerald-600 hover:underline break-all"
        >
          <LinkIcon size={13} className="mt-1 flex-shrink-0" />
          {value}
        </a>
      ) : (
        <p className="mt-1 text-sm font-medium text-gray-700 break-words">
          {value}
        </p>
      )}
    </div>
  );
};

const SocialLinks = ({ links }) => {
  if (!links?.linkedin && !links?.twitter && !links?.website) return null;
  return (
    <div className="flex items-center gap-2 mt-3">
      {links.linkedin && (
        <SocialLink href={links.linkedin} label="LinkedIn">
          <Linkedin size={14} />
        </SocialLink>
      )}
      {links.twitter && (
        <SocialLink href={links.twitter} label="Twitter">
          <Twitter size={14} />
        </SocialLink>
      )}
      {links.website && (
        <SocialLink href={links.website} label="Website">
          <Globe size={14} />
        </SocialLink>
      )}
    </div>
  );
};

const SocialLink = ({ href, label, children }) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer"
    title={label}
    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-100 bg-white text-gray-500 hover:border-emerald-200 hover:text-emerald-600"
  >
    {children}
  </a>
);

const toList = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const isHtml = (value) => /<\/?[a-z][\s\S]*>/i.test(String(value));

const hasAuthor = (author) =>
  Boolean(
    author?.name ||
      author?.designation ||
      author?.description ||
      author?.socialLinks?.linkedin ||
      author?.socialLinks?.twitter ||
      author?.socialLinks?.website,
  );

export default BlogDetailDrawer;
