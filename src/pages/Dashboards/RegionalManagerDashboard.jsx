import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUp,
  BarChart3,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Download,
  Eye,
  FileSpreadsheet,
  Filter,
  ListFilter,
  MapPin,
  RefreshCw,
  Search,
  ShieldCheck,
  Target,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import * as XLSX from "xlsx";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import {
  isKnown,
  useRegionalManagerDashboard,
} from "./regionalManagerDashboard/useRegionalManagerDashboard";

const fmt = (v) => Number(v || 0).toLocaleString("en-IN");
const pct = (part, total) => (total > 0 ? ((part / total) * 100).toFixed(1) : "0.0");
const cleanRole = (value = "") =>
  String(value || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());

const TABS = [
  { id: "overview", icon: BarChart3, label: "Performance Overview" },
  { id: "directory", icon: Users, label: "Team Directory" },
  { id: "reports", icon: FileSpreadsheet, label: "Regional Reports" },
];

const CITY_COLORS = ["#059669", "#10b981", "#34d399", "#6ee7b7", "#a7f3d0", "#94a3b8"];

const DATE_PRESETS = [
  { id: "all", label: "All time" },
  { id: "today", label: "Today" },
  { id: "7d", label: "Last 7 days" },
  { id: "30d", label: "Last 30 days" },
  { id: "month", label: "This month" },
  { id: "custom", label: "Custom date" },
];

function formatFilterDateLabel(dash) {
  if (dash.datePreset === "all") return "All time";
  if (dash.datePreset === "custom") {
    if (dash.customFrom && dash.customTo) {
      return `${dash.customFrom} → ${dash.customTo}`;
    }
    return "Custom date";
  }
  const preset = DATE_PRESETS.find((p) => p.id === dash.datePreset);
  return preset?.label || "All time";
}

function KpiCard({ label, value, note, icon: Icon, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group rounded-2xl border border-slate-200/90 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-500">{label}</p>
          <p className="mt-1.5 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
            {value}
          </p>
        </div>
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 transition group-hover:bg-emerald-100">
          <Icon size={20} />
        </span>
      </div>
      <p className="mt-3 flex items-center gap-1 text-[11px] font-bold text-emerald-600">
        <ArrowUp size={12} className="stroke-[3]" />
        <span className="truncate">{note}</span>
      </p>
    </button>
  );
}

