import { RefreshCw, AlertCircle, CheckCircle2, Clock3, ClipboardList, MessageSquare, Ticket } from "lucide-react";
import DashboardDateFilter from "../../shared/DashboardDateFilter";
import { KPI_QUEUE_TAB } from "../customerCareDashboardData";

const METRICS = [
  { key: "openTickets", label: "Open Tickets", icon: Ticket, tone: "emerald", deltaKey: "openTicketsTodayDelta" },
  { key: "urgentCount", label: "Urgent Priority", icon: AlertCircle, tone: "amber" },
  { key: "awaitingCount", label: "Awaiting User Reply", icon: MessageSquare, tone: "blue" },
  { key: "resolvedToday", label: "Resolved in period", icon: CheckCircle2, tone: "emerald" },
];

const toneIcon = {
  emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
  blue: "bg-blue-50 text-blue-600 border-blue-100",
  amber: "bg-amber-50 text-amber-600 border-amber-100",
};

const toneActive = {
  emerald: "border-emerald-400 bg-emerald-50 ring-1 ring-emerald-200",
  blue: "border-blue-400 bg-blue-50 ring-1 ring-blue-200",
  amber: "border-amber-400 bg-amber-50 ring-1 ring-amber-200",
};

export default function CustomerCareKpiStrip({
  summary,
  userName,
  rangeLabel,
  preset,
  onPresetChange,
  customFrom,
  customTo,
  onCustomFromChange,
  onCustomToChange,
  onApplyCustom,
  onRefresh,
  isFetching,
  activeTab,
  onMetricClick,
  onOpenFollowUp,
}) {
  return (
    <section className="space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-600">
            Customer Care Executive
          </p>
          <h1 className="mt-0.5 text-lg font-black leading-tight text-slate-950 sm:text-xl">
            Welcome back, {userName}
          </h1>
          {rangeLabel ? (
            <p className="mt-1 text-[11px] text-slate-400">
              Period <strong className="font-semibold text-slate-600">{rangeLabel}</strong>
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {onOpenFollowUp ? (
            <button
              type="button"
              onClick={onOpenFollowUp}
              className="inline-flex items-center gap-1.5 rounded-[10px] border border-emerald-200 bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700"
            >
              <ClipboardList className="h-4 w-4" />
              Client Progress Queue
            </button>
          ) : null}
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isFetching}
              className="inline-flex items-center gap-1.5 rounded-[10px] border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-50 disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
              Refresh
            </button>
          )}
        </div>
      </div>

      {onPresetChange ? (
        <DashboardDateFilter
          preset={preset}
          onPresetChange={onPresetChange}
          customFrom={customFrom}
          customTo={customTo}
          onCustomFromChange={onCustomFromChange}
          onCustomToChange={onCustomToChange}
          onApplyCustom={onApplyCustom}
        />
      ) : null}

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
        {METRICS.map(({ key, label, icon: Icon, tone, deltaKey }) => {
          const deltaValue = deltaKey ? Number(summary?.[deltaKey] || 0) : 0;
          const tabKey = KPI_QUEUE_TAB[key];
          const active = Boolean(tabKey && activeTab === tabKey);

          return (
            <button
              key={key}
              type="button"
              onClick={() => onMetricClick?.(tabKey)}
              aria-pressed={active}
              title={`Show ${label}`}
              className={`flex min-h-16 min-w-0 items-center gap-2 rounded-[14px] border bg-white px-2.5 py-2.5 text-left shadow-sm transition sm:gap-2.5 sm:px-3.5 sm:py-3 ${
                active
                  ? toneActive[tone]
                  : "border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40"
              }`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border sm:h-9 sm:w-9 ${toneIcon[tone]}`}
              >
                <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2.2} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[10px] font-medium text-slate-500 sm:text-xs">{label}</p>
                <div className="mt-0.5 flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 sm:gap-x-2">
                  <p className="text-base font-black leading-none text-slate-950 sm:text-lg xl:text-xl">
                    {String(summary?.[key] ?? 0).padStart(2, "0")}
                  </p>
                  {deltaKey && deltaValue > 0 && (
                    <span className="text-[10px] font-semibold text-rose-500 sm:text-[11px]">
                      +{deltaValue} in period
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-x-3.5 gap-y-2 rounded-[14px] border border-emerald-200 bg-gradient-to-r from-emerald-50 to-emerald-50/60 px-3.5 py-2 text-xs text-slate-600">
        <Clock3 className="h-4 w-4 shrink-0 text-emerald-600" />
        <span>
          Avg first response: <strong className="text-slate-900">{summary.firstResponseMinutes} min</strong>
        </span>
        <span className="hidden h-3.5 w-px bg-emerald-300 sm:inline-block" aria-hidden="true" />
        <span>
          SLA compliance: <strong className="text-emerald-700">{summary.slaCompliance}%</strong>
        </span>
      </div>
    </section>
  );
}
