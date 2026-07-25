import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowRight, Headphones, ShieldCheck } from "lucide-react";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] shadow-md">
      <p className="font-semibold text-slate-700">{label}</p>
      <p className="text-emerald-600">Resolved: {payload[0]?.value ?? 0}</p>
    </div>
  );
};

const cardClass =
  "flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-[14px] border border-slate-200 bg-white px-3 py-2.5 shadow-sm";

export default function CshInsightsPanel({ summary, performanceWeek, onNavigate }) {
  const chartData = (performanceWeek || []).map((item) => ({
    day: String(item.day || "").slice(0, 3),
    resolved: Number(item.resolved || 0),
  }));
  const maxResolved = Math.max(...chartData.map((d) => d.resolved), 1);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:h-[128px] lg:grid-cols-[minmax(0,1.6fr)_minmax(200px,0.7fr)_minmax(220px,0.8fr)]">
      <article className={`${cardClass} sm:col-span-2 lg:col-span-1 min-h-[120px] lg:min-h-0`}>
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="text-xs font-bold text-slate-900">Department resolved (7 days)</h3>
          <p className="text-[11px] text-slate-500">
            <span className="text-sm font-black text-slate-950">{summary.weeklyResolved}</span>
            {" closed this week"}
          </p>
        </div>
        <div className="mt-0.5 min-h-[52px] w-full flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 2, right: 4, left: -30, bottom: -4 }}>
              <XAxis dataKey="day" tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 9, fill: "#94a3b8" }}
                allowDecimals={false}
                domain={[0, maxResolved]}
                axisLine={false}
                tickLine={false}
                width={24}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(16,185,129,0.08)" }} />
              <Bar dataKey="resolved" radius={[3, 3, 0, 0]} maxBarSize={22}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.resolved > 0 ? "#10b981" : "#e2e8f0"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className={`${cardClass} justify-center min-h-[120px] lg:min-h-0`}>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Leadership focus
          </p>
        </div>
        <p className="mt-2 text-sm font-bold leading-snug text-slate-900">
          Clear unassigned & SLA-risk tickets first
        </p>
        <p className="mt-1 text-[11px] leading-snug text-slate-500">
          {summary.unassignedCount} waiting assignment · {summary.overdueCount} past due
        </p>
      </article>

      <article className={`${cardClass} flex-row items-center gap-2.5 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white min-h-[120px] lg:min-h-0 sm:col-span-2 lg:col-span-1`}>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm">
          <Headphones className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold leading-snug text-slate-900">Run the ticket desk</p>
          <p className="mt-0.5 text-[11px] leading-snug text-slate-600">
            Full queue, categories & department tools
          </p>
        </div>
        <button
          type="button"
          onClick={() => onNavigate?.("/tickets")}
          className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-2 text-[11px] font-bold text-white hover:bg-emerald-700"
        >
          Open
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </article>
    </div>
  );
}
