// CreatedBy.jsx
import { forwardRef, useState, useEffect, useRef } from "react";
import { useActivePropertySlice } from "../../UsePropertySlice/useActivePropertySlice";
import { getUserSearch } from "../../../../../../features/user/userService";

const ROLES = [
  { label: "All",           value: ""              },
  { label: "User",          value: "user"          },
  { label: "Builder",       value: "builder"       },
  { label: "Agent",         value: "agent"         },
  { label: "Sales Manager", value: "sales_manager" },
  { label: "Sales Agent",   value: "sales_agent"   },
  { label: "Super Admin",   value: "super_admin"   },
  { label: "Admin",         value: "admin"         },
  { label: "Customer Care", value: "customer_care" },
];

const inp = (err) =>
  `w-full px-4 py-3 bg-white border-2 rounded-xl text-gray-900 text-sm font-semibold
   outline-none placeholder:text-gray-400 transition-all duration-200
   ${err
     ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
     : "border-gray-200 focus:border-[#27AE60] focus:ring-4 focus:ring-[#27AE60]/10"
   }`;

const LABEL = "block text-[10px] font-black  uppercase tracking-widest text-[#27AE60] mb-1.5";
const ERR   = "text-xs text-red-500 font-semibold mt-1.5 flex items-center gap-1";

