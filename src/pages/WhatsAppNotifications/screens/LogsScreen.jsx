import { useMemo, useState } from "react";
import {
  Check,
  CheckCheck,
  Loader2,
  MessageCircle,
  RefreshCw,
  Search,
  X,
} from "lucide-react";

function statusMeta(status) {
  const s = String(status || "").toLowerCase();
  if (s === "read") {
    return {
      className: "bg-sky-50 text-sky-700 ring-sky-100",
      Icon: CheckCheck,
      label: "Read",
    };
  }
  if (["delivered", "success"].includes(s)) {
    return {
      className: "bg-emerald-50 text-emerald-700 ring-emerald-100",
      Icon: Check,
      label: s === "success" ? "Success" : "Delivered",
    };
  }
  if (["sent", "accepted"].includes(s)) {
    return {
      className: "bg-sky-50 text-sky-700 ring-sky-100",
      Icon: Check,
      label: "Sent",
    };
  }
  if (["failed", "error"].includes(s)) {
    return {
      className: "bg-rose-50 text-rose-700 ring-rose-100",
      Icon: X,
      label: "Failed",
    };
  }
  if (["pending", "queued", "warning"].includes(s)) {
    return {
      className: "bg-amber-50 text-amber-700 ring-amber-100",
      Icon: null,
      label: s.charAt(0).toUpperCase() + s.slice(1),
    };
  }
  return {
    className: "bg-slate-50 text-slate-600 ring-slate-200",
    Icon: null,
    label: status || "Unknown",
  };
}

function formatLogTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

const cellLine = "border-r border-emerald-100";

