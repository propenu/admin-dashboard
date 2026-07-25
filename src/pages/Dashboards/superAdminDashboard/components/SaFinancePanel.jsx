import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Bar, BarChart, XAxis, YAxis } from "recharts";
import { formatINR } from "../superAdminDashboardData";

const Tip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload || {};
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] shadow-md">
      <p className="font-semibold text-slate-700">{row.name || row.displayName || row.label}</p>
      <p className="text-emerald-600">
        {row.revenue != null ? formatINR(row.revenue) : row.value}
      </p>
    </div>
  );
};

export default function SaFinancePanel({ paymentDonut = [], planRows = [], summary, onOpenPayments, onOpenPlans }) {
  const hasDonut = paymentDonut.some((d) => d.value > 0);

  return (
    <article className="flex h-full min-h-0 flex-col overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-sm">
      <header className="flex items-center justify-between gap-2 border-b border-slate-100 px-3.5 py-2.5">
        <div>
          <h3 className="text-xs font-bold text-slate-900">Finance pulse</h3>
          <p className="text-[10px] text-slate-500">
            Collections health · success{" "}
            {summary?.paymentSuccess == null ? "N/A" : `${summary.paymentSuccess}%`}
          </p>
        </div>
        <div className="flex gap-1.5">
          <button type="button" onClick={onOpenPayments} className="rounded-lg border border-slate-200 px-2 py-1 text-[10px] font-semibold text-slate-600 hover:bg-slate-50">
            Payments
          </button>
          <button type="button" onClick={onOpenPlans} className="rounded-lg border border-slate-200 px-2 py-1 text-[10px] font-semibold text-slate-600 hover:bg-slate-50">
            Plans
          </button>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 p-3 lg:grid-cols-2">
        <div className="min-h-[180px]">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Payment status</p>
          {hasDonut ? (
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={paymentDonut} dataKey="value" innerRadius={42} outerRadius={62} paddingAngle={3}>
                  {paymentDonut.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<Tip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-12 text-center text-xs text-slate-400">No payment attempts for this date range.</p>
          )}
          <div className="flex justify-center gap-4 text-[10px] font-semibold text-slate-500">
            {paymentDonut.map((d) => (
              <span key={d.name} className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: d.fill }} />
                {d.name} ({d.value})
              </span>
            ))}
          </div>
        </div>

        <div className="min-h-[180px]">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Revenue by plan</p>
          {planRows.length ? (
            <ResponsiveContainer width="100%" height={170}>
              <BarChart data={planRows.slice(0, 5)} margin={{ top: 4, right: 4, left: -8, bottom: 20 }}>
                <XAxis dataKey="label" tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} interval={0} angle={-15} textAnchor="end" height={40} />
                <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={40} />
                <Tooltip content={<Tip />} />
                <Bar dataKey="revenue" name="Revenue" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-12 text-center text-xs text-slate-400">No plan revenue for this date range.</p>
          )}
        </div>
      </div>
    </article>
  );
}
