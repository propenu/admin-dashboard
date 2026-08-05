export default function SaOpsPanel({
  leadSourceRows = [],
  ticketStatusRows = [],
  roleRows = [],
  summary,
  onOpenLeads,
  onOpenTickets,
  onOpenUsers,
}) {
  const maxLead = Math.max(...leadSourceRows.map((r) => r.leads), 1);
  const maxTicket = Math.max(...ticketStatusRows.map((r) => r.count), 1);
  const maxRole = Math.max(...roleRows.map((r) => r.count), 1);

  return (
    <article className="flex h-full min-h-0 flex-col overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-3.5 py-2.5">
        <div>
          <h3 className="text-xs font-bold text-slate-900">Lead, ticket & role summary</h3>
          <p className="text-[10px] text-slate-500">
            Leads {summary?.totalLeads || 0} · Tickets open {summary?.openTickets || 0} ·{" "}
            <button
              type="button"
              onClick={onOpenUsers}
              className="font-semibold text-emerald-700 underline decoration-emerald-300 underline-offset-2 hover:text-emerald-800"
            >
              Onboarding {summary?.onboardingUsers || 0}
            </button>
          </p>
        </div>
        <div className="flex gap-1.5">
          <button type="button" onClick={onOpenLeads} className="rounded-lg border border-slate-200 px-2 py-1 text-[10px] font-semibold text-slate-600 hover:bg-slate-50">
            Leads
          </button>
          <button type="button" onClick={onOpenTickets} className="rounded-lg border border-slate-200 px-2 py-1 text-[10px] font-semibold text-slate-600 hover:bg-slate-50">
            Tickets
          </button>
          <button type="button" onClick={onOpenUsers} className="rounded-lg border border-slate-200 px-2 py-1 text-[10px] font-semibold text-slate-600 hover:bg-slate-50">
            Users
          </button>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 gap-3 overflow-y-auto p-3 lg:grid-cols-3">
        <Column title="Lead sources" empty="No leads for this date range" rows={leadSourceRows} max={maxLead} valueKey="leads" />
        <Column title="Ticket status" empty="No tickets for this date range" rows={ticketStatusRows} max={maxTicket} valueKey="count" />
        <Column
          title="Users by role"
          empty="No users / builders / staff / agents for this date range"
          rows={roleRows}
          max={maxRole}
          valueKey="count"
        />
      </div>
    </article>
  );
}

function Column({ title, empty, rows, max, valueKey }) {
  return (
    <div>
      <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">{title}</p>
      {!rows.length ? (
        <p className="py-6 text-center text-xs text-slate-400">{empty}</p>
      ) : (
        <ul className="space-y-1.5">
          {rows.map((row) => (
            <li key={row.key} className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="truncate font-semibold text-slate-700">{row.label}</span>
                <span className="font-black tabular-nums text-slate-900">{row[valueKey]}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${Math.max(4, (row[valueKey] / max) * 100)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
