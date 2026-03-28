import { useEffect, useState } from "react";
import { fetchMe } from "../../services/UserServices/userServices";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import {
  User,
  Mail,
  Shield,
  Key,
  Phone,
  Crown,
  MapPin,
  CheckCircle2,
  BadgeCheck,
  Lock,
  Fingerprint,
  Activity,
} from "lucide-react";

/* ─────────────────────────────────────────────
   STYLE INJECTION  (Tailwind-compatible extras)
───────────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

  .profile-root { font-family: 'Sora', sans-serif; }
  .mono         { font-family: 'JetBrains Mono', monospace; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0);    }
  }
  @keyframes pulse-ring {
    0%,100% { box-shadow: 0 0 0 0 rgba(39,174,96,.45); }
    50%      { box-shadow: 0 0 0 10px rgba(39,174,96,0); }
  }
  .fade-up          { animation: fadeUp .5s ease both; }
  .delay-1          { animation-delay: .08s; }
  .delay-2          { animation-delay: .16s; }
  .delay-3          { animation-delay: .24s; }
  .delay-4          { animation-delay: .32s; }
  .delay-5          { animation-delay: .40s; }
  .avatar-ring      { animation: pulse-ring 2.6s ease-in-out infinite; }

  .glass {
    background: rgba(255,255,255,0.92);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
  }
  .detail-card:hover { transform: translateY(-2px); }
  .detail-card { transition: transform .2s ease, box-shadow .2s ease; }
  .detail-card:hover { box-shadow: 0 8px 28px rgba(0,0,0,.09); }

  .permission-chip {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.68rem;
    letter-spacing: .02em;
  }

  .section-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, #e2e8f0 30%, #e2e8f0 70%, transparent);
  }
`;

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
function formatRole(raw = "") {
  return raw.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function shortId(id = "") {
  return id.length > 16 ? `${id.slice(0, 8)}…${id.slice(-6)}` : id;
}

const STATUS_COLOR = {
  active: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  inactive: { bg: "bg-slate-100", text: "text-slate-500", dot: "bg-slate-400" },
  suspended: { bg: "bg-red-50", text: "text-red-600", dot: "bg-red-500" },
};

const KYC_COLOR = {
  verified: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    icon: <BadgeCheck className="w-3.5 h-3.5" />,
  },
  pending: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    icon: <Activity className="w-3.5 h-3.5" />,
  },
  unverified: {
    bg: "bg-slate-100",
    text: "text-slate-500",
    icon: <Lock className="w-3.5 h-3.5" />,
  },
};

/* ─────────────────────────────────────────────
   DETAIL CARD
───────────────────────────────────────────── */
function DetailCard({ icon, label, value, mono = false, delay = "" }) {
  return (
    <div
      className={`detail-card fade-up ${delay} p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex gap-4 items-start`}
    >
      <div className="mt-0.5 w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-0.5">
          {label}
        </p>
        <p
          className={`text-slate-800 font-medium text-sm leading-snug break-all ${
            mono ? "mono" : ""
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
  lead: "bg-sky-50    text-sky-700    border-sky-200",
  agent: "bg-amber-50  text-amber-700  border-amber-200",
};

function PermChip({ label }) {
  const [scope] = label.split(":");
  const cls =
    PERM_COLORS[scope] || "bg-slate-100 text-slate-600 border-slate-200";
  return (
    <span
      className={`permission-chip px-2.5 py-1 rounded-lg border font-medium ${cls}`}
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

  /* permission buckets */
  const permGroups = (user.permissions || []).reduce((acc, p) => {
    const [scope] = p.split(":");
    (acc[scope] = acc[scope] || []).push(p);
    return acc;
  }, {});

  return (
    <>
      <style>{styles}</style>

      <div className="profile-root min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50/30 p-4 sm:p-8">
        {/* PAGE HEADER */}
        <div className="fade-up mb-8 flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">
              Account
            </p>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
              My Profile
            </h1>
          </div>

          {/* Status badge */}
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${statusCls.bg} ${statusCls.text} border-current/10`}
          >
            <span className={`w-2 h-2 rounded-full ${statusCls.dot}`} />
            {(user.accountStatus || "unknown").charAt(0).toUpperCase() +
              user.accountStatus.slice(1)}
          </div>
        </div>

        {/* HERO CARD */}
        <div className="fade-up glass rounded-3xl border border-slate-100 shadow-xl overflow-hidden mb-6">
          {/* Decorative top bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-green-400 via-emerald-500 to-teal-400" />

          <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="avatar-ring w-20 h-20 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-700 flex items-center justify-center shadow-lg">
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
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 capitalize leading-tight">
                {user.name}
              </h2>
              <p className="text-slate-500 font-medium mt-0.5 mb-3">
                {formatRole(user.roleName)}
              </p>

              <div className="flex flex-wrap gap-2">
                {/* KYC */}
                <span
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${kycInfo.bg} ${kycInfo.text}`}
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
            delay="delay-1"
            icon={<Mail className="w-4.5 h-4.5 text-blue-500" />}
            label="Email Address"
            value={user.email}
          />
          <DetailCard
            delay="delay-2"
            icon={<Phone className="w-4.5 h-4.5 text-green-600" />}
            label="Phone"
            value={user.phone}
          />
          <DetailCard
            delay="delay-3"
            icon={<MapPin className="w-4.5 h-4.5 text-rose-500" />}
            label="Location"
            value={location}
          />
          <DetailCard
            delay="delay-4"
            icon={<Shield className="w-4.5 h-4.5 text-purple-600" />}
            label="Role Name"
            value={formatRole(user.roleName)}
          />
          <DetailCard
            delay="delay-5"
            icon={<Key className="w-4.5 h-4.5 text-amber-600" />}
            label="Role ID"
            value={shortId(user.roleId)}
            mono
          />
          <DetailCard
            delay="delay-5"
            icon={<Crown className="w-4.5 h-4.5 text-orange-500" />}
            label="User ID"
            value={shortId(user.id)}
            mono
          />
        </div>

        {/* PERMISSIONS SECTION */}
        {user.permissions?.length > 0 && (
          <div className="fade-up delay-5 glass rounded-3xl border border-slate-100 shadow-xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center">
                <Shield className="w-4 h-4 text-slate-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  Access Permissions
                </h3>
                <p className="text-xs text-slate-400">
                  {user.permissions.length} permission
                  {user.permissions.length !== 1 ? "s" : ""} granted
                </p>
              </div>
            </div>

            <div className="section-divider mb-5" />

            <div className="space-y-5">
              {Object.entries(permGroups).map(([scope, perms]) => (
                <div key={scope}>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-2">
                    {scope}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {perms.map((p) => (
                      <PermChip key={p} label={p} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
