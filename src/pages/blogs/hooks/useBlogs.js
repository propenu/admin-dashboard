//blogs/hooks/useBlogs.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getBlogs,
  getBlogById,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
  shareBlog,
  likesBlog,
} from "../../../features/property/propertyService";
import { blogKeys } from "../utility/blogKeys";

const getBlogErrorMessage = (err, fallback) => {
  const data = err?.response?.data;
  const issueMessages = Array.isArray(data?.issues)
    ? data.issues
        .map((issue) =>
          [issue?.path, issue?.message].filter(Boolean).join(": "),
        )
        .filter(Boolean)
    : [];

  if (issueMessages.length) {
    return [data?.message, ...issueMessages].filter(Boolean).join(" - ");
  }

  return data?.message || fallback;
};

// ─── GET ALL BLOGS ────────────────────────────────────────────────────────────
export const useGetBlogs = (filters = {}) => {
  return useQuery({
    queryKey: blogKeys.list(filters),
    queryFn: () => getBlogs(filters),
    select: (res) => res?.data,
    staleTime: 1000 * 60 * 5, // 5 min
  });
};

// ─── GET BLOG BY ID ───────────────────────────────────────────────────────────
export const useGetBlogById = (id) => {
  return useQuery({
    queryKey: blogKeys.detail(id),
    queryFn: () => getBlogById(id),
    select: (res) => res?.data,
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};

// ─── GET BLOG BY SLUG ─────────────────────────────────────────────────────────
export const useGetBlogBySlug = (slug) => {
  return useQuery({
    queryKey: blogKeys.slug(slug),
    queryFn: () => getBlogBySlug(slug),
    select: (res) => res?.data,
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
  });
};

// ─── CREATE BLOG ──────────────────────────────────────────────────────────────
export const useCreateBlog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => createBlog(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogKeys.lists() });
      toast.success("Blog created successfully!");
    },
    onError: (err) => {
      toast.error(getBlogErrorMessage(err, "Failed to create blog."));
    },
  });
};

// ─── UPDATE BLOG ──────────────────────────────────────────────────────────────
export const useUpdateBlog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => updateBlog(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: blogKeys.lists() });
      queryClient.invalidateQueries({ queryKey: blogKeys.detail(id) });
      toast.success("Blog updated successfully!");
    },
    onError: (err) => {
      toast.error(getBlogErrorMessage(err, "Failed to update blog."));
    },
  });
};

// ─── DELETE BLOG ──────────────────────────────────────────────────────────────
export const useDeleteBlog = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteBlog(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogKeys.lists() });
      toast.success("Blog deleted successfully.");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to delete blog.");
    },
  });
};

// ─── SHARE BLOG ───────────────────────────────────────────────────────────────
export const useShareBlog = () => {
  return useMutation({
    mutationFn: ({ id, payload }) => shareBlog(id, payload),
    onSuccess: () => toast.success("Blog shared successfully!"),
    onError: (err) =>
      toast.error(err?.response?.data?.message || "Failed to share blog."),
  });
};

// ─── LIKE BLOG ────────────────────────────────────────────────────────────────
export const useLikeBlog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: likesBlog,

    onSuccess: (_, id) => {
      toast.success("Liked!", {
        id: "blog-like-success",
      });

      queryClient.invalidateQueries({
        queryKey: blogKeys.detail(id),
      });

      queryClient.invalidateQueries({
        queryKey: blogKeys.lists(),
      });
    },

    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to like blog.", {
        id: "blog-like-error",
      });
    },
  });
};
