import {
  Download,
  Megaphone,
  RefreshCw,
  Share2,
} from "lucide-react";
import { DATE_PRESETS, formatRelativeClock } from "../marketingHeadDashboardData";
import DashboardDateFilter from "../../shared/DashboardDateFilter";

export default function MhHeader({
  userName,
  rangeLabel,
  refreshedAt,
  preset,
  onPresetChange,
  customFrom,
  customTo,
  onCustomFromChange,
  onCustomToChange,
  onApplyCustom,
  city,
  cities = [],
  onCityChange,
  onRefresh,
  isFetching,
  onCreateCampaign,
  onOpenLeads,
  onExport,
}) {
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-600">
            Marketing Head
          </p>
          <h1 className="mt-0.5 text-lg font-black leading-tight text-slate-950 sm:text-xl">
            Marketing Command Center · {userName}
          </h1>
          <p className="mt-1 max-w-3xl text-xs text-slate-500">
            Acquisition, lead quality, campaign efficiency, funnel conversion, and
            marketing-attributed outcomes for Propenu inventory.
          </p>
          <p className="mt-1.5 text-[11px] text-slate-400">
            Period <strong className="font-semibold text-slate-600">{rangeLabel}</strong>
            <span className="mx-1.5 text-slate-300">·</span>
            Updated {formatRelativeClock(refreshedAt)}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onCreateCampaign}
            className="inline-flex items-center gap-1.5 rounded-[10px] border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
          >
            <Megaphone className="h-4 w-4" />
            Create campaign
          </button>
          <button
            type="button"
            onClick={onOpenLeads}
            className="inline-flex items-center gap-1.5 rounded-[10px] border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-50"
          >
            Lead desk
          </button>
          <button
            type="button"
            onClick={onExport}
            className="inline-flex items-center gap-1.5 rounded-[10px] border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-50"
            title="Copy summary to clipboard"
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

      <div className="flex flex-col gap-2 lg:flex-row lg:items-stretch">
        <div className="min-w-0 flex-1">
          <DashboardDateFilter
            preset={preset}
            onPresetChange={onPresetChange}
            customFrom={customFrom}
            customTo={customTo}
            onCustomFromChange={onCustomFromChange}
            onCustomToChange={onCustomToChange}
            onApplyCustom={onApplyCustom}
            presets={DATE_PRESETS}
            label="Filters"
            trailing={
              <span className="inline-flex items-center gap-1">
                <Share2 className="h-3.5 w-3.5" />
                Live filters
              </span>
            }
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 rounded-[14px] border border-slate-200 bg-white p-2 shadow-sm">
          <select
            value={city}
            onChange={(event) => onCityChange?.(event.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
          >
            <option value="">All cities</option>
            {cities.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          {(city || preset !== "30d") && (
            <button
              type="button"
              onClick={() => {
                onPresetChange?.("30d");
                onCityChange?.("");
              }}
              className="rounded-lg px-2 py-1.5 text-[11px] font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-700"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
