import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import TicketMetricGrid from "./components/TicketMetricGrid";
import StatusBreakdown from "./components/StatusBreakdown";
import PriorityBreakdown from "./components/PriorityBreakdown";
import DepartmentBreakdown from "./components/DepartmentBreakdown";
import AssignmentLoad from "./components/AssignmentLoad";
import SlaPerformance from "./components/SlaPerformance";
import RecentTicketsTable from "./components/RecentTicketsTable";
import TicketDashboardSkeleton from "./components/TicketDashboardSkeleton";
import TicketWorkspaceHeader from "./components/workspace/TicketWorkspaceHeader";
import TicketQueue from "./components/workspace/TicketQueue";
import TicketDetailPanel from "./components/workspace/TicketDetailPanel";
import TicketCreateModal from "./components/workspace/TicketCreateModal";
import TicketConfigPanel from "./components/workspace/TicketConfigPanel";
import { ticketSurface, ticketSurfaceHover } from "./components/ticketUi";
import { formatDateTime, formatLabel, formatRelativeTime } from "./utils/ticketFormatters";
import { useTicketDashboard } from "./hooks/useTicketDashboard";
import {
  buildTicketActor,
  useTicketActions,
  useTicketCatalogs,
  useTicketDetail,
  useTicketList,
} from "./hooks/useTicketWorkspace";
import { useCurrentUser } from "../../store/properties/useCurrentUser";

const FULL_TICKET_DESK_ROLES = ["super_admin", "admin", "customer_care"];
const QUEUE_TAB = { key: "queue", label: "Queue", icon: null };

const getUserId = (user) => user?._id || user?.id || user?.userId;
const getTicketId = (ticket) => ticket?._id || ticket?.id;
const getNotificationStorageKey = (userId) =>
  userId ? `ticket-notifications-seen-ids:${userId}` : null;

