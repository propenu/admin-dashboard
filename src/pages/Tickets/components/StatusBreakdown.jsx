import DashboardCard from "./DashboardCard";
import { progressFill, progressTrack } from "./ticketUi";
import { formatLabel } from "../utils/ticketFormatters";

export default function StatusBreakdown({ overview, onOpenQueue }) {
  const max = Math.max(...overview.byStatus.map((item) => item.count), 1);

  return (
    <DashboardCard title="Tickets by Status">
      <div className="space-y-2.5">
        {overview.byStatus.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => onOpenQueue?.({ status: item.key })}
            className="grid w-full grid-cols-[120px_minmax(80px,1fr)_34px] items-center gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-emerald-50"
          >
            <span className="truncate text-[12px] font-semibold text-slate-700">
              {formatLabel(item.key)}
            </span>
            <div className={progressTrack}>
              <div
                className={progressFill}
                style={{ width: `${(item.count / max) * 100}%` }}
              />
            </div>
            <span className="text-right text-[12px] font-black text-slate-900">
              {item.count}
            </span>
          </button>
        ))}
      </div>
    </DashboardCard>
  );
}
