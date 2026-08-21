import { Download, LayoutDashboard, RefreshCw, ShieldCheck, Users } from "lucide-react";
import DashboardDateFilter from "../../shared/DashboardDateFilter";
import { RM_DATE_PRESETS } from "../regionalManagerDashboardData";

export default function RmHeader({
  regionLabel,
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
  viewMode = "team",
  onViewModeChange,
}) {
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-black leading-tight text-slate-950 sm:text-xl">
            Dashboard
          </h1>
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
          <span className="inline-flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onViewModeChange?.("team")}
              className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-bold transition ${
                viewMode === "team"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Users className="h-3 w-3" />
              Team Floor
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange?.("command")}
              className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-bold transition ${
                viewMode === "command"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <LayoutDashboard className="h-3 w-3" />
              Command
            </button>
            {regionLabel ? (
              <span className="ml-0.5 hidden text-[10px] font-medium text-slate-400 xl:inline">
                {regionLabel}
              </span>
            ) : null}
          </span>
        }
      />
    </section>
  );
}
