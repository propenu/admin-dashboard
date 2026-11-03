import { useCallback, useEffect, useRef, useState } from "react";
import { builderPlanService } from "./builderPlanService";

export const BUILDER_PAGE_SIZE = 20;
const EMPTY_FACETS = { state: [], city: [], locality: [], pincode: [] };

/**
 * Server-paginated builder lookup. Text search is debounced, filter changes reset to page 1,
 * and stale responses are dropped by aborting the previous request.
 */
export function useBuilderSearch({ query, location, enabled = true }) {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [facets, setFacets] = useState(EMPTY_FACETS);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const controllerRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { state, city, locality, pincode } = location;

  const fetchPage = useCallback(async (nextPage) => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    const append = nextPage > 1;
    if (append) setLoadingMore(true);
    else setLoading(true);
    setError("");
    try {
      const result = await builderPlanService.searchBuilders(
        { q: debouncedQuery, state, city, locality, pincode, page: nextPage, limit: BUILDER_PAGE_SIZE },
        controller.signal,
      );
      if (controller.signal.aborted) return;
      setItems((current) => {
        if (!append) return result.items;
        const seen = new Set(current.map((item) => String(item._id)));
        return [...current, ...result.items.filter((item) => !seen.has(String(item._id)))];
      });
      setPage(result.page);
      setTotal(result.total);
      setHasMore(result.hasMore);
      if (!append) setFacets(result.facets);
    } catch (err) {
      if (controller.signal.aborted || err?.name === "CanceledError") return;
      setError("Unable to load builders");
    } finally {
      if (controllerRef.current === controller) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }, [debouncedQuery, state, city, locality, pincode]);

  useEffect(() => {
    if (enabled) fetchPage(1);
    return () => controllerRef.current?.abort();
  }, [enabled, fetchPage]);

  const loadMore = useCallback(() => {
    if (hasMore && !loading && !loadingMore) fetchPage(page + 1);
  }, [hasMore, loading, loadingMore, page, fetchPage]);

  return { items, total, hasMore, facets, loading, loadingMore, error, loadMore };
}
