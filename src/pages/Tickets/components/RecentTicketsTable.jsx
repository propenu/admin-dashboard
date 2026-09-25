import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import DashboardCard from "./DashboardCard";
import { ghostButton } from "./ticketUi";
import {
  formatDueDate,
  formatLabel,
  formatRelativeTime,
} from "../utils/ticketFormatters";
import { useTicketList } from "../hooks/useTicketWorkspace";

const PAGE_SIZE = 10;

const priorityTone = {
  urgent: "border-red-200 bg-red-50 text-red-700",
  high: "border-rose-200 bg-rose-50 text-rose-700",
  medium: "border-amber-200 bg-amber-50 text-amber-700",
  low: "border-emerald-200 bg-emerald-50 text-[#219653]",
};

const toListDateBounds = (from, to) => {
  const bounds = {};
  if (from) bounds.createdFrom = String(from).includes("T") ? from : `${from}T00:00:00.000`;
  if (to) bounds.createdTo = String(to).includes("T") ? to : `${to}T23:59:59.999`;
  return bounds;
};

export default function RecentTicketsTable({
  dateFilters = {},
  scope = {},
  onOpenQueue,
  onOpenTicket,
}) {
  const [page, setPage] = useState(1);

  const rangeKey = `${dateFilters.from || ""}|${dateFilters.to || ""}|${scope.ownedBy || ""}|${scope.department || ""}`;
  useEffect(() => {
    setPage(1);
  }, [rangeKey]);

  const listFilters = useMemo(() => {
    const bounds = toListDateBounds(dateFilters.from, dateFilters.to);
    return {
      page,
      limit: PAGE_SIZE,
      sortBy: "updatedAt",
      sortOrder: "desc",
      ...bounds,
      ...(scope.ownedBy ? { ownedBy: scope.ownedBy } : {}),
      ...(scope.department ? { department: scope.department } : {}),
    };
  }, [page, dateFilters.from, dateFilters.to, scope.ownedBy, scope.department]);

  const listQuery = useTicketList(listFilters, true);
  const tickets = listQuery.data?.data || [];
  const meta = listQuery.data?.meta || {};
  const total = Number(meta.total || 0);
  const pages = Math.max(1, Number(meta.pages || Math.ceil(total / PAGE_SIZE) || 1));
  const currentPage = Math.min(Math.max(1, Number(meta.page || page)), pages);
  const fromRow = total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const toRow = Math.min(currentPage * PAGE_SIZE, total);

  return (
    <DashboardCard className="p-0">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div>
          <h2 className="text-[13px] font-bold text-[#0f3d2e]">Recent Tickets</h2>
          <p className="mt-0.5 text-[12px] font-medium text-[#5c7d6d]">
            Latest requester updates and assignee movement · paginated for scale.
          </p>
        </div>
        <button type="button" onClick={() => onOpenQueue?.({})} className={ghostButton}>
          View Queue
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full table-fixed text-left text-[12px]">
          <thead className="bg-[#27AE60] text-[11px] font-bold uppercase tracking-wide text-white">
            <tr>
              <th className="px-4 py-3">Ticket</th>
              <th className="px-3 py-3">Department</th>
              <th className="px-3 py-3">Priority</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Assigned To</th>
              <th className="px-3 py-3">Due Date</th>
              <th className="px-3 py-3">Updated</th>
              <th className="px-4 py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {listQuery.isLoading ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-[12px] font-semibold text-[#5c7d6d]">
                  Loading recent tickets...
                </td>
              </tr>
            ) : tickets.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-[12px] font-semibold text-[#5c7d6d]">
                  No recent tickets found for this period
                </td>
              </tr>
            ) : (
              tickets.map((ticket) => {
                const assigneeName =
                  ticket.assignedTo?.name || ticket.agent?.name || "";
                const assigneeRole = formatLabel(
                  ticket.assignedTo?.role || ticket.agent?.role || "",
                );
                const departmentLabel = formatLabel(ticket.department) || "—";
                // Prefer assignee role; fall back to department label (e.g. Customer Care).
                const assigneeRoleOrDept =
                  assigneeRole ||
                  (departmentLabel !== "—" ? departmentLabel : "");
                return (
                  <tr
                    key={ticket._id}
                    className="border-b border-[#e6f4eb] transition hover:bg-[#f7fbf8]"
                  >
                    <td className="max-w-[220px] px-4 py-3 font-bold text-[#0f3d2e]">
                      <span className="line-clamp-2">{ticket.title}</span>
                    </td>
                    <td className="min-w-[120px] px-3 py-3 font-semibold text-[#0f3d2e]">
                      {departmentLabel}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`rounded-full border px-2 py-1 text-[11px] font-bold ${
                          priorityTone[ticket.priority] || "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {formatLabel(ticket.priority)}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="rounded-full border border-[#b7e4c7] bg-[#f7fbf8] px-2 py-1 text-[11px] font-bold text-[#27AE60]">
                        {formatLabel(ticket.status)}
                      </span>
                    </td>
                    <td className="min-w-[150px] px-3 py-3">
                      {assigneeName ? (
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-[#0f3d2e]">
                            {assigneeRoleOrDept || "Assigned"}
                          </p>
                          <p className="mt-0.5 truncate text-[10px] font-medium text-[#27AE60]">
                            {assigneeName}
                          </p>
                        </div>
                      ) : (
                        <span className="font-semibold text-[#5c7d6d]">Unassigned</span>
                      )}
                    </td>
                    <td className="px-3 py-3 font-semibold text-[#5c7d6d]">
                      {formatDueDate(ticket.dueAt)}
                    </td>
                    <td className="px-3 py-3 font-semibold text-[#5c7d6d]">
                      {formatRelativeTime(ticket.updatedAt)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => onOpenTicket?.(ticket._id)}
                        className="h-8 rounded-full border border-[#b7e4c7] bg-white px-3 text-[12px] font-bold text-[#27AE60] transition hover:bg-[#f7fbf8]"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e6f4eb] px-4 py-3">
        <p className="text-[11px] font-semibold text-[#5c7d6d]">
          {total === 0
            ? "No tickets"
            : `Showing ${fromRow}–${toRow} of ${total.toLocaleString("en-IN")}`}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={currentPage <= 1 || listQuery.isFetching}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="inline-flex h-8 items-center gap-1 rounded-full border border-[#b7e4c7] bg-white px-2.5 text-[11px] font-bold text-[#0f3d2e] transition hover:bg-[#f7fbf8] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft size={14} /> Prev
          </button>
          <span className="min-w-[72px] text-center text-[11px] font-bold tabular-nums text-[#0f3d2e]">
            Page {currentPage} / {pages}
          </span>
          <button
            type="button"
            disabled={currentPage >= pages || listQuery.isFetching}
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            className="inline-flex h-8 items-center gap-1 rounded-full border border-[#b7e4c7] bg-white px-2.5 text-[11px] font-bold text-[#0f3d2e] transition hover:bg-[#f7fbf8] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </DashboardCard>
  );
}
