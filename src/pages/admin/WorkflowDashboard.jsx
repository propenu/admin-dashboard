// src/pages/admin/WorkflowDashboard.jsx
// Entry point — shows role cards, click any to drill into that role's workflow

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Crown,
  Users,
  UserCheck,
  Briefcase,
  Home,
  Building2,
  TrendingUp,
  ArrowRight,
  Activity,
  Shield,
  ChevronRight,
  Megaphone,
  Handshake,
} from "lucide-react";
import { getAllUsers } from "../../features/user/userService";

// ─── Role config ───────────────────────────────────────────────────────────────
const ROLES = [
  {
    key: "super_admin",
    label: "Super Admin",
    icon: Crown,
    color: "#27AE60",
    bg: "#dcfce7",
    desc: "Full system access • All users • All data",
    metrics: ["Total Revenue", "All Users", "All Properties"],
  },
  {
    key: "admin",
    label: "Admin",
    icon: Shield,
    color: "#3b82f6",
    bg: "#dbeafe",
    desc: "Manage users, properties, payments",
    metrics: ["Users Managed", "Properties", "Payments"],
  },
  {
    key: "sales_manager",
    label: "Sales Manager",
    icon: TrendingUp,
    color: "#f59e0b",
    bg: "#fef3c7",
    desc: "Manages team of sales agents",
    metrics: ["Team Size", "Leads", "Conversions"],
  },
  {
    key: "sales_agent",
    label: "Sales Agent",
    icon: Briefcase,
    color: "#8b5cf6",
    bg: "#ede9fe",
    desc: "Individual sales & lead tracking",
    metrics: ["Leads", "Closed", "Pipeline"],
  },
  {
    key: "agent",
    label: "Agent",
    icon: UserCheck,
    color: "#06b6d4",
    bg: "#cffafe",
    desc: "Property listings & buyer connections",
    metrics: ["Properties Listed", "Active Plans", "Contacts"],
  },
  {
    key: "builder",
    label: "Builder",
    icon: Building2,
    color: "#f97316",
    bg: "#ffedd5",
    desc: "Project management & listings",
    metrics: ["Projects", "Featured", "Leads"],
  },
  {
    key: "user",
    label: "Buyer / Owner",
    icon: Home,
    color: "#ec4899",
    bg: "#fce7f3",
    desc: "Property search, purchase & subscriptions",
    metrics: ["Subscriptions", "Payments", "Properties"],
  },
  {
    key: "customer_care",
    label: "Customer Care",
    icon: Users,
    color: "#14b8a6",
    bg: "#ccfbf1",
    desc: "Support tickets & user assistance",
    metrics: ["Tickets", "Resolved", "Pending"],
  },
  {
    key: "digital_marketing",
    label: "Digital Marketing",
    icon: Megaphone,
    color: "#27AE60",
    bg: "#dcfce7",
    desc: "Campaigns, promotions, content and lead reach",
    metrics: ["Campaigns", "Leads", "Engagement"],
    path: "/digital-marketing",
  },
  {
    key: "relationship_manager",
    label: "Relationship Manager",
    icon: Handshake,
    color: "#27AE60",
    bg: "#dcfce7",
    desc: "Client relationships, property follow-ups and tickets",
    metrics: ["Clients", "Properties", "Tickets"],
    path: "/relationship-managers",
  },
  {
    key: "regional_manager",
    label: "Regional Manager",
    icon: Users,
    color: "#27AE60",
    bg: "#dcfce7",
    desc: "Regional operations, property follow-ups and tickets",
    metrics: ["Regions", "Properties", "Tickets"],
    path: "/regional-managers",
  },
];

// ─── Stat chip ─────────────────────────────────────────────────────────────────
const Stat = ({ label, value, color }) => (
  <div
    className="flex flex-col items-center px-3 py-2 rounded-xl"
    style={{ background: color + "12", border: `1px solid ${color}22` }}
  >
    <span className="text-lg font-black leading-none" style={{ color }}>
      {value ?? "—"}
    </span>
    <span
      className="text-[9px] font-700 uppercase tracking-wider mt-0.5"
      style={{ color: color + "99" }}
    >
      {label}
    </span>
  </div>
);

// ─── Role card ─────────────────────────────────────────────────────────────────
const RoleCard = ({ role, count, onClick }) => {
  const Icon = role.icon;
  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-2xl border border-gray-100 p-5 cursor-pointer
                 hover:border-transparent hover:shadow-xl transition-all duration-200
                 flex flex-col gap-4 relative overflow-hidden"
      style={{ "--hover-shadow": `0 16px 48px ${role.color}22` }}
    >
      {/* Top accent */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity"
        style={{
          background: `linear-gradient(90deg, ${role.color}, ${role.color}66)`,
        }}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: role.bg }}
        >
          <Icon size={20} color={role.color} strokeWidth={2} />
        </div>
        <div className="flex items-center gap-2">
          {count !== undefined && (
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-full"
              style={{ background: role.bg, color: role.color }}
            >
              {count} users
            </span>
          )}
          <ChevronRight
            size={16}
            className="text-gray-300 group-hover:text-gray-500 transition-colors"
          />
        </div>
      </div>

      {/* Title */}
      <div>
        <h3 className="text-base font-800 text-gray-900 leading-tight">
          {role.label}
        </h3>
        <p className="text-xs text-gray-400 mt-1 leading-relaxed">
          {role.desc}
        </p>
      </div>

      {/* Workflow steps preview */}
      <div className="flex items-center gap-1.5">
        {["Register", "Active", "Workflow"].map((step, i) => (
          <React.Fragment key={step}>
            <span
              className="text-[9px] font-700 px-2 py-0.5 rounded-full"
              style={{ background: role.color + "14", color: role.color }}
            >
              {step}
            </span>
            {i < 2 && (
              <ArrowRight size={8} className="text-gray-300 flex-shrink-0" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

// ─── Main ──────────────────────────────────────────────────────────────────────
const WorkflowDashboard = () => {
  const navigate = useNavigate();
  const [userCounts, setUserCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllUsers()
      .then((res) => {
        const users = res?.data?.data || res?.data || [];
        const counts = {};
        users.forEach((u) => {
          const r = u.roleName || "unknown";
          counts[r] = (counts[r] || 0) + 1;
        });
        setUserCounts(counts);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div
      className="min-h-screen bg-gray-50 p-6 md:p-8"
      style={{ fontFamily: "'Outfit', system-ui, sans-serif" }}
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[#27AE60] flex items-center justify-center shadow-lg shadow-[#27AE60]/30">
            <Activity size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              Workflow Tracker
            </h1>
            <p className="text-xs text-gray-400 font-500">
              Admin dashboard · All role workflows
            </p>
          </div>
        </div>

        {/* Quick stats bar */}
        <div className="flex gap-3 mt-4 flex-wrap">
          {[
            {
              label: "Total Users",
              value: Object.values(userCounts).reduce((a, b) => a + b, 0),
              color: "#27AE60",
            },
            { label: "Roles", value: ROLES.length, color: "#3b82f6" },
            {
              label: "Managers",
              value: userCounts["sales_manager"] || 0,
              color: "#f59e0b",
            },
            {
              label: "Agents",
              value:
                (userCounts["agent"] || 0) + (userCounts["sales_agent"] || 0),
              color: "#8b5cf6",
            },
          ].map((s) => (
            <Stat key={s.label} {...s} />
          ))}
        </div>
      </div>

      {/* Role grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {ROLES.map((role) => (
          <RoleCard
            key={role.key}
            role={role}
            count={loading ? undefined : userCounts[role.key] || 0}
            onClick={() => navigate(role.path || `/dashboard/users/role/${role.key}`)}
          />
        ))}
      </div>

      {/* Team Management quick link */}
      <div className="mt-6">
        <button
          onClick={() => navigate("/dashboard/team-management")}
          className="w-full bg-white border border-gray-100 rounded-2xl p-4 flex items-center justify-between
                     hover:border-[#27AE60]/30 hover:shadow-lg hover:shadow-[#27AE60]/10 transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-[#27AE60]/10 flex items-center justify-center">
              <Users size={20} className="text-[#27AE60]" />
            </div>
            <div className="text-left">
              <p className="text-sm font-700 text-gray-900">Team Management</p>
              <p className="text-xs text-gray-400">
                View manager → agent hierarchy & team workflows
              </p>
            </div>
          </div>
          <ChevronRight
            size={18}
            className="text-gray-300 group-hover:text-[#27AE60] transition-colors"
          />
        </button>
      </div>
    </div>
  );
};

export default WorkflowDashboard;
