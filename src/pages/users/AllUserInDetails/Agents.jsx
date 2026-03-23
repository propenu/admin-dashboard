

// frontend/admin-dashboard/src/pages/users/AllUserInDetails/EachUserCompoents/Agents.jsx
import React, { useEffect, useState } from "react";
import {
  getUserSearch,
  editAgentVerificationStatus,
} from "../../../features/user/userService";
import { Mail, Phone, Shield, UsersIcon, ChevronDown, X, CheckCircle, Clock, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

const getInitials = (name = "") =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

const avatarShades = [
  { bg: "bg-[#e8f8ef]", text: "text-[#27AE60]", border: "border-[#27AE60]/20" },
  { bg: "bg-[#d4f1e1]", text: "text-[#1e9e54]", border: "border-[#1e9e54]/20" },
  { bg: "bg-[#edfaf3]", text: "text-[#2ecc71]", border: "border-[#2ecc71]/20" },
  { bg: "bg-[#dcf5e8]", text: "text-[#219653]", border: "border-[#219653]/20" },
  { bg: "bg-[#c9eedb]", text: "text-[#27AE60]", border: "border-[#27AE60]/20" },
];

const STATUS_CONFIG = {
  approved: {
    label: "Approved",
    icon: CheckCircle,
    bg: "bg-[#e8f8ef]",
    text: "text-[#27AE60]",
    border: "border-[#27AE60]/30",
    dot: "bg-[#27AE60]",
    badgeBg: "bg-[#27AE60]/10",
    badgeBorder: "border-[#27AE60]/20",
    badgeText: "text-[#27AE60]",
  },
  pending: {
    label: "Pending",
    icon: Clock,
    bg: "bg-[#fff8e6]",
    text: "text-[#F39C12]",
    border: "border-[#F39C12]/30",
    dot: "bg-[#F39C12]",
    badgeBg: "bg-[#F39C12]/10",
    badgeBorder: "border-[#F39C12]/20",
    badgeText: "text-[#F39C12]",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    bg: "bg-[#fdecea]",
    text: "text-[#E74C3C]",
    border: "border-[#E74C3C]/30",
    dot: "bg-[#E74C3C]",
    badgeBg: "bg-[#E74C3C]/10",
    badgeBorder: "border-[#E74C3C]/20",
    badgeText: "text-[#E74C3C]",
  },
};

const getStatusConfig = (status) => {
  const key = status?.toLowerCase();
  return STATUS_CONFIG[key] || STATUS_CONFIG["pending"];
};

// ── Verification Status Modal ──────────────────────────────────────────────
const VerificationModal = ({ agent, onClose, onSave }) => {
 const [selectedStatus, setSelectedStatus] = useState(() => {
   const status = agent.verificationStatus?.toLowerCase();

   // ❌ if pending → don't use it
   if (status === "approved" || status === "rejected") {
     return status;
   }

   // ✅ default when pending
   return "approved";
 });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      await editAgentVerificationStatus(agent.agentId, {
        status: selectedStatus,
      });
      onSave(agent.agentId, selectedStatus);
      toast.success("Verification status updated successfully");
      onClose();
    } catch (err) {
      console.error("Failed to update verification status:", err);
      toast.error("Failed to update verification status");
      setError("Failed to update status. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: "rgba(0,0,0,0.35)",
        backdropFilter: "blur(4px)",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
        style={{ animation: "modalIn 0.25s ease both" }}
      >
        {/* Header */}
        <div className="h-1 w-full bg-gradient-to-r from-[#27AE60] via-[#2ecc71] to-[#27AE60]/40" />
        <div className="flex items-center justify-between px-6 pt-5 pb-4">
          <div>
            <p className="text-[10px] text-gray-400 tracking-[2px] uppercase font-semibold mb-0.5">
              Edit Verification
            </p>
            <h2 className="text-gray-800 font-bold text-[16px] leading-tight">
              {agent.name
                .split(" ")
                .map((n) => n.charAt(0).toUpperCase() + n.slice(1))
                .join(" ")}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100
              text-gray-400 hover:text-gray-600 hover:bg-gray-100
              flex items-center justify-center transition-colors duration-150"
          >
            <X size={15} />
          </button>
        </div>

        {/* Status Options */}
        <div className="px-6 pb-2">
          <p className="text-[11px] text-gray-400 tracking-[1.5px] uppercase font-semibold mb-3">
            Select Status
          </p>
          <div className="flex flex-col gap-2">
            {Object.entries(STATUS_CONFIG)
              .filter(([key]) => key !== "pending") 
              .map(([key, cfg]) => {
                const Icon = cfg.icon;
                const isSelected = selectedStatus === key;
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedStatus(key)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all duration-200 text-left
                    ${
                      isSelected
                        ? `${cfg.bg} ${cfg.border} ${cfg.text}`
                        : "bg-gray-50 border-transparent text-gray-500 hover:bg-gray-100"
                    }`}
                  >
                    <Icon
                      size={17}
                      className={isSelected ? cfg.text : "text-gray-400"}
                    />
                    <span className="font-semibold text-[13px]">
                      {cfg.label}
                    </span>
                    {isSelected && (
                      <span className="ml-auto w-2 h-2 rounded-full bg-current opacity-80" />
                    )}
                  </button>
                );
              })}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 mt-2 px-3 py-2 rounded-lg bg-red-50 border border-red-100">
            <p className="text-red-500 text-[12px]">{error}</p>
          </div>
        )}

        {/* Footer */}
        <div className="flex gap-3 px-6 pt-4 pb-6">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl border border-gray-200
              text-gray-500 text-[13px] font-semibold
              hover:bg-gray-50 transition-colors duration-150 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-[#27AE60] text-white
              text-[13px] font-bold shadow-[0_4px_14px_rgba(39,174,96,0.35)]
              hover:bg-[#219653] active:scale-95
              transition-all duration-150 disabled:opacity-60
              flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Saving…
              </>
            ) : (
              "Save Status"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Agent Card ─────────────────────────────────────────────────────────────
const AgentCard = ({ agent, index, onEditStatus }) => {
  const palette = avatarShades[index % avatarShades.length];
  const statusCfg = getStatusConfig(agent.verificationStatus);
  const StatusIcon = statusCfg.icon;

  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden
        shadow-[0_2px_12px_rgba(0,0,0,0.05)]
        hover:shadow-[0_12px_40px_rgba(39,174,96,0.13)]
        hover:-translate-y-1.5 hover:border-[#27AE60]/25
        transition-all duration-300 ease-out group"
      style={{
        animation: "cardIn 0.45s ease both",
        animationDelay: `${index * 80}ms`,
      }}
    >
      <div className="h-1 w-full bg-gradient-to-r from-[#27AE60] via-[#2ecc71] to-[#27AE60]/40" />

      <div className="p-6 flex flex-col gap-5">
        {/* Avatar + Name */}
        <div className="flex items-center gap-4">
          <div
            className={`relative w-[52px] h-[52px] rounded-xl ${palette.bg} ${palette.text}
            border ${palette.border} flex items-center justify-center
            text-[17px] font-bold shrink-0 tracking-wide shadow-sm
            group-hover:scale-105 transition-transform duration-300`}
          >
            {getInitials(agent.name)}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/60 to-transparent pointer-events-none" />
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-gray-800 font-bold text-[15px] truncate leading-tight mb-1.5">
              {agent.name
                .split(" ")
                .map((n) => n.charAt(0).toUpperCase() + n.slice(1))
                .join(" ")}
            </h2>
            <div
              className="inline-flex items-center gap-1.5
              bg-[#27AE60]/8 border border-[#27AE60]/18
              text-[#27AE60] text-[10px] font-semibold tracking-[1.5px] uppercase
              px-2.5 py-[3px] rounded-full"
            >
              <span className="w-[6px] h-[6px] rounded-full bg-[#27AE60] animate-pulse" />
              {agent.role?.label || "Agent"}
            </div>
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-gray-100 via-[#27AE60]/10 to-transparent" />

        {/* Contact Info */}
        <div className="flex  flex-col gap-2.5">
          {agent.email && (
            <div className="flex items-center gap-3 group/row">
              <div
                className="w-8 h-8 rounded-lg bg-[#f0faf5] border border-[#27AE60]/12
                text-[#27AE60] flex items-center justify-center shrink-0
                group-hover/row:bg-[#27AE60]/12 transition-colors duration-200"
              >
                <Mail size={16} />
              </div>
              <span className="text-gray-500 p-1 text-[13px] truncate leading-none">
                {agent.email}
              </span>
            </div>
          )}

          {agent.phone && (
            <div className="flex items-center gap-3 group/row">
              <div
                className="w-8 h-8 rounded-lg bg-[#f0faf5] border border-[#27AE60]/12
                text-[#27AE60] flex items-center justify-center shrink-0
                group-hover/row:bg-[#27AE60]/12 transition-colors duration-200"
              >
                <Phone size={16} />
              </div>
              <span className="text-gray-500 text-[13px] truncate leading-none">
                {agent.phone}
              </span>
            </div>
          )}

          {!agent.email && !agent.phone && (
            <span className="text-gray-300 text-[13px] italic">
              No contact info
            </span>
          )}
        </div>

        <div className="h-px bg-gradient-to-r from-gray-100 via-[#27AE60]/10 to-transparent" />

        {/* Verification Status Row */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-gray-400 shrink-0" />
            <span className="text-[11px] text-gray-400 tracking-[1px] uppercase font-semibold">
              Verification
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Status Badge */}
            <div
              className={`inline-flex items-center gap-1.5
                ${statusCfg.badgeBg} border ${statusCfg.badgeBorder} ${statusCfg.badgeText}
                text-[10px] font-bold tracking-[1.2px] uppercase
                px-2.5 py-[4px] rounded-full`}
            >
              <StatusIcon size={11} />
              {statusCfg.label}
            </div>

            {/* Edit Button */}
            <button
              onClick={() => onEditStatus(agent)}
              className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-100
                text-gray-400 hover:text-[#27AE60] hover:bg-[#f0faf5] hover:border-[#27AE60]/20
                flex items-center justify-center
                transition-all duration-200 active:scale-90"
              title="Edit verification status"
            >
              <ChevronDown size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────
const AllAgents = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingAgent, setEditingAgent] = useState(null);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const response = await getUserSearch("agent");
      setAgents(response?.data?.results || []);
    } catch (err) {
      console.error("Failed to fetch agents:", err);
      setAgents([]);
    } finally {
      setLoading(false);
    }
  };

  // Optimistically update the agent's verificationStatus in local state
  const handleStatusSaved = (agentId, newStatus) => {
    setAgents((prev) =>
      prev.map((a) =>
        a.agentId === agentId ? { ...a, verificationStatus: newStatus } : a
      )
    );
  };

  return (
    <>
      <style>{`
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes dotBounce {
          0%,80%,100% { transform: scale(0.55); opacity: 0.35; }
          40%          { transform: scale(1);    opacity: 1; }
        }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.94) translateY(10px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
      `}</style>

      {/* Verification Status Edit Modal */}
      {editingAgent && (
        <VerificationModal
          agent={editingAgent}
          onClose={() => setEditingAgent(null)}
          onSave={handleStatusSaved}
        />
      )}

      <div className="min-h-screen bg-[#f5fcf8] px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3.5">
            <div
              className="w-11 h-11 rounded-xl bg-white border border-[#27AE60]/20
              shadow-[0_2px_8px_rgba(39,174,96,0.1)] flex items-center justify-center
              text-[#27AE60]"
            >
              <UsersIcon size={20} />
            </div>
            <div>
              <p className="text-[#000000] text-[10px] tracking-[3px] uppercase mb-0.5">
                Team Directory
              </p>
              <h1 className="text-[#27AE60] text-[22px] leading-none tracking-tight">
                All Agents
              </h1>
            </div>
          </div>

          {!loading && agents.length > 0 && (
            <div className="flex flex-col items-end">
              <span className="text-[36px] font-extrabold text-[#27AE60] leading-none">
                {agents.length.toString().padStart(2, "0")}
              </span>
              <span className="text-[10px] text-gray-400 tracking-[2px] uppercase font-medium">
                Total
              </span>
            </div>
          )}
        </div>

        <p className="text-[#000000] text-[13px] ml-[58px] mb-6">
          Manage and view all active agents
        </p>

        <div className="h-px bg-gradient-to-r from-[#27AE60]/25 via-[#27AE60]/8 to-transparent mb-8" />

        {/* Loading */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-28 gap-5">
            <div className="flex gap-2.5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-2.5 h-2.5 rounded-full bg-[#27AE60]"
                  style={{
                    animation: "dotBounce 1.2s infinite ease-in-out",
                    animationDelay: `${i * 0.18}s`,
                    boxShadow: "0 0 6px rgba(39,174,96,0.4)",
                  }}
                />
              ))}
            </div>
            <p className="text-[#27AE60]/50 text-[11px] tracking-[3px] uppercase font-semibold">
              Loading Agents…
            </p>
          </div>
        ) : agents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 gap-4">
            <div
              className="w-16 h-16 rounded-2xl bg-white border border-[#27AE60]/15
              shadow-sm flex items-center justify-center text-[#27AE60]"
            >
              <UsersIcon size={28} />
            </div>
            <p className="text-gray-400 text-sm tracking-[2px] uppercase font-medium">
              No Agents Found
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {agents.map((agent, idx) => (
              <AgentCard
                key={agent._id}
                agent={agent}
                index={idx}
                onEditStatus={setEditingAgent}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default AllAgents;