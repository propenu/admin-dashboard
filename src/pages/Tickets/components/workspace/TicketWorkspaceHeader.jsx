import { BarChart3, Bell, Inbox, Plus, RefreshCw, Settings2 } from "lucide-react";
import { formatLabel } from "../../utils/ticketFormatters";
import { ghostButton, primaryButton } from "../ticketUi";

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
  availableTabs = tabs,
  canCreate = true,
  title = "Ticket Desk",
  subtitle = "Support queue, SLA health, requester conversations, and team workflow.",
  notificationCount = 0,
  onOpenNotifications,
}) {
  return (
    <header className="sticky top-0 z-20 flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white/95 p-3 shadow-[0_18px_45px_rgba(15,23,42,0.06)] backdrop-blur lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-[20px] font-black tracking-tight text-slate-950 sm:text-[22px]">{title}</h1>
          {roleName && (
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[12px] font-bold capitalize text-[#219653]">
              {formatLabel(roleName)}
            </span>
          )}
        </div>
        <p className="mt-1 max-w-2xl text-[12px] font-medium leading-5 text-slate-500 sm:block">
          {subtitle}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1 shadow-inner">
          {availableTabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => onTabChange(tab.key)}
                className={`inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-[12px] font-bold transition ${
                  active ? "bg-white text-[#219653] shadow-sm" : "text-slate-500 hover:bg-white/70 hover:text-slate-900"
                }`}
              >
                {Icon && <Icon className="h-3.5 w-3.5" />}
                {tab.label}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onOpenNotifications}
          className={`${ghostButton} relative`}
          title="Ticket notifications"
        >
          <Bell className="h-3.5 w-3.5" />
          Tickets
          {notificationCount > 0 && (
            <span className="ml-0.5 rounded-full bg-[#27AE60] px-1.5 py-0.5 text-[10px] font-bold leading-none text-white shadow-[0_6px_14px_rgba(39,174,96,0.3)]">
              {notificationCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={onRefresh}
          className={ghostButton}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>

        {canCreate && (
          <button
            type="button"
            onClick={onCreate}
            className={primaryButton}
          >
            <Plus className="h-3.5 w-3.5" />
            New Ticket
          </button>
        )}
      </div>
    </header>
  );
}
