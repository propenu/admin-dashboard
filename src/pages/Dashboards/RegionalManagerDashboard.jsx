import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useRegionalManagerDashboard } from "./regionalManagerDashboard/useRegionalManagerDashboard";
import RmHeader from "./regionalManagerDashboard/components/RmHeader";
import RmKpiStrip from "./regionalManagerDashboard/components/RmKpiStrip";
import RmInventoryPanel from "./regionalManagerDashboard/components/RmInventoryPanel";
import RmCityPanel from "./regionalManagerDashboard/components/RmCityPanel";
import RmTeamPanel from "./regionalManagerDashboard/components/RmTeamPanel";

export default function RegionalManagerDashboard() {
  const navigate = useNavigate();
  const dashboard = useRegionalManagerDashboard();
  const [activeKpi, setActiveKpi] = useState(null);

  const go = (href) => {
    if (href) navigate(href);
  };

  const refreshAll = async () => {
    await dashboard.refetch();
    toast.success("Regional dashboard refreshed");
  };

  const handleExport = async () => {
    const s = dashboard.summary;
    const lines = [
      `Regional Command Center — ${dashboard.currentUserName}`,
      `Region: ${dashboard.regionLabel}`,
      `Period: ${dashboard.rangeLabel}`,
      `Inventory: ${s.totalListings} (${s.activeListings} active, ${s.pendingCount} pending, ${s.draftCount} draft)`,
      `Engagement: ${s.inquiries} inquiries · ${s.totalViews} views · ${s.conversions} conversions`,
      `Live rate: ${s.liveRate == null ? "N/A" : `${s.liveRate}%`}`,
      `Team: ${s.teamCount} members (${s.activeTeam} active)`,
      "",
      "Top cities:",
      ...dashboard.cityRows
        .slice(0, 8)
        .map((row) => `- ${row.city}: ${row.total} total (${row.active} active)`),
    ].join("\n");

    try {
      await navigator.clipboard.writeText(lines);
      toast.success("Regional summary copied");
    } catch {
      toast.error("Unable to copy summary");
    }
  };

  if (dashboard.isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-28 animate-pulse rounded-[14px] bg-slate-100" />
        <div className="grid grid-cols-2 gap-2 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-[14px] bg-slate-100" />
          ))}
        </div>
        <div className="grid gap-3 lg:grid-cols-12">
          <div className="h-72 animate-pulse rounded-[14px] bg-slate-100 lg:col-span-5" />
          <div className="h-72 animate-pulse rounded-[14px] bg-slate-100 lg:col-span-4" />
          <div className="h-72 animate-pulse rounded-[14px] bg-slate-100 lg:col-span-3" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1680px] space-y-3 pb-6 text-slate-900">
      <RmHeader
        userName={dashboard.currentUserName}
        regionLabel={dashboard.regionLabel}
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
        selectedCity={dashboard.selectedCity}
        onCityChange={dashboard.setSelectedCity}
        selectedStatus={dashboard.selectedStatus}
        onStatusChange={dashboard.setSelectedStatus}
        allCities={dashboard.allCities}
        onClearFilters={dashboard.clearFilters}
        onOpenApprovals={() => go("/properties?status=pending")}
      />

      <RmKpiStrip
        kpis={dashboard.kpis}
        activeKey={activeKpi}
        onMetricClick={(kpi) => {
          setActiveKpi((current) => (current === kpi.key ? null : kpi.key));
          go(kpi.href);
        }}
      />

      <div className="grid gap-3 lg:grid-cols-12 lg:items-stretch">
        <div className="min-h-[340px] lg:col-span-5">
          <RmInventoryPanel
            summary={dashboard.summary}
            statusRows={dashboard.statusRows}
            inventoryRows={dashboard.inventoryRows}
            onOpenProperties={() => go("/properties")}
            onOpenProjects={() => go("/projects")}
          />
        </div>
        <div className="min-h-[340px] lg:col-span-4">
          <RmCityPanel cityRows={dashboard.cityRows} regionLabel={dashboard.regionLabel} />
        </div>
        <div className="min-h-[340px] lg:col-span-3">
          <RmTeamPanel
            teamMembers={dashboard.teamMembers}
            roleBreakdown={dashboard.roleBreakdown}
            summary={dashboard.summary}
            onOpenTeam={() => go("/sales-managers")}
          />
        </div>
      </div>
    </div>
  );
}
