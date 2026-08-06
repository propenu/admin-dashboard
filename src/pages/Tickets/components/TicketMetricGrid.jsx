import { ClipboardCheck, Clock3, Inbox, RefreshCw } from "lucide-react";
import { ticketSurfaceHover } from "./ticketUi";

const metrics = [
  {
    key: "totals",
    title: "Total Tickets",
    icon: ClipboardCheck,
    tone: "bg-blue-50 text-blue-600 border-blue-100",
    accent: "from-blue-500 to-cyan-400",
    filter: {},
    subtitle: (overview) =>
      overview.totals > 0 ? "All tickets in period" : "No tickets in period",
  },
  {
    key: "open",
    title: "Open Tickets",
    icon: Inbox,
    tone: "bg-emerald-50 text-[#27AE60] border-emerald-100",
    accent: "from-[#27AE60] to-emerald-300",
    filter: { openBucket: "true" },
    subtitle: (overview) =>
      overview.open > 0 ? "Need attention" : "No open tickets",
  },
  {
    key: "overdue",
    title: "Overdue Tickets",
    icon: Clock3,
    tone: "bg-amber-50 text-amber-600 border-amber-100",
    accent: "from-amber-500 to-yellow-300",
    filter: { overdue: "true" },
    subtitle: (overview) =>
      overview.overdue > 0 ? "Past due — act now" : "All on track",
  },
  {
    key: "reassigned",
    title: "Reassigned Tickets",
    icon: RefreshCw,
    tone: "bg-violet-50 text-violet-700 border-violet-100",
    accent: "from-violet-500 to-fuchsia-300",
    filter: { assignment: "reassigned", reassigned: "true" },
    subtitle: (overview) =>
      overview.reassigned > 0 ? "Handed off — review owners" : "No handoffs in period",
  },
];

export default function TicketMetricGrid({ overview, onOpenQueue, rangeLabel }) {
  return (
    <div className="space-y-2">
      {rangeLabel ? (
        <p className="text-[11px] font-semibold text-slate-400">
          KPI period · <span className="text-slate-600">{rangeLabel}</span>
        </p>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          const value = Number(overview?.[metric.key] || 0);
          return (
            <button
              type="button"
              key={metric.key}
              onClick={() => onOpenQueue?.(metric.filter)}
              className={`group relative min-h-[116px] overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-[0_14px_34px_rgba(15,23,42,0.05)] transition-all duration-300 ${ticketSurfaceHover}`}
            >
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${metric.accent}`} />
              <div className="flex h-full items-start gap-3">
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${metric.tone}`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-[12px] font-bold leading-tight text-slate-800">
                    {metric.title}
                  </p>
                  <p className="mt-2 text-[28px] font-black leading-none tabular-nums text-slate-950">
                    {value.toLocaleString("en-IN")}
                  </p>
                  <p className="mt-1 text-[12px] font-medium leading-tight text-slate-500">
                    {metric.subtitle(overview || {})}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
