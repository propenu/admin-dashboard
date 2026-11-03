import { useCallback, useEffect, useMemo, useRef } from "react";
import { builderPlanService } from "./builderPlanService";

const keyOf = (invoice) => `${invoice._id}:${invoice.updatedAt || ""}`;

/** Object-URL cache for invoice PDFs; a changed `updatedAt` naturally misses the cache. */
export function useInvoicePdfCache() {
  const cache = useRef(new Map());

  useEffect(() => {
    const entries = cache.current;
    return () => {
      entries.forEach((entry) => entry.url && URL.revokeObjectURL(entry.url));
      entries.clear();
    };
  }, []);

  const get = useCallback((invoice) => {
    const key = keyOf(invoice);
    const hit = cache.current.get(key);
    if (hit) return hit.promise;

    for (const [oldKey, entry] of cache.current) {
      if (oldKey.startsWith(`${invoice._id}:`)) {
        if (entry.url) URL.revokeObjectURL(entry.url);
        cache.current.delete(oldKey);
      }
    }

    const entry = { url: "" };
    entry.promise = builderPlanService.invoicePdf(invoice._id).then(
      (blob) => {
        entry.url = URL.createObjectURL(blob);
        return entry.url;
      },
      (error) => {
        cache.current.delete(key);
        throw error;
      },
    );
    cache.current.set(key, entry);
    return entry.promise;
  }, []);

  const peek = useCallback((invoice) => cache.current.get(keyOf(invoice))?.url || "", []);

  const prefetch = useCallback((invoice) => {
    get(invoice).catch(() => {});
  }, [get]);

  return useMemo(() => ({ get, peek, prefetch }), [get, peek, prefetch]);
}
