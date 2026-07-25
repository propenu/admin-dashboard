import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAdminDashboard } from "./adminDashboard/useAdminDashboard";
import AdHeader from "./adminDashboard/components/AdHeader";
import AdKpiStrip from "./adminDashboard/components/AdKpiStrip";
import AdWorkstreams from "./adminDashboard/components/AdWorkstreams";
import AdApprovalQueue from "./adminDashboard/components/AdApprovalQueue";
import AdInventoryPanel from "./adminDashboard/components/AdInventoryPanel";
import AdAlertsPanel from "./adminDashboard/components/AdAlertsPanel";
import AdMixPanel from "./adminDashboard/components/AdMixPanel";
import AdModuleGrid from "./adminDashboard/components/AdModuleGrid";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const dashboard = useAdminDashboard();
  const [activeKpi, setActiveKpi] = useState(null);

  const go = (href) => {
    if (href) navigate(href);
  };

  const refreshAll = async () => {
    await dashboard.refetch();
    toast.success("Admin ops dashboard refreshed");
  };

  const handleExport = async () => {
    const s = dashboard.summary;
    const lines = [
      `Admin Operations Command Center — ${dashboard.currentUserName}`,
      `Period: ${dashboard.rangeLabel}`,
      `Listings: ${s.propertyCounts?.total || 0} (${s.propertyCounts?.active || 0} active, ${s.propertyCounts?.pending || 0} pending)`,
      `Projects: ${s.projectCounts?.total || 0}`,
      `Leads: ${s.totalLeads} (${s.newLeads} new)`,
      `Open tickets: ${s.openTickets} · Unassigned: ${s.unassignedTickets} · Overdue: ${s.overdueTickets}`,
      `Users: ${s.usersTotal} · Builders: ${s.builders} · Agents: ${s.agents} · Onboarding: ${s.onboarding}`,
      `Approval load: ${s.approvalLoad}`,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(lines);
      toast.success("Admin ops summary copied");
    } catch {
      toast.error("Unable to copy summary");
    }
  };

  if (dashboard.isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-24 animate-pulse rounded-[14px] bg-slate-100" />
        <div className="grid grid-cols-4 gap-2 xl:grid-cols-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-[14px] bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1680px] space-y-3 pb-6 text-slate-900">
      <AdHeader
        userName={dashboard.currentUserName}
        rangeLabel={dashboard.rangeLabel}
        refreshedAt={dashboard.refreshedAt}
        preset={dashboard.preset}
        onPresetChange={dashboard.setPreset}
        customFrom={dashboard.customFrom}
        customTo={dashboard.customTo}
        onCustomFromChange={dashboard.setCustomFrom}
        onCustomToChange={dashboard.setCustomTo}
        onApplyCustom={dashboard.applyCustomRange}
        onRefresh={refreshAll}
        isFetching={dashboard.isFetching}
        onExport={handleExport}
        summary={dashboard.summary}
        onOpenApprovals={() => go("/properties?status=pending")}
        onOpenJoinedToday={() => go("/users?joined=today")}
      />

      <AdKpiStrip
        kpis={dashboard.kpis}
        activeKey={activeKpi}
        onMetricClick={(kpi) => {
          setActiveKpi((current) => (current === kpi.key ? null : kpi.key));
          go(kpi.href);
        }}
      />

      <AdWorkstreams workstreams={dashboard.workstreams} onOpen={go} />

      <div className="grid gap-3 lg:grid-cols-12 lg:items-stretch">
        <div className="min-h-[320px] lg:col-span-4">
          <AdApprovalQueue items={dashboard.approvalQueue} onOpen={go} />
        </div>
        <div className="min-h-[320px] lg:col-span-5">
          <AdInventoryPanel
            propertyStatus={dashboard.propertyStatus}
            projectStatus={dashboard.projectStatus}
            leadTrend={dashboard.leadTrend}
            summary={dashboard.summary}
            onOpenProperties={() => go("/properties")}
            onOpenProjects={() => go("/projects")}
          />
        </div>
        <div className="min-h-[320px] lg:col-span-3">
          <AdAlertsPanel alerts={dashboard.alerts} onOpen={go} />
        </div>
      </div>

      <div className="min-h-[240px]">
        <AdMixPanel
          sourceRows={dashboard.sourceRows}
          categoryRows={dashboard.categoryRows}
          ticketRows={dashboard.ticketRows}
          userMix={dashboard.userMix}
          summary={dashboard.summary}
          onOpenLeads={() => go("/leads")}
          onOpenTickets={() => go("/tickets")}
          onOpenUsers={() => go("/users?filter=onboarding")}
        />
      </div>

      <AdModuleGrid modules={dashboard.modules} onOpen={go} />
    </div>
  );
}
