import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useMarketingHeadDashboard } from "./marketingHeadDashboard/useMarketingHeadDashboard";
import MhHeader from "./marketingHeadDashboard/components/MhHeader";
import MhKpiStrip from "./marketingHeadDashboard/components/MhKpiStrip";
import MhFunnelPanel from "./marketingHeadDashboard/components/MhFunnelPanel";
import MhChannelPanel from "./marketingHeadDashboard/components/MhChannelPanel";
import MhCampaignPanel from "./marketingHeadDashboard/components/MhCampaignPanel";
import MhAlertsPanel from "./marketingHeadDashboard/components/MhAlertsPanel";
import MhLeadFlowPanel from "./marketingHeadDashboard/components/MhLeadFlowPanel";
import MhDemandPanel from "./marketingHeadDashboard/components/MhDemandPanel";

export default function MarketingHeadDashboard() {
  const navigate = useNavigate();
  const dashboard = useMarketingHeadDashboard();
  const [activeKpi, setActiveKpi] = useState(null);

  const refreshAll = async () => {
    await dashboard.refetch();
    toast.success("Marketing dashboard refreshed");
  };

  const handleExport = async () => {
    const lines = [
      `Marketing Command Center — ${dashboard.currentUserName}`,
      `Period: ${dashboard.rangeLabel}`,
      `Leads: ${dashboard.summary.totalLeads}`,
      `Qualified: ${dashboard.summary.qualifiedLeads}`,
      `Converted: ${dashboard.summary.convertedLeads}`,
      `Qualify rate: ${dashboard.summary.qualificationRate ?? "N/A"}%`,
      `Lead→booking: ${dashboard.summary.conversionRate ?? "N/A"}%`,
      `Active campaigns: ${dashboard.summary.runningCount}`,
      `Campaign CTR: ${dashboard.summary.campaignCtr ?? "N/A"}%`,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(lines);
      toast.success("Executive summary copied");
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
        <div className="grid gap-3 lg:grid-cols-3">
          <div className="h-72 animate-pulse rounded-[14px] bg-slate-100 lg:col-span-1" />
          <div className="h-72 animate-pulse rounded-[14px] bg-slate-100 lg:col-span-2" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-3 pb-6 text-slate-900">
      <MhHeader
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
        city={dashboard.city}
        cities={dashboard.cities}
        onCityChange={dashboard.setCity}
        onRefresh={refreshAll}
        isFetching={dashboard.isFetching}
        onCreateCampaign={() => navigate("/email-notifications")}
        onOpenLeads={() => navigate("/leads")}
        onExport={handleExport}
      />

      <MhKpiStrip
        kpis={dashboard.kpis}
        activeKey={activeKpi}
        onMetricClick={(key) => {
          setActiveKpi((current) => (current === key ? null : key));
          if (key === "campaigns") navigate("/email-notifications");
          if (key === "leads" || key === "new" || key === "qualified") navigate("/leads");
        }}
      />

      <div className="grid gap-3 lg:grid-cols-12 lg:items-stretch">
        <div className="min-h-[320px] lg:col-span-3">
          <MhFunnelPanel stages={dashboard.funnelStages} summary={dashboard.summary} />
        </div>
        <div className="min-h-[320px] lg:col-span-6">
          <MhChannelPanel
            channelRows={dashboard.channelRows}
            categoryRows={dashboard.categoryRows}
            trendRows={dashboard.trendRows}
          />
        </div>
        <div className="min-h-[320px] lg:col-span-3">
          <MhAlertsPanel alerts={dashboard.alerts} />
        </div>
      </div>

      <MhLeadFlowPanel leadFlow={dashboard.leadFlow} summary={dashboard.summary} />

      <div className="grid gap-3 lg:grid-cols-12 lg:items-stretch">
        <div className="min-h-[280px] lg:col-span-8">
          <MhCampaignPanel
            campaigns={dashboard.campaignRows}
            onOpenEmail={() => navigate("/email-notifications")}
            onOpenWhatsapp={() => navigate("/whatsapp-notifications")}
          />
        </div>
        <div className="min-h-[280px] lg:col-span-4">
          <MhDemandPanel summary={dashboard.summary} topProjects={dashboard.topProjects} />
        </div>
      </div>
    </div>
  );
}
