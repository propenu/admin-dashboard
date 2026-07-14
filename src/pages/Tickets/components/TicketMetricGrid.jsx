import { ClipboardCheck, Clock3, Inbox, UserRoundCheck } from "lucide-react";

const metrics = [
  {
    key: "totals",
    title: "Total Tickets",
    subtitle: "All tickets",
    icon: ClipboardCheck,
    tone: "bg-blue-100 text-blue-600",
  },
  {
    key: "open",
    title: "Open Tickets",
    subtitle: "Need attention",
    icon: Inbox,
    tone: "bg-green-100 text-green-600",
  },
  {
    key: "overdue",
    title: "Overdue Tickets",
    subtitle: "All on track",
    icon: Clock3,
    tone: "bg-amber-100 text-amber-600",
  },
  {
    key: "unassigned",
    title: "Unassigned Tickets",
    subtitle: "Assign them now",
    icon: UserRoundCheck,
    tone: "bg-red-100 text-red-600",
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
    <div className="grid gap-1 sm:grid-cols-2 md:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <button
            type="button"
            key={metric.key}
            onClick={() => onOpenQueue?.(metricFilters[metric.key])}
            className="min-h-[44px] rounded-md border border-slate-200 bg-white p-1 text-left transition hover:border-emerald-300 hover:bg-emerald-50/40"
          >
            <div className="flex h-full items-center gap-1">
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${metric.tone}`}
              >
                <Icon className="h-3 w-3" />
              </span>
              <div>
                <p className="text-[10px] font-medium leading-tight text-slate-900">
                  {metric.title}
                </p>
                <p className="text-sm font-medium leading-none text-slate-900">
                  {overview[metric.key]}
                </p>
                <p className="text-[9px] font-normal leading-tight text-slate-500">
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
