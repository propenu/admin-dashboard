import { ClipboardCheck, Clock3, Inbox, RefreshCw } from "lucide-react";
import { ticketSurface, ticketSurfaceHover } from "./ticketUi";

const metrics = [
  {
    key: "totals",
    title: "Total Tickets",
    icon: ClipboardCheck,
    tone: "bg-[#e8f8ee] text-[#27AE60] border-[#b7e4c7]",
    filter: {},
    subtitle: (overview) =>
      overview.totals > 0 ? "All tickets in period" : "No tickets in period",
  },
  {
    key: "open",
    title: "Open Tickets",
    icon: Inbox,
    tone: "bg-[#e8f8ee] text-[#27AE60] border-[#b7e4c7]",
    filter: { openBucket: "true" },
    subtitle: (overview) =>
      overview.open > 0 ? "Need attention" : "No open tickets",
  },
  {
    key: "overdue",
    title: "Overdue Tickets",
    icon: Clock3,
    tone: "bg-[#fff8e1] text-[#8a6d12] border-[#f3e0a8]",
    filter: { overdue: "true" },
    subtitle: (overview) =>
      overview.overdue > 0 ? "Past due — act now" : "All on track",
  },
  {
    key: "reassigned",
    title: "Reassigned Tickets",
    icon: RefreshCw,
    tone: "bg-[#e8f8ee] text-[#27AE60] border-[#b7e4c7]",
    filter: { assignment: "reassigned", reassigned: "true" },
    subtitle: (overview) =>
      overview.reassigned > 0 ? "Handed off — review owners" : "No handoffs in period",
  },
];

export default function TicketMetricGrid({ overview, onOpenQueue, rangeLabel }) {
  return (
    <div className="space-y-2">
      {rangeLabel ? (
        <p className="text-[11px] font-semibold text-[#5c7d6d]">
          KPI period · <span className="text-[#0f3d2e]">{rangeLabel}</span>
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
              className={`group min-h-[116px] p-4 text-left ${ticketSurface} ${ticketSurfaceHover}`}
            >
              <div className="flex h-full items-start gap-3">
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${metric.tone}`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-[12px] font-bold leading-tight text-[#0f3d2e]">
                    {metric.title}
                  </p>
                  <p className="mt-2 text-[28px] font-black leading-none tabular-nums text-[#0f3d2e]">
                    {value.toLocaleString("en-IN")}
                  </p>
                  <p className="mt-1 text-[12px] font-medium leading-tight text-[#5c7d6d]">
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
