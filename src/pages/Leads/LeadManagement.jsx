import { useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, ChevronLeft, ChevronRight, Download, FileSpreadsheet, Filter, Loader2, MapPin, RotateCcw, Search, Users, X } from "lucide-react";
import { apiClient } from "../../api/apiClient";

const categories = ["all", "featured", "residential", "commercial", "land", "agricultural"];
const statuses = ["", "new_lead", "interested", "not_interested", "follow_up", "site_visit", "sale"];
const categoryLabels = { all: "All project & property leads", featured: "Featured project leads", residential: "Residential property leads", commercial: "Commercial property leads", land: "Land property leads", agricultural: "Agricultural property leads" };
const initial = { search: "", category: "all", projectId: "", status: "", source: "all", state: "", city: "", locality: "", from: "", to: "", page: 1, limit: 20 };
const label = (value) => value ? value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()) : "All";
const tone = { featured: "bg-violet-50 text-violet-700", residential: "bg-blue-50 text-blue-700", commercial: "bg-amber-50 text-amber-700", land: "bg-emerald-50 text-emerald-700", agricultural: "bg-lime-50 text-lime-700" };
const statusTone = { new_lead: "bg-blue-50 text-blue-700", interested: "bg-emerald-50 text-emerald-700", not_interested: "bg-rose-50 text-rose-700", sale: "bg-violet-50 text-violet-700" };

const Select = ({ value, onChange, children, className = "" }) => <select value={value} onChange={(event) => onChange(event.target.value)} className={`h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 ${className}`}>{children}</select>;

