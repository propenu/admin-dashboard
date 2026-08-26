import { useEffect, useMemo, useRef, useState, Fragment } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRightLeft,
  ChevronDown,
  LayoutGrid,
  List,
  Loader2,
  Radio,
  Search,
  Users,
  Wifi,
  WifiOff,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import {
  listFieldMeetings,
  updateFieldMeeting,
} from "../../../../features/fieldMeetings/fieldMeetingService";
import { getTickets, assignTicket } from "../../../../features/ticket/ticket_system";
import {
  enrichTeamMember,
  pickNextWorkingAssignee,
  titleCase,
} from "../regionalManagerDashboardData";
import { buildRegionalManagerPods, buildManagerReportingPods } from "../../../../utils/reportingTree";

/** Recompute presence from lastLoginAt every 20s so Online/Offline cards stay live. */
function usePresenceClock(ms = 20_000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), ms);
    return () => window.clearInterval(id);
  }, [ms]);
  return now;
}

const GROUP_TABS = [
  { key: "all", label: "All" },
  { key: "sales_executive", label: "Sales Executives" },
  { key: "bdm", label: "BDMs" },
  { key: "sales_manager", label: "Sales Managers" },
];

const presenceTone = {
  online: "bg-emerald-500",
  offline: "bg-slate-400",
  inactive: "bg-rose-400",
};

const cardAccent = {
  leadership: "from-slate-600 to-slate-800",
  regional_manager: "from-indigo-500 to-blue-600",
  sales_executive: "from-teal-500 to-emerald-500",
  bdm: "from-sky-500 to-blue-600",
  sales_manager: "from-amber-400 to-orange-500",
  support_lead: "from-cyan-500 to-teal-600",
  cce: "from-sky-400 to-blue-500",
  relationship_manager: "from-violet-500 to-purple-600",
  marketing: "from-pink-500 to-rose-500",
  ops_functions: "from-orange-400 to-amber-500",
  tech: "from-zinc-500 to-neutral-700",
  other: "from-violet-500 to-fuchsia-500",
};

const initials = (name = "") =>
  String(name)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0] || "")
    .join("")
    .toUpperCase() || "?";

