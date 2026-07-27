import { Inbox } from "lucide-react";
import { QUEUE_TABS } from "../customerCareDashboardData";

export default function CustomerCareQueuePanel({
  items,
  activeTab,
  onTabChange,
  selectedId,
  onSelect,
}) {
  return (
    <section className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-sm">
      <header className="shrink-0 space-y-2.5 border-b border-slate-100 bg-slate-50/80 px-3 py-3 sm:px-3.5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-slate-900">My Ticket Queue</h2>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold tabular-nums text-slate-500">
            {items.length}
          </span>
        </div>
        <p className="text-[10px] text-slate-400">
          Tickets auto-assigned to you (round-robin) · Lead can re-assign anytime
        </p>
        <div className="flex flex-wrap gap-1.5">
          {QUEUE_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => onTabChange(tab.key)}
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${
                activeTab === tab.key
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:ring-emerald-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto p-2.5 sm:p-3 [scrollbar-color:#86efac_transparent] [scrollbar-width:thin]">
        {items.length ? (
          <ul className="space-y-2">
            {items.map((item) => {
              const active = selectedId === item.id;
              const isUrgent = item.priorityKey === "urgent" || item.priorityKey === "high";
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(item.id)}
                    className={`flex w-full min-w-0 flex-col gap-1.5 rounded-xl border px-3 py-2.5 text-left transition ${
                      active
                        ? "border-emerald-400 bg-emerald-50 ring-1 ring-emerald-200"
                        : "border-slate-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/40"
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                          isUrgent ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {item.priority || "Medium"}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[10px] font-semibold text-slate-400">
                        {item.ticketId || ""}
                      </span>
                      <span className="shrink-0 text-[10px] text-slate-400">
                        {item.updatedLabel}
                      </span>
                    </div>

                    <p className="line-clamp-2 break-words text-[12px] font-bold leading-snug text-slate-900">
                      {item.title || "Untitled ticket"}
                    </p>

                    <div className="flex min-w-0 items-center justify-between gap-2">
                      <p className="min-w-0 truncate text-[11px] text-slate-500">
                        {item.customerName || "Customer"}
                      </p>
                      <span
                        className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                          item.statusTone || "border-slate-200 bg-slate-50 text-slate-600"
                        }`}
                      >
                        {item.statusLabel || "Open"}
                      </span>
                    </div>
                    {item.autoAssigned || item.assignedToName ? (
                      <p className="truncate text-[10px] text-emerald-700">
                        {item.autoAssigned ? "Auto-assigned" : "Assigned"}
                        {item.assignedAtLabel ? ` · ${item.assignedAtLabel}` : ""}
                      </p>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="flex h-full min-h-[180px] flex-col items-center justify-center gap-1 px-3 py-8 text-center text-xs text-slate-400">
            <Inbox className="h-8 w-8 text-slate-300" />
            <p className="font-medium text-slate-500">No tickets in this view</p>
            <p className="text-[11px]">Try another filter tab</p>
          </div>
        )}
      </div>
    </section>
  );
}
