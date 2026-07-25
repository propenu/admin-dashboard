import { MapPinned } from "lucide-react";

export default function RmCityPanel({ cityRows = [], regionLabel }) {
  const top = cityRows.slice(0, 6);
  const total = top.reduce((sum, row) => sum + (row.total || 0), 0) || 1;

  return (
    <section className="flex h-full flex-col rounded-[14px] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-600">
            Coverage
          </p>
          <h2 className="text-sm font-black text-slate-950">City performance</h2>
          <p className="mt-0.5 text-[11px] text-slate-500">{regionLabel}</p>
        </div>
        <MapPinned className="h-5 w-5 text-emerald-600" />
      </div>

      <div className="flex flex-1 flex-col justify-center gap-3">
        {top.length ? (
          top.map((row) => {
            const share = Math.round(((row.total || 0) / total) * 100);
            return (
              <div key={row.city}>
                <div className="mb-1 flex items-center justify-between gap-2 text-[11px]">
                  <span className="font-semibold text-slate-800">{row.city}</span>
                  <span className="tabular-nums text-slate-500">
                    {row.total} · {share}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                    style={{ width: `${Math.max(6, row.pct || share)}%` }}
                  />
                </div>
                <p className="mt-1 text-[10px] text-slate-400">
                  {row.active} active · {row.pending} pending
                </p>
              </div>
            );
          })
        ) : (
          <p className="py-8 text-center text-xs text-slate-400">No city data yet</p>
        )}
      </div>
    </section>
  );
}
