import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  FileText,
  FolderKanban,
  RefreshCw,
  Ticket,
} from "lucide-react";
import DashboardDateFilter from "../../shared/DashboardDateFilter";
import { KPI_QUEUE_TAB } from "../salesExecutiveDashboardData";

const METRICS = [
  { key: "draftListings", label: "Draft to finish", icon: FileText, tone: "blue", tab: KPI_QUEUE_TAB.draftListings },
  { key: "pendingListings", label: "Onboarding", icon: ClipboardList, tone: "amber", tab: KPI_QUEUE_TAB.pendingListings },
  { key: "activeListings", label: "Live listings", icon: CheckCircle2, tone: "emerald", tab: KPI_QUEUE_TAB.activeListings },
  { key: "openTickets", label: "Open blockers", icon: Ticket, tone: "amber", tab: KPI_QUEUE_TAB.openTickets },
  { key: "leadsInPeriod", label: "Leads in period", icon: FolderKanban, tone: "blue", tab: KPI_QUEUE_TAB.leadsInPeriod },
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

export default function SeKpiStrip({
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
  onOpenWorkspace,
  onOpenOnboard,
  onOpenFieldMeetings,
}) {
  return (
    <section className="space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-600">
            Sales Executive
          </p>
          <h1 className="mt-0.5 text-lg font-black leading-tight text-slate-950 sm:text-xl">
            Workflow finder · {userName}
          </h1>
          <p className="mt-1 text-[11px] text-slate-500">
            Post → Onboard → Make live → Clear blockers
            {rangeLabel ? (
              <>
                {" · "}Period{" "}
                <strong className="font-semibold text-slate-600">{rangeLabel}</strong>
              </>
            ) : null}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {onOpenFieldMeetings ? (
            <button
              type="button"
              onClick={onOpenFieldMeetings}
              className="inline-flex items-center gap-1.5 rounded-[10px] border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-800 shadow-sm hover:bg-emerald-100"
            >
              <ClipboardList className="h-4 w-4" />
              Field Meetings
            </button>
          ) : null}
          {onOpenWorkspace ? (
            <button
              type="button"
              onClick={onOpenWorkspace}
              className="inline-flex items-center gap-1.5 rounded-[10px] border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <FolderKanban className="h-4 w-4" />
              My workspace
            </button>
          ) : null}
          {onOpenOnboard ? (
            <button
              type="button"
              onClick={onOpenOnboard}
              className="inline-flex items-center gap-1.5 rounded-[10px] border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-800 shadow-sm hover:bg-emerald-100"
            >
              <ClipboardList className="h-4 w-4" />
              Onboard user
            </button>
          ) : null}
          {onOpenFollowUp ? (
            <button
              type="button"
              onClick={onOpenFollowUp}
              className="inline-flex items-center gap-1.5 rounded-[10px] border border-emerald-200 bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700"
            >
              <ClipboardList className="h-4 w-4" />
              Client Progress
            </button>
          ) : null}
          {onRefresh ? (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isFetching}
              className="inline-flex items-center gap-1.5 rounded-[10px] border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-50 disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
              Refresh
            </button>
          ) : null}
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
      />

      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 xl:grid-cols-5">
        {METRICS.map((metric) => {
          const Icon = metric.icon;
          const value = summary?.[metric.key] ?? 0;
          const active = activeTab === metric.tab;
          return (
            <button
              key={metric.key}
              type="button"
              onClick={() => onMetricClick?.(metric.tab)}
              className={`rounded-xl border bg-white px-2.5 py-2 text-left shadow-sm transition hover:shadow-md ${
                active ? toneActive[metric.tone] : "border-slate-200"
              }`}
            >
              <div className="flex items-center justify-between gap-1.5">
                <span
                  className={`inline-flex h-6 w-6 items-center justify-center rounded-lg border ${toneIcon[metric.tone]}`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </span>
                {metric.key === "openTickets" && Number(summary?.urgentTickets || 0) > 0 ? (
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-600">
                    <AlertCircle className="h-3 w-3" />
                    {summary.urgentTickets} urgent
                  </span>
                ) : null}
              </div>
              <p className="mt-1.5 text-lg font-black leading-none text-slate-900">{value}</p>
              <p className="mt-0.5 text-[10px] font-semibold text-slate-500">{metric.label}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
