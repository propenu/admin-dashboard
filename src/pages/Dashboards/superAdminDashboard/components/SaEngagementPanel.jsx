import { useMemo, useState } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Activity, ExternalLink, MousePointerClick, Eye, Plus } from "lucide-react";
import { saInset, saSurface } from "../dashboardSurface";

const fmt = (v) => Number(v || 0).toLocaleString("en-IN");

/** End-user labels: featured→project, impression→view. */
const formatEngagementEventLabel = (row = {}) => {
  const key = String(row.key || "").toLowerCase();
  const raw = String(row.label || key).toLowerCase();
  if (
    key.includes("featured_project_impression") ||
    key === "project_impression" ||
    raw.includes("featured project impression") ||
    raw.includes("project impression")
  ) {
    return "Project view";
  }
  if (
    key.includes("featured_project_click") ||
    raw.includes("featured project click")
  ) {
    return "Project click";
  }
  if (key === "listing_impression" || raw.includes("listing impression")) {
    return "Property view";
  }
  if (raw.includes("impression")) {
    return (row.label || key).replace(/impression/gi, "view");
  }
  if (row.label) return row.label;
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-emerald-100 bg-white px-3 py-2 text-[11px] shadow-[0_8px_24px_rgba(16,185,129,0.12)]">
      <p className="mb-1 font-semibold text-[#0f3d2e]">{label}</p>
      {payload.map((row) => (
        <p key={row.dataKey} className="flex items-center justify-between gap-4 font-semibold">
          <span style={{ color: row.color }}>{row.name}</span>
          <span className="tabular-nums text-[#0f3d2e]">{fmt(row.value)}</span>
        </p>
      ))}
    </div>
  );
};

const METRIC_MODES = [
  { key: "all", label: "Views + Clicks" },
  { key: "views", label: "Views" },
  { key: "clicks", label: "Clicks" },
];