export default function TicketDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    sortBy: "updatedAt",
    sortOrder: "desc",
  });
  const [seenNotificationIds, setSeenNotificationIds] = useState(() => new Set());

  const { data: userData } = useCurrentUser();
  const currentUser = userData?.user;
  const currentUserId = getUserId(currentUser);
  const roleName = currentUser?.roleName || currentUser?.role;
  const canUseFullDesk = FULL_TICKET_DESK_ROLES.includes(roleName);
  const actor = useMemo(() => buildTicketActor(currentUser), [currentUser]);

  const dashboard = useTicketDashboard(canUseFullDesk);
  const ticketList = useTicketList(
    filters,
    canUseFullDesk || Boolean(currentUserId),
  );
  const rawTickets = ticketList.data?.data || [];
  const tickets =
    filters.assignment === "unassigned"
      ? rawTickets.filter((ticket) => !ticket.assignedTo?.userId && !ticket.assignedTo?.name)
      : rawTickets;
  const ticketMeta = ticketList.data?.meta || ticketList.data?.pagination;
  const catalogs = useTicketCatalogs();
  const actions = useTicketActions();
  const visibleActiveTab =
    activeTab === "notifications" ? "notifications" : canUseFullDesk ? activeTab : "queue";

  const activeTicketId = selectedTicketId || tickets[0]?._id;
  const detail = useTicketDetail(activeTicketId);
  const unreadTicketCount = useMemo(
    () =>
      tickets.filter((ticket) => {
        const ticketId = getTicketId(ticket);
        return ticketId && !seenNotificationIds.has(ticketId);
      }).length,
    [seenNotificationIds, tickets],
  );

  useEffect(() => {
    if (!currentUser) return;
    if (canUseFullDesk) return;

    setActiveTab("queue");
    setFilters((current) => ({
      ...current,
      page: 1,
      assignedTo: undefined,
      assignedOrRequested: currentUserId,
    }));
  }, [canUseFullDesk, currentUser, currentUserId]);

  useEffect(() => {
    const key = getNotificationStorageKey(currentUserId);
    if (!key) return;
    try {
      const savedIds = JSON.parse(window.localStorage.getItem(key) || "[]");
      setSeenNotificationIds(new Set(Array.isArray(savedIds) ? savedIds : []));
    } catch (error) {
      setSeenNotificationIds(new Set());
    }
  }, [currentUserId]);

  useEffect(() => {
    const key = getNotificationStorageKey(currentUserId);
    if (!key || ticketList.isLoading) return;
    if (window.localStorage.getItem(key) !== null) return;

    const currentTicketIds = tickets.map(getTicketId).filter(Boolean);
    window.localStorage.setItem(key, JSON.stringify(currentTicketIds));
    setSeenNotificationIds(new Set(currentTicketIds));
  }, [currentUserId, ticketList.isLoading, tickets]);

  const markNotificationsSeen = () => {
    const key = getNotificationStorageKey(currentUserId);
    if (!key) return;
    const nextIds = new Set(seenNotificationIds);
    tickets.forEach((ticket) => {
      const ticketId = getTicketId(ticket);
      if (ticketId) nextIds.add(ticketId);
    });
    const serializedIds = JSON.stringify([...nextIds]);
    window.localStorage.setItem(key, serializedIds);
    setSeenNotificationIds(nextIds);
  };

  const refreshAll = () => {
    dashboard.refetch();
    ticketList.refetch();
    detail.refetch();
    catalogs.categories.refetch();
    catalogs.departments.refetch();
  };

  const openQueueWithFilters = (patch = {}) => {
    setFilters({
      page: 1,
      limit: 20,
      sortBy: "updatedAt",
      sortOrder: "desc",
      ...(!canUseFullDesk && currentUserId ? { assignedOrRequested: currentUserId } : {}),
      ...patch,
    });
    setActiveTab("queue");
  };

  const openTicket = (ticketId) => {
    if (ticketId) setSelectedTicketId(ticketId);
    markNotificationsSeen();
    setActiveTab("queue");
  };

  const openNotifications = () => {
    markNotificationsSeen();
    setActiveTab("notifications");
  };

  const selectTicket = (ticketId) => {
    if (ticketId) setSelectedTicketId(ticketId);
    markNotificationsSeen();
  };

  const handleCreateTicket = async (payload) => {
    try {
      const created = await actions.createTicket.mutateAsync(payload);
      toast.success("Ticket created");
      setSelectedTicketId(created?._id);
      setActiveTab("queue");
    } catch (error) {
      const responseText =
        typeof error?.response?.data === "string" ? error.response.data : "";
      const isPayloadTooLarge =
        error?.response?.status === 413 || responseText.includes("PayloadTooLargeError");
      toast.error(
        isPayloadTooLarge
          ? "Ticket image is too large. Remove it or choose a smaller image."
          : error?.response?.data?.message || "Ticket could not be created",
      );
      throw error;
    }
  };

  if (!currentUser || (canUseFullDesk && dashboard.isLoading)) {
    return <TicketDashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fffb] via-white to-[#f7fbff] p-2 text-slate-900 sm:p-3">
      <TicketWorkspaceHeader
        activeTab={visibleActiveTab}
        onTabChange={setActiveTab}
        onCreate={() => setCreateOpen(true)}
        onRefresh={refreshAll}
        isRefreshing={dashboard.isFetching || ticketList.isFetching || detail.isFetching}
        roleName={roleName}
        availableTabs={canUseFullDesk ? undefined : [QUEUE_TAB]}
        canCreate
        title={canUseFullDesk ? "Ticket Desk" : "My Assigned Tickets"}
        subtitle={
          canUseFullDesk
            ? "Support queue, SLA health, requester conversations, and team workflow."
            : "Tickets assigned to you by the support desk."
        }
        notificationCount={unreadTicketCount}
        onOpenNotifications={openNotifications}
      />

      {dashboard.isError && (
        <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[12px] font-bold text-red-700">
          Unable to load ticket dashboard overview.
        </div>
      )}

      {visibleActiveTab === "overview" && (
        <OverviewTab
          overview={dashboard.overview}
          onOpenQueue={openQueueWithFilters}
          onOpenTicket={openTicket}
        />
      )}

      {visibleActiveTab === "queue" && (
        <div className="mt-3 space-y-3">
          {!canUseFullDesk && (
            <AssignedTicketNotice
              total={ticketMeta?.total || tickets.length || 0}
              userName={currentUser?.name}
            />
          )}
          <div className="grid min-w-0 items-start gap-3 lg:grid-cols-[minmax(330px,390px)_minmax(0,1fr)] 2xl:grid-cols-[minmax(360px,420px)_minmax(0,1fr)]">
          <TicketQueue
            tickets={tickets}
            meta={ticketMeta}
            filters={filters}
            onFiltersChange={setFilters}
            selectedId={activeTicketId}
            onSelect={selectTicket}
            isLoading={ticketList.isLoading}
          />
          <TicketDetailPanel
            ticket={detail.data}
            isLoading={detail.isLoading}
            actor={actor}
            actions={actions}
            canAssign={canUseFullDesk}
          />
          </div>
        </div>
      )}

      {visibleActiveTab === "notifications" && (
        <TicketNotificationsPage
          tickets={tickets}
          seenTicketIds={seenNotificationIds}
          onOpenTicket={openTicket}
        />
      )}

      {visibleActiveTab === "config" && (
        <div className="mt-3">
          <TicketConfigPanel
            categories={catalogs.categoryItems}
            departments={catalogs.departmentItems}
            isLoading={catalogs.categories.isLoading || catalogs.departments.isLoading}
          />
        </div>
      )}

      <TicketCreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreateTicket}
        isSubmitting={actions.createTicket.isPending}
        departments={catalogs.departmentItems}
        categories={catalogs.categoryItems}
        currentUser={currentUser}
      />
    </div>
  );
}

