//src/pages/blogs/Blogs.jsx

// src/features/blogs/Blogs.jsx
import React, { useState, useMemo } from "react";
import { Plus, Search, RefreshCw, Filter, X, LayoutGrid, List } from "lucide-react";

import BlogCard from "./components/BlogCard";
import BlogFormModal from "./components/BlogFormModal";
import BlogDetailDrawer from "./components/BlogDetailDrawer";
import BlogDeleteModal from "./components/BlogDeleteModal";
import BlogShareModal from "./components/BlogShareModal";
import BlogStatsBar from "./components/BlogStatsBar";

import {
  useGetBlogs,
  useCreateBlog,
  useUpdateBlog,
  useDeleteBlog,
  useLikeBlog,
  useShareBlog,
} from "./hooks/useBlogs";

// ─── Filter Options ────────────────────────────────────────────────────────────
const STATUS_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Published", value: "published" },
  { label: "Draft", value: "draft" },
  { label: "Featured", value: "featured" },
];

const Blogs = () => {
  // ─── UI State ───────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid"); // grid | list

  const [createOpen, setCreateOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [viewBlog, setViewBlog] = useState(null);
  const [deleteBlog, setDeleteBlog] = useState(null);
  const [shareBlogData, setShareBlogData] = useState(null);

  // ─── Queries & Mutations ────────────────────────────────────────────────────
  const { data: blogsData, isLoading, isError, refetch, isFetching } = useGetBlogs();
  //const blogs = blogsData?.blogs || blogsData?.data || blogsData || [];

  const blogs = Array.isArray(blogsData?.items)
    ? blogsData.items
    : Array.isArray(blogsData?.blogs)
      ? blogsData.blogs
      : Array.isArray(blogsData?.data)
        ? blogsData.data
        : Array.isArray(blogsData?.data?.blogs)
          ? blogsData.data.blogs
          : [];

  const createMutation = useCreateBlog();
  const updateMutation = useUpdateBlog();
  const deleteMutation = useDeleteBlog();
  const likeMutation = useLikeBlog();
  const shareMutation = useShareBlog();

  // ─── Filtered blogs ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let result = Array.isArray(blogs) ? blogs : [];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (b) =>
          b?.title?.toLowerCase().includes(q) ||
          b?.excerpt?.toLowerCase().includes(q) ||
          b?.category?.toLowerCase().includes(q) ||
          b?.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (statusFilter === "published") result = result.filter((b) => b?.published);
    if (statusFilter === "draft") result = result.filter((b) => !b?.published);
    if (statusFilter === "featured") result = result.filter((b) => b?.featured);

    return result;
  }, [blogs, search, statusFilter]);

  // ─── Handlers ───────────────────────────────────────────────────────────────
  const handleCreate = (payload) => {
    createMutation.mutate(payload, { onSuccess: () => setCreateOpen(false) });
  };

  const handleUpdate = (payload) => {
    const id = editData?._id || editData?.id;
    updateMutation.mutate({ id, payload }, { onSuccess: () => setEditData(null) });
  };

  const handleDelete = (id) => {
    deleteMutation.mutate(id, { onSuccess: () => setDeleteBlog(null) });
  };

  //const handleLike = (id) => likeMutation.mutate(id);

  const handleShare = ({ id, platform, url }) => {
    shareMutation.mutate({ id, payload: { platform, url } });
  };


  const [likingId, setLikingId] = useState(null);

