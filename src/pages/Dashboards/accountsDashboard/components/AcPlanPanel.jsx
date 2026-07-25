import { formatINR } from "../accountsDashboardData";

export default function AcPlanPanel({ planRows = [], onOpenPlans }) {
  const max = Math.max(...planRows.map((p) => p.totalRevenue), 1);

  return (
    <article className="flex h-full min-h-0 flex-col overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-sm">
      <header className="flex items-center justify-between gap-2 border-b border-slate-100 px-3.5 py-2.5">
        <div>
          <h3 className="text-xs font-bold text-slate-900">Revenue by plan</h3>
          <p className="text-[10px] text-slate-500">Which plans drive collections</p>
        </div>
        <button
          type="button"
          onClick={onOpenPlans}
          className="rounded-lg border border-slate-200 px-2 py-1 text-[10px] font-semibold text-slate-600 hover:bg-slate-50"
        >
          Full report
        </button>
      </header>

      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        {!planRows.length ? (
          <p className="py-8 text-center text-xs text-slate-400">No plan revenue yet.</p>
        ) : (
          planRows.map((plan, index) => (
            <div key={plan.id} className="space-y-1 rounded-xl border border-slate-100 px-2.5 py-2">
              <div className="flex items-center justify-between gap-2 text-[11px]">
                <span className="min-w-0 truncate font-semibold text-slate-800">
                  <span className="mr-1.5 text-[10px] font-black text-emerald-600">#{index + 1}</span>
                  {plan.label}
                </span>
                <span className="shrink-0 font-black tabular-nums text-slate-950">
                  {formatINR(plan.totalRevenue)}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${Math.max(4, (plan.totalRevenue / max) * 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400">
                {plan.count} payments
                {plan.share != null && ` · ${plan.share}% share`}
                {plan.price > 0 && ` · list ${formatINR(plan.price)}`}
              </p>
            </div>
          ))
        )}
      </div>
    </article>
  );
}
