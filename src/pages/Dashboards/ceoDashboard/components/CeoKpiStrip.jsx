import {
  Activity,
  Building2,
  CreditCard,
  IndianRupee,
  Ticket,
  TrendingUp,
  UserRoundSearch,
  Users,
} from "lucide-react";

const ICONS = {
  company: Activity,
  revenue: IndianRupee,
  today: TrendingUp,
  arrish: CreditCard,
  demand: UserRoundSearch,
  market: Building2,
  cx: Ticket,
  people: Users,
};

const toneIcon = {
  emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
  blue: "bg-blue-50 text-blue-600 border-blue-100",
  amber: "bg-amber-50 text-amber-600 border-amber-100",
  rose: "bg-rose-50 text-rose-600 border-rose-100",
  violet: "bg-violet-50 text-violet-600 border-violet-100",
  slate: "bg-slate-50 text-slate-600 border-slate-100",
};

export default function CeoKpiStrip({ kpis = [], onMetricClick, activeKey }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-8">
      {kpis.map((kpi) => {
        const Icon = ICONS[kpi.key] || Activity;
        const active = activeKey === kpi.key;
        return (
          <button
            key={kpi.key}
            type="button"
            title={kpi.hint}
            onClick={() => onMetricClick?.(kpi)}
            className={`flex min-h-16 min-w-0 items-center gap-2 rounded-[14px] border bg-white px-2.5 py-2.5 text-left shadow-sm transition sm:px-3 ${
              active
                ? "border-emerald-400 bg-emerald-50 ring-1 ring-emerald-200"
                : "border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40"
            }`}
          >
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border ${toneIcon[kpi.tone] || toneIcon.emerald}`}
            >
              <Icon className="h-4 w-4" strokeWidth={2.2} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[9px] font-medium text-slate-500 sm:text-[10px]">
                {kpi.label}
              </p>
              <p className="mt-0.5 truncate text-sm font-black leading-none text-slate-950 sm:text-[15px]">
                {kpi.value}
                {kpi.suffix && (
                  <span className="text-[10px] font-semibold text-slate-400">{kpi.suffix}</span>
                )}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
