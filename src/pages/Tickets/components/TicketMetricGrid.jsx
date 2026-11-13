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
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          const value = Number(overview?.[metric.key] || 0);
          const subtitle = metric.subtitle(overview || {});
          return (
            <button
              type="button"
              key={metric.key}
              onClick={() => onOpenQueue?.(metric.filter)}
              title={`${metric.title}: ${value.toLocaleString("en-IN")} · ${subtitle}`}
              className={`group min-w-0 px-3 py-2.5 text-left ${ticketSurface} ${ticketSurfaceHover}`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border ${metric.tone}`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[11px] font-bold leading-tight text-[#0f3d2e]">
                    {metric.title}
                  </p>
                  <p className="mt-0.5 text-[20px] font-black leading-none tabular-nums text-[#0f3d2e]">
                    {value.toLocaleString("en-IN")}
                  </p>
                  <p className="mt-0.5 truncate text-[10.5px] font-medium leading-tight text-[#5c7d6d]">
                    {subtitle}
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
