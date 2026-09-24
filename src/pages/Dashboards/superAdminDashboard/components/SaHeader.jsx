import {
  CalendarRange,
  Download,
  RefreshCw,
  Search,
  Users,
  Wifi,
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
  onOpenStaffFloor,
}) {
  return (
    <section className="space-y-2">
      {/* Row 1: title · meta · actions */}
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h1 className="text-base font-semibold leading-none tracking-tight text-[#0f3d2e] sm:text-lg">
            Dashboard
          </h1>
          <p className="mt-1 truncate text-[11px] text-[#5c7d6d]">
            <span className="font-medium text-[#0f3d2e]">{rangeLabel}</span>
            <span className="mx-1 text-emerald-200">·</span>
            {formatRelativeClock(refreshedAt)}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={onExport}
            title="Copy period summary"
            aria-label="Copy period summary"
            className="inline-flex h-8 items-center gap-1 rounded-full border border-emerald-100 bg-white px-2.5 text-[11px] font-semibold text-[#0f3d2e] shadow-[0_4px_12px_rgba(16,185,129,0.08)] hover:bg-emerald-50"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button
            type="button"
            onClick={onRefresh}
            disabled={isFetching}
            title="Refresh current period"
            aria-label="Refresh dashboard"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-emerald-100 bg-white text-[#0f3d2e] shadow-[0_4px_12px_rgba(16,185,129,0.08)] hover:bg-emerald-50 disabled:opacity-50"
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
                aria-pressed={active}
                onClick={() => onPresetChange?.(item.key)}
                className={`inline-flex h-8 shrink-0 items-center justify-center rounded-full px-2.5 text-[11px] font-semibold leading-none ${
                  active
                    ? "bg-[#27AE60] text-white shadow-[0_6px_14px_rgba(37,211,102,0.28)]"
                    : "border border-emerald-100 bg-white text-[#0f3d2e] shadow-[0_4px_12px_rgba(16,185,129,0.08)] hover:border-emerald-300"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="flex w-full shrink-0 items-center gap-1.5 sm:w-auto">
          <button
            type="button"
            onClick={onOpenStaffFloor}
            title="Staff online / offline (all roles)"
            className="inline-flex h-8 flex-1 items-center justify-center gap-1 rounded-full border border-emerald-100 bg-white px-2.5 text-[11px] font-semibold leading-none text-emerald-700 shadow-[0_4px_12px_rgba(16,185,129,0.08)] hover:bg-emerald-50 sm:flex-none"
          >
            <Wifi className="h-3.5 w-3.5 shrink-0" />
            <span className="sm:hidden">Staff</span>
            <span className="hidden sm:inline">Staff Floor</span>
          </button>
          <button
            type="button"
            onClick={onOpenClientProgress}
            className="inline-flex h-8 flex-1 items-center justify-center gap-1 rounded-full bg-[#27AE60] px-2.5 text-[11px] font-semibold leading-none text-white shadow-[0_6px_14px_rgba(18,161,80,0.24)] hover:bg-[#1e8f4d] sm:flex-none"
          >
            <Users className="h-3.5 w-3.5 shrink-0" />
            <span className="sm:hidden">Queue</span>
            <span className="hidden sm:inline">Client Progress</span>
          </button>
        </div>
      </div>

      {preset === "custom" ? (
        <div className="flex flex-col gap-2 rounded-2xl border border-emerald-100 bg-white p-2 shadow-[0_6px_16px_rgba(16,185,129,0.08)] sm:flex-row sm:flex-wrap sm:items-center">
          <CalendarRange className="hidden h-3.5 w-3.5 text-emerald-600 sm:block" />
          <label className="flex flex-1 items-center gap-1.5 text-[10px] font-medium text-[#5c7d6d] sm:flex-none">
            From
            <input
              type="date"
              value={customFrom || ""}
              max={customTo || undefined}
              onChange={(event) => onCustomFromChange?.(event.target.value)}
              className="min-h-9 flex-1 rounded-xl border border-emerald-100 bg-white px-2 py-1.5 text-[12px] text-[#0f3d2e] outline-none focus:border-emerald-500 sm:min-h-0 sm:w-auto"
            />
          </label>
          <label className="flex flex-1 items-center gap-1.5 text-[10px] font-medium text-[#5c7d6d] sm:flex-none">
            To
            <input
              type="date"
              value={customTo || ""}
              min={customFrom || undefined}
              onChange={(event) => onCustomToChange?.(event.target.value)}
              className="min-h-9 flex-1 rounded-xl border border-emerald-100 bg-white px-2 py-1.5 text-[12px] text-[#0f3d2e] outline-none focus:border-emerald-500 sm:min-h-0 sm:w-auto"
            />
          </label>
          <button
            type="button"
            onClick={onApplyCustom}
            className="inline-flex min-h-9 items-center justify-center gap-1 rounded-full bg-[#27AE60] px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-[#1e8f4d] sm:min-h-0"
          >
            <Search className="h-3 w-3" />
            Apply
          </button>
        </div>
      ) : null}
    </section>
  );
}
