import { useNavigate } from "react-router-dom";
import { RefreshCw, Wifi } from "lucide-react";
import { toast } from "sonner";
import RmTeamFloorDashboard from "./regionalManagerDashboard/components/RmTeamFloorDashboard";
import { SA_GROUP_TABS } from "./regionalManagerDashboard/regionalManagerDashboardData";
import { useSuperAdminStaffFloor } from "./superAdminDashboard/useSuperAdminStaffFloor";

/**
 * Separate Super Admin page — same Team Floor UX as BDH,
 * covering all staff roles (online / offline / account active).
 */
export default function SuperAdminStaffFloorPage() {
  const navigate = useNavigate();
  const dashboard = useSuperAdminStaffFloor();

  const refreshAll = async () => {
    await dashboard.refetch();
    toast.success("Staff floor refreshed");
  };

  if (dashboard.isLoading) {
    return (
      <div className="mx-auto max-w-[1680px] space-y-3 pb-6">
        <div className="h-10 animate-pulse rounded-xl bg-slate-100" />
        <div className="h-24 animate-pulse rounded-[14px] bg-slate-100" />
        <div className="h-72 animate-pulse rounded-[14px] bg-slate-100" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1680px] space-y-3 pb-6 text-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <h1 className="flex items-center gap-2 text-lg font-black text-slate-950 sm:text-xl">
            <Wifi className="h-5 w-5 text-emerald-600" />
            Staff Floor
          </h1>
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

      <RmTeamFloorDashboard
        teamFloor={dashboard.teamFloor}
        summary={dashboard.summary}
        groupTabs={SA_GROUP_TABS}
        nestByReportsTo
        onOpenMemberWork={(member) =>
          navigate(`/dashboard/team-management/member/${member.id}`)
        }
      />
    </div>
  );
}
