import { UserRound } from "lucide-react";
import DashboardCard from "./DashboardCard";

export default function AssignmentLoad({ overview, onOpenQueue }) {
  const first = overview.assignmentLoad[0] || {};
  const agentName = first.agent || "Unassigned";
  const count = first.count ?? overview.unassigned ?? 0;

  return (
    <DashboardCard title="Assignment Load">
      <div className="mt-0.5 flex items-center gap-0.5">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-red-600">
          <UserRound className="h-2.5 w-2.5" />
        </span>
        <div>
          <p className="text-[9px] font-medium leading-tight text-slate-900">{agentName}</p>
          <p className="text-xs font-medium leading-none text-slate-900">{count}</p>
          <p className="text-[8px] font-normal leading-tight text-slate-500">
            Tickets waiting for assignment
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onOpenQueue?.({ assignment: "unassigned" })}
        className="mt-0.5 h-[18px] w-full rounded-md border border-slate-200 text-[9px] font-medium leading-none text-blue-600 hover:bg-blue-50"
      >
        View Unassigned Tickets
      </button>
    </DashboardCard>
  );
}