export default function RegionalManagerDashboard({ reportMode = false }) {
  const dash = useRegionalManagerDashboard();
  const [activeTab, setActiveTab] = useState(reportMode ? "reports" : "overview");
  const [dirRole, setDirRole] = useState("All roles");
  const [dirCity, setDirCity] = useState("All Cities");
  const [dirState, setDirState] = useState("All States");
  const [dirStatus, setDirStatus] = useState("All Statuses");
  const [dirSearch, setDirSearch] = useState("");
  const [dirViewMode, setDirViewMode] = useState("cards");

  const m = dash.metrics;

  const overviewKPIs = useMemo(
    () => [
      {
        id: "properties",
        icon: Building2,
        label: "Total Properties",
        value: fmt(m.totalProperties),
        note: `${fmt(m.activeListings)} active listings`,
      },
      {
        id: "active",
        icon: FileSpreadsheet,
        label: "Active Listings",
        value: fmt(m.activeListings),
        note: `${pct(m.activeListings, m.totalProperties)}% of total`,
      },
      {
        id: "inquiries",
        icon: Users,
        label: "Total Inquiries",
        value: fmt(m.totalInquiries),
        note:
          m.conversions > 0
            ? `${fmt(m.conversions)} converted`
            : `${fmt(m.totalClicks)} clicks`,
      },
      {
        id: "views",
        icon: Eye,
        label: "Total Views",
        value: fmt(m.totalViews),
        note: "Across all listings",
      },
      {
        id: "pending",
        icon: Target,
        label: "Pending Review",
        value: fmt(m.pendingCount),
        note: `${fmt(m.draftCount)} in draft`,
      },
      {
        id: "team",
        icon: TrendingUp,
        label: "Team Members",
        value: fmt(dash.teamMembers.length || dash.data.users.length),
        note: `${fmt(dash.teamMembers.filter((u) => u.isActive !== false).length)} sales roles`,
        tab: "directory",
      },
    ],
    [dash.data.users.length, dash.teamMembers, m],
  );

  const statusChart = useMemo(
    () => [
      { name: "Active", value: m.activeListings, fill: "#059669" },
      { name: "Pending", value: m.pendingCount, fill: "#d97706" },
      { name: "Draft", value: m.draftCount, fill: "#2563eb" },
      { name: "Views", value: m.totalViews, fill: "#64748b" },
      { name: "Inquiries", value: m.totalInquiries, fill: "#7c3aed" },
    ],
    [m],
  );

  const filteredMembers = useMemo(() => {
    return dash.data.users.filter((member) => {
      const role = String(member.roleName || "").toLowerCase();
      const city = String(member.city || "").toLowerCase();
      const state = String(member.state || "").toLowerCase();
      const status = member.isActive !== false ? "active" : "inactive";
      const matchRole =
        dirRole === "All roles" || role === dirRole.toLowerCase().replace(/ /g, "_");
      const matchCity = dirCity === "All Cities" || city === dirCity.toLowerCase();
      const matchState = dirState === "All States" || state === dirState.toLowerCase();
      const matchStatus =
        dirStatus === "All Statuses" || status === dirStatus.toLowerCase();
      const q = dirSearch.trim().toLowerCase();
      const matchSearch =
        !q ||
        String(member.name || "")
          .toLowerCase()
          .includes(q) ||
        String(member.email || "")
          .toLowerCase()
          .includes(q) ||
        role.includes(q) ||
        city.includes(q);
      return matchRole && matchCity && matchState && matchStatus && matchSearch;
    });
  }, [dash.data.users, dirCity, dirRole, dirSearch, dirState, dirStatus]);

  const handleExportExcel = () => {
    try {
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.json_to_sheet(
          dash.cityRows.map((r) => ({
            City: r.city,
            Properties: r.total,
            Active: r.active,
          })),
        ),
        "City Performance",
      );
      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.json_to_sheet(
          dash.teamMembers.map((u) => ({
            Name: u.name || "",
            Role: cleanRole(u.roleName),
            City: u.city || "",
            Email: u.email || "",
            Status: u.isActive !== false ? "Active" : "Inactive",
          })),
        ),
        "Team Members",
      );
      XLSX.writeFile(
        wb,
        `Regional_Report_${dash.regionLabel.replace(/\s+/g, "_")}_${new Date()
          .toISOString()
          .slice(0, 10)}.xlsx`,
      );
      dash.triggerToast("Excel exported");
    } catch {
      dash.triggerToast("Excel export failed");
    }
  };

  if (dash.loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#F4F7F5]">
        <div className="flex flex-col items-center gap-3">
          <LoadingSpinner size="lg" />
          <p className="text-sm font-semibold text-slate-500">Loading regional dashboard…</p>
        </div>
      </div>
    );
  }

  const user = dash.currentUser;

  return (
    <div className="min-h-screen bg-[#F4F7F5] font-sans text-slate-900 antialiased">
      <AnimatePresence>
        {dash.toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="fixed right-4 top-4 z-50 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-xl"
          >
            {dash.toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mx-auto max-w-[1600px] space-y-5 p-3 sm:p-5 lg:p-6">
        {/* Header */}
        <header className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-white via-white to-emerald-50/40 p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-emerald-700">
                  <ShieldCheck size={13} />
                  Regional Operations Hub
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500">
                  <MapPin size={13} className="text-emerald-600" />
                  {dash.regionLabel}
                  {dash.selectedCity !== "All Cities" ? ` · ${dash.selectedCity}` : ""}
                </span>
              </div>
              <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                {activeTab === "directory"
                  ? "Team Directory"
                  : activeTab === "reports"
                    ? "Regional Reports"
                    : "Regional Performance Dashboard"}
              </h1>
              <p className="mt-1 max-w-2xl text-xs text-slate-500 sm:text-sm">
                {activeTab === "directory"
                  ? "Find sales managers and executives across your assigned region."
                  : activeTab === "reports"
                    ? "Export and analyse live inventory, city mix and team coverage."
                    : "Live property inventory, engagement and team performance for your region."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex flex-wrap items-center rounded-2xl border border-slate-200 bg-white p-1 text-xs font-bold shadow-sm">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 rounded-xl px-3 py-2 transition ${
                      activeTab === tab.id
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <tab.icon size={14} />
                    <span className="hidden md:inline">{tab.label}</span>
                    <span className="md:hidden">
                      {tab.id === "overview" ? "Overview" : tab.id === "directory" ? "Team" : "Reports"}
                    </span>
                  </button>
                ))}
              </div>

              {user && (
                <div className="hidden items-center gap-2.5 rounded-2xl border border-slate-200 bg-white px-3 py-1.5 shadow-sm lg:flex">
                  <div className="relative">
                    <div className="grid h-9 w-9 place-items-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                      {(user.name || user.email || "R").slice(0, 1).toUpperCase()}
                    </div>
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-white" />
                  </div>
                  <div className="leading-tight">
                    <p className="text-xs font-bold text-slate-900">
                      {user.name || user.email?.split("@")[0] || "Manager"}
                    </p>
                    <p className="text-[10px] font-semibold text-slate-400">Regional Manager</p>
                  </div>
                  <ChevronDown size={14} className="text-slate-400" />
                </div>
              )}

              <button
                type="button"
                onClick={() => dash.loadData(true)}
                className="grid h-10 w-10 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50"
                aria-label="Refresh"
              >
                <RefreshCw
                  size={15}
                  className={dash.isRefreshing ? "animate-spin text-emerald-600" : ""}
                />
              </button>
            </div>
          </div>
        </header>

        {/* Overview */}
        {activeTab === "overview" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                    <Filter size={16} />
                  </span>
                  <div>
                    <h2 className="text-sm font-black text-slate-900">Filters</h2>
                    <p className="text-[11px] text-slate-500">
                      Date, city, locality and status drive the KPIs and list below
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {dash.activeFilterCount > 0 && (
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                      {dash.activeFilterCount} active
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={dash.clearFilters}
                    className="rounded-xl border border-slate-200 px-3 py-1.5 text-[11px] font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Clear all
                  </button>
                </div>
              </div>

              <div className="mt-4 grid gap-3 lg:grid-cols-12">
                <div className="lg:col-span-4">
                  <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Date range
                  </p>
                  <label className="inline-flex w-full items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-xs font-bold text-slate-700">
                    <CalendarDays size={14} className="shrink-0 text-slate-500" />
                    <select
                      value={dash.datePreset}
                      onChange={(e) => dash.setDatePreset(e.target.value)}
                      className="w-full bg-transparent outline-none"
                    >
                      {DATE_PRESETS.map((preset) => (
                        <option key={preset.id} value={preset.id}>
                          {preset.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  {dash.datePreset === "custom" && (
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        From
                        <input
                          type="date"
                          value={dash.customFrom}
                          max={dash.customTo || undefined}
                          onChange={(e) => dash.setCustomFrom(e.target.value)}
                          className="mt-1 w-full rounded-xl border border-slate-200 px-2.5 py-2 text-xs font-semibold text-slate-700 outline-none"
                        />
                      </label>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        To
                        <input
                          type="date"
                          value={dash.customTo}
                          min={dash.customFrom || undefined}
                          onChange={(e) => dash.setCustomTo(e.target.value)}
                          className="mt-1 w-full rounded-xl border border-slate-200 px-2.5 py-2 text-xs font-semibold text-slate-700 outline-none"
                        />
                      </label>
                    </div>
                  )}
                </div>

                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 lg:col-span-3">
                  City
                  <span className="mt-1.5 inline-flex w-full items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-xs font-bold normal-case tracking-normal text-slate-700">
                    <MapPin size={14} className="shrink-0 text-slate-500" />
                    <select
                      value={dash.selectedCity}
                      onChange={(e) => {
                        dash.setSelectedCity(e.target.value);
                        dash.setSelectedLocality("All Localities");
                      }}
                      className="w-full bg-transparent outline-none"
                    >
                      <option value="All Cities">All Cities</option>
                      {dash.allCities.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </span>
                </label>

                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 lg:col-span-3">
                  Locality
                  <span className="mt-1.5 inline-flex w-full items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-xs font-bold normal-case tracking-normal text-slate-700">
                    <ListFilter size={14} className="shrink-0 text-slate-500" />
                    <select
                      value={dash.selectedLocality}
                      onChange={(e) => dash.setSelectedLocality(e.target.value)}
                      className="w-full bg-transparent outline-none"
                    >
                      <option value="All Localities">All Localities</option>
                      {dash.allLocalities.map((locality) => (
                        <option key={locality} value={locality}>
                          {locality}
                        </option>
                      ))}
                    </select>
                  </span>
                </label>

                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 lg:col-span-2">
                  Status
                  <select
                    value={dash.selectedStatus}
                    onChange={(e) => dash.setSelectedStatus(e.target.value)}
                    className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-xs font-bold text-slate-700 outline-none"
                  >
                    <option value="All Statuses">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="draft">Draft</option>
                  </select>
                </label>
              </div>

              <p className="mt-3 text-[11px] font-semibold text-slate-400">
                Showing{" "}
                <span className="text-emerald-700">{dash.regionLabel}</span>
                {" · "}
                {formatFilterDateLabel(dash)}
                {dash.selectedCity !== "All Cities" ? ` · ${dash.selectedCity}` : ""}
                {dash.selectedLocality !== "All Localities"
                  ? ` · ${dash.selectedLocality}`
                  : ""}
                {dash.selectedStatus !== "All Statuses"
                  ? ` · ${dash.selectedStatus}`
                  : ""}
              </p>
            </section>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
              {overviewKPIs.map((kpi) => (
                <KpiCard
                  key={kpi.id}
                  {...kpi}
                  onClick={() => kpi.tab && setActiveTab(kpi.tab)}
                />
              ))}
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
              <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm xl:col-span-5 sm:p-5">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div>
                    <h2 className="text-sm font-black text-slate-900">Inventory pulse</h2>
                    <p className="text-[11px] text-slate-500">Live status mix for this region</p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                    Dynamic
                  </span>
                </div>
                <div className="h-[240px] w-full min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statusChart} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f7" />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: 12,
                          border: "1px solid #e2e8f0",
                          fontSize: 11,
                        }}
                      />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={36}>
                        {statusChart.map((entry) => (
                          <Cell key={entry.name} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>

              <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm xl:col-span-4 sm:p-5">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div>
                    <h2 className="text-sm font-black text-slate-900">City performance</h2>
                    <p className="text-[11px] text-slate-500">Properties by city in your state</p>
                  </div>
                </div>
                {dash.cityRows.length ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-[140px_minmax(0,1fr)] sm:items-center">
                    <div className="relative mx-auto h-[150px] w-[150px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={dash.cityRows.map((c) => ({ name: c.city, value: c.total }))}
                            dataKey="value"
                            innerRadius={42}
                            outerRadius={64}
                            paddingAngle={3}
                          >
                            {dash.cityRows.map((_, i) => (
                              <Cell key={i} fill={CITY_COLORS[i % CITY_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
                        <div>
                          <p className="text-[9px] font-bold uppercase text-slate-400">Top</p>
                          <p className="text-sm font-black text-slate-900">
                            {fmt(dash.cityRows[0]?.total)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2.5">
                      {dash.cityRows.slice(0, 5).map((city, i) => (
                        <div key={city.city} className="flex items-center gap-2 text-xs">
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: CITY_COLORS[i % CITY_COLORS.length] }}
                          />
                          <span className="min-w-0 flex-1 truncate font-semibold text-slate-700">
                            {city.city}
                          </span>
                          <span className="font-black text-slate-900">{fmt(city.total)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="grid h-[180px] place-items-center text-xs text-slate-400">
                    No city breakdown for this filter yet
                  </div>
                )}
              </section>

              <section className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-4 shadow-sm xl:col-span-3 sm:p-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700">
                  Region focus
                </p>
                <h2 className="mt-2 text-base font-black text-slate-900">
                  Keep inventory healthy in {dash.regionLabel}
                </h2>
                <ul className="mt-4 space-y-3 text-xs text-slate-600">
                  <li className="flex items-center justify-between gap-2 border-b border-emerald-100 pb-2">
                    <span className="inline-flex items-center gap-1.5">
                      <CheckCircle2 size={14} className="text-emerald-600" /> Active
                    </span>
                    <strong className="text-slate-900">{fmt(m.activeListings)}</strong>
                  </li>
                  <li className="flex items-center justify-between gap-2 border-b border-emerald-100 pb-2">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock3 size={14} className="text-amber-600" /> Pending
                    </span>
                    <strong className="text-amber-700">{fmt(m.pendingCount)}</strong>
                  </li>
                  <li className="flex items-center justify-between gap-2 border-b border-emerald-100 pb-2">
                    <span className="inline-flex items-center gap-1.5">
                      <Eye size={14} className="text-slate-500" /> Views
                    </span>
                    <strong className="text-slate-900">{fmt(m.totalViews)}</strong>
                  </li>
                  <li className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5">
                      <Users size={14} className="text-emerald-600" /> Sales pod
                    </span>
                    <strong className="text-emerald-700">{fmt(dash.teamMembers.length)}</strong>
                  </li>
                </ul>
                <button
                  type="button"
                  onClick={() => setActiveTab("directory")}
                  className="mt-5 w-full rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-700"
                >
                  Open team directory
                </button>
              </section>
            </div>

            <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-black text-slate-900">Filtered inventory list</h2>
                  <p className="text-[11px] text-slate-500">
                    {dash.filteredDetailRows.length} rows for current filters
                    {dash.selectedLocality !== "All Localities" || dash.localityRows.length
                      ? " · by locality"
                      : " · by city"}
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">
                  {formatFilterDateLabel(dash)}
                </span>
              </div>

              {dash.filteredDetailRows.length ? (
                <div className="overflow-hidden rounded-2xl border border-slate-200">
                  <div className="overflow-x-auto">
                    <table className="min-w-[640px] w-full text-left text-xs">
                      <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500">
                        <tr>
                          <th className="px-4 py-3">Name</th>
                          <th className="px-4 py-3">Type</th>
                          <th className="px-4 py-3">Total</th>
                          <th className="px-4 py-3">Active</th>
                          <th className="px-4 py-3">Pending</th>
                          <th className="px-4 py-3">Draft</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {dash.filteredDetailRows.map((row) => (
                          <tr key={`${row.type}-${row.key}`} className="hover:bg-emerald-50/40">
                            <td className="px-4 py-3 font-bold text-slate-900">{row.label}</td>
                            <td className="px-4 py-3 text-slate-500">{row.type}</td>
                            <td className="px-4 py-3 font-semibold text-slate-800">
                              {fmt(row.total)}
                            </td>
                            <td className="px-4 py-3 font-semibold text-emerald-700">
                              {fmt(row.active)}
                            </td>
                            <td className="px-4 py-3 font-semibold text-amber-700">
                              {fmt(row.pending)}
                            </td>
                            <td className="px-4 py-3 font-semibold text-slate-600">
                              {fmt(row.draft)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-500">
                  No inventory rows match these filters. Try All time or clear filters.
                </div>
              )}
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-black text-slate-900">Sales pod snapshot</h2>
                  <p className="text-[11px] text-slate-500">
                    Live members under your regional hierarchy
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("directory")}
                  className="text-xs font-bold text-emerald-700 hover:underline"
                >
                  View all →
                </button>
              </div>
              {dash.teamMembers.length ? (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {dash.teamMembers.slice(0, 4).map((member) => {
                    const initials = String(member.name || "U")
                      .split(/\s+/)
                      .slice(0, 2)
                      .map((p) => p[0])
                      .join("")
                      .toUpperCase();
                    return (
                      <article
                        key={member._id || member.id || member.email}
                        className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-100 text-xs font-black text-emerald-800">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-slate-900">
                              {member.name || "Team member"}
                            </p>
                            <p className="truncate text-[11px] font-semibold text-emerald-700">
                              {cleanRole(member.roleName)}
                            </p>
                          </div>
                        </div>
                        <p className="mt-2 truncate text-[11px] text-slate-500">
                          {[member.city, member.state].filter(isKnown).join(", ") || "Location pending"}
                        </p>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-500">
                  No sales-role members found under your hierarchy yet.
                </div>
              )}
            </section>
          </motion.div>
        )}

        {/* Directory */}
        {activeTab === "directory" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                    Operations
                  </p>
                  <h2 className="text-xl font-black text-slate-950">Team directory</h2>
                  <p className="text-xs text-slate-500">
                    Showing {filteredMembers.length} of {dash.data.users.length} regional members
                  </p>
                </div>
                <div className="flex rounded-xl border border-slate-200 p-1 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setDirViewMode("cards")}
                    className={`rounded-lg px-3 py-1.5 ${dirViewMode === "cards" ? "bg-emerald-600 text-white" : "text-slate-500"}`}
                  >
                    Cards
                  </button>
                  <button
                    type="button"
                    onClick={() => setDirViewMode("table")}
                    className={`rounded-lg px-3 py-1.5 ${dirViewMode === "table" ? "bg-emerald-600 text-white" : "text-slate-500"}`}
                  >
                    Table
                  </button>
                </div>
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Role
                  <select
                    value={dirRole}
                    onChange={(e) => setDirRole(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 outline-none"
                  >
                    <option value="All roles">All roles</option>
                    {[...new Set(dash.data.users.map((u) => u.roleName).filter(Boolean))]
                      .sort()
                      .map((role) => (
                        <option key={role} value={role}>
                          {cleanRole(role)}
                        </option>
                      ))}
                  </select>
                </label>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  State
                  <select
                    value={dirState}
                    onChange={(e) => setDirState(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 outline-none"
                  >
                    <option value="All States">All States</option>
                    {dash.allStates.map((state) => (
                      <option key={state}>{state}</option>
                    ))}
                  </select>
                </label>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  City
                  <select
                    value={dirCity}
                    onChange={(e) => setDirCity(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 outline-none"
                  >
                    <option value="All Cities">All Cities</option>
                    {dash.allCities.map((city) => (
                      <option key={city}>{city}</option>
                    ))}
                  </select>
                </label>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Status
                  <select
                    value={dirStatus}
                    onChange={(e) => setDirStatus(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 outline-none"
                  >
                    <option value="All Statuses">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </label>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Search
                  <div className="relative mt-1">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
                    <input
                      value={dirSearch}
                      onChange={(e) => setDirSearch(e.target.value)}
                      placeholder="Name, email, city"
                      className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-8 text-xs font-semibold outline-none"
                    />
                    {dirSearch && (
                      <button
                        type="button"
                        onClick={() => setDirSearch("")}
                        className="absolute right-2.5 top-2.5 text-slate-400"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </label>
              </div>
            </section>

            {filteredMembers.length ? (
              dirViewMode === "cards" ? (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredMembers.map((member) => {
                    const active = member.isActive !== false;
                    const initials = String(member.name || "U")
                      .split(/\s+/)
                      .slice(0, 2)
                      .map((p) => p[0])
                      .join("")
                      .toUpperCase();
                    return (
                      <article
                        key={member._id || member.id || member.email}
                        className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm"
                      >
                        <div className="flex items-start gap-3">
                          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-sm font-black text-emerald-700">
                            {initials}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="truncate text-sm font-black text-slate-900">
                              {member.name || "Unnamed"}
                            </h3>
                            <p className="text-[11px] font-bold uppercase tracking-wide text-emerald-700">
                              {cleanRole(member.roleName)}
                            </p>
                            <p className="mt-1 truncate text-xs text-slate-500">
                              {member.email || "No email"}
                            </p>
                          </div>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              active
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {active ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <p className="mt-3 text-xs text-slate-500">
                          {[member.locality, member.city, member.state].filter(isKnown).join(", ") ||
                            "Work location not set"}
                        </p>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="min-w-[720px] w-full text-left text-xs">
                      <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500">
                        <tr>
                          <th className="px-4 py-3">Member</th>
                          <th className="px-4 py-3">Role</th>
                          <th className="px-4 py-3">Location</th>
                          <th className="px-4 py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredMembers.map((member) => (
                          <tr key={member._id || member.id || member.email}>
                            <td className="px-4 py-3">
                              <p className="font-bold text-slate-900">{member.name || "Unnamed"}</p>
                              <p className="text-slate-400">{member.email || "—"}</p>
                            </td>
                            <td className="px-4 py-3 font-semibold text-emerald-700">
                              {cleanRole(member.roleName)}
                            </td>
                            <td className="px-4 py-3 text-slate-600">
                              {[member.city, member.state].filter(isKnown).join(", ") || "—"}
                            </td>
                            <td className="px-4 py-3">
                              {member.isActive !== false ? "Active" : "Inactive"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-4 py-14 text-center">
                <Users className="mx-auto mb-3 text-slate-300" size={34} />
                <p className="font-bold text-slate-600">No members match these filters</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Reports */}
        {activeTab === "reports" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <div>
                <h2 className="text-lg font-black text-slate-950">Regional reports</h2>
                <p className="text-xs text-slate-500">
                  Export the same live numbers shown on your overview
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    window.print();
                    dash.triggerToast("Print / PDF dialog opened");
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50"
                >
                  <Download size={14} /> Export PDF
                </button>
                <button
                  type="button"
                  onClick={handleExportExcel}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700"
                >
                  <FileSpreadsheet size={14} /> Export Excel
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: "Total Properties", value: fmt(m.totalProperties), note: `${fmt(m.activeListings)} active` },
                { label: "Inquiries", value: fmt(m.totalInquiries), note: `${fmt(m.totalClicks)} clicks` },
                { label: "Views", value: fmt(m.totalViews), note: "All listings" },
                { label: "Conversion", value: `${m.conversionRate}%`, note: `${fmt(m.conversions)} sales` },
              ].map((card) => (
                <article key={card.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold text-slate-500">{card.label}</p>
                  <p className="mt-1 text-2xl font-black text-slate-950">{card.value}</p>
                  <p className="mt-2 text-[11px] font-bold text-emerald-600">{card.note}</p>
                </article>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="text-sm font-black text-slate-900">City share</h3>
                <div className="mt-3 space-y-2.5">
                  {dash.cityRows.length ? (
                    dash.cityRows.map((city) => (
                      <div key={city.city}>
                        <div className="mb-1 flex justify-between text-xs">
                          <span className="font-semibold text-slate-700">{city.city}</span>
                          <span className="font-bold text-slate-900">
                            {fmt(city.total)} · {pct(city.total, m.totalProperties)}%
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-emerald-500"
                            style={{ width: `${city.pct}%` }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="py-8 text-center text-xs text-slate-400">No city data yet</p>
                  )}
                </div>
              </section>
              <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="text-sm font-black text-slate-900">Status inventory</h3>
                <div className="mt-3 space-y-2.5">
                  {(dash.statusRows.length
                    ? dash.statusRows
                    : [
                        { status: "active", total: m.activeListings },
                        { status: "pending", total: m.pendingCount },
                        { status: "draft", total: m.draftCount },
                      ]
                  ).map((row) => (
                    <div
                      key={row.status}
                      className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs"
                    >
                      <span className="font-semibold capitalize text-slate-700">{row.status}</span>
                      <strong className="text-slate-900">{fmt(row.total)}</strong>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
