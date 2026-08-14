import { LayoutDashboard, Wallet, Activity, Grid2X2 } from "lucide-react";

const TABS = [
  { key: "overview", label: "Overview", hint: "Engagement & alerts", icon: LayoutDashboard },
  { key: "finance", label: "Finance", hint: "Payments & plans", icon: Wallet },
  { key: "ops", label: "Ops", hint: "Leads & tickets", icon: Activity },
  { key: "hub", label: "Hub", hint: "Quick links", icon: Grid2X2 },
];

export { TABS };

/**
 * Sticky bottom nav for mobile + tablet.
 * Hidden on large desktop (xl / 1280px+).
 */
export default function SaMobileSectionTabs({ active, onChange }) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 xl:hidden"
      style={{ paddingBottom: "max(0.35rem, env(safe-area-inset-bottom))" }}
      aria-label="Dashboard sections"
    >
      <div className="pointer-events-none absolute inset-x-0 -top-6 h-6 bg-gradient-to-t from-emerald-900/10 to-transparent" />
      <div className="mx-auto max-w-3xl border-t border-emerald-200/80 bg-white/95 px-2 pt-1.5 shadow-[0_-8px_30px_rgba(16,185,129,0.18)] backdrop-blur-xl sm:px-3">
        <div
          role="tablist"
          className="grid grid-cols-4 gap-1 rounded-2xl bg-gradient-to-r from-emerald-50 via-white to-lime-50 p-1 ring-1 ring-emerald-100"
        >
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = active === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onChange?.(tab.key)}
                className={`relative flex min-h-[3.4rem] flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 text-[10px] font-bold transition duration-200 sm:min-h-[3.6rem] sm:text-[11px] ${
                  isActive
                    ? "bg-gradient-to-b from-emerald-500 to-emerald-700 text-white shadow-lg shadow-emerald-500/40 sa-tab-pop"
                    : "text-slate-500 active:scale-95 active:bg-emerald-50 active:text-emerald-700"
                }`}
              >
                {isActive ? (
                  <span className="absolute -top-0.5 h-1 w-6 rounded-full bg-lime-300 sa-tab-glow" />
                ) : null}
                <Icon
                  className={`h-4 w-4 sm:h-[18px] sm:w-[18px] ${isActive ? "sa-icon-bounce" : ""}`}
                  strokeWidth={2.35}
                />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
