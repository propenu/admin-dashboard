import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Bar, BarChart, XAxis, YAxis } from "recharts";
import { formatINR } from "../superAdminDashboardData";
import { saSurface } from "../dashboardSurface";

const Tip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload || {};
  return (
    <div className="rounded-xl border border-emerald-100 bg-white px-2.5 py-1.5 text-[11px] shadow-[0_8px_24px_rgba(16,185,129,0.12)]">
      <p className="font-semibold text-[#0f3d2e]">{row.name || row.displayName || row.label}</p>
      <p className="text-emerald-600">
        {row.revenue != null ? formatINR(row.revenue) : row.value}
      </p>
    </div>
  );
};

export default function SaFinancePanel({ paymentDonut = [], planRows = [], summary, onOpenPayments, onOpenPlans, isLoading = false }) {
  const hasDonut = paymentDonut.some((d) => d.value > 0);

  return (
    <article
      className={`flex h-full min-h-0 flex-col overflow-hidden rounded-2xl ${saSurface}`}
      aria-busy={isLoading || undefined}
    >
      <header className="flex items-center justify-between gap-2 border-b border-emerald-50 px-3.5 py-2.5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-emerald-600">Finance</p>
          <h3 className="text-xs font-semibold text-[#0f3d2e]">Finance pulse</h3>
          <p className="text-[10px] text-[#5c7d6d]">
            Collections health · success{" "}
            {summary?.paymentSuccess == null ? "N/A" : `${summary.paymentSuccess}%`}
          </p>
        </div>
        <div className="flex gap-1.5">
          <button type="button" onClick={onOpenPayments} className="rounded-full border border-emerald-100 px-2 py-1 text-[10px] font-semibold text-[#0f3d2e] hover:bg-emerald-50">
            Payments
          </button>
          <button type="button" onClick={onOpenPlans} className="rounded-full border border-emerald-100 px-2 py-1 text-[10px] font-semibold text-[#0f3d2e] hover:bg-emerald-50">
            Plans
          </button>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 p-3 lg:grid-cols-2">
        <div className="min-h-[180px]">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.08em] text-emerald-600">Payment status</p>
          {isLoading && !hasDonut ? (
            <div className="h-40 animate-pulse rounded-xl bg-emerald-50/60" aria-label="Loading payments" />
          ) : hasDonut ? (
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
            <p className="py-12 text-center text-xs text-[#5c7d6d]">No payment attempts for this date range.</p>
          )}
          <div className="flex justify-center gap-4 text-[10px] font-semibold text-[#5c7d6d]">
            {paymentDonut.map((d) => (
              <span key={d.name} className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: d.fill }} />
                {d.name} ({d.value})
              </span>
            ))}
          </div>
        </div>

        <div className="min-h-[180px]">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.08em] text-emerald-600">Revenue by plan</p>
          {isLoading && !planRows.length ? (
            <div className="h-40 animate-pulse rounded-xl bg-emerald-50/60" aria-label="Loading plan revenue" />
          ) : planRows.length ? (
            <ResponsiveContainer width="100%" height={170}>
              <BarChart data={planRows.slice(0, 5)} margin={{ top: 4, right: 4, left: -8, bottom: 20 }}>
                <XAxis dataKey="label" tick={{ fontSize: 9, fill: "#5c7d6d" }} axisLine={false} tickLine={false} interval={0} angle={-15} textAnchor="end" height={40} />
                <YAxis tick={{ fontSize: 9, fill: "#5c7d6d" }} axisLine={false} tickLine={false} width={40} />
                <Tooltip content={<Tip />} />
                <Bar dataKey="revenue" name="Revenue" fill="#27AE60" radius={[4, 4, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-12 text-center text-xs text-[#5c7d6d]">No plan revenue for this date range.</p>
          )}
        </div>
      </div>
    </article>
  );
}
