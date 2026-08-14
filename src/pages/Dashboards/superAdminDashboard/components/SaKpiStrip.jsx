import {
  Building2,
  CreditCard,
  FolderKanban,
  IndianRupee,
  Ticket,
  Users,
  UserRoundSearch,
} from "lucide-react";

const ICONS = {
  revenue: IndianRupee,
  users: Users,
  listings: Building2,
  projects: FolderKanban,
  leads: UserRoundSearch,
  tickets: Ticket,
  subs: CreditCard,
};

const toneIcon = {
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
  blue: "bg-sky-50 text-sky-700 border-sky-100",
  amber: "bg-amber-50 text-amber-700 border-amber-100",
  rose: "bg-rose-50 text-rose-700 border-rose-100",
  violet: "bg-violet-50 text-violet-700 border-violet-100",
};

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
          ? "border-emerald-500 bg-emerald-600 text-white shadow-sm"
          : "border-slate-200 bg-white hover:border-emerald-300"
      }`}
    >
      <div
        className={`flex shrink-0 items-center justify-center rounded-lg border ${
          isMobile ? "h-7 w-7" : "h-8 w-8"
        } ${
          active
            ? "border-white/25 bg-white/15 text-white"
            : toneIcon[kpi.tone] || toneIcon.emerald
        }`}
      >
        <Icon className={isMobile ? "h-3.5 w-3.5" : "h-4 w-4"} strokeWidth={2.2} />
      </div>
      <div className="min-w-0 flex-1 leading-tight">
        <p
          className={`truncate font-medium ${
            isMobile ? "text-[9px]" : "text-[10px]"
          } ${active ? "text-emerald-50" : "text-slate-500"}`}
        >
          {kpi.label}
        </p>
        <p
          className={`mt-0.5 truncate font-bold tabular-nums ${
            isMobile ? "text-[13px]" : "text-sm"
          } ${active ? "text-white" : "text-slate-900"}`}
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
export default function SaKpiStrip({
  kpis = [],
  onMetricClick,
  activeKey,
  layout = "compact",
}) {
  const isDesktop = layout === "desktop";

  if (!kpis.length) {
    return (
      <div
        className={`grid gap-1.5 ${
          isDesktop
            ? "grid-cols-7 gap-2"
            : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
        }`}
      >
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="h-11 animate-pulse rounded-xl border border-slate-100 bg-slate-50 sm:h-12"
          />
        ))}
      </div>
    );
  }

  if (isDesktop) {
    return (
      <div className="grid grid-cols-7 gap-2">
        {kpis.map((kpi) => (
          <KpiCard
            key={kpi.key}
            kpi={kpi}
            size="desktop"
            active={activeKey === kpi.key}
            onClick={() => onMetricClick?.(kpi)}
          />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-1.5 sm:hidden">
        {kpis.map((kpi) => (
          <KpiCard
            key={kpi.key}
            kpi={kpi}
            size="mobile"
            active={activeKey === kpi.key}
            onClick={() => onMetricClick?.(kpi)}
          />
        ))}
      </div>

      <div className="hidden gap-2 sm:grid sm:grid-cols-3 md:grid-cols-4">
        {kpis.map((kpi) => (
          <KpiCard
            key={kpi.key}
            kpi={kpi}
            size="desktop"
            active={activeKey === kpi.key}
            onClick={() => onMetricClick?.(kpi)}
          />
        ))}
      </div>
    </>
  );
}