export default function SaEngagementPanel({
  engagement = null,
  rangeLabel = "",
  isLoading = false,
  isError = false,
  onRetry,
  onOpenActivity,
}) {
  const [mode, setMode] = useState("all");
  const summary = engagement?.summary || {};
  const daily = Array.isArray(engagement?.daily) ? engagement.daily : [];
  const actionMix = Array.isArray(engagement?.actionMix) ? engagement.actionMix : [];
  const topEvents = Array.isArray(engagement?.topEvents) ? engagement.topEvents : [];
  const granularity = engagement?.granularity || "day";

  const chartData = useMemo(() => {
    const rows = daily.map((row) => ({
      ...row,
      label: row.label || row.key,
      views: Number(row.views) || 0,
      clicks: Number(row.clicks) || 0,
    }));
    // Long ranges: start near first activity so the chart stays readable/scalable.
    if (granularity === "hour" || rows.length <= 16) return rows;
    const firstActive = rows.findIndex((row) => row.views > 0 || row.clicks > 0);
    if (firstActive <= 0) return rows;
    return rows.slice(Math.max(0, firstActive - 1));
  }, [daily, granularity]);

  const maxMix = Math.max(...actionMix.map((r) => r.value), 1);
  const mixTotal = actionMix.reduce((sum, row) => sum + (Number(row.value) || 0), 0);
  const hasData = summary.clicks > 0 || summary.views > 0;

  const allViews = Number(summary.views) || 0;
  const allClicks = Number(summary.clicks) || 0;
  const bothTotal = allViews + allClicks;

  const kpis = [
    {
      key: "views",
      label: "All views",
      value: allViews,
      icon: Eye,
      tone: "text-emerald-700 bg-emerald-50",
    },
    {
      key: "clicks",
      label: "All clicks",
      value: allClicks,
      icon: MousePointerClick,
      tone: "text-emerald-700 bg-emerald-50",
    },
    {
      key: "total",
      label: "Total",
      value: bothTotal,
      icon: Plus,
      tone: "text-[#0f3d2e] bg-emerald-50",
    },
  ];

  return (
    <article className={`overflow-hidden rounded-2xl ${saSurface}`}>
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-50 px-3.5 py-2.5">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-emerald-600">
            Engagement
          </p>
          <h3 className="mt-0.5 flex items-center gap-1.5 text-xs font-semibold text-[#0f3d2e]">
            <Activity className="h-3.5 w-3.5 text-emerald-600" />
            Website & app engagement
          </h3>
          <p className="text-[10px] text-[#5c7d6d]">
            <span className="font-semibold text-[#0f3d2e]">{rangeLabel || "Period"}</span>
            <span className="text-emerald-200"> · </span>
            {granularity === "hour" ? "Hourly" : "Daily"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="inline-flex max-w-full overflow-x-auto rounded-full border border-emerald-100 bg-emerald-50/40 p-0.5" style={{ scrollbarWidth: "none" }}>
            {METRIC_MODES.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setMode(item.key)}
                className={`shrink-0 rounded-full px-2.5 py-1.5 text-[10px] font-bold transition sm:px-2 sm:py-1 ${
                  mode === item.key
                    ? "bg-[#27AE60] text-white shadow-[0_4px_10px_rgba(37,211,102,0.25)]"
                    : "text-[#5c7d6d] hover:text-[#0f3d2e]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={onOpenActivity}
            className="inline-flex items-center gap-1 rounded-full border border-emerald-100 bg-white px-2 py-1 text-[10px] font-bold text-[#0f3d2e] shadow-[0_4px_10px_rgba(16,185,129,0.08)] hover:bg-emerald-50"
          >
            Full activity
            <ExternalLink className="h-3 w-3" />
          </button>
        </div>
      </header>

      <div className="flex flex-wrap gap-1.5 border-b border-emerald-50 px-3 py-2">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.key}
              className={`inline-flex min-w-[108px] flex-1 items-center gap-1.5 rounded-xl px-2 py-1 sm:max-w-[160px] sm:flex-none ${saInset}`}
            >
              <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-md ${kpi.tone}`}>
                <Icon className="h-3 w-3" />
              </span>
              <div className="min-w-0 leading-tight">
                <p className="truncate text-[9px] font-semibold uppercase tracking-wide text-emerald-600">
                  {kpi.label}
                </p>
                <p className="text-sm font-semibold tabular-nums text-[#0f3d2e]">{fmt(kpi.value)}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid items-stretch gap-3 p-3 lg:grid-cols-12">
        <div className="flex flex-col lg:col-span-8">
          {isLoading ? (
            <div
              className="h-[220px] animate-pulse rounded-xl bg-emerald-50/50"
              aria-busy="true"
              aria-label="Loading engagement"
            />
          ) : isError ? (
            <div className="flex h-[220px] flex-col items-center justify-center gap-2 text-center text-xs text-[#5c7d6d]">
              <p className="font-semibold text-[#0f3d2e]">Unable to load engagement data</p>
              <p>Requires Super Admin activity access (user:view).</p>
              {onRetry ? (
                <button
                  type="button"
                  onClick={onRetry}
                  className="rounded-full border border-emerald-100 bg-white px-2.5 py-1 text-[11px] font-semibold text-emerald-700 shadow-[0_4px_10px_rgba(16,185,129,0.08)] hover:bg-emerald-50"
                >
                  Retry
                </button>
              ) : null}
            </div>
          ) : !hasData ? (
            <div className="flex h-[220px] flex-col items-center justify-center gap-1 text-center text-xs text-[#5c7d6d]">
              <p className="font-semibold text-[#0f3d2e]">No views or clicks yet</p>
              <p>No activity available for this period.</p>
            </div>
          ) : (
            <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 12, right: 8, left: -8, bottom: 8 }}>
                <defs>
                  <linearGradient id="saViewsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#27AE60" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="#27AE60" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="saClicksFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#27AE60" stopOpacity={0.32} />
                    <stop offset="100%" stopColor="#27AE60" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#C8F3D9" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: "#5c7d6d" }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                  minTickGap={14}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#5c7d6d" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<Tip />} />
                <Legend
                  wrapperStyle={{ fontSize: 11, paddingTop: 4 }}
                  iconType="circle"
                  iconSize={8}
                />
                {(mode === "all" || mode === "views") && (
                  <Area
                    type="monotone"
                    dataKey="views"
                    name="All views"
                    stroke="#27AE60"
                    fill="url(#saViewsFill)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                )}
                {(mode === "all" || mode === "clicks") &&
                  (mode === "clicks" ? (
                    <Area
                      type="monotone"
                      dataKey="clicks"
                      name="All clicks"
                      stroke="#27AE60"
                      fill="url(#saClicksFill)"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                  ) : (
                    <Line
                      type="monotone"
                      dataKey="clicks"
                      name="All clicks"
                      stroke="#27AE60"
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                  ))}
              </ComposedChart>
            </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="flex h-full flex-col space-y-3 lg:col-span-4">
          <div className={`rounded-xl bg-[#f4fbf7] p-3 ${saInset}`}>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.08em] text-emerald-600">
              Action mix
            </p>
            {actionMix.length ? (
              <div className="space-y-2">
                {actionMix.slice(0, 6).map((row) => (
                  <div key={row.key}>
                    <div className="mb-0.5 flex items-center justify-between gap-2 text-[11px]">
                      <span className="font-semibold capitalize text-[#5c7d6d]">{row.label}</span>
                      <span className="font-semibold tabular-nums text-[#0f3d2e]">
                        {fmt(row.value)}
                        {mixTotal > 0
                          ? ` · ${((Number(row.value) / mixTotal) * 100).toFixed(1)}%`
                          : ""}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white">
                      <div
                        className="h-full rounded-full bg-[#27AE60]"
                        style={{ width: `${Math.max(4, (row.value / maxMix) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-4 text-center text-[11px] text-[#5c7d6d]">No action mix yet</p>
            )}
          </div>

          <div className={`rounded-xl p-3 ${saInset}`}>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.08em] text-emerald-600">
              Top events
            </p>
            {topEvents.length ? (
              <ul className="space-y-1.5">
                {topEvents.slice(0, 6).map((row, index) => (
                  <li
                    key={row.key}
                    className="flex items-center justify-between gap-2 text-[11px]"
                  >
                    <span className="min-w-0 truncate font-semibold capitalize text-[#5c7d6d]">
                      <span className="mr-1.5 text-emerald-300">{index + 1}.</span>
                      {formatEngagementEventLabel(row)}
                    </span>
                    <span className="shrink-0 font-semibold tabular-nums text-[#0f3d2e]">
                      {fmt(row.value)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-4 text-center text-[11px] text-[#5c7d6d]">No events in period</p>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
