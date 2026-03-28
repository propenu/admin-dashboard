// frontend/admin-dashboard/src/pages/users/Users.jsx
import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import authAxios from "../../config/authApi";
import { USER_API_ENDPOINTS } from "../../config/UserDeatilsApi";
import {
  Search,
  Phone,
  Calendar,
  ShieldCheck,
  Users as UsersIcon,
  MapPin,
  Mail,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  X,
  Filter,
  ChevronDown,
  Building2,
  Navigation,
  Hash,
} from "lucide-react";

/* ═══════════════════════════════════════════
   CONSTANTS & MAPS
═══════════════════════════════════════════ */
const ACCOUNT_STATUS_MAP = {
  active: {
    label: "Active",
    bg: "bg-[#27AE60]/10",
    text: "text-[#27AE60]",
    dot: "bg-[#27AE60]",
  },
  location_pending: {
    label: "Location Pending",
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-400",
  },
  kyc_pending: {
    label: "KYC Pending",
    bg: "bg-blue-50",
    text: "text-blue-700",
    dot: "bg-blue-400",
  },
};

const KYC_STATUS_MAP = {
  verified: {
    label: "Verified",
    bg: "bg-[#27AE60]/10",
    text: "text-[#27AE60]",
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  not_started: {
    label: "Not Started",
    bg: "bg-gray-100",
    text: "text-gray-500",
    icon: <Clock className="w-3 h-3" />,
  },
  rejected: {
    label: "Rejected",
    bg: "bg-red-50",
    text: "text-red-600",
    icon: <XCircle className="w-3 h-3" />,
  },
};

const AVATAR_COLORS = [
  "from-[#27AE60] to-emerald-400",
  "from-blue-500 to-blue-400",
  "from-purple-500 to-purple-400",
  "from-amber-500 to-amber-400",
  "from-rose-500 to-rose-400",
];

/* ═══════════════════════════════════════════
   SMALL REUSABLE COMPONENTS
═══════════════════════════════════════════ */
const Avatar = ({ name }) => {
  const idx = (name?.charCodeAt(0) || 0) % AVATAR_COLORS.length;
  return (
    <div
      className={`w-9 h-9 rounded-xl bg-gradient-to-br ${AVATAR_COLORS[idx]}
        flex items-center justify-center text-white text-sm font-bold shadow-sm flex-shrink-0`}
    >
      {name?.charAt(0).toUpperCase() || "?"}
    </div>
  );
};

const AccountBadge = ({ status }) => {
  const s = ACCOUNT_STATUS_MAP[status] || {
    label: status,
    bg: "bg-gray-100",
    text: "text-gray-500",
    dot: "bg-gray-400",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
};

const KycBadge = ({ kyc }) => {
  const k = KYC_STATUS_MAP[kyc?.status] || KYC_STATUS_MAP.not_started;
  return (
    <span
      title={kyc?.remarks || ""}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold
        ${k.bg} ${k.text} ${kyc?.remarks ? "cursor-help underline decoration-dotted" : ""}`}
    >
      {k.icon}
      {k.label}
      {kyc?.remarks && <AlertTriangle className="w-3 h-3 ml-0.5" />}
    </span>
  );
};

const PhoneBadge = ({ verified }) =>
  verified ? (
    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#27AE60] bg-[#27AE60]/10 px-2 py-0.5 rounded-full">
      <CheckCircle2 className="w-3 h-3" /> Verified
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
      <XCircle className="w-3 h-3" /> Unverified
    </span>
  );

const StatCard = ({ label, value, icon, colorClass }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
      {icon}
    </div>
    <div>
      <p className="text-2xl font-extrabold text-gray-900 leading-none">{value}</p>
      <p className="text-xs text-gray-400 font-medium mt-0.5">{label}</p>
    </div>
  </div>
);

const FilterSelect = ({ value, onChange, options, placeholder }) => (
  <div className="relative">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="pl-3 pr-8 py-2.5 text-sm rounded-xl border border-gray-200 bg-white text-gray-700
                 focus:outline-none focus:border-[#27AE60] focus:ring-4 focus:ring-[#27AE60]/10
                 shadow-sm transition-all duration-200 appearance-none cursor-pointer w-full"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
  </div>
);

const MobileChip = ({ icon, label, span2 = false }) => (
  <div className={`flex items-center gap-2 text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded-xl ${span2 ? "col-span-2" : ""}`}>
    {icon}
    <span className="truncate font-medium">{label}</span>
  </div>
);

/* ═══════════════════════════════════════════
   HIGHLIGHT MATCH HELPER
═══════════════════════════════════════════ */
const Highlight = ({ text = "", query = "" }) => {
  if (!query || !text) return <span>{text}</span>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <span>{text}</span>;
  return (
    <span>
      {text.slice(0, idx)}
      <mark className="bg-[#27AE60]/20 text-[#27AE60] font-bold rounded px-0.5">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </span>
  );
};

/* ═══════════════════════════════════════════
   LOCATION SEARCH WITH AUTOCOMPLETE
═══════════════════════════════════════════ */
const LocationSearch = ({ users, onFilter, activeTag, onClearTag }) => {
  const [inputVal, setInputVal] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showDrop, setShowDrop] = useState(false);
  const wrapRef = useRef(null);

  // Build unique location options from user data
  const locationOptions = useMemo(() => {
    const set = new Set();
    const opts = [];

    users.forEach((u) => {
      const addOpt = (val, type, icon) => {
        const key = `${type}:${val?.toLowerCase()}`;
        if (val && !set.has(key)) {
          set.add(key);
          opts.push({ value: val, type, icon, display: val });
        }
      };
      addOpt(u.locality, "locality", "📍");
      addOpt(u.city, "city", "🏙️");
      addOpt(u.state, "state", "🗺️");
      addOpt(u.pincode, "pincode", "📮");
    });

    return opts.sort((a, b) => {
      const order = { city: 0, state: 1, locality: 2, pincode: 3 };
      return (order[a.type] ?? 4) - (order[b.type] ?? 4);
    });
  }, [users]);

  const typeLabel = { locality: "Locality", city: "City", state: "State", pincode: "Pincode" };
  const typeColor = {
    locality: "text-purple-600 bg-purple-50",
    city: "text-[#27AE60] bg-[#27AE60]/10",
    state: "text-blue-600 bg-blue-50",
    pincode: "text-amber-600 bg-amber-50",
  };

  const handleInput = (val) => {
    setInputVal(val);
    if (!val.trim()) {
      setSuggestions([]);
      setShowDrop(false);
      onFilter(null);
      return;
    }
    const q = val.toLowerCase();
    const matched = locationOptions.filter((o) =>
      o.value?.toLowerCase().includes(q)
    );
    setSuggestions(matched.slice(0, 10));
    setShowDrop(true);
  };

  const handleSelect = (opt) => {
    setInputVal(opt.value);
    setShowDrop(false);
    setSuggestions([]);
    onFilter(opt);
  };

  const handleClear = () => {
    setInputVal("");
    setSuggestions([]);
    setShowDrop(false);
    onFilter(null);
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setShowDrop(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={wrapRef} className="relative w-full">
      {/* Input */}
      <div className="relative">
        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#27AE60]" />
        <input
          type="text"
          value={inputVal}
          onChange={(e) => handleInput(e.target.value)}
          onFocus={() => {
            if (inputVal && suggestions.length) setShowDrop(true);
            else if (!inputVal) {
              setSuggestions(locationOptions.slice(0, 8));
              setShowDrop(true);
            }
          }}
          placeholder="Search by locality, city, state, pincode…"
          className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-800
                     placeholder-gray-400 focus:outline-none focus:border-[#27AE60] focus:ring-4
                     focus:ring-[#27AE60]/10 shadow-sm transition-all duration-200"
        />
        {inputVal && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Active filter tag */}
      {activeTag && (
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs text-gray-400">Filtering by:</span>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${typeColor[activeTag.type]}`}>
            <MapPin className="w-3 h-3" />
            {typeLabel[activeTag.type]}: {activeTag.value}
            <button onClick={handleClear} className="ml-0.5 hover:opacity-70">
              <X className="w-3 h-3" />
            </button>
          </span>
        </div>
      )}

      {/* Dropdown */}
      {showDrop && suggestions.length > 0 && (
        <div className="absolute z-50 mt-1.5 w-full bg-white border border-gray-200 rounded-2xl shadow-lg shadow-gray-200/60 overflow-hidden">
          {/* Group by type */}
          {["city", "state", "locality", "pincode"].map((type) => {
            const group = suggestions.filter((s) => s.type === type);
            if (!group.length) return null;
            return (
              <div key={type}>
                <div className="px-4 py-1.5 bg-gray-50 border-b border-gray-100">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${typeColor[type]}`}>
                    {typeLabel[type]}
                  </span>
                </div>
                {group.map((opt, i) => {
                  const count = users.filter((u) =>
                    u[opt.type]?.toLowerCase() === opt.value?.toLowerCase()
                  ).length;
                  return (
                    <button
                      key={i}
                      onMouseDown={() => handleSelect(opt)}
                      className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-[#27AE60]/5
                                 transition-colors duration-100 text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        {type === "locality" && <Navigation className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />}
                        {type === "city" && <Building2 className="w-3.5 h-3.5 text-[#27AE60] flex-shrink-0" />}
                        {type === "state" && <MapPin className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />}
                        {type === "pincode" && <Hash className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />}
                        <span className="text-sm text-gray-700 capitalize font-medium">
                          <Highlight text={opt.value} query={inputVal} />
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-white bg-[#27AE60] px-2 py-0.5 rounded-full ml-2 flex-shrink-0">
                        {count} user{count !== 1 ? "s" : ""}
                      </span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}

      {showDrop && inputVal && suggestions.length === 0 && (
        <div className="absolute z-50 mt-1.5 w-full bg-white border border-gray-200 rounded-2xl shadow-lg p-4 text-center">
          <MapPin className="w-6 h-6 text-gray-200 mx-auto mb-1" />
          <p className="text-sm text-gray-400">No locations match "{inputVal}"</p>
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════
   SKELETON & EMPTY STATE
═══════════════════════════════════════════ */
const SkeletonRows = () =>
  Array.from({ length: 5 }).map((_, i) => (
    <tr key={i} className="border-t border-gray-50 animate-pulse">
      {[6, 36, 28, 20, 20, 16, 22, 20].map((w, j) => (
        <td key={j} className="px-5 py-4">
          <div className={`h-3.5 bg-gray-100 rounded`} style={{ width: `${w * 4}px` }} />
        </td>
      ))}
    </tr>
  ));

const EmptyState = ({ colSpan, hasFilters }) => (
  <tr>
    <td colSpan={colSpan} className="py-20 text-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center">
          <UsersIcon className="w-7 h-7 text-gray-300" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-500">No users found</p>
          <p className="text-xs text-gray-400 mt-1">
            {hasFilters ? "Try adjusting your search or filters" : "No users available"}
          </p>
        </div>
      </div>
    </td>
  </tr>
);

/* ═══════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════ */
export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // General filters
  const [search, setSearch] = useState("");
  const [filterAccountStatus, setFilterAccountStatus] = useState("");
  const [filterKycStatus, setFilterKycStatus] = useState("");
  const [filterPhoneVerified, setFilterPhoneVerified] = useState("");
  const [filterIsActive, setFilterIsActive] = useState("");

  // Location filter (deep)
  const [locationFilter, setLocationFilter] = useState(null);
  // locationFilter = { value: "hyderabad", type: "city" } | null

  /* ── Load all users ── */
  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await authAxios.get(USER_API_ENDPOINTS.ALL_USERS);
      const data = res.data;
      setUsers(Array.isArray(data) ? data : data.users || []);
    } catch (err) {
      console.error("Failed to load users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  /* ── Debounced API search (name/phone/email) ── */
  useEffect(() => {
    if (!search) { loadUsers(); return; }
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await authAxios.get(`${USER_API_ENDPOINTS.SEARCH_USERS}?q=${search}`);
        setUsers(res.data.results || []);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  /* ── Client-side filtering (location + status + kyc + phone) ── */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      // General text search (name / phone / email)
      if (
        q &&
        !u.name?.toLowerCase().includes(q) &&
        !u.phone?.includes(q) &&
        !u.email?.toLowerCase().includes(q)
      ) return false;

      // Location deep filter
      if (locationFilter) {
        const { value, type } = locationFilter;
        const field = u[type]?.toLowerCase() || "";
        if (!field.includes(value.toLowerCase())) return false;
      }

      // Account status
      if (filterAccountStatus && u.accountStatus !== filterAccountStatus) return false;

      // KYC
      if (filterKycStatus && u.kyc?.status !== filterKycStatus) return false;

      // Phone verified
      if (filterPhoneVerified !== "") {
        const want = filterPhoneVerified === "true";
        if (!!u.phoneVerified !== want) return false;
      }

      // Is active
      if (filterIsActive !== "") {
        const want = filterIsActive === "true";
        if (!!u.isActive !== want) return false;
      }

      return true;
    });
  }, [users, search, locationFilter, filterAccountStatus, filterKycStatus, filterPhoneVerified, filterIsActive]);

  /* ── Stats ── */
  const stats = useMemo(() => ({
    total: users.length,
    active: users.filter((u) => u.accountStatus === "active").length,
    kycVerified: users.filter((u) => u.kyc?.status === "verified").length,
    phoneVerified: users.filter((u) => u.phoneVerified).length,
    locPending: users.filter((u) => u.accountStatus === "location_pending").length,
  }), [users]);

  const hasFilters = search || filterAccountStatus || filterKycStatus || filterPhoneVerified || filterIsActive || locationFilter;

  const clearAll = () => {
    setSearch("");
    setFilterAccountStatus("");
    setFilterKycStatus("");
    setFilterPhoneVerified("");
    setFilterIsActive("");
    setLocationFilter(null);
  };

  /* ── Format location for display ── */
  const formatLocation = (u) => {
    const parts = [u.locality, u.city, u.state, u.pincode].filter(Boolean);
    return parts.length ? parts : null;
  };

  /* ── Highlight location fields matching active filter ── */
  const locQuery = locationFilter?.value || "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50/40 p-4 md:p-6 lg:p-8">
      {/* ── Page Header ── */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#27AE60] flex items-center justify-center shadow-lg shadow-[#27AE60]/25 flex-shrink-0">
              <UsersIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-[#27AE60] tracking-tight">
                User Management
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Monitor and manage your platform users
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 bg-white border border-gray-100 shadow-sm px-3 py-1.5 rounded-full font-medium">
              {loading
                ? "Loading…"
                : `${filtered.length} of ${users.length} users`}
            </span>
            <button
              onClick={loadUsers}
              className="text-xs text-[#27AE60] bg-[#27AE60]/10 hover:bg-[#27AE60]/20 px-3 py-1.5 rounded-full font-semibold transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        <StatCard
          label="Total Users"
          value={stats.total}
          icon={<UsersIcon className="w-5 h-5 text-[#27AE60]" />}
          colorClass="bg-[#27AE60]/10"
        />
        <StatCard
          label="Active"
          value={stats.active}
          icon={<CheckCircle2 className="w-5 h-5 text-[#27AE60]" />}
          colorClass="bg-[#27AE60]/10"
        />
        <StatCard
          label="KYC Verified"
          value={stats.kycVerified}
          icon={<ShieldCheck className="w-5 h-5 text-blue-500" />}
          colorClass="bg-blue-50"
        />
        <StatCard
          label="Phone Verified"
          value={stats.phoneVerified}
          icon={<Phone className="w-5 h-5 text-purple-500" />}
          colorClass="bg-purple-50"
        />
        <StatCard
          label="Loc. Pending"
          value={stats.locPending}
          icon={<MapPin className="w-5 h-5 text-amber-500" />}
          colorClass="bg-amber-50"
        />
      </div>

      {/* ── Search + Filters Panel ── */}
      <div className="bg-white rounded-2xl  border border-gray-100 shadow-sm p-4 mb-4 space-y-3">
       
        {/* <div className="flex justify-center gap-4">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, phone, email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-gray-200 bg-white text-sm
                       text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#27AE60]
                       focus:ring-4 focus:ring-[#27AE60]/10 shadow-sm transition-all duration-200"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          
          <LocationSearch
            users={users}
            onFilter={setLocationFilter}
            activeTag={locationFilter}
            onClearTag={() => setLocationFilter(null)}
          />
        </div> */}
        <div className="flex w-full gap-4">
  
  {/* Search Input */}
  <div className="relative flex items-center flex-1">
    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
    
    <input
      type="text"
      placeholder="Search by name, phone, email…"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-gray-200 bg-white text-sm
                 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#27AE60]
                 focus:ring-4 focus:ring-[#27AE60]/10 shadow-sm transition-all duration-200"
    />

    {search && (
      <button
        onClick={() => setSearch("")}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    )}
  </div>

  {/* Location Search */}
  <div className="flex-1">
    <LocationSearch
      users={users}
      onFilter={setLocationFilter}
      activeTag={locationFilter}
      onClearTag={() => setLocationFilter(null)}
    />
  </div>

</div>
        {/* Row 3: Dropdown filters */}
        <div className="flex flex-wrap gap-2.5 items-center">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
            <Filter className="w-3.5 h-3.5" /> Filters
          </div>

          <FilterSelect
            value={filterAccountStatus}
            onChange={setFilterAccountStatus}
            placeholder="All Statuses"
            options={[
              { value: "active", label: "Active" },
              { value: "location_pending", label: "Location Pending" },
              { value: "kyc_pending", label: "KYC Pending" },
            ]}
          />
          <FilterSelect
            value={filterKycStatus}
            onChange={setFilterKycStatus}
            placeholder="All KYC"
            options={[
              { value: "verified", label: "KYC Verified" },
              { value: "not_started", label: "Not Started" },
              { value: "rejected", label: "Rejected" },
            ]}
          />
          <FilterSelect
            value={filterPhoneVerified}
            onChange={setFilterPhoneVerified}
            placeholder="Phone Status"
            options={[
              { value: "true", label: "Phone Verified" },
              { value: "false", label: "Unverified" },
            ]}
          />
          <FilterSelect
            value={filterIsActive}
            onChange={setFilterIsActive}
            placeholder="Active Status"
            options={[
              { value: "true", label: "Is Active" },
              { value: "false", label: "Inactive" },
            ]}
          />

          {hasFilters && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1.5 text-xs font-semibold text-red-400 hover:text-red-600
                         bg-red-50 hover:bg-red-100 px-3 py-2.5 rounded-xl transition-colors duration-150"
            >
              <X className="w-3.5 h-3.5" /> Clear All
            </button>
          )}
        </div>

        {/* Active filter tags summary */}
        {hasFilters && (
          <div className="flex flex-wrap gap-2 pt-1 border-t border-gray-50">
            <span className="text-[11px] text-gray-400 self-center">
              Active:
            </span>
            {search && (
              <Tag
                label={`Search: "${search}"`}
                onRemove={() => setSearch("")}
                color="gray"
              />
            )}
            {locationFilter && (
              <Tag
                label={`${locationFilter.type === "city" ? "City" : locationFilter.type === "state" ? "State" : locationFilter.type === "locality" ? "Locality" : "Pincode"}: ${locationFilter.value}`}
                onRemove={() => setLocationFilter(null)}
                color="green"
              />
            )}
            {filterAccountStatus && (
              <Tag
                label={`Status: ${ACCOUNT_STATUS_MAP[filterAccountStatus]?.label || filterAccountStatus}`}
                onRemove={() => setFilterAccountStatus("")}
                color="amber"
              />
            )}
            {filterKycStatus && (
              <Tag
                label={`KYC: ${KYC_STATUS_MAP[filterKycStatus]?.label || filterKycStatus}`}
                onRemove={() => setFilterKycStatus("")}
                color="blue"
              />
            )}
            {filterPhoneVerified && (
              <Tag
                label={`Phone: ${filterPhoneVerified === "true" ? "Verified" : "Unverified"}`}
                onRemove={() => setFilterPhoneVerified("")}
                color="purple"
              />
            )}
            {filterIsActive && (
              <Tag
                label={`Active: ${filterIsActive === "true" ? "Yes" : "No"}`}
                onRemove={() => setFilterIsActive("")}
                color="gray"
              />
            )}
          </div>
        )}
      </div>

      {/* ── Data Table ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* ── Desktop Table ── */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                {[
                  "No.",
                  "User",
                  "Contact",
                  "Account",
                  "KYC",
                  "Phone",
                  "Location",
                  "Joined",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#27AE60] whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <SkeletonRows />
              ) : filtered.length === 0 ? (
                <EmptyState colSpan={8} hasFilters={!!hasFilters} />
              ) : (
                filtered.map((u, idx) => {
                  const locParts = formatLocation(u);
                  return (
                    <tr
                      key={u._id}
                      className="border-t border-gray-50 hover:bg-green-50/40 transition-colors duration-150"
                    >
                      {/* No. */}
                      <td className="px-5 py-4">
                        <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-1 rounded-md">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                      </td>

                      {/* User */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={u.name} />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-800 leading-tight">
                              {u.name
                                ?.split(" ")
                                .map(
                                  (n) => n.charAt(0).toUpperCase() + n.slice(1),
                                )
                                .join(" ")}
                            </p>
                            <p className="text-[10px] text-[#27AE60] font-mono leading-tight mt-0.5 truncate max-w-[130px]">
                              {u._id}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          {u.phone ? (
                            <div className="flex items-center gap-1.5 text-xs text-gray-600">
                              <Phone className="w-3 h-3 text-gray-300 flex-shrink-0" />
                              {u.phone}
                            </div>
                          ) : null}
                          {u.email ? (
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 max-w-[160px]">
                              <Mail className="w-3 h-3 text-gray-300 flex-shrink-0" />
                              <span className="truncate">{u.email}</span>
                            </div>
                          ) : null}
                          {!u.phone && !u.email && (
                            <span className="text-xs text-gray-300">—</span>
                          )}
                        </div>
                      </td>

                      {/* Account Status */}
                      <td className="px-5 py-4">
                        <AccountBadge status={u.accountStatus} />
                      </td>

                      {/* KYC */}
                      <td className="px-5 py-4">
                        <KycBadge kyc={u.kyc} />
                        {u.kyc?.verifiedAt && (
                          <p className="text-[10px] text-gray-400 mt-1">
                            {new Date(u.kyc.verifiedAt).toLocaleDateString(
                              "en-GB",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </p>
                        )}
                      </td>

                      {/* Phone Verified */}
                      <td className="px-5 py-4">
                        <PhoneBadge verified={u.phoneVerified} />
                      </td>

                      {/* Location — with highlight */}
                      <td className="px-5 py-4">
                        {locParts ? (
                          <div className="flex items-start gap-1.5">
                            <MapPin className="w-3 h-3 text-[#27AE60] mt-0.5 flex-shrink-0" />
                            <div className="text-xs text-gray-700 space-y-0.5">
                              {u.locality && (
                                <div className="capitalize font-medium">
                                  <Highlight
                                    text={u.locality}
                                    query={locQuery}
                                  />
                                </div>
                              )}
                              <div className="capitalize text-gray-500">
                                {[u.city, u.state]
                                  .filter(Boolean)
                                  .map((part, i, arr) => (
                                    <span key={i}>
                                      <Highlight text={part} query={locQuery} />
                                      {i < arr.length - 1 && ", "}
                                    </span>
                                  ))}
                              </div>
                              {u.pincode && (
                                <div className="text-gray-400 font-mono text-[11px]">
                                  <Highlight
                                    text={u.pincode}
                                    query={locQuery}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
                            <MapPin className="w-3 h-3" /> Not set
                          </span>
                        )}
                      </td>

                      {/* Joined */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 whitespace-nowrap">
                          <Calendar className="w-3.5 h-3.5 text-gray-300" />
                          {new Date(u.createdAt).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Mobile Card View ── */}
        <div className="md:hidden divide-y divide-gray-50">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <div className="w-8 h-8 rounded-full border-4 border-[#27AE60]/20 border-t-[#27AE60] animate-spin" />
              <p className="text-sm text-gray-400 font-medium">
                Loading users…
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-gray-400">
              <UsersIcon className="w-10 h-10 text-gray-200" />
              <p className="text-sm font-medium">No users found</p>
              <p className="text-xs text-gray-300">
                Try adjusting your filters
              </p>
            </div>
          ) : (
            filtered.map((u) => {
              const locParts = formatLocation(u);
              return (
                <div
                  key={u._id}
                  className="p-4 hover:bg-green-50/30 transition-colors"
                >
                  {/* Top row */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={u.name} />
                      <div className="min-w-0">
                        <p className="font-bold text-gray-800 text-sm">
                          {u.name
                            ?.split(" ")
                            .map((n) => n.charAt(0).toUpperCase() + n.slice(1))
                            .join(" ")}
                        </p>
                        <p className="text-[10px] font-mono text-gray-400 mt-0.5 truncate max-w-[160px]">
                          {u._id}
                        </p>
                      </div>
                    </div>
                    <AccountBadge status={u.accountStatus} />
                  </div>

                  {/* Info chips */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {u.phone && (
                      <MobileChip
                        icon={<Phone className="w-3.5 h-3.5 text-[#27AE60]" />}
                        label={u.phone}
                      />
                    )}
                    {u.email && (
                      <MobileChip
                        icon={<Mail className="w-3.5 h-3.5 text-[#27AE60]" />}
                        label={u.email}
                      />
                    )}
                    <MobileChip
                      icon={<Calendar className="w-3.5 h-3.5 text-[#27AE60]" />}
                      label={new Date(u.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    />
                  </div>

                  {/* Location chip */}
                  {locParts ? (
                    <div className="flex items-start gap-2 bg-green-50/60 rounded-xl px-3 py-2 mb-2">
                      <MapPin className="w-3.5 h-3.5 text-[#27AE60] mt-0.5 flex-shrink-0" />
                      <div className="text-xs text-gray-700 min-w-0">
                        {u.locality && (
                          <span className="font-medium capitalize block">
                            <Highlight text={u.locality} query={locQuery} />
                          </span>
                        )}
                        <span className="text-gray-500 capitalize">
                          {[u.city, u.state, u.pincode]
                            .filter(Boolean)
                            .map((p, i, arr) => (
                              <span key={i}>
                                <Highlight text={p} query={locQuery} />
                                {i < arr.length - 1 && " • "}
                              </span>
                            ))}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-xl mb-2">
                      <MapPin className="w-3.5 h-3.5" /> Location not set
                    </div>
                  )}

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2">
                    <KycBadge kyc={u.kyc} />
                    <PhoneBadge verified={u.phoneVerified} />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Footer count */}
      {!loading && filtered.length > 0 && (
        <p className="text-center text-xs text-gray-400 mt-4">
          Showing {filtered.length} of {users.length} users
          {locationFilter &&
            ` in ${locationFilter.type === "city" ? "city" : locationFilter.type} "${locationFilter.value}"`}
        </p>
      )}
    </div>
  );
}

/* ── Filter Tag ── */
const TAG_COLORS = {
  green: "bg-[#27AE60]/10 text-[#27AE60]",
  blue: "bg-blue-50 text-blue-700",
  amber: "bg-amber-50 text-amber-700",
  purple: "bg-purple-50 text-purple-700",
  gray: "bg-gray-100 text-gray-600",
};

const Tag = ({ label, onRemove, color = "gray" }) => (
  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${TAG_COLORS[color]}`}>
    {label}
    <button onClick={onRemove} className="hover:opacity-60 transition-opacity">
      <X className="w-3 h-3" />
    </button>
  </span>
);
