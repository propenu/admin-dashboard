import { Building2, ChevronRight } from "lucide-react";

export default function RmInventoryPanel({
  summary,
  statusRows = [],
  inventoryRows = [],
  onOpenProperties,
  onOpenProjects,
}) {
  return (
    <section className="flex h-full flex-col rounded-[14px] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-600">
            Inventory
          </p>
          <h2 className="text-sm font-black text-slate-950">Regional listing pulse</h2>
          <p className="mt-0.5 text-[11px] text-slate-500">
            {summary?.totalListings || 0} total · {summary?.activeListings || 0} live ·{" "}
            {summary?.pendingCount || 0} pending
          </p>
        </div>
        <Building2 className="h-5 w-5 text-emerald-600" />
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          { label: "Active", value: summary?.activeListings || 0, tone: "text-emerald-700 bg-emerald-50" },
          { label: "Pending", value: summary?.pendingCount || 0, tone: "text-amber-700 bg-amber-50" },
          { label: "Draft", value: summary?.draftCount || 0, tone: "text-slate-600 bg-slate-50" },
          { label: "Views", value: summary?.totalViews || 0, tone: "text-blue-700 bg-blue-50" },
        ].map((item) => (
          <div key={item.label} className={`rounded-xl px-2.5 py-2 ${item.tone}`}>
            <p className="text-[9px] font-bold uppercase tracking-wider opacity-70">{item.label}</p>
            <p className="mt-0.5 text-base font-black tabular-nums">
              {Number(item.value).toLocaleString("en-IN")}
            </p>
          </div>
        ))}
      </div>

      {statusRows.length > 0 ? (
        <div className="mb-3 space-y-1.5">
          {statusRows.slice(0, 4).map((row) => {
            const max = statusRows[0]?.total || 1;
            const width = Math.max(8, Math.round((row.total / max) * 100));
            return (
              <div key={row.status}>
                <div className="mb-0.5 flex justify-between text-[10px] font-semibold text-slate-500">
                  <span>{row.label}</span>
                  <span>{row.total.toLocaleString("en-IN")}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      <div className="min-h-0 flex-1 overflow-auto">
        <table className="w-full text-left text-[11px]">
          <thead className="sticky top-0 bg-white text-[9px] uppercase tracking-wider text-slate-400">
            <tr>
              <th className="pb-2 font-bold">Area</th>
              <th className="pb-2 font-bold">Total</th>
              <th className="pb-2 font-bold">Active</th>
              <th className="pb-2 font-bold">Pending</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {inventoryRows.slice(0, 8).map((row) => (
              <tr key={row.key} className="text-slate-700">
                <td className="py-1.5 font-semibold text-slate-900">{row.label}</td>
                <td className="py-1.5 tabular-nums">{row.total}</td>
                <td className="py-1.5 tabular-nums text-emerald-700">{row.active}</td>
                <td className="py-1.5 tabular-nums text-amber-700">{row.pending}</td>
              </tr>
            ))}
            {!inventoryRows.length ? (
              <tr>
                <td colSpan={4} className="py-6 text-center text-slate-400">
                  No inventory rows for this filter
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
        <button
          type="button"
          onClick={onOpenProperties}
          className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-emerald-700"
        >
          Properties <ChevronRight className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={onOpenProjects}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
        >
          Projects <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </section>
  );
}
