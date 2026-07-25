import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Star, Trophy } from "lucide-react";

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

export default function CustomerCarePerformancePanel({ summary, performanceWeek, currentUserName }) {
  const chartData = performanceWeek.map((item) => ({
    day: String(item.day || item.label || item.name || "").slice(0, 3),
    resolved: Number(item.resolved || item.count || 0),
  }));

  const firstName = currentUserName?.split(" ")?.[0] || "there";
  const stars = Math.round(summary.csatScore || 0);
  const maxResolved = Math.max(...chartData.map((d) => d.resolved), 1);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:h-[120px] lg:grid-cols-[minmax(0,1.5fr)_minmax(140px,0.4fr)_minmax(220px,0.7fr)] xl:h-[128px]">
      <article className={`${cardClass} sm:col-span-2 lg:col-span-1 min-h-[120px] lg:min-h-0`}>
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="text-xs font-bold text-slate-900">Performance Snapshot</h3>
          <p className="text-[11px] text-slate-500">
            <span className="text-sm font-black text-slate-950">{summary.weeklyResolved}</span>
            {" resolved this week"}
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
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(34,197,94,0.08)" }} />
              <Bar dataKey="resolved" radius={[3, 3, 0, 0]} maxBarSize={22}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.resolved > 0 ? "#22c55e" : "#e2e8f0"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className={`${cardClass} items-center justify-center py-2 text-center min-h-[120px] lg:min-h-0`}>
        <p className="text-[10px] font-semibold text-slate-500">CSAT Score</p>
        <p className="mt-0.5 text-2xl font-black leading-none text-slate-950">
          {summary.csatResponses > 0 ? `${summary.csatScore}/5` : "—"}
        </p>
        <div className="mt-1 flex justify-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-3.5 w-3.5 ${
                summary.csatResponses > 0 && i < stars
                  ? "fill-amber-400 text-amber-400"
                  : "text-slate-200"
              }`}
            />
          ))}
        </div>
        <p className="mt-0.5 text-[10px] text-slate-400">
          {summary.csatResponses > 0 ? `${summary.csatResponses} responses` : "No CSAT data yet"}
        </p>
      </article>

      <article className={`${cardClass} flex-row items-center gap-2.5 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white py-2 min-h-[120px] lg:min-h-0 sm:col-span-2 lg:col-span-1`}>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm">
          <Trophy className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold leading-snug text-slate-900">Great going {firstName}!</p>
          <p className="mt-0.5 text-[11px] leading-snug text-slate-600">
            Above team average in first response time.
          </p>
        </div>
      </article>
    </div>
  );
}
