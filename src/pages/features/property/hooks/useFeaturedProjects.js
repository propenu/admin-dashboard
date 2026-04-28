// src/features/property/hooks/useFeaturedProjects.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getFeaturedProjectsByType,
  deleteFeaturedProject,
  promoteProject,
  expireProject,
  resetProject,
  updateProjectRank,
} from "../../../../features/property/propertyService";
import { toast } from "react-hot-toast";

/**
 * Central hook for any featured-project type.
 * @param {"prime"|"featured"|"normal"|"sponsored"} type
 */
export function useFeaturedProjects(type) {
  const queryClient = useQueryClient();
  const queryKey = ["featuredProjects", type];

  // ── FETCH ──────────────────────────────────────────────────────────────────
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey,
    queryFn: () => getFeaturedProjectsByType(type),
    select: (res) => res?.data?.items ?? [],
  });

  const properties = data ?? [];

  const sortedProperties = [...properties].sort((a, b) => {
    const rankA = a.rank ?? Infinity;
    const rankB = b.rank ?? Infinity;
    return rankA - rankB;
  });

  const invalidate = () => queryClient.invalidateQueries(queryKey);

  // ── DELETE ─────────────────────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (id) => deleteFeaturedProject(id),
    onSuccess: () => {
      toast.success("Property deleted successfully");
      invalidate();
    },
    onError: () => toast.error("Failed to delete property"),
  });

  // ── PROMOTE ────────────────────────────────────────────────────────────────
  const promoteMutation = useMutation({
    mutationFn: ({ id, newType }) => promoteProject(id, newType),
    onSuccess: () => {
      toast.success("Property promoted successfully");
      invalidate();
    },
    onError: () => toast.error("Failed to promote property"),
  });

  // ── EXPIRE ─────────────────────────────────────────────────────────────────
  const expireMutation = useMutation({
    mutationFn: (id) => expireProject(id),
    onSuccess: () => {
      toast.success("Property expired");
      invalidate();
    },
    onError: () => toast.error("Failed to expire property"),
  });

  // ── RESET ──────────────────────────────────────────────────────────────────
  const resetMutation = useMutation({
    mutationFn: (id) => resetProject(id),
    onSuccess: () => {
      toast.success("Property reset successfully");
      invalidate();
    },
    onError: () => toast.error("Failed to reset property"),
  });

  // ── RANK UPDATE ────────────────────────────────────────────────────────────
  const rankMutation = useMutation({
    mutationFn: ({ id, rank }) => updateProjectRank(id, rank),
    onSuccess: () => {
      toast.success("Rank updated");
      invalidate();
    },
    onError: () => toast.error("Failed to update rank"),
  });

  return {
    properties,
    sortedProperties,
    isLoading,
    isError,
    refetch,
    invalidate,
    deleteMutation,
    promoteMutation,
    expireMutation,
    resetMutation,
    rankMutation,
  };
}
