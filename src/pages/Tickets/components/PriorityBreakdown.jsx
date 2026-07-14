import DashboardCard from "./DashboardCard";
import { formatLabel } from "../utils/ticketFormatters";

const colorMap = {
  urgent: "#dc2626",
  high: "#ff5638",
  medium: "#f8b32c",
  low: "#20b95a",
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
      <div className="mt-1 grid items-center gap-1.5 sm:grid-cols-[58px_1fr]">
        <div className="relative mx-auto h-12 w-12 rounded-full" style={{ background: gradient }}>
          <div className="absolute inset-3 flex flex-col items-center justify-center rounded-full bg-white">
            <span className="text-sm font-medium leading-none text-slate-900">{total}</span>
          </div>
        </div>

        <div className="space-y-0.5">
          {overview.byPriority.map((item) => {
            const percent = total ? Math.round((item.count / total) * 100) : 0;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onOpenQueue?.({ priority: item.key })}
                className="flex w-full items-center justify-between gap-1.5 rounded-sm px-0.5 text-left hover:bg-blue-50"
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: colorMap[item.key] }}
                  />
                  <span className="text-[10px] font-normal text-slate-900">
                    {formatLabel(item.key)}
                  </span>
                </div>
                <span className="text-[10px] font-normal text-slate-700">
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
