import { formatINR, formatRelativeClock, titleCase } from "../accountsDashboardData";

const statusTone = {
  paid: "bg-emerald-50 text-emerald-700",
  success: "bg-emerald-50 text-emerald-700",
  failed: "bg-rose-50 text-rose-700",
  pending: "bg-amber-50 text-amber-700",
  active: "bg-emerald-50 text-emerald-700",
  expired: "bg-slate-100 text-slate-600",
  cancelled: "bg-rose-50 text-rose-700",
};

export default function AcPaymentsPanel({ payments = [], onOpenPayments }) {
  return (
    <article className="flex h-full min-h-0 flex-col overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-sm">
      <header className="flex items-center justify-between gap-2 border-b border-slate-100 px-3.5 py-2.5">
        <div>
          <h3 className="text-xs font-bold text-slate-900">Recent payments</h3>
          <p className="text-[10px] text-slate-500">Latest paid and failed transactions</p>
        </div>
        <button
          type="button"
          onClick={onOpenPayments}
          className="rounded-lg border border-slate-200 px-2 py-1 text-[10px] font-semibold text-slate-600 hover:bg-slate-50"
        >
          All payments
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-auto">
        {!payments.length ? (
          <p className="px-3 py-10 text-center text-xs text-slate-400">No payment activity yet.</p>
        ) : (
          <table className="w-full min-w-[680px] text-left text-[11px]">
            <thead className="sticky top-0 bg-emerald-50/90 text-[10px] uppercase tracking-wider text-slate-500 backdrop-blur">
              <tr>
                <th className="px-3 py-2 font-bold">Customer</th>
                <th className="px-3 py-2 font-bold">Plan</th>
                <th className="px-3 py-2 font-bold">Type</th>
                <th className="px-3 py-2 font-bold">Status</th>
                <th className="px-3 py-2 font-bold tabular-nums">Amount</th>
                <th className="px-3 py-2 font-bold">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.map((row) => (
                <tr key={row.id} className="hover:bg-emerald-50/40">
                  <td className="max-w-[160px] truncate px-3 py-2.5 font-semibold text-slate-800">
                    {row.customer}
                  </td>
                  <td className="max-w-[140px] truncate px-3 py-2.5 text-slate-600">{row.plan}</td>
                  <td className="px-3 py-2.5 text-slate-600">{row.userType}</td>
                  <td className="px-3 py-2.5">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${statusTone[row.status] || "bg-slate-100 text-slate-600"}`}
                    >
                      {titleCase(row.status)}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 font-black tabular-nums text-slate-900">
                    {formatINR(row.amount)}
                  </td>
                  <td className="px-3 py-2.5 text-slate-500">
                    {formatRelativeClock(row.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </article>
  );
}
