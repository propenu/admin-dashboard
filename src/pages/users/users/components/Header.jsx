import { Loader2, RefreshCw, UserX } from "lucide-react";

export const Header = ({
  isLoading,
  isRefreshing,
  usersCount,
  filteredCount,
  onRefresh,
  error,
  isSuperAdmin = false,
  showDeletedUsers = false,
  onToggleDeletedUsers,
}) => {
  return (
    <div className="mb-3 flex items-start justify-between gap-2 sm:mb-4 sm:items-center">
      <div className="min-w-0">
        <h1 className="text-xl font-bold tracking-tight text-[#12A150] sm:text-[28px]">
          {showDeletedUsers ? "Deleted Users" : "Users"}
        </h1>
        <p className="mt-0.5 hidden text-sm text-slate-500 sm:block">
          {showDeletedUsers
            ? "Accounts removed from live users and stored in deletedaccounts"
            : "Manage and monitor all platform users"}
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
        {!showDeletedUsers ? (
          <span className="hidden rounded-full border border-[#d9ebe0] bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-500 shadow-sm sm:inline-flex">
            {isLoading && !usersCount
              ? "Loading…"
              : `${filteredCount} of ${usersCount} users`}
          </span>
        ) : null}

        {isSuperAdmin ? (
          <button
            type="button"
            onClick={onToggleDeletedUsers}
            className={`inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[11px] font-semibold transition focus:outline-none focus:ring-4 focus:ring-[#12A150]/15 ${
              showDeletedUsers
                ? "bg-[#12A150] text-white shadow-sm"
                : "border border-[#d9ebe0] bg-white text-[#0f7a3a] hover:bg-[#f3faf6]"
            }`}
          >
            <UserX className="h-3.5 w-3.5" aria-hidden />
            <span>{showDeletedUsers ? "Live users" : "Deleted users"}</span>
          </button>
        ) : null}

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
