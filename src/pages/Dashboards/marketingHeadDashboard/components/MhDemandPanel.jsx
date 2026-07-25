import { Building, Home } from "lucide-react";

export default function MhDemandPanel({ summary, topProjects = [] }) {
  const projects = summary?.projectCounts || {};
  const properties = summary?.propertyCounts || {};

  const cards = [
    { label: "Projects live", value: projects.active || 0, tone: "text-emerald-700" },
    { label: "Projects pending", value: projects.pending || 0, tone: "text-amber-700" },
    { label: "Listings total", value: properties.total || 0, tone: "text-slate-900" },
    { label: "Listings active", value: properties.active || 0, tone: "text-emerald-700" },
  ];

  return (
    <article className="flex h-full min-h-0 flex-col overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-sm">
      <header className="border-b border-slate-100 px-3.5 py-2.5">
        <h3 className="text-xs font-bold text-slate-900">Inventory demand support</h3>
        <p className="text-[10px] text-slate-500">
          Campaigns need live projects and listings behind them
        </p>
      </header>

      <div className="grid grid-cols-2 gap-2 p-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-slate-100 bg-slate-50/80 px-2.5 py-2"
          >
            <p className="text-[10px] font-medium text-slate-500">{card.label}</p>
            <p className={`mt-0.5 text-lg font-black tabular-nums ${card.tone}`}>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="min-h-0 flex-1 border-t border-slate-100 px-3 py-2.5">
        <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          <Building className="h-3.5 w-3.5 text-emerald-600" />
          Project status mix
        </p>
        {!topProjects.length ? (
          <p className="py-6 text-center text-xs text-slate-400">No project analytics for period.</p>
        ) : (
          <ul className="space-y-1.5 overflow-y-auto">
            {topProjects.map((row) => (
              <li
                key={row.label}
                className="flex items-center justify-between rounded-lg border border-slate-100 px-2 py-1.5 text-[11px]"
              >
                <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700">
                  <Home className="h-3 w-3 text-emerald-500" />
                  {row.label}
                </span>
                <span className="font-black tabular-nums text-slate-900">{row.value}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}
