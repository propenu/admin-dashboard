const toneMap = {
  emerald: "border-emerald-200 bg-emerald-50/70 text-emerald-700",
  amber: "border-amber-200 bg-amber-50/70 text-amber-700",
  rose: "border-rose-200 bg-rose-50/70 text-rose-700",
  slate: "border-slate-200 bg-slate-50 text-slate-600",
};

export default function SaDomainHealth({ domains = [], onOpen }) {
  return (
    <section className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
      {domains.map((domain) => {
        const hasNavItems = Array.isArray(domain.navItems) && domain.navItems.length > 0;

        if (hasNavItems) {
          return (
            <article
              key={domain.key}
              className="rounded-[14px] border border-slate-200 bg-white p-3 text-left shadow-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {domain.label}
                </p>
                <span
                  className={`rounded-full border px-1.5 py-0.5 text-[9px] font-bold ${toneMap[domain.tone] || toneMap.slate}`}
                >
                  {domain.status || "N/A"}
                  {domain.score != null ? ` ${domain.score}%` : ""}
                </span>
              </div>

              <div className="mt-2 grid grid-cols-2 gap-1.5">
                {domain.navItems.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    title={item.hint || item.label}
                    onClick={() => onOpen?.(item.href)}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-left transition hover:border-emerald-300 hover:bg-emerald-50"
                  >
                    <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                      {item.label}
                    </p>
                    <p className="mt-0.5 text-base font-black tabular-nums leading-none text-slate-950">
                      {item.value}
                    </p>
                    {item.hint ? (
                      <p className="mt-0.5 truncate text-[9px] text-slate-500">{item.hint}</p>
                    ) : null}
                  </button>
                ))}
              </div>

              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${
                    domain.tone === "rose"
                      ? "bg-rose-500"
                      : domain.tone === "amber"
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                  }`}
                  style={{ width: `${Math.max(4, Number(domain.score) || 0)}%` }}
                />
              </div>
            </article>
          );
        }

        return (
          <button
            key={domain.key}
            type="button"
            onClick={() => onOpen?.(domain.href)}
            className="rounded-[14px] border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50/30"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {domain.label}
              </p>
              <span
                className={`rounded-full border px-1.5 py-0.5 text-[9px] font-bold ${toneMap[domain.tone] || toneMap.slate}`}
              >
                {domain.status || "N/A"}
                {domain.score != null ? ` ${domain.score}%` : ""}
              </span>
            </div>
            <p className="mt-2 text-lg font-black tabular-nums text-slate-950">{domain.metric}</p>
            <p className="mt-1 line-clamp-2 text-[10px] text-slate-500">{domain.detail}</p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full ${
                  domain.tone === "rose"
                    ? "bg-rose-500"
                    : domain.tone === "amber"
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                }`}
                style={{ width: `${Math.max(4, Number(domain.score) || 0)}%` }}
              />
            </div>
          </button>
        );
      })}
    </section>
  );
}