export default function LeadManagement() {
  const [filters, setFilters] = useState(initial);
  const [searchInput, setSearchInput] = useState("");
  const [data, setData] = useState({ leads: [], summary: { total: 0, byCategory: {}, byStatus: {}, bySource: {} }, projects: [], facets: { states: [], cities: [], localities: [] }, pagination: { page: 1, pages: 0, total: 0 } });
  const [projectCatalog, setProjectCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [projectPickerOpen, setProjectPickerOpen] = useState(false);
  const [projectSearch, setProjectSearch] = useState("");
  const [exporting, setExporting] = useState("");

  useEffect(() => { const timer = setTimeout(() => setFilters((old) => old.search === searchInput ? old : ({ ...old, search: searchInput, page: 1 })), 350); return () => clearTimeout(timer); }, [searchInput]);
  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true); setError("");
      try {
        const params = Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== "" && value !== "all"));
        const response = await apiClient.get("/api/properties/leads/admin/overview", { params });
        if (active) {
          setData(response.data.data);
          setProjectCatalog((current) => [...new Map([...current, ...response.data.data.projects].map((project) => [String(project._id), project])).values()]);
        }
      } catch (requestError) { if (active) setError(requestError?.response?.data?.message || requestError.message || "Unable to load leads"); }
      finally { if (active) { setLoading(false); setHasLoaded(true); } }
    };
    load(); return () => { active = false; };
  }, [filters]);

  const update = (key, value) => setFilters((old) => ({ ...old, [key]: value, ...(key !== "page" ? { page: 1 } : {}), ...(key === "state" ? { city: "", locality: "" } : {}), ...(key === "city" ? { locality: "" } : {}) }));
  const activeCount = useMemo(() => [filters.category !== "all", filters.projectId, filters.status, filters.source !== "all", filters.state, filters.city, filters.locality, filters.from, filters.to].filter(Boolean).length, [filters]);
  const reset = () => { setSearchInput(""); setFilters(initial); };
  const selectedProjectIds = useMemo(() => filters.projectId.split(",").filter(Boolean), [filters.projectId]);
  const availableProjects = useMemo(() => projectCatalog.filter((project) => {
    const categoryMatch = filters.category === "all" || project.category === filters.category;
    const term = projectSearch.trim().toLowerCase();
    return categoryMatch && (!term || [project.title, project.code, project.city, project.locality].some((value) => String(value || "").toLowerCase().includes(term)));
  }), [projectCatalog, filters.category, projectSearch]);
  const toggleProject = (id) => {
    const next = selectedProjectIds.includes(id) ? selectedProjectIds.filter((value) => value !== id) : [...selectedProjectIds, id];
    update("projectId", next.join(","));
  };
  const downloadLeads = async (format) => {
    setExporting(format);
    try {
      const params = Object.fromEntries(Object.entries({ ...filters, format }).filter(([key, value]) => key !== "page" && key !== "limit" && value !== "" && value !== "all"));
      const response = await apiClient.get("/api/properties/leads/admin/export", { params, responseType: "blob" });
      const url = URL.createObjectURL(response.data);
      const anchor = document.createElement("a");
      anchor.href = url; anchor.download = `leads-${new Date().toISOString().slice(0, 10)}.${format === "xlsx" ? "xlsx" : "csv"}`;
      document.body.appendChild(anchor); anchor.click(); anchor.remove(); URL.revokeObjectURL(url);
    } catch (requestError) { setError(requestError.message || "Unable to export leads"); }
    finally { setExporting(""); }
  };
  const projectLeadCount = data.summary.byCategory.featured || 0;
  const propertyLeadCount = ["residential", "commercial", "land", "agricultural"].reduce((sum, key) => sum + (data.summary.byCategory[key] || 0), 0);
  const cards = [
    ["Total leads", hasLoaded ? data.summary.total : null, `${projectLeadCount} project · ${propertyLeadCount} property`, Users, "bg-emerald-500"],
    ["Project leads", hasLoaded ? projectLeadCount : null, "Enquiries for featured projects", MapPin, "bg-violet-500"],
    ["Property leads", hasLoaded ? propertyLeadCount : null, "Residential, commercial, land & agricultural", Filter, "bg-blue-500"],
    ["New leads", hasLoaded ? data.summary.byStatus.new_lead || 0 : null, `${data.summary.byStatus.sale || 0} converted to Sale`, Users, "bg-amber-500"],
  ];

  return <div className="min-h-full bg-slate-50/70 p-4 sm:p-6">
    <div className="mx-auto max-w-[1600px] space-y-5">
      <header>
        <div><p className="mb-1 text-[10px] font-bold uppercase tracking-[.22em] text-emerald-600">Sales intelligence</p><h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Lead management</h1><p className="mt-1 text-xs text-slate-500">One workspace for featured projects and every property enquiry.</p></div>
      </header>
      <section className="grid grid-cols-2 gap-2 lg:grid-cols-4">{cards.map(([title, value, note, Icon, color]) => <div key={title} className="rounded-xl border border-slate-100 bg-white px-3 py-2.5 shadow-sm"><div className="flex items-start justify-between gap-2"><div className="min-w-0"><p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 sm:text-[10px]">{title}</p>{value === null ? <div className="mt-2 h-5 w-12 animate-pulse rounded bg-slate-100"/> : <p className="mt-1 text-lg font-bold leading-6 text-slate-900 sm:text-xl">{value}</p>}<p className="mt-0.5 truncate text-[9px] text-slate-400" title={note}>{note}</p></div><span className={`rounded-lg p-2 text-white ${color}`}><Icon className="h-3.5 w-3.5"/></span></div></div>)}</section>
      <section className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
        <div className="flex items-center justify-between lg:hidden"><button onClick={() => setFiltersOpen((open) => !open)} className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-semibold"><Filter className="h-4 w-4"/> Filters {activeCount > 0 && <span className="rounded-full bg-emerald-500 px-1.5 text-white">{activeCount}</span>}</button><button onClick={reset} className="p-2 text-slate-500"><RotateCcw className="h-4 w-4"/></button></div>
        <div className={`${filtersOpen ? "grid" : "hidden"} mt-3 grid-cols-1 gap-2 sm:grid-cols-2 lg:mt-0 lg:grid lg:grid-cols-5 xl:grid-cols-10`}>
          <Select value={filters.category} onChange={(v) => update("category", v)}>{categories.map((v) => <option key={v} value={v}>{categoryLabels[v]}</option>)}</Select>
          <div className="relative lg:col-span-2">
            <button type="button" onClick={() => setProjectPickerOpen((open) => !open)} className="flex min-h-10 w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-xs font-medium text-slate-700 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100">
              <span className="truncate">{selectedProjectIds.length ? `${selectedProjectIds.length} selected` : "All projects / properties"}</span><ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition ${projectPickerOpen ? "rotate-180" : ""}`}/>
            </button>
            {projectPickerOpen && <div className="absolute left-0 top-full z-50 mt-2 w-full min-w-[310px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
              <div className="border-b border-slate-100 p-3"><div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"/><input autoFocus value={projectSearch} onChange={(event) => setProjectSearch(event.target.value)} placeholder="Search projects or properties..." className="h-10 w-full rounded-xl border border-slate-200 pl-9 pr-3 text-xs outline-none focus:border-emerald-400"/></div></div>
              <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2"><span className="text-[10px] font-semibold text-slate-400">{selectedProjectIds.length} selected</span>{selectedProjectIds.length > 0 && <button onClick={() => update("projectId", "")} className="text-[10px] font-bold text-rose-500">Clear all</button>}</div>
              <div className="max-h-72 overflow-y-auto p-1.5">{availableProjects.length ? availableProjects.map((project) => { const checked = selectedProjectIds.includes(String(project._id)); return <button type="button" key={project._id} onClick={() => toggleProject(String(project._id))} className={`flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition ${checked ? "bg-emerald-50" : "hover:bg-slate-50"}`}><span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${checked ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300"}`}>{checked && <Check className="h-3 w-3"/>}</span><span className="min-w-0"><span className="block truncate text-xs font-semibold text-slate-700">{project.title}</span><span className="block truncate text-[9px] text-slate-400">{label(project.category)} · {[project.locality, project.city].filter(Boolean).join(", ") || project.code || "Location unavailable"}</span></span></button>; }) : <p className="px-3 py-8 text-center text-xs text-slate-400">No matching projects or properties</p>}</div>
              <div className="border-t border-slate-100 p-2"><button onClick={() => setProjectPickerOpen(false)} className="h-9 w-full rounded-xl bg-emerald-500 text-xs font-bold text-white hover:bg-emerald-600">Apply selection</button></div>
            </div>}
          </div>
          <Select value={filters.status} onChange={(v) => update("status", v)}><option value="">All statuses</option>{statuses.filter(Boolean).map((v) => <option key={v} value={v}>{label(v)}</option>)}</Select>
          <Select value={filters.source} onChange={(v) => update("source", v)}>{["all", "site", "imported", "direct"].map((v) => <option key={v} value={v}>{label(v)} leads</option>)}</Select>
          <Select value={filters.state} onChange={(v) => update("state", v)}><option value="">All states</option>{data.facets.states.map((v) => <option key={v}>{v}</option>)}</Select>
          <Select value={filters.city} onChange={(v) => update("city", v)}><option value="">All cities</option>{data.facets.cities.map((v) => <option key={v}>{v}</option>)}</Select>
          <Select value={filters.locality} onChange={(v) => update("locality", v)}><option value="">All localities</option>{data.facets.localities.map((v) => <option key={v}>{v}</option>)}</Select>
          <input type="date" value={filters.from} onChange={(e) => update("from", e.target.value)} className="h-10 rounded-xl border border-slate-200 px-3 text-xs text-slate-600 outline-none focus:border-emerald-400" title="From date"/>
          <div className="flex gap-2"><input type="date" value={filters.to} onChange={(e) => update("to", e.target.value)} className="h-10 min-w-0 flex-1 rounded-xl border border-slate-200 px-3 text-xs text-slate-600 outline-none focus:border-emerald-400" title="To date"/><button onClick={reset} className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 lg:flex" title="Reset"><RotateCcw className="h-4 w-4"/></button></div>
        </div>
        {selectedProjectIds.length > 0 && <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-3"><span className="mr-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Selected</span>{selectedProjectIds.map((id) => { const project = projectCatalog.find((item) => String(item._id) === id); return <span key={id} className="flex max-w-[240px] items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700"><span className="truncate">{project?.title || id}</span><button onClick={() => toggleProject(id)} className="rounded-full hover:bg-emerald-100"><X className="h-3 w-3"/></button></span>; })}<button onClick={() => update("projectId", "")} className="ml-1 text-[10px] font-bold text-rose-500">Clear all</button></div>}
      </section>
      <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-3"><div className="flex flex-col gap-3 lg:flex-row lg:items-center"><div className="shrink-0 lg:w-40"><h2 className="text-sm font-bold text-slate-800">Lead directory</h2><p className="text-[10px] text-slate-400">{data.pagination.total} matching records {selectedProjectIds.length > 0 && `from ${selectedProjectIds.length} selected items`}</p></div><div className="relative min-w-0 flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"/><input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search name, phone, email, project or location" className="h-9 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-9 text-xs outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"/>{searchInput && <button onClick={() => setSearchInput("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"><X className="h-3.5 w-3.5"/></button>}</div><div className="flex shrink-0 items-center gap-2"><button disabled={loading || exporting} onClick={() => downloadLeads("csv")} className="flex h-9 items-center gap-2 rounded-xl border border-slate-200 px-3 text-[10px] font-bold text-slate-600 transition hover:border-emerald-300 hover:text-emerald-700 disabled:opacity-50">{exporting === "csv" ? <Loader2 className="h-3.5 w-3.5 animate-spin"/> : <Download className="h-3.5 w-3.5"/>} CSV</button><button disabled={loading || exporting} onClick={() => downloadLeads("xlsx")} className="flex h-9 items-center gap-2 rounded-xl bg-emerald-500 px-3 text-[10px] font-bold text-white transition hover:bg-emerald-600 disabled:opacity-50">{exporting === "xlsx" ? <Loader2 className="h-3.5 w-3.5 animate-spin"/> : <FileSpreadsheet className="h-3.5 w-3.5"/>} Excel</button>{loading && <Loader2 className="h-4 w-4 animate-spin text-emerald-500"/>}</div></div></div>
        {error ? <div className="p-12 text-center text-sm text-rose-600">{error}</div> : !loading && !data.leads.length ? <div className="p-16 text-center"><Users className="mx-auto mb-3 h-8 w-8 text-slate-300"/><p className="text-sm font-semibold text-slate-600">No leads found</p><p className="mt-1 text-xs text-slate-400">Try clearing some filters.</p></div> : <div className="overflow-x-auto"><table className="w-full min-w-[1050px] text-left"><thead className="bg-slate-50 text-[9px] uppercase tracking-wider text-slate-400"><tr>{["Lead", "Contact", "Project / property", "Location", "Category", "Source", "Status", "Created"].map((h) => <th key={h} className="px-4 py-3 font-bold">{h}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{data.leads.map((lead) => <tr key={lead._id} className="transition hover:bg-emerald-50/30"><td className="px-4 py-3"><p className="text-xs font-semibold text-slate-800">{lead.name}</p><p className="mt-0.5 max-w-[150px] truncate text-[10px] text-slate-400">{lead.message || lead.purchaseTimeline || "No note"}</p></td><td className="px-4 py-3"><p className="text-xs text-slate-700">{lead.phone}</p><p className="text-[10px] text-slate-400">{lead.email || "—"}</p></td><td className="px-4 py-3"><p className="max-w-[210px] truncate text-xs font-semibold text-slate-700">{lead.project.title}</p><p className="text-[10px] text-slate-400">{lead.project.code || "No property code"}</p></td><td className="px-4 py-3 text-[10px] text-slate-600">{[lead.project.locality, lead.project.city, lead.project.state].filter(Boolean).join(", ") || "—"}</td><td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-[9px] font-bold ${tone[lead.project.category] || "bg-slate-100 text-slate-600"}`}>{label(lead.project.category)}</span></td><td className="px-4 py-3 text-[10px] font-semibold text-slate-600">{label(lead.source)}</td><td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-[9px] font-bold ${statusTone[lead.status] || "bg-slate-100 text-slate-600"}`}>{label(lead.status)}</span></td><td className="whitespace-nowrap px-4 py-3 text-[10px] text-slate-500">{new Date(lead.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</td></tr>)}</tbody></table></div>}
        <footer className="flex items-center justify-between border-t border-slate-100 px-4 py-3"><p className="text-[10px] text-slate-400">Showing {data.pagination.total ? ((data.pagination.page - 1) * filters.limit) + 1 : 0}–{Math.min(data.pagination.page * filters.limit, data.pagination.total)} of {data.pagination.total} leads · Page {data.pagination.page} of {Math.max(1, data.pagination.pages)}</p><div className="flex gap-2"><button disabled={filters.page <= 1} onClick={() => update("page", filters.page - 1)} className="rounded-lg border border-slate-200 p-2 text-slate-500 disabled:opacity-30"><ChevronLeft className="h-4 w-4"/></button><button disabled={filters.page >= data.pagination.pages} onClick={() => update("page", filters.page + 1)} className="rounded-lg border border-slate-200 p-2 text-slate-500 disabled:opacity-30"><ChevronRight className="h-4 w-4"/></button></div></footer>
      </section>
    </div>
  </div>;
}
