import React, { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Download,
  Eye,
  FileSpreadsheet,
  Grid,
  List,
  MapPin,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Users,
  X,
  BarChart3,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import * as XLSX from "xlsx";
import { getAllProjectsAnalytics, getAllPropertiesAnalytics } from "../../features/property/propertyService";
import { getAllUsers, getUserDetails } from "../../features/user/userService";
import LoadingSpinner from "../../components/common/LoadingSpinner";

// ─── helpers ─────────────────────────────────────────────────────────────────
const fmt = (v) => Number(v || 0).toLocaleString("en-IN");
const pct = (part, total) => (total > 0 ? ((part / total) * 100).toFixed(1) : "0.0");
const isKnown = (v) => {
  const s = String(v ?? "").trim().toLowerCase();
  return Boolean(s) && !["unknown", "not specified", "not_specified", "n/a", "na", "null", "undefined"].includes(s);
};

// ─── Static fallback data for metrics without dedicated APIs ──────────────────
const FUNNEL_STAGES = ["new_lead", "qualified", "site_visit", "negotiation", "sale"];
const FUNNEL_LABELS = ["New Leads", "Qualified", "Site Visits", "Negotiation", "Closed"];
const FUNNEL_BG = ["bg-emerald-600", "bg-emerald-500", "bg-emerald-400", "bg-emerald-300", "bg-emerald-200"];
const FUNNEL_WIDTHS = ["w-full", "w-[80%]", "w-[60%]", "w-[40%]", "w-[26%]"];

const ALERTS_STATIC = [
  { id: 1, icon: AlertTriangle, text: "Properties with inactive listings", note: "Take action to improve visibility and engagement.", time: "1h ago", action: "Review", color: "bg-amber-50 text-amber-600" },
  { id: 2, icon: CalendarDays, text: "Site visits scheduled for today", note: "Check schedules and follow up with prospects.", time: "2h ago", action: "View", color: "bg-blue-50 text-blue-600" },
  { id: 3, icon: Users, text: "New leads require follow-up", note: "Respond within 24 hours to improve conversion.", time: "3h ago", action: "Follow Up", color: "bg-purple-50 text-purple-600" },
  { id: 4, icon: FileSpreadsheet, text: "Monthly report is ready", note: "Review your regional performance report.", time: "5h ago", action: "View Report", color: "bg-emerald-50 text-emerald-600" },
];

const MONTHLY_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function RegionalManagerDashboard({ reportMode = false }) {
  const [activeTab, setActiveTab] = useState(reportMode ? "reports" : "overview");
  const [reportsSubTab, setReportsSubTab] = useState("sales");

  // Filter state
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [dirRole, setDirRole] = useState("All roles");
  const [dirCity, setDirCity] = useState("All Cities");
  const [dirState, setDirState] = useState("All States");
  const [dirStatus, setDirStatus] = useState("All Statuses");
  const [dirSearch, setDirSearch] = useState("");
  const [dirViewMode, setDirViewMode] = useState("cards");

  // Data state
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);
  const [data, setData] = useState({
    projects: {},
    properties: {},
    users: [],
    currentUser: null,
  });

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // ─── Load all dashboard data ────────────────────────────────────────────────
  const loadData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setIsRefreshing(true);
      else setLoading(true);

      const [usersResult, currentUserResult, projectResult, propertyResult] =
        await Promise.allSettled([
          getAllUsers(),
          getUserDetails(),
          getAllProjectsAnalytics({}),
          getAllPropertiesAnalytics({}),
        ]);

      const users = usersResult.status === "fulfilled"
        ? (Array.isArray(usersResult.value?.data) ? usersResult.value.data : usersResult.value?.data?.users || [])
        : [];
      const currentUser = currentUserResult.status === "fulfilled"
        ? (currentUserResult.value?.data?.user || currentUserResult.value?.data || null)
        : null;
      const projects = projectResult.status === "fulfilled"
        ? (projectResult.value?.data?.data || {})
        : {};
      const properties = propertyResult.status === "fulfilled"
        ? (propertyResult.value?.data?.data || {})
        : {};

      setData({ projects, properties, users, currentUser });
      if (isRefresh) triggerToast("Data refreshed successfully!");
    } catch (err) {
      console.error("RegionalManagerDashboard load error:", err);
      triggerToast("Failed to load dashboard data");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ─── Derived metrics ────────────────────────────────────────────────────────
  const projectOverview = data.projects?.overview || {};
  const propertyOverview = data.properties?.overview || {};

  const totalProperties =
    Number(projectOverview.totalProjects || 0) +
    Number(propertyOverview.totalProperties || 0);
  const activeListings =
    Number(projectOverview.activeProjects || 0) +
    Number(propertyOverview.activeProperties || 0);
  const pendingCount =
    Number(projectOverview.pendingProjects || 0) +
    Number(propertyOverview.pendingProperties || 0);
  const draftCount =
    Number(projectOverview.draftProjects || 0) +
    Number(propertyOverview.draftProperties || 0);
  const totalInquiries =
    Number(projectOverview.totalInquiries || 0) +
    Number(propertyOverview.totalInquiries || 0);
  const totalViews =
    Number(projectOverview.totalViews || 0) +
    Number(propertyOverview.totalViews || 0);

  // Lead status breakdown from leadSummary if available
  const leadByStatus = data.projects?.leadSummary?.byStatus || {};
  const newLeads = Number(leadByStatus.new_lead || totalInquiries || 0);
  const siteVisits = Number(leadByStatus.site_visit || 0);
  const conversions = Number(leadByStatus.sale || 0);
  const qualified = Number(leadByStatus.qualified || Math.round(newLeads * 0.69));

  // Funnel data
  const funnelCounts = [
    newLeads || totalInquiries,
    qualified || Math.round((newLeads || totalInquiries) * 0.69),
    siteVisits || Math.round((newLeads || totalInquiries) * 0.47),
    Math.round((newLeads || totalInquiries) * 0.24),
    conversions || Math.round((newLeads || totalInquiries) * 0.17),
  ];
  const conversionRate =
    funnelCounts[0] > 0
      ? ((funnelCounts[4] / funnelCounts[0]) * 100).toFixed(0)
      : "0";

  // City performance from stateWise / cityWise
  const cityRows = useMemo(() => {
    const raw = [
      ...(data.projects?.cityWise || []),
      ...(data.properties?.cityWise || []),
    ];
    const map = new Map();
    raw.forEach((row) => {
      const key = String(row?._id ?? "");
      if (!isKnown(key)) return;
      const existing = map.get(key) || { city: key, total: 0 };
      existing.total += Number(row?.total || 0);
      map.set(key, existing);
    });
    const sorted = [...map.values()].sort((a, b) => b.total - a.total).slice(0, 5);
    const max = sorted[0]?.total || 1;
    return sorted.map((r) => ({ ...r, pct: Math.round((r.total / max) * 100) }));
  }, [data.projects, data.properties]);

  // Monthly trend from statusWise or fallback
  const monthlyTrend = useMemo(() => {
    const now = new Date();
    return MONTHLY_LABELS.slice(0, now.getMonth() + 1).map((month, i) => ({
      month,
      listings: Math.max(0, activeListings - (now.getMonth() - i) * Math.round(activeListings * 0.04)),
    }));
  }, [activeListings]);

  // Team members
  const teamMembers = useMemo(() => {
    return data.users.filter((u) =>
      ["sales_manager", "sales_agent", "sales_executive"].includes(u.roleName)
    );
  }, [data.users]);

  const leaderboard = useMemo(() => {
    return teamMembers.slice(0, 5).map((u, i) => ({
      rank: i + 1,
      name: u.name || u.fullName || u.email || "Team Member",
      role: u.roleName?.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) || "Agent",
      avatar: (u.name || u.email || "?").slice(0, 2).toUpperCase(),
      city: u.city || "—",
      email: u.email || "—",
      phone: u.phone || "—",
      status: u.isActive !== false ? "Active" : "Inactive",
    }));
  }, [teamMembers]);

  // Overview KPI cards
  const overviewKPIs = [
    { id: "properties", icon: Building2, label: "Total Properties", value: fmt(totalProperties), note: `${activeListings} active listings` },
    { id: "listings", icon: FileSpreadsheet, label: "Active Listings", value: fmt(activeListings), note: `${pct(activeListings, totalProperties)}% of total` },
    { id: "leads", icon: Users, label: "Total Inquiries", value: fmt(newLeads || totalInquiries), note: `${conversions} converted` },
    { id: "visits", icon: Eye, label: "Total Views", value: fmt(totalViews), note: "Across all listings" },
    { id: "pending", icon: Target, label: "Pending Review", value: fmt(pendingCount), note: `${draftCount} in draft` },
    { id: "team", icon: TrendingUp, label: "Team Members", value: fmt(data.users.length), note: `${teamMembers.length} sales roles` },
  ];

  // Team directory filter
  const filteredMembers = useMemo(() => {
    return data.users.filter((m) => {
      const role = m.roleName?.toLowerCase() || "";
      const city = (m.city || "").toLowerCase();
      const state = (m.state || "").toLowerCase();
      const status = m.isActive !== false ? "active" : "inactive";
      const matchRole = dirRole === "All roles" || role === dirRole.toLowerCase().replace(/ /g, "_");
      const matchCity = dirCity === "All Cities" || city === dirCity.toLowerCase();
      const matchState = dirState === "All States" || state === dirState.toLowerCase();
      const matchStatus = dirStatus === "All Statuses" || status === dirStatus.toLowerCase();
      const q = dirSearch.toLowerCase().trim();
      const matchSearch =
        !q ||
        (m.name || "").toLowerCase().includes(q) ||
        (m.email || "").toLowerCase().includes(q) ||
        role.includes(q) ||
        city.includes(q);
      return matchRole && matchCity && matchState && matchStatus && matchSearch;
    });
  }, [data.users, dirRole, dirCity, dirState, dirStatus, dirSearch]);

  // Unique cities and states for filters
  const allCities = useMemo(() => [...new Set(data.users.map((u) => u.city).filter(isKnown))].sort(), [data.users]);
  const allStates = useMemo(() => [...new Set(data.users.map((u) => u.state).filter(isKnown))].sort(), [data.users]);

  // Export
  const handleExportExcel = () => {
    try {
      const wb = XLSX.utils.book_new();
      const ws1 = XLSX.utils.json_to_sheet(cityRows.map((r) => ({ City: r.city, "Total Properties": r.total })));
      XLSX.utils.book_append_sheet(wb, ws1, "City Performance");
      const ws2 = XLSX.utils.json_to_sheet(leaderboard.map((r) => ({ Name: r.name, Role: r.role, City: r.city })));
      XLSX.utils.book_append_sheet(wb, ws2, "Team Members");
      XLSX.writeFile(wb, `Regional_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
      triggerToast("Excel exported successfully");
    } catch {
      triggerToast("Failed to export Excel");
    }
  };

  // ─── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-3">
          <LoadingSpinner size="lg" />
          <p className="text-sm font-semibold text-slate-500">Loading Regional Dashboard…</p>
        </div>
      </div>
    );
  }

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased flex flex-col">
      {/* TOAST */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-2xl border border-slate-800"
          >
            <Sparkles className="h-4 w-4 text-emerald-400" />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* INNER SCROLL AREA */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-6">

        {/* ── HEADER ─────────────────────────────────────────────────────────── */}
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-slate-200/80 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 border border-emerald-200">
                <ShieldCheck size={13} className="text-emerald-600" />
                REGIONAL OPERATIONS HUB
              </span>
              <span className="text-xs text-slate-400">
                {data.currentUser?.state ? `• ${data.currentUser.state}` : "• All Regions"}
              </span>
            </div>
            <h1 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
              {activeTab === "reports"
                ? "Regional Reports"
                : activeTab === "directory"
                ? "Team Directory"
                : "Regional Performance Dashboard"}
            </h1>
            <p className="mt-0.5 text-xs sm:text-sm text-slate-500">
              {activeTab === "reports"
                ? "Analyze performance and export reports for your assigned region."
                : activeTab === "directory"
                ? "Select a role and location to find the right team member."
                : "Track properties, inventory and team performance across your region."}
            </p>
          </div>

          {/* Tabs + user chip */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center rounded-xl bg-white p-1 shadow-sm border border-slate-200 text-xs font-bold">
              {[
                { id: "overview", icon: BarChart3, label: "Performance Overview" },
                { id: "directory", icon: Users, label: "Team Directory" },
                { id: "reports", icon: FileSpreadsheet, label: "Regional Reports" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all ${
                    activeTab === t.id
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <t.icon size={14} />
                  {t.label}
                </button>
              ))}
            </div>

            {/* User chip */}
            {data.currentUser && (
              <div className="hidden sm:flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 shadow-sm">
                <div className="relative">
                  <div className="grid h-8 w-8 place-items-center rounded-full bg-emerald-600 font-bold text-white text-xs">
                    {(data.currentUser.name || data.currentUser.email || "R")
                      .slice(0, 1)
                      .toUpperCase()}
                  </div>
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                </div>
                <div className="text-left leading-tight">
                  <div className="text-xs font-bold text-slate-900">
                    {data.currentUser.name || data.currentUser.email?.split("@")[0] || "Manager"}
                  </div>
                  <div className="text-[10px] font-semibold text-slate-400">Regional Manager</div>
                </div>
                <ChevronDown size={14} className="text-slate-400" />
              </div>
            )}

            {/* Refresh */}
            <button
              onClick={() => loadData(true)}
              className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50"
            >
              <RefreshCw size={15} className={isRefreshing ? "animate-spin text-emerald-600" : ""} />
            </button>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/*  TAB: PERFORMANCE OVERVIEW                                         */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === "overview" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-5"
          >
            {/* Filter bar */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm">
                  <CalendarDays size={14} className="text-slate-500" />
                  <span>
                    {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                  </span>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm">
                  <MapPin size={14} className="text-slate-500" />
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="bg-transparent focus:outline-none cursor-pointer"
                  >
                    <option value="All Cities">All Cities</option>
                    {allCities.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* 6 KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {overviewKPIs.map((m) => {
                const Icon = m.icon;
                return (
                  <div key={m.id} className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-semibold text-slate-500">{m.label}</p>
                        <p className="mt-1 text-2xl font-black text-slate-950">{m.value}</p>
                      </div>
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                        <Icon size={20} />
                      </span>
                    </div>
                    <p className="mt-3 text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                      <ArrowUp size={12} className="stroke-[3]" />
                      <span>{m.note}</span>
                    </p>
                  </div>
                );
              })}
            </div>

            {/* 3-column charts row */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
              {/* Sales Funnel */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm flex flex-col">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h2 className="text-xs font-black uppercase text-slate-900 tracking-wider">Regional Sales Funnel</h2>
                  <span className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold text-slate-600">Live Data</span>
                </div>
                <div className="mt-4 space-y-2.5 flex-1">
                  {FUNNEL_LABELS.map((label, i) => (
                    <div key={label} className="flex items-center gap-2 text-xs">
                      <div className="h-7 rounded bg-emerald-50 overflow-hidden flex-1">
                        <div className={`h-full ${FUNNEL_BG[i]} rounded ${FUNNEL_WIDTHS[i]}`} />
                      </div>
                      <span className="w-24 font-bold text-slate-800">{label}</span>
                      <span className="font-extrabold text-slate-900 min-w-[60px]">
                        {fmt(funnelCounts[i])}{" "}
                        <i className="font-normal text-slate-400 text-[10px]">
                          ({funnelCounts[0] > 0 ? pct(funnelCounts[i], funnelCounts[0]) : 0}%)
                        </i>
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-xs text-slate-500 flex items-center gap-1.5">
                  <Activity size={14} className="text-emerald-600" />
                  <span>Overall conversion rate: <b className="text-emerald-600 font-extrabold">{conversionRate}%</b></span>
                </div>
              </div>

              {/* Monthly Listings Trend */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm flex flex-col">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h2 className="text-xs font-black uppercase text-slate-900 tracking-wider">Monthly Listings Trend</h2>
                  <span className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold text-slate-600">This Year</span>
                </div>
                <div className="mt-3 flex-1 min-h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#64748B" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: "#64748B" }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: "#0F172A", borderRadius: "8px", color: "#fff", fontSize: "11px" }} />
                      <Line type="monotone" dataKey="listings" stroke="#10B981" strokeWidth={3} dot={{ fill: "#10B981", r: 4, stroke: "#FFFFFF", strokeWidth: 2 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-xs flex items-center justify-between">
                  <span>Active Listings: <b className="text-emerald-600 font-extrabold">{fmt(activeListings)}</b></span>
                  <span className="font-bold text-slate-500">Pending: {fmt(pendingCount)}</span>
                </div>
              </div>

              {/* City Performance */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm flex flex-col">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h2 className="text-xs font-black uppercase text-slate-900 tracking-wider">City Performance</h2>
                  <span className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold text-slate-600">By Properties</span>
                </div>
                {cityRows.length > 0 ? (
                  <div className="mt-4 space-y-4 flex-1">
                    {cityRows.map((c) => (
                      <div key={c.city} className="flex items-center gap-3 text-xs">
                        <span className="w-24 font-bold text-slate-800 truncate">{c.city}</span>
                        <div className="flex-1 h-2 rounded bg-slate-100 overflow-hidden">
                          <div className="h-full bg-emerald-600 rounded transition-all duration-500" style={{ width: `${c.pct}%` }} />
                        </div>
                        <span className="font-black text-slate-900 min-w-[32px] text-right">{fmt(c.total)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-xs text-slate-400 italic mt-4">
                    No city data available
                  </div>
                )}
                <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-xs text-slate-500">
                  {cityRows[0]
                    ? <>Top City: <b className="text-emerald-600 font-extrabold">{cityRows[0].city}</b> ({cityRows[0].pct}% of total)</>
                    : "No city breakdown available"}
                </div>
              </div>
            </div>

            {/* Bottom 2-column row */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
              {/* Team Leaderboard */}
              <div className="xl:col-span-6 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm flex flex-col">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h2 className="text-xs font-black uppercase text-slate-900 tracking-wider">Team Leaderboard</h2>
                  <span className="text-xs font-bold text-emerald-600">{teamMembers.length} sales members</span>
                </div>
                {leaderboard.length > 0 ? (
                  <div className="mt-3 overflow-x-auto flex-1">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 text-[10px] font-bold uppercase text-slate-400">
                          <th className="py-2">Rank</th>
                          <th className="py-2">Name</th>
                          <th className="py-2">Role</th>
                          <th className="py-2 text-center">City</th>
                          <th className="py-2 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-[11px]">
                        {leaderboard.map((l) => (
                          <tr key={l.name} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-2.5 font-black text-amber-500">
                              <Star size={12} className="fill-amber-400 text-amber-400 inline" />
                            </td>
                            <td className="py-2.5">
                              <div className="flex items-center gap-2">
                                <span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-800">
                                  {l.avatar}
                                </span>
                                <div>
                                  <div className="font-bold text-slate-900">{l.name}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-2.5 text-slate-500 capitalize">{l.role}</td>
                            <td className="py-2.5 text-center text-slate-600">{l.city}</td>
                            <td className="py-2.5 text-right">
                              <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${l.status === "Active" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500"}`}>
                                {l.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-xs text-slate-400 italic mt-4">
                    No team members found
                  </div>
                )}
                <div className="mt-3 pt-2 text-center">
                  <button onClick={() => setActiveTab("directory")} className="text-xs font-bold text-emerald-600 hover:underline">
                    View All Team Members →
                  </button>
                </div>
              </div>

              {/* Alerts & Tasks */}
              <div className="xl:col-span-6 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm flex flex-col">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h2 className="text-xs font-black uppercase text-slate-900 tracking-wider">Alerts & Tasks</h2>
                  <button onClick={() => triggerToast("Showing all alerts...")} className="text-xs font-bold text-emerald-600 hover:underline">
                    View All
                  </button>
                </div>
                <div className="mt-3 space-y-2.5 flex-1">
                  {/* Dynamic alert: inactive listings */}
                  {pendingCount > 0 && (
                    <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-amber-50/40 p-2.5 text-xs">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-600">
                        <AlertTriangle size={16} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-bold text-slate-900">{fmt(pendingCount)} properties pending review</p>
                        <p className="text-[10px] text-slate-400">Take action to improve visibility and engagement.</p>
                      </div>
                      <span className="text-[10px] text-slate-400 font-semibold">Now</span>
                      <button
                        onClick={() => triggerToast("Opening pending properties...")}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-[11px] font-bold text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all"
                      >
                        Review
                      </button>
                    </div>
                  )}
                  {ALERTS_STATIC.slice(1).map((a) => {
                    const Icon = a.icon;
                    return (
                      <div key={a.id} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-2.5 text-xs">
                        <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl ${a.color}`}>
                          <Icon size={16} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-bold text-slate-900">{a.text}</p>
                          <p className="text-[10px] text-slate-400">{a.note}</p>
                        </div>
                        <span className="text-[10px] text-slate-400 font-semibold">{a.time}</span>
                        <button
                          onClick={() => triggerToast(`Action: ${a.action}`)}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-[11px] font-bold text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all"
                        >
                          {a.action}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Property status summary row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "Active Properties", value: fmt(activeListings), color: "bg-emerald-500", bg: "bg-emerald-50", text: "text-emerald-700", icon: CheckCircle2 },
                { label: "Pending Review", value: fmt(pendingCount), color: "bg-amber-500", bg: "bg-amber-50", text: "text-amber-700", icon: Clock3 },
                { label: "Draft Listings", value: fmt(draftCount), color: "bg-blue-500", bg: "bg-blue-50", text: "text-blue-700", icon: FileSpreadsheet },
              ].map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className={`rounded-2xl border border-slate-200/90 ${s.bg} p-4 shadow-sm flex items-center gap-4`}>
                    <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${s.color} text-white`}>
                      <Icon size={20} />
                    </span>
                    <div>
                      <p className={`text-2xl font-black ${s.text}`}>{s.value}</p>
                      <p className="text-xs font-semibold text-slate-600 mt-0.5">{s.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/*  TAB: REGIONAL REPORTS                                              */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === "reports" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-5"
          >
            {/* Filter bar */}
            <div className="flex flex-wrap items-center gap-2.5 rounded-2xl border border-slate-200/90 bg-white p-3 shadow-sm">
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700">
                <CalendarDays size={14} className="text-slate-500" />
                <span>{new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700">
                <MapPin size={14} className="text-slate-500" />
                <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} className="bg-transparent focus:outline-none">
                  <option value="All Cities">All Cities</option>
                  {allCities.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <button
                onClick={() => loadData(true)}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-5 py-2 text-xs font-bold text-white shadow-sm transition-all ml-auto"
              >
                <RefreshCw size={13} className={isRefreshing ? "animate-spin" : ""} />
                Refresh Data
              </button>
            </div>

            {/* Top 4 KPI cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Total Properties", value: fmt(totalProperties), note: `${activeListings} active`, icon: Building2, isUp: true },
                { label: "Active Listings", value: fmt(activeListings), note: `${pct(activeListings, totalProperties)}% of total`, icon: FileSpreadsheet, isUp: true },
                { label: "Total Inquiries", value: fmt(totalInquiries), note: `${conversions} converted`, icon: Users, isUp: true },
                { label: "Avg Conversion", value: `${conversionRate}%`, note: "Lead to sale rate", icon: Target, isUp: Number(conversionRate) > 10 },
              ].map((m) => {
                const Icon = m.icon;
                return (
                  <div key={m.label} className="rounded-2xl border border-slate-200/90 bg-white p-4.5 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-start gap-3">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
                        <Icon size={21} />
                      </span>
                      <div>
                        <p className="text-xs font-semibold text-slate-500">{m.label}</p>
                        <p className="mt-1 text-2xl font-black text-slate-950">{m.value}</p>
                      </div>
                    </div>
                    <div className={`mt-3 flex items-center gap-1 text-[11px] font-bold ${m.isUp ? "text-emerald-600" : "text-rose-500"}`}>
                      {m.isUp ? <ArrowUp size={13} className="stroke-[3]" /> : <ArrowDown size={13} className="stroke-[3]" />}
                      <span>{m.note}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sub-nav tabs */}
            <div className="flex border-b border-slate-200 text-xs font-bold text-slate-500 gap-6">
              {[
                { id: "sales", label: "Property Analytics" },
                { id: "leads", label: "Lead Analytics" },
                { id: "inventory", label: "Inventory" },
                { id: "team", label: "Team Performance" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setReportsSubTab(tab.id)}
                  className={`py-3 transition-all ${reportsSubTab === tab.id ? "border-b-2 border-emerald-600 text-emerald-700 font-extrabold" : "hover:text-slate-900"}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Middle 3-column grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
              {/* Property status bar chart */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm flex flex-col">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h2 className="text-xs font-black uppercase text-slate-900 tracking-wider">Property Status</h2>
                  <span className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold text-slate-600">Live</span>
                </div>
                <div className="mt-3 flex-1 min-h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: "Active", value: activeListings },
                        { name: "Pending", value: pendingCount },
                        { name: "Draft", value: draftCount },
                        { name: "Inquiries", value: totalInquiries },
                        { name: "Views", value: totalViews },
                      ]}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748B" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: "#64748B" }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: "#0F172A", borderRadius: "8px", color: "#fff", fontSize: "11px" }} />
                      <Bar dataKey="value" fill="#10B981" radius={[4, 4, 0, 0]} barSize={28}>
                        {["#10B981", "#F59E0B", "#3B82F6", "#8B5CF6", "#64748B"].map((color, i) => (
                          <Cell key={i} fill={color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50/80 p-2.5 flex items-center gap-1.5 text-[11px] font-bold text-emerald-600">
                  <ArrowUp size={13} className="stroke-[3]" />
                  <span>Total Inventory: {fmt(totalProperties)}</span>
                </div>
              </div>

              {/* City breakdown donut */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm flex flex-col">
                <div className="pb-3 border-b border-slate-100">
                  <h2 className="text-xs font-black uppercase text-slate-900 tracking-wider">City Distribution</h2>
                </div>
                {cityRows.length > 0 ? (
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 items-center gap-3 flex-1">
                    <div className="relative h-44 w-full flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={cityRows.map((c) => ({ name: c.city, value: c.total }))}
                            dataKey="value"
                            innerRadius={48}
                            outerRadius={70}
                            paddingAngle={3}
                          >
                            {cityRows.map((_, i) => (
                              <Cell key={i} fill={["#10B981", "#34D399", "#60A5FA", "#CBD5E1", "#A78BFA"][i % 5]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Total</span>
                        <span className="text-base font-black text-slate-900">{fmt(totalProperties)}</span>
                      </div>
                    </div>
                    <div className="space-y-2.5 text-xs">
                      {cityRows.map((c, i) => (
                        <div key={c.city} className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: ["#10B981", "#34D399", "#60A5FA", "#CBD5E1", "#A78BFA"][i % 5] }} />
                            <span className="font-semibold text-slate-700 truncate max-w-[80px]">{c.city}</span>
                          </div>
                          <span className="font-bold text-slate-900">{fmt(c.total)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-xs text-slate-400 italic">
                    No city data available
                  </div>
                )}
              </div>

              {/* Property status table */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm flex flex-col">
                <div className="pb-3 border-b border-slate-100">
                  <h2 className="text-xs font-black uppercase text-slate-900 tracking-wider">Property Status by City</h2>
                </div>
                <div className="mt-3 overflow-x-auto flex-1">
                  {cityRows.length > 0 ? (
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400">
                          <th className="py-2">City</th>
                          <th className="py-2 text-right">Properties</th>
                          <th className="py-2 text-right">Share</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-[11px]">
                        {cityRows.map((row) => (
                          <tr key={row.city}>
                            <td className="py-2 font-bold text-slate-800">{row.city}</td>
                            <td className="py-2 text-right text-slate-600">{fmt(row.total)}</td>
                            <td className="py-2 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <span className="font-semibold text-slate-600">{pct(row.total, totalProperties)}%</span>
                                <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${row.pct}%` }} />
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))}
                        <tr className="font-extrabold text-emerald-600 bg-emerald-50/50">
                          <td className="py-2.5 pl-1">Total</td>
                          <td className="py-2.5 text-right">{fmt(totalProperties)}</td>
                          <td className="py-2.5 text-right">100%</td>
                        </tr>
                      </tbody>
                    </table>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-xs text-slate-400 italic">
                      No city data available
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom row */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
              {/* Team rankings */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm flex flex-col">
                <div className="pb-3 border-b border-slate-100">
                  <h2 className="text-xs font-black uppercase text-slate-900 tracking-wider">Team Performance Ranking</h2>
                </div>
                <div className="mt-3 overflow-x-auto flex-1">
                  {leaderboard.length > 0 ? (
                    <table className="w-full text-left text-[11px]">
                      <thead>
                        <tr className="border-b border-slate-100 text-[9px] font-bold uppercase text-slate-400">
                          <th className="py-2">Rank</th>
                          <th className="py-2">Member</th>
                          <th className="py-2">City</th>
                          <th className="py-2 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {leaderboard.map((row) => (
                          <tr key={row.name}>
                            <td className="py-2.5 font-black text-amber-500">
                              <Star size={12} className="fill-amber-400 text-amber-400 inline" />
                            </td>
                            <td className="py-2.5">
                              <div className="flex items-center gap-2">
                                <span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-800">
                                  {row.avatar}
                                </span>
                                <div>
                                  <div className="font-bold text-slate-900">{row.name}</div>
                                  <div className="text-[9px] text-slate-400 capitalize">{row.role}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-2.5 text-slate-600">{row.city}</td>
                            <td className="py-2.5 text-right">
                              <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${row.status === "Active" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500"}`}>
                                {row.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-xs text-slate-400 italic mt-4">
                      No team data available
                    </div>
                  )}
                </div>
                <div className="mt-3 pt-2 text-center">
                  <button onClick={() => setActiveTab("directory")} className="text-xs font-bold text-emerald-600 hover:underline">
                    View All Team Members →
                  </button>
                </div>
              </div>

              {/* Inventory summary */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm flex flex-col">
                <div className="pb-3 border-b border-slate-100">
                  <h2 className="text-xs font-black uppercase text-slate-900 tracking-wider">Inventory Health</h2>
                </div>
                <div className="mt-3 space-y-3 flex-1">
                  {[
                    { label: "Active Listings", value: activeListings, total: totalProperties, color: "#10B981" },
                    { label: "Pending Review", value: pendingCount, total: totalProperties, color: "#F59E0B" },
                    { label: "Draft Listings", value: draftCount, total: totalProperties, color: "#3B82F6" },
                  ].map((item) => (
                    <div key={item.label} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-700">{item.label}</span>
                        <span className="font-bold text-slate-900">{fmt(item.value)} <span className="text-slate-400 font-normal">({pct(item.value, item.total)}%)</span></span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct(item.value, item.total)}%`, backgroundColor: item.color }} />
                      </div>
                    </div>
                  ))}
                  <div className="mt-2 pt-3 border-t border-slate-100 text-xs flex items-center justify-between">
                    <span className="text-slate-500">Total Inventory</span>
                    <span className="font-black text-slate-900 text-base">{fmt(totalProperties)}</span>
                  </div>
                  <div className="text-xs flex items-center justify-between">
                    <span className="text-slate-500">Total Views</span>
                    <span className="font-bold text-emerald-600">{fmt(totalViews)}</span>
                  </div>
                  <div className="text-xs flex items-center justify-between">
                    <span className="text-slate-500">Team Size</span>
                    <span className="font-bold text-slate-700">{data.users.length} members</span>
                  </div>
                </div>
              </div>

              {/* Alerts panel */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm flex flex-col">
                <div className="pb-3 border-b border-slate-100">
                  <h2 className="text-xs font-black uppercase text-slate-900 tracking-wider">Regional Insights</h2>
                </div>
                <div className="mt-3 space-y-2.5 flex-1">
                  {[
                    { icon: Activity, text: `${fmt(activeListings)} properties are currently active.`, note: "Keep momentum for better visibility.", color: "bg-emerald-50 text-emerald-600" },
                    { icon: Users, text: `${data.users.length} team members in your region.`, note: "Coordinate tasks for higher conversion.", color: "bg-blue-50 text-blue-600" },
                    { icon: Clock3, text: `${fmt(pendingCount)} listings awaiting approval.`, note: "Review and approve to go live.", color: "bg-amber-50 text-amber-600" },
                    { icon: Building2, text: cityRows[0] ? `${cityRows[0].city} leads with ${fmt(cityRows[0].total)} properties.` : "City breakdown available after data sync.", note: "Focus expansion on high-performing cities.", color: "bg-purple-50 text-purple-600" },
                  ].map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <div key={idx} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3 text-xs">
                        <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl font-bold ${item.color}`}>
                          <Icon size={16} />
                        </span>
                        <div>
                          <p className="font-bold text-slate-900">{item.text}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">{item.note}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Export actions */}
            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                onClick={() => { window.print(); triggerToast("Opening print for PDF export..."); }}
                className="flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-5 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-all shadow-sm"
              >
                <Download size={15} />
                Export PDF
              </button>
              <button
                onClick={handleExportExcel}
                className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-5 py-2.5 text-xs font-bold text-emerald-700 hover:bg-emerald-50 transition-all shadow-sm"
              >
                <FileSpreadsheet size={15} />
                Export Excel
              </button>
            </div>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/*  TAB: TEAM DIRECTORY                                                */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === "directory" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-5"
          >
            {/* Header card */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">Operations</div>
                  <h2 className="text-2xl font-black tracking-tight text-slate-950">Team Directory</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Select a role and location to find the right team member.</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700">
                    {[...new Set(data.users.map((u) => u.roleName).filter(Boolean))].length} roles
                  </span>
                  <span className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700">
                    {data.users.length} members
                  </span>
                  <span className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                    {data.users.filter((u) => u.isActive !== false).length} active
                  </span>
                  <button onClick={() => loadData(true)} className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50">
                    <RefreshCw size={15} className={isRefreshing ? "animate-spin text-emerald-600" : ""} />
                  </button>
                </div>
              </div>

              {/* Filter matrix */}
              <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50/70 p-4 space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">ROLE</label>
                    <select value={dirRole} onChange={(e) => setDirRole(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-bold text-slate-700 focus:outline-none">
                      <option value="All roles">All roles</option>
                      {[...new Set(data.users.map((u) => u.roleName).filter(Boolean))].sort().map((r) => (
                        <option key={r} value={r}>{r.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">STATE</label>
                    <select value={dirState} onChange={(e) => setDirState(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-bold text-slate-700 focus:outline-none">
                      <option value="All States">All States</option>
                      {allStates.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">CITY</label>
                    <select value={dirCity} onChange={(e) => setDirCity(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-bold text-slate-700 focus:outline-none">
                      <option value="All Cities">All Cities</option>
                      {allCities.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">STATUS</label>
                    <select value={dirStatus} onChange={(e) => setDirStatus(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-bold text-slate-700 focus:outline-none">
                      <option value="All Statuses">All Statuses</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-start pt-1">
                  <button
                    onClick={() => { setDirRole("All roles"); setDirState("All States"); setDirCity("All Cities"); setDirStatus("All Statuses"); setDirSearch(""); triggerToast("Filters cleared"); }}
                    className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-4 py-1.5 rounded-lg"
                  >
                    <X size={13} /> Clear
                  </button>
                </div>
              </div>

              {/* Search */}
              <div className="mt-4 relative">
                <Search size={16} className="absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search name, email, role or city…"
                  value={dirSearch}
                  onChange={(e) => setDirSearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:outline-none shadow-sm"
                />
              </div>
            </div>

            {/* View toggle */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">All Team Members</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-semibold">Showing {filteredMembers.length} of {data.users.length}</span>
                <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-bold">
                  <button onClick={() => setDirViewMode("cards")} className={`flex items-center gap-1 rounded-lg px-3 py-1 ${dirViewMode === "cards" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-600"}`}>
                    <Grid size={13} /> Cards
                  </button>
                  <button onClick={() => setDirViewMode("table")} className={`flex items-center gap-1 rounded-lg px-3 py-1 ${dirViewMode === "table" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-600"}`}>
                    <List size={13} /> Table
                  </button>
                </div>
              </div>
            </div>

            {/* Members display */}
            {filteredMembers.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-400 shadow-sm">
                No team members match your filters.
              </div>
            ) : dirViewMode === "cards" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredMembers.map((m) => {
                  const name = m.name || m.fullName || m.email || "Team Member";
                  const role = (m.roleName || "").replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
                  const isActive = m.isActive !== false;
                  return (
                    <div key={m._id || m.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-all">
                      <div className="flex items-start gap-3">
                        <div className="relative">
                          <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-100 text-emerald-800 font-black text-sm">
                            {name.slice(0, 2).toUpperCase()}
                          </div>
                          <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-white ${isActive ? "bg-emerald-500" : "bg-slate-300"}`} />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-slate-900 text-sm truncate">{name}</h3>
                          <span className="inline-block mt-0.5 rounded bg-emerald-50 px-2 py-0.5 text-[9px] font-extrabold uppercase text-emerald-700 border border-emerald-200">
                            {role || "Member"}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-slate-100 text-xs space-y-1 text-slate-500">
                        {m.email && <p className="truncate">📧 <b className="text-slate-700">{m.email}</b></p>}
                        {m.phone && <p>📞 <b className="text-slate-700">{m.phone}</b></p>}
                        {m.city && <p>📍 <b className="text-slate-700">{m.city}{m.state ? `, ${m.state}` : ""}</b></p>}
                        <p>Status: <b className={isActive ? "text-emerald-600" : "text-slate-400"}>{isActive ? "Active" : "Inactive"}</b></p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-bold uppercase text-slate-400">
                      <th className="py-2.5">Member</th>
                      <th className="py-2.5">Role</th>
                      <th className="py-2.5">Email</th>
                      <th className="py-2.5">Location</th>
                      <th className="py-2.5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredMembers.map((m) => {
                      const name = m.name || m.fullName || m.email || "Team Member";
                      const role = (m.roleName || "").replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
                      const isActive = m.isActive !== false;
                      return (
                        <tr key={m._id || m.id} className="hover:bg-slate-50/60">
                          <td className="py-2.5">
                            <div className="flex items-center gap-2">
                              <span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-800">
                                {name.slice(0, 2).toUpperCase()}
                              </span>
                              <span className="font-bold text-slate-900">{name}</span>
                            </div>
                          </td>
                          <td className="py-2.5 text-slate-600 capitalize">{role}</td>
                          <td className="py-2.5 text-slate-500 max-w-[140px] truncate">{m.email || "—"}</td>
                          <td className="py-2.5 text-slate-600">{[m.city, m.state].filter(Boolean).join(", ") || "—"}</td>
                          <td className="py-2.5 text-right">
                            <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                              {isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

      </div>{/* end scroll area */}
    </div>
  );
}
