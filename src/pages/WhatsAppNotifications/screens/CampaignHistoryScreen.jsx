import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  RefreshCw,
  RotateCcw,
  Search,
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
  if (label === "Failed") return "bg-rose-50 text-rose-600 ring-rose-100";
  if (label === "Sending" || label === "Running")
    return "bg-sky-50 text-sky-700 ring-sky-100";
  if (label === "Stuck")
    return "bg-amber-50 text-amber-700 ring-amber-100";
  if (label === "Partial") return "bg-orange-50 text-orange-600 ring-orange-100";
  if (label === "Completed")
    return "bg-emerald-50 text-emerald-700 ring-emerald-100";
  return "bg-slate-50 text-slate-500 ring-slate-200";
}

function formatWhen(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const date = d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });
  const time = d.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${date} · ${time}`;
}

export function buildCampaignRows(logs = []) {
  const map = new Map();
  for (const log of logs) {
    const campaignId = String(log.campaignId || "").trim();
    if (!campaignId) continue;
    if (!map.has(campaignId)) {
      map.set(campaignId, {
        campaignId,
        name: log.templateName || campaignId,
        category: String(
          log.category || log.templateCategory || "MARKETING",
        ).toUpperCase(),
        language: log.language || "en",
        createdAt: log.createdAt,
        total: 0,
        delivered: 0,
        failed: 0,
        pending: 0,
        failureReason: "",
        failedSamples: [],
      });
    }
    const row = map.get(campaignId);
    row.total += 1;
    const st = String(log.status || "").toLowerCase();
    if (
      st === "success" ||
      st === "delivered" ||
      st === "read" ||
      st === "sent"
    ) {
      row.delivered += 1;
    } else if (st === "failed" || st === "error") {
      row.failed += 1;
      const reason =
        typeof log.error === "string"
          ? log.error
          : log.error?.message ||
            (log.error ? JSON.stringify(log.error) : "");
      if (reason && !row.failureReason) row.failureReason = reason;
      if (row.failedSamples.length < 5) {
        row.failedSamples.push({
          to: log.to,
          error: reason || "Unknown Meta send error",
        });
      }
    } else {
      row.pending += 1;
    }
    if (
      log.createdAt &&
      (!row.createdAt || new Date(log.createdAt) > new Date(row.createdAt))
    ) {
      row.createdAt = log.createdAt;
    }
  }
  return [...map.values()].sort(
    (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
  );
}

/**
 * Dense industry-standard campaigns table — no horizontal scroll.
 */
export default function CampaignHistoryScreen({
  logs = [],
  loading,
  onRetry,
  onView,
  retryingId,
}) {
  const [search, setSearch] = useState("");
  const [range, setRange] = useState("30");
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const rows = useMemo(() => {
    const all = buildCampaignRows(logs);
    const now = Date.now();
    const ms =
      range === "1"
        ? 86400000
        : range === "7"
          ? 7 * 86400000
          : range === "30"
            ? 30 * 86400000
            : null;
    const q = search.trim().toLowerCase();
    return all.filter((row) => {
      if (ms && row.createdAt && now - new Date(row.createdAt).getTime() > ms) {
        return false;
      }
      if (!q) return true;
      return (
        row.name.toLowerCase().includes(q) ||
        row.campaignId.toLowerCase().includes(q)
      );
    });
  }, [logs, search, range]);

  const pageRows = rows.slice(page * pageSize, page * pageSize + pageSize);
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize || 1));
  const pageLabel = `${Math.min(pageCount, page + 1)} of ${pageCount}`;

  return (
    <div className="flex w-full min-w-0 flex-col gap-3 p-3 sm:p-4">
      <div className="flex min-w-0 flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-lg font-extrabold text-slate-900 sm:text-xl">
            WhatsApp Campaigns
          </h1>
          <p className="text-xs text-slate-500 sm:text-sm">
            Track delivery progress, failures, and campaign retries.
          </p>
        </div>

        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
          <div className="relative min-w-0 flex-1 sm:flex-none">
            <Search
              size={13}
              className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              placeholder="Search campaign"
              className="h-8 w-full rounded-md border border-slate-200 bg-white pl-7 pr-2 text-xs outline-none focus:border-emerald-400 sm:w-40"
            />
          </div>

          <div className="inline-flex h-8 items-center rounded-md border border-slate-200 bg-white p-0.5">
            {[
              ["1", "Today"],
              ["7", "7 Days"],
              ["30", "30 Days"],
              ["all", "All"],
            ].map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setRange(id);
                  setPage(0);
                }}
                className={`h-7 rounded px-2 text-[11px] font-semibold ${
                  range === id
                    ? "bg-[#25D366] text-white"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="inline-flex h-8 items-center rounded-md border border-slate-200 bg-white px-0.5">
            <button
              type="button"
              disabled={page <= 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="flex h-7 w-7 items-center justify-center text-slate-500 disabled:opacity-35"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="px-1 text-[11px] font-semibold tabular-nums text-slate-500">
              {pageLabel}
            </span>
            <button
              type="button"
              disabled={page >= pageCount - 1}
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              className="flex h-7 w-7 items-center justify-center text-slate-500 disabled:opacity-35"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className="min-w-0 overflow-hidden rounded-lg border border-slate-200 bg-white">
        {loading ? (
          <div className="flex justify-center py-14">
            <Loader2 size={18} className="animate-spin text-[#25D366]" />
          </div>
        ) : pageRows.length === 0 ? (
          <p className="py-14 text-center text-sm text-slate-400">
            No campaigns found for this range
          </p>
        ) : (
          <table className="w-full table-fixed border-collapse">
            <colgroup>
              <col style={{ width: "19%" }} />
              <col style={{ width: "13%" }} />
              <col style={{ width: "9%" }} />
              <col style={{ width: "6%" }} />
              <col style={{ width: "8%" }} />
              <col style={{ width: "6%" }} />
              <col style={{ width: "7%" }} />
              <col style={{ width: "7%" }} />
              <col style={{ width: "9%" }} />
              <col style={{ width: "16%" }} />
            </colgroup>
            <thead>
              <tr className="border-b border-emerald-200 bg-emerald-50/40">
                {[
                  ["Campaign", "left"],
                  ["Date & time", "left"],
                  ["Status", "left"],
                  ["Total", "right"],
                  ["Delivered", "right"],
                  ["Failed", "right"],
                  ["Pending", "right"],
                  ["Progress", "right"],
                  ["Est. spend", "right"],
                  ["Actions", "right"],
                ].map(([label, align], idx, arr) => (
                  <th
                    key={label}
                    className={`px-1.5 py-2 text-[11px] font-extrabold uppercase tracking-[0.03em] text-[#16a34a] ${
                      align === "right" ? "text-right" : "text-left"
                    } ${idx < arr.length - 1 ? "border-r border-emerald-200/80" : ""}`}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRows.map((row) => {
                const label = statusOf(row);
                const spend = (row.delivered * 0.86).toFixed(2);
                const busy = retryingId === row.campaignId;
                const cellBorder = "border-r border-slate-200/80";

                return (
                  <tr
                    key={row.campaignId}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50/80"
                  >
                    <td className={`px-1.5 py-1.5 align-middle ${cellBorder}`}>
                      <div className="min-w-0">
                        <p
                          className="truncate text-[12px] font-semibold text-slate-900"
                          title={row.name}
                        >
                          {row.name}
                        </p>
                        <p className="mt-0.5 truncate text-[10px] text-slate-400">
                          <span className="font-medium text-emerald-600">
                            {row.category}
                          </span>
                          <span> · {row.language}</span>
                        </p>
                      </div>
                    </td>

                    <td className={`px-1.5 py-1.5 align-middle ${cellBorder}`}>
                      <p className="truncate text-[11px] text-slate-600">
                        {formatWhen(row.createdAt)}
                      </p>
                    </td>

                    <td className={`px-1.5 py-1.5 align-middle ${cellBorder}`}>
                      <span
                        title={row.failureReason || undefined}
                        className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${statusTone(label)}`}
                      >
                        {label}
                      </span>
                    </td>

                    <td
                      className={`px-1.5 py-1.5 align-middle text-right text-[12px] font-semibold tabular-nums text-slate-800 ${cellBorder}`}
                    >
                      {row.total}
                    </td>
                    <td
                      className={`px-1.5 py-1.5 align-middle text-right text-[12px] font-semibold tabular-nums text-emerald-600 ${cellBorder}`}
                    >
                      {row.delivered}
                    </td>
                    <td
                      className={`px-1.5 py-1.5 align-middle text-right text-[12px] font-semibold tabular-nums text-rose-600 ${cellBorder}`}
                    >
                      {row.failed}
                    </td>
                    <td
                      className={`px-1.5 py-1.5 align-middle text-right text-[12px] font-semibold tabular-nums text-amber-500 ${cellBorder}`}
                    >
                      {row.pending}
                    </td>
                    <td
                      className={`px-1.5 py-1.5 align-middle text-right text-[11px] font-medium tabular-nums text-slate-600 ${cellBorder}`}
                    >
                      {row.delivered}/{row.total}
                    </td>

                    <td className={`px-1.5 py-1.5 align-middle text-right ${cellBorder}`}>
                      <p className="text-[12px] font-semibold tabular-nums text-slate-800">
                        ₹{spend}
                      </p>
                      <p className="text-[9px] text-slate-400">
                        {row.delivered} billable
                      </p>
                    </td>

                    <td className="px-1.5 py-1.5 align-middle text-right">
                      <div className="inline-flex w-full items-center justify-end gap-1">
                        <button
                          type="button"
                          title="View campaign"
                          onClick={() => onView?.(row)}
                          className="inline-flex h-7 shrink-0 items-center gap-1 rounded-md border border-slate-200 bg-white px-1.5 text-[10px] font-bold text-slate-700 hover:bg-slate-50"
                        >
                          <Eye size={12} strokeWidth={2} />
                          View
                        </button>
                        <button
                          type="button"
                          title="Retry pending or failed messages"
                          disabled={busy || (row.failed === 0 && row.pending === 0)}
                          onClick={() => onRetry?.(row.campaignId)}
                          className="inline-flex h-7 shrink-0 items-center gap-1 rounded-md border border-rose-200 bg-white px-1.5 text-[10px] font-bold text-rose-600 hover:bg-rose-50 disabled:opacity-40"
                        >
                          {busy ? (
                            <RefreshCw
                              size={12}
                              strokeWidth={2}
                              className="animate-spin"
                            />
                          ) : (
                            <RotateCcw size={12} strokeWidth={2} />
                          )}
                          Retry
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
