import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Inbox,
  MessageSquare,
  RefreshCw,
  Ticket,
  Users,
} from "lucide-react";
import DashboardDateFilter from "../../shared/DashboardDateFilter";
import { CSH_KPI_QUEUE_TAB } from "../customerSupportHeadDashboardData";

const METRICS = [
  { key: "openTickets", label: "Open Queue", icon: Ticket, tone: "emerald" },
  { key: "urgentCount", label: "Urgent / High", icon: AlertCircle, tone: "amber" },
  { key: "unassignedCount", label: "Unassigned", icon: Inbox, tone: "violet" },
  { key: "overdueCount", label: "SLA Risk", icon: AlertTriangle, tone: "rose" },
  { key: "awaitingCount", label: "Awaiting Buyer", icon: MessageSquare, tone: "blue" },
  { key: "resolvedToday", label: "Resolved Today", icon: CheckCircle2, tone: "emerald" },
];

const toneIcon = {
  emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
  blue: "bg-blue-50 text-blue-600 border-blue-100",
  amber: "bg-amber-50 text-amber-600 border-amber-100",
  rose: "bg-rose-50 text-rose-600 border-rose-100",
  violet: "bg-violet-50 text-violet-600 border-violet-100",
};

const toneActive = {
  emerald: "border-emerald-400 bg-emerald-50 ring-1 ring-emerald-200",
  blue: "border-blue-400 bg-blue-50 ring-1 ring-blue-200",
  amber: "border-amber-400 bg-amber-50 ring-1 ring-amber-200",
  rose: "border-rose-400 bg-rose-50 ring-1 ring-rose-200",
  violet: "border-violet-400 bg-violet-50 ring-1 ring-violet-200",
};

export default function CshKpiStrip({
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
  onOpenTickets,
}) {
  return (
    <section className="space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-600">
            Customer Support Head
          </p>
          <h1 className="mt-0.5 text-lg font-black leading-tight text-slate-950 sm:text-xl">
            Support command center · {userName}
          </h1>
          <p className="mt-1 max-w-2xl text-xs text-slate-500">
            Monitor buyer escalations, balance executive load, and clear unassigned tickets across
            customer care.
          </p>
          {rangeLabel ? (
            <p className="mt-1 text-[11px] text-slate-400">
              Period <strong className="font-semibold text-slate-600">{rangeLabel}</strong>
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onOpenTickets}
            className="inline-flex items-center gap-1.5 rounded-[10px] border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
          >
            <Ticket className="h-4 w-4" />
            Ticket desk
          </button>
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

      <div className="grid grid-cols-6 gap-2 sm:gap-3">
        {METRICS.map(({ key, label, icon: Icon, tone }) => {
          const tabKey = CSH_KPI_QUEUE_TAB[key];
          const active = Boolean(tabKey && activeTab === tabKey);
          return (
            <button
              key={key}
              type="button"
              onClick={() => onMetricClick?.(tabKey)}
              aria-pressed={active}
              title={`Filter queue: ${label}`}
              className={`flex min-h-16 min-w-0 items-center gap-1.5 rounded-[14px] border bg-white px-2 py-2.5 text-left shadow-sm transition sm:gap-2.5 sm:px-3 sm:py-3 ${
                active
                  ? toneActive[tone]
                  : "border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40"
              }`}
            >
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border sm:h-9 sm:w-9 ${toneIcon[tone]}`}
              >
                <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2.2} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[9px] font-medium text-slate-500 sm:text-xs">{label}</p>
                <p className="mt-0.5 text-sm font-black leading-none text-slate-950 sm:text-lg">
                  {String(summary[key] ?? 0).padStart(2, "0")}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-x-3.5 gap-y-2 rounded-[14px] border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50/40 px-3.5 py-2 text-xs text-slate-600">
        <Clock3 className="h-4 w-4 shrink-0 text-emerald-600" />
        <span>
          Avg first response:{" "}
          <strong className="text-slate-900">{summary.firstResponseMinutes} min</strong>
        </span>
        <span className="hidden h-3.5 w-px bg-emerald-300 sm:inline-block" aria-hidden="true" />
        <span>
          Avg resolution:{" "}
          <strong className="text-slate-900">{summary.avgResolutionMinutes} min</strong>
        </span>
        <span className="hidden h-3.5 w-px bg-emerald-300 sm:inline-block" aria-hidden="true" />
        <span className="inline-flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5 text-emerald-600" />
          Team online:{" "}
          <strong className="text-emerald-700">
            {summary.teamOnline}/{summary.teamSize}
          </strong>
        </span>
      </div>
    </section>
  );
}