export default function LogsScreen({ logs = [], stats, loading, onRefresh }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [updatedAt, setUpdatedAt] = useState(() => new Date());
  const [refreshing, setRefreshing] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (logs || []).filter((log) => {
      const st = String(log.status || "").toLowerCase();
      if (status !== "all" && st !== status) return false;
      if (!q) return true;
      const hay = [
        log.to,
        log.phone,
        log.waId,
        log.templateName,
        log.campaignId,
        log.error,
        log.message,
        log.activity,
      ]
        .map((v) => String(v || "").toLowerCase())
        .join(" ");
      return hay.includes(q);
    });
  }, [logs, search, status]);

  /** Live counts from API stats; fall back to scanning loaded logs. */
  const counters = useMemo(() => {
    const fromLogs = { total: 0, success: 0, failed: 0, pending: 0 };
    for (const log of logs || []) {
      fromLogs.total += 1;
      const st = String(log.status || "").toLowerCase();
      if (st === "success") fromLogs.success += 1;
      else if (st === "failed" || st === "error") fromLogs.failed += 1;
      else fromLogs.pending += 1;
    }

    const total =
      stats?.total != null ? Number(stats.total) || 0 : fromLogs.total;
    const success =
      stats?.success != null ? Number(stats.success) || 0 : fromLogs.success;
    const failed =
      stats?.failed != null ? Number(stats.failed) || 0 : fromLogs.failed;
    const pending =
      stats?.pending != null ? Number(stats.pending) || 0 : fromLogs.pending;

    return {
      total,
      success,
      failed,
      pending,
    };
  }, [logs, stats]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await onRefresh?.();
      setUpdatedAt(new Date());
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="w-full min-w-0 p-4 lg:p-6">
      <div className="min-w-0 space-y-4 rounded-2xl border border-emerald-100 bg-white p-4 shadow-[0_8px_24px_rgba(16,185,129,0.08)] sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-emerald-600">
              WhatsApp activity
            </p>
            <h1 className="mt-0.5 text-xl font-semibold tracking-tight text-[#0f3d2e] sm:text-2xl">
              WhatsApp Logs
            </h1>
            <p className="mt-1 max-w-2xl text-[13px] text-[#5c7d6d]">
              Live webhook/API feed for inbound messages, delivery status,
              workflow triggers, and sends.
            </p>
            <p className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-emerald-600">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Live polling · Updated{" "}
              {updatedAt.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <div className="inline-flex h-8 overflow-hidden rounded-full border border-emerald-100 shadow-[0_4px_12px_rgba(16,185,129,0.08)]">
              <button
                type="button"
                className="h-8 bg-emerald-50 px-3 text-[11px] font-bold text-emerald-700"
              >
                Live Meta
              </button>
              <button
                type="button"
                className="h-8 border-l border-emerald-100 bg-white px-3 text-[11px] font-bold text-[#0f3d2e] hover:bg-emerald-50"
              >
                Audit
              </button>
            </div>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing || loading}
              className="inline-flex h-8 items-center gap-1.5 rounded-full border border-emerald-100 bg-white px-3 text-[11px] font-bold text-[#0f3d2e] shadow-[0_4px_12px_rgba(16,185,129,0.08)] hover:bg-emerald-50 disabled:opacity-50"
            >
              <RefreshCw
                size={12}
                className={refreshing || loading ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            ["TOTAL", counters.total, "bg-slate-500"],
            ["SUCCESS", counters.success, "bg-emerald-500"],
            ["FAILED", counters.failed, "bg-rose-500"],
            ["PENDING", counters.pending, "bg-amber-500"],
          ].map(([label, value, dot]) => (
            <div
              key={label}
              className="rounded-xl border border-emerald-100 bg-white px-3 py-2 shadow-[0_6px_16px_rgba(16,185,129,0.07)]"
            >
              <div className="flex items-center gap-1.5">
                <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
                <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-600">
                  {label}
                </p>
              </div>
              <p className="mt-1 text-[1.35rem] font-semibold tabular-nums leading-none text-[#0f3d2e]">
                {Number.isFinite(Number(value)) ? Number(value) : 0}
              </p>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <Search
              size={13}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#5c7d6d]"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search phone, template, campaign, or error"
              className="h-9 w-full rounded-full border border-emerald-100 bg-white pl-8 pr-3 text-xs text-[#0f3d2e] shadow-[0_4px_12px_rgba(16,185,129,0.08)] outline-none placeholder:text-[#5c7d6d] focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-9 shrink-0 rounded-full border border-emerald-100 bg-white px-3 text-xs font-semibold text-[#0f3d2e] shadow-[0_4px_12px_rgba(16,185,129,0.08)] outline-none focus:border-emerald-400"
          >
            <option value="all">All statuses</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-14">
            <Loader2 size={18} className="animate-spin text-[#25D366]" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-14 text-center text-sm text-[#5c7d6d]">
            No logs found
          </p>
        ) : (
          <div className="min-w-0 overflow-hidden rounded-xl border border-emerald-100">
            <table className="w-full table-fixed border-collapse">
              <colgroup>
                <col style={{ width: "18%" }} />
                <col style={{ width: "26%" }} />
                <col style={{ width: "12%" }} />
                <col style={{ width: "28%" }} />
                <col style={{ width: "16%" }} />
              </colgroup>
              <thead>
                <tr className="bg-emerald-50/80">
                  {[
                    ["Phone", "left"],
                    ["Activity", "left"],
                    ["Status", "center"],
                    ["Details", "left"],
                    ["Time", "center"],
                  ].map(([label, align], idx, arr) => (
                    <th
                      key={label}
                      className={`whitespace-nowrap border-b border-emerald-100 px-2.5 py-2.5 text-[10px] font-bold uppercase tracking-[0.04em] text-emerald-700 ${
                        idx === 0 ? "pl-3.5" : ""
                      } ${
                        idx < arr.length - 1 ? "border-r border-emerald-100" : "pr-3"
                      } ${align === "center" ? "text-center" : "text-left"}`}
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((log, index) => {
                  const phone = log.to || log.phone || log.waId || "—";
                  const activity =
                    log.activity ||
                    log.message ||
                    (log.templateName
                      ? `Template send · ${log.templateName}`
                      : "WhatsApp status webhook received.");
                  const details =
                    log.error ||
                    log.details ||
                    (log.campaignId
                      ? `Campaign ${log.campaignId}`
                      : "Meta delivered a message status update, not an incoming customer message.");
                  const meta = statusMeta(log.status);
                  const StatusIcon = meta.Icon;

                  return (
                    <tr
                      key={log._id || `${phone}-${log.createdAt}-${index}`}
                      className="hover:bg-emerald-50/40 last:[&>td]:border-b-0"
                    >
                      <td className={`px-2.5 py-2 pl-3.5 align-middle ${cellLine} border-b border-emerald-100`}>
                        <div className="flex min-w-0 items-start gap-1.5">
                          <MessageCircle
                            size={13}
                            className="mt-0.5 shrink-0 text-[#25D366]"
                          />
                          <div className="min-w-0">
                            <p
                              className="truncate text-[12px] font-semibold text-[#0f3d2e]"
                              title={phone}
                            >
                              {phone}
                            </p>
                            <p className="mt-0.5 truncate text-[10px] text-[#5c7d6d]">
                              {log.source || "Meta webhook"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className={`px-2.5 py-2 align-middle ${cellLine} border-b border-emerald-100`}>
                        <p
                          className="truncate text-[12px] font-semibold text-[#0f3d2e]"
                          title={activity}
                        >
                          {activity}
                        </p>
                        <p className="mt-0.5 truncate text-[10px] capitalize text-[#5c7d6d]">
                          {log.type || log.event || "status"}
                        </p>
                      </td>

                      <td className={`px-2.5 py-2 align-middle text-center ${cellLine} border-b border-emerald-100`}>
                        <span
                          className={`inline-flex max-w-full items-center gap-1 truncate rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ring-inset ${meta.className}`}
                        >
                          {StatusIcon ? <StatusIcon size={11} /> : null}
                          {meta.label}
                        </span>
                      </td>

                      <td className={`px-2.5 py-2 align-middle ${cellLine} border-b border-emerald-100`}>
                        <p
                          className="line-clamp-2 text-[11px] leading-snug text-[#5c7d6d]"
                          title={details}
                        >
                          {details}
                        </p>
                      </td>

                      <td className="border-b border-emerald-100 px-2.5 py-2 pr-3 align-middle text-center">
                        <p className="truncate text-[11px] font-medium tabular-nums text-[#5c7d6d]">
                          {formatLogTime(log.createdAt)}
                        </p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
