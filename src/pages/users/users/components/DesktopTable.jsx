import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  Calendar,
  MapPin,
  Phone,
  Users as UsersIcon,
} from "lucide-react";
import {
  AccountBadge,
  KycBadge,
  PhoneBadge,
  RoleBadge,
} from "./ReusableComaponents";
import { RowActionsMenu } from "./RowActionsMenu";
import { formatJoinedIst } from "../utils/dateTime";

const getKycReason = (u) =>
  String(u?.kyc?.remarks || u?.kycReason || u?.kyc?.reason || "").trim();

const formatName = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .map((n) => n.charAt(0).toUpperCase() + n.slice(1))
    .join(" ");

const SkeletonRows = () =>
  Array.from({ length: 6 }).map((_, i) => (
    <tr key={i} className="animate-pulse border-t border-[#eef5f0]">
      {Array.from({ length: 11 }).map((__, j) => (
        <td key={j} className="px-3 py-3.5">
          <div className="h-3 rounded bg-slate-100" />
        </td>
      ))}
    </tr>
  ));

const EmptyState = ({ colSpan, hasFilters, onClearFilters }) => (
  <tr>
    <td colSpan={colSpan} className="py-16 text-center">
      <div className="flex flex-col items-center gap-2.5">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50">
          <UsersIcon className="h-6 w-6 text-slate-300" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-500">
            {hasFilters ? "No users match the selected filters" : "No users found"}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {hasFilters
              ? "Try adjusting your search or filters"
              : "No users available"}
          </p>
        </div>
        {hasFilters && onClearFilters ? (
          <button
            type="button"
            onClick={onClearFilters}
            className="mt-1 rounded-full bg-[#12A150]/10 px-3 py-1.5 text-xs font-semibold text-[#12A150] hover:bg-[#12A150]/15"
          >
            Clear filters
          </button>
        ) : null}
      </div>
    </td>
  </tr>
);

const ErrorState = ({ colSpan, message, onRetry }) => (
  <tr>
    <td colSpan={colSpan} className="py-16 text-center">
      <div className="flex flex-col items-center gap-2.5">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50">
          <AlertCircle className="h-6 w-6 text-red-400" />
        </div>
        <p className="text-sm font-semibold text-red-600">{message}</p>
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="rounded-full bg-[#12A150] px-3.5 py-1.5 text-xs font-semibold text-white"
          >
            Retry
          </button>
        ) : null}
      </div>
    </td>
  </tr>
);

