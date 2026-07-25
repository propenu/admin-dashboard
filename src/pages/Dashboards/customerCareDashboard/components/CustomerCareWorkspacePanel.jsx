import { useState } from "react";
import { CheckCheck, Loader2, MessageSquare, Paperclip, Send, Smile } from "lucide-react";
import { TICKET_STATUSES } from "../../../Tickets/constants/ticketOptions";
import { formatRelativeClock } from "../customerCareDashboardData";

const statusOptions = TICKET_STATUSES.filter((s) =>
  ["open", "in_progress", "awaiting_user_response", "resolved", "closed"].includes(s),
);

const initials = (name = "") =>
  name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("") || "?";

const priorityClass = (p = "") => {
  const v = String(p).toLowerCase();
  if (v === "urgent" || v === "high") return "bg-rose-100 text-rose-700";
  if (v === "medium") return "bg-amber-100 text-amber-700";
  return "bg-slate-100 text-slate-600";
};

const panelShell =
  "flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-sm";

export default function CustomerCareWorkspacePanel({
  ticket,
  isLoading,
  publicReply,
  internalNote,
  onPublicReplyChange,
  onInternalNoteChange,
  onStatusChange,
  onSendReply,
  onSendNote,
  submitting,
  currentUserName,
}) {
  const [replyMode, setReplyMode] = useState("public");

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
          <p className="font-medium text-slate-500">Select a ticket from the queue</p>
        </div>
      </section>
    );
  }

  const publicComments = (ticket.comments || []).filter((c) => c.visibility !== "internal");
  const requesterName = ticket.requester?.name || "Customer";
  const requesterContact = ticket.requester?.phone || ticket.requester?.email || "";
  const draft = replyMode === "public" ? publicReply : internalNote;
  const onDraftChange = replyMode === "public" ? onPublicReplyChange : onInternalNoteChange;

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
          </div>
          <div className="w-full shrink-0 sm:w-auto">
            <label htmlFor="ticket-status-select" className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Status
            </label>
            <select
              id="ticket-status-select"
              value={ticket.status || "open"}
              onChange={(e) => onStatusChange(e.target.value)}
              disabled={submitting}
              className="h-8 w-full min-w-[110px] rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 outline-none focus:border-emerald-500 sm:w-auto"
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>{s.replaceAll("_", " ")}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-2 flex flex-wrap gap-1.5 border-t border-slate-100 pt-2">
          <button
            type="button"
            disabled={submitting}
            onClick={() => onStatusChange("in_progress")}
            className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-green-700 disabled:opacity-55"
          >
            Start Progress
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => onStatusChange("awaiting_user_response")}
            className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-900 disabled:opacity-55"
          >
            Await User
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => onStatusChange("resolved")}
            className="rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-xs font-bold text-green-700 disabled:opacity-55"
          >
            Resolve Ticket
          </button>
        </div>
      </header>

      <div className="flex min-h-[120px] min-w-0 flex-1 flex-col overflow-hidden">
        <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50/80 px-3.5 py-3 [scrollbar-color:#bbf7d0_transparent] [scrollbar-width:thin]">
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[11px] font-bold text-slate-600">
                {initials(requesterName)}
              </div>
              <div className="min-w-0 flex-1 rounded-xl rounded-tl-sm border border-slate-100 bg-white px-3 py-2.5 shadow-sm">
                <div className="flex justify-between gap-2">
                  <p className="text-xs font-bold text-slate-800">{requesterName}</p>
                  <span className="text-[11px] text-slate-400">{formatRelativeClock(ticket.createdAt)}</span>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-slate-700">
                  {ticket.description || "No description provided."}
                </p>
              </div>
            </div>

            {publicComments.map((comment, i) => {
              const authorRole = String(comment.author?.role || "").toLowerCase();
              const requesterRoles = new Set(["user", "builder", "agent", "builder_staff", "owner", "buyer", "tenant"]);
              const isAgent = Boolean(authorRole) && !requesterRoles.has(authorRole);
              const author = comment.author?.name || (isAgent ? currentUserName : requesterName);
              return (
                <div key={comment._id || i} className={`flex gap-3 ${isAgent ? "flex-row-reverse" : ""}`}>
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${isAgent ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"}`}>
                    {initials(author)}
                  </div>
                  <div className={`max-w-[88%] rounded-xl border px-3 py-2.5 shadow-sm ${isAgent ? "rounded-tr-sm border-emerald-100 bg-emerald-50" : "rounded-tl-sm border-slate-100 bg-white"}`}>
                    <p className="text-xs font-bold text-slate-800">{author}</p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-700">{comment.message}</p>
                    {isAgent && <CheckCheck className="ml-auto mt-1 h-3.5 w-3.5 text-emerald-500" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <footer className="shrink-0 border-t border-slate-200 bg-white px-3.5 py-3">
        <div className="flex min-w-0 flex-col gap-2.5 rounded-xl border border-slate-200 bg-slate-100 p-2.5">
          <div className="grid grid-cols-2 gap-1 rounded-[10px] bg-slate-200 p-1" role="tablist" aria-label="Reply type">
            <button
              type="button"
              role="tab"
              aria-selected={replyMode === "public"}
              onClick={() => setReplyMode("public")}
              className={`min-w-0 truncate rounded-lg px-3 py-2.5 text-xs font-bold transition ${
                replyMode === "public"
                  ? "bg-white text-green-700 shadow-sm"
                  : "bg-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              Public Reply
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={replyMode === "internal"}
              onClick={() => setReplyMode("internal")}
              className={`min-w-0 truncate rounded-lg px-3 py-2.5 text-xs font-bold transition ${
                replyMode === "internal"
                  ? "bg-white text-green-700 shadow-sm"
                  : "bg-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              Internal Note (Private)
            </button>
          </div>

          <div
            role="tabpanel"
            className={`flex min-w-0 flex-col gap-2.5 rounded-[10px] border bg-white p-3 ${
              replyMode === "internal" ? "border-slate-300" : "border-emerald-300"
            }`}
          >
            <textarea
              id={replyMode === "public" ? "cce-public-reply" : "cce-internal-note"}
              value={draft}
              onChange={(e) => onDraftChange(e.target.value)}
              rows={3}
              placeholder={
                replyMode === "public"
                  ? "Write a clear update for the customer…"
                  : "Team-only note (not visible to customer)…"
              }
              className="min-h-[88px] w-full resize-y rounded-lg border border-slate-200 px-3 py-2.5 text-sm leading-relaxed text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
            <div className={`flex min-h-9 items-center gap-2.5 ${replyMode === "internal" ? "justify-end" : "justify-between"}`}>
              {replyMode === "public" && (
                <div className="flex items-center gap-2 text-slate-400">
                  <Paperclip className="h-4 w-4" />
                  <Smile className="h-4 w-4" />
                </div>
              )}
              {replyMode === "public" ? (
                <button
                  type="button"
                  disabled={submitting || !draft.trim()}
                  onClick={onSendReply}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-2 text-xs font-bold text-white hover:bg-green-700 disabled:opacity-55"
                >
                  <Send className="h-3.5 w-3.5" /> Send Reply
                </button>
              ) : (
                <button
                  type="button"
                  disabled={submitting || !draft.trim()}
                  onClick={onSendNote}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 disabled:opacity-55"
                >
                  Save Note
                </button>
              )}
            </div>
          </div>
        </div>
      </footer>
    </section>
  );
}
