import {
  Building2,
  CreditCard,
  FolderKanban,
  IndianRupee,
  Ticket,
  Users,
  UserRoundSearch,
} from "lucide-react";

const ICONS = {
  revenue: IndianRupee,
  users: Users,
  listings: Building2,
  projects: FolderKanban,
  leads: UserRoundSearch,
  tickets: Ticket,
  subs: CreditCard,
};

const toneIcon = {
  emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
  blue: "bg-blue-50 text-blue-600 border-blue-100",
  amber: "bg-amber-50 text-amber-600 border-amber-100",
  rose: "bg-rose-50 text-rose-600 border-rose-100",
  violet: "bg-violet-50 text-violet-600 border-violet-100",
};

const COLS = {
  6: "grid-cols-6",
  7: "grid-cols-7",
  8: "grid-cols-8",
};

export default function SaKpiStrip({ kpis = [], onMetricClick, activeKey }) {
  const colsClass = COLS[kpis.length] || COLS[7] || "grid-cols-7";

  if (!kpis.length) {
    return (
      <div className={`grid gap-2 ${colsClass}`}>
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="h-16 animate-pulse rounded-[14px] border border-slate-100 bg-slate-50"
          />
        ))}
      </div>
    );
  }

  return (
    <div className={`grid gap-2 ${colsClass}`}>
      {kpis.map((kpi) => {
        const Icon = ICONS[kpi.key] || Users;
        const active = activeKey === kpi.key;
        return (
          <button
            key={kpi.key}
            type="button"
            title={kpi.hint}
            onClick={() => onMetricClick?.(kpi)}
            className={`flex min-h-16 min-w-0 items-center gap-1.5 rounded-[14px] border bg-white px-2 py-2 text-left shadow-sm transition sm:gap-2 sm:px-2.5 sm:py-2.5 ${
              active
                ? "border-emerald-400 bg-emerald-50 ring-1 ring-emerald-200"
                : "border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40"
            }`}
          >
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border sm:h-8 sm:w-8 ${toneIcon[kpi.tone] || toneIcon.emerald}`}
            >
              <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2.2} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[8px] font-medium text-slate-500 sm:text-[10px]">
                {kpi.label}
              </p>
              <p className="mt-0.5 truncate text-xs font-black leading-none text-slate-950 sm:text-[15px]">
                {kpi.value}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
