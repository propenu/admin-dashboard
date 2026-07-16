import DashboardCard from "./DashboardCard";
import { ghostButton } from "./ticketUi";
import {
  formatDueDate,
  formatLabel,
  formatRelativeTime,
} from "../utils/ticketFormatters";

const priorityTone = {
  urgent: "border-red-200 bg-red-50 text-red-700",
  high: "border-rose-200 bg-rose-50 text-rose-700",
  medium: "border-amber-200 bg-amber-50 text-amber-700",
  low: "border-emerald-200 bg-emerald-50 text-[#219653]",
};

export default function RecentTicketsTable({ tickets, onOpenQueue, onOpenTicket }) {
  return (
    <DashboardCard className="p-0">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div>
          <h2 className="text-[13px] font-bold text-slate-950">Recent Tickets</h2>
          <p className="mt-0.5 text-[12px] font-medium text-slate-500">
            Latest requester updates and assignee movement.
          </p>
        </div>
        <button type="button" onClick={() => onOpenQueue?.({})} className={ghostButton}>
          View Queue
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-[12px]">
          <thead className="border-y border-slate-100 bg-slate-50 text-[11px] font-bold uppercase tracking-wide text-slate-500">
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
            {tickets.map((ticket) => (
              <tr key={ticket._id} className="border-b border-slate-100 transition hover:bg-emerald-50/60">
                <td className="max-w-[220px] px-4 py-3 font-bold text-slate-950">
                  {ticket.title}
                </td>
                <td className="px-3 py-3 font-semibold text-slate-600">
                  {formatLabel(ticket.department)}
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
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] font-bold text-[#219653]">
                    {formatLabel(ticket.status)}
                  </span>
                </td>
                <td className="px-3 py-3 font-semibold text-slate-600">
                  {ticket.assignedTo?.name || ticket.agent?.name || "Unassigned"}
                </td>
                <td className="px-3 py-3 font-semibold text-slate-600">
                  {formatDueDate(ticket.dueAt)}
                </td>
                <td className="px-3 py-3 font-semibold text-slate-600">
                  {formatRelativeTime(ticket.updatedAt)}
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    type="button"
                    onClick={() => onOpenTicket?.(ticket._id)}
                    className="h-8 rounded-xl border border-emerald-200 bg-white px-3 text-[12px] font-bold text-[#219653] transition hover:bg-emerald-50"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {tickets.length === 0 && (
          <div className="py-10 text-center text-[12px] font-semibold text-slate-500">
            No recent tickets found
          </div>
        )}
      </div>
    </DashboardCard>
  );
}
