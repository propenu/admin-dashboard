import { ArrowUpRight, Clock, MessageSquare, Plus, UserRound, Users } from "lucide-react";
import { formatRelativeClock } from "../customerCareDashboardData";

const panelShell =
  "flex min-h-0 min-w-0 flex-col overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-sm";

export default function CustomerCareRightPanel({
  leadRows,
  activityRows,
  onNavigate,
  onQuickAction,
}) {
  return (
    <>
      <section className={panelShell}>
        <header className="flex shrink-0 items-center justify-between gap-2.5 border-b border-slate-100 bg-slate-50/80 px-3.5 py-3">
          <h3 className="text-sm font-bold text-slate-900">Leads Needing Follow-up</h3>
          <button
            type="button"
            onClick={() => onNavigate("/leads?joined=today")}
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
          >
            View All
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-hidden">
          <div className="max-h-56 overflow-y-auto p-3 [scrollbar-width:thin]">
            {leadRows.length ? (
              <div className="space-y-2">
                {leadRows.map((lead) => (
                  <article key={lead.id} className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                    <p className="truncate text-xs font-bold text-slate-900">{lead.project}</p>
                    <p className="mt-0.5 text-[11px] text-slate-500">{lead.name}</p>
                    <p className="text-[11px] text-slate-400">{lead.phone || lead.email || "—"}</p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                        {lead.status}
                      </span>
                      <button
                        type="button"
                        onClick={() => onNavigate("/leads?joined=today")}
                        className="rounded-lg bg-emerald-600 px-2.5 py-1 text-[10px] font-bold text-white hover:bg-emerald-700"
                      >
                        Follow up
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-1 py-6 text-center text-xs text-slate-400">
                <Users className="h-7 w-7 text-slate-300" />
                <p className="font-medium text-slate-500">No leads need follow-up</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className={panelShell}>
        <header className="flex shrink-0 items-center justify-between gap-2.5 border-b border-slate-100 bg-slate-50/80 px-3.5 py-3">
          <h3 className="text-sm font-bold text-slate-900">Quick Actions</h3>
        </header>
        <div className="grid grid-cols-2 gap-2 p-3">
          {[
            { label: "Create Ticket", icon: Plus, action: "create-ticket" },
            { label: "View Customer", icon: UserRound, action: "view-customer" },
            { label: "Add Lead Note", icon: MessageSquare, action: "lead-note" },
            { label: "Escalate", icon: ArrowUpRight, action: "escalate" },
          ].map((item) => (
            <button
              key={item.action}
              type="button"
              onClick={() => onQuickAction(item.action)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left text-xs font-bold text-slate-700 hover:border-emerald-200 hover:bg-emerald-50"
            >
              <item.icon className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className={panelShell}>
        <header className="flex shrink-0 items-center justify-between gap-2.5 border-b border-slate-100 bg-slate-50/80 px-3.5 py-3">
          <h3 className="text-sm font-bold text-slate-900">Today&apos;s Activity</h3>
        </header>
        <div className="min-h-0 flex-1 overflow-hidden">
          <div className="max-h-56 overflow-y-auto p-3 [scrollbar-width:thin]">
            {activityRows.length ? (
              <div className="space-y-2.5">
                {activityRows.map((item) => (
                  <div key={item.id} className="flex gap-2.5">
                    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${item.tone}`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between gap-2">
                        <p className="text-xs font-semibold text-slate-800">{item.title}</p>
                        <span className="shrink-0 text-[10px] text-slate-400">{formatRelativeClock(item.time)}</span>
                      </div>
                      <p className="line-clamp-2 text-[11px] text-slate-500">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-1 py-6 text-center text-xs text-slate-400">
                <Clock className="h-7 w-7 text-slate-300" />
                <p className="font-medium text-slate-500">No activity yet today</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
