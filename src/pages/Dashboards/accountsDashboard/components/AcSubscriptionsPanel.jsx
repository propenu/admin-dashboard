import { formatINR, formatRelativeClock, titleCase } from "../accountsDashboardData";

export default function AcSubscriptionsPanel({ subRows = [], onOpenSubscriptions }) {
  return (
    <article className="flex h-full min-h-0 flex-col overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-sm">
      <header className="flex items-center justify-between gap-2 border-b border-slate-100 px-3.5 py-2.5">
        <div>
          <h3 className="text-xs font-bold text-slate-900">Active subscriptions</h3>
          <p className="text-[10px] text-slate-500">Current billed accounts</p>
        </div>
        <button
          type="button"
          onClick={onOpenSubscriptions}
          className="rounded-lg border border-slate-200 px-2 py-1 text-[10px] font-semibold text-slate-600 hover:bg-slate-50"
        >
          Manage
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-auto">
        {!subRows.length ? (
          <p className="px-3 py-10 text-center text-xs text-slate-400">No active subscriptions.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {subRows.map((row) => (
              <li key={row.id} className="flex items-start justify-between gap-2 px-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-[11px] font-bold text-slate-800">{row.customer}</p>
                  <p className="mt-0.5 truncate text-[10px] text-slate-500">
                    {row.plan}
                    {row.endDate && ` · ends ${formatRelativeClock(row.endDate)}`}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[11px] font-black tabular-nums text-slate-900">
                    {row.amount > 0 ? formatINR(row.amount) : "—"}
                  </p>
                  <span className="mt-0.5 inline-block rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700">
                    {titleCase(row.status)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}
