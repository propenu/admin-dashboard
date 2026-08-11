import { SE_QUEUE_TABS } from "../salesExecutiveDashboardData";

const kindBadge = {
  listing: "bg-emerald-50 text-emerald-700",
  ticket: "bg-amber-50 text-amber-700",
  lead: "bg-blue-50 text-blue-700",
};

export default function SeQueuePanel({
  items = [],
  activeTab,
  onTabChange,
  selectedId,
  onSelect,
}) {
  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-3 py-3">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Work queue
        </p>
        <p className="mt-0.5 text-sm font-bold text-slate-900">
          Find what needs action
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {SE_QUEUE_TABS.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => onTabChange?.(tab.key)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                  active
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-50 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
        {!items.length ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-8 text-center text-sm text-slate-500">
            No work items in this tab for the selected period.
          </div>
        ) : (
          items.map((item) => {
            const selected = selectedId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect?.(item.id)}
                className={`w-full rounded-xl border px-3 py-2.5 text-left transition ${
                  selected
                    ? "border-emerald-400 bg-emerald-50 ring-1 ring-emerald-200"
                    : "border-slate-200 bg-white hover:border-emerald-200 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="line-clamp-1 text-sm font-bold text-slate-900">
                    {item.title}
                  </p>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${
                      kindBadge[item.kind] || "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {item.kind}
                  </span>
                </div>
                <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                  {item.subtitle}
                </p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  {item.statusLabel}
                </p>
              </button>
            );
          })
        )}
      </div>
    </section>
  );
}