const formatSeen = (value) => {
  if (!value) return "Never";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  const mins = Math.round((Date.now() - d.getTime()) / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (mins < 1440) return `${Math.round(mins / 60)}h ago`;
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const isMidnightWindow = () => {
  const hour = new Date().getHours();
  return hour >= 22 || hour < 7;
};

function StatPill({ label, value, tone, icon: Icon }) {
  const tones = {
    emerald: "from-emerald-500 to-teal-500",
    sky: "from-sky-500 to-blue-500",
    slate: "from-slate-500 to-slate-600",
    amber: "from-amber-400 to-orange-500",
  };
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative min-w-0 w-full overflow-hidden rounded-xl bg-gradient-to-br ${tones[tone]} px-2.5 py-2 text-white shadow-md max-lg:flex-1 sm:px-3 sm:py-2.5 lg:max-w-none`}
    >
      <div className="absolute -right-2 -top-2 h-10 w-10 rounded-full bg-white/15" />
      <div className="relative flex items-center justify-between gap-1.5">
        <div className="min-w-0">
          <p className="truncate text-[8px] font-bold uppercase tracking-[0.12em] text-white/80 sm:text-[9px]">
            {label}
          </p>
          <motion.p
            key={String(value)}
            initial={{ scale: 0.85, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mt-0.5 text-lg font-black tabular-nums leading-none sm:text-xl"
          >
            {value}
          </motion.p>
        </div>
        <Icon className="h-4 w-4 shrink-0 text-white/85" />
      </div>
    </motion.div>
  );
}

/** Mobile: colorful animated dropdown. Large+: same green pill tabs */
function AnimatedGroupTabs({ tabs, activeKey, counts, onChange }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const activeTab = tabs.find((t) => t.key === activeKey) || tabs[0];
  const activeCount = groupCountsSafe(counts, activeKey);

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("touchstart", onDoc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("touchstart", onDoc);
    };
  }, [open]);

  return (
    <>
      {/* Mobile colorful animated dropdown */}
      <div ref={rootRef} className="relative w-full min-w-0 lg:hidden">
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-haspopup="listbox"
          className="flex h-12 w-full items-center justify-between gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 px-4 text-left text-white shadow-md shadow-emerald-600/25"
        >
          <span className="min-w-0">
            <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-white/75">
              Team filter
            </span>
            <span className="block truncate text-[15px] font-black leading-tight">
              {activeTab?.label || "All"}
            </span>
          </span>
          <span className="flex shrink-0 items-center gap-2">
            <span className="rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-black tabular-nums backdrop-blur-sm">
              {activeCount}
            </span>
            <motion.span
              animate={{ rotate: open ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              className="grid h-8 w-8 place-items-center rounded-full bg-white/15"
            >
              <ChevronDown className="h-4 w-4" />
            </motion.span>
          </span>
        </motion.button>

        <AnimatePresence>
          {open ? (
            <motion.ul
              role="listbox"
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 420, damping: 30 }}
              className="absolute left-0 right-0 z-30 mt-2 max-h-64 overflow-auto rounded-2xl border border-emerald-100 bg-white p-1.5 shadow-xl shadow-emerald-900/10"
            >
              {tabs.map((tab, index) => {
                const active = activeKey === tab.key;
                const count = groupCountsSafe(counts, tab.key);
                return (
                  <motion.li
                    key={tab.key}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <button
                      type="button"
                      role="option"
                      aria-selected={active}
                      onClick={() => {
                        onChange(tab.key);
                        setOpen(false);
                      }}
                      className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-3 text-left text-sm font-bold transition ${
                        active
                          ? "bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-sm"
                          : "text-slate-700 hover:bg-emerald-50"
                      }`}
                    >
                      <span className="truncate">{tab.label}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-black tabular-nums ${
                          active
                            ? "bg-white/20 text-white"
                            : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  </motion.li>
                );
              })}
            </motion.ul>
          ) : null}
        </AnimatePresence>
      </div>

      {/* Desktop / large tabs — unchanged */}
      <div className="hidden min-w-0 flex-wrap gap-1.5 lg:flex">
        {tabs.map((tab) => {
          const active = activeKey === tab.key;
          const count = groupCountsSafe(counts, tab.key);
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onChange(tab.key)}
              className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold transition ${
                active
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-emerald-50"
              }`}
            >
              {tab.label}
              <span className="ml-1 opacity-80">{count}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}

function groupCountsSafe(counts, key) {
  return counts?.[key] || 0;
}

/** Desktop only — mobile always uses cards (no Table) */
function AnimatedViewToggle({ value, onChange }) {
  return (
    <div className="hidden rounded-lg border border-slate-200 bg-white p-0.5 lg:inline-flex">
      {[
        { key: "cards", label: "Cards", icon: LayoutGrid },
        { key: "table", label: "Table", icon: List },
      ].map(({ key, label, icon: Icon }) => {
        const active = value === key;
        return (
          <button
            key={key}
            type="button"
            title={label}
            onClick={() => onChange(key)}
            className={`inline-flex items-center justify-center gap-1 rounded-md px-2 py-1.5 text-[10px] font-bold ${
              active
                ? "bg-emerald-600 text-white"
                : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            <Icon className="h-3 w-3" />
            {label}
          </button>
        );
      })}
    </div>
  );
}

