import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Check, ChevronDown, ChevronLeft, ChevronRight, Download, FileSpreadsheet, Filter, Loader2, MapPin, RotateCcw, Search, Users, X } from "lucide-react";
import { apiClient } from "../../api/apiClient";
import { rangeFromPreset, todayIso } from "../Dashboards/shared/dashboardDateRange";
import AnimatedPills from "../../components/common/AnimatedPills";
import LeadDetailDrawer from "./LeadDetailDrawer";
import { saInset, saSurface, saSurfaceHover } from "../Dashboards/superAdminDashboard/dashboardSurface";

const lmInput =
  "h-10 w-full min-w-0 rounded-xl border border-[#b7e4c7] bg-white px-3 text-xs font-medium text-[#0f3d2e] outline-none transition focus:border-[#27AE60] focus:ring-2 focus:ring-[#27AE60]/15";
const lmIconTile = "border-[#b7e4c7] bg-[#e8f8ee] text-[#128C45]";
const lmPill =
  "inline-flex items-center justify-center rounded-full border border-emerald-100 bg-white text-[#0f3d2e] shadow-[0_4px_12px_rgba(16,185,129,0.08)] hover:bg-emerald-50";

const categories = ["all", "featured", "residential", "commercial", "land", "agricultural"];
const statuses = ["", "new_lead", "interested", "not_interested", "follow_up", "site_visit", "sale"];
const categoryLabels = {
  all: "All project & property leads",
  featured: "Project leads",
  residential: "Residential property leads",
  commercial: "Commercial property leads",
  land: "Land property leads",
  agricultural: "Agricultural property leads",
};
const DATE_PRESETS_COMPACT = [
  { key: "all", label: "All" },
  { key: "today", label: "Today" },
  { key: "7d", label: "7D" },
  { key: "30d", label: "30D" },
];
const emptyData = {
  leads: [],
  summary: { total: 0, byCategory: {}, byStatus: {}, bySource: {} },
  projects: [],
  facets: { states: [], cities: [], localities: [] },
  pagination: { page: 1, pages: 0, total: 0 },
};
const label = (value) => (value ? value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()) : "All");
const tone = {
  featured: "bg-violet-50 text-violet-700 ring-1 ring-violet-100",
  residential: "bg-blue-50 text-blue-700 ring-1 ring-blue-100",
  commercial: "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
  land: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
  agricultural: "bg-lime-50 text-lime-700 ring-1 ring-lime-100",
};

/** Project promotion badge - "featured" type displays as Top Selling (never "Featured"). */
const promotionLabel = (type) => {
  const key = String(type || "normal")
    .trim()
    .toLowerCase();
  if (key === "featured" || key === "top_selling" || key === "topselling") {
    return "Top Selling";
  }
  if (key === "prime") return "Prime";
  if (key === "sponsored") return "Sponsored";
  if (key === "normal") return "Normal";
  return label(key);
};

const promotionTone = {
  "top selling": "bg-rose-50 text-rose-700 ring-1 ring-rose-100",
  featured: "bg-rose-50 text-rose-700 ring-1 ring-rose-100",
  top_selling: "bg-rose-50 text-rose-700 ring-1 ring-rose-100",
  prime: "bg-amber-50 text-amber-800 ring-1 ring-amber-100",
  sponsored: "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100",
  normal: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
};

const categoryDisplay = (project = {}) => {
  if (String(project.category || "").toLowerCase() === "featured") {
    const promo = String(project.promotionType || "normal").toLowerCase();
    const text = promotionLabel(promo);
    const toneKey =
      promo === "featured" || promo === "top_selling" || promo === "topselling"
        ? "top selling"
        : promo || "normal";
    return {
      text,
      className: promotionTone[toneKey] || promotionTone.normal,
    };
  }
  return {
    text: label(project.category),
    className: tone[project.category] || "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
  };
};
/** Each status has its own color - New Lead stands out. */
const statusTone = {
  new_lead: "bg-sky-500 text-white ring-1 ring-sky-400",
  interested: "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200",
  follow_up: "bg-amber-100 text-amber-800 ring-1 ring-amber-200",
  site_visit: "bg-cyan-100 text-cyan-800 ring-1 ring-cyan-200",
  sale: "bg-violet-100 text-violet-800 ring-1 ring-violet-200",
  not_interested: "bg-rose-100 text-rose-800 ring-1 ring-rose-200",
};
const rowTone = {
  new_lead: "bg-sky-50/50 hover:bg-sky-50",
  interested: "hover:bg-emerald-50/50",
  follow_up: "hover:bg-amber-50/50",
  site_visit: "hover:bg-cyan-50/40",
  sale: "hover:bg-violet-50/50",
  not_interested: "hover:bg-rose-50/40",
};

const detectPreset = (from, to) => {
  if (!from && !to) return "all";
  const today = rangeFromPreset("today");
  if (from === today.from && to === today.to) return "today";
  const week = rangeFromPreset("7d");
  if (from === week.from && to === week.to) return "7d";
  const month = rangeFromPreset("30d");
  if (from === month.from && to === month.to) return "30d";
  return "custom";
};

