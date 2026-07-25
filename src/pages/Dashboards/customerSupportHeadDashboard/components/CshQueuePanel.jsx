import { Inbox } from "lucide-react";
import { CSH_QUEUE_TABS } from "../customerSupportHeadDashboardData";

export default function CshQueuePanel({ items, activeTab, onTabChange, selectedId, onSelect }) {
  return (
    <section className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-sm">
      <header className="shrink-0 border-b border-slate-100 bg-slate-50/80 px-3.5 py-3">
        <h2 className="text-sm font-bold text-slate-900">Department Queue</h2>
        <p className="mt-0.5 text-[11px] text-slate-500">Customer-care tickets · prioritized for leadership</p>
        <div className="mt-2.5 flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {CSH_QUEUE_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => onTabChange(tab.key)}
              className={`shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                activeTab === tab.key
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto p-3 [scrollbar-color:#86efac_transparent] [scrollbar-width:thin]">
        {items.length ? (
          <div className="space-y-2">
            {items.map((item) => {
              const active = selectedId === item.id;
              const hot = item.priorityKey === "urgent" || item.priorityKey === "high" || item.overdue;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelect(item.id)}
                  className={`w-full rounded-xl border p-3.5 text-left transition ${
                    active
                      ? "border-emerald-400 bg-emerald-50 ring-1 ring-emerald-200"
                      : "border-slate-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/40"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                        hot ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {item.priority}
                    </span>
                    <span className="text-[11px] text-slate-400">{item.updatedLabel}</span>
                  </div>
                  <p className="mt-2 line-clamp-2 break-all text-xs font-bold leading-snug text-slate-900">
                    {item.title}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    {item.customerName} · {item.assigneeName}
                  </p>
                  <span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${item.statusTone}`}>
                    {item.statusLabel}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-1 px-3 py-8 text-center text-xs text-slate-400">
            <Inbox className="h-8 w-8 text-slate-300" />
            <p className="font-medium text-slate-500">No tickets in this view</p>
            <p className="text-[11px]">Try another filter or refresh</p>
          </div>
        )}
      </div>
    </section>
  );
}
