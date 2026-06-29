// frontend/admin-dashboard/src/pages/users/AllUserInDetails/EachUserCompoents/RoleUsers.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getUserSearch } from "../../../../features/user/userService";
import {
  Mail,
  Phone,
  Shield,
  UsersIcon,
  ChevronDown,
  X,
  MapPin,
  Building2,
  Search,
  Hash,
  Eye,
  ExternalLink,
  HardHat,
  HeadphonesIcon,
  BookOpenCheck,
  UserCheck,
  TrendingUp,
  CalendarDays,
  MessageSquareText,
} from "lucide-react";

// ─── Role Config ──────────────────────────────────────────────────────────────
//  Each role gets its own: label, icon, accent colour, avatar palette, badge text
const ROLE_CONFIG = {
  sales_manager: {
    label: "Sales Manager",
    shortLabel: "SM",
    icon: TrendingUp,
    accent: "#27AE60",
    accentLight: "#f0fdf4",
    accentBorder: "#27AE60",
    gradientFrom: "#27AE60",
    gradientTo: "#1a9e54",
    avatarBg: "bg-[#e8f8ef]",
    avatarText: "text-[#27AE60]",
    avatarBorder: "border-[#27AE60]/25",
    badgeBg: "bg-[#e8f8ef]",
    badgeText: "text-[#27AE60]",
    badgeBorder: "border-[#27AE60]/25",
    cardHover:
      "hover:border-[#27AE60]/25 hover:shadow-[0_12px_40px_rgba(39,174,96,0.13)]",
    btnBorder: "border-[#27AE60]/20",
    btnText: "text-[#27AE60]",
    btnHover: "hover:bg-[#f0fdf4]",
    inputFocus: "focus:border-[#27AE60]",
    selectActive: "border-[#27AE60]/40 bg-[#f0fdf4] text-[#27AE60]",
    dotColor: "bg-[#27AE60]",
    dotShadow: "rgba(39,174,96,0.4)",
    loadingText: "text-[#27AE60]/50",
    divider: "from-[#27AE60]/25 via-[#27AE60]/8",
    saveBg: "bg-[#27AE60]",
    saveHover: "hover:bg-[#219653]",
    saveShadow: "shadow-[0_6px_20px_rgba(39,174,96,0.3)]",
    iconBg: "bg-[#f0faf5]",
    iconBorder: "border-[#27AE60]/12",
    statBg: "bg-[#f8fffe]",
    statBorder: "border-[#27AE60]/08",
  },
  sales_agent: {
    label: "Sales Executive",
    shortLabel: "SA",
    icon: UserCheck,
    // accent: "#2563EB",
    // accentLight: "#eff6ff",
    // accentBorder: "#2563EB",
    // gradientFrom: "#2563EB",
    // gradientTo: "#1d4ed8",
    // avatarBg: "bg-[#dbeafe]",
    // avatarText: "text-[#2563EB]",
    // avatarBorder: "border-[#2563EB]/25",
    // badgeBg: "bg-[#dbeafe]",
    // badgeText: "text-[#2563EB]",
    // badgeBorder: "border-[#2563EB]/25",
    // cardHover:
    //   "hover:border-[#2563EB]/25 hover:shadow-[0_12px_40px_rgba(37,99,235,0.13)]",
    // btnBorder: "border-[#2563EB]/20",
    // btnText: "text-[#2563EB]",
    // btnHover: "hover:bg-[#eff6ff]",
    // inputFocus: "focus:border-[#2563EB]",
    // selectActive: "border-[#2563EB]/40 bg-[#eff6ff] text-[#2563EB]",
    // dotColor: "bg-[#2563EB]",
    // dotShadow: "rgba(37,99,235,0.4)",
    // loadingText: "text-[#2563EB]/50",
    // divider: "from-[#2563EB]/25 via-[#2563EB]/8",
    // saveBg: "bg-[#2563EB]",
    // saveHover: "hover:bg-[#1d4ed8]",
    // saveShadow: "shadow-[0_6px_20px_rgba(37,99,235,0.3)]",
    // iconBg: "bg-[#eff6ff]",
    // iconBorder: "border-[#2563EB]/12",
    // statBg: "bg-[#f0f4ff]",
    // statBorder: "border-[#2563EB]/08",
    accent: "#27AE60",
    accentLight: "#f0fdf4",
    accentBorder: "#27AE60",
    gradientFrom: "#27AE60",
    gradientTo: "#1a9e54",
    avatarBg: "bg-[#e8f8ef]",
    avatarText: "text-[#27AE60]",
    avatarBorder: "border-[#27AE60]/25",
    badgeBg: "bg-[#e8f8ef]",
    badgeText: "text-[#27AE60]",
    badgeBorder: "border-[#27AE60]/25",
    cardHover:
      "hover:border-[#27AE60]/25 hover:shadow-[0_12px_40px_rgba(39,174,96,0.13)]",
    btnBorder: "border-[#27AE60]/20",
    btnText: "text-[#27AE60]",
    btnHover: "hover:bg-[#f0fdf4]",
    inputFocus: "focus:border-[#27AE60]",
    selectActive: "border-[#27AE60]/40 bg-[#f0fdf4] text-[#27AE60]",
    dotColor: "bg-[#27AE60]",
    dotShadow: "rgba(39,174,96,0.4)",
    loadingText: "text-[#27AE60]/50",
    divider: "from-[#27AE60]/25 via-[#27AE60]/8",
    saveBg: "bg-[#27AE60]",
    saveHover: "hover:bg-[#219653]",
    saveShadow: "shadow-[0_6px_20px_rgba(39,174,96,0.3)]",
    iconBg: "bg-[#f0faf5]",
    iconBorder: "border-[#27AE60]/12",
    statBg: "bg-[#f8fffe]",
    statBorder: "border-[#27AE60]/08",
  },
  builder: {
    label: "Builder",
    shortLabel: "BLD",
    icon: HardHat,
    //
    accent: "#27AE60",
    accentLight: "#f0fdf4",
    accentBorder: "#27AE60",
    gradientFrom: "#27AE60",
    gradientTo: "#1a9e54",
    avatarBg: "bg-[#e8f8ef]",
    avatarText: "text-[#27AE60]",
    avatarBorder: "border-[#27AE60]/25",
    badgeBg: "bg-[#e8f8ef]",
    badgeText: "text-[#27AE60]",
    badgeBorder: "border-[#27AE60]/25",
    cardHover:
      "hover:border-[#27AE60]/25 hover:shadow-[0_12px_40px_rgba(39,174,96,0.13)]",
    btnBorder: "border-[#27AE60]/20",
    btnText: "text-[#27AE60]",
    btnHover: "hover:bg-[#f0fdf4]",
    inputFocus: "focus:border-[#27AE60]",
    selectActive: "border-[#27AE60]/40 bg-[#f0fdf4] text-[#27AE60]",
    dotColor: "bg-[#27AE60]",
    dotShadow: "rgba(39,174,96,0.4)",
    loadingText: "text-[#27AE60]/50",
    divider: "from-[#27AE60]/25 via-[#27AE60]/8",
    saveBg: "bg-[#27AE60]",
    saveHover: "hover:bg-[#219653]",
    saveShadow: "shadow-[0_6px_20px_rgba(39,174,96,0.3)]",
    iconBg: "bg-[#f0faf5]",
    iconBorder: "border-[#27AE60]/12",
    statBg: "bg-[#f8fffe]",
    statBorder: "border-[#27AE60]/08",
  },
  accounts: {
    label: "Accounts",
    shortLabel: "ACC",
    icon: BookOpenCheck,
    // accent: "#7C3AED",
    // accentLight: "#f5f3ff",
    // accentBorder: "#7C3AED",
    // gradientFrom: "#7C3AED",
    // gradientTo: "#6d28d9",
    // avatarBg: "bg-[#ede9fe]",
    // avatarText: "text-[#7C3AED]",
    // avatarBorder: "border-[#7C3AED]/25",
    // badgeBg: "bg-[#ede9fe]",
    // badgeText: "text-[#7C3AED]",
    // badgeBorder: "border-[#7C3AED]/25",
    // cardHover:
    //   "hover:border-[#7C3AED]/25 hover:shadow-[0_12px_40px_rgba(124,58,237,0.13)]",
    // btnBorder: "border-[#7C3AED]/20",
    // btnText: "text-[#7C3AED]",
    // btnHover: "hover:bg-[#f5f3ff]",
    // inputFocus: "focus:border-[#7C3AED]",
    // selectActive: "border-[#7C3AED]/40 bg-[#f5f3ff] text-[#7C3AED]",
    // dotColor: "bg-[#7C3AED]",
    // dotShadow: "rgba(124,58,237,0.4)",
    // loadingText: "text-[#7C3AED]/50",
    // divider: "from-[#7C3AED]/25 via-[#7C3AED]/8",
    // saveBg: "bg-[#7C3AED]",
    // saveHover: "hover:bg-[#6d28d9]",
    // saveShadow: "shadow-[0_6px_20px_rgba(124,58,237,0.3)]",
    // iconBg: "bg-[#f5f3ff]",
    // iconBorder: "border-[#7C3AED]/12",
    // statBg: "bg-[#faf8ff]",
    // statBorder: "border-[#7C3AED]/08",
    accent: "#27AE60",
    accentLight: "#f0fdf4",
    accentBorder: "#27AE60",
    gradientFrom: "#27AE60",
    gradientTo: "#1a9e54",
    avatarBg: "bg-[#e8f8ef]",
    avatarText: "text-[#27AE60]",
    avatarBorder: "border-[#27AE60]/25",
    badgeBg: "bg-[#e8f8ef]",
    badgeText: "text-[#27AE60]",
    badgeBorder: "border-[#27AE60]/25",
    cardHover:
      "hover:border-[#27AE60]/25 hover:shadow-[0_12px_40px_rgba(39,174,96,0.13)]",
    btnBorder: "border-[#27AE60]/20",
    btnText: "text-[#27AE60]",
    btnHover: "hover:bg-[#f0fdf4]",
    inputFocus: "focus:border-[#27AE60]",
    selectActive: "border-[#27AE60]/40 bg-[#f0fdf4] text-[#27AE60]",
    dotColor: "bg-[#27AE60]",
    dotShadow: "rgba(39,174,96,0.4)",
    loadingText: "text-[#27AE60]/50",
    divider: "from-[#27AE60]/25 via-[#27AE60]/8",
    saveBg: "bg-[#27AE60]",
    saveHover: "hover:bg-[#219653]",
    saveShadow: "shadow-[0_6px_20px_rgba(39,174,96,0.3)]",
    iconBg: "bg-[#f0faf5]",
    iconBorder: "border-[#27AE60]/12",
    statBg: "bg-[#f8fffe]",
    statBorder: "border-[#27AE60]/08",
  },
  customer_care: {
    label: "Customer Care",
    shortLabel: "CC",
    icon: HeadphonesIcon,
    // accent: "#0891B2",
    // accentLight: "#ecfeff",
    // accentBorder: "#0891B2",
    // gradientFrom: "#0891B2",
    // gradientTo: "#0e7490",
    // avatarBg: "bg-[#cffafe]",
    // avatarText: "text-[#0891B2]",
    // avatarBorder: "border-[#0891B2]/25",
    // badgeBg: "bg-[#cffafe]",
    // badgeText: "text-[#0891B2]",
    // badgeBorder: "border-[#0891B2]/25",
    // cardHover:
    //   "hover:border-[#0891B2]/25 hover:shadow-[0_12px_40px_rgba(8,145,178,0.13)]",
    // btnBorder: "border-[#0891B2]/20",
    // btnText: "text-[#0891B2]",
    // btnHover: "hover:bg-[#ecfeff]",
    // inputFocus: "focus:border-[#0891B2]",
    // selectActive: "border-[#0891B2]/40 bg-[#ecfeff] text-[#0891B2]",
    // dotColor: "bg-[#0891B2]",
    // dotShadow: "rgba(8,145,178,0.4)",
    // loadingText: "text-[#0891B2]/50",
    // divider: "from-[#0891B2]/25 via-[#0891B2]/8",
    // saveBg: "bg-[#0891B2]",
    // saveHover: "hover:bg-[#0e7490]",
    // saveShadow: "shadow-[0_6px_20px_rgba(8,145,178,0.3)]",
    // iconBg: "bg-[#ecfeff]",
    // iconBorder: "border-[#0891B2]/12",
    // statBg: "bg-[#f0fbff]",
    // statBorder: "border-[#0891B2]/08",
    accent: "#27AE60",
    accentLight: "#f0fdf4",
    accentBorder: "#27AE60",
    gradientFrom: "#27AE60",
    gradientTo: "#1a9e54",
    avatarBg: "bg-[#e8f8ef]",
    avatarText: "text-[#27AE60]",
    avatarBorder: "border-[#27AE60]/25",
    badgeBg: "bg-[#e8f8ef]",
    badgeText: "text-[#27AE60]",
    badgeBorder: "border-[#27AE60]/25",
    cardHover:
      "hover:border-[#27AE60]/25 hover:shadow-[0_12px_40px_rgba(39,174,96,0.13)]",
    btnBorder: "border-[#27AE60]/20",
    btnText: "text-[#27AE60]",
    btnHover: "hover:bg-[#f0fdf4]",
    inputFocus: "focus:border-[#27AE60]",
    selectActive: "border-[#27AE60]/40 bg-[#f0fdf4] text-[#27AE60]",
    dotColor: "bg-[#27AE60]",
    dotShadow: "rgba(39,174,96,0.4)",
    loadingText: "text-[#27AE60]/50",
    divider: "from-[#27AE60]/25 via-[#27AE60]/8",
    saveBg: "bg-[#27AE60]",
    saveHover: "hover:bg-[#219653]",
    saveShadow: "shadow-[0_6px_20px_rgba(39,174,96,0.3)]",
    iconBg: "bg-[#f0faf5]",
    iconBorder: "border-[#27AE60]/12",
    statBg: "bg-[#f8fffe]",
    statBorder: "border-[#27AE60]/08",
  },
};

