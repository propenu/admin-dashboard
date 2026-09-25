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
        className="flex w-full items-center gap-3 rounded-xl border border-[#b7e4c7] bg-[#f7fbf8] p-3 text-left transition hover:bg-white"
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#b7e4c7] bg-white text-[#27AE60]">
          <RefreshCw className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-[12px] font-bold leading-tight text-[#0f3d2e]">
            Reassigned open
          </p>
          <p className="mt-1 text-[26px] font-black leading-none tabular-nums text-[#0f3d2e]">
            {reassigned.toLocaleString("en-IN")}
          </p>
          <p className="mt-1 text-[12px] font-medium leading-tight text-[#5c7d6d]">
            Handed off — review owners
          </p>
        </div>
      </button>

      <div className="mt-3 space-y-1.5">
        {agents.length === 0 ? (
          <p className="rounded-xl bg-[#f7fbf8] px-3 py-3 text-[12px] font-medium text-[#5c7d6d]">
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
                className="flex w-full items-center justify-between rounded-xl border border-[#b7e4c7] bg-[#f7fbf8] px-3 py-2 text-left transition hover:border-[#27AE60] hover:bg-white"
              >
                <span className="min-w-0">
                  <span className="block truncate text-[12px] font-semibold text-[#0f3d2e]">
                    {row.agentName}
                  </span>
                  {roleLabel ? (
                    <span className="mt-0.5 block truncate text-[10px] font-medium text-[#27AE60]">
                      {roleLabel}
                    </span>
                  ) : null}
                </span>
                <span className="shrink-0 text-[12px] font-black tabular-nums text-[#0f3d2e]">
                  {row.count}
                </span>
              </button>
            );
          })
        )}
      </div>

      {top ? (
        <p className="mt-2 text-[11px] font-medium text-[#5c7d6d]">
          Highest load: <strong className="text-[#0f3d2e]">{top.agentName}</strong> ({top.count})
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
