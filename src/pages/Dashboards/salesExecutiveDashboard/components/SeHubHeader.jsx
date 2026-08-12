import {
  ClipboardList,
  Plus,
  RefreshCw,
  Users,
} from "lucide-react";
import DashboardDateFilter from "../../shared/DashboardDateFilter";
import { HUB_DATE_PRESETS } from "../salesExecutiveHubData";

const KPI = [
  { key: "myClients", label: "My clients", tone: "slate" },
  { key: "meetingsToday", label: "Meetings today", tone: "emerald" },
  { key: "followUpsDue", label: "Follow-ups due", tone: "amber" },
  { key: "propertiesHandled", label: "Properties handled", tone: "slate" },
  { key: "projects", label: "Projects", tone: "slate" },
  { key: "activeSubscriptions", label: "Active subscriptions", tone: "emerald" },
];

const toneValue = {
  slate: "text-slate-900",
  emerald: "text-emerald-700",
  amber: "text-amber-700",
};

export default function SeHubHeader({
  userName,
  summary,
  preset,
  onPresetChange,
  customFrom,
  customTo,
  onCustomFromChange,
  onCustomToChange,
  onApplyCustom,
  onRefresh,
  isFetching,
  onNewMeeting,
  onOpenFieldMeetings,
  onOpenFollowUp,
}) {
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-600">
            Sales Executive Hub
          </p>
          <h1 className="mt-0.5 text-xl font-black text-slate-950 sm:text-2xl">
            {userName}
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Clients · location search · meetings · properties/projects · subscription ·
            follow-ups
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onNewMeeting}
            className="inline-flex items-center gap-1.5 rounded-[10px] bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" />
            New meeting
          </button>
          <button
            type="button"
            onClick={onOpenFieldMeetings}
            className="inline-flex items-center gap-1.5 rounded-[10px] border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-100"
          >
            <ClipboardList className="h-4 w-4" />
            Open Field Meetings
          </button>
          <button
            type="button"
            onClick={onOpenFollowUp}
            className="inline-flex items-center gap-1.5 rounded-[10px] border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Users className="h-4 w-4" />
            Client Progress
          </button>
          <button
            type="button"
            onClick={onRefresh}
            disabled={isFetching}
            className="inline-flex items-center gap-1.5 rounded-[10px] border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60"
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
        presets={HUB_DATE_PRESETS}
      />

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
        {KPI.map((item) => (
          <div
            key={item.key}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm"
          >
            <p className={`text-xl font-black leading-none ${toneValue[item.tone]}`}>
              {summary?.[item.key] ?? 0}
            </p>
            <p className="mt-1 text-[10px] font-semibold text-slate-500">{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
