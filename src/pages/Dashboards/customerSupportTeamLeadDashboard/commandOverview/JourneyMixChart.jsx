const STAGE = {
  location: {
    color: "#f59e0b",
    soft: "bg-amber-50 text-amber-800 border-amber-100",
    dot: "bg-amber-400",
  },
  kyc: {
    color: "#34d399",
    soft: "bg-emerald-50 text-emerald-800 border-emerald-100",
    dot: "bg-emerald-400",
  },
  inventory: {
    color: "#059669",
    soft: "bg-emerald-100 text-emerald-900 border-emerald-200",
    dot: "bg-emerald-700",
  },
};

export default function JourneyMixChart({
  items = [],
  total = 0,
  rangeLabel,
  onItemClick,
}) {
  const rows = Array.isArray(items) ? items : [];
  const sum = total || rows.reduce((a, b) => a + Number(b.value || 0), 0);
  const clearCount = rows.filter((item) => Number(item.value || 0) === 0).length;
  const attentionCount = rows.filter((item) => Number(item.value || 0) > 0).length;
  const r = 42;
  const c = 2 * Math.PI * r;
  let offset = 0;

  const periodText = rangeLabel || "Selected period";

  if (!rows.length) {
    return (
      <div className="flex h-full min-h-[220px] flex-col items-center justify-center rounded-2xl border border-slate-200/80 bg-white p-4 text-center shadow-sm">
        <p className="text-sm font-bold text-slate-800">Journey Mix</p>
        <p className="mt-2 text-xs text-slate-400">No journey data for {periodText}</p>
      </div>
    );
  }

  return (
    <section
      className="flex h-full min-h-[220px] flex-col rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm"
      aria-label="Journey mix chart"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-sm font-black text-slate-950">Journey Mix</h3>
          <p className="mt-0.5 text-[11px] leading-snug text-slate-500">
            Open work by stage for{" "}
            <span className="font-semibold text-slate-700">{periodText}</span>
            . Updates when you change Today / 7D / 30D / All.
          </p>
        </div>
        <span
          className={`shrink-0 rounded-lg border px-2 py-1 text-[10px] font-bold ${
            sum === 0
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-amber-200 bg-amber-50 text-amber-800"
          }`}
        >
          {sum === 0 ? "All clear" : `${attentionCount} need attention`}
        </span>
      </div>

      <div className="relative mx-auto mt-3 grid h-[132px] w-[132px] place-items-center">
        <svg
          viewBox="0 0 120 120"
          className="h-full w-full -rotate-90 motion-safe:animate-[tlFadeUp_600ms_ease-out]"
          aria-hidden
        >
          <circle cx="60" cy="60" r={r} fill="none" stroke="#ecfdf5" strokeWidth="14" />
          {sum === 0 ? (
            <circle
              cx="60"
              cy="60"
              r={r}
              fill="none"
              stroke="#86efac"
              strokeWidth="14"
              strokeDasharray={c}
            />
          ) : (
            rows
              .filter((item) => Number(item.value || 0) > 0)
              .map((item) => {
                const value = Number(item.value || 0);
                const len = (value / sum) * c;
                const dash = `${len} ${c - len}`;
                const el = (
                  <circle
                    key={item.key}
                    cx="60"
                    cy="60"
                    r={r}
                    fill="none"
                    stroke={STAGE[item.key]?.color || "#059669"}
                    strokeWidth="14"
                    strokeDasharray={dash}
                    strokeDashoffset={-offset}
                    strokeLinecap="butt"
                  >
                    <title>
                      {item.label}: {value} ({item.percentage || 0}%)
                    </title>
                  </circle>
                );
                offset += len;
                return el;
              })
          )}
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="text-lg font-black tabular-nums text-slate-950">{sum}</p>
            <p className="text-[10px] font-semibold text-slate-400">
              {sum === 0 ? "Stuck cases" : "Open cases"}
            </p>
          </div>
        </div>
      </div>

      <p className="mt-1 text-center text-[10px] text-slate-400">
        {sum === 0
          ? `OK for ${periodText} — no stuck Location / KYC / Inventory`
          : `${clearCount} stage${clearCount === 1 ? "" : "s"} clear · click a row to open that list`}
      </p>

      <ul className="mt-2 space-y-1.5" aria-label="Journey mix by stage">
        {rows.map((item) => {
          const value = Number(item.value || 0);
          const isOk = value === 0 && item.okWhenZero;
          const tone = STAGE[item.key] || STAGE.inventory;
          return (
            <li key={item.key}>
              <button
                type="button"
                onClick={() => onItemClick?.(item)}
                className={`flex w-full items-start gap-2 rounded-xl border px-2.5 py-2 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                  isOk
                    ? "border-slate-100 bg-slate-50/80 hover:border-emerald-200 hover:bg-emerald-50/50"
                    : `${tone.soft} hover:brightness-[0.98]`
                }`}
              >
                <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${tone.dot}`} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-slate-900">
                      {item.shortLabel || item.label}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      {isOk ? (
                        <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-700">
                          OK
                        </span>
                      ) : (
                        <span className="rounded-md bg-white/80 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-700">
                          Needs work
                        </span>
                      )}
                      <span className="text-[12px] font-black tabular-nums text-slate-900">
                        {value}
                      </span>
                      <span className="text-[10px] font-semibold tabular-nums text-slate-400">
                        {item.percentage || 0}%
                      </span>
                    </span>
                  </span>
                  <span className="mt-0.5 block text-[10px] leading-snug text-slate-500">
                    {item.meaning ||
                      (isOk
                        ? "No open cases in this stage for the selected dates"
                        : "Open the filtered list for this period")}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
