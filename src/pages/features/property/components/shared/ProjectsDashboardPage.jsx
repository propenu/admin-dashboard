// src/pages/features/property/components/shared/ProjectsDashboardPage.jsx
import {
  useState, useEffect, useRef, useMemo, useCallback, useReducer,
} from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Search, X, ChevronDown, ChevronRight, MapPin, Building2, Plus, Clock,
  Star, TrendingUp, Zap, BarChart3, Filter, RefreshCw, Trash2, ArrowUpDown,
  Navigation, Globe, ChevronUp, Eye, MousePointerClick, MessageSquare, Home,
  Layers, Activity, DollarSign, CheckCircle2, AlertCircle, PieChart,
  AlertTriangle,
} from "lucide-react";

import { useFeaturedProjects }     from "../../../../features/property/hooks/useFeaturedProjects";
import { usePendingProjects }      from "../../../../features/property/hooks/usePendingProjects";
import { getUserInDetails }        from "./userInDetails";
import PropertyCard                from "../../../../features/property/components/shared/PropertyCard";
import PromoteModal                from "../../../../features/property/components/shared/PromoteModal";
import ConfirmModal                from "../../../../features/property/components/shared/ConfirmModal";
import LoadingSpinner              from "../../../../../components/common/LoadingSpinner";
import {
  deleteFeaturedProject,
  getAllProjectsAnalytics,
} from "../../../../../features/property/propertyService";
import {
  getPromotionTracking,
  promotionLifecycleClass,
  promotionLifecycleCopy,
} from "./promotionTracking";

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
  { value: "residential", label: "Residential"   },
  { value: "land",        label: "Land"          },
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

// const STATUS_FILTERS = [
//   { value: "all",      label: "All Status" },
//   { value: "active",   label: "Active"     },
//   { value: "inactive", label: "Inactive"   },
//   { value: "expired",  label: "Expired"    },
// ];

const STATUS_FILTERS = [
  { value: "all", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "scheduled", label: "Scheduled" },
  { value: "expiringSoon", label: "Expiring Soon" },
  { value: "expired", label: "Expired" },
  { value: "inactive", label: "Inactive" },
];

const TRACKING_FILTERS = [
  { value: "all", label: "All Tracking" },
  { value: "promoted", label: "Promoted History" },
  { value: "active", label: "Live Promotion" },
  { value: "expiringSoon", label: "Expiring Soon" },
  { value: "expired", label: "Expired" },
  { value: "scheduled", label: "Scheduled" },
];

const TYPE_COLORS = [
  "bg-emerald-600","bg-emerald-500","bg-emerald-400","bg-emerald-300",
  "bg-teal-600","bg-teal-500","bg-teal-400","bg-teal-300",
];

const PROJECTS_PER_PAGE = 20;

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

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

// ───────────────────────────────────────────
// PROJECT STATUS HELPER
// ───────────────────────────────────────────

const getProjectStatus = (project) => {
  const tracking = getPromotionTracking(project);
  if (tracking.currentType === "normal") {
    return {
      status: project.status || "inactive",
      daysLeft: null,
    };
  }
  return {
    status: tracking.lifecycle === "critical" ? "expiringSoon" : tracking.lifecycle,
    daysLeft: tracking.daysLeft,
  };
};


const pct = (part, total) => (!total ? 0 : Math.round((part / total) * 100));

const normalizeSearchText = (value) =>
  String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

// Debounce hook — prevents analytics from firing on every keystroke
function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

const buildAnalyticsParams = (selectedLocation, analyticsSearch) => {
  const params = {};

  if (selectedLocation?.value?.state) {
    params.state = selectedLocation.value.state;
  }

  if (selectedLocation?.value?.city) {
    params.city = selectedLocation.value.city;
  }

  if (selectedLocation?.value?.locality) {
    params.locality = selectedLocation.value.locality;
  }

  if (analyticsSearch?.trim()) {
    params.search = analyticsSearch.trim();
  }

  return params;
};



