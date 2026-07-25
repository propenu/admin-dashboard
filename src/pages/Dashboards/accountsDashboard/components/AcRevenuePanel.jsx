import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatINR } from "../accountsDashboardData";

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] shadow-md">
      <p className="font-semibold text-slate-700">{label}</p>
      {payload.map((item) => (
        <p key={item.dataKey} style={{ color: item.color }}>
          {item.name}: {typeof item.value === "number" && item.dataKey !== "count" ? formatINR(item.value) : item.value}
        </p>
      ))}
    </div>
  );
};

export default function AcRevenuePanel({ trendRows = [], typeRows = [], revenueBridge = [] }) {
  return (
    <article className="flex h-full min-h-0 flex-col overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-sm">
      <header className="border-b border-slate-100 px-3.5 py-2.5">
        <h3 className="text-xs font-bold text-slate-900">Revenue overview</h3>
        <p className="text-[10px] text-slate-500">Daily collections and segment mix</p>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-y-auto p-3 lg:grid-cols-2">
        <div className="min-h-[160px]">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Daily collections
          </p>
          {trendRows.length ? (
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={trendRows} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={40} />
                <Tooltip content={<Tip />} />
                <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-10 text-center text-xs text-slate-400">No paid transactions in window.</p>
          )}
        </div>

        <div className="min-h-[160px]">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Revenue by customer type
          </p>
          {typeRows.length ? (
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={typeRows.slice(0, 5)} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                <XAxis dataKey="label" tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={36} />
                <Tooltip content={<Tip />} />
                <Bar dataKey="revenue" name="Revenue" radius={[4, 4, 0, 0]} maxBarSize={28}>
                  {typeRows.slice(0, 5).map((row, i) => (
                    <Cell key={row.key} fill={i === 0 ? "#10b981" : "#86efac"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-10 text-center text-xs text-slate-400">No segment mix yet.</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 lg:col-span-2 sm:grid-cols-4">
          {revenueBridge.map((item) => (
            <div
              key={item.key}
              className="rounded-xl border border-slate-100 bg-slate-50/80 px-2.5 py-2"
            >
              <p className="text-[10px] font-medium text-slate-500">{item.label}</p>
              <p className="mt-0.5 text-sm font-black tabular-nums text-slate-900">
                {formatINR(item.value)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}
