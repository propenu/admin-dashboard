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
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] shadow-lg">
      <p className="mb-1 font-bold text-slate-800">{label}</p>
      {payload.map((row) => (
        <p key={row.dataKey} className="flex items-center justify-between gap-4 font-semibold">
          <span style={{ color: row.color }}>{row.name}</span>
          <span className="tabular-nums text-slate-900">{fmt(row.value)}</span>
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
      tone: "text-blue-700 bg-blue-50",
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
      tone: "text-slate-700 bg-slate-100",
    },
  ];

  return (
    <article className="overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-3.5 py-2.5">
        <div className="min-w-0">
          <h3 className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
            <Activity className="h-3.5 w-3.5 text-emerald-600" />
            Website & app engagement
          </h3>
          <p className="text-[10px] text-slate-500">
            <span className="font-semibold text-slate-700">{rangeLabel || "Period"}</span>
            <span className="text-slate-300"> · </span>
            {granularity === "hour" ? "Hourly" : "Daily"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
            {METRIC_MODES.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setMode(item.key)}
                className={`rounded-md px-2 py-1 text-[10px] font-bold transition ${
                  mode === item.key
                    ? "bg-white text-emerald-700 shadow-sm ring-1 ring-emerald-100"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={onOpenActivity}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-[10px] font-bold text-slate-600 hover:bg-slate-50"
          >
            Full activity
            <ExternalLink className="h-3 w-3" />
          </button>
        </div>
      </header>

      <div className="flex flex-wrap gap-1.5 border-b border-slate-100 px-3 py-2">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.key}
              className="inline-flex min-w-[108px] flex-1 items-center gap-1.5 rounded-lg border border-slate-100 bg-slate-50/80 px-2 py-1 sm:max-w-[160px] sm:flex-none"
            >
              <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-md ${kpi.tone}`}>
                <Icon className="h-3 w-3" />
              </span>
              <div className="min-w-0 leading-tight">
                <p className="truncate text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                  {kpi.label}
                </p>
                <p className="text-sm font-black tabular-nums text-slate-900">{fmt(kpi.value)}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid items-stretch gap-3 p-3 lg:grid-cols-12">
        <div className="flex flex-col lg:col-span-8">
          {isLoading ? (
            <div className="flex h-[380px] items-center justify-center text-xs text-slate-400 lg:h-[420px]">
              Loading engagement…
            </div>
          ) : isError ? (
            <div className="flex h-[380px] flex-col items-center justify-center gap-1 text-center text-xs text-slate-400 lg:h-[420px]">
              <p className="font-semibold text-slate-500">Engagement unavailable</p>
              <p>Requires Super Admin activity access (user:view).</p>
            </div>
          ) : !hasData ? (
            <div className="flex h-[380px] flex-col items-center justify-center gap-1 text-center text-xs text-slate-400 lg:h-[420px]">
              <p className="font-semibold text-slate-500">No clicks or actions in this period</p>
              <p>Try another date range or check All Users Activity.</p>
            </div>
          ) : (
            <div className="h-[380px] w-full lg:h-[420px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 12, right: 8, left: -8, bottom: 8 }}>
                <defs>
                  <linearGradient id="saViewsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="saClicksFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34D399" stopOpacity={0.32} />
                    <stop offset="100%" stopColor="#34D399" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: "#64748B" }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                  minTickGap={14}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#64748B" }}
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
                    stroke="#3B82F6"
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
                      stroke="#059669"
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
                      stroke="#059669"
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
          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Action mix
            </p>
            {actionMix.length ? (
              <div className="space-y-2">
                {actionMix.slice(0, 6).map((row) => (
                  <div key={row.key}>
                    <div className="mb-0.5 flex items-center justify-between gap-2 text-[11px]">
                      <span className="font-semibold capitalize text-slate-600">{row.label}</span>
                      <span className="font-bold tabular-nums text-slate-800">{fmt(row.value)}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{ width: `${Math.max(4, (row.value / maxMix) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-4 text-center text-[11px] text-slate-400">No action mix yet</p>
            )}
          </div>

          <div className="rounded-xl border border-slate-100 p-3">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Top events
            </p>
            {topEvents.length ? (
              <ul className="space-y-1.5">
                {topEvents.slice(0, 6).map((row, index) => (
                  <li
                    key={row.key}
                    className="flex items-center justify-between gap-2 text-[11px]"
                  >
                    <span className="min-w-0 truncate font-semibold capitalize text-slate-600">
                      <span className="mr-1.5 text-slate-300">{index + 1}.</span>
                      {formatEngagementEventLabel(row)}
                    </span>
                    <span className="shrink-0 font-bold tabular-nums text-slate-900">
                      {fmt(row.value)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-4 text-center text-[11px] text-slate-400">No events in period</p>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
