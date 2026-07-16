import DashboardCard from "./DashboardCard";
import { progressFill, progressTrack } from "./ticketUi";
import { formatLabel } from "../utils/ticketFormatters";

export default function DepartmentBreakdown({ overview, onOpenQueue }) {
  const total = Math.max(
    overview.byDepartment.reduce((sum, item) => sum + item.count, 0),
    1,
  );
  const max = Math.max(...overview.byDepartment.map((item) => item.count), 1);

  return (
    <DashboardCard title="Tickets by Department">
      <div className="space-y-2.5">
        {overview.byDepartment.length === 0 ? (
          <p className="rounded-xl bg-slate-50 p-4 text-[12px] font-medium text-slate-500">No department data</p>
        ) : (
          overview.byDepartment.map((item) => {
            const percent = Math.round((item.count / total) * 100);
            return (
              <button
                key={item._id || "unassigned"}
                type="button"
                onClick={() => onOpenQueue?.({ department: item._id })}
                className="grid w-full grid-cols-[110px_1fr_62px] items-center gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-emerald-50"
              >
                <span className="truncate text-[12px] font-semibold text-slate-700">
                  {formatLabel(item._id)}
                </span>
                <div className={progressTrack}>
                  <div
                    className={progressFill}
                    style={{ width: `${(item.count / max) * 100}%` }}
                  />
                </div>
                <span className="text-right text-[12px] font-black text-slate-900">
                  {item.count} ({percent}%)
                </span>
              </button>
            );
          })
        )}
      </div>
    </DashboardCard>
  );
}
