import React, { useCallback, useEffect, useState } from "react";
import { apiClient } from "../../api/apiClient";
import {
  getAllProjectsAnalytics,
  getAllPropertiesAnalytics,
  getSalesManagerAnalytics,
} from "../../features/property/propertyService";
import { getTicketDashboardOverview } from "../../features/ticket/ticket_system";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Users, FolderKanban, CheckCircle, Eye, RefreshCw } from "lucide-react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import DashboardDateFilter from "./shared/DashboardDateFilter";
import { useDashboardDateRange } from "./shared/useDashboardDateRange";

const asNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const unpackAnalytics = (response) => response?.data?.data || response?.data || {};

const overviewBucket = (overview = {}) => {
  const active = asNumber(overview.activeProjects ?? overview.activeProperties ?? overview.active);
  const pending = asNumber(overview.pendingProjects ?? overview.pendingProperties ?? overview.pending);
  const draft = asNumber(
    overview.draftProjects ?? overview.draftProperties ?? overview.inactive ?? overview.draft,
  );
  const total =
    asNumber(overview.totalProjects ?? overview.totalProperties ?? overview.total) ||
    active + pending + draft;
  const views = asNumber(overview.totalViews ?? overview.views);
  return { total, active, pending, draft, views };
};

const SalesManagerDashboard = () => {
  const dateRange = useDashboardDateRange("30d");
  const { filters, range } = dateRange;
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        const [roleRes, propsRes, projectsRes, leadsRes, ticketsRes] = await Promise.allSettled([
          getSalesManagerAnalytics(filters),
          getAllPropertiesAnalytics(filters),
          getAllProjectsAnalytics(filters),
          apiClient.get("/api/properties/leads/admin/overview", {
            params: { page: 1, limit: 50, ...filters },
          }),
          getTicketDashboardOverview({
            from: filters.from,
            to: filters.to,
          }),
        ]);

        const role =
          roleRes.status === "fulfilled"
            ? unpackAnalytics(roleRes.value) || roleRes.value?.data || {}
            : {};
        const properties =
          propsRes.status === "fulfilled" ? unpackAnalytics(propsRes.value) : {};
        const projects =
          projectsRes.status === "fulfilled" ? unpackAnalytics(projectsRes.value) : {};
        const propertyCounts = overviewBucket(properties.overview || properties);
        const projectCounts = overviewBucket(projects.overview || projects);
        const hasPeriodInventory = Boolean(propertyCounts.total || projectCounts.total);

        setAnalytics({
          totalAgents: asNumber(role.totalAgents),
          totalProperties: hasPeriodInventory
            ? propertyCounts.total || asNumber(role.totalProperties)
            : asNumber(role.totalProperties),
          active: hasPeriodInventory
            ? propertyCounts.active || asNumber(role.active)
            : asNumber(role.active),
          pending: hasPeriodInventory
            ? propertyCounts.pending || asNumber(role.pending)
            : asNumber(role.pending),
          draft: hasPeriodInventory
            ? propertyCounts.draft || asNumber(role.draft)
            : asNumber(role.draft),
          totalViews: hasPeriodInventory
            ? propertyCounts.views || asNumber(role.totalViews)
            : asNumber(role.totalViews),
          leadsOverview:
            leadsRes.status === "fulfilled"
              ? leadsRes.value?.data?.data || leadsRes.value?.data || {}
              : {},
          ticketOverview: ticketsRes.status === "fulfilled" ? ticketsRes.value || {} : {},
          projectCounts,
        });
      } catch (err) {
        console.error("Sales Manager Dashboard Error:", err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [filters],
  );

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const totalAgents = analytics?.totalAgents || 0;
  const totalProperties = analytics?.totalProperties || 0;
  const active = analytics?.active || 0;
  const pending = analytics?.pending || 0;
  const draft = analytics?.draft || 0;
  const totalViews = analytics?.totalViews || 0;

  const activePercentage =
    totalProperties > 0 ? ((active / totalProperties) * 100).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mb-6 space-y-3">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-[#27AE60]">
              Sales Manager Dashboard
            </h1>
            <p className="text-sm text-slate-500">
              Team & property performance overview
            </p>
            <p className="mt-1 text-[11px] text-slate-400">
              Period{" "}
              <strong className="font-semibold text-slate-600">{range.label}</strong>
            </p>
          </div>

          <button
            onClick={() => fetchAnalytics(true)}
            disabled={refreshing}
            className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow border hover:bg-slate-100"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        <DashboardDateFilter
          preset={dateRange.preset}
          onPresetChange={dateRange.setPreset}
          customFrom={dateRange.customFrom}
          customTo={dateRange.customTo}
          onCustomFromChange={dateRange.setCustomFrom}
          onCustomToChange={dateRange.setCustomTo}
          onApplyCustom={dateRange.applyCustomRange}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <KPI icon={<Users />} label="Total Agents" value={totalAgents} />
        <KPI
          icon={<FolderKanban />}
          label="Total Properties"
          value={totalProperties}
        />
        <KPI
          icon={<CheckCircle />}
          label="Active Properties"
          value={`${active} (${activePercentage}%)`}
        />
        <KPI icon={<Eye />} label="Total Views" value={totalViews} />
      </div>

      <div className="bg-white p-6 rounded-2xl shadow mb-10">
        <h3 className="text-sm font-bold text-slate-700 uppercase mb-6">
          Property Status Distribution
        </h3>

        <ResponsiveContainer width="100%" height={120}>
          <BarChart
            layout="vertical"
            data={[
              {
                name: "Properties",
                Active: active,
                Pending: pending,
                Draft: draft,
              },
            ]}
          >
            <CartesianGrid horizontal={false} strokeDasharray="3 3" />
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="name" hide />
            <Tooltip />
            <Bar dataKey="Active" stackId="a" fill="#10b981" />
            <Bar dataKey="Pending" stackId="a" fill="#f59e0b" />
            <Bar dataKey="Draft" stackId="a" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>

        <div className="flex justify-center gap-8 mt-6 text-xs font-semibold text-slate-600">
          <Legend color="bg-emerald-500" label="Active" value={active} />
          <Legend color="bg-amber-500" label="Pending" value={pending} />
          <Legend color="bg-blue-500" label="Draft" value={draft} />
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow">
        <h3 className="text-sm font-bold text-slate-700 uppercase mb-6">
          Team Performance Overview
        </h3>

        <ResponsiveContainer width="100%" height={250}>
          <BarChart
            data={[
              { name: "Agents", value: totalAgents },
              { name: "Properties", value: totalProperties },
              { name: "Views", value: totalViews },
            ]}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const KPI = ({ icon, label, value }) => (
  <div className="bg-white p-5 rounded-2xl shadow hover:shadow-md transition">
    <div className="flex justify-between items-center mb-3 text-slate-600">
      {icon}
    </div>
    <div className="text-2xl font-bold text-slate-800">{value}</div>
    <div className="text-xs text-slate-500 uppercase mt-1">{label}</div>
  </div>
);

const Legend = ({ color, label, value }) => (
  <div className="flex items-center gap-2">
    <div className={`w-3 h-3 rounded-full ${color}`} />
    {label} ({value})
  </div>
);

export default SalesManagerDashboard;
