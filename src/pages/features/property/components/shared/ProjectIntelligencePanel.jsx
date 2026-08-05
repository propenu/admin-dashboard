import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  CalendarClock,
  Download,
  Eye,
  MousePointerClick,
  RefreshCw,
  Target,
  TrendingUp,
  Users,
  Building2,
  UserCheck,
  MapPin,
} from "lucide-react";
import { getAllUsersActivity } from "../../../../../features/activity/allUsersActivityService";
import { rangeFromPreset } from "../../../../Dashboards/shared/dashboardDateRange";
import {
  isContactedLead,
  isNewLead,
  isQualifiedLead,
  isSiteVisitLead,
  mapProjectIntelligence,
  PROJECT_INTEL_PRESETS,
  relativeTime,
} from "./projectIntelligenceData";

const fmt = (v) => {
  if (v == null) return "—";
  return Number(v || 0).toLocaleString("en-IN");
};

const statusTone = (status = "") => {
  const s = String(status).toLowerCase();
  if (s.includes("new")) return "bg-emerald-50 text-emerald-700 border-emerald-100";
  if (s.includes("contact")) return "bg-blue-50 text-blue-700 border-blue-100";
  if (s.includes("site")) return "bg-cyan-50 text-cyan-700 border-cyan-100";
  if (s.includes("qualified") || s.includes("hot")) return "bg-violet-50 text-violet-700 border-violet-100";
  if (s.includes("book") || s.includes("sale") || s.includes("closed")) {
    return "bg-amber-50 text-amber-700 border-amber-100";
  }
  return "bg-slate-50 text-slate-600 border-slate-100";
};

