import React, { useState, useEffect } from "react";
import { getSalesAgentAnalytics } from "../../features/property/propertyService";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  FolderKanban,
  CheckCircle,
  FileText,
  Eye,
  RefreshCw,
} from "lucide-react";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const SalesAgentDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const res = await getSalesAgentAnalytics();
      
      const data =
        res?.data?.data || 
        res?.data?.[0] || 
        res?.data || 
        {};

       

      setAnalytics(data);
    } catch (err) {
      console.error("Sales Agent Dashboard Error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const total = analytics?.totalProperties || 0;
  const active = analytics?.active || 0;
  const pending = analytics?.pending || 0;
  const draft = analytics?.draft || 0;
  const views = analytics?.totalViews || 0;

  const activePercentage = total > 0 ? ((active / total) * 100).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#27AE60]">
            Sales Agent Dashboard
          </h1>
          <p className="text-sm text-slate-500">
            Your property activity & engagement overview
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

      {/* KPI SECTION */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <KPI icon={<FolderKanban />} label="My Properties" value={total} />
        <KPI
          icon={<CheckCircle />}
          label="Active Listings"
          value={`${active} (${activePercentage}%)`}
        />
        <KPI icon={<FileText />} label="Draft Listings" value={draft} />
        <KPI icon={<Eye />} label="Total Views" value={views} />
      </div>

      {/* STATUS DISTRIBUTION */}
      <div className="bg-white p-6 rounded-2xl shadow mb-10">
        <h3 className="text-sm font-bold text-slate-700 uppercase mb-6">
          Listing Status Overview
        </h3>

        <ResponsiveContainer width="100%" height={120}>
          <BarChart
            layout="vertical"
            data={[
              {
                name: "Listings",
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

      {/* PERFORMANCE VS ENGAGEMENT */}
      <div className="bg-white p-6 rounded-2xl shadow">
        <h3 className="text-sm font-bold text-slate-700 uppercase mb-6">
          Performance vs Engagement
        </h3>

        <ResponsiveContainer width="100%" height={250}>
          <BarChart
            data={[
              { name: "Active Listings", value: active },
              { name: "Total Views", value: views },
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

export default SalesAgentDashboard;
