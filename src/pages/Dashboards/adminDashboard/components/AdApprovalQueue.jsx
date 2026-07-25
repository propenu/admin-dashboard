import { ArrowRight } from "lucide-react";

const toneChip = {
  emerald: "bg-emerald-50 text-emerald-700",
  blue: "bg-blue-50 text-blue-700",
  amber: "bg-amber-50 text-amber-700",
  rose: "bg-rose-50 text-rose-700",
  violet: "bg-violet-50 text-violet-700",
};

export default function AdApprovalQueue({ items = [], onOpen }) {
  const actionable = items.filter((item) => Number(item.count) > 0);

  return (
    <article className="flex h-full min-h-0 flex-col overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-sm">
      <header className="border-b border-slate-100 px-3.5 py-2.5">
        <h3 className="text-xs font-bold text-slate-900">Approval & work queue</h3>
        <p className="text-[10px] text-slate-500">
          {actionable.length ? `${actionable.length} queues need attention` : "All clear — no backlog items"}
        </p>
      </header>
      <ul className="flex-1 divide-y divide-slate-100 overflow-y-auto">
        {items.map((item) => (
          <li key={item.key}>
            <button
              type="button"
              onClick={() => onOpen?.(item.href)}
              className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left transition hover:bg-emerald-50/50"
            >
              <span
                className={`min-w-9 rounded-lg px-2 py-1 text-center text-sm font-black tabular-nums ${toneChip[item.tone] || toneChip.blue}`}
              >
                {item.count}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-bold text-slate-900">{item.label}</p>
                <p className="truncate text-[10px] text-slate-500">{item.hint}</p>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-slate-300" />
            </button>
          </li>
        ))}
      </ul>
    </article>
  );
}