function PresenceBadge({ member }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wide ${
        member.isOnline
          ? "bg-emerald-100 text-emerald-700"
          : member.isAccountActive
            ? "bg-slate-100 text-slate-600"
            : "bg-rose-100 text-rose-700"
      }`}
    >
      {member.presence}
    </span>
  );
}

function MemberCard({ member, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(member)}
      className={`w-full min-w-0 overflow-hidden rounded-lg border text-left transition touch-manipulation ${
        selected
          ? "border-emerald-400 bg-emerald-50/40 ring-1 ring-emerald-200"
          : "border-slate-200 bg-white hover:border-emerald-300"
      }`}
    >
      <div className={`h-0.5 bg-gradient-to-r ${cardAccent[member.group] || cardAccent.other}`} />
      <div className="flex items-center gap-2 px-2.5 py-2 max-lg:gap-3 max-lg:px-3 max-lg:py-2.5">
        <span className="relative grid h-7 w-7 shrink-0 place-items-center rounded-md bg-emerald-50 text-[10px] font-black text-emerald-700 max-lg:h-9 max-lg:w-9 max-lg:rounded-lg max-lg:text-xs">
          {initials(member.name)}
          <span
            className={`absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-white ${
              presenceTone[member.presence]
            }`}
          />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <p className="truncate text-[11px] font-bold text-slate-900 max-lg:text-sm">
              {member.name || "Team member"}
            </p>
            <PresenceBadge member={member} />
          </div>
          <p className="truncate text-[9px] text-slate-500 max-lg:text-[11px]">
            {titleCase(member.roleName)}
            {member.city ? ` · ${member.city}` : ""}
            {" · "}
            {formatSeen(member.lastSeenAt || member.lastLoginAt)}
          </p>
        </div>
      </div>
    </button>
  );
}

function MemberTable({ members, selectedId, onSelect, pods = null }) {
  const renderRow = (member, { indent = false } = {}) => {
    if (!member || member.id === "__unassigned__") return null;
    const selected = selectedId === member.id;
    return (
      <tr
        key={member.id}
        onClick={() => onSelect(member)}
        className={`cursor-pointer border-t border-slate-100 transition ${
          selected ? "bg-emerald-50" : "hover:bg-slate-50"
        }`}
      >
        <td className={`px-2.5 py-1.5 ${indent ? "pl-7" : ""}`}>
          <span className="inline-flex items-center gap-1.5 font-semibold text-slate-900">
            <span
              className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                presenceTone[member.presence]
              }`}
            />
            {indent ? (
              <span className="text-[9px] font-medium text-slate-400">↳</span>
            ) : null}
            {member.name || "—"}
          </span>
        </td>
        <td className="px-2.5 py-1.5 text-slate-600">
          {titleCase(member.roleName)}
        </td>
        <td className="hidden px-2.5 py-1.5 text-slate-600 md:table-cell">
          {member.city || "—"}
        </td>
        <td className="px-2.5 py-1.5">
          <PresenceBadge member={member} />
        </td>
        <td className="hidden px-2.5 py-1.5 text-slate-500 lg:table-cell">
          {formatSeen(member.lastSeenAt || member.lastLoginAt)}
        </td>
        <td className="hidden px-2.5 py-1.5 text-slate-500 sm:table-cell">
          {member.state || "—"}
        </td>
      </tr>
    );
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="max-h-[min(70vh,560px)] overflow-auto overscroll-contain">
        <table className="w-full min-w-[420px] border-collapse text-left text-[11px] sm:min-w-[560px]">
          <thead className="sticky top-0 z-10 bg-slate-50/95 text-[9px] font-bold uppercase tracking-wide text-slate-500 backdrop-blur">
            <tr>
              <th className="px-2.5 py-2.5">Name</th>
              <th className="px-2.5 py-2.5">Role</th>
              <th className="hidden px-2.5 py-2.5 md:table-cell">City</th>
              <th className="px-2.5 py-2.5">Status</th>
              <th className="hidden px-2.5 py-2.5 lg:table-cell">Last heard</th>
              <th className="hidden px-2.5 py-2.5 sm:table-cell">State</th>
            </tr>
          </thead>
          <tbody>
            {pods
              ? pods.map((pod) => (
                  <Fragment key={pod.manager.id}>
                    <tr className="border-t border-indigo-100 bg-indigo-50/60">
                      <td
                        colSpan={6}
                        className="px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wide text-indigo-700"
                      >
                        {pod.manager.name || "Regional Manager"} · {pod.staff.length}{" "}
                        staff
                      </td>
                    </tr>
                    {!pod.hideManagerRow ? renderRow(pod.manager) : null}
                    {pod.staff.map((m) => renderRow(m, { indent: true }))}
                    {!pod.staff.length && !pod.hideManagerRow ? (
                      <tr>
                        <td colSpan={6} className="px-7 py-2 text-[10px] text-slate-400">
                          No staff reporting under this person yet
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                ))
              : members.map((member) => renderRow(member))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ReassignPanel({
  member,
  teamFloor,
  meetings,
  tickets,
  busy,
  onReassign,
}) {
  const onlineTargets = teamFloor.filter(
    (m) => m.id !== member.id && m.isOnline && m.isAccountActive,
  );
  const suggested = pickNextWorkingAssignee(teamFloor, member.id);
  const [targetId, setTargetId] = useState(suggested?.id || onlineTargets[0]?.id || "");

  useEffect(() => {
    setTargetId(suggested?.id || onlineTargets[0]?.id || "");
  }, [member.id, suggested?.id]);

  const openMeetings = meetings.filter((m) =>
    ["planned", "prep_pending", "confirmed", "draft"].includes(
      String(m.status || "").toLowerCase(),
    ),
  );
  const openTickets = tickets.filter((t) =>
    ["open", "in_progress", "pending", "awaiting_user_response"].includes(
      String(t.status || "").toLowerCase(),
    ),
  );

  return (
    <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-4">
      <div className="mb-2 flex items-center gap-2">
        <ArrowRightLeft className="h-4 w-4 text-amber-600" />
        <p className="text-xs font-black uppercase tracking-wide text-amber-800">
          Work reassignment
        </p>
      </div>
      <p className="text-[11px] leading-relaxed text-amber-900/80">
        {member.isOnline
          ? "Member is online. Reassign only if needed."
          : isMidnightWindow()
            ? "Midnight / off-hours window — prefer next working Sales Executive for morning handoff."
            : "Offline during shift — move open field meetings & tickets to an online teammate."}
      </p>
      <div className="mt-3 grid gap-2">
        <label className="text-[10px] font-bold uppercase tracking-wide text-amber-700">
          Assign to
        </label>
        <select
          value={targetId}
          onChange={(e) => setTargetId(e.target.value)}
          className="rounded-xl border border-amber-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-400"
        >
          <option value="">Select online teammate</option>
          {(onlineTargets.length ? onlineTargets : teamFloor.filter((m) => m.id !== member.id)).map(
            (m) => (
              <option key={m.id} value={m.id}>
                {m.name} · {m.isOnline ? "Online" : "Offline"} · {titleCase(m.roleName)}
              </option>
            ),
          )}
        </select>
        <p className="text-[10px] text-amber-800/70">
          Open meetings: <strong>{openMeetings.length}</strong> · Open tickets:{" "}
          <strong>{openTickets.length}</strong>
          {suggested ? (
            <>
              {" "}
              · Suggested: <strong>{suggested.name}</strong>
            </>
          ) : null}
        </p>
        <button
          type="button"
          disabled={!targetId || busy}
          onClick={() => onReassign(targetId, { openMeetings, openTickets })}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-3 py-2.5 text-xs font-black text-white shadow-md disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
          Reassign open work
        </button>
      </div>
    </div>
  );
}

function MemberDrawer({
  member,
  teamFloor,
  onClose,
  onOpenFullWork,
}) {
  const [meetings, setMeetings] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const [meetingRes, ticketRes] = await Promise.all([
          listFieldMeetings({ ownerUserId: member.id, limit: 50 }).catch(() => ({})),
          getTickets({ assignedTo: member.id, limit: 50 }).catch(() => ({})),
        ]);
        if (!mounted) return;
        const meetingList = Array.isArray(meetingRes)
          ? meetingRes
          : meetingRes?.items || meetingRes?.meetings || meetingRes?.data || [];
        const ticketList = Array.isArray(ticketRes)
          ? ticketRes
          : ticketRes?.tickets || ticketRes?.data || ticketRes?.items || [];
        setMeetings(meetingList);
        setTickets(ticketList);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [member.id]);

  const handleReassign = async (targetId, { openMeetings, openTickets }) => {
    if (!targetId) return;
    setBusy(true);
    try {
      let movedMeetings = 0;
      let movedTickets = 0;
      for (const meeting of openMeetings) {
        const id = meeting._id || meeting.id;
        if (!id) continue;
        await updateFieldMeeting(id, { ownerUserId: targetId });
        movedMeetings += 1;
      }
      for (const ticket of openTickets) {
        const id = ticket._id || ticket.id;
        if (!id) continue;
        await assignTicket({ id, payload: { assignedTo: targetId } });
        movedTickets += 1;
      }
      toast.success(
        `Reassigned ${movedMeetings} meetings · ${movedTickets} tickets`,
      );
      onClose?.();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Reassignment failed");
    } finally {
      setBusy(false);
    }
  };

  const completedMeetings = meetings.filter(
    (m) => String(m.status || "").toLowerCase() === "completed",
  ).length;

  return (
    <motion.aside
      initial={{ y: 24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 24, opacity: 0 }}
      transition={{ type: "spring", stiffness: 320, damping: 28 }}
      className="flex h-full max-h-[min(85vh,720px)] flex-col overflow-hidden rounded-[18px] border border-slate-200 bg-white shadow-xl lg:max-h-none"
    >
      <div className={`bg-gradient-to-r ${cardAccent[member.group] || cardAccent.other} p-4 text-white`}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="relative grid h-12 w-12 place-items-center rounded-2xl bg-white/20 text-sm font-black">
              {initials(member.name)}
              <span
                className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${
                  presenceTone[member.presence]
                }`}
              />
            </span>
            <div>
              <p className="text-base font-black">{member.name}</p>
              <p className="text-xs text-white/85">
                {titleCase(member.roleName)}
                {member.city ? ` · ${member.city}` : ""}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-white/15 p-1.5 hover:bg-white/25"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
        {loading ? (
          <div className="flex h-32 items-center justify-center text-emerald-600">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Meetings", value: meetings.length, tone: "bg-teal-50 text-teal-700" },
                { label: "Done", value: completedMeetings, tone: "bg-emerald-50 text-emerald-700" },
                { label: "Tickets", value: tickets.length, tone: "bg-sky-50 text-sky-700" },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`rounded-xl px-2.5 py-2 text-center ${item.tone}`}
                >
                  <p className="text-lg font-black">{item.value}</p>
                  <p className="text-[9px] font-bold uppercase tracking-wide opacity-80">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3">
              <p className="mb-2 text-[10px] font-black uppercase tracking-wide text-slate-500">
                What they handle
              </p>
              <ul className="space-y-1.5 text-[11px] text-slate-700">
                <li>
                  · Field meetings owner ({meetings.length} in period load)
                </li>
                <li>· Support tickets assigned ({tickets.length})</li>
                <li>
                  · Territory: {[member.locality, member.city, member.state]
                    .filter(Boolean)
                    .join(", ") || "Region coverage"}
                </li>
                <li>· Last heard: {formatSeen(member.lastSeenAt || member.lastLoginAt)}</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-100 p-3">
              <p className="mb-2 text-[10px] font-black uppercase tracking-wide text-slate-500">
                Recent meetings
              </p>
              {meetings.slice(0, 5).length ? (
                <div className="space-y-1.5">
                  {meetings.slice(0, 5).map((m) => (
                    <div
                      key={m._id || m.id}
                      className="rounded-lg border border-slate-100 bg-white px-2.5 py-2 text-[11px]"
                    >
                      <p className="font-bold text-slate-800">
                        {m.client?.name ||
                          m.people?.[0]?.name ||
                          m.title ||
                          "Meeting"}
                      </p>
                      <p className="text-slate-500">
                        {String(m.status || "—").replace(/_/g, " ")}
                        {m.meetingType ? ` · ${String(m.meetingType).replace(/_/g, " ")}` : ""}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-slate-400">No meetings loaded</p>
              )}
            </div>

            {(!member.isOnline || isMidnightWindow()) && (
              <ReassignPanel
                member={member}
                teamFloor={teamFloor}
                meetings={meetings}
                tickets={tickets}
                busy={busy}
                onReassign={handleReassign}
              />
            )}

            <button
              type="button"
              onClick={() => onOpenFullWork?.(member)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs font-black text-emerald-700 hover:bg-emerald-100"
            >
              Open full workboard
              <Radio className="h-3.5 w-3.5" />
            </button>
          </>
        )}
      </div>
    </motion.aside>
  );
}

export default function RmTeamFloorDashboard({
  teamFloor = [],
  onOpenMemberWork,
  groupTabs = GROUP_TABS,
  nestUnderRegionalManagers = false,
  /** Super Admin: nest everyone by reportsTo / managerId (who works under who). */
  nestByReportsTo = false,
}) {
  const [group, setGroup] = useState("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [viewFormat, setViewFormat] = useState("table");
  const now = usePresenceClock(20_000);

  const nestHierarchy = nestUnderRegionalManagers || nestByReportsTo;

  /** Live presence from lastLoginAt — cards + badges update without full page reload */
  const liveTeam = useMemo(
    () => teamFloor.map((m) => enrichTeamMember(m, now)),
    [teamFloor, now],
  );

  const liveStats = useMemo(
    () => ({
      total: liveTeam.length,
      online: liveTeam.filter((m) => m.isOnline).length,
      offline: liveTeam.filter((m) => m.isAccountActive && !m.isOnline).length,
    }),
    [liveTeam],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return liveTeam.filter((m) => {
      if (!nestHierarchy && group !== "all" && m.group !== group) {
        return false;
      }
      // Flat role filters still apply when not nesting, or when picking a single role band
      if (
        nestHierarchy &&
        group !== "all" &&
        !(nestUnderRegionalManagers && group === "regional_manager") &&
        m.group !== group
      ) {
        return false;
      }
      if (!q) return true;
      return [m.name, m.email, m.phone, m.roleName, m.city, m.state]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [liveTeam, group, query, nestHierarchy, nestUnderRegionalManagers]);

  const hierarchyPods = useMemo(() => {
    if (!nestHierarchy) return null;

    const q = query.trim().toLowerCase();
    const matchQ = (m) => {
      if (!q) return true;
      return [m.name, m.email, m.phone, m.roleName, m.city, m.state]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    };

    // Role-specific tabs → flat list (no pods)
    if (group !== "all") {
      if (nestUnderRegionalManagers && group === "regional_manager") {
        // keep RM nesting below
      } else {
        return null;
      }
    }

    const built = nestByReportsTo
      ? buildManagerReportingPods(liveTeam)
      : buildRegionalManagerPods(liveTeam);

    if (
      nestUnderRegionalManagers &&
      !nestByReportsTo &&
      group !== "all" &&
      group !== "regional_manager"
    ) {
      return null;
    }

    const { pods, unassigned } = built;

    const visible = pods
      .map((pod) => {
        const staff = pod.staff.filter(matchQ);
        const managerVisible = matchQ(pod.manager) || staff.length > 0;
        if (!managerVisible) return null;
        return {
          manager: pod.manager,
          staff,
        };
      })
      .filter(Boolean);

    if (group === "all" || (nestByReportsTo && group === "all")) {
      const extras = unassigned.filter((m) => matchQ(m));
      // For RM-only mode, skip RMs in unassigned extras (existing behavior)
      const extrasFiltered = nestByReportsTo
        ? extras
        : extras.filter((m) => m.group !== "regional_manager");
      if (extrasFiltered.length) {
        return [
          ...visible,
          {
            manager: {
              id: "__unassigned__",
              name: nestByReportsTo ? "No manager linked" : "Other / unassigned",
              roleName: "—",
              presence: "offline",
              isOnline: false,
              isAccountActive: true,
              group: "other",
            },
            staff: extrasFiltered,
            hideManagerRow: true,
          },
        ];
      }
    }
    return visible;
  }, [
    liveTeam,
    nestHierarchy,
    nestUnderRegionalManagers,
    nestByReportsTo,
    group,
    query,
  ]);

  const selected = liveTeam.find((m) => m.id === selectedId) || null;

  const groupCounts = useMemo(() => {
    const map = { all: liveTeam.length };
    liveTeam.forEach((m) => {
      map[m.group] = (map[m.group] || 0) + 1;
    });
    return map;
  }, [liveTeam]);

  const tablePods = useMemo(() => {
    if (!hierarchyPods) return null;
    return hierarchyPods;
  }, [hierarchyPods]);

  return (
    <section className="min-w-0 overflow-hidden rounded-[18px] border border-emerald-100 bg-gradient-to-br from-[#f1faf5] via-white to-sky-50 shadow-sm">
      <div className="border-b border-emerald-100/80 bg-white/70 px-3 py-3 backdrop-blur sm:px-5">
        {/* Mobile: 3 equal columns that fit. Desktop: same old row */}
        <div className="flex min-w-0 gap-2 max-lg:w-full lg:grid lg:max-w-3xl lg:grid-cols-3">
          <StatPill label="Total team" value={liveStats.total} tone="emerald" icon={Users} />
          <StatPill label="Online now" value={liveStats.online} tone="sky" icon={Wifi} />
          <StatPill label="Offline" value={liveStats.offline} tone="slate" icon={WifiOff} />
        </div>
      </div>

      <div className="grid min-w-0 gap-4 p-3 sm:p-4 lg:grid-cols-12 lg:p-5">
        <div className={`${selected ? "lg:col-span-7" : "lg:col-span-12"} min-w-0 space-y-3`}>
          <div className="flex min-w-0 flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <AnimatedGroupTabs
              tabs={groupTabs}
              activeKey={group}
              counts={groupCounts}
              onChange={setGroup}
            />
            <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center lg:shrink-0">
              {/* Cards / Table only on large screens; mobile = cards only */}
              <AnimatedViewToggle value={viewFormat} onChange={setViewFormat} />
              <div className="relative w-full sm:w-52 lg:w-52">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search…"
                  className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-7 pr-2 text-[11px] font-semibold text-slate-800 outline-none focus:border-emerald-400 max-lg:py-2.5 max-lg:pl-8 max-lg:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Mobile: always cards */}
          <div className="lg:hidden">
            {hierarchyPods?.length ? (
              <div className="space-y-3">
                {hierarchyPods.map((pod) => (
                  <div key={pod.manager.id} className="space-y-1.5">
                    <p className="text-[10px] font-black uppercase tracking-wide text-indigo-700">
                      {pod.manager.name || "Regional Manager"} · {pod.staff.length} staff
                    </p>
                    <div className="grid gap-1.5">
                      {!pod.hideManagerRow ? (
                        <MemberCard
                          member={pod.manager}
                          selected={selectedId === pod.manager.id}
                          onClick={(m) =>
                            setSelectedId((cur) => (cur === m.id ? "" : m.id))
                          }
                        />
                      ) : null}
                      {pod.staff.map((member) => (
                        <MemberCard
                          key={member.id}
                          member={member}
                          selected={selectedId === member.id}
                          onClick={(m) =>
                            setSelectedId((cur) => (cur === m.id ? "" : m.id))
                          }
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid gap-1.5">
                {filtered.map((member) => (
                  <MemberCard
                    key={member.id}
                    member={member}
                    selected={selectedId === member.id}
                    onClick={(m) =>
                      setSelectedId((cur) => (cur === m.id ? "" : m.id))
                    }
                  />
                ))}
                {!filtered.length ? (
                  <div className="rounded-lg border border-dashed border-slate-200 bg-white py-10 text-center text-xs text-slate-400">
                    No team members in this filter
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* Large+: cards or table (old behavior) */}
          <div className="hidden lg:block">
            {viewFormat === "table" ? (
              tablePods?.length || (!tablePods && filtered.length) ? (
                <MemberTable
                  members={filtered}
                  pods={tablePods}
                  selectedId={selectedId}
                  onSelect={(m) =>
                    setSelectedId((cur) => (cur === m.id ? "" : m.id))
                  }
                />
              ) : (
                <div className="rounded-lg border border-dashed border-slate-200 bg-white py-10 text-center text-xs text-slate-400">
                  No team members in this filter
                </div>
              )
            ) : hierarchyPods?.length ? (
              <div className="space-y-3">
                {hierarchyPods.map((pod) => (
                  <div key={pod.manager.id} className="space-y-1.5">
                    <p className="text-[10px] font-black uppercase tracking-wide text-indigo-700">
                      {pod.manager.name || "Regional Manager"} · {pod.staff.length} staff
                    </p>
                    <div className="grid gap-1.5 sm:grid-cols-2 xl:grid-cols-3">
                      {!pod.hideManagerRow ? (
                        <MemberCard
                          member={pod.manager}
                          selected={selectedId === pod.manager.id}
                          onClick={(m) =>
                            setSelectedId((cur) => (cur === m.id ? "" : m.id))
                          }
                        />
                      ) : null}
                      {pod.staff.map((member) => (
                        <MemberCard
                          key={member.id}
                          member={member}
                          selected={selectedId === member.id}
                          onClick={(m) =>
                            setSelectedId((cur) => (cur === m.id ? "" : m.id))
                          }
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid gap-1.5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {filtered.map((member) => (
                  <MemberCard
                    key={member.id}
                    member={member}
                    selected={selectedId === member.id}
                    onClick={(m) =>
                      setSelectedId((cur) => (cur === m.id ? "" : m.id))
                    }
                  />
                ))}
                {!filtered.length ? (
                  <div className="col-span-full rounded-lg border border-dashed border-slate-200 bg-white py-10 text-center text-xs text-slate-400">
                    No team members in this filter
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>

        <AnimatePresence>
          {selected ? (
            <motion.div
              key={selected.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-[320px] min-w-0 lg:col-span-5 lg:min-h-[420px]"
            >
              <MemberDrawer
                member={selected}
                teamFloor={liveTeam}
                onClose={() => setSelectedId("")}
                onOpenFullWork={onOpenMemberWork}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </section>
  );
}
