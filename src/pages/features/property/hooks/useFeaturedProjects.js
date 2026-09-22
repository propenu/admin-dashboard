// src/features/property/hooks/useFeaturedProjects.js
import { useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import {
  getFeaturedProjectsByType,
  deleteFeaturedProject,
  expireProject,
  resetProject,
  updateProjectRank,
  promoteProjectWithRank,
} from "../../../../features/property/propertyService";
import { toast } from "sonner";

/** Cards shown per UI page (3-col grid). */
export const PROJECT_BOARD_PAGE_SIZE = 12;
/** Network window — one request covers 3 UI pages so Next is instant. */
export const PROJECT_BOARD_FETCH_SIZE = 36;
const PREFETCH_CONCURRENCY = 4;

async function runPool(jobs, concurrency = PREFETCH_CONCURRENCY) {
  const results = new Array(jobs.length);
  let cursor = 0;
  const worker = async () => {
    while (cursor < jobs.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await jobs[index]();
    }
  };
  const size = Math.min(Math.max(1, concurrency), jobs.length);
  await Promise.all(Array.from({ length: size }, worker));
  return results;
}

/**
 * Central hook for any featured-project type.
 * @param {"prime"|"featured"|"normal"|"sponsored"|null} type
 * @param {{
 *   promotionStatus?: string|null,
 *   search?: string,
 *   enabled?: boolean,
 *   from?: string,
 *   to?: string,
 *   status?: string,
 *   prefetchAll?: boolean,
 *   pageSize?: number,
 *   adminBoard?: boolean,
 * }} options
 *
 * `adminBoard: true` always sends status (incl. "all") + promotionStatus=all
 * so Draft/Pending/Approved/All match server totals — not active-only default.
 */
export function useFeaturedProjects(type, options = {}) {
  const queryClient = useQueryClient();
  const promotionStatus = options.promotionStatus || null;
  const from = options.from || options.createdFrom || "";
  const to = options.to || options.createdTo || "";
  const status = options.status || "";
  const enabled = options.enabled ?? true;
  const prefetchAll = options.prefetchAll === true;
  const adminBoard = options.adminBoard === true;
  const pageSize = Math.min(
    100,
    Math.max(
      10,
      Number(options.pageSize) ||
        (adminBoard ? PROJECT_BOARD_FETCH_SIZE : PROJECT_BOARD_PAGE_SIZE),
    ),
  );
  const hasDateRange = Boolean(from || to);

  const queryKey = [
    "featured-projects",
    type || "all",
    promotionStatus || (adminBoard ? "all" : "default"),
    from || "",
    to || "",
    status || (adminBoard ? "all" : ""),
    prefetchAll ? "all-pages" : "paged",
    pageSize,
    adminBoard ? "admin" : "public",
  ];

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isError,
    refetch,
    isFetchingNextPage,
    isFetching,
  } = useInfiniteQuery({
    queryKey,
    enabled,
    initialPageParam: 1,
    staleTime: hasDateRange || adminBoard ? 60_000 : 5 * 60_000,
    gcTime: 15 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    placeholderData: (previous) => previous,

    queryFn: async ({ pageParam, signal }) => {
      const limit = prefetchAll ? 100 : pageSize;

      // Explicit status for admin: "all" | draft | pending | active | inactive
      let statusParam;
      if (status === "all" || (adminBoard && !status)) {
        statusParam = "all";
      } else if (status) {
        statusParam = status;
      } else if (hasDateRange) {
        statusParam = "all";
      }

      const listOpts = {
        promotionStatus:
          promotionStatus ||
          (adminBoard || hasDateRange || (statusParam && statusParam !== "active")
            ? "all"
            : undefined),
        from: from || undefined,
        to: to || undefined,
        status: statusParam,
      };

      const res = await getFeaturedProjectsByType(
        type,
        pageParam,
        limit,
        listOpts,
      );
      if (signal?.aborted) return res;

      // Parallel remaining-page fetch only when explicitly requested.
      if (prefetchAll && pageParam === 1) {
        const pages = res?.data?.meta?.pages ?? 1;
        const last = Math.min(pages, 50);
        if (last > 1) {
          const remainingPages = await runPool(
            Array.from({ length: last - 1 }, (_, index) => () =>
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
                total: res?.data?.meta?.total ?? items.length,
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
    data?.pages?.flatMap((page) => page?.data?.items || []) || [];

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
    },
    onError: () => toast.error("Failed to delete property"),
  });

  const promoteMutation = useMutation({
    mutationFn: async ({ id, newType, visibleLeadLimit, days, sponsoredAd }) => {
      if (!id || !newType) {
        throw new Error("Missing project id or promotion type");
      }
      const promotePayload = { type: newType };
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
      if (typeof days === "number" && Number.isFinite(days) && days > 0) {
        promotePayload.days = Math.trunc(days);
      }
      if (sponsoredAd && typeof sponsoredAd === "object") {
        promotePayload.sponsoredAd = sponsoredAd;
      }
      return promoteProjectWithRank(id, promotePayload);
    },
    onSuccess: () => {
      toast.success("Promotion updated");
      invalidate();
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || err?.message || "Promote failed");
    },
  });

  const expireMutation = useMutation({
    mutationFn: (id) => expireProject(id),
    onSuccess: () => {
      toast.success("Promotion expired");
      invalidate();
    },
    onError: () => toast.error("Expire failed"),
  });

  const resetMutation = useMutation({
    mutationFn: (id) => resetProject(id),
    onSuccess: () => {
      toast.success("Promotion reset");
      invalidate();
    },
    onError: () => toast.error("Reset failed"),
  });

  const rankMutation = useMutation({
    mutationFn: ({ id, rank }) => updateProjectRank(id, rank),
    onSuccess: () => invalidate(),
    onError: () => toast.error("Rank update failed"),
  });

  return {
    properties: sortedProperties,
    totalCount,
    activeCount,
    inactiveCount,
    expiredCount,
    isLoading,
    isError,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    deleteMutation,
    promoteMutation,
    expireMutation,
    resetMutation,
    rankMutation,
  };
}
