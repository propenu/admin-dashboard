import { Download, MapPin, RefreshCw, ShieldCheck } from "lucide-react";
import DashboardDateFilter from "../../shared/DashboardDateFilter";
import { formatRelativeClock, RM_DATE_PRESETS } from "../regionalManagerDashboardData";

export default function RmHeader({
  userName,
  regionLabel,
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
  selectedCity,
  onCityChange,
  selectedStatus,
  onStatusChange,
  allCities = [],
  onClearFilters,
  onOpenApprovals,
}) {
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-600">
            Regional Manager
          </p>
          <h1 className="mt-0.5 text-lg font-black leading-tight text-slate-950 sm:text-xl">
            Regional Command Center · {userName}
          </h1>
          <p className="mt-1 max-w-3xl text-xs text-slate-500">
            Inventory health, pending approvals, engagement, and sales team pulse for your region.
          </p>
          <p className="mt-1.5 flex flex-wrap items-center gap-x-1.5 text-[11px] text-slate-400">
            <span className="inline-flex items-center gap-1 font-semibold text-slate-600">
              <MapPin className="h-3 w-3 text-emerald-600" />
              {regionLabel}
            </span>
            <span className="text-slate-300">·</span>
            Period <strong className="font-semibold text-slate-600">{rangeLabel}</strong>
            <span className="text-slate-300">·</span>
            Updated {formatRelativeClock(refreshedAt)}
            <span className="text-slate-300">·</span>
            Live rate{" "}
            <strong className="text-slate-700">
              {summary?.liveRate == null ? "N/A" : `${summary.liveRate}%`}
            </strong>
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onOpenApprovals}
            className="inline-flex items-center gap-1.5 rounded-[10px] border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
          >
            <ShieldCheck className="h-4 w-4" />
            Review queue
            {summary?.pendingCount > 0 ? (
              <span className="rounded-md bg-emerald-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                {summary.pendingCount}
              </span>
            ) : null}
          </button>
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

      <DashboardDateFilter
        preset={preset}
        onPresetChange={onPresetChange}
        customFrom={customFrom}
        customTo={customTo}
        onCustomFromChange={onCustomFromChange}
        onCustomToChange={onCustomToChange}
        onApplyCustom={onApplyCustom}
        presets={RM_DATE_PRESETS}
        trailing={
          <>
            Showing <strong className="text-slate-700">{regionLabel}</strong>
            {selectedCity !== "All Cities" ? (
              <>
                {" "}
                · <strong className="text-slate-700">{selectedCity}</strong>
              </>
            ) : null}
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-2 rounded-[14px] border border-slate-200 bg-white p-2 shadow-sm">
        <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          City
          <select
            value={selectedCity}
            onChange={(e) => onCityChange?.(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] font-semibold normal-case tracking-normal text-slate-700 outline-none focus:border-emerald-400"
          >
            <option>All Cities</option>
            {allCities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Status
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange?.(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] font-semibold normal-case tracking-normal text-slate-700 outline-none focus:border-emerald-400"
          >
            <option>All Statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="draft">Draft</option>
          </select>
        </label>
        {(selectedCity !== "All Cities" || selectedStatus !== "All Statuses") && (
          <button
            type="button"
            onClick={onClearFilters}
            className="ml-auto rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-700"
          >
            Clear filters
          </button>
        )}
      </div>
    </section>
  );
}
