import { ArrowDownRight } from "lucide-react";

export default function CtPipelinePanel({ pipeline = [], summary }) {
  const max = Math.max(...pipeline.map((s) => Number(s.volume) || 0), 1);

  return (
    <article className="flex h-full min-h-0 flex-col overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-sm">
      <header className="border-b border-slate-100 px-3.5 py-2.5">
        <h3 className="text-xs font-bold text-slate-900">Editorial pipeline</h3>
        <p className="text-[10px] text-slate-500">
          Library → draft → live → featured → engaged · publish{" "}
          {summary?.publishRate == null ? "N/A" : `${summary.publishRate}%`}
        </p>
      </header>

      <div className="flex-1 space-y-2.5 overflow-y-auto p-3">
        {!pipeline.length ? (
          <p className="py-8 text-center text-xs text-slate-400">No content yet.</p>
        ) : (
          pipeline.map((stage, index) => {
            const width = Math.max(10, Math.round((stage.volume / max) * 100));
            return (
              <div key={stage.key} className="space-y-1">
                <div className="flex items-center justify-between gap-2 text-[11px]">
                  <span className="font-semibold text-slate-700">{stage.label}</span>
                  <span className="font-black tabular-nums text-slate-950">{stage.volume}</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                    style={{ width: `${width}%` }}
                  />
                </div>
                {index > 0 && (
                  <p className="flex items-center gap-1 text-[10px] text-slate-400">
                    <ArrowDownRight className="h-3 w-3 text-rose-400" />
                    Conv {stage.conversionFromPrev ?? "N/A"}%
                    {stage.dropOff > 0 && (
                      <span className="text-rose-500"> · gap {stage.dropOff}</span>
                    )}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>
    </article>
  );
}
