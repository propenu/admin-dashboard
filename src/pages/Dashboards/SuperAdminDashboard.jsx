import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useSuperAdminDashboard } from "./superAdminDashboard/useSuperAdminDashboard";
import SaHeader from "./superAdminDashboard/components/SaHeader";
import SaKpiStrip from "./superAdminDashboard/components/SaKpiStrip";
import SaDomainHealth from "./superAdminDashboard/components/SaDomainHealth";
import SaFinancePanel from "./superAdminDashboard/components/SaFinancePanel";
import SaInventoryPanel from "./superAdminDashboard/components/SaInventoryPanel";
import SaAlertsPanel from "./superAdminDashboard/components/SaAlertsPanel";
import SaOpsPanel from "./superAdminDashboard/components/SaOpsPanel";
import SaFollowUpPanel from "./superAdminDashboard/components/SaFollowUpPanel";
import SaModuleGrid from "./superAdminDashboard/components/SaModuleGrid";
import { formatINR } from "./superAdminDashboard/superAdminDashboardData";

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const dashboard = useSuperAdminDashboard();
  const [activeKpi, setActiveKpi] = useState(null);

  const go = (href) => {
    if (href) navigate(href);
  };

  const refreshAll = async () => {
    await dashboard.refetch();
    toast.success("Platform dashboard refreshed");
  };

  const handleExport = async () => {
    const s = dashboard.summary;
    const lines = [
      `Platform Command Center — ${dashboard.currentUserName}`,
      `Period: ${dashboard.rangeLabel}`,
      `Period revenue: ${formatINR(s.periodRevenue ?? s.totalRevenue)}`,
      `Lifetime revenue: ${formatINR(s.lifetimeRevenue ?? s.totalRevenue)}`,
      `Today revenue: ${formatINR(s.todayRevenue)}`,
      `New users (period): ${s.usersInPeriod ?? 0}`,
      `Platform users: ${s.platformUsers}`,
      `Listings (period): ${s.propertyCounts?.total || 0}`,
      `Projects (period): ${s.projectCounts?.total || 0}`,
      `Leads (period): ${s.totalLeads}`,
      `Open tickets: ${s.openTickets}`,
      `Active subscriptions: ${s.activeSubs}`,
      `Failed payments (period): ${s.failedPayCount}`,
      `Published blogs (period): ${s.publishedBlogs}`,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(lines);
      toast.success("Executive platform summary copied");
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
        <div className="grid grid-cols-3 gap-2 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-[14px] bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1680px] space-y-3 pb-6 text-slate-900">
      <SaHeader
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
      />

      <SaKpiStrip
        kpis={dashboard.kpis}
        activeKey={activeKpi}
        onMetricClick={(kpi) => {
          setActiveKpi((current) => (current === kpi.key ? null : kpi.key));
          go(kpi.href);
        }}
      />

      <SaDomainHealth domains={dashboard.domains} onOpen={go} />

      <SaFollowUpPanel
        tracks={dashboard.followUpTracks || []}
        onOpen={go}
        allTracksHref={
          dashboard.followUpTracks?.[0]?.items?.find((i) => i.key === "onboarding_all")?.href ||
          "/follow-up-tracking"
        }
      />

      <div className="grid gap-3 lg:grid-cols-12 lg:items-stretch">
        <div className="min-h-[320px] lg:col-span-5">
          <SaFinancePanel
            paymentDonut={dashboard.paymentDonut}
            planRows={dashboard.planRows}
            summary={dashboard.summary}
            onOpenPayments={() => go("/payments-list")}
            onOpenPlans={() => go("/revenue-by-plan")}
          />
        </div>
        <div className="min-h-[320px] lg:col-span-4">
          <SaInventoryPanel
            propertyStatus={dashboard.propertyStatus}
            projectStatus={dashboard.projectStatus}
            summary={dashboard.summary}
            onOpenProperties={() => {
              const from = dashboard.range?.from;
              const to = dashboard.range?.to;
              const qs = new URLSearchParams();
              if (from) qs.set("createdFrom", from);
              if (to) qs.set("createdTo", to);
              go(qs.toString() ? `/properties?${qs}` : "/properties");
            }}
            onOpenProjects={() => {
              const from = dashboard.range?.from;
              const to = dashboard.range?.to;
              const qs = new URLSearchParams();
              if (from) qs.set("createdFrom", from);
              if (to) qs.set("createdTo", to);
              go(qs.toString() ? `/projects?${qs}` : "/projects");
            }}
          />
        </div>
        <div className="min-h-[320px] lg:col-span-3">
          <SaAlertsPanel alerts={dashboard.alerts} onOpen={go} />
        </div>
      </div>

      <div className="min-h-[260px]">
        <SaOpsPanel
          leadSourceRows={dashboard.leadSourceRows}
          ticketStatusRows={dashboard.ticketStatusRows}
          roleRows={dashboard.roleRows}
          summary={dashboard.summary}
          onOpenLeads={() => go("/leads")}
          onOpenTickets={() => go("/tickets")}
          onOpenUsers={() => go("/users?filter=onboarding")}
        />
      </div>

      <SaModuleGrid modules={dashboard.modules} onOpen={go} />
    </div>
  );
}
