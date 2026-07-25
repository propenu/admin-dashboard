export default function CeoFunnelPanel({ funnel = [], summary }) {
  const max = Math.max(...funnel.map((s) => Number(s.volume) || 0), 1);

  return (
    <article className="flex h-full min-h-0 flex-col overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-sm">
      <header className="border-b border-slate-100 px-3.5 py-2.5">
        <h3 className="text-xs font-bold text-slate-900">Value funnel</h3>
        <p className="text-[10px] text-slate-500">
          Lead → qualify {summary?.qualifyRate ?? "N/A"}% → book {summary?.convertRate ?? "N/A"}%
        </p>
      </header>
      <div className="flex-1 space-y-2.5 overflow-y-auto p-3">
        {!funnel.length ? (
          <p className="py-8 text-center text-xs text-slate-400">No funnel data.</p>
        ) : (
          funnel.map((stage, index) => (
            <div key={stage.key} className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-slate-700">{stage.label}</span>
                <span className="font-black tabular-nums text-slate-950">{stage.volume}</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                  style={{ width: `${Math.max(8, (stage.volume / max) * 100)}%` }}
                />
              </div>
              {index > 0 && (
                <p className="text-[10px] text-slate-400">
                  Stage conversion {stage.conversion ?? "N/A"}%
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </article>
  );
}