export const DesktopTable = ({
  filtered,
  loading,
  error,
  hasFilters,
  rowOffset = 0,
  onRetry,
  onClearFilters,
  onOpenUser,
  isSuperAdmin = false,
  currentUserId = "",
  statusBusy = false,
  onActivate,
  onDeactivate,
  onRequestDelete,
}) => {
  const navigate = useNavigate();
  const openUser = (id) => {
    if (!id) return;
    if (typeof onOpenUser === "function") onOpenUser(id);
    else navigate(`/dashboard/users/${id}`);
  };

  return (
    <div className="hidden max-w-full overflow-x-auto md:block">
      <table className="w-full min-w-[1180px] border-collapse text-left">
        <thead className="sticky top-0 z-10">
          <tr className="border-b border-[#dceee3] bg-[#eef8f1]">
            {[
              "No.",
              "User",
              "Role",
              "Contact",
              "Account",
              "KYC",
              "KYC Reason",
              "Phone",
              "Location",
              "Joined",
              "Actions",
            ].map((h) => (
              <th
                key={h}
                className="whitespace-nowrap px-3 py-2.5 text-left align-middle text-[10px] font-bold uppercase tracking-[0.08em] text-[#12A150]"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <SkeletonRows />
          ) : error ? (
            <ErrorState colSpan={11} message={error} onRetry={onRetry} />
          ) : filtered.length === 0 ? (
            <EmptyState
              colSpan={11}
              hasFilters={!!hasFilters}
              onClearFilters={onClearFilters}
            />
          ) : (
            filtered.map((u, idx) => {
              const kycReason = getKycReason(u);
              const rejected =
                String(u.kyc?.status || "").toLowerCase() === "rejected";
              return (
                <tr
                  key={u._id}
                  onClick={() => openUser(u._id)}
                  className="cursor-pointer border-t border-[#eef5f0] transition hover:bg-[#f5fbf7]"
                >
                  <td className="px-3 py-3 align-middle text-sm tabular-nums text-slate-400">
                    {rowOffset + idx + 1}
                  </td>

                  <td className="px-3 py-3 align-middle">
                    <div className="min-w-[190px]">
                      <p
                        title={formatName(u.name)}
                        className="truncate text-sm font-semibold text-[#102033]"
                      >
                        {formatName(u.name) || "—"}
                      </p>
                      <p
                        title={u.email || ""}
                        className="mt-0.5 truncate text-xs text-slate-400"
                      >
                        {u.email || u.userCode || u._id || "—"}
                      </p>
                    </div>
                  </td>

                  <td className="px-3 py-3 align-middle">
                    <RoleBadge role={u.roleName || u.role || u.roleId?.name} />
                  </td>

                  <td className="px-3 py-3 align-middle">
                    {u.phone ? (
                      <div className="inline-flex items-center gap-1.5 whitespace-nowrap text-sm text-[#102033]">
                        <Phone className="h-3.5 w-3.5 text-[#12A150]" aria-hidden />
                        {u.phone}
                      </div>
                    ) : (
                      <span className="text-sm text-slate-300">—</span>
                    )}
                  </td>

                  <td className="px-3 py-3 align-middle">
                    <AccountBadge
                      status={
                        u.isActive === false ? "inactive" : u.accountStatus
                      }
                    />
                  </td>

                  <td className="px-3 py-3 align-middle">
                    <KycBadge kyc={u.kyc} />
                  </td>

                  <td className="max-w-[200px] px-3 py-3 align-middle">
                    {kycReason ? (
                      <p
                        title={kycReason}
                        className={`line-clamp-2 text-[11px] leading-snug ${
                          rejected
                            ? "font-medium text-red-600"
                            : "text-slate-500"
                        }`}
                      >
                        {kycReason}
                      </p>
                    ) : (
                      <span className="text-sm text-slate-300">—</span>
                    )}
                  </td>

                  <td className="px-3 py-3 align-middle">
                    <PhoneBadge verified={u.phoneVerified} />
                  </td>

                  <td className="px-3 py-3 align-middle">
                    {u.locality || u.city || u.state ? (
                      <div className="flex min-w-[130px] items-center gap-1.5">
                        <MapPin
                          className="h-3.5 w-3.5 shrink-0 text-[#12A150]"
                          aria-hidden
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium capitalize text-[#102033]">
                            {u.locality || u.city || "—"}
                          </p>
                          <p className="mt-0.5 truncate text-xs capitalize text-slate-400">
                            {[u.locality ? u.city : null, u.state]
                              .filter(Boolean)
                              .join(", ") ||
                              u.city ||
                              "—"}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-amber-600">
                        <MapPin className="h-3.5 w-3.5" /> Not set
                      </span>
                    )}
                  </td>

                  <td className="px-3 py-3 align-middle">
                    <div
                      className="inline-flex items-center gap-1.5 whitespace-nowrap text-sm text-slate-500"
                      title={u.createdAt ? formatJoinedIst(u.createdAt) : ""}
                    >
                      <Calendar className="h-3.5 w-3.5 text-[#12A150]" aria-hidden />
                      {formatJoinedIst(u.createdAt)}
                    </div>
                  </td>

                  <td
                    className="px-3 py-3 pr-4 align-middle"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <RowActionsMenu
                      user={u}
                      onOpenUser={onOpenUser}
                      isSuperAdmin={isSuperAdmin}
                      currentUserId={currentUserId}
                      statusBusy={statusBusy}
                      onActivate={onActivate}
                      onDeactivate={onDeactivate}
                      onRequestDelete={onRequestDelete}
                    />
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};
