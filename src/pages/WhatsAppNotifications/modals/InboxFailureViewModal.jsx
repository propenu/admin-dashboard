import {
  AlertTriangle,
  Eye,
  MessageCircle,
  RotateCcw,
  X,
  XCircle,
} from "lucide-react";

function formatWhen(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Full failure reason popup — same advanced table style as Campaigns / Logs.
 */
export function InboxFailureViewModal({
  message,
  conversation,
  onClose,
  onRetry,
  retrying,
}) {
  if (!message) return null;

  const phone =
    conversation?.waId ||
    conversation?.phone ||
    message.to ||
    message.waId ||
    "—";
  const reason =
    message.error ||
    message.failureReason ||
    message.statusError ||
    "Delivery failed. No detailed reason was returned by Meta.";
  const templateName =
    message.templateName || message.template || message.name || "—";
  const campaignId = message.campaignId || "—";
  const wamid = message.wamid || message.messageId || message._id || "—";
  const source = message.source || message.senderType || "agent";

  const rows = [
    { label: "Phone", value: phone },
    { label: "Status", value: "Failed" },
    { label: "Time", value: formatWhen(message.createdAt) },
    { label: "Source", value: String(source).toUpperCase() },
    { label: "Template", value: templateName },
    { label: "Campaign ID", value: campaignId },
    { label: "Message ID", value: String(wamid) },
    {
      label: "Body",
      value: message.body || message.text || "—",
    },
    { label: "Failure reason", value: reason },
  ];

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/45 p-0 md:items-center md:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl md:rounded-2xl">
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div className="flex min-w-0 items-start gap-3">
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-500">
              <Eye size={18} />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-extrabold text-slate-900">
                Delivery failure details
              </h2>
              <p className="text-sm text-slate-500">
                Full Meta / webhook reason for this failed WhatsApp message.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-600">
              <XCircle size={12} /> Failed
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
              <MessageCircle size={12} /> {phone}
            </span>
            <span className="text-xs text-slate-400">
              {formatWhen(message.createdAt)}
            </span>
          </div>

          <div className="rounded-xl border border-rose-100 bg-rose-50/70 px-4 py-3">
            <div className="flex items-start gap-2">
              <AlertTriangle
                size={16}
                className="mt-0.5 shrink-0 text-rose-500"
              />
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-rose-500">
                  Failure reason
                </p>
                <p className="mt-1 whitespace-pre-wrap break-words text-sm font-semibold leading-relaxed text-rose-800">
                  {reason}
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-slate-200">
            <table className="w-full table-fixed border-collapse">
              <colgroup>
                <col style={{ width: "28%" }} />
                <col style={{ width: "72%" }} />
              </colgroup>
              <thead>
                <tr className="border-b border-emerald-200 bg-emerald-50/50">
                  <th className="border-r border-emerald-200/80 px-3 py-2 text-left text-[11px] font-extrabold uppercase tracking-[0.03em] text-[#16a34a]">
                    Field
                  </th>
                  <th className="px-3 py-2 text-left text-[11px] font-extrabold uppercase tracking-[0.03em] text-[#16a34a]">
                    Value
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.label}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="border-r border-slate-200/80 px-3 py-2 align-top text-[12px] font-bold text-slate-700">
                      {row.label}
                    </td>
                    <td className="px-3 py-2 align-top text-[12px] leading-snug text-slate-600 break-words whitespace-pre-wrap">
                      {row.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-slate-100 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50"
          >
            Close
          </button>
          <button
            type="button"
            disabled={retrying || !(message.body || message.text)}
            onClick={() => onRetry?.(message)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-rose-600 disabled:opacity-40"
          >
            <RotateCcw size={14} />
            {retrying ? "Retrying…" : "Retry send"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default InboxFailureViewModal;
