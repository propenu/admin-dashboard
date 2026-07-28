import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useCustomerCareDashboard } from "./customerCareDashboard/useCustomerCareDashboard";
import { filterTicketsByTab } from "./customerCareDashboard/customerCareDashboardData";
import { followUpTrackHref } from "./superAdminDashboard/superAdminDashboardData";
import CustomerCareKpiStrip from "./customerCareDashboard/components/CustomerCareKpiStrip";
import CustomerCareQueuePanel from "./customerCareDashboard/components/CustomerCareQueuePanel";
import CustomerCareWorkspacePanel from "./customerCareDashboard/components/CustomerCareWorkspacePanel";
import CustomerCareStatusPanel from "./customerCareDashboard/components/CustomerCareStatusPanel";
import CustomerCarePerformancePanel from "./customerCareDashboard/components/CustomerCarePerformancePanel";
import {
  buildTicketActor,
  useTicketActions,
  useTicketDetail,
} from "../Tickets/hooks/useTicketWorkspace";

const buildActivityEntry = (title, description) => ({
  id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  title,
  description,
  time: new Date(),
  tone: "bg-emerald-500",
});

export default function CustomerCareDashboard() {
  const navigate = useNavigate();
  const dashboard = useCustomerCareDashboard();
  const actions = useTicketActions();

  const [queueTab, setQueueTab] = useState("all");
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [publicReply, setPublicReply] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [localActivity, setLocalActivity] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const actor = useMemo(
    () => buildTicketActor(dashboard.currentUserQuery.data),
    [dashboard.currentUserQuery.data],
  );

  const filteredQueue = useMemo(() => {
    const visibleIds = new Set(
      filterTicketsByTab(dashboard.tickets, queueTab, dashboard.range).map((t) => t._id || t.id),
    );
    return dashboard.queueItems.filter((item) => visibleIds.has(item.id));
  }, [dashboard.queueItems, dashboard.tickets, dashboard.range, queueTab]);

  useEffect(() => {
    if (!filteredQueue.length) {
      setSelectedTicketId(null);
      return;
    }
    if (!selectedTicketId || !filteredQueue.some((item) => item.id === selectedTicketId)) {
      setSelectedTicketId(filteredQueue[0].id);
    }
  }, [filteredQueue, selectedTicketId]);

  const ticketDetail = useTicketDetail(selectedTicketId);
  const activeTicket = ticketDetail.data?.data || ticketDetail.data || null;

  const todayInteractions = useMemo(() => {
    const localRows = localActivity.map((item) => ({
      id: item.id,
      type: "activity",
      tone: "emerald",
      title: item.title,
      summary: item.description,
      details: [item.description],
      time: item.time,
    }));
    const merged = [...localRows, ...(dashboard.todayInteractions || [])];
    return merged
      .sort((a, b) => (b.time?.getTime?.() || 0) - (a.time?.getTime?.() || 0))
      .slice(0, 20);
  }, [dashboard.todayInteractions, localActivity]);

  const pushActivity = (title, description) => {
    setLocalActivity((c) => [buildActivityEntry(title, description), ...c].slice(0, 10));
  };

  const refreshAll = async () => {
    await dashboard.refetch();
    if (selectedTicketId) ticketDetail.refetch();
    toast.success("Dashboard refreshed");
  };

  const handleKpiClick = (tabKey) => {
    if (!tabKey) return;
    setQueueTab(tabKey);
    requestAnimationFrame(() => {
      document.getElementById("cce-ticket-queue")?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    });
  };

  const handleStatusChange = async (status) => {
    if (!selectedTicketId || !activeTicket) return;
    setSubmitting(true);
    try {
      await actions.changeStatus.mutateAsync({
        id: selectedTicketId,
        payload: { status },
      });
      pushActivity(`Ticket ${status.replaceAll("_", " ")}`, activeTicket.title || "Support ticket");
      toast.success("Ticket updated");
      await dashboard.refetch();
      ticketDetail.refetch();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to update status");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendComment = async (visibility) => {
    if (!selectedTicketId) return;
    const message = visibility === "internal" ? internalNote.trim() : publicReply.trim();
    if (!message) return;
    setSubmitting(true);
    try {
      await actions.addComment.mutateAsync({
        id: selectedTicketId,
        payload: { message, visibility, author: actor },
      });
      if (visibility === "internal") {
        setInternalNote("");
        pushActivity("Internal note added", message.slice(0, 60));
      } else {
        setPublicReply("");
        pushActivity("Replied to customer", message.slice(0, 60));
      }
      ticketDetail.refetch();
      dashboard.refetch();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to send message");
    } finally {
      setSubmitting(false);
    }
  };

  const ticketPayload = activeTicket
    ? {
        ...activeTicket,
        ticketId:
          activeTicket.ticketId ||
          activeTicket.code ||
          `TK-${String(activeTicket._id || "").slice(-5).toUpperCase()}`,
      }
    : null;

  if (dashboard.isLoading && !dashboard.queueItems.length) {
    return (
      <div className="grid min-h-[320px] place-items-center">
        <RefreshCw className="h-6 w-6 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="-m-3 flex min-h-[calc(100dvh-4rem)] min-w-0 flex-col gap-3 overflow-x-hidden p-3 sm:-m-4 sm:gap-3 sm:p-4 lg:-m-6 lg:gap-3.5 lg:p-4 xl:p-5">
      <div className="w-full shrink-0">
        <CustomerCareKpiStrip
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
          onOpenFollowUp={() =>
            navigate(
              followUpTrackHref("onboarding_all", {
                from: dashboard.range?.from,
                to: dashboard.range?.to,
                preset: dashboard.preset,
              }),
            )
          }
        />
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-3 lg:h-[clamp(520px,calc(100dvh-320px),820px)] lg:min-h-[540px] lg:grid-cols-[minmax(280px,1fr)_minmax(0,1.45fr)_minmax(260px,0.9fr)] lg:overflow-hidden xl:grid-cols-[minmax(300px,1fr)_minmax(0,1.5fr)_minmax(280px,0.9fr)] 2xl:grid-cols-[minmax(320px,0.95fr)_minmax(0,1.55fr)_minmax(300px,0.85fr)]">
        <div
          id="cce-ticket-queue"
          className="flex min-h-[380px] min-w-0 flex-col max-lg:max-h-[520px] lg:h-full lg:min-h-0"
        >
          <CustomerCareQueuePanel
            items={filteredQueue}
            activeTab={queueTab}
            onTabChange={setQueueTab}
            selectedId={selectedTicketId}
            onSelect={setSelectedTicketId}
          />
        </div>

        <div className="flex min-h-[560px] min-w-0 flex-col lg:h-full lg:min-h-0">
          <CustomerCareWorkspacePanel
            ticket={ticketPayload}
            isLoading={ticketDetail.isLoading && Boolean(selectedTicketId)}
            publicReply={publicReply}
            internalNote={internalNote}
            onPublicReplyChange={setPublicReply}
            onInternalNoteChange={setInternalNote}
            onStatusChange={handleStatusChange}
            onSendReply={() => handleSendComment("public")}
            onSendNote={() => handleSendComment("internal")}
            submitting={submitting}
            currentUserName={dashboard.currentUserName}
          />
        </div>

        <div className="flex min-h-[360px] min-w-0 flex-col max-lg:max-h-[520px] lg:h-full lg:min-h-0 md:max-lg:col-span-1">
          <CustomerCareStatusPanel
            loginAttemptRows={dashboard.loginAttemptRows}
            projectCounts={dashboard.projectCounts}
            propertyCounts={dashboard.propertyCounts}
            todayInteractions={todayInteractions}
            assignmentNotifications={dashboard.assignmentNotifications || []}
            leadRows={dashboard.leadRows || []}
            onNavigate={navigate}
            onOpenTicket={(id) => {
              setSelectedTicketId(id);
              setQueueTab("all");
              requestAnimationFrame(() => {
                document.getElementById("cce-ticket-queue")?.scrollIntoView({
                  behavior: "smooth",
                  block: "nearest",
                });
              });
            }}
            rangeLabel={dashboard.rangeLabel}
            rangeFrom={dashboard.range?.from || ""}
            rangeTo={dashboard.range?.to || ""}
            rangePreset={dashboard.preset || "today"}
          />
        </div>
      </div>

      <div className="w-full shrink-0">
        <CustomerCarePerformancePanel
          summary={dashboard.summary}
          performanceWeek={dashboard.performanceWeek}
          currentUserName={dashboard.currentUserName}
        />
      </div>
    </div>
  );
}
