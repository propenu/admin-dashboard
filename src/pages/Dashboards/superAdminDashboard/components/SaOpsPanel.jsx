import { saSurface } from "../dashboardSurface";

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
    <article className={`flex h-full min-h-0 flex-col overflow-hidden rounded-2xl ${saSurface}`}>
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-50 px-3.5 py-2.5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-emerald-600">Operations</p>
          <h3 className="text-xs font-semibold text-[#0f3d2e]">Lead, ticket & role summary</h3>
          <p className="text-[10px] text-[#5c7d6d]">
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
          <button type="button" onClick={onOpenLeads} className="rounded-full border border-emerald-100 px-2 py-1 text-[10px] font-semibold text-[#0f3d2e] hover:bg-emerald-50">
            Leads
          </button>
          <button type="button" onClick={onOpenTickets} className="rounded-full border border-emerald-100 px-2 py-1 text-[10px] font-semibold text-[#0f3d2e] hover:bg-emerald-50">
            Tickets
          </button>
          <button type="button" onClick={onOpenUsers} className="rounded-full border border-emerald-100 px-2 py-1 text-[10px] font-semibold text-[#0f3d2e] hover:bg-emerald-50">
            Users
          </button>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 gap-3 overflow-y-auto p-3 sm:grid-cols-2 lg:grid-cols-3">
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
      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.08em] text-emerald-600">{title}</p>
      {!rows.length ? (
        <p className="py-6 text-center text-xs text-[#5c7d6d]">{empty}</p>
      ) : (
        <ul className="space-y-1.5">
          {rows.map((row) => (
            <li key={row.key} className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="truncate font-semibold text-[#5c7d6d]">{row.label}</span>
                <span className="font-semibold tabular-nums text-[#0f3d2e]">{row[valueKey]}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-emerald-50">
                <div
                  className="h-full rounded-full bg-[#27AE60]"
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
