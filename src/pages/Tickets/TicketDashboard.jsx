import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import TicketMetricGrid from "./components/TicketMetricGrid";
import StatusBreakdown from "./components/StatusBreakdown";
import PriorityBreakdown from "./components/PriorityBreakdown";
import DepartmentBreakdown from "./components/DepartmentBreakdown";
import AssignmentLoad from "./components/AssignmentLoad";
import SlaPerformance from "./components/SlaPerformance";
import RecentTicketsTable from "./components/RecentTicketsTable";
import TicketTrendsPanel from "./components/TicketTrendsPanel";
import TicketDashboardSkeleton from "./components/TicketDashboardSkeleton";
import TicketWorkspaceHeader from "./components/workspace/TicketWorkspaceHeader";
import TicketQueue from "./components/workspace/TicketQueue";
import TicketDetailPanel from "./components/workspace/TicketDetailPanel";
import TicketCreateModal from "./components/workspace/TicketCreateModal";
import TicketConfigPanel from "./components/workspace/TicketConfigPanel";
import { ticketSurface, ticketSurfaceHover } from "./components/ticketUi";
import { formatDateTime, formatLabel, formatRelativeTime } from "./utils/ticketFormatters";
import { resolveTicketRoleAccess, involvementBadge } from "./utils/ticketRoleAccess";
import { useTicketDashboard } from "./hooks/useTicketDashboard";
import {
  buildTicketActor,
  useTicketActions,
  useTicketCatalogs,
  useTicketDetail,
  useRoleScopedTicketList,
} from "./hooks/useTicketWorkspace";
import { useCurrentUser } from "../../store/properties/useCurrentUser";
import DashboardDateFilter from "../Dashboards/shared/DashboardDateFilter";
import { useDashboardDateRange } from "../Dashboards/shared/useDashboardDateRange";
import { DATE_PRESETS } from "../Dashboards/shared/dashboardDateRange";

const TICKET_DATE_PRESETS = [...DATE_PRESETS, { key: "all", label: "All time" }];

const getTicketId = (ticket) => ticket?._id || ticket?.id;
const getNotificationStorageKey = (userId) =>
  userId ? `ticket-notifications-seen-ids:${userId}` : null;

const toListDateBounds = (from, to) => {
  const bounds = {};
  if (from) bounds.createdFrom = String(from).includes("T") ? from : `${from}T00:00:00.000`;
  if (to) bounds.createdTo = String(to).includes("T") ? to : `${to}T23:59:59.999`;
  return bounds;
};

