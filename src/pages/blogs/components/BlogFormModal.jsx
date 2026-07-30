// src/features/blogs/components/BlogFormModal.jsx
import React, { useEffect, useRef, useState } from "react";
import {
  X,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import {
  BLOG_CONTENT_IMAGE,
  BLOG_FEATURED_IMAGE,
  getBlogStatusConfig,
  resolveBlogImage,
  validateBlogFeaturedImage,
} from "../utility/blogHelpers";
import { uploadBlogContentImage } from "../../../features/property/propertyService";
import TiptapEditor from "../../UpsertFeaturedProjects/CreateFeaturedProjects/Components/TiptapEditor";

const uploadEditorImage = async (file) => {
  try {
    const response = await uploadBlogContentImage(file);
    const data = response?.data || {};
    const url =
      data.imageUrl || data.url || data?.data?.imageUrl || data?.data?.url;
    if (!url) throw new Error(data.message || "Image upload failed");
    return url;
  } catch (err) {
    throw new Error(
      err?.response?.data?.message || err?.message || "Image upload failed",
    );
  }
};

const EMPTY_SECTION = { heading: "", content: "" };
const EMPTY_FAQ = { question: "", answer: "" };

const createEmptyForm = () => ({
  title: "",
  excerpt: "",
  featuredImage: "",
  imageAlt: "",
  content: "",
  category: "",
  tags: "",
  readTime: "",
  published: false,
  featured: false,
  articleSections: [{ ...EMPTY_SECTION }],
  faqs: [{ ...EMPTY_FAQ }],
  author: {
    name: "",
    designation: "",
    description: "",
    socialLinks: { linkedin: "", twitter: "", website: "" },
  },
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
  canonicalUrl: "",
});

const defaultExpandedSections = () => ({
  sections: true,
  faqs: false,
  author: false,
  meta: false,
});

const BlogFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  loading = false,
  error = null,
}) => {
  const isEdit = !!initialData;

  const [form, setForm] = useState(createEmptyForm);
  const [expandedSections, setExpandedSections] = useState(
    defaultExpandedSections,
  );
  const [featuredImageFile, setFeaturedImageFile] = useState(null);
  const [featuredImagePreview, setFeaturedImagePreview] = useState("");
  const [featuredImageError, setFeaturedImageError] = useState("");
  const imageInputRef = useRef(null);
  const backendIssues = getBackendIssues(error);
  const fieldErrors = getFieldErrors(backendIssues);
  const backendIssueKey = backendIssues
    .map((i) => `${i.path}:${i.message}`)
    .join("|");

  useEffect(() => {
    if (initialData) {
      setForm({
        ...createEmptyForm(),
        ...initialData,
        published: toBool(initialData.published),
        featured: toBool(initialData.featured),
        tags: Array.isArray(initialData.tags)
          ? initialData.tags.join(", ")
          : initialData.tags || "",
        metaKeywords: Array.isArray(initialData.metaKeywords)
          ? initialData.metaKeywords.join(", ")
          : initialData.metaKeywords || "",
        author: {
          name: initialData.author?.name || "",
          designation: initialData.author?.designation || "",
          description: initialData.author?.description || "",
          socialLinks: {
            linkedin: initialData.author?.socialLinks?.linkedin || "",
            twitter: initialData.author?.socialLinks?.twitter || "",
            website: initialData.author?.socialLinks?.website || "",
          },
        },
        articleSections: initialData.articleSections?.length
          ? initialData.articleSections
          : [{ ...EMPTY_SECTION }],
        faqs: initialData.faqs?.length ? initialData.faqs : [{ ...EMPTY_FAQ }],
      });
      setFeaturedImageFile(null);
      setFeaturedImagePreview(resolveBlogImage(initialData.featuredImage));
      setFeaturedImageError("");
    }
  }, [initialData]);

  useEffect(() => {
    if (!isOpen) return;
    if (!initialData) {
      setForm(createEmptyForm());
      setExpandedSections(defaultExpandedSections());
      setFeaturedImageFile(null);
      setFeaturedImagePreview("");
      setFeaturedImageError("");
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  }, [initialData, isOpen]);

  useEffect(() => {
    return () => {
      if (featuredImagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(featuredImagePreview);
      }
    };
  }, [featuredImagePreview]);

  const set = (field, value) => setForm((p) => ({ ...p, [field]: value }));

  const handleTitleChange = (val) => {
    setForm((p) => ({ ...p, title: val, metaTitle: val }));
  };

  const buildMultipartPayload = (payload) => {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (key === "featuredImage") return;
      if (value === undefined || value === null) return;
      if (typeof value === "boolean") {
        formData.append(key, value ? "true" : "false");
        return;
      }
      if (Array.isArray(value) || typeof value === "object") {
        formData.append(key, JSON.stringify(value));
        return;
      }
      formData.append(key, value);
    });
    if (featuredImageFile) {
      formData.append("featuredImage", featuredImageFile);
    }
    return formData;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFeaturedImageError("");

    const readTimeNum = Number(form.readTime);
    const payload = {
      ...form,
      published: toBool(form.published),
      featured: toBool(form.featured),
      featuredImage: featuredImageFile
        ? undefined
        : resolveBlogImage(form.featuredImage) || featuredImagePreview || "",
      readTime:
        form.readTime === "" || form.readTime == null
          ? undefined
          : Number.isFinite(readTimeNum) && readTimeNum > 0
            ? readTimeNum
            : undefined,
      tags: String(form.tags || "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      metaKeywords: String(form.metaKeywords || "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };
    // Remove profileImage from author if present
    const { profileImage, ...authorClean } = payload.author || {};
    payload.author = authorClean;
    if (payload.featuredImage === undefined) delete payload.featuredImage;
    if (payload.readTime === undefined) delete payload.readTime;

    onSubmit(featuredImageFile ? buildMultipartPayload(payload) : payload);
  };

  const handleFeaturedImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const message = await validateBlogFeaturedImage(file);
    if (message) {
      setFeaturedImageError(message);
      toast.error(message);
      if (imageInputRef.current) imageInputRef.current.value = "";
      return;
    }

    if (featuredImagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(featuredImagePreview);
    }
    setFeaturedImageFile(file);
    setFeaturedImagePreview(URL.createObjectURL(file));
    setFeaturedImageError("");
    set("featuredImage", "");
    toast.success(`Featured image ready (${BLOG_FEATURED_IMAGE.label})`);
  };

  const clearFeaturedImage = () => {
    if (featuredImagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(featuredImagePreview);
    }
    setFeaturedImageFile(null);
    setFeaturedImagePreview("");
    setFeaturedImageError("");
    set("featuredImage", "");
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const toggle = (key) =>
    setExpandedSections((p) => ({ ...p, [key]: !p[key] }));

  const updateSection = (idx, field, val) => {
    const updated = [...form.articleSections];
    updated[idx][field] = val;
    set("articleSections", updated);
  };

  const updateFaq = (idx, field, val) => {
    const updated = [...form.faqs];
    updated[idx][field] = val;
    set("faqs", updated);
  };

  // Open sections that have backend field errors so the message is visible.
  useEffect(() => {
    if (!backendIssueKey) return;
    const paths = backendIssueKey.split("|").map((part) => part.split(":")[0]);
    setExpandedSections((prev) => ({
      ...prev,
      author:
        prev.author ||
        paths.some((p) => p === "author" || p.startsWith("author.")),
      meta:
        prev.meta ||
        paths.some((p) =>
          ["metaTitle", "metaDescription", "metaKeywords", "canonicalUrl"].includes(
            p,
          ),
        ),
      sections: prev.sections || paths.includes("articleSections"),
      faqs: prev.faqs || paths.includes("faqs"),
    }));
  }, [backendIssueKey]);

  if (!isOpen) return null;

  const isPublished = toBool(form.published);
  const isFeatured = toBool(form.featured);
  const statusCfg = getBlogStatusConfig(isPublished);
  const authorError = fieldErrors.author || fieldErrors["author.name"];
  const metaDescError = fieldErrors.metaDescription;
  const metaTitleError = fieldErrors.metaTitle;

  const submitLabel = loading
    ? "Saving…"
    : isEdit
      ? isPublished
        ? "Update & Publish"
        : "Update Draft"
      : isPublished
        ? "Publish Blog"
        : "Save as Draft";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-semibold text-gray-800">
                {isEdit ? "Edit Blog" : "Create New Blog"}
              </h2>
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${statusCfg.color}`}
              >
                {statusCfg.label}
              </span>
              {isFeatured && (
                <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700">
                  Featured
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              {isEdit
                ? "Update blog details below"
                : "Starts as Draft — turn on Published when ready to go live"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {backendIssues.length > 0 && (
          <div className="mx-6 mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
            <p className="text-sm font-semibold text-red-700">
              {error?.response?.data?.message || "Please fix these issues"}
            </p>
            <ul className="mt-2 space-y-1 text-xs text-red-600">
              {backendIssues.map((issue, idx) => (
                <li key={`${issue.path || "issue"}-${idx}`}>
                  {issue.path ? `${formatIssuePath(issue.path)}: ` : ""}
                  {issue.message}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Form */}
        <form
          id="blog-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 py-4 space-y-5"
        >
          {/* Basic Info */}
          <Section title="Basic Information">
            <div className="grid grid-cols-1 gap-3">
              <Field label="Title *" error={fieldErrors.title}>
                <input
                  required
                  value={form.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Enter blog title"
                  className={fieldInputCls(fieldErrors.title)}
                />
              </Field>
              <Field label="Excerpt (optional)" error={fieldErrors.excerpt}>
                <textarea
                  rows={2}
                  value={form.excerpt}
                  onChange={(e) => set("excerpt", e.target.value)}
                  placeholder="Short summary of the blog"
                  className={fieldInputCls(fieldErrors.excerpt)}
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Category (optional)" error={fieldErrors.category}>
                  <input
                    value={form.category}
                    onChange={(e) => set("category", e.target.value)}
                    placeholder="e.g. Commercial Property"
                    className={fieldInputCls(fieldErrors.category)}
                  />
                </Field>
                <Field label="Read Time (mins)" error={fieldErrors.readTime}>
                  <input
                    type="number"
                    min={1}
                    value={form.readTime}
                    onChange={(e) => set("readTime", e.target.value)}
                    placeholder="e.g. 6 (optional, default 5)"
                    className={fieldInputCls(fieldErrors.readTime)}
                  />
                </Field>
              </div>
              <Field label="Tags (comma-separated)" error={fieldErrors.tags}>
                <input
                  value={form.tags}
                  onChange={(e) => set("tags", e.target.value)}
                  placeholder="Commercial Property, Office Space, ..."
                  className={fieldInputCls(fieldErrors.tags)}
                />
              </Field>
              <Field label="Featured Image (optional)">
                <div className="rounded-xl border border-dashed border-emerald-200 bg-emerald-50/40 p-3 space-y-3">
                  <div className="rounded-lg border border-emerald-100 bg-white px-3 py-2.5 text-[11px] leading-relaxed text-gray-600">
                    <p className="font-bold text-emerald-800">
                      Optional hero image — add only if you want one
                    </p>
                    <p className="mt-1">
                      Recommended{" "}
                      <span className="font-semibold text-gray-800">
                        {BLOG_FEATURED_IMAGE.label}
                      </span>{" "}
                      ({BLOG_FEATURED_IMAGE.ratioLabel}) · max{" "}
                      <span className="font-semibold text-gray-800">1 MB</span> ·
                      PNG / JPG / WebP
                    </p>
                    <p className="mt-1 text-gray-500">
                      You can create or update the blog without an image. If you
                      upload one, it must match this size so edges are not cut
                      on propenu.com.
                    </p>
                  </div>

                  <input
                    ref={imageInputRef}
                    type="file"
                    accept={BLOG_FEATURED_IMAGE.accept}
                    className="hidden"
                    onChange={handleFeaturedImageChange}
                  />

                  {/* Same aspect frame as live site: 16/7.7 */}
                  <div className="relative aspect-[16/7.7] w-full overflow-hidden rounded-xl border border-gray-200 bg-[#eef6f1]">
                    {featuredImagePreview ? (
                      <img
                        src={featuredImagePreview}
                        alt={form.imageAlt || "Featured blog preview"}
                        className="absolute inset-0 h-full w-full object-contain"
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
                        <ImageIcon size={22} className="text-emerald-600" />
                        <p className="mt-2 text-xs font-semibold text-gray-700">
                          No image yet (optional)
                        </p>
                        <p className="mt-0.5 text-[10px] text-gray-400">
                          Preview appears here when you add one
                        </p>
                      </div>
                    )}
                  </div>

                  {featuredImagePreview ? (
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-700">
                          {featuredImageFile?.name || "Current featured image"}
                        </p>
                        <p className="text-[11px] text-gray-400">
                          {isEdit
                            ? "Remove current image, then upload a new one to replace it"
                            : `Replace with another ${BLOG_FEATURED_IMAGE.label} image (max 1 MB)`}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => imageInputRef.current?.click()}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                        >
                          <Upload size={13} /> Change Image
                        </button>
                        <button
                          type="button"
                          onClick={clearFeaturedImage}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-100 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100"
                        >
                          <X size={13} /> Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      className="flex w-full flex-col items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-5 text-center transition hover:border-emerald-300 hover:bg-emerald-50/50"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                        <Upload size={18} />
                      </span>
                      <span className="mt-2 text-sm font-semibold text-gray-700">
                        Upload featured image (optional)
                      </span>
                      <span className="mt-1 text-xs text-gray-400">
                        {BLOG_FEATURED_IMAGE.label} · max 1 MB — skip if not needed
                      </span>
                    </button>
                  )}

                  {(featuredImageError || fieldErrors.featuredImage) && (
                    <p className="text-xs font-medium text-red-500">
                      {featuredImageError || fieldErrors.featuredImage}
                    </p>
                  )}
                </div>
              </Field>
              <Field label="Image Alt Text" error={fieldErrors.imageAlt}>
                <input
                  value={form.imageAlt}
                  onChange={(e) => set("imageAlt", e.target.value)}
                  placeholder="Describe the image"
                  className={fieldInputCls(fieldErrors.imageAlt)}
                />
              </Field>
              <Field label="Main Content (optional)" error={fieldErrors.content}>
                <textarea
                  rows={3}
                  value={form.content}
                  onChange={(e) => set("content", e.target.value)}
                  placeholder="Main blog content (optional)..."
                  className={fieldInputCls(fieldErrors.content)}
                />
              </Field>
              <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-3 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Visibility
                  </p>
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusCfg.color}`}
                  >
                    {statusCfg.label}
                  </span>
                  {isFeatured ? (
                    <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                      Featured on
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[10px] font-medium text-gray-400">
                      Featured off
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Toggle
                    label="Published"
                    description={
                      isPublished
                        ? "Live on propenu.com"
                        : "Saved as Draft (not public)"
                    }
                    checked={isPublished}
                    onChange={(v) => set("published", v)}
                    onColor="bg-emerald-500"
                  />
                  <Toggle
                    label="Featured"
                    description={
                      isFeatured
                        ? "Highlighted in featured blogs"
                        : "Not marked as featured"
                    }
                    checked={isFeatured}
                    onChange={(v) => set("featured", v)}
                    onColor="bg-amber-500"
                  />
                </div>
              </div>
            </div>
          </Section>

          {/* Article Sections */}
          <CollapsibleSection
            title={`Article Sections (${form.articleSections.length})`}
            open={expandedSections.sections}
            onToggle={() => toggle("sections")}
          >
            {form.articleSections.map((sec, idx) => (
              <div
                key={idx}
                className="border border-gray-100 rounded-xl p-3 space-y-2 bg-gray-50/50"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500">
                    Section {idx + 1}
                  </span>
                  {form.articleSections.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        set(
                          "articleSections",
                          form.articleSections.filter((_, i) => i !== idx),
                        )
                      }
                      className="text-red-400 hover:text-red-600"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
                <input
                  value={sec.heading}
                  onChange={(e) =>
                    updateSection(idx, "heading", e.target.value)
                  }
                  placeholder="Section Heading"
                  className={inputCls}
                />
                <TiptapEditor
                  value={sec.content}
                  onChange={(html) => updateSection(idx, "content", html)}
                  placeholder="Write this section content..."
                  imageHint={BLOG_CONTENT_IMAGE.hint}
                  maxImageBytes={BLOG_CONTENT_IMAGE.maxBytes}
                  uploadImage={uploadEditorImage}
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                set("articleSections", [
                  ...form.articleSections,
                  { ...EMPTY_SECTION },
                ])
              }
              className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 hover:text-emerald-700 mt-1"
            >
              <Plus size={13} /> Add Section
            </button>
          </CollapsibleSection>

          {/* FAQs */}
          <CollapsibleSection
            title={`FAQs (${form.faqs.length})`}
            open={expandedSections.faqs}
            onToggle={() => toggle("faqs")}
          >
            {form.faqs.map((faq, idx) => (
              <div
                key={idx}
                className="border border-gray-100 rounded-xl p-3 space-y-2 bg-gray-50/50"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500">
                    FAQ {idx + 1}
                  </span>
                  {form.faqs.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        set(
                          "faqs",
                          form.faqs.filter((_, i) => i !== idx),
                        )
                      }
                      className="text-red-400 hover:text-red-600"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
                <input
                  value={faq.question}
                  onChange={(e) => updateFaq(idx, "question", e.target.value)}
                  placeholder="Question"
                  className={inputCls}
                />
                <TiptapEditor
                  value={faq.answer}
                  onChange={(html) => updateFaq(idx, "answer", html)}
                  placeholder="Write this FAQ answer..."
                  imageHint={BLOG_CONTENT_IMAGE.hint}
                  maxImageBytes={BLOG_CONTENT_IMAGE.maxBytes}
                  uploadImage={uploadEditorImage}
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => set("faqs", [...form.faqs, { ...EMPTY_FAQ }])}
              className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 hover:text-emerald-700 mt-1"
            >
              <Plus size={13} /> Add FAQ
            </button>
          </CollapsibleSection>

          {/* Author */}
          <CollapsibleSection
            title="Author Details"
            open={expandedSections.author}
            onToggle={() => toggle("author")}
          >
            <div className="grid grid-cols-2 gap-3">
              <Field label="Author Name (optional)" error={authorError}>
                <input
                  value={form.author.name}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      author: { ...p.author, name: e.target.value },
                    }))
                  }
                  placeholder="Full name"
                  className={fieldInputCls(authorError)}
                />
              </Field>
              <Field label="Designation">
                <input
                  value={form.author.designation}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      author: { ...p.author, designation: e.target.value },
                    }))
                  }
                  placeholder="e.g. Editor"
                  className={inputCls}
                />
              </Field>
            </div>
            <Field label="Author Bio">
              <textarea
                rows={2}
                value={form.author.description}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    author: { ...p.author, description: e.target.value },
                  }))
                }
                placeholder="Short bio..."
                className={inputCls}
              />
            </Field>
            <div className="grid grid-cols-3 gap-3">
              {["linkedin", "twitter", "website"].map((s) => (
                <Field key={s} label={s.charAt(0).toUpperCase() + s.slice(1)}>
                  <input
                    value={form.author.socialLinks[s]}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        author: {
                          ...p.author,
                          socialLinks: {
                            ...p.author.socialLinks,
                            [s]: e.target.value,
                          },
                        },
                      }))
                    }
                    placeholder={`https://...`}
                    className={inputCls}
                  />
                </Field>
              ))}
            </div>
          </CollapsibleSection>

          {/* SEO */}
          <CollapsibleSection
            title="SEO & Meta"
            open={expandedSections.meta}
            onToggle={() => toggle("meta")}
          >
            <Field label="Meta Title (optional)" error={metaTitleError}>
              <input
                value={form.metaTitle}
                onChange={(e) => set("metaTitle", e.target.value)}
                placeholder="SEO title"
                className={fieldInputCls(metaTitleError)}
              />
            </Field>
            <Field label="Meta Description (optional)" error={metaDescError}>
              <textarea
                rows={2}
                value={form.metaDescription}
                onChange={(e) => set("metaDescription", e.target.value)}
                placeholder="SEO description"
                className={fieldInputCls(metaDescError)}
              />
            </Field>
            <Field label="Meta Keywords (comma-separated)">
              <input
                value={form.metaKeywords}
                onChange={(e) => set("metaKeywords", e.target.value)}
                placeholder="keyword1, keyword2"
                className={inputCls}
              />
            </Field>
            <Field label="Canonical URL">
              <input
                value={form.canonicalUrl}
                onChange={(e) => set("canonicalUrl", e.target.value)}
                placeholder="https://propenu.com/blogs/..."
                className={inputCls}
              />
            </Field>
          </CollapsibleSection>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="blog-form"
            disabled={loading}
            className="px-5 py-2 text-sm font-semibold text-white rounded-lg transition-all disabled:opacity-60"
            style={{ background: isPublished ? "#27AE60" : "#d97706" }}
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Sub-components ──────────────────────────────────────────────────────────

