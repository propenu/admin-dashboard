import DashboardCard from "./DashboardCard";
import { progressFill, progressTrack } from "./ticketUi";
import { formatLabel } from "../utils/ticketFormatters";

export default function StatusBreakdown({ overview, onOpenQueue }) {
  const rows = (overview?.byStatus || []).filter((item) => Number(item.count) > 0);
  const max = Math.max(...rows.map((item) => item.count), 1);

  return (
    <DashboardCard title="Tickets by Status" subtitle="Click a row to open matching queue">
      <div className="space-y-2.5">
        {rows.length === 0 ? (
          <p className="rounded-xl bg-[#f7fbf8] p-4 text-[12px] font-medium text-[#5c7d6d]">
            No tickets in this period
          </p>
        ) : (
          rows.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => onOpenQueue?.({ status: item.key })}
              className="grid w-full grid-cols-[120px_minmax(80px,1fr)_34px] items-center gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-[#f7fbf8]"
            >
              <span className="truncate text-[12px] font-semibold text-[#0f3d2e]">
                {formatLabel(item.key)}
              </span>
              <div className={progressTrack}>
                <div
                  className={progressFill}
                  style={{ width: `${(item.count / max) * 100}%` }}
                />
              </div>
              <span className="text-right text-[12px] font-black text-[#0f3d2e]">
                {item.count}
              </span>
            </button>
          ))
        )}
      </div>
    </DashboardCard>
  );
}