export default function TicketDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    sortBy: "updatedAt",
    sortOrder: "desc",
    personalScope: "mine",
  });
  const [seenNotificationIds, setSeenNotificationIds] = useState(() => new Set());
  const overviewDateRange = useDashboardDateRange("all", TICKET_DATE_PRESETS);

  const { data: userData } = useCurrentUser();
  const currentUser = userData?.user;
  const roleAccess = useMemo(() => resolveTicketRoleAccess(currentUser), [currentUser]);
  const {
    mode,
    userId: currentUserId,
    roleName,
    canUseFullDesk,
    canAssign,
    canCreate,
    title,
    subtitle,
    availableTabs,
    personalScopes,
    exclusiveAssignee = false,
  } = roleAccess;
  const actor = useMemo(() => buildTicketActor(currentUser), [currentUser]);

  const dashboardScope = useMemo(
    () =>
      exclusiveAssignee && currentUserId
        ? { ownedBy: currentUserId, department: "customer-care" }
        : {},
    [exclusiveAssignee, currentUserId],
  );

  const dashboard = useTicketDashboard(
    canUseFullDesk,
    overviewDateRange.filters,
    dashboardScope,
  );
  const ticketList = useRoleScopedTicketList({
    mode,
    userId: currentUserId,
    filters,
    exclusiveAssignee,
    enabled: Boolean(currentUser) && (canUseFullDesk || Boolean(currentUserId)),
  });
  const tickets = ticketList.tickets || [];
  const ticketMeta = ticketList.meta;
  const catalogs = useTicketCatalogs();
  const actions = useTicketActions();
  const visibleActiveTab =
    activeTab === "notifications" ? "notifications" : canUseFullDesk ? activeTab : "queue";

  const activeTicketId = useMemo(() => {
    if (selectedTicketId && tickets.some((t) => String(t._id) === String(selectedTicketId))) {
      return selectedTicketId;
    }
    return tickets[0]?._id || null;
  }, [selectedTicketId, tickets]);
  const detail = useTicketDetail(activeTicketId);

  useEffect(() => {
    if (!selectedTicketId) return;
    const stillVisible = tickets.some((t) => String(t._id) === String(selectedTicketId));
    if (!stillVisible) setSelectedTicketId(tickets[0]?._id || null);
  }, [tickets, selectedTicketId]);
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
    if (canUseFullDesk) {
      setFilters((current) => {
        const next = { ...current };
        delete next.assignedOrRequested;
        delete next.assignedTo;
        delete next.requesterId;
        delete next.tag;
        if (!next.personalScope) next.personalScope = "mine";
        return next;
      });
      return;
    }

    setActiveTab("queue");
    setFilters((current) => ({
      ...current,
      page: 1,
      personalScope: current.personalScope || "mine",
    }));
  }, [canUseFullDesk, currentUser, currentUserId]);

  useEffect(() => {
    const key = getNotificationStorageKey(currentUserId);
    if (!key) return;
    try {
      const savedIds = JSON.parse(window.localStorage.getItem(key) || "[]");
      setSeenNotificationIds(new Set(Array.isArray(savedIds) ? savedIds : []));
    } catch {
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
    window.localStorage.setItem(key, JSON.stringify([...nextIds]));
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
    const isReassigned =
      patch.assignment === "reassigned" ||
      patch.reassigned === "true" ||
      patch.reassigned === true;
    const isUnassigned =
      patch.assignment === "unassigned" ||
      patch.unassigned === "true" ||
      patch.unassigned === true;
    const isOpenBucket = patch.openBucket === "true" || patch.openBucket === true;
    const hasExplicitDates = Boolean(patch.createdFrom || patch.createdTo);
    // Always carry the Overview period into Queue so KPI clicks match the cards.
    const dateBounds = hasExplicitDates
      ? toListDateBounds(patch.createdFrom, patch.createdTo)
      : toListDateBounds(overviewDateRange.filters.from, overviewDateRange.filters.to);

    const nextPatch = { ...patch };
    delete nextPatch.createdFrom;
    delete nextPatch.createdTo;
    delete nextPatch.from;
    delete nextPatch.to;
    if (isOpenBucket) nextPatch.openBucket = true;
    if (isUnassigned) {
      nextPatch.assignment = "unassigned";
      nextPatch.unassigned = true;
    }
    if (isReassigned) {
      nextPatch.assignment = "reassigned";
      nextPatch.reassigned = true;
    }

    setFilters({
      page: 1,
      limit: 50,
      sortBy: "updatedAt",
      sortOrder: "desc",
      personalScope: "mine",
      ...dateBounds,
      ...nextPatch,
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
      toast.success(
        payload?.assignedTo?.userId
          ? "Ticket created and sent to assignee — it also stays in your Created by me list"
          : "Ticket created",
      );
      setSelectedTicketId(created?._id);
      setActiveTab("queue");
      if (!canUseFullDesk) {
        setFilters((current) => ({ ...current, personalScope: "created", page: 1 }));
      }
      ticketList.refetch();
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
    <div className="relative space-y-3 bg-gradient-to-br from-[#f8fffb] via-white to-[#f7fbff] pb-6 text-slate-900">
      <TicketWorkspaceHeader
        activeTab={visibleActiveTab}
        onTabChange={setActiveTab}
        onCreate={() => setCreateOpen(true)}
        onRefresh={refreshAll}
        isRefreshing={dashboard.isFetching || ticketList.isFetching || detail.isFetching}
        roleName={roleName}
        availableTabs={availableTabs || undefined}
        canCreate={canCreate}
        title={title}
        subtitle={subtitle}
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
          trends={dashboard.trends}
          trendsLoading={dashboard.isFetching}
          dateRange={overviewDateRange}
          listScope={dashboardScope}
          onOpenQueue={openQueueWithFilters}
          onOpenTicket={openTicket}
        />
      )}

      {visibleActiveTab === "queue" && (
        <div className="grid min-w-0 items-stretch gap-3 lg:grid-cols-[minmax(300px,360px)_minmax(0,1fr)] 2xl:grid-cols-[minmax(320px,380px)_minmax(0,1fr)]">
          <TicketQueue
            tickets={tickets}
            meta={ticketMeta}
            filters={filters}
            onFiltersChange={setFilters}
            selectedId={activeTicketId}
            onSelect={selectTicket}
            isLoading={ticketList.isLoading}
            personalScopes={personalScopes}
            currentUserId={currentUserId}
            exclusiveAssignee={exclusiveAssignee}
          />
          <TicketDetailPanel
            ticket={detail.data}
            isLoading={detail.isLoading}
            actor={actor}
            actions={actions}
            canAssign={canAssign}
          />
        </div>
      )}

      {visibleActiveTab === "notifications" && (
        <TicketNotificationsPage
          tickets={tickets}
          seenTicketIds={seenNotificationIds}
          onOpenTicket={openTicket}
          currentUserId={currentUserId}
          mode={mode}
          exclusiveAssignee={exclusiveAssignee}
        />
      )}

      {visibleActiveTab === "config" && (
        <div>
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

function TicketNotificationsPage({
  tickets,
  seenTicketIds,
  onOpenTicket,
  currentUserId,
  mode,
  exclusiveAssignee = false,
}) {
  return (
    <section className={`overflow-hidden ${ticketSurface}`}>
      <div className="flex flex-col gap-3 border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-[20px] font-black text-slate-950">Ticket Notifications</h2>
          <p className="mt-1 text-[12px] font-medium leading-5 text-slate-500">
            {mode === "desk"
              ? exclusiveAssignee
                ? "Tickets on your CCE desk (assigned, created, or reassigned by you)."
                : "Tickets in your current desk list. Open to mark as seen."
              : "Your personal tickets (assigned / created / requester). New ones show as New until opened."}
          </p>
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
            const badge = involvementBadge(ticket, currentUserId);
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
                    {badge && (
                      <span className="rounded-full border border-emerald-200 bg-white px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                        {badge}
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-[12px] font-semibold text-slate-500">
                    {ticket.requester?.name || "Requester"} - {formatLabel(ticket.department)}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-[12px] font-medium text-slate-500">
                    <span className="rounded-full bg-white px-2 py-1 text-[#219653]">
                      {formatLabel(ticket.status)}
                    </span>
                    <span className="rounded-full bg-white px-2 py-1">
                      {formatLabel(ticket.priority)}
                    </span>
                    <span>
                      {ticket.assignedTo?.name
                        ? `Assigned ${ticket.assignedTo.name}`
                        : "Unassigned"}
                    </span>
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

function OverviewTab({
  overview,
  trends,
  trendsLoading,
  dateRange,
  listScope = {},
  onOpenQueue,
  onOpenTicket,
}) {
  return (
    <div className="space-y-3">
      <DashboardDateFilter
        preset={dateRange.preset}
        onPresetChange={dateRange.setPreset}
        customFrom={dateRange.customFrom}
        customTo={dateRange.customTo}
        onCustomFromChange={dateRange.setCustomFrom}
        onCustomToChange={dateRange.setCustomTo}
        onApplyCustom={dateRange.applyCustomRange}
        presets={TICKET_DATE_PRESETS}
        label="Ticket period"
        trailing="Live counts · click any KPI or chart to open the matching queue"
      />

      <TicketMetricGrid
        overview={overview}
        onOpenQueue={onOpenQueue}
        rangeLabel={dateRange.rangeLabel}
      />

      <TicketTrendsPanel
        trends={trends}
        rangeLabel={dateRange.rangeLabel}
        isLoading={trendsLoading && (!trends || trends.length === 0)}
        onDayClick={onOpenQueue}
      />

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
          dateFilters={dateRange.filters}
          scope={listScope}
          onOpenQueue={onOpenQueue}
          onOpenTicket={onOpenTicket}
        />
      </div>
    </div>
  );
}
