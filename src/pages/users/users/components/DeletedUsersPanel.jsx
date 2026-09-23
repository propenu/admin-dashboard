import { Loader2 } from "lucide-react";
import { roleLabel } from "../constants/roleLabels";

const formatDeletedAt = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export function DeletedUsersPanel({
  rows = [],
  loading = false,
  error = "",
  page = 1,
  pages = 1,
  total = 0,
  onRetry,
  onPrev,
  onNext,
}) {
  return (
    <div className="overflow-hidden rounded-[18px] border border-[#d9ebe0] bg-white shadow-[0_1px_3px_rgba(23,33,43,0.04)]">
      <div className="flex items-center justify-between gap-2 border-b border-[#e8f3ec] bg-[#f3faf6] px-3 py-2.5 sm:px-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#12A150]">
            Deleted users
          </p>
          <p className="text-xs text-slate-500">
            From deletedaccounts · {Number(total || 0).toLocaleString("en-IN")}{" "}
            records
          </p>
        </div>
      </div>

      {loading && !rows.length ? (
        <div className="flex items-center justify-center gap-2 px-4 py-16 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin text-[#12A150]" />
          Loading deleted accounts…
        </div>
      ) : error && !rows.length ? (
        <div className="px-4 py-12 text-center text-sm text-rose-600">
          {error}{" "}
          <button
            type="button"
            onClick={onRetry}
            className="font-semibold underline"
          >
            Retry
          </button>
        </div>
      ) : !rows.length ? (
        <p className="px-4 py-12 text-center text-sm text-slate-400">
          No deleted accounts found
        </p>
      ) : (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[#f8fbf9] text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
                <tr>
                  <th className="px-4 py-3">No.</th>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Deleted at</th>
                  <th className="px-4 py-3">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eef5f0]">
                {rows.map((row, idx) => (
                  <tr key={row._id || idx} className="hover:bg-[#f7fbf8]">
                    <td className="px-4 py-3 text-xs font-semibold text-slate-400">
                      {(page - 1) * 20 + idx + 1}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-[#102033]">
                        {row.name || "—"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {row.email || "—"}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-[#12A150]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#0f7a3a]">
                        {roleLabel(row.roleLabel || row.roleName) || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#102033]">
                      {row.phone || "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {formatDeletedAt(row.deletedAt)}
                    </td>
                    <td className="max-w-[220px] truncate px-4 py-3 text-xs text-slate-500">
                      {row.deletionReason || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="divide-y divide-[#eef5f0] md:hidden">
            {rows.map((row, idx) => (
              <li key={row._id || idx} className="px-3 py-3">
                <div className="flex items-start gap-2">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#12A150] text-[10px] font-bold text-white">
                    {(page - 1) * 20 + idx + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#102033]">
                      {row.name || "—"}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {row.email || "—"}
                    </p>
                    <p className="mt-1 text-xs text-[#102033]">
                      {row.phone || "—"}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      {formatDeletedAt(row.deletedAt)}
                      {row.deletionReason ? ` · ${row.deletionReason}` : ""}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {pages > 1 ? (
            <div className="flex items-center justify-between gap-2 border-t border-[#e8f3ec] px-3 py-2.5 sm:px-4">
              <button
                type="button"
                disabled={page <= 1 || loading}
                onClick={onPrev}
                className="rounded-lg border border-[#d9ebe0] px-2.5 py-1 text-[11px] font-semibold text-[#0f7a3a] hover:bg-[#f3faf6] disabled:opacity-40"
              >
                Prev
              </button>
              <span className="text-[11px] font-semibold tabular-nums text-slate-500">
                Page {page}/{pages}
                {loading ? " · …" : ""}
              </span>
              <button
                type="button"
                disabled={page >= pages || loading}
                onClick={onNext}
                className="rounded-lg border border-[#d9ebe0] px-2.5 py-1 text-[11px] font-semibold text-[#0f7a3a] hover:bg-[#f3faf6] disabled:opacity-40"
              >
                Next
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
