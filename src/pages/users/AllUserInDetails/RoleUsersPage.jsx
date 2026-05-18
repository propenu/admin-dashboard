// src/pages/users/AllUserInDetails/RoleUsersPage.jsx
// ── Universal page for ALL roles ──
// URL: /dashboard/users/role/:role  e.g. /dashboard/users/role/sales_manager

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  Hash,
  X,
  ChevronDown,
  Building2,
  CheckCircle,
  Clock,
  XCircle,
  ArrowLeft,
  Mail,
  Phone,
  Shield,
  Eye,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import {
  getUserSearch,
  editAgentVerificationStatus,
} from "../../../features/user/userService";
import { ROLE_META, resolveStep, WORKFLOW_STEPS, fmtDate } from "./roleConfig";
import WorkflowPanel from "./WorkflowPanel";

// ─── Avatar shades ────────────────────────────────────────────────────────────
const SHADES = [
  { bg: "#e8f8ef", text: "#27AE60" },
  { bg: "#d4f1e1", text: "#1e9e54" },
  { bg: "#edfaf3", text: "#2ecc71" },
  { bg: "#dcf5e8", text: "#219653" },
  { bg: "#c9eedb", text: "#27AE60" },
];

const getInitials = (name = "") =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

// ─── Mini progress bar ────────────────────────────────────────────────────────
const MiniProgress = ({ role, user, color }) => {
  const steps = WORKFLOW_STEPS[role] || [];
  const done = steps.filter((s) => resolveStep(s.key, user) === "done").length;
  const pct = steps.length ? Math.round((done / steps.length) * 100) : 0;
  return (
    <div className="flex items-center gap-2 mt-1.5">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: pct === 100 ? "#27AE60" : color,
          }}
        />
      </div>
      <span
        className="text-[9px] font-700 shrink-0"
        style={{ color: pct === 100 ? "#27AE60" : color }}
      >
        {pct}%
      </span>
    </div>
  );
};

