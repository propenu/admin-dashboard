import { Download, RefreshCw, Wallet } from "lucide-react";
import { DATE_PRESETS, formatRelativeClock, formatINR } from "../accountsDashboardData";
import DashboardDateFilter from "../../shared/DashboardDateFilter";

export default function AcHeader({
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
  onOpenPayments,
  onOpenSubscriptions,
  onExport,
  summary,
}) {
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-600">
            Accounts
          </p>
          <h1 className="mt-0.5 text-lg font-black leading-tight text-slate-950 sm:text-xl">
            Finance Command Center · {userName}
          </h1>
          <p className="mt-1 max-w-3xl text-xs text-slate-500">
            Collections, subscription health, plan revenue, failed payments, and cash-flow signals
            for Propenu billing.
          </p>
          <p className="mt-1.5 text-[11px] text-slate-400">
            Period <strong className="font-semibold text-slate-600">{rangeLabel}</strong>
            <span className="mx-1.5 text-slate-300">·</span>
            Updated {formatRelativeClock(refreshedAt)}
            <span className="mx-1.5 text-slate-300">·</span>
            Today {formatINR(summary?.todayRevenue || 0)} · {summary?.paidTodayCount || 0} payments
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onOpenPayments}
            className="inline-flex items-center gap-1.5 rounded-[10px] border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
          >
            <Wallet className="h-4 w-4" />
            Payments
          </button>
          <button
            type="button"
            onClick={onOpenSubscriptions}
            className="inline-flex items-center gap-1.5 rounded-[10px] border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-50"
          >
            Subscriptions
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
        label="Window"
        trailing={
          <>
            Success{" "}
            <strong className="text-slate-700">
              {summary?.successRate == null ? "N/A" : `${summary.successRate}%`}
            </strong>
            <span className="mx-1.5 text-slate-300">·</span>
            Avg ticket{" "}
            <strong className="text-slate-700">
              {summary?.avgTicket == null ? "N/A" : formatINR(summary.avgTicket)}
            </strong>
          </>
        }
      />
    </section>
  );
}
