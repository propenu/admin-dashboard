import { UserRound, Users } from "lucide-react";
import { formatClockTime } from "../customerSupportTeamLeadDashboardData";

export default function TlTeamPanel({ teamMembers = [], onNavigateTeam, onSelectMember }) {
  const maxOpen = Math.max(...teamMembers.map((m) => m.open || 0), 1);

  return (
    <section className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-sm">
      <header className="flex shrink-0 items-center justify-between gap-2.5 border-b border-slate-100 bg-slate-50/80 px-3.5 py-3">
        <div className="flex items-center gap-2.5">
          <Users className="h-[18px] w-[18px] text-emerald-600" />
          <div>
            <h2 className="text-sm font-bold text-slate-900">Care pod load</h2>
            <p className="text-[11px] text-slate-500">Executives & RMs · open tickets</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onNavigateTeam}
          className="rounded-lg border border-emerald-200 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-50"
        >
          Directory
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto p-3 [scrollbar-width:thin]">
        {teamMembers.length ? (
          <div className="space-y-2">
            {teamMembers.map((member) => (
              <button
                key={member.id}
                type="button"
                onClick={() => onSelectMember?.(member)}
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-emerald-300 hover:bg-emerald-50/40"
              >
                <div className="flex items-start gap-2.5">
                  <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-600">
                    <UserRound className="h-[18px] w-[18px]" />
                    <span
                      className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white ${
                        member.isOnline ? "bg-emerald-500" : "bg-slate-300"
                      }`}
                    />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-900">{member.name}</p>
                        <p className="truncate text-[11px] text-slate-500">{member.role}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-black text-slate-900">{member.open}</p>
                        <p className="text-[10px] font-semibold text-slate-400">open</p>
                      </div>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${
                          member.overdue > 0 ? "bg-rose-500" : "bg-emerald-500"
                        }`}
                        style={{ width: `${Math.max(6, (member.open / maxOpen) * 100)}%` }}
                      />
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-slate-500">
                      <span>
                        Resolved <strong className="text-slate-700">{member.resolved}</strong>
                      </span>
                      <span>
                        Overdue <strong className="text-rose-600">{member.overdue}</strong>
                      </span>
                      <span>
                        Last seen{" "}
                        <strong className="text-slate-700">
                          {member.lastLoginAt ? formatClockTime(member.lastLoginAt) : "—"}
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="grid h-full min-h-[160px] place-items-center px-3 text-center">
            <div>
              <Users className="mx-auto mb-2 h-8 w-8 text-slate-300" />
              <p className="text-sm font-semibold text-slate-600">No pod members yet</p>
              <p className="mt-1 text-xs text-slate-400">
                Assign Customer Care / RM credentials under your role
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
