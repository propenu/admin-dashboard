import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useContentTeamDashboard } from "./contentTeamDashboard/useContentTeamDashboard";
import CtHeader from "./contentTeamDashboard/components/CtHeader";
import CtKpiStrip from "./contentTeamDashboard/components/CtKpiStrip";
import CtPipelinePanel from "./contentTeamDashboard/components/CtPipelinePanel";
import CtEngagementPanel from "./contentTeamDashboard/components/CtEngagementPanel";
import CtAlertsPanel from "./contentTeamDashboard/components/CtAlertsPanel";
import CtQueuePanel from "./contentTeamDashboard/components/CtQueuePanel";
import CtInventoryPanel from "./contentTeamDashboard/components/CtInventoryPanel";

export default function ContentTeamDashboard() {
  const navigate = useNavigate();
  const dashboard = useContentTeamDashboard();
  const [activeKpi, setActiveKpi] = useState(null);

  const openBlogs = () => navigate("/blogs");

  const refreshAll = async () => {
    await dashboard.refetch();
    toast.success("Content dashboard refreshed");
  };

  const handleExport = async () => {
    const lines = [
      `Content Command Center — ${dashboard.currentUserName}`,
      `Period: ${dashboard.rangeLabel}`,
      `Total posts: ${dashboard.summary.total}`,
      `Published: ${dashboard.summary.published}`,
      `Drafts: ${dashboard.summary.drafts}`,
      `Featured: ${dashboard.summary.featured}`,
      `Views: ${dashboard.summary.totalViews}`,
      `Likes: ${dashboard.summary.totalLikes}`,
      `Shares: ${dashboard.summary.totalShares}`,
      `Publish rate: ${dashboard.summary.publishRate ?? "N/A"}%`,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(lines);
      toast.success("Content summary copied");
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
          <div className="h-72 animate-pulse rounded-[14px] bg-slate-100" />
          <div className="h-72 animate-pulse rounded-[14px] bg-slate-100 lg:col-span-2" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-3 pb-6 text-slate-900">
      <CtHeader
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
        onCreateBlog={openBlogs}
        onOpenBlogs={openBlogs}
        onExport={handleExport}
        summary={dashboard.summary}
      />

      <CtKpiStrip
        kpis={dashboard.kpis}
        activeKey={activeKpi}
        onMetricClick={(key) => {
          setActiveKpi((current) => (current === key ? null : key));
          if (["total", "published", "drafts", "featured"].includes(key)) openBlogs();
        }}
      />

      <div className="grid gap-3 lg:grid-cols-12 lg:items-stretch">
        <div className="min-h-[300px] lg:col-span-3">
          <CtPipelinePanel pipeline={dashboard.pipeline} summary={dashboard.summary} />
        </div>
        <div className="min-h-[300px] lg:col-span-6">
          <CtEngagementPanel
            categoryRows={dashboard.categoryRows}
            topPosts={dashboard.topPosts}
          />
        </div>
        <div className="min-h-[300px] lg:col-span-3">
          <CtAlertsPanel alerts={dashboard.alerts} />
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-12 lg:items-stretch">
        <div className="min-h-[280px] lg:col-span-8">
          <CtQueuePanel queueRows={dashboard.queueRows} onOpenBlogs={openBlogs} />
        </div>
        <div className="min-h-[280px] lg:col-span-4">
          <CtInventoryPanel summary={dashboard.summary} />
        </div>
      </div>
    </div>
  );
}
