// src/pages/features/property/components/shared/ProjectsDashboardPage.jsx
import {
  useState, useEffect, useRef, useMemo, useCallback, useReducer,
} from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Search, X, ChevronDown, ChevronRight, MapPin, Building2, Plus, Clock,
  Star, TrendingUp, Zap, BarChart3, Filter, RefreshCw, Trash2, ArrowUpDown,
  Navigation, Globe, ChevronUp, Eye, MousePointerClick, MessageSquare, Home,
  Layers, Activity, DollarSign, CheckCircle2, AlertCircle, PieChart,
} from "lucide-react";

import { useFeaturedProjects }     from "../../../../features/property/hooks/useFeaturedProjects";
import { usePendingProjects }      from "../../../../features/property/hooks/usePendingProjects";
import { getUserInDetails }        from "./userInDetails";
import PropertyCard                from "../../../../features/property/components/shared/PropertyCard";
import PromoteModal                from "../../../../features/property/components/shared/PromoteModal";
import ConfirmModal                from "../../../../features/property/components/shared/ConfirmModal";
import LoadingSpinner              from "../../../../../components/common/LoadingSpinner";
import { getAllProjectsAnalytics } from "../../../../../features/property/propertyService";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const INDIA_ZONES = [
  { zone: "North India",      states: ["Delhi","Uttar Pradesh","Haryana","Punjab","Himachal Pradesh","Uttarakhand","Jammu and Kashmir","Ladakh","Chandigarh"] },
  { zone: "South India",      states: ["Andhra Pradesh","Telangana","Karnataka","Tamil Nadu","Kerala","Goa","Puducherry","Lakshadweep","Andaman and Nicobar Islands"] },
  { zone: "West India",       states: ["Maharashtra","Gujarat","Rajasthan","Dadra and Nagar Haveli and Daman and Diu"] },
  { zone: "East India",       states: ["West Bengal","Bihar","Jharkhand","Odisha"] },
  { zone: "Central India",    states: ["Madhya Pradesh","Chhattisgarh"] },
  { zone: "North East India", states: ["Assam","Arunachal Pradesh","Manipur","Meghalaya","Mizoram","Nagaland","Sikkim","Tripura"] },
];

const CATEGORY_TYPES = [
  { value: "all",         label: "All"           },
  { value: "residential", label: "🏠 Residential" },
  { value: "land",        label: "🌍 Land"        },
];

const PROPERTY_TYPES = {
  residential: [
    { label: "Flat / Apartment", value: "apartment"  },
    { label: "Villa",            value: "villa"       },
    { label: "Duplex",           value: "duplex"      },
    { label: "Triplex",          value: "triplex"     },
    { label: "Farmhouse",        value: "farmhouse"   },
  ],
  land: [
    { label: "Plot",              value: "plot"              },
    { label: "Residential Plot",  value: "residential-plot"  },
    { label: "Industrial Plot",   value: "industrial-plot"   },
    { label: "Agricultural Plot", value: "agricultural-plot" },
    { label: "Commercial Plot",   value: "commercial-plot"   },
  ],
};

const STATUS_FILTERS = [
  { value: "all",      label: "All Status" },
  { value: "active",   label: "Active"     },
  { value: "inactive", label: "Inactive"   },
  { value: "expired",  label: "Expired"    },
];

const TYPE_COLORS = [
  "bg-[#27AE60]","bg-blue-400","bg-yellow-400","bg-purple-400",
  "bg-pink-400","bg-orange-400","bg-teal-400","bg-rose-400",
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────


// Persist layout in localStorage across sessions
function useDashboardLayout(defaultLayout) {
  const [layout, setLayout] = useState(() => {
    try {
      const saved = localStorage.getItem("projects-dashboard-layout");
      return saved ? JSON.parse(saved) : defaultLayout;
    } catch { return defaultLayout; }
  });

  const saveLayout = useCallback((newLayout) => {
    setLayout(newLayout);
    localStorage.setItem("projects-dashboard-layout", JSON.stringify(newLayout));
  }, []);

  return [layout, saveLayout];
}
const fmt = (n) => {
  if (n == null) return "—";
  if (n >= 1_00_00_000) return `₹${(n / 1_00_00_000).toFixed(1)}Cr`;
  if (n >= 1_00_000)    return `₹${(n / 1_00_000).toFixed(1)}L`;
  if (n >= 1_000)       return `₹${(n / 1_000).toFixed(1)}K`;
  return `₹${n}`;
};

const fmtNum = (n) => {
  if (n == null) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
};

const pct = (part, total) => (!total ? 0 : Math.round((part / total) * 100));

// Debounce hook — prevents analytics from firing on every keystroke
function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// Build analytics query params from location + search
const buildAnalyticsParams = (selectedLocation, searchTerm) => {
  const params = {};
  if (selectedLocation) {
    if (selectedLocation.type === "state")    params.state    = selectedLocation.value;
    if (selectedLocation.type === "city")     params.city     = selectedLocation.value;
    if (selectedLocation.type === "locality") params.locality = selectedLocation.value;
  }
  if (searchTerm?.trim()) params.search = searchTerm.trim();
  return params;
};

// Resolve which location breakdown rows to display contextually
const resolveLocationRows = (analytics, locationType) => {
  if (!analytics) return { rows: [], label: "Location" };
  if (locationType === "locality" && analytics.localityWise?.length > 0)
    return { rows: analytics.localityWise, label: "Locality" };
  if ((locationType === "city" || locationType === "locality") && analytics.cityWise?.length > 0)
    return { rows: analytics.cityWise, label: "City" };
  if (locationType === "state" && analytics.stateWise?.length > 0)
    return { rows: analytics.stateWise, label: "State" };
  if (!locationType && analytics.cityWise?.length > 1)
    return { rows: analytics.cityWise, label: "City" };
  return { rows: [], label: "Location" };
};

// ─────────────────────────────────────────────────────────────────────────────
// PRIMITIVE COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function MiniBar({ value, max, color = "bg-[#27AE60]", height = "h-2" }) {
  const w = max ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className={`${height} bg-slate-100 rounded-full overflow-hidden`}>
      <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${w}%` }} />
    </div>
  );
}

function PromoBadge({ label, value, color }) {
  if (!value) return null;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${color}`}>
      {label}: {value}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SELECT DROPDOWN
// ─────────────────────────────────────────────────────────────────────────────

