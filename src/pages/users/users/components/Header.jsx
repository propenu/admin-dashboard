import { Loader2, RefreshCw } from "lucide-react";

export const Header = ({
  isLoading,
  isRefreshing,
  usersCount,
  filteredCount,
  onRefresh,
  error,
}) => {
  return (
    <div className="mb-3 flex flex-col gap-2 sm:mb-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight text-[#102033] sm:text-[28px]">
          Users
        </h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Manage and monitor all platform users
        </p>
        {error ? (
          <p className="mt-1 text-xs font-medium text-red-600">{error}</p>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <span className="rounded-full border border-[#d9ebe0] bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-500 shadow-sm">
          {isLoading && !usersCount
            ? "Loading…"
            : `${filteredCount} of ${usersCount} users`}
        </span>
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing || isLoading}
          aria-label="Refresh users"
          className="inline-flex items-center gap-1.5 rounded-full bg-[#12A150]/10 px-3 py-1.5 text-[11px] font-semibold text-[#12A150] transition hover:bg-[#12A150]/15 focus:outline-none focus:ring-4 focus:ring-[#12A150]/15 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isRefreshing ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" aria-hidden />
          )}
          Refresh
        </button>
      </div>
    </div>
  );
};
