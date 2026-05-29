// src/features/property/hooks/useFeaturedProjects.js
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import {
  getFeaturedProjectsByType,
  deleteFeaturedProject,
  expireProject,
  resetProject,
  updateProjectRank,
  promoteProjectWithRank,
} from "../../../../features/property/propertyService";
import { toast } from "sonner";

/**
 * Central hook for any featured-project type.
 * @param {"prime"|"featured"|"normal"|"sponsored"} type
 */
export function useFeaturedProjects(type) {
  const queryClient = useQueryClient();
  
const queryKey = ["featured-projects", type];

const { data, fetchNextPage, hasNextPage, isLoading, isError, refetch } =
  useInfiniteQuery({
    queryKey,

    initialPageParam: 1,

    queryFn: ({ pageParam }) => getFeaturedProjectsByType(type, pageParam, 20),

    getNextPageParam: (lastPage) => {
      const { page, pages } = lastPage.data.meta;

      return page < pages ? page + 1 : undefined;
    },
  });

const properties =
  data?.pages?.flatMap((page) => page?.data?.items || []) || [];

const invalidate = () =>
  queryClient.invalidateQueries({
    queryKey,
  });
  

  const sortedProperties = [...properties].sort((a, b) => {
    const rankA = a.rank ?? Infinity;
    const rankB = b.rank ?? Infinity;
    return rankA - rankB;
  });

  
  //const totalCount = data?.pages?.[0]?.data?.meta?.total || 0;
  const totalCount = properties.length;

  const activeCount = properties.filter((p) => p.status === "active").length;

  const inactiveCount = properties.filter(
    (p) => p.status === "inactive",
  ).length;

  const expiredCount = properties.filter((p) => p.status === "expired").length;

  







  // ── DELETE ─────────────────────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (id) => deleteFeaturedProject(id),
    onSuccess: () => {
      toast.success("Property deleted successfully");
      invalidate();

      // Refresh all property lists
      queryClient.invalidateQueries({
        queryKey: ["featured-projects"],
      });
    },
    onError: () => toast.error("Failed to delete property"),
  });

  

  

  

  const promoteMutation = useMutation({
    mutationFn: async ({ id, newType }) => {
      // STEP 1 — fetch target type projects
      const res = await getFeaturedProjectsByType(newType);

      const targetProjects = res?.data?.items || [];

      // STEP 2 — calculate next rank
      const maxRank = Math.max(
        0,
        ...targetProjects.map((p) => Number(p.rank) || 0),
      );

      const nextRank = maxRank + 1;

      console.log("Next Rank:", nextRank);

      // STEP 3 — update promotion type
      await promoteProjectWithRank(id, {
        type: newType,
      });

      console.log("Promotion Updated");

      // STEP 4 — update rank separately
      await updateProjectRank(id, nextRank);

      console.log("Rank Updated");

      return {
        success: true,
        rank: nextRank,
      };
    },

    onSuccess: (data) => {
      console.log("FINAL SUCCESS:", data);

      toast.success("Property promoted successfully");

      invalidate();

      // Refresh all property lists
      queryClient.invalidateQueries({
        queryKey: ["featured-projects"],
      });
    },

    onError: (error) => {
      console.error(error);

      toast.error(
        error?.response?.data?.message || "Failed to promote property",
      );
    },
  });
  
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
    totalCount,
    activeCount,
    inactiveCount,
    expiredCount,
    fetchNextPage,
    hasNextPage,
  };
}
