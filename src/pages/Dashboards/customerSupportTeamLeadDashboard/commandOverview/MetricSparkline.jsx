export default function MetricSparkline({ points = [], tone = "emerald", compact = false }) {
  const values = (Array.isArray(points) ? points : []).map((v) => Number(v) || 0);
  const w = compact ? 40 : 72;
  const h = compact ? 14 : 24;
  if (values.length < 2) {
    return (
      <div
        className={`rounded bg-slate-100/80 ${compact ? "h-3.5 w-10" : "h-6 w-[72px]"}`}
        aria-hidden
      />
    );
  }
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const span = Math.max(max - min, 1);
  const d = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - ((v - min) / span) * (h - 3) - 1.5;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const stroke = tone === "orange" ? "#ea580c" : "#059669";

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={`shrink-0 motion-safe:animate-[tlSpark_700ms_ease-out] ${
        compact ? "h-3.5 w-10" : "h-6 w-[72px]"
      }`}
      aria-hidden
    >
      <path
        d={d}
        fill="none"
        stroke={stroke}
        strokeWidth={compact ? 1.4 : 1.75}
        strokeLinecap="round"
      />
    </svg>
  );
}
