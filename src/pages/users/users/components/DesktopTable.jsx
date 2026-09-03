import { useNavigate } from "react-router-dom";
import { AlertCircle, Users as UsersIcon } from "lucide-react";
import { RowActionsMenu } from "./RowActionsMenu";
import { formatJoinedIst } from "../utils/dateTime";
import { roleLabel } from "../constants/roleLabels";

const formatName = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .map((n) => n.charAt(0).toUpperCase() + n.slice(1))
    .join(" ");

const CompactRole = ({ role }) => (
  <span className="inline-flex max-w-full truncate rounded-md bg-[#12A150]/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#12A150]">
    {roleLabel(role)}
  </span>
);

const CompactPhoneStatus = ({ verified }) =>
  verified ? (
    <span className="text-[11px] font-semibold text-[#12A150]">Verified</span>
  ) : (
    <span className="text-[11px] font-semibold text-slate-400">Unverified</span>
  );

const SkeletonRows = () =>
  Array.from({ length: 6 }).map((_, i) => (
    <tr key={i} className="animate-pulse border-t border-[#eef5f0]">
      {Array.from({ length: 8 }).map((__, j) => (
        <td key={j} className="px-2 py-2.5">
          <div className="h-2.5 rounded bg-slate-100" />
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

const COLS = [
  { key: "no", label: "No.", className: "w-[5%]" },
  { key: "user", label: "User", className: "w-[20%]" },
  { key: "role", label: "Role", className: "w-[10%]" },
  { key: "contact", label: "Contact", className: "w-[13%]" },
  { key: "phone", label: "Phone", className: "w-[10%]" },
  { key: "location", label: "Location", className: "w-[20%]" },
  { key: "joined", label: "Joined", className: "w-[14%]" },
  { key: "actions", label: "Actions", className: "w-[8%]" },
];

export const DesktopTable = ({
  filtered,
  loading,
  error,
  hasFilters,
  rowOffset = 0,
  onRetry,
  onClearFilters,
  onOpenUser,
  actorRoleName = "",
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
    <div className="hidden w-full max-w-full overflow-hidden md:block">
      <table className="w-full table-fixed border-collapse text-left">
        <colgroup>
          {COLS.map((col) => (
            <col key={col.key} className={col.className} />
          ))}
        </colgroup>
        <thead className="sticky top-0 z-10">
          <tr className="border-b border-[#dceee3] bg-[#eef8f1]">
            {COLS.map((col) => (
              <th
                key={col.key}
                className="truncate px-2 py-2 text-left align-middle text-[9px] font-bold uppercase tracking-[0.06em] text-[#12A150]"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <SkeletonRows />
          ) : error ? (
            <ErrorState colSpan={8} message={error} onRetry={onRetry} />
          ) : filtered.length === 0 ? (
            <EmptyState
              colSpan={8}
              hasFilters={!!hasFilters}
              onClearFilters={onClearFilters}
            />
          ) : (
            filtered.map((u, idx) => {
              const locationLine = [u.locality, u.city, u.state]
                .filter(Boolean)
                .join(", ");
              const joined = formatJoinedIst(u.createdAt);
              return (
                <tr
                  key={u._id}
                  onClick={() => openUser(u._id)}
                  className="cursor-pointer border-t border-[#eef5f0] transition hover:bg-[#f5fbf7]"
                >
                  <td className="px-2 py-2 align-middle text-[11px] tabular-nums text-slate-400">
                    {rowOffset + idx + 1}
                  </td>

                  <td className="px-2 py-2 align-middle">
                    <p
                      title={formatName(u.name)}
                      className="truncate text-[12px] font-semibold text-[#102033]"
                    >
                      {formatName(u.name) || "—"}
                    </p>
                    <p
                      title={u.email || String(u._id || "")}
                      className="mt-0.5 truncate text-[10px] text-slate-400"
                    >
                      {u.email || u.userCode || u._id || "—"}
                    </p>
                  </td>

                  <td className="px-2 py-2 align-middle">
                    <CompactRole role={u.roleName || u.role || u.roleId?.name} />
                  </td>

                  <td className="px-2 py-2 align-middle">
                    {u.phone ? (
                      <p
                        title={u.phone}
                        className="truncate text-[12px] tabular-nums text-[#102033]"
                      >
                        {u.phone}
                      </p>
                    ) : (
                      <span className="text-[12px] text-slate-300">—</span>
                    )}
                  </td>

                  <td className="px-2 py-2 align-middle">
                    <CompactPhoneStatus verified={u.phoneVerified} />
                  </td>

                  <td className="px-2 py-2 align-middle">
                    {locationLine ? (
                      <div className="min-w-0">
                        <p
                          title={locationLine}
                          className="truncate text-[12px] font-medium capitalize text-[#102033]"
                        >
                          {u.locality || u.city || "—"}
                        </p>
                        <p
                          title={locationLine}
                          className="mt-0.5 truncate text-[10px] capitalize text-slate-400"
                        >
                          {[u.locality ? u.city : null, u.state]
                            .filter(Boolean)
                            .join(", ") ||
                            u.city ||
                            "—"}
                        </p>
                      </div>
                    ) : (
                      <span className="text-[11px] text-amber-600">Not set</span>
                    )}
                  </td>

                  <td className="px-2 py-2 align-middle">
                    <p
                      title={joined}
                      className="truncate text-[11px] text-slate-500"
                    >
                      {joined}
                    </p>
                  </td>

                  <td
                    className="px-1 py-2 align-middle"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <RowActionsMenu
                      user={u}
                      onOpenUser={onOpenUser}
                      actorRoleName={actorRoleName}
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
