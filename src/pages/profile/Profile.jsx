import { useEffect, useState } from "react";
import { fetchMe } from "../../services/UserServices/userServices";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import {
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  BadgeCheck,
  Lock,
  Fingerprint,
  Activity,
} from "lucide-react";

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
function formatRole(raw = "") {
  return raw.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

const STATUS_COLOR = {
  active: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
    border: "border-emerald-200",
  },
  inactive: {
    bg: "bg-slate-100",
    text: "text-slate-500",
    dot: "bg-slate-400",
    border: "border-slate-200",
  },
  suspended: {
    bg: "bg-red-50",
    text: "text-red-600",
    dot: "bg-red-500",
    border: "border-red-200",
  },
};

const KYC_COLOR = {
  verified: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    icon: <BadgeCheck className="w-3.5 h-3.5" />,
  },
  pending: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    icon: <Activity className="w-3.5 h-3.5" />,
  },
  unverified: {
    bg: "bg-slate-100",
    text: "text-slate-500",
    border: "border-slate-200",
    icon: <Lock className="w-3.5 h-3.5" />,
  },
};

/* ─────────────────────────────────────────────
   DETAIL CARD
───────────────────────────────────────────── */
function DetailCard({ icon, label, value, mono = false }) {
  return (
    <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex gap-4 items-start hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
      <div className="mt-0.5 w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-0.5">
          {label}
        </p>
        <p
          className={`text-slate-800 font-medium text-sm leading-snug break-all ${
            mono ? "font-mono" : ""
          }`}
        >
          {value || "—"}
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PERMISSION CHIP
───────────────────────────────────────────── */
const PERM_COLORS = {
  project: "bg-violet-50 text-violet-700 border-violet-200",
  lead: "bg-sky-50 text-sky-700 border-sky-200",
  agent: "bg-amber-50 text-amber-700 border-amber-200",
};

function PermChip({ label }) {
  const [scope] = label.split(":");
  const cls =
    PERM_COLORS[scope] || "bg-slate-100 text-slate-600 border-slate-200";
  return (
    <span
      className={`font-mono text-[0.68rem] tracking-wide px-2.5 py-1 rounded-lg border font-medium ${cls}`}
    >
      {label}
    </span>
  );
}

/* ─────────────────────────────────────────────
   MAIN PROFILE COMPONENT
───────────────────────────────────────────── */
export default function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await fetchMe();
        setUser(data.user);
      } catch (err) {
        console.error("Profile load failed", err);
      }
    }
    loadProfile();
  }, []);

  if (!user) return <LoadingSpinner />;

  const statusCls = STATUS_COLOR[user.accountStatus] || STATUS_COLOR.inactive;
  const kycInfo = KYC_COLOR[user.kyc?.status] || KYC_COLOR.unverified;

  const initials = user.name
    ?.split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const location = [user.locality, user.city, user.state, user.pincode]
    .filter(Boolean)
    .join(", ");

  const permGroups = (user.permissions || []).reduce((acc, p) => {
    const [scope] = p.split(":");
    (acc[scope] = acc[scope] || []).push(p);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50/30 p-4 sm:p-8">
      {/* PAGE HEADER */}
      <div className="mb-8 flex items-center justify-between flex-wrap gap-3">
        <div>
          
          <h1 className="text-3xl font-bold text-[#27AE60] tracking-tight">
            My Profile
          </h1>
        </div>

        {/* Status badge */}
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${statusCls.bg} ${statusCls.text} ${statusCls.border}`}
        >
          <span className={`w-2 h-2 rounded-full ${statusCls.dot}`} />
          {(user.accountStatus || "unknown").charAt(0).toUpperCase() +
            user.accountStatus.slice(1)}
        </div>
      </div>

      {/* HERO CARD */}
      <div className="bg-white/90 backdrop-blur-lg rounded-3xl border border-slate-100 shadow-xl overflow-hidden mb-6">
        {/* Decorative top bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-green-400 via-emerald-500 to-teal-400" />

        <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="animate-pulse w-20 h-20 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-200">
              <span className="text-white text-2xl font-bold tracking-tight">
                {initials}
              </span>
            </div>
            {user.phoneVerified && (
              <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow border-2 border-white">
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
              </div>
            )}
          </div>

          {/* Name + role + KYC */}
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#27AE60] capitalize leading-tight">
              {user.name}
            </h2>
            <p className="text-slate-500 font-medium mt-0.5 mb-3">
              {formatRole(user.roleName)}
            </p>

            <div className="flex flex-wrap gap-2">
              {/* KYC */}
              <span
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${kycInfo.bg} ${kycInfo.text} ${kycInfo.border}`}
              >
                {kycInfo.icon}
                KYC {user.kyc?.status || "—"}
              </span>

              {/* Phone verified */}
              {user.phoneVerified && (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  <Fingerprint className="w-3.5 h-3.5" />
                  Phone Verified
                </span>
              )}
            </div>
          </div>

          {/* Role pill (desktop) */}
          <div className="hidden sm:block shrink-0">
            <div className="text-right">
              <p className="text-[11px] uppercase tracking-widest text-slate-400 font-semibold mb-1">
                Role
              </p>
              <span className="px-4 py-2 rounded-xl bg-gradient-to-br from-green-50 to-emerald-100 text-green-800 font-semibold text-sm border border-green-200">
                {formatRole(user.roleName)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* DETAILS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <DetailCard
          icon={<Mail className="w-4.5 h-4.5 text-blue-500" />}
          label="Email Address"
          value={user.email}
        />
        <DetailCard
          icon={<Phone className="w-4.5 h-4.5 text-green-600" />}
          label="Phone"
          value={user.phone}
        />
        <DetailCard
          icon={<MapPin className="w-4.5 h-4.5 text-rose-500" />}
          label="Location"
          value={location}
        />
      </div>

    </div>
  );
}
