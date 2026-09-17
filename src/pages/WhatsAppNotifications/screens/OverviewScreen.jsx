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
  Radio,
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

function StatCard({ label, value, hint, tone, icon: Icon }) {
  const tones = {
    green: { iconWrap: "bg-emerald-50 text-emerald-600" },
    teal: { iconWrap: "bg-teal-50 text-teal-600" },
    red: { iconWrap: "bg-rose-50 text-rose-500" },
    amber: { iconWrap: "bg-amber-50 text-amber-500" },
  };
  const t = tones[tone] || tones.green;

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[1.6rem] leading-none font-extrabold tracking-tight text-slate-900">
            {value}
          </p>
          <p className="mt-1.5 text-[13px] font-bold text-slate-800">{label}</p>
          <p className="mt-0.5 text-[11px] leading-snug text-slate-400">{hint}</p>
        </div>
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${t.iconWrap}`}
        >
          <Icon size={15} />
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, hint, icon: Icon, iconClass }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
          {label}
        </p>
        <div
          className={`h-8 w-8 rounded-full flex items-center justify-center ${iconClass}`}
        >
          <Icon size={15} />
        </div>
      </div>
      <p className="mt-2 text-2xl font-extrabold text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-400">{hint}</p>
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
    <div className="w-full p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-5">
      {/* Top stats — compact cards, 4-across on desktop */}
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

      {/* Pending + New campaign — equal halves */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm flex items-center gap-3 min-h-[96px]">
          <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Radio size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-900">Pending campaign</p>
            <p className="mt-0.5 text-xs text-slate-500">
              {loading
                ? "Loading…"
                : computed.pending > 0
                  ? `${computed.pending.toLocaleString("en-IN")} WhatsApp messages still pending.`
                  : "No WhatsApp campaign has pending messages."}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm min-h-[96px]">
          <p className="text-sm font-bold text-slate-900">New Campaign</p>
          <p className="mt-0.5 text-[11px] text-slate-500">
            Send approved WhatsApp templates from CRM records or CSV contacts.
          </p>
          <div className="mt-2.5 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onOpenCrmCampaign}
              className="rounded-lg border border-emerald-100 bg-emerald-50/70 px-2.5 py-2.5 text-left hover:border-emerald-300 hover:bg-emerald-50 transition"
            >
              <MessageSquare size={16} className="text-emerald-600" />
              <p className="mt-1.5 text-xs font-bold text-slate-900">CRM Records</p>
              <p className="text-[10px] text-slate-500">Use module fields</p>
            </button>
            <button
              type="button"
              onClick={onOpenCsvCampaign}
              className="rounded-lg border border-sky-100 bg-sky-50/60 px-2.5 py-2.5 text-left hover:border-sky-300 hover:bg-sky-50 transition"
            >
              <FileSpreadsheet size={16} className="text-sky-600" />
              <p className="mt-1.5 text-xs font-bold text-slate-900">Contact file</p>
              <p className="text-[10px] text-slate-500">CSV, Excel, TSV, ODS</p>
            </button>
          </div>
        </div>
      </div>

      {/* Billing */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2">
              <span className="h-5 w-5 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <FileText size={12} />
              </span>
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-700">
                WhatsApp usage billing
              </p>
            </div>
            <h2 className="mt-2 text-xl sm:text-2xl font-extrabold text-slate-900">
              Monthly spend and renewal
            </h2>
            <p className="mt-1 text-sm text-slate-500 max-w-2xl">
              Using delivered WhatsApp logs as a fallback estimate. Pending and
              failed messages are visible, but not included in spend.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 min-w-[180px]">
            <div className="flex items-center gap-2 text-slate-400">
              <CalendarDays size={14} />
              <p className="text-[10px] font-black uppercase tracking-[0.12em]">
                Plan renewal
              </p>
            </div>
            <p className="mt-1 text-base font-extrabold text-slate-900">
              {renewal.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </p>
            <p className="text-xs text-slate-500">{daysLeft} days left</p>
          </div>
        </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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

        <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-[10px] uppercase tracking-[0.12em] text-slate-400">
                <tr>
                  <th className="px-4 py-3 text-left font-bold">Category</th>
                  <th className="px-4 py-3 text-left font-bold">Delivered</th>
                  <th className="px-4 py-3 text-left font-bold">Pending</th>
                  <th className="px-4 py-3 text-left font-bold">Rate</th>
                  <th className="px-4 py-3 text-left font-bold">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {computed.categoryRows.map((row) => (
                  <tr key={row.key}>
                    <td className="px-4 py-3 font-bold text-slate-800">
                      {row.label}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-700">
                      {loading ? "…" : row.delivered}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-700">
                      {loading ? "…" : row.pending}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      ₹{row.rate.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 font-extrabold text-slate-900">
                      {loading ? "…" : `₹${row.total.toFixed(2)}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="h-6 w-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 size={14} />
              </span>
              <p className="text-sm font-bold text-slate-900">Estimate rules</p>
            </div>
            <ul className="mt-3 space-y-2.5 text-xs leading-relaxed text-slate-500">
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
              className="mt-4 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              Refresh billing data
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
