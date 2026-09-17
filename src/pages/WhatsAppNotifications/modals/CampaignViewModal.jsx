import {
  CheckCircle2,
  Clock3,
  Eye,
  IndianRupee,
  MessageSquare,
  RotateCcw,
  X,
  XCircle,
} from "lucide-react";

function campaignAgeMs(row) {
  const t = new Date(row?.createdAt || 0).getTime();
  if (Number.isNaN(t) || !t) return 0;
  return Date.now() - t;
}

function statusOf(row) {
  if (row.failed > 0 && row.delivered === 0 && row.pending === 0)
    return "Failed";
  if (row.pending > 0 && row.delivered === 0) {
    return campaignAgeMs(row) < 3 * 60 * 1000 ? "Sending" : "Stuck";
  }
  if (row.pending > 0) return "Running";
  if (row.failed > 0) return "Partial";
  if (row.delivered > 0) return "Completed";
  return "Queued";
}

function statusTone(label) {
  if (label === "Failed") return "bg-rose-50 text-rose-600 border-rose-200";
  if (label === "Sending" || label === "Running")
    return "bg-sky-50 text-sky-700 border-sky-200";
  if (label === "Stuck")
    return "bg-amber-50 text-amber-700 border-amber-200";
  if (label === "Partial") return "bg-orange-50 text-orange-600 border-orange-200";
  if (label === "Completed")
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  return "bg-slate-50 text-slate-600 border-slate-200";
}

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
 * Full campaign detail popup when user clicks View.
 */
export function CampaignViewModal({
  campaign,
  onClose,
  onRetry,
  retrying,
}) {
  if (!campaign) return null;

  const label = statusOf(campaign);
  const spend = (Number(campaign.delivered || 0) * 0.86).toFixed(2);
  const progressPct =
    campaign.total > 0
      ? Math.round((campaign.delivered / campaign.total) * 100)
      : 0;

  const stats = [
    {
      label: "Total",
      value: campaign.total,
      icon: MessageSquare,
      tone: "text-slate-800 bg-slate-50",
    },
    {
      label: "Delivered",
      value: campaign.delivered,
      icon: CheckCircle2,
      tone: "text-emerald-700 bg-emerald-50",
    },
    {
      label: "Failed",
      value: campaign.failed,
      icon: XCircle,
      tone: "text-rose-600 bg-rose-50",
    },
    {
      label: "Pending",
      value: campaign.pending,
      icon: Clock3,
      tone: "text-amber-600 bg-amber-50",
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-0 md:items-center md:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl md:rounded-2xl">
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div className="flex min-w-0 items-start gap-3">
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#2563eb]/10 text-[#2563eb]">
              <Eye size={18} />
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-extrabold text-slate-900">
                {campaign.name}
              </h2>
              <p className="text-sm text-slate-500">
                Campaign delivery summary, spend, and retry actions.
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
            <span
              className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${statusTone(label)}`}
            >
              {label}
            </span>
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
              {campaign.category || "MARKETING"} · {campaign.language || "en"}
            </span>
            <span className="text-xs text-slate-400">
              {formatWhen(campaign.createdAt)}
            </span>
          </div>

          {label === "Sending" || label === "Stuck" ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-amber-700">
                {label === "Sending" ? "Why it is still pending" : "Why it is stuck"}
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-amber-900">
                {label === "Sending"
                  ? "Messages are queued. The WhatsApp worker is sending them to Meta. Refresh in a minute — status should move to Delivered or Failed."
                  : "Meta was never called. These 5 logs are still pending because the WhatsApp worker did not process the queue (Redis worker was not running, or it exited on start). Click Retry — it re-queues pending messages. Then restart the backend so the worker is up."}
              </p>
            </div>
          ) : null}
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
              Campaign ID
            </p>
            <p className="mt-1 break-all font-mono text-xs font-semibold text-slate-700">
              {campaign.campaignId}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {stats.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.label}
                  className={`rounded-xl border border-slate-100 px-3 py-3 ${s.tone}`}
                >
                  <div className="flex items-center gap-1.5 opacity-70">
                    <Icon size={13} />
                    <p className="text-[10px] font-black uppercase tracking-wide">
                      {s.label}
                    </p>
                  </div>
                  <p className="mt-1.5 text-2xl font-extrabold tabular-nums leading-none">
                    {s.value}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-bold text-slate-800">Progress</p>
              <p className="text-sm font-bold tabular-nums text-slate-700">
                {campaign.delivered}/{campaign.total} · {progressPct}%
              </p>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-[#25D366]"
                style={{ width: `${Math.min(100, progressPct)}%` }}
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-1.5 text-slate-400">
                <IndianRupee size={14} />
                <p className="text-[10px] font-black uppercase tracking-[0.12em]">
                  Est. spend
                </p>
              </div>
              <p className="mt-1 text-xl font-extrabold tabular-nums text-slate-900">
                ₹{spend}
              </p>
              <p className="mt-0.5 text-xs text-slate-400">
                {campaign.delivered} billable × ₹0.86
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                Template
              </p>
              <p className="mt-1 truncate text-sm font-bold text-slate-800">
                {campaign.name}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Failed messages can be retried from Actions.
              </p>
            </div>
          </div>

          {campaign.failed > 0 ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-rose-500">
                Why it failed
              </p>
              <p className="mt-1.5 text-sm font-semibold leading-relaxed text-rose-800">
                {campaign.failureReason ||
                  "Meta rejected these sends. Common causes: wrong variable count, wrong language code, missing public header image URL, or invalid phone numbers."}
              </p>
              {Array.isArray(campaign.failedSamples) &&
              campaign.failedSamples.length ? (
                <ul className="mt-3 space-y-2">
                  {campaign.failedSamples.map((s, i) => (
                    <li
                      key={`${s.to}-${i}`}
                      className="rounded-lg border border-rose-100 bg-white px-3 py-2 text-xs text-slate-700"
                    >
                      <span className="font-mono font-semibold text-slate-900">
                        {s.to}
                      </span>
                      <span className="mt-0.5 block text-rose-700">
                        {s.error}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
              <p className="mt-3 text-[11px] leading-relaxed text-rose-700/80">
                Tip: CSV columns should match template variables (
                {"{{1}}"}, {"{{2}}"}
                ). For media templates, paste a public S3/CDN image URL before
                send. Then click Retry failed.
              </p>
            </div>
          ) : null}
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
            disabled={
              retrying || !(campaign.failed || campaign.pending)
            }
            onClick={() => onRetry?.(campaign.campaignId)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-rose-600 disabled:opacity-40"
          >
            <RotateCcw size={14} />
            {retrying ? "Retrying…" : "Retry failed"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CampaignViewModal;
