import { ChevronRight } from "lucide-react";

export const Pagination = ({
  rangeStart,
  rangeEnd,
  totalFiltered,
  pageSize,
  onPageSizeChange,
  page,
  totalPages,
  onPrev,
  onNext,
}) => {
  if (totalFiltered <= 0) return null;

  return (
    <div className="flex flex-col gap-3 border-t border-[#e7f2eb] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
        <span>
          Showing{" "}
          <span className="font-semibold text-[#17212B]">
            {rangeStart}–{rangeEnd}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-[#17212B]">{totalFiltered}</span>{" "}
          users
        </span>
        <label className="sr-only" htmlFor="users-page-size">
          Rows per page
        </label>
        <select
          id="users-page-size"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="rounded-lg border border-[#d9ebe0] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#17212B] focus:border-[#12A150] focus:outline-none focus:ring-4 focus:ring-[#12A150]/10"
        >
          {[10, 20, 50, 100].map((size) => (
            <option key={size} value={size}>
              {size}/page
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPrev}
          disabled={page <= 1}
          className="rounded-xl border border-[#d9ebe0] bg-white px-3.5 py-2 text-xs font-semibold text-[#12A150] transition hover:bg-[#12A150]/5 focus:outline-none focus:ring-4 focus:ring-[#12A150]/15 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous
        </button>
        <span className="min-w-[4.75rem] rounded-xl border border-[#d9ebe0] bg-[#f7fbf8] px-3 py-2 text-center text-xs font-bold tabular-nums text-[#17212B]">
          {page} / {totalPages}
        </span>
        <button
          type="button"
          onClick={onNext}
          disabled={page >= totalPages}
          className="inline-flex items-center gap-1 rounded-xl border border-[#d9ebe0] bg-white px-3.5 py-2 text-xs font-semibold text-[#12A150] transition hover:bg-[#12A150]/5 focus:outline-none focus:ring-4 focus:ring-[#12A150]/15 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
          <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        </button>
      </div>
    </div>
  );
};
