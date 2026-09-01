import { useEffect, useRef, useState } from "react";
import {
  LayoutDashboard,
  Inbox,
  Target,
  Users,
} from "lucide-react";

const TABS = [
  { id: "overview", label: "Home", icon: LayoutDashboard },
  { id: "queue", label: "Queue", icon: Inbox },
  { id: "focus", label: "Focus", icon: Target },
  { id: "directory", label: "Team", icon: Users },
];

/**
 * Mobile-only RN-style bottom tab bar with sliding active pill.
 * Hidden from lg+ (desktop keeps the full Command Overview layout).
 */
export default function CshMobileBottomNav({
  activeTab,
  onTabChange,
  badges = {},
}) {
  const trackRef = useRef(null);
  const btnRefs = useRef({});
  const [pill, setPill] = useState({ left: 0, width: 0, ready: false });

  useEffect(() => {
    const measure = () => {
      const btn = btnRefs.current[activeTab];
      const track = trackRef.current;
      if (!btn || !track) return;
      const trackBox = track.getBoundingClientRect();
      const btnBox = btn.getBoundingClientRect();
      setPill({
        left: btnBox.left - trackBox.left,
        width: btnBox.width,
        ready: true,
      });
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [activeTab]);

  return (
    <nav
      aria-label="Dashboard tabs"
      className="fixed inset-x-0 bottom-0 z-[60] lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="mx-auto max-w-lg px-3 pb-2 pt-1">
        <div
          ref={trackRef}
          className="relative flex items-stretch gap-0.5 rounded-[22px] border border-emerald-100/80 bg-white/95 p-1.5 shadow-[0_-4px_24px_rgba(15,23,42,0.12),0_8px_24px_rgba(39,174,96,0.12)] backdrop-blur-xl"
        >
          {/* Sliding active pill */}
          <span
            aria-hidden
            className="pointer-events-none absolute top-1.5 bottom-1.5 rounded-[16px] bg-emerald-600 shadow-md shadow-emerald-600/30 transition-all duration-300 ease-[cubic-bezier(0.34,1.3,0.64,1)]"
            style={{
              left: pill.left,
              width: pill.width,
              opacity: pill.ready ? 1 : 0,
              transform: pill.ready ? "scale(1)" : "scale(0.92)",
            }}
          />

          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            const badge = Number(badges[tab.id] || 0);
            return (
              <button
                key={tab.id}
                type="button"
                ref={(node) => {
                  btnRefs.current[tab.id] = node;
                }}
                onClick={() => onTabChange?.(tab.id)}
                className={`relative z-[1] flex min-h-[52px] flex-1 flex-col items-center justify-center gap-0.5 rounded-[16px] px-1 transition-colors duration-200 active:scale-[0.96] ${
                  active ? "text-white" : "text-slate-500"
                }`}
                aria-current={active ? "page" : undefined}
              >
                <span className="relative">
                  <Icon
                    size={active ? 20 : 18}
                    strokeWidth={active ? 2.4 : 2}
                    className={`transition-transform duration-300 ${
                      active ? "scale-110" : "scale-100"
                    }`}
                    aria-hidden
                  />
                  {badge > 0 ? (
                    <span
                      className={`absolute -right-2.5 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full px-0.5 text-[8px] font-black ${
                        active
                          ? "bg-white text-emerald-700"
                          : "bg-orange-500 text-white"
                      }`}
                    >
                      {badge > 99 ? "99+" : badge}
                    </span>
                  ) : null}
                </span>
                <span
                  className={`text-[10px] font-bold tracking-wide transition-all duration-300 ${
                    active ? "opacity-100" : "opacity-80"
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
