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
  canApproveProject,
  canCreateProject,
  canPermanentlyDeleteProject,
  canViewPendingProjectApprovals,
  normalizeProjectRole,
} from "../../../../../utils/projectAccessControl";
import {
  deleteFeaturedProject,
  permanentlyDeleteFeaturedProject,
  getAllProjectsAnalytics,
} from "../../../../../features/property/propertyService";
import {
  getPromotionTracking,
  promotionLifecycleClass,
  promotionLifecycleCopy,
} from "./promotionTracking";
import { todayIso } from "../../../../Dashboards/shared/dashboardDateRange";
import {
  salesmanagerApproveAProject,
  salesmanagerRejectAProject,
} from "../../../../../features/property/propertyService";
import { getUserSearch } from "../../../../../features/user/userService";
import { requestSidebarRefresh } from "../../../../../utils/sidebarActivity";

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

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "rank", label: "Display rank" },
  { isGroup: true, label: "Low Budget" },
  { value: "0-1L", label: "₹0 - ₹1L" },
  { value: "1L-5L", label: "₹1L - ₹5L" },
  { value: "5L-10L", label: "₹5L - ₹10L" },
  { isGroup: true, label: "Mid Budget" },
  { value: "10L-25L", label: "₹10L - ₹25L" },
  { value: "25L-50L", label: "₹25L - ₹50L" },
  { value: "50L-1Cr", label: "₹50L - ₹1Cr" },
  { isGroup: true, label: "Premium" },
  { value: "1Cr-2Cr", label: "₹1Cr - ₹2Cr" },
  { value: "2Cr-5Cr", label: "₹2Cr - ₹5Cr" },
  { value: "5Cr+", label: "₹5Cr+" },
  { isGroup: true, label: "Sort" },
  { value: "lowToHigh", label: "Price: Low → High" },
  { value: "highToLow", label: "Price: High → Low" },
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
  { value: "draft", label: "Draft" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "deleted", label: "Deleted" },
];

const normalizeProjectStatusParam = (value = "") => {
  const key = String(value || "").trim().toLowerCase();
  if (key === "approved" || key === "live") return "approved";
  if (key === "active") return "approved";
  if (key === "onboarding" || key === "incomplete") return "draft";
  if (key === "inactive" || key === "deactivated" || key === "deleted") {
    return "deleted";
  }
  return key || "all";
};

const matchesProjectStatusFilter = (project, statusFilter) => {
  if (!statusFilter || statusFilter === "all") {
    const raw = String(project?.status || "").toLowerCase();
    return raw !== "inactive" && !project?.deletedAt;
  }
  const raw = String(project?.status || "").toLowerCase();
  const approval = String(project?.approvalStatus || "").toLowerCase();

  if (statusFilter === "draft") {
    return (
      raw === "draft" ||
      raw === "onboarding" ||
      raw === "incomplete"
    );
  }
  if (statusFilter === "pending") {
    return raw === "pending" || approval === "pending";
  }
  if (statusFilter === "approved") {
    return raw === "active" || raw === "approved" || approval === "approved";
  }
  if (statusFilter === "deleted") {
    return raw === "inactive" || raw === "deleted" || Boolean(project?.deletedAt);
  }
  return raw === statusFilter;
};

/** Map UI Status dropdown → API status query (admin projects board). */
const toServerProjectStatus = (statusFilter = "all") => {
  const key = normalizeProjectStatusParam(statusFilter);
  if (key === "draft") return "draft";
  if (key === "pending") return "pending";
  if (key === "approved") return "active";
  if (key === "deleted") return "inactive";
  return "all";
};

const TRACKING_FILTERS = [
  { value: "all", label: "All Tracking" },
  { value: "promoted", label: "Promoted History" },
  { value: "active", label: "Live Promotion" },
  { value: "expiringSoon", label: "Expiring Soon" },
  { value: "expired", label: "Expired" },
  { value: "scheduled", label: "Scheduled" },
];

/** Urgent expiring window used by red badge + Expiring Soon filter (aligned). */
const EXPIRING_SOON_DAYS = 3;

const isPromotionExpiringSoon = (tracking) => {
  if (!tracking || tracking.currentType === "normal") return false;
  if (
    tracking.lifecycle === "expired" ||
    tracking.lifecycle === "scheduled"
  ) {
    return false;
  }
  const days = tracking.daysLeft;
  return (
    typeof days === "number" && days >= 0 && days <= EXPIRING_SOON_DAYS
  );
};

const getTrackingBucket = (project) => {
  const tracking = getPromotionTracking(project);
  if (tracking.hasHistory && tracking.currentType === "normal") {
    // history only — still countable under promoted
  }
  if (isPromotionExpiringSoon(tracking)) return "expiringSoon";
  const life = tracking.lifecycle;
  if (life === "critical") return "expiringSoon";
  if (life === "active" || life === "expiringSoon") return "active";
  if (life === "expired") return "expired";
  if (life === "scheduled") return "scheduled";
  return "normal";
};

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

