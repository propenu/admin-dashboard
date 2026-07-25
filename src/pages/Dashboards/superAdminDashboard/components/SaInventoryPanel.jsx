import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const Tip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload || {};
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] shadow-md">
      <p className="font-semibold text-slate-700">{row.label}</p>
      <p style={{ color: row.fill }}>{row.value}</p>
    </div>
  );
};

function StatChip({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-white px-2 py-1.5">
      <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-0.5 text-sm font-black tabular-nums text-slate-900">{value}</p>
    </div>
  );
}

function InventoryBlock({
  title,
  total,
  active,
  pending,
  draft,
  views,
  onOpen,
  accent = "emerald",
}) {
  const accentMap = {
    emerald: "border-emerald-200 bg-emerald-50/60 hover:border-emerald-400 hover:bg-emerald-50",
    blue: "border-blue-200 bg-blue-50/60 hover:border-blue-400 hover:bg-blue-50",
  };

  return (
    <button
      type="button"
      onClick={onOpen}
      className={`rounded-xl border p-2.5 text-left transition ${accentMap[accent] || accentMap.emerald}`}
    >
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{title}</p>
        <p className="text-lg font-black tabular-nums leading-none text-slate-950">{total}</p>
      </div>
      <p className="mt-0.5 text-[10px] text-slate-500">
        In selected date range · click to open
        {views != null ? ` · ${views} views` : ""}
      </p>
      <div className="mt-2 grid grid-cols-3 gap-1.5">
        <StatChip label="Active" value={active} />
        <StatChip label="Pending" value={pending} />
        <StatChip label="Draft" value={draft} />
      </div>
    </button>
  );
}

function StatusDonut({ title, data = [], onOpen, emptyLabel }) {
  const hasData = data.some((d) => d.value > 0);
  const total = data.reduce((sum, d) => sum + (Number(d.value) || 0), 0);

  return (
    <button
      type="button"
      onClick={onOpen}
      className="rounded-xl border border-slate-100 bg-slate-50/50 p-2 text-left transition hover:border-emerald-300 hover:bg-emerald-50/40"
    >
      <div className="mb-1 flex items-center justify-between gap-2">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{title}</p>
        <p className="text-[10px] font-black tabular-nums text-slate-700">{total}</p>
      </div>
      {hasData ? (
        <ResponsiveContainer width="100%" height={110}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius={30}
              outerRadius={44}
              paddingAngle={2}
            >
              {data.map((entry) => (
                <Cell key={entry.key} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip content={<Tip />} />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <p className="py-8 text-center text-[11px] text-slate-400">{emptyLabel}</p>
      )}
      <div className="flex flex-wrap justify-center gap-x-2.5 gap-y-1 text-[10px] font-semibold text-slate-500">
        {data.map((d) => (
          <span key={d.key} className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full" style={{ background: d.fill }} />
            {d.label} ({d.value})
          </span>
        ))}
      </div>
    </button>
  );
}

export default function SaInventoryPanel({
  propertyStatus = [],
  projectStatus = [],
  summary,
  onOpenProperties,
  onOpenProjects,
}) {
  const projects = summary?.projectCounts || {};
  const props = summary?.propertyCounts || {};
  const projectTotal = projects.total || 0;
  const propertyTotal = props.total || 0;

  return (
    <article className="flex h-full min-h-0 flex-col overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-sm">
      <header className="flex items-center justify-between gap-2 border-b border-slate-100 px-3.5 py-2.5">
        <div>
          <h3 className="text-xs font-bold text-slate-900">Inventory & demand</h3>
          <p className="text-[10px] text-slate-500">
            {propertyTotal} properties · {projectTotal} projects · {summary?.listingViews || 0} views
          </p>
        </div>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={onOpenProjects}
            className="rounded-lg border border-blue-200 bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-700 hover:bg-blue-100"
          >
            Projects ({projectTotal})
          </button>
          <button
            type="button"
            onClick={onOpenProperties}
            className="rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700 hover:bg-emerald-100"
          >
            Properties ({propertyTotal})
          </button>
        </div>
      </header>

      <div className="grid gap-2 p-3 sm:grid-cols-2">
        <InventoryBlock
          title="Properties"
          total={propertyTotal}
          active={props.active || 0}
          pending={props.pending || 0}
          draft={props.draft || 0}
          views={summary?.listingViews || props.views || 0}
          onOpen={onOpenProperties}
          accent="emerald"
        />
        <InventoryBlock
          title="Projects"
          total={projectTotal}
          active={projects.active || 0}
          pending={projects.pending || 0}
          draft={projects.draft || 0}
          onOpen={onOpenProjects}
          accent="blue"
        />
      </div>

      <div className="grid flex-1 gap-2 px-3 pb-3 sm:grid-cols-2">
        <StatusDonut
          title="Properties status"
          data={propertyStatus}
          onOpen={onOpenProperties}
          emptyLabel="No property stats for this date range."
        />
        <StatusDonut
          title="Projects status"
          data={projectStatus}
          onOpen={onOpenProjects}
          emptyLabel="No project stats for this date range."
        />
      </div>
    </article>
  );
}
