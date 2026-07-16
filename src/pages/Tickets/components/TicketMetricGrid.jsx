import { ClipboardCheck, Clock3, Inbox, UserRoundCheck } from "lucide-react";
import { ticketSurfaceHover } from "./ticketUi";

const metrics = [
  {
    key: "totals",
    title: "Total Tickets",
    subtitle: "All tickets",
    icon: ClipboardCheck,
    tone: "bg-blue-50 text-blue-600 border-blue-100",
    accent: "from-blue-500 to-cyan-400",
  },
  {
    key: "open",
    title: "Open Tickets",
    subtitle: "Need attention",
    icon: Inbox,
    tone: "bg-emerald-50 text-[#27AE60] border-emerald-100",
    accent: "from-[#27AE60] to-emerald-300",
  },
  {
    key: "overdue",
    title: "Overdue Tickets",
    subtitle: "All on track",
    icon: Clock3,
    tone: "bg-amber-50 text-amber-600 border-amber-100",
    accent: "from-amber-500 to-yellow-300",
  },
  {
    key: "unassigned",
    title: "Unassigned Tickets",
    subtitle: "Assign them now",
    icon: UserRoundCheck,
    tone: "bg-rose-50 text-rose-600 border-rose-100",
    accent: "from-rose-500 to-pink-300",
  },
];

const metricFilters = {
  totals: {},
  open: { status: "open" },
  overdue: { overdue: "true" },
  unassigned: { assignment: "unassigned" },
};

export default function TicketMetricGrid({ overview, onOpenQueue }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <button
            type="button"
            key={metric.key}
            onClick={() => onOpenQueue?.(metricFilters[metric.key])}
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
                <p className="mt-2 text-[28px] font-black leading-none text-slate-950">
                  {overview[metric.key]}
                </p>
                <p className="mt-1 text-[12px] font-medium leading-tight text-slate-500">
                  {metric.subtitle}
                </p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
