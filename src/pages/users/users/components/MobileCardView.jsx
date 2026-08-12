import { useNavigate } from "react-router-dom";
import { Calendar, MapPin, Phone, Users as UsersIcon } from "lucide-react";
import {
  AccountBadge,
  Avatar,
  KycBadge,
  PhoneBadge,
  RoleBadge,
} from "./ReusableComaponents";
import { RowActionsMenu } from "./RowActionsMenu";
import { formatJoinedIst } from "../utils/dateTime";

const getKycReason = (u) =>
  String(u?.kyc?.remarks || u?.kycReason || u?.kyc?.reason || "").trim();

export const MobileCardView = ({
  filtered,
  loading,
  hasFilters,
  onClearFilters,
  onOpenUser,
}) => {
  const navigate = useNavigate();
  const openUser = (id) => {
    if (!id) return;
    if (typeof onOpenUser === "function") onOpenUser(id);
    else navigate(`/dashboard/users/${id}`);
  };

  return (
    <div className="divide-y divide-[#eef5f0] md:hidden">
      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#12A150]/20 border-t-[#12A150]" />
          <p className="text-sm font-medium text-slate-400">Loading users…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-16 text-slate-400">
          <UsersIcon className="h-10 w-10 text-slate-200" />
          <p className="text-sm font-medium">
            {hasFilters
              ? "No users match the selected filters"
              : "No users found"}
          </p>
          {hasFilters && onClearFilters ? (
            <button
              type="button"
              onClick={onClearFilters}
              className="mt-1 rounded-full bg-[#12A150]/10 px-3 py-1.5 text-xs font-semibold text-[#12A150]"
            >
              Clear filters
            </button>
          ) : null}
        </div>
      ) : (
        filtered.map((u) => {
          const reason = getKycReason(u);
          const rejected =
            String(u?.kyc?.status || "").toLowerCase() === "rejected";
          return (
            <div
              key={u._id}
              className="p-4 transition hover:bg-[#f5fbf7]"
              onClick={() => openUser(u._id)}
              onKeyDown={(e) => {
                if (e.key === "Enter") openUser(u._id);
              }}
              role="button"
              tabIndex={0}
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar
                    name={u.name}
                    imageUrl={u.avatar || u.profileImage || u.photo}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-[#17212B]">
                      {u.name}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-slate-400">
                      {u.email || u._id}
                    </p>
                  </div>
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                  <RowActionsMenu user={u} onOpenUser={onOpenUser} />
                </div>
              </div>

              <div className="mb-3 flex flex-wrap gap-2">
                <RoleBadge role={u.roleName || u.role || u.roleId?.name} />
                <AccountBadge status={u.accountStatus} />
                <KycBadge kyc={u.kyc} />
                <PhoneBadge verified={u.phoneVerified} />
              </div>

              {u.phone ? (
                <div className="mb-2 inline-flex items-center gap-1.5 text-sm text-[#17212B]">
                  <Phone className="h-3.5 w-3.5 text-[#12A150]" />
                  {u.phone}
                </div>
              ) : null}

              <div className="mb-2 flex items-start gap-1.5 text-sm text-slate-600">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#12A150]" />
                <span>
                  {[u.locality, u.city, u.state].filter(Boolean).join(", ") ||
                    "Location not set"}
                </span>
              </div>

              <div className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                <Calendar className="h-3.5 w-3.5" />
                {formatJoinedIst(u.createdAt)}
              </div>

              {reason ? (
                <div
                  className={`mt-3 rounded-xl px-3 py-2 text-[11px] leading-snug ${
                    rejected
                      ? "bg-red-50 text-red-700"
                      : "bg-slate-50 text-slate-600"
                  }`}
                >
                  <span className="text-[9px] font-bold uppercase tracking-wide opacity-70">
                    KYC reason ·{" "}
                  </span>
                  {reason}
                </div>
              ) : null}
            </div>
          );
        })
      )}
    </div>
  );
};
