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
 * @param {"prime"|"featured"|"normal"|"sponsored"|null} type
 * @param {{promotionStatus?: string|null, search?: string, enabled?: boolean, from?: string, to?: string, status?: string, prefetchAll?: boolean}} options
 *
 * Note: `search` is ignored for network fetches — dashboards filter client-side
 * for instant typing. Pass `prefetchAll: true` to load every page once.
 */
export function useFeaturedProjects(type, options = {}) {
  const queryClient = useQueryClient();
  const promotionStatus = options.promotionStatus || null;
  const from = options.from || options.createdFrom || "";
  const to = options.to || options.createdTo || "";
  const status = options.status || "";
  const enabled = options.enabled ?? true;
  const prefetchAll = options.prefetchAll === true;
  const hasDateRange = Boolean(from || to);

  // Search intentionally excluded from the query key (no refetch while typing).
  const queryKey = [
    "featured-projects",
    type || "all",
    promotionStatus || "all",
    from || "",
    to || "",
    status || "",
    prefetchAll ? "all-pages" : "paged",
  ];

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isError,
    refetch,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey,
    enabled,
    initialPageParam: 1,
    staleTime: hasDateRange ? 30_000 : 5 * 60_000,
    gcTime: 15 * 60_000,
    refetchOnWindowFocus: false,

    queryFn: async ({ pageParam }) => {
      const needsDeepFetch =
        prefetchAll ||
        Boolean(hasDateRange) ||
        (Boolean(status) && status !== "active" && status !== "all");
      const limit = needsDeepFetch ? 100 : 20;
      const listOpts = {
        promotionStatus: hasDateRange
          ? promotionStatus || "all"
          : promotionStatus,
        from: from || undefined,
        to: to || undefined,
        status:
          status && status !== "all"
            ? status
            : hasDateRange
              ? "all"
              : undefined,
      };

      const res = await getFeaturedProjectsByType(
        type,
        pageParam,
        limit,
        listOpts,
      );

      // Prefetch remaining pages once so client search covers the full set.
      if (needsDeepFetch && pageParam === 1) {
        const pages = res?.data?.meta?.pages ?? 1;
        if (pages > 1) {
          const remainingPages = await Promise.all(
            Array.from({ length: pages - 1 }, (_, index) =>
              getFeaturedProjectsByType(type, index + 2, limit, listOpts),
            ),
          );
          const seen = new Set();
          const items = [res, ...remainingPages]
            .flatMap((page) => page?.data?.items || [])
            .filter((property) => {
              if (!property?._id || seen.has(property._id)) return false;
              seen.add(property._id);
              return true;
            });

          return {
            ...res,
            data: {
              ...res.data,
              items,
              meta: {
                ...res.data.meta,
                page: 1,
                limit: items.length,
                pages: 1,
              },
            },
          };
        }
      }

      return res;
    },

    getNextPageParam: (lastPage) => {
      const page = lastPage?.data?.meta?.page ?? 1;
      const pages = lastPage?.data?.meta?.pages ?? 1;
      return page < pages ? page + 1 : undefined;
    },
  });

  const properties =
    data?.pages?.flatMap((page) => {
      return page?.data?.items || [];
    }) || [];

  const invalidate = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey }),
      queryClient.invalidateQueries({ queryKey: ["featured-projects"] }),
      queryClient.invalidateQueries({ queryKey: ["pending-projects"] }),
      queryClient.invalidateQueries({ queryKey: ["master-project-analytics"] }),
      queryClient.invalidateQueries({ queryKey: ["project-analytics"] }),
    ]);

  const sortedProperties = [...properties].sort((a, b) => {
    const rankA = a.rank ?? Infinity;
    const rankB = b.rank ?? Infinity;
    return rankA - rankB;
  });

  const totalCount = data?.pages?.[0]?.data?.meta?.total || 0;

  const activeCount = properties.filter((p) => p.status === "active").length;

  const inactiveCount = properties.filter(
    (p) => p.status === "inactive",
  ).length;

  const expiredCount = properties.filter((p) => p.status === "expired").length;

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteFeaturedProject(id),
    onSuccess: () => {
      toast.success("Property deleted successfully");
      invalidate();
      queryClient.invalidateQueries({
        queryKey: ["featured-projects"],
      });
    },
    onError: () => toast.error("Failed to delete property"),
  });

  const promoteMutation = useMutation({
    mutationFn: async ({ id, newType, visibleLeadLimit }) => {
      const res = await getFeaturedProjectsByType(newType);

      const targetProjects = res?.data?.items || [];

      const maxRank = Math.max(
        0,
        ...targetProjects.map((p) => Number(p.rank) || 0),
      );

      const nextRank = maxRank + 1;

      const promotePayload = {
        type: newType,
      };
      if (
        visibleLeadLimit !== undefined &&
        visibleLeadLimit !== null &&
        visibleLeadLimit !== ""
      ) {
        const parsed = Number(visibleLeadLimit);
        if (Number.isFinite(parsed) && parsed >= 0) {
          promotePayload.visibleLeadLimit = Math.trunc(parsed);
        }
      }

      await promoteProjectWithRank(id, promotePayload);
      await updateProjectRank(id, nextRank);

      return {
        success: true,
        rank: nextRank,
      };
    },

    onSuccess: () => {
      toast.success("Property promoted successfully");
      invalidate();
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
      queryClient.refetchQueries({ queryKey: ["featured-projects"] });
    },
    onError: () => toast.error("Failed to expire property"),
  });

  const resetMutation = useMutation({
    mutationFn: (id) => resetProject(id),
    onSuccess: () => {
      toast.success("Property reset successfully");
      invalidate();
      queryClient.refetchQueries({ queryKey: ["featured-projects"] });
    },
    onError: () => toast.error("Failed to reset property"),
  });

  const rankMutation = useMutation({
    mutationFn: ({ id, rank }) => updateProjectRank(id, rank),
    onSuccess: () => {
      toast.success("Rank updated");
      invalidate();
      queryClient.refetchQueries({ queryKey: ["featured-projects"] });
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
    isFetchingNextPage,
  };
}
