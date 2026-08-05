import { Inbox } from "lucide-react";
import { TL_QUEUE_TABS } from "../customerSupportTeamLeadDashboardData";

export default function TlQueuePanel({ items, activeTab, onTabChange, selectedId, onSelect }) {
  return (
    <section className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      <header className="shrink-0 border-b border-slate-100 bg-slate-50/80 px-2.5 py-2.5 sm:px-3">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h2 className="text-[13px] font-black text-slate-900">Team queue</h2>
            <p className="text-[10px] text-slate-500">
              Buyer tickets · clear unassigned first · {items.length} shown
            </p>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {TL_QUEUE_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => onTabChange(tab.key)}
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold transition ${
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

      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-2 [scrollbar-width:thin] [scrollbar-color:#cbd5e1_transparent]">
        {items.length ? (
          <div className="space-y-1.5">
            {items.map((item) => {
              const active = selectedId === item.id;
              const hot =
                item.priorityKey === "urgent" ||
                item.priorityKey === "high" ||
                item.overdue;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelect(item.id)}
                  className={`w-full min-w-0 rounded-[11px] border px-2.5 py-2 text-left transition ${
                    active
                      ? "border-emerald-400 bg-emerald-50 ring-1 ring-emerald-200"
                      : hot
                        ? "border-rose-200 bg-rose-50/40 hover:border-rose-300"
                        : "border-slate-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/30"
                  }`}
                >
                  <div className="flex min-w-0 items-center justify-between gap-2">
                    <span
                      className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                        hot ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {item.priority}
                    </span>
                    <span className="truncate text-[10px] text-slate-400">
                      {item.updatedLabel}
                    </span>
                  </div>
                  <div className="mt-1 flex min-w-0 items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-[10px] font-bold text-slate-500">
                        {item.ticketId}
                      </p>
                      <p className="truncate text-[12px] font-bold leading-snug text-slate-900">
                        {item.title}
                      </p>
                      <p className="mt-0.5 truncate text-[10px] text-slate-500">
                        {item.customerName}
                        <span className="text-slate-300"> · </span>
                        {item.assigneeName}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold ${item.statusTone}`}
                    >
                      {item.statusLabel}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="grid h-full min-h-[180px] place-items-center px-4 text-center">
            <div>
              <Inbox className="mx-auto mb-2 text-slate-300" size={26} />
              <p className="text-xs font-bold text-slate-500">No tickets in this filter</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
