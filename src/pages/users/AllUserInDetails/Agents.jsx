// frontend/admin-dashboard/src/pages/users/AllUserInDetails/EachUserCompoents/Agents.jsx
import React, { useEffect, useState, useMemo } from "react";
import {
  getUserSearch,
  editAgentVerificationStatus,
} from "../../../features/user/userService";
import {
  Mail, Phone, Shield, UsersIcon, ChevronDown, X,
  CheckCircle, Clock, XCircle, Loader2, MapPin, Building2,
  Star, Briefcase, Award, Languages, Search, Filter, SlidersHorizontal,
  Hash, CalendarDays, TrendingUp, Home, ChevronRight, Eye,
} from "lucide-react";
import { toast } from "sonner";

// ─── helpers ──────────────────────────────────────────────────────────────
const getInitials = (name = "") =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

const capitalize = (str = "") =>
  str.split(" ").map((n) => n.charAt(0).toUpperCase() + n.slice(1)).join(" ");

const formatDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const avatarShades = [
  { bg: "bg-[#e8f8ef]", text: "text-[#27AE60]", border: "border-[#27AE60]/20" },
  { bg: "bg-[#d4f1e1]", text: "text-[#1e9e54]", border: "border-[#1e9e54]/20" },
  { bg: "bg-[#edfaf3]", text: "text-[#2ecc71]", border: "border-[#2ecc71]/20" },
  { bg: "bg-[#dcf5e8]", text: "text-[#219653]", border: "border-[#219653]/20" },
  { bg: "bg-[#c9eedb]", text: "text-[#27AE60]", border: "border-[#27AE60]/20" },
];

const STATUS_CONFIG = {
  approved: {
    label: "Approved", icon: CheckCircle,
    bg: "bg-[#e8f8ef]", text: "text-[#27AE60]", border: "border-[#27AE60]/30",
    dot: "bg-[#27AE60]", badgeBg: "bg-[#27AE60]/10",
    badgeBorder: "border-[#27AE60]/20", badgeText: "text-[#27AE60]",
  },
  pending: {
    label: "Pending", icon: Clock,
    bg: "bg-[#fff8e6]", text: "text-[#F39C12]", border: "border-[#F39C12]/30",
    dot: "bg-[#F39C12]", badgeBg: "bg-[#F39C12]/10",
    badgeBorder: "border-[#F39C12]/20", badgeText: "text-[#F39C12]",
  },
  rejected: {
    label: "Rejected", icon: XCircle,
    bg: "bg-[#fdecea]", text: "text-[#E74C3C]", border: "border-[#E74C3C]/30",
    dot: "bg-[#E74C3C]", badgeBg: "bg-[#E74C3C]/10",
    badgeBorder: "border-[#E74C3C]/20", badgeText: "text-[#E74C3C]",
  },
};

const getStatusConfig = (status) =>
  STATUS_CONFIG[status?.toLowerCase()] || STATUS_CONFIG["pending"];

