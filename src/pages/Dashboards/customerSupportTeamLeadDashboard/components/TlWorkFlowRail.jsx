const STEPS = [
  { n: "1", title: "New case", desc: "User / listing in" },
  { n: "2", title: "Auto-assign", desc: "Territory / RR" },
  { n: "3", title: "CCE works", desc: "A → P → Done" },
  { n: "4", title: "Team Lead", desc: "Monitor · assign" },
  { n: "5", title: "Support Head", desc: "Head report" },
];

export default function TlWorkFlowRail() {
  return (
    <section className="rounded-[14px] border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
          Live operating flow
        </p>
        <p className="text-[10px] font-medium text-slate-400">Scales to N CCE / RM</p>
      </div>
      <ol className="grid grid-cols-1 gap-1.5 sm:grid-cols-5">
        {STEPS.map((step, index) => (
          <li
            key={step.n}
            className="relative flex items-center gap-2 rounded-[10px] border border-slate-100 bg-slate-50/80 px-2.5 py-2"
          >
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-600 text-[10px] font-black text-white">
              {step.n}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[11px] font-bold text-slate-900">{step.title}</p>
              <p className="truncate text-[9px] text-slate-500">{step.desc}</p>
            </div>
            {index < STEPS.length - 1 ? (
              <span className="absolute -right-1 top-1/2 hidden h-px w-2 -translate-y-1/2 bg-emerald-300 sm:block" />
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}
