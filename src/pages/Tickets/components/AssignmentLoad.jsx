import { UserRound } from "lucide-react";
import DashboardCard from "./DashboardCard";
import { primaryButton } from "./ticketUi";

export default function AssignmentLoad({ overview, onOpenQueue }) {
  const agents = (overview.assignmentLoad || []).filter((row) => row._id);
  const top = agents[0];
  const unassigned = Number(overview.unassigned || 0);

  return (
    <DashboardCard
      title="Assignment Load"
      subtitle="Open tickets by assignee (period)"
    >
      <div className="flex items-center gap-3 rounded-xl bg-rose-50 p-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-rose-100 bg-white text-rose-600">
          <UserRound className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-[12px] font-bold leading-tight text-slate-900">
            Unassigned open
          </p>
          <p className="mt-1 text-[26px] font-black leading-none tabular-nums text-slate-950">
            {unassigned.toLocaleString("en-IN")}
          </p>
          <p className="mt-1 text-[12px] font-medium leading-tight text-slate-500">
            Waiting for assignment
          </p>
        </div>
      </div>

      <div className="mt-3 space-y-1.5">
        {agents.length === 0 ? (
          <p className="rounded-xl bg-slate-50 px-3 py-3 text-[12px] font-medium text-slate-500">
            No assigned open tickets in this period
          </p>
        ) : (
          agents.slice(0, 5).map((row) => (
            <div
              key={String(row._id)}
              className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2"
            >
              <span className="truncate text-[12px] font-semibold text-slate-700">
                {row.agentName}
              </span>
              <span className="text-[12px] font-black tabular-nums text-slate-950">
                {row.count}
              </span>
            </div>
          ))
        )}
      </div>

      {top ? (
        <p className="mt-2 text-[11px] font-medium text-slate-500">
          Highest load: <strong className="text-slate-700">{top.agentName}</strong> ({top.count})
        </p>
      ) : null}

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