const getRoleCfg = (role) => ROLE_CONFIG[role] || ROLE_CONFIG.sales_manager;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getInitials = (name = "") =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

const capitalize = (str = "") =>
  str
    .split(" ")
    .map((n) => n.charAt(0).toUpperCase() + n.slice(1))
    .join(" ");

const formatCreatedAt = (createdAt) => {
  if (!createdAt) return "Not available";

  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return "Not available";

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const formatKycStatus = (status) =>
  status ? capitalize(status.replace(/_/g, " ")) : "Not available";

const getCompanyName = (user) =>
  user?.companyName?.trim() || "Builder not added or Backend not added";

// ─── User Detail Modal ────────────────────────────────────────────────────────
const UserDetailModal = ({ user, role, onClose, onWorkInProgress }) => {
  const cfg = getRoleCfg(role);
  const RoleIcon = cfg.icon;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(6px)",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[92vh] flex flex-col"
        style={{ animation: "modalIn 0.3s ease both" }}
      >
        {/* Accent bar */}
        <div
          className="h-1 w-full shrink-0"
          style={{
            background: `linear-gradient(to right, ${cfg.gradientFrom}, ${cfg.gradientTo}, ${cfg.gradientFrom}66)`,
          }}
        />

        {/* Header */}
        <div className="px-6 pt-5 pb-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div
              className={`w-16 h-16 rounded-2xl ${cfg.avatarBg} ${cfg.avatarText} flex items-center justify-center text-2xl font-black border-2 ${cfg.avatarBorder} shadow-sm shrink-0`}
            >
              {getInitials(user.name)}
            </div>
            <div>
              <h2 className="text-gray-800 font-black text-xl leading-tight">
                {capitalize(user.name)}
              </h2>
              <div className="flex items-center gap-1.5 mt-1">
                <span
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: cfg.accent }}
                />
                <span
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: cfg.accent }}
                >
                  {cfg.label}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 text-gray-400 hover:text-gray-600 hover:bg-gray-100 flex items-center justify-center transition-colors shrink-0"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1">
          <div className="px-6 space-y-4 pb-6">
            <div
              className="h-px"
              style={{
                background: `linear-gradient(to right, ${cfg.gradientFrom}33, transparent)`,
              }}
            />

            {/* Info grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { icon: <Mail size={13} />, label: "Email", value: user.email },
                {
                  icon: <Phone size={13} />,
                  label: "Phone",
                  value: user.phone,
                },
                {
                  icon: <Building2 size={13} />,
                  label: "City",
                  value: user.city,
                },
                {
                  icon: <MapPin size={13} />,
                  label: "Locality",
                  value: user.locality,
                },
                {
                  icon: <MapPin size={13} />,
                  label: "State",
                  value: user.state,
                },
                {
                  icon: <Hash size={13} />,
                  label: "Pincode",
                  value: user.pincode,
                },
                ...(role === "builder"
                  ? [
                      {
                        icon: <Building2 size={13} />,
                        label: "Company Name",
                        value: getCompanyName(user),
                      },
                    ]
                  : []),
              ]
                .filter((r) => r.value)
                .map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100"
                  >
                    <div
                      className="w-7 h-7 rounded-lg bg-white border flex items-center justify-center shrink-0"
                      style={{
                        borderColor: `${cfg.accent}25`,
                        color: cfg.accent,
                      }}
                    >
                      {row.icon}
                    </div>
                    <div>
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                        {row.label}
                      </p>
                      <p className="text-sm font-semibold text-gray-700 truncate">
                        {row.value}
                      </p>
                    </div>
                  </div>
                ))}
            </div>

            {/* Role block */}
            <div
              className="rounded-2xl p-4 border"
              style={{
                backgroundColor: cfg.accentLight,
                borderColor: `${cfg.accent}25`,
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <RoleIcon size={13} style={{ color: cfg.accent }} />
                <p
                  className="text-[10px] font-black uppercase tracking-widest"
                  style={{ color: cfg.accent }}
                >
                  Role
                </p>
              </div>
              <p className="text-sm font-black text-gray-700 capitalize">
                {user.role?.replace(/_/g, " ") || cfg.label}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3 shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-500 text-sm font-bold hover:bg-gray-50 transition-all"
          >
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              setTimeout(() => onWorkInProgress(user.userId || user._id), 150);
            }}
            className={`flex-1 py-3 rounded-2xl text-white text-sm font-black active:scale-95 transition-all flex items-center justify-center gap-2 ${cfg.saveBg} ${cfg.saveHover} ${cfg.saveShadow}`}
          >
            <ExternalLink size={14} /> Work in Progress
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── User Card ────────────────────────────────────────────────────────────────
const UserCard = ({ user, role, index, onViewDetail, onWorkInProgress }) => {
  const cfg = getRoleCfg(role);
  const RoleIcon = cfg.icon;

  // Cycle avatar shades slightly per index
  const shadeOffset = index % 3;
  const avatarStyle =
    shadeOffset === 0
      ? { bg: cfg.avatarBg, text: cfg.avatarText, border: cfg.avatarBorder }
      : shadeOffset === 1
        ? { bg: cfg.avatarBg, text: cfg.avatarText, border: cfg.avatarBorder }
        : { bg: cfg.avatarBg, text: cfg.avatarText, border: cfg.avatarBorder };

  return (
    <div
      className={`bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.05)] ${cfg.cardHover} hover:-translate-y-1.5 transition-all duration-300 ease-out group flex flex-col`}
      style={{
        animation: "cardIn 0.45s ease both",
        animationDelay: `${index * 80}ms`,
      }}
    >
      {/* Accent bar */}
      <div
        className="h-1.5 w-full shrink-0"
        style={{
          background: `linear-gradient(to right, ${cfg.gradientFrom}, ${cfg.gradientTo}, ${cfg.gradientFrom}66)`,
        }}
      />

      <div className="p-5 flex flex-col gap-3 flex-1">
        {/* Avatar + name row */}
        <div className="flex items-center gap-3">
          <div
            className={`w-14 h-14 rounded-xl shrink-0 ${avatarStyle.bg} ${avatarStyle.text} border-2 ${avatarStyle.border} flex items-center justify-center text-lg font-black shadow-sm group-hover:scale-105 transition-transform duration-300`}
          >
            {getInitials(user.name)}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-gray-800 font-black text-[14px] truncate leading-tight">
              {capitalize(user.name)}
            </h2>
            <div className="flex items-center gap-1 mt-1">
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse shrink-0"
                style={{ backgroundColor: cfg.accent }}
              />
              <span
                className="text-[10px] font-bold truncate uppercase tracking-wider"
                style={{ color: cfg.accent }}
              >
                {cfg.label}
              </span>
            </div>
          </div>
          {/* Short badge */}
          <div
            className={`shrink-0 inline-flex items-center gap-1 ${cfg.badgeBg} border ${cfg.badgeBorder} ${cfg.badgeText} text-[9px] font-black tracking-widest uppercase px-2 py-1 rounded-full`}
          >
            <RoleIcon size={8} />
            {cfg.shortLabel}
          </div>
        </div>

        <div
          className="h-px"
          style={{
            background: `linear-gradient(to right, #f3f4f6, ${cfg.gradientFrom}1a, transparent)`,
          }}
        />

        {/* Contact info */}
        <div className="space-y-1.5">
          {user.email && (
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-lg ${cfg.iconBg} border ${cfg.iconBorder} flex items-center justify-center shrink-0`}
                style={{ color: cfg.accent }}
              >
                <Mail size={11} />
              </div>
              <span className="text-gray-500 text-[11px] truncate">
                {user.email}
              </span>
            </div>
          )}
          {user.phone && (
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-lg ${cfg.iconBg} border ${cfg.iconBorder} flex items-center justify-center shrink-0`}
                style={{ color: cfg.accent }}
              >
                <Phone size={11} />
              </div>
              <span className="text-gray-500 text-[11px]">{user.phone}</span>
            </div>
          )}
          {(user.city || user.state) && (
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-lg ${cfg.iconBg} border ${cfg.iconBorder} flex items-center justify-center shrink-0`}
                style={{ color: cfg.accent }}
              >
                <MapPin size={11} />
              </div>
              <span className="text-gray-500 text-[11px] truncate">
                {[user.locality, user.city, user.state]
                  .filter(Boolean)
                  .join(", ")}
              </span>
            </div>
          )}
          {user.pincode && (
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-lg ${cfg.iconBg} border ${cfg.iconBorder} flex items-center justify-center shrink-0`}
                style={{ color: cfg.accent }}
              >
                <Hash size={11} />
              </div>
              <span className="text-gray-500 text-[11px]">{user.pincode}</span>
            </div>
          )}
          {role === "builder" && (
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-lg ${cfg.iconBg} border ${cfg.iconBorder} flex items-center justify-center shrink-0`}
                style={{ color: cfg.accent }}
              >
                <Building2 size={11} />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                  Company Name
                </p>
                <p className="text-gray-500 text-[11px] truncate">
                  {getCompanyName(user)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Account and KYC details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="flex items-start gap-2 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5">
            <CalendarDays
              size={13}
              className="mt-0.5 shrink-0"
              style={{ color: cfg.accent }}
            />
            <div className="min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                Created At
              </p>
              <p className="text-[11px] font-semibold text-gray-600">
                {formatCreatedAt(user.createdAt)}
              </p>
            </div>
          </div>

          {role !== "builder" && (
            <>
              <div className="flex items-start gap-2 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5">
                <Shield
                  size={13}
                  className="mt-0.5 shrink-0"
                  style={{ color: cfg.accent }}
                />
                <div className="min-w-0">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                    KYC Status
                  </p>
                  <p className="text-[11px] font-semibold text-gray-600">
                    {formatKycStatus(user.kycStatus)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5 sm:col-span-2">
                <MessageSquareText
                  size={13}
                  className="mt-0.5 shrink-0"
                  style={{ color: cfg.accent }}
                />
                <div className="min-w-0">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                    KYC Reason
                  </p>
                  <p className="text-[11px] font-semibold text-gray-600 break-words">
                    {user.kycReason?.trim() || "No reason provided"}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Buttons */}
        <div className="mt-auto pt-1 flex items-center gap-2">
          <button
            onClick={() => onViewDetail(user)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border-2 ${cfg.btnBorder} ${cfg.btnText} text-[11px] font-black ${cfg.btnHover} transition-all`}
          >
            <Eye size={12} /> View Profile
          </button>
          <button
            onClick={() => onWorkInProgress(user.userId || user._id)}
            className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 text-gray-400 hover:border-opacity-50 flex items-center justify-center transition-all active:scale-90"
            style={{ "--hover-color": cfg.accent }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = cfg.accent;
              e.currentTarget.style.backgroundColor = cfg.accentLight;
              e.currentTarget.style.borderColor = `${cfg.accent}33`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "";
              e.currentTarget.style.backgroundColor = "";
              e.currentTarget.style.borderColor = "";
            }}
            title={`Open ${cfg.label} profile`}
          >
            <ExternalLink size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Select ───────────────────────────────────────────────────────────────────