const filtersFromSearchParams = (searchParams) => {
  const joined = searchParams.get("joined") || searchParams.get("date") || "";
  const day = joined === "today" ? todayIso() : joined && /^\d{4}-\d{2}-\d{2}$/.test(joined) ? joined : "";
  const from = day || searchParams.get("from") || "";
  const to = day || searchParams.get("to") || "";
  const category = searchParams.get("category") || "all";
  return {
    search: searchParams.get("search") || "",
    category: categories.includes(category) ? category : "all",
    projectId: searchParams.get("projectId") || "",
    status: searchParams.get("status") || "",
    source: searchParams.get("source") || "all",
    state: searchParams.get("state") || "",
    city: searchParams.get("city") || "",
    locality: searchParams.get("locality") || "",
    from,
    to,
    page: Math.max(1, Number(searchParams.get("page")) || 1),
    limit: 12,
  };
};

const PAGE_SIZE = 12;

const Select = ({ value, onChange, children, className = "" }) => (
  <select
    value={value}
    onChange={(event) => onChange(event.target.value)}
    className={`${lmInput} ${className}`}
  >
    {children}
  </select>
);

const Field = ({ label, children, className = "" }) => (
  <label className={`flex min-w-0 flex-col gap-1 ${className}`}>
    <span className="text-[10px] font-bold uppercase tracking-wider text-[#5c7d6d]">{label}</span>
    {children}
  </label>
);

