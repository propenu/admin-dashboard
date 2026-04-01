// src/components/common/TransferCredentials.jsx
import { useState, useEffect, useRef, useMemo } from "react";
import {
  getUserSearch,
  transferCredentials,
} from "../../features/user/userService";
import { toast } from "sonner";

/* ─── Constants ─────────────────────────────────────────────── */
const PRIMARY = "#27AE60";
const PRIMARY_DARK = "#1d8646";
const PRIMARY_LIGHT = "#e8f7ee";
const PRIMARY_MID = "#d1f0df";

/* ─── Role config ────────────────────────────────────────────── */
const ROLES = [
  {
    label: "Super Admin",
    value: "super_admin",
    color: "#7c3aed",
    bg: "#ede9fe",
    icon: "👑",
  },
  {
    label: "Admin",
    value: "admin",
    color: "#ef4444",
    bg: "#fee2e2",
    icon: "🛡️",
  },
  {
    label: "Customer Care",
    value: "customer_care",
    color: "#0ea5e9",
    bg: "#e0f2fe",
    icon: "🎧",
  },
  {
    label: "Accounts",
    value: "accounts",
    color: "#14b8a6",
    bg: "#ccfbf1",
    icon: "💼",
  },
  {
    label: "Sales Agent",
    value: "sales_agent",
    color: "#3b82f6",
    bg: "#dbeafe",
    icon: "🤝",
  },
  {
    label: "Sales Manager",
    value: "sales_manager",
    color: "#8b5cf6",
    bg: "#ede9fe",
    icon: "📊",
  },
  { label: "User", value: "user", color: "#6b7280", bg: "#f3f4f6", icon: "👤" },
];

const getRoleStyle = (role) => {
  const found = ROLES.find((r) => r.value === role);
  return found
    ? { color: found.color, background: found.bg }
    : { color: "#6b7280", background: "#f3f4f6" };
};
const getRoleIcon = (role) => {
  const found = ROLES.find((r) => r.value === role);
  return found ? found.icon : "👤";
};

