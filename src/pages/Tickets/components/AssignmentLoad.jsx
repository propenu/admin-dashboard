import { RefreshCw } from "lucide-react";
import DashboardCard from "./DashboardCard";
import { primaryButton } from "./ticketUi";
import { formatLabel } from "../utils/ticketFormatters";

export default function AssignmentLoad({ overview, onOpenQueue }) {
  const agents = (overview.assignmentLoad || []).filter((row) => row._id);
  const top = agents[0];
  const reassigned = Number(overview.reassigned || 0);

  return (
    <DashboardCard
      title="Assignment Load"
      subtitle="Open tickets by assignee (period)"
    >
      <button
        type="button"
        onClick={() =>
          onOpenQueue?.({ assignment: "reassigned", reassigned: true })
        }
        className="flex w-full items-center gap-3 rounded-xl bg-violet-50 p-3 text-left transition hover:bg-violet-100/80"
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-violet-100 bg-white text-violet-700">
          <RefreshCw className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-[12px] font-bold leading-tight text-slate-900">
            Reassigned open
          </p>
          <p className="mt-1 text-[26px] font-black leading-none tabular-nums text-slate-950">
            {reassigned.toLocaleString("en-IN")}
          </p>
          <p className="mt-1 text-[12px] font-medium leading-tight text-slate-500">
            Handed off — review owners
          </p>
        </div>
      </button>

      <div className="mt-3 space-y-1.5">
        {agents.length === 0 ? (
          <p className="rounded-xl bg-slate-50 px-3 py-3 text-[12px] font-medium text-slate-500">
            No assigned open tickets in this period
          </p>
        ) : (
          agents.slice(0, 5).map((row) => {
            const roleLabel = row.agentRole ? formatLabel(row.agentRole) : "";
            return (
              <button
                type="button"
                key={String(row._id)}
                onClick={() =>
                  onOpenQueue?.({
                    openBucket: true,
                    assignedTo: String(row._id),
                  })
                }
                className="flex w-full items-center justify-between rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2 text-left transition hover:border-emerald-200 hover:bg-emerald-50/50"
              >
                <span className="min-w-0">
                  <span className="block truncate text-[12px] font-semibold text-slate-800">
                    {row.agentName}
                  </span>
                  {roleLabel ? (
                    <span className="mt-0.5 block truncate text-[10px] font-medium text-emerald-700">
                      {roleLabel}
                    </span>
                  ) : null}
                </span>
                <span className="shrink-0 text-[12px] font-black tabular-nums text-slate-950">
                  {row.count}
                </span>
              </button>
            );
          })
        )}
      </div>

      {top ? (
        <p className="mt-2 text-[11px] font-medium text-slate-500">
          Highest load: <strong className="text-slate-700">{top.agentName}</strong> ({top.count})
        </p>
      ) : null}

      <button
        type="button"
        onClick={() =>
          onOpenQueue?.({ assignment: "reassigned", reassigned: true })
        }
        className={`${primaryButton} mt-3 w-full`}
      >
        View Reassigned Tickets
      </button>
    </DashboardCard>
  );
}
