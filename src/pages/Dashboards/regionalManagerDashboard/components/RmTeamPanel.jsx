import { ChevronRight, Users } from "lucide-react";

const cleanRole = (value = "") =>
  String(value || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());

export default function RmTeamPanel({
  teamMembers = [],
  roleBreakdown = [],
  summary,
  onOpenTeam,
}) {
  return (
    <section className="flex h-full flex-col rounded-[14px] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-600">
            Sales pod
          </p>
          <h2 className="text-sm font-black text-slate-950">Team directory snapshot</h2>
          <p className="mt-0.5 text-[11px] text-slate-500">
            {summary?.teamCount || 0} members · {summary?.activeTeam || 0} active
          </p>
        </div>
        <Users className="h-5 w-5 text-emerald-600" />
      </div>

      {roleBreakdown.length > 0 ? (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {roleBreakdown.slice(0, 4).map((row) => (
            <span
              key={row.role}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-semibold text-slate-600"
            >
              {row.label} · {row.count}
            </span>
          ))}
        </div>
      ) : null}

      <div className="min-h-0 flex-1 space-y-2 overflow-auto">
        {teamMembers.length ? (
          teamMembers.map((member) => (
            <div
              key={member._id || member.id || member.email}
              className="flex items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50/70 px-2.5 py-2"
            >
              <div className="min-w-0">
                <p className="truncate text-[12px] font-bold text-slate-900">
                  {member.name || member.fullName || "Team member"}
                </p>
                <p className="truncate text-[10px] text-slate-500">
                  {cleanRole(member.roleName)}
                  {member.city ? ` · ${member.city}` : ""}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                  member.isActive === false
                    ? "bg-slate-200 text-slate-500"
                    : "bg-emerald-100 text-emerald-700"
                }`}
              >
                {member.isActive === false ? "Off" : "Active"}
              </span>
            </div>
          ))
        ) : (
          <p className="py-8 text-center text-xs text-slate-400">No team members in scope</p>
        )}
      </div>

      <button
        type="button"
        onClick={onOpenTeam}
        className="mt-3 inline-flex w-full items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
      >
        Open sales managers <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </section>
  );
}