const CreatedBy = forwardRef(({ error }, ref) => {
  const { form, updateFieldValue } = useActivePropertySlice();

  const [allUsers,       setAllUsers]       = useState([]);
  const [loading,        setLoading]        = useState(false);
  const [activeRole,     setActiveRole]     = useState("");
  const [searchQuery,    setSearchQuery]    = useState("");
  const [filters,        setFilters]        = useState({ state: "", city: "", pincode: "", locality: "" });
  const [dropdownOpen,   setDropdownOpen]   = useState(false);
  const [selectedUser,   setSelectedUser]   = useState(null);

  const wrapperRef = useRef(null);

  /* ── close dropdown on outside click ── */
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ── fetch users whenever role tab changes ── */
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await getUserSearch(activeRole || "all");
        setAllUsers(res?.data?.results || []);
      } catch {
        setAllUsers([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [activeRole]);

  /* ── if form already has a createdBy id, find the user label ── */
  useEffect(() => {
    if (form.createdBy && allUsers.length) {
      const found = allUsers.find((u) => u._id === form.createdBy);
      if (found) setSelectedUser(found);
    }
  }, [form.createdBy, allUsers]);

  /* ── derive unique location options (cascade) ── */
  const base = allUsers.filter((u) =>
    !activeRole || u.role === activeRole
  );

  const uniqueStates = [...new Set(base.map((u) => u.state).filter(Boolean))].sort();

  const uniqueCities = [...new Set(
    base.filter((u) => !filters.state || u.state === filters.state)
        .map((u) => u.city).filter(Boolean)
  )].sort();

  const uniquePincodes = [...new Set(
    base.filter((u) =>
      (!filters.state || u.state === filters.state) &&
      (!filters.city  || u.city  === filters.city)
    ).map((u) => u.pincode).filter(Boolean)
  )].sort();

  const uniqueLocalities = [...new Set(
    base.filter((u) =>
      (!filters.state   || u.state   === filters.state)   &&
      (!filters.city    || u.city    === filters.city)    &&
      (!filters.pincode || u.pincode === filters.pincode)
    ).map((u) => u.locality).filter(Boolean)
  )].sort();

  /* ── final filtered list ── */
  const filteredUsers = base.filter((u) => {
    const q = searchQuery.trim().toLowerCase();
    const matchSearch =
      !q ||
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.phone?.includes(q);
    const matchState    = !filters.state    || u.state    === filters.state;
    const matchCity     = !filters.city     || u.city     === filters.city;
    const matchPincode  = !filters.pincode  || u.pincode  === filters.pincode;
    const matchLocality = !filters.locality || u.locality === filters.locality;
    return matchSearch && matchState && matchCity && matchPincode && matchLocality;
  });

  /* ── helpers ── */
  const clearFilters = () => {
    setFilters({ state: "", city: "", pincode: "", locality: "" });
    setSearchQuery("");
  };

  const hasActiveFilter =
    searchQuery || filters.state || filters.city || filters.pincode || filters.locality;

  const selectUser = (user) => {
    setSelectedUser(user);
    updateFieldValue("createdBy", user._id);
    setDropdownOpen(false);
  };

  const clearSelection = () => {
    setSelectedUser(null);
    updateFieldValue("createdBy", "");
    setSearchQuery("");
    setFilters({ state: "", city: "", pincode: "", locality: "" });
  };

  const getRoleBadgeColor = (role) => {
    const map = {
      builder:       "bg-green-100 text-green-800",
      agent:         "bg-blue-100 text-blue-800",
      sales_manager: "bg-purple-100 text-purple-800",
      sales_agent:   "bg-indigo-100 text-indigo-800",
      super_admin:   "bg-red-100 text-red-800",
      admin:         "bg-orange-100 text-orange-800",
      customer_care: "bg-pink-100 text-pink-800",
      user:          "bg-gray-100 text-gray-700",
    };
    return map[role] || "bg-gray-100 text-gray-600";
  };

  /* ── render ── */
  return (
    <div ref={ref} className="space-y-2">
      <p className={LABEL}>Posted By</p>

      {/* ── Trigger / Selected display ── */}
      <div ref={wrapperRef} className="relative">
        <div
          onClick={() => setDropdownOpen((v) => !v)}
          className={`flex items-center justify-between px-4 py-3 bg-white border-2 rounded-xl
            cursor-pointer transition-all duration-200 select-none
            ${error
              ? "border-red-400"
              : dropdownOpen
                ? "border-[#27AE60] ring-4 ring-[#27AE60]/10"
                : "border-gray-200 hover:border-gray-300"
            }`}
        >
          {selectedUser ? (
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-[#27AE60]/10 flex items-center justify-center flex-shrink-0">
                <span className="text-[#27AE60] text-xs font-black uppercase">
                  {selectedUser.name?.[0] || "?"}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate capitalize">
                  {selectedUser.name}
                </p>
                <p className="text-xs text-gray-400 truncate">{selectedUser.email}</p>
              </div>
              <span className={`ml-auto flex-shrink-0 px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${getRoleBadgeColor(selectedUser.role)}`}>
                {selectedUser.role?.replace("_", " ")}
              </span>
            </div>
          ) : (
            <span className="text-sm text-gray-400 font-semibold">
              Select a user...
            </span>
          )}

          <div className="flex items-center gap-2 ml-3 flex-shrink-0">
            {selectedUser && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); clearSelection(); }}
                className="w-5 h-5 rounded-full bg-gray-100 hover:bg-red-100 flex items-center
                  justify-center text-gray-400 hover:text-red-500 transition-colors text-xs font-bold"
              >
                ×
              </button>
            )}
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
              fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
            >
              <path d="M19 9l-7 7-7-7"/>
            </svg>
          </div>
        </div>

        {/* ── Dropdown panel ── */}
        {dropdownOpen && (
          <div className="absolute z-50 top-full mt-2 left-0 right-0 bg-white border-2 border-gray-200
            rounded-2xl shadow-xl overflow-hidden">

            {/* Role tabs */}
            <div className="flex overflow-x-auto border-b border-gray-100 bg-gray-50 px-2 pt-2 gap-1 scrollbar-hide">
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => {
                    setActiveRole(r.value);
                    setFilters({ state: "", city: "", pincode: "", locality: "" });
                    setSearchQuery("");
                  }}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-t-lg text-[11px] font-black
                    uppercase tracking-wide transition-all border-b-2 whitespace-nowrap
                    ${activeRole === r.value
                      ? "border-[#27AE60] text-[#27AE60] bg-white"
                      : "border-transparent text-gray-400 hover:text-gray-600 hover:bg-white/60"
                    }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            <div className="p-3 space-y-3">
              {/* Search input */}
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  width="14" height="14" fill="none" stroke="currentColor"
                  strokeWidth="2" viewBox="0 0 24 24"
                >
                  <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                </svg>
                <input
                  type="text"
                  placeholder="Search name, email, phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-8 py-2.5 border-2 border-gray-200 rounded-xl text-sm
                    font-semibold text-gray-800 placeholder:text-gray-400 outline-none
                    focus:border-[#27AE60] focus:ring-4 focus:ring-[#27AE60]/10 transition-all"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400
                      hover:text-gray-600 font-bold text-base leading-none"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Location filters */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={LABEL}>State</label>
                  <select
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-xs
                      font-bold text-gray-700 outline-none focus:border-[#27AE60] bg-white
                      transition-all cursor-pointer"
                    value={filters.state}
                    onChange={(e) =>
                      setFilters({ state: e.target.value, city: "", pincode: "", locality: "" })
                    }
                  >
                    <option value="">All States</option>
                    {uniqueStates.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className={LABEL}>City</label>
                  <select
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-xs
                      font-bold text-gray-700 outline-none focus:border-[#27AE60] bg-white
                      transition-all cursor-pointer"
                    value={filters.city}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, city: e.target.value, pincode: "", locality: "" }))
                    }
                  >
                    <option value="">All Cities</option>
                    {uniqueCities.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className={LABEL}>Pincode</label>
                  <select
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-xs
                      font-bold text-gray-700 outline-none focus:border-[#27AE60] bg-white
                      transition-all cursor-pointer"
                    value={filters.pincode}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, pincode: e.target.value, locality: "" }))
                    }
                  >
                    <option value="">All Pincodes</option>
                    {uniquePincodes.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                <div>
                  <label className={LABEL}>Locality</label>
                  <select
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-xs
                      font-bold text-gray-700 outline-none focus:border-[#27AE60] bg-white
                      transition-all cursor-pointer"
                    value={filters.locality}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, locality: e.target.value }))
                    }
                  >
                    <option value="">All Localities</option>
                    {uniqueLocalities.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>

              {/* Active filter chips */}
              {hasActiveFilter && (
                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    searchQuery && { label: `"${searchQuery}"`, clear: () => setSearchQuery("") },
                    filters.state    && { label: filters.state,    clear: () => setFilters({ state: "", city: "", pincode: "", locality: "" }) },
                    filters.city     && { label: filters.city,     clear: () => setFilters((f) => ({ ...f, city: "", pincode: "", locality: "" })) },
                    filters.pincode  && { label: filters.pincode,  clear: () => setFilters((f) => ({ ...f, pincode: "", locality: "" })) },
                    filters.locality && { label: filters.locality, clear: () => setFilters((f) => ({ ...f, locality: "" })) },
                  ].filter(Boolean).map((chip, i) => (
                    <span key={i}
                      className="flex items-center gap-1 px-2 py-0.5 bg-[#f0fdf6] border
                        border-[#bbf7d0] text-[#1e8449] text-[10px] font-black rounded-lg"
                    >
                      {chip.label}
                      <button type="button" onClick={chip.clear}
                        className="hover:text-red-500 leading-none font-black">×</button>
                    </span>
                  ))}
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-[10px] text-red-400 font-black hover:text-red-600 ml-1"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>

            {/* Results count bar */}
            <div className="px-4 py-1.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">
                {loading ? "Loading..." : `${filteredUsers.length} user${filteredUsers.length !== 1 ? "s" : ""} found`}
              </span>
              {filteredUsers.length > 0 && (
                <span className="text-[10px] text-gray-400">Click to select</span>
              )}
            </div>

            {/* User list */}
            <ul className="max-h-64 overflow-y-auto divide-y divide-gray-50">
              {loading ? (
                <li className="px-4 py-8 text-center">
                  <div className="inline-block w-5 h-5 border-2 border-[#27AE60] border-t-transparent
                    rounded-full animate-spin"/>
                  <p className="text-xs text-gray-400 mt-2 font-semibold">Loading users...</p>
                </li>
              ) : filteredUsers.length === 0 ? (
                <li className="px-4 py-8 text-center">
                  <p className="text-sm text-gray-400 font-semibold">No users found</p>
                  {hasActiveFilter && (
                    <button type="button" onClick={clearFilters}
                      className="text-xs text-[#27AE60] font-bold mt-1 hover:underline">
                      Clear filters
                    </button>
                  )}
                </li>
              ) : (
                filteredUsers.map((user) => {
                  const isSelected = form.createdBy === user._id;
                  return (
                    <li
                      key={user._id}
                      onClick={() => selectUser(user)}
                      className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all
                        ${isSelected
                          ? "bg-[#f0fdf6] border-l-4 border-l-[#27AE60]"
                          : "hover:bg-gray-50 border-l-4 border-l-transparent"
                        }`}
                    >
                      {/* Avatar */}
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center
                        flex-shrink-0 font-black text-sm uppercase
                        ${isSelected ? "bg-[#27AE60] text-white" : "bg-gray-100 text-gray-500"}`}>
                        {user.name?.[0] || "?"}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-gray-900 truncate capitalize">
                            {user.name}
                          </p>
                          {isSelected && (
                            <span className="flex-shrink-0 text-[#27AE60] text-xs font-black">✓</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                        {(user.city || user.state) && (
                          <p className="text-[10px] text-gray-400 truncate mt-0.5">
                            {[user.locality, user.city, user.state, user.pincode]
                              .filter(Boolean).join(", ")}
                          </p>
                        )}
                      </div>

                      {/* Role badge */}
                      <span className={`flex-shrink-0 px-2 py-0.5 rounded-md text-[10px]
                        font-black uppercase tracking-wide ${getRoleBadgeColor(user.role)}`}>
                        {user.role?.replace(/_/g, " ")}
                      </span>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        )}
      </div>

      {error && <p className={ERR}>⚠ {error}</p>}
    </div>
  );
});

export default CreatedBy;