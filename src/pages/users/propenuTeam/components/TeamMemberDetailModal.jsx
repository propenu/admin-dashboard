import { useEffect } from "react";
import { createPortal } from "react-dom";
import {
  CalendarDays,
  Hash,
  Mail,
  MapPin,
  Network,
  Phone,
  Shield,
  UserRound,
  X,
} from "lucide-react";

/**
 * Read-only full profile sheet for Team Directory table/card clicks.
 */
export default function TeamMemberDetailModal({
  user,
  roleLabel = "—",
  reportsToName = "",
  reportsToRole = "",
  onClose,
}) {
  useEffect(() => {
    if (!user) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [user, onClose]);

  if (!user) return null;

  const location = [user.locality, user.city, user.state, user.pincode]
    .filter(Boolean)
    .join(", ");
  const initials = String(user.name || "U")
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  const active = user.accountStatus === "active" && user.isActive !== false;
  const statusText =
    user.isActive === false
      ? "Deactivated"
      : String(user.accountStatus || "pending").replace(/_/g, " ");
  const joined = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

  const rows = [
    {
      icon: Hash,
      label: "User code",
      value: user.userCode || String(user._id || "").slice(-10).toUpperCase() || "—",
      mono: true,
    },
    { icon: Shield, label: "Role", value: roleLabel || "—" },
    {
      icon: Network,
      label: "Reports to",
      value: reportsToName
        ? `${reportsToName}${reportsToRole ? ` · ${reportsToRole}` : ""}`
        : "—",
    },
    { icon: Mail, label: "Email", value: user.email || "—" },
    { icon: Phone, label: "Phone", value: user.phone || "—" },
    { icon: MapPin, label: "Work location", value: location || "—" },
    { icon: CalendarDays, label: "Joined", value: joined },
  ];

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-end justify-center bg-slate-950/45 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="team-member-detail-title"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-slate-200 bg-white shadow-2xl sm:rounded-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative border-b border-slate-100 bg-gradient-to-br from-emerald-50 via-white to-white px-5 pb-4 pt-5">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            <X size={18} />
          </button>
          <div className="flex items-start gap-3 pr-8">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border-2 border-emerald-200 bg-emerald-50 text-base font-black text-emerald-700">
              {initials || <UserRound size={22} />}
            </div>
            <div className="min-w-0 flex-1">
              <h2
                id="team-member-detail-title"
                className="text-lg font-black leading-snug text-slate-900 break-words"
              >
                {user.name || "Unnamed user"}
              </h2>
              <p className="mt-1 text-xs font-bold tracking-wide text-emerald-700">
                {roleLabel || "—"}
              </p>
              <span
                className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold capitalize ${
                  user.isActive === false
                    ? "bg-slate-100 text-slate-600"
                    : active
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-700"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    user.isActive === false
                      ? "bg-slate-400"
                      : active
                        ? "bg-emerald-500"
                        : "bg-amber-400"
                  }`}
                />
                {statusText}
              </span>
            </div>
          </div>
        </div>

        <div className="overflow-y-auto px-5 py-4">
          <ul className="space-y-3">
            {rows.map(({ icon: Icon, label, value, mono }) => (
              <li
                key={label}
                className="rounded-xl border border-slate-100 bg-slate-50/80 px-3.5 py-3"
              >
                <div className="flex items-start gap-2.5">
                  <Icon
                    size={15}
                    className="mt-0.5 shrink-0 text-emerald-600"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {label}
                    </p>
                    <p
                      className={`mt-0.5 text-sm font-semibold leading-5 text-slate-800 break-words ${
                        mono ? "font-mono text-[13px]" : ""
                      }`}
                    >
                      {value}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-slate-100 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
