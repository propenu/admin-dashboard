import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useCustomerSupportHeadDashboard } from "./customerSupportHeadDashboard/useCustomerSupportHeadDashboard";
import { filterTicketsByTab } from "./customerSupportHeadDashboard/customerSupportHeadDashboardData";
import CshKpiStrip from "./customerSupportHeadDashboard/components/CshKpiStrip";
import CshQueuePanel from "./customerSupportHeadDashboard/components/CshQueuePanel";
import CshWorkspacePanel from "./customerSupportHeadDashboard/components/CshWorkspacePanel";
import CshTeamPanel from "./customerSupportHeadDashboard/components/CshTeamPanel";
import CshInsightsPanel from "./customerSupportHeadDashboard/components/CshInsightsPanel";
import {
  buildTicketActor,
  useTicketActions,
  useTicketDetail,
} from "../Tickets/hooks/useTicketWorkspace";

export default function CustomerSupportHeadDashboard() {
  const navigate = useNavigate();
  const dashboard = useCustomerSupportHeadDashboard();
  const actions = useTicketActions();

  const [queueTab, setQueueTab] = useState("unassigned");
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [publicReply, setPublicReply] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const actor = useMemo(
    () => buildTicketActor(dashboard.currentUserQuery.data),
    [dashboard.currentUserQuery.data],
  );

  const filteredQueue = useMemo(() => {
    const visibleIds = new Set(
      filterTicketsByTab(dashboard.tickets, queueTab).map((t) => t._id || t.id),
    );
    return dashboard.queueItems.filter((item) => visibleIds.has(item.id));
  }, [dashboard.queueItems, dashboard.tickets, queueTab]);

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

  const refreshAll = async () => {
    await dashboard.refetch();
    if (selectedTicketId) ticketDetail.refetch();
    toast.success("Support head dashboard refreshed");
  };

  const handleKpiClick = (tabKey) => {
    if (!tabKey) return;
    setQueueTab(tabKey);
    requestAnimationFrame(() => {
      document.getElementById("csh-ticket-queue")?.scrollIntoView({
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
      toast.success("Ticket status updated");
      await dashboard.refetch();
      ticketDetail.refetch();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to update status");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssign = async (member) => {
    if (!selectedTicketId || !member) return;
    setSubmitting(true);
    try {
      await actions.assignTicket.mutateAsync({
        id: selectedTicketId,
        payload: {
          assignedTo: {
            userId: member.id,
            name: member.name,
            email: member.email,
            role: member.roleKey || member.role,
          },
          actor,
        },
      });
      toast.success(`Assigned to ${member.name}`);
      await dashboard.refetch();
      ticketDetail.refetch();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to assign ticket");
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
      if (visibility === "internal") setInternalNote("");
      else setPublicReply("");
      toast.success(visibility === "internal" ? "Internal note saved" : "Reply sent");
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
        <CshKpiStrip
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
          onOpenTickets={() => navigate("/tickets")}
        />
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-3 lg:h-[clamp(520px,calc(100dvh-320px),780px)] lg:min-h-[520px] lg:grid-cols-[minmax(240px,0.85fr)_minmax(0,1.5fr)_minmax(260px,0.95fr)] lg:overflow-hidden xl:grid-cols-[minmax(260px,0.8fr)_minmax(0,1.55fr)_minmax(280px,0.9fr)]">
        <div
          id="csh-ticket-queue"
          className="flex min-h-[340px] min-w-0 flex-col max-lg:max-h-[480px] lg:h-full lg:min-h-0"
        >
          <CshQueuePanel
            items={filteredQueue}
            activeTab={queueTab}
            onTabChange={setQueueTab}
            selectedId={selectedTicketId}
            onSelect={setSelectedTicketId}
          />
        </div>

        <div className="flex min-h-[560px] min-w-0 flex-col lg:h-full lg:min-h-0">
          <CshWorkspacePanel
            ticket={ticketPayload}
            isLoading={ticketDetail.isLoading && Boolean(selectedTicketId)}
            teamMembers={dashboard.teamMembers}
            publicReply={publicReply}
            internalNote={internalNote}
            onPublicReplyChange={setPublicReply}
            onInternalNoteChange={setInternalNote}
            onStatusChange={handleStatusChange}
            onAssign={handleAssign}
            onSendReply={() => handleSendComment("public")}
            onSendNote={() => handleSendComment("internal")}
            submitting={submitting}
          />
        </div>

        <div className="flex min-h-[360px] min-w-0 flex-col max-lg:max-h-[520px] lg:h-full lg:min-h-0">
          <CshTeamPanel
            teamMembers={dashboard.teamMembers}
            onNavigateUsers={() => navigate("/users")}
            onSelectMember={(member) => {
              setQueueTab("open");
              const owned = dashboard.queueItems.find(
                (item) =>
                  String(item.raw?.assignedTo?.userId || item.raw?.assignedTo?._id || "") ===
                  String(member.id),
              );
              if (owned) setSelectedTicketId(owned.id);
            }}
          />
        </div>
      </div>

      <div className="w-full shrink-0">
        <CshInsightsPanel
          summary={dashboard.summary}
          performanceWeek={dashboard.performanceWeek}
          onNavigate={navigate}
        />
      </div>
    </div>
  );
}
