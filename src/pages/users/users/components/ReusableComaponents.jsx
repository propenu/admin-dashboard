import { ACCOUNT_STATUS_MAP } from "../constants/accountStatusMap";
import { AVATAR_COLORS } from "../constants/avatarColors";
import { KYC_STATUS_MAP } from "../constants/kycStatusMap";
import {
  CheckCircle2,
  XCircle,
  ChevronDown,
  AlertTriangle,
} from "lucide-react";

export const Avatar = ({ name }) => {
//   const idx = (name?.charCodeAt(0) || 0) % AVATAR_COLORS.length;
const firstChar = name?.charAt(0) || "A";
const idx = firstChar.charCodeAt(0) % AVATAR_COLORS.length;
  return (
    <div
      className={`w-9 h-9 rounded-xl bg-gradient-to-br ${AVATAR_COLORS[idx]}
        flex items-center justify-center text-white text-sm font-bold shadow-sm flex-shrink-0`}
    >
      {name?.charAt(0).toUpperCase() || "?"}
    </div>
  );
};

export const AccountBadge = ({ status }) => {
  const s = ACCOUNT_STATUS_MAP[status] || {
    label: status,
    bg: "bg-gray-100",
    text: "text-gray-500",
    dot: "bg-gray-400",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${s.bg} ${s.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
};

export const KycBadge = ({ kyc }) => {
  const k = KYC_STATUS_MAP[kyc?.status] || KYC_STATUS_MAP.not_started;
  const Icon = k.icon;

  return (
    <span
      title={kyc?.remarks || ""}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold
        ${k.bg} ${k.text} ${kyc?.remarks ? "cursor-help underline decoration-dotted" : ""}`}
    >
      {Icon && <Icon className="w-3 h-3" />}
      {k.label}
      {kyc?.remarks && <AlertTriangle className="w-3 h-3 ml-0.5" />}
    </span>
  );
};

export const PhoneBadge = ({ verified }) =>
  verified ? (
    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#27AE60] bg-[#27AE60]/10 px-2 py-0.5 rounded-full">
      <CheckCircle2 className="w-3 h-3" /> Verified
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
      <XCircle className="w-3 h-3" /> Unverified
    </span>
  );

export const StatCard = ({ label, value, icon, colorClass }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
    <div
      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}
    >
      {icon}
    </div>
    <div>
      <p className="text-2xl font-extrabold text-gray-900 leading-none">
        {value}
      </p>
      <p className="text-xs text-gray-400 font-medium mt-0.5">{label}</p>
    </div>
  </div>
);

export const FilterSelect = ({ value, onChange, options, placeholder }) => (
  <div className="relative">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="pl-3 pr-8 py-2.5 text-sm rounded-xl border border-gray-200 bg-white text-gray-700
                 focus:outline-none focus:border-[#27AE60] focus:ring-4 focus:ring-[#27AE60]/10
                 shadow-sm transition-all duration-200 appearance-none cursor-pointer w-full"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
  </div>
);

export const MobileChip = ({ icon, label, span2 = false }) => (
  <div
    className={`flex items-center gap-2 text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded-xl ${span2 ? "col-span-2" : ""}`}
  >
    {icon}
    <span className="truncate font-medium">{label}</span>
  </div>
);