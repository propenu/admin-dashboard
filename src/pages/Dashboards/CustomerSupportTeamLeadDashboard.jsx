import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  AlertTriangle,
  ArrowUp,
  BarChart3,
  CalendarDays,
  ChevronDown,
  Clock3,
  Inbox,
  MessageSquare,
  RefreshCw,
  Search,
  ShieldCheck,
  Ticket,
  Users,
  X,
} from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { useCustomerSupportTeamLeadDashboard } from "./customerSupportTeamLeadDashboard/useCustomerSupportTeamLeadDashboard";
import { filterTicketsByTab } from "./customerSupportTeamLeadDashboard/customerSupportTeamLeadDashboardData";
import TlQueuePanel from "./customerSupportTeamLeadDashboard/components/TlQueuePanel";
import CshWorkspacePanel from "./customerSupportHeadDashboard/components/CshWorkspacePanel";
import CceTerritoryManagerModal from "./customerSupportTeamLeadDashboard/components/CceTerritoryManagerModal";
import TlClientProgressPanel from "./customerSupportTeamLeadDashboard/TlClientProgressPanel";
import { useTlClientProgressReport } from "./customerSupportTeamLeadDashboard/useTlClientProgressReport";
import DashboardDateFilter from "./shared/DashboardDateFilter";
import { followUpTrackHref } from "./superAdminDashboard/superAdminDashboardData";
import {
  buildTicketActor,
  useTicketActions,
  useTicketDetail,
} from "../Tickets/hooks/useTicketWorkspace";

const fmt = (v) => Number(v || 0).toLocaleString("en-IN");
const cleanRole = (value = "") => String(value || "").replace(/_/g, " ");