const buildAnalyticsParams = (selectedLocation, analyticsSearch, dateRange = {}) => {
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

  if (dateRange.from) params.from = dateRange.from;
  if (dateRange.to) params.to = dateRange.to;

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

/** Display names like "madu" → "Madu", "muzeef shaik" → "Muzeef Shaik" */
function titleCaseWords(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => {
      if (!word) return word;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

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
// FILTER MENU — same style as Promotion Tracking (portal, no native <select>)
// ─────────────────────────────────────────────────────────────────────────────

function FilterMenu({
  label,
  value,
  options = [],
  onChange,
  className = "",
  triggerClassName = "",
  placeholder = "Select…",
  menuMaxHeight = 240,
  /** Show emerald emphasis when a non-default value is selected */
  activeWhenNot = "all",
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const menuRef = useRef(null);

  const selected = options.find((o) => o.value === value && !o.isGroup);
  const isActive =
    activeWhenNot != null && value != null && value !== activeWhenNot;

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (menuRef.current?.contains(e.target)) return;
      if (rootRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className={`relative z-20 ${className}`} ref={rootRef}>
      {label ? (
        <p className="mb-1 text-[11px] font-bold text-slate-600">{label}</p>
      ) : null}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex h-9 w-full items-center justify-between gap-1 border bg-white px-2 text-left text-xs font-semibold outline-none transition focus:border-emerald-500 ${
          open
            ? "rounded-t-lg rounded-b-none border-slate-200 border-b-transparent"
            : "rounded-lg"
        } ${
          isActive
            ? "border-emerald-300 text-emerald-800 ring-1 ring-emerald-100"
            : "border-slate-200 text-slate-700"
        } ${triggerClassName}`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="min-w-0 flex-1 truncate">
          {selected?.label || placeholder}
        </span>
        <ChevronDown
          size={14}
          className={`shrink-0 text-slate-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open ? (
        <div
          ref={menuRef}
          className="absolute left-0 right-0 top-full z-50 w-full overflow-y-auto rounded-b-lg border border-t-0 border-slate-200 bg-white shadow-2xl"
          style={{ maxHeight: menuMaxHeight }}
          role="listbox"
        >
          {options.map((opt, idx) => {
            if (opt.isGroup) {
              return (
                <p
                  key={`g-${opt.label}-${idx}`}
                  className="px-3 pb-1 pt-2 text-[10px] font-black uppercase tracking-wide text-slate-400"
                >
                  {opt.label}
                </p>
              );
            }
            const selectedOpt = value === opt.value;
            const count = opt.count;
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={selectedOpt}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-xs font-semibold transition ${
                  selectedOpt
                    ? "bg-emerald-600 text-white"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span className="min-w-0 flex-1 truncate">{opt.label}</span>
                {typeof count === "number" && count > 0 ? (
                  <span
                    className={`inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-black ${
                      selectedOpt
                        ? "bg-white/25 text-white"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {count}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

/** @deprecated Prefer FilterMenu — kept for analytics location UI */
function SelectDropdown({ label, value, options, onChange, placeholder = "Select…" }) {
  return (
    <FilterMenu
      label={label}
      value={value}
      options={options}
      onChange={onChange}
      placeholder={placeholder}
      activeWhenNot={null}
    />
  );
}

/**
 * Builder filter: type to search → dropdown opens and shows matches (case-insensitive).
 * Menu is position:absolute under the field so it stays aligned when the sidebar opens/closes.
 */
function BuilderSearchFilter({
  label = "Created by (builder)",
  value,
  options = [],
  search,
  onSearchChange,
  onChange,
  className = "",
  menuMaxHeight = 280,
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const menuRef = useRef(null);

  const selected = options.find((o) => o.value === value && !o.isGroup);
  const isActive = value != null && value !== "all";
  const query = String(search || "").trim();

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (menuRef.current?.contains(e.target)) return;
      if (rootRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const pick = (next) => {
    onChange?.(next);
    if (next === "all") {
      onSearchChange?.("");
    } else {
      const opt = options.find((o) => o.value === next);
      onSearchChange?.(opt?.label || "");
    }
    setOpen(false);
  };

  return (
    <div className={`relative z-20 ${className}`} ref={rootRef}>
      {label ? (
        <p className="mb-1 text-[11px] font-bold text-slate-600">{label}</p>
      ) : null}
      <div
        className={`flex h-9 w-full items-stretch overflow-hidden border bg-white transition ${
          open
            ? "rounded-t-lg rounded-b-none border-slate-200 border-b-transparent"
            : "rounded-lg border-slate-200"
        } ${
          isActive ? "ring-1 ring-emerald-100 border-emerald-300" : ""
        }`}
      >
        <div className="relative min-w-0 flex-1">
          <Search
            size={13}
            className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={search}
            onFocus={() => setOpen(true)}
            onClick={() => setOpen(true)}
            onChange={(e) => {
              onSearchChange?.(e.target.value);
              setOpen(true);
            }}
            placeholder={selected?.label || "Search builders…"}
            className="h-full w-full bg-transparent py-0 pl-7 pr-6 text-xs font-semibold text-slate-700 outline-none placeholder:text-slate-400"
            aria-autocomplete="list"
            aria-expanded={open}
            aria-haspopup="listbox"
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                onSearchChange?.("");
                setOpen(true);
              }}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label="Clear builder search"
            >
              <X size={11} />
            </button>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex w-9 shrink-0 items-center justify-center border-l border-slate-200 text-slate-400 hover:bg-slate-50"
          aria-label="Toggle builder list"
        >
          <ChevronDown
            size={14}
            className={`transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {open ? (
        <div
          ref={menuRef}
          className="absolute left-0 right-0 top-full z-50 overflow-y-auto rounded-b-lg border border-t-0 border-slate-200 bg-white shadow-2xl"
          style={{ maxHeight: menuMaxHeight }}
          role="listbox"
        >
          {(() => {
            const matches = options.filter(
              (o) => o.value !== "all" && !o.isGroup,
            );
            if (query && matches.length === 0) {
              return (
                <p className="px-3 py-3 text-xs font-medium text-slate-400">
                  No builders match “{query}”
                </p>
              );
            }
            return options.map((opt, idx) => {
              if (opt.isGroup) {
                return (
                  <p
                    key={`g-${opt.label}-${idx}`}
                    className="px-3 pb-1 pt-2 text-[10px] font-black uppercase tracking-wide text-slate-400"
                  >
                    {opt.label}
                  </p>
                );
              }
              if (query && opt.value === "all") return null;
              const selectedOpt = value === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={selectedOpt}
                  onClick={() => pick(opt.value)}
                  className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-xs font-semibold transition ${
                    selectedOpt
                      ? "bg-emerald-600 text-white"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span className="min-w-0 flex-1 truncate">{opt.label}</span>
                </button>
              );
            });
          })()}
        </div>
      ) : null}
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
      className={`group flex h-full min-h-[58px] min-w-[118px] flex-1 items-center gap-2 rounded-lg border bg-white px-2.5 py-2 shadow-sm transition-colors duration-200
        ${onClick ? "cursor-pointer hover:border-emerald-300 hover:shadow-md" : "border-slate-200"}
        ${isActive ? "border-emerald-500 ring-2 ring-emerald-500/15 shadow-md" : "border-slate-200"}`}
    >
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-emerald-100 text-emerald-700">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <p
          className="truncate text-[10px] font-medium leading-none text-slate-600"
          title={label}
        >
          {label}
        </p>
        <p className="mt-1 truncate text-base font-bold leading-none tracking-tight text-slate-900">
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
      label: "Approved",
      display: String(ov.activeProjects ?? 0),
      sub: `${pct(ov.activeProjects, total)}% of total`,
      icon: CheckCircle2,
      color: "text-emerald-700",
      iconBg: "bg-emerald-50",
      border: "border-emerald-100",
      filter: "approved",
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
      label: "Draft",
      display: String(ov.inactiveProjects ?? 0),
      icon: AlertCircle,
      color: "text-purple-700",
      iconBg: "bg-purple-50",
      border: "border-purple-100",
      filter: "draft",
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
    <div className="flex w-full flex-nowrap items-stretch gap-2 overflow-x-auto pb-0.5">
      {cards.map((c) => (
        <KPICard
          key={c.label}
          label={c.label}
          display={c.display}
          icon={c.icon}
          color={c.color}
          iconBg={c.iconBg}
          border={c.border}
          onClick={
            c.filter
              ? () =>
                  onStatusFilter(
                    activeStatusFilter === c.filter ? "all" : c.filter,
                  )
              : undefined
          }
          isActive={Boolean(c.filter && activeStatusFilter === c.filter)}
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
    <div className="grid auto-rows-fr grid-cols-2 items-stretch gap-3 lg:grid-cols-4">
      {cards.map((c) => {
        const Icon = c.icon;
        const isActive = activePromotionFilter === c.key;
        return (
          <div
            key={c.key}
            onClick={() =>
              onPromotionFilter(isActive ? "all" : c.key)
            }
            className={`flex h-full min-h-[72px] min-w-0 cursor-pointer items-center justify-between gap-3 rounded-xl border bg-white px-4 py-3.5 shadow-[0_4px_14px_rgba(22,163,74,0.10)] transition-colors duration-200 hover:border-emerald-300 hover:shadow-md
              ${isActive ? "border-emerald-500 ring-2 ring-emerald-500/15 shadow-md" : "border-slate-200"}`}
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                <Icon className="h-4 w-4" />
              </span>
              <p className="truncate text-sm font-semibold text-slate-600">{c.label}</p>
            </div>
            <p className="shrink-0 text-xl font-bold leading-none text-slate-900">
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
  const currentUser = user?.user || user || null;
  const roleName = normalizeProjectRole(currentUser?.roleName);
  const isSalesManager  = roleName === "sales_manager";
  const isSalesAgent    = roleName === "sales_agent";
  const isSuperAdmin    = roleName === "super_admin";
  const isAdmin         = roleName === "admin";
  const isRegionalManager = roleName === "regional_manager";
  const canViewAnalytics =
    isSuperAdmin ||
    isAdmin ||
    isSalesManager ||
    isSalesAgent ||
    isRegionalManager ||
    ["operations_head", "ceo", "business_development_head"].includes(roleName);
  const canCreate = canCreateProject(currentUser);
  const canViewPendingProjects = canViewPendingProjectApprovals(currentUser);
  const canPermanentDelete = canPermanentlyDeleteProject(currentUser);
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

  

  // Date filters declared later — hooks use these via state synced from URL.
  // Keep declarations above hooks by reading URL immediately for first fetch.
  const urlCreatedFrom =
    searchParams.get("createdFrom") || searchParams.get("from") || "";
  const urlCreatedTo =
    searchParams.get("createdTo") || searchParams.get("to") || "";
  const urlStatusFilter = normalizeProjectStatusParam(
    searchParams.get("status") ||
      (searchParams.get("promotion") === "pending" ? "pending" : "all"),
  );
  // Admin Status dropdown must hit the API (default API is active-only).
  const serverListStatus = toServerProjectStatus(urlStatusFilter);

  // ── Property hooks ───────────────────────────────────────────────────────
  const projectQueryOptions = {
    search: debouncedProjectSearch,
    from: urlCreatedFrom,
    to: urlCreatedTo,
    // Never send status=all — that used to trigger full multi-page prefetch
    status: serverListStatus === "all" ? "" : serverListStatus,
  };
  const primeHook     = useFeaturedProjects("prime", projectQueryOptions);
  const featuredHook  = useFeaturedProjects("featured", projectQueryOptions);
  const sponsoredHook = useFeaturedProjects("sponsored", projectQueryOptions);
  const normalHook    = useFeaturedProjects("normal", projectQueryOptions);
  const lifecycleHook = useFeaturedProjects(null, {
    promotionStatus: serverPromotionStatus,
    search: debouncedProjectSearch,
    from: urlCreatedFrom,
    to: urlCreatedTo,
    status: serverListStatus === "all" ? "" : serverListStatus,
    enabled: !!serverPromotionStatus,
  });

  


  const { data: pendingProjectsData, refetch: refetchPendingProjects } = usePendingProjects({
    enabled: canViewPendingProjects,
    refetchInterval: canViewPendingProjects ? 45_000 : false,
  });
  const pendingProjects = pendingProjectsData?.data || [];
  const actionablePendingProjects = useMemo(
    () => pendingProjects.filter((project) => canApproveProject(currentUser, project)),
    [pendingProjects, currentUser],
  );

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

  // Builder ownership only (Select Builder / createdBy) — not postedBy staff.
  const getProjectCreatorId = (property) => {
    const raw =
      property?.createdBy?._id ||
      property?.createdBy?.id ||
      (typeof property?.createdBy === "string" ? property.createdBy : "") ||
      "";
    return String(raw || "").trim();
  };

  const getProjectCreatorName = (property) =>
    property?.createdBy?.fullName ||
    property?.createdBy?.name ||
    property?.createdBy?.companyName ||
    property?.builderName ||
    "Unknown builder";

  const isBuilderRole = (roleLike) => {
    const role = String(roleLike || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_");
    // Strict: builder only — never builder_staff.
    return role === "builder";
  };

  // Builder role only (not builder_staff). Options = all builders; filter uses createdBy.
  const { data: allBuildersSearch } = useQuery({
    queryKey: ["project-page-builders-only"],
    queryFn: () => getUserSearch("builder"),
    staleTime: 5 * 60 * 1000,
  });

  const creatorBuilderOptions = useMemo(() => {
    const map = new Map();

    const searchResults = Array.isArray(allBuildersSearch?.data?.results)
      ? allBuildersSearch.data.results
      : Array.isArray(allBuildersSearch?.results)
        ? allBuildersSearch.results
        : [];

    for (const builder of searchResults) {
      const role =
        builder?.role ||
        builder?.roleName ||
        builder?.roleId?.name ||
        "builder";
      if (!isBuilderRole(role) && String(role).trim()) continue;

      const id = String(builder?._id || builder?.userId || "").trim();
      if (!id) continue;
      const name = titleCaseWords(
        builder?.name ||
          builder?.companyName ||
          builder?.email ||
          "Builder",
      );
      map.set(id, name);
    }

    // Enrich names from projects when createdBy is a builder (never builder_staff).
    for (const property of allProperties) {
      const id = getProjectCreatorId(property);
      if (!id) continue;

      const createdByRole =
        property?.createdBy?.roleName ||
        property?.createdBy?.role ||
        property?.createdBy?.roleId?.name ||
        "";

      const knownBuilder = map.has(id);
      if (!knownBuilder && !isBuilderRole(createdByRole)) continue;

      const name = titleCaseWords(getProjectCreatorName(property));
      if (!knownBuilder || map.get(id) === "Unknown Builder") {
        map.set(id, name);
      }
    }

    return [...map.entries()]
      .map(([id, name]) => ({ id, name: titleCaseWords(name) }))
      .sort((a, b) =>
        String(a.name).localeCompare(String(b.name), undefined, {
          sensitivity: "base",
        }),
      );
  }, [allBuildersSearch, allProperties]);

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
    () => normalizeProjectStatusParam(searchParams.get("status") || "all"),
  );
  const [categoryFilter, setCategoryFilter] = useState(
    () => searchParams.get("category") || "all",
  );
  const [propertyTypeFilter, setPropertyTypeFilter] = useState(
    () => searchParams.get("propertyType") || "all",
  );
  const [creatorBuilderFilter, setCreatorBuilderFilter] = useState(
    () => searchParams.get("createdBy") || "all",
  );
  const [builderSearch, setBuilderSearch] = useState("");
  const [createdFrom, setCreatedFrom] = useState(
    () => searchParams.get("createdFrom") || searchParams.get("from") || "",
  );
  const [createdTo, setCreatedTo] = useState(
    () => searchParams.get("createdTo") || searchParams.get("to") || "",
  );

  const isTodayRange =
    Boolean(createdFrom) &&
    Boolean(createdTo) &&
    createdFrom === createdTo &&
    createdFrom === todayIso();

  const applyTodayRange = () => {
    const day = todayIso();
    setCreatedFrom(day);
    setCreatedTo(day);
  };

  const clearDateRange = () => {
    setCreatedFrom("");
    setCreatedTo("");
  };
  const [sortBy, setSortBy] = useState(
    () => searchParams.get("sort") || "newest",
  );
  const [currentPage, setCurrentPage] = useState(() => {
    const savedPage = Number(searchParams.get("page"));
    return Number.isInteger(savedPage) && savedPage > 0 ? savedPage : 1;
  });
  const hasMountedProjectFilters = useRef(false);
  /** Avoid wiping sidebar drill-down query before state syncs from URL. */
  const allowUrlWrite = useRef(false);

  useEffect(() => {
    if (!allowUrlWrite.current) return;
    const next = new URLSearchParams();
    if (trackingFilter !== "all") next.set("tracking", trackingFilter);
    if (selectedLocation) next.set("location", JSON.stringify(selectedLocation));
    if (analyticsSearch.trim()) next.set("analyticsSearch", analyticsSearch);
    if (debouncedProjectSearch) next.set("search", debouncedProjectSearch);
    if (promotionFilter !== "all" && promotionFilter !== "pending") {
      next.set("promotion", promotionFilter);
    }
    if (statusFilter !== "all") next.set("status", statusFilter);
    else if (promotionFilter === "pending") next.set("status", "pending");
    if (categoryFilter !== "all") next.set("category", categoryFilter);
    if (propertyTypeFilter !== "all") {
      next.set("propertyType", propertyTypeFilter);
    }
    if (creatorBuilderFilter !== "all") next.set("createdBy", creatorBuilderFilter);
    if (createdFrom) next.set("createdFrom", createdFrom);
    if (createdTo) next.set("createdTo", createdTo);
    if (sortBy !== "newest") next.set("sort", sortBy);
    if (currentPage > 1) next.set("page", String(currentPage));
    setSearchParams(next, { replace: true });
  }, [
    analyticsSearch,
    categoryFilter,
    createdFrom,
    createdTo,
    creatorBuilderFilter,
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
  const [permanentDeleteTarget, setPermanentDeleteTarget] = useState(null);
  const [permanentDeleteLoading, setPermanentDeleteLoading] = useState(false);
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
    () =>
      buildAnalyticsParams(selectedLocation, debouncedAnalyticsSearch, {
        from: createdFrom,
        to: createdTo,
      }),
    [selectedLocation, debouncedAnalyticsSearch, createdFrom, createdTo],
  );

  // Drill-downs: /projects?status=draft|onboarding|pending&createdFrom=...&createdTo=...
  useEffect(() => {
    const nextStatus = normalizeProjectStatusParam(searchParams.get("status") || "all");
    const nextPromotion = searchParams.get("promotion") || "all";
    // Legacy ?promotion=pending → status pending (single filter source)
    if (nextPromotion === "pending") {
      if (statusFilter !== "pending") setStatusFilter("pending");
      if (promotionFilter !== "all") setPromotionFilter("all");
    } else {
      if (nextStatus !== statusFilter) setStatusFilter(nextStatus);
      if (nextPromotion !== promotionFilter) setPromotionFilter(nextPromotion);
    }
    const nextFrom = searchParams.get("createdFrom") || searchParams.get("from") || "";
    const nextTo = searchParams.get("createdTo") || searchParams.get("to") || "";
    if (nextFrom !== createdFrom) setCreatedFrom(nextFrom);
    if (nextTo !== createdTo) setCreatedTo(nextTo);
    // Enable URL write-back only after we've absorbed the current query (sidebar click).
    allowUrlWrite.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey:  ["project-analytics", analyticsParams],
    queryFn:   () => getAllProjectsAnalytics(analyticsParams),
    enabled:   canViewAnalytics,
    staleTime: 60_000,
  });

 const analytics = analyticsData?.data?.data || analyticsData?.data || null;

  const isPendingApprovalsView =
    canViewPendingProjects &&
    (statusFilter === "pending" || promotionFilter === "pending");

  // ── Project list filtering — uses all filter state ────────────────────────
  const visibleProperties = useMemo(() => {
    // Pending approvals live in a dedicated API — list hooks often omit them.
    let list = isPendingApprovalsView ? pendingProjects : allProperties;

    if (promotionFilter !== "all" && promotionFilter !== "pending") {
      list = list.filter((p) => p.promotion?.type === promotionFilter);
    }
    if (statusFilter !== "all" && !isPendingApprovalsView) {
      list = list.filter((p) => matchesProjectStatusFilter(p, statusFilter));
    }
    if (statusFilter === "pending" && isPendingApprovalsView) {
      list = list.filter((p) => matchesProjectStatusFilter(p, "pending"));
    }
    if (trackingFilter !== "all" && !serverPromotionStatus) {
      list = list.filter((p) => {
        const tracking = getPromotionTracking(p);
        if (trackingFilter === "promoted") return tracking.hasHistory;
        if (trackingFilter === "expiringSoon") {
          return isPromotionExpiringSoon(tracking);
        }
        if (trackingFilter === "active") {
          return getTrackingBucket(p) === "active";
        }
        const lifecycle =
          tracking.lifecycle === "critical" ? "expiringSoon" : tracking.lifecycle;
        return lifecycle === trackingFilter;
      });
    }
    if (categoryFilter !== "all") {
      list = list.filter((p) => p.categoryType === categoryFilter);
    }
    if (propertyTypeFilter !== "all") {
      list = list.filter((p) => p.propertyType === propertyTypeFilter);
    }
    if (creatorBuilderFilter !== "all") {
      list = list.filter((p) => getProjectCreatorId(p) === creatorBuilderFilter);
    }
    if (createdFrom || createdTo) {
      list = list.filter((p) => {
        const createdAt = new Date(p.createdAt || 0);
        if (Number.isNaN(createdAt.getTime())) return false;
        // Compare calendar day in IST so sidebar "today" matches list rows.
        const day = createdAt.toLocaleDateString("en-CA", {
          timeZone: "Asia/Kolkata",
        });
        if (createdFrom && day < createdFrom) return false;
        if (createdTo && day > createdTo) return false;
        return true;
      });
    }

    // Location filter — same as analytics scope
    if (selectedLocation) {
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

    let filteredList = [...list];

    switch (sortBy) {
      case "newest":
        filteredList.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;

      case "oldest":
        filteredList.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
        break;

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
    createdFrom,
    createdTo,
    creatorBuilderFilter,
    propertyTypeFilter,
    selectedLocation,
    debouncedProjectSearch,
    canViewPendingProjects,
    isPendingApprovalsView,
    sortBy,
  ]);

  const openPendingApprovalsView = useCallback(() => {
    const alreadyOpen = statusFilter === "pending" && promotionFilter === "all";
    if (alreadyOpen) {
      setStatusFilter("all");
      return;
    }
    setPromotionFilter("all");
    setStatusFilter("pending");
    setTrackingFilter("all");
    setCurrentPage(1);
    window.requestAnimationFrame(() => {
      document
        .getElementById("projects-approve-queue")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [promotionFilter, statusFilter]);

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
    !isPendingApprovalsView && projectHooks.some((hook) => hook.hasNextPage);
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
    createdFrom,
    createdTo,
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
    if (statusFilter === "approved" || statusFilter === "active")
      return analytics?.overview?.activeProjects ?? 0;

    if (statusFilter === "draft" || statusFilter === "inactive")
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

  const statusFilterOptions = useMemo(() => {
    const ov = analytics?.overview || {};
    const countFor = (value) => {
      if (value === "all") return Number(ov.totalProjects);
      if (value === "draft") return Number(ov.inactiveProjects);
      if (value === "pending") return Number(ov.pendingProjects);
      if (value === "approved") return Number(ov.activeProjects);
      return NaN;
    };

    return STATUS_FILTERS.map((item) => {
      const count = countFor(item.value);
      return {
        ...item,
        ...(Number.isFinite(count) ? { count } : {}),
      };
    });
  }, [analytics]);

  const builderFilterOptions = useMemo(() => {
    const query = builderSearch.trim().toLowerCase();
    const builders = creatorBuilderOptions.filter((builder) => {
      if (
        creatorBuilderFilter !== "all" &&
        builder.id === creatorBuilderFilter
      ) {
        return true;
      }
      if (!query) return true;
      // Case-insensitive: "madu", "MADU", "Madu" all match
      return String(builder.name || "")
        .toLowerCase()
        .includes(query);
    });
    return [
      { value: "all", label: "All Builders" },
      ...builders.map((builder) => ({
        value: builder.id,
        label: titleCaseWords(builder.name),
      })),
    ];
  }, [builderSearch, creatorBuilderFilter, creatorBuilderOptions]);

  const getHook = useCallback((id) => {
    const type = allProperties.find((p) => p._id === id)?.promotion?.type || "normal";
    return { prime: primeHook, featured: featuredHook, sponsored: sponsoredHook, normal: normalHook }[type] ?? normalHook;
  }, [allProperties, primeHook, featuredHook, sponsoredHook, normalHook]);

  

  const handleDelete = useCallback(async (id) => {
    if (!id || deleteLoading) return;

    try {
      setDeleteLoading(true);
      await deleteFeaturedProject(id);
      toast.success("Project deactivated successfully");
      setDeleteTarget(null);
      await refreshAllProjects();
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Failed to deactivate project",
      );
    } finally {
      setDeleteLoading(false);
    }
  }, [deleteLoading, refreshAllProjects]);

  const handlePermanentDelete = useCallback(async (id) => {
    if (!id || permanentDeleteLoading || !canPermanentDelete) return;

    try {
      setPermanentDeleteLoading(true);
      await permanentlyDeleteFeaturedProject(id);
      toast.success("Project permanently deleted");
      setPermanentDeleteTarget(null);
      await refreshAllProjects();
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Failed to permanently delete project",
      );
    } finally {
      setPermanentDeleteLoading(false);
    }
  }, [canPermanentDelete, permanentDeleteLoading, refreshAllProjects]);
  const handleExpire  = useCallback((id) => getHook(id).expireMutation.mutate(id,  { onSuccess: refreshAllProjects, onSettled: () => setExpireTarget(null)  }), [getHook, refreshAllProjects]);
  const handleReset   = useCallback((id) => getHook(id).resetMutation.mutate(id,   { onSuccess: refreshAllProjects, onSettled: () => setResetTarget(null)   }), [getHook, refreshAllProjects]);
  const handlePromote = useCallback((newType, options = {}) =>
    getHook(promoteTarget).promoteMutation.mutate(
      {
        id: promoteTarget,
        newType,
        visibleLeadLimit: options.visibleLeadLimit,
      },
      {
        onSuccess: refreshAllProjects,
        onSettled: () => setPromoteTarget(null),
      },
    ),
  [getHook, promoteTarget, refreshAllProjects]);

  const openPromoteModal = useCallback((id) => {
    setPromoteCurrentType(allProperties.find((p) => p._id === id)?.promotion?.type || "normal");
    setPromoteTarget(id);
  }, [allProperties]);

  const promoteTargetProject = useMemo(
    () => allProperties.find((p) => p._id === promoteTarget) || null,
    [allProperties, promoteTarget],
  );

  /** Dynamic promotion-tracking counts (from loaded list — scalable as pages load) */
  const trackingCounts = useMemo(() => {
    const counts = {
      all: allProperties.length,
      promoted: 0,
      active: 0,
      expiringSoon: 0,
      expired: 0,
      scheduled: 0,
    };
    for (const project of allProperties) {
      const tracking = getPromotionTracking(project);
      if (tracking.hasHistory) counts.promoted += 1;
      const bucket = getTrackingBucket(project);
      if (bucket === "expiringSoon") counts.expiringSoon += 1;
      else if (bucket === "active") counts.active += 1;
      else if (bucket === "expired") counts.expired += 1;
      else if (bucket === "scheduled") counts.scheduled += 1;
    }
    return counts;
  }, [allProperties]);

  const expiringSoon3DayCount = trackingCounts.expiringSoon;

  const [trackingMenuOpen, setTrackingMenuOpen] = useState(false);
  const trackingMenuRef = useRef(null);
  const trackingTriggerRef = useRef(null);

  useEffect(() => {
    if (!trackingMenuOpen) return;
    const onDown = (e) => {
      if (trackingMenuRef.current?.contains(e.target)) return;
      if (trackingTriggerRef.current?.contains(e.target)) return;
      setTrackingMenuOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [trackingMenuOpen]);

  const trackingFilterLabel = useMemo(() => {
    const item = TRACKING_FILTERS.find((f) => f.value === trackingFilter);
    if (!item) return "All Tracking";
    if (item.value === "expiringSoon" && expiringSoon3DayCount > 0) {
      return `${item.label} (${expiringSoon3DayCount})`;
    }
    const n = trackingCounts[item.value];
    if (item.value !== "all" && typeof n === "number" && n > 0) {
      return `${item.label} (${n})`;
    }
    return item.label;
  }, [trackingFilter, expiringSoon3DayCount, trackingCounts]);

  // ── Active filter count + clear ───────────────────────────────────────────
  const activeFiltersCount = useMemo(() => [
    promotionFilter !== "all" && promotionFilter !== "pending",
    statusFilter !== "all" || promotionFilter === "pending",
    trackingFilter !== "all",
    categoryFilter !== "all",
    propertyTypeFilter !== "all",
    creatorBuilderFilter !== "all",
    // One chip for the date range (not separate from/to)
    Boolean(createdFrom || createdTo),
  ].filter(Boolean).length, [promotionFilter, statusFilter, trackingFilter, categoryFilter, propertyTypeFilter, creatorBuilderFilter, createdFrom, createdTo]);

  const clearListFilters = useCallback(() => {
    setPromotionFilter("all"); setStatusFilter("all"); setTrackingFilter("all");
    setCategoryFilter("all");  setPropertyTypeFilter("all");
    setCreatorBuilderFilter("all"); setBuilderSearch("");
    setCreatedFrom(""); setCreatedTo("");
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
        title="Deactivate Project"
        message="This will deactivate the project (soft delete). You can find it under Status → Deleted, with who deactivated it and when."
        confirmLabel={deleteLoading ? "Deactivating..." : "Deactivate"}
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
        open={!!permanentDeleteTarget}
        title="Permanently Delete Project"
        message="This removes the project from the database forever (and related media). This cannot be undone. Only use after it is already in Deleted."
        confirmLabel={
          permanentDeleteLoading ? "Deleting forever..." : "Delete forever"
        }
        confirmClass="bg-rose-800 hover:bg-rose-900 text-white"
        icon={<AlertTriangle className="w-5 h-5" />}
        iconClass="text-rose-700"
        onConfirm={() => handlePermanentDelete(permanentDeleteTarget)}
        onCancel={() => {
          if (!permanentDeleteLoading) setPermanentDeleteTarget(null);
        }}
        isLoading={permanentDeleteLoading}
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
        projectId={promoteTarget}
        projectStatus={promoteTargetProject?.status}
        currentType={promoteCurrentType}
        currentVisibleLeadLimit={
          promoteTargetProject?.promotion?.visibleLeadLimit
        }
        canSetLeadCount={isSuperAdmin || isAdmin}
        isLoading={getHook(promoteTarget)?.promoteMutation?.isPending}
        onConfirm={handlePromote}
        onCancel={() => setPromoteTarget(null)}
      />

      {/* ── PAGE HEADER ─────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 rounded-2xl border border-emerald-100 bg-white p-4 shadow-[0_6px_20px_rgba(22,163,74,0.12)] sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-[#27AE60] sm:text-3xl">
            Projects
          </h1>
          <p className="text-slate-500 mt-0.5 text-sm">
            Unified view across all project types
          </p>
        </div>
        {canCreate && (
          <button
            type="button"
            onClick={() => navigate("/create-featured-project")}
            className="flex w-full items-center justify-center gap-2 self-start rounded-xl bg-[#27AE60] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 sm:w-auto sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Create Project
          </button>
        )}
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

      {/* ── PENDING APPROVALS (RM / higher hierarchy notification) ── */}
      {canViewPendingProjects && (
        <div id="projects-approve-queue" className="space-y-3">
          <div
            role="button"
            tabIndex={0}
            onClick={openPendingApprovalsView}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openPendingApprovalsView();
              }
            }}
            className={`flex cursor-pointer items-center gap-4 rounded-2xl border bg-white p-4 shadow-sm transition-all hover:shadow-md
              ${
                isPendingApprovalsView
                  ? "border-amber-300 ring-2 ring-amber-400"
                  : actionablePendingProjects.length > 0
                    ? "border-amber-300 bg-amber-50/40"
                    : "border-amber-100"
              }`}
          >
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-amber-50">
              <Clock className="h-6 w-6 text-amber-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-2xl font-bold text-slate-800">
                {actionablePendingProjects.length}
              </p>
              <p className="text-sm text-slate-500">
                {isRegionalManager
                  ? "New onboarding projects waiting for your approval"
                  : "Pending project approvals"}
              </p>
              {actionablePendingProjects.length > 0 && (
                <p className="mt-1 text-xs font-medium text-amber-700">
                  Approve to make the project live immediately
                </p>
              )}
            </div>
            <div className="ml-auto text-xs font-semibold text-amber-600">
              <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5">
                {isPendingApprovalsView ? "✓ Viewing now" : "Click to view"}
              </span>
            </div>
          </div>

          {isPendingApprovalsView && actionablePendingProjects.length > 0 && (
            <div className="w-full rounded-2xl border border-amber-200 bg-white p-3 shadow-sm sm:p-4">
              <p className="mb-3 text-xs font-bold uppercase tracking-wide text-amber-700">
                Approve queue — goes live on approve
              </p>
              <div className="grid w-full grid-cols-1 gap-2">
                {actionablePendingProjects.slice(0, 8).map((project) => {
                  const creatorName =
                    project?.createdBy?.fullName ||
                    project?.createdBy?.name ||
                    project?.postedBy?.name ||
                    "Unknown";
                  const creatorRole =
                    project?.createdBy?.roleName ||
                    project?.postedBy?.roleName ||
                    "—";
                  return (
                    <div
                      key={project._id}
                      className="flex w-full flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-4"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-800">
                          {project.title || "Untitled project"}
                        </p>
                        <p className="mt-0.5 truncate text-[11px] text-slate-500">
                          Created by {creatorName} · {String(creatorRole).replace(/_/g, " ")}
                          {project.city ? ` · ${project.city}` : ""}
                        </p>
                      </div>
                      <div className="flex w-full shrink-0 gap-2 sm:w-auto">
                        <button
                          type="button"
                          onClick={async (event) => {
                            event.stopPropagation();
                            try {
                              await salesmanagerApproveAProject(project._id);
                              toast.success("Project approved — now live");
                              refreshAllProjects();
                              requestSidebarRefresh();
                            } catch (error) {
                              toast.error(
                                error?.response?.data?.message || "Approval failed",
                              );
                            }
                          }}
                          className="flex-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 sm:flex-none"
                        >
                          Approve → Live
                        </button>
                        <button
                          type="button"
                          onClick={async (event) => {
                            event.stopPropagation();
                            try {
                              await salesmanagerRejectAProject(project._id, {
                                reason: "Rejected from pending queue",
                              });
                              toast.success("Project rejected");
                              refreshAllProjects();
                            } catch (error) {
                              toast.error(
                                error?.response?.data?.message || "Reject failed",
                              );
                            }
                          }}
                          className="flex-1 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 sm:flex-none"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── PROJECT LIST FILTERS ─────────────────────────────────────────── */}
      <div className="relative z-10 space-y-4 overflow-visible rounded-2xl border border-emerald-100 bg-white p-4 shadow-[0_6px_20px_rgba(22,163,74,0.12)] sm:p-5">
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
        {/* Compact filter row — fixed narrow widths for Category / Status / Tracking */}
        <div className="relative z-20 flex flex-wrap items-end gap-2.5 overflow-visible">
          <FilterMenu
            className="w-[7.5rem] shrink-0"
            label="Category"
            value={categoryFilter}
            options={CATEGORY_TYPES}
            onChange={(next) => {
              setCategoryFilter(next);
              setPropertyTypeFilter("all");
              setCurrentPage(1);
            }}
          />

          <FilterMenu
            className="w-[10rem] shrink-0"
            label="Status"
            value={statusFilter}
            options={statusFilterOptions}
            onChange={(next) => {
              setStatusFilter(next);
              setCurrentPage(1);
              if (next !== "pending") {
                setPromotionFilter((prev) =>
                  prev === "pending" ? "all" : prev,
                );
              }
            }}
          />

          <div className="relative z-20 w-[12.5rem] shrink-0">
            <div className="mb-1 flex items-center gap-1.5">
              <p className="text-[11px] font-bold text-slate-600">
                Promotion Tracking
              </p>
              {expiringSoon3DayCount > 0 ? (
                <span
                  className="relative inline-flex"
                  title={`${expiringSoon3DayCount} promotion(s) expire within ${EXPIRING_SOON_DAYS} days`}
                >
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-60" />
                  <span className="relative inline-flex min-w-[1.1rem] items-center justify-center rounded-full bg-red-600 px-1 py-0.5 text-[9px] font-black leading-none text-white shadow-sm">
                    {expiringSoon3DayCount}
                  </span>
                </span>
              ) : null}
            </div>

            <div className="relative" ref={trackingTriggerRef}>
              <button
                type="button"
                onClick={() => setTrackingMenuOpen((o) => !o)}
                className={`flex h-9 w-full items-center justify-between gap-1 border bg-white px-2 text-left text-xs font-semibold text-slate-700 outline-none focus:border-emerald-500 ${
                  trackingMenuOpen
                    ? "rounded-t-lg rounded-b-none border-b-transparent"
                    : "rounded-lg"
                } ${
                  expiringSoon3DayCount > 0
                    ? "border-red-300 ring-1 ring-red-100"
                    : "border-slate-200"
                }`}
                aria-haspopup="listbox"
                aria-expanded={trackingMenuOpen}
              >
                <span className="min-w-0 flex-1 truncate">
                  {trackingFilterLabel}
                </span>
                <ChevronDown
                  size={14}
                  className={`shrink-0 text-slate-400 transition-transform ${
                    trackingMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {expiringSoon3DayCount > 0 ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setTrackingFilter("expiringSoon");
                    setCurrentPage(1);
                    setTrackingMenuOpen(false);
                  }}
                  className="absolute -right-1.5 -top-1.5 z-20 inline-flex"
                  title="Show expiring within 3 days"
                  aria-label={`${expiringSoon3DayCount} expiring soon`}
                >
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-70" />
                  <span className="relative inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-black text-white shadow-md">
                    {expiringSoon3DayCount}
                  </span>
                </button>
              ) : null}

              {trackingMenuOpen ? (
                <div
                  ref={trackingMenuRef}
                  className="absolute left-0 right-0 top-full z-50 max-h-56 overflow-y-auto rounded-b-lg border border-t-0 border-slate-200 bg-white shadow-2xl"
                  role="listbox"
                >
                  {TRACKING_FILTERS.map((item) => {
                    const count =
                      item.value === "all"
                        ? trackingCounts.all
                        : trackingCounts[item.value];
                    const showCount =
                      item.value === "expiringSoon"
                        ? expiringSoon3DayCount > 0
                        : item.value !== "all" && count > 0;
                    const selected = trackingFilter === item.value;
                    return (
                      <button
                        key={item.value}
                        type="button"
                        role="option"
                        aria-selected={selected}
                        onClick={() => {
                          setTrackingFilter(item.value);
                          setCurrentPage(1);
                          if (
                            item.value === "expired" ||
                            item.value === "scheduled"
                          ) {
                            setPromotionFilter("all");
                            setStatusFilter("all");
                          }
                          setTrackingMenuOpen(false);
                        }}
                        className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-xs font-semibold transition ${
                          selected
                            ? "bg-emerald-600 text-white"
                            : item.value === "expiringSoon" &&
                                expiringSoon3DayCount > 0
                              ? "bg-red-50 text-red-700 hover:bg-red-100"
                              : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <span className="truncate">{item.label}</span>
                        {showCount ? (
                          <span
                            className={`inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-black ${
                              selected
                                ? "bg-white/25 text-white"
                                : item.value === "expiringSoon"
                                  ? "bg-red-600 text-white"
                                  : "bg-slate-200 text-slate-700"
                            }`}
                          >
                            {item.value === "expiringSoon"
                              ? expiringSoon3DayCount
                              : count}
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </div>

          <BuilderSearchFilter
            className="min-w-0 w-full max-w-xs shrink-0 sm:w-auto sm:flex-1 sm:max-w-sm"
            value={creatorBuilderFilter}
            options={builderFilterOptions}
            search={builderSearch}
            onSearchChange={setBuilderSearch}
            onChange={(next) => {
              setCreatorBuilderFilter(next);
              setCurrentPage(1);
            }}
          />

          <button
            type="button"
            onClick={clearListFilters}
            disabled={activeFiltersCount === 0}
            className={`mb-0 flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg border px-2.5 text-xs font-semibold transition ${
              activeFiltersCount > 0
                ? "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:text-slate-900"
                : "pointer-events-none border-transparent bg-transparent text-transparent"
            }`}
          >
            <X className="h-3 w-3" />
            Clear
            {activeFiltersCount > 0 ? (
              <span className="rounded-full bg-red-200 px-1.5 py-0.5 font-bold text-red-700">
                {activeFiltersCount}
              </span>
            ) : null}
          </button>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0 flex-1">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-600">
                Custom date range
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block min-w-0">
                  <span className="mb-1 block text-[11px] font-medium text-slate-500">From</span>
                  <input
                    type="date"
                    value={createdFrom}
                    max={createdTo || undefined}
                    onChange={(event) => setCreatedFrom(event.target.value)}
                    className="h-11 w-full min-w-[11.5rem] rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-emerald-500"
                  />
                </label>
                <label className="block min-w-0">
                  <span className="mb-1 block text-[11px] font-medium text-slate-500">To</span>
                  <input
                    type="date"
                    value={createdTo}
                    min={createdFrom || undefined}
                    onChange={(event) => setCreatedTo(event.target.value)}
                    className="h-11 w-full min-w-[11.5rem] rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-emerald-500"
                  />
                </label>
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => (isTodayRange ? clearDateRange() : applyTodayRange())}
                className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${
                  isTodayRange
                    ? "border-emerald-600 bg-emerald-600 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-emerald-400"
                }`}
              >
                Today projects
              </button>
              <button
                type="button"
                onClick={clearDateRange}
                disabled={!createdFrom && !createdTo}
                className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${
                  createdFrom || createdTo
                    ? "border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                    : "cursor-not-allowed border-slate-100 bg-white text-slate-300"
                }`}
              >
                Clear dates
              </button>
            </div>
          </div>
          <p className="mt-2 min-h-[18px] text-xs text-slate-500">
            {createdFrom || createdTo
              ? `${isTodayRange ? "Today" : "Selected"}: ${createdFrom || "—"} → ${createdTo || "—"}`
              : "Pick From / To, or use Today projects."}
          </p>
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

        {/* Active filter chips — one chip per concern (no duplicate Pending) */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {promotionFilter !== "all" && promotionFilter !== "pending" && (
              <span className="inline-flex items-center gap-1.5 text-xs bg-blue-50 border border-blue-200 text-blue-700 rounded-full px-2.5 py-1 font-medium capitalize">
                {promotionLabel}
                <button type="button" onClick={() => setPromotionFilter("all")}>
                  <X className="w-3 h-3 hover:text-red-500" />
                </button>
              </span>
            )}
            {isPendingApprovalsView ? (
              <span className="inline-flex items-center gap-1.5 text-xs bg-amber-50 border border-amber-200 text-amber-800 rounded-full px-2.5 py-1 font-medium">
                Pending approvals
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter("all");
                    setPromotionFilter("all");
                  }}
                >
                  <X className="w-3 h-3 hover:text-red-500" />
                </button>
              </span>
            ) : statusFilter !== "all" ? (
              <span className="inline-flex items-center gap-1.5 text-xs bg-purple-50 border border-purple-200 text-purple-700 rounded-full px-2.5 py-1 font-medium capitalize">
                {STATUS_FILTERS.find((s) => s.value === statusFilter)?.label ||
                  statusFilter}
                <button type="button" onClick={() => setStatusFilter("all")}>
                  <X className="w-3 h-3 hover:text-red-500" />
                </button>
              </span>
            ) : null}
            {trackingFilter !== "all" && (
              <span
                className={`inline-flex items-center gap-1.5 text-xs rounded-full border px-2.5 py-1 font-medium capitalize ${promotionLifecycleClass(
                  trackingFilter === "promoted" ? "active" : trackingFilter,
                )}`}
              >
                {TRACKING_FILTERS.find((item) => item.value === trackingFilter)?.label || trackingFilter}
                <button type="button" onClick={() => setTrackingFilter("all")}>
                  <X className="w-3 h-3 hover:text-red-500" />
                </button>
              </span>
            )}
            {categoryFilter !== "all" && (
              <span className="inline-flex items-center gap-1.5 text-xs bg-amber-50 border border-amber-200 text-amber-700 rounded-full px-2.5 py-1 font-medium capitalize">
                {categoryFilter}
                <button type="button" onClick={() => setCategoryFilter("all")}>
                  <X className="w-3 h-3 hover:text-red-500" />
                </button>
              </span>
            )}
            {propertyTypeFilter !== "all" && (
              <span className="inline-flex items-center gap-1.5 text-xs bg-teal-50 border border-teal-200 text-teal-700 rounded-full px-2.5 py-1 font-medium capitalize">
                {propertyTypeFilter}
                <button type="button" onClick={() => setPropertyTypeFilter("all")}>
                  <X className="w-3 h-3 hover:text-red-500" />
                </button>
              </span>
            )}
            {(createdFrom || createdTo) && (
              <span className="inline-flex items-center gap-1.5 text-xs bg-slate-50 border border-slate-200 text-slate-700 rounded-full px-2.5 py-1 font-medium">
                {isTodayRange
                  ? "Today"
                  : `${createdFrom || "…"} → ${createdTo || "…"}`}
                <button type="button" onClick={clearDateRange}>
                  <X className="w-3 h-3 hover:text-red-500" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── RESULTS (full-width aligned with filters) ───────────────────── */}
      <div className="w-full space-y-4 rounded-2xl border border-emerald-100 bg-white p-4 shadow-[0_6px_20px_rgba(22,163,74,0.10)] sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-bold text-slate-800">
            Projects
            <span className="ml-2 text-sm font-semibold text-slate-400">
              ({visibleProperties.length})
            </span>
          </h2>

          <div className="flex w-full items-center gap-2 sm:w-auto">
            <ArrowUpDown className="h-4 w-4 shrink-0 text-slate-500" />
            <FilterMenu
              className="min-w-0 flex-1 sm:min-w-[200px] sm:flex-none"
              value={sortBy}
              options={SORT_OPTIONS}
              activeWhenNot="newest"
              menuMaxHeight={320}
              triggerClassName="h-10 rounded-xl px-3 text-sm"
              onChange={setSortBy}
            />
          </div>
        </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : visibleProperties.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 py-16 text-center text-slate-500">
          <BarChart3 className="mx-auto mb-3 h-12 w-12 opacity-20" />
          <p className="text-base font-medium">No projects found</p>
          <p className="mt-1 text-sm text-slate-400">
            Try adjusting your filters or search term
          </p>
          {(activeFiltersCount > 0 || selectedLocation || analyticsSearch) && (
            <button
              type="button"
              onClick={clearAll}
              className="mt-3 text-sm text-[#27AE60] underline underline-offset-2"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <div
          className={`grid w-full gap-3 ${
            isPendingApprovalsView || paginatedProperties.length === 1
              ? "grid-cols-1"
              : "grid-cols-1 md:grid-cols-2"
          }`}
        >
          {paginatedProperties.map((p) => (
            <div key={p._id} className="min-w-0 w-full">
              <PropertyCard
                property={p}
                type={p.promotion?.type || "normal"}
                onDelete={() => setDeleteTarget(p._id)}
                onPermanentDelete={
                  canPermanentDelete
                    ? () => setPermanentDeleteTarget(p._id)
                    : undefined
                }
                canPermanentDelete={canPermanentDelete}
                onPromote={() => openPromoteModal(p._id)}
                onExpire={() => setExpireTarget(p._id)}
                onReset={() => setResetTarget(p._id)}
                onRankUpdated={refreshAllProjects}
                canApprove={canApproveProject(currentUser, p)}
              />
            </div>
          ))}
        </div>
      )}

      {/* ── PROJECT PAGINATION ───────────────────────────────────────────── */}
      {visibleProperties.length > 0 && (
        <div className="flex flex-col items-center justify-center gap-3 border-t border-slate-100 pt-4 sm:flex-row">
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
    </div>
  );
}

