/**
 * Single app/route loading UI — use only at Suspense (chunk) boundary.
 * Do not nest LoadingSpinner elsewhere for the same navigation.
 */
export default function RouteFallback() {
  return (
    <div className="flex min-h-[50vh] w-full flex-col items-center justify-center gap-3 px-4">
      <div
        className="h-10 w-10 rounded-full border-[3px] border-emerald-500/25 border-t-emerald-500 animate-spin"
        role="status"
        aria-label="Loading page"
      />
      <p className="text-xs font-semibold text-slate-500">Loading…</p>
    </div>
  );
}

/** Soft content placeholder while session/data resolves (no second green spinner). */
export function ContentSkeleton({ rows = 4 }) {
  return (
    <div className="animate-pulse space-y-3 p-1">
      <div className="h-8 w-48 rounded-xl bg-emerald-50" />
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: Math.min(rows, 4) }).map((_, i) => (
          <div key={i} className="h-16 rounded-2xl bg-slate-100" />
        ))}
      </div>
      <div className="h-40 rounded-2xl bg-slate-100" />
    </div>
  );
}