const Select = ({
  icon,
  placeholder,
  value,
  onChange,
  options,
  disabled,
  accentClass,
  activeClass,
}) => (
  <div className="relative">
    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
      {icon}
    </div>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={`w-full pl-8 pr-6 py-2.5 text-xs border-2 rounded-xl focus:outline-none transition-colors appearance-none ${
        disabled
          ? "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed"
          : `border-gray-200 ${accentClass} bg-white text-gray-700`
      } ${value ? activeClass : ""}`}
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
    <ChevronDown
      size={10}
      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
    />
  </div>
);

// ─── Filter Bar ───────────────────────────────────────────────────────────────
const FilterBar = ({ users, filters, setFilters, cfg }) => {
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

  const activeCount = [
    filters.search,
    filters.state,
    filters.city,
    filters.locality,
    filters.pincode,
  ].filter(Boolean).length;
  const clear = () =>
    setFilters({ search: "", state: "", city: "", locality: "", pincode: "" });

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-3">
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search by name, email, phone…"
            value={filters.search}
            onChange={(e) =>
              setFilters((p) => ({ ...p, search: e.target.value }))
            }
            className={`w-full pl-9 pr-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:outline-none ${cfg.inputFocus} transition-colors`}
          />
        </div>
        {activeCount > 0 && (
          <button
            onClick={clear}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-red-50 border border-red-100 text-red-400 text-xs font-bold hover:bg-red-100 transition-all shrink-0"
          >
            <X size={12} /> Clear ({activeCount})
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        <Select
          icon={<MapPin size={12} />}
          placeholder="All States"
          value={filters.state}
          onChange={(v) =>
            setFilters((p) => ({ ...p, state: v, city: "", locality: "" }))
          }
          options={states.map((s) => ({ value: s, label: s }))}
          accentClass={cfg.inputFocus}
          activeClass={cfg.selectActive}
        />
        <Select
          icon={<Building2 size={12} />}
          placeholder="All Cities"
          value={filters.city}
          onChange={(v) => setFilters((p) => ({ ...p, city: v, locality: "" }))}
          options={cities.map((c) => ({ value: c, label: c }))}
          disabled={!filters.state}
          accentClass={cfg.inputFocus}
          activeClass={cfg.selectActive}
        />
        <Select
          icon={<MapPin size={12} />}
          placeholder="All Localities"
          value={filters.locality}
          onChange={(v) => setFilters((p) => ({ ...p, locality: v }))}
          options={localities.map((l) => ({ value: l, label: l }))}
          disabled={!filters.city}
          accentClass={cfg.inputFocus}
          activeClass={cfg.selectActive}
        />
        <div className="relative">
          <Hash
            size={12}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Pincode"
            value={filters.pincode}
            onChange={(e) =>
              setFilters((p) => ({ ...p, pincode: e.target.value }))
            }
            className={`w-full pl-8 pr-3 py-2.5 text-xs border-2 border-gray-200 rounded-xl focus:outline-none ${cfg.inputFocus} transition-colors`}
          />
        </div>
      </div>

      {activeCount > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {Object.entries(filters)
            .filter(([, v]) => v)
            .map(([k, v]) => (
              <span
                key={k}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wide"
                style={{
                  backgroundColor: cfg.accentLight,
                  borderColor: `${cfg.accent}33`,
                  color: cfg.accent,
                }}
              >
                {k}: {v}
                <button
                  onClick={() => setFilters((p) => ({ ...p, [k]: "" }))}
                  className="hover:text-red-400 transition-colors"
                >
                  <X size={10} />
                </button>
              </span>
            ))}
        </div>
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const RoleUsers = ({ role = "sales_manager" }) => {
  const navigate = useNavigate();
  const cfg = getRoleCfg(role);
  const RoleIcon = cfg.icon;

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingUser, setViewingUser] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    state: "",
    city: "",
    locality: "",
    pincode: "",
  });

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await getUserSearch(role);
        setUsers(response?.data?.results || []);
      } catch (err) {
        console.error(`Failed to fetch ${role}:`, err);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [role]);

  const handleWorkInProgress = (id) => navigate(`/dashboard/users/${id}`);

  const filtered = useMemo(() => {
    const q = filters.search.toLowerCase();
    return users.filter((u) => {
      if (q && !`${u.name} ${u.email} ${u.phone}`.toLowerCase().includes(q))
        return false;
      if (filters.state && u.state !== filters.state) return false;
      if (filters.city && u.city !== filters.city) return false;
      if (filters.locality && u.locality !== filters.locality) return false;
      if (filters.pincode && !u.pincode?.includes(filters.pincode))
        return false;
      return true;
    });
  }, [users, filters]);

  // Page background tint per role
  const pageBg =
    {
      sales_manager: "bg-[#f5fcf8]",
      sales_agent: "bg-[#f0f6ff]",
      builder: "bg-[#fffdf0]",
      accounts: "bg-[#faf8ff]",
      customer_care: "bg-[#f0fbff]",
    }[role] || "bg-[#f5fcf8]";

  return (
    <>
      <style>{`
        @keyframes cardIn  { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
        @keyframes dotBounce { 0%,80%,100%{transform:scale(0.55);opacity:0.35;} 40%{transform:scale(1);opacity:1;} }
        @keyframes modalIn { from{opacity:0;transform:scale(0.94) translateY(10px);} to{opacity:1;transform:scale(1) translateY(0);} }
      `}</style>

      {viewingUser && (
        <UserDetailModal
          user={viewingUser}
          role={role}
          onClose={() => setViewingUser(null)}
          onWorkInProgress={handleWorkInProgress}
        />
      )}

      <div className={`min-h-screen ${pageBg} px-4 sm:px-8 py-6`}>
        {/* ── Header ── */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-3.5">
            <div
              className="w-11 h-11 rounded-xl bg-white border shadow-[0_2px_8px_rgba(0,0,0,0.07)] flex items-center justify-center shrink-0"
              style={{ borderColor: `${cfg.accent}33`, color: cfg.accent }}
            >
              <RoleIcon size={20} />
            </div>
            <div>
              <p className="text-[10px] text-black tracking-[3px] uppercase mb-0.5">
                Team Directory
              </p>
              <h1
                className="text-[22px] leading-none tracking-tight font-extrabold"
                style={{ color: cfg.accent }}
              >
                {cfg.label}s
              </h1>
            </div>
          </div>
          {!loading && users.length > 0 && (
            <div className="flex flex-col items-end">
              <span
                className="text-[36px] font-extrabold leading-none"
                style={{ color: cfg.accent }}
              >
                {users.length.toString().padStart(2, "0")}
              </span>
              <span className="text-[10px] text-gray-400 tracking-[2px] uppercase font-medium">
                Total
              </span>
            </div>
          )}
        </div>

        <p className="text-black text-[13px] ml-[58px] mb-4">
          Manage and view all active {cfg.label.toLowerCase()}s
        </p>

        <div
          className="h-px mb-5"
          style={{
            background: `linear-gradient(to right, ${cfg.gradientFrom}40, ${cfg.gradientFrom}14, transparent)`,
          }}
        />

        {/* Filter bar */}
        {!loading && users.length > 0 && (
          <div className="mb-6">
            <FilterBar
              users={users}
              filters={filters}
              setFilters={setFilters}
              cfg={cfg}
            />
          </div>
        )}

        {/* ── States ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-28 gap-5">
            <div className="flex gap-2.5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className={`w-2.5 h-2.5 rounded-full ${cfg.dotColor}`}
                  style={{
                    animation: "dotBounce 1.2s infinite ease-in-out",
                    animationDelay: `${i * 0.18}s`,
                    boxShadow: `0 0 6px ${cfg.dotShadow}`,
                  }}
                />
              ))}
            </div>
            <p
              className={`${cfg.loadingText} text-[11px] tracking-[3px] uppercase font-semibold`}
            >
              Loading {cfg.label}s…
            </p>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 gap-4">
            <div
              className="w-16 h-16 rounded-2xl bg-white border shadow-sm flex items-center justify-center"
              style={{ borderColor: `${cfg.accent}25`, color: cfg.accent }}
            >
              <RoleIcon size={28} />
            </div>
            <p className="text-gray-400 text-sm tracking-[2px] uppercase font-medium">
              No {cfg.label}s Found
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-300">
              <Search size={24} />
            </div>
            <p className="text-gray-400 text-sm font-semibold">
              No {cfg.label.toLowerCase()}s match your filters
            </p>
            <button
              onClick={() =>
                setFilters({
                  search: "",
                  state: "",
                  city: "",
                  locality: "",
                  pincode: "",
                })
              }
              className={`px-4 py-2 rounded-xl text-white text-xs font-bold transition-all ${cfg.saveBg} ${cfg.saveHover}`}
              style={{ boxShadow: `0 4px 12px ${cfg.dotShadow}` }}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mb-4">
              Showing {filtered.length} of {users.length}{" "}
              {cfg.label.toLowerCase()}s
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((user, idx) => (
                <UserCard
                  key={user._id || user.userId}
                  user={user}
                  role={role}
                  index={idx}
                  onViewDetail={setViewingUser}
                  onWorkInProgress={handleWorkInProgress}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default RoleUsers;
