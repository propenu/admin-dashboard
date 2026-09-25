import { useMemo } from "react";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileSpreadsheet,
  FileText,
  IndianRupee,
  MessageSquare,
  XCircle,
} from "lucide-react";

const RATE = {
  MARKETING: 0.86,
  UTILITY: 0.12,
  AUTHENTICATION: 0.12,
  SERVICE: 0,
};

const DELIVERED_STATUSES = new Set([
  "success",
  "delivered",
  "read",
  "sent",
]);

function isSameMonth(date, now = new Date()) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return false;
  return (
    d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  );
}

function normalizeCategory(raw = "") {
  const key = String(raw || "")
    .trim()
    .toUpperCase();
  if (key.includes("UTIL")) return "UTILITY";
  if (key.includes("AUTH")) return "AUTHENTICATION";
  if (key.includes("SERV")) return "SERVICE";
  if (key.includes("MARK")) return "MARKETING";
  return "MARKETING";
}

function LiveQueueCard({ running, loading }) {
  const sent = Number(running?.sent ?? running?.success ?? 0) || 0;
  const failed = Number(running?.failed || 0) || 0;
  const pending = Number(running?.pending || 0) || 0;
  const total = Number(running?.total || 0) || sent + failed + pending;
  const processed = Number(running?.processed ?? sent + failed) || 0;
  const percent =
    Number.isFinite(Number(running?.progressPercent))
      ? Number(running.progressPercent)
      : total
        ? Math.round((processed / total) * 100)
        : 0;
  const when = running?.createdAt
    ? new Date(running.createdAt).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : "";

  return (
    <div className="rounded-2xl border border-emerald-100 bg-white px-5 py-5 shadow-[0_8px_24px_rgba(16,185,129,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-emerald-600">
            Live queue
          </p>
          <p className="mt-1 text-[15px] font-semibold text-slate-900">
            {running?.campaignId
              ? Number(running.pending) > 0
                ? "Sending now"
                : "Latest send"
              : "No campaign running"}
          </p>
        </div>
        {running?.campaignId ? (
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
            {percent}%
          </span>
        ) : null}
      </div>
      {running?.campaignId ? (
        <>
          <p className="mt-2 truncate text-[12px] text-slate-500" title={running.campaignId}>
            Campaign ID: {running.campaignId}
          </p>
          <p className="text-[11px] text-slate-400">
            {running.source === "crm"
              ? "Propenu users"
              : running.source === "csv"
                ? "CSV / Excel"
                : "Campaign"}
            {running.name ? ` · ${running.name}` : ""}
            {when ? ` · ${when}` : ""}
          </p>
          <div className="mt-4 flex items-center justify-between text-[12px] font-semibold text-slate-600">
            <span>Delivery progress</span>
            <span className="tabular-nums text-slate-800">
              {processed} / {total}
            </span>
          </div>
          <div className="mt-2 flex h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full bg-emerald-500"
              style={{ width: total ? `${(sent / total) * 100}%` : 0 }}
            />
            <div
              className="h-full bg-rose-400"
              style={{ width: total ? `${(failed / total) * 100}%` : 0 }}
            />
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {[
              ["Sent", sent, "text-emerald-700"],
              ["Failed", failed, "text-rose-600"],
              ["Pending", pending, "text-amber-600"],
            ].map(([label, value, tone]) => (
              <div
                key={label}
                className="rounded-xl border border-slate-100 bg-slate-50 px-2 py-2 text-center"
              >
                <p className={`text-lg font-extrabold tabular-nums ${tone}`}>
                  {value}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="mt-2 text-[13px] text-slate-500">
          {loading
            ? "Loading…"
            : "Sent, failed, and pending stay in sync while a campaign is sending."}
        </p>
      )}
    </div>
  );
}

function StatCard({ label, value, hint, tone, icon: Icon }) {
  const tones = {
    green: {
      wrap: "border-emerald-100 bg-white",
      iconWrap: "bg-emerald-50 text-emerald-600",
      kicker: "text-emerald-600",
    },
    teal: {
      wrap: "border-teal-100 bg-white",
      iconWrap: "bg-teal-50 text-teal-600",
      kicker: "text-teal-600",
    },
    red: {
      wrap: "border-rose-100 bg-white",
      iconWrap: "bg-rose-50 text-rose-500",
      kicker: "text-rose-500",
    },
    amber: {
      wrap: "border-amber-100 bg-white",
      iconWrap: "bg-amber-50 text-amber-500",
      kicker: "text-amber-600",
    },
  };
  const t = tones[tone] || tones.green;

  return (
    <div
      className={`rounded-xl border px-3.5 py-3 shadow-[0_6px_16px_rgba(16,185,129,0.07)] ${t.wrap}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p
            className={`text-[10px] font-bold uppercase tracking-[0.08em] ${t.kicker}`}
          >
            {label}
          </p>
          <p className="mt-1 text-[1.55rem] leading-none font-semibold tracking-tight text-slate-900">
            {value}
          </p>
          <p className="mt-1 truncate text-[11px] leading-snug text-slate-500">
            {hint}
          </p>
        </div>
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${t.iconWrap}`}
        >
          <Icon size={14} />
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, hint, icon: Icon, iconClass }) {
  return (
    <div className="rounded-xl border border-emerald-100 bg-white px-3.5 py-3 shadow-[0_6px_16px_rgba(16,185,129,0.07)]">
      <div className="flex items-start justify-between gap-2">
        <p className="truncate text-[10px] font-bold uppercase tracking-[0.08em] text-emerald-600">
          {label}
        </p>
        <div
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${iconClass}`}
        >
          <Icon size={13} />
        </div>
      </div>
      <p className="mt-1 text-[1.35rem] leading-none font-semibold tracking-tight text-slate-900">
        {value}
      </p>
      <p className="mt-1 truncate text-[11px] leading-snug text-slate-500">
        {hint}
      </p>
    </div>
  );
}

/**
 * Overview dashboard — matches Bizrow mockup with dynamic WhatsApp log/stats data.
 */
export default function OverviewScreen({
  stats,
  logs = [],
  templates = [],
  loading,
  runningCampaign = null,
  onOpenCrmCampaign,
  onOpenCsvCampaign,
  onRefresh,
}) {
  const now = useMemo(() => new Date(), []);
  const monthLabel = now.toLocaleString("en-IN", {
    month: "long",
    year: "numeric",
  });

  const templateCategoryByName = useMemo(() => {
    const map = new Map();
    for (const t of templates || []) {
      const name = String(t?.name || "").trim().toLowerCase();
      if (!name) continue;
      map.set(name, normalizeCategory(t.category));
    }
    return map;
  }, [templates]);

  const computed = useMemo(() => {
    const list = Array.isArray(logs) ? logs : [];
    const monthLogs = list.filter((log) => isSameMonth(log.createdAt, now));

    const bucket = (rows) => {
      let delivered = 0;
      let failed = 0;
      let pending = 0;
      for (const log of rows) {
        const st = String(log.status || "").toLowerCase();
        if (DELIVERED_STATUSES.has(st)) delivered += 1;
        else if (st === "failed" || st === "error") failed += 1;
        else pending += 1;
      }
      return {
        total: rows.length,
        delivered,
        failed,
        pending,
      };
    };

    const all = bucket(list);
    const month = bucket(monthLogs.length ? monthLogs : list);

    // Prefer API stats when available (global counts), fall back to log scan.
    const total = Number(stats?.total ?? all.total) || all.total;
    const delivered =
      Number(stats?.success ?? stats?.delivered ?? month.delivered) ||
      month.delivered;
    const failed = Number(stats?.failed ?? month.failed) || month.failed;
    const pending = Number(stats?.pending ?? month.pending) || month.pending;

    const byCategory = {
      MARKETING: { delivered: 0, pending: 0 },
      UTILITY: { delivered: 0, pending: 0 },
      AUTHENTICATION: { delivered: 0, pending: 0 },
      SERVICE: { delivered: 0, pending: 0 },
    };

    const sourceRows = monthLogs.length ? monthLogs : list;
    for (const log of sourceRows) {
      const name = String(log.templateName || "").trim().toLowerCase();
      const cat =
        templateCategoryByName.get(name) ||
        normalizeCategory(log.category || log.templateCategory);
      const st = String(log.status || "").toLowerCase();
      if (!byCategory[cat]) byCategory[cat] = { delivered: 0, pending: 0 };
      if (DELIVERED_STATUSES.has(st)) byCategory[cat].delivered += 1;
      else if (st !== "failed" && st !== "error") byCategory[cat].pending += 1;
    }

    // If logs have no category signal, attribute delivered/pending to Marketing.
    const categorized =
      byCategory.MARKETING.delivered +
        byCategory.UTILITY.delivered +
        byCategory.AUTHENTICATION.delivered +
        byCategory.SERVICE.delivered +
        byCategory.MARKETING.pending +
        byCategory.UTILITY.pending +
        byCategory.AUTHENTICATION.pending +
        byCategory.SERVICE.pending >
      0;

    if (!categorized) {
      byCategory.MARKETING.delivered = delivered;
      byCategory.MARKETING.pending = pending;
    }

    const categoryRows = [
      "MARKETING",
      "UTILITY",
      "AUTHENTICATION",
      "SERVICE",
    ].map((key) => {
      const row = byCategory[key];
      const rate = RATE[key] ?? 0;
      const totalAmt = row.delivered * rate;
      return {
        key,
        label:
          key === "AUTHENTICATION"
            ? "Authentication"
            : key.charAt(0) + key.slice(1).toLowerCase(),
        delivered: row.delivered,
        pending: row.pending,
        rate,
        total: totalAmt,
      };
    });

    const estimate = categoryRows.reduce((sum, row) => sum + row.total, 0);
    const freeDeliveries = byCategory.SERVICE.delivered || 0;

    return {
      total,
      delivered,
      failed,
      pending,
      estimate,
      freeDeliveries,
      categoryRows,
      monthDelivered: month.delivered || delivered,
      monthPending: month.pending || pending,
      monthFailed: month.failed || failed,
    };
  }, [logs, stats, templateCategoryByName, now]);

  // Plan renewal: end of current quarter (+ ~3 months) unless env override later.
  const renewal = useMemo(() => {
    const d = new Date(now);
    d.setMonth(d.getMonth() + 3);
    d.setDate(8);
    return d;
  }, [now]);

  const daysLeft = Math.max(
    0,
    Math.ceil((renewal.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
  );

  const display = (n) => (loading ? "…" : Number(n || 0).toLocaleString("en-IN"));

  return (
    <div className="w-full space-y-5 p-5 lg:p-7">
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Messages"
          value={display(computed.total)}
          hint="All queued messages"
          tone="green"
          icon={MessageSquare}
        />
        <StatCard
          label="Delivered"
          value={display(computed.delivered)}
          hint="Delivered/read by Meta"
          tone="teal"
          icon={CheckCircle2}
        />
        <StatCard
          label="Failed"
          value={display(computed.failed)}
          hint="Needs attention"
          tone="red"
          icon={XCircle}
        />
        <StatCard
          label="Pending"
          value={display(computed.pending)}
          hint="Queued or awaiting delivery"
          tone="amber"
          icon={Clock3}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <LiveQueueCard running={runningCampaign} loading={loading} />

        <div className="rounded-2xl border border-emerald-100 bg-white px-5 py-4 shadow-[0_8px_24px_rgba(16,185,129,0.08)]">
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-emerald-600">
            02 · New campaign
          </p>
          <p className="mt-1 text-[15px] font-semibold text-slate-900">
            Send an approved template
          </p>
          <p className="mt-1 text-[12px] text-slate-500">
            Send approved WhatsApp templates from Propenu users or CSV contacts.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onOpenCrmCampaign}
              className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white px-3 py-3 text-left shadow-[0_6px_16px_rgba(16,185,129,0.10)] transition hover:border-emerald-400"
            >
              <MessageSquare size={18} className="text-emerald-600" />
              <p className="mt-2 text-[13px] font-semibold text-slate-900">
                Propenu users
              </p>
              <p className="text-[11px] text-slate-500">Use module fields</p>
            </button>
            <button
              type="button"
              onClick={onOpenCsvCampaign}
              className="rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-white px-3 py-3 text-left shadow-[0_6px_16px_rgba(14,165,233,0.08)] transition hover:border-sky-300"
            >
              <FileSpreadsheet size={18} className="text-sky-600" />
              <p className="mt-2 text-[13px] font-semibold text-slate-900">
                Contact file
              </p>
              <p className="text-[11px] text-slate-500">CSV, Excel, TSV, ODS</p>
            </button>
          </div>
        </div>
      </div>

      <section className="space-y-5 rounded-2xl border border-emerald-100 bg-white p-5 shadow-[0_8px_24px_rgba(16,185,129,0.08)] sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-emerald-600">
              03 · WhatsApp usage billing
            </p>
            <h2 className="mt-1.5 text-xl font-semibold text-slate-900 sm:text-2xl">
              Monthly spend and renewal
            </h2>
            <p className="mt-1 max-w-2xl text-[13px] text-slate-500">
              Using delivered WhatsApp logs as a fallback estimate. Pending and
              failed messages are visible, but not included in spend.
            </p>
          </div>

          <div className="min-w-[200px] rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white px-4 py-3">
            <div className="flex items-center gap-2 text-emerald-600">
              <CalendarDays size={14} />
              <p className="text-[11px] font-bold uppercase tracking-[0.08em]">
                Plan renewal
              </p>
            </div>
            <p className="mt-1.5 text-base font-semibold text-slate-900">
              {renewal.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </p>
            <p className="text-[12px] text-slate-500">{daysLeft} days left</p>
          </div>
        </div>

      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label={`${monthLabel} Estimate`}
            value={loading ? "…" : `₹${computed.estimate.toFixed(2)}`}
            hint={`${display(computed.monthDelivered)} delivered`}
            icon={IndianRupee}
            iconClass="bg-emerald-50 text-emerald-600"
          />
          <MetricCard
            label="Free Deliveries"
            value={display(computed.freeDeliveries)}
            hint="Available after Meta pricing sync"
            icon={FileText}
            iconClass="bg-sky-50 text-sky-600"
          />
          <MetricCard
            label="All Deliveries"
            value={display(computed.monthDelivered)}
            hint={`${display(computed.monthPending)} pending`}
            icon={MessageSquare}
            iconClass="bg-indigo-50 text-indigo-600"
          />
          <MetricCard
            label="Needs Attention"
            value={display(computed.monthFailed)}
            hint="Failed this month"
            icon={AlertCircle}
            iconClass="bg-rose-50 text-rose-500"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.7fr_1fr]">
          <div className="overflow-hidden rounded-2xl border border-emerald-100">
            <table className="min-w-full text-sm">
              <thead className="bg-emerald-50/70 text-[11px] uppercase tracking-[0.08em] text-emerald-700">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Category</th>
                  <th className="px-4 py-3 text-left font-semibold">Delivered</th>
                  <th className="px-4 py-3 text-left font-semibold">Pending</th>
                  <th className="px-4 py-3 text-left font-semibold">Rate</th>
                  <th className="px-4 py-3 text-left font-semibold">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-50 bg-white">
                {computed.categoryRows.map((row) => (
                  <tr key={row.key} className="hover:bg-emerald-50/40">
                    <td className="px-4 py-3 font-semibold text-slate-800">
                      {row.label}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-700">
                      {loading ? "…" : row.delivered}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-700">
                      {loading ? "…" : row.pending}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      ₹{row.rate.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {loading ? "…" : `₹${row.total.toFixed(2)}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-[0_8px_24px_rgba(16,185,129,0.08)]">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#27AE60] text-white">
                <CheckCircle2 size={14} />
              </span>
              <p className="text-sm font-semibold text-slate-900">
                Estimate rules
              </p>
            </div>
            <ul className="mt-3 space-y-2.5 text-[12px] leading-relaxed text-slate-500">
              <li>Fallback amount uses delivered/read messages only.</li>
              <li>
                Free Meta pricing types are excluded when webhook pricing is
                available.
              </li>
              <li>
                Configure backend rates to match your Meta or BSP invoice.
              </li>
            </ul>
            <button
              type="button"
              onClick={onRefresh}
              className="mt-4 w-full rounded-full bg-[#27AE60] px-3 py-2.5 text-[13px] font-semibold text-white shadow-[0_8px_20px_rgba(18,161,80,0.24)] hover:bg-[#1e8f4d]"
            >
              Refresh billing data
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
