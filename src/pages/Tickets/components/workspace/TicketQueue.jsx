import { Search, SlidersHorizontal } from "lucide-react";
import { TICKET_PRIORITIES, TICKET_STATUSES, priorityTone, statusTone } from "../../constants/ticketOptions";
import { formatDateTime, formatDueDate, formatLabel, formatRelativeTime } from "../../utils/ticketFormatters";
import { ticketInput, ticketSurface } from "../ticketUi";

export default function TicketQueue({
  tickets = [],
  meta,
  filters,
  onFiltersChange,
  selectedId,
  onSelect,
  isLoading,
}) {
  const update = (patch) => onFiltersChange({ ...filters, page: 1, ...patch });

  return (
    <section className={`${ticketSurface} overflow-hidden`}>
      <div className="grid gap-2 border-b border-slate-100 p-3">
        <label className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={filters.q || ""}
            onChange={(event) => update({ q: event.target.value })}
            placeholder="Search ticket, requester, tag"
            className={`${ticketInput} w-full pl-9`}
          />
        </label>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <FilterSelect value={filters.status || ""} onChange={(status) => update({ status })}>
            <option value="">All status</option>
            {TICKET_STATUSES.map((status) => (
              <option key={status} value={status}>
                {formatLabel(status)}
              </option>
            ))}
          </FilterSelect>

          <FilterSelect value={filters.priority || ""} onChange={(priority) => update({ priority })}>
            <option value="">All priority</option>
            {TICKET_PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {formatLabel(priority)}
              </option>
            ))}
          </FilterSelect>

          <FilterSelect value={filters.overdue || ""} onChange={(overdue) => update({ overdue })}>
            <option value="">SLA</option>
            <option value="true">Overdue</option>
            <option value="false">Not overdue</option>
          </FilterSelect>
        </div>
      </div>

      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 text-[12px] font-semibold text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <SlidersHorizontal className="h-4 w-4 text-[#27AE60]" />
          {meta?.total || tickets.length || 0} tickets
        </span>
        <span>Sort: newest update</span>
      </div>

      <div className="max-h-[calc(100vh-230px)] min-h-[360px] overflow-y-auto">
        {isLoading ? (
          <EmptyState text="Loading tickets..." />
        ) : tickets.length === 0 ? (
          <EmptyState text="No tickets match this view." />
        ) : (
          tickets.map((ticket) => (
            <button
              key={ticket._id}
              type="button"
              onClick={() => onSelect(ticket._id)}
            className={`block w-full border-b border-slate-100 px-4 py-4 text-left transition duration-200 hover:bg-emerald-50/60 ${
                selectedId === ticket._id ? "bg-emerald-50 shadow-[inset_4px_0_0_#27AE60]" : "bg-white"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-bold text-slate-950">{ticket.title}</p>
                  <p className="mt-1 truncate text-[12px] font-medium text-slate-500">
                    {ticket.requester?.name || "Requester"} - {formatLabel(ticket.department)}
                  </p>
                </div>
                <span className={`shrink-0 rounded-full border px-2 py-1 text-[11px] font-bold ${priorityTone[ticket.priority] || priorityTone.medium}`}>
                  {formatLabel(ticket.priority)}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px] font-medium text-slate-500">
                <span className={`rounded-full border px-2 py-1 font-bold ${statusTone[ticket.status] || statusTone.open}`}>
                  {formatLabel(ticket.status)}
                </span>
                <span>{ticket.assignedTo?.name ? `Assigned ${ticket.assignedTo.name}` : "Unassigned"}</span>
                <span>Created {formatDateTime(ticket.createdAt)}</span>
                <span>Due {formatDueDate(ticket.dueAt)}</span>
                <span>Updated {formatRelativeTime(ticket.updatedAt)}</span>
              </div>
            </button>
          ))
        )}
      </div>
    </section>
  );
}

function FilterSelect({ value, onChange, children }) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={`${ticketInput} min-w-0`}
    >
      {children}
    </select>
  );
}

function EmptyState({ text }) {
  return <div className="p-8 text-center text-[12px] font-semibold text-slate-500">{text}</div>;
}
