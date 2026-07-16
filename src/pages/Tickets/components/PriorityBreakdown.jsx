import DashboardCard from "./DashboardCard";
import { formatLabel } from "../utils/ticketFormatters";

const colorMap = {
  urgent: "#dc2626",
  high: "#ff5638",
  medium: "#f8b32c",
  low: "#27AE60",
};

export default function PriorityBreakdown({ overview, onOpenQueue }) {
  const total = Math.max(
    overview.byPriority.reduce((sum, item) => sum + item.count, 0),
    0,
  );

  let start = 0;
  const segments = overview.byPriority
    .filter((item) => item.count > 0)
    .map((item) => {
      const percent = total ? (item.count / total) * 100 : 0;
      const segment = `${colorMap[item.key]} ${start}% ${start + percent}%`;
      start += percent;
      return segment;
    });

  const gradient =
    segments.length > 0 ? `conic-gradient(${segments.join(", ")})` : "#eef2f7";

  return (
    <DashboardCard title="Tickets by Priority">
      <div className="grid items-center gap-4 sm:grid-cols-[96px_1fr]">
        <div className="relative mx-auto h-20 w-20 rounded-full shadow-inner" style={{ background: gradient }}>
          <div className="absolute inset-5 flex flex-col items-center justify-center rounded-full bg-white shadow-sm">
            <span className="text-[20px] font-black leading-none text-slate-950">{total}</span>
            <span className="text-[10px] font-bold uppercase text-slate-400">Total</span>
          </div>
        </div>

        <div className="space-y-2">
          {overview.byPriority.map((item) => {
            const percent = total ? Math.round((item.count / total) * 100) : 0;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onOpenQueue?.({ priority: item.key })}
                className="flex w-full items-center justify-between gap-2 rounded-xl px-2 py-2 text-left transition hover:bg-emerald-50"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: colorMap[item.key] }}
                  />
                  <span className="text-[12px] font-semibold text-slate-700">
                    {formatLabel(item.key)}
                  </span>
                </div>
                <span className="text-[12px] font-bold text-slate-900">
                  {item.count} ({percent}%)
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </DashboardCard>
  );
}
