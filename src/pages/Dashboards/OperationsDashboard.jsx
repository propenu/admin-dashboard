import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, AlertTriangle, ArrowRight, BarChart3, Building2, CalendarDays, CheckCircle2, Download, FileSpreadsheet, Filter, MapPin, RefreshCw, RotateCcw, Users, X } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { apiClient } from "../../api/apiClient";
import { getAllProjectsAnalytics, getAllPropertiesAnalytics, getFeaturedProjectsByType } from "../../features/property/propertyService";
import { getAllUsers } from "../../features/user/userService";
import { getTicketDashboardOverview } from "../../features/ticket/ticket_system";

const fmt = (value) => Number(value || 0).toLocaleString("en-IN");
const title = (value = "") => String(value || "Not specified").replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
const today = () => new Date().toISOString().slice(0, 10);
const monthAgo = () => { const date = new Date(); date.setDate(date.getDate() - 29); return date.toISOString().slice(0, 10); };
const initialFilters = { from: monthAgo(), to: today(), role: "", state: "", city: "", locality: "" };
const COLORS = ["#10b981", "#0f172a", "#3b82f6", "#f59e0b", "#8b5cf6", "#ef4444"];

const Select = ({ label, value, onChange, children }) => <label className="min-w-0"><span className="mb-0.5 block text-[8px] font-bold text-slate-400">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="h-8 w-full rounded-lg border border-slate-200 bg-white px-2 text-[10px] font-semibold capitalize text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100">{children}</select></label>;
const DateInput = ({ label, value, onChange, min, max }) => <label><span className="mb-0.5 block text-[8px] font-bold text-slate-400">{label}</span><input type="date" value={value} min={min} max={max} onChange={(event) => onChange(event.target.value)} className="h-8 w-full rounded-lg border border-slate-200 px-2 text-[10px] text-slate-700 outline-none focus:border-emerald-500" /></label>;

const Metric = ({ icon: Icon, label, value, note, tone = "emerald" }) => {
  const tones = { emerald: "bg-emerald-50 text-emerald-600", blue: "bg-blue-50 text-blue-600", amber: "bg-amber-50 text-amber-600", violet: "bg-violet-50 text-violet-600", rose: "bg-rose-50 text-rose-600", navy: "bg-slate-100 text-slate-700" };
  return <article className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm"><div className="flex items-start justify-between gap-2"><div><p className="text-[8px] font-bold uppercase tracking-wide text-slate-400">{label}</p><p className="mt-0.5 text-xl font-black leading-6 text-slate-900">{value}</p><p className="mt-0.5 text-[8px] text-slate-500">{note}</p></div><span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${tones[tone]}`}><Icon size={15} /></span></div></article>;
};

const Panel = ({ title: heading, subtitle, children, className = "" }) => <section className={`overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}><header className="border-b border-slate-100 px-3 py-2"><h2 className="text-[11px] font-black text-slate-800">{heading}</h2>{subtitle && <p className="text-[8px] text-slate-400">{subtitle}</p>}</header>{children}</section>;

const PipelineVisualization = ({ rows }) => <div className="space-y-1.5 p-3">{rows.slice(0, 4).map((row, index) => { const widths = [92, 78, 68, 58]; const colors = ["#e2e8f0", "#fde7b0", "#a7e6c5", "#dbeafe"]; return <div key={row.name} className="mx-auto flex h-9 flex-col items-center justify-center text-center text-[8px] text-slate-700" style={{ width: `${widths[index]}%`, background: colors[index], clipPath: "polygon(5% 0,95% 0,86% 100%,14% 100%)" }}><span>{row.name}</span><strong className="text-sm leading-4 text-slate-900">{fmt(row.total)}</strong></div>; })}<div className="flex justify-between border-t border-slate-100 pt-2 text-[8px] text-slate-500"><span>Total inventory <strong className="block text-[11px] text-slate-900">{fmt(rows.reduce((sum, row) => sum + row.total, 0))}</strong></span><span className="text-right">Active <strong className="block text-[11px] text-emerald-600">{fmt(rows.find((row) => row.name.toLowerCase() === "active")?.total)}</strong></span></div></div>;

const DepartmentPerformance = ({ rows }) => { const max = Math.max(...rows.map((row) => row.total), 1); return <div className="space-y-3 p-3">{rows.slice(0, 6).map((row) => <div key={row.role} className="grid grid-cols-[72px_1fr_32px] items-center gap-2"><span className="truncate text-[8px] font-semibold text-slate-600">{row.role}</span><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.max(5, row.total / max * 100)}%` }} /></div><span className="text-right text-[8px] font-bold text-slate-500">{row.total}</span></div>)}</div>; };