/* ─── Styles ─────────────────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');

  .tc-overlay-anim { animation: tcOverlayIn 0.22s ease; }
  @keyframes tcOverlayIn { from{opacity:0} to{opacity:1} }

  .tc-card-anim { animation: tcCardIn 0.28s cubic-bezier(0.34,1.56,0.64,1); }
  @keyframes tcCardIn {
    from { opacity:0; transform:scale(0.93) translateY(12px); }
    to   { opacity:1; transform:scale(1) translateY(0); }
  }

  .tc-success-anim { animation: tcFadeUp 0.3s ease; }
  @keyframes tcFadeUp {
    from { opacity:0; transform:translateY(10px); }
    to   { opacity:1; transform:translateY(0); }
  }

  .tc-pop-anim { animation: tcPop 0.4s cubic-bezier(0.34,1.56,0.64,1) 0.05s both; }
  @keyframes tcPop {
    from { transform:scale(0); opacity:0; }
    to   { transform:scale(1); opacity:1; }
  }

  .tc-fill-anim { animation: tcFill 2.4s linear forwards; width:0%; }
  @keyframes tcFill { from{width:0%} to{width:100%} }

  .tc-spin-anim { animation: tcSpin 0.7s linear infinite; }
  @keyframes tcSpin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }

  .tc-slide-down { animation: tcSlideDown 0.2s cubic-bezier(0.34,1.2,0.64,1); }
  @keyframes tcSlideDown {
    from { opacity:0; transform:translateY(-6px); }
    to   { opacity:1; transform:translateY(0); }
  }

  .tc-top-line::before {
    content: '';
    position: absolute;
    top: 0; left: 10%; width: 80%; height: 2px;
    background: linear-gradient(90deg, transparent, #27AE60, transparent);
    border-radius: 999px;
  }

  .tc-scroll::-webkit-scrollbar { width: 4px; }
  .tc-scroll::-webkit-scrollbar-track { background: transparent; }
  .tc-scroll::-webkit-scrollbar-thumb { background: rgba(39,174,96,0.2); border-radius: 4px; }

  .tc-drop-scroll::-webkit-scrollbar { width: 4px; }
  .tc-drop-scroll::-webkit-scrollbar-track { background: transparent; }
  .tc-drop-scroll::-webkit-scrollbar-thumb { background: rgba(39,174,96,0.25); border-radius: 4px; }

  .tc-item { transition: background 0.13s; cursor: pointer; }
  .tc-item:hover { background: #e8f7ee !important; }
  .tc-item:hover .tc-item-name { color: #1d8646 !important; }

  .tc-role-card {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 4px; padding: 8px 4px; border-radius: 10px;
    border: 1.5px solid transparent; cursor: pointer;
    transition: all 0.16s; font-family: 'DM Sans', sans-serif;
    font-size: 9px; font-weight: 700; text-align: center;
    min-width: 0; background: none;
  }
  .tc-role-card:hover { transform: translateY(-1px); }
  .tc-role-card.rc-selected {
    border-color: #27AE60 !important;
    box-shadow: 0 0 0 3px rgba(39,174,96,0.15), 0 4px 12px rgba(39,174,96,0.12);
    transform: translateY(-1px);
  }

  .tc-loc-select {
    appearance: none; -webkit-appearance: none;
    border: 1.5px solid #e5e7eb; border-radius: 8px;
    padding: 6px 24px 6px 8px; font-size: 11px; font-weight: 500;
    color: #374151; cursor: pointer; outline: none;
    font-family: 'DM Sans', sans-serif; transition: all 0.15s;
    width: 100%; box-sizing: border-box;
    background-color: #f9fafb;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%239ca3af'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 8px center;
  }
  .tc-loc-select:focus {
    border-color: #27AE60;
    background-color: #e8f7ee;
    box-shadow: 0 0 0 3px rgba(39,174,96,0.10);
  }
  .tc-loc-select.has-value {
    border-color: #27AE60; background-color: #e8f7ee;
    color: #1d8646; font-weight: 600;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%2327AE60'/%3E%3C/svg%3E");
  }

  .tc-role-chip {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 4px 12px; border-radius: 999px;
    font-size: 11px; font-weight: 600;
    cursor: pointer; border: 1.5px solid transparent;
    transition: all 0.15s; font-family: 'DM Sans', sans-serif;
    white-space: nowrap;
  }
  .tc-role-chip.active {
    border-color: #27AE60;
    background: #e8f7ee !important;
    color: #1d8646 !important;
  }

  .tc-step-dot {
    width: 18px; height: 18px; border-radius: 50%;
    display: inline-flex; align-items: center; justify-content: center;
    font-size: 9px; font-weight: 700; flex-shrink: 0;
    font-family: 'DM Sans', sans-serif;
  }
`;

/* ─── Step indicator ─────────────────────────────────────────── */
function StepRow({ step, label, done, active }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <span
        className="tc-step-dot"
        style={{
          background: done ? "#d1fae5" : active ? PRIMARY : "#e5e7eb",
          color: done ? "#059669" : active ? "#fff" : "#9ca3af",
        }}
      >
        {done ? "✓" : step}
      </span>
      <span
        style={{
          fontSize: 10,
          fontWeight: 600,
          color: active ? PRIMARY_DARK : done ? "#6b7280" : "#c0c8d0",
          fontFamily: "DM Sans, sans-serif",
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
    </div>
  );
}

/* ─── Role Selector Grid (Step 1 inside dropdown) ───────────── */
function RoleSelectorGrid({ value, onChange }) {
  return (
    <div style={{ padding: "12px 12px 14px" }}>
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "#9ca3af",
          fontFamily: "DM Sans, sans-serif",
          marginBottom: 10,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <span
          style={{
            width: 16,
            height: 16,
            borderRadius: "50%",
            background: PRIMARY,
            color: "#fff",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 9,
            fontWeight: 700,
          }}
        >
          1
        </span>
        Choose a Role to Search
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 7,
        }}
      >
        {ROLES.map((r) => {
          const isSel = value === r.value;
          return (
            <button
              key={r.value}
              className={`tc-role-card${isSel ? " rc-selected" : ""}`}
              style={{
                background: isSel ? r.bg : "#f9fafb",
                color: isSel ? r.color : "#6b7280",
                borderColor: isSel ? PRIMARY : "#e5e7eb",
              }}
              onClick={() => onChange(r.value)}
            >
              <span style={{ fontSize: 18, lineHeight: 1 }}>{r.icon}</span>
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  lineHeight: 1.3,
                  letterSpacing: "0.02em",
                }}
              >
                {r.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Location Filter (Step 2 inside dropdown) ───────────────── */
function LocationFilterBar({ users, filters, setFilters }) {
  const states = useMemo(
    () => [...new Set(users.map((u) => u.state).filter(Boolean))].sort(),
    [users],
  );
  const cities = useMemo(
    () => [...new Set(users.map((u) => u.city).filter(Boolean))].sort(),
    [users],
  );
  const localities = useMemo(
    () => [...new Set(users.map((u) => u.locality).filter(Boolean))].sort(),
    [users],
  );
  const pincodes = useMemo(
    () => [...new Set(users.map((u) => u.pincode).filter(Boolean))].sort(),
    [users],
  );

  const activeCount = [
    filters.state,
    filters.city,
    filters.locality,
    filters.pincode,
  ].filter(Boolean).length;

  return (
    <div
      style={{
        padding: "8px 12px 10px",
        borderBottom: "1px solid #f0f0f0",
        background: "#fafafa",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 7,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#9ca3af",
            fontFamily: "DM Sans, sans-serif",
          }}
        >
          <span
            style={{
              width: 16,
              height: 16,
              borderRadius: "50%",
              background: activeCount > 0 ? PRIMARY : "#e5e7eb",
              color: activeCount > 0 ? "#fff" : "#9ca3af",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 9,
              fontWeight: 700,
            }}
          >
            2
          </span>
          Filter by Location
          {activeCount > 0 && (
            <span
              style={{
                padding: "1px 6px",
                borderRadius: 999,
                background: PRIMARY,
                color: "#fff",
                fontSize: 9,
                fontWeight: 700,
              }}
            >
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button
            onClick={() =>
              setFilters({ state: "", city: "", locality: "", pincode: "" })
            }
            style={{
              background: "#fee2e2",
              border: "none",
              borderRadius: 6,
              color: "#ef4444",
              fontSize: 10,
              fontWeight: 600,
              padding: "2px 8px",
              cursor: "pointer",
              fontFamily: "DM Sans, sans-serif",
            }}
          >
            Clear ✕
          </button>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
        {[
          { key: "state", label: "🗺 State", opts: states },
          { key: "city", label: "🏙 City", opts: cities },
          { key: "locality", label: "📍 Locality", opts: localities },
          { key: "pincode", label: "📮 Pincode", opts: pincodes },
        ].map(({ key, label, opts }) => (
          <div key={key}>
            <label
              style={{
                display: "block",
                fontSize: 9,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: 3,
                color: "#b0b8c4",
                fontFamily: "DM Sans, sans-serif",
              }}
            >
              {label}
            </label>
            <select
              className={`tc-loc-select${filters[key] ? " has-value" : ""}`}
              value={filters[key]}
              onChange={(e) =>
                setFilters((f) => ({ ...f, [key]: e.target.value }))
              }
            >
              <option value="">All</option>
              {opts.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {activeCount > 0 && (
        <div
          style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 8 }}
        >
          {[
            { key: "state", icon: "🗺", val: filters.state },
            { key: "city", icon: "🏙", val: filters.city },
            { key: "locality", icon: "📍", val: filters.locality },
            { key: "pincode", icon: "📮", val: filters.pincode },
          ]
            .filter((f) => f.val)
            .map((f) => (
              <span
                key={f.key}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 3,
                  padding: "2px 8px",
                  borderRadius: 999,
                  background: "rgba(39,174,96,0.12)",
                  color: PRIMARY_DARK,
                  fontSize: 10,
                  fontWeight: 600,
                  fontFamily: "DM Sans, sans-serif",
                }}
              >
                {f.icon} {f.val}
                <span
                  style={{ cursor: "pointer", opacity: 0.6, marginLeft: 1 }}
                  onClick={() => setFilters((p) => ({ ...p, [f.key]: "" }))}
                >
                  ✕
                </span>
              </span>
            ))}
        </div>
      )}
    </div>
  );
}

/* ─── Single Search Field ────────────────────────────────────── */
function SingleSearchField({ value, onChange }) {
  const [query, setQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [locFilters, setLocFilters] = useState({
    state: "",
    city: "",
    locality: "",
    pincode: "",
  });
  const [step, setStep] = useState("role"); // "role" | "search"
  const hasFetched = useRef({});
  const containerRef = useRef(null);

  const locActiveCount = [
    locFilters.state,
    locFilters.city,
    locFilters.locality,
    locFilters.pincode,
  ].filter(Boolean).length;

  const filtered = useMemo(() => {
    let list = allUsers;
    if (locFilters.state)
      list = list.filter((u) => u.state === locFilters.state);
    if (locFilters.city) list = list.filter((u) => u.city === locFilters.city);
    if (locFilters.locality)
      list = list.filter((u) => u.locality === locFilters.locality);
    if (locFilters.pincode)
      list = list.filter((u) => u.pincode === locFilters.pincode);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (u) =>
          u.name?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.phone?.includes(q) ||
          (u.city || "").toLowerCase().includes(q) ||
          (u.state || "").toLowerCase().includes(q) ||
          (u.locality || "").toLowerCase().includes(q) ||
          (u.pincode || "").includes(q),
      );
    }
    return list;
  }, [allUsers, locFilters, query]);

  const fetchForRole = async (role) => {
    if (hasFetched.current[role]) return;
    setLoading(true);
    try {
      const res = await getUserSearch(role);
      setAllUsers(res?.data?.results || []);
      hasFetched.current[role] = res?.data?.results || [];
    } catch {
      setAllUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setAllUsers([]);
    setLocFilters({ state: "", city: "", locality: "", pincode: "" });
    setQuery("");
    setStep("search");
    fetchForRole(role);
  };

  const handleRoleReset = (e) => {
    e?.stopPropagation();
    setStep("role");
    setSelectedRole("");
    setAllUsers([]);
    setLocFilters({ state: "", city: "", locality: "", pincode: "" });
    setQuery("");
    setOpen(true);
  };

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        if (!value) setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [value]);

  const handleOpen = () => setOpen(true);
  const handleSelect = (user) => {
    onChange(user);
    setQuery("");
    setOpen(false);
  };
  const handleClear = (e) => {
    e.stopPropagation();
    onChange(null);
    setQuery("");
    setOpen(false);
    setStep("role");
    setSelectedRole("");
    setAllUsers([]);
    setLocFilters({ state: "", city: "", locality: "", pincode: "" });
  };

  const isOpen = open && !value;
  const roleObj = ROLES.find((r) => r.value === selectedRole);

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      {/* ── Selected user card ── */}
      {value ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 12px",
            background: PRIMARY_LIGHT,
            border: `1.5px solid ${PRIMARY}`,
            borderRadius: 12,
            boxShadow: "0 0 0 3px rgba(39,174,96,0.10)",
            fontFamily: "DM Sans, sans-serif",
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              flexShrink: 0,
              background: getRoleStyle(value.role).background,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: getRoleStyle(value.role).color,
              fontSize: 16,
              fontWeight: 700,
            }}
          >
            {value.name?.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                margin: 0,
                fontSize: 13,
                fontWeight: 600,
                color: "#111827",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {value.name}
            </p>
            <p
              style={{
                margin: 0,
                fontSize: 11,
                color: "#6b7280",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {value.email}
            </p>
            {(value.city || value.locality || value.state) && (
              <p
                style={{
                  margin: "2px 0 0",
                  fontSize: 10,
                  color: PRIMARY_DARK,
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                📍{" "}
                {[value.locality, value.city, value.state]
                  .filter(Boolean)
                  .join(", ")}
                {value.pincode ? ` – ${value.pincode}` : ""}
              </p>
            )}
          </div>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              padding: "3px 10px",
              borderRadius: 999,
              background: getRoleStyle(value.role).background,
              color: getRoleStyle(value.role).color,
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {getRoleIcon(value.role)} {value.role?.replace(/_/g, " ")}
          </span>
          <button
            onClick={handleClear}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#9ca3af",
              fontSize: 16,
              lineHeight: 1,
              padding: "2px 4px",
              borderRadius: 4,
              transition: "color 0.15s",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#9ca3af")}
          >
            ✕
          </button>
        </div>
      ) : (
        /* ── Search input ── */
        <div style={{ position: "relative" }}>
          <input
            style={{
              background: isOpen ? PRIMARY_LIGHT : "#f9fafb",
              border: `1.5px solid ${isOpen ? PRIMARY : "#e5e7eb"}`,
              color: "#111827",
              borderRadius: 12,
              padding:
                step === "search"
                  ? "12px 130px 12px 44px"
                  : "12px 14px 12px 44px",
              fontSize: 13,
              width: "100%",
              outline: "none",
              fontFamily: "Poppins, sans-serif",
              transition: "all 0.18s",
              display: "block",
              boxSizing: "border-box",
              boxShadow: isOpen ? "0 0 0 3px rgba(39,174,96,0.10)" : "none",
              cursor: step === "role" ? "pointer" : "text",
            }}
            placeholder={
              step === "role"
                ? "👆 Click here — select a role first..."
                : `Search ${roleObj?.label || ""} by name, email, phone...`
            }
            value={query}
            readOnly={step === "role"}
            onChange={(e) => {
              if (step === "search") setQuery(e.target.value);
            }}
            onFocus={handleOpen}
            onClick={handleOpen}
          />

          {/* Left icon */}
          <div
            style={{
              position: "absolute",
              left: 13,
              top: "50%",
              transform: "translateY(-50%)",
              pointerEvents: "none",
            }}
          >
            {step === "search" && roleObj ? (
              <span style={{ fontSize: 16 }}>{roleObj.icon}</span>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle
                  cx="7"
                  cy="7"
                  r="4.5"
                  stroke="#9ca3af"
                  strokeWidth="1.5"
                />
                <path
                  d="M11 11L14 14"
                  stroke="#9ca3af"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </div>

          {/* Right badges */}
          {step === "search" && (
            <div
              style={{
                position: "absolute",
                right: 10,
                top: "50%",
                transform: "translateY(-50%)",
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              {loading && (
                <div
                  className="tc-spin-anim"
                  style={{
                    width: 13,
                    height: 13,
                    borderRadius: "50%",
                    border: "2px solid rgba(39,174,96,0.2)",
                    borderTopColor: PRIMARY,
                  }}
                />
              )}
              {locActiveCount > 0 && (
                <span
                  style={{
                    padding: "2px 6px",
                    borderRadius: 999,
                    background: PRIMARY,
                    color: "#fff",
                    fontSize: 9,
                    fontWeight: 700,
                    fontFamily: "DM Sans, sans-serif",
                  }}
                >
                  📍{locActiveCount}
                </span>
              )}
              {roleObj && (
                <span
                  onClick={handleRoleReset}
                  title="Click to change role"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 3,
                    padding: "3px 8px",
                    borderRadius: 999,
                    background: roleObj.bg,
                    color: roleObj.color,
                    fontSize: 10,
                    fontWeight: 700,
                    fontFamily: "DM Sans, sans-serif",
                    cursor: "pointer",
                    border: `1px solid ${roleObj.color}40`,
                    whiteSpace: "nowrap",
                  }}
                >
                  {roleObj.icon} {roleObj.label} ✕
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Dropdown ── */}
      {isOpen && (
        <div
          className="tc-slide-down"
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            right: 0,
            background: "#fff",
            border: "1.5px solid rgba(39,174,96,0.20)",
            borderRadius: 14,
            boxShadow:
              "0 16px 48px rgba(0,0,0,0.11), 0 2px 8px rgba(39,174,96,0.08)",
            zIndex: 200,
            overflow: "hidden",
          }}
        >
          {/* ══ STEP 1: Role grid ══ */}
          {step === "role" && (
            <RoleSelectorGrid
              value={selectedRole}
              onChange={handleRoleSelect}
            />
          )}

          {/* ══ STEP 2: Location + Search results ══ */}
          {step === "search" && (
            <>
              {/* Role header bar */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 12px 8px",
                  background: roleObj ? roleObj.bg : PRIMARY_LIGHT,
                  borderBottom: "1px solid rgba(0,0,0,0.06)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <span style={{ fontSize: 15 }}>{roleObj?.icon}</span>
                  <div>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: roleObj?.color || PRIMARY_DARK,
                        fontFamily: "DM Sans, sans-serif",
                        lineHeight: 1.2,
                      }}
                    >
                      {roleObj?.label} Users
                    </div>
                    {!loading && (
                      <div
                        style={{
                          fontSize: 10,
                          color: "#9ca3af",
                          fontFamily: "DM Sans, sans-serif",
                        }}
                      >
                        {allUsers.length} total · {filtered.length} shown
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleRoleReset}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    background: "rgba(255,255,255,0.75)",
                    border: "none",
                    borderRadius: 7,
                    fontSize: 10,
                    fontWeight: 600,
                    color: "#6b7280",
                    padding: "4px 9px",
                    cursor: "pointer",
                    fontFamily: "DM Sans, sans-serif",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "rgba(255,255,255,1)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background =
                      "rgba(255,255,255,0.75)")
                  }
                >
                  ← Change Role
                </button>
              </div>

              {/* Location filter (Step 2) */}
              {!loading && allUsers.length > 0 && (
                <LocationFilterBar
                  users={allUsers}
                  filters={locFilters}
                  setFilters={setLocFilters}
                />
              )}

              {/* User list (Step 3) */}
              <div
                className="tc-drop-scroll"
                style={{ maxHeight: 240, overflowY: "auto" }}
              >
                {loading ? (
                  <div
                    style={{
                      padding: "26px 0",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <div
                      className="tc-spin-anim"
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        border: "2px solid rgba(39,174,96,0.2)",
                        borderTopColor: PRIMARY,
                      }}
                    />
                    <span
                      style={{
                        fontSize: 12,
                        color: "#9ca3af",
                        fontFamily: "DM Sans, sans-serif",
                      }}
                    >
                      Loading {roleObj?.label} users...
                    </span>
                  </div>
                ) : filtered.length === 0 ? (
                  <div
                    style={{
                      padding: "22px 16px",
                      textAlign: "center",
                      fontFamily: "DM Sans, sans-serif",
                    }}
                  >
                    <div style={{ fontSize: 28, marginBottom: 6 }}>🔍</div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 13,
                        color: "#6b7280",
                        fontWeight: 500,
                      }}
                    >
                      {query
                        ? `No results for "${query}"`
                        : `No ${roleObj?.label} users match filters`}
                    </p>
                    {locActiveCount > 0 && (
                      <button
                        onClick={() =>
                          setLocFilters({
                            state: "",
                            city: "",
                            locality: "",
                            pincode: "",
                          })
                        }
                        style={{
                          marginTop: 8,
                          background: "none",
                          border: `1px solid ${PRIMARY}`,
                          borderRadius: 6,
                          color: PRIMARY,
                          fontSize: 11,
                          fontWeight: 600,
                          padding: "4px 12px",
                          cursor: "pointer",
                          fontFamily: "DM Sans, sans-serif",
                        }}
                      >
                        Clear Location Filters
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Results count header */}
                    <div
                      style={{
                        padding: "7px 14px 6px",
                        borderBottom: "1px solid #f3f4f6",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontFamily: "DM Sans, sans-serif",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                        }}
                      >
                        <span
                          style={{
                            width: 14,
                            height: 14,
                            borderRadius: "50%",
                            background: PRIMARY,
                            color: "#fff",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 8,
                            fontWeight: 700,
                          }}
                        >
                          3
                        </span>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: "#9ca3af",
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                          }}
                        >
                          Select User
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          padding: "2px 7px",
                          borderRadius: 999,
                          background: PRIMARY_LIGHT,
                          color: PRIMARY,
                        }}
                      >
                        {filtered.length}{" "}
                        {filtered.length === 1 ? "user" : "users"}
                        {locActiveCount > 0 || query ? " (filtered)" : ""}
                      </span>
                    </div>

                    {/* Rows */}
                    {filtered.map((user, idx) => {
                      const rs = getRoleStyle(user.role);
                      return (
                        <div
                          key={user._id}
                          className="tc-item"
                          onClick={() => handleSelect(user)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: "10px 14px",
                            borderBottom:
                              idx < filtered.length - 1
                                ? "1px solid #f9fafb"
                                : "none",
                            fontFamily: "DM Sans, sans-serif",
                            background: "#fff",
                          }}
                        >
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: "50%",
                              flexShrink: 0,
                              background: rs.background,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: rs.color,
                              fontSize: 14,
                              fontWeight: 700,
                            }}
                          >
                            {user.name?.charAt(0).toUpperCase()}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p
                              className="tc-item-name"
                              style={{
                                margin: 0,
                                fontSize: 13,
                                fontWeight: 600,
                                color: "#111827",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                transition: "color 0.13s",
                              }}
                            >
                              {user.name}
                            </p>
                            <p
                              style={{
                                margin: 0,
                                fontSize: 11,
                                color: "#9ca3af",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {user.email}
                            </p>
                            {(user.city ||
                              user.locality ||
                              user.state ||
                              user.pincode) && (
                              <p
                                style={{
                                  margin: "2px 0 0",
                                  fontSize: 10,
                                  color: "#6b7280",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                📍{" "}
                                {[user.locality, user.city, user.state]
                                  .filter(Boolean)
                                  .join(", ")}
                                {user.pincode ? ` – ${user.pincode}` : ""}
                              </p>
                            )}
                          </div>
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 600,
                              padding: "3px 8px",
                              borderRadius: 999,
                              background: rs.background,
                              color: rs.color,
                              whiteSpace: "nowrap",
                              flexShrink: 0,
                            }}
                          >
                            {user.role?.replace(/_/g, " ")}
                          </span>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Target Role Selector ───────────────────────────────────── */
function TargetRoleSelector({ value, onChange }) {
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {ROLES.map((r) => {
          const isActive = value === r.value;
          return (
            <button
              key={r.value}
              type="button"
              className={`tc-role-chip${isActive ? " active" : ""}`}
              style={{
                background: isActive ? PRIMARY_LIGHT : r.bg,
                color: isActive ? PRIMARY_DARK : r.color,
              }}
              onClick={() => onChange(r.value)}
            >
              {r.icon} {r.label}
            </button>
          );
        })}
      </div>
      {!value && (
        <p
          style={{
            margin: "8px 0 0",
            fontSize: 11,
            color: "#f59e0b",
            fontFamily: "DM Sans, sans-serif",
            fontWeight: 500,
          }}
        >
          ⚠ Please select a target role
        </p>
      )}
    </div>
  );
}

/* ─── Main Modal ─────────────────────────────────────────────── */
export default function TransferCredentials({ onClose }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [targetRole, setTargetRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successData, setSuccessData] = useState(null);

  const canSubmit = selectedUser && targetRole && !loading;

  const handleTransfer = async () => {
    if (!canSubmit) return;
    setLoading(true);
    try {
      await transferCredentials(selectedUser._id, { roleName: targetRole });
      setSuccessData({ user: selectedUser, newRole: targetRole });
      setSuccess(true);
      setTimeout(() => onClose?.(), 2600);
    } catch (err) {
      toast.error(err?.message || "Transfer failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const newRoleLabel =
    ROLES.find((r) => r.value === targetRole)?.label || targetRole;
  const newRoleStyle = getRoleStyle(targetRole);
  const newRoleIcon = ROLES.find((r) => r.value === targetRole)?.icon || "";

  return (
    <>
      <style>{styles}</style>

      {/* Overlay */}
      <div
        className="tc-overlay-anim"
        style={{
          position: "fixed",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          padding: 16,
          background: "rgba(220,240,228,0.55)",
          backdropFilter: "blur(0px)",
          WebkitBackdropFilter: "blur(0px)",
        }}
        onClick={(e) => e.target === e.currentTarget && onClose?.()}
      >
        {/* Card */}
        <div
          className="tc-card-anim tc-scroll tc-top-line"
          style={{
            position: "relative",
            width: "100%",
            maxWidth: 480,
            maxHeight: "calc(100vh - 32px)",
            overflowY: "auto",
            overflowX: "hidden",
            borderRadius: 22,
            padding: "28px 26px 26px",
            background: "#ffffff",
            border: "1px solid rgba(39,174,96,0.18)",
            boxShadow:
              "0 8px 48px rgba(39,174,96,0.10), 0 2px 16px rgba(0,0,0,0.06)",
            fontFamily: "DM Sans, sans-serif",
          }}
        >
          {/* Glow */}
          <div
            style={{
              pointerEvents: "none",
              position: "absolute",
              top: -70,
              right: -50,
              width: 200,
              height: 200,
              background:
                "radial-gradient(circle, rgba(39,174,96,0.10) 0%, transparent 70%)",
            }}
          />

          {/* Close */}
          <button
            style={{
              position: "sticky",
              top: 0,
              float: "right",
              width: 30,
              height: 30,
              marginBottom: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 8,
              fontSize: 12,
              cursor: "pointer",
              background: "#f3f4f6",
              border: "1px solid #e5e7eb",
              color: "#9ca3af",
              transition: "all 0.18s",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#fee2e2";
              e.currentTarget.style.borderColor = "#fca5a5";
              e.currentTarget.style.color = "#ef4444";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#f3f4f6";
              e.currentTarget.style.borderColor = "#e5e7eb";
              e.currentTarget.style.color = "#9ca3af";
            }}
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>

          {/* ── Success ── */}
          {success && successData ? (
            <div
              className="tc-success-anim"
              style={{ textAlign: "center", paddingTop: 18, paddingBottom: 6 }}
            >
              <div
                className="tc-pop-anim"
                style={{
                  width: 78,
                  height: 78,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 18px",
                  fontSize: 32,
                  color: "#fff",
                  background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_DARK})`,
                  boxShadow: `0 0 0 6px ${PRIMARY_MID}, 0 0 40px rgba(39,174,96,0.25)`,
                }}
              >
                ✓
              </div>

              <div
                style={{
                  fontFamily: "Syne, sans-serif",
                  fontSize: 20,
                  fontWeight: 800,
                  marginBottom: 8,
                  color: "#111827",
                }}
              >
                Credentials Transferred!
              </div>

              <div style={{ fontSize: 13, lineHeight: 1.9, color: "#6b7280" }}>
                <span style={{ fontWeight: 600, color: "#374151" }}>
                  {successData.user.name}
                </span>{" "}
                has been transferred to{" "}
                <span
                  style={{
                    fontWeight: 700,
                    padding: "2px 10px",
                    borderRadius: 999,
                    background: newRoleStyle.background,
                    color: newRoleStyle.color,
                  }}
                >
                  {newRoleIcon} {newRoleLabel}
                </span>
              </div>

              {(successData.user.city || successData.user.state) && (
                <div style={{ marginTop: 8, fontSize: 11, color: "#9ca3af" }}>
                  📍{" "}
                  {[
                    successData.user.locality,
                    successData.user.city,
                    successData.user.state,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                  {successData.user.pincode
                    ? ` – ${successData.user.pincode}`
                    : ""}
                </div>
              )}

              <div
                style={{
                  height: 2,
                  borderRadius: 999,
                  overflow: "hidden",
                  marginTop: 24,
                  background: "#e5e7eb",
                }}
              >
                <div
                  className="tc-fill-anim"
                  style={{
                    height: "100%",
                    background: `linear-gradient(90deg, ${PRIMARY}, #2ecc71)`,
                  }}
                />
              </div>
            </div>
          ) : (
            <>
              {/* Eyebrow */}
              <div
                style={{
                  fontFamily: "Syne, sans-serif",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  marginBottom: 5,
                  color: PRIMARY,
                }}
              >
                User Management
              </div>

              {/* Title */}
              <div
                style={{
                  fontFamily: "Poppins, sans-serif",
                  fontSize: 20,
                  fontWeight: 600,
                  marginBottom: 4,
                  lineHeight: 1.3,
                  color: "#111827",
                }}
              >
                Transfer Credentials
              </div>

              <p
                style={{
                  margin: "0 0 16px",
                  fontSize: 12,
                  color: "#9ca3af",
                  fontFamily: "DM Sans, sans-serif",
                  lineHeight: 1.6,
                }}
              >
                Pick a role → filter by location → select a user → assign new
                role.
              </p>

              {/* Step tracker */}
              {/* <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  flexWrap: "wrap",
                  marginBottom: 16,
                  padding: "10px 12px",
                  background: "#f9fafb",
                  borderRadius: 10,
                  border: "1px solid #f0f0f0",
                }}
              >
                <StepRow
                  step="1"
                  label="Role"
                  done={!!selectedUser}
                  active={!selectedUser}
                />
                <div
                  style={{
                    width: 18,
                    height: 1,
                    background: "#e5e7eb",
                    flexShrink: 0,
                  }}
                />
                <StepRow
                  step="2"
                  label="Location"
                  done={!!selectedUser}
                  active={!selectedUser}
                />
                <div
                  style={{
                    width: 18,
                    height: 1,
                    background: "#e5e7eb",
                    flexShrink: 0,
                  }}
                />
                <StepRow
                  step="3"
                  label="User"
                  done={!!selectedUser}
                  active={!selectedUser}
                />
                <div
                  style={{
                    width: 18,
                    height: 1,
                    background: "#e5e7eb",
                    flexShrink: 0,
                  }}
                />
                <StepRow
                  step="4"
                  label="New Role"
                  done={false}
                  active={!!selectedUser}
                />
              </div> */}

              {/* Divider */}
              <div
                style={{ height: 1, background: "#f3f4f6", margin: "0 0 14px" }}
              />

              {/* Search label */}
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 7,
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "#9ca3af",
                  fontFamily: "DM Sans, sans-serif",
                }}
              >
                <span
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    background: PRIMARY,
                    color: "#fff",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 9,
                    fontWeight: 700,
                  }}
                >
                  ↓
                </span>
                Step 1–3: Find Source User
              </label>

              {/* ★ Single search field ★ */}
              <SingleSearchField
                value={selectedUser}
                onChange={setSelectedUser}
              />

              {/* Divider */}
              <div
                style={{
                  height: 1,
                  background: "#f3f4f6",
                  margin: "18px 0 14px",
                }}
              />

              {/* Step 4 label */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 10,
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: selectedUser ? "#9ca3af" : "#d1d5db",
                  fontFamily: "DM Sans, sans-serif",
                }}
              >
                <span
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    background: selectedUser ? PRIMARY : "#e5e7eb",
                    color: selectedUser ? "#fff" : "#9ca3af",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 9,
                    fontWeight: 700,
                  }}
                >
                  4
                </span>
                Assign New Role
              </div>

              <div
                style={{
                  opacity: selectedUser ? 1 : 0.4,
                  transition: "opacity 0.2s",
                  pointerEvents: selectedUser ? "auto" : "none",
                }}
              >
                <TargetRoleSelector
                  value={targetRole}
                  onChange={setTargetRole}
                />
              </div>

              {/* Preview card */}
              {selectedUser && targetRole && (
                <div
                  style={{
                    marginTop: 12,
                    padding: "12px 14px",
                    background: PRIMARY_LIGHT,
                    border: `1px solid rgba(39,174,96,0.22)`,
                    borderRadius: 12,
                    fontFamily: "DM Sans, sans-serif",
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 10px",
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: PRIMARY,
                    }}
                  >
                    Transfer Preview
                  </p>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <div
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "8px 10px",
                        background: "#fff",
                        borderRadius: 10,
                        border: "1px solid rgba(39,174,96,0.15)",
                        minWidth: 0,
                      }}
                    >
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          flexShrink: 0,
                          background: getRoleStyle(selectedUser.role)
                            .background,
                          color: getRoleStyle(selectedUser.role).color,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        {selectedUser.name?.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p
                          style={{
                            margin: 0,
                            fontSize: 12,
                            fontWeight: 600,
                            color: "#111827",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {selectedUser.name}
                        </p>
                        <span
                          style={{
                            fontSize: 9,
                            fontWeight: 600,
                            padding: "2px 6px",
                            borderRadius: 999,
                            background: getRoleStyle(selectedUser.role)
                              .background,
                            color: getRoleStyle(selectedUser.role).color,
                          }}
                        >
                          {getRoleIcon(selectedUser.role)}{" "}
                          {selectedUser.role?.replace(/_/g, " ")}
                        </span>
                        {selectedUser.city && (
                          <p
                            style={{
                              margin: "2px 0 0",
                              fontSize: 9,
                              color: "#6b7280",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            📍{" "}
                            {[selectedUser.locality, selectedUser.city]
                              .filter(Boolean)
                              .join(", ")}
                          </p>
                        )}
                      </div>
                    </div>

                    <span
                      style={{
                        color: PRIMARY,
                        fontSize: 20,
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      →
                    </span>

                    <div
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "8px 10px",
                        background: newRoleStyle.background,
                        borderRadius: 10,
                        border: `1px solid ${newRoleStyle.color}30`,
                        minWidth: 0,
                      }}
                    >
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 18, marginBottom: 2 }}>
                          {newRoleIcon}
                        </div>
                        <p
                          style={{
                            margin: 0,
                            fontSize: 12,
                            fontWeight: 700,
                            color: newRoleStyle.color,
                          }}
                        >
                          {newRoleLabel}
                        </p>
                        <p
                          style={{ margin: 0, fontSize: 10, color: "#9ca3af" }}
                        >
                          New Role
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Transfer button */}
              <button
                style={{
                  width: "100%",
                  marginTop: 18,
                  padding: "13px 0",
                  borderRadius: 12,
                  border: "none",
                  color: "#fff",
                  fontFamily: "DM Sans, sans-serif",
                  fontSize: 14,
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  cursor: !canSubmit ? "not-allowed" : "pointer",
                  opacity: !canSubmit ? 0.35 : 1,
                  background: `linear-gradient(135deg, ${PRIMARY}, ${PRIMARY_DARK})`,
                  boxShadow: "0 4px 20px rgba(39,174,96,0.28)",
                  transition: "all 0.18s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
                onMouseEnter={(e) => {
                  if (canSubmit) {
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow =
                      "0 6px 28px rgba(39,174,96,0.38)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 20px rgba(39,174,96,0.28)";
                }}
                onMouseDown={(e) => {
                  if (canSubmit)
                    e.currentTarget.style.transform = "scale(0.99)";
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onClick={handleTransfer}
                disabled={!canSubmit}
              >
                {loading ? (
                  <div
                    className="tc-spin-anim"
                    style={{
                      width: 15,
                      height: 15,
                      borderRadius: "50%",
                      border: "2px solid rgba(255,255,255,0.25)",
                      borderTopColor: "white",
                    }}
                  />
                ) : (
                  <>Transfer Credentials →</>
                )}
              </button>

              {/* Cancel */}
              <button
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: 13,
                  cursor: "pointer",
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  marginTop: 12,
                  color: "#9ca3af",
                  fontFamily: "DM Sans, sans-serif",
                  transition: "all 0.18s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#374151")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#9ca3af")}
                onClick={onClose}
              >
                ← Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
