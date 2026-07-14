import { BarChart3, Inbox, Plus, RefreshCw, Settings2 } from "lucide-react";

const tabs = [
  { key: "overview", label: "Overview", icon: BarChart3 },
  { key: "queue", label: "Queue", icon: Inbox },
  { key: "config", label: "Config", icon: Settings2 },
];

export default function TicketWorkspaceHeader({
  activeTab,
  onTabChange,
  onCreate,
  onRefresh,
  isRefreshing,
  roleName,
}) {
  return (
    <header className="flex flex-col gap-0.5 rounded-md bg-white p-1 shadow-sm lg:flex-row lg:items-center lg:justify-between">
      <div>
        <div className="flex  items-center gap-1.5">
          <h1 className="text-sm font-medium tracking-tight text-slate-950">Ticket Desk</h1>
          {roleName && (
            <span className="rounded-full border border-emerald-100 bg-emerald-50 px-1 py-0.5 text-[8px] font-medium capitalize text-emerald-700">
              {roleName.replace(/_/g, " ")}
            </span>
          )}
        </div>
        <p className="hidden text-[9px] text-slate-500 sm:block">
          Support queue, SLA health, requester conversations, and team workflow.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-1">
        <div className="flex rounded-md border border-slate-200 bg-slate-50 p-0.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => onTabChange(tab.key)}
                className={`inline-flex h-5 items-center gap-0.5 rounded px-1 text-[9px] font-medium transition ${
                  active ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <Icon className="h-2.5 w-2.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex h-6 items-center gap-0.5 rounded-md border border-slate-200 bg-white px-1.5 text-[10px] font-medium text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <RefreshCw className={`h-2.5 w-2.5 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>

        <button
          type="button"
          onClick={onCreate}
          className="inline-flex h-6 items-center gap-0.5 rounded-md bg-blue-600 px-1.5 text-[10px] font-medium text-white shadow-sm hover:bg-blue-700"
        >
          <Plus className="h-2.5 w-2.5" />
          New Ticket
        </button>
      </div>
    </header>
  );
}
