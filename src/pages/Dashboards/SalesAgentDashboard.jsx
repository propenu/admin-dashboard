import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useSalesExecutiveDashboard } from "./salesExecutiveDashboard/useSalesExecutiveDashboard";
import { filterQueueByTab } from "./salesExecutiveDashboard/salesExecutiveDashboardData";
import SeKpiStrip from "./salesExecutiveDashboard/components/SeKpiStrip";
import SeQueuePanel from "./salesExecutiveDashboard/components/SeQueuePanel";
import SeWorkspacePanel from "./salesExecutiveDashboard/components/SeWorkspacePanel";
import SeStatusPanel from "./salesExecutiveDashboard/components/SeStatusPanel";

/**
 * Sales Executive home — support-style workflow finder (not listing KPI-only).
 * Role keys: sales_agent / sales_executive
 */
export default function SalesAgentDashboard() {
  const navigate = useNavigate();
  const dashboard = useSalesExecutiveDashboard();
  const [queueTab, setQueueTab] = useState("all");
  const [selectedId, setSelectedId] = useState(null);

  const filteredQueue = useMemo(
    () => filterQueueByTab(dashboard.queueItems || [], queueTab),
    [dashboard.queueItems, queueTab],
  );

  useEffect(() => {
    if (!filteredQueue.length) {
      setSelectedId(null);
      return;
    }
    if (!selectedId || !filteredQueue.some((item) => item.id === selectedId)) {
      setSelectedId(filteredQueue[0].id);
    }
  }, [filteredQueue, selectedId]);

  const selectedItem = useMemo(
    () => filteredQueue.find((item) => item.id === selectedId) || null,
    [filteredQueue, selectedId],
  );

  const refreshAll = async () => {
    await dashboard.refetch();
    toast.success("Dashboard refreshed");
  };

  const handleKpiClick = (tabKey) => {
    if (!tabKey) return;
    setQueueTab(tabKey);
    requestAnimationFrame(() => {
      document.getElementById("se-work-queue")?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    });
  };

  const openModule = (item) => {
    if (!item) return;
    if (item.kind === "ticket") navigate("/tickets");
    else if (item.kind === "lead") navigate("/leads");
    else if (item.href) navigate(item.href);
    else navigate("/properties");
  };

  if (dashboard.isLoading && !(dashboard.queueItems || []).length) {
    return (
      <div className="grid min-h-[320px] place-items-center">
        <RefreshCw className="h-6 w-6 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="-m-3 flex min-h-[calc(100dvh-4rem)] min-w-0 flex-col gap-3 overflow-x-hidden p-3 sm:-m-4 sm:gap-3 sm:p-4 lg:-m-6 lg:gap-3.5 lg:p-4 xl:p-5">
      <div className="w-full shrink-0">
        <SeKpiStrip
          summary={dashboard.summary}
          userName={dashboard.currentUserName}
          rangeLabel={dashboard.rangeLabel}
          preset={dashboard.preset}
          onPresetChange={dashboard.setPreset}
          customFrom={dashboard.customFrom}
          customTo={dashboard.customTo}
          onCustomFromChange={dashboard.setCustomFrom}
          onCustomToChange={dashboard.setCustomTo}
          onApplyCustom={dashboard.applyCustomRange}
          onRefresh={refreshAll}
          isFetching={dashboard.isFetching}
          activeTab={queueTab}
          onMetricClick={handleKpiClick}
          onOpenWorkspace={() => navigate("/sales-executives/work/me")}
          onOpenOnboard={() => navigate("/sales-executives/onboard-user")}
          onOpenFollowUp={() => navigate("/follow-up-tracking")}
          onOpenFieldMeetings={() => navigate("/field-meetings")}
        />
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-3 lg:h-[clamp(520px,calc(100dvh-320px),820px)] lg:min-h-[540px] lg:grid-cols-[minmax(280px,1fr)_minmax(0,1.45fr)_minmax(260px,0.9fr)] lg:overflow-hidden xl:grid-cols-[minmax(300px,1fr)_minmax(0,1.5fr)_minmax(280px,0.9fr)]">
        <div
          id="se-work-queue"
          className="flex min-h-[380px] min-w-0 flex-col max-lg:max-h-[520px] lg:h-full lg:min-h-0"
        >
          <SeQueuePanel
            items={filteredQueue}
            activeTab={queueTab}
            onTabChange={setQueueTab}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>

        <div className="flex min-h-[420px] min-w-0 flex-col lg:h-full lg:min-h-0">
          <SeWorkspacePanel
            item={selectedItem}
            workflowSteps={dashboard.workflowSteps}
            onOpenModule={openModule}
          />
        </div>

        <div className="flex min-h-[360px] min-w-0 flex-col max-lg:max-h-[560px] lg:h-full lg:min-h-0">
          <SeStatusPanel
            summary={dashboard.summary}
            listingChart={dashboard.listingChart}
            todayInteractions={dashboard.todayInteractions}
            onNavigate={navigate}
            rangeLabel={dashboard.rangeLabel}
          />
        </div>
      </div>
    </div>
  );
}
