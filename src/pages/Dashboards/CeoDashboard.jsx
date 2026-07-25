import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useCeoDashboard } from "./ceoDashboard/useCeoDashboard";
import CeoHeader from "./ceoDashboard/components/CeoHeader";
import CeoKpiStrip from "./ceoDashboard/components/CeoKpiStrip";
import CeoDeptScorecard from "./ceoDashboard/components/CeoDeptScorecard";
import CeoGrowthPanel from "./ceoDashboard/components/CeoGrowthPanel";
import CeoFunnelPanel from "./ceoDashboard/components/CeoFunnelPanel";
import CeoRiskBoard from "./ceoDashboard/components/CeoRiskBoard";
import CeoPriorities from "./ceoDashboard/components/CeoPriorities";
import CeoPortfolioPanel from "./ceoDashboard/components/CeoPortfolioPanel";
import { formatINR } from "./ceoDashboard/ceoDashboardData";

export default function CeoDashboard() {
  const navigate = useNavigate();
  const dashboard = useCeoDashboard();
  const [activeKpi, setActiveKpi] = useState(null);

  const go = (href) => {
    if (href && href !== "/") navigate(href);
  };

  const refreshAll = async () => {
    await dashboard.refetch();
    toast.success("Executive brief refreshed");
  };

  const handleExport = async () => {
    const s = dashboard.summary;
    const lines = [
      `CEO Executive Brief — ${dashboard.currentUserName}`,
      `Period: ${dashboard.rangeLabel}`,
      `Company health: ${dashboard.companyScore ?? "N/A"}/100 (${dashboard.companyHealth?.status || "N/A"})`,
      dashboard.brief?.headline || "",
      "",
      `Lifetime revenue: ${formatINR(s.totalRevenue)}`,
      `Period revenue: ${formatINR(s.periodRevenue)}`,
      `Today: ${formatINR(s.todayRevenue)}`,
      `Active subscriptions: ${s.activeSubs}`,
      `Leads: ${s.totalLeads} · Qualify ${s.qualifyRate ?? "N/A"}% · Convert ${s.convertRate ?? "N/A"}%`,
      `Listings: ${s.propertyCounts?.active || 0}/${s.propertyCounts?.total || 0} active`,
      `Open tickets: ${s.openTickets} · Overdue: ${s.overdueTickets}`,
      `Users: ${s.platformUsers} · Onboarding: ${s.onboardingUsers}`,
      "",
      "Priorities:",
      ...dashboard.priorities.map((p) => `${p.rank}. ${p.title} (${p.owner})`),
    ].join("\n");

    try {
      await navigator.clipboard.writeText(lines);
      toast.success("Executive brief copied");
    } catch {
      toast.error("Unable to copy brief");
    }
  };

  if (dashboard.isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-36 animate-pulse rounded-[14px] bg-slate-100" />
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
      <CeoHeader
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
        brief={dashboard.brief}
        companyScore={dashboard.companyScore}
        companyHealth={dashboard.companyHealth}
      />

      <CeoKpiStrip
        kpis={dashboard.northStars}
        activeKey={activeKpi}
        onMetricClick={(kpi) => {
          setActiveKpi((current) => (current === kpi.key ? null : kpi.key));
          go(kpi.href);
        }}
      />

      <CeoDeptScorecard departments={dashboard.departments} onOpen={go} />

      <div className="grid gap-3 lg:grid-cols-12 lg:items-stretch">
        <div className="min-h-[340px] lg:col-span-6">
          <CeoGrowthPanel
            revenueTrend={dashboard.revenueTrend}
            leadTrend={dashboard.leadTrend}
            planRows={dashboard.planRows}
            sourceRows={dashboard.sourceRows}
            summary={dashboard.summary}
          />
        </div>
        <div className="min-h-[340px] lg:col-span-3">
          <CeoFunnelPanel funnel={dashboard.funnel} summary={dashboard.summary} />
        </div>
        <div className="min-h-[340px] lg:col-span-3">
          <CeoRiskBoard risks={dashboard.risks} onOpen={go} />
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-12 lg:items-stretch">
        <div className="lg:col-span-7">
          <CeoPriorities priorities={dashboard.priorities} onOpen={go} />
        </div>
        <div className="min-h-[280px] lg:col-span-5">
          <CeoPortfolioPanel
            summary={dashboard.summary}
            categoryRows={dashboard.categoryRows}
            onOpenProperties={() => go("/properties")}
            onOpenProjects={() => go("/projects")}
          />
        </div>
      </div>
    </div>
  );
}
