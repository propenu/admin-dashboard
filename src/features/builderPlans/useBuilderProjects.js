import { useCallback, useEffect, useRef, useState } from "react";
import { builderPlanService } from "./builderPlanService";

export const PROJECT_PAGE_SIZE = 12;
const EMPTY = { key: "", items: [], page: 1, total: 0, hasMore: false };

/** Server-paginated projects of one builder, with debounced search. Results reset when the builder changes. */
export function useBuilderProjects({ builderId, query = "" }) {
  const [result, setResult] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const controllerRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const key = builderId ? `${builderId}|${debouncedQuery}` : "";

  const fetchPage = useCallback(async (nextPage) => {
    if (!builderId) return;
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    const append = nextPage > 1;
    if (append) setLoadingMore(true);
    else setLoading(true);
    try {
      const page = await builderPlanService.searchBuilderProjects(
        builderId,
        { q: debouncedQuery, page: nextPage, limit: PROJECT_PAGE_SIZE },
        controller.signal,
      );
      if (controller.signal.aborted) return;
      setResult((current) => {
        const base = append && current.key === key ? current.items : [];
        const seen = new Set(base.map((item) => String(item._id)));
        return {
          key,
          items: [...base, ...page.items.filter((item) => !seen.has(String(item._id)))],
          page: page.page,
          total: page.total,
          hasMore: page.hasMore,
        };
      });
    } catch (err) {
      if (controller.signal.aborted || err?.name === "CanceledError") return;
      setResult({ ...EMPTY, key });
    } finally {
      if (controllerRef.current === controller) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }, [builderId, debouncedQuery, key]);

  useEffect(() => {
    fetchPage(1);
    return () => controllerRef.current?.abort();
  }, [fetchPage]);

  const current = result.key === key ? result : EMPTY;
  const loadMore = useCallback(() => {
    if (current.hasMore && !loading && !loadingMore) fetchPage(current.page + 1);
  }, [current.hasMore, current.page, loading, loadingMore, fetchPage]);

  return { items: current.items, total: current.total, hasMore: current.hasMore, loading: Boolean(builderId) && loading, loadingMore, loadMore };
}
