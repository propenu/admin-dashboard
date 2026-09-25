import { BarChart3, Bell, Inbox, Plus, RefreshCw, Settings2 } from "lucide-react";
import { formatLabel } from "../../utils/ticketFormatters";
import { ghostButton, primaryButton, ticketSurface } from "../ticketUi";

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
    <header className={`mb-1 flex flex-col gap-3 p-3 lg:flex-row lg:items-center lg:justify-between ${ticketSurface}`}>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-[20px] font-black tracking-tight text-[#0f3d2e] sm:text-[22px]">{title}</h1>
          {roleName && (
            <span className="rounded-full border border-[#b7e4c7] bg-[#f7fbf8] px-3 py-1 text-[12px] font-bold capitalize text-[#27AE60]">
              {formatLabel(roleName)}
            </span>
          )}
        </div>
        <p className="mt-0.5 max-w-xl text-[11px] font-medium leading-4 text-[#5c7d6d] sm:block">
          {subtitle}
        </p>
      </div>

      <div className="flex w-full min-w-0 flex-nowrap items-center gap-2 overflow-x-auto pb-0.5 lg:w-auto lg:justify-end">
        <div className="flex shrink-0 rounded-full border border-[#b7e4c7] bg-[#f7fbf8] p-1">
          {availableTabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => onTabChange(tab.key)}
                className={`inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[12px] font-bold transition ${
                  active
                    ? "bg-[#27AE60] text-white shadow-[0_6px_14px_-6px_rgba(39,174,96,0.7)]"
                    : "text-[#5c7d6d] hover:bg-white hover:text-[#0f3d2e]"
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
