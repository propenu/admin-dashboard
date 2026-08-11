import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Building2,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Clock,
  LogIn,
  LogOut,
  MapPin,
  MoreVertical,
  Plus,
  RefreshCw,
  Search,
  User,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { getUserDetails } from "../../features/user/userService";
import {
  completeFieldMeetingNextAction,
  getFieldMeetingTeamSummary,
  getFieldMeetingTerritory,
  listFieldMeetings,
  updateFieldMeeting,
  updateFieldMeetingPrepTask,
} from "../../features/fieldMeetings/fieldMeetingService";
import ScheduleMeetingModal from "./components/ScheduleMeetingModal";
import MeetingStatusBadge from "./components/MeetingStatusBadge";
import {
  formatLongDate,
  formatMeetingDate,
  formatMeetingTime,
  getPageMeta,
  initials,
  locationLine,
  MEETING_STATUS_ACTIONS,
  MEETING_STATUS_OPTIONS,
  modeLabel,
  normalizeRole,
} from "./fieldMeetingUtils";

const getId = (u) => String(u?._id || u?.id || u?.userId || "").trim();

export default function FieldMeetingsPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [menuId, setMenuId] = useState(null);
  const [actionBusy, setActionBusy] = useState("");

  const meQuery = useQuery({
    queryKey: ["field-meetings", "me"],
    queryFn: async () => {
      const res = await getUserDetails();
      return res?.data?.user || res?.data || res?.user || null;
    },
    staleTime: 120_000,
  });

  const me = meQuery.data;
  const roleName = normalizeRole(me?.roleName || me?.role?.name);
  const pageMeta = getPageMeta(roleName);
  const isSe = pageMeta.mode === "se";

  const meetingsQuery = useQuery({
    queryKey: ["field-meetings", "list", statusFilter],
    queryFn: () =>
      listFieldMeetings({
        status: statusFilter === "all" ? undefined : statusFilter,
        limit: 80,
      }),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  const territoryQuery = useQuery({
    queryKey: ["field-meetings", "territory", getId(me)],
    enabled: Boolean(getId(me)),
    queryFn: () => getFieldMeetingTerritory(getId(me)),
    staleTime: 120_000,
  });

  const teamQuery = useQuery({
    queryKey: ["field-meetings", "team"],
    enabled: !isSe && Boolean(getId(me)),
    queryFn: () => getFieldMeetingTeamSummary({}),
    staleTime: 45_000,
  });

  const payload = meetingsQuery.data || {};
  const meetings = Array.isArray(payload.meetings) ? payload.meetings : [];
  const todayMeetings = Array.isArray(payload.todayMeetings) ? payload.todayMeetings : [];
  const prepTasks = Array.isArray(payload.prepTasks) ? payload.prepTasks : [];

  const visibilityHint = useMemo(() => {
    const fromMeeting = todayMeetings[0]?.visibilityChain || meetings[0]?.visibilityChain;
    if (Array.isArray(fromMeeting) && fromMeeting.length) return fromMeeting;
    if (isSe) return ["Sales Manager / BDM", "Regional Manager", "BD Head"];
    if (pageMeta.mode === "manager") return ["Regional Manager", "BD Head"];
    if (pageMeta.mode === "region") return ["BD Head", "Operations Head"];
    return ["Operations Head", "Super Admin"];
  }, [todayMeetings, meetings, isSe, pageMeta.mode]);

  const refresh = useCallback(async () => {
    await Promise.all([
      meetingsQuery.refetch(),
      territoryQuery.refetch(),
      !isSe ? teamQuery.refetch() : Promise.resolve(),
    ]);
  }, [meetingsQuery, territoryQuery, teamQuery, isSe]);

  const openPrepPending = prepTasks.filter((t) => !t.completed);

  const crmNextActions = useMemo(() => {
    const nowMs = Date.now();
    return meetings
      .filter((m) => {
        const na = m.nextAction;
        if (!na) return false;
        if (na.status === "done" || na.status === "skipped") return false;
        return true;
      })
      .map((m) => {
        const dueMs = m.nextAction?.dueAt ? new Date(m.nextAction.dueAt).getTime() : 0;
        const isDue = m.nextAction?.isDue || m.nextAction?.status === "due" || (dueMs && dueMs <= nowMs);
        return { meeting: m, isDue, dueMs };
      })
      .sort((a, b) => Number(b.isDue) - Number(a.isDue) || a.dueMs - b.dueMs);
  }, [meetings]);

  const markPrepDone = async (task) => {
    setActionBusy(task.id);
    try {
      await updateFieldMeetingPrepTask(task.meetingId, task.id, true);
      toast.success("Prep task completed");
      await meetingsQuery.refetch();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Update failed");
    } finally {
      setActionBusy("");
    }
  };

  const runStatusAction = async (meeting, status) => {
    if (status === "cancelled") {
      toast.message("Cancel is disabled — mark completed, confirmed, or rescheduled");
      setMenuId(null);
      return;
    }
    setActionBusy(meeting.id);
    setMenuId(null);
    try {
      const updated = await updateFieldMeeting(meeting.id, { status });
      toast.success(
        status === "completed"
          ? "Punched out — next CRM action due in 15 minutes"
          : `Meeting marked ${status.replace(/_/g, " ")}`,
      );
      await meetingsQuery.refetch();
      if (detail?.id === meeting.id) {
        setDetail(updated?.id ? updated : { ...meeting, status, ...updated });
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Action failed");
    } finally {
      setActionBusy("");
    }
  };

  const runNextAction = async (meeting, status = "done") => {
    setActionBusy(`na-${meeting.id}`);
    try {
      const updated = await completeFieldMeetingNextAction(meeting.id, { status });
      toast.success(status === "skipped" ? "Next action skipped" : "Next action completed");
      await meetingsQuery.refetch();
      if (detail?.id === meeting.id) setDetail(updated?.id ? updated : { ...meeting, ...updated });
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Next action failed");
    } finally {
      setActionBusy("");
    }
  };

  useEffect(() => {
    const close = () => setMenuId(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  const loading = meQuery.isLoading || meetingsQuery.isLoading;
  const territory = territoryQuery.data || {};

  const now = Date.now();
  const currentTodayId = todayMeetings.find((m) => {
    const start = new Date(m.scheduledStart).getTime();
    const end = new Date(m.scheduledEnd).getTime();
    return start <= now && now <= end;
  })?.id;

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-4 p-3 sm:p-4 lg:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-950 sm:text-2xl">
            {pageMeta.title}
            <span className="ml-2 text-base font-semibold text-slate-400 sm:text-lg">
              · {pageMeta.subtitle}
            </span>
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Schedule field visits, prepare before meetings, and keep hierarchy visibility intact.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => refresh()}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${meetingsQuery.isFetching ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
          {(isSe || pageMeta.mode === "manager") && (
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4" /> New meeting
            </button>
          )}
        </div>
      </div>

      {!isSe && (
        <section className="grid gap-3 sm:grid-cols-3">
          {[
            {
              label: "Team meetings",
              value: teamQuery.data?.totals?.meetings ?? 0,
              icon: Users,
            },
            {
              label: "Completed",
              value: teamQuery.data?.totals?.completed ?? 0,
              icon: CheckCircle2,
            },
            {
              label: "Prep pending",
              value: teamQuery.data?.totals?.prepPending ?? 0,
              icon: ClipboardList,
            },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {card.label}
                </p>
                <card.icon className="h-4 w-4 text-emerald-600" />
              </div>
              <p className="mt-2 text-2xl font-black text-slate-950">{card.value}</p>
            </div>
          ))}
        </section>
      )}

      {!isSe && Array.isArray(teamQuery.data?.team) && teamQuery.data.team.length > 0 && (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-4 py-3">
            <h2 className="text-sm font-black text-slate-900">Team coverage</h2>
            <p className="text-xs text-slate-500">Meetings by Sales Executive under your hierarchy</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-xs">
              <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-2.5">Executive</th>
                  <th className="px-4 py-2.5">Role</th>
                  <th className="px-4 py-2.5">Total</th>
                  <th className="px-4 py-2.5">Planned</th>
                  <th className="px-4 py-2.5">Prep</th>
                  <th className="px-4 py-2.5">Done</th>
                </tr>
              </thead>
              <tbody>
                {teamQuery.data.team.map((row) => (
                  <tr key={row.ownerUserId} className="border-t border-slate-100">
                    <td className="px-4 py-2.5 font-semibold text-slate-800">{row.name}</td>
                    <td className="px-4 py-2.5 capitalize text-slate-500">
                      {(row.roleLabel || row.roleName || "").replace(/_/g, " ")}
                    </td>
                    <td className="px-4 py-2.5 font-bold">{row.total}</td>
                    <td className="px-4 py-2.5">{row.planned}</td>
                    <td className="px-4 py-2.5 text-amber-700">{row.prepPending}</td>
                    <td className="px-4 py-2.5 text-emerald-700">{row.completed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.65fr)_minmax(260px,0.9fr)]">
        <div className="space-y-4">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-black text-slate-900">Today&apos;s Schedule</h2>
              <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                <Calendar className="h-3.5 w-3.5" />
                {formatLongDate(new Date())}
              </p>
            </div>

            {loading ? (
              <div className="flex gap-3 overflow-hidden">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 min-w-[180px] flex-1 animate-pulse rounded-xl bg-slate-100" />
                ))}
              </div>
            ) : todayMeetings.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
                <p className="text-sm font-semibold text-slate-600">No meetings scheduled for today</p>
                <p className="mt-1 text-xs text-slate-400">
                  Use + New meeting to plan a field visit.
                </p>
              </div>
            ) : (
              <div className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {todayMeetings.map((m) => {
                  const isCurrent = m.id === currentTodayId;
                  const isUpcoming =
                    new Date(m.scheduledStart).getTime() > now && !isCurrent;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setDetail(m)}
                      className={`min-w-[180px] flex-1 rounded-xl border px-3 py-3 text-left transition hover:-translate-y-0.5 hover:shadow-md motion-reduce:transform-none ${
                        isCurrent
                          ? "border-emerald-400 bg-emerald-50 ring-1 ring-emerald-200"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <p className="text-sm font-black text-emerald-700">
                        {formatMeetingTime(m.scheduledStart)}
                      </p>
                      <p className="mt-1 truncate text-sm font-bold text-slate-900">
                        {m.client?.name ||
                          m.people?.[0]?.name ||
                          "Meeting"}
                      </p>
                      <p className="truncate text-[11px] text-slate-500">
                        {(m.people || []).length > 1
                          ? `${(m.people || []).length} people · ${locationLine(m.location)}`
                          : locationLine(m.location)}
                      </p>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <MeetingStatusBadge status={m.status} />
                        {isUpcoming ? (
                          <span className="text-[10px] font-bold text-slate-400">Upcoming</span>
                        ) : null}
                        {isCurrent ? (
                          <span className="text-[10px] font-bold text-emerald-600">Now</span>
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          <section>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-black text-slate-900">All Meetings</h2>
              <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600">
                Status
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold"
                >
                  {MEETING_STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-100" />
                ))}
              </div>
            ) : meetings.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-12 text-center">
                <Search className="mx-auto mb-2 h-6 w-6 text-slate-300" />
                <p className="text-sm font-semibold text-slate-600">No meetings in this filter</p>
              </div>
            ) : (
              <div className="space-y-2">
                {meetings.map((m) => (
                  <article
                    key={m.id}
                    className="relative flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition hover:border-emerald-200 hover:shadow-md sm:flex-row sm:items-center sm:gap-4 sm:p-4"
                  >
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-emerald-50 text-sm font-black text-emerald-700">
                      {initials(m.client?.name || m.people?.[0]?.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-black text-slate-950">
                        {m.client?.name || m.people?.[0]?.name || "Untitled meeting"}
                        {(m.people || []).length > 1 ? (
                          <span className="ml-1 text-[11px] font-semibold text-emerald-700">
                            +{(m.people || []).length - 1} more
                          </span>
                        ) : null}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-slate-500">
                        <Building2 className="h-3 w-3" />
                        {(m.people || [])
                          .map((p) => p.title || p.name)
                          .filter(Boolean)
                          .slice(0, 3)
                          .join(", ") ||
                          m.client?.company ||
                          m.client?.title ||
                          "People"}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-slate-500">
                        <MapPin className="h-3 w-3" />
                        {locationLine(m.location)}
                      </p>
                    </div>
                    <div className="grid shrink-0 gap-1 text-[11px] text-slate-600 sm:min-w-[140px]">
                      <p className="inline-flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-emerald-600" />
                        {formatMeetingDate(m.scheduledStart)}
                      </p>
                      <p className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3 text-emerald-600" />
                        {formatMeetingTime(m.scheduledStart)}
                      </p>
                      <p className="inline-flex items-center gap-1">
                        <User className="h-3 w-3 text-emerald-600" />
                        {modeLabel(m.mode, m.meetingType)}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-2 sm:flex-col sm:items-end">
                      <MeetingStatusBadge status={m.status} />
                      {m.punchInAt && !m.punchOutAt ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                          <LogIn className="h-3 w-3" /> Punched in
                        </span>
                      ) : null}
                      {m.punchOutAt ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                          <LogOut className="h-3 w-3" /> Punched out
                        </span>
                      ) : null}
                      {m.nextAction &&
                      m.nextAction.status !== "done" &&
                      m.nextAction.status !== "skipped" ? (
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                            m.nextAction.isDue || m.nextAction.status === "due"
                              ? "border-amber-300 bg-amber-50 text-amber-800"
                              : "border-sky-200 bg-sky-50 text-sky-800"
                          }`}
                        >
                          {m.nextAction.isDue || m.nextAction.status === "due"
                            ? "Next action due"
                            : "Next action in 15m"}
                        </span>
                      ) : null}
                      {m.loggingMode && m.loggingMode !== "scheduled" ? (
                        <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-bold text-slate-600">
                          {m.loggingMode === "walk_in"
                            ? "Walk-in"
                            : m.loggingMode === "already_visited"
                              ? "Logged visit"
                              : null}
                        </span>
                      ) : null}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setDetail(m)}
                          className="min-h-11 rounded-xl border border-emerald-200 px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-50"
                        >
                          View details
                        </button>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setMenuId(menuId === m.id ? null : m.id);
                            }}
                            className="grid h-11 w-11 place-items-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50"
                            aria-label="Meeting actions"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                          {menuId === m.id ? (
                            <div className="absolute right-0 z-20 mt-1 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                              {MEETING_STATUS_ACTIONS.map(({ value: status, label }) => (
                                <button
                                  key={status}
                                  type="button"
                                  disabled={actionBusy === m.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    runStatusAction(m, status);
                                  }}
                                  className="block w-full px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                >
                                  {label}
                                </button>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-3">
          {(isSe || pageMeta.mode === "manager") && (
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 lg:hidden"
            >
              <Plus className="h-4 w-4" /> New meeting
            </button>
          )}

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-1 flex items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-black text-slate-900">CRM next actions</h3>
                <p className="text-xs font-semibold text-amber-700">
                  {crmNextActions.filter((x) => x.isDue).length} due · {crmNextActions.length} open
                </p>
              </div>
              <CheckCircle2 className="h-4 w-4 text-amber-600" />
            </div>
            <p className="text-[11px] text-slate-500">
              After punch-out, follow-up is due in 15 minutes.
            </p>
            {crmNextActions.length === 0 ? (
              <p className="mt-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-5 text-center text-xs text-slate-500">
                No open next actions. Complete a meeting to start the 15‑min CRM follow-up.
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {crmNextActions.slice(0, 6).map(({ meeting: m, isDue }) => (
                  <li
                    key={m.id}
                    className={`rounded-xl border px-3 py-2.5 ${
                      isDue
                        ? "border-amber-300 bg-amber-50"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <p className="text-xs font-bold text-slate-900">
                      {m.client?.name || m.people?.[0]?.name || "Meeting"}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Due {formatMeetingTime(m.nextAction?.dueAt)} ·{" "}
                      {isDue ? "Due now" : "Waiting 15 min"}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        disabled={actionBusy === `na-${m.id}`}
                        onClick={() => runNextAction(m, "done")}
                        className="min-h-9 rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white disabled:opacity-50"
                      >
                        Done
                      </button>
                      <button
                        type="button"
                        onClick={() => setDetail(m)}
                        className="min-h-9 rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-600"
                      >
                        View
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-1 flex items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-black text-slate-900">Before meeting today</h3>
                <p className="text-xs font-semibold text-emerald-700">
                  {openPrepPending.length} task{openPrepPending.length === 1 ? "" : "s"} to complete
                </p>
              </div>
              <ClipboardList className="h-4 w-4 text-emerald-600" />
            </div>
            {openPrepPending.length === 0 ? (
              <p className="mt-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-6 text-center text-xs text-slate-500">
                All prep tasks done for today — or no meetings scheduled.
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {openPrepPending.slice(0, 8).map((task) => (
                  <li
                    key={`${task.meetingId}-${task.id}`}
                    className="rounded-xl border border-slate-200 px-3 py-2.5"
                  >
                    <p className="text-xs font-bold text-slate-900">{task.title}</p>
                    <p className="mt-0.5 text-[11px] text-slate-500">{task.description}</p>
                    {task.meetingClient ? (
                      <p className="mt-1 text-[10px] font-semibold text-emerald-700">
                        {task.meetingClient}
                      </p>
                    ) : null}
                    <button
                      type="button"
                      disabled={actionBusy === task.id}
                      onClick={() => markPrepDone(task)}
                      className="mt-2 min-h-10 rounded-lg border border-emerald-200 px-3 py-1.5 text-[11px] font-bold text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
                    >
                      Mark done
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="px-4 pt-4">
              <h3 className="text-sm font-black text-slate-900">Your Territory</h3>
            </div>
            <div className="relative mx-4 my-3 h-36 overflow-hidden rounded-xl bg-gradient-to-br from-emerald-50 via-slate-50 to-emerald-100">
              <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:16px_16px]" />
              <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
                <MapPin className="h-8 w-8 text-emerald-600 drop-shadow" />
              </div>
              <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-white/80 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 shadow-sm">
                <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                {territory.primaryLabel || "Territory not assigned"}
              </div>
            </div>
            {Array.isArray(territory.labels) && territory.labels.length > 1 ? (
              <ul className="space-y-1 px-4 pb-4 text-[11px] text-slate-600">
                {territory.labels.slice(0, 4).map((label) => (
                  <li key={label} className="truncate">
                    · {label}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="h-2" />
            )}
          </section>
        </aside>
      </div>

      <ScheduleMeetingModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={refresh}
        visibilityHint={visibilityHint}
      />

      {detail ? (
        <div
          className="fixed inset-0 z-[85] flex justify-end bg-slate-950/40"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setDetail(null);
          }}
        >
          <aside className="flex h-full w-full max-w-md flex-col overflow-hidden bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 px-4 py-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Meeting details
                </p>
                <h3 className="text-lg font-black text-slate-950">
                  {detail.client?.name || detail.people?.[0]?.name || "Meeting"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDetail(null)}
                className="rounded-lg px-2 py-1 text-sm font-semibold text-slate-500 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4 text-sm">
              <MeetingStatusBadge status={detail.status} />

              {/* CRM punch in / punch out */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  CRM attendance
                </p>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  <div className="rounded-lg border border-emerald-100 bg-white px-2.5 py-2">
                    <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                      <LogIn className="h-3 w-3" /> Punch in
                    </p>
                    <p className="mt-1 text-xs font-semibold text-slate-800">
                      {detail.punchInAt
                        ? `${formatMeetingDate(detail.punchInAt)} · ${formatMeetingTime(detail.punchInAt)}`
                        : "When meeting is scheduled"}
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-white px-2.5 py-2">
                    <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                      <LogOut className="h-3 w-3" /> Punch out
                    </p>
                    <p className="mt-1 text-xs font-semibold text-slate-800">
                      {detail.punchOutAt
                        ? `${formatMeetingDate(detail.punchOutAt)} · ${formatMeetingTime(detail.punchOutAt)}`
                        : "On Mark completed"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Next CRM action — due 15 min after punch-out */}
              {detail.nextAction ? (
                <div
                  className={`rounded-xl border p-3 ${
                    detail.nextAction.status === "done" || detail.nextAction.status === "skipped"
                      ? "border-slate-200 bg-slate-50"
                      : detail.nextAction.isDue || detail.nextAction.status === "due"
                        ? "border-amber-300 bg-amber-50"
                        : "border-sky-200 bg-sky-50"
                  }`}
                >
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Next CRM action
                  </p>
                  <p className="mt-1 text-sm font-bold text-slate-900">
                    {detail.nextAction.title || "Post-meeting follow-up"}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-600">
                    {detail.nextAction.note ||
                      "Follow up 15 minutes after punch-out."}
                  </p>
                  <p className="mt-1 text-[11px] font-semibold text-slate-500">
                    Due:{" "}
                    {detail.nextAction.dueAt
                      ? `${formatMeetingDate(detail.nextAction.dueAt)} · ${formatMeetingTime(detail.nextAction.dueAt)}`
                      : "—"}
                    {" · "}
                    <span className="capitalize">{detail.nextAction.status}</span>
                  </p>
                  {detail.nextAction.status !== "done" &&
                  detail.nextAction.status !== "skipped" ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={actionBusy === `na-${detail.id}`}
                        onClick={() => runNextAction(detail, "done")}
                        className="min-h-9 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                      >
                        Mark next action done
                      </button>
                      <button
                        type="button"
                        disabled={actionBusy === `na-${detail.id}`}
                        onClick={() => runNextAction(detail, "skipped")}
                        className="min-h-9 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                      >
                        Skip
                      </button>
                    </div>
                  ) : null}
                </div>
              ) : detail.status === "completed" ? null : (
                <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-500">
                  Punch out via <strong>Mark completed</strong> — then a CRM next action is due in
                  15 minutes.
                </p>
              )}

              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  People at meeting
                </p>
                <ul className="mt-2 space-y-1.5">
                  {(detail.people?.length ? detail.people : detail.client ? [detail.client] : []).map(
                    (p, i) => (
                      <li
                        key={p.id || p.contactId || i}
                        className="rounded-lg border border-slate-200 px-2.5 py-2 text-xs"
                      >
                        <p className="font-bold text-slate-900">
                          {p.name}
                          {p.title ? (
                            <span className="ml-1 font-semibold text-emerald-700">· {p.title}</span>
                          ) : null}
                        </p>
                        <p className="text-slate-500">
                          {[p.company, p.phone, p.email].filter(Boolean).join(" · ") || "—"}
                        </p>
                      </li>
                    ),
                  )}
                </ul>
              </div>
              <DetailRow label="Type" value={String(detail.meetingType || "").replace(/_/g, " ")} />
              <DetailRow
                label="When"
                value={`${formatMeetingDate(detail.scheduledStart)} · ${formatMeetingTime(detail.scheduledStart)} – ${formatMeetingTime(detail.scheduledEnd)}`}
              />
              <DetailRow label="Mode" value={modeLabel(detail.mode, detail.meetingType)} />
              <DetailRow label="Location" value={locationLine(detail.location)} />
              <DetailRow label="Property" value={detail.linkedProperty?.name || "Not linked"} />
              <DetailRow label="Notes" value={detail.notes || "—"} />
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Prep checklist
                </p>
                <ul className="mt-2 space-y-1.5">
                  {(detail.prepTasks || []).map((t) => (
                    <li
                      key={t.id}
                      className={`rounded-lg border px-2.5 py-2 text-xs ${
                        t.completed
                          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                          : "border-slate-200 text-slate-700"
                      }`}
                    >
                      {t.completed ? "✓ " : "○ "}
                      {t.title}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-3 text-xs text-emerald-900">
                <p className="font-bold">Visibility</p>
                <p className="mt-1 font-semibold">
                  {(detail.visibilityChain || visibilityHint).join(" → ")}
                </p>
              </div>
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-0.5 font-semibold capitalize text-slate-800">{value}</p>
    </div>
  );
}
