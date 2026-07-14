import DashboardCard from "./DashboardCard";
import { formatLabel } from "../utils/ticketFormatters";

export default function StatusBreakdown({ overview, onOpenQueue }) {
  const max = Math.max(...overview.byStatus.map((item) => item.count), 1);

  return (
    <DashboardCard title="Tickets by Status">
      <div className="mt-1 space-y-0.5">
        {overview.byStatus.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => onOpenQueue?.({ status: item.key })}
            className="grid w-full grid-cols-[92px_minmax(80px,1fr)_20px] items-center gap-1 rounded-sm px-0.5 text-left hover:bg-blue-50"
          >
            <span className="text-[10px] font-normal text-slate-900">
              {formatLabel(item.key)}
            </span>
            <div className="h-0.5 rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-blue-600"
                style={{ width: `${(item.count / max) * 100}%` }}
              />
            </div>
            <span className="text-right text-[10px] font-normal text-slate-900">
              {item.count}
            </span>
          </button>
        ))}
      </div>
    </DashboardCard>
  );
}
