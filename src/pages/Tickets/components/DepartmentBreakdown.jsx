import DashboardCard from "./DashboardCard";
import { formatLabel } from "../utils/ticketFormatters";

export default function DepartmentBreakdown({ overview, onOpenQueue }) {
  const total = Math.max(
    overview.byDepartment.reduce((sum, item) => sum + item.count, 0),
    1,
  );
  const max = Math.max(...overview.byDepartment.map((item) => item.count), 1);

  return (
    <DashboardCard title="Tickets by Department">
      <div className="mt-1.5 space-y-1.5">
        {overview.byDepartment.length === 0 ? (
          <p className="text-[10px] font-normal text-slate-500">No department data</p>
        ) : (
          overview.byDepartment.map((item) => {
            const percent = Math.round((item.count / total) * 100);
            return (
              <button
                key={item._id || "unassigned"}
                type="button"
                onClick={() => onOpenQueue?.({ department: item._id })}
                className="grid w-full grid-cols-[82px_1fr_48px] items-center gap-1 rounded-sm px-0.5 text-left hover:bg-blue-50"
              >
                <span className="text-[10px] font-normal text-slate-900">
                  {formatLabel(item._id)}
                </span>
                <div className="h-0.5 rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-blue-600"
                    style={{ width: `${(item.count / max) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] font-normal text-slate-900">
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
