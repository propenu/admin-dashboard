import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Bar,
  BarChart,
  Cell,
} from "recharts";
import { formatINR } from "../ceoDashboardData";

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] shadow-md">
      <p className="font-semibold text-slate-700">{label}</p>
      {payload.map((item) => (
        <p key={item.dataKey} style={{ color: item.color }}>
          {item.name}:{" "}
          {item.dataKey === "revenue" ? formatINR(item.value) : item.value}
        </p>
      ))}
    </div>
  );
};

export default function CeoGrowthPanel({
  revenueTrend = [],
  leadTrend = [],
  planRows = [],
  sourceRows = [],
  summary,
}) {
  return (
    <article className="flex h-full min-h-0 flex-col overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-sm">
      <header className="border-b border-slate-100 px-3.5 py-2.5">
        <h3 className="text-xs font-bold text-slate-900">Growth & monetisation</h3>
        <p className="text-[10px] text-slate-500">
          Period revenue {formatINR(summary?.periodRevenue || 0)} · leads {summary?.totalLeads || 0}
        </p>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-y-auto p-3 lg:grid-cols-2">
        <div className="min-h-[150px]">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Daily collections
          </p>
          {revenueTrend.length ? (
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={revenueTrend} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={40} />
                <Tooltip content={<Tip />} />
                <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-10 text-center text-xs text-slate-400">No collections in window.</p>
          )}
        </div>

        <div className="min-h-[150px]">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Lead vs conversion trend
          </p>
          {leadTrend.length ? (
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={leadTrend} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={28} allowDecimals={false} />
                <Tooltip content={<Tip />} />
                <Line type="monotone" dataKey="leads" name="Leads" stroke="#10b981" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="converted" name="Converted" stroke="#6366f1" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-10 text-center text-xs text-slate-400">No lead trend yet.</p>
          )}
        </div>

        <div className="min-h-[140px]">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Top plans
          </p>
          {planRows.length ? (
            <ResponsiveContainer width="100%" height={130}>
              <BarChart data={planRows} margin={{ top: 4, right: 4, left: -12, bottom: 0 }}>
                <XAxis dataKey="label" tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={36} />
                <Tooltip content={<Tip />} />
                <Bar dataKey="revenue" name="Revenue" radius={[4, 4, 0, 0]} maxBarSize={26}>
                  {planRows.map((row, i) => (
                    <Cell key={row.id} fill={i === 0 ? "#10b981" : "#86efac"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-8 text-center text-xs text-slate-400">No plan revenue.</p>
          )}
        </div>

        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Demand channels
          </p>
          {!sourceRows.length ? (
            <p className="py-8 text-center text-xs text-slate-400">No channel mix.</p>
          ) : (
            <ul className="space-y-1.5">
              {sourceRows.map((row) => {
                const max = Math.max(...sourceRows.map((r) => r.value), 1);
                return (
                  <li key={row.key} className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="font-semibold text-slate-700">{row.label}</span>
                      <span className="font-black tabular-nums text-slate-900">{row.value}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{ width: `${Math.max(4, (row.value / max) * 100)}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </article>
  );
}
