import { Download, RefreshCw, ShieldCheck } from "lucide-react";
import { formatRelativeClock } from "../adminDashboardData";
import DashboardDateFilter from "../../shared/DashboardDateFilter";
import { DATE_PRESETS } from "../../shared/dashboardDateRange";

export default function AdHeader({
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
  onRefresh,
  isFetching,
  onExport,
  summary,
  onOpenApprovals,
  onOpenJoinedToday,
}) {
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-600">
            Admin
          </p>
          <h1 className="mt-0.5 text-lg font-black leading-tight text-slate-950 sm:text-xl">
            Operations Command Center · {userName}
          </h1>
          <p className="mt-1 max-w-3xl text-xs text-slate-500">
            Approvals, inventory health, lead routing, support queues, and marketplace user quality —
            your daily operating picture.
          </p>
          <p className="mt-1.5 text-[11px] text-slate-400">
            Period <strong className="font-semibold text-slate-600">{rangeLabel}</strong>
            <span className="mx-1.5 text-slate-300">·</span>
            Updated {formatRelativeClock(refreshedAt)}
            <span className="mx-1.5 text-slate-300">·</span>
            Approval load <strong className="text-slate-700">{summary?.approvalLoad || 0}</strong>
            <span className="mx-1.5 text-slate-300">·</span>
            <button
              type="button"
              onClick={onOpenJoinedToday}
              className="font-semibold text-emerald-700 underline decoration-emerald-300 underline-offset-2 hover:text-emerald-800"
            >
              {summary?.joinedToday || 0} users joined today
            </button>
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
        presets={DATE_PRESETS}
        trailing={
          <>
            Live rate{" "}
            <strong className="text-slate-700">
              {summary?.liveRate == null ? "N/A" : `${summary.liveRate}%`}
            </strong>
          </>
        }
      />
    </section>
  );
}