function MiniSpark({ points = [], className = "text-emerald-500" }) {
  const values = points.length ? points : [0, 0, 0, 0];
  const max = Math.max(...values, 1);
  const w = 56;
  const h = 18;
  const step = w / Math.max(values.length - 1, 1);
  const d = values
    .map((v, i) => {
      const x = i * step;
      const y = h - (v / max) * (h - 2) - 1;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className={className} aria-hidden>
      <path d={d} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function FunnelBars({ stages = [] }) {
  const max = Math.max(...stages.map((s) => Number(s.volume) || 0), 1);
  return (
    <div className="space-y-2">
      {stages.map((stage) => (
        <div key={stage.key} className="grid grid-cols-[72px_1fr_40px] items-center gap-2">
          <span className="truncate text-[11px] font-semibold text-slate-500">{stage.label}</span>
          <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-[#27AE60] transition-all"
              style={{ width: `${Math.max(4, (Number(stage.volume) / max) * 100)}%` }}
            />
          </div>
          <span className="text-right text-[11px] font-bold tabular-nums text-slate-700">
            {fmt(stage.volume)}
          </span>
        </div>
      ))}
    </div>
  );
}

function TrendChart({ rows = [] }) {
  const max = Math.max(...rows.flatMap((r) => [r.views, r.clicks]), 1);
  const w = 280;
  const h = 72;
  const step = w / Math.max(rows.length - 1, 1);
  const path = (key) =>
    rows
      .map((r, i) => {
        const x = i * step;
        const y = h - (Number(r[key]) / max) * (h - 8) - 4;
        return `${i === 0 ? "M" : "L"}${x},${y}`;
      })
      .join(" ");
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Views & clicks (14d)
        </p>
        <div className="flex gap-2 text-[10px] font-semibold">
          <span className="text-emerald-600">● Views</span>
          <span className="text-blue-500">● Clicks</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="h-20 w-full" preserveAspectRatio="none">
        <path d={path("views")} fill="none" stroke="#27AE60" strokeWidth="2" />
        <path d={path("clicks")} fill="none" stroke="#3B82F6" strokeWidth="2" />
      </svg>
    </div>
  );
}

function MixBars({ rows = [], emptyLabel = "No mix data in period" }) {
  if (!rows.length) {
    return <p className="py-3 text-center text-[11px] text-slate-400">{emptyLabel}</p>;
  }
  return (
    <div className="space-y-1.5">
      {rows.map((row) => (
        <div key={row.label} className="grid grid-cols-[72px_1fr_36px] items-center gap-2">
          <span className="truncate text-[11px] text-slate-500">{row.label}</span>
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-emerald-500"
              style={{ width: `${Math.max(row.percentage, 2)}%` }}
            />
          </div>
          <span className="text-right text-[10px] font-bold text-slate-600">{row.percentage}%</span>
        </div>
      ))}
    </div>
  );
}

/**
 * Advanced Project Intelligence block — uses existing project meta, project leads API,
 * and optional all-users-activity (user:view). Failures never break the details page.
 */
export default function ProjectIntelligencePanel({
  property,
  leads = [],
  totalLeads = 0,
  onRefresh,
  isRefreshing = false,
}) {
  const navigate = useNavigate();
  const [preset, setPreset] = useState("90d");
  const [leadTab, setLeadTab] = useState("all");
  const [timelineTab, setTimelineTab] = useState("all");
  const [focusKpi, setFocusKpi] = useState(null);

  const range = useMemo(() => rangeFromPreset(preset), [preset]);

  const activityQuery = useQuery({
    queryKey: [
      "project-intelligence-activity",
      property?._id,
      preset,
      range.from,
      range.to,
    ],
    queryFn: async () => {
      const params = {
        projectId: property._id,
        groupBy: "event",
        action: "all",
        role: "all",
        page: 1,
        limit: 100,
        includeNoise: "0",
      };
      if (preset === "all") {
        params.range = "all";
      } else if (preset === "today") {
        params.range = "today";
      } else if (range.from && range.to) {
        params.from = `${range.from}T00:00:00.000Z`;
        params.to = `${range.to}T23:59:59.999Z`;
      } else {
        params.range = preset;
      }
      return getAllUsersActivity(params);
    },
    enabled: Boolean(property?._id),
    staleTime: 60_000,
    retry: false,
  });

  const activityAvailable =
    activityQuery.isSuccess && !activityQuery.isError && Boolean(activityQuery.data);

  const model = useMemo(
    () =>
      mapProjectIntelligence({
        property,
        leads,
        totalLeads,
        range,
        activityItems: activityQuery.data?.items || [],
        activityAvailable,
      }),
    [activityAvailable, activityQuery.data, leads, property, range, totalLeads],
  );

  const filteredLeads = useMemo(() => {
    const rows = model.leadRows || [];
    if (leadTab === "new") return rows.filter((r) => isNewLead(r.raw));
    if (leadTab === "contacted") return rows.filter((r) => isContactedLead(r.raw));
    if (leadTab === "site_visit") return rows.filter((r) => isSiteVisitLead(r.raw));
    if (leadTab === "qualified") return rows.filter((r) => isQualifiedLead(r.raw));
    return rows;
  }, [leadTab, model.leadRows]);

  const timelineRows = useMemo(() => {
    const rows = model.timeline || [];
    if (timelineTab === "all") return rows;
    return rows.filter((r) => r.kind === timelineTab);
  }, [model.timeline, timelineTab]);

  const kpis = [
    {
      key: "views",
      label: "Page views",
      value: model.summary.views,
      icon: Eye,
      spark: model.sparks.views,
      onClick: () => {
        setFocusKpi("views");
        setTimelineTab("browsing");
      },
    },
    {
      key: "visitors",
      label: "Unique visitors",
      value: model.summary.uniqueVisitors,
      icon: Users,
      spark: model.sparks.visitors,
      onClick: () => {
        setFocusKpi("visitors");
        setTimelineTab("browsing");
      },
    },
    {
      key: "clicks",
      label: "Clicks",
      value: model.summary.clicks,
      icon: MousePointerClick,
      spark: model.sparks.clicks,
      onClick: () => {
        setFocusKpi("clicks");
        setTimelineTab("browsing");
      },
    },
    {
      key: "inquiries",
      label: "Inquiries",
      value: model.summary.inquiries,
      icon: TrendingUp,
      spark: model.sparks.inquiries,
      onClick: () => {
        setFocusKpi("inquiries");
        setLeadTab("all");
      },
    },
    {
      key: "leads",
      label: "Leads",
      value: model.summary.leads,
      icon: UserCheck,
      spark: model.sparks.leads,
      onClick: () => {
        setFocusKpi("leads");
        setLeadTab("all");
        document.getElementById("project-intel-leads")?.scrollIntoView({ behavior: "smooth" });
      },
    },
    {
      key: "siteVisits",
      label: "Site visits",
      value: model.summary.siteVisits,
      icon: MapPin,
      spark: model.sparks.siteVisits,
      onClick: () => {
        setFocusKpi("siteVisits");
        setLeadTab("site_visit");
        setTimelineTab("site_visits");
      },
    },
    {
      key: "bookings",
      label: "Bookings",
      value: model.summary.bookings,
      icon: Target,
      spark: model.sparks.bookings,
      onClick: () => setFocusKpi("bookings"),
    },
    {
      key: "updates",
      label: "Update count",
      value: model.summary.updateCount,
      icon: Building2,
      spark: model.sparks.updates,
      onClick: () => setFocusKpi("updates"),
    },
  ];

  const handleExport = () => {
    const lines = [
      `Project Intelligence — ${property?.title || property?._id}`,
      `Period: ${range.label || preset}`,
      `Views: ${model.summary.views}`,
      `Clicks: ${model.summary.clicks}`,
      `Leads: ${model.summary.leads}`,
      `Site visits: ${model.summary.siteVisits}`,
      `Bookings: ${model.summary.bookings}`,
    ].join("\n");
    navigator.clipboard?.writeText(lines).catch(() => {});
  };

  const handleRefresh = async () => {
    await Promise.allSettled([activityQuery.refetch(), onRefresh?.()]);
  };

  const leadTabs = [
    { key: "all", label: "All", count: model.leadCounts.all },
    { key: "new", label: "New", count: model.leadCounts.new },
    { key: "contacted", label: "Contacted", count: model.leadCounts.contacted },
    { key: "site_visit", label: "Site visit", count: model.leadCounts.site_visit },
    { key: "qualified", label: "Qualified", count: model.leadCounts.qualified },
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
        <div className="min-w-0">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-emerald-600">
            Project intelligence
          </p>
          <p className="truncate text-[12px] text-slate-500">
            Leads · site visits · browsing for this project
            <span className="text-slate-300"> · </span>
            <span className="font-semibold text-slate-600">{range.label}</span>
            {!activityAvailable && !activityQuery.isLoading ? (
              <span className="text-slate-400"> · browsing limited (permission/API)</span>
            ) : null}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-0.5">
            {PROJECT_INTEL_PRESETS.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setPreset(item.key)}
                className={`min-h-[32px] rounded-[10px] px-2.5 text-[11px] font-bold ${
                  preset === item.key
                    ? "bg-white text-emerald-700 shadow-sm ring-1 ring-emerald-200"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing || activityQuery.isFetching}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-2.5 py-1.5 text-[11px] font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isRefreshing || activityQuery.isFetching ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-1 rounded-xl bg-[#27AE60] px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-emerald-700"
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-8">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          const active = focusKpi === kpi.key;
          return (
            <button
              key={kpi.key}
              type="button"
              onClick={kpi.onClick}
              className={`rounded-2xl border bg-white p-3 text-left shadow-sm transition hover:border-emerald-200 ${
                active ? "border-emerald-400 ring-1 ring-emerald-100" : "border-slate-200"
              }`}
            >
              <div className="flex items-start justify-between gap-1">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <MiniSpark points={kpi.spark} />
              </div>
              <p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                {kpi.label}
              </p>
              <p className="text-xl font-black tabular-nums text-slate-900">{fmt(kpi.value)}</p>
              <p className="mt-0.5 text-[10px] text-slate-400">this project · {range.label}</p>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12 lg:items-stretch">
        <section
          id="project-intel-leads"
          className="flex min-h-[320px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-4"
        >
          <header className="border-b border-slate-100 px-3.5 py-3">
            <h3 className="text-sm font-bold text-slate-900">Leads for this project</h3>
            <div className="mt-2 flex gap-1 overflow-x-auto pb-0.5">
              {leadTabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setLeadTab(tab.key)}
                  className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                    leadTab === tab.key
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {tab.label}
                  <span className="ml-1 opacity-80">{tab.count}</span>
                </button>
              ))}
            </div>
          </header>
          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
            {filteredLeads.length ? (
              filteredLeads.slice(0, 12).map((lead) => (
                <div
                  key={lead.id}
                  className="rounded-xl border border-slate-100 px-3 py-2.5 hover:border-emerald-200"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-emerald-50 text-[11px] font-black text-emerald-700">
                        {String(lead.name || "?")
                          .split(/\s+/)
                          .slice(0, 2)
                          .map((p) => p[0])
                          .join("")
                          .toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-slate-800">{lead.name}</p>
                        <p className="truncate text-[11px] text-slate-400">
                          {lead.phone} · {lead.source}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold ${statusTone(lead.status)}`}
                    >
                      {String(lead.status || "").replace(/_/g, " ")}
                    </span>
                  </div>
                  <p className="mt-1.5 text-[10px] text-slate-400">
                    {lead.owner} · {relativeTime(lead.when)}
                  </p>
                </div>
              ))
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-1 py-10 text-center text-slate-400">
                <Users className="h-8 w-8 opacity-30" />
                <p className="text-xs font-medium">No leads in this period</p>
              </div>
            )}
          </div>
          <footer className="border-t border-slate-100 px-3.5 py-2">
            <button
              type="button"
              onClick={() => navigate("/leads")}
              className="text-[11px] font-bold text-emerald-700 hover:underline"
            >
              Open full lead desk →
            </button>
          </footer>
        </section>

        <section className="flex min-h-[320px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-4">
          <header className="border-b border-slate-100 px-3.5 py-3">
            <h3 className="text-sm font-bold text-slate-900">Journey on this project</h3>
            <p className="text-[11px] text-slate-400">Viewed → booked funnel for selected period</p>
          </header>
          <div className="flex-1 space-y-3 p-3.5">
            <FunnelBars stages={model.funnel} />
            {model.insight ? (
              <div
                className={`flex items-start gap-2 rounded-xl border px-3 py-2 text-[11px] font-semibold ${
                  model.insight.tone === "orange"
                    ? "border-orange-100 bg-orange-50 text-orange-700"
                    : "border-slate-100 bg-slate-50 text-slate-600"
                }`}
              >
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{model.insight.text}</span>
              </div>
            ) : null}
            <div>
              <div className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <CalendarClock className="h-3.5 w-3.5" />
                Site visits (from leads)
              </div>
              {model.upcomingVisits.length ? (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {model.upcomingVisits.map((visit) => (
                    <div
                      key={visit.id}
                      className="min-w-[140px] rounded-xl border border-slate-100 bg-slate-50 px-3 py-2"
                    >
                      <p className="text-[10px] font-bold text-emerald-700">
                        {visit.when
                          ? new Date(visit.when).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                            })
                          : "—"}
                      </p>
                      <p className="mt-0.5 truncate text-xs font-bold text-slate-800">{visit.name}</p>
                      <p className="truncate text-[10px] text-slate-400">{visit.agent}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-slate-400">No site-visit status leads in period</p>
              )}
            </div>
          </div>
        </section>

        <section className="flex min-h-[320px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-4">
          <header className="border-b border-slate-100 px-3.5 py-3">
            <h3 className="text-sm font-bold text-slate-900">Browsing & engagement</h3>
            <p className="text-[11px] text-slate-400">
              {activityAvailable
                ? "Live interaction events for this project"
                : "Fallback from project meta + lead sources"}
            </p>
          </header>
          <div className="flex-1 space-y-3 overflow-y-auto p-3.5">
            <TrendChart rows={model.trendRows} />
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Source mix
              </p>
              <MixBars rows={model.sourceMix} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5">
                <p className="text-[10px] font-bold uppercase text-slate-400">Device</p>
                <p className="mt-1 text-sm font-black text-slate-800">
                  {model.deviceSplit.mobile != null
                    ? `${model.deviceSplit.mobile}% mobile`
                    : "—"}
                </p>
                <p className="text-[11px] text-slate-500">
                  {model.deviceSplit.desktop != null
                    ? `${model.deviceSplit.desktop}% desktop`
                    : "No device events"}
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5">
                <p className="mb-1 text-[10px] font-bold uppercase text-slate-400">Top sections</p>
                <MixBars
                  rows={model.topSections}
                  emptyLabel={activityAvailable ? "No section events" : "Needs browsing access"}
                />
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-3.5 py-3">
          <h3 className="text-sm font-bold text-slate-900">Activity timeline</h3>
          <div className="flex gap-1">
            {[
              { key: "all", label: "All activity" },
              { key: "browsing", label: "Browsing" },
              { key: "leads", label: "Leads" },
              { key: "site_visits", label: "Site visits" },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setTimelineTab(tab.key)}
                className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                  timelineTab === tab.key
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </header>
        <div className="divide-y divide-slate-50">
          {timelineRows.length ? (
            timelineRows.slice(0, 12).map((row) => (
              <div
                key={row.id}
                className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5"
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800">{row.title}</p>
                  <p className="truncate text-[11px] text-slate-400">{row.detail || "—"}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-semibold text-slate-400">
                    {relativeTime(row.when)}
                  </span>
                  {row.hrefKind === "lead" ? (
                    <button
                      type="button"
                      onClick={() => navigate("/leads")}
                      className="text-[11px] font-bold text-emerald-700 hover:underline"
                    >
                      View lead →
                    </button>
                  ) : null}
                </div>
              </div>
            ))
          ) : (
            <p className="px-3.5 py-8 text-center text-xs text-slate-400">
              No timeline events for this filter in the selected period
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
