// src/pages/admin/TeamManagement.jsx
// Manager list on left → click → see team members on right with individual workflow links

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Mail,
  Phone,
  ChevronRight,
  UserCircle,
  Search,
  TrendingUp,
  ArrowLeft,
  Shield,
  MapPin,
  ExternalLink,
  CheckCircle,
  Clock,
  AlertCircle,
  Activity,
  RefreshCw,
} from "lucide-react";
import {
  getUserSearch,
  getManagerAndTeamMembers,
} from "../../features/user/userService";

// ─── KYC badge ─────────────────────────────────────────────────────────────────
const KycBadge = ({ status }) => {
  const map = {
    verified: {
      color: "#27AE60",
      bg: "#dcfce7",
      icon: CheckCircle,
      label: "KYC Verified",
    },
    not_started: {
      color: "#94a3b8",
      bg: "#f1f5f9",
      icon: AlertCircle,
      label: "KYC Pending",
    },
    pending: {
      color: "#f59e0b",
      bg: "#fef3c7",
      icon: Clock,
      label: "KYC In Progress",
    },
  };
  const cfg = map[status] || map.not_started;
  const Icon = cfg.icon;
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-700 px-2 py-0.5 rounded-full"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      <Icon size={9} /> {cfg.label}
    </span>
  );
};

// ─── Agent card ────────────────────────────────────────────────────────────────
const AgentCard = ({ agent, idx, navigate }) => {
  const initials = (agent.name || "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className="group bg-white rounded-2xl border border-gray-100 p-4
                    hover:border-[#27AE60]/30 hover:shadow-lg hover:shadow-[#27AE60]/8
                    transition-all duration-200"
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div
          className="w-11 h-11 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-100
                        flex items-center justify-center flex-shrink-0
                        group-hover:from-[#27AE60]/10 group-hover:to-emerald-50 group-hover:border-[#27AE60]/20 transition-all"
        >
          <span className="text-sm font-800 text-gray-500 group-hover:text-[#27AE60] transition-colors">
            {initials}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-700 text-gray-800 truncate group-hover:text-[#27AE60] transition-colors">
                {agent.name}
              </p>
              <p className="text-[10px] text-gray-400 font-600 uppercase tracking-wider mt-0.5">
                {agent.roleName?.replace(/_/g, " ") || "Agent"}
              </p>
            </div>
            <span className="text-[10px] font-mono text-gray-300 flex-shrink-0 mt-0.5">
              #{String(idx + 1).padStart(2, "0")}
            </span>
          </div>

          {/* Contact */}
          {agent.email && (
            <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-1.5 truncate">
              <Mail size={10} className="flex-shrink-0 text-gray-300" />
              {agent.email}
            </p>
          )}
          {agent.phone && (
            <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
              <Phone size={10} className="flex-shrink-0 text-gray-300" />
              {agent.phone}
            </p>
          )}
          {agent.city && (
            <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
              <MapPin size={10} className="flex-shrink-0 text-gray-300" />
              {[agent.city, agent.state].filter(Boolean).join(", ")}
            </p>
          )}

          {/* KYC + status row */}
          <div className="flex items-center gap-2 mt-2.5 flex-wrap">
            <KycBadge status={agent.kyc?.status} />
            {agent.accountStatus && (
              <span
                className={`text-[10px] font-700 px-2 py-0.5 rounded-full ${agent.accountStatus === "active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
              >
                {agent.accountStatus.replace(/_/g, " ")}
              </span>
            )}
          </div>

          {/* View profile button */}
          {agent._id && (
            <button
              onClick={() => navigate(`/dashboard/users/${agent._id}`)}
              className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-700
                         bg-[#27AE60]/8 text-[#27AE60] hover:bg-[#27AE60] hover:text-white transition-all"
            >
              <ExternalLink size={11} /> View Full Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main ──────────────────────────────────────────────────────────────────────
const TeamManagement = () => {
  const navigate = useNavigate();
  const [managers, setManagers] = useState([]);
  const [filteredManagers, setFilteredManagers] = useState([]);
  const [selectedManager, setSelectedManager] = useState(null);
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [managersLoading, setManagersLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Load managers
  const loadManagers = useCallback(() => {
    setManagersLoading(true);
    getUserSearch("sales_manager")
      .then((res) => {
        const list = res?.data?.results || res?.data?.data || res?.data || [];
        setManagers(list);
        setFilteredManagers(list);
      })
      .catch(console.error)
      .finally(() => setManagersLoading(false));
  }, []);

  useEffect(() => {
    loadManagers();
  }, [loadManagers]);

  // Search filter
  useEffect(() => {
    const q = search.toLowerCase();
    setFilteredManagers(
      managers.filter(
        (m) =>
          m.name?.toLowerCase().includes(q) ||
          m.email?.toLowerCase().includes(q),
      ),
    );
  }, [search, managers]);

  const handleSelectManager = useCallback(
    async (id) => {
      setLoading(true);
      setSidebarOpen(false);
      setTeamData(null);
      try {
        const res = await getManagerAndTeamMembers(id);
        setTeamData(res?.data);
        setSelectedManager(managers.find((m) => m._id === id));
      } catch (err) {
        console.error("Fetch team failed", err);
      } finally {
        setLoading(false);
      }
    },
    [managers],
  );

  return (
    <div
      className="flex h-screen bg-gray-50 overflow-hidden"
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
        {/* Header */}
        <div className="px-4 py-4 border-b border-gray-100">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-gray-700 transition-colors mb-4 text-xs font-600"
          >
            <ArrowLeft size={13} /> Back to Workflow
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#27AE60] flex items-center justify-center shadow-md shadow-[#27AE60]/30">
              <Users size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm font-800 text-gray-900">Team Directory</h2>
              <p className="text-[11px] text-gray-400">
                {filteredManagers.length} manager
                {filteredManagers.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search managers…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-gray-200 bg-gray-50
                         focus:outline-none focus:border-[#27AE60]/50 focus:ring-2 focus:ring-[#27AE60]/10
                         text-gray-700 placeholder-gray-400 transition-all"
            />
          </div>
        </div>

        {/* Manager list */}
        <div className="flex-1 overflow-y-auto py-1">
          {managersLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-3/4 bg-gray-100 rounded" />
                    <div className="h-2 w-1/2 bg-gray-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredManagers.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-gray-300">
              <Users size={28} />
              <p className="text-xs font-600 text-gray-400">
                No managers found
              </p>
            </div>
          ) : (
            filteredManagers.map((m) => {
              const isActive = selectedManager?._id === m._id;
              return (
                <button
                  key={m._id}
                  onClick={() => handleSelectManager(m._id)}
                  className={`w-full text-left px-4 py-3.5 flex items-center gap-3 border-b border-gray-50
                    transition-all duration-150 group relative
                    ${isActive ? "border-r-[3px] border-r-[#27AE60]" : "hover:bg-gray-50"}
                  `}
                  style={isActive ? { background: "#27AE6008" } : {}}
                >
                  <div
                    className={`w-6 h-6 rounded-xl flex items-center justify-center text-sm font-800 flex-shrink-0 transition-all
                    ${isActive ? "bg-[#27AE60] text-white shadow-md shadow-[#27AE60]/30" : "bg-gray-100 text-gray-500 group-hover:bg-[#27AE60]/10 group-hover:text-[#27AE60]"}`}
                  >
                    {(m.name || "?")[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-600 truncate ${isActive ? "text-[#27AE60]" : "text-gray-800"}`}
                    >
                      {m.name}
                    </p>
                    {/* <p className="text-[10px] text-gray-400 uppercase tracking-wider truncate mt-0.5">
                      {m.roleName?.replace(/_/g, " ") || "Manager"}
                    </p> */}
                  </div>
                  <ChevronRight
                    size={14}
                    className={`flex-shrink-0 transition-all ${isActive ? "text-[#27AE60]" : "text-gray-300"}`}
                  />
                </button>
              );
            })
          )}
        </div>

        {/* Refresh button */}
        <div className="p-3 border-t border-gray-100">
          <button
            onClick={loadManagers}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-700 text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-all"
          >
            <RefreshCw size={11} /> Refresh List
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-20 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── RIGHT CONTENT ── */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100 sticky top-0 z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-9 h-9 rounded-xl bg-[#27AE60]/10 flex items-center justify-center text-[#27AE60]"
          >
            <Users size={16} />
          </button>
          <span className="text-sm font-700 text-gray-700">
            {selectedManager ? selectedManager.name : "Select a Manager"}
          </span>
        </div>

        <div className="p-5 md:p-8">
          {loading ? (
            /* Loading skeleton */
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 rounded-2xl bg-gray-100" />
                  <div className="flex-1 space-y-3">
                    <div className="h-5 w-40 bg-gray-100 rounded-lg" />
                    <div className="h-3.5 w-56 bg-gray-100 rounded-lg" />
                    <div className="h-3.5 w-32 bg-gray-100 rounded-lg" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse flex gap-4"
                  >
                    <div className="w-11 h-11 rounded-xl bg-gray-100 flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 w-32 bg-gray-100 rounded" />
                      <div className="h-3 w-40 bg-gray-100 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : teamData ? (
            /* ── Team detail ── */
            <div className="max-w-4xl mx-auto">
              {/* Manager header card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
                <div className="h-1.5 w-full bg-gradient-to-r from-[#27AE60] via-emerald-400 to-[#27AE60]/40" />
                <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                  <div className="flex items-center gap-5">
                    {/* Avatar */}
                    <div
                      className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-[#27AE60] to-emerald-400
                                    flex items-center justify-center text-white text-2xl font-black
                                    shadow-lg shadow-[#27AE60]/25 flex-shrink-0"
                    >
                      {(teamData.manager?.name || "?")[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <h1 className="text-xl md:text-2xl font-black text-gray-900">
                          {teamData.manager?.name}
                        </h1>
                        <span className="inline-flex items-center gap-1 bg-[#27AE60]/10 text-[#27AE60] text-[10px] font-800 px-2.5 py-1 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#27AE60]" />
                          Sales Manager
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-5 text-sm text-gray-500">
                        {teamData.manager?.email && (
                          <span className="flex items-center gap-1.5">
                            <Mail size={13} className="text-[#27AE60]" />
                            {teamData.manager.email}
                          </span>
                        )}
                        {selectedManager?.phone && (
                          <span className="flex items-center gap-1.5">
                            <Phone size={13} className="text-[#27AE60]" />
                            {selectedManager.phone}
                          </span>
                        )}
                        {selectedManager?.city && (
                          <span className="flex items-center gap-1.5">
                            <MapPin size={13} className="text-[#27AE60]" />
                            {[selectedManager.city, selectedManager.state]
                              .filter(Boolean)
                              .join(", ")}
                          </span>
                        )}
                      </div>

                      {/* KYC + status */}
                      <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                        <KycBadge status={selectedManager?.kyc?.status} />
                        {selectedManager?.accountStatus && (
                          <span
                            className={`text-[10px] font-700 px-2.5 py-1 rounded-full ${selectedManager.accountStatus === "active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                          >
                            {selectedManager.accountStatus.replace(/_/g, " ")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stats + View Profile */}
                  <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3">
                    <div className="flex items-center gap-3 bg-[#27AE60]/8 rounded-2xl px-5 py-3 border border-[#27AE60]/15">
                      <TrendingUp size={16} className="text-[#27AE60]" />
                      <div>
                        <p className="text-2xl font-black text-[#27AE60] leading-none">
                          {teamData.totalAgents}
                        </p>
                        <p className="text-[10px] font-700 text-gray-400 uppercase tracking-wider mt-0.5">
                          Total Agents
                        </p>
                      </div>
                    </div>

                    {selectedManager?._id && (
                      <button
                        onClick={() =>
                          navigate(`/dashboard/users/${selectedManager._id}`)
                        }
                        className="flex items-center gap-1.5 text-xs font-700 text-[#27AE60] hover:underline"
                      >
                        <ExternalLink size={12} /> View Full Profile
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Team members heading */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-800 text-gray-800 flex items-center gap-2">
                  <Users size={15} className="text-[#27AE60]" />
                  Team Members
                </h3>
                <span className="text-xs font-700 bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full">
                  {teamData.agents?.length} agent
                  {teamData.agents?.length !== 1 ? "s" : ""}
                </span>
              </div>

              {teamData.agents?.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 py-16 flex flex-col items-center gap-3">
                  <UserCircle size={40} className="text-gray-200" />
                  <p className="text-sm font-600 text-gray-400">
                    No agents assigned yet
                  </p>
                  <p className="text-xs text-gray-300">
                    Agents will appear here once assigned to this manager
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {teamData.agents.map((agent, idx) => (
                    <AgentCard
                      key={agent._id}
                      agent={agent}
                      idx={idx}
                      navigate={navigate}
                    />
                  ))}
                </div>
              )}

              {/* View all agents workflow button */}
              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  onClick={() => navigate("/dashboard/workflow/sales_agent")}
                  className="flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-700 bg-white border border-gray-200 text-gray-600 hover:border-[#27AE60]/40 hover:text-[#27AE60] transition-all"
                >
                  <Activity size={15} /> All Agent Workflows
                </button>
                <button
                  onClick={() => navigate("/dashboard/workflow/sales_manager")}
                  className="flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-700 bg-[#27AE60] text-white hover:opacity-90 transition-opacity"
                >
                  <TrendingUp size={15} /> Manager Workflows
                </button>
              </div>
            </div>
          ) : (
            /* Placeholder */
            <div className="h-full min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
              <div className="w-20 h-20 rounded-3xl bg-[#27AE60]/8 border border-[#27AE60]/15 flex items-center justify-center mb-5">
                <Users size={32} className="text-[#27AE60]/40" />
              </div>
              <h3 className="text-base font-800 text-gray-700 mb-1">
                No Manager Selected
              </h3>
              <p className="text-sm text-gray-400 max-w-xs">
                Choose a manager from the left panel to view their team and
                agent details.
              </p>
              <button
                onClick={() => setSidebarOpen(true)}
                className="mt-5 md:hidden inline-flex items-center gap-2 bg-[#27AE60] text-white text-sm font-700 px-5 py-2.5 rounded-xl shadow-md shadow-[#27AE60]/25"
              >
                <Users size={15} /> Browse Managers
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TeamManagement;
