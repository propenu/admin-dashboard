import { Building2, FolderKanban, Eye } from "lucide-react";

export default function CeoPortfolioPanel({ summary, categoryRows = [], onOpenProperties, onOpenProjects }) {
  const props = summary?.propertyCounts || {};
  const projects = summary?.projectCounts || {};

  return (
    <article className="flex h-full min-h-0 flex-col overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-sm">
      <header className="flex items-center justify-between gap-2 border-b border-slate-100 px-3.5 py-2.5">
        <div>
          <h3 className="text-xs font-bold text-slate-900">Market portfolio</h3>
          <p className="text-[10px] text-slate-500">Supply depth supporting demand</p>
        </div>
        <div className="flex gap-1.5">
          <button type="button" onClick={onOpenProjects} className="rounded-lg border border-slate-200 px-2 py-1 text-[10px] font-semibold text-slate-600 hover:bg-slate-50">
            Projects
          </button>
          <button type="button" onClick={onOpenProperties} className="rounded-lg border border-slate-200 px-2 py-1 text-[10px] font-semibold text-slate-600 hover:bg-slate-50">
            Listings
          </button>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-2 p-3">
        <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-2.5 py-2">
          <p className="flex items-center gap-1 text-[10px] text-slate-500">
            <FolderKanban className="h-3 w-3 text-emerald-600" /> Projects
          </p>
          <p className="mt-1 text-lg font-black tabular-nums text-slate-900">{projects.total || 0}</p>
          <p className="text-[10px] text-emerald-700">{projects.active || 0} live</p>
        </div>
        <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-2.5 py-2">
          <p className="flex items-center gap-1 text-[10px] text-slate-500">
            <Building2 className="h-3 w-3 text-emerald-600" /> Listings
          </p>
          <p className="mt-1 text-lg font-black tabular-nums text-slate-900">{props.total || 0}</p>
          <p className="text-[10px] text-emerald-700">{props.active || 0} active</p>
        </div>
        <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-2.5 py-2">
          <p className="flex items-center gap-1 text-[10px] text-slate-500">
            <Eye className="h-3 w-3 text-emerald-600" /> Views
          </p>
          <p className="mt-1 text-lg font-black tabular-nums text-slate-900">{props.views || 0}</p>
          <p className="text-[10px] text-amber-700">{props.pending || 0} pending</p>
        </div>
      </div>

      <div className="min-h-0 flex-1 border-t border-slate-100 px-3 py-2.5">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Demand by property type
        </p>
        {!categoryRows.length ? (
          <p className="py-6 text-center text-xs text-slate-400">No category demand yet.</p>
        ) : (
          <ul className="space-y-1.5">
            {categoryRows.map((row) => {
              const max = Math.max(...categoryRows.map((r) => r.value), 1);
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
    </article>
  );
}
