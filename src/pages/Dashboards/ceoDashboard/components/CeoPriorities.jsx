import { ArrowRight } from "lucide-react";

const severityDot = {
  high: "bg-rose-500",
  medium: "bg-amber-500",
  opportunity: "bg-emerald-500",
};

export default function CeoPriorities({ priorities = [], onOpen }) {
  return (
    <article className="overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-sm">
      <header className="border-b border-slate-100 px-3.5 py-2.5">
        <h3 className="text-xs font-bold text-slate-900">Executive priorities</h3>
        <p className="text-[10px] text-slate-500">Ordered decision queue for the leadership team</p>
      </header>
      <ol className="divide-y divide-slate-100">
        {priorities.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onOpen?.(item.href)}
              className="flex w-full items-start gap-3 px-3.5 py-3 text-left transition hover:bg-emerald-50/50"
            >
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-slate-900 text-[11px] font-black text-white">
                {item.rank}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className={`h-1.5 w-1.5 rounded-full ${severityDot[item.severity] || "bg-slate-400"}`} />
                  <p className="truncate text-[12px] font-bold text-slate-900">{item.title}</p>
                </div>
                <p className="mt-0.5 text-[11px] text-slate-500">{item.why}</p>
                <p className="mt-1 text-[10px] font-semibold text-emerald-700">Owner: {item.owner}</p>
              </div>
              <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-slate-300" />
            </button>
          </li>
        ))}
      </ol>
    </article>
  );
}
