import {
  Building2,
  CreditCard,
  FolderKanban,
  IndianRupee,
  Ticket,
  Users,
  UserRoundSearch,
} from "lucide-react";
import { saSurface, saSurfaceHover } from "../dashboardSurface";

const ICONS = {
  revenue: IndianRupee,
  users: Users,
  listings: Building2,
  projects: FolderKanban,
  leads: UserRoundSearch,
  tickets: Ticket,
  subs: CreditCard,
};

const iconTone = "border-[#b7e4c7] bg-[#e8f8ee] text-[#128C45]";

function KpiCard({ kpi, active, onClick, size = "mobile" }) {
  const Icon = ICONS[kpi.key] || Users;
  const isMobile = size === "mobile";

  return (
    <button
      type="button"
      title={kpi.hint || kpi.label}
      onClick={onClick}
      className={`flex w-full items-center text-left transition active:scale-[0.98] ${
        isMobile
          ? "min-h-[2.85rem] gap-1.5 rounded-xl border px-2 py-1.5"
          : "min-h-[3.25rem] gap-2 rounded-xl border px-2.5 py-2"
      } ${
        active
          ? "border-[#27AE60] bg-[#27AE60] text-white shadow-[0_8px_18px_-6px_rgba(37,211,102,0.55)]"
          : `${saSurface} ${saSurfaceHover}`
      }`}
    >
      <div
        className={`flex shrink-0 items-center justify-center rounded-lg border ${
          isMobile ? "h-7 w-7" : "h-8 w-8"
        } ${
          active
            ? "border-white/25 bg-white/15 text-white"
            : iconTone
        }`}
      >
        <Icon className={isMobile ? "h-3.5 w-3.5" : "h-4 w-4"} strokeWidth={2.2} />
      </div>
      <div className="min-w-0 flex-1 leading-tight">
        <p
          className={`truncate font-medium ${
            isMobile ? "text-[9px]" : "text-[10px]"
          } ${active ? "text-white" : "text-[#5c7d6d]"}`}
        >
          {kpi.label}
        </p>
        <p
          className={`mt-0.5 truncate font-bold tabular-nums ${
            isMobile ? "text-[13px]" : "text-sm"
          } ${active ? "text-white" : "text-[#0f3d2e]"}`}
        >
          {kpi.value}
        </p>
      </div>
    </button>
  );
}

/**
 * @param {"desktop"|"compact"} layout
 * desktop → one row of 7 (large screens)
 * compact → 2 / 3 / 4 cols (phone + tablet)
 */
function KpiSkeleton({ size = "mobile" }) {
  return (
    <div
      className={`w-full animate-pulse rounded-xl border border-[#b7e4c7] bg-[#e8f8ee]/70 ${
        size === "mobile" ? "min-h-[2.85rem]" : "min-h-[3.25rem]"
      }`}
      aria-busy="true"
      aria-label="Loading metric"
    />
  );
}

export default function SaKpiStrip({
  kpis = [],
  onMetricClick,
  activeKey,
  layout = "compact",
  loadingMap = {},
}) {
  const isDesktop = layout === "desktop";
  const cards = kpis.length
    ? kpis
    : ["revenue", "users", "listings", "projects", "leads", "tickets", "subs"].map(
        (key) => ({ key, label: "", value: "", tone: "emerald" }),
      );

  const renderCard = (kpi, size) =>
    loadingMap[kpi.key] || !kpi.label ? (
      <KpiSkeleton key={kpi.key} size={size} />
    ) : (
      <KpiCard
        key={kpi.key}
        kpi={kpi}
        size={size}
        active={activeKey === kpi.key}
        onClick={() => onMetricClick?.(kpi)}
      />
    );

  if (isDesktop) {
    return (
      <div className="grid grid-cols-7 gap-2">
        {cards.map((kpi) => renderCard(kpi, "desktop"))}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-1.5 sm:hidden">
        {cards.map((kpi) => renderCard(kpi, "mobile"))}
      </div>

      <div className="hidden gap-2 sm:grid sm:grid-cols-3 md:grid-cols-4">
        {cards.map((kpi) => renderCard(kpi, "desktop"))}
      </div>
    </>
  );
}
