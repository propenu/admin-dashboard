import {
  CalendarRange,
  Download,
  RefreshCw,
  Search,
  Users,
} from "lucide-react";
import { DATE_PRESETS, formatRelativeClock } from "../superAdminDashboardData";

/**
 * Production-compact dashboard toolbar.
 * No decorative hero / duplicate revenue chips (KPIs below already show those).
 */
export default function SaHeader({
  rangeLabel,
  refreshedAt,
  preset,
  onPresetChange,
  customFrom,
  customTo,
  onCustomFromChange,
  onCustomToChange,
  onApplyCustom,
  onRefresh,
  isFetching,
  onExport,
  onOpenClientProgress,
}) {
  return (
    <section className="space-y-2">
      {/* Row 1: title · meta · actions */}
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h1 className="text-base font-bold leading-none text-slate-900 sm:text-lg">
            Dashboard
          </h1>
          <p className="mt-1 truncate text-[11px] text-slate-500">
            <span className="font-medium text-slate-700">{rangeLabel}</span>
            <span className="mx-1 text-slate-300">·</span>
            {formatRelativeClock(refreshedAt)}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={onExport}
            title="Copy summary"
            className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button
            type="button"
            onClick={onRefresh}
            disabled={isFetching}
            title="Refresh"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Date chips + Queue — never overlap (mobile stacks; sm+ one row) */}
      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-2">
        <div
          className="flex w-full min-w-0 items-center gap-1 overflow-x-auto pb-0.5 sa-hide-scrollbar sm:flex-1"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {DATE_PRESETS.map((item) => {
            const active = preset === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onPresetChange?.(item.key)}
                className={`inline-flex h-8 shrink-0 items-center justify-center rounded-lg px-2.5 text-[11px] font-semibold leading-none ${
                  active
                    ? "bg-emerald-600 text-white"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-emerald-300"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onOpenClientProgress}
          className="inline-flex h-8 w-full shrink-0 items-center justify-center gap-1 rounded-lg bg-emerald-600 px-2.5 text-[11px] font-semibold leading-none text-white hover:bg-emerald-700 sm:w-auto"
        >
          <Users className="h-3.5 w-3.5 shrink-0" />
          <span className="sm:hidden">Queue</span>
          <span className="hidden sm:inline">Client Progress</span>
        </button>
      </div>

      {preset === "custom" ? (
        <div className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2 sm:flex-row sm:flex-wrap sm:items-center">
          <CalendarRange className="hidden h-3.5 w-3.5 text-slate-400 sm:block" />
          <label className="flex flex-1 items-center gap-1.5 text-[10px] font-medium text-slate-500 sm:flex-none">
            From
            <input
              type="date"
              value={customFrom || ""}
              max={customTo || undefined}
              onChange={(event) => onCustomFromChange?.(event.target.value)}
              className="min-h-9 flex-1 rounded-md border border-slate-200 bg-white px-2 py-1.5 text-[12px] text-slate-700 outline-none focus:border-emerald-500 sm:min-h-0 sm:w-auto"
            />
          </label>
          <label className="flex flex-1 items-center gap-1.5 text-[10px] font-medium text-slate-500 sm:flex-none">
            To
            <input
              type="date"
              value={customTo || ""}
              min={customFrom || undefined}
              onChange={(event) => onCustomToChange?.(event.target.value)}
              className="min-h-9 flex-1 rounded-md border border-slate-200 bg-white px-2 py-1.5 text-[12px] text-slate-700 outline-none focus:border-emerald-500 sm:min-h-0 sm:w-auto"
            />
          </label>
          <button
            type="button"
            onClick={onApplyCustom}
            className="inline-flex min-h-9 items-center justify-center gap-1 rounded-md bg-emerald-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-emerald-700 sm:min-h-0"
          >
            <Search className="h-3 w-3" />
            Apply
          </button>
        </div>
      ) : null}
    </section>
  );
}
