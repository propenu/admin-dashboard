
// frontend/admin-dashboard/src/pages/users/AllUserInDetails/EachUserCompoents/SalesAgent.jsx
import React, { useEffect, useState } from "react";
import { getUserSearch } from "../../../features/user/userService";
import { Mail, Shield, UsersIcon } from "lucide-react";

const getInitials = (name = "") =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

const avatarShades = [
  { bg: "bg-[#e8f8ef]", text: "text-[#27AE60]", border: "border-[#27AE60]/20" },
  { bg: "bg-[#d4f1e1]", text: "text-[#1e9e54]", border: "border-[#1e9e54]/20" },
  { bg: "bg-[#edfaf3]", text: "text-[#2ecc71]", border: "border-[#2ecc71]/20" },
  { bg: "bg-[#dcf5e8]", text: "text-[#219653]", border: "border-[#219653]/20" },
  { bg: "bg-[#c9eedb]", text: "text-[#27AE60]", border: "border-[#27AE60]/20" },
];

const SalesAgentCard = ({ agent, index }) => {
  const palette = avatarShades[index % avatarShades.length];
  const permissions = agent.role?.permissions || [];

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
      {/* Top green bar */}
      <div className="h-1 w-full bg-gradient-to-r from-[#27AE60] via-[#2ecc71] to-[#27AE60]/40" />

      <div className="p-6 flex flex-col gap-5">
        {/* Avatar + Identity */}
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
              {agent.role || "N/A"}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-gray-100 via-[#27AE60]/10 to-transparent" />

        {/* Contact rows */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-3 group/row">
            <div
              className="w-8 h-8 rounded-lg bg-[#f0faf5] border border-[#27AE60]/12
              text-[#27AE60] flex items-center justify-center shrink-0
              group-hover/row:bg-[#27AE60]/12 transition-colors duration-200"
            >
              <Mail size={16} />
            </div>
            <span className="text-gray-500 p-1 text-[13px] truncate leading-none">
              {agent.email || "—"}
            </span>
          </div>
        </div>

        {/* Permissions */}
        {permissions.length > 0 && (
          <div className="bg-[#f6fdf8] rounded-xl p-3.5 border border-[#27AE60]/8">
            <div className="flex items-center gap-1.5 text-[#27AE60]/70 mb-2.5">
              <Shield size={16} />
              <span className="text-[10px] font-semibold tracking-[1.8px] uppercase">
                Permissions
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {permissions.map((p) => (
                <span
                  key={p}
                  className="text-[10px] font-semibold text-[#219653]
                    bg-white border border-[#27AE60]/15
                    px-2 py-[3px] rounded-md tracking-wide
                    shadow-[0_1px_3px_rgba(39,174,96,0.08)]"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const SalesAgents = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAgents(); }, []);

  const fetchAgents = async () => {
    try {
      const response = await getUserSearch("sales_agent");
      setAgents(response?.data?.results || []);
    } catch (err) {
      console.error("Failed to fetch agents:", err);
      setAgents([]);
    } finally {
      setLoading(false);
    }
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
      `}</style>

      <div className="min-h-screen bg-[#f5fcf8] px-8">

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-white border border-[#27AE60]/20
              shadow-[0_2px_8px_rgba(39,174,96,0.1)] flex items-center justify-center
              text-[#27AE60]">
              <UsersIcon size={20} />
            </div>
            <div>
              <p className="text-[#000000] text-[10px] tracking-[3px] uppercase mb-0.5">
                Team Directory
              </p>
              <h1 className="text-[#27AE60] text-[22px]  leading-none tracking-tight">
                Sales Agents
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
          Manage and view all active sales agents
        </p>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-[#27AE60]/25 via-[#27AE60]/8 to-transparent mb-8" />

        {/* ── Loading ── */}
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
            <div className="w-16 h-16 rounded-2xl bg-white border border-[#27AE60]/15
              shadow-sm flex items-center justify-center text-[#27AE60]">
              <UsersIcon size={28} />
            </div>
            <p className="text-gray-400 text-sm tracking-[2px] uppercase font-medium">
              No Agents Found
            </p>
          </div>

        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {agents.map((agent, idx) => (
              <SalesAgentCard key={agent._id} agent={agent} index={idx} />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default SalesAgents;