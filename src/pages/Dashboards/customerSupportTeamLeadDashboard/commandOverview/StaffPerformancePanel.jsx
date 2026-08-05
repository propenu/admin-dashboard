import { useMemo, useState } from "react";
import { ArrowDownUp, Search, Users } from "lucide-react";
import MetricSparkline from "./MetricSparkline";
import JourneyMixChart from "./JourneyMixChart";

const fmt = (v) => Number(v || 0).toLocaleString("en-IN");

function WorkloadBar({ row, maxCases, onSelect, selected }) {
  const total = Math.max(row.totalCases, 0);
  const scale = maxCases || 1;
  const widthPct = Math.max(total ? 8 : 0, (total / scale) * 100);
  const a = total ? (row.assigned / total) * 100 : 0;
  const p = total ? (row.inProgress / total) * 100 : 0;
  const d = total ? (row.completed / total) * 100 : 0;

  return (
    <button
      type="button"
      onClick={() => onSelect?.(row)}
      className={`grid w-full grid-cols-[96px_1fr] items-center gap-2 rounded-lg px-1 py-0.5 text-left transition sm:grid-cols-[120px_1fr] ${
        selected
          ? "bg-emerald-50 ring-1 ring-emerald-200"
          : "hover:bg-emerald-50/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
      }`}
    >
      <p className="truncate text-[12px] font-bold text-slate-800" title={row.name}>
        {row.name}
      </p>
      <div className="min-w-0">
        <div
          className="h-7 overflow-hidden rounded-lg bg-emerald-50 ring-1 ring-emerald-100"
          style={{ width: `${widthPct}%` }}
          title={`A ${row.assigned} · P ${row.inProgress} · D ${row.completed}`}
        >
          <div className="flex h-full w-full motion-safe:animate-[tlBarGrow_650ms_ease-out] origin-left">
            <span
              className="grid place-items-center bg-emerald-200 text-[9px] font-bold text-emerald-900"
              style={{ width: `${a}%` }}
            >
              {row.assigned > 0 ? row.assigned : ""}
            </span>
            <span
              className="grid place-items-center bg-emerald-400 text-[9px] font-bold text-white"
              style={{ width: `${p}%` }}
            >
              {row.inProgress > 0 ? row.inProgress : ""}
            </span>
            <span
              className="grid place-items-center bg-emerald-700 text-[9px] font-bold text-white"
              style={{ width: `${d}%` }}
            >
              {row.completed > 0 ? row.completed : ""}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

export default function StaffPerformancePanel({
  staff = [],
  journeyMix = [],
  journeyTotal = 0,
  rangeLabel,
  onOpenDirectory,
  onSelectStaff,
  onJourneyClick,
  selectedStaffId,
  loading,
}) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState("cases");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = [...(staff || [])];
    if (q) {
      rows = rows.filter(
        (r) =>
          String(r.name || "")
            .toLowerCase()
            .includes(q) ||
          String(r.email || "")
            .toLowerCase()
            .includes(q),
      );
    }
    rows.sort((a, b) => {
      if (sortKey === "stuck") return b.stuckCases - a.stuckCases;
      if (sortKey === "response") return b.averageResponseMinutes - a.averageResponseMinutes;
      return b.totalCases - a.totalCases;
    });
    return rows;
  }, [query, sortKey, staff]);

  const maxCases = Math.max(...filtered.map((r) => r.totalCases), 1);

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-black text-slate-950">Staff Performance & Analysis</h2>
          <p className="text-[11px] text-slate-500">
            {rangeLabel ? `${rangeLabel} · ` : ""}
            CCE workload · stuck cases · journey mix · click for filtered work
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenDirectory}
          className="inline-flex min-h-[36px] items-center gap-1 rounded-xl border border-emerald-200 bg-emerald-50 px-2.5 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          <Users size={13} aria-hidden />
          Directory
        </button>
      </div>

      <div className="grid min-w-0 gap-3 lg:grid-cols-[minmax(0,1.4fr)_minmax(200px,0.8fr)]">
        <div className="min-w-0 space-y-3">
          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <p className="text-[11px] font-bold text-slate-700">CCE workload</p>
              <div className="flex flex-wrap gap-2 text-[10px] font-semibold text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <i className="h-2 w-2 rounded-sm bg-emerald-200" /> Assigned
                </span>
                <span className="inline-flex items-center gap-1">
                  <i className="h-2 w-2 rounded-sm bg-emerald-400" /> In progress
                </span>
                <span className="inline-flex items-center gap-1">
                  <i className="h-2 w-2 rounded-sm bg-emerald-700" /> Done
                </span>
              </div>
            </div>
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-7 animate-pulse rounded-lg bg-slate-100" />
                ))}
              </div>
            ) : filtered.length ? (
              <div className="space-y-2" aria-label="CCE stacked workload bars">
                {filtered.map((row) => (
                  <WorkloadBar
                    key={row.id}
                    row={row}
                    maxCases={maxCases}
                    onSelect={onSelectStaff}
                    selected={String(selectedStaffId) === String(row.id)}
                  />
                ))}
              </div>
            ) : (
              <p className="py-6 text-center text-xs text-slate-400">No CCE staff in this period</p>
            )}
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-100">
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 bg-slate-50/80 px-3 py-2">
              <div className="relative min-w-[160px] flex-1">
                <Search className="pointer-events-none absolute left-2 top-2 text-slate-400" size={13} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search staff"
                  className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-7 pr-2 text-[11px] font-semibold outline-none focus:border-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-500"
                />
              </div>
              <label className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500">
                <ArrowDownUp size={12} aria-hidden />
                <select
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[11px] font-semibold outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                >
                  <option value="cases">Cases</option>
                  <option value="response">Avg response</option>
                  <option value="stuck">Stuck</option>
                </select>
              </label>
            </div>

            <div className="max-h-[240px] overflow-y-auto overflow-x-hidden [scrollbar-width:thin]">
              <table className="w-full table-fixed text-[11px]">
                <colgroup>
                  <col className="w-[38%]" />
                  <col className="w-[14%]" />
                  <col className="w-[18%]" />
                  <col className="w-[14%]" />
                  <col className="w-[16%]" />
                </colgroup>
                <thead className="sticky top-0 z-[1] bg-white text-[9px] font-bold uppercase tracking-wide text-slate-400">
                  <tr>
                    <th className="px-2.5 py-2 text-left">Staff</th>
                    <th className="px-1.5 py-2 text-right whitespace-nowrap">Cases</th>
                    <th className="px-1.5 py-2 text-right whitespace-nowrap" title="Average response">
                      Avg resp.
                    </th>
                    <th className="px-1.5 py-2 text-right whitespace-nowrap">Stuck</th>
                    <th className="px-2 py-2 text-right whitespace-nowrap">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length ? (
                    filtered.map((row) => {
                      const initials = String(row.name || "C")
                        .split(/\s+/)
                        .slice(0, 2)
                        .map((p) => p[0])
                        .join("")
                        .toUpperCase();
                      const selected = String(selectedStaffId) === String(row.id);
                      return (
                        <tr
                          key={row.id}
                          className={`cursor-pointer border-t border-slate-50 transition ${
                            selected ? "bg-emerald-50" : "hover:bg-emerald-50/40"
                          }`}
                          onClick={() => onSelectStaff?.(row)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              onSelectStaff?.(row);
                            }
                          }}
                          tabIndex={0}
                          role="button"
                          aria-label={`Open work for ${row.name}`}
                        >
                          <td className="px-2.5 py-2 align-middle">
                            <div className="flex min-w-0 items-center gap-1.5">
                              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-emerald-100 text-[10px] font-black text-emerald-800">
                                {initials}
                              </span>
                              <div className="min-w-0">
                                <p className="truncate font-bold text-slate-900" title={row.name}>
                                  {row.name}
                                </p>
                                <p className="truncate text-[9px] text-slate-400">
                                  {row.isOnline ? "Online" : "Offline"} · {fmt(row.openTickets)} tickets
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-1.5 py-2 text-right align-middle font-black tabular-nums text-slate-900">
                            {fmt(row.totalCases)}
                          </td>
                          <td className="px-1.5 py-2 text-right align-middle font-semibold tabular-nums text-slate-600 whitespace-nowrap">
                            {fmt(row.averageResponseMinutes)}m
                          </td>
                          <td className="px-1.5 py-2 text-right align-middle font-black tabular-nums text-orange-600">
                            {fmt(row.stuckCases)}
                          </td>
                          <td className="px-2 py-2 align-middle">
                            <div className="flex justify-end">
                              <MetricSparkline points={row.trend} compact />
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-3 py-8 text-center text-slate-400">
                        No staff match this search
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <JourneyMixChart
          items={journeyMix}
          total={journeyTotal}
          rangeLabel={rangeLabel}
          onItemClick={onJourneyClick}
        />
      </div>
    </section>
  );
}
