function Column({ title, rows = [], empty }) {
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <div>
      <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">{title}</p>
      {!rows.length ? (
        <p className="py-6 text-center text-xs text-slate-400">{empty}</p>
      ) : (
        <ul className="space-y-1.5">
          {rows.map((row) => (
            <li key={row.key} className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="truncate font-semibold text-slate-700">{row.label}</span>
                <span className="font-black tabular-nums text-slate-900">{row.value}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${Math.max(4, (row.value / max) * 100)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function AdMixPanel({
  sourceRows = [],
  categoryRows = [],
  ticketRows = [],
  userMix = [],
  summary,
  onOpenLeads,
  onOpenTickets,
  onOpenUsers,
}) {
  return (
    <article className="flex h-full min-h-0 flex-col overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-3.5 py-2.5">
        <div>
          <h3 className="text-xs font-bold text-slate-900">Marketplace mix</h3>
          <p className="text-[10px] text-slate-500">
            {summary?.usersTotal || 0} users · {summary?.builders || 0} builders · {summary?.agents || 0} agents
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
      <div className="grid min-h-0 flex-1 gap-3 overflow-y-auto p-3 lg:grid-cols-4">
        <Column title="Lead sources" rows={sourceRows} empty="No leads" />
        <Column title="Demand categories" rows={categoryRows} empty="No demand" />
        <Column title="Ticket status" rows={ticketRows} empty="No tickets" />
        <Column title="User segments" rows={userMix} empty="No users" />
      </div>
    </article>
  );
}
