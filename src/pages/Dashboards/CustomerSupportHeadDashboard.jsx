import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw, Search, Users, X } from "lucide-react";
import { toast } from "sonner";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { useCustomerSupportHeadDashboard } from "./customerSupportHeadDashboard/useCustomerSupportHeadDashboard";
import { filterTicketsByTab } from "./customerSupportHeadDashboard/customerSupportHeadDashboardData";
import CshQueuePanel from "./customerSupportHeadDashboard/components/CshQueuePanel";
import CshWorkspacePanel from "./customerSupportHeadDashboard/components/CshWorkspacePanel";
import CshCommandOverview from "./customerSupportHeadDashboard/commandOverview/CshCommandOverview";
import { useCshClientProgressReport } from "./customerSupportHeadDashboard/useCshClientProgressReport";
import {
  buildTicketActor,
  useTicketActions,
  useTicketDetail,
} from "../Tickets/hooks/useTicketWorkspace";

const fmt = (v) => Number(v || 0).toLocaleString("en-IN");
const cleanRole = (value = "") => String(value || "").replace(/_/g, " ");

export default function CustomerSupportHeadDashboard() {
  const navigate = useNavigate();
  const dashboard = useCustomerSupportHeadDashboard();
  const [activeTab, setActiveTab] = useState("overview");
  const clientProgress = useCshClientProgressReport(
    dashboard.range || {},
    dashboard.filters || {},
    { enabled: activeTab === "overview" },
  );
  const actions = useTicketActions();

  const [queueTab, setQueueTab] = useState("unassigned");
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [publicReply, setPublicReply] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [dirRole, setDirRole] = useState("All roles");
  const [dirStatus, setDirStatus] = useState("All Statuses");
  const [dirSearch, setDirSearch] = useState("");
  const [queuePodIds, setQueuePodIds] = useState(null);
  const [queuePodName, setQueuePodName] = useState("");

  useEffect(() => {
    setQueuePodIds(null);
    setQueuePodName("");
  }, [dashboard.preset, dashboard.range?.from, dashboard.range?.to]);

  const actor = useMemo(
    () => buildTicketActor(dashboard.currentUserQuery.data),
    [dashboard.currentUserQuery.data],
  );

  const currentUser = dashboard.currentUserQuery.data;
  const summary = dashboard.summary || {};
  const assignMembers = dashboard.assignMembers || dashboard.teamMembers || [];

  const filteredQueue = useMemo(() => {
    const sourceTickets = dashboard.periodTickets || dashboard.tickets || [];
    const visibleIds = new Set(
      filterTicketsByTab(sourceTickets, queueTab).map((t) => t._id || t.id),
    );
    let items = (dashboard.queueItems || []).filter((item) => visibleIds.has(item.id));
    if (queuePodIds?.length) {
      const allowed = new Set(queuePodIds.map(String));
      items = items.filter((item) =>
        allowed.has(
          String(
            item.assignedToId ||
              item.raw?.assignedTo?.userId ||
              item.raw?.assignedTo?._id ||
              "",
          ),
        ),
      );
    }
    return items;
  }, [dashboard.queueItems, dashboard.periodTickets, dashboard.tickets, queueTab, queuePodIds]);

  useEffect(() => {
    if (!filteredQueue.length) {
      setSelectedTicketId(null);
      return;
    }
    if (!selectedTicketId || !filteredQueue.some((item) => item.id === selectedTicketId)) {
      setSelectedTicketId(filteredQueue[0].id);
    }
  }, [filteredQueue, selectedTicketId]);

  const ticketDetail = useTicketDetail(
    activeTab === "overview" ? selectedTicketId : null,
  );
  const activeTicket = ticketDetail.data?.data || ticketDetail.data || null;

  const directoryMembers = useMemo(
    () =>
      (dashboard.teamMembers || []).filter((m) => {
        const key = String(m.roleKey || "").toLowerCase();
        return key && key !== "assignee";
      }),
    [dashboard.teamMembers],
  );

  const roleOptions = useMemo(() => {
    const roles = [
      ...new Set(
        directoryMembers
          .map((m) => m.roleKey || cleanRole(m.role))
          .filter((role) => {
            const key = String(role || "")
              .toLowerCase()
              .replace(/\s+/g, "_");
            return key && key !== "assignee";
          }),
      ),
    ];
    return roles.sort();
  }, [directoryMembers]);

  const filteredMembers = useMemo(() => {
    return directoryMembers.filter((member) => {
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
  }, [directoryMembers, dirRole, dirSearch, dirStatus]);

  const refreshAll = async () => {
    if (dashboard.isFetching || clientProgress.isFetching) return;
    await Promise.all([dashboard.refetch(), clientProgress.refetch()]);
    if (selectedTicketId) ticketDetail.refetch();
    toast.success("Command Overview refreshed");
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

  if (dashboard.isLoading && !(dashboard.queueItems || []).length) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <LoadingSpinner size="lg" />
          <p className="text-sm font-semibold text-slate-500">Loading Command Overview…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 antialiased">
      <div className="mx-auto w-full max-w-[1600px] p-2 sm:p-3 lg:p-4">
        {activeTab === "overview" && (
          <div className="space-y-3">
            <CshCommandOverview
              dashboard={dashboard}
              clientProgress={clientProgress}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onOpenDirectory={() => setActiveTab("directory")}
              onViewTickets={(pod, tab = "open") => {
                if (pod?.memberIds?.length || pod?.cceIds?.length) {
                  setQueuePodIds(pod.memberIds?.length ? pod.memberIds : pod.cceIds);
                  setQueuePodName(pod.name || "Team Lead pod");
                  setQueueTab(tab || "open");
                } else {
                  setQueuePodIds(null);
                  setQueuePodName("");
                  setQueueTab(tab || "unassigned");
                }
                setActiveTab("overview");
                requestAnimationFrame(() => {
                  document
                    .getElementById("csh-ticket-queue")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" });
                });
              }}
              navigate={navigate}
              onRefresh={refreshAll}
              isFetching={dashboard.isFetching || clientProgress.isFetching}
              headName={
                currentUser?.name ||
                currentUser?.email?.split("@")[0] ||
                dashboard.currentUserName ||
                "Support Head"
              }
            />

            <section className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
                <p className="text-[11px] font-semibold text-slate-500">
                  Ticket desk
                  {dashboard.rangeLabel ? (
                    <>
                      {" · "}
                      <strong className="text-slate-700">{dashboard.rangeLabel}</strong>
                    </>
                  ) : null}
                  {" · "}unassigned{" "}
                  <strong className="text-slate-800">{fmt(summary.unassignedCount)}</strong>
                  {" · "}SLA{" "}
                  <strong className="text-orange-600">{fmt(summary.overdueCount)}</strong>
                  {queuePodIds?.length ? (
                    <>
                      {" · "}Pod{" "}
                      <strong className="text-emerald-700">
                        {queuePodName || "Selected"}
                      </strong>
                    </>
                  ) : null}
                </p>
                <div className="flex flex-wrap items-center gap-1.5">
                  {queuePodIds?.length ? (
                    <button
                      type="button"
                      onClick={() => {
                        setQueuePodIds(null);
                        setQueuePodName("");
                      }}
                      className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100"
                    >
                      Clear pod filter
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => navigate("/tickets")}
                    className="rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:border-emerald-300 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  >
                    Full ticket desk
                  </button>
                </div>
              </div>

              <div className="grid min-w-0 grid-cols-1 gap-3 lg:grid-cols-12 lg:items-stretch">
                <div
                  id="csh-ticket-queue"
                  className="flex min-h-[320px] min-w-0 flex-col overflow-hidden lg:col-span-5 lg:max-h-[520px]"
                >
                  <CshQueuePanel
                    items={filteredQueue}
                    activeTab={queueTab}
                    onTabChange={setQueueTab}
                    selectedId={selectedTicketId}
                    onSelect={setSelectedTicketId}
                  />
                </div>
                <div className="flex min-h-[320px] min-w-0 flex-col overflow-hidden lg:col-span-7 lg:max-h-[520px]">
                  <CshWorkspacePanel
                    ticket={ticketPayload}
                    isLoading={ticketDetail.isLoading && Boolean(selectedTicketId)}
                    teamMembers={assignMembers}
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
            </section>
          </div>
        )}

        {activeTab === "directory" && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <div>
                <h1 className="text-xl font-black text-slate-950">Team Directory</h1>
                <p className="text-[11px] text-slate-500">
                  Team Leads, CCEs & RMs under Support Head
                </p>
              </div>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setActiveTab("overview")}
                  className="rounded-xl border border-slate-200 px-3 py-1.5 text-[11px] font-bold text-slate-700 hover:border-emerald-300"
                >
                  Command Overview
                </button>
                <button
                  type="button"
                  onClick={refreshAll}
                  disabled={dashboard.isFetching}
                  aria-label="Refresh"
                  className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200"
                >
                  <RefreshCw
                    size={14}
                    className={dashboard.isFetching ? "animate-spin text-emerald-600" : ""}
                  />
                </button>
              </div>
            </div>

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
                    {dirSearch ? (
                      <button
                        type="button"
                        onClick={() => setDirSearch("")}
                        className="absolute right-2.5 top-2.5 text-slate-400"
                        aria-label="Clear search"
                      >
                        <X size={14} />
                      </button>
                    ) : null}
                  </div>
                </label>
              </div>
              <p className="mt-3 text-xs font-semibold text-slate-500">
                Showing {filteredMembers.length} of {directoryMembers.length}{" "}
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
                      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-emerald-300"
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
                          <p className="mt-1 truncate text-xs text-slate-500">
                            {member.email || "—"}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-center">
                        <div>
                          <p className="text-sm font-black text-slate-900">{fmt(member.open)}</p>
                          <p className="text-[10px] font-semibold text-slate-400">Open</p>
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900">
                            {fmt(member.resolved)}
                          </p>
                          <p className="text-[10px] font-semibold text-slate-400">Resolved</p>
                        </div>
                        <div>
                          <p className="text-sm font-black text-orange-600">
                            {fmt(member.overdue)}
                          </p>
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
                                item.raw?.assignedTo?.userId ||
                                  item.raw?.assignedTo?._id ||
                                  "",
                              ) === String(member.id),
                          );
                          if (owned) setSelectedTicketId(owned.id);
                        }}
                        className="mt-3 w-full rounded-xl border border-emerald-200 bg-emerald-50 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100"
                      >
                        View their open tickets
                      </button>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
                <Users className="mx-auto mb-3 text-slate-300" size={36} />
                <p className="font-bold text-slate-600">No members match these filters</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
