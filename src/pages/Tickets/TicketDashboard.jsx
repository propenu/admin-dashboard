import { useMemo, useState } from "react";
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
import { useTicketDashboard } from "./hooks/useTicketDashboard";
import {
  buildTicketActor,
  useTicketActions,
  useTicketCatalogs,
  useTicketDetail,
  useTicketList,
} from "./hooks/useTicketWorkspace";
import { useCurrentUser } from "../../store/properties/useCurrentUser";

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

  const { data: userData } = useCurrentUser();
  const currentUser = userData?.user;
  const actor = useMemo(() => buildTicketActor(currentUser), [currentUser]);

  const dashboard =
    useTicketDashboard();
  const ticketList = useTicketList(filters);
  const rawTickets = ticketList.data?.data || [];
  const tickets =
    filters.assignment === "unassigned"
      ? rawTickets.filter((ticket) => !ticket.assignedTo?.userId && !ticket.assignedTo?.name)
      : rawTickets;
  const ticketMeta = ticketList.data?.meta || ticketList.data?.pagination;
  const catalogs = useTicketCatalogs();
  const actions = useTicketActions();

  const activeTicketId = selectedTicketId || tickets[0]?._id;
  const detail = useTicketDetail(activeTicketId);

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
      ...patch,
    });
    setActiveTab("queue");
  };

  const openTicket = (ticketId) => {
    if (ticketId) setSelectedTicketId(ticketId);
    setActiveTab("queue");
  };

  const handleCreateTicket = async (payload) => {
    try {
      const created = await actions.createTicket.mutateAsync(payload);
      toast.success("Ticket created");
      setSelectedTicketId(created?._id);
      setActiveTab("queue");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Ticket could not be created");
      throw error;
    }
  };

  if (dashboard.isLoading) return <TicketDashboardSkeleton />;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      <TicketWorkspaceHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onCreate={() => setCreateOpen(true)}
        onRefresh={refreshAll}
        isRefreshing={dashboard.isFetching || ticketList.isFetching || detail.isFetching}
        roleName={currentUser?.roleName}
      />

      {dashboard.isError && (
        <div className="mt-1 rounded-md border border-red-200 bg-red-50 px-2 py-1 text-[11px] font-medium text-red-700">
          Unable to load ticket dashboard overview.
        </div>
      )}

      {activeTab === "overview" && (
        <OverviewTab
          overview={dashboard.overview}
          onOpenQueue={openQueueWithFilters}
          onOpenTicket={openTicket}
        />
      )}

      {activeTab === "queue" && (
        <div className="mt-1 grid min-w-0 items-start gap-1 lg:grid-cols-[minmax(300px,360px)_minmax(0,1fr)] 2xl:grid-cols-[minmax(320px,380px)_minmax(0,1fr)]">
          <TicketQueue
            tickets={tickets}
            meta={ticketMeta}
            filters={filters}
            onFiltersChange={setFilters}
            selectedId={activeTicketId}
            onSelect={setSelectedTicketId}
            isLoading={ticketList.isLoading}
          />
          <TicketDetailPanel
            ticket={detail.data}
            isLoading={detail.isLoading}
            actor={actor}
            actions={actions}
          />
        </div>
      )}

      {activeTab === "config" && (
        <div className="mt-1.5">
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

function OverviewTab({ overview, onOpenQueue, onOpenTicket }) {
  return (
    <div className="mt-0.5 rounded-md  bg-white p-0.5 shadow-sm">
      <TicketMetricGrid overview={overview} onOpenQueue={onOpenQueue} />

      <div className="mt-0.5 grid gap-0.5 md:grid-cols-[1.08fr_0.98fr_1.02fr]">
        <StatusBreakdown overview={overview} onOpenQueue={onOpenQueue} />
        <PriorityBreakdown overview={overview} onOpenQueue={onOpenQueue} />
        <DepartmentBreakdown overview={overview} onOpenQueue={onOpenQueue} />
      </div>

      <div className="mt-0.5 grid gap-0.5 md:grid-cols-[0.95fr_1.75fr]">
        <AssignmentLoad overview={overview} onOpenQueue={onOpenQueue} />
        <SlaPerformance overview={overview} />
      </div>

      <div className="mt-0.5">
        <RecentTicketsTable
          tickets={overview.recent}
          onOpenQueue={onOpenQueue}
          onOpenTicket={onOpenTicket}
        />
      </div>
    </div>
  );
}
