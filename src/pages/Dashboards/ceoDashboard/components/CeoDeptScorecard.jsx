const toneMap = {
  emerald: "border-emerald-200 bg-emerald-50/70 text-emerald-700",
  blue: "border-blue-200 bg-blue-50/70 text-blue-700",
  amber: "border-amber-200 bg-amber-50/70 text-amber-700",
  rose: "border-rose-200 bg-rose-50/70 text-rose-700",
  slate: "border-slate-200 bg-slate-50 text-slate-600",
};

export default function CeoDeptScorecard({ departments = [], onOpen }) {
  return (
    <section className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
      {departments.map((dept) => (
        <button
          key={dept.key}
          type="button"
          onClick={() => onOpen?.(dept.href)}
          className="rounded-[14px] border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50/30"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {dept.label}
            </p>
            <span
              className={`rounded-full border px-1.5 py-0.5 text-[9px] font-bold ${toneMap[dept.tone] || toneMap.slate}`}
            >
              {dept.status}
              {dept.score != null ? ` ${dept.score}` : ""}
            </span>
          </div>
          <p className="mt-2 text-lg font-black tabular-nums text-slate-950">{dept.metric}</p>
          <p className="mt-1 line-clamp-2 text-[10px] text-slate-500">{dept.detail}</p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full ${
                dept.tone === "rose"
                  ? "bg-rose-500"
                  : dept.tone === "amber"
                    ? "bg-amber-500"
                    : dept.tone === "blue"
                      ? "bg-blue-500"
                      : "bg-emerald-500"
              }`}
              style={{ width: `${Math.max(4, Number(dept.score) || 0)}%` }}
            />
          </div>
        </button>
      ))}
    </section>
  );
}
