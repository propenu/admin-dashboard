import { Activity, CalendarClock, MessageSquare, Paperclip, Send, UserRound, UserRoundCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { TICKET_PRIORITIES, TICKET_STATUSES, priorityTone, statusTone } from "../../constants/ticketOptions";
import { formatDateTime, formatDueDate, formatLabel } from "../../utils/ticketFormatters";

export default function TicketDetailPanel({
  ticket,
  isLoading,
  actor,
  actions,
}) {
  const [comment, setComment] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [assignee, setAssignee] = useState({
    userId: "",
    name: "",
    email: "",
    role: "customer_care",
  });

  const publicComments = useMemo(
    () => (ticket?.comments || []).filter((item) => item.visibility !== "internal"),
    [ticket],
  );
  const internalComments = useMemo(
    () => (ticket?.comments || []).filter((item) => item.visibility === "internal"),
    [ticket],
  );

  useEffect(() => {
    setAssignee({
      userId: ticket?.assignedTo?.userId || "",
      name: ticket?.assignedTo?.name || "",
      email: ticket?.assignedTo?.email || "",
      role: ticket?.assignedTo?.role || "customer_care",
    });
  }, [ticket?._id, ticket?.assignedTo?.userId]);

  if (isLoading) {
    return <section className="rounded-md border border-slate-200 bg-white p-2 text-[11px] text-slate-500">Loading ticket detail...</section>;
  }

  if (!ticket) {
    return <section className="rounded-md border border-slate-200 bg-white p-2 text-[11px] text-slate-500">Select a ticket to inspect, reply, and update workflow.</section>;
  }

  const submitComment = async () => {
    if (!comment.trim()) return;
    await actions.addComment.mutateAsync({
      id: ticket._id,
      payload: {
        message: comment.trim(),
        visibility,
        author: actor,
        attachments: [],
      },
    });
    setComment("");
  };

  const submitAssignment = async () => {
    if (!assignee.name.trim()) return;
    await actions.assignTicket.mutateAsync({
      id: ticket._id,
      payload: {
        assignedTo: {
          userId: assignee.userId.trim() || undefined,
          name: assignee.name.trim(),
          email: assignee.email.trim() || undefined,
          role: assignee.role.trim() || undefined,
        },
        actor,
      },
    });
  };

  return (
    <section className="min-w-0 max-w-full overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-1.5">
        <div className="flex flex-wrap items-start justify-between gap-1.5">
          <div className="min-w-0">
            <p className="text-[9px] font-medium uppercase tracking-wide text-slate-400">
              {ticket._id}
            </p>
            <h2 className="mt-0.5 line-clamp-2 text-[13px] font-medium text-slate-950">
              {ticket.title}
            </h2>
          </div>
          <div className="flex flex-wrap gap-1">
            <span className={`rounded-full border px-1.5 py-0.5 text-[10px] ${priorityTone[ticket.priority] || priorityTone.medium}`}>
              {formatLabel(ticket.priority)}
            </span>
            <span className={`rounded-full border px-1.5 py-0.5 text-[10px] ${statusTone[ticket.status] || statusTone.open}`}>
              {formatLabel(ticket.status)}
            </span>
          </div>
        </div>
        <p className="mt-1 text-[11px] leading-4 text-slate-600">{ticket.description}</p>
      </div>

      <div className="grid gap-1 border-b border-slate-200 p-1.5 lg:grid-cols-2">
        <Info icon={UserRound} label="Requester" value={ticket.requester?.name || "-"} sub={ticket.requester?.email || ticket.requester?.phone} />
        <Info icon={CalendarClock} label="Due Date" value={formatDueDate(ticket.dueAt)} sub={`Created ${formatDateTime(ticket.createdAt)}`} />
      </div>

      <div className="grid gap-1 border-b border-slate-200 p-1.5 md:grid-cols-3">
        <ActionSelect
          label="Status"
          value={ticket.status}
          options={TICKET_STATUSES}
          disabled={actions.changeStatus.isPending}
          onChange={(status) =>
            actions.changeStatus.mutate({
              id: ticket._id,
              payload: { status, actor, reason: "Updated from admin ticket desk" },
            })
          }
        />
        <ActionSelect
          label="Priority"
          value={ticket.priority}
          options={TICKET_PRIORITIES}
          disabled={actions.changePriority.isPending}
          onChange={(priority) =>
            actions.changePriority.mutate({
              id: ticket._id,
              payload: { priority, actor, reason: "Updated from admin ticket desk" },
            })
          }
        />
        <div>
          <p className="text-[9px] font-medium uppercase text-slate-400">Assigned To</p>
          <p className="mt-0.5 rounded-md bg-slate-50 px-1.5 py-1 text-[11px] text-slate-700">
            {ticket.assignedTo?.name || "Unassigned"}
          </p>
        </div>
      </div>

      <div className="grid min-w-0 gap-1.5 p-1.5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,34%)] 2xl:grid-cols-[minmax(0,1fr)_minmax(320px,32%)]">
        <div className="min-w-0 lg:min-h-[460px]">
          <div className="flex items-center justify-between">
            <h3 className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-950">
              <MessageSquare className="h-3 w-3" />
              Conversation
            </h3>
            <select
              value={visibility}
              onChange={(event) => setVisibility(event.target.value)}
              className="h-6 rounded-md border border-slate-200 bg-white px-1.5 text-[10px] outline-none"
            >
              <option value="public">Public</option>
              <option value="internal">Internal</option>
            </select>
          </div>

          <div className="mt-1.5 max-h-[240px] min-h-[120px] space-y-1 overflow-y-auto pr-1">
            {[...publicComments, ...internalComments].length === 0 ? (
              <p className="rounded-md bg-slate-50 p-2 text-[11px] text-slate-500">No comments yet.</p>
            ) : (
              [...publicComments, ...internalComments].map((item) => (
                <article key={item._id || `${item.createdAt}-${item.message}`} className="rounded-md border border-slate-100 bg-slate-50 p-1.5">
                  <div className="flex items-center justify-between gap-1.5">
                    <p className="text-[10px] font-medium text-slate-900">{item.author?.name || "Team"}</p>
                    <span className="text-[9px] text-slate-400">{formatDateTime(item.createdAt)}</span>
                  </div>
                  <p className="mt-0.5 text-[11px] leading-4 text-slate-600">{item.message}</p>
                  {item.visibility === "internal" && (
                    <span className="mt-0.5 inline-block rounded-full bg-amber-50 px-1 py-0.5 text-[9px] text-amber-700">
                      Internal note
                    </span>
                  )}
                </article>
              ))
            )}
          </div>

          <div className="mt-1.5 rounded-md border border-slate-200 bg-white p-1">
            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder={visibility === "internal" ? "Write an internal note" : "Write a public reply"}
              rows={4}
              className="w-full resize-none border-0 bg-transparent p-1 text-[11px] outline-none"
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={submitComment}
                disabled={actions.addComment.isPending || !comment.trim()}
                className="inline-flex h-6 items-center gap-1 rounded-md bg-emerald-600 px-2 text-[10px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send className="h-3 w-3" />
                Send
              </button>
            </div>
          </div>
        </div>

        <aside className="min-w-0 space-y-1.5">
          <Panel title="Raised / Handler" icon={UserRoundCheck}>
            <Detail label="Raised By" value={ticket.requester?.name || "-"} />
            <Detail label="Raised Email" value={ticket.requester?.email || "-"} />
            <Detail label="Handler" value={ticket.assignedTo?.name || "Unassigned"} />
            <div className="mt-1 space-y-1">
              <input
                value={assignee.name}
                onChange={(event) => setAssignee((current) => ({ ...current, name: event.target.value }))}
                placeholder="Handler name"
                className="h-6 w-full rounded-md border border-slate-200 px-1.5 text-[10px] outline-none focus:border-emerald-400"
              />
              <input
                value={assignee.email}
                onChange={(event) => setAssignee((current) => ({ ...current, email: event.target.value }))}
                placeholder="Handler email"
                className="h-6 w-full rounded-md border border-slate-200 px-1.5 text-[10px] outline-none focus:border-emerald-400"
              />
              <div className="grid grid-cols-[1fr_70px] gap-1">
                <input
                  value={assignee.role}
                  onChange={(event) => setAssignee((current) => ({ ...current, role: event.target.value }))}
                  placeholder="Role"
                  className="h-6 w-full rounded-md border border-slate-200 px-1.5 text-[10px] outline-none focus:border-emerald-400"
                />
                <button
                  type="button"
                  onClick={submitAssignment}
                  disabled={actions.assignTicket.isPending || !assignee.name.trim()}
                  className="h-6 rounded-md bg-blue-600 px-2 text-[10px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Assign
                </button>
              </div>
            </div>
          </Panel>

          <Panel title="Details">
            <Detail label="Department" value={formatLabel(ticket.department)} />
            <Detail label="Category" value={formatLabel(ticket.category)} />
            <Detail label="Property" value={ticket.propertyId || "-"} />
            <Detail label="Asset Type" value={formatLabel(ticket.metadata?.relatedAsset?.category)} />
            <Detail label="Asset Name" value={ticket.metadata?.relatedAsset?.title || "-"} />
            <Detail label="Location" value={formatLocation(ticket.metadata?.relatedAsset || ticket.metadata?.requesterLocation)} />
            <Detail label="Source" value={formatLabel(ticket.source)} />
          </Panel>

          <Panel title="Activity" icon={Activity}>
            <div className="max-h-44 space-y-1 overflow-y-auto pr-0.5">
              {(ticket.activities || []).length === 0 ? (
                <p className="text-[10px] text-slate-500">No activity yet</p>
              ) : (
                ticket.activities.slice(-6).reverse().map((item, index) => (
                  <div key={`${item.action}-${item.createdAt}-${index}`} className="rounded bg-slate-50 px-1.5 py-1">
                    <p className="text-[10px] font-medium text-slate-900">{formatLabel(item.action)}</p>
                    <p className="text-[9px] text-slate-500">
                      {item.actor?.name || "System"} - {formatDateTime(item.createdAt)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </Panel>

          <Panel title="Attachments" icon={Paperclip}>
            {(ticket.attachments || []).length === 0 ? (
              <p className="text-[11px] text-slate-500">No attachments</p>
            ) : (
              ticket.attachments.map((item, index) => (
                <a
                  key={`${item.url}-${index}`}
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block truncate rounded border border-slate-100 px-2 py-1 text-[11px] text-blue-600"
                >
                  {item.name || "Attachment"}
                </a>
              ))
            )}
          </Panel>
        </aside>
      </div>
    </section>
  );
}

function Info({ icon: Icon, label, value, sub }) {
  return (
    <div className="flex items-center gap-1.5 rounded-md bg-slate-50 p-1.5">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-slate-500">
        <Icon className="h-3 w-3" />
      </span>
      <div className="min-w-0">
        <p className="text-[9px] font-medium uppercase text-slate-400">{label}</p>
        <p className="truncate text-[11px] font-medium text-slate-900">{value}</p>
        {sub && <p className="truncate text-[10px] text-slate-500">{sub}</p>}
      </div>
    </div>
  );
}

function ActionSelect({ label, value, options, onChange, disabled }) {
  return (
    <label>
      <span className="text-[9px] font-medium uppercase text-slate-400">{label}</span>
      <select
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className="mt-0.5 h-7 w-full rounded-md border border-slate-200 bg-white px-1.5 text-[11px] outline-none disabled:opacity-60"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {formatLabel(option)}
          </option>
        ))}
      </select>
    </label>
  );
}

function Panel({ title, icon: Icon, children }) {
  return (
    <div className="rounded-md border border-slate-200 p-1.5">
      <h3 className="mb-1 flex items-center gap-1 text-[11px] font-medium text-slate-950">
        {Icon && <Icon className="h-3 w-3" />}
        {title}
      </h3>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="grid grid-cols-[82px_minmax(0,1fr)] items-center gap-1.5 text-[10px]">
      <span className="text-slate-500">{label}</span>
      <span className="truncate text-right text-slate-900">{value || "-"}</span>
    </div>
  );
}

function formatLocation(item) {
  return [item?.locality, item?.city, item?.state, item?.pincode].filter(Boolean).join(", ");
}
