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
  if (row.runStatus === "failed") return "Failed";
  if (
    ["accepted", "preparing", "queuing"].includes(String(row.runStatus || ""))
  ) {
    if (row.pending > 0 || row.delivered === 0) {
      return campaignAgeMs(row) < 3 * 60 * 1000 ? "Sending" : "Stuck";
    }
  }
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
    if (st === "success") {
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
  campaigns = null,
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
    const all = Array.isArray(campaigns)
      ? campaigns.map((c) => ({
          campaignId: c.campaignId,
          name: c.name || c.templateName || c.campaignId,
          category: String(c.category || "MARKETING").toUpperCase(),
          language: c.language || "en",
          createdAt: c.createdAt,
          total: Number(c.total || 0),
          delivered: Number(c.delivered ?? c.success ?? 0),
          failed: Number(c.failed || 0),
          pending: Number(c.pending || 0),
          failureReason: c.failureReason || c.error || "",
          failedSamples: Array.isArray(c.failedSamples)
            ? c.failedSamples
            : [],
          runStatus: c.runStatus || null,
        }))
      : buildCampaignRows(logs);
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
        String(row.name || "")
          .toLowerCase()
          .includes(q) ||
        String(row.campaignId || "")
          .toLowerCase()
          .includes(q)
      );
    });
  }, [logs, campaigns, search, range]);

  const pageRows = rows.slice(page * pageSize, page * pageSize + pageSize);
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize || 1));
  const pageLabel = `${Math.min(pageCount, page + 1)} of ${pageCount}`;

  return (
    <div className="flex w-full min-w-0 flex-col gap-4 p-4 lg:p-6">
      <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight text-[#0f3d2e] sm:text-2xl">
            WhatsApp Campaigns
          </h1>
          <p className="mt-0.5 text-[13px] text-[#5c7d6d]">
            Track delivery progress, failures, and campaign retries.
          </p>
        </div>

        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <div className="relative min-w-0 flex-1 sm:flex-none">
            <Search
              size={13}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#5c7d6d]"
            />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              placeholder="Search campaign"
              className="h-9 w-full rounded-full border border-emerald-100 bg-white pl-8 pr-3 text-xs text-[#0f3d2e] shadow-[0_6px_16px_rgba(16,185,129,0.08)] outline-none placeholder:text-[#5c7d6d] focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 sm:w-44"
            />
          </div>

          <div className="inline-flex h-9 items-center rounded-full border border-emerald-100 bg-white p-0.5 shadow-[0_6px_16px_rgba(16,185,129,0.08)]">
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
                className={`h-8 rounded-full px-2.5 text-[11px] font-semibold ${
                  range === id
                    ? "bg-[#27AE60] text-white shadow-[0_6px_14px_rgba(37,211,102,0.28)]"
                    : "text-[#0f3d2e] hover:bg-emerald-50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="inline-flex h-9 items-center rounded-full border border-emerald-100 bg-white px-0.5 shadow-[0_6px_16px_rgba(16,185,129,0.08)]">
            <button
              type="button"
              disabled={page <= 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="flex h-8 w-8 items-center justify-center text-[#5c7d6d] disabled:opacity-35"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="px-1 text-[11px] font-semibold tabular-nums text-[#0f3d2e]">
              {pageLabel}
            </span>
            <button
              type="button"
              disabled={page >= pageCount - 1}
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              className="flex h-8 w-8 items-center justify-center text-[#5c7d6d] disabled:opacity-35"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className="min-w-0 overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-[0_8px_24px_rgba(16,185,129,0.08)]">
        {loading ? (
          <div className="flex justify-center py-14">
            <Loader2 size={18} className="animate-spin text-[#27AE60]" />
          </div>
        ) : pageRows.length === 0 ? (
          <p className="py-14 text-center text-sm text-[#5c7d6d]">
            No campaigns found for this range
          </p>
        ) : (
          <table className="w-full table-fixed border-collapse">
            <colgroup>
              <col style={{ width: "17%" }} />
              <col style={{ width: "13%" }} />
              <col style={{ width: "8%" }} />
              <col style={{ width: "5%" }} />
              <col style={{ width: "8%" }} />
              <col style={{ width: "6%" }} />
              <col style={{ width: "7%" }} />
              <col style={{ width: "7%" }} />
              <col style={{ width: "8%" }} />
              <col style={{ width: "21%" }} />
            </colgroup>
            <thead>
              <tr className="bg-emerald-50/80">
                {[
                  ["Campaign", "left"],
                  ["Date & time", "center"],
                  ["Status", "center"],
                  ["Total", "center"],
                  ["Delivered", "center"],
                  ["Failed", "center"],
                  ["Pending", "center"],
                  ["Progress", "center"],
                  ["Est. spend", "center"],
                  ["Actions", "center"],
                ].map(([label, align], idx, arr) => (
                  <th
                    key={label}
                    className={`whitespace-nowrap border-b border-emerald-100 px-2 py-2.5 text-[10px] font-bold uppercase tracking-[0.03em] text-emerald-700 ${
                      idx === 0 ? "pl-3.5" : ""
                    } ${
                      idx < arr.length - 1 ? "border-r border-emerald-100" : "pr-3"
                    } ${align === "left" ? "text-left" : "text-center"}`}
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
                const line =
                  "border-b border-r border-emerald-100 px-2 py-2 align-middle";

                return (
                  <tr
                    key={row.campaignId}
                    className="hover:bg-emerald-50/40 last:[&>td]:border-b-0"
                  >
                    <td className={`${line} pl-3.5`}>
                      <p
                        className="break-words text-[12px] font-semibold leading-snug text-[#0f3d2e]"
                        title={row.name}
                      >
                        {row.name}
                      </p>
                      <p className="mt-0.5 text-[10px] leading-snug text-[#5c7d6d]">
                        <span className="font-medium text-emerald-600">
                          {row.category}
                        </span>
                        <span> · {row.language}</span>
                      </p>
                    </td>

                    <td className={`${line} text-center`}>
                      <p className="whitespace-nowrap text-[11px] text-[#5c7d6d]">
                        {formatWhen(row.createdAt)}
                      </p>
                    </td>

                    <td className={`${line} text-center`}>
                      <span
                        title={row.failureReason || undefined}
                        className={`inline-flex whitespace-nowrap rounded px-1.5 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${statusTone(label)}`}
                      >
                        {label}
                      </span>
                    </td>

                    <td className={`${line} text-center text-[12px] font-semibold tabular-nums text-[#0f3d2e]`}>
                      {row.total}
                    </td>
                    <td className={`${line} text-center text-[12px] font-semibold tabular-nums text-emerald-600`}>
                      {row.delivered}
                    </td>
                    <td className={`${line} text-center text-[12px] font-semibold tabular-nums text-rose-600`}>
                      {row.failed}
                    </td>
                    <td className={`${line} text-center text-[12px] font-semibold tabular-nums text-amber-500`}>
                      {row.pending}
                    </td>
                    <td className={`${line} whitespace-nowrap text-center text-[11px] font-medium tabular-nums text-[#5c7d6d]`}>
                      {Number(row.delivered || 0) + Number(row.failed || 0)}/{row.total}
                    </td>

                    <td className={`${line} text-center`}>
                      <p className="whitespace-nowrap text-[12px] font-semibold tabular-nums text-[#0f3d2e]">
                        ₹{spend}
                      </p>
                      <p className="whitespace-nowrap text-[9px] text-[#5c7d6d]">
                        {row.delivered} billable
                      </p>
                    </td>

                    <td className="border-b border-emerald-100 px-1.5 py-2 pr-2.5 align-middle text-center">
                      <div className="flex items-center justify-center gap-1 whitespace-nowrap">
                        <button
                          type="button"
                          title="View campaign"
                          onClick={() => onView?.(row)}
                          className="inline-flex h-6 shrink-0 items-center gap-0.5 rounded-md border border-emerald-100 bg-white px-1.5 text-[9px] font-bold text-[#0f3d2e] hover:bg-emerald-50"
                        >
                          <Eye size={11} strokeWidth={2} />
                          View
                        </button>
                        <button
                          type="button"
                          title="Retry pending or failed messages"
                          disabled={busy || (row.failed === 0 && row.pending === 0)}
                          onClick={() => onRetry?.(row.campaignId)}
                          className="inline-flex h-6 shrink-0 items-center gap-0.5 rounded-md border border-rose-100 bg-white px-1.5 text-[9px] font-bold text-rose-600 hover:bg-rose-50 disabled:opacity-40"
                        >
                          {busy ? (
                            <RefreshCw
                              size={11}
                              strokeWidth={2}
                              className="animate-spin"
                            />
                          ) : (
                            <RotateCcw size={11} strokeWidth={2} />
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
