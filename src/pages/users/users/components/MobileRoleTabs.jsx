import { AnimatePresence, motion } from "framer-motion";
import {
  Briefcase,
  Building2,
  Home,
  Users,
  UsersRound,
} from "lucide-react";

const TABS = [
  { value: "all", label: "All", icon: Users },
  { value: "user", label: "Owners", icon: Home },
  { value: "builder", label: "Builder", icon: Building2 },
  { value: "builder_staff", label: "Staff", icon: UsersRound },
  { value: "agent", label: "Agent", icon: Briefcase },
];

export function MobileRoleTabs({ value = "all", onChange, counts = {} }) {
  const activeValue = value || "all";

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[#d9ebe0] bg-white/95 px-1.5 pb-[max(0.4rem,env(safe-area-inset-bottom))] pt-1 shadow-[0_-10px_30px_rgba(16,32,51,0.1)] backdrop-blur-md md:hidden"
      aria-label="User role tabs"
    >
      <div className="relative mx-auto grid max-w-lg grid-cols-5 gap-0.5">
        {TABS.map((tab) => {
          const active = activeValue === tab.value;
          const Icon = tab.icon;
          const count = counts[tab.value];
          return (
            <motion.button
              key={tab.value}
              type="button"
              onClick={() => onChange?.(tab.value)}
              whileTap={{ scale: 0.9 }}
              className="relative flex flex-col items-center gap-0.5 rounded-2xl px-0.5 py-1.5 text-center"
              aria-current={active ? "page" : undefined}
            >
              <AnimatePresence>
                {active ? (
                  <motion.span
                    layoutId="users-role-tab-pill"
                    className="absolute inset-0 rounded-2xl bg-[#12A150]/12"
                    transition={{ type: "spring", stiffness: 420, damping: 28 }}
                  />
                ) : null}
              </AnimatePresence>

              <motion.span
                animate={{
                  y: active ? -2 : 0,
                  scale: active ? 1.08 : 1,
                }}
                transition={{ type: "spring", stiffness: 450, damping: 22 }}
                className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full ${
                  active
                    ? "bg-[#12A150] text-white shadow-lg shadow-[#12A150]/35"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                <motion.span
                  animate={{ rotate: active ? [0, -8, 8, 0] : 0 }}
                  transition={{ duration: 0.35 }}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden />
                </motion.span>
              </motion.span>

              <motion.span
                animate={{
                  color: active ? "#12A150" : "#94a3b8",
                  scale: active ? 1.04 : 1,
                }}
                className="relative z-10 text-[9px] font-bold leading-none tracking-wide"
              >
                {tab.label}
              </motion.span>

              {typeof count === "number" ? (
                <motion.span
                  key={`${tab.value}-${count}`}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`relative z-10 mt-0.5 rounded-full px-1 text-[8px] font-bold tabular-nums ${
                    active
                      ? "bg-[#12A150]/20 text-[#0f8f46]"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {count}
                </motion.span>
              ) : null}

              {active ? (
                <motion.span
                  layoutId="users-role-tab-dot"
                  className="absolute -top-0.5 h-1 w-4 rounded-full bg-[#12A150]"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              ) : null}
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
