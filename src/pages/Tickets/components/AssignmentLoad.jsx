import { UserRound } from "lucide-react";
import DashboardCard from "./DashboardCard";
import { primaryButton } from "./ticketUi";

export default function AssignmentLoad({ overview, onOpenQueue }) {
  const first = overview.assignmentLoad[0] || {};
  const agentName = first.agent || "Unassigned";
  const count = first.count ?? overview.unassigned ?? 0;

  return (
    <DashboardCard title="Assignment Load">
      <div className="flex items-center gap-3 rounded-xl bg-rose-50 p-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-rose-100 bg-white text-rose-600">
          <UserRound className="h-5 w-5" />
        </span>
        <div>
          <p className="text-[12px] font-bold leading-tight text-slate-900">{agentName}</p>
          <p className="mt-1 text-[26px] font-black leading-none text-slate-950">{count}</p>
          <p className="mt-1 text-[12px] font-medium leading-tight text-slate-500">
            Tickets waiting for assignment
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onOpenQueue?.({ assignment: "unassigned" })}
        className={`${primaryButton} mt-3 w-full`}
      >
        View Unassigned Tickets
      </button>
    </DashboardCard>
  );
}
