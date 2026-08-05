import MetricSparkline from "./MetricSparkline";

const fmt = (v) => Number(v || 0).toLocaleString("en-IN");

export default function SupportMetricCard({
  label,
  value,
  icon: Icon,
  spark = [],
  tone = "emerald",
  hint,
  onClick,
  loading,
}) {
  const alert = tone === "orange" && Number(value) > 0;
  const valueClass = alert ? "text-orange-600" : "text-slate-950";
  const iconWrap = alert
    ? "bg-orange-50 text-orange-600"
    : "bg-emerald-50 text-emerald-700";

  if (loading) {
    return (
      <div className="min-w-0 animate-pulse rounded-xl border border-slate-200/80 bg-white p-2 shadow-sm">
        <div className="mb-2 h-6 w-6 rounded-lg bg-slate-100" />
        <div className="mb-1 h-2.5 w-10 rounded bg-slate-100" />
        <div className="h-5 w-8 rounded bg-slate-100" />
      </div>
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
      <p className={`mt-0.5 text-lg font-black leading-none tabular-nums tracking-tight sm:text-xl ${valueClass}`}>
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