const resolveLocationRows = (analytics, locationType) => {
  if (!analytics) return { rows: [], label: "Location" };

  // state selected -> show cities
  if (locationType === "state" && analytics.cityWise?.length > 0) {
    return {
      rows: analytics.cityWise,
      label: "City",
    };
  }

  // city selected -> show localities
  if (
    (locationType === "city" || locationType === "locality") &&
    analytics.localityWise?.length > 0
  ) {
    return {
      rows: analytics.localityWise,
      label: "Locality",
    };
  }

  // All India
  if (!locationType && analytics.stateWise?.length > 0) {
    return {
      rows: analytics.stateWise,
      label: "State",
    };
  }

  return {
    rows: [],
    label: "Location",
  };
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

function PromoBadge({ label, value }) {
  if (!value) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
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

function InlineLocationSelector({
  properties,
  analytics,
  masterAnalytics,
  selectedLocation,
  onLocationChange,
  analyticsSearch,
  setAnalyticsSearch,
}) {
  const [open, setOpen] = useState(false);
  
  const [openZones, setOpenZones] = useState({});
  const [openStates, setOpenStates] = useState({});
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
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
       if (!map[state][city]) {
         map[state][city] = new Set();
       }

       if (locality) {
         map[state][city].add(locality);
       }
     }
   });

   return map;
 }, [properties]);

  const q = analyticsSearch.toLowerCase().trim();
  const toggle = (setter, key) =>
    setter((prev) => ({ ...prev, [key]: !prev[key] }));
  

  const isActive = (type, val) =>
    selectedLocation?.type === type &&
    JSON.stringify(selectedLocation?.value) === JSON.stringify(val);

  const selectItem = (type, value, label) => {
    onLocationChange(isActive(type, value) ? null : { type, value, label });
    setOpen(false);
  };

  const stateVisible = useCallback(
    (state) => {
      if (!q) return true;
      if (state.toLowerCase().includes(q)) return true;
      return Object.keys(hierarchy[state] || {}).some(
        (c) =>
          c.toLowerCase().includes(q) ||
          Array.from(hierarchy[state][c]).some((l) =>
            l.toLowerCase().includes(q),
          ),
      );
    },
    [q, hierarchy],
  );

  const zonesWithData = INDIA_ZONES.filter((z) =>
    z.states.some((s) => hierarchy[s]),
  );
  const allStateKeys = Object.keys(hierarchy);
  const ungroupedStates = allStateKeys.filter(
    (s) => !INDIA_ZONES.flatMap((z) => z.states).includes(s),
  );

  const renderState = (state) => {
    

    const cities = Object.keys(hierarchy[state] || {}).map((city) => ({
      name: city,
      count: masterAnalytics?.cityWise?.find((x) => x._id === city)?.total || 0,
    }));
    
   

  const stateCount =
    masterAnalytics?.stateWise?.find((x) => x._id === state)?.total || 0;

   
   const isStateOpen = openStates[state];

    return (
      <div key={state} className="border-b  border-slate-50">
        <div className="flex items-center">
          <button
            
            onClick={() =>
              selectItem(
                "state",
                {
                  state,
                },
                state,
              )
            }
            className={`flex-1 flex items-center gap-2 pl-7 pr-2 py-2 text-xs transition
              ${isActive("state", state) ? "bg-[#27AE60]/10 text-[#27AE60] font-semibold" : "text-slate-600 hover:bg-green-50"}`}
          >
            <MapPin className="w-3 h-3 flex-shrink-0 opacity-40" />
            <span className="flex-1 text-left">{state}</span>
            <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">
              {stateCount}
            </span>
          </button>
          {cities.length > 0 && (
            <button
              onClick={() => toggle(setOpenStates, state)}
              className="px-2 py-2 hover:bg-slate-100 transition"
            >
              <ChevronRight
                className={`w-3 h-3 text-slate-400 transition-transform ${isStateOpen ? "rotate-90" : ""}`}
              />
            </button>
          )}
        </div>

        {isStateOpen && cities.length > 0 && (
          <div className="bg-slate-50/70 border-t border-slate-100 px-3 py-2 space-y-2">
            <SelectDropdown
              label="City"
              
              value={
                selectedLocation?.type === "city"
                  ? selectedLocation.value.city
                  : ""
              }
              options={[
                { value: "", label: "All Cities" },
                ...cities
                  .filter((c) => !q || c.name.toLowerCase().includes(q))
                  .map((c) => ({
                    value: c.name,
                    label: `${c.name} (${c.count})`,
                  })),
              ]}
              onChange={(val) => {
                if (!val) {
                  selectItem(
                    "state",
                    {
                      state,
                    },
                    state,
                  );
                } else {
                  selectItem(
                    "city",
                    {
                      state,
                      city: val,
                    },
                    `${val}, ${state}`,
                  );
                }
              }}
              placeholder="Select city…"
            />
            {(() => {
              const activeCity =
                selectedLocation?.type === "city"
                  ? selectedLocation.value.city
                  : null;
              const activeCityFromLocality =
                selectedLocation?.type === "locality"
                  ? selectedLocation.value.city
                  : null;
              const cityForLocalities = activeCity || activeCityFromLocality;
              if (!cityForLocalities) return null;
              
              const localities = Array.from(
                hierarchy[state][cityForLocalities] || [],
              ).map((locality) => ({
                name: locality,
                count:
                  masterAnalytics?.localityWise?.find((x) => x._id === locality)
                    ?.total || 0,
              }));
              if (!localities.length) return null;
              return (
                <SelectDropdown
                  label="Locality"
                  
                  value={
                    selectedLocation?.type === "locality"
                      ? selectedLocation.value.locality
                      : ""
                  }
                  
                  options={[
                    { value: "", label: "All Localities" },
                    ...localities
                      .filter((l) => !q || l.name.toLowerCase().includes(q))
                      .map((l) => ({
                        value: l.name,
                        label: `${l.name} (${l.count})`,
                      })),
                  ]}
                  onChange={(val) => {
                    if (!val)
                      
                      selectItem(
                        "city",
                        {
                          state,
                          city: cityForLocalities,
                        },
                        `${cityForLocalities}, ${state}`,
                      );
                    else
                      
                      selectItem(
                        "locality",
                        {
                          state,
                          city: cityForLocalities,
                          locality: val,
                        },
                        `${val}, ${cityForLocalities}`,
                      );
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
          ${
            selectedLocation
              ? "bg-[#27AE60]/10 border-[#27AE60]/40 text-[#27AE60]"
              : "bg-white border-slate-200 text-slate-600 hover:border-[#27AE60]/50"
          }`}
      >
        <Navigation className="w-4 h-4 flex-shrink-0" />
        <span className="flex-1 text-left truncate max-w-[160px]">
          {selectedLocation ? selectedLocation.label : "All India"}
        </span>
        {selectedLocation && (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              onLocationChange(null);
            }}
            onKeyDown={(e) =>
              e.key === "Enter" && (e.stopPropagation(), onLocationChange(null))
            }
            className="hover:text-red-500 transition"
          >
            <X className="w-3.5 h-3.5" />
          </span>
        )}
        <ChevronDown
          className={`w-3.5 h-3.5 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-[calc(100vw-2rem)] max-w-[420px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:w-[420px]">
          {/* Search */}
          <div className="border-b border-slate-100 bg-slate-50 p-3">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/10">
              <Search className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search zone, state, city…"
                value={analyticsSearch}
                onChange={(e) => setAnalyticsSearch(e.target.value)}
                className="flex-1 bg-transparent text-xs outline-none text-slate-700 placeholder:text-slate-400"
                autoFocus
              />
              {analyticsSearch && (
                <button onClick={() => setAnalyticsSearch("")}>
                  <X className="w-3 h-3 text-slate-400 hover:text-red-500" />
                </button>
              )}
            </div>
          </div>

          {/* All India */}
          <button
            onClick={() => {
              onLocationChange(null);
              setOpen(false);
            }}
            className={`w-full  flex items-center gap-2 px-3 py-2.5 text-xs font-semibold transition border-b border-slate-100
              ${!selectedLocation ? "bg-[#27AE60]/10 text-[#27AE60]" : "text-slate-600 hover:bg-slate-50"}`}
          >
            <Globe className="w-3.5 h-3.5" />
            All India
            <span className="ml-auto text-[10px] bg-[#27AE60] text-white px-1.5 py-0.5 rounded-full">
              {/* {properties.length} */}
              {masterAnalytics?.overview?.totalProjects || 0}
            </span>
          </button>

          {/* Zone tree */}
          <div className="max-h-[min(60vh,430px)] min-h-[280px] overflow-y-auto">
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
                    {isZoneOpen ? (
                      <ChevronUp className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    )}
                  </button>
                  {isZoneOpen &&
                    zoneStates.filter(stateVisible).map((s) => renderState(s))}
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

function KPICard({ label, display, icon: Icon, onClick, isActive }) {
  return (
    <div
      onClick={onClick}
      className={`group flex min-w-0 items-center gap-3 rounded-xl border bg-white px-3 py-2.5 shadow-[0_4px_14px_rgba(22,163,74,0.10)] transition-all duration-200 sm:px-3.5 sm:py-3
        ${onClick ? "cursor-pointer hover:border-emerald-300 hover:shadow-md" : "border-slate-200"}
        ${isActive ? "border-emerald-500 ring-2 ring-emerald-500/15 shadow-md" : "border-slate-200"}`}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium leading-tight text-slate-600 sm:text-xs lg:text-[11px] xl:text-xs">
          {label}
        </p>
        <p className="mt-1 text-lg font-bold leading-none tracking-tight text-slate-900">
          {display}
        </p>
      </div>
    </div>
  );
}

function AnalyticsOverviewRow({
  ov,
  total,
  activeStatusFilter,
  onStatusFilter,
}) {
  // onStatusFilter — independent action, only updates project list status filter
  const cards = [
    {
      label: "Total Projects",
      display: String(total),
      icon: Building2,
      color: "text-slate-700",
      iconBg: "bg-slate-100",
      border: "border-slate-200",
    },
    {
      label: "Active",
      display: String(ov.activeProjects ?? 0),
      sub: `${pct(ov.activeProjects, total)}% of total`,
      icon: CheckCircle2,
      color: "text-emerald-700",
      iconBg: "bg-emerald-50",
      border: "border-emerald-100",
      filter: "active",
    },
    // {
    //   label: "Scheduled",
    //   display: String(scheduledCount),
    //   sub: `${pct(ov.scheduledProjects, total)}% of total`,
    //   icon: Clock,
    //   color: "text-amber-700",
    //   iconBg: "bg-amber-50",
    //   border: "border-amber-100",
    //   filter: "scheduled",
    // },

    // {
    //   label: "Expiring Soon",
    //   display: String(expiringSoonCount),
    //   sub: `${pct(ov.expiringSoonProjects, total)}% of total`,
    //   icon: AlertTriangle,
    //   color: "text-rose-700",
    //   iconBg: "bg-rose-50",
    //   border: "border-rose-100",
    //   filter: "expiringSoon",
    // },
    {
      label: "Pending",
      display: String(ov.pendingProjects ?? 0),
      sub: `${pct(ov.pendingProjects, total)}% of total`,
      icon: Clock,
      color: "text-amber-700",
      iconBg: "bg-amber-50",
      border: "border-amber-100",
      filter: "pending",
    },
    {
      label: "Inactive",
      display: String(ov.inactiveProjects ?? 0),
      icon: AlertCircle,
      color: "text-purple-700",
      iconBg: "bg-purple-50",
      border: "border-purple-100",
      filter: "inactive",
    },
    {
      label: "Total Views",
      display: fmtNum(ov.totalViews ?? 0),
      icon: Eye,
      color: "text-blue-700",
      iconBg: "bg-blue-50",
      border: "border-blue-100",
    },
    {
      label: "Inquiries",
      display: fmtNum(ov.totalInquiries ?? 0),
      icon: MessageSquare,
      color: "text-teal-700",
      iconBg: "bg-teal-50",
      border: "border-teal-100",
    },
    {
      label: "Clicks",
      display: fmtNum(ov.totalClicks ?? 0),
      icon: MousePointerClick,
      color: "text-indigo-700",
      iconBg: "bg-indigo-50",
      border: "border-indigo-100",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
      {cards.map((c) => (
        <KPICard
          key={c.label}
          label={c.label}
          display={c.display}
          icon={c.icon}
          color={c.color}
          iconBg={c.iconBg}
          border={c.border}
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
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((c) => {
        const Icon = c.icon;
        const isActive = activePromotionFilter === c.key;
        return (
          <div
            key={c.key}
            onClick={() => onPromotionFilter(c.key)}
            className={`flex min-w-0 cursor-pointer items-center justify-between gap-3 rounded-xl border bg-white p-4 shadow-[0_4px_14px_rgba(22,163,74,0.10)] transition-all duration-200 hover:border-emerald-300 hover:shadow-md
              ${isActive ? "border-emerald-500 ring-2 ring-emerald-500/15 shadow-md" : "border-slate-200"}`}
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                <Icon className="h-4 w-4" />
              </span>
              <p className="truncate text-sm font-semibold text-slate-600">{c.label}</p>
            </div>
            <p className="text-xl font-bold leading-none text-slate-900">
              {c.value}
            </p>
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
    <div className="h-full rounded-2xl border border-emerald-100 bg-white p-4 shadow-[0_5px_18px_rgba(22,163,74,0.10)] sm:p-5">
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-1.5">
        <Layers className="w-3.5 h-3.5 text-[#27AE60]" />
        By Category
      </p>
      <div className="space-y-4">
        {filtered.map((cat) => (
          <div key={cat._id}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                <span className="capitalize">{cat._id}</span>
              </span>
              <span className="text-sm font-bold text-slate-800">
                {cat.total}
                
              </span>
            </div>

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
    <div className="h-full rounded-2xl border border-emerald-100 bg-white p-4 shadow-[0_5px_18px_rgba(22,163,74,0.10)] sm:p-5">
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
 
   const [search, setSearch] = useState("");

  const { rows, label } = resolveLocationRows(analytics, locationType);
  
  const filteredRows = rows
    .filter((row) => row?._id)
    .filter((row) => row._id.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (b?.total || 0) - (a?.total || 0));

   

  if (!rows?.length) {
    return (
      <div className="bg-white rounded-2xl p-6 text-center text-slate-400">
        No {label} data available
      </div>
    );
  }
  
 // const maxVal = rows.reduce((m, r) => Math.max(m, r.total), 1);
 const maxVal =
   rows?.length > 0 ? rows.reduce((m, r) => Math.max(m, r?.total || 0), 1) : 1;
  
   const isSingleRow = rows.length === 1;

  return (
    <div className="custom-scrollbar h-[300px] overflow-y-auto rounded-2xl border border-emerald-100 bg-white p-4 shadow-[0_5px_18px_rgba(22,163,74,0.10)] sm:p-5">
      
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-[#27AE60]" />
          By {label}
        </p>
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-2 border border-[#27AE60] rounded-xl px-3 py-2 bg-slate-50">
          <Search className="w-4 h-4 text-slate-400" />

          <input
            type="text"
            placeholder={`Search ${label}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none  text-sm  text-[#000000] placeholder:text-[#000000]/50"
          />

          {search && (
            <button onClick={() => setSearch("")}>
              <X className="w-4 h-4 text-slate-400 hover:text-red-500" />
            </button>
          )}
        </div>
      </div>
      {isSingleRow ? (
        <div className="space-y-3">
          {rows.map((row) => (
            <div
              key={row._id}
              className="bg-[#27AE60]/5 rounded-xl p-3 border border-[#27AE60]/10"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-[#27AE60]">
                  {row._id}
                </span>
                <span className="text-sm font-bold text-slate-800">
                  {row.total} projects
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                {[
                  {
                    label: "Active",
                    value: row.active ?? 0,
                    color: "text-emerald-700",
                    bg: "bg-emerald-50",
                  },
                  {
                    label: "Normal",
                    value: row.normal ?? 0,
                    color: "text-slate-600",
                    bg: "bg-slate-50",
                  },
                  {
                    label: "TopSelling",
                    value: row.featured ?? 0,
                    color: "text-blue-700",
                    bg: "bg-blue-50",
                  },
                  {
                    label: "Prime",
                    value: row.prime ?? 0,
                    color: "text-yellow-700",
                    bg: "bg-yellow-50",
                  },
                  {
                    label: "Sponsored",
                    value: row.sponsored ?? 0,
                    color: "text-purple-700",
                    bg: "bg-purple-50",
                  },
                ]
                  .filter((t) => t.value > 0)
                  .map((tile) => (
                    <div
                      key={tile.label}
                      className={`${tile.bg} rounded-lg p-2 text-center`}
                    >
                      <p className={`text-base font-bold ${tile.color}`}>
                        {tile.value}
                      </p>
                      <p className="text-[10px] text-slate-500">{tile.label}</p>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRows.length === 0 ? (
            <div className="text-center text-slate-400 py-5">
              No {label} found
            </div>
          ) : (
            [...filteredRows]
              .sort((a, b) => (b?.total || 0) - (a?.total || 0))
              .map((row) => (
                <div key={row._id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-700 truncate max-w-[160px]">
                      {row._id}
                    </span>
                    <span className="text-xs font-bold text-slate-800 ml-2 flex-shrink-0">
                      {row?.total ?? 0}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    <PromoBadge
                      label="Nornal"
                      value={row?.normal ?? 0}
                      color="bg-slate-100 text-slate-500"
                    />
                    <PromoBadge
                      label="Top Selling"
                      value={row?.featured ?? 0}
                      color="bg-blue-50 text-blue-600"
                    />
                    <PromoBadge
                      label="Prime"
                      value={row?.prime ?? 0}
                      color="bg-yellow-50 text-yellow-700"
                    />
                    <PromoBadge
                      label="Sponsored"
                      value={row?.sponsored ?? 0}
                      color="bg-purple-50 text-purple-600"
                    />
                  </div>
                </div>
              ))
          )}
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
    <div className="h-full rounded-2xl border border-emerald-100 bg-white p-4 shadow-[0_5px_18px_rgba(22,163,74,0.10)] sm:p-5">
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

function AnalyticsDashboard({
  analytics,
  isLoading,
  locationLabel,
  locationType,
  // independent callbacks — each updates only its own filter slice
  onPromotionFilter,
  onStatusFilter,
  activePromotionFilter,
  activeStatusFilter,
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10 gap-3">
        <LoadingSpinner size="md" />
        <span className="text-sm text-slate-500">Updating analytics…</span>
      </div>
    );
  }

  if (!analytics?.overview) {
    return (
      <div className="text-center py-8 text-slate-400">
        <BarChart3 className="w-10 h-10 mx-auto mb-2 opacity-20" />
        <p className="text-sm">No analytics data available</p>
      </div>
    );
  }

  const ov = analytics.overview;
  const total = ov.totalProjects || 0;

  return (
    <div className="space-y-4">
      {/* Row 1 — Overview KPIs */}
      <AnalyticsOverviewRow
        ov={ov}
        total={total}
        activeStatusFilter={activeStatusFilter}
        onStatusFilter={onStatusFilter}
      />

      {/* Row 2 — Promotion type */}
      <AnalyticsPromotionRow
        ov={ov}
        total={total}
        activePromotionFilter={activePromotionFilter}
        onPromotionFilter={onPromotionFilter}
      />

      {/* Row 3 — Category + Property type */}
      {(analytics.categoryWise?.length > 0 ||
        analytics.propertyTypeWise?.length > 0) && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <AnalyticsCategoryBlock
            categoryWise={analytics.categoryWise}
            total={total}
          />
          <AnalyticsPropertyTypeBlock
            propertyTypeWise={analytics.propertyTypeWise}
          />
        </div>
      )}

      {/* Row 4 — Location + Price */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <AnalyticsLocationBlock
          analytics={analytics}
          locationType={locationType}
          locationLabel={locationLabel}
        />
        <AnalyticsPriceBlock priceAnalytics={analytics.priceAnalytics} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function ProjectsDashboardPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // ── User / Role ──────────────────────────────────────────────────────────
  const { data: user }  = useQuery({ queryKey: ["current-user"], queryFn: getUserInDetails });
  const roleName        = user?.user?.roleName;
  const isSalesManager  = roleName === "sales_manager";
  const isSalesAgent    = roleName === "sales_agent";
  const isSuperAdmin    = roleName === "super_admin";
  const isAdmin         = roleName === "admin";
  const canViewAnalytics = isSuperAdmin || isAdmin || isSalesManager || isSalesAgent;
  const canViewPendingProjects = isSuperAdmin || isSalesManager;
  const [trackingFilter, setTrackingFilter] = useState(
    () => searchParams.get("tracking") || "all",
  );
  const serverPromotionStatus =
    trackingFilter === "expired" || trackingFilter === "scheduled"
      ? trackingFilter
      : null;
  const [projectSearch, setProjectSearch] = useState(
    () => searchParams.get("search") || "",
  );
  const debouncedProjectSearch = useDebounce(projectSearch, 350);

  

  // ── Property hooks ───────────────────────────────────────────────────────
  const projectQueryOptions = { search: debouncedProjectSearch };
  const primeHook     = useFeaturedProjects("prime", projectQueryOptions);
  const featuredHook  = useFeaturedProjects("featured", projectQueryOptions);
  const sponsoredHook = useFeaturedProjects("sponsored", projectQueryOptions);
  const normalHook    = useFeaturedProjects("normal", projectQueryOptions);
  const lifecycleHook = useFeaturedProjects(null, {
    promotionStatus: serverPromotionStatus,
    search: debouncedProjectSearch,
    enabled: !!serverPromotionStatus,
  });

  


  const { data: pendingProjectsData, refetch: refetchPendingProjects } = usePendingProjects({ enabled: canViewPendingProjects });
  const pendingProjects = pendingProjectsData?.data || [];

  const refreshAllProjects = useCallback(() => {
    primeHook.refetch();
    featuredHook.refetch();
    sponsoredHook.refetch();
    normalHook.refetch();
    if (serverPromotionStatus) lifecycleHook.refetch();
    refetchPendingProjects?.();
  }, [
    featuredHook,
    lifecycleHook,
    normalHook,
    primeHook,
    refetchPendingProjects,
    serverPromotionStatus,
    sponsoredHook,
  ]);

  useEffect(() => {
    console.log({
      prime: primeHook.totalCount,
      featured: featuredHook.totalCount,
      sponsored: sponsoredHook.totalCount,
      normal: normalHook.totalCount,
    });
  }, [
    primeHook.totalCount,
    featuredHook.totalCount,
    sponsoredHook.totalCount,
    normalHook.totalCount,
  ]);

  const allProperties = useMemo(() => {
    if (serverPromotionStatus) {
      return lifecycleHook.properties;
    }

    const merged = [
      ...primeHook.properties, ...featuredHook.properties,
      ...sponsoredHook.properties, ...normalHook.properties,
    ];
    const seen = new Set();
    return merged.filter((p) => { if (seen.has(p._id)) return false; seen.add(p._id); return true; });
  }, [
    serverPromotionStatus,
    lifecycleHook.properties,
    primeHook.properties,
    featuredHook.properties,
    sponsoredHook.properties,
    normalHook.properties,
  ]);

  console.log("Prime:", primeHook.properties.length);
  console.log("Featured:", featuredHook.properties.length);
  console.log("Sponsored:", sponsoredHook.properties.length);
  console.log("Normal:", normalHook.properties.length);
  console.log("All Properties:", allProperties.length);
  

  const isLoading = serverPromotionStatus
    ? lifecycleHook.isLoading
    : primeHook.isLoading ||
      featuredHook.isLoading ||
      sponsoredHook.isLoading ||
      normalHook.isLoading;
  // ── Unified top-bar state (location + search) — drives analytics ─────────
  const [selectedLocation, setSelectedLocation] = useState(() => {
    const savedLocation = searchParams.get("location");
    if (!savedLocation) return null;
    try {
      return JSON.parse(savedLocation);
    } catch {
      return null;
    }
  });
  //const [searchTerm, setSearchTerm] = useState("");
  const [analyticsSearch, setAnalyticsSearch] = useState(
    () => searchParams.get("analyticsSearch") || "",
  );
  const debouncedAnalyticsSearch = useDebounce(analyticsSearch, 400);

  // ── Project list filter state (independent of analytics) ─────────────────
  const [promotionFilter, setPromotionFilter] = useState(
    () => searchParams.get("promotion") || "all",
  );
  const [statusFilter, setStatusFilter] = useState(
    () => searchParams.get("status") || "all",
  );
  const [categoryFilter, setCategoryFilter] = useState(
    () => searchParams.get("category") || "all",
  );
  const [propertyTypeFilter, setPropertyTypeFilter] = useState(
    () => searchParams.get("propertyType") || "all",
  );
  const [sortBy, setSortBy] = useState(
    () => searchParams.get("sort") || "rank",
  );
  const [currentPage, setCurrentPage] = useState(() => {
    const savedPage = Number(searchParams.get("page"));
    return Number.isInteger(savedPage) && savedPage > 0 ? savedPage : 1;
  });
  const hasMountedProjectFilters = useRef(false);

  useEffect(() => {
    const next = new URLSearchParams();
    if (trackingFilter !== "all") next.set("tracking", trackingFilter);
    if (selectedLocation) next.set("location", JSON.stringify(selectedLocation));
    if (analyticsSearch.trim()) next.set("analyticsSearch", analyticsSearch);
    if (debouncedProjectSearch) next.set("search", debouncedProjectSearch);
    if (promotionFilter !== "all") next.set("promotion", promotionFilter);
    if (statusFilter !== "all") next.set("status", statusFilter);
    if (categoryFilter !== "all") next.set("category", categoryFilter);
    if (propertyTypeFilter !== "all") {
      next.set("propertyType", propertyTypeFilter);
    }
    if (sortBy !== "rank") next.set("sort", sortBy);
    if (currentPage > 1) next.set("page", String(currentPage));
    setSearchParams(next, { replace: true });
  }, [
    analyticsSearch,
    categoryFilter,
    currentPage,
    debouncedProjectSearch,
    promotionFilter,
    propertyTypeFilter,
    selectedLocation,
    setSearchParams,
    sortBy,
    statusFilter,
    trackingFilter,
  ]);

  // ── UI toggles ────────────────────────────────────────────────────────────
  const [showAnalytics, setShowAnalytics] = useState(true);

  // ── Modal state ───────────────────────────────────────────────────────────
  const [deleteTarget,       setDeleteTarget]       = useState(null);
  const [deleteLoading,      setDeleteLoading]      = useState(false);
  const [promoteTarget,      setPromoteTarget]      = useState(null);
  const [expireTarget,       setExpireTarget]       = useState(null);
  const [resetTarget,        setResetTarget]        = useState(null);
  const [promoteCurrentType, setPromoteCurrentType] = useState("normal");

  const { data: masterAnalyticsData } = useQuery({
    queryKey: ["master-project-analytics"],
    queryFn: () => getAllProjectsAnalytics({}),
    staleTime: Infinity,
  });

  const masterAnalytics = masterAnalyticsData?.data?.data || null;

  const analyticsParams = useMemo(
    () => buildAnalyticsParams(selectedLocation, debouncedAnalyticsSearch),
    [selectedLocation, debouncedAnalyticsSearch],
  );

  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey:  ["project-analytics", analyticsParams],
    queryFn:   () => getAllProjectsAnalytics(analyticsParams),
    enabled:   canViewAnalytics,
    staleTime: 60_000,
  });

 const analytics = analyticsData?.data?.data || analyticsData?.data || null;

 useEffect(() => {
   console.log("selectedLocation", selectedLocation);
   console.log("analytics", analytics);
 }, [selectedLocation, analytics]);


  // ── Project list filtering — uses all filter state ────────────────────────
  const visibleProperties = useMemo(() => {

    
    let list =
      promotionFilter === "pending" && canViewPendingProjects
        ? pendingProjects
        : allProperties;

        console.log("Initial", list.length);

    if (promotionFilter !== "all" && promotionFilter !== "pending"){
      list = list.filter((p) => p.promotion?.type === promotionFilter);
      console.log("After promotion", list.length);
    }
    if (statusFilter !== "all"){
      //list = list.filter((p) => p.status === statusFilter);
      list = list.filter((p) => getProjectStatus(p).status === statusFilter);
      console.log("After status", list.length);
    }
    if (trackingFilter !== "all" && !serverPromotionStatus) {
      list = list.filter((p) => {
        const tracking = getPromotionTracking(p);
        const lifecycle =
          tracking.lifecycle === "critical" ? "expiringSoon" : tracking.lifecycle;
        if (trackingFilter === "promoted") return tracking.hasHistory;
        return lifecycle === trackingFilter;
      });
      console.log("After tracking", list.length);
    }
    if (categoryFilter !== "all"){
      list = list.filter((p) => p.categoryType === categoryFilter);
      console.log("After category", list.length);
    }
    if (propertyTypeFilter !== "all"){
      list = list.filter((p) => p.propertyType === propertyTypeFilter);
      console.log("After propertyType", list.length);
    }

    console.log("Before price filters", list.length);

    // Location filter — same as analytics scope
    if (selectedLocation) {
      const { type, value } = selectedLocation;

      if (selectedLocation?.value?.state) {
        list = list.filter(
          (p) => p.state?.trim() === selectedLocation.value.state,
        );
      }

      if (selectedLocation?.value?.city) {
        list = list.filter(
          (p) => p.city?.trim() === selectedLocation.value.city,
        );
      }

      if (selectedLocation?.value?.locality) {
        list = list.filter(
          (p) => p.locality?.trim() === selectedLocation.value.locality,
        );
      }
    }

    if (debouncedProjectSearch) {
      const q = normalizeSearchText(debouncedProjectSearch);

      list = list.filter((p) =>
        [p.title, p.slug, p._id, p.propertyCode, p.city, p.locality, p.address]
          .some((value) => normalizeSearchText(value).includes(q)),
      );
    }

    

    // return [...list].sort(
    //   (a, b) => (a.rank ?? Infinity) - (b.rank ?? Infinity),
    // );
    let filteredList = [...list];

    switch (sortBy) {
      case "0-1L":
        filteredList = filteredList.filter((p) => (p.priceFrom || 0) <= 100000);
        break;

      case "1L-5L":
        filteredList = filteredList.filter(
          (p) => (p.priceFrom || 0) >= 100000 && (p.priceFrom || 0) <= 500000,
        );
        break;

      case "5L-10L":
        filteredList = filteredList.filter(
          (p) => (p.priceFrom || 0) >= 500000 && (p.priceFrom || 0) <= 1000000,
        );
        break;

      case "10L-25L":
        filteredList = filteredList.filter(
          (p) => (p.priceFrom || 0) >= 1000000 && (p.priceFrom || 0) <= 2500000,
        );
        break;

      case "25L-50L":
        filteredList = filteredList.filter(
          (p) => (p.priceFrom || 0) >= 2500000 && (p.priceFrom || 0) <= 5000000,
        );
        break;

      case "50L-1Cr":
        filteredList = filteredList.filter(
          (p) =>
            (p.priceFrom || 0) >= 5000000 && (p.priceFrom || 0) <= 10000000,
        );
        break;

      case "1Cr-2Cr":
        filteredList = filteredList.filter(
          (p) =>
            (p.priceFrom || 0) >= 10000000 && (p.priceFrom || 0) <= 20000000,
        );
        break;

      case "2Cr-5Cr":
        filteredList = filteredList.filter(
          (p) =>
            (p.priceFrom || 0) >= 20000000 && (p.priceFrom || 0) <= 50000000,
        );
        break;

      case "5Cr+":
        filteredList = filteredList.filter(
          (p) => (p.priceFrom || 0) >= 50000000,
        );
        break;

      case "lowToHigh":
        filteredList.sort((a, b) => (a.priceFrom || 0) - (b.priceFrom || 0));
        break;

      case "highToLow":
        filteredList.sort((a, b) => (b.priceFrom || 0) - (a.priceFrom || 0));
        break;

      default:
        filteredList.sort(
          (a, b) => (a.rank ?? Infinity) - (b.rank ?? Infinity),
        );
    }

    return filteredList;
  }, [
    allProperties,
    pendingProjects,
    promotionFilter,
    statusFilter,
    trackingFilter,
    serverPromotionStatus,
    categoryFilter,
    propertyTypeFilter,
    selectedLocation,
    debouncedProjectSearch,
    canViewPendingProjects,
    sortBy,
  ]);

  console.log(normalHook.properties.length);
  console.log(visibleProperties.length);

  console.log("visibleProperties", visibleProperties);

  const paginationStart = (currentPage - 1) * PROJECTS_PER_PAGE;
  const paginatedProperties = visibleProperties.slice(
    paginationStart,
    paginationStart + PROJECTS_PER_PAGE,
  );

  const projectHooks = serverPromotionStatus
    ? [lifecycleHook]
    : [normalHook, featuredHook, primeHook, sponsoredHook];
  const hasMoreLoadedProjects =
    paginationStart + PROJECTS_PER_PAGE < visibleProperties.length;
  const nextPageEnd = (currentPage + 1) * PROJECTS_PER_PAGE;
  const needsMoreProjectsForNextPage =
    visibleProperties.length < nextPageEnd;
  const hasMoreServerProjects =
    promotionFilter !== "pending" && projectHooks.some((hook) => hook.hasNextPage);
  const isFetchingMoreProjects = projectHooks.some(
    (hook) => hook.isFetchingNextPage,
  );

  useEffect(() => {
    if (!hasMountedProjectFilters.current) {
      hasMountedProjectFilters.current = true;
      return;
    }
    setCurrentPage(1);
  }, [
    promotionFilter,
    statusFilter,
    trackingFilter,
    categoryFilter,
    propertyTypeFilter,
    selectedLocation,
    debouncedProjectSearch,
    sortBy,
  ]);

  const handleNextPage = useCallback(async () => {
    if (needsMoreProjectsForNextPage && hasMoreServerProjects) {
      await Promise.all(
        projectHooks.map((hook) =>
          hook.hasNextPage && !hook.isFetchingNextPage
            ? hook.fetchNextPage()
            : Promise.resolve(),
        ),
      );
    }

    setCurrentPage((page) => page + 1);
  }, [
    needsMoreProjectsForNextPage,
    hasMoreServerProjects,
    projectHooks,
  ]);

  
  


  // ── Mutation helpers — fully decoupled per action ─────────────────────────
  
  const displayedCount = useMemo(() => {
    if (serverPromotionStatus) {
      return lifecycleHook.totalCount;
    }

    // Property Type (highest priority)
    if (propertyTypeFilter !== "all") {
      return (
        analytics?.propertyTypeWise?.find((p) => p._id === propertyTypeFilter)
          ?.total ?? 0
      );
    }

    // Category
    if (categoryFilter !== "all") {
      return (
        analytics?.categoryWise?.find((c) => c._id === categoryFilter)?.total ??
        0
      );
    }

    // Promotion
    if (promotionFilter === "prime")
      return analytics?.overview?.primeProjects ?? 0;

    if (promotionFilter === "featured")
      return analytics?.overview?.featuredProjects ?? 0;

    if (promotionFilter === "sponsored")
      return analytics?.overview?.sponsoredProjects ?? 0;

    if (promotionFilter === "normal")
      return analytics?.overview?.normalProjects ?? 0;

    // Status
    if (statusFilter === "active")
      return analytics?.overview?.activeProjects ?? 0;

    if (statusFilter === "inactive")
      return analytics?.overview?.inactiveProjects ?? 0;

    if (statusFilter === "pending")
      return analytics?.overview?.pendingProjects ?? 0;

    // Default
    return analytics?.overview?.totalProjects ?? 0;
  }, [
    analytics,
    serverPromotionStatus,
    lifecycleHook.totalCount,
    promotionFilter,
    statusFilter,
    categoryFilter,
    propertyTypeFilter,
  ]);
  
  const getHook = useCallback((id) => {
    const type = allProperties.find((p) => p._id === id)?.promotion?.type || "normal";
    return { prime: primeHook, featured: featuredHook, sponsored: sponsoredHook, normal: normalHook }[type] ?? normalHook;
  }, [allProperties, primeHook, featuredHook, sponsoredHook, normalHook]);

  

  const handleDelete = useCallback(async (id) => {
    if (!id || deleteLoading) return;

    try {
      setDeleteLoading(true);
      await deleteFeaturedProject(id);
      toast.success("Project deleted successfully");
      setDeleteTarget(null);
      await refreshAllProjects();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to delete project",
      );
    } finally {
      setDeleteLoading(false);
    }
  }, [deleteLoading, refreshAllProjects]);
  const handleExpire  = useCallback((id) => getHook(id).expireMutation.mutate(id,  { onSuccess: refreshAllProjects, onSettled: () => setExpireTarget(null)  }), [getHook, refreshAllProjects]);
  const handleReset   = useCallback((id) => getHook(id).resetMutation.mutate(id,   { onSuccess: refreshAllProjects, onSettled: () => setResetTarget(null)   }), [getHook, refreshAllProjects]);
  const handlePromote = useCallback((newType) =>
    getHook(promoteTarget).promoteMutation.mutate({ id: promoteTarget, newType }, { onSuccess: refreshAllProjects, onSettled: () => setPromoteTarget(null) }),
  [getHook, promoteTarget, refreshAllProjects]);

  const openPromoteModal = useCallback((id) => {
    setPromoteCurrentType(allProperties.find((p) => p._id === id)?.promotion?.type || "normal");
    setPromoteTarget(id);
  }, [allProperties]);

  // ── Active filter count + clear ───────────────────────────────────────────
  const activeFiltersCount = useMemo(() => [
    promotionFilter !== "all", statusFilter !== "all", trackingFilter !== "all",
    categoryFilter !== "all",  propertyTypeFilter !== "all",
  ].filter(Boolean).length, [promotionFilter, statusFilter, trackingFilter, categoryFilter, propertyTypeFilter]);

  const clearListFilters = useCallback(() => {
    setPromotionFilter("all"); setStatusFilter("all"); setTrackingFilter("all");
    setCategoryFilter("all");  setPropertyTypeFilter("all");
  }, []);

  const clearAll = useCallback(() => {
    clearListFilters();
    setSelectedLocation(null);
    //setSearchTerm("");
    setAnalyticsSearch("");
    setProjectSearch("");
  }, [clearListFilters]);


  const promotionLabel =
    promotionFilter === "featured"
      ? "Top Selling"
      : promotionFilter === "prime"
        ? "Prime"
        : promotionFilter === "sponsored"
          ? "Sponsored"
          : promotionFilter === "normal"
            ? "Normal"
            : promotionFilter;

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div
      className="mx-auto w-full max-w-[1600px] space-y-5 rounded-3xl px-1 pb-8 sm:px-2"
      style={{
        backgroundColor: "#effcf5",
        backgroundImage:
          "linear-gradient(rgba(39, 174, 96, 0.11) 1px, transparent 1px), linear-gradient(90deg, rgba(39, 174, 96, 0.11) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }}
    >
      {/* ── MODALS ──────────────────────────────────────────────────────── */}
      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Property"
        message="Are you sure you want to delete this property? This action cannot be undone."
        confirmLabel={deleteLoading ? "Deleting..." : "Delete"}
        confirmClass="bg-red-600 hover:bg-red-700 text-white"
        icon={<Trash2 className="w-5 h-5" />}
        iconClass="text-red-600"
        onConfirm={() => handleDelete(deleteTarget)}
        onCancel={() => {
          if (!deleteLoading) setDeleteTarget(null);
        }}
        isLoading={deleteLoading}
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
      <div className="flex flex-col gap-4 rounded-2xl border border-emerald-100 bg-white p-4 shadow-[0_6px_20px_rgba(22,163,74,0.12)] sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#27AE60] sm:text-3xl">
            Projects
          </h1>
          <p className="text-slate-500 mt-0.5 text-sm">
            Unified view across all project types
          </p>
        </div>
        <button
          onClick={() => navigate("/create-featured-project")}
          className="flex w-full items-center justify-center gap-2 self-start rounded-xl bg-[#27AE60] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 sm:w-auto sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create Project
        </button>
      </div>

      {/* ── TOP BAR: Location selector + Search — both drive analytics ──── */}
      <div className="w-full rounded-2xl border border-emerald-100 bg-white p-3 shadow-[0_6px_20px_rgba(22,163,74,0.12)] sm:p-4 lg:max-w-2xl">
        <div className="flex  flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Location selector (left) */}
          <div className="min-w-0 flex-1">
            <InlineLocationSelector
              properties={allProperties}
              analytics={analytics}
              masterAnalytics={masterAnalytics}
              selectedLocation={selectedLocation}
              onLocationChange={setSelectedLocation}
              analyticsSearch={analyticsSearch}
              setAnalyticsSearch={setAnalyticsSearch}
            />
          </div>

          {/* Clear all (shown only when something is active) */}
          {(selectedLocation || analyticsSearch) && (
            <button
              onClick={clearAll}
              className="flex-shrink-0 text-xs text-red-500 hover:text-red-700 font-semibold px-3 py-2 rounded-xl border border-red-100 hover:border-red-300 bg-red-50 transition whitespace-nowrap"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Active scope indicator */}
        {(selectedLocation || analyticsSearch) && (
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
            {analyticsSearch && (
              <span className="inline-flex items-center gap-1.5 text-xs bg-slate-50 border border-slate-200 text-slate-700 rounded-full px-2.5 py-1 font-medium">
                <Search className="w-3 h-3" />
                {analyticsSearch}
                <button onClick={() => setAnalyticsSearch("")}>
                  <X className="w-3 h-3 hover:text-red-500" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── ANALYTICS DASHBOARD (role-gated, driven by location + search) ── */}
      {canViewAnalytics && (
        <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-green-50/80 to-white p-3 shadow-[0_8px_26px_rgba(22,163,74,0.14)] sm:p-5">
          <div className="mb-5 flex items-start justify-between gap-3 sm:items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-200">
                <BarChart3 className="w-5 h-5 text-[#27AE60]" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800">
                  Live Analytics Dashboard
                </h2>
                <p className="text-xs text-slate-500">
                  {selectedLocation || analyticsSearch
                    ? `Filtered · ${[selectedLocation?.label, analyticsSearch ? `"${analyticsSearch}"` : ""].filter(Boolean).join(" + ")}`
                    : "All India · All Projects"}
                  {analyticsLoading ? " · updating…" : ""}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAnalytics((v) => !v)}
              className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:border-emerald-300 hover:text-emerald-700"
            >
              {showAnalytics ? "Hide" : "Show"}
            </button>
          </div>

          {showAnalytics && (
            <AnalyticsDashboard
              analytics={analytics}
              isLoading={analyticsLoading}
              locationLabel={selectedLocation?.label || "All India"}
              locationType={selectedLocation?.type || null}
              // Independent callbacks — each updates only its respective filter
              onPromotionFilter={setPromotionFilter}
              onStatusFilter={setStatusFilter}
              activePromotionFilter={promotionFilter}
              activeStatusFilter={statusFilter}
            />
          )}
        </div>
      )}

      {/* ── PENDING APPROVALS ───────────────────────── */}
      {canViewPendingProjects && (
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
      <div className="space-y-4 rounded-2xl border border-emerald-100 bg-white p-4 shadow-[0_6px_20px_rgba(22,163,74,0.12)] sm:p-5">
        {/* Search bar (right, fills remaining space) */}
        <div className="flex-1  flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 min-w-0 focus-within:border-[#27AE60]/50 focus-within:bg-white transition">
          <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search projects by title, city, slug, ID, address…"
            //value={searchTerm}
            //onChange={(e) => setSearchTerm(e.target.value)}
            value={projectSearch}
            onChange={(e) => setProjectSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none text-slate-700 placeholder:text-slate-400 min-w-0"
          />
          {projectSearch && (
            <button
              onClick={() => setProjectSearch("")}
              className="flex-shrink-0"
            >
              <X className="w-4 h-4 text-slate-400 hover:text-red-500 transition" />
            </button>
          )}
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
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
          {/* <div>
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
          </div> */}

          {/* Promotion tracking */}
          <div>
            <p className="text-xs font-bold text-slate-600 mb-2">
              Promotion Tracking
            </p>
            <div className="flex flex-wrap gap-2">
              {TRACKING_FILTERS.map((item) => (
                <button
                  key={item.value}
                  onClick={() => {
                    setTrackingFilter(item.value);
                    if (
                      item.value === "expired" ||
                      item.value === "scheduled"
                    ) {
                      setPromotionFilter("all");
                      setStatusFilter("all");
                    }
                  }}
                  className={`px-3 py-2 rounded-xl border text-xs font-semibold transition
                    ${
                      trackingFilter === item.value
                        ? item.value === "expired"
                          ? "bg-red-600 text-white border-red-600"
                          : item.value === "expiringSoon"
                            ? "bg-amber-500 text-white border-amber-500"
                            : "bg-slate-700 text-white border-slate-700"
                        : "bg-white text-slate-500 border-slate-200 hover:border-slate-400"
                    }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Clear list filters */}
          {activeFiltersCount > 0 && (
            <button
              onClick={clearListFilters}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900 sm:ml-auto"
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
                {promotionLabel}
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
            {trackingFilter !== "all" && (
              <span
                className={`inline-flex items-center gap-1.5 text-xs rounded-full border px-2.5 py-1 font-medium capitalize ${promotionLifecycleClass(
                  trackingFilter === "promoted" ? "active" : trackingFilter,
                )}`}
              >
                {TRACKING_FILTERS.find((item) => item.value === trackingFilter)?.label || trackingFilter}
                <button onClick={() => setTrackingFilter("all")}>
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-bold text-slate-800">
          Projects
          {/* <span className="text-slate-500 text-sm ml-2">
            ({displayedCount})
          </span> */}
        </h2>

        <div className="flex w-full items-center gap-2 sm:w-auto">
          <ArrowUpDown className="w-4 h-4 text-slate-500" />

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 sm:flex-none"
          >
            <option value="rank">Price Short</option>

            <optgroup label="Low Budget">
              <option value="0-1L">₹0 - ₹1L</option>
              <option value="1L-5L">₹1L - ₹5L</option>
              <option value="5L-10L">₹5L - ₹10L</option>
            </optgroup>

            <optgroup label="Mid Budget">
              <option value="10L-25L">₹10L - ₹25L</option>
              <option value="25L-50L">₹25L - ₹50L</option>
              <option value="50L-1Cr">₹50L - ₹1Cr</option>
            </optgroup>

            <optgroup label="Premium">
              <option value="1Cr-2Cr">₹1Cr - ₹2Cr</option>
              <option value="2Cr-5Cr">₹2Cr - ₹5Cr</option>
              <option value="5Cr+">₹5Cr+</option>
            </optgroup>

            <optgroup label="Sort">
              <option value="lowToHigh">Price: Low → High</option>
              <option value="highToLow">Price: High → Low</option>
            </optgroup>
          </select>
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
          {(activeFiltersCount > 0 || selectedLocation || analyticsSearch) && (
            <button
              onClick={clearAll}
              className="mt-3 text-sm text-[#27AE60] underline underline-offset-2"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {paginatedProperties.map((p) => (
            <PropertyCard
              key={p._id}
              property={p}
              type={p.promotion?.type || "normal"}
              onDelete={() => setDeleteTarget(p._id)}
              onPromote={() => openPromoteModal(p._id)}
              onExpire={() => setExpireTarget(p._id)}
              onReset={() => setResetTarget(p._id)}
              onRankUpdated={refreshAllProjects}
            />
          ))}
        </div>
      )}

      {/* ── PROJECT PAGINATION ───────────────────────────────────────────── */}
      {visibleProperties.length > 0 && (
        <div className="flex flex-col items-center justify-center gap-3 py-4 sm:flex-row">
          <button
            type="button"
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            disabled={currentPage === 1 || isFetchingMoreProjects}
            className="min-w-[110px] rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>

          <div className="min-w-[100px] text-center">
            <p className="text-sm font-semibold text-slate-700">
              Page {currentPage}
            </p>
            <p className="mt-0.5 text-xs text-slate-400">
              {paginationStart + 1}–
              {Math.min(
                paginationStart + PROJECTS_PER_PAGE,
                visibleProperties.length,
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={handleNextPage}
            disabled={
              isFetchingMoreProjects ||
              (!hasMoreLoadedProjects && !hasMoreServerProjects)
            }
            className="flex min-w-[110px] items-center justify-center gap-2 rounded-xl bg-[#27AE60] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

