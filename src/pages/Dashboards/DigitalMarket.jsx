import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, Megaphone, RefreshCw, UserRoundSearch } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "../../api/apiClient";
import { getAllProjectsAnalytics, getAllPropertiesAnalytics } from "../../features/property/propertyService";
import { getCanpaingsAnalytics, getRunningCampaigns } from "../../features/user/userService";
import DashboardDateFilter from "./shared/DashboardDateFilter";
import { useDashboardDateRange } from "./shared/useDashboardDateRange";
import { DATE_PRESETS } from "./shared/dashboardDateRange";

const safe = async (fn, fallback) => {
  try {
    return await fn();
  } catch {
    return fallback;
  }
};

const unpack = (response) => response?.data?.data || response?.data || {};
const asNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

export default function DigitalMarket() {
  const navigate = useNavigate();
  const dateRange = useDashboardDateRange("30d", DATE_PRESETS);
  const { range, filters } = dateRange;

  const leadsQuery = useQuery({
    queryKey: ["digital-market-dashboard", "leads", filters],
    queryFn: () =>
      safe(async () => {
        const response = await apiClient.get("/api/properties/leads/admin/overview", {
          params: { page: 1, limit: 50, ...filters },
        });
        const payload = response?.data?.data || response?.data || {};
        return payload.summary || payload;
      }, {}),
    staleTime: 60_000,
  });

  const projectsQuery = useQuery({
    queryKey: ["digital-market-dashboard", "projects", filters],
    queryFn: () =>
      safe(async () => {
        const response = await getAllProjectsAnalytics(filters);
        return unpack(response);
      }, {}),
    staleTime: 60_000,
  });

  const propertiesQuery = useQuery({
    queryKey: ["digital-market-dashboard", "properties", filters],
    queryFn: () =>
      safe(async () => {
        const response = await getAllPropertiesAnalytics(filters);
        return unpack(response);
      }, {}),
    staleTime: 60_000,
  });

  const campaignsQuery = useQuery({
    queryKey: ["digital-market-dashboard", "campaigns"],
    queryFn: () =>
      safe(async () => {
        const response = await getCanpaingsAnalytics();
        return response?.data?.data || response?.data || [];
      }, []),
    staleTime: 90_000,
  });

  const runningQuery = useQuery({
    queryKey: ["digital-market-dashboard", "running"],
    queryFn: () =>
      safe(async () => {
        const response = await getRunningCampaigns();
        return response?.data?.data || response?.data || [];
      }, []),
    staleTime: 90_000,
  });

  const stats = useMemo(() => {
    const leadSummary = leadsQuery.data || {};
    const byStatus = leadSummary.byStatus || {};
    const projects = projectsQuery.data?.overview || projectsQuery.data || {};
    const properties = propertiesQuery.data?.overview || propertiesQuery.data || {};
    const campaigns = Array.isArray(campaignsQuery.data) ? campaignsQuery.data : [];
    const running = Array.isArray(runningQuery.data) ? runningQuery.data : [];

    return {
      leads: asNumber(leadSummary.total),
      newLeads: asNumber(byStatus.new_lead),
      projects: asNumber(projects.totalProjects ?? projects.total),
      properties: asNumber(properties.totalProperties ?? properties.total),
      campaigns: campaigns.length,
      running: running.length,
    };
  }, [campaignsQuery.data, leadsQuery.data, projectsQuery.data, propertiesQuery.data, runningQuery.data]);

  const isFetching = [leadsQuery, projectsQuery, propertiesQuery, campaignsQuery, runningQuery].some(
    (q) => q.isFetching,
  );

  const refresh = async () => {
    await Promise.allSettled([
      leadsQuery.refetch(),
      projectsQuery.refetch(),
      propertiesQuery.refetch(),
      campaignsQuery.refetch(),
      runningQuery.refetch(),
    ]);
    toast.success("Digital marketing dashboard refreshed");
  };

  return (
    <div className="mx-auto max-w-[1200px] space-y-3 pb-6 text-slate-900">
      <section className="rounded-[14px] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-sky-600">
              Digital Marketing
            </p>
            <h1 className="mt-0.5 text-lg font-black text-slate-950">Campaign performance desk</h1>
            <p className="mt-1 text-xs text-slate-500">
              Live leads, inventory demand, and email campaign activity for{" "}
              <strong className="text-slate-700">{range.label}</strong>.
            </p>
          </div>
          <button
            type="button"
            onClick={refresh}
            disabled={isFetching}
            className="inline-flex items-center gap-1.5 rounded-[10px] border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </section>

      <DashboardDateFilter
        preset={dateRange.preset}
        onPresetChange={dateRange.setPreset}
        customFrom={dateRange.customFrom}
        customTo={dateRange.customTo}
        onCustomFromChange={dateRange.setCustomFrom}
        onCustomToChange={dateRange.setCustomTo}
        onApplyCustom={dateRange.applyCustomRange}
        presets={DATE_PRESETS}
        activeClassName="bg-sky-600 text-white shadow-sm"
        idleClassName="bg-slate-50 text-slate-600 hover:bg-sky-50 hover:text-sky-700"
      />

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
        {[
          { label: "Leads", value: stats.leads, hint: `${stats.newLeads} new`, href: "/leads", icon: UserRoundSearch },
          { label: "Projects", value: stats.projects, hint: "In date range", href: "/projects", icon: BarChart3 },
          { label: "Properties", value: stats.properties, hint: "In date range", href: "/properties", icon: BarChart3 },
          { label: "Campaigns", value: stats.campaigns, hint: "Email analytics", href: "/email-notifications", icon: Megaphone },
          { label: "Running", value: stats.running, hint: "Active sends", href: "/email-notifications", icon: Megaphone },
          { label: "Period", value: range.days || "—", hint: range.label, href: "/", icon: BarChart3 },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.label}
              type="button"
              onClick={() => card.href && navigate(card.href)}
              className="rounded-[14px] border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:border-sky-300 hover:bg-sky-50/40"
            >
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-sky-100 bg-sky-50 text-sky-600">
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-slate-500">{card.label}</p>
                  <p className="text-base font-black tabular-nums text-slate-950">{card.value}</p>
                  <p className="truncate text-[10px] text-slate-400">{card.hint}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
