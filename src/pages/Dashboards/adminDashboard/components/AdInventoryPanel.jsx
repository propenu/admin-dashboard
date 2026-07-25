import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Bar, BarChart, XAxis, YAxis } from "recharts";

const Tip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload || {};
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] shadow-md">
      <p className="font-semibold text-slate-700">{row.label || row.date}</p>
      <p className="text-emerald-600">{row.value ?? row.leads ?? payload[0].value}</p>
    </div>
  );
};

export default function AdInventoryPanel({
  propertyStatus = [],
  projectStatus = [],
  leadTrend = [],
  summary,
  onOpenProperties,
  onOpenProjects,
}) {
  const hasProps = propertyStatus.some((d) => d.value > 0);

  return (
    <article className="flex h-full min-h-0 flex-col overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-sm">
      <header className="flex items-center justify-between gap-2 border-b border-slate-100 px-3.5 py-2.5">
        <div>
          <h3 className="text-xs font-bold text-slate-900">Inventory health</h3>
          <p className="text-[10px] text-slate-500">
            {summary?.propertyCounts?.total || 0} listings · {summary?.propertyCounts?.views || 0} views
          </p>
        </div>
        <div className="flex gap-1.5">
          <button type="button" onClick={onOpenProjects} className="rounded-lg border border-slate-200 px-2 py-1 text-[10px] font-semibold text-slate-600 hover:bg-slate-50">
            Projects
          </button>
          <button type="button" onClick={onOpenProperties} className="rounded-lg border border-slate-200 px-2 py-1 text-[10px] font-semibold text-slate-600 hover:bg-slate-50">
            Properties
          </button>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 p-3 lg:grid-cols-2">
        <div className="min-h-[160px]">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Listing status
          </p>
          {hasProps ? (
            <>
              <ResponsiveContainer width="100%" height={130}>
                <PieChart>
                  <Pie data={propertyStatus} dataKey="value" nameKey="label" innerRadius={36} outerRadius={54} paddingAngle={2}>
                    {propertyStatus.map((entry) => (
                      <Cell key={entry.key} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<Tip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-3 text-[10px] font-semibold text-slate-500">
                {propertyStatus.map((d) => (
                  <span key={d.key} className="inline-flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full" style={{ background: d.fill }} />
                    {d.label} ({d.value})
                  </span>
                ))}
              </div>
            </>
          ) : (
            <p className="py-10 text-center text-xs text-slate-400">No listing stats.</p>
          )}
        </div>

        <div className="min-h-[160px]">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Lead trend
          </p>
          {leadTrend.length ? (
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={leadTrend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={28} allowDecimals={false} />
                <Tooltip content={<Tip />} />
                <Bar dataKey="leads" name="Leads" fill="#10b981" radius={[3, 3, 0, 0]} maxBarSize={18} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="space-y-2 pt-2">
              {projectStatus.map((row) => (
                <div key={row.key} className="flex items-center justify-between rounded-lg border border-slate-100 px-2.5 py-2 text-[11px]">
                  <span className="font-semibold text-slate-700">{row.label} projects</span>
                  <span className="font-black tabular-nums text-slate-900">{row.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
