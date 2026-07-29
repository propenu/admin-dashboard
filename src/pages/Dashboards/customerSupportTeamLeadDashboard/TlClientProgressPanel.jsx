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

function KpiCard({ label, value, note, icon: Icon, tone = "emerald", onClick }) {
  const tones = {
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    blue: "bg-sky-50 text-sky-700",
    violet: "bg-violet-50 text-violet-700",
    slate: "bg-slate-100 text-slate-600",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-2xl border border-slate-200/90 bg-white p-4 text-left shadow-sm transition-all hover:border-emerald-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-black text-slate-950">{fmt(value)}</p>
          {note ? <p className="mt-1 text-[10px] font-medium text-slate-400">{note}</p> : null}
        </div>
        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${tones[tone]}`}>
          <Icon size={18} />
        </span>
      </div>
    </button>
  );
}

function InventoryRow({ title, bucket, onOpen }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-xs font-bold text-slate-800">{title}</p>
        <button
          type="button"
          onClick={() => onOpen(bucket.hrefAssigned)}
          className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-700 hover:text-emerald-800"
        >
          Open queue <ChevronRight size={12} />
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <button
          type="button"
          onClick={() => onOpen(bucket.hrefAssigned)}
          className="rounded-lg bg-white px-2 py-1.5 shadow-sm hover:ring-1 hover:ring-amber-200"
        >
          <p className="text-[10px] font-semibold text-slate-400">Assigned</p>
          <p className="text-sm font-black text-amber-700">{fmt(bucket.assigned)}</p>
          <p className="text-[9px] text-slate-400">Awaiting approval</p>
        </button>
        <button
          type="button"
          onClick={() => onOpen(bucket.hrefInProgress)}
          className="rounded-lg bg-white px-2 py-1.5 shadow-sm hover:ring-1 hover:ring-sky-200"
        >
          <p className="text-[10px] font-semibold text-slate-400">In progress</p>
          <p className="text-sm font-black text-sky-700">{fmt(bucket.inProgress)}</p>
          <p className="text-[9px] text-slate-400">Draft / incomplete</p>
        </button>
        <button
          type="button"
          onClick={() => onOpen(bucket.hrefCompleted)}
          className="rounded-lg bg-white px-2 py-1.5 shadow-sm hover:ring-1 hover:ring-emerald-200"
        >
          <p className="text-[10px] font-semibold text-slate-400">Completed</p>
          <p className="text-sm font-black text-emerald-700">{fmt(bucket.completed)}</p>
          <p className="text-[9px] text-slate-400">Live / active</p>
        </button>
      </div>
    </div>
  );
}

/**
 * Additive Team Lead panel for Client Progress Queue metrics.
 * Separate from ticket KPIs on the same dashboard.
 */
export default function TlClientProgressPanel({ report, isLoading, rangeLabel }) {
  const navigate = useNavigate();
  const journey = report?.journey || {};
  const inventory = report?.inventory || {};
  const byExecutive = Array.isArray(report?.byExecutive) ? report.byExecutive : [];

  const open = (href) => {
    if (href) navigate(href);
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-emerald-200/80 bg-white shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-50 bg-gradient-to-r from-emerald-50/80 to-white px-4 py-3">
        <div className="flex min-w-0 items-start gap-2.5">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-600 text-white shadow-sm">
            <ListChecks size={18} />
          </span>
          <div className="min-w-0">
            <h2 className="text-sm font-black text-slate-900">Client Progress · Team Lead report</h2>
            <p className="mt-0.5 text-[11px] text-slate-500">
              CCE process (Assigned → In progress → Completed) + Properties/Projects · not
              tickets ·{" "}
              {rangeLabel ? (
                <span className="font-semibold text-slate-600">{rangeLabel}</span>
              ) : (
                "selected period"
              )}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => open(journey.href?.all)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700"
        >
          Open Client Progress Queue <ChevronRight size={14} />
        </button>
      </header>

      {isLoading ? (
        <div className="px-4 py-8 text-center text-xs font-semibold text-slate-400">
          Loading Client Progress report…
        </div>
      ) : (
        <div className="space-y-4 p-4">
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-slate-400">
              CCE process (what executives mark on Client Progress Queue)
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <KpiCard
                label="Assigned"
                value={journey.assigned}
                note={`${fmt(journey.unassigned)} unassigned · auto after CCE attach`}
                icon={ClipboardList}
                tone="amber"
                onClick={() => open(journey.href?.assigned)}
              />
              <KpiCard
                label="In progress"
                value={journey.inProgress}
                note="Marked In progress by CCE"
                icon={Hourglass}
                tone="blue"
                onClick={() => open(journey.href?.assigned)}
              />
              <KpiCard
                label="Completion"
                value={journey.completed}
                note={
                  journey.completionRate != null
                    ? `${journey.completionRate}% CCE process done`
                    : "Marked Completed by CCE"
                }
                icon={CheckCircle2}
                tone="emerald"
                onClick={() => open(journey.href?.assigned)}
              />
              <KpiCard
                label="Stuck at location"
                value={journey.stuckLocation}
                note="System journey stage (user not finished location)"
                icon={MapPin}
                tone="violet"
                onClick={() => open(journey.href?.stuckLocation)}
              />
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                Inventory follow-up
              </p>
              <div className="space-y-2">
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
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  By Customer Care Executive
                </p>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400">
                  <Users size={12} />
                  {fmt(report?.cceCount)} CCE
                </span>
              </div>
              <div className="max-h-56 overflow-auto rounded-xl border border-slate-100">
                <table className="min-w-full text-left text-[11px]">
                  <thead className="sticky top-0 bg-slate-50 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                    <tr>
                      <th className="px-3 py-2">Executive</th>
                      <th className="px-2 py-2 text-right">Assigned</th>
                      <th className="px-2 py-2 text-right">In prog.</th>
                      <th className="px-3 py-2 text-right">Done</th>
                    </tr>
                  </thead>
                  <tbody>
                    {byExecutive.length ? (
                      byExecutive.map((row) => (
                        <tr key={row.id} className="border-t border-slate-50 hover:bg-emerald-50/40">
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-2">
                              <span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-800">
                                <UserRound size={12} />
                              </span>
                              <div className="min-w-0">
                                <p className="truncate font-semibold text-slate-800">{row.name}</p>
                                {row.email ? (
                                  <p className="truncate text-[9px] text-slate-400">{row.email}</p>
                                ) : null}
                              </div>
                            </div>
                          </td>
                          <td className="px-2 py-2 text-right font-bold text-amber-700">
                            {fmt(row.assigned)}
                          </td>
                          <td className="px-2 py-2 text-right font-bold text-sky-700">
                            {fmt(row.inProgress)}
                          </td>
                          <td className="px-3 py-2 text-right font-bold text-emerald-700">
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
