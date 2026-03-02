// frontend/admin-dashboard/src/pages/users/Users.jsx
import React, { useEffect, useState } from "react";
import authAxios from "../../config/authApi";
import { USER_API_ENDPOINTS } from "../../config/UserDeatilsApi";
import {
  Search,
  Phone,
  Calendar,
  ShieldCheck,
  Users as UsersIcon,
  TrendingUp,
  UserCheck,
  UserX,
} from "lucide-react";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await authAxios.get(USER_API_ENDPOINTS.ALL_USERS);
      const data = res.data;
      setUsers(Array.isArray(data) ? data : data.users || []);
    } catch (err) {
      console.error("Failed to load users", err);
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async (query) => {
    if (!query) return loadUsers();
    try {
      setLoading(true);
      const res = await authAxios.get(
        `${USER_API_ENDPOINTS.SEARCH_USERS}?q=${query}`,
      );
      setUsers(res.data.results || []);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchUsers(search);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const activeCount = users.filter((u) => u.isActive).length;
  const inactiveCount = users.filter((u) => !u.isActive).length;
  const totalLogins = users.reduce((s, u) => s + (u.loginCount || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50/40 p-4 md:p-8">
      {/* ── Page Header ── */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#27AE60] flex items-center justify-center shadow-lg shadow-[#27AE60]/25">
              <UsersIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-[#27AE60] tracking-tight">
                User Management
              </h1>
              <p className="text-sm text-[#000000] mt-0.5">
                Monitor and manage your platform users
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search name, email or phone…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder-gray-400
                         focus:outline-none focus:border-[#27AE60] focus:ring-4 focus:ring-[#27AE60]/10
                         shadow-sm transition-all duration-200"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* ── Stats Row ── */}
        {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          <StatCard
            label="Total Users"
            value={users.length}
            icon={<UsersIcon className="w-4 h-4" />}
            color="green"
          />
          <StatCard
            label="Active"
            value={activeCount}
            icon={<UserCheck className="w-4 h-4" />}
            color="emerald"
          />
          <StatCard
            label="Inactive"
            value={inactiveCount}
            icon={<UserX className="w-4 h-4" />}
            color="red"
          />
          <StatCard
            label="Total Logins"
            value={totalLogins}
            icon={<TrendingUp className="w-4 h-4" />}
            color="green"
          />
        </div> */}
      </div>

      {/* ── Data Container ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm shadow-gray-100 overflow-hidden">
        {/* Table header bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/60">
          <span className="text-xs uppercase tracking-widest text-[#000000]">
            All Users
          </span>
          <span className="text-xs text-gray-400 font-medium">
            {loading
              ? "Loading…"
              : `${users.length} record${users.length !== 1 ? "s" : ""}`}
          </span>
        </div>

        {/* ── Desktop Table ── */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80">
                {[
                  "No.",
                  "User",
                  "Phone",
                  "Email",
                  // "Logins",
                  "Status",
                  "Joined",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#27AE60]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <SkeletonRows />
              ) : users.length === 0 ? (
                <EmptyState colSpan={6} />
              ) : (
                users.map((u, idx) => (
                  <tr
                    key={u._id}
                    className="group border-t border-gray-50 hover:bg-green-50/40 transition-colors duration-150"
                  >
                    {/* Index */}
                    <td className="px-6 py-4">
                      <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-1 rounded-md">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                    </td>

                    {/* User */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#27AE60] to-emerald-400 flex items-center justify-center text-white text-sm font-bold shadow-sm shadow-[#27AE60]/20 flex-shrink-0">
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800 leading-tight">
                            {u.name
                              .split(" ")
                              .map(
                                (n) => n.charAt(0).toUpperCase() + n.slice(1),
                              )
                              .join(" ")}
                          </p>

                          <p className="text-[11px] text-[#27AE60] font-mono leading-tight mt-0.5 truncate max-w-[160px]">
                            {u._id}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-3.5 h-3.5 text-gray-300" />
                        {u.phone || "—"}
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-3.5 h-3.5 text-gray-300" />
                        {u.email || "—"}
                      </div>
                    </td>

                    {/* Logins */}
                    {/* <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 rounded-full bg-gray-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#27AE60] to-emerald-400 transition-all"
                            style={{
                              width: `${Math.min((u.loginCount / 50) * 100, 100)}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-gray-500 font-mono">
                          {u.loginCount ?? 0}
                        </span>
                      </div>
                    </td> */}

                    {/* Status */}
                    <td className="px-6 py-4">
                      <StatusBadge active={u.isActive} />
                    </td>

                    {/* Joined */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-gray-500">
                        <Calendar className="w-3.5 h-3.5 text-gray-300" />
                        {new Date(u.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Mobile Card View ── */}
        <div className="md:hidden divide-y divide-gray-50">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <div className="w-8 h-8 rounded-full border-4 border-[#27AE60]/20 border-t-[#27AE60] animate-spin" />
              <p className="text-sm text-gray-400 font-medium">
                Loading users…
              </p>
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-gray-400">
              <UsersIcon className="w-10 h-10 text-gray-200" />
              <p className="text-sm font-medium">No users found</p>
            </div>
          ) : (
            users.map((u) => (
              <div
                key={u._id}
                className="p-4 hover:bg-green-50/30 transition-colors"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#27AE60] to-emerald-400 flex items-center justify-center text-white font-bold shadow-sm shadow-[#27AE60]/20">
                      {u.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-sm">
                        {u.name}
                      </p>
                      <p className="text-[10px] font-mono text-gray-400 mt-0.5 truncate max-w-[180px]">
                        {u._id}
                      </p>
                    </div>
                  </div>
                  <StatusBadge active={u.isActive} />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <MobileInfoChip
                    icon={<Phone className="w-3.5 h-3.5 text-[#27AE60]" />}
                    label={u.phone || "—"}
                  />
                  <MobileInfoChip
                    icon={
                      <ShieldCheck className="w-3.5 h-3.5 text-[#27AE60]" />
                    }
                    label={`${u.loginCount ?? 0} Logins`}
                  />
                  <MobileInfoChip
                    icon={<Calendar className="w-3.5 h-3.5 text-[#27AE60]" />}
                    label={new Date(u.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                    span2
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Sub-components ── */

const StatCard = ({ label, value, icon, color }) => {
  const colors = {
    green: "bg-[#27AE60]/10 text-[#27AE60]",
    emerald: "bg-emerald-100 text-emerald-600",
    red: "bg-red-100 text-red-500",
  };
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-xl font-extrabold text-gray-900 leading-none">
          {value}
        </p>
        <p className="text-xs text-gray-400 font-medium mt-0.5">{label}</p>
      </div>
    </div>
  );
};

const StatusBadge = ({ active }) => (
  <span
    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
      active ? "bg-[#27AE60]/10 text-[#27AE60]" : "bg-red-50 text-red-500"
    }`}
  >
    <span
      className={`w-1.5 h-1.5 rounded-full ${active ? "bg-[#27AE60]" : "bg-red-400"}`}
    />
    {active ? "Active" : "Inactive"}
  </span>
);

const MobileInfoChip = ({ icon, label, span2 }) => (
  <div
    className={`flex items-center gap-2 text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded-xl ${
      span2 ? "col-span-2" : ""
    }`}
  >
    {icon}
    <span className="truncate font-medium">{label}</span>
  </div>
);

const SkeletonRows = () =>
  Array.from({ length: 6 }).map((_, i) => (
    <tr key={i} className="border-t border-gray-50 animate-pulse">
      <td className="px-6 py-4">
        <div className="h-6 w-8 bg-gray-100 rounded-md" />
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gray-100" />
          <div className="space-y-1.5">
            <div className="h-3.5 w-28 bg-gray-100 rounded" />
            <div className="h-2.5 w-20 bg-gray-100 rounded" />
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="h-3.5 w-24 bg-gray-100 rounded" />
      </td>
      <td className="px-6 py-4">
        <div className="h-3 w-20 bg-gray-100 rounded-full" />
      </td>
      <td className="px-6 py-4">
        <div className="h-6 w-16 bg-gray-100 rounded-full" />
      </td>
      <td className="px-6 py-4">
        <div className="h-3.5 w-20 bg-gray-100 rounded" />
      </td>
    </tr>
  ));

const EmptyState = ({ colSpan }) => (
  <tr>
    <td colSpan={colSpan} className="py-20 text-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center">
          <UsersIcon className="w-7 h-7 text-gray-300" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-500">No users found</p>
          <p className="text-xs text-gray-400 mt-1">
            Try adjusting your search query
          </p>
        </div>
      </div>
    </td>
  </tr>
);
