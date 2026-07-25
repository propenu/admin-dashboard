const toneBar = {
  emerald: "bg-emerald-500",
  blue: "bg-blue-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
  violet: "bg-violet-500",
};

export default function AdWorkstreams({ workstreams = [], onOpen }) {
  return (
    <section className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
      {workstreams.map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={() => onOpen?.(item.href)}
          className="rounded-[14px] border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50/30"
        >
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {item.label}
          </p>
          <p className="mt-2 text-lg font-black tabular-nums text-slate-950">{item.metric}</p>
          <p className="mt-1 line-clamp-2 text-[10px] text-slate-500">{item.detail}</p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full ${toneBar[item.tone] || toneBar.emerald}`}
              style={{ width: `${Math.max(4, Number(item.score) || 0)}%` }}
            />
          </div>
        </button>
      ))}
    </section>
  );
}
