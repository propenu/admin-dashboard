import { useMemo } from "react";
import { Activity, Users } from "lucide-react";

const fmt = (v) => Number(v || 0).toLocaleString("en-IN");

/**
 * Fast staff analysis — pure memo over already-fetched payloads (no extra API).
 */
export default function TlStaffAnalysisPanel({
  byExecutive = [],
  teamMembers = [],
  onOpenDirectory,
  isLive = false,
}) {
  const rows = useMemo(() => {
    const ticketById = new Map((teamMembers || []).map((m) => [String(m.id), m]));
    return (byExecutive || [])
      .map((row) => {
        const ticket = ticketById.get(String(row.id)) || {};
        const assigned = Number(row.assigned || 0);
        const inProgress = Number(row.inProgress || 0);
        const completed = Number(row.completed || 0);
        const cases = assigned + inProgress + completed;
        const openLoad = assigned + inProgress;
        return {
          ...row,
          assigned,
          inProgress,
          completed,
          cases,
          openLoad,
          openTickets: Number(ticket.open || 0),
          overdue: Number(ticket.overdue || 0),
          isOnline: Boolean(ticket.isOnline),
          donePct: cases ? Math.round((completed / cases) * 100) : null,
        };
      })
      .sort((a, b) => b.openLoad - a.openLoad || b.openTickets - a.openTickets);
  }, [byExecutive, teamMembers]);

  const totals = useMemo(
    () =>
      rows.reduce(
        (acc, row) => {
          acc.assigned += row.assigned;
          acc.inProgress += row.inProgress;
          acc.completed += row.completed;
          acc.openTickets += row.openTickets;
          return acc;
        },
        { assigned: 0, inProgress: 0, completed: 0, openTickets: 0 },
      ),
    [rows],
  );

  return (
    <section
      id="tl-staff-analysis"
      className="flex h-full min-h-[320px] max-h-[420px] flex-col overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]"
    >
      <header className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-100 px-3 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-emerald-50 text-emerald-700">
            <Users size={15} />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-[13px] font-black text-slate-900">Staff performance</h3>
              {isLive ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-700">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                  Live
                </span>
              ) : null}
            </div>
            <p className="truncate text-[10px] text-slate-500">
              {fmt(rows.length)} CCE · A {fmt(totals.assigned)} · P {fmt(totals.inProgress)} · D{" "}
              {fmt(totals.completed)} · {fmt(totals.openTickets)} open tickets
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onOpenDirectory}
          className="shrink-0 rounded-lg border border-emerald-200 bg-emerald-50/60 px-2.5 py-1.5 text-[10px] font-bold text-emerald-700 hover:bg-emerald-100"
        >
          Directory
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-auto px-2.5 py-2 [scrollbar-width:thin]">
        {!rows.length ? (
          <div className="grid h-full place-items-center py-8 text-center">
            <Activity className="mx-auto mb-2 text-slate-300" size={22} />
            <p className="text-xs font-semibold text-slate-400">No CCE staff in your pod yet</p>
          </div>
        ) : (
          <ul className="space-y-1.5">
            {rows.map((row) => {
              const denom = Math.max(row.cases, 1);
              const aW = row.cases ? (row.assigned / denom) * 100 : 0;
              const pW = row.cases ? (row.inProgress / denom) * 100 : 0;
              const dW = row.cases ? (row.completed / denom) * 100 : 0;
              return (
                <li
                  key={row.id}
                  className="rounded-[11px] border border-slate-100 bg-gradient-to-r from-slate-50/90 to-white px-2.5 py-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex items-center gap-2">
                      <span
                        className={`h-2 w-2 shrink-0 rounded-full ${
                          row.isOnline ? "bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.18)]" : "bg-slate-300"
                        }`}
                      />
                      <div className="min-w-0">
                        <p className="truncate text-[12px] font-bold text-slate-900">{row.name}</p>
                        <p className="truncate text-[10px] text-slate-400">
                          {fmt(row.openLoad)} process open · {fmt(row.openTickets)} tickets
                          {row.overdue ? ` · ${fmt(row.overdue)} SLA` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[11px] font-black tabular-nums text-slate-900">
                        {row.donePct != null ? `${row.donePct}%` : "—"}
                      </p>
                      <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                        done
                      </p>
                    </div>
                  </div>

                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    {row.cases ? (
                      <div className="flex h-full w-full">
                        <span className="bg-amber-400" style={{ width: `${aW}%` }} />
                        <span className="bg-sky-400" style={{ width: `${pW}%` }} />
                        <span className="bg-emerald-500" style={{ width: `${dW}%` }} />
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-1.5 flex flex-wrap gap-1">
                    <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
                      A {fmt(row.assigned)}
                    </span>
                    <span className="rounded-md bg-sky-50 px-1.5 py-0.5 text-[10px] font-bold text-sky-700">
                      P {fmt(row.inProgress)}
                    </span>
                    <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                      D {fmt(row.completed)}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
