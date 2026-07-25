import { Inbox } from "lucide-react";
import { TL_QUEUE_TABS } from "../customerSupportTeamLeadDashboardData";

export default function TlQueuePanel({ items, activeTab, onTabChange, selectedId, onSelect }) {
  return (
    <section className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-sm">
      <header className="shrink-0 border-b border-slate-100 bg-slate-50/80 px-3 py-3 sm:px-3.5">
        <h2 className="text-sm font-bold text-slate-900">Team queue</h2>
        <p className="mt-1 text-[11px] leading-snug text-slate-500">
          Buyer tickets · assign & clear unassigned first
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {TL_QUEUE_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => onTabChange(tab.key)}
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${
                activeTab === tab.key
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-3 [scrollbar-width:thin] [scrollbar-color:#cbd5e1_transparent]">
        {items.length ? (
          <div className="space-y-2">
            {items.map((item) => {
              const active = selectedId === item.id;
              const hot =
                item.priorityKey === "urgent" || item.priorityKey === "high" || item.overdue;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelect(item.id)}
                  className={`w-full min-w-0 rounded-xl border p-3 text-left transition ${
                    active
                      ? "border-emerald-400 bg-emerald-50 ring-1 ring-emerald-200"
                      : hot
                        ? "border-rose-200 bg-rose-50/30 hover:border-rose-300"
                        : "border-slate-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/40"
                  }`}
                >
                  <div className="flex min-w-0 items-center justify-between gap-2">
                    <span
                      className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                        hot ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {item.priority}
                    </span>
                    <span className="truncate text-[11px] text-slate-400">{item.updatedLabel}</span>
                  </div>

                  <p className="mt-1.5 truncate text-[11px] font-bold text-slate-500">
                    {item.ticketId}
                  </p>
                  <p className="mt-0.5 line-clamp-2 break-words text-xs font-bold leading-snug text-slate-900">
                    {item.title}
                  </p>
                  <p className="mt-1 truncate text-[11px] text-slate-500">
                    {item.customerName}
                    <span className="text-slate-300"> · </span>
                    {item.assigneeName}
                  </p>
                  <span
                    className={`mt-2 inline-block max-w-full truncate rounded-full px-2 py-0.5 text-[10px] font-semibold ${item.statusTone}`}
                  >
                    {item.statusLabel}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex min-h-[180px] flex-col items-center justify-center gap-1 px-3 py-8 text-center text-xs text-slate-400">
            <Inbox className="h-8 w-8 text-slate-300" />
            <p className="font-medium text-slate-500">No tickets in this view</p>
            <p className="text-[11px]">Try another filter or refresh</p>
          </div>
        )}
      </div>
    </section>
  );
}