function TicketNotificationsPage({ tickets, seenTicketIds, onOpenTicket }) {
  return (
    <section className={`mt-3 overflow-hidden ${ticketSurface}`}>
      <div className="flex flex-col gap-3 border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-[20px] font-black text-slate-950">Ticket Notifications</h2>
          <p className="mt-1 text-[12px] font-medium leading-5 text-slate-500">New assigned tickets appear here. Opening this page marks the current list as seen, and later assignments show as new.</p>
        </div>
        <span className="w-fit rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-[12px] font-bold text-[#219653] shadow-sm">
          {tickets.length} total
        </span>
      </div>

      <div className="grid gap-3 p-4">
        {tickets.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-[12px] font-semibold text-slate-500">
            No ticket notifications found.
          </div>
        ) : (
          tickets.map((ticket) => {
            const ticketId = getTicketId(ticket);
            const isNew = ticketId && !seenTicketIds.has(ticketId);
            return (
              <button
                key={ticketId || ticket.title}
                type="button"
                onClick={() => onOpenTicket(ticketId)}
                className={`flex w-full flex-col gap-3 rounded-2xl border p-4 text-left transition sm:flex-row sm:items-start sm:justify-between ${
                  isNew
                    ? "border-emerald-200 bg-emerald-50/70 shadow-[0_18px_35px_rgba(39,174,96,0.12)]"
                    : `border-slate-200 bg-white ${ticketSurfaceHover}`
                }`}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-[14px] font-bold text-slate-950">
                      {ticket.title || "Untitled ticket"}
                    </p>
                    {isNew && (
                      <span className="rounded-full bg-[#27AE60] px-2 py-0.5 text-[10px] font-bold text-white">
                        New
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-[12px] font-semibold text-slate-500">
                    {ticket.requester?.name || "Requester"} - {formatLabel(ticket.department)}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-[12px] font-medium text-slate-500">
                    <span className="rounded-full bg-white px-2 py-1 text-[#219653]">{formatLabel(ticket.status)}</span>
                    <span className="rounded-full bg-white px-2 py-1">{formatLabel(ticket.priority)}</span>
                    <span>{ticket.assignedTo?.name ? `Assigned ${ticket.assignedTo.name}` : "Unassigned"}</span>
                    <span>Created {formatDateTime(ticket.createdAt)}</span>
                  </div>
                </div>
                <span className="shrink-0 text-[12px] font-bold text-slate-400">
                  {formatRelativeTime(ticket.createdAt || ticket.updatedAt)}
                </span>
              </button>
            );
          })
        )}
      </div>
    </section>
  );
}

function AssignedTicketNotice({ total, userName }) {
  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[12px] font-medium text-[#17683b]">
      <span className="font-semibold">{total}</span> ticket{total === 1 ? "" : "s"} assigned to{" "}
      <span className="font-semibold">{userName || "you"}</span>. New assignments appear here after the admin saves an assignee with your user ID.
    </div>
  );
}

function OverviewTab({ overview, onOpenQueue, onOpenTicket }) {
  return (
    <div className="mt-3 space-y-3">
      <TicketMetricGrid overview={overview} onOpenQueue={onOpenQueue} />

      <div className="grid gap-3 md:grid-cols-[1.08fr_0.98fr_1.02fr]">
        <StatusBreakdown overview={overview} onOpenQueue={onOpenQueue} />
        <PriorityBreakdown overview={overview} onOpenQueue={onOpenQueue} />
        <DepartmentBreakdown overview={overview} onOpenQueue={onOpenQueue} />
      </div>

      <div className="grid gap-3 md:grid-cols-[0.95fr_1.75fr]">
        <AssignmentLoad overview={overview} onOpenQueue={onOpenQueue} />
        <SlaPerformance overview={overview} />
      </div>

      <div>
        <RecentTicketsTable
          tickets={overview.recent}
          onOpenQueue={onOpenQueue}
          onOpenTicket={onOpenTicket}
        />
      </div>
    </div>
  );
}