const isCceMember = (member) => {
  const key = String(member?.roleKey || member?.role || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_");
  return (
    key.includes("customer_care") ||
    key === "customer_care" ||
    key === "customer_care_executive" ||
    key === "customer_care_executives"
  );
};

const TABS = [
  { id: "overview", icon: BarChart3, label: "Performance Overview" },
  { id: "directory", icon: Users, label: "Team Directory" },
];

export default function CustomerSupportTeamLeadDashboard() {
  const navigate = useNavigate();
  const dashboard = useCustomerSupportTeamLeadDashboard();
  const clientProgress = useTlClientProgressReport(
    dashboard.range || {},
    dashboard.filters || {},
  );
  const actions = useTicketActions();

  const [activeTab, setActiveTab] = useState("overview");
  const [queueTab, setQueueTab] = useState("unassigned");
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [publicReply, setPublicReply] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [dirRole, setDirRole] = useState("All roles");
  const [dirStatus, setDirStatus] = useState("All Statuses");
  const [dirSearch, setDirSearch] = useState("");
  const [territoryMember, setTerritoryMember] = useState(null);

  const actor = useMemo(
    () => buildTicketActor(dashboard.currentUserQuery.data),
    [dashboard.currentUserQuery.data],
  );

  const currentUser = dashboard.currentUserQuery.data;
  const summary = dashboard.summary || {};

  const filteredQueue = useMemo(() => {
    const visibleIds = new Set(
      filterTicketsByTab(dashboard.tickets, queueTab).map((t) => t._id || t.id),
    );
    return (dashboard.queueItems || []).filter((item) => visibleIds.has(item.id));
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

  const overviewKPIs = useMemo(
    () => [
      {
        id: "open",
        icon: Ticket,
        label: "Open Queue",
        value: fmt(summary.openTickets),
        note: `${fmt(summary.resolvedToday)} resolved today`,
        tab: "open",
      },
      {
        id: "urgent",
        icon: AlertCircle,
        label: "Urgent / High",
        value: fmt(summary.urgentCount),
        note: "Needs lead attention",
        tab: "urgent",
      },
      {
        id: "unassigned",
        icon: Inbox,
        label: "Unassigned",
        value: fmt(summary.unassignedCount),
        note: "Ready to assign",
        tab: "unassigned",
      },
      {
        id: "sla",
        icon: AlertTriangle,
        label: "SLA Risk",
        value: fmt(summary.overdueCount),
        note: "Past due tickets",
        tab: "overdue",
      },
      {
        id: "reply",
        icon: MessageSquare,
        label: "Reply pending",
        value: fmt(summary.awaitingCount),
        note: "Waiting on buyer",
        tab: "awaiting",
      },
      {
        id: "team",
        icon: Users,
        label: "Pod Members",
        value: fmt(summary.teamSize),
        note: `${fmt(summary.teamOnline)} online now`,
        tab: null,
      },
    ],
    [summary],
  );

  const chartData = useMemo(
    () =>
      (dashboard.performanceWeek || []).map((item) => ({
        day: String(item.day || "").slice(0, 3),
        resolved: Number(item.resolved || 0),
      })),
    [dashboard.performanceWeek],
  );
  const maxResolved = Math.max(...chartData.map((d) => d.resolved), 1);

  const roleOptions = useMemo(() => {
    const roles = [
      ...new Set((dashboard.teamMembers || []).map((m) => m.roleKey || cleanRole(m.role)).filter(Boolean)),
    ];
    return roles.sort();
  }, [dashboard.teamMembers]);

  const filteredMembers = useMemo(() => {
    return (dashboard.teamMembers || []).filter((member) => {
      const roleKey = String(member.roleKey || "").toLowerCase();
      const roleLabel = String(member.role || "").toLowerCase();
      const status = member.isOnline ? "online" : "offline";
      const matchRole =
        dirRole === "All roles" ||
        roleKey === dirRole ||
        roleLabel === dirRole.replace(/_/g, " ");
      const matchStatus =
        dirStatus === "All Statuses" ||
        (dirStatus === "Online" && status === "online") ||
        (dirStatus === "Offline" && status === "offline");
      const q = dirSearch.trim().toLowerCase();
      const matchSearch =
        !q ||
        String(member.name || "")
          .toLowerCase()
          .includes(q) ||
        String(member.email || "")
          .toLowerCase()
          .includes(q) ||
        roleLabel.includes(q);
      return matchRole && matchStatus && matchSearch;
    });
  }, [dashboard.teamMembers, dirRole, dirSearch, dirStatus]);

  const refreshAll = async () => {
    await Promise.all([dashboard.refetch(), clientProgress.refetch()]);
    if (selectedTicketId) ticketDetail.refetch();
    toast.success("Team lead dashboard refreshed");
  };

  const handleKpiClick = (tabKey) => {
    if (!tabKey) {
      setActiveTab("directory");
      return;
    }
    setActiveTab("overview");
    setQueueTab(tabKey);
    requestAnimationFrame(() => {
      document.getElementById("tl-ticket-queue")?.scrollIntoView({
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

  if (dashboard.isLoading && !(dashboard.queueItems || []).length) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <LoadingSpinner size="lg" />
          <p className="text-sm font-semibold text-slate-500">Loading Team Lead Dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 antialiased">
      <AnimatePresence>
        {dashboard.isFetching && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="pointer-events-none fixed right-5 top-5 z-50 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-[11px] font-semibold text-white shadow-xl"
          >
            Syncing live ticket data…
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-x-hidden p-3 sm:p-5 lg:p-6">
        {/* Header — RM style, no Reports tab */}
        <div className="mb-5 flex flex-col gap-4 border-b border-slate-200/80 pb-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-emerald-700">
                <ShieldCheck size={13} className="text-emerald-600" />
                Support Team Lead Hub
              </span>
              <span className="text-xs text-slate-400">
                {currentUser?.city || currentUser?.state
                  ? `• ${[currentUser?.city, currentUser?.state].filter(Boolean).join(", ")}`
                  : "• Customer care pod"}
              </span>
            </div>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
              {activeTab === "directory"
                ? "Team Directory"
                : "Team Lead Performance Dashboard"}
            </h1>
            <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
              {activeTab === "directory"
                ? "Find Customer Care executives and RMs in your pod."
                : "Track buyer tickets, SLA risk, assignments and pod performance — live data."}
            </p>
            {dashboard.rangeLabel ? (
              <p className="mt-1 text-[11px] text-slate-400">
                Period{" "}
                <strong className="font-semibold text-slate-600">{dashboard.rangeLabel}</strong>
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1 text-xs font-bold shadow-sm">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all ${
                    activeTab === t.id
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <t.icon size={14} />
                  <span className="hidden sm:inline">{t.label}</span>
                  <span className="sm:hidden">{t.id === "overview" ? "Overview" : "Team"}</span>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() =>
                navigate(
                  followUpTrackHref("onboarding_all", {
                    from: dashboard.range?.from,
                    to: dashboard.range?.to,
                    preset: dashboard.preset,
                  }),
                )
              }
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700"
            >
              Client Progress Queue
            </button>

            {currentUser && (
              <div className="hidden items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 shadow-sm sm:flex">
                <div className="relative">
                  <div className="grid h-8 w-8 place-items-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                    {(currentUser.name || currentUser.email || "T").slice(0, 1).toUpperCase()}
                  </div>
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                </div>
                <div className="text-left leading-tight">
                  <div className="text-xs font-bold text-slate-900">
                    {currentUser.name || currentUser.email?.split("@")[0] || "Team Lead"}
                  </div>
                  <div className="text-[10px] font-semibold text-slate-400">
                    Customer Support Team Lead
                  </div>
                </div>
                <ChevronDown size={14} className="text-slate-400" />
              </div>
            )}

            <button
              type="button"
              onClick={refreshAll}
              className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50"
              aria-label="Refresh dashboard"
            >
              <RefreshCw
                size={15}
                className={dashboard.isFetching ? "animate-spin text-emerald-600" : ""}
              />
            </button>
          </div>
        </div>

        <div className="mb-5">
          <DashboardDateFilter
            preset={dashboard.preset}
            onPresetChange={dashboard.setPreset}
            customFrom={dashboard.customFrom}
            customTo={dashboard.customTo}
            onCustomFromChange={dashboard.setCustomFrom}
            onCustomToChange={dashboard.setCustomTo}
            onApplyCustom={dashboard.applyCustomRange}
          />
        </div>

        {/* ═══ Overview ═══ */}
        {activeTab === "overview" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-5"
          >
            <TlClientProgressPanel
              report={clientProgress.report}
              isLoading={clientProgress.isLoading}
              rangeLabel={dashboard.rangeLabel}
            />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm">
                  <CalendarDays size={14} className="text-slate-500" />
                  <span>
                    {dashboard.rangeLabel ||
                      new Date().toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                  </span>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm">
                  <Clock3 size={14} className="text-slate-500" />
                  <span>
                    Avg response {fmt(summary.firstResponseMinutes)} min · resolve{" "}
                    {fmt(summary.avgResolutionMinutes)} min
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate("/tickets")}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700"
              >
                <Ticket size={14} />
                Ticket desk
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 sm:gap-4">
              {overviewKPIs.map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleKpiClick(m.tab)}
                    className="rounded-2xl border border-slate-200/90 bg-white p-4 text-left shadow-sm transition-all hover:border-emerald-300 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-slate-500">{m.label}</p>
                        <p className="mt-1 text-2xl font-black text-slate-950">{m.value}</p>
                      </div>
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                        <Icon size={20} />
                      </span>
                    </div>
                    <p className="mt-3 flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                      <ArrowUp size={12} className="stroke-[3]" />
                      <span className="truncate">{m.note}</span>
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-[minmax(280px,0.9fr)_minmax(0,1.5fr)] xl:items-stretch">
              <div
                id="tl-ticket-queue"
                className="flex min-h-[420px] min-w-0 flex-col overflow-hidden xl:max-h-[640px]"
              >
                <TlQueuePanel
                  items={filteredQueue}
                  activeTab={queueTab}
                  onTabChange={setQueueTab}
                  selectedId={selectedTicketId}
                  onSelect={setSelectedTicketId}
                />
              </div>
              <div className="flex min-h-[420px] min-w-0 flex-col overflow-hidden xl:max-h-[640px]">
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
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(260px,0.8fr)]">
              <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-2 flex items-baseline justify-between gap-2">
                  <h3 className="text-sm font-bold text-slate-900">Pod resolved (7 days)</h3>
                  <p className="text-xs text-slate-500">
                    <span className="text-base font-black text-slate-950">
                      {fmt(summary.weeklyResolved)}
                    </span>{" "}
                    closed
                  </p>
                </div>
                <div className="h-[160px] w-full min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                      <XAxis
                        dataKey="day"
                        tick={{ fontSize: 10, fill: "#94a3b8" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        allowDecimals={false}
                        domain={[0, maxResolved]}
                        tick={{ fontSize: 10, fill: "#94a3b8" }}
                        axisLine={false}
                        tickLine={false}
                        width={28}
                      />
                      <Tooltip
                        cursor={{ fill: "rgba(16,185,129,0.08)" }}
                        contentStyle={{
                          borderRadius: 10,
                          border: "1px solid #e2e8f0",
                          fontSize: 11,
                        }}
                      />
                      <Bar dataKey="resolved" radius={[4, 4, 0, 0]} maxBarSize={28}>
                        {chartData.map((entry, i) => (
                          <Cell key={i} fill={entry.resolved > 0 ? "#10b981" : "#e2e8f0"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </article>

              <article className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-4 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                  Lead focus
                </p>
                <p className="mt-2 text-sm font-bold text-slate-900">
                  Clear unassigned tickets before SLA breaks
                </p>
                <ul className="mt-3 space-y-2 text-xs text-slate-600">
                  <li className="flex justify-between gap-2 border-b border-emerald-100 pb-2">
                    <span>Unassigned</span>
                    <strong className="text-slate-900">{fmt(summary.unassignedCount)}</strong>
                  </li>
                  <li className="flex justify-between gap-2 border-b border-emerald-100 pb-2">
                    <span>SLA risk</span>
                    <strong className="text-rose-600">{fmt(summary.overdueCount)}</strong>
                  </li>
                  <li className="flex justify-between gap-2 border-b border-emerald-100 pb-2">
                    <span>Reply pending</span>
                    <strong className="text-slate-900">{fmt(summary.awaitingCount)}</strong>
                  </li>
                  <li className="flex justify-between gap-2">
                    <span>Pod online</span>
                    <strong className="text-emerald-700">
                      {fmt(summary.teamOnline)}/{fmt(summary.teamSize)}
                    </strong>
                  </li>
                </ul>
              </article>
            </div>
          </motion.div>
        )}

        {/* ═══ Team Directory (no Reports) ═══ */}
        {activeTab === "directory" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <label className="min-w-0">
                  <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Role
                  </span>
                  <select
                    value={dirRole}
                    onChange={(e) => setDirRole(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none focus:border-emerald-500"
                  >
                    <option value="All roles">All roles</option>
                    {roleOptions.map((role) => (
                      <option key={role} value={role}>
                        {cleanRole(role)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="min-w-0">
                  <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Status
                  </span>
                  <select
                    value={dirStatus}
                    onChange={(e) => setDirStatus(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none focus:border-emerald-500"
                  >
                    <option>All Statuses</option>
                    <option>Online</option>
                    <option>Offline</option>
                  </select>
                </label>
                <label className="min-w-0 sm:col-span-2">
                  <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Search
                  </span>
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={15} />
                    <input
                      value={dirSearch}
                      onChange={(e) => setDirSearch(e.target.value)}
                      placeholder="Search name, email or role"
                      className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-9 text-xs font-semibold outline-none focus:border-emerald-500"
                    />
                    {dirSearch && (
                      <button
                        type="button"
                        onClick={() => setDirSearch("")}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </label>
              </div>
              <p className="mt-3 text-xs font-semibold text-slate-500">
                Showing {filteredMembers.length} of {(dashboard.teamMembers || []).length} pod
                members
              </p>
            </div>

            {filteredMembers.length ? (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {filteredMembers.map((member) => {
                  const initials = String(member.name || "U")
                    .split(/\s+/)
                    .slice(0, 2)
                    .map((p) => p[0])
                    .join("")
                    .toUpperCase();
                  return (
                    <article
                      key={member.id}
                      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-emerald-300 hover:shadow-md"
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative grid h-12 w-12 shrink-0 place-items-center rounded-xl border-2 border-emerald-200 bg-emerald-50 text-sm font-black text-emerald-700">
                          {initials}
                          <span
                            className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${
                              member.isOnline ? "bg-emerald-500" : "bg-slate-300"
                            }`}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-sm font-black text-slate-900">
                            {member.name}
                          </h3>
                          <p className="mt-0.5 truncate text-[11px] font-bold uppercase tracking-wide text-emerald-600">
                            {member.role}
                          </p>
                          <p className="mt-1 truncate text-xs text-slate-500">{member.email || "—"}</p>
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-center">
                        <div>
                          <p className="text-sm font-black text-slate-900">{fmt(member.open)}</p>
                          <p className="text-[10px] font-semibold text-slate-400">Open</p>
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900">{fmt(member.resolved)}</p>
                          <p className="text-[10px] font-semibold text-slate-400">Resolved</p>
                        </div>
                        <div>
                          <p className="text-sm font-black text-rose-600">{fmt(member.overdue)}</p>
                          <p className="text-[10px] font-semibold text-slate-400">Overdue</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab("overview");
                          setQueueTab("open");
                          const owned = (dashboard.queueItems || []).find(
                            (item) =>
                              String(
                                item.raw?.assignedTo?.userId || item.raw?.assignedTo?._id || "",
                              ) === String(member.id),
                          );
                          if (owned) setSelectedTicketId(owned.id);
                        }}
                        className="mt-3 w-full rounded-xl border border-emerald-200 bg-emerald-50 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100"
                      >
                        View their open tickets
                      </button>
                      {isCceMember(member) ? (
                        <button
                          type="button"
                          onClick={() => setTerritoryMember(member)}
                          className="mt-2 w-full rounded-xl border border-slate-200 bg-white py-2 text-xs font-bold text-slate-700 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
                        >
                          Manage working locations
                        </button>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
                <Users className="mx-auto mb-3 text-slate-300" size={36} />
                <p className="font-bold text-slate-600">No pod members match these filters</p>
                <p className="mt-1 text-xs text-slate-400">
                  Clear filters or assign Customer Care / RM credentials under your role
                </p>
              </div>
            )}
          </motion.div>
        )}
      </div>

      <CceTerritoryManagerModal
        open={Boolean(territoryMember)}
        member={territoryMember}
        onClose={() => setTerritoryMember(null)}
        onSaved={() => dashboard.refetch?.()}
      />
    </div>
  );
}
