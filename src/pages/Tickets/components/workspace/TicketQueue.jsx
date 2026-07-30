import { Search, SlidersHorizontal } from "lucide-react";
import { TICKET_PRIORITIES, TICKET_STATUSES, priorityTone, statusTone } from "../../constants/ticketOptions";
import { formatDateTime, formatDueDate, formatLabel, formatRelativeTime } from "../../utils/ticketFormatters";
import { involvementBadge } from "../../utils/ticketRoleAccess";
import { ticketInput, ticketSurface } from "../ticketUi";

const CCE_DESK_RELATION_OPTIONS = [
  { value: "", label: "All customer care" },
  { value: "assigned", label: "Assigned to me" },
  { value: "created", label: "Created by me" },
  { value: "reassigned", label: "Reassigned by me" },
];

export default function TicketQueue({
  tickets = [],
  meta,
  filters,
  onFiltersChange,
  selectedId,
  onSelect,
  isLoading,
  personalScopes = null,
  currentUserId = null,
  exclusiveAssignee = false,
}) {
  const update = (patch) =>
    onFiltersChange({
      ...filters,
      page: 1,
      ...patch,
    });
  const activeScope = filters.personalScope || "mine";
  const setScope = (scopeKey) => {
    if (scopeKey === activeScope) return;
    update({ personalScope: scopeKey });
  };

  return (
    <section className={`flex h-full min-h-0 flex-col overflow-hidden ${ticketSurface}`}>
      <div className="grid gap-2 border-b border-slate-100 p-3">
        {Array.isArray(personalScopes) && personalScopes.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {personalScopes.map((scope) => {
              const active = activeScope === scope.key;
              return (
                <button
                  key={scope.key}
                  type="button"
                  title={scope.hint}
                  onClick={() => setScope(scope.key)}
                  aria-pressed={active}
                  className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-bold transition ${
                    active
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                      : "border-slate-200 bg-white text-slate-500 hover:border-emerald-300 hover:text-slate-800"
                  }`}
                >
                  {scope.label}
                </button>
              );
            })}
          </div>
        )}

        <label className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={filters.q || ""}
            onChange={(event) => update({ q: event.target.value })}
            placeholder="Search ticket, requester, tag"
            className={`${ticketInput} w-full pl-9`}
          />
        </label>

        <div
          className={`grid gap-2 ${
            exclusiveAssignee ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-3"
          }`}
        >
          {exclusiveAssignee ? (
            <FilterSelect
              value={filters.deskRelation || ""}
              onChange={(deskRelation) => update({ deskRelation: deskRelation || undefined })}
            >
              {CCE_DESK_RELATION_OPTIONS.map((option) => (
                <option key={option.value || "all"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </FilterSelect>
          ) : null}

          <FilterSelect
            value={filters.openBucket === "true" || filters.openBucket === true ? "" : filters.status || ""}
            onChange={(status) => update({ status, openBucket: undefined })}
          >
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

        <ActiveFilterChips
          filters={filters}
          onClear={(keys) => {
            const next = { ...filters, page: 1 };
            keys.forEach((key) => {
              delete next[key];
            });
            onFiltersChange(next);
          }}
        />
      </div>

      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 text-[12px] font-semibold text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <SlidersHorizontal className="h-4 w-4 text-[#27AE60]" />
          {meta?.total || tickets.length || 0} tickets
        </span>
        <span>Sort: newest update</span>
      </div>

      <div className="min-h-[1400px] max-h-[calc(100vh-24px)] flex-1 overflow-y-auto">
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
                {involvementBadge(ticket, currentUserId) && (
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 font-bold text-emerald-700">
                    {involvementBadge(ticket, currentUserId)}
                  </span>
                )}
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
      className={`${ticketInput} h-9 w-full min-w-0 max-w-full px-2.5 text-[11px] leading-tight`}
    >
      {children}
    </select>
  );
}

function ActiveFilterChips({ filters, onClear }) {
  const chips = [];
  if (filters.createdFrom || filters.createdTo) {
    const from = String(filters.createdFrom || "").slice(0, 10);
    const to = String(filters.createdTo || "").slice(0, 10);
    chips.push({
      key: "dates",
      label: from && to && from === to ? `Created ${from}` : `Created ${from || "…"} → ${to || "…"}`,
      clearKeys: ["createdFrom", "createdTo", "from", "to"],
    });
  }
  if (filters.openBucket === "true" || filters.openBucket === true) {
    chips.push({ key: "openBucket", label: "Open (all active)", clearKeys: ["openBucket"] });
  }
  if (filters.assignment === "unassigned") {
    chips.push({ key: "assignment", label: "Unassigned", clearKeys: ["assignment"] });
  }
  if (filters.department) {
    chips.push({
      key: "department",
      label: `Dept: ${formatLabel(filters.department)}`,
      clearKeys: ["department"],
    });
  }
  if (!chips.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={() => onClear(chip.clearKeys)}
          className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 hover:bg-emerald-100"
          title="Clear filter"
        >
          {chip.label} ×
        </button>
      ))}
    </div>
  );
}

function EmptyState({ text }) {
  return <div className="p-8 text-center text-[12px] font-semibold text-slate-500">{text}</div>;
}