function SelectDropdown({ label, value, options, onChange, placeholder = "Select…" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className="relative">
      {label && <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">{label}</p>}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition
          ${value ? "bg-[#27AE60]/10 border-[#27AE60]/40 text-[#27AE60]" : "bg-slate-50 border-slate-200 text-slate-600 hover:border-[#27AE60]/50"}`}
      >
        <span className="truncate">{selected ? selected.label : placeholder}</span>
        <ChevronDown className={`w-3.5 h-3.5 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
          <div className="max-h-48 overflow-y-auto">
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`w-full text-left px-3 py-2 text-xs hover:bg-green-50 transition
                  ${opt.value === value ? "bg-[#27AE60]/10 text-[#27AE60] font-semibold" : "text-slate-700"}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LOCATION SELECTOR (inline horizontal, compact)
// ─────────────────────────────────────────────────────────────────────────────

function InlineLocationSelector({ properties, selectedLocation, onLocationChange }) {
  const [open, setOpen]           = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [openZones, setOpenZones]   = useState({});
  const [openStates, setOpenStates] = useState({});
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const hierarchy = useMemo(() => {
    const map = {};
    properties.forEach((p) => {
      const state = p.state?.trim();
      const city = p.city?.trim();
      const locality = p.locality?.trim();
      if (!state) return;
      if (!map[state]) map[state] = {};
      if (city) {
        if (!map[state][city]) map[state][city] = new Set();
        if (locality) map[state][city].add(locality);
      }
    });
    return map;
  }, [properties]);

  const countFor = useCallback((type, ...keys) => {
    return properties.filter((p) => {
      if (type === "state")    return p.state?.trim() === keys[0];
      if (type === "city")     return p.state?.trim() === keys[0] && p.city?.trim() === keys[1];
      if (type === "locality") return p.state?.trim() === keys[0] && p.city?.trim() === keys[1] && p.locality?.trim() === keys[2];
      return false;
    }).length;
  }, [properties]);

  const q = searchTerm.toLowerCase().trim();
  const toggle = (setter, key) => setter((prev) => ({ ...prev, [key]: !prev[key] }));
  const isActive = (type, val) => selectedLocation?.type === type && selectedLocation?.value === val;

  const selectItem = (type, value, label) => {
    onLocationChange(isActive(type, value) ? null : { type, value, label });
    setOpen(false);
  };

  const stateVisible = useCallback((state) => {
    if (!q) return true;
    if (state.toLowerCase().includes(q)) return true;
    return Object.keys(hierarchy[state] || {}).some((c) =>
      c.toLowerCase().includes(q) ||
      Array.from(hierarchy[state][c]).some((l) => l.toLowerCase().includes(q))
    );
  }, [q, hierarchy]);

  const zonesWithData = INDIA_ZONES.filter((z) => z.states.some((s) => hierarchy[s]));
  const allStateKeys = Object.keys(hierarchy);
  const ungroupedStates = allStateKeys.filter((s) => !INDIA_ZONES.flatMap((z) => z.states).includes(s));

  const renderState = (state) => {
    const cities = Object.keys(hierarchy[state] || {});
    const stateCount = countFor("state", state);
    const isStateOpen = openStates[state];

    return (
      <div key={state} className="border-b  border-slate-50">
        <div className="flex items-center">
          <button
            onClick={() => selectItem("state", state, state)}
            className={`flex-1 flex items-center gap-2 pl-7 pr-2 py-2 text-xs transition
              ${isActive("state", state) ? "bg-[#27AE60]/10 text-[#27AE60] font-semibold" : "text-slate-600 hover:bg-green-50"}`}
          >
            <MapPin className="w-3 h-3 flex-shrink-0 opacity-40" />
            <span className="flex-1 text-left">{state}</span>
            <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">{stateCount}</span>
          </button>
          {cities.length > 0 && (
            <button onClick={() => toggle(setOpenStates, state)} className="px-2 py-2 hover:bg-slate-100 transition">
              <ChevronRight className={`w-3 h-3 text-slate-400 transition-transform ${isStateOpen ? "rotate-90" : ""}`} />
            </button>
          )}
        </div>

        {isStateOpen && cities.length > 0 && (
          <div className="bg-slate-50/70 border-t border-slate-100 px-3 py-2 space-y-2">
            <SelectDropdown
              label="City"
              value={isActive("city", selectedLocation?.value) && cities.includes(selectedLocation?.value) ? selectedLocation.value : ""}
              options={[
                { value: "", label: "All Cities" },
                ...cities
                  .filter((c) => !q || c.toLowerCase().includes(q))
                  .map((c) => ({ value: c, label: `${c} (${countFor("city", state, c)})` })),
              ]}
              onChange={(val) => {
                if (!val) selectItem("state", state, state);
                else selectItem("city", val, `${val}, ${state}`);
              }}
              placeholder="Select city…"
            />
            {(() => {
              const activeCity = isActive("city", selectedLocation?.value) && cities.includes(selectedLocation?.value)
                ? selectedLocation.value : null;
              const activeCityFromLocality = selectedLocation?.type === "locality"
                ? cities.find((c) => Array.from(hierarchy[state][c] || []).includes(selectedLocation?.value)) : null;
              const cityForLocalities = activeCity || activeCityFromLocality;
              if (!cityForLocalities) return null;
              const localities = Array.from(hierarchy[state][cityForLocalities] || []);
              if (!localities.length) return null;
              return (
                <SelectDropdown
                  label="Locality"
                  value={isActive("locality", selectedLocation?.value) ? selectedLocation.value : ""}
                  options={[
                    { value: "", label: "All Localities" },
                    ...localities
                      .filter((l) => !q || l.toLowerCase().includes(q))
                      .map((l) => ({ value: l, label: `${l} (${countFor("locality", state, cityForLocalities, l)})` })),
                  ]}
                  onChange={(val) => {
                    if (!val) selectItem("city", cityForLocalities, `${cityForLocalities}, ${state}`);
                    else selectItem("locality", val, `${val}, ${cityForLocalities}`);
                  }}
                  placeholder="Select locality…"
                />
              );
            })()}
          </div>
        )}
      </div>
    );
  };

  return (
    <div ref={ref} className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition min-w-[180px]
          ${selectedLocation
            ? "bg-[#27AE60]/10 border-[#27AE60]/40 text-[#27AE60]"
            : "bg-white border-slate-200 text-slate-600 hover:border-[#27AE60]/50"}`}
      >
        <Navigation className="w-4 h-4 flex-shrink-0" />
        <span className="flex-1 text-left truncate max-w-[160px]">
          {selectedLocation ? selectedLocation.label : "All India"}
        </span>
        {selectedLocation && (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => { e.stopPropagation(); onLocationChange(null); }}
            onKeyDown={(e) => e.key === "Enter" && (e.stopPropagation(), onLocationChange(null))}
            className="hover:text-red-500 transition"
          >
            <X className="w-3.5 h-3.5" />
          </span>
        )}
        <ChevronDown className={`w-3.5 h-3.5 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute z-50 top-full mt-2 left-0 min-w-[360px]  bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
          {/* Search */}
          <div className="p-3 border-b bg-green-200 border-slate-100">
            <div className="flex  items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
              <Search className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search zone, state, city…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-transparent text-xs outline-none text-slate-700 placeholder:text-slate-400"
                autoFocus
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm("")}><X className="w-3 h-3 text-slate-400 hover:text-red-500" /></button>
              )}
            </div>
          </div>

          {/* All India */}
          <button
            onClick={() => { onLocationChange(null); setOpen(false); }}
            className={`w-full  flex items-center gap-2 px-3 py-2.5 text-xs font-semibold transition border-b border-slate-100
              ${!selectedLocation ? "bg-[#27AE60]/10 text-[#27AE60]" : "text-slate-600 hover:bg-slate-50"}`}
          >
            <Globe className="w-3.5 h-3.5" />
            All India
            <span className="ml-auto text-[10px] bg-[#27AE60] text-white px-1.5 py-0.5 rounded-full">{properties.length}</span>
          </button>

          {/* Zone tree */}
          <div className="min-h-[400px] overflow-y-auto">
            {zonesWithData.map((zone) => {
              const zoneStates = zone.states.filter((s) => hierarchy[s]);
              const childMatch = zoneStates.some(stateVisible);
              const zoneMatch = !q || zone.zone.toLowerCase().includes(q);
              if (q && !zoneMatch && !childMatch) return null;
              const isZoneOpen = openZones[zone.zone];
              return (
                <div key={zone.zone}>
                  <button
                    onClick={() => toggle(setOpenZones, zone.zone)}
                    className="w-full flex items-center gap-2 px-3 py-2 bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider hover:bg-slate-100 transition"
                  >
                    <Navigation className="w-3 h-3 text-[#27AE60]" />
                    <span className="flex-1 text-left">{zone.zone}</span>
                    {isZoneOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                  {isZoneOpen && zoneStates.filter(stateVisible).map((s) => renderState(s))}
                </div>
              );
            })}
            {ungroupedStates.filter(stateVisible).map((s) => renderState(s))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ANALYTICS COMPONENTS — each fully standalone, no inter-dependency
// ─────────────────────────────────────────────────────────────────────────────

function KPICard({ label, display, sub, icon: Icon, color, iconBg, border, onClick, isActive }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white flex items-center justify-center gap-2 rounded-2xl border ${border} p-2 shadow-sm transition-all duration-200 
        ${onClick ? "cursor-pointer hover:shadow-md hover:-translate-y-0.5" : ""}
        ${isActive ? "ring-2 ring-[#27AE60] shadow-md -translate-y-0.5" : ""}`}
    >
      {/* <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center mb-3`}>
        <Icon className={color} style={{ width: 18, height: 18 }} />
      </div> */}
      <p className="text-[15px] lg:text-nowrap xl:text-nowrap text-[#27AE60]  leading-tight">{label}</p>
      <p className="text-xs  text-slate-900 leading-none">{display}</p>
      {/* {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>} */}
    </div>
  );
}

