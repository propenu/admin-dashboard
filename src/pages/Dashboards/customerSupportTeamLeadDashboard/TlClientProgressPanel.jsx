import {
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Hourglass,
  ListChecks,
  MapPin,
  UserRound,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const fmt = (v) => Number(v || 0).toLocaleString("en-IN");

function MiniKpi({ label, value, note, icon: Icon, tone = "emerald", onClick }) {
  const tones = {
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    amber: "bg-amber-50 text-amber-700 ring-amber-100",
    blue: "bg-sky-50 text-sky-700 ring-sky-100",
    violet: "bg-violet-50 text-violet-700 ring-violet-100",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-[12px] border border-slate-200/90 bg-white p-2.5 text-left transition hover:border-emerald-300 hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-[10px] font-bold uppercase tracking-wide text-slate-400">
            {label}
          </p>
          <p className="mt-0.5 text-xl font-black tabular-nums text-slate-950">{fmt(value)}</p>
        </div>
        <span
          className={`grid h-8 w-8 shrink-0 place-items-center rounded-[9px] ring-1 ${tones[tone]}`}
        >
          <Icon size={14} />
        </span>
      </div>
      {note ? (
        <p className="mt-1 truncate text-[10px] font-medium text-slate-400">{note}</p>
      ) : null}
    </button>
  );
}

function InventoryRow({ title, bucket, onOpen }) {
  return (
    <div className="rounded-[12px] border border-slate-100 bg-slate-50/70 p-2.5">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <p className="text-[11px] font-bold text-slate-800">{title}</p>
        <button
          type="button"
          onClick={() => onOpen(bucket.hrefAssigned)}
          className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 hover:text-emerald-800"
        >
          Open queue <ChevronRight size={12} />
        </button>
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {[
          { key: "assigned", label: "Assigned", value: bucket.assigned, href: bucket.hrefAssigned, tone: "text-amber-700" },
          { key: "inProgress", label: "In prog.", value: bucket.inProgress, href: bucket.hrefInProgress, tone: "text-sky-700" },
          { key: "completed", label: "Done", value: bucket.completed, href: bucket.hrefCompleted, tone: "text-emerald-700" },
        ].map((cell) => (
          <button
            key={cell.key}
            type="button"
            onClick={() => onOpen(cell.href)}
            className="rounded-[9px] bg-white px-2 py-1.5 text-center shadow-sm ring-1 ring-slate-100 hover:ring-emerald-200"
          >
            <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
              {cell.label}
            </p>
            <p className={`text-sm font-black tabular-nums ${cell.tone}`}>{fmt(cell.value)}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function TlClientProgressPanel({ report, isLoading, rangeLabel }) {
  const navigate = useNavigate();
  const journey = report?.journey || {};
  const inventory = report?.inventory || {};
  const byExecutive = Array.isArray(report?.byExecutive) ? report.byExecutive : [];

  const open = (href) => {
    if (href) navigate(href);
  };

  return (
    <section className="overflow-hidden rounded-[14px] border border-emerald-200/80 bg-white shadow-[0_8px_24px_rgba(16,185,129,0.06)]">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-50 bg-gradient-to-r from-emerald-50/90 to-white px-3 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-emerald-600 text-white">
            <ListChecks size={15} />
          </span>
          <div className="min-w-0">
            <h2 className="text-[13px] font-black text-slate-900">
              Client Progress · Team Lead report
            </h2>
            <p className="truncate text-[10px] text-slate-500">
              CCE process A → P → D + inventory · not tickets ·{" "}
              <span className="font-semibold text-slate-600">{rangeLabel || "period"}</span>
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => open(journey.href?.all)}
          className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-white px-2.5 py-1.5 text-[10px] font-bold text-emerald-700 hover:bg-emerald-50"
        >
          Open queue <ChevronRight size={13} />
        </button>
      </header>

      {isLoading ? (
        <div className="px-3 py-8 text-center text-xs font-semibold text-slate-400">
          Loading Client Progress report…
        </div>
      ) : (
        <div className="space-y-3 p-3">
          <div className="grid grid-cols-2 gap-1.5 lg:grid-cols-4">
            <MiniKpi
              label="Assigned"
              value={journey.assigned}
              note={`${fmt(journey.unassigned)} unassigned`}
              icon={ClipboardList}
              tone="amber"
              onClick={() => open(journey.href?.assigned)}
            />
            <MiniKpi
              label="In progress"
              value={journey.inProgress}
              note="Marked by CCE"
              icon={Hourglass}
              tone="blue"
              onClick={() => open(journey.href?.assigned)}
            />
            <MiniKpi
              label="Completed"
              value={journey.completed}
              note={
                journey.completionRate != null
                  ? `${journey.completionRate}% done`
                  : "Process done"
              }
              icon={CheckCircle2}
              tone="emerald"
              onClick={() => open(journey.href?.assigned)}
            />
            <MiniKpi
              label="Stuck location"
              value={journey.stuckLocation}
              note="User journey stage"
              icon={MapPin}
              tone="violet"
              onClick={() => open(journey.href?.stuckLocation)}
            />
          </div>

          <div className="grid gap-2 lg:grid-cols-2">
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                Inventory follow-up
              </p>
              <InventoryRow
                title="Properties"
                bucket={inventory.properties || {}}
                onOpen={open}
              />
              <InventoryRow
                title="Projects"
                bucket={inventory.projects || {}}
                onOpen={open}
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  By Customer Care Executive
                </p>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400">
                  <Users size={11} />
                  {fmt(report?.cceCount)} CCE
                </span>
              </div>
              <div className="max-h-44 overflow-auto rounded-[12px] border border-slate-100">
                <table className="min-w-full text-left text-[11px]">
                  <thead className="sticky top-0 bg-slate-50 text-[9px] font-bold uppercase tracking-wide text-slate-400">
                    <tr>
                      <th className="px-2.5 py-1.5">Executive</th>
                      <th className="px-2 py-1.5 text-right">A</th>
                      <th className="px-2 py-1.5 text-right">P</th>
                      <th className="px-2.5 py-1.5 text-right">D</th>
                    </tr>
                  </thead>
                  <tbody>
                    {byExecutive.length ? (
                      byExecutive.map((row) => (
                        <tr
                          key={row.id}
                          className="border-t border-slate-50 hover:bg-emerald-50/40"
                        >
                          <td className="px-2.5 py-1.5">
                            <div className="flex min-w-0 items-center gap-1.5">
                              <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-100 text-emerald-800">
                                <UserRound size={11} />
                              </span>
                              <div className="min-w-0">
                                <p className="truncate font-bold text-slate-800">{row.name}</p>
                                {row.email ? (
                                  <p className="truncate text-[9px] text-slate-400">{row.email}</p>
                                ) : null}
                              </div>
                            </div>
                          </td>
                          <td className="px-2 py-1.5 text-right font-black tabular-nums text-amber-700">
                            {fmt(row.assigned)}
                          </td>
                          <td className="px-2 py-1.5 text-right font-black tabular-nums text-sky-700">
                            {fmt(row.inProgress)}
                          </td>
                          <td className="px-2.5 py-1.5 text-right font-black tabular-nums text-emerald-700">
                            {fmt(row.completed)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-3 py-6 text-center text-slate-400">
                          No Customer Care executives in your team directory yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