// ─── User list card (sidebar row) ─────────────────────────────────────────────
const UserRow = ({ user, isActive, onClick, role, color, idx }) => {
  const shade = SHADES[idx % SHADES.length];
  const hasPhoto = user.agentDetails?.avatar?.url;

  return (
    <button
      onClick={onClick}
      className="w-full text-left px-4 py-3.5 flex items-center gap-3 border-b border-gray-50 transition-all duration-150 group relative"
      style={
        isActive
          ? { background: color + "08", borderRight: `3px solid ${color}` }
          : {}
      }
    >
      {/* Avatar */}
      <div
        className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 border-2"
        style={{ borderColor: isActive ? color + "40" : "transparent" }}
      >
        {hasPhoto ? (
          <img
            src={user.agentDetails.avatar.url}
            alt={user.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-sm font-800 transition-all"
            style={{
              background: isActive ? color : shade.bg,
              color: isActive ? "#fff" : shade.text,
            }}
          >
            {getInitials(user.name)}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p
          className="text-[13px] font-600 truncate transition-colors"
          style={{ color: isActive ? color : "#1f2937" }}
        >
          {user.name}
        </p>
        <p className="text-[10px] text-gray-400 truncate">
          {user.city ? `${user.city}, ${user.state || ""}` : user.email || "—"}
        </p>
        <MiniProgress role={role} user={user} color={color} />
      </div>
    </button>
  );
};

// ─── Filter bar ───────────────────────────────────────────────────────────────
const FilterBar = ({ users, filters, setFilters, color, role }) => {
  const states = useMemo(
    () => [...new Set(users.map((u) => u.state).filter(Boolean))].sort(),
    [users],
  );
  const cities = useMemo(() => {
    const base = users.filter(
      (u) => !filters.state || u.state === filters.state,
    );
    return [...new Set(base.map((u) => u.city).filter(Boolean))].sort();
  }, [users, filters.state]);
  const localities = useMemo(() => {
    const base = users.filter(
      (u) =>
        (!filters.state || u.state === filters.state) &&
        (!filters.city || u.city === filters.city),
    );
    return [...new Set(base.map((u) => u.locality).filter(Boolean))].sort();
  }, [users, filters.state, filters.city]);

  const activeCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="bg-white border-b border-gray-100 px-4 py-3 space-y-2.5">
      {/* Search */}
      <div className="relative">
        <Search
          size={13}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          placeholder="Search name, email, phone…"
          value={filters.search}
          onChange={(e) =>
            setFilters((p) => ({ ...p, search: e.target.value }))
          }
          className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border-2 border-gray-200 focus:outline-none transition-colors"
          style={{ "--tw-border-opacity": 1 }}
          onFocus={(e) => (e.target.style.borderColor = color)}
          onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
        />
      </div>

      {/* Location filters */}
      <div className="grid grid-cols-2 gap-1.5">
        <Sel
          icon={<MapPin size={10} />}
          placeholder="State"
          value={filters.state}
          onChange={(v) =>
            setFilters((p) => ({ ...p, state: v, city: "", locality: "" }))
          }
          options={states.map((s) => ({ value: s, label: s }))}
          color={color}
        />
        <Sel
          icon={<Building2 size={10} />}
          placeholder="City"
          value={filters.city}
          onChange={(v) => setFilters((p) => ({ ...p, city: v, locality: "" }))}
          options={cities.map((c) => ({ value: c, label: c }))}
          color={color}
          disabled={!filters.state}
        />
        <Sel
          icon={<MapPin size={10} />}
          placeholder="Locality"
          value={filters.locality}
          onChange={(v) => setFilters((p) => ({ ...p, locality: v }))}
          options={localities.map((l) => ({ value: l, label: l }))}
          color={color}
          disabled={!filters.city}
        />
        <div className="relative">
          <Hash
            size={10}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Pincode"
            value={filters.pincode}
            onChange={(e) =>
              setFilters((p) => ({ ...p, pincode: e.target.value }))
            }
            className="w-full pl-7 pr-2 py-2 text-[11px] border-2 border-gray-200 rounded-xl focus:outline-none"
            onFocus={(e) => (e.target.style.borderColor = color)}
            onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
          />
        </div>
      </div>

      {/* Agent status filter */}
      {role === "agent" && (
        <div className="flex gap-1.5">
          {["approved", "pending", "rejected"].map((s) => (
            <button
              key={s}
              onClick={() =>
                setFilters((p) => ({ ...p, status: p.status === s ? "" : s }))
              }
              className="flex-1 py-1.5 rounded-lg text-[9px] font-700 uppercase tracking-wide border-2 transition-all"
              style={
                filters.status === s
                  ? { background: color + "18", borderColor: color, color }
                  : {
                      background: "#fff",
                      borderColor: "#e5e7eb",
                      color: "#94a3b8",
                    }
              }
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Clear */}
      {activeCount > 0 && (
        <button
          onClick={() =>
            setFilters({
              search: "",
              state: "",
              city: "",
              locality: "",
              pincode: "",
              status: "",
            })
          }
          className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-[10px] font-700 text-red-400 bg-red-50 border border-red-100 hover:bg-red-100 transition-all"
        >
          <X size={10} /> Clear filters ({activeCount})
        </button>
      )}
    </div>
  );
};

// tiny select
const Sel = ({
  icon,
  placeholder,
  value,
  onChange,
  options,
  color,
  disabled,
}) => (
  <div className="relative">
    <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
      {icon}
    </div>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="w-full pl-7 pr-5 py-2 text-[11px] rounded-xl border-2 appearance-none focus:outline-none transition-colors bg-white"
      style={{
        borderColor: value ? color + "60" : "#e5e7eb",
        color: value ? color : "#6b7280",
        fontWeight: value ? "700" : "500",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
    <ChevronDown
      size={9}
      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
    />
  </div>
);

// ─── Verification modal (for agents) ──────────────────────────────────────────
const VerifyModal = ({ agent, color, onClose, onSave }) => {
  const [status, setStatus] = useState(
    agent?.verificationStatus?.toLowerCase() === "approved"
      ? "approved"
      : "approved",
  );
  const [saving, setSaving] = useState(false);
  const handleSave = async () => {
    setSaving(true);
    try {
      await editAgentVerificationStatus(agent.agentId, { status });
      onSave(agent.agentId, status);
      toast.success("Verification updated");
      onClose();
    } catch {
      toast.error("Failed to update");
    } finally {
      setSaving(false);
    }
  };
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
        style={{ animation: "modalIn 0.2s ease both" }}
      >
        <div
          className="h-1 w-full"
          style={{ background: `linear-gradient(90deg,${color},${color}88)` }}
        />
        <div className="px-5 pt-5 pb-4 flex items-center justify-between">
          <div>
            <p className="text-[9px] text-gray-400 uppercase tracking-widest font-700 mb-0.5">
              Edit Verification
            </p>
            <h3 className="text-[15px] font-800 text-gray-800">
              {agent?.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-gray-100 text-gray-400 flex items-center justify-center hover:bg-gray-200"
          >
            <X size={13} />
          </button>
        </div>
        <div className="px-5 pb-3 space-y-2">
          {[
            {
              v: "approved",
              l: "Approve",
              ic: CheckCircle,
              c: "#27AE60",
              bg: "#dcfce7",
            },
            {
              v: "rejected",
              l: "Reject",
              ic: XCircle,
              c: "#ef4444",
              bg: "#fee2e2",
            },
          ].map(({ v, l, ic: I, c, bg }) => (
            <button
              key={v}
              onClick={() => setStatus(v)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all"
              style={
                status === v
                  ? { background: bg, borderColor: c + "60", color: c }
                  : {
                      background: "#f9fafb",
                      borderColor: "transparent",
                      color: "#6b7280",
                    }
              }
            >
              <I size={16} color={status === v ? c : "#9ca3af"} />
              <span className="text-sm font-700">{l}</span>
              {status === v && (
                <span
                  className="ml-auto w-2 h-2 rounded-full"
                  style={{ background: c }}
                />
              )}
            </button>
          ))}
        </div>
        <div className="flex gap-2 px-5 pb-5">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-500 text-sm font-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl text-sm font-700 text-white disabled:opacity-60"
            style={{ background: color }}
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
        <style>{`@keyframes modalIn{from{opacity:0;transform:scale(.94)}to{opacity:1;transform:scale(1)}}`}</style>
      </div>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════════
const RoleUsersPage = () => {
  const { role } = useParams();
  const navigate = useNavigate();
  const meta = ROLE_META[role] || ROLE_META.user;
  const RoleIcon = meta.icon;

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelected] = useState(null);
  const [editingAgent, setEditing] = useState(null);
  const [mobilePanelOpen, setMobile] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    state: "",
    city: "",
    locality: "",
    pincode: "",
    status: "",
  });

  // fetch
  const fetchUsers = useCallback(() => {
    setLoading(true);
    getUserSearch(meta.query)
      .then((res) => {
        const list = res?.data?.results || res?.data?.data || [];
        setUsers(list);
        if (list.length > 0) setSelected(list[0]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [meta.query]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // filter
  const filtered = useMemo(() => {
    const q = filters.search.toLowerCase();
    return users.filter((u) => {
      if (
        q &&
        !`${u.name} ${u.email || ""} ${u.phone || ""}`.toLowerCase().includes(q)
      )
        return false;
      if (filters.state && u.state !== filters.state) return false;
      if (filters.city && u.city !== filters.city) return false;
      if (filters.locality && u.locality !== filters.locality) return false;
      if (filters.pincode && !(u.pincode || "").includes(filters.pincode))
        return false;
      if (
        filters.status &&
        (u.verificationStatus || "").toLowerCase() !== filters.status
      )
        return false;
      return true;
    });
  }, [users, filters]);

  const handleStatusSaved = (agentId, newStatus) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.agentId === agentId ? { ...u, verificationStatus: newStatus } : u,
      ),
    );
    if (selectedUser?.agentId === agentId)
      setSelected((p) => ({ ...p, verificationStatus: newStatus }));
  };

  const handleSelect = (u) => {
    setSelected(u);
    setMobile(true);
  };

  return (
    <div
      className="flex h-screen overflow-hidden bg-gray-50"
      style={{ fontFamily: "'Outfit', system-ui, sans-serif" }}
    >
      <style>{`
        @keyframes cardIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes dotBounce{0%,80%,100%{transform:scale(.55);opacity:.35}40%{transform:scale(1);opacity:1}}
      `}</style>

      {editingAgent && (
        <VerifyModal
          agent={editingAgent}
          color={meta.color}
          onClose={() => setEditing(null)}
          onSave={handleStatusSaved}
        />
      )}

      {/* ═══ LEFT SIDEBAR ═══ */}
      <aside className="w-[280px] flex-shrink-0 bg-white border-r border-gray-100 flex flex-col h-full hidden md:flex">
        {/* Header */}
        <div className="px-4 py-4 border-b border-gray-100 flex-shrink-0">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 text-xs font-600 mb-3 transition-colors"
          >
            <ArrowLeft size={13} /> Back
          </button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: meta.bg }}
              >
                <RoleIcon size={18} color={meta.color} strokeWidth={2} />
              </div>
              <div>
                <h1 className="text-sm font-800 text-gray-900">{meta.label}</h1>
                <p className="text-[10px] text-gray-400">
                  {loading
                    ? "Loading…"
                    : `${filtered.length} of ${users.length} users`}
                </p>
              </div>
            </div>
            {!loading && (
              <span
                className="text-2xl font-900 leading-none"
                style={{ color: meta.color }}
              >
                {users.length.toString().padStart(2, "0")}
              </span>
            )}
          </div>
        </div>

        {/* Filter bar */}
        <FilterBar
          users={users}
          filters={filters}
          setFilters={setFilters}
          color={meta.color}
          role={role}
        />

        {/* User list */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-3/4 bg-gray-100 rounded" />
                    <div className="h-2 w-1/2 bg-gray-100 rounded" />
                    <div className="h-1.5 w-full bg-gray-100 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center px-4">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: meta.bg }}
              >
                <Search size={18} color={meta.color} />
              </div>
              <p className="text-xs font-600 text-gray-400">
                No users match your filters
              </p>
              <button
                onClick={() =>
                  setFilters({
                    search: "",
                    state: "",
                    city: "",
                    locality: "",
                    pincode: "",
                    status: "",
                  })
                }
                className="text-[10px] font-700 px-3 py-1.5 rounded-lg text-white mt-1"
                style={{ background: meta.color }}
              >
                Clear filters
              </button>
            </div>
          ) : (
            filtered.map((u, idx) => (
              <UserRow
                key={u._id}
                user={u}
                idx={idx}
                role={role}
                isActive={selectedUser?._id === u._id}
                color={meta.color}
                onClick={() => handleSelect(u)}
              />
            ))
          )}
        </div>

        {/* Loading dots */}
        {loading && (
          <div className="flex justify-center gap-2 py-3 flex-shrink-0">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-2 h-2 rounded-full"
                style={{
                  background: meta.color,
                  animation: `dotBounce 1.2s infinite ease-in-out`,
                  animationDelay: `${i * 0.18}s`,
                }}
              />
            ))}
          </div>
        )}
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center"
        >
          <ArrowLeft size={15} className="text-gray-600" />
        </button>
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: meta.bg }}
        >
          <RoleIcon size={14} color={meta.color} />
        </div>
        <span className="text-sm font-700 text-gray-800 flex-1">
          {meta.label}
        </span>
        {mobilePanelOpen && (
          <button
            onClick={() => setMobile(false)}
            className="text-xs font-700 px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-500"
          >
            ← List
          </button>
        )}
      </div>

      {/* ═══ RIGHT PANEL ═══ */}
      <main
        className={`flex-1 overflow-y-auto md:block ${mobilePanelOpen ? "block" : "hidden"} md:mt-0 mt-12`}
      >
        {/* Desktop: directly show workflow panel */}
        <div className="hidden md:block h-full overflow-y-auto">
          <WorkflowPanel
            user={selectedUser}
            role={role}
            color={meta.color}
            onEditStatus={role === "agent" ? setEditing : undefined}
          />
        </div>

        {/* Mobile: show workflow panel as overlay */}
        <div className="md:hidden h-full overflow-y-auto">
          <WorkflowPanel
            user={selectedUser}
            role={role}
            color={meta.color}
            onEditStatus={role === "agent" ? setEditing : undefined}
          />
        </div>
      </main>

      {/* Mobile: card grid (shown when panel is closed) */}
      <div
        className={`md:hidden flex-1 overflow-y-auto mt-12 ${mobilePanelOpen ? "hidden" : "block"}`}
      >
        {/* Filter bar mobile */}
        <div className="bg-white border-b border-gray-100 px-4 py-3">
          <div className="relative">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search…"
              value={filters.search}
              onChange={(e) =>
                setFilters((p) => ({ ...p, search: e.target.value }))
              }
              className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border-2 border-gray-200 focus:outline-none"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-2.5 h-2.5 rounded-full"
                  style={{
                    background: meta.color,
                    animation: `dotBounce 1.2s infinite ease-in-out`,
                    animationDelay: `${i * 0.18}s`,
                  }}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="p-4 grid grid-cols-1 gap-3">
            {filtered.map((u, idx) => {
              const shade = SHADES[idx % SHADES.length];
              const hasPhoto = u.agentDetails?.avatar?.url;
              return (
                <button
                  key={u._id}
                  onClick={() => handleSelect(u)}
                  className="bg-white rounded-2xl border border-gray-100 p-4 text-left shadow-sm hover:shadow-md transition-all"
                  style={{
                    animation: `cardIn 0.35s ease both`,
                    animationDelay: `${idx * 60}ms`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                      {hasPhoto ? (
                        <img
                          src={u.agentDetails.avatar.url}
                          className="w-full h-full object-cover"
                          alt={u.name}
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center text-base font-800"
                          style={{ background: shade.bg, color: shade.text }}
                        >
                          {getInitials(u.name)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-700 text-gray-900 truncate">
                        {u.name}
                      </p>
                      <p className="text-[10px] text-gray-400 truncate">
                        {u.email || u.phone || "—"}
                      </p>
                      {(u.city || u.state) && (
                        <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                          <MapPin size={9} />{" "}
                          {[u.city, u.state].filter(Boolean).join(", ")}
                        </p>
                      )}
                      <MiniProgress role={role} user={u} color={meta.color} />
                    </div>
                    <div className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center flex-shrink-0">
                      <Eye size={12} className="text-gray-400" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleUsersPage;
