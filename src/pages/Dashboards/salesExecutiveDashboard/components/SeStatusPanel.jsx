import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function SeStatusPanel({
  summary,
  listingChart = [],
  todayInteractions = [],
  onNavigate,
  rangeLabel,
}) {
  const hasActivity = todayInteractions.length > 0;

  return (
    <section className="flex h-full min-h-0 flex-col gap-3 overflow-hidden">
      <div className="shrink-0 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Period snapshot
        </p>
        <p className="mt-1 text-xs text-slate-500">{rangeLabel || "Selected range"}</p>
        <div className="mt-3 grid grid-cols-2 gap-2 text-center">
          <div className="rounded-xl bg-slate-50 px-2 py-2.5">
            <p className="text-lg font-black leading-none text-slate-900">
              {summary?.totalListings ?? 0}
            </p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Listings
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 px-2 py-2.5">
            <p className="text-lg font-black leading-none text-slate-900">
              {summary?.totalViews ?? 0}
            </p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Views
            </p>
          </div>
          <div className="rounded-xl bg-emerald-50 px-2 py-2.5">
            <p className="text-lg font-black leading-none text-emerald-800">
              {summary?.activeShare ?? "0.0"}%
            </p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
              Live share
            </p>
          </div>
          <div className="rounded-xl bg-amber-50 px-2 py-2.5">
            <p className="text-lg font-black leading-none text-amber-800">
              {summary?.openTickets ?? 0}
            </p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
              Blockers
            </p>
          </div>
        </div>
      </div>

      <div className="shrink-0 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Listing status
        </p>
        <div className="h-36 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={listingChart} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10 }} width={28} />
              <Tooltip />
              <Bar dataKey="value" fill="#27AE60" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="flex min-h-[220px] flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="shrink-0 border-b border-slate-100 px-3 py-2.5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Recent activity
          </p>
        </div>

        <div
          className={`min-h-0 flex-1 px-3 py-3 ${
            hasActivity ? "space-y-2 overflow-y-auto" : "flex items-center justify-center overflow-hidden"
          }`}
        >
          {!hasActivity ? (
            <div className="w-full rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center">
              <p className="text-xs font-semibold leading-5 text-slate-500">
                No recent workflow activity in this period.
              </p>
            </div>
          ) : (
            todayInteractions.map((row) => (
              <div
                key={row.id}
                className="rounded-xl border border-slate-100 bg-slate-50 px-2.5 py-2"
              >
                <p className="line-clamp-1 text-xs font-bold text-slate-800">{row.title}</p>
                <p className="mt-0.5 text-[10px] text-slate-500">{row.summary}</p>
              </div>
            ))
          )}
        </div>

        <div className="shrink-0 border-t border-slate-100 p-3">
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Properties", path: "/properties" },
              { label: "Leads", path: "/leads" },
              { label: "Tickets", path: "/tickets" },
              { label: "Projects", path: "/projects" },
            ].map((link) => (
              <button
                key={link.path}
                type="button"
                onClick={() => onNavigate?.(link.path)}
                className="flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-2 text-center text-[11px] font-bold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800"
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
