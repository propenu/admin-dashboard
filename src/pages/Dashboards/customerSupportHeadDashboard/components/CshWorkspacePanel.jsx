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
      <header className="shrink-0 border-b border-slate-100 bg-gradient-to-r from-white to-emerald-50/80 px-3.5 py-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1 basis-[180px]">
            <span className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${priorityClass(ticket.priority)}`}>
              {ticket.priority || "Medium"}
            </span>
            <h2 className="mt-1.5 break-words text-sm font-bold leading-snug text-slate-900 sm:text-[15px]">
              {ticket.title}
            </h2>
            <p className="mt-1 break-words text-[11px] leading-relaxed text-slate-500">
              {ticket.ticketId} · {requesterName}
              {requesterContact ? ` · ${requesterContact}` : ""}
            </p>
            <p className="mt-1 text-[11px] font-medium text-slate-600">
              Assigned: {ticket.assignedTo?.name || "Unassigned"}
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[180px]">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Status
              <select
                value={ticket.status || "open"}
                onChange={(e) => onStatusChange?.(e.target.value)}
                disabled={submitting}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-emerald-500"
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

        <div className="mt-3 flex flex-wrap items-end gap-2 rounded-xl border border-slate-200 bg-white/80 p-2.5">
          <label className="min-w-0 flex-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Reassign executive
            <select
              value={assigneeId || currentAssigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              disabled={submitting}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-emerald-500"
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
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            <UserPlus className="h-3.5 w-3.5" />
            Assign
          </button>
        </div>
      </header>

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3 [scrollbar-width:thin]">
        {ticket.description && (
          <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-xs text-slate-600">
            {ticket.description}
          </div>
        )}
        {publicComments.length ? (
          publicComments.slice(-8).map((comment, index) => (
            <article
              key={comment._id || index}
              className="rounded-xl border border-slate-100 bg-white px-3 py-2.5"
            >
              <p className="text-[11px] font-bold text-slate-800">
                {comment.author?.name || "Agent"}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">{comment.message}</p>
            </article>
          ))
        ) : (
          <p className="py-6 text-center text-xs text-slate-400">No public replies yet</p>
        )}
      </div>

      <footer className="shrink-0 border-t border-slate-100 bg-slate-50/60 p-3">
        <div className="mb-2 flex gap-2">
          {[
            { key: "public", label: "Public Reply" },
            { key: "internal", label: "Internal Note" },
          ].map((mode) => (
            <button
              key={mode.key}
              type="button"
              onClick={() => setReplyMode(mode.key)}
              className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                replyMode === mode.key
                  ? "bg-emerald-600 text-white"
                  : "bg-white text-slate-600 border border-slate-200"
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <textarea
            value={draft}
            onChange={(e) => onDraftChange?.(e.target.value)}
            rows={2}
            placeholder={
              replyMode === "public"
                ? "Reply to the buyer…"
                : "Note for team leads / executives…"
            }
            className="min-h-[64px] w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none focus:border-emerald-500"
          />
          <button
            type="button"
            disabled={submitting || !draft?.trim()}
            onClick={() => (replyMode === "public" ? onSendReply?.() : onSendNote?.())}
            className="inline-flex h-auto shrink-0 items-center justify-center self-stretch rounded-xl bg-emerald-600 px-3 text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </footer>
    </section>
  );
}
