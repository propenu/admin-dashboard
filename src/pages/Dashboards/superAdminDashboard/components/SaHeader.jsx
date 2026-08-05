import {
  CalendarRange,
  Download,
  Filter,
  RefreshCw,
  Search,
  Shield,
  Users,
} from "lucide-react";
import { DATE_PRESETS, formatRelativeClock, formatINR } from "../superAdminDashboardData";

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
  summary,
  onOpenClientProgress,
}) {
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-black leading-tight text-[#27AE60] sm:text-xl">
            Dashboard
          </h1>
          <p className="mt-1.5 text-[11px] text-slate-400">
            Period <strong className="font-semibold text-slate-600">{rangeLabel}</strong>
            <span className="mx-1.5 text-slate-300">·</span>
            Updated {formatRelativeClock(refreshedAt)}
            <span className="mx-1.5 text-slate-300">·</span>
            Window {formatINR(summary?.periodRevenue ?? summary?.totalRevenue ?? 0)}
            <span className="mx-1.5 text-slate-300">·</span>
            {summary?.usersInPeriod ?? summary?.usersToday ?? 0} new users
            <span className="mx-1.5 text-slate-300">·</span>
            Today {formatINR(summary?.todayRevenue || 0)}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-[10px] border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
            <Shield className="h-4 w-4" />
            Full platform access
          </span>
          <button
            type="button"
            onClick={onExport}
            className="inline-flex items-center gap-1.5 rounded-[10px] border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-50"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
          <button
            type="button"
            onClick={onRefresh}
            disabled={isFetching}
            className="inline-flex items-center gap-1.5 rounded-[10px] border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-[14px] border border-slate-200 bg-white p-2 shadow-sm">
        <span className="inline-flex items-center gap-1 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          <Filter className="h-3.5 w-3.5" />
          Date range
        </span>
        {DATE_PRESETS.map((item) => {
          const active = preset === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onPresetChange?.(item.key)}
              className={`rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition ${
                active
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-slate-50 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
              }`}
            >
              {item.label}
            </button>
          );
        })}

        {preset === "custom" && (
          <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-emerald-100 bg-emerald-50/50 px-2 py-1">
            <CalendarRange className="h-3.5 w-3.5 text-emerald-600" />
            <label className="flex items-center gap-1 text-[10px] font-semibold text-slate-500">
              From
              <input
                type="date"
                value={customFrom || ""}
                max={customTo || undefined}
                onChange={(event) => onCustomFromChange?.(event.target.value)}
                className="rounded-md border border-slate-200 bg-white px-1.5 py-1 text-[11px] font-semibold text-slate-700 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100"
              />
            </label>
            <label className="flex items-center gap-1 text-[10px] font-semibold text-slate-500">
              To
              <input
                type="date"
                value={customTo || ""}
                min={customFrom || undefined}
                onChange={(event) => onCustomToChange?.(event.target.value)}
                className="rounded-md border border-slate-200 bg-white px-1.5 py-1 text-[11px] font-semibold text-slate-700 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100"
              />
            </label>
            <button
              type="button"
              onClick={onApplyCustom}
              className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-700"
            >
              <Search className="h-3 w-3" />
              Search
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={onOpenClientProgress}
          className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-[11px] font-bold text-white shadow-sm hover:bg-emerald-700"
        >
          <Users className="h-3.5 w-3.5" />
          Open Client Progress Queue
        </button>
      </div>
    </section>
  );
}
