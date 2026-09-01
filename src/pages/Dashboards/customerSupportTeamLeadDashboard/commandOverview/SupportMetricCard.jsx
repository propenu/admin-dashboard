import MetricSparkline from "./MetricSparkline";

const fmt = (v) => Number(v || 0).toLocaleString("en-IN");

/** Icon chip colors — Lead Management pattern */
const ICON_BG = {
  emerald: "bg-emerald-500",
  violet: "bg-violet-500",
  blue: "bg-blue-500",
  amber: "bg-amber-500",
  orange: "bg-orange-500",
  sky: "bg-sky-500",
  teal: "bg-teal-500",
};

/**
 * @param {"default" | "comfortable" | "lead"} [size]
 * lead = Lead Management mobile card (title · value · note · colored icon)
 */
export default function SupportMetricCard({
  label,
  value,
  icon: Icon,
  spark = [],
  tone = "emerald",
  hint,
  onClick,
  loading,
  size = "default",
  active = false,
  accent = "emerald",
}) {
  const alert = tone === "orange" && Number(value) > 0;
  const valueClass = alert ? "text-orange-600" : "text-slate-950";
  const iconWrap = alert
    ? "bg-orange-50 text-orange-600 ring-1 ring-orange-100"
    : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100";
  const cozy = size === "comfortable";
  const lead = size === "lead";
  const chip = ICON_BG[accent] || ICON_BG.emerald;

  if (loading) {
    if (lead) {
      return (
        <div className="animate-pulse rounded-xl border border-slate-100 bg-white px-3 py-3 shadow-sm">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-2.5 w-16 rounded bg-slate-100" />
              <div className="h-6 w-10 rounded bg-slate-100" />
              <div className="h-2 w-20 rounded bg-slate-100" />
            </div>
            <div className="h-8 w-8 rounded-lg bg-slate-100" />
          </div>
        </div>
      );
    }
    if (cozy) {
      return (
        <div className="flex min-h-[5.25rem] animate-pulse items-center gap-3 rounded-2xl border border-slate-200/80 bg-white px-3.5 py-3.5 shadow-sm">
          <div className="h-11 w-11 shrink-0 rounded-2xl bg-slate-100" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-3 w-20 rounded bg-slate-100" />
            <div className="h-2.5 w-14 rounded bg-slate-100" />
          </div>
          <div className="h-8 w-10 rounded bg-slate-100" />
        </div>
      );
    }
    return (
      <div className="min-w-0 animate-pulse rounded-xl border border-slate-200/80 bg-white p-2 shadow-sm">
        <div className="mb-2 h-6 w-6 rounded-lg bg-slate-100" />
        <div className="mb-1 h-2.5 w-10 rounded bg-slate-100" />
        <div className="h-5 w-8 rounded bg-slate-100" />
      </div>
    );
  }

  /* Lead Management mobile card pattern */
  if (lead) {
    return (
      <button
        type="button"
        title={hint || label}
        onClick={onClick}
        className={`rounded-xl border bg-white px-3 py-3 text-left shadow-sm transition duration-200 hover:border-emerald-300 active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
          active
            ? "border-emerald-400 ring-2 ring-emerald-100"
            : alert
              ? "border-orange-300 ring-2 ring-orange-100"
              : "border-slate-100"
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 sm:text-[10px]">
              {label}
            </p>
            <p
              className={`mt-1 text-xl font-bold leading-6 tabular-nums tracking-tight sm:text-2xl ${valueClass}`}
            >
              {fmt(value)}
            </p>
            <p
              className={`mt-0.5 truncate text-[9px] sm:text-[10px] ${
                alert ? "font-bold uppercase tracking-wide text-orange-600" : "text-slate-400"
              }`}
              title={hint}
            >
              {alert ? "Needs attention" : hint || "Live period"}
            </p>
          </div>
          <span className={`shrink-0 rounded-lg p-2 text-white ${chip}`}>
            {Icon ? <Icon className="h-3.5 w-3.5" strokeWidth={2.4} aria-hidden /> : null}
          </span>
        </div>
      </button>
    );
  }

  if (cozy) {
    return (
      <button
        type="button"
        title={hint || label}
        onClick={onClick}
        className="group flex min-h-[5.25rem] w-full min-w-0 items-center gap-3 rounded-2xl border border-slate-200/90 bg-white px-3.5 py-3.5 text-left shadow-sm transition duration-200 hover:border-emerald-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 active:scale-[0.985]"
      >
        <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${iconWrap}`}>
          {Icon ? <Icon size={20} strokeWidth={2.25} aria-hidden /> : null}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-bold leading-snug text-slate-700">{label}</p>
          <p
            className={`mt-1 truncate text-[11px] font-semibold leading-none ${
              alert ? "uppercase tracking-wide text-orange-600" : "text-slate-400"
            }`}
          >
            {alert ? "Needs attention" : "Live period"}
          </p>
        </div>
        <p
          className={`shrink-0 text-[1.85rem] font-black leading-none tabular-nums tracking-tight ${valueClass}`}
        >
          {fmt(value)}
        </p>
      </button>
    );
  }

  return (
    <button
      type="button"
      title={hint || label}
      onClick={onClick}
      className="group flex h-full min-w-0 w-full flex-col rounded-xl border border-slate-200/80 bg-white p-2 text-left shadow-sm transition duration-200 hover:border-emerald-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 sm:p-2.5"
    >
      <div className="flex items-center justify-between gap-1">
        <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-lg ${iconWrap}`}>
          {Icon ? <Icon size={12} aria-hidden /> : null}
        </span>
        <span className="hidden min-[1100px]:block">
          <MetricSparkline points={spark} tone={tone} compact />
        </span>
      </div>
      <p className="mt-1.5 truncate text-[10px] font-semibold leading-tight text-slate-500">
        {label}
      </p>
      <p
        className={`mt-0.5 text-lg font-black leading-none tabular-nums tracking-tight sm:text-xl ${valueClass}`}
      >
        {fmt(value)}
      </p>
      <p
        className={`mt-auto pt-1 truncate text-[9px] font-bold uppercase tracking-wide ${
          alert ? "text-orange-600" : "font-medium normal-case tracking-normal text-slate-400"
        }`}
      >
        {alert ? "Needs attention" : "Live period"}
      </p>
    </button>
  );
}