const Section = ({ title, children }) => (
  <div className="space-y-3">
    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
      {title}
    </h3>
    {children}
  </div>
);

const CollapsibleSection = ({ title, open, onToggle, children }) => (
  <div className="border border-gray-100 rounded-xl overflow-hidden">
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
    >
      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
        {title}
      </span>
      {open ? (
        <ChevronUp size={14} className="text-gray-400" />
      ) : (
        <ChevronDown size={14} className="text-gray-400" />
      )}
    </button>
    {open && <div className="px-4 py-3 space-y-3">{children}</div>}
  </div>
);

const Field = ({ label, error, children }) => (
  <div className="space-y-1">
    <label className="block text-xs font-medium text-gray-600">{label}</label>
    {children}
    {error ? (
      <p className="text-xs font-medium text-red-500">{error}</p>
    ) : null}
  </div>
);

const Toggle = ({ label, description, checked, onChange, onColor = "bg-emerald-500" }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className="flex w-full items-start gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-left transition hover:border-gray-300"
  >
    <span
      className={`relative mt-0.5 h-5 w-9 shrink-0 rounded-full transition-colors ${
        checked ? onColor : "bg-gray-200"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-4" : "translate-x-0"
        }`}
      />
    </span>
    <span className="min-w-0">
      <span className="block text-xs font-semibold text-gray-700">
        {label}
        <span className={`ml-1.5 font-medium ${checked ? "text-gray-800" : "text-gray-400"}`}>
          {checked ? "On" : "Off"}
        </span>
      </span>
      {description ? (
        <span className="mt-0.5 block text-[11px] leading-snug text-gray-400">
          {description}
        </span>
      ) : null}
    </span>
  </button>
);

const toBool = (value) =>
  value === true || value === "true" || value === 1 || value === "1";

const inputCls =
  "w-full text-sm text-gray-700 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 placeholder:text-gray-300 bg-white transition-all";

const fieldInputCls = (error) =>
  error
    ? `${inputCls} border-red-300 focus:ring-red-200 focus:border-red-400`
    : inputCls;

const getBackendIssues = (error) => {
  const issues = error?.response?.data?.issues;
  if (!Array.isArray(issues)) return [];
  return issues
    .map((issue) => ({
      path: issue?.path || "",
      message: issue?.message || "Invalid value",
    }))
    .filter((issue) => issue.message);
};

const getFieldErrors = (issues) =>
  issues.reduce((acc, issue) => {
    if (issue.path && !acc[issue.path]) {
      acc[issue.path] = issue.message;
    }
    return acc;
  }, {});

const formatIssuePath = (path) =>
  String(path)
    .replace(/\./g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (char) => char.toUpperCase());

export default BlogFormModal;