export default function LeadManagement() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState(() => filtersFromSearchParams(searchParams));
  const [searchInput, setSearchInput] = useState(() => searchParams.get("search") || "");
  const [datePreset, setDatePreset] = useState(() => {
    const next = filtersFromSearchParams(searchParams);
    return detectPreset(next.from, next.to);
  });
  const [data, setData] = useState(emptyData);
  const [projectCatalog, setProjectCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [projectPickerOpen, setProjectPickerOpen] = useState(false);
  const [projectSearch, setProjectSearch] = useState("");
  const [exporting, setExporting] = useState("");
  const [selectedLead, setSelectedLead] = useState(null);

  useEffect(() => {
    const next = filtersFromSearchParams(searchParams);
    setFilters((current) => {
      const same = JSON.stringify(current) === JSON.stringify(next);
      return same ? current : next;
    });
    setSearchInput(next.search);
    setDatePreset(detectPreset(next.from, next.to));
  }, [searchParams]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((old) => (old.search === searchInput ? old : { ...old, search: searchInput, page: 1 }));
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const next = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value === "" || value === "all" || (key === "page" && Number(value) === 1) || key === "limit") return;
      next.set(key, String(value));
    });
    const nextQuery = next.toString();
    if (nextQuery !== searchParams.toString()) setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only push URL when filters change
  }, [filters, setSearchParams]);

  const summaryRef = useRef(emptyData.summary);
  const facetsRef = useRef(emptyData.facets);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const params = Object.fromEntries(
          Object.entries({ ...filters, limit: PAGE_SIZE }).filter(([, value]) => value !== "" && value !== "all"),
        );
        if (Number(filters.page) > 1) {
          params.includeSummary = 0;
          params.includeFacets = 0;
        }
        const response = await apiClient.get("/api/properties/leads/admin/overview", {
          params,
          signal: controller.signal,
        });
        const payload = response.data?.data || emptyData;
        if (Number(filters.page) === 1 && payload.summary) {
          summaryRef.current = payload.summary;
        }
        if (Number(filters.page) === 1 && payload.facets) {
          facetsRef.current = payload.facets;
        }
        setData({
          ...payload,
          summary: Number(filters.page) === 1 ? payload.summary || summaryRef.current : summaryRef.current,
          facets: Number(filters.page) === 1 ? payload.facets || facetsRef.current : facetsRef.current,
          pagination: payload.pagination || emptyData.pagination,
        });
        setProjectCatalog((current) => [
          ...new Map([...current, ...(payload.projects || [])].map((project) => [String(project._id), project])).values(),
        ]);
      } catch (requestError) {
        if (requestError?.code === "ERR_CANCELED" || requestError?.name === "CanceledError") return;
        setError(requestError?.response?.data?.message || requestError.message || "Unable to load leads");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
          setHasLoaded(true);
        }
      }
    };
    load();
    return () => controller.abort();
  }, [filters]);

  const update = (key, value) =>
    setFilters((old) => {
      const next = {
        ...old,
        [key]: value,
        ...(key !== "page" ? { page: 1 } : {}),
        ...(key === "state" ? { city: "", locality: "" } : {}),
        ...(key === "city" ? { locality: "" } : {}),
      };
      if (key === "from" || key === "to") {
        if (next.from && next.to && next.from > next.to) {
          if (key === "from") next.to = next.from;
          else next.from = next.to;
        }
        setDatePreset(detectPreset(next.from, next.to));
      }
      if (key === "category" && next.projectId) {
        const allowed = new Set(
          projectCatalog
            .filter((project) => next.category === "all" || project.category === next.category)
            .map((project) => String(project._id)),
        );
        next.projectId = next.projectId.split(",").filter((id) => allowed.has(id)).join(",");
      }
      return next;
    });

  const applyDatePreset = (preset) => {
    if (preset === "custom") return;
    const range = rangeFromPreset(preset);
    setDatePreset(preset);
    setFilters((old) => ({
      ...old,
      from: range.from || "",
      to: range.to || "",
      page: 1,
    }));
  };

  const activeCount = useMemo(
    () =>
      [
        filters.category !== "all",
        filters.projectId,
        filters.status,
        filters.source !== "all",
        filters.state,
        filters.city,
        filters.locality,
        filters.from,
        filters.to,
        filters.search,
      ].filter(Boolean).length,
    [filters],
  );

  const reset = () => {
    setSearchInput("");
    setDatePreset("all");
    setProjectSearch("");
    setFilters({
      search: "",
      category: "all",
      projectId: "",
      status: "",
      source: "all",
      state: "",
      city: "",
      locality: "",
      from: "",
      to: "",
      page: 1,
      limit: PAGE_SIZE,
    });
  };

  const selectedProjectIds = useMemo(() => filters.projectId.split(",").filter(Boolean), [filters.projectId]);
  const availableProjects = useMemo(
    () =>
      projectCatalog.filter((project) => {
        const categoryMatch = filters.category === "all" || project.category === filters.category;
        const term = projectSearch.trim().toLowerCase();
        return (
          categoryMatch &&
          (!term || [project.title, project.code, project.city, project.locality].some((value) => String(value || "").toLowerCase().includes(term)))
        );
      }),
    [projectCatalog, filters.category, projectSearch],
  );

  const toggleProject = (id) => {
    const next = selectedProjectIds.includes(id)
      ? selectedProjectIds.filter((value) => value !== id)
      : [...selectedProjectIds, id];
    update("projectId", next.join(","));
  };

  const downloadLeads = async (format) => {
    setExporting(format);
    try {
      const params = Object.fromEntries(
        Object.entries({ ...filters, format }).filter(
          ([key, value]) => key !== "page" && key !== "limit" && value !== "" && value !== "all",
        ),
      );
      const response = await apiClient.get("/api/properties/leads/admin/export", { params, responseType: "blob" });
      const url = URL.createObjectURL(response.data);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `leads-${new Date().toISOString().slice(0, 10)}.${format === "xlsx" ? "xlsx" : "csv"}`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || requestError.message || "Unable to export leads");
    } finally {
      setExporting("");
    }
  };

  const projectLeadCount = data.summary.byCategory.featured || 0;
  const propertyLeadCount = ["residential", "commercial", "land", "agricultural"].reduce(
    (sum, key) => sum + (data.summary.byCategory[key] || 0),
    0,
  );
  const applyCardFilter = (key) => {
    if (key === "total") {
      setFilters((old) => ({ ...old, category: "all", status: "", page: 1 }));
      return;
    }
    if (key === "featured") {
      setFilters((old) => ({ ...old, category: old.category === "featured" ? "all" : "featured", status: "", page: 1 }));
      return;
    }
    if (key === "property") {
      setFilters((old) => ({
        ...old,
        category: ["residential", "commercial", "land", "agricultural"].includes(old.category) ? "all" : "residential",
        status: "",
        page: 1,
      }));
      return;
    }
    if (key === "new") {
      setFilters((old) => ({ ...old, status: old.status === "new_lead" ? "" : "new_lead", page: 1 }));
    }
  };

  const cards = [
    ["total", "Total leads", hasLoaded ? data.summary.total : null, `${projectLeadCount} project - ${propertyLeadCount} property`, Users, "bg-emerald-500", filters.category === "all" && !filters.status],
    ["featured", "Project leads", hasLoaded ? projectLeadCount : null, "Top Selling - Prime - Normal - Sponsored", MapPin, "bg-violet-500", filters.category === "featured"],
    ["property", "Property leads", hasLoaded ? propertyLeadCount : null, "Residential, commercial, land & agricultural", Filter, "bg-blue-500", ["residential", "commercial", "land", "agricultural"].includes(filters.category)],
    ["new", "New leads", hasLoaded ? data.summary.byStatus.new_lead || 0 : null, `${data.summary.byStatus.sale || 0} converted to Sale`, Users, "bg-amber-500", filters.status === "new_lead"],
  ];

  const renderLeadMobileCard = (lead) => {
    const statusKey = String(lead.status || "new_lead");
    const locationText =
      [lead.project.locality, lead.project.city, lead.project.state].filter(Boolean).join(", ") || "-";
    const display = categoryDisplay(lead.project);
    return (
      <button
        key={lead._id}
        type="button"
        onClick={() => setSelectedLead(lead)}
        className={`w-full rounded-2xl p-3.5 text-left transition active:scale-[0.985] ${saSurface} ${saSurfaceHover} ${rowTone[statusKey] || ""}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-1.5">
              <p className="truncate text-[15px] font-bold text-[#0f3d2e]">{lead.name}</p>
              {lead.duplicateCount > 0 ? (
                <span className="shrink-0 rounded-full bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold text-amber-700">
                  +{lead.duplicateCount}
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-[13px] font-medium text-[#5c7d6d]">{lead.phone || "-"}</p>
            {lead.email ? <p className="mt-0.5 truncate text-[11px] text-[#5c7d6d]">{lead.email}</p> : null}
          </div>
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${statusTone[statusKey] || "bg-slate-100 text-slate-600"}`}
          >
            {label(lead.status)}
          </span>
        </div>
        <div className={`mt-3 rounded-xl px-3 py-2 ${saInset}`}>
          <p className="truncate text-[13px] font-semibold text-[#27AE60]">{lead.project.title}</p>
          <p className="mt-0.5 truncate text-[11px] text-[#5c7d6d]">
            {lead.project.code || "No code"} - {locationText}
          </p>
        </div>
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${display.className}`}>{display.text}</span>
          <span className="rounded-full bg-[#e8f8ee] px-2 py-0.5 text-[10px] font-semibold text-[#5c7d6d]">
            {lead.origin?.label || label(lead.source)}
          </span>
          <span className="ml-auto text-[11px] font-semibold text-[#5c7d6d]">
            {new Date(lead.lastTouchAt || lead.createdAt).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
            })}
          </span>
        </div>
      </button>
    );
  };

  return (
    <div className="min-h-full text-[#0f3d2e]">
      {/* Mobile app layout (< lg) */}
      <div className="mx-auto w-full max-w-lg space-y-4 px-3 pb-10 pt-2 sm:max-w-2xl lg:hidden">
        <header>
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#27AE60]">Sales intelligence</p>
          <h1 className="text-2xl font-semibold tracking-tight text-[#0f3d2e]">Lead management</h1>
          <p className="mt-1 text-xs leading-relaxed text-[#5c7d6d]">
            Unique enquiries only - tap a card for details
          </p>
        </header>

        <section className="grid grid-cols-2 gap-2.5">
          {cards.map(([key, title, value, note, Icon, color, active]) => (
            <button
              key={key}
              type="button"
              onClick={() => applyCardFilter(key)}
              className={`rounded-2xl p-3.5 text-left transition active:scale-[0.98] ${
                active
                  ? "border border-[#27AE60] bg-[#27AE60] text-white shadow-[0_8px_18px_-6px_rgba(39,174,96,0.55)]"
                  : `${saSurface} ${saSurfaceHover}`
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className={`text-[10px] font-bold uppercase tracking-wider ${active ? "text-white/80" : "text-[#5c7d6d]"}`}>{title}</p>
                <span className={`shrink-0 rounded-lg border p-2 ${active ? "border-white/25 bg-white/15 text-white" : lmIconTile}`}>
                  <Icon className="h-4 w-4" />
                </span>
              </div>
              {value === null ? (
                <div className={`mt-2 h-7 w-14 animate-pulse rounded ${active ? "bg-white/20" : "bg-emerald-50"}`} />
              ) : (
                <p className={`mt-2 text-[1.75rem] font-black leading-none tabular-nums ${active ? "text-white" : "text-[#0f3d2e]"}`}>{value}</p>
              )}
              <p className={`mt-2 line-clamp-2 text-[11px] leading-snug ${active ? "text-white/75" : "text-[#5c7d6d]"}`}>{note}</p>
            </button>
          ))}
        </section>

        <section className="space-y-2.5">
          <div className="flex items-center gap-2">
            <AnimatedPills
              items={DATE_PRESETS_COMPACT}
              value={datePreset === "custom" ? "" : datePreset}
              onChange={applyDatePreset}
              ariaLabel="Date range"
              size="sm"
              fullWidth
              className="min-w-0 flex-1"
            />
            <button
              type="button"
              onClick={() => setFiltersOpen((open) => !open)}
              className={`${lmPill} h-9 shrink-0 gap-1.5 px-3 text-xs font-bold`}
            >
              <Filter className="h-3.5 w-3.5" />
              Filters
              {activeCount > 0 ? (
                <span className="grid h-4 min-w-4 place-items-center rounded-full bg-[#27AE60] px-1 text-[9px] text-white">
                  {activeCount}
                </span>
              ) : null}
            </button>
            <button
              type="button"
              onClick={reset}
              className={`${lmPill} grid h-9 w-9 shrink-0 place-items-center`}
              title="Reset"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
          {datePreset === "custom" ? (
            <span className="inline-flex rounded-full bg-sky-50 px-3 py-1 text-[11px] font-bold text-sky-700">
              Custom {filters.from || "..."} {"->"} {filters.to || "..."}
            </span>
          ) : null}
          {filtersOpen ? (
            <div className={`space-y-3 rounded-2xl p-3 ${saSurface}`}>
              <Field label="Lead type">
                <Select value={filters.category} onChange={(v) => update("category", v)}>
                  {categories.map((v) => (
                    <option key={v} value={v}>
                      {categoryLabels[v]}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Status">
                <Select value={filters.status} onChange={(v) => update("status", v)}>
                  <option value="">All statuses</option>
                  {statuses.filter(Boolean).map((v) => (
                    <option key={v} value={v}>
                      {label(v)}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Lead category">
                <Select value={filters.source} onChange={(v) => update("source", v)}>
                  {["all", "site", "imported", "direct"].map((v) => (
                    <option key={v} value={v}>
                      {label(v)} leads
                    </option>
                  ))}
                </Select>
              </Field>
              <div className="grid grid-cols-2 gap-2">
                <Field label="State">
                  <Select value={filters.state} onChange={(v) => update("state", v)}>
                    <option value="">All</option>
                    {data.facets.states.map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="City">
                  <Select value={filters.city} onChange={(v) => update("city", v)}>
                    <option value="">All</option>
                    {data.facets.cities.map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </Select>
                </Field>
              </div>
              {activeCount > 0 ? (
                <button type="button" onClick={reset} className="w-full text-center text-[11px] font-bold text-rose-500">
                  Clear all filters
                </button>
              ) : null}
            </div>
          ) : null}
        </section>

        <section className="space-y-3">
          <div className="flex items-end justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold text-[#0f3d2e]">Lead directory</h2>
              <p className="text-[11px] text-[#5c7d6d]">
                {data.pagination.total} unique
                {data.summary.duplicatesHidden ? ` - ${data.summary.duplicatesHidden} hidden` : ""}
              </p>
            </div>
            {loading ? <Loader2 className="h-4 w-4 animate-spin text-emerald-500" /> : null}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5c7d6d]" />
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search name, phone, email..."
              className="h-11 w-full rounded-2xl border border-[#b7e4c7] bg-white pl-9 pr-9 text-sm text-[#0f3d2e] outline-none focus:border-[#27AE60] focus:ring-2 focus:ring-[#27AE60]/15"
            />
            {searchInput ? (
              <button type="button" onClick={() => setSearchInput("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5c7d6d]">
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={loading || exporting}
              onClick={() => downloadLeads("csv")}
              className={`${lmPill} h-10 flex-1 gap-1.5 text-xs font-bold disabled:opacity-50`}
            >
              {exporting === "csv" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
              CSV
            </button>
            <button
              type="button"
              disabled={loading || exporting}
              onClick={() => downloadLeads("xlsx")}
              className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full bg-[#27AE60] text-xs font-bold text-white shadow-[0_8px_18px_-6px_rgba(39,174,96,0.55)] disabled:opacity-50"
            >
              {exporting === "xlsx" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileSpreadsheet className="h-3.5 w-3.5" />}
              Excel
            </button>
          </div>

          {error ? (
            <div className="rounded-2xl bg-rose-50 p-6 text-center text-sm text-rose-600">{error}</div>
          ) : loading && !data.leads.length ? (
            <div className="space-y-2.5">
              {Array.from({ length: Math.min(filters.limit, 6) }).map((_, index) => (
                <div key={`lead-skel-m-${index}`} className="h-28 animate-pulse rounded-2xl border border-[#d8efe2] bg-white" />
              ))}
            </div>
          ) : !loading && !data.leads.length ? (
            <div className={`rounded-2xl border border-dashed border-[#b7e4c7] bg-white p-10 text-center ${saInset}`}>
              <Users className="mx-auto mb-2 h-8 w-8 text-[#8fd0a8]" />
              <p className="text-sm font-semibold text-[#0f3d2e]">No leads found</p>
            </div>
          ) : (
            <div className={`space-y-2.5 ${loading ? "opacity-70" : ""}`}>{data.leads.map(renderLeadMobileCard)}</div>
          )}

          <div className="flex items-center justify-between gap-2 pt-1">
            <p className="text-[11px] font-medium text-[#5c7d6d]">
              Page {data.pagination.page} of {Math.max(1, data.pagination.pages)} - {data.pagination.total} leads
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={filters.page <= 1}
                onClick={() => update("page", filters.page - 1)}
                className={`${lmPill} grid h-9 w-9 place-items-center disabled:opacity-30`}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                disabled={filters.page >= data.pagination.pages}
                onClick={() => update("page", filters.page + 1)}
                className={`${lmPill} grid h-9 w-9 place-items-center disabled:opacity-30`}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Desktop / large screens */}
      <div className="mx-auto hidden max-w-[1600px] space-y-5 lg:block">
        <header>
          <div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#27AE60]">Sales intelligence</p>
            <h1 className="text-lg font-semibold tracking-tight text-[#0f3d2e] sm:text-xl">Lead management</h1>
            <p className="mt-1 text-xs text-[#5c7d6d]">
              Unique enquiries only (duplicates collapsed) - click a row for project details and lead origin.
            </p>
          </div>
        </header>

        <section className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          {cards.map(([key, title, value, note, Icon, color, active]) => (
            <button
              key={key}
              type="button"
              onClick={() => applyCardFilter(key)}
              className={`rounded-xl px-3 py-2.5 text-left transition ${
                active
                  ? "border border-[#27AE60] bg-[#27AE60] text-white shadow-[0_8px_18px_-6px_rgba(39,174,96,0.55)]"
                  : `${saSurface} ${saSurfaceHover}`
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className={`text-[9px] font-semibold uppercase tracking-wider sm:text-[10px] ${active ? "text-white/80" : "text-[#5c7d6d]"}`}>{title}</p>
                  {value === null ? (
                    <div className={`mt-2 h-5 w-12 animate-pulse rounded ${active ? "bg-white/20" : "bg-emerald-50"}`} />
                  ) : (
                    <p className={`mt-1 text-lg font-bold leading-6 sm:text-xl ${active ? "text-white" : "text-[#0f3d2e]"}`}>{value}</p>
                  )}
                  <p className={`mt-0.5 truncate text-[9px] ${active ? "text-white/75" : "text-[#5c7d6d]"}`} title={note}>
                    {note}
                  </p>
                </div>
                <span className={`rounded-lg border p-2 ${active ? "border-white/25 bg-white/15 text-white" : lmIconTile}`}>
                  <Icon className="h-3.5 w-3.5" />
                </span>
              </div>
            </button>
          ))}
        </section>

        <section className={`rounded-2xl p-4 ${saSurface}`}>
          <div className="flex flex-wrap items-center gap-2 border-b border-emerald-50 pb-3">
            <AnimatedPills
              items={DATE_PRESETS_COMPACT}
              value={datePreset === "custom" ? "" : datePreset}
              onChange={applyDatePreset}
              ariaLabel="Date range"
              size="sm"
            />
            {datePreset === "custom" && (
              <span className="rounded-full bg-sky-50 px-3 py-1.5 text-[11px] font-bold text-sky-700">
                Custom {filters.from || "..."} {"->"} {filters.to || "..."}
              </span>
            )}
            <div className="ml-auto flex items-center gap-2">
              {activeCount > 0 && (
                <button type="button" onClick={reset} className="text-[11px] font-bold text-rose-500 hover:text-rose-600">
                  Clear all filters
                </button>
              )}
              <button type="button" onClick={reset} className={`${lmPill} grid h-9 w-9 place-items-center`} title="Reset">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-3 grid gap-3">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1.15fr)_minmax(0,2fr)_minmax(0,1.15fr)]">
              <Field label="Lead type">
                <Select value={filters.category} onChange={(v) => update("category", v)}>
                  {categories.map((v) => (
                    <option key={v} value={v}>
                      {categoryLabels[v]}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Project / property">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setProjectPickerOpen((open) => !open)}
                    className="flex h-10 w-full min-w-0 items-center justify-between gap-2 rounded-xl border border-[#b7e4c7] bg-white px-3 text-left text-xs font-medium text-[#0f3d2e] outline-none transition focus:border-[#27AE60] focus:ring-2 focus:ring-[#27AE60]/15"
                  >
                    <span className="truncate">{selectedProjectIds.length ? `${selectedProjectIds.length} selected` : "All projects / properties"}</span>
                    <ChevronDown className={`h-4 w-4 shrink-0 text-[#5c7d6d] transition ${projectPickerOpen ? "rotate-180" : ""}`} />
                  </button>
                  {projectPickerOpen && (
                    <div className={`absolute left-0 top-full z-50 mt-2 w-full min-w-[280px] max-w-full overflow-hidden rounded-2xl bg-white sm:min-w-[360px] ${saSurface}`}>
                      <div className="border-b border-emerald-50 p-3">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5c7d6d]" />
                          <input
                            autoFocus
                            value={projectSearch}
                            onChange={(event) => setProjectSearch(event.target.value)}
                            placeholder="Search projects or properties..."
                            className="h-10 w-full rounded-xl border border-[#b7e4c7] pl-9 pr-3 text-xs text-[#0f3d2e] outline-none focus:border-[#27AE60]"
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between border-b border-emerald-50 px-3 py-2">
                        <span className="text-[10px] font-semibold text-[#5c7d6d]">{selectedProjectIds.length} selected</span>
                        {selectedProjectIds.length > 0 && (
                          <button type="button" onClick={() => update("projectId", "")} className="text-[10px] font-bold text-rose-500">
                            Clear all
                          </button>
                        )}
                      </div>
                      <div className="max-h-72 overflow-y-auto p-1.5">
                        {availableProjects.length ? (
                          availableProjects.map((project) => {
                            const checked = selectedProjectIds.includes(String(project._id));
                            return (
                              <button
                                type="button"
                                key={project._id}
                                onClick={() => toggleProject(String(project._id))}
                                className={`flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition ${checked ? "bg-[#e8f8ee]" : "hover:bg-[#f7fbf8]"}`}
                              >
                                <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${checked ? "border-[#27AE60] bg-[#27AE60] text-white" : "border-[#b7e4c7]"}`}>
                                  {checked && <Check className="h-3 w-3" />}
                                </span>
                                <span className="min-w-0">
                                  <span className="block truncate text-xs font-semibold text-[#0f3d2e]">{project.title}</span>
                                  <span className="block truncate text-[9px] text-[#5c7d6d]">
                                    {label(project.category)} - {[project.locality, project.city].filter(Boolean).join(", ") || project.code || "Location unavailable"}
                                  </span>
                                </span>
                              </button>
                            );
                          })
                        ) : (
                          <p className="px-3 py-8 text-center text-xs text-[#5c7d6d]">No matching projects or properties</p>
                        )}
                      </div>
                      <div className="border-t border-emerald-50 p-2">
                        <button type="button" onClick={() => setProjectPickerOpen(false)} className="h-9 w-full rounded-full bg-[#27AE60] text-xs font-bold text-white hover:bg-[#1e9a4f]">
                          Apply selection
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </Field>

              <Field label="Status">
                <Select value={filters.status} onChange={(v) => update("status", v)}>
                  <option value="">All statuses</option>
                  {statuses.filter(Boolean).map((v) => (
                    <option key={v} value={v}>
                      {label(v)}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
              <Field label="Lead category">
                <Select value={filters.source} onChange={(v) => update("source", v)}>
                  {["all", "site", "imported", "direct"].map((v) => (
                    <option key={v} value={v}>
                      {label(v)} leads
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="State">
                <Select value={filters.state} onChange={(v) => update("state", v)}>
                  <option value="">All states</option>
                  {data.facets.states.map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </Select>
              </Field>
              <Field label="City">
                <Select value={filters.city} onChange={(v) => update("city", v)}>
                  <option value="">All cities</option>
                  {data.facets.cities.map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Locality">
                <Select value={filters.locality} onChange={(v) => update("locality", v)}>
                  <option value="">All localities</option>
                  {data.facets.localities.map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </Select>
              </Field>
              <Field label="From">
                <input
                  type="date"
                  value={filters.from}
                  max={filters.to || undefined}
                  onChange={(e) => update("from", e.target.value)}
                  className="h-10 w-full min-w-0 rounded-xl border border-[#b7e4c7] px-3 text-xs text-[#0f3d2e] outline-none focus:border-[#27AE60] focus:ring-2 focus:ring-[#27AE60]/15"
                />
              </Field>
              <Field label="To">
                <input
                  type="date"
                  value={filters.to}
                  min={filters.from || undefined}
                  onChange={(e) => update("to", e.target.value)}
                  className="h-10 w-full min-w-0 rounded-xl border border-[#b7e4c7] px-3 text-xs text-[#0f3d2e] outline-none focus:border-[#27AE60] focus:ring-2 focus:ring-[#27AE60]/15"
                />
              </Field>
            </div>
          </div>

          {selectedProjectIds.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-emerald-50 pt-3">
              <span className="mr-1 text-[10px] font-bold uppercase tracking-wider text-[#5c7d6d]">Selected</span>
              {selectedProjectIds.map((id) => {
                const project = projectCatalog.find((item) => String(item._id) === id);
                return (
                  <span key={id} className="flex max-w-[240px] items-center gap-1 rounded-full border border-[#b7e4c7] bg-[#e8f8ee] px-2.5 py-1 text-[10px] font-semibold text-[#128C45]">
                    <span className="truncate">{project?.title || id}</span>
                    <button type="button" onClick={() => toggleProject(id)} className="rounded-full hover:bg-emerald-100">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                );
              })}
              <button type="button" onClick={() => update("projectId", "")} className="ml-1 text-[10px] font-bold text-rose-500">
                Clear all
              </button>
            </div>
          )}
        </section>

        <section className={`flex h-[min(72vh,760px)] min-h-[420px] flex-col overflow-hidden rounded-2xl ${saSurface}`}>
          <div className="shrink-0 border-b border-emerald-50 px-4 py-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="shrink-0 lg:w-48">
                <h2 className="text-sm font-semibold text-[#0f3d2e]">Lead directory</h2>
                <p className="text-[10px] text-[#5c7d6d]">
                  {data.pagination.total} unique leads
                  {data.summary.duplicatesHidden
                    ? ` - ${data.summary.duplicatesHidden} duplicate submissions hidden`
                    : ""}
                  {selectedProjectIds.length > 0
                    ? ` - from ${selectedProjectIds.length} selected items`
                    : ""}
                </p>
              </div>
              <div className="relative min-w-0 flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5c7d6d]" />
                <input
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Search name, phone, email, project or location"
                  className="h-9 w-full rounded-xl border border-[#b7e4c7] bg-white pl-9 pr-9 text-xs text-[#0f3d2e] outline-none focus:border-[#27AE60] focus:ring-2 focus:ring-[#27AE60]/15"
                />
                {searchInput && (
                  <button type="button" onClick={() => setSearchInput("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5c7d6d]">
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button type="button" disabled={loading || exporting} onClick={() => downloadLeads("csv")} className={`${lmPill} h-9 gap-2 px-3 text-[10px] font-bold disabled:opacity-50`}>
                  {exporting === "csv" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />} CSV
                </button>
                <button type="button" disabled={loading || exporting} onClick={() => downloadLeads("xlsx")} className="flex h-9 items-center gap-2 rounded-full bg-[#27AE60] px-3 text-[10px] font-bold text-white shadow-[0_8px_18px_-6px_rgba(39,174,96,0.55)] transition hover:bg-[#1e9a4f] disabled:opacity-50">
                  {exporting === "xlsx" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileSpreadsheet className="h-3.5 w-3.5" />} Excel
                </button>
                {loading && <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />}
              </div>
            </div>
          </div>

          {error ? (
            <div className="p-12 text-center text-sm text-rose-600">{error}</div>
          ) : loading && !data.leads.length ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: Math.min(filters.limit, 6) }).map((_, index) => (
                <div key={`lead-skel-${index}`} className="h-12 animate-pulse rounded-xl bg-slate-100" />
              ))}
            </div>
          ) : !loading && !data.leads.length ? (
            <div className="p-16 text-center">
              <Users className="mx-auto mb-3 h-8 w-8 text-slate-300" />
              <p className="text-sm font-semibold text-slate-600">No leads found</p>
              <p className="mt-1 text-xs text-slate-400">Try clearing some filters.</p>
            </div>
          ) : (
            <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden [scrollbar-width:thin]">
              <table className="w-full table-fixed text-left">
                <colgroup>
                  <col className="w-[14%]" />
                  <col className="w-[13%]" />
                  <col className="w-[18%]" />
                  <col className="w-[14%]" />
                  <col className="w-[10%]" />
                  <col className="w-[14%]" />
                  <col className="w-[10%]" />
                  <col className="w-[7%]" />
                </colgroup>
                <thead className="sticky top-0 z-10 bg-[#f7fbf8] text-[9px] uppercase tracking-wider text-[#5c7d6d] shadow-sm">
                  <tr>
                    {["Lead", "Contact", "Project / property", "Location", "Category", "Where from", "Status", "Last touch"].map((h) => (
                      <th key={h} className="truncate bg-[#f7fbf8] px-2.5 py-3 font-bold text-[#5c7d6d] sm:px-3">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#d8f0e2]">
                  {data.leads.map((lead) => {
                    const statusKey = String(lead.status || "new_lead");
                    const locationText =
                      [lead.project.locality, lead.project.city, lead.project.state]
                        .filter(Boolean)
                        .join(", ") || "-";
                    return (
                      <tr
                        key={lead._id}
                        onClick={() => setSelectedLead(lead)}
                        className={`cursor-pointer transition ${rowTone[statusKey] || "hover:bg-[#f7fbf8]"}`}
                      >
                        <td className="px-2.5 py-2.5 sm:px-3">
                          <div className="flex min-w-0 items-center gap-1.5">
                            <p className="truncate text-xs font-semibold text-[#0f3d2e]" title={lead.name}>
                              {lead.name}
                            </p>
                            {lead.duplicateCount > 0 ? (
                              <span className="shrink-0 rounded-full bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold text-amber-700">
                                +{lead.duplicateCount}
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-0.5 truncate text-[10px] text-[#5c7d6d]" title={lead.message || lead.purchaseTimeline || ""}>
                            {lead.message || lead.purchaseTimeline || "No note"}
                          </p>
                        </td>
                        <td className="px-2.5 py-2.5 sm:px-3">
                          <p className="truncate text-xs text-[#0f3d2e]" title={lead.phone}>{lead.phone}</p>
                          <p className="truncate text-[10px] text-[#5c7d6d]" title={lead.email || ""}>{lead.email || "-"}</p>
                        </td>
                        <td className="px-2.5 py-2.5 sm:px-3">
                          <p className="truncate text-xs font-semibold text-[#27AE60]" title={lead.project.title}>{lead.project.title}</p>
                          <p className="truncate text-[10px] text-[#5c7d6d]" title={lead.project.code || ""}>{lead.project.code || "No code"}</p>
                        </td>
                        <td className="px-2.5 py-2.5 text-[10px] text-[#5c7d6d] sm:px-3">
                          <p className="truncate" title={locationText}>{locationText}</p>
                        </td>
                        <td className="px-2.5 py-2.5 sm:px-3">
                          {(() => {
                            const display = categoryDisplay(lead.project);
                            return (
                              <span className={`inline-block max-w-full truncate rounded-full px-2 py-1 text-[9px] font-bold ${display.className}`} title={display.text}>
                                {display.text}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="px-2.5 py-2.5 sm:px-3">
                          <p className="truncate text-[10px] font-semibold text-[#0f3d2e]" title={lead.origin?.label || label(lead.source)}>
                            {lead.origin?.label || label(lead.source)}
                          </p>
                          <p className="mt-0.5 truncate text-[9px] text-[#5c7d6d]" title={lead.origin?.entryPoint || label(lead.source)}>
                            {lead.origin?.entryPoint || label(lead.source)}
                          </p>
                        </td>
                        <td className="px-2.5 py-2.5 sm:px-3">
                          <span className={`inline-block max-w-full truncate rounded-full px-2 py-1 text-[9px] font-bold ${statusTone[statusKey] || "bg-slate-100 text-slate-600"}`} title={label(lead.status)}>
                            {label(lead.status)}
                          </span>
                        </td>
                        <td className="px-2.5 py-2.5 text-[10px] text-[#5c7d6d] sm:px-3">
                          <p className="truncate" title={new Date(lead.lastTouchAt || lead.createdAt).toLocaleString("en-IN")}>
                            {new Date(lead.lastTouchAt || lead.createdAt).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                            })}
                          </p>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <footer className="flex shrink-0 items-center justify-between border-t border-emerald-50 px-4 py-3">
            <p className="text-[10px] text-[#5c7d6d]">
              Showing {data.pagination.total ? (data.pagination.page - 1) * filters.limit + 1 : 0}-{Math.min(data.pagination.page * filters.limit, data.pagination.total)} of {data.pagination.total} unique leads - Page {data.pagination.page} of {Math.max(1, data.pagination.pages)}
            </p>
            <div className="flex gap-2">
              <button type="button" disabled={filters.page <= 1} onClick={() => update("page", filters.page - 1)} className={`${lmPill} p-2 disabled:opacity-30`}>
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button type="button" disabled={filters.page >= data.pagination.pages} onClick={() => update("page", filters.page + 1)} className={`${lmPill} p-2 disabled:opacity-30`}>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </footer>
        </section>
      </div>

      {selectedLead ? (
        <LeadDetailDrawer
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
        />
      ) : null}
    </div>
  );
}
