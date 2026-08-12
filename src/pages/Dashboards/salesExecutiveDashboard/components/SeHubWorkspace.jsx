import {
  Building2,
  Calendar,
  CircleDashed,
  Home,
  Phone,
  Plus,
} from "lucide-react";
import {
  clientLocation,
  clientRoleLabel,
  formatDateTime,
  formatShortDate,
  HUB_CLIENT_TABS,
  inventoryTitle,
  meetingNotesText,
  meetingResultText,
} from "../salesExecutiveHubData";

function StatChip({ label, value, tone = "slate" }) {
  const tones = {
    slate: "bg-slate-50 text-slate-700",
    emerald: "bg-emerald-50 text-emerald-800",
    amber: "bg-amber-50 text-amber-800",
  };
  return (
    <div className={`rounded-xl px-3 py-2 text-center ${tones[tone]}`}>
      <p className="text-base font-black leading-none">{value}</p>
      <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide opacity-80">
        {label}
      </p>
    </div>
  );
}

function MeetingsTimeline({ meetings }) {
  if (!meetings.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-xs text-slate-500">
        No meetings linked to this client yet. Schedule a field meeting to start history.
      </div>
    );
  }

  return (
    <div className="relative space-y-0 pl-2">
      <div className="absolute bottom-2 left-[22px] top-2 w-px bg-slate-200" />
      {meetings.map((meeting) => {
        const when = meeting.scheduledStart || meeting.punchOutAt || meeting.createdAt;
        const mode =
          meeting.punchOutAt
            ? "Punch out"
            : meeting.punchInAt
              ? "Punch in"
              : String(meeting.meetingType || meeting.mode || "Meeting").replace(
                  /_/g,
                  " ",
                );
        return (
          <article key={meeting.id || meeting._id} className="relative flex gap-3 pb-4">
            <div className="z-[1] flex w-12 shrink-0 flex-col items-center">
              <span className="rounded-lg bg-emerald-50 px-1.5 py-1 text-center text-[10px] font-black uppercase leading-tight text-emerald-700">
                {formatShortDate(when)}
              </span>
              <span className="mt-2 h-2.5 w-2.5 rounded-full border-2 border-emerald-500 bg-white" />
            </div>
            <div className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-bold capitalize text-slate-900">{mode}</p>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-600">
                  {String(meeting.status || "planned").replace(/_/g, " ")}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-700">
                <span className="font-bold text-slate-500">Result: </span>
                {meetingResultText(meeting)}
              </p>
              {meetingNotesText(meeting) ? (
                <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
                  <span className="font-bold text-slate-400">Notes: </span>
                  {meetingNotesText(meeting)}
                </p>
              ) : null}
              <p className="mt-2 text-[10px] font-semibold text-slate-400">
                Logged {formatDateTime(meeting.punchOutAt || meeting.updatedAt || when)}
              </p>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function InventoryList({ items, empty, onOpen }) {
  if (!items.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-xs text-slate-500">
        {empty}
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <button
          key={item._id || item.id}
          type="button"
          onClick={() => onOpen?.(item)}
          className="flex w-full items-start justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left hover:border-emerald-200"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-900">
              {inventoryTitle(item)}
            </p>
            <p className="mt-0.5 text-[11px] text-slate-500">
              {[item._category || item._type, item.locality || item.city]
                .filter(Boolean)
                .join(" · ") || "—"}
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold capitalize text-slate-600">
            {String(item.status || "unknown")}
          </span>
        </button>
      ))}
    </div>
  );
}

export default function SeHubWorkspace({
  client,
  clientTab,
  onTabChange,
  stats,
  meetings,
  properties,
  projects,
  subscription,
  followUps,
  loadingDetail,
  onScheduleMeeting,
  onOpenFieldMeetings,
  onOpenFollowUp,
  onOpenProperty,
  onOpenProject,
}) {
  if (!client) {
    return (
      <section className="flex h-full min-h-0 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center shadow-sm">
        <CircleDashed className="mb-3 h-8 w-8 text-slate-300" />
        <p className="text-sm font-bold text-slate-700">Select a client</p>
        <p className="mt-1 max-w-sm text-xs text-slate-500">
          Search by location, then open meetings, results, properties, projects, and
          subscription details.
        </p>
      </section>
    );
  }

  const loc = clientLocation(client);

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-4 py-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-sm font-black text-emerald-700">
                {String(client.name || "?")
                  .split(/\s+/)
                  .slice(0, 2)
                  .map((p) => p[0] || "")
                  .join("")
                  .toUpperCase()}
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-lg font-black text-slate-950">
                  {client.name || "Client"}
                </h2>
                <p className="text-xs text-slate-500">
                  {clientRoleLabel(client)} · {loc.line}
                </p>
              </div>
            </div>
          </div>
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-800">
            Active client
          </span>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <StatChip label="Meetings" value={stats.meetingCount} />
          <StatChip label="Completed" value={stats.completed} tone="emerald" />
          <StatChip label="Follow-up" value={stats.pendingFollowUp} tone="amber" />
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 border-b border-slate-100 px-3 py-2">
        {HUB_CLIENT_TABS.map((tab) => {
          const active = clientTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onTabChange(tab.key)}
              className={`rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition ${
                active
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-50 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {loadingDetail && ["properties", "projects", "subscription"].includes(clientTab) ? (
          <p className="text-xs font-semibold text-slate-500">Loading client details…</p>
        ) : null}

        {clientTab === "overview" ? (
          <div className="space-y-3 text-sm text-slate-600">
            <p>
              <span className="font-bold text-slate-800">Contact: </span>
              {[client.phone || client.mobile, client.email].filter(Boolean).join(" · ") ||
                "—"}
            </p>
            <p>
              <span className="font-bold text-slate-800">Location: </span>
              {loc.line}
            </p>
            <p>
              Latest meeting result:{" "}
              <strong className="text-slate-800">
                {meetings[0] ? meetingResultText(meetings[0]) : "No meetings yet"}
              </strong>
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <Home className="mb-1 h-4 w-4 text-emerald-600" />
                <p className="text-lg font-black text-slate-900">{properties.length}</p>
                <p className="text-[11px] font-semibold text-slate-500">Properties</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <Building2 className="mb-1 h-4 w-4 text-emerald-600" />
                <p className="text-lg font-black text-slate-900">{projects.length}</p>
                <p className="text-[11px] font-semibold text-slate-500">Projects</p>
              </div>
            </div>
          </div>
        ) : null}

        {clientTab === "meetings" ? <MeetingsTimeline meetings={meetings} /> : null}

        {clientTab === "properties" ? (
          <InventoryList
            items={properties}
            empty="No properties for this client."
            onOpen={onOpenProperty}
          />
        ) : null}

        {clientTab === "projects" ? (
          <InventoryList
            items={projects}
            empty="No projects for this client."
            onOpen={onOpenProject}
          />
        ) : null}

        {clientTab === "subscription" ? (
          subscription ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Subscription
              </p>
              <p className="mt-1 text-lg font-black text-slate-950">{subscription.plan}</p>
              <p className="mt-1 text-sm font-semibold capitalize text-emerald-700">
                {subscription.status}
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Renews / paid: {formatShortDate(subscription.renewsAt)}
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-xs text-slate-500">
              No subscription / payment found for this client.
            </div>
          )
        ) : null}

        {clientTab === "followups" ? (
          followUps.length ? (
            <div className="space-y-2">
              {followUps.map((m) => (
                <div
                  key={m.id || m._id}
                  className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5"
                >
                  <p className="text-sm font-bold text-slate-900">
                    {m.client?.name || client.name || "Follow-up"}
                  </p>
                  <p className="mt-0.5 text-xs text-amber-800">
                    {meetingResultText(m)} · Due{" "}
                    {formatShortDate(m.nextAction?.dueAt || m.punchOutAt)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-xs text-slate-500">
              No open follow-ups for this client.
            </div>
          )
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-slate-100 p-3 sm:grid-cols-4">
        <button
          type="button"
          onClick={onScheduleMeeting}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2.5 text-xs font-bold text-white hover:bg-emerald-700"
        >
          <Plus className="h-3.5 w-3.5" />
          Schedule meeting
        </button>
        <button
          type="button"
          onClick={onOpenFieldMeetings}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
        >
          <Calendar className="h-3.5 w-3.5" />
          Log result
        </button>
        <a
          href={client.phone || client.mobile ? `tel:${client.phone || client.mobile}` : undefined}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
        >
          <Phone className="h-3.5 w-3.5" />
          Call
        </a>
        <button
          type="button"
          onClick={onOpenFollowUp}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100"
        >
          Client Progress
        </button>
      </div>
    </section>
  );
}
