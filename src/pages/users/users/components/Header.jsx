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
    <div className="mb-3 flex items-start justify-between gap-2 sm:mb-4 sm:items-center">
      <div className="min-w-0">
        <h1 className="text-xl font-bold tracking-tight text-[#102033] sm:text-[28px]">
          Users
        </h1>
        <p className="mt-0.5 hidden text-sm text-slate-500 sm:block">
          Manage and monitor all platform users
        </p>
        <p className="mt-0.5 text-xs font-semibold text-slate-400 sm:hidden">
          {isLoading && !usersCount
            ? "Loading…"
            : `${filteredCount} of ${usersCount}`}
        </p>
        {error ? (
          <p className="mt-1 text-xs font-medium text-red-600">{error}</p>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <span className="hidden rounded-full border border-[#d9ebe0] bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-500 shadow-sm sm:inline-flex">
          {isLoading && !usersCount
            ? "Loading…"
            : `${filteredCount} of ${usersCount} users`}
        </span>
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing || isLoading}
          aria-label="Refresh users"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#12A150]/10 text-[#12A150] transition hover:bg-[#12A150]/15 focus:outline-none focus:ring-4 focus:ring-[#12A150]/15 disabled:cursor-not-allowed disabled:opacity-50 sm:h-auto sm:w-auto sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-[11px] sm:font-semibold"
        >
          {isRefreshing ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" aria-hidden />
          )}
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>
    </div>
  );
};
