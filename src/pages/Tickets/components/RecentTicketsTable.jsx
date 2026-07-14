import DashboardCard from "./DashboardCard";
import {
  formatDueDate,
  formatLabel,
  formatRelativeTime,
} from "../utils/ticketFormatters";

const priorityTone = {
  urgent: "bg-red-50 text-red-700",
  high: "bg-red-50 text-red-600",
  medium: "bg-amber-50 text-amber-600",
  low: "bg-green-50 text-green-600",
};

export default function RecentTicketsTable({ tickets, onOpenQueue, onOpenTicket }) {
  return (
    <DashboardCard className="p-0">
      <div className="px-1 py-0.5">
        <h2 className="text-[10px] font-medium text-slate-900">Recent Tickets</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-left text-[10px]">
          <thead className="border-y border-slate-200 bg-white text-[9px] font-medium text-slate-700">
            <tr>
              <th className="px-1 py-0.5">Ticket</th>
              <th className="px-1 py-0.5">Department</th>
              <th className="px-1 py-0.5">Priority</th>
              <th className="px-1 py-0.5">Status</th>
              <th className="px-1 py-0.5">Assigned To</th>
              <th className="px-1 py-0.5">Due Date</th>
              <th className="px-1 py-0.5">Updated</th>
              <th className="px-1 py-0.5 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr key={ticket._id} className="border-b border-slate-200 hover:bg-emerald-50/40">
                <td className="max-w-[190px] px-1 py-0.5 font-normal text-slate-900">
                  {ticket.title}
                </td>
                <td className="px-1 py-0.5 font-normal text-slate-700">
                  {formatLabel(ticket.department)}
                </td>
                <td className="px-1 py-0.5">
                  <span
                    className={`rounded-full px-1 py-0 text-[9px] font-normal ${
                      priorityTone[ticket.priority] || "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {formatLabel(ticket.priority)}
                  </span>
                </td>
                <td className="px-1 py-0.5">
                  <span className="rounded-full bg-blue-50 px-1 py-0 text-[9px] font-normal text-blue-600">
                    {formatLabel(ticket.status)}
                  </span>
                </td>
                <td className="px-1 py-0.5 font-normal text-slate-700">
                  {ticket.agent?.name || "Unassigned"}
                </td>
                <td className="px-1 py-0.5 font-normal text-slate-700">
                  {formatDueDate(ticket.dueAt)}
                </td>
                <td className="px-1 py-0.5 font-normal text-slate-700">
                  {formatRelativeTime(ticket.updatedAt)}
                </td>
                <td className="px-1 py-0.5 text-center">
                  <button
                    type="button"
                    onClick={() => onOpenTicket?.(ticket._id)}
                    className="h-5 rounded-md border border-blue-500 px-2 text-[9px] font-medium text-blue-600 hover:bg-blue-50"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {tickets.length === 0 && (
          <div className="py-4 text-center text-[11px] font-medium text-slate-500">
            No recent tickets found
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => onOpenQueue?.({})}
        className="h-5 w-full text-[9px] font-medium text-blue-600 hover:bg-blue-50"
      >
        View all tickets
      </button>
    </DashboardCard>
  );
}