const mergeRows = (first = [], second = []) => {
  const map = new Map();
  [...first, ...second].forEach((row) => { const key = String(row?._id ?? "Not specified"); const existing = map.get(key) || { name: title(key), total: 0, active: 0, pending: 0 }; existing.total += Number(row?.total || 0); existing.active += Number(row?.active || 0); existing.pending += Number(row?.pending || 0); map.set(key, existing); });
  return [...map.values()].sort((a, b) => b.total - a.total);
};

export default function OperationsDashboard({ reportMode = false }) {
  const navigate = useNavigate();
  const [filters, setFilters] = useState(initialFilters);
  const [applied, setApplied] = useState(initialFilters);
  const [data, setData] = useState({ projects: {}, properties: {}, leads: [], leadSummary: {}, users: [], recent: [], tickets: {} });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [reportTab, setReportTab] = useState("summary");
  const [compareWith, setCompareWith] = useState("previous");
  const [teamFilter, setTeamFilter] = useState("");
  const [projectTypeFilter, setProjectTypeFilter] = useState("");
  const [locationView, setLocationView] = useState("state");
  const [recordSearch, setRecordSearch] = useState("");
  const [showContactColumns, setShowContactColumns] = useState(true);

  const roleOptions = useMemo(() => [...new Set(data.users.map((user) => user.roleName).filter(Boolean))].sort(), [data.users]);
  const scopedUsers = useMemo(() => applied.role ? data.users.filter((user) => user.roleName === applied.role) : data.users, [applied.role, data.users]);
  const locationUsers = useMemo(() => scopedUsers.filter((user) => (!applied.state || user.state === applied.state) && (!applied.city || user.city === applied.city) && (!applied.locality || user.locality === applied.locality)), [applied, scopedUsers]);
  const states = useMemo(() => [...new Set(data.users.map((user) => user.state).filter(Boolean))].sort(), [data.users]);
  const cities = useMemo(() => [...new Set(data.users.filter((user) => !filters.state || user.state === filters.state).map((user) => user.city).filter(Boolean))].sort(), [data.users, filters.state]);
  const localities = useMemo(() => [...new Set(data.users.filter((user) => (!filters.state || user.state === filters.state) && (!filters.city || user.city === filters.city)).map((user) => user.locality).filter(Boolean))].sort(), [data.users, filters.city, filters.state]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const usersResult = await getAllUsers().catch(() => ({ data: [] }));
      const users = Array.isArray(usersResult?.data) ? usersResult.data : usersResult?.data?.users || [];
      const selectedUsers = applied.role ? users.filter((user) => user.roleName === applied.role) : users;
      const params = Object.fromEntries(Object.entries({ from: applied.from, to: applied.to, state: applied.state, city: applied.city, locality: applied.locality, creatorIds: applied.role ? selectedUsers.map((user) => user._id).join(",") : "" }).filter(([, value]) => value));
      const leadParams = Object.fromEntries(Object.entries({ from: applied.from, to: applied.to, state: applied.state, city: applied.city, locality: applied.locality, creatorIds: applied.role ? selectedUsers.map((user) => user._id).join(",") : "", limit: 100 }).filter(([, value]) => value));
      const [projectResult, propertyResult, leadResult, recentResult, ticketResult] = await Promise.allSettled([getAllProjectsAnalytics(params), getAllPropertiesAnalytics(params), apiClient.get("/api/properties/leads/admin/overview", { params: leadParams }), getFeaturedProjectsByType(null, 1, 8), getTicketDashboardOverview({ from: applied.from, to: applied.to })]);
      setData({
        projects: projectResult.status === "fulfilled" ? projectResult.value?.data?.data || {} : {},
        properties: propertyResult.status === "fulfilled" ? propertyResult.value?.data?.data || {} : {},
        leads: leadResult.status === "fulfilled" ? leadResult.value?.data?.data?.leads || [] : [],
        leadSummary: leadResult.status === "fulfilled" ? leadResult.value?.data?.data?.summary || {} : {},
        users,
        recent: recentResult.status === "fulfilled" ? recentResult.value?.data?.items || [] : [],
        tickets: ticketResult.status === "fulfilled" ? ticketResult.value || {} : {},
      });
      if (leadResult.status === "rejected") {
        toast.error(leadResult.reason?.response?.data?.message || "Lead analytics could not be loaded");
      }
      if (projectResult.status === "rejected" || propertyResult.status === "rejected") toast.error("Some operational analytics could not be loaded");
    } catch (error) { toast.error(error?.response?.data?.message || "Unable to load operations analytics"); }
    finally { setLoading(false); }
  }, [applied]);

  useEffect(() => { load(); }, [load]);

  const projectOverview = data.projects?.overview || {};
  const propertyOverview = data.properties?.overview || {};
  const totalLeads = Number(data.leadSummary?.total || data.leads.length || projectOverview.totalInquiries || 0) + Number(propertyOverview.totalInquiries || 0);
  const converted = Number(data.leadSummary?.byStatus?.sale || 0);
  const conversion = totalLeads ? ((converted / totalLeads) * 100).toFixed(1) : "0.0";
  const activeInventory = Number(projectOverview.activeProjects || 0) + Number(propertyOverview.activeProperties || 0);
  const pending = Number(projectOverview.pendingProjects || 0) + Number(propertyOverview.pendingProperties || 0);
  const locations = useMemo(() => mergeRows(data.projects?.stateWise, data.properties?.stateWise).slice(0, 6), [data.projects, data.properties]);
  const pipeline = useMemo(() => mergeRows(data.projects?.statusWise, data.properties?.statusWise), [data.projects, data.properties]);
  const categoryRows = useMemo(() => mergeRows(data.projects?.categoryWise, data.properties?.categoryWise).slice(0, 8), [data.projects, data.properties]);
  const leadTrend = useMemo(() => { const map = new Map(); data.leads.forEach((lead) => { const key = new Date(lead.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }); const row = map.get(key) || { date: key, leads: 0, converted: 0 }; row.leads += 1; if (lead.status === "sale") row.converted += 1; map.set(key, row); }); return [...map.values()].slice(-14); }, [data.leads]);
  const funnel = useMemo(() => { const status = data.leadSummary?.byStatus || {}; return [{ name: "New", value: status.new_lead || 0 }, { name: "Interested", value: status.interested || 0 }, { name: "Follow up", value: status.follow_up || 0 }, { name: "Site visit", value: status.site_visit || 0 }, { name: "Converted", value: status.sale || 0 }]; }, [data.leadSummary]);
  const reportLocations = useMemo(() => mergeRows(locationView === "state" ? data.projects?.stateWise : data.projects?.cityWise, locationView === "state" ? data.properties?.stateWise : data.properties?.cityWise).slice(0, 8), [data.projects, data.properties, locationView]);
  const detailedLeads = useMemo(() => { const query = recordSearch.trim().toLowerCase(); return data.leads.filter((lead) => !query || [lead.name, lead.phone, lead.email, lead.project?.title, lead.project?.city, lead.status].some((value) => String(value || "").toLowerCase().includes(query))); }, [data.leads, recordSearch]);
  const teamRows = useMemo(() => { const map = new Map(); locationUsers.forEach((user) => { const key = user.roleName || "unassigned"; const row = map.get(key) || { role: title(key), total: 0, active: 0 }; row.total += 1; if (user.accountStatus === "active" && user.isActive !== false) row.active += 1; map.set(key, row); }); return [...map.values()].sort((a, b) => b.total - a.total).slice(0, 8); }, [locationUsers]);

  const update = (key, value) => setFilters((current) => ({ ...current, [key]: value, ...(key === "state" ? { city: "", locality: "" } : {}), ...(key === "city" ? { locality: "" } : {}) }));
  const reset = () => { setFilters(initialFilters); setApplied(initialFilters); };
  const apply = (event) => { event.preventDefault(); setApplied(filters); };
  const exportReport = (format) => {
    const rows = data.leads.map((lead) => ({ Date: lead.createdAt ? new Date(lead.createdAt).toLocaleDateString("en-IN") : "", Lead: lead.name, Phone: lead.phone, Email: lead.email, Status: title(lead.status), Source: title(lead.source), Project: lead.project?.title, Location: [lead.project?.locality, lead.project?.city, lead.project?.state].filter(Boolean).join(", ") }));
    if (!rows.length) return toast.error("No detailed records are available to export");
    setExporting(true); const sheet = XLSX.utils.json_to_sheet(rows); const book = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(book, sheet, "Operations Report"); XLSX.writeFile(book, `operations-report-${today()}.${format === "csv" ? "csv" : "xlsx"}`, { bookType: format === "csv" ? "csv" : "xlsx" }); setExporting(false);
  };

  if (loading && !data.projects?.overview) return <div className="grid min-h-[65vh] place-items-center"><div className="text-center"><RefreshCw className="mx-auto animate-spin text-emerald-600" /><p className="mt-3 text-sm text-slate-500">Loading operations analytics…</p></div></div>;

  return <div className="mx-auto w-full max-w-none space-y-2 pb-4 text-slate-900">
    <header className="flex items-end justify-between gap-3"><div><h1 className="text-xl font-black leading-6 tracking-tight">{reportMode ? "Operations Reports" : "Operations Overview"}</h1><p className="text-[9px] text-slate-500">{reportMode ? "Analyse performance across projects, leads, teams and locations." : "Live business health across projects, leads, teams and locations."}</p></div><div className="flex gap-1.5">{!reportMode && <><select value={filters.role} onChange={(event) => { update("role", event.target.value); setApplied((current) => ({ ...current, role: event.target.value })); }} className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-[9px] font-semibold"><option value="">All Roles</option>{roleOptions.map((role) => <option key={role} value={role}>{title(role)}</option>)}</select><select value={filters.state} onChange={(event) => { update("state", event.target.value); setApplied((current) => ({ ...current, state: event.target.value, city: "", locality: "" })); }} className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-[9px] font-semibold"><option value="">All States</option>{states.map((state) => <option key={state}>{state}</option>)}</select><button onClick={() => navigate("/operations/reports")} className="flex h-8 items-center gap-1.5 rounded-lg bg-slate-950 px-3 text-[9px] font-bold text-white"><BarChart3 size={12} /> View detailed reports</button></>}{reportMode && <><button disabled={exporting} onClick={() => exportReport("csv")} className="flex h-8 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 text-[9px] font-bold text-slate-600"><Download size={12} /> CSV</button><button disabled={exporting} onClick={() => exportReport("xlsx")} className="flex h-8 items-center gap-1 rounded-lg bg-emerald-600 px-2.5 text-[9px] font-bold text-white"><FileSpreadsheet size={12} /> Excel</button><button onClick={() => window.print()} className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-[9px] font-bold text-slate-600">Print / PDF</button></>}<button onClick={load} className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500"><RefreshCw size={13} className={loading ? "animate-spin" : ""} /></button></div></header>

    {reportMode && <form onSubmit={apply} className="grid grid-cols-6 gap-1.5 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
      <DateInput label="From" value={filters.from} max={filters.to} onChange={(value) => update("from", value)} /><DateInput label="To" value={filters.to} min={filters.from} onChange={(value) => update("to", value)} />
      <Select label="Compare with" value={compareWith} onChange={setCompareWith}><option value="previous">Previous period</option><option value="none">No comparison</option></Select>
      <Select label="Role" value={filters.role} onChange={(value) => update("role", value)}><option value="">All roles</option>{roleOptions.map((role) => <option key={role} value={role}>{title(role)}</option>)}</Select>
      <Select label="Team" value={teamFilter} onChange={setTeamFilter}><option value="">All teams</option>{roleOptions.map((role) => <option key={role} value={role}>{title(role)}</option>)}</Select>
      <Select label="State" value={filters.state} onChange={(value) => update("state", value)}><option value="">All states</option>{states.map((state) => <option key={state}>{state}</option>)}</Select>
      <Select label="City" value={filters.city} onChange={(value) => update("city", value)}><option value="">All cities</option>{cities.map((city) => <option key={city}>{city}</option>)}</Select>
      <Select label="Locality" value={filters.locality} onChange={(value) => update("locality", value)}><option value="">All localities</option>{localities.map((locality) => <option key={locality}>{locality}</option>)}</Select>
      <Select label="Project type" value={projectTypeFilter} onChange={setProjectTypeFilter}><option value="">All project types</option>{categoryRows.map((row) => <option key={row.name} value={row.name}>{row.name}</option>)}</Select>
      <button className="mt-auto flex h-8 items-center justify-center gap-1 rounded-lg bg-emerald-600 px-2 text-[9px] font-bold text-white"><Filter size={12} /> Apply filters</button><button type="button" onClick={() => { reset(); setCompareWith("previous"); setTeamFilter(""); setProjectTypeFilter(""); }} className="mt-auto flex h-8 items-center justify-center gap-1 rounded-lg border border-slate-200 text-[9px] font-bold text-slate-600"><RotateCcw size={12} /> Reset</button>
    </form>}

    {reportMode ? <section className="grid grid-cols-4 gap-1.5"><Metric icon={Users} label="Total leads" value={fmt(totalLeads)} note="Selected reporting period" /><Metric icon={Activity} label="Converted" value={fmt(converted)} note="Successfully converted leads" tone="blue" /><Metric icon={BarChart3} label="Conversion rate" value={`${conversion}%`} note="Live lead conversion" tone="emerald" /><Metric icon={Building2} label="Pipeline inventory" value={fmt(activeInventory)} note="Active projects and properties" tone="violet" /></section> : <section className="grid grid-cols-6 gap-1.5"><Metric icon={Building2} label="Active projects" value={fmt(projectOverview.activeProjects)} note={`${fmt(projectOverview.totalProjects)} total projects`} /><Metric icon={Building2} label="Total properties" value={fmt(propertyOverview.totalProperties)} note={`${fmt(propertyOverview.activeProperties)} active`} tone="blue" /><Metric icon={Users} label="New leads" value={fmt(totalLeads)} note={`${fmt(converted)} converted`} tone="violet" /><Metric icon={Activity} label="Conversion" value={`${conversion}%`} note="Selected period" tone="emerald" /><Metric icon={AlertTriangle} label="Pending approvals" value={fmt(pending)} note="Projects and properties" tone="amber" /><Metric icon={AlertTriangle} label="Open tickets" value={fmt(data.tickets?.open)} note={`${fmt(data.tickets?.overdue)} overdue`} tone="rose" /></section>}

    {!reportMode ? <>
      <section className="grid grid-cols-12 gap-2"><Panel title="Leads & conversions" subtitle="Recent enquiry activity from live lead records" className="col-span-6"><div className="h-52 p-2"><ResponsiveContainer width="100%" height="100%"><AreaChart data={leadTrend}><defs><linearGradient id="leadFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0"/><XAxis dataKey="date" tick={{ fontSize: 10 }}/><YAxis tick={{ fontSize: 10 }}/><Tooltip/><Area type="monotone" dataKey="leads" stroke="#10b981" fill="url(#leadFill)" strokeWidth={2}/><Area type="monotone" dataKey="converted" stroke="#0f172a" fill="transparent" strokeWidth={2}/></AreaChart></ResponsiveContainer></div></Panel><Panel title="Property Pipeline" subtitle="Live inventory by workflow status" className="col-span-3"><PipelineVisualization rows={pipeline} /></Panel><Panel title="Department Performance" subtitle="Active team members by role" className="col-span-3"><DepartmentPerformance rows={teamRows} /></Panel></section>
      <section className="grid grid-cols-12 gap-2">
        <Panel title="Location performance" subtitle="Combined projects and properties" className="col-span-5">
          <div className="flex h-[280px] flex-col">
            <div className="min-h-0 flex-1 overflow-auto"><table className="w-full text-left text-xs"><thead className="sticky top-0 z-10 bg-slate-50 text-[9px] uppercase text-slate-400"><tr><th className="px-4 py-2">Location</th><th>Total</th><th>Active</th><th>Pending</th></tr></thead><tbody>{locations.map((row) => <tr key={row.name} className="border-t border-slate-100"><td className="px-4 py-2.5 font-bold">{row.name}</td><td>{fmt(row.total)}</td><td className="text-emerald-600">{fmt(row.active)}</td><td className="text-amber-600">{fmt(row.pending)}</td></tr>)}</tbody></table></div>
            <button type="button" onClick={() => navigate("/locations")} className="flex h-9 shrink-0 items-center gap-1 border-t border-slate-100 px-4 text-[10px] font-bold text-emerald-600 hover:bg-emerald-50">View all locations <ArrowRight size={12} /></button>
          </div>
        </Panel>
        <Panel title="Attention required" subtitle="Items needing operational follow-up" className="col-span-3"><div className="h-[280px] space-y-2 overflow-y-auto p-3"><div className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800"><strong>{fmt(pending)} pending reviews</strong><p className="mt-1 text-[10px]">Projects and properties awaiting action.</p></div><div className="rounded-xl bg-blue-50 p-3 text-xs text-blue-800"><strong>{fmt(data.leadSummary?.byStatus?.new_lead)} new leads</strong><p className="mt-1 text-[10px]">Review and assign current enquiries.</p></div><div className="rounded-xl bg-rose-50 p-3 text-xs text-rose-800"><strong>{fmt(data.tickets?.open)} open tickets</strong><p className="mt-1 text-[10px]">{fmt(data.tickets?.overdue)} tickets are overdue.</p></div><div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-700"><strong>{fmt(data.tickets?.unassigned)} unassigned tickets</strong><p className="mt-1 text-[10px]">Requires team assignment.</p></div></div></Panel>
        <Panel title="Recent projects" subtitle="Newest records returned by the project API" className="col-span-4">
          <div className="flex h-[280px] flex-col"><div className="min-h-0 flex-1 divide-y divide-slate-100 overflow-y-auto">{data.recent.map((project) => <div key={project._id} className="flex items-center justify-between gap-3 px-4 py-2.5"><div className="min-w-0"><p className="truncate text-xs font-bold">{project.title || "Untitled project"}</p><p className="truncate text-[10px] text-slate-400">{[project.locality, project.city, project.state].filter(Boolean).join(", ") || "Location unavailable"}</p></div><span className="rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-bold capitalize text-emerald-700">{title(project.status)}</span></div>)}</div><button type="button" onClick={() => navigate("/projects")} className="flex h-9 shrink-0 items-center gap-1 border-t border-slate-100 px-4 text-[10px] font-bold text-emerald-600 hover:bg-emerald-50">View all projects <ArrowRight size={12} /></button></div>
        </Panel>
      </section>
    </> : <>
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm"><div className="flex min-h-8 items-center gap-1.5 border-b border-slate-100 px-2 text-[8px]"><span className="font-bold text-slate-600">Applied filters:</span>{Object.entries({ ...applied, compare: compareWith, team: teamFilter, projectType: projectTypeFilter }).filter(([, value]) => value).map(([key, value]) => <span key={key} className="rounded-md border border-slate-200 bg-white px-2 py-1 font-semibold capitalize text-slate-500">{title(key)}: {title(value)}</span>)}<button onClick={() => { reset(); setCompareWith("previous"); setTeamFilter(""); setProjectTypeFilter(""); }} className="ml-auto font-bold text-emerald-600">Clear all</button></div><nav className="flex h-8 items-end gap-6 px-2">{[["summary","Executive Summary"],["funnel","Lead Funnel"],["projects","Projects"],["revenue","Revenue"],["team","Team Performance"],["locations","Locations"]].map(([key, label]) => <button key={key} onClick={() => setReportTab(key)} className={`h-8 border-b-2 px-1 text-[9px] font-bold ${reportTab === key ? "border-emerald-600 text-emerald-700" : "border-transparent text-slate-500"}`}>{label}</button>)}</nav></div>
      <section className="grid grid-cols-12 gap-2"><Panel title="Lead & conversion trend" subtitle="Detailed records in the selected period" className="col-span-6"><div className="h-52 p-2"><ResponsiveContainer width="100%" height="100%"><BarChart data={leadTrend}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0"/><XAxis dataKey="date" tick={{ fontSize: 10 }}/><YAxis tick={{ fontSize: 10 }}/><Tooltip/><Bar dataKey="leads" fill="#10b981" radius={[4,4,0,0]}/><Bar dataKey="converted" fill="#0f172a" radius={[4,4,0,0]}/></BarChart></ResponsiveContainer></div></Panel><Panel title="Lead funnel" subtitle="Current status distribution" className="col-span-3"><div className="h-52 p-2"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={funnel} dataKey="value" nameKey="name" innerRadius={45} outerRadius={85} paddingAngle={3}>{funnel.map((_, index) => <Cell key={index} fill={COLORS[index]} />)}</Pie><Tooltip/></PieChart></ResponsiveContainer></div></Panel><Panel title="Inventory by category" subtitle="Projects and properties" className="col-span-3"><div className="h-52 p-2"><ResponsiveContainer width="100%" height="100%"><BarChart data={categoryRows} layout="vertical"><CartesianGrid strokeDasharray="3 3"/><XAxis type="number" tick={{ fontSize: 9 }}/><YAxis dataKey="name" type="category" width={72} tick={{ fontSize: 9 }}/><Tooltip/><Bar dataKey="total" fill="#10b981" radius={[0,4,4,0]}/></BarChart></ResponsiveContainer></div></Panel></section>
      <section className="grid grid-cols-2 gap-2"><Panel title="Team performance scope" subtitle="Role-based headcount and activation"><div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="bg-slate-50 text-[9px] uppercase text-slate-400"><tr><th className="px-4 py-2">Role</th><th>Members</th><th>Active</th><th>Activation</th></tr></thead><tbody>{teamRows.map((row) => <tr key={row.role} className="border-t border-slate-100"><td className="px-4 py-2.5 font-bold">{row.role}</td><td>{row.total}</td><td>{row.active}</td><td className="font-bold text-emerald-600">{row.total ? Math.round(row.active / row.total * 100) : 0}%</td></tr>)}</tbody></table></div></Panel><Panel title="Location comparison" subtitle="Inventory performance by state"><div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="bg-slate-50 text-[9px] uppercase text-slate-400"><tr><th className="px-4 py-2">State</th><th>Total</th><th>Active</th><th>Pending</th></tr></thead><tbody>{locations.map((row) => <tr key={row.name} className="border-t border-slate-100"><td className="px-4 py-2.5 font-bold">{row.name}</td><td>{fmt(row.total)}</td><td>{fmt(row.active)}</td><td>{fmt(row.pending)}</td></tr>)}</tbody></table></div></Panel></section>
      <Panel title="Detailed lead records" subtitle={`${fmt(data.leads.length)} records loaded for drill-down`}><div className="overflow-x-auto"><table className="w-full min-w-[950px] text-left text-xs"><thead className="bg-slate-50 text-[9px] uppercase text-slate-400"><tr>{["Date","Lead","Contact","Project / property","Location","Source","Status"].map((heading) => <th key={heading} className="px-4 py-3">{heading}</th>)}</tr></thead><tbody>{data.leads.slice(0, 30).map((lead) => <tr key={lead._id} className="border-t border-slate-100 hover:bg-emerald-50/40"><td className="whitespace-nowrap px-4 py-3">{lead.createdAt ? new Date(lead.createdAt).toLocaleDateString("en-IN") : "—"}</td><td className="font-bold">{lead.name || "Unnamed"}</td><td><p>{lead.phone || "—"}</p><p className="text-[10px] text-slate-400">{lead.email}</p></td><td className="max-w-[220px] truncate font-semibold">{lead.project?.title || "—"}</td><td>{[lead.project?.locality, lead.project?.city, lead.project?.state].filter(Boolean).join(", ") || "—"}</td><td>{title(lead.source)}</td><td><span className="rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-bold text-emerald-700">{title(lead.status)}</span></td></tr>)}</tbody></table>{!data.leads.length && <p className="p-12 text-center text-sm text-slate-400">No detailed records match the selected filters.</p>}</div></Panel>
    </>}
  </div>;
}
