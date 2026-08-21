import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, RefreshCw, Users } from "lucide-react";
import { toast } from "sonner";
import OperationsDashboard from "./OperationsDashboard";
import RmTeamFloorDashboard from "./regionalManagerDashboard/components/RmTeamFloorDashboard";
import { BDH_GROUP_TABS } from "./regionalManagerDashboard/regionalManagerDashboardData";
import { useBdhDashboard } from "./businessDevelopmentHeadDashboard/useBdhDashboard";

/**
 * BD Head home: same working-team experience as Regional Manager —
 * Regional Managers + their staff, live online/offline, reassign.
 * Overview (pipeline KPIs) stays available via Command toggle.
 */
export default function BusinessDevelopmentHeadDashboard() {
  const navigate = useNavigate();
  const dashboard = useBdhDashboard();
  const [viewMode, setViewMode] = useState("team");

  const refreshAll = async () => {
    await dashboard.refetch();
    toast.success("Team dashboard refreshed");
  };

  if (viewMode === "command") {
    return (
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-lg font-black text-slate-950 sm:text-xl">Dashboard</h1>
          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 shadow-sm">
            <button
              type="button"
              onClick={() => setViewMode("team")}
              className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[10px] font-bold text-slate-600 hover:bg-slate-50"
            >
              <Users className="h-3.5 w-3.5" />
              Team Floor
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1.5 text-[10px] font-bold text-white"
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              Command
            </button>
          </div>
        </div>
        <OperationsDashboard businessDevelopmentMode />
      </div>
    );
  }

  if (dashboard.isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-10 animate-pulse rounded-xl bg-slate-100" />
        <div className="h-24 animate-pulse rounded-[14px] bg-slate-100" />
        <div className="h-72 animate-pulse rounded-[14px] bg-slate-100" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1680px] space-y-3 pb-6 text-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-lg font-black text-slate-950 sm:text-xl">Dashboard</h1>
        <div className="flex items-center gap-1.5">
          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 shadow-sm">
            <button
              type="button"
              onClick={() => setViewMode("team")}
              className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1.5 text-[10px] font-bold text-white"
            >
              <Users className="h-3.5 w-3.5" />
              Team Floor
            </button>
            <button
              type="button"
              onClick={() => setViewMode("command")}
              className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[10px] font-bold text-slate-600 hover:bg-slate-50"
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              Command
            </button>
          </div>
          <button
            type="button"
            onClick={refreshAll}
            disabled={dashboard.isFetching}
            className="inline-flex items-center gap-1 rounded-[10px] border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${dashboard.isFetching ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
      </div>

      <RmTeamFloorDashboard
        teamFloor={dashboard.teamFloor}
        summary={dashboard.summary}
        groupTabs={BDH_GROUP_TABS}
        nestUnderRegionalManagers
        onOpenMemberWork={(member) =>
          navigate(`/dashboard/team-management/member/${member.id}`)
        }
      />
    </div>
  );
}
