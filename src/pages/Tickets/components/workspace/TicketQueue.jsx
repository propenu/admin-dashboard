import { Search, SlidersHorizontal } from "lucide-react";
import { TICKET_PRIORITIES, TICKET_STATUSES, priorityTone, statusTone } from "../../constants/ticketOptions";
import { formatDueDate, formatLabel, formatRelativeTime } from "../../utils/ticketFormatters";

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
    <section className="rounded-md border border-slate-200 bg-white shadow-sm">
      <div className="grid gap-1 border-b border-slate-200 p-1">
        <label className="relative">
          <Search className="pointer-events-none absolute left-1.5 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400" />
          <input
            value={filters.q || ""}
            onChange={(event) => update({ q: event.target.value })}
            placeholder="Search ticket, requester, tag"
            className="h-7 w-full rounded-md border border-slate-200 bg-white pl-6 pr-1.5 text-[11px] outline-none focus:border-emerald-400"
          />
        </label>

        <div className="grid grid-cols-3 gap-1">
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

      <div className="flex items-center justify-between border-b border-slate-100 px-1.5 py-1 text-[10px] text-slate-500">
        <span className="inline-flex items-center gap-1">
          <SlidersHorizontal className="h-3 w-3" />
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
              className={`block w-full border-b border-slate-100 px-1.5 py-2 text-left transition hover:bg-emerald-50/60 ${
                selectedId === ticket._id ? "bg-emerald-50 shadow-[inset_3px_0_0_#16a34a]" : "bg-white"
              }`}
            >
              <div className="flex items-start justify-between gap-1.5">
                <div className="min-w-0">
                  <p className="truncate text-[11px] font-medium text-slate-950">{ticket.title}</p>
                  <p className="mt-0.5 truncate text-[10px] text-slate-500">
                    {ticket.requester?.name || "Requester"} - {formatLabel(ticket.department)}
                  </p>
                </div>
                <span className={`shrink-0 rounded-full border px-1 py-0.5 text-[9px] ${priorityTone[ticket.priority] || priorityTone.medium}`}>
                  {formatLabel(ticket.priority)}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-1 text-[9px] text-slate-500">
                <span className={`rounded-full border px-1 py-0.5 ${statusTone[ticket.status] || statusTone.open}`}>
                  {formatLabel(ticket.status)}
                </span>
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
      className="h-7 min-w-0 rounded-md border border-slate-200 bg-white px-1.5 text-[11px] text-slate-700 outline-none focus:border-emerald-400"
    >
      {children}
    </select>
  );
}

function EmptyState({ text }) {
  return <div className="p-4 text-center text-[11px] text-slate-500">{text}</div>;
}
