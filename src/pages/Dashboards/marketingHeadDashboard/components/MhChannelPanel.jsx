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

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] shadow-md">
      <p className="font-semibold text-slate-700">{label}</p>
      {payload.map((item) => (
        <p key={item.dataKey} style={{ color: item.color }}>
          {item.name}: {item.value}
        </p>
      ))}
    </div>
  );
};

export default function MhChannelPanel({ channelRows = [], categoryRows = [], trendRows = [] }) {
  const channels = channelRows.slice(0, 6);
  const maxChannel = Math.max(...channels.map((c) => c.leads), 1);

  return (
    <article className="flex h-full min-h-0 flex-col overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-sm">
      <header className="border-b border-slate-100 px-3.5 py-2.5">
        <h3 className="text-xs font-bold text-slate-900">Channel & demand mix</h3>
        <p className="text-[10px] text-slate-500">
          Where leads come from and which property categories they want
        </p>
      </header>

      <div className="grid flex-1 grid-cols-1 gap-3 overflow-y-auto p-3 lg:grid-cols-2">
        <div className="min-h-[160px]">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Lead trend (14d)
          </p>
          {trendRows.length ? (
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={trendRows} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} width={28} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="leads" name="Leads" stroke="#10b981" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="converted" name="Converted" stroke="#6366f1" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-10 text-center text-xs text-slate-400">No daily trend yet.</p>
          )}
        </div>

        <div className="min-h-[160px]">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Category demand
          </p>
          {categoryRows.length ? (
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={categoryRows.slice(0, 5)} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <XAxis dataKey="label" tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} width={24} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="leads" name="Leads" radius={[4, 4, 0, 0]} maxBarSize={28}>
                  {categoryRows.slice(0, 5).map((row, index) => (
                    <Cell key={row.key} fill={index === 0 ? "#10b981" : "#86efac"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-10 text-center text-xs text-slate-400">No category mix.</p>
          )}
        </div>

        <div className="space-y-2 lg:col-span-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Source contribution
          </p>
          {!channels.length ? (
            <p className="py-4 text-center text-xs text-slate-400">No channel data.</p>
          ) : (
            channels.map((channel) => (
              <div key={channel.key} className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-700">{channel.label}</span>
                  <span className="tabular-nums text-slate-500">
                    <strong className="text-slate-900">{channel.leads}</strong>
                    {channel.share != null && ` · ${channel.share}%`}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${Math.max(4, (channel.leads / maxChannel) * 100)}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </article>
  );
}