const handleLike = (id) => {
  setLikingId(id);

  likeMutation.mutate(id, {
    onSettled: () => setLikingId(null),
  });
};

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50/50 px-4 sm:px-6 py-6">
      {/* Page Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Blogs</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage all blog posts — create, edit, publish, and share.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-gray-500 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={15} className={isFetching ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-xl shadow-sm hover:brightness-95 transition-all"
            style={{ background: "#27AE60" }}
          >
            <Plus size={15} /> New Blog
          </button>
        </div>
      </div>

      {/* Stats */}
      <BlogStatsBar blogs={blogs} />

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-5">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search blogs..."
            className="w-full pl-8 pr-8 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 bg-white"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                statusFilter === opt.value
                  ? "text-white border-transparent shadow-sm"
                  : "bg-white text-gray-500 border-gray-200 hover:border-emerald-300"
              }`}
              style={
                statusFilter === opt.value ? { background: "#27AE60" } : {}
              }
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* View Toggle */}
        <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-white ml-auto">
          <ViewToggleBtn
            active={viewMode === "grid"}
            onClick={() => setViewMode("grid")}
            icon={<LayoutGrid size={14} />}
          />
          <ViewToggleBtn
            active={viewMode === "list"}
            onClick={() => setViewMode("list")}
            icon={<List size={14} />}
          />
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : filtered.length === 0 ? (
        <EmptyState
          onClear={() => {
            setSearch("");
            setStatusFilter("all");
          }}
          hasFilters={!!search || statusFilter !== "all"}
        />
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              : "flex flex-col gap-3"
          }
        >
          {filtered.map((blog) => (
            <BlogCard
              key={blog?._id || blog?.id}
              blog={blog}
              onView={setViewBlog}
              onEdit={setEditData}
              onDelete={setDeleteBlog}
              onLike={handleLike}
              onShare={setShareBlogData}
              likeLoading={likingId === blog._id}
            />
          ))}
        </div>
      )}

      {/* Result count */}
      {!isLoading && !isError && filtered.length > 0 && (
        <p className="text-xs text-gray-400 text-center mt-6">
          Showing {filtered.length} of {blogs.length} blog
          {blogs.length !== 1 ? "s" : ""}
        </p>
      )}

      {/* ─── Modals & Drawers ───────────────────────────────────────────────── */}
      <BlogFormModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
        loading={createMutation.isPending}
      />

      <BlogFormModal
        isOpen={!!editData}
        onClose={() => setEditData(null)}
        onSubmit={handleUpdate}
        initialData={editData}
        loading={updateMutation.isPending}
      />

      <BlogDetailDrawer
        isOpen={!!viewBlog}
        blog={viewBlog}
        onClose={() => setViewBlog(null)}
        onLike={handleLike}
        onShare={setShareBlogData}
      />

      <BlogDeleteModal
        isOpen={!!deleteBlog}
        blog={deleteBlog}
        onClose={() => setDeleteBlog(null)}
        onConfirm={handleDelete}
        loading={deleteMutation.isPending}
      />

      <BlogShareModal
        isOpen={!!shareBlogData}
        blog={shareBlogData}
        onClose={() => setShareBlogData(null)}
        onShare={handleShare}
        loading={shareMutation.isPending}
      />
    </div>
  );
};

// ─── Micro components ─────────────────────────────────────────────────────────

const ViewToggleBtn = ({ active, onClick, icon }) => (
  <button
    onClick={onClick}
    className={`p-2 transition-colors ${active ? "text-white" : "text-gray-400 hover:text-gray-600 bg-white"}`}
    style={active ? { background: "#27AE60" } : {}}
  >
    {icon}
  </button>
);

const LoadingSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
        <div className="h-44 bg-gray-100" />
        <div className="p-4 space-y-2">
          <div className="h-3 bg-gray-100 rounded w-1/3" />
          <div className="h-4 bg-gray-100 rounded w-4/5" />
          <div className="h-3 bg-gray-100 rounded w-full" />
          <div className="h-3 bg-gray-100 rounded w-2/3" />
        </div>
      </div>
    ))}
  </div>
);

const ErrorState = ({ onRetry }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
    <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
      <X size={20} className="text-red-400" />
    </div>
    <p className="text-sm text-gray-500">Failed to load blogs. Please try again.</p>
    <button onClick={onRetry} className="text-xs font-medium text-emerald-600 hover:underline">
      Retry
    </button>
  </div>
);

const EmptyState = ({ onClear, hasFilters }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
    <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
      <Search size={20} className="text-emerald-400" />
    </div>
    <p className="text-sm text-gray-500">
      {hasFilters ? "No blogs match your filters." : "No blogs yet. Create your first blog!"}
    </p>
    {hasFilters && (
      <button onClick={onClear} className="text-xs font-medium text-emerald-600 hover:underline">
        Clear filters
      </button>
    )}
  </div>
);

export default Blogs;