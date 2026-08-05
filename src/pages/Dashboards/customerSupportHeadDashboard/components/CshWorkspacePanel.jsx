import { useState } from "react";
import { Loader2, MessageSquare, Send, UserPlus } from "lucide-react";

const statusOptions = [
  "open",
  "in_progress",
  "awaiting_user_response",
  "under_review",
  "resolved",
  "closed",
];

const priorityClass = (p = "") => {
  const v = String(p).toLowerCase();
  if (v === "urgent" || v === "high") return "bg-rose-100 text-rose-700";
  if (v === "medium") return "bg-amber-100 text-amber-700";
  return "bg-slate-100 text-slate-600";
};

const panelShell =
  "flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-sm";

export default function CshWorkspacePanel({
  ticket,
  isLoading,
  teamMembers = [],
  publicReply,
  internalNote,
  onPublicReplyChange,
  onInternalNoteChange,
  onStatusChange,
  onAssign,
  onSendReply,
  onSendNote,
  submitting,
}) {
  const [replyMode, setReplyMode] = useState("public");
  const [assigneeId, setAssigneeId] = useState("");

  if (isLoading) {
    return (
      <section className={`${panelShell} grid place-items-center`}>
        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
      </section>
    );
  }

  if (!ticket) {
    return (
      <section className={`${panelShell} grid place-items-center`}>
        <div className="flex flex-col items-center justify-center gap-1 px-3 py-8 text-center text-xs text-slate-400">
          <MessageSquare className="h-8 w-8 text-slate-300" />
          <p className="font-medium text-slate-500">Select a ticket to triage</p>
          <p className="text-[11px]">Assign executives, update status, reply to buyers</p>
        </div>
      </section>
    );
  }

  const publicComments = (ticket.comments || []).filter((c) => c.visibility !== "internal");
  const requesterName = ticket.requester?.name || "Customer";
  const requesterContact = ticket.requester?.phone || ticket.requester?.email || "";
  const draft = replyMode === "public" ? publicReply : internalNote;
  const onDraftChange = replyMode === "public" ? onPublicReplyChange : onInternalNoteChange;
  const currentAssigneeId = String(
    ticket.assignedTo?.userId || ticket.assignedTo?._id || ticket.assigneeId || "",
  );

  return (
    <section className={panelShell}>
      <header className="shrink-0 border-b border-slate-100 bg-gradient-to-r from-white to-emerald-50/80 px-3 py-2.5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0 flex-1 basis-[180px]">
            <span className={`inline-block rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${priorityClass(ticket.priority)}`}>
              {ticket.priority || "Medium"}
            </span>
            <h2 className="mt-1 break-words text-[13px] font-black leading-snug text-slate-900">
              {ticket.title}
            </h2>
            <p className="mt-0.5 break-words text-[10px] text-slate-500">
              {ticket.ticketId} · {requesterName}
              {requesterContact ? ` · ${requesterContact}` : ""}
            </p>
            <p className="mt-0.5 text-[10px] font-semibold text-slate-600">
              Assigned: {ticket.assignedTo?.name || "Unassigned"}
            </p>
          </div>
          <div className="flex w-full flex-col gap-1 sm:w-auto sm:min-w-[160px]">
            <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">
              Status
              <select
                value={ticket.status || "open"}
                onChange={(e) => onStatusChange?.(e.target.value)}
                disabled={submitting}
                className="mt-0.5 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[11px] font-semibold text-slate-700 outline-none focus:border-emerald-500"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="mt-2 flex flex-wrap items-end gap-1.5 rounded-[10px] border border-slate-200 bg-white/80 p-2">
          <label className="min-w-0 flex-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">
            Reassign executive
            <select
              value={assigneeId || currentAssigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              disabled={submitting}
              className="mt-0.5 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[11px] font-semibold text-slate-700 outline-none focus:border-emerald-500"
            >
              <option value="">Select team member</option>
              {teamMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} · {member.open} open
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            disabled={submitting || !(assigneeId || currentAssigneeId)}
            onClick={() => {
              const id = assigneeId || currentAssigneeId;
              const member = teamMembers.find((m) => m.id === id);
              if (!member) return;
              onAssign?.(member);
            }}
            className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            <UserPlus className="h-3.5 w-3.5" />
            Assign
          </button>
        </div>
      </header>

      <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto p-2.5 [scrollbar-width:thin]">
        {ticket.description && (
          <div className="rounded-[10px] border border-slate-100 bg-slate-50 px-2.5 py-2 text-[11px] text-slate-600">
            {ticket.description}
          </div>
        )}
        {publicComments.length ? (
          publicComments.slice(-8).map((comment, index) => (
            <article
              key={comment._id || index}
              className="rounded-[10px] border border-slate-100 bg-white px-2.5 py-2"
            >
              <p className="text-[10px] font-bold text-slate-800">
                {comment.author?.name || "Agent"}
              </p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-slate-600">{comment.message}</p>
            </article>
          ))
        ) : (
          <p className="py-4 text-center text-[11px] text-slate-400">No public replies yet</p>
        )}
      </div>

      <footer className="shrink-0 border-t border-slate-100 bg-slate-50/60 p-2.5">
        <div className="mb-1.5 flex gap-1.5">
          {[
            { key: "public", label: "Public Reply" },
            { key: "internal", label: "Internal Note" },
          ].map((mode) => (
            <button
              key={mode.key}
              type="button"
              onClick={() => setReplyMode(mode.key)}
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                replyMode === mode.key
                  ? "bg-emerald-600 text-white"
                  : "border border-slate-200 bg-white text-slate-600"
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5">
          <textarea
            value={draft}
            onChange={(e) => onDraftChange?.(e.target.value)}
            rows={2}
            placeholder={
              replyMode === "public"
                ? "Reply to the buyer…"
                : "Note for team leads / executives…"
            }
            className="min-h-[52px] w-full resize-none rounded-[10px] border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] text-slate-700 outline-none focus:border-emerald-500"
          />
          <button
            type="button"
            disabled={submitting || !draft?.trim()}
            onClick={() => (replyMode === "public" ? onSendReply?.() : onSendNote?.())}
            className="inline-flex h-auto shrink-0 items-center justify-center self-stretch rounded-[10px] bg-emerald-600 px-2.5 text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </footer>
    </section>
  );
}
