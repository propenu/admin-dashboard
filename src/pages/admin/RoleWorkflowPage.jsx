// src/pages/admin/RoleWorkflowPage.jsx
// Shows all users of a role on left, clicking one shows full workflow detail on right

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  Users,
  Crown,
  Shield,
  TrendingUp,
  Briefcase,
  UserCheck,
  Building2,
  Home,
  ChevronRight,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  RefreshCw,
  MapPin,
  Phone,
  Mail,
  Star,
  CreditCard,
  Package,
  Activity,
} from "lucide-react";
import { getUserSearch, getAllUsers } from "../../features/user/userService";

// ─── Role meta ────────────────────────────────────────────────────────────────
const ROLE_META = {
  super_admin: {
    label: "Super Admin",
    color: "#27AE60",
    icon: Crown,
    bg: "#dcfce7",
  },
  admin: { label: "Admin", color: "#3b82f6", icon: Shield, bg: "#dbeafe" },
  sales_manager: {
    label: "Sales Manager",
    //color: "#f59e0b",
    color: "#27AE60",
    icon: TrendingUp,
    bg: "#fef3c7",
  },
  sales_agent: {
    label: "Sales Agent",
    //color: "#8b5cf6",
    color: "#27AE60",
    icon: Briefcase,
    bg: "#ede9fe",
  },
  agent: { label: "Agent", color: "#06b6d4", icon: UserCheck, bg: "#cffafe" },
  builder: {
    label: "Builder",
    //color: "#f97316",
    color: "#27AE60",
    icon: Building2,
    bg: "#ffedd5",
  },
  user: { label: "Buyer / Owner", color: "#ec4899", icon: Home, bg: "#fce7f3" },
  customer_care: {
    label: "Customer Care",
    //color: "#14b8a6",
    color: "#27AE60",
    icon: Users,
    bg: "#ccfbf1",
  },
  accounts: {
    label: "Accounts",
    //color: "#6366f1",
    color: "#27AE60",
    icon: CreditCard,
    bg: "#e0e7ff",
  },
};

// ─── Workflow steps per role ──────────────────────────────────────────────────
const WORKFLOW_STEPS = {
  super_admin: [
    { key: "registered", label: "Registered", icon: CheckCircle },
    { key: "kyc", label: "KYC Status", icon: Shield },
    { key: "team", label: "Team Overview", icon: Users },
    { key: "analytics", label: "Analytics", icon: Activity },
  ],
  admin: [
    { key: "registered", label: "Registered", icon: CheckCircle },
    { key: "kyc", label: "KYC Status", icon: Shield },
    { key: "users", label: "Users Managed", icon: Users },
    { key: "properties", label: "Properties", icon: Home },
  ],
  sales_manager: [
    { key: "registered", label: "Registered", icon: CheckCircle },
    { key: "kyc", label: "KYC Status", icon: Shield },
    { key: "team", label: "Team Members", icon: Users },
    { key: "performance", label: "Performance", icon: TrendingUp },
  ],
  sales_agent: [
    { key: "registered", label: "Registered", icon: CheckCircle },
    { key: "kyc", label: "KYC / Verify", icon: Shield },
    { key: "manager", label: "Manager Assign", icon: UserCheck },
    { key: "leads", label: "Lead Tracking", icon: TrendingUp },
  ],
  agent: [
    { key: "registered", label: "Registered", icon: CheckCircle },
    { key: "kyc", label: "KYC Verified", icon: Shield },
    { key: "plan", label: "Plan Active", icon: Package },
    { key: "listings", label: "Listings Live", icon: Home },
    { key: "payments", label: "Payments", icon: CreditCard },
  ],
  builder: [
    { key: "registered", label: "Registered", icon: CheckCircle },
    { key: "kyc", label: "KYC Verified", icon: Shield },
    { key: "projects", label: "Projects Added", icon: Building2 },
    { key: "featured", label: "Featured", icon: Star },
    { key: "payments", label: "Payments", icon: CreditCard },
  ],
  user: [
    { key: "registered", label: "Registered", icon: CheckCircle },
    { key: "kyc", label: "KYC", icon: Shield },
    { key: "plan", label: "Plan Purchased", icon: Package },
    { key: "property", label: "Property Search", icon: Home },
    { key: "payment", label: "Payment Done", icon: CreditCard },
  ],
  customer_care: [
    { key: "registered", label: "Registered", icon: CheckCircle },
    { key: "kyc", label: "KYC Status", icon: Shield },
    { key: "assigned", label: "Users Assigned", icon: Users },
    { key: "tickets", label: "Tickets Handled", icon: Activity },
  ],
};

// ─── Workflow step status resolver ─────────────────────────────────────────────
const resolveStepStatus = (stepKey, user) => {
  switch (stepKey) {
    case "registered":
      return user?.createdAt ? "done" : "pending";
    case "kyc":
      if (user?.kyc?.status === "verified") return "done";
      if (user?.kyc?.status === "not_started") return "pending";
      return "inprogress";
    case "plan":
    case "payment":
    case "payments":
      return user?.accountStatus === "active" ? "done" : "pending";
    case "manager":
      return user?.managerId ? "done" : "pending";
    default:
      return user?.accountStatus === "active" ? "done" : "inprogress";
  }
};

// ─── Status styles ─────────────────────────────────────────────────────────────
const STEP_STATUS = {
  done: {
    color: "#27AE60",
    bg: "#dcfce7",
    icon: CheckCircle,
    label: "Complete",
  },
  inprogress: {
    color: "#f59e0b",
    bg: "#fef3c7",
    icon: Clock,
    label: "In Progress",
  },
  pending: {
    color: "#94a3b8",
    bg: "#f1f5f9",
    icon: AlertCircle,
    label: "Pending",
  },
  failed: { color: "#ef4444", bg: "#fee2e2", icon: XCircle, label: "Failed" },
};

// ─── Workflow timeline ─────────────────────────────────────────────────────────
const WorkflowTimeline = ({ role, user }) => {
  const steps = WORKFLOW_STEPS[role] || WORKFLOW_STEPS.user;
  return (
    <div className="relative">
      {/* Connecting line */}
      <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-gray-100 z-0" />

      <div className="space-y-3 relative z-10">
        {steps.map((step, i) => {
          const status = resolveStepStatus(step.key, user);
          const cfg = STEP_STATUS[status];
          const StepIcon = step.icon;
          const StatusIcon = cfg.icon;

          return (
            <div key={step.key} className="flex items-start gap-4">
              {/* Circle */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border-2"
                style={{
                  background: cfg.bg,
                  borderColor: status === "done" ? cfg.color + "40" : "#e5e7eb",
                  boxShadow:
                    status === "done" ? `0 0 0 3px ${cfg.color}18` : "none",
                }}
              >
                <StepIcon size={16} color={cfg.color} strokeWidth={2.2} />
              </div>

              {/* Content */}
              <div className="flex-1 bg-white border border-gray-100 rounded-xl p-3 hover:border-gray-200 transition-colors">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-700 text-gray-800">
                    {step.label}
                  </span>
                  <span
                    className="inline-flex items-center gap-1 text-[10px] font-700 px-2 py-0.5 rounded-full"
                    style={{ background: cfg.bg, color: cfg.color }}
                  >
                    <StatusIcon size={9} />
                    {cfg.label}
                  </span>
                </div>

                {/* Step detail */}
                <div className="mt-1 text-xs text-gray-400 font-500">
                  {step.key === "registered" &&
                    user?.createdAt &&
                    `Joined ${new Date(user.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}`}
                  {step.key === "kyc" &&
                    `KYC: ${user?.kyc?.status?.replace(/_/g, " ") || "Not started"}`}
                  {step.key === "manager" &&
                    (user?.managerId
                      ? `Manager ID: ${user.managerId.slice(0, 12)}…`
                      : "No manager assigned yet")}
                  {(step.key === "plan" ||
                    step.key === "payment" ||
                    step.key === "payments") &&
                    `Account: ${user?.accountStatus?.replace(/_/g, " ") || "—"}`}
                  {![
                    "registered",
                    "kyc",
                    "manager",
                    "plan",
                    "payment",
                    "payments",
                  ].includes(step.key) &&
                    `Status: ${user?.accountStatus?.replace(/_/g, " ") || "—"}`}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── User info card ────────────────────────────────────────────────────────────
const UserInfoCard = ({ user, roleMeta }) => {
  const initials = (user.name || "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-4">
      <div
        className="h-1 w-full"
        style={{
          background: `linear-gradient(90deg, ${roleMeta.color}, ${roleMeta.color}66)`,
        }}
      />
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-black flex-shrink-0"
            style={{
              background: `linear-gradient(135deg, ${roleMeta.color}, ${roleMeta.color}cc)`,
              boxShadow: `0 4px 14px ${roleMeta.color}44`,
            }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-black text-gray-900 leading-tight">
              {user.name}
            </h2>
            <p className="text-xs text-gray-400 font-500 font-mono mt-0.5">
              {user.userCode || user._id?.slice(0, 16) + "…"}
            </p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span
                className="text-[10px] font-700 px-2.5 py-1 rounded-full"
                style={{ background: roleMeta.bg, color: roleMeta.color }}
              >
                {roleMeta.label}
              </span>
              <span
                className={`text-[10px] font-700 px-2.5 py-1 rounded-full ${user.accountStatus === "active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
              >
                {user.accountStatus?.replace(/_/g, " ") || "unknown"}
              </span>
              {user.phoneVerified && (
                <span className="text-[10px] font-700 px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">
                  ✓ Phone
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Contact info */}
        <div className="grid grid-cols-1 gap-2 mt-4">
          {user.email && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Mail size={12} className="text-gray-400 flex-shrink-0" />
              <span className="truncate">{user.email}</span>
            </div>
          )}
          {user.phone && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Phone size={12} className="text-gray-400 flex-shrink-0" />
              <span>{user.phone}</span>
            </div>
          )}
          {(user.city || user.state) && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <MapPin size={12} className="text-gray-400 flex-shrink-0" />
              <span>
                {[user.locality, user.city, user.state]
                  .filter(Boolean)
                  .join(", ")}
              </span>
            </div>
          )}
        </div>

        {/* KYC badge */}
        <div
          className="mt-3 flex items-center gap-2 p-2.5 rounded-xl"
          style={{
            background: user.kyc?.status === "verified" ? "#dcfce7" : "#f1f5f9",
          }}
        >
          <Shield
            size={12}
            color={user.kyc?.status === "verified" ? "#27AE60" : "#94a3b8"}
          />
          <span
            className="text-xs font-700"
            style={{
              color: user.kyc?.status === "verified" ? "#27AE60" : "#64748b",
            }}
          >
            KYC: {user.kyc?.status?.replace(/_/g, " ") || "Not started"}
          </span>
        </div>
      </div>
    </div>
  );
};

// ─── Progress summary bar ──────────────────────────────────────────────────────
const WorkflowProgress = ({ role, user }) => {
  const steps = WORKFLOW_STEPS[role] || WORKFLOW_STEPS.user;
  const done = steps.filter(
    (s) => resolveStepStatus(s.key, user) === "done",
  ).length;
  const pct = Math.round((done / steps.length) * 100);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-700 text-gray-600">
          Workflow Progress
        </span>
        <span
          className="text-sm font-black"
          style={{ color: pct === 100 ? "#27AE60" : "#f59e0b" }}
        >
          {pct}%
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background:
              pct === 100
                ? "linear-gradient(90deg, #27AE60, #34d399)"
                : "linear-gradient(90deg, #f59e0b, #fbbf24)",
          }}
        />
      </div>
      <p className="text-[10px] text-gray-400 mt-1.5 font-500">
        {done} of {steps.length} steps complete
      </p>
    </div>
  );
};

// ─── Main page ─────────────────────────────────────────────────────────────────
const RoleWorkflowPage = () => {
  const { role } = useParams();
  const navigate = useNavigate();
  const roleMeta = ROLE_META[role] || ROLE_META.user;
  const RoleIcon = roleMeta.icon;

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchUsers = useCallback(() => {
    setLoading(true);
    getAllUsers()
      .then((res) => {
        const all = res?.data?.data || res?.data || [];
        const filtered = all.filter((u) => u.roleName === role);
        setUsers(filtered);
        setFilteredUsers(filtered);
        if (filtered.length > 0) setSelectedUser(filtered[0]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [role]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    const q = search.toLowerCase();
    setFilteredUsers(
      users.filter(
        (u) =>
          u.name?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.phone?.includes(q),
      ),
    );
  }, [search, users]);

  const handleSelectUser = (u) => {
    setSelectedUser(u);
    setSidebarOpen(false);
  };

  return (
    <div
      className="flex h-screen overflow-hidden bg-gray-50"
      style={{ fontFamily: "'Outfit', system-ui, sans-serif" }}
    >
      {/* ── LEFT SIDEBAR ── */}
      <aside
        className={`
        fixed md:static z-30 inset-y-0 left-0 w-72 bg-white border-r border-gray-100
        flex flex-col shadow-xl shadow-gray-100/60 transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}
      >
        {/* Sidebar header */}
        <div className="p-4 border-b border-gray-100">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-gray-700 transition-colors mb-4 text-sm font-600"
          >
            <ArrowLeft size={15} /> Back
          </button>

          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: roleMeta.bg }}
            >
              <RoleIcon size={18} color={roleMeta.color} strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-sm font-800 text-gray-900">
                {roleMeta.label}
              </h2>
              <p className="text-[11px] text-gray-400">
                {filteredUsers.length} users
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative mt-3">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder={`Search ${roleMeta.label}s…`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-gray-200 bg-gray-50
                         focus:outline-none focus:border-[#27AE60]/50 focus:ring-2 focus:ring-[#27AE60]/10
                         text-gray-700 placeholder-gray-400 transition-all"
            />
          </div>
        </div>

        {/* User list */}
        <div className="flex-1 overflow-y-auto py-1">
          {loading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-3/4 bg-gray-100 rounded" />
                    <div className="h-2.5 w-1/2 bg-gray-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-gray-300">
              <Users size={32} />
              <p className="text-xs font-600">No users found</p>
            </div>
          ) : (
            filteredUsers.map((u) => {
              const isActive = selectedUser?._id === u._id;
              const steps = WORKFLOW_STEPS[role] || [];
              const done = steps.filter(
                (s) => resolveStepStatus(s.key, u) === "done",
              ).length;
              const pct =
                steps.length > 0 ? Math.round((done / steps.length) * 100) : 0;

              return (
                <button
                  key={u._id}
                  onClick={() => handleSelectUser(u)}
                  className={`w-full text-left px-4 py-3 flex items-center gap-3 border-b border-gray-50
                    transition-all duration-150 group relative
                    ${isActive ? "border-r-[3px]" : "hover:bg-gray-50"}
                  `}
                  style={
                    isActive
                      ? {
                          background: roleMeta.color + "08",
                          borderRightColor: roleMeta.color,
                        }
                      : {}
                  }
                >
                  {/* Avatar */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-800 flex-shrink-0 transition-all"
                    style={{
                      background: isActive ? roleMeta.color : "#f1f5f9",
                      color: isActive ? "#fff" : "#64748b",
                    }}
                  >
                    {(u.name || "?")[0].toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-600 truncate"
                      style={{ color: isActive ? roleMeta.color : "#1f2937" }}
                    >
                      {u.name}
                    </p>
                    {/* Mini progress bar */}
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${pct}%`,
                            background:
                              pct === 100 ? "#27AE60" : roleMeta.color,
                          }}
                        />
                      </div>
                      <span
                        className="text-[9px] font-700 flex-shrink-0"
                        style={{
                          color: pct === 100 ? "#27AE60" : roleMeta.color,
                        }}
                      >
                        {pct}%
                      </span>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-20 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── RIGHT CONTENT PANEL ── */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100 sticky top-0 z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: roleMeta.bg }}
          >
            <RoleIcon size={16} color={roleMeta.color} />
          </button>
          <span className="text-sm font-700 text-gray-700">
            {selectedUser ? selectedUser.name : `Select a ${roleMeta.label}`}
          </span>
        </div>

        <div className="p-5 md:p-6 max-w-2xl mx-auto">
          {/* Refresh */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <RoleIcon size={16} color={roleMeta.color} />
              <span className="text-sm font-700 text-gray-700">
                {selectedUser
                  ? `${selectedUser.name}'s Workflow`
                  : `${roleMeta.label} Workflow`}
              </span>
            </div>
            <button
              onClick={fetchUsers}
              className="flex items-center gap-1.5 text-xs font-600 text-gray-400 hover:text-gray-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-100"
            >
              <RefreshCw size={12} /> Refresh
            </button>
          </div>

          {!selectedUser && !loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: roleMeta.bg }}
              >
                <RoleIcon size={28} color={roleMeta.color} strokeWidth={1.5} />
              </div>
              <h3 className="text-base font-800 text-gray-700 mb-1">
                No user selected
              </h3>
              <p className="text-xs text-gray-400 max-w-xs">
                Select a {roleMeta.label.toLowerCase()} from the left panel to
                view their full workflow.
              </p>
              <button
                onClick={() => setSidebarOpen(true)}
                className="mt-5 md:hidden px-5 py-2.5 rounded-xl text-sm font-700 text-white"
                style={{ background: roleMeta.color }}
              >
                Browse {roleMeta.label}s
              </button>
            </div>
          ) : selectedUser ? (
            <div
              key={selectedUser._id}
              className="animate-[fadeUp_0.2s_ease_forwards]"
            >
              <UserInfoCard user={selectedUser} roleMeta={roleMeta} />
              {/* <WorkflowProgress role={role} user={selectedUser} /> */}
              {/* <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="text-sm font-800 text-gray-800 mb-4 flex items-center gap-2">
                  <Activity size={14} color={roleMeta.color} />
                  Workflow Steps
                </h3>
                <WorkflowTimeline role={role} user={selectedUser} />
              </div> */}

              {/* View full profile button */}
              <button
                onClick={() => navigate(`/dashboard/users/${selectedUser._id}`)}
                className="w-full mt-4 py-3 rounded-2xl text-sm font-700 text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
                style={{
                  background: `linear-gradient(135deg, ${roleMeta.color}, ${roleMeta.color}cc)`,
                }}
              >
                View Full Workflow & Details
                <ChevronRight size={16} />
              </button>
            </div>
          ) : null}
        </div>
      </main>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default RoleWorkflowPage;