function AnalyticsOverviewRow({ ov, total, activeStatusFilter, onStatusFilter }) {
  // onStatusFilter — independent action, only updates project list status filter
  const cards = [
    { label: "Total Projects", display: String(total), icon: Building2, color: "text-slate-700", iconBg: "bg-slate-100", border: "border-slate-200" },
    { label: "Active",  display: String(ov.activeProjects  ?? 0), sub: `${pct(ov.activeProjects,  total)}% of total`, icon: CheckCircle2, color: "text-emerald-700", iconBg: "bg-emerald-50", border: "border-emerald-100", filter: "active"   },
    { label: "Pending", display: String(ov.pendingProjects ?? 0), sub: `${pct(ov.pendingProjects, total)}% of total`, icon: Clock,         color: "text-amber-700",   iconBg: "bg-amber-50",   border: "border-amber-100",  filter: "pending"  },
    { label: "Inactive",display: String(ov.inactiveProjects?? 0), icon: AlertCircle,     color: "text-purple-700",  iconBg: "bg-purple-50",  border: "border-purple-100", filter: "inactive" },
    { label: "Total Views",    display: fmtNum(ov.totalViews     ?? 0), icon: Eye,              color: "text-blue-700",    iconBg: "bg-blue-50",    border: "border-blue-100"   },
    { label: "Inquiries",      display: fmtNum(ov.totalInquiries ?? 0), icon: MessageSquare,    color: "text-teal-700",    iconBg: "bg-teal-50",    border: "border-teal-100"   },
    { label: "Clicks",         display: fmtNum(ov.totalClicks    ?? 0), icon: MousePointerClick,color: "text-indigo-700",  iconBg: "bg-indigo-50",  border: "border-indigo-100" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 xl:grid-cols-8 gap-3">
      {cards.map((c) => (
        <KPICard
          key={c.label}
          label={c.label} display={c.display} sub={c.sub}
          icon={c.icon} color={c.color} iconBg={c.iconBg} border={c.border}
          onClick={c.filter ? () => onStatusFilter(c.filter) : undefined}
          isActive={c.filter && activeStatusFilter === c.filter}
        />
      ))}
    </div>
  );
}

function AnalyticsPromotionRow({ ov, total, activePromotionFilter, onPromotionFilter }) {
  // onPromotionFilter — independent action, only updates project list promotion filter
  const cards = [
    { key: "prime",     label: "Prime",       value: ov.primeProjects     ?? 0, icon: Star,       color: "text-yellow-700", bg: "bg-yellow-50",  border: "border-yellow-100", iconBg: "bg-yellow-100", bar: "bg-yellow-400" },
    { key: "featured",  label: "Top Selling", value: ov.featuredProjects  ?? 0, icon: TrendingUp,  color: "text-blue-700",   bg: "bg-blue-50",    border: "border-blue-100",   iconBg: "bg-blue-100",   bar: "bg-blue-400"   },
    { key: "sponsored", label: "Sponsored",   value: ov.sponsoredProjects ?? 0, icon: Zap,         color: "text-purple-700", bg: "bg-purple-50",  border: "border-purple-100", iconBg: "bg-purple-100", bar: "bg-purple-400" },
    { key: "normal",    label: "Normal",      value: ov.normalProjects    ?? 0, icon: Building2,   color: "text-slate-600",  bg: "bg-slate-50",   border: "border-slate-100",  iconBg: "bg-slate-100",  bar: "bg-slate-300"  },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {cards.map((c) => {
        const Icon = c.icon;
        const isActive = activePromotionFilter === c.key;
        return (
          <div
            key={c.key}
            onClick={() => onPromotionFilter(c.key)}
            className={`${c.bg} flex items-center justify-center gap-2 rounded-2xl border ${c.border} p-2 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 shadow-sm
              ${isActive ? "ring-2 ring-[#27AE60] shadow-md -translate-y-0.5" : ""}`}
          >
            {/* <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 rounded-xl ${c.iconBg} flex items-center justify-center`}>
                <Icon className={c.color} style={{ width: 18, height: 18 }} />
              </div>
              <span className="text-[10px] text-slate-400 font-medium">{pct(c.value, total)}%</span>
            </div> */}
            <p className="text-xl text-nowrap text-[#000456]">{c.label}</p>
            <p className="text-xl font-bold text-slate-900 leading-none">
              {c.value}
            </p>

            {/* <div className="mt-2">
              <MiniBar value={c.value} max={total} color={c.bar} height="h-1.5" />
            </div> */}
          </div>
        );
      })}
    </div>
  );
}

function AnalyticsCategoryBlock({ categoryWise, total }) {
  const filtered = (categoryWise || []).filter((c) => c._id && c._id !== "unknown");
  if (!filtered.length) return null;
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm h-full">
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-1.5">
        <Layers className="w-3.5 h-3.5 text-[#27AE60]" />
        By Category
      </p>
      <div className="space-y-4">
        {filtered.map((cat) => (
          <div key={cat._id}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                {cat._id === "residential" ? "🏠" : "🌍"}
                <span className="capitalize">{cat._id}</span>
              </span>
              <span className="text-sm font-bold text-slate-800">
                {cat.total}
                {/* <span className="text-xs text-slate-400 font-normal ml-1">({pct(cat.total, total)}%)</span> */}
              </span>
            </div>
            {/* <MiniBar value={cat.total} max={total} color={cat._id === "residential" ? "bg-emerald-400" : "bg-amber-400"} height="h-2" /> */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <PromoBadge label="Normal"      value={cat.normal}   color="bg-slate-100 text-slate-600" />
              <PromoBadge label="Top Selling" value={cat.featured} color="bg-blue-50 text-blue-600" />
              <PromoBadge label="Prime"       value={cat.prime}    color="bg-yellow-50 text-yellow-700" />
              <PromoBadge label="Sponsored"   value={cat.sponsored}color="bg-purple-50 text-purple-600" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AnalyticsPropertyTypeBlock({ propertyTypeWise }) {
  const rows = (propertyTypeWise || []).filter((pt) => pt._id && pt._id !== "unknown").sort((a, b) => b.total - a.total).slice(0, 8);
  if (!rows.length) return null;
  const maxVal = rows[0]?.total || 1;
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm h-full">
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-1.5">
        <Home className="w-3.5 h-3.5 text-[#27AE60]" />
        Property Types
      </p>
      <div className="space-y-3">
        {rows.map((pt, i) => (
          <div key={pt._id} className="flex items-center gap-3">
            <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${TYPE_COLORS[i % TYPE_COLORS.length]}`} />
            <span className="text-xs text-slate-600 capitalize flex-1 truncate">{pt._id}</span>
            <div className="flex-1 max-w-[100px]">
              <MiniBar value={pt.total} max={maxVal} color={TYPE_COLORS[i % TYPE_COLORS.length]} height="h-2" />
            </div>
            <span className="text-xs font-bold text-slate-700 w-5 text-right flex-shrink-0">{pt.total}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AnalyticsLocationBlock({ analytics, locationType, locationLabel }) {
  const { rows, label } = resolveLocationRows(analytics, locationType);
  if (!rows.length) return null;
  const maxVal = rows.reduce((m, r) => Math.max(m, r.total), 1);
  const isSingleRow = rows.length === 1;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm h-full">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-[#27AE60]" />
          By {label}
        </p>
        {locationLabel && locationLabel !== "All India" && (
          <span className="text-[10px] bg-[#27AE60]/10 text-[#27AE60] px-2 py-0.5 rounded-full font-semibold border border-[#27AE60]/20">
            📍 {locationLabel}
          </span>
        )}
      </div>
      {isSingleRow ? (
        <div className="space-y-3">
          {rows.map((row) => (
            <div key={row._id} className="bg-[#27AE60]/5 rounded-xl p-3 border border-[#27AE60]/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-[#27AE60]">{row._id}</span>
                <span className="text-sm font-bold text-slate-800">{row.total} projects</span>
              </div>
              <div className="grid grid-cols-8 gap-2">
                {[
                  { label: "Active",    value: row.active    ?? 0, color: "text-emerald-700", bg: "bg-emerald-50" },
                  { label: "Normal",    value: row.normal    ?? 0, color: "text-slate-600",   bg: "bg-slate-50"   },
                  { label: "TopSelling",value: row.featured  ?? 0, color: "text-blue-700",    bg: "bg-blue-50"    },
                  { label: "Prime",     value: row.prime     ?? 0, color: "text-yellow-700",  bg: "bg-yellow-50"  },
                  { label: "Sponsored", value: row.sponsored ?? 0, color: "text-purple-700",  bg: "bg-purple-50"  },
                ].filter((t) => t.value > 0).map((tile) => (
                  <div key={tile.label} className={`${tile.bg} rounded-lg p-2 text-center`}>
                    <p className={`text-base font-bold ${tile.color}`}>{tile.value}</p>
                    <p className="text-[10px] text-slate-500">{tile.label}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {[...rows].sort((a, b) => b.total - a.total).slice(0, 8).map((row) => (
            <div key={row._id}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-slate-700 truncate max-w-[160px]">{row._id}</span>
                <span className="text-xs font-bold text-slate-800 ml-2 flex-shrink-0">{row.total}</span>
              </div>
              {/* <MiniBar value={row.total} max={maxVal} color="bg-[#27AE60]" height="h-2" /> */}
              <div className="flex flex-wrap gap-1 mt-1.5">
                <PromoBadge label="Nornal" value={row.normal}   color="bg-slate-100 text-slate-500" />
                <PromoBadge label="Top Selling" value={row.featured} color="bg-blue-50 text-blue-600" />
                <PromoBadge label="Prime" value={row.prime}    color="bg-yellow-50 text-yellow-700" />
                <PromoBadge label="Sponsored" value={row.sponsored}color="bg-purple-50 text-purple-600" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AnalyticsPriceBlock({ priceAnalytics }) {
  if (!priceAnalytics) return null;
  const tiles = [
    { label: "Min Price",  value: fmt(priceAnalytics.minPrice),     sub: "Lowest listed",  accent: "text-slate-700" },
    { label: "Max Price",  value: fmt(priceAnalytics.maxPrice),     sub: "Highest listed", accent: "text-slate-700" },
    { label: "Avg From",   value: fmt(priceAnalytics.avgPriceFrom), sub: "Avg start",      accent: "text-[#27AE60]" },
    { label: "Avg To",     value: fmt(priceAnalytics.avgPriceTo),   sub: "Avg end",        accent: "text-[#27AE60]" },
  ];
  return (
    <div className="bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 rounded-2xl border border-emerald-100 p-5 shadow-sm h-full">
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-1.5">
        <DollarSign className="w-3.5 h-3.5 text-[#27AE60]" />
        Price Analytics
      </p>
      <div className="grid grid-cols-2 gap-3">
        {tiles.map((t) => (
          <div key={t.label} className="bg-white/70 rounded-xl p-3 border border-white">
            <p className="text-[10px] text-slate-500 font-medium">{t.label}</p>
            <p className={`text-base font-bold mt-0.5 leading-tight ${t.accent}`}>{t.value}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{t.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FULL ANALYTICS DASHBOARD — purely display, receives all data as props
// ─────────────────────────────────────────────────────────────────────────────

// function AnalyticsDashboard({
//   analytics, isLoading, locationLabel, locationType,
//   // independent callbacks — each updates only its own filter slice
//   onPromotionFilter, onStatusFilter,
//   activePromotionFilter, activeStatusFilter,
// }) {
//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center py-10 gap-3">
//         <LoadingSpinner size="md" />
//         <span className="text-sm text-slate-500">Updating analytics…</span>
//       </div>
//     );
//   }

//   if (!analytics?.overview) {
//     return (
//       <div className="text-center py-8 text-slate-400">
//         <BarChart3 className="w-10 h-10 mx-auto mb-2 opacity-20" />
//         <p className="text-sm">No analytics data available</p>
//       </div>
//     );
//   }

//   const ov    = analytics.overview;
//   const total = ov.totalProjects || 0;

//   return (
//     <div className="space-y-4">
//       {/* Row 1 — Overview KPIs */}
//       <AnalyticsOverviewRow
//         ov={ov} total={total}
//         activeStatusFilter={activeStatusFilter}
//         onStatusFilter={onStatusFilter}
//       />

//       {/* Row 2 — Promotion type */}
//       <AnalyticsPromotionRow
//         ov={ov} total={total}
//         activePromotionFilter={activePromotionFilter}
//         onPromotionFilter={onPromotionFilter}
//       />

//       {/* Row 3 — Category + Property type */}
//       {(analytics.categoryWise?.length > 0 || analytics.propertyTypeWise?.length > 0) && (
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//           <AnalyticsCategoryBlock     categoryWise={analytics.categoryWise}         total={total} />
//           <AnalyticsPropertyTypeBlock propertyTypeWise={analytics.propertyTypeWise} />
//         </div>
//       )}

//       {/* Row 4 — Location + Price */}
//       <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
//         <AnalyticsLocationBlock
//           analytics={analytics} locationType={locationType} locationLabel={locationLabel}
//         />
//         <AnalyticsPriceBlock priceAnalytics={analytics.priceAnalytics} />
//       </div>
//     </div>
//   );
// }

const DEFAULT_PANELS = [
  { id: "overview", col: 12, hidden: false },
  { id: "promotions", col: 12, hidden: false },
  { id: "category", col: 4, hidden: false },
  { id: "proptypes", col: 4, hidden: false },
  { id: "location", col: 4, hidden: false },
  { id: "price", col: 6, hidden: false },
  { id: "zone", col: 6, hidden: false },
];

function DraggableAnalyticsDashboard({
  analytics,
  isLoading,
  locationLabel,
  locationType,
  onPromotionFilter,
  onStatusFilter,
  activePromotionFilter,
  activeStatusFilter,
}) {
  const [editMode, setEditMode] = useState(false);
  const [dragSrcId, setDragSrcId] = useState(null);
  const [layout, saveLayout] = useDashboardLayout(DEFAULT_PANELS);

  const swapCards = (srcId, dstId) => {
    const next = [...layout];
    const si = next.findIndex((l) => l.id === srcId);
    const di = next.findIndex((l) => l.id === dstId);
    [next[si], next[di]] = [next[di], next[si]];
    saveLayout(next);
  };

  const resizeCard = (id, delta) => {
    const cols = [4, 6, 12];
    saveLayout(
      layout.map((l) => {
        if (l.id !== id) return l;
        const ni = Math.max(0, Math.min(2, cols.indexOf(l.col) + delta));
        return { ...l, col: cols[ni] };
      }),
    );
  };

  const toggleHide = (id, hidden) =>
    saveLayout(layout.map((l) => (l.id === id ? { ...l, hidden } : l)));

  // Map panel id → analytics sub-component
  const PANEL_MAP = {
    overview: (
      <AnalyticsOverviewRow
        ov={analytics?.overview}
        total={analytics?.overview?.totalProjects || 0}
        activeStatusFilter={activeStatusFilter}
        onStatusFilter={onStatusFilter}
      />
    ),
    promotions: (
      <AnalyticsPromotionRow
        ov={analytics?.overview}
        total={analytics?.overview?.totalProjects || 0}
        activePromotionFilter={activePromotionFilter}
        onPromotionFilter={onPromotionFilter}
      />
    ),
    category: (
      <AnalyticsCategoryBlock
        categoryWise={analytics?.categoryWise}
        total={analytics?.overview?.totalProjects || 0}
      />
    ),
    proptypes: (
      <AnalyticsPropertyTypeBlock
        propertyTypeWise={analytics?.propertyTypeWise}
      />
    ),
    location: (
      <AnalyticsLocationBlock
        analytics={analytics}
        locationType={locationType}
        locationLabel={locationLabel}
      />
    ),
    price: <AnalyticsPriceBlock priceAnalytics={analytics?.priceAnalytics} />,
    zone: (
      <AnalyticsLocationBlock
        analytics={analytics}
        locationType="zone"
        locationLabel={locationLabel}
      />
    ),
  };

  const PANEL_LABELS = {
    overview: "Overview KPIs",
    promotions: "Promotion Types",
    category: "By Category",
    proptypes: "Property Types",
    location: "By Location",
    price: "Price Analytics",
    zone: "Zone Breakdown",
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center py-10 gap-3">
        <LoadingSpinner size="md" />
        <span className="text-sm text-slate-500">Updating…</span>
      </div>
    );
  if (!analytics?.overview) return null;

  return (
    <div className="space-y-3">
      {/* Edit bar */}
      <div className="flex items-center gap-3 justify-end">
        {layout
          .filter((l) => l.hidden)
          .map((l) => (
            <button
              key={l.id}
              onClick={() => toggleHide(l.id, false)}
              className="text-xs px-3 py-1.5 rounded-xl bg-slate-100 text-slate-500 hover:bg-green-50 hover:text-[#27AE60] border border-slate-200 transition"
            >
              + {PANEL_LABELS[l.id]}
            </button>
          ))}
        <button
          onClick={() => setEditMode((v) => !v)}
          className={`text-xs px-3 py-1.5 rounded-xl border transition font-semibold
            ${editMode ? "bg-[#27AE60] text-white border-[#27AE60]" : "bg-white text-slate-600 border-slate-200 hover:border-[#27AE60]"}`}
        >
          {editMode ? "✓ Done" : "Edit layout"}
        </button>
      </div>

      {/* Draggable grid */}
      <div className="grid grid-cols-12 gap-3">
        {layout
          .filter((l) => !l.hidden)
          .map((lt) => (
            <div
              key={lt.id}
              style={{ gridColumn: `span ${lt.col}` }}
              onDragOver={(e) => {
                if (editMode && dragSrcId) e.preventDefault();
              }}
              onDrop={() => {
                if (dragSrcId && dragSrcId !== lt.id)
                  swapCards(dragSrcId, lt.id);
              }}
              className="min-w-0"
            >
              <div
                draggable={editMode}
                onDragStart={() => setDragSrcId(lt.id)}
                onDragEnd={() => setDragSrcId(null)}
                className={`bg-white rounded-2xl border p-4 transition-all
                ${editMode ? "border-[#27AE60]/40 cursor-grab ring-1 ring-[#27AE60]/20" : "border-slate-100"}
                ${dragSrcId === lt.id ? "opacity-40 scale-95" : ""}`}
              >
                {/* Panel header with controls */}
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {PANEL_LABELS[lt.id]}
                  </p>
                  {editMode && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => resizeCard(lt.id, -1)}
                        className="w-6 h-6 flex items-center justify-center text-xs rounded-lg border border-slate-200 hover:border-slate-400 bg-slate-50"
                      >
                        −
                      </button>
                      <span className="text-[10px] text-[#27AE60] font-bold">
                        {lt.col}col
                      </span>
                      <button
                        onClick={() => resizeCard(lt.id, 1)}
                        className="w-6 h-6 flex items-center justify-center text-xs rounded-lg border border-slate-200 hover:border-slate-400 bg-slate-50"
                      >
                        +
                      </button>
                      <button
                        onClick={() => toggleHide(lt.id, true)}
                        className="w-6 h-6 flex items-center justify-center rounded-lg border border-slate-200 hover:border-red-300 hover:bg-red-50 bg-slate-50"
                      >
                        <X className="w-3 h-3 text-slate-400 hover:text-red-500" />
                      </button>
                    </div>
                  )}
                </div>
                {PANEL_MAP[lt.id]}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function ProjectsDashboardPage() {
  const navigate = useNavigate();

  // ── User / Role ──────────────────────────────────────────────────────────
  const { data: user }  = useQuery({ queryKey: ["current-user"], queryFn: getUserInDetails });
  const roleName        = user?.user?.roleName;
  const isSalesManager  = roleName === "sales_manager";
  const isSalesAgent    = roleName === "sales_agent";
  const isSuperAdmin    = roleName === "superadmin";
  const isAdmin         = roleName === "admin";
  const canViewAnalytics = isSuperAdmin || isAdmin || isSalesManager || isSalesAgent;

  // ── Property hooks ───────────────────────────────────────────────────────
  const primeHook     = useFeaturedProjects("prime");
  const featuredHook  = useFeaturedProjects("featured");
  const sponsoredHook = useFeaturedProjects("sponsored");
  const normalHook    = useFeaturedProjects("normal");

  const { data: pendingProjectsData } = usePendingProjects({ enabled: isSalesManager });
  const pendingProjects = pendingProjectsData?.data || [];

  const allProperties = useMemo(() => {
    const merged = [
      ...primeHook.properties, ...featuredHook.properties,
      ...sponsoredHook.properties, ...normalHook.properties,
    ];
    const seen = new Set();
    return merged.filter((p) => { if (seen.has(p._id)) return false; seen.add(p._id); return true; });
  }, [primeHook.properties, featuredHook.properties, sponsoredHook.properties, normalHook.properties]);

  const isLoading = primeHook.isLoading || featuredHook.isLoading || sponsoredHook.isLoading || normalHook.isLoading;

  // ── Unified top-bar state (location + search) — drives analytics ─────────
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [searchTerm,        setSearchTerm]       = useState("");

  // Debounce search for analytics query (400ms) — prevents excessive API calls
  const debouncedSearch = useDebounce(searchTerm, 400);

  // ── Project list filter state (independent of analytics) ─────────────────
  const [promotionFilter,    setPromotionFilter]    = useState("all");
  const [statusFilter,       setStatusFilter]       = useState("all");
  const [categoryFilter,     setCategoryFilter]     = useState("all");
  const [propertyTypeFilter, setPropertyTypeFilter] = useState("all");

  // ── UI toggles ────────────────────────────────────────────────────────────
  const [showAnalytics, setShowAnalytics] = useState(true);

  // ── Modal state ───────────────────────────────────────────────────────────
  const [deleteTarget,       setDeleteTarget]       = useState(null);
  const [promoteTarget,      setPromoteTarget]      = useState(null);
  const [expireTarget,       setExpireTarget]       = useState(null);
  const [resetTarget,        setResetTarget]        = useState(null);
  const [promoteCurrentType, setPromoteCurrentType] = useState("normal");

  const loadMoreRef = useRef(null);

  // ── Analytics query — reactive to location + debounced search ────────────
  const analyticsParams = useMemo(
    () => buildAnalyticsParams(selectedLocation, debouncedSearch),
    [selectedLocation, debouncedSearch],
  );

  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey:  ["project-analytics", analyticsParams],
    queryFn:   () => getAllProjectsAnalytics(analyticsParams),
    enabled:   canViewAnalytics,
    staleTime: 60_000,
  });

  const analytics = analyticsData?.data?.data || analyticsData?.data || null;

  // ── Infinite scroll ───────────────────────────────────────────────────────
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      if (normalHook.hasNextPage    && !normalHook.isFetchingNextPage)    normalHook.fetchNextPage();
      if (featuredHook.hasNextPage  && !featuredHook.isFetchingNextPage)  featuredHook.fetchNextPage();
      if (primeHook.hasNextPage     && !primeHook.isFetchingNextPage)     primeHook.fetchNextPage();
      if (sponsoredHook.hasNextPage && !sponsoredHook.isFetchingNextPage) sponsoredHook.fetchNextPage();
    }, { threshold: 0.5 });
    const el = loadMoreRef.current;
    if (el) observer.observe(el);
    return () => { if (el) observer.unobserve(el); };
  }, [normalHook, featuredHook, primeHook, sponsoredHook]);

  // ── Project list filtering — uses all filter state ────────────────────────
  const visibleProperties = useMemo(() => {
    let list = (promotionFilter === "pending" && isSalesManager) ? pendingProjects : allProperties;

    if (promotionFilter !== "all" && promotionFilter !== "pending")
      list = list.filter((p) => p.promotion?.type === promotionFilter);
    if (statusFilter !== "all")
      list = list.filter((p) => p.status === statusFilter);
    if (categoryFilter !== "all")
      list = list.filter((p) => p.categoryType === categoryFilter);
    if (propertyTypeFilter !== "all")
      list = list.filter((p) => p.propertyType === propertyTypeFilter);

    // Location filter — same as analytics scope
    if (selectedLocation) {
      const { type, value } = selectedLocation;
      if      (type === "state")    list = list.filter((p) => p.state?.trim()    === value);
      else if (type === "city")     list = list.filter((p) => p.city?.trim()     === value);
      else if (type === "locality") list = list.filter((p) => p.locality?.trim() === value);
    }

    // Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      list = list.filter((p) =>
        p.title?.toLowerCase().includes(q)    || p.slug?.toLowerCase().includes(q)  ||
        p._id?.toLowerCase().includes(q)      || p.city?.toLowerCase().includes(q)  ||
        p.locality?.toLowerCase().includes(q) || p.address?.toLowerCase().includes(q)
      );
    }

    return [...list].sort((a, b) => (a.rank ?? Infinity) - (b.rank ?? Infinity));
  }, [
    allProperties, pendingProjects, promotionFilter, statusFilter,
    categoryFilter, propertyTypeFilter, selectedLocation, searchTerm, isSalesManager,
  ]);

  // ── Mutation helpers — fully decoupled per action ─────────────────────────
  const getHook = useCallback((id) => {
    const type = allProperties.find((p) => p._id === id)?.promotion?.type || "normal";
    return { prime: primeHook, featured: featuredHook, sponsored: sponsoredHook, normal: normalHook }[type] ?? normalHook;
  }, [allProperties, primeHook, featuredHook, sponsoredHook, normalHook]);

  const handleDelete  = useCallback((id) => getHook(id).deleteMutation.mutate(id,  { onSettled: () => setDeleteTarget(null)  }), [getHook]);
  const handleExpire  = useCallback((id) => getHook(id).expireMutation.mutate(id,  { onSettled: () => setExpireTarget(null)  }), [getHook]);
  const handleReset   = useCallback((id) => getHook(id).resetMutation.mutate(id,   { onSettled: () => setResetTarget(null)   }), [getHook]);
  const handlePromote = useCallback((newType) =>
    getHook(promoteTarget).promoteMutation.mutate({ id: promoteTarget, newType }, { onSettled: () => setPromoteTarget(null) }),
  [getHook, promoteTarget]);

  const openPromoteModal = useCallback((id) => {
    setPromoteCurrentType(allProperties.find((p) => p._id === id)?.promotion?.type || "normal");
    setPromoteTarget(id);
  }, [allProperties]);

  // ── Active filter count + clear ───────────────────────────────────────────
  const activeFiltersCount = useMemo(() => [
    promotionFilter !== "all", statusFilter !== "all",
    categoryFilter !== "all",  propertyTypeFilter !== "all",
  ].filter(Boolean).length, [promotionFilter, statusFilter, categoryFilter, propertyTypeFilter]);

  const clearListFilters = useCallback(() => {
    setPromotionFilter("all"); setStatusFilter("all");
    setCategoryFilter("all");  setPropertyTypeFilter("all");
  }, []);

  const clearAll = useCallback(() => {
    clearListFilters();
    setSelectedLocation(null);
    setSearchTerm("");
  }, [clearListFilters]);

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* ── MODALS ──────────────────────────────────────────────────────── */}
      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Property"
        message="Are you sure you want to delete this property? This action cannot be undone."
        confirmLabel={
          getHook(deleteTarget)?.deleteMutation?.isPending
            ? "Deleting…"
            : "Delete"
        }
        confirmClass="bg-red-600 hover:bg-red-700 text-white"
        icon={<Trash2 className="w-5 h-5" />}
        iconClass="text-red-600"
        onConfirm={() => handleDelete(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />
      <ConfirmModal
        open={!!expireTarget}
        title="Expire Property"
        message="Mark this property as expired? It will no longer appear in active listings."
        confirmLabel="Expire"
        confirmClass="bg-orange-600 hover:bg-orange-700 text-white"
        icon={<Clock className="w-5 h-5" />}
        iconClass="text-orange-600"
        onConfirm={() => handleExpire(expireTarget)}
        onCancel={() => setExpireTarget(null)}
      />
      <ConfirmModal
        open={!!resetTarget}
        title="Reset Property"
        message="Reset this property back to active status?"
        confirmLabel="Reset"
        confirmClass="bg-[#27AE60] hover:bg-green-700 text-white"
        icon={<RefreshCw className="w-5 h-5" />}
        iconClass="text-[#27AE60]"
        onConfirm={() => handleReset(resetTarget)}
        onCancel={() => setResetTarget(null)}
      />
      <PromoteModal
        open={!!promoteTarget}
        currentType={promoteCurrentType}
        isLoading={getHook(promoteTarget)?.promoteMutation?.isPending}
        onConfirm={handlePromote}
        onCancel={() => setPromoteTarget(null)}
      />

      {/* ── PAGE HEADER ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#27AE60] max-sm:text-2xl">
            All Projects
          </h1>
          <p className="text-slate-500 mt-0.5 text-sm">
            Unified view across all project types
          </p>
        </div>
        <button
          onClick={() => navigate("/create-featured-project")}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#27AE60] text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create Project
        </button>
      </div>

      {/* ── TOP BAR: Location selector + Search — both drive analytics ──── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Location selector (left) */}
          <div className="flex items-center  gap-2 flex-shrink-0">
            <InlineLocationSelector
              properties={allProperties}
              selectedLocation={selectedLocation}
              onLocationChange={setSelectedLocation}
            />
          </div>

          {/* Divider */}
          <div className="hidden  sm:block w-px h-8 bg-slate-200" />

          {/* Search bar (right, fills remaining space) */}
          <div className="flex-1  flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 min-w-0 focus-within:border-[#27AE60]/50 focus-within:bg-white transition">
            <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search projects by title, city, slug, ID, address…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none text-slate-700 placeholder:text-slate-400 min-w-0"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="flex-shrink-0"
              >
                <X className="w-4 h-4 text-slate-400 hover:text-red-500 transition" />
              </button>
            )}
          </div>

          {/* Clear all (shown only when something is active) */}
          {(selectedLocation || searchTerm) && (
            <button
              onClick={clearAll}
              className="flex-shrink-0 text-xs text-red-500 hover:text-red-700 font-semibold px-3 py-2 rounded-xl border border-red-100 hover:border-red-300 bg-red-50 transition whitespace-nowrap"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Active scope indicator */}
        {(selectedLocation || searchTerm) && (
          <div className="flex  flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-100">
            <span className="text-[11px] text-slate-400 font-medium">
              Analytics scope:
            </span>
            {selectedLocation && (
              <span className="inline-flex items-center gap-1.5 text-xs bg-green-50 border border-green-200 text-[#27AE60] rounded-full px-2.5 py-1 font-medium">
                <MapPin className="w-3 h-3" />
                {selectedLocation.label}
                <button onClick={() => setSelectedLocation(null)}>
                  <X className="w-3 h-3 hover:text-red-500" />
                </button>
              </span>
            )}
            {searchTerm && (
              <span className="inline-flex items-center gap-1.5 text-xs bg-slate-50 border border-slate-200 text-slate-700 rounded-full px-2.5 py-1 font-medium">
                <Search className="w-3 h-3" />"{searchTerm}"
                <button onClick={() => setSearchTerm("")}>
                  <X className="w-3 h-3 hover:text-red-500" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── ANALYTICS DASHBOARD (role-gated, driven by location + search) ── */}
      {canViewAnalytics && (
        <div className="bg-gradient-to-br from-[#27AE60]/5 via-emerald-50/50 to-white rounded-2xl border border-[#27AE60]/15 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#27AE60]/10 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-[#27AE60]" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800">
                  Live Analytics Dashboard
                </h2>
                <p className="text-xs text-slate-500">
                  {selectedLocation || searchTerm
                    ? `Filtered · ${[selectedLocation?.label, searchTerm ? `"${searchTerm}"` : ""].filter(Boolean).join(" + ")}`
                    : "All India · All Projects"}
                  {analyticsLoading ? " · updating…" : ""}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAnalytics((v) => !v)}
              className="text-xs text-slate-400 hover:text-slate-700 font-semibold transition px-3 py-1.5 rounded-lg hover:bg-slate-100"
            >
              {showAnalytics ? "Hide" : "Show"}
            </button>
          </div>

          {showAnalytics && (
            // <AnalyticsDashboard
            //   analytics={analytics}
            //   isLoading={analyticsLoading}
            //   locationLabel={selectedLocation?.label || "All India"}
            //   locationType={selectedLocation?.type || null}
            //   // Independent callbacks — each updates only its respective filter
            //   onPromotionFilter={setPromotionFilter}
            //   onStatusFilter={setStatusFilter}
            //   activePromotionFilter={promotionFilter}
            //   activeStatusFilter={statusFilter}
            // />
            <DraggableAnalyticsDashboard
              analytics={analytics}
              isLoading={analyticsLoading}
              locationLabel={selectedLocation?.label || "All India"}
              locationType={selectedLocation?.type || null}
              onPromotionFilter={setPromotionFilter}
              onStatusFilter={setStatusFilter}
              activePromotionFilter={promotionFilter}
              activeStatusFilter={statusFilter}
            />
          )}
        </div>
      )}

      {/* ── PENDING APPROVALS (SalesManager only) ───────────────────────── */}
      {isSalesManager && (
        <div
          onClick={() =>
            setPromotionFilter((prev) =>
              prev === "pending" ? "all" : "pending",
            )
          }
          className={`bg-white rounded-2xl border p-4 shadow-sm cursor-pointer hover:shadow-md transition-all flex items-center gap-4
            ${promotionFilter === "pending" ? "ring-2 ring-amber-400 border-amber-200" : "border-amber-100"}`}
        >
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
            <Clock className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">
              {pendingProjects.length}
            </p>
            <p className="text-sm text-slate-500">Pending Approvals</p>
          </div>
          <div className="ml-auto text-xs text-amber-600 font-semibold bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
            {promotionFilter === "pending" ? "✓ Viewing now" : "Click to view"}
          </div>
        </div>
      )}

      {/* ── PROJECT LIST FILTERS ─────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-end gap-4">
          {/* Category */}
          <div>
            <p className="text-xs font-bold text-slate-600 mb-2">Category</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_TYPES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => {
                    setCategoryFilter(cat.value);
                    setPropertyTypeFilter("all");
                  }}
                  className={`px-4 py-2 rounded-xl border text-xs font-semibold transition
                    ${categoryFilter === cat.value ? "bg-[#27AE60] text-white border-[#27AE60] shadow-sm" : "bg-white text-slate-600 border-slate-200 hover:border-[#27AE60]"}`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <p className="text-xs font-bold text-slate-600 mb-2">Status</p>
            <div className="flex flex-wrap gap-2">
              {STATUS_FILTERS.map((sf) => (
                <button
                  key={sf.value}
                  onClick={() => setStatusFilter(sf.value)}
                  className={`px-3 py-2 rounded-xl border text-xs font-semibold transition
                    ${statusFilter === sf.value ? "bg-slate-700 text-white border-slate-700" : "bg-white text-slate-500 border-slate-200 hover:border-slate-400"}`}
                >
                  {sf.label}
                </button>
              ))}
            </div>
          </div>

          {/* Clear list filters */}
          {activeFiltersCount > 0 && (
            <button
              onClick={clearListFilters}
              className="ml-auto flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 font-semibold px-3 py-2 rounded-xl border border-red-100 hover:border-red-300 bg-red-50 transition"
            >
              <X className="w-3 h-3" />
              Clear filters
              <span className="bg-red-200 text-red-700 rounded-full px-1.5 py-0.5 font-bold">
                {activeFiltersCount}
              </span>
            </button>
          )}
        </div>

        {/* Property type sub-filter */}
        {categoryFilter !== "all" && PROPERTY_TYPES[categoryFilter] && (
          <div>
            <p className="text-xs font-bold text-slate-600 mb-2">
              Property Type
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setPropertyTypeFilter("all")}
                className={`px-3 py-2 rounded-xl border text-xs font-semibold transition
                  ${propertyTypeFilter === "all" ? "bg-[#27AE60] text-white border-[#27AE60]" : "bg-white text-slate-600 border-slate-200 hover:border-[#27AE60]"}`}
              >
                All
              </button>
              {PROPERTY_TYPES[categoryFilter].map((pt) => (
                <button
                  key={pt.value}
                  onClick={() => setPropertyTypeFilter(pt.value)}
                  className={`px-3 py-2 rounded-xl border text-xs font-semibold transition
                    ${propertyTypeFilter === pt.value ? "bg-[#27AE60] text-white border-[#27AE60]" : "bg-white text-slate-600 border-slate-200 hover:border-[#27AE60]"}`}
                >
                  {pt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Active filter chips */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {promotionFilter !== "all" && (
              <span className="inline-flex items-center gap-1.5 text-xs bg-blue-50 border border-blue-200 text-blue-700 rounded-full px-2.5 py-1 font-medium capitalize">
                {promotionFilter}
                <button onClick={() => setPromotionFilter("all")}>
                  <X className="w-3 h-3 hover:text-red-500" />
                </button>
              </span>
            )}
            {statusFilter !== "all" && (
              <span className="inline-flex items-center gap-1.5 text-xs bg-purple-50 border border-purple-200 text-purple-700 rounded-full px-2.5 py-1 font-medium capitalize">
                {statusFilter}
                <button onClick={() => setStatusFilter("all")}>
                  <X className="w-3 h-3 hover:text-red-500" />
                </button>
              </span>
            )}
            {categoryFilter !== "all" && (
              <span className="inline-flex items-center gap-1.5 text-xs bg-amber-50 border border-amber-200 text-amber-700 rounded-full px-2.5 py-1 font-medium capitalize">
                {categoryFilter}
                <button onClick={() => setCategoryFilter("all")}>
                  <X className="w-3 h-3 hover:text-red-500" />
                </button>
              </span>
            )}
            {propertyTypeFilter !== "all" && (
              <span className="inline-flex items-center gap-1.5 text-xs bg-teal-50 border border-teal-200 text-teal-700 rounded-full px-2.5 py-1 font-medium capitalize">
                {propertyTypeFilter}
                <button onClick={() => setPropertyTypeFilter("all")}>
                  <X className="w-3 h-3 hover:text-red-500" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── RESULTS HEADER ───────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-800">
          Projects
          <span className="text-slate-400 font-normal text-sm ml-2">
            ({visibleProperties.length})
          </span>
        </h2>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <ArrowUpDown className="w-3.5 h-3.5" />
          Sorted by rank
          {(activeFiltersCount > 0 || selectedLocation || searchTerm) && (
            <span className="flex items-center gap-1 bg-[#27AE60]/10 text-[#27AE60] px-2.5 py-1 rounded-full font-semibold">
              <Filter className="w-3 h-3" />
              {activeFiltersCount +
                (selectedLocation ? 1 : 0) +
                (searchTerm ? 1 : 0)}{" "}
              active
            </span>
          )}
        </div>
      </div>

      {/* ── PROPERTY GRID ────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : visibleProperties.length === 0 ? (
        <div className="text-center py-20 text-slate-500 bg-white rounded-2xl border border-slate-200">
          <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="font-medium text-base">No projects found</p>
          <p className="text-sm text-slate-400 mt-1">
            Try adjusting your filters or search term
          </p>
          {(activeFiltersCount > 0 || selectedLocation || searchTerm) && (
            <button
              onClick={clearAll}
              className="mt-3 text-sm text-[#27AE60] underline underline-offset-2"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {visibleProperties.map((p) => (
            <PropertyCard
              key={p._id}
              property={p}
              type={p.promotion?.type || "normal"}
              onDelete={() => setDeleteTarget(p._id)}
              onPromote={() => openPromoteModal(p._id)}
              onExpire={() => setExpireTarget(p._id)}
              onReset={() => setResetTarget(p._id)}
            />
          ))}
        </div>
      )}

      {/* ── INFINITE SCROLL SENTINEL ─────────────────────────────────────── */}
      <div ref={loadMoreRef} className="h-16 flex justify-center items-center">
        {(normalHook.isFetchingNextPage ||
          featuredHook.isFetchingNextPage ||
          primeHook.isFetchingNextPage ||
          sponsoredHook.isFetchingNextPage) && (
          <div className="flex flex-col items-center gap-2">
            <LoadingSpinner size="sm" />
            <p className="text-xs text-slate-500">Loading more…</p>
          </div>
        )}
        {!normalHook.hasNextPage &&
          !featuredHook.hasNextPage &&
          !primeHook.hasNextPage &&
          !sponsoredHook.hasNextPage &&
          allProperties.length > 0 && (
            <p className="text-sm text-slate-400">All projects loaded</p>
          )}
      </div>
    </div>
  );
}