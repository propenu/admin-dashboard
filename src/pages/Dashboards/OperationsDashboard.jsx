import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, AlertTriangle, ArrowRight, BarChart3, Building2, CalendarDays, CheckCircle2, Download, FileSpreadsheet, Filter, MapPin, RefreshCw, RotateCcw, Users, X } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { apiClient } from "../../api/apiClient";
import { getAllProjectsAnalytics, getAllPropertiesAnalytics, getFeaturedProjectsByType } from "../../features/property/propertyService";
import { getAllUsers, getUserDetails } from "../../features/user/userService";
import { getTicketDashboardOverview } from "../../features/ticket/ticket_system";
import { getAccessRoles } from "../../features/accessControl/accessControlService";
import BusinessDevelopmentOverview from "./BusinessDevelopmentOverview";

const fmt = (value) => Number(value || 0).toLocaleString("en-IN");
const title = (value = "") => String(value || "Not specified").replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
const isKnownValue = (value) => {
  const normalized = String(value ?? "").trim().toLowerCase();
  return Boolean(normalized) && !["unknown", "not specified", "not_specified", "n/a", "na", "null", "undefined"].includes(normalized);
};
const today = () => new Date().toISOString().slice(0, 10);
const initialFilters = { from: "", to: "", role: "", state: "", city: "", locality: "" };
const allTimeFilters = { ...initialFilters };
const presetRange = (preset) => {
  const end = new Date();
  const start = new Date(end);
  if (preset === "day") return { from: today(), to: today() };
  if (preset === "week") start.setDate(end.getDate() - 6);
  if (preset === "month") start.setDate(end.getDate() - 29);
  if (preset === "year") start.setFullYear(end.getFullYear() - 1);
  if (preset === "all") return { from: "", to: "" };
  return null;
};
const isoDate = (date) => date.toISOString().slice(0, 10);
const withinRange = (value, from, to) => {
  if (!from && !to) return true;
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return false;
  if (from && date < new Date(`${from}T00:00:00`)) return false;
  if (to && date > new Date(`${to}T23:59:59.999`)) return false;
  return true;
};
const COLORS = ["#10b981", "#0f172a", "#3b82f6", "#f59e0b", "#8b5cf6", "#ef4444"];

const Select = ({ label, value, onChange, children }) => <label className="min-w-0"><span className="mb-0.5 block text-[8px] font-bold text-slate-400">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="h-8 w-full rounded-lg border border-slate-200 bg-white px-2 text-[10px] font-semibold capitalize text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100">{children}</select></label>;
const DateInput = ({ label, value, onChange, min, max }) => <label><span className="mb-0.5 block text-[8px] font-bold text-slate-400">{label}</span><input type="date" value={value} min={min} max={max} onChange={(event) => onChange(event.target.value)} className="h-8 w-full rounded-lg border border-slate-200 px-2 text-[10px] text-slate-700 outline-none focus:border-emerald-500" /></label>;

const Metric = ({ icon: Icon, label, value, note, tone = "emerald" }) => {
  const tones = { emerald: "bg-emerald-50 text-emerald-600", blue: "bg-blue-50 text-blue-600", amber: "bg-amber-50 text-amber-600", violet: "bg-violet-50 text-violet-600", rose: "bg-rose-50 text-rose-600", navy: "bg-slate-100 text-slate-700" };
  return <article className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm"><div className="flex items-start justify-between gap-2"><div><p className="text-[8px] font-bold uppercase tracking-wide text-slate-400">{label}</p><p className="mt-0.5 text-xl font-black leading-6 text-slate-900">{value}</p><p className="mt-0.5 text-[8px] text-slate-500">{note}</p></div><span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${tones[tone]}`}><Icon size={15} /></span></div></article>;
};

const Panel = ({ title: heading, subtitle, children, className = "" }) => <section className={`overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}><header className="border-b border-slate-100 px-3 py-2"><h2 className="text-[11px] font-black text-slate-800">{heading}</h2>{subtitle && <p className="text-[8px] text-slate-400">{subtitle}</p>}</header>{children}</section>;
const EmptyState = ({ message }) => <div className="grid h-full min-h-32 place-items-center px-6 text-center"><div><BarChart3 className="mx-auto mb-2 text-slate-300" size={22} /><p className="text-[10px] font-semibold text-slate-400">{message}</p></div></div>;

const PipelineVisualization = ({ rows }) => <div className="space-y-1.5 p-3">{rows.slice(0, 4).map((row, index) => { const widths = [92, 78, 68, 58]; const colors = ["#e2e8f0", "#fde7b0", "#a7e6c5", "#dbeafe"]; return <div key={row.name} className="mx-auto flex h-9 flex-col items-center justify-center text-center text-[8px] text-slate-700" style={{ width: `${widths[index]}%`, background: colors[index], clipPath: "polygon(5% 0,95% 0,86% 100%,14% 100%)" }}><span>{row.name}</span><strong className="text-sm leading-4 text-slate-900">{fmt(row.total)}</strong></div>; })}<div className="flex justify-between border-t border-slate-100 pt-2 text-[8px] text-slate-500"><span>Total inventory <strong className="block text-[11px] text-slate-900">{fmt(rows.reduce((sum, row) => sum + row.total, 0))}</strong></span><span className="text-right">Active <strong className="block text-[11px] text-emerald-600">{fmt(rows.find((row) => row.name.toLowerCase() === "active")?.total)}</strong></span></div></div>;

const DepartmentPerformance = ({ rows }) => { const max = Math.max(...rows.map((row) => row.total), 1); return <div className="space-y-3 p-3">{rows.slice(0, 6).map((row) => <div key={row.role} className="grid grid-cols-[72px_1fr_32px] items-center gap-2"><span className="truncate text-[8px] font-semibold text-slate-600">{row.role}</span><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.max(5, row.total / max * 100)}%` }} /></div><span className="text-right text-[8px] font-bold text-slate-500">{row.total}</span></div>)}</div>; };

const FunnelSteps = ({ rows }) => {
  const maximum = Math.max(...rows.map((row) => Number(row.value || 0)), 1);
  return <div className="space-y-2 p-3">{rows.map((row, index) => <div key={row.name} className="grid grid-cols-[72px_1fr_44px] items-center gap-2"><span className="text-[9px] font-semibold text-slate-600">{row.name}</span><div className="h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full" style={{ width: `${Math.max(3, Number(row.value || 0) / maximum * 100)}%`, backgroundColor: COLORS[index % COLORS.length] }} /></div><strong className="text-right text-[9px] text-slate-700">{fmt(row.value)}</strong></div>)}</div>;
};

const ReportFunnel = ({ rows }) => {
  const total = Number(rows[0]?.value || 0);
  const colors = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#0ea5e9", "#059669"];
  const widths = [100, 84, 68, 52, 38, 26];
  return <div className="grid h-[155px] grid-cols-[44%_56%] items-center gap-3 px-4 py-2">
    <div className="flex h-[138px] flex-col items-center justify-center overflow-hidden">
      {rows.map((row, index) => <div key={row.name} className="h-[27px] shrink-0" style={{ width: `${widths[index] || Math.max(18, 100 - index * 15)}%`, backgroundColor: colors[index % colors.length], clipPath: "polygon(8% 0, 92% 0, 100% 100%, 0 100%)" }} />)}
    </div>
    <div className="divide-y divide-slate-100">
      {rows.map((row, index) => <div key={row.name} className="grid grid-cols-[1fr_auto] items-center gap-2 py-1 text-[8px]"><span className="flex items-center gap-1.5 font-semibold text-slate-600"><i className="h-2 w-2 rounded-sm" style={{ backgroundColor: colors[index % colors.length] }} />{row.name}</span><strong className="whitespace-nowrap text-slate-700">{fmt(row.value)} <span className="font-medium text-slate-400">({total ? (Number(row.value || 0) / total * 100).toFixed(1) : "0.0"}%)</span></strong></div>)}
    </div>
  </div>;
};

const RegionalPerformance = ({ rows }) => {
  if (!rows.length) return <EmptyState message="No regional inventory was found for the selected scope." />;
  const maximum = Math.max(...rows.map((row) => Number(row.total || 0)), 1);
  return <div className="space-y-3 p-3">{rows.slice(0, 6).map((row) => <div key={row.name} className="grid grid-cols-[80px_1fr_38px] items-center gap-2"><span className="truncate text-[9px] font-semibold text-slate-600">{row.name}</span><div className="h-2.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.max(4, Number(row.total || 0) / maximum * 100)}%` }} /></div><strong className="text-right text-[9px] text-slate-600">{fmt(row.total)}</strong></div>)}</div>;
};

const mergeRows = (first = [], second = []) => {
  const map = new Map();
  [...first, ...second].forEach((row) => { const key = String(row?._id ?? ""); if (!isKnownValue(key)) return; const existing = map.get(key) || { name: title(key), total: 0, active: 0, pending: 0 }; existing.total += Number(row?.total || 0); existing.active += Number(row?.active || 0); existing.pending += Number(row?.pending || 0); map.set(key, existing); });
  return [...map.values()].sort((a, b) => b.total - a.total);
};

export default function OperationsDashboard({ reportMode = false, businessDevelopmentMode = false }) {
  const navigate = useNavigate();
  const [filters, setFilters] = useState(initialFilters);
  const [applied, setApplied] = useState(initialFilters);
  const [data, setData] = useState({ projects: {}, properties: {}, leads: [], leadSummary: {}, leadFacets: {}, leadProjects: [], users: [], currentUser: null, recent: [], tickets: {}, roles: [], today: {} });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [reportTab, setReportTab] = useState("summary");
  const [compareWith, setCompareWith] = useState("previous");
  const [datePreset, setDatePreset] = useState("all");
  const [teamFilter, setTeamFilter] = useState("");
  const [projectTypeFilter, setProjectTypeFilter] = useState("");
  const [locationView, setLocationView] = useState("state");
  const [locationSearch, setLocationSearch] = useState("");
  const [recordSearch, setRecordSearch] = useState("");
  const [showContactColumns, setShowContactColumns] = useState(true);
  const [leadPage, setLeadPage] = useState(1);
  const [leadSource, setLeadSource] = useState("");
  const [leadStatus, setLeadStatus] = useState("");
  const [leadState, setLeadState] = useState("");
  const [leadCity, setLeadCity] = useState("");
  const [leadLocality, setLeadLocality] = useState("");
  const [reportLeadData, setReportLeadData] = useState({ leads: [], pagination: { page: 1, pages: 1, total: 0 }, facets: {} });
  const [reportLeadsLoading, setReportLeadsLoading] = useState(false);

  const roleOptions = useMemo(() => [...new Set(data.users.map((user) => user.roleName).filter(isKnownValue))].sort(), [data.users]);
  const scopedUsers = useMemo(() => applied.role ? data.users.filter((user) => user.roleName === applied.role) : data.users, [applied.role, data.users]);
  const locationUsers = useMemo(() => scopedUsers.filter((user) => withinRange(user.createdAt, applied.from, applied.to) && (!applied.state || user.state === applied.state) && (!applied.city || user.city === applied.city) && (!applied.locality || user.locality === applied.locality)), [applied, scopedUsers]);
  const states = useMemo(() => [...new Set(data.users.map((user) => user.state).filter(isKnownValue))].sort(), [data.users]);
  const cities = useMemo(() => [...new Set(data.users.filter((user) => !filters.state || user.state === filters.state).map((user) => user.city).filter(isKnownValue))].sort(), [data.users, filters.state]);
  const localities = useMemo(() => [...new Set(data.users.filter((user) => (!filters.state || user.state === filters.state) && (!filters.city || user.city === filters.city)).map((user) => user.locality).filter(isKnownValue))].sort(), [data.users, filters.city, filters.state]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [usersResult, currentUserResult, rolesResult] = await Promise.all([
        getAllUsers().catch(() => ({ data: [] })),
        getUserDetails().catch(() => ({ data: null })),
        getAccessRoles().catch(() => ({ roles: [] })),
      ]);
      const users = Array.isArray(usersResult?.data) ? usersResult.data : usersResult?.data?.users || [];
      const currentUser = currentUserResult?.data?.user || currentUserResult?.data || null;
      const selectedUsers = applied.role ? users.filter((user) => user.roleName === applied.role) : users;
      const includeCurrentUser = !applied.role || currentUser?.roleName === applied.role;
      const scopedUserIds = [...new Set([
        ...selectedUsers.map((user) => user._id),
        ...(includeCurrentUser ? [currentUser?._id, currentUser?.id, currentUser?.sub] : []),
      ].filter(Boolean).map(String))];
      // "All Teams" must represent the complete backend dataset. Creator scoping
      // is applied only after a specific team/role is selected.
      const scopedCreatorIds = applied.role
        ? scopedUserIds.join(",") || "000000000000000000000000"
        : "";
      const params = Object.fromEntries(Object.entries({ from: applied.from, to: applied.to, state: applied.state, city: applied.city, locality: applied.locality, creatorIds: scopedCreatorIds }).filter(([, value]) => value));
      const leadParams = Object.fromEntries(Object.entries({ from: applied.from, to: applied.to, state: applied.state, city: applied.city, locality: applied.locality, category: projectTypeFilter, creatorIds: scopedCreatorIds, limit: 100 }).filter(([, value]) => value));
      const currentRole = currentUser?.roleName;
      const roleLocationUsers = users.filter((user) => (!currentRole || user.roleName === currentRole) && (!currentUser?.state || user.state === currentUser.state) && (!currentUser?.city || user.city === currentUser.city));
      const todayScopeIds = roleLocationUsers.map((user) => user._id).filter(Boolean).map(String).join(",");
      const todayParams = Object.fromEntries(Object.entries({ from: today(), to: today(), state: applied.state || currentUser?.state, city: applied.city || currentUser?.city, locality: applied.locality || currentUser?.locality, creatorIds: applied.role ? scopedCreatorIds : todayScopeIds }).filter(([, value]) => value));
      const [projectResult, propertyResult, leadResult, recentResult, ticketResult, todayProjectResult, todayPropertyResult, todayTicketResult] = await Promise.allSettled([getAllProjectsAnalytics(params), getAllPropertiesAnalytics(params), apiClient.get("/api/properties/leads/admin/overview", { params: leadParams }), getFeaturedProjectsByType(null, 1, 50), getTicketDashboardOverview({ from: applied.from, to: applied.to }), getAllProjectsAnalytics(todayParams), getAllPropertiesAnalytics(todayParams), getTicketDashboardOverview({ from: today(), to: today() })]);
      const recentItems = recentResult.status === "fulfilled" ? recentResult.value?.data?.items || [] : [];
      const scopedCreatorSet = new Set(scopedUserIds);
      const recent = applied.role
        ? recentItems.filter((project) => scopedCreatorSet.has(String(project?.createdBy?._id || project?.createdBy || "")))
        : recentItems;
      setData({
        projects: projectResult.status === "fulfilled" ? projectResult.value?.data?.data || {} : {},
        properties: propertyResult.status === "fulfilled" ? propertyResult.value?.data?.data || {} : {},
        leads: leadResult.status === "fulfilled" ? leadResult.value?.data?.data?.leads || [] : [],
        leadSummary: leadResult.status === "fulfilled" ? leadResult.value?.data?.data?.summary || {} : {},
        leadFacets: leadResult.status === "fulfilled" ? leadResult.value?.data?.data?.facets || {} : {},
        leadProjects: leadResult.status === "fulfilled" ? leadResult.value?.data?.data?.projects || [] : [],
        users,
        currentUser,
        recent,
        tickets: ticketResult.status === "fulfilled" ? ticketResult.value || {} : {},
        roles: rolesResult?.roles || rolesResult?.data?.roles || [],
        today: {
          projects: todayProjectResult.status === "fulfilled" ? todayProjectResult.value?.data?.data?.overview || {} : {},
          properties: todayPropertyResult.status === "fulfilled" ? todayPropertyResult.value?.data?.data?.overview || {} : {},
          tickets: todayTicketResult.status === "fulfilled" ? todayTicketResult.value || {} : {},
        },
      });
      if (leadResult.status === "rejected") {
        toast.error(leadResult.reason?.response?.data?.message || "Lead analytics could not be loaded");
      }
      if (projectResult.status === "rejected" || propertyResult.status === "rejected") toast.error("Some operational analytics could not be loaded");
    } catch (error) { toast.error(error?.response?.data?.message || "Unable to load operations analytics"); }
    finally { setLoading(false); }
  }, [applied, businessDevelopmentMode, projectTypeFilter]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!reportMode) return undefined;
    const timer = setTimeout(async () => {
      setReportLeadsLoading(true);
      try {
        const reportScopeIds = [
          ...data.users.filter((user) => !applied.role || user.roleName === applied.role).map((user) => user._id),
          ...((!applied.role || data.currentUser?.roleName === applied.role)
            ? [data.currentUser?._id, data.currentUser?.id, data.currentUser?.sub]
            : []),
        ].filter(Boolean).map(String);
        const roleUserIds = applied.role
          ? [...new Set(reportScopeIds)].join(",")
          : "";
        const params = Object.fromEntries(Object.entries({
          page: leadPage,
          limit: 10,
          search: recordSearch.trim(),
          source: leadSource,
          status: leadStatus,
          state: leadState || applied.state,
          city: leadCity || applied.city,
          locality: leadLocality || applied.locality,
          category: projectTypeFilter,
          from: applied.from,
          to: applied.to,
          creatorIds: roleUserIds,
        }).filter(([, value]) => value));
        const response = await apiClient.get("/api/properties/leads/admin/overview", { params });
        const payload = response?.data?.data || {};
        setReportLeadData({ leads: payload.leads || [], pagination: payload.pagination || { page: 1, pages: 1, total: 0 }, facets: payload.facets || {} });
      } catch (error) {
        toast.error(error?.response?.data?.message || "Detailed leads could not be loaded");
        setReportLeadData({ leads: [], pagination: { page: 1, pages: 1, total: 0 }, facets: {} });
      } finally {
        setReportLeadsLoading(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [applied, businessDevelopmentMode, data.currentUser, data.users, leadCity, leadLocality, leadPage, leadSource, leadState, leadStatus, projectTypeFilter, recordSearch, reportMode]);

  useEffect(() => { setLeadPage(1); }, [applied, leadCity, leadLocality, leadSource, leadState, leadStatus, recordSearch]);

  const projectOverview = data.projects?.overview || {};
  const propertyOverview = data.properties?.overview || {};
  const totalLeads = Number(data.leadSummary?.total || data.leads.length || projectOverview.totalInquiries || 0) + Number(propertyOverview.totalInquiries || 0);
  const leadCategories = data.leadSummary?.byCategory || {};
  const projectLeads = Number(leadCategories.featured || 0);
  const propertyLeads = ["residential", "commercial", "agricultural", "land"]
    .reduce((total, category) => total + Number(leadCategories[category] || 0), 0);
  const converted = Number(data.leadSummary?.byStatus?.sale || 0);
  const newLeads = Number(data.leadSummary?.byStatus?.new_lead || 0);
  const siteVisits = Number(data.leadSummary?.byStatus?.site_visit || 0);
  const conversion = totalLeads ? ((converted / totalLeads) * 100).toFixed(1) : "0.0";
  const activeProjects = Number(projectOverview.activeProjects || 0);
  const activeProperties = Number(propertyOverview.activeProperties || 0);
  const activeInventory = activeProjects + activeProperties;
  const pendingProjects = Number(projectOverview.pendingProjects || 0);
  const pendingProperties = Number(propertyOverview.pendingProperties || 0);
  const pending = pendingProjects + pendingProperties;
  const locations = useMemo(() => mergeRows(data.projects?.stateWise, data.properties?.stateWise), [data.projects, data.properties]);
  const projectPipeline = useMemo(() => mergeRows(data.projects?.statusWise), [data.projects]);
  const propertyPipeline = useMemo(() => mergeRows(data.properties?.statusWise), [data.properties]);
  const categoryRows = useMemo(() => mergeRows(data.projects?.categoryWise, data.properties?.categoryWise).slice(0, 8), [data.projects, data.properties]);
  const reportCategoryRows = useMemo(() => {
    if (!businessDevelopmentMode) return categoryRows;
    const projectTotal = Number(projectOverview.totalProjects || 0);
    const propertyCategories = categoryRows.filter((row) => !["project", "projects", "featured"].includes(row.name.toLowerCase()));
    return [{ name: "Projects", total: projectTotal, active: activeProjects, pending: pendingProjects }, ...propertyCategories];
  }, [activeProjects, businessDevelopmentMode, categoryRows, pendingProjects, projectOverview.totalProjects]);
  const leadTrend = useMemo(() => {
    const backendRows = Array.isArray(data.leadSummary?.dailyTrend) ? data.leadSummary.dailyTrend : [];
    const dates = backendRows.map((row) => new Date(`${row.date}T00:00:00`)).filter((date) => !Number.isNaN(date.getTime())).sort((a, b) => a - b);
    const rangeStart = applied.from ? new Date(`${applied.from}T00:00:00`) : dates[0];
    const rangeEnd = applied.to ? new Date(`${applied.to}T00:00:00`) : dates[dates.length - 1];
    const spanDays = rangeStart && rangeEnd ? Math.max(0, Math.round((rangeEnd - rangeStart) / 86400000)) : 0;
    const granularity = datePreset === "day" || spanDays <= 45 ? "day" : datePreset === "week" || spanDays <= 180 ? "week" : datePreset === "year" || spanDays > 730 ? "year" : "month";
    const buckets = new Map();
    backendRows.forEach((row) => {
      const date = new Date(`${row.date}T00:00:00`);
      if (Number.isNaN(date.getTime())) return;
      let key;
      let label;
      if (granularity === "year") {
        key = String(date.getFullYear()); label = key;
      } else if (granularity === "month") {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        label = date.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
      } else if (granularity === "week") {
        const start = new Date(date); start.setDate(date.getDate() - ((date.getDay() + 6) % 7));
        key = isoDate(start); label = `Week ${start.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}`;
      } else {
        key = row.date; label = date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
      }
      const bucket = buckets.get(key) || { date: label, leads: 0, converted: 0, conversion: 0 };
      bucket.leads += Number(row.leads || 0);
      bucket.converted += Number(row.converted || 0);
      bucket.conversion = bucket.leads ? Number((bucket.converted / bucket.leads * 100).toFixed(1)) : 0;
      buckets.set(key, bucket);
    });
    return [...buckets.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, value]) => value);
  }, [applied.from, applied.to, data.leadSummary, datePreset]);
  const funnel = useMemo(() => { const status = data.leadSummary?.byStatus || {}; return [{ name: "New", value: status.new_lead || 0 }, { name: "Interested", value: status.interested || 0 }, { name: "Follow up", value: status.follow_up || 0 }, { name: "Site visit", value: status.site_visit || 0 }, { name: "Converted", value: status.sale || 0 }]; }, [data.leadSummary]);
  const reportLocations = useMemo(() => {
    const query = locationSearch.trim().toLowerCase();
    return mergeRows(
      locationView === "state" ? data.projects?.stateWise : data.projects?.cityWise,
      locationView === "state" ? data.properties?.stateWise : data.properties?.cityWise,
    ).filter((row) => !query || row.name.toLowerCase().includes(query));
  }, [data.projects, data.properties, locationSearch, locationView]);
  const detailedLeads = useMemo(() => { const query = recordSearch.trim().toLowerCase(); return data.leads.filter((lead) => !query || [lead.name, lead.phone, lead.email, lead.project?.title, lead.project?.city, lead.status].some((value) => String(value || "").toLowerCase().includes(query))); }, [data.leads, recordSearch]);
  const teamRows = useMemo(() => { const map = new Map(); locationUsers.forEach((user) => { const key = user.roleName || "unassigned"; const row = map.get(key) || { role: title(key), total: 0, active: 0 }; row.total += 1; if (user.accountStatus === "active" && user.isActive !== false) row.active += 1; map.set(key, row); }); return [...map.values()].sort((a, b) => b.total - a.total).slice(0, 8); }, [locationUsers]);
  const todayActivity = useMemo(() => {
    const currentRole = data.currentUser?.roleName;
    const scopedTodayUsers = data.users.filter((user) => (!currentRole || user.roleName === currentRole) && (!data.currentUser?.state || user.state === data.currentUser.state) && (!data.currentUser?.city || user.city === data.currentUser.city));
    return {
      registrations: scopedTodayUsers.filter((user) => withinRange(user.createdAt, today(), today())).length,
      roles: data.roles.filter((role) => withinRange(role.createdAt, today(), today())).length,
      properties: Number(data.today?.properties?.totalProperties || 0),
      projects: Number(data.today?.projects?.totalProjects || 0),
      activeProjects: Number(data.today?.projects?.activeProjects || 0),
      tickets: Number(data.today?.tickets?.total || data.today?.tickets?.open || 0),
    };
  }, [data.currentUser, data.roles, data.today, data.users]);

  const update = (key, value) => setFilters((current) => ({ ...current, [key]: value, ...(key === "state" ? { city: "", locality: "" } : {}), ...(key === "city" ? { locality: "" } : {}) }));
  const clearAll = () => { setFilters(allTimeFilters); setApplied(allTimeFilters); setDatePreset("all"); };
  const reset = () => { clearAll(); };
  const applyDatePreset = (preset) => {
    setDatePreset(preset);
    const range = presetRange(preset);
    if (range) setFilters((current) => ({ ...current, ...range }));
  };
  const apply = (event) => { event.preventDefault(); setApplied(filters); };
  const dateScopeLabel = applied.from || applied.to ? `${applied.from || "Beginning"} to ${applied.to || "Today"}` : "All-time data";
  const exportReport = (format) => {
    const rows = data.leads.map((lead) => ({ Date: lead.createdAt ? new Date(lead.createdAt).toLocaleDateString("en-IN") : "", Lead: lead.name, Phone: lead.phone, Email: lead.email, Status: title(lead.status), Source: title(lead.source), Project: lead.project?.title, Location: [lead.project?.locality, lead.project?.city, lead.project?.state].filter(Boolean).join(", ") }));
    if (!rows.length) return toast.error("No detailed records are available to export");
    const reportName = businessDevelopmentMode ? "Business Development Report" : "Operations Report";
    const fileName = businessDevelopmentMode ? "business-development-report" : "operations-report";
    setExporting(true); const sheet = XLSX.utils.json_to_sheet(rows); const book = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(book, sheet, reportName); XLSX.writeFile(book, `${fileName}-${today()}.${format === "csv" ? "csv" : "xlsx"}`, { bookType: format === "csv" ? "csv" : "xlsx" }); setExporting(false);
  };

  if (loading && !data.projects?.overview) return <div className="grid min-h-[65vh] place-items-center"><div className="text-center"><RefreshCw className="mx-auto animate-spin text-emerald-600" /><p className="mt-3 text-sm text-slate-500">Loading operations analytics…</p></div></div>;

  if (!reportMode && businessDevelopmentMode) return <BusinessDevelopmentOverview
    navigate={navigate} loading={loading} reload={load} filters={filters} datePreset={datePreset}
    setDatePreset={setDatePreset} setFilters={setFilters} setApplied={setApplied}
    roleOptions={roleOptions} states={states} projectTypeFilter={projectTypeFilter}
    setProjectTypeFilter={setProjectTypeFilter} leadTrend={leadTrend} funnel={funnel}
    locations={locations} recent={data.recent}
    todayActivity={todayActivity}
    metrics={{ activeProjects, activeProperties, activeInventory, totalProjects: Number(projectOverview.totalProjects || 0), totalProperties: Number(propertyOverview.totalProperties || 0), totalLeads, newLeads, siteVisits, converted, conversion, pending, followUps: Number(data.leadSummary?.byStatus?.follow_up || 0) }}
  />;

  return <div className={`${reportMode && businessDevelopmentMode ? "bd-reports" : ""} mx-auto w-full max-w-none space-y-2 pb-4 text-slate-900`}>
    <header className="flex items-end justify-between gap-3">
      <div><h1 className="text-xl font-black leading-6 tracking-tight">{reportMode ? (businessDevelopmentMode ? "Business Development Reports" : "Operations Reports") : businessDevelopmentMode ? "Business Development Overview" : "Operations Overview"}</h1><p className="text-[9px] text-slate-500">{reportMode ? (businessDevelopmentMode ? "Analyse acquisition, plot inventory, visits, bookings, regional performance and operational trends." : "Analyse performance across projects, leads, teams and locations.") : businessDevelopmentMode ? "Pipeline health across projects, properties, plots, regions and sales teams." : "Live business health across projects, leads, teams and locations."}</p></div>
      <div className="flex flex-wrap justify-end gap-1.5">
        {!reportMode && businessDevelopmentMode && <>
          <select aria-label="Date range" value={datePreset} onChange={(event) => { const preset = event.target.value; const range = presetRange(preset); setDatePreset(preset); if (range) { setFilters((current) => ({ ...current, ...range })); setApplied((current) => ({ ...current, ...range })); } }} className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-[9px] font-semibold"><option value="day">Today</option><option value="week">Last 7 days</option><option value="month">Last 30 days</option><option value="year">Last 12 months</option><option value="all">All time</option></select>
          <select aria-label="Team role" value={filters.role} onChange={(event) => { update("role", event.target.value); setApplied((current) => ({ ...current, role: event.target.value })); }} className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-[9px] font-semibold"><option value="">All Teams</option>{roleOptions.map((role) => <option key={role} value={role}>{title(role)}</option>)}</select>
          <select aria-label="State" value={filters.state} onChange={(event) => { update("state", event.target.value); setApplied((current) => ({ ...current, state: event.target.value, city: "", locality: "" })); }} className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-[9px] font-semibold"><option value="">All States</option>{states.map((state) => <option key={state}>{state}</option>)}</select>
          <select aria-label="Project or property type" value={projectTypeFilter} onChange={(event) => setProjectTypeFilter(event.target.value)} className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-[9px] font-semibold"><option value="">All Project Types</option><option value="featured">Projects</option><option value="residential">Residential</option><option value="commercial">Commercial</option><option value="land">Land / Plots</option><option value="agricultural">Agricultural</option></select>
        </>}
        {!reportMode && !businessDevelopmentMode && <><select value={filters.role} onChange={(event) => { update("role", event.target.value); setApplied((current) => ({ ...current, role: event.target.value })); }} className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-[9px] font-semibold"><option value="">All Roles</option>{roleOptions.map((role) => <option key={role} value={role}>{title(role)}</option>)}</select><select value={filters.state} onChange={(event) => { update("state", event.target.value); setApplied((current) => ({ ...current, state: event.target.value, city: "", locality: "" })); }} className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-[9px] font-semibold"><option value="">All States</option>{states.map((state) => <option key={state}>{state}</option>)}</select></>}
        {!reportMode && <button onClick={() => navigate("/operations/reports")} className="flex h-8 items-center gap-1.5 rounded-lg bg-slate-950 px-3 text-[9px] font-bold text-white"><BarChart3 size={12} /> View detailed reports</button>}
        {reportMode && <><button disabled={exporting} onClick={() => exportReport("csv")} className="flex h-8 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 text-[9px] font-bold text-slate-600"><Download size={12} /> CSV</button><button disabled={exporting} onClick={() => exportReport("xlsx")} className="flex h-8 items-center gap-1 rounded-lg bg-emerald-600 px-2.5 text-[9px] font-bold text-white"><FileSpreadsheet size={12} /> Excel</button><button onClick={() => window.print()} className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-[9px] font-bold text-slate-600">Print / PDF</button></>}
        <button onClick={load} aria-label="Refresh dashboard" className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500"><RefreshCw size={13} className={loading ? "animate-spin" : ""} /></button>
      </div>
    </header>

    {reportMode && <form onSubmit={apply} className="grid grid-cols-6 gap-1.5 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
      <Select label="Date range" value={datePreset} onChange={applyDatePreset}><option value="day">Today</option><option value="week">Last 7 days</option><option value="month">Last 30 days</option><option value="year">Last 12 months</option><option value="all">All time</option><option value="custom">Custom dates</option></Select>
      <DateInput label="From" value={filters.from} max={filters.to} onChange={(value) => { setDatePreset("custom"); update("from", value); }} /><DateInput label="To" value={filters.to} min={filters.from} onChange={(value) => { setDatePreset("custom"); update("to", value); }} />
      <Select label="Compare with" value={compareWith} onChange={setCompareWith}><option value="previous">Previous period</option><option value="none">No comparison</option></Select>
      <Select label="Role" value={filters.role} onChange={(value) => update("role", value)}><option value="">All roles</option>{roleOptions.map((role) => <option key={role} value={role}>{title(role)}</option>)}</Select>
      <Select label="Team" value={teamFilter} onChange={setTeamFilter}><option value="">All teams</option>{roleOptions.map((role) => <option key={role} value={role}>{title(role)}</option>)}</Select>
      <Select label="State" value={filters.state} onChange={(value) => update("state", value)}><option value="">All states</option>{states.map((state) => <option key={state}>{state}</option>)}</Select>
      <Select label="City" value={filters.city} onChange={(value) => update("city", value)}><option value="">All cities</option>{cities.map((city) => <option key={city}>{city}</option>)}</Select>
      <Select label="Locality" value={filters.locality} onChange={(value) => update("locality", value)}><option value="">All localities</option>{localities.map((locality) => <option key={locality}>{locality}</option>)}</Select>
      <Select label="Project / property type" value={projectTypeFilter} onChange={setProjectTypeFilter}>
        <option value="">All projects and properties</option>
        <option value="featured">Projects</option>
        <option value="residential">Residential properties</option>
        <option value="commercial">Commercial properties</option>
        <option value="land">Land properties</option>
        <option value="agricultural">Agricultural properties</option>
      </Select>
      <button className="mt-auto flex h-8 items-center justify-center gap-1 rounded-lg bg-emerald-600 px-2 text-[9px] font-bold text-white"><Filter size={12} /> Apply filters</button><button type="button" onClick={() => { clearAll(); setCompareWith("previous"); setTeamFilter(""); setProjectTypeFilter(""); }} className="mt-auto flex h-8 items-center justify-center gap-1 rounded-lg border border-slate-200 text-[9px] font-bold text-slate-600"><RotateCcw size={12} /> Show all time</button>
    </form>}

    {reportMode ? (businessDevelopmentMode ? <section className="grid grid-cols-5 gap-1.5"><Metric icon={Users} label="Total leads" value={fmt(totalLeads)} note={`${fmt(projectLeads)} project · ${fmt(propertyLeads)} property`} /><Metric icon={CalendarDays} label="Site visits" value={fmt(siteVisits)} note="Current site visit stage" tone="blue" /><Metric icon={CheckCircle2} label="Bookings" value={fmt(converted)} note="Leads reaching Sale status" tone="violet" /><Metric icon={Activity} label="Conversion rate" value={`${conversion}%`} note={`${fmt(converted)} of ${fmt(totalLeads)} leads`} tone="amber" /><Metric icon={Building2} label="Active inventory" value={fmt(activeInventory)} note={`${fmt(activeProjects)} projects · ${fmt(activeProperties)} properties`} tone="emerald" /></section> : <section className="grid grid-cols-4 gap-1.5"><Metric icon={Users} label="Total leads" value={fmt(totalLeads)} note={`${fmt(projectLeads)} project leads · ${fmt(propertyLeads)} property leads`} /><Metric icon={Activity} label="Converted" value={fmt(converted)} note="Leads that reached final Sale status" tone="blue" /><Metric icon={BarChart3} label="Conversion rate" value={`${conversion}%`} note={`${fmt(converted)} converted out of ${fmt(totalLeads)} leads`} tone="emerald" /><Metric icon={Building2} label="Pipeline inventory" value={fmt(activeInventory)} note={`${fmt(activeProjects)} active projects · ${fmt(activeProperties)} active properties / plots`} tone="violet" /></section>) : businessDevelopmentMode ? <section className="grid grid-cols-6 gap-1.5"><Metric icon={Building2} label="Active projects" value={fmt(activeProjects)} note={`${fmt(projectOverview.totalProjects)} total projects`} /><Metric icon={MapPin} label="Available properties & plots" value={fmt(activeProperties)} note={`${fmt(propertyOverview.totalProperties)} total inventory`} tone="blue" /><Metric icon={Users} label="New leads" value={fmt(newLeads)} note={`${fmt(totalLeads)} total leads`} tone="violet" /><Metric icon={CalendarDays} label="Site visits" value={fmt(siteVisits)} note="Leads currently at Site Visit stage" tone="amber" /><Metric icon={Activity} label="Conversion" value={`${conversion}%`} note={`${fmt(converted)} leads reached Sale status`} /><Metric icon={BarChart3} label="Pipeline value" value="—" note="Verified financial data not connected" tone="navy" /></section> : <section className="grid grid-cols-6 gap-1.5"><Metric icon={Building2} label="Active projects" value={fmt(projectOverview.activeProjects)} note={`${fmt(projectOverview.totalProjects)} total projects`} /><Metric icon={Building2} label="Total properties" value={fmt(propertyOverview.totalProperties)} note={`${fmt(propertyOverview.activeProperties)} active`} tone="blue" /><Metric icon={Users} label="Total leads" value={fmt(totalLeads)} note={`${fmt(projectLeads)} project leads · ${fmt(propertyLeads)} property leads`} tone="violet" /><Metric icon={Activity} label="Conversion" value={`${conversion}%`} note={`${fmt(converted)} leads reached Sale status`} tone="emerald" /><Metric icon={AlertTriangle} label="Pending approvals" value={fmt(pending)} note={`${fmt(pendingProjects)} projects · ${fmt(pendingProperties)} properties`} tone="amber" /><Metric icon={AlertTriangle} label="Open tickets" value={fmt(data.tickets?.open)} note={`${fmt(data.tickets?.overdue)} overdue`} tone="rose" /></section>}

    {!reportMode ? <>
      <section className="grid grid-cols-12 gap-2">
        <Panel title={businessDevelopmentMode ? "Lead & conversion trend" : "Leads & conversions"} subtitle="Complete daily activity for the selected period" className={businessDevelopmentMode ? "col-span-5" : "col-span-6"}><div className="h-52 p-2">{leadTrend.length ? <ResponsiveContainer width="100%" height="100%"><AreaChart data={leadTrend}><defs><linearGradient id="leadFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0"/><XAxis dataKey="date" tick={{ fontSize: 10 }}/><YAxis tick={{ fontSize: 10 }} allowDecimals={false}/><Tooltip/><Area type="monotone" dataKey="leads" name="Leads" stroke="#10b981" fill="url(#leadFill)" strokeWidth={2}/><Area type="monotone" dataKey="converted" name="Converted" stroke="#0f172a" fill="transparent" strokeWidth={2}/></AreaChart></ResponsiveContainer> : <EmptyState message="No lead activity was found for the selected team, location and date range." />}</div></Panel>
        {businessDevelopmentMode ? <><Panel title="Sales funnel" subtitle="Live lead stages from the backend" className="col-span-3"><FunnelSteps rows={funnel} /></Panel><Panel title="Regional performance" subtitle="Project and property inventory by location" className="col-span-4"><RegionalPerformance rows={locations} /></Panel></> : <><Panel title="Project Pipeline" subtitle="Project inventory by workflow status" className="col-span-3"><PipelineVisualization rows={projectPipeline} /></Panel><Panel title="Property Pipeline" subtitle="Property inventory by workflow status" className="col-span-3"><PipelineVisualization rows={propertyPipeline} /></Panel></>}
      </section>
      <section className="grid grid-cols-12 gap-2">
        <Panel title="Location performance" subtitle="Combined projects and properties" className="col-span-3">
          <div className="flex h-[280px] flex-col">
            <div className="min-h-0 flex-1 overflow-auto"><table className="w-full text-left text-xs"><thead className="sticky top-0 z-10 bg-slate-50 text-[9px] uppercase text-slate-400"><tr><th className="px-4 py-2">Location</th><th>Total</th><th>Active</th><th>Pending</th></tr></thead><tbody>{locations.map((row) => <tr key={row.name} className="border-t border-slate-100"><td className="px-4 py-2.5 font-bold">{row.name}</td><td>{fmt(row.total)}</td><td className="text-emerald-600">{fmt(row.active)}</td><td className="text-amber-600">{fmt(row.pending)}</td></tr>)}</tbody></table></div>
            <button type="button" onClick={() => navigate("/locations")} className="flex h-9 shrink-0 items-center gap-1 border-t border-slate-100 px-4 text-[10px] font-bold text-emerald-600 hover:bg-emerald-50">View all locations <ArrowRight size={12} /></button>
          </div>
        </Panel>
        <Panel title="Attention required" subtitle="Items needing operational follow-up" className="col-span-3"><div className="h-[280px] space-y-2 overflow-y-auto p-3"><button type="button" onClick={() => navigate("/property-progress")} className="block w-full rounded-xl bg-amber-50 p-3 text-left text-xs text-amber-800 transition hover:bg-amber-100"><strong>{fmt(pending)} pending reviews</strong><p className="mt-1 text-[10px]">Projects and properties awaiting action.</p></button><button type="button" onClick={() => navigate("/leads")} className="block w-full rounded-xl bg-blue-50 p-3 text-left text-xs text-blue-800 transition hover:bg-blue-100"><strong>{fmt(newLeads)} new leads</strong><p className="mt-1 text-[10px]">Review and assign current enquiries.</p></button><button type="button" onClick={() => navigate("/tickets")} className="block w-full rounded-xl bg-rose-50 p-3 text-left text-xs text-rose-800 transition hover:bg-rose-100"><strong>{fmt(data.tickets?.open)} open tickets</strong><p className="mt-1 text-[10px]">{fmt(data.tickets?.overdue)} tickets are overdue.</p></button><button type="button" onClick={() => navigate("/tickets")} className="block w-full rounded-xl bg-slate-50 p-3 text-left text-xs text-slate-700 transition hover:bg-slate-100"><strong>{fmt(data.tickets?.unassigned)} unassigned tickets</strong><p className="mt-1 text-[10px]">Requires team assignment.</p></button></div></Panel>
        <Panel title={businessDevelopmentMode ? "Recent projects & plotted developments" : "Recent projects"} subtitle="Newest records returned by the project API" className={businessDevelopmentMode ? "col-span-6" : "col-span-3"}>
          <div className="flex h-[280px] flex-col">{!data.recent.length ? <div className="min-h-0 flex-1"><EmptyState message="No projects were found for the selected team scope." /></div> : businessDevelopmentMode ? <div className="min-h-0 flex-1 overflow-auto"><table className="w-full min-w-[560px] text-left text-[9px]"><thead className="sticky top-0 z-10 bg-slate-50 uppercase text-slate-400"><tr><th className="px-3 py-2">Project / development</th><th>Location</th><th>Type</th><th>Status</th></tr></thead><tbody>{data.recent.map((project) => <tr key={project._id} className="border-t border-slate-100"><td className="max-w-[190px] truncate px-3 py-2.5 font-bold text-slate-800">{project.title || "Untitled project"}</td><td className="max-w-[170px] truncate pr-2 text-slate-500">{[project.locality, project.city, project.state].filter(Boolean).join(", ") || "Location unavailable"}</td><td className="pr-2 capitalize text-slate-600">{title(project.projectType || project.category || "Project")}</td><td><span className="rounded-full bg-emerald-50 px-2 py-1 font-bold capitalize text-emerald-700">{title(project.status)}</span></td></tr>)}</tbody></table></div> : <div className="min-h-0 flex-1 divide-y divide-slate-100 overflow-y-auto">{data.recent.map((project) => <div key={project._id} className="flex items-center justify-between gap-3 px-4 py-2.5"><div className="min-w-0"><p className="truncate text-xs font-bold">{project.title || "Untitled project"}</p><p className="truncate text-[10px] text-slate-400">{[project.locality, project.city, project.state].filter(Boolean).join(", ") || "Location unavailable"}</p></div><span className="rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-bold capitalize text-emerald-700">{title(project.status)}</span></div>)}</div>}<button type="button" onClick={() => navigate("/projects")} className="flex h-9 shrink-0 items-center gap-1 border-t border-slate-100 px-4 text-[10px] font-bold text-emerald-600 hover:bg-emerald-50">View all projects <ArrowRight size={12} /></button></div>
        </Panel>
        {!businessDevelopmentMode && <Panel title="Department Performance" subtitle="Active team members by role" className="col-span-3"><div className="h-[280px] overflow-y-auto"><DepartmentPerformance rows={teamRows} /></div></Panel>}
      </section>
    </> : <>
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm"><div className="flex min-h-8 items-center gap-1.5 border-b border-slate-100 px-2 text-[8px]"><span className="font-bold text-slate-600">Applied filters:</span><span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 font-bold text-emerald-700">{dateScopeLabel}</span>{Object.entries({ role: applied.role, state: applied.state, city: applied.city, locality: applied.locality, compare: compareWith, team: teamFilter, projectType: projectTypeFilter }).filter(([, value]) => value).map(([key, value]) => <span key={key} className="rounded-md border border-slate-200 bg-white px-2 py-1 font-semibold capitalize text-slate-500">{title(key)}: {title(value)}</span>)}<button type="button" onClick={() => { clearAll(); setCompareWith("previous"); setTeamFilter(""); setProjectTypeFilter(""); }} className="ml-auto font-bold text-emerald-600">Clear all · Show all time</button></div><nav className="flex h-8 items-end gap-6 px-2">{[["summary","Executive Summary"],["funnel","Lead Funnel"],["projects",businessDevelopmentMode ? "Projects & Plots" : "Projects"],["revenue","Revenue"],["team","Team Performance"],["locations","Locations"]].map(([key, label]) => <button type="button" key={key} onClick={() => setReportTab(key)} className={`h-8 border-b-2 px-1 text-[9px] font-bold ${reportTab === key ? "border-emerald-600 text-emerald-700" : "border-transparent text-slate-500"}`}>{label}</button>)}</nav></div>
      <section className="grid grid-cols-12 gap-2">
        {["summary", "funnel"].includes(reportTab) && <Panel title="Lead, visit & booking trend" subtitle="Live acquisition and conversion activity" className={reportTab === "summary" ? "col-span-6" : "col-span-8"}><div className="h-52 p-2"><ResponsiveContainer width="100%" height="100%"><ComposedChart data={leadTrend}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0"/><XAxis dataKey="date" tick={{ fontSize: 10 }}/><YAxis tick={{ fontSize: 10 }} allowDecimals={false}/><Tooltip/><Bar dataKey="leads" name="Leads" fill="#10b981" radius={[4,4,0,0]}/><Bar dataKey="converted" name="Bookings" fill="#8b5cf6" radius={[4,4,0,0]}/><Line type="monotone" dataKey="conversion" name="Conversion (%)" stroke="#f59e0b" strokeWidth={2} dot={{ r: 2 }} /></ComposedChart></ResponsiveContainer></div></Panel>}
        {["summary", "funnel"].includes(reportTab) && <Panel title="Lead funnel" subtitle="Current status distribution" className={reportTab === "summary" ? "col-span-3" : "col-span-4"}><ReportFunnel rows={funnel} /></Panel>}
        {["summary", "projects"].includes(reportTab) && <Panel title={businessDevelopmentMode ? "Project, property & plot inventory" : "Inventory by category"} subtitle="Live inventory grouped by backend category" className={reportTab === "summary" ? "col-span-3" : "col-span-12"}><div className="h-52 p-2"><ResponsiveContainer width="100%" height="100%"><BarChart data={reportCategoryRows} layout="vertical"><CartesianGrid strokeDasharray="3 3"/><XAxis type="number" tick={{ fontSize: 9 }} allowDecimals={false}/><YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 9 }}/><Tooltip/><Bar dataKey="total" name="Inventory" fill="#10b981" radius={[0,4,4,0]}/></BarChart></ResponsiveContainer></div></Panel>}
        {reportTab === "revenue" && <Panel title="Revenue analytics" subtitle="Financial reporting status" className="col-span-12"><div className="grid h-52 place-items-center p-6 text-center"><div><p className="text-sm font-black text-slate-700">Revenue data is not available from the backend yet.</p><p className="mt-1 text-[10px] text-slate-400">Connect verified transaction and payment values before displaying revenue totals.</p></div></div></Panel>}
      </section>
      {["summary", "team", "locations"].includes(reportTab) && <section className="grid grid-cols-12 gap-2">
        {["summary", "team"].includes(reportTab) && <Panel title="Team performance scope" subtitle="Role-based headcount and activation" className={reportTab === "summary" ? "col-span-6" : "col-span-12"}><div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="bg-slate-50 text-[9px] uppercase text-slate-400"><tr><th className="px-4 py-2">Role</th><th>Members</th><th>Active</th><th>Activation</th></tr></thead><tbody>{teamRows.map((row) => <tr key={row.role} className="border-t border-slate-100"><td className="px-4 py-2.5 font-bold">{row.role}</td><td>{row.total}</td><td>{row.active}</td><td className="font-bold text-emerald-600">{row.total ? Math.round(row.active / row.total * 100) : 0}%</td></tr>)}</tbody></table></div></Panel>}
        {["summary", "locations"].includes(reportTab) && <Panel title="Location comparison" subtitle={`Inventory performance by ${locationView}`} className={reportTab === "summary" ? "col-span-6" : "col-span-12"}>
          <div className="flex items-center gap-2 border-b border-slate-100 p-2"><input value={locationSearch} onChange={(event) => setLocationSearch(event.target.value)} placeholder={`Search ${locationView === "state" ? "state" : "city"}`} className="h-8 min-w-0 flex-1 rounded-lg border border-slate-200 px-3 text-[10px] outline-none focus:border-emerald-500"/><span className="text-[9px] font-semibold text-slate-400">{fmt(reportLocations.length)} results</span><button type="button" onClick={() => { setLocationView("state"); setLocationSearch(""); }} className={`rounded-md px-3 py-1.5 text-[9px] font-bold ${locationView === "state" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"}`}>By state</button><button type="button" onClick={() => { setLocationView("city"); setLocationSearch(""); }} className={`rounded-md px-3 py-1.5 text-[9px] font-bold ${locationView === "city" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"}`}>By city</button></div>
          <div className="max-h-[360px] overflow-auto"><table className="w-full text-left text-xs"><thead className="sticky top-0 z-10 bg-slate-50 text-[9px] uppercase text-slate-400"><tr><th className="px-4 py-2">{title(locationView)}</th><th>Total</th><th>Active</th><th>Pending</th></tr></thead><tbody>{reportLocations.map((row) => <tr key={row.name} className="border-t border-slate-100"><td className="px-4 py-2.5 font-bold">{row.name}</td><td>{fmt(row.total)}</td><td className="text-emerald-600">{fmt(row.active)}</td><td className="text-amber-600">{fmt(row.pending)}</td></tr>)}</tbody></table>{!reportLocations.length && <p className="p-10 text-center text-xs text-slate-400">No {locationView} matches your search.</p>}</div>
        </Panel>}
      </section>}
      {["summary", "funnel"].includes(reportTab) && <Panel title="Detailed lead records" subtitle={`${fmt(reportLeadData.pagination.total)} matching records · 10 records per page`}>
        <div className="grid grid-cols-7 gap-1.5 border-b border-slate-100 p-2">
          <input value={recordSearch} onChange={(event) => setRecordSearch(event.target.value)} placeholder="Search lead, phone, email or project" className="col-span-2 h-8 rounded-lg border border-slate-200 px-3 text-[10px] outline-none focus:border-emerald-500" />
          <select value={leadSource} onChange={(event) => setLeadSource(event.target.value)} className="h-8 rounded-lg border border-slate-200 px-2 text-[10px]"><option value="">All sources</option><option value="direct">Direct</option><option value="site">Website</option><option value="imported">Imported</option></select>
          <select value={leadStatus} onChange={(event) => setLeadStatus(event.target.value)} className="h-8 rounded-lg border border-slate-200 px-2 text-[10px]"><option value="">All statuses</option><option value="new_lead">New lead</option><option value="interested">Interested</option><option value="not_interested">Not interested</option><option value="follow_up">Follow up</option><option value="site_visit">Site visit</option><option value="sale">Converted / Sale</option></select>
          <select value={leadState} onChange={(event) => { setLeadState(event.target.value); setLeadCity(""); setLeadLocality(""); }} className="h-8 rounded-lg border border-slate-200 px-2 text-[10px]"><option value="">All states</option>{(reportLeadData.facets.states || data.leadFacets.states || []).filter(isKnownValue).map((value) => <option key={value}>{value}</option>)}</select>
          <select value={leadCity} onChange={(event) => { setLeadCity(event.target.value); setLeadLocality(""); }} className="h-8 rounded-lg border border-slate-200 px-2 text-[10px]"><option value="">All cities</option>{(reportLeadData.facets.cities || data.leadFacets.cities || []).filter(isKnownValue).map((value) => <option key={value}>{value}</option>)}</select>
          <select value={leadLocality} onChange={(event) => setLeadLocality(event.target.value)} className="h-8 rounded-lg border border-slate-200 px-2 text-[10px]"><option value="">All localities</option>{(reportLeadData.facets.localities || data.leadFacets.localities || []).filter(isKnownValue).map((value) => <option key={value}>{value}</option>)}</select>
          <div className="col-span-7 flex justify-end gap-1.5"><button type="button" onClick={() => setShowContactColumns((value) => !value)} className="h-7 rounded-lg border border-slate-200 px-3 text-[9px] font-bold text-slate-600">{showContactColumns ? "Hide contact" : "Show contact"}</button><button type="button" onClick={() => { setRecordSearch(""); setLeadSource(""); setLeadStatus(""); setLeadState(""); setLeadCity(""); setLeadLocality(""); }} className="h-7 rounded-lg border border-slate-200 px-3 text-[9px] font-bold text-slate-600">Clear lead filters</button></div>
        </div>
        <div className="relative overflow-x-auto"><table className="w-full min-w-[950px] text-left text-xs"><thead className="bg-slate-50 text-[9px] uppercase text-slate-400"><tr><th className="px-4 py-3">Date</th><th className="px-4 py-3">Lead</th>{showContactColumns && <th className="px-4 py-3">Contact</th>}<th className="px-4 py-3">Project / property</th><th className="px-4 py-3">Location</th><th className="px-4 py-3">Source</th><th className="px-4 py-3">Status</th></tr></thead><tbody>{reportLeadData.leads.map((lead) => <tr key={lead._id} className="border-t border-slate-100 hover:bg-emerald-50/40"><td className="whitespace-nowrap px-4 py-3">{lead.createdAt ? new Date(lead.createdAt).toLocaleDateString("en-IN") : "—"}</td><td className="px-4 font-bold">{lead.name || "Unnamed"}</td>{showContactColumns && <td className="px-4"><p>{lead.phone || "—"}</p><p className="text-[10px] text-slate-400">{lead.email}</p></td>}<td className="max-w-[220px] truncate px-4 font-semibold">{lead.project?.title || "—"}</td><td className="px-4">{[lead.project?.locality, lead.project?.city, lead.project?.state].filter(Boolean).join(", ") || "—"}</td><td className="px-4">{title(lead.source)}</td><td className="px-4"><span className="rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-bold text-emerald-700">{title(lead.status)}</span></td></tr>)}</tbody></table>{reportLeadsLoading && <div className="absolute inset-0 grid place-items-center bg-white/70"><RefreshCw size={18} className="animate-spin text-emerald-600" /></div>}{!reportLeadsLoading && !reportLeadData.leads.length && <p className="p-12 text-center text-sm text-slate-400">No leads match the selected filters.</p>}</div>
        <div className="flex h-11 items-center justify-between border-t border-slate-100 px-4 text-[10px] text-slate-500"><span>Showing {reportLeadData.pagination.total ? ((leadPage - 1) * 10) + 1 : 0}–{Math.min(leadPage * 10, reportLeadData.pagination.total || 0)} of {fmt(reportLeadData.pagination.total)} leads</span><div className="flex items-center gap-2"><button type="button" disabled={leadPage <= 1 || reportLeadsLoading} onClick={() => setLeadPage((page) => Math.max(1, page - 1))} className="h-7 rounded-lg border border-slate-200 px-3 font-bold disabled:opacity-40">Previous</button><span className="font-bold text-slate-700">Page {leadPage} of {Math.max(1, reportLeadData.pagination.pages || 1)}</span><button type="button" disabled={leadPage >= (reportLeadData.pagination.pages || 1) || reportLeadsLoading} onClick={() => setLeadPage((page) => page + 1)} className="h-7 rounded-lg border border-slate-200 px-3 font-bold disabled:opacity-40">Next</button></div></div>
      </Panel>}
    </>}
  </div>;
}
