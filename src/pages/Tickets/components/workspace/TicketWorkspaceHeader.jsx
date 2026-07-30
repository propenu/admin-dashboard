import { BarChart3, Bell, Inbox, Plus, RefreshCw, Settings2 } from "lucide-react";
import { formatLabel } from "../../utils/ticketFormatters";
import { ghostButton, primaryButton } from "../ticketUi";

const tabs = [
  { key: "overview", label: "Overview", icon: BarChart3 },
  { key: "queue", label: "Queue", icon: Inbox },
  { key: "config", label: "Config", icon: Settings2 },
];

/** Sidebar already shows ticket badge — set true later if header count is needed again. */
const SHOW_HEADER_TICKET_COUNT = false;

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
    <header className="mb-1 flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-[0_12px_32px_rgba(15,23,42,0.08)] lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-[20px] font-black tracking-tight text-slate-950 sm:text-[22px]">{title}</h1>
          {roleName && (
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[12px] font-bold capitalize text-[#219653]">
              {formatLabel(roleName)}
            </span>
          )}
        </div>
        <p className="mt-0.5 max-w-xl text-[11px] font-medium leading-4 text-slate-400 sm:block">
          {subtitle}
        </p>
      </div>

      <div className="flex w-full min-w-0 flex-nowrap items-center gap-2 overflow-x-auto pb-0.5 lg:w-auto lg:justify-end">
        <div className="flex shrink-0 rounded-xl border border-slate-200 bg-slate-50 p-1 shadow-inner">
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
          className={`${ghostButton} relative h-9 shrink-0 px-3`}
          title="Ticket notifications"
        >
          <Bell className="h-3.5 w-3.5" />
          Tickets
          {SHOW_HEADER_TICKET_COUNT && notificationCount > 0 ? (
            <span className="ml-0.5 rounded-full bg-[#27AE60] px-1.5 py-0.5 text-[10px] font-bold leading-none text-white shadow-[0_6px_14px_rgba(39,174,96,0.3)]">
              {notificationCount}
            </span>
          ) : null}
        </button>

        <button
          type="button"
          onClick={onRefresh}
          className={`${ghostButton} h-9 shrink-0 px-3`}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>

        {canCreate && (
          <button
            type="button"
            onClick={onCreate}
            className={`${primaryButton} h-9 shrink-0 px-3`}
          >
            <Plus className="h-3.5 w-3.5" />
            New Ticket
          </button>
        )}
      </div>
    </header>
  );
}