// ─── Verification Modal ────────────────────────────────────────────────────
const VerificationModal = ({ agent, onClose, onSave }) => {
  const [selectedStatus, setSelectedStatus] = useState(() => {
    const s = agent.verificationStatus?.toLowerCase();
    return s === "approved" || s === "rejected" ? s : "approved";
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setSaving(true); setError("");
    try {
      await editAgentVerificationStatus(agent.agentId, { status: selectedStatus });
      onSave(agent.agentId, selectedStatus);
      toast.success("Verification status updated");
      onClose();
    } catch {
      toast.error("Failed to update status");
      setError("Failed to update. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden" style={{ animation: "modalIn 0.25s ease both" }}>
        <div className="h-1 w-full bg-gradient-to-r from-[#27AE60] via-[#2ecc71] to-[#27AE60]/40" />
        <div className="flex items-center justify-between px-6 pt-5 pb-4">
          <div>
            <p className="text-[10px] text-gray-400 tracking-[2px] uppercase font-semibold mb-0.5">Edit Verification</p>
            <h2 className="text-gray-800 font-bold text-[16px] leading-tight">{capitalize(agent.name)}</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 text-gray-400 hover:text-gray-600 hover:bg-gray-100 flex items-center justify-center transition-colors">
            <X size={15} />
          </button>
        </div>
        <div className="px-6 pb-2">
          <p className="text-[11px] text-gray-400 tracking-[1.5px] uppercase font-semibold mb-3">Select Status</p>
          <div className="flex flex-col gap-2">
            {Object.entries(STATUS_CONFIG).filter(([k]) => k !== "pending").map(([key, cfg]) => {
              const Icon = cfg.icon;
              const isSelected = selectedStatus === key;
              return (
                <button key={key} onClick={() => setSelectedStatus(key)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left ${isSelected ? `${cfg.bg} ${cfg.border} ${cfg.text}` : "bg-gray-50 border-transparent text-gray-500 hover:bg-gray-100"}`}>
                  <Icon size={17} className={isSelected ? cfg.text : "text-gray-400"} />
                  <span className="font-semibold text-[13px]">{cfg.label}</span>
                  {isSelected && <span className="ml-auto w-2 h-2 rounded-full bg-current opacity-80" />}
                </button>
              );
            })}
          </div>
        </div>
        {error && (
          <div className="mx-6 mt-2 px-3 py-2 rounded-lg bg-red-50 border border-red-100">
            <p className="text-red-500 text-[12px]">{error}</p>
          </div>
        )}
        <div className="flex gap-3 px-6 pt-4 pb-6">
          <button onClick={onClose} disabled={saving} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-500 text-[13px] font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-[#27AE60] text-white text-[13px] font-bold shadow-[0_4px_14px_rgba(39,174,96,0.35)] hover:bg-[#219653] active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
            {saving ? <><Loader2 size={14} className="animate-spin" />Saving…</> : "Save Status"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Agent Detail Modal ────────────────────────────────────────────────────
const AgentDetailModal = ({ agent, onClose, onEditStatus }) => {
  const d = agent.agentDetails || {};
  const statusCfg = getStatusConfig(agent.verificationStatus);
  const StatusIcon = statusCfg.icon;
  const palette = avatarShades[0];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[92vh] flex flex-col" style={{ animation: "modalIn 0.3s ease both" }}>

        {/* Cover Image */}
        <div className="relative h-36 shrink-0 overflow-hidden bg-gradient-to-br from-[#27AE60] to-[#1a9e54]">
          {d.coverImage?.url ? (
            <img src={d.coverImage.url} alt="cover" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full" style={{ background: "linear-gradient(135deg,#27AE60,#1a9e54,#2ecc71)" }} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 flex items-center justify-center transition-all">
            <X size={15} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1">
          {/* Avatar + name row */}
          <div className="px-6  pb-4 relative">
            <div className="flex items-end  gap-4 z-20 -mt-0">
              <div className="w-20 h-20  rounded-2xl border-4 border-white shadow-xl overflow-hidden shrink-0 bg-white">
                {d.avatar?.url ? (
                  <img src={d.avatar.url} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className={`w-full h-full ${palette.bg} ${palette.text} flex items-center justify-center text-2xl font-bold`}>
                    {getInitials(agent.name)}
                  </div>
                )}
              </div>
              <div className="pb-2 flex-1 min-w-0">
                <h2 className="text-gray-800 font-black text-xl leading-tight truncate">{capitalize(agent.name)}</h2>
                {d.agencyName && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <Building2 size={12} className="text-[#27AE60]" />
                    <span className="text-[#27AE60] text-xs font-semibold">{d.agencyName}</span>
                  </div>
                )}
              </div>
              <div className={`shrink-0 mb-2 inline-flex items-center gap-1.5 ${statusCfg.badgeBg} border ${statusCfg.badgeBorder} ${statusCfg.badgeText} text-[10px] font-black tracking-widest uppercase px-3 py-1.5 rounded-full`}>
                <StatusIcon size={11} />
                {statusCfg.label}
              </div>
            </div>
          </div>

          <div className="px-6 space-y-5 pb-6">
            {/* Bio */}
            {d.bio && (
              <p className="text-gray-500 text-sm leading-relaxed border-l-2 border-[#27AE60]/30 pl-3">{d.bio}</p>
            )}

            <div className="h-px bg-gradient-to-r from-[#27AE60]/20 to-transparent" />

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: <TrendingUp size={14} />, label: "Experience", value: d.experienceYears ? `${d.experienceYears} yrs` : "—" },
                { icon: <Star size={14} />, label: "Deals Closed", value: d.dealsClosed ?? "—" },
                { icon: <Home size={14} />, label: "Properties", value: d.stats?.totalProperties ?? "—" },
              ].map((s) => (
                <div key={s.label} className="bg-[#f0fdf4] border border-[#27AE60]/12 rounded-2xl p-3 text-center">
                  <div className="w-7 h-7 rounded-xl bg-white border border-[#27AE60]/15 flex items-center justify-center text-[#27AE60] mx-auto mb-2">{s.icon}</div>
                  <p className="text-lg font-black text-[#27AE60] leading-none">{s.value}</p>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="h-px bg-gradient-to-r from-[#27AE60]/20 to-transparent" />

            {/* Contact & location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { icon: <Mail size={13} />, label: "Email", value: agent.email },
                { icon: <Phone size={13} />, label: "Phone", value: agent.phone },
                { icon: <MapPin size={13} />, label: "City", value: agent.city || d.city },
                { icon: <Hash size={13} />, label: "Pincode", value: agent.pincode },
                { icon: <MapPin size={13} />, label: "Locality", value: agent.locality },
                { icon: <MapPin size={13} />, label: "State", value: agent.state },
              ].filter((r) => r.value).map((row) => (
                <div key={row.label} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                  <div className="w-7 h-7 rounded-lg bg-white border border-[#27AE60]/15 text-[#27AE60] flex items-center justify-center shrink-0">{row.icon}</div>
                  <div>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{row.label}</p>
                    <p className="text-sm font-semibold text-gray-700 truncate">{row.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="h-px bg-gradient-to-r from-[#27AE60]/20 to-transparent" />

            {/* License & RERA */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {d.licenseNumber && (
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Award size={13} className="text-blue-500" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-500">License</p>
                  </div>
                  <p className="text-sm font-black text-gray-700">{d.licenseNumber}</p>
                  {d.licenseValidTill && (
                    <p className="text-[10px] text-gray-400 mt-1">Valid till {formatDate(d.licenseValidTill)}</p>
                  )}
                </div>
              )}
              {d.rera?.reraAgentId && (
                <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield size={13} className="text-purple-500" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-purple-500">RERA</p>
                  </div>
                  <p className="text-sm font-black text-gray-700">{d.rera.reraAgentId}</p>
                  <p className="text-[10px] mt-1 font-bold">{d.rera.isVerified ? <span className="text-[#27AE60]">✓ Verified</span> : <span className="text-amber-500">Unverified</span>}</p>
                </div>
              )}
            </div>

            {/* Languages & Areas */}
            {(d.languages?.length > 0 || d.areasServed?.length > 0) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {d.languages?.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <Languages size={12} className="text-[#27AE60]" />
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Languages</p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {d.languages.map((l) => (
                        <span key={l} className="px-2.5 py-1 rounded-full bg-[#f0fdf4] border border-[#27AE60]/20 text-[#27AE60] text-[10px] font-bold uppercase tracking-wider">{l}</span>
                      ))}
                    </div>
                  </div>
                )}
                {d.areasServed?.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <MapPin size={12} className="text-[#27AE60]" />
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Areas Served</p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {d.areasServed.map((a) => (
                        <span key={a} className="px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-bold">{a}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Dates */}
            <div className="flex items-center gap-2 text-[11px] text-gray-400">
              <CalendarDays size={12} />
              <span>Joined {formatDate(d.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3 shrink-0">
          <button onClick={onClose} className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-500 text-sm font-bold hover:bg-gray-50 transition-all">Close</button>
          <button
            onClick={() => { onClose(); setTimeout(() => onEditStatus(agent), 150); }}
            className="flex-1 py-3 rounded-2xl bg-[#27AE60] text-white text-sm font-black shadow-[0_6px_20px_rgba(39,174,96,0.3)] hover:bg-[#219653] active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Shield size={14} /> Edit Verification
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Agent Card ────────────────────────────────────────────────────────────
const AgentCard = ({ agent, index, onEditStatus, onViewDetail }) => {
  const d = agent.agentDetails || {};
  const palette = avatarShades[index % avatarShades.length];
  const statusCfg = getStatusConfig(agent.verificationStatus);
  const StatusIcon = statusCfg.icon;

  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_40px_rgba(39,174,96,0.13)] hover:-translate-y-1.5 hover:border-[#27AE60]/25 transition-all duration-300 ease-out  group flex flex-col"
      style={{ animation: "cardIn 0.45s ease both", animationDelay: `${index * 80}ms` }}
    >
      {/* Cover */}
      <div className="relative h-28 overflow-hidden shrink-0">
        {d.coverImage?.url ? (
          <img src={d.coverImage.url} alt="cover" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full" style={{ background: `linear-gradient(135deg, #27AE60${index % 2 ? "cc" : "99"}, #1a9e54)` }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

        {/* Status badge top-right */}
        <div className={`absolute top-2.5 right-2.5 inline-flex items-center gap-1 ${statusCfg.badgeBg} backdrop-blur-sm border ${statusCfg.badgeBorder} ${statusCfg.badgeText} text-[9px] font-black tracking-widest uppercase px-2 py-1 rounded-full`}>
          <StatusIcon size={9} />
          {statusCfg.label}
        </div>
      </div>

      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Avatar + name */}
        <div className="flex items-center gap-3 z-20 -mt-10">
          <div className="w-14 h-14 rounded-xl border-[3px] border-white shadow-md overflow-hidden shrink-0 bg-white">
            {d.avatar?.url ? (
              <img src={d.avatar.url} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <div className={`w-full h-full ${palette.bg} ${palette.text} flex items-center justify-center text-base font-black`}>
                {getInitials(agent.name)}
              </div>
            )}
          </div>
          <div className="min-w-0 pt-7">
            <h2 className="text-gray-800 font-black text-[14px] truncate leading-tight">{capitalize(agent.name)}</h2>
            {d.agencyName && (
              <div className="flex items-center gap-1 mt-0.5">
                <Building2 size={10} className="text-[#27AE60] shrink-0" />
                <span className="text-[#27AE60] text-[10px] font-bold truncate">{d.agencyName}</span>
              </div>
            )}
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-gray-100 via-[#27AE60]/10 to-transparent" />

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: <Briefcase size={10} />, label: "Exp", value: d.experienceYears ? `${d.experienceYears}y` : "—" },
            { icon: <Star size={10} />, label: "Deals", value: d.dealsClosed ?? "—" },
            { icon: <Home size={10} />, label: "Props", value: d.stats?.publishedCount ?? "—" },
          ].map((s) => (
            <div key={s.label} className="text-center bg-[#f8fffe] border border-[#27AE60]/08 rounded-xl py-2">
              <div className="flex items-center justify-center gap-0.5 text-[#27AE60] mb-0.5">{s.icon}</div>
              <p className="text-xs font-black text-gray-700 leading-none">{s.value}</p>
              <p className="text-[8px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className="space-y-1.5">
          {agent.email && (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[#f0faf5] border border-[#27AE60]/12 text-[#27AE60] flex items-center justify-center shrink-0">
                <Mail size={11} />
              </div>
              <span className="text-gray-500 text-[11px] truncate">{agent.email}</span>
            </div>
          )}
          {agent.phone && (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[#f0faf5] border border-[#27AE60]/12 text-[#27AE60] flex items-center justify-center shrink-0">
                <Phone size={11} />
              </div>
              <span className="text-gray-500 text-[11px]">{agent.phone}</span>
            </div>
          )}
          {(agent.city || agent.state) && (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[#f0faf5] border border-[#27AE60]/12 text-[#27AE60] flex items-center justify-center shrink-0">
                <MapPin size={11} />
              </div>
              <span className="text-gray-500 text-[11px] truncate">
                {[agent.locality, agent.city, agent.state].filter(Boolean).join(", ")}
              </span>
            </div>
          )}
        </div>

        {/* Languages */}
        {d.languages?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {d.languages.slice(0, 3).map((l) => (
              <span key={l} className="px-2 py-0.5 rounded-full bg-[#f0fdf4] border border-[#27AE60]/15 text-[#27AE60] text-[9px] font-bold uppercase">{l}</span>
            ))}
            {d.languages.length > 3 && (
              <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-400 text-[9px] font-bold">+{d.languages.length - 3}</span>
            )}
          </div>
        )}

        <div className="mt-auto pt-1 flex items-center gap-2">
          {/* View Detail */}
          <button
            onClick={() => onViewDetail(agent)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border-2 border-[#27AE60]/20 text-[#27AE60] text-[11px] font-black hover:bg-[#f0fdf4] transition-all"
          >
            <Eye size={12} /> View Profile
          </button>

          {/* Edit status */}
          <button
            onClick={() => onEditStatus(agent)}
            className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 text-gray-400 hover:text-[#27AE60] hover:bg-[#f0faf5] hover:border-[#27AE60]/20 flex items-center justify-center transition-all active:scale-90"
            title="Edit verification status"
          >
            <Shield size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Search & Filter Bar ───────────────────────────────────────────────────
const FilterBar = ({ agents, filters, setFilters }) => {
  // derive unique values from agents
  const states    = useMemo(() => [...new Set(agents.map((a) => a.state).filter(Boolean))].sort(), [agents]);
  const cities    = useMemo(() => {
    const base = agents.filter((a) => !filters.state || a.state === filters.state);
    return [...new Set(base.map((a) => a.city).filter(Boolean))].sort();
  }, [agents, filters.state]);
  const localities = useMemo(() => {
    const base = agents.filter((a) => (!filters.state || a.state === filters.state) && (!filters.city || a.city === filters.city));
    return [...new Set(base.map((a) => a.locality).filter(Boolean))].sort();
  }, [agents, filters.state, filters.city]);

  const activeCount = [filters.search, filters.state, filters.city, filters.locality, filters.pincode, filters.status].filter(Boolean).length;

  const clear = () => setFilters({ search: "", state: "", city: "", locality: "", pincode: "", status: "" });

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-3">
      {/* Top row: search + clear */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, phone…"
            value={filters.search}
            onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
            className="w-full pl-9 pr-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#27AE60] transition-colors"
          />
        </div>
        {activeCount > 0 && (
          <button onClick={clear} className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-red-50 border border-red-100 text-red-400 text-xs font-bold hover:bg-red-100 transition-all shrink-0">
            <X size={12} /> Clear ({activeCount})
          </button>
        )}
      </div>

      {/* Location + status filters */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {/* Status */}
        <Select
          icon={<Shield size={12} />}
          placeholder="All Status"
          value={filters.status}
          onChange={(v) => setFilters((p) => ({ ...p, status: v }))}
          options={Object.entries(STATUS_CONFIG).map(([k, c]) => ({ value: k, label: c.label }))}
        />
        {/* State */}
        <Select
          icon={<MapPin size={12} />}
          placeholder="All States"
          value={filters.state}
          onChange={(v) => setFilters((p) => ({ ...p, state: v, city: "", locality: "" }))}
          options={states.map((s) => ({ value: s, label: s }))}
        />
        {/* City */}
        <Select
          icon={<Building2 size={12} />}
          placeholder="All Cities"
          value={filters.city}
          onChange={(v) => setFilters((p) => ({ ...p, city: v, locality: "" }))}
          options={cities.map((c) => ({ value: c, label: c }))}
          disabled={!filters.state}
        />
        {/* Locality */}
        <Select
          icon={<MapPin size={12} />}
          placeholder="All Localities"
          value={filters.locality}
          onChange={(v) => setFilters((p) => ({ ...p, locality: v }))}
          options={localities.map((l) => ({ value: l, label: l }))}
          disabled={!filters.city}
        />
        {/* Pincode */}
        <div className="relative">
          <Hash size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Pincode"
            value={filters.pincode}
            onChange={(e) => setFilters((p) => ({ ...p, pincode: e.target.value }))}
            className="w-full pl-8 pr-3 py-2.5 text-xs border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#27AE60] transition-colors"
          />
        </div>
      </div>

      {/* Active filter chips */}
      {activeCount > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {Object.entries(filters).filter(([, v]) => v).map(([k, v]) => (
            <span key={k} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#f0fdf4] border border-[#27AE60]/20 text-[#27AE60] text-[10px] font-bold uppercase tracking-wide">
              {k}: {v}
              <button onClick={() => setFilters((p) => ({ ...p, [k]: k === "city" ? "" : k === "locality" ? "" : "" }))}
                className="hover:text-red-400 transition-colors">
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

// tiny reusable select
const Select = ({ icon, placeholder, value, onChange, options, disabled }) => (
  <div className="relative">
    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">{icon}</div>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={`w-full pl-8 pr-6 py-2.5 text-xs border-2 rounded-xl focus:outline-none transition-colors appearance-none ${disabled ? "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed" : "border-gray-200 focus:border-[#27AE60] bg-white text-gray-700"} ${value ? "border-[#27AE60]/40 bg-[#f0fdf4] text-[#27AE60] font-bold" : ""}`}
    >
      <option value="">{placeholder}</option>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
    <ChevronDown size={10} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
  </div>
);

// ─── Main Component ────────────────────────────────────────────────────────
const AllAgents = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingAgent, setEditingAgent] = useState(null);
  const [viewingAgent, setViewingAgent] = useState(null);
  const [filters, setFilters] = useState({ search: "", state: "", city: "", locality: "", pincode: "", status: "" });

  useEffect(() => { fetchAgents(); }, []);

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

  const handleStatusSaved = (agentId, newStatus) => {
    setAgents((prev) => prev.map((a) => a.agentId === agentId ? { ...a, verificationStatus: newStatus } : a));
  };

  // Apply all filters client-side
  const filtered = useMemo(() => {
    const q = filters.search.toLowerCase();
    return agents.filter((a) => {
      if (q && !`${a.name} ${a.email} ${a.phone}`.toLowerCase().includes(q)) return false;
      if (filters.status && a.verificationStatus?.toLowerCase() !== filters.status) return false;
      if (filters.state && a.state !== filters.state) return false;
      if (filters.city && a.city !== filters.city) return false;
      if (filters.locality && a.locality !== filters.locality) return false;
      if (filters.pincode && !a.pincode?.includes(filters.pincode)) return false;
      return true;
    });
  }, [agents, filters]);

  // summary counts
  const counts = useMemo(() => ({
    approved: agents.filter((a) => a.verificationStatus?.toLowerCase() === "approved").length,
    pending:  agents.filter((a) => a.verificationStatus?.toLowerCase() === "pending").length,
    rejected: agents.filter((a) => a.verificationStatus?.toLowerCase() === "rejected").length,
  }), [agents]);

  return (
    <>
      <style>{`
        @keyframes cardIn { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
        @keyframes dotBounce { 0%,80%,100% { transform:scale(0.55); opacity:0.35; } 40% { transform:scale(1); opacity:1; } }
        @keyframes modalIn { from { opacity:0; transform:scale(0.94) translateY(10px); } to { opacity:1; transform:scale(1) translateY(0); } }
      `}</style>

      {editingAgent && <VerificationModal agent={editingAgent} onClose={() => setEditingAgent(null)} onSave={handleStatusSaved} />}
      {viewingAgent && <AgentDetailModal agent={viewingAgent} onClose={() => setViewingAgent(null)} onEditStatus={setEditingAgent} />}

      <div className="min-h-screen bg-[#f5fcf8] px-4 sm:px-8 py-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-white border border-[#27AE60]/20 shadow-[0_2px_8px_rgba(39,174,96,0.1)] flex items-center justify-center text-[#27AE60]">
              <UsersIcon size={20} />
            </div>
            <div>
              <p className="text-[#000000] text-[10px] tracking-[3px] uppercase mb-0.5">Team Directory</p>
              <h1 className="text-[#27AE60] text-[22px] leading-none tracking-tight">All Agents</h1>
            </div>
          </div>
          {!loading && agents.length > 0 && (
            <div className="flex flex-col items-end">
              <span className="text-[36px] font-extrabold text-[#27AE60] leading-none">{agents.length.toString().padStart(2, "0")}</span>
              <span className="text-[10px] text-gray-400 tracking-[2px] uppercase font-medium">Total</span>
            </div>
          )}
        </div>
        <p className="text-[#000000] text-[13px] ml-[58px] mb-4">Manage and view all active agents</p>

        {/* Status summary pills */}
        {!loading && agents.length > 0 && (
          <div className="flex flex-wrap gap-2 ml-[58px] mb-5">
            {Object.entries(counts).map(([key, count]) => {
              const cfg = STATUS_CONFIG[key];
              const Icon = cfg.icon;
              return (
                <button
                  key={key}
                  onClick={() => setFilters((p) => ({ ...p, status: p.status === key ? "" : key }))}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all ${filters.status === key ? `${cfg.bg} ${cfg.border} ${cfg.text}` : "bg-white border-gray-200 text-gray-500 hover:border-[#27AE60]/30"}`}
                >
                  <Icon size={10} /> {cfg.label} {count}
                </button>
              );
            })}
          </div>
        )}

        <div className="h-px bg-gradient-to-r from-[#27AE60]/25 via-[#27AE60]/8 to-transparent mb-5" />

        {/* Filter bar */}
        {!loading && agents.length > 0 && (
          <div className="mb-6">
            <FilterBar agents={agents} filters={filters} setFilters={setFilters} />
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-28 gap-5">
            <div className="flex gap-2.5">
              {[0, 1, 2].map((i) => (
                <span key={i} className="w-2.5 h-2.5 rounded-full bg-[#27AE60]"
                  style={{ animation: "dotBounce 1.2s infinite ease-in-out", animationDelay: `${i * 0.18}s`, boxShadow: "0 0 6px rgba(39,174,96,0.4)" }} />
              ))}
            </div>
            <p className="text-[#27AE60]/50 text-[11px] tracking-[3px] uppercase font-semibold">Loading Agents…</p>
          </div>
        ) : agents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white border border-[#27AE60]/15 shadow-sm flex items-center justify-center text-[#27AE60]">
              <UsersIcon size={28} />
            </div>
            <p className="text-gray-400 text-sm tracking-[2px] uppercase font-medium">No Agents Found</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-300">
              <Search size={24} />
            </div>
            <p className="text-gray-400 text-sm font-semibold">No agents match your filters</p>
            <button onClick={() => setFilters({ search: "", state: "", city: "", locality: "", pincode: "", status: "" })}
              className="px-4 py-2 rounded-xl bg-[#27AE60] text-white text-xs font-bold shadow-[0_4px_12px_rgba(39,174,96,0.3)] hover:bg-[#219653] transition-all">
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            {/* Result count */}
            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mb-4">
              Showing {filtered.length} of {agents.length} agents
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((agent, idx) => (
                <AgentCard
                  key={agent._id || agent.agentId}
                  agent={agent}
                  index={idx}
                  onEditStatus={setEditingAgent}
                  onViewDetail={setViewingAgent}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default AllAgents;  

