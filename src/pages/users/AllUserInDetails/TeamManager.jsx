// frontend/admin-dashboard/src/pages/users/AllUserInDetails/TeamManager.jsx
import React, { useState, useEffect } from "react";
import {
  Users,
  Mail,
  Phone,
  ChevronRight,
  UserCircle,
  Search,
  TrendingUp,
} from "lucide-react";
import {
  getUserSearch,
  getManagerAndTeamMembers,
} from "../../../features/user/userService";

const TeamManagement = () => {
  const [searchQuery, setSearchQuery] = useState("sales_manager");
  const [managers, setManagers] = useState([]);
  const [selectedManager, setSelectedManager] = useState(null);
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    handleSearch();
  }, []);

  const handleSearch = async () => {
    try {
      const response = await getUserSearch(searchQuery);
      setManagers(response.data.results);
    } catch (err) {
      console.error("Search failed", err);
    }
  };

  const handleSelectManager = async (id) => {
    setLoading(true);
    setSidebarOpen(false);
    try {
      const response = await getManagerAndTeamMembers(id);
      setTeamData(response.data);
      const basicInfo = managers.find((m) => m._id === id);
      setSelectedManager(basicInfo);
    } catch (err) {
      console.error("Fetch team failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50/30 overflow-hidden">

      {/* ── LEFT SIDEBAR ── */}
      <aside
        className={`
          fixed md:static z-30 inset-y-0 left-0
          w-72 bg-white border-r border-gray-100 shadow-xl shadow-gray-100/60
          flex flex-col transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Sidebar header */}
        <div className="px-5 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-[#27AE60] flex items-center justify-center shadow-md shadow-[#27AE60]/30">
              <Users className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold   text-[#27AE60] leading-tight">
                Team Directory
              </h2>
              <p className="text-[11px] text-[#000000] ">
                {managers.length} manager{managers.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {/* Search */}
          {/* <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search managers…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 bg-gray-50
                         focus:outline-none focus:border-[#27AE60] focus:ring-2 focus:ring-[#27AE60]/15
                         text-gray-700 placeholder-gray-400 transition-all"
            />
          </div> */}
        </div>

        {/* Manager list */}
        <div className="flex-1 overflow-y-auto py-1">
          {managers.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-gray-300">
              <Users className="w-8 h-8" />
              <p className="text-xs font-medium">No managers found</p>
            </div>
          ) : (
            managers.map((m) => {
              const isActive = selectedManager?._id === m._id;
              return (
                <button
                  key={m._id}
                  onClick={() => handleSelectManager(m._id)}
                  className={`
                    w-full text-left px-4 py-3.5 flex items-center gap-3
                    border-b border-gray-50 transition-all duration-150 group relative
                    ${isActive
                      ? "bg-[#27AE60]/8 border-r-[3px] border-r-[#27AE60]"
                      : "hover:bg-gray-50"
                    }
                  `}
                >
                  {/* Avatar */}
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all
                      ${isActive
                        ? "bg-[#27AE60] text-white shadow-md shadow-[#27AE60]/30"
                        : "bg-gray-100 text-gray-500 group-hover:bg-[#27AE60]/10 group-hover:text-[#27AE60]"
                      }`}
                  >
                    {m.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${isActive ? "text-[#27AE60]" : "text-gray-800"}`}>
                      {m.name}
                    </p>
                    <p className="text-[11px] text-[#000000] uppercase tracking-wider truncate mt-0.5">
                      {m.role?.label || "Manager"}
                    </p>
                  </div>

                  <ChevronRight
                    className={`w-4 h-4 flex-shrink-0 transition-all
                      ${isActive ? "text-[#27AE60]" : "text-gray-300 group-hover:text-gray-400"}`}
                  />
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

      {/* ── RIGHT CONTENT ── */}
      <main className="flex-1 overflow-y-auto">

        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100 sticky top-0 z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-9 h-9 rounded-lg bg-[#27AE60]/10 flex items-center justify-center text-[#27AE60]"
          >
            <Users className="w-4 h-4" />
          </button>
          <span className="text-sm font-semibold text-gray-700">
            {selectedManager ? selectedManager.name : "Select a Manager"}
          </span>
        </div>

        <div className="p-5 md:p-8">
          {loading ? (
            /* ── Loading State ── */
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6 animate-pulse">
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 rounded-2xl bg-gray-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-40 bg-gray-100 rounded-lg" />
                    <div className="h-4 w-56 bg-gray-100 rounded-lg" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-32 bg-gray-100 rounded" />
                      <div className="h-3 w-40 bg-gray-100 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          ) : teamData ? (
            /* ── Team Detail View ── */
            <div className="max-w-4xl mx-auto">

              {/* Manager Header Card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
                {/* Green accent top strip */}
                <div className="h-1.5 w-full bg-gradient-to-r from-[#27AE60] via-emerald-400 to-[#27AE60]/40" />

                <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                  <div className="flex items-center gap-5">
                    {/* Avatar */}
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-[#27AE60] to-emerald-400 flex items-center justify-center text-white text-2xl md:text-3xl font-extrabold shadow-lg shadow-[#27AE60]/25 flex-shrink-0">
                      {teamData.manager.name.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h1 className="text-xl md:text-2xl  text-[#000000]">
                          {teamData.manager.name}
                        </h1>
                        <span className="hidden sm:inline-flex items-center gap-1 bg-[#27AE60]/10 text-[#27AE60] text-[11px] font-bold px-2 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#27AE60]" />
                          Manager
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-sm text-[#000000]">
                        <span className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-[#27AE60]" />
                          {teamData.manager.email || "N/A"}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-[#27AE60]" />
                          {selectedManager?.phone || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stats pill */}
                  <div className="flex items-center gap-4 sm:flex-col sm:items-end sm:gap-1">
                    <div className="flex items-center gap-2 bg-[#27AE60]/8 rounded-2xl px-5 py-3 border border-[#27AE60]/15">
                      <TrendingUp className="w-4 h-4 text-[#27AE60]" />
                      <div>
                        <p className="text-2xl font-extrabold text-[#27AE60] leading-none">
                          {teamData.totalAgents}
                        </p>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">
                          Total Agents
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Team Members Section */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base  text-[#000000] flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#27AE60]" />
                  Team Members
                </h3>
                <span className="text-xs font-semibold bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full">
                  {teamData.agents.length} agent{teamData.agents.length !== 1 ? "s" : ""}
                </span>
              </div>

              {teamData.agents.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 py-16 flex flex-col items-center gap-3 text-gray-300">
                  <UserCircle className="w-12 h-12" />
                  <p className="text-sm font-medium text-gray-400">No agents assigned yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {teamData.agents.map((agent, idx) => (
                    <div
                      key={agent._id}
                      className="group bg-white rounded-xl border border-gray-100 p-4 hover:border-[#27AE60]/30 hover:shadow-md hover:shadow-[#27AE60]/5 transition-all duration-200 flex items-center gap-4"
                    >
                      {/* Avatar */}
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0 group-hover:from-[#27AE60]/10 group-hover:to-emerald-50 group-hover:border-[#27AE60]/20 transition-all">
                        {agent.name ? (
                          <span className="text-sm font-bold text-gray-500 group-hover:text-[#27AE60] transition-colors">
                            {agent.name.charAt(0).toUpperCase()}
                          </span>
                        ) : (
                          <UserCircle className="w-6 h-6 text-gray-300" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-[#27AE60] transition-colors">
                          {agent.name}
                        </p>
                        <p className="text-xs text-gray-400 truncate mt-0.5 flex items-center gap-1">
                          <Mail className="w-3 h-3 flex-shrink-0" />
                          {agent.email || "No email"}
                        </p>
                      </div>

                      <span className="text-[10px] font-mono text-gray-300 flex-shrink-0">
                        #{String(idx + 1).padStart(2, "0")}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          ) : (
            /* ── Empty / Placeholder State ── */
            <div className="h-full min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
              <div className="w-20 h-20 rounded-3xl bg-[#27AE60]/8 border border-[#27AE60]/15 flex items-center justify-center mb-5">
                <Users className="w-9 h-9 text-[#27AE60]/40" />
              </div>
              <h3 className="text-base font-bold text-gray-700 mb-1">
                No Manager Selected
              </h3>
              <p className="text-sm text-gray-400 max-w-xs">
                Choose a manager from the left panel to view their team details and agents.
              </p>

              {/* Mobile CTA */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="mt-6 md:hidden inline-flex items-center gap-2 bg-[#27AE60] text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-md shadow-[#27AE60]/25 hover:bg-[#1d8646] transition-colors"
              >
                <Users className="w-4 h-4" />
                Browse Managers
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TeamManagement;