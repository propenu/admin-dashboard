// src/pages/users/AllUserInDetails/WorkflowPanel.jsx
import React from "react";
import {
  Mail,
  Phone,
  MapPin,
  Shield,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Activity,
  Building2,
  Star,
  Award,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { WORKFLOW_STEPS, resolveStep, fmtDate } from "./roleConfig";

// ─── Step status config ───────────────────────────────────────────────────────
const STATUS = {
  done: {
    color: "#27AE60",
    bg: "#dcfce7",
    border: "#bbf7d0",
    Icon: CheckCircle,
    label: "Complete",
  },
  inprogress: {
    color: "#f59e0b",
    bg: "#fef3c7",
    border: "#fde68a",
    Icon: Clock,
    label: "In Progress",
  },
  pending: {
    color: "#94a3b8",
    bg: "#f1f5f9",
    border: "#e2e8f0",
    Icon: AlertCircle,
    label: "Pending",
  },
  failed: {
    color: "#ef4444",
    bg: "#fee2e2",
    border: "#fecaca",
    Icon: XCircle,
    label: "Failed",
  },
};

// ─── Info row ─────────────────────────────────────────────────────────────────
const InfoRow = ({ Icon, label, value, color = "#27AE60" }) => {
  if (!value) return null;
  return (
    <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100">
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: color + "14", border: `1px solid ${color}28` }}
      >
        <Icon size={12} color={color} />
      </div>
      <div className="min-w-0">
        <p className="text-[9px] font-700 text-gray-400 uppercase tracking-wider">
          {label}
        </p>
        <p className="text-[11px] font-600 text-gray-700 truncate">{value}</p>
      </div>
    </div>
  );
};

// ─── Progress bar ─────────────────────────────────────────────────────────────
const ProgressBar = ({ role, user, color }) => {
  const steps = WORKFLOW_STEPS[role] || [];
  const done = steps.filter((s) => resolveStep(s.key, user) === "done").length;
  const pct = steps.length ? Math.round((done / steps.length) * 100) : 0;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-700 text-gray-600">
          Workflow Progress
        </span>
        <span
          className="text-sm font-900"
          style={{ color: pct === 100 ? "#27AE60" : color }}
        >
          {pct}%
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background:
              pct === 100
                ? "linear-gradient(90deg,#27AE60,#34d399)"
                : `linear-gradient(90deg,${color},${color}bb)`,
          }}
        />
      </div>
      <p className="text-[10px] text-gray-400 mt-1.5 font-500">
        {done} of {steps.length} steps complete
      </p>
    </div>
  );
};

// ─── Workflow timeline ─────────────────────────────────────────────────────────
const Timeline = ({ role, user }) => {
  const steps = WORKFLOW_STEPS[role] || [];
  return (
    <div className="relative">
      <div className="absolute left-4 top-4 bottom-4 w-px bg-gray-100" />
      <div className="space-y-2.5">
        {steps.map((step) => {
          const status = resolveStep(step.key, user);
          const cfg = STATUS[status];
          const { Icon } = cfg;
          return (
            <div key={step.key} className="flex items-start gap-3 relative">
              {/* Node */}
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 z-10"
                style={{
                  background: cfg.bg,
                  border: `1.5px solid ${cfg.border}`,
                }}
              >
                <Icon size={14} color={cfg.color} strokeWidth={2.2} />
              </div>
              {/* Content */}
              <div className="flex-1 bg-white border border-gray-100 rounded-xl p-3 hover:border-gray-200 transition-colors">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[12px] font-700 text-gray-800">
                    {step.label}
                  </span>
                  <span
                    className="text-[9px] font-700 px-2 py-0.5 rounded-full whitespace-nowrap"
                    style={{ background: cfg.bg, color: cfg.color }}
                  >
                    {cfg.label}
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5 font-500">
                  {step.desc(user)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Agent extra detail ───────────────────────────────────────────────────────
const AgentExtra = ({ user }) => {
  const d = user?.agentDetails;
  if (!d) return null;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-3 space-y-3">
      <p className="text-[10px] font-800 text-gray-400 uppercase tracking-widest">
        Agent Details
      </p>
      <div className="grid grid-cols-3 gap-2">
        {[
          {
            label: "Experience",
            value: d.experienceYears ? `${d.experienceYears}y` : "—",
            icon: "💼",
          },
          { label: "Deals", value: d.dealsClosed ?? "—", icon: "🤝" },
          {
            label: "Published",
            value: d.stats?.publishedCount ?? "—",
            icon: "🏠",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="text-center bg-gray-50 rounded-xl py-2.5 border border-gray-100"
          >
            <p className="text-base mb-0.5">{s.icon}</p>
            <p className="text-sm font-900 text-gray-800 leading-none">
              {s.value}
            </p>
            <p className="text-[9px] text-gray-400 font-700 uppercase tracking-wider mt-0.5">
              {s.label}
            </p>
          </div>
        ))}
      </div>
      {d.agencyName && (
        <div className="flex items-center gap-2 bg-[#f0fdf4] border border-[#27AE60]/20 rounded-xl px-3 py-2">
          <Building2 size={12} className="text-[#27AE60]" />
          <span className="text-[11px] font-700 text-[#27AE60]">
            {d.agencyName}
          </span>
        </div>
      )}
      {d.rera?.reraAgentId && (
        <div className="flex items-center justify-between bg-purple-50 border border-purple-100 rounded-xl px-3 py-2">
          <div className="flex items-center gap-2">
            <Award size={11} className="text-purple-500" />
            <span className="text-[10px] font-700 text-purple-600">
              RERA: {d.rera.reraAgentId}
            </span>
          </div>
          <span
            className={`text-[9px] font-700 px-2 py-0.5 rounded-full ${d.rera.isVerified ? "bg-green-100 text-green-600" : "bg-amber-100 text-amber-600"}`}
          >
            {d.rera.isVerified ? "✓ Verified" : "Unverified"}
          </span>
        </div>
      )}
      {d.languages?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {d.languages.map((l) => (
            <span
              key={l}
              className="px-2.5 py-1 rounded-full bg-[#f0fdf4] border border-[#27AE60]/15 text-[#27AE60] text-[9px] font-700 uppercase"
            >
              {l}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Main WorkflowPanel ───────────────────────────────────────────────────────
const WorkflowPanel = ({ user, role, color, onEditStatus }) => {
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 text-center px-6">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: color + "14", border: `1px solid ${color}28` }}
        >
          <Activity size={24} color={color} strokeWidth={1.5} />
        </div>
        <p className="text-sm font-700 text-gray-600 mb-1">No user selected</p>
        <p className="text-xs text-gray-400">
          Select a user from the list to view their workflow
        </p>
      </div>
    );
  }

  const initials = (user.name || "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className="p-5 space-y-3 animate-[fadeUp_0.2s_ease_forwards]"
      key={user._id}
    >
      {/* Profile card */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div
          className="h-1 w-full"
          style={{ background: `linear-gradient(90deg,${color},${color}66)` }}
        />
        <div className="p-4">
          <div className="flex items-start gap-3 mb-3">
            {/* Avatar — use agent photo if available */}
            <div
              className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0 border-2 border-white"
              style={{ boxShadow: `0 4px 14px ${color}44` }}
            >
              {user.agentDetails?.avatar?.url ? (
                <img
                  src={user.agentDetails.avatar.url}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-white text-lg font-900"
                  style={{
                    background: `linear-gradient(135deg,${color},${color}cc)`,
                  }}
                >
                  {initials}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-base font-900 text-gray-900 leading-tight truncate">
                {user.name}
              </h2>
              <p className="text-[10px] font-mono text-gray-400 mt-0.5 truncate">
                {user.userCode || user._id?.slice(0, 16) + "…"}
              </p>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                <span
                  className="text-[9px] font-700 px-2 py-0.5 rounded-full"
                  style={{ background: color + "18", color }}
                >
                  {user.role?.toUpperCase() ||
                    role?.replace(/_/g, " ").toUpperCase()}
                </span>
                <span
                  className={`text-[9px] font-700 px-2 py-0.5 rounded-full ${user.accountStatus === "active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                >
                  {user.accountStatus?.replace(/_/g, " ") || "unknown"}
                </span>
                {user.verificationStatus && (
                  <span
                    className={`text-[9px] font-700 px-2 py-0.5 rounded-full ${user.verificationStatus === "approved" ? "bg-green-100 text-green-700" : user.verificationStatus === "rejected" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}
                  >
                    {user.verificationStatus}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Contact grid */}
          <div className="grid grid-cols-1 gap-2">
            <InfoRow
              Icon={Mail}
              label="Email"
              value={user.email}
              color={color}
            />
            <InfoRow
              Icon={Phone}
              label="Phone"
              value={user.phone}
              color={color}
            />
            <InfoRow
              Icon={MapPin}
              label="Location"
              value={[user.locality, user.city, user.state]
                .filter(Boolean)
                .join(", ")}
              color={color}
            />
            <InfoRow
              Icon={Shield}
              label="KYC"
              value={user.kyc?.status?.replace(/_/g, " ")}
              color={user.kyc?.status === "verified" ? "#27AE60" : "#f59e0b"}
            />
          </div>
        </div>
      </div>

      {/* Agent-specific extra info */}
      {role === "agent" && <AgentExtra user={user} />}

      {/* Workflow progress */}
      {/* <ProgressBar role={role} user={user} color={color} /> */}

      {/* Workflow timeline */}
      {/* <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <p className="text-[10px] font-800 text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
          <Activity size={11} color={color} /> Workflow Steps
        </p>
        <Timeline role={role} user={user} />
      </div> */}

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={() =>
            navigate(`/dashboard/users/${user.userId || user._id}`)
          }
          className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-2xl text-sm font-700 text-white"
          style={{ background: `linear-gradient(135deg,${color},${color}cc)` }}
        >
          View Workflow <ExternalLink size={13} />
        </button>
        {role === "agent" && onEditStatus && (
          <button
            onClick={() => onEditStatus(user)}
            className="flex items-center gap-1.5 px-4 py-3 rounded-2xl text-sm font-700 bg-white border-2 border-gray-200 text-gray-600 hover:border-gray-300 transition-all"
          >
            <Shield size={14} /> Verify
          </button>
        )}
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(8px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default WorkflowPanel;
