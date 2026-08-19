import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarDays,
  ChevronDown,
  MapPin,
  Phone,
  ShieldCheck,
  User,
  Users,
} from "lucide-react";
import { StatCard } from "./ReusableComaponents";

const LABELS = {
  total: "Total Users",
  active: "Active",
  joinedToday: "Joined Today",
  kyc: "KYC Verified",
  phone: "Phone Verified",
  locPending: "Location Pending",
};

export const StatCards = ({ stats, onStatClick, activeKey }) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const cards = [
    {
      key: "total",
      label: "Total",
      fullLabel: LABELS.total,
      value: stats.total,
      emphasize: true,
      highlightValue: false,
      icon: Users,
    },
    {
      key: "active",
      label: "Active",
      fullLabel: LABELS.active,
      value: stats.active,
      emphasize: false,
      highlightValue: true,
      icon: User,
    },
    {
      key: "joinedToday",
      label: "Today",
      fullLabel: LABELS.joinedToday,
      value: stats.joinedToday ?? 0,
      emphasize: false,
      highlightValue: false,
      icon: CalendarDays,
    },
    {
      key: "kyc",
      label: "KYC",
      fullLabel: LABELS.kyc,
      value: stats.kycVerified,
      emphasize: false,
      highlightValue: false,
      icon: ShieldCheck,
    },
    {
      key: "phone",
      label: "Phone",
      fullLabel: LABELS.phone,
      value: stats.phoneVerified,
      emphasize: false,
      highlightValue: false,
      icon: Phone,
    },
    {
      key: "locPending",
      label: "Loc.",
      fullLabel: LABELS.locPending,
      value: stats.locPending,
      emphasize: false,
      highlightValue: false,
      icon: MapPin,
    },
  ];

  const selected =
    cards.find((c) => c.key === activeKey) || cards.find((c) => c.key === "total");
  const SelectedIcon = selected.icon;

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <>
      {/* Mobile: dropdown list (no horizontal scroll) */}
      <div ref={rootRef} className="relative mb-3 md:hidden">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex h-12 w-full items-center gap-3 rounded-2xl border border-[#dceee3] bg-gradient-to-r from-white to-[#f3faf6] px-3 shadow-sm transition focus:outline-none focus:ring-4 focus:ring-[#12A150]/15"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#12A150]/10 text-[#12A150]">
            <SelectedIcon className="h-4 w-4" aria-hidden />
          </span>
          <span className="min-w-0 flex-1 text-left">
            <span className="block text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
              Overview
            </span>
            <span className="block truncate text-sm font-bold text-[#102033]">
              {selected.fullLabel}
              <span className="ml-2 tabular-nums text-[#12A150]">
                {selected.value}
              </span>
            </span>
          </span>
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-slate-400"
          >
            <ChevronDown className="h-4 w-4" />
          </motion.span>
        </button>

        <AnimatePresence>
          {open ? (
            <motion.ul
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              className="absolute left-0 right-0 z-30 mt-2 overflow-hidden rounded-2xl border border-[#d9ebe0] bg-white p-1.5 shadow-xl shadow-[#12A150]/10"
            >
              {cards.map((card, index) => {
                const Icon = card.icon;
                const active = activeKey === card.key;
                return (
                  <motion.li
                    key={card.key}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(index * 0.03, 0.15) }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        onStatClick?.(card.key);
                        setOpen(false);
                      }}
                      className={`mb-0.5 flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition last:mb-0 ${
                        active
                          ? "bg-[#12A150]/12 text-[#0f8f46]"
                          : "hover:bg-[#f5fbf7] text-[#102033]"
                      }`}
                    >
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                          active
                            ? "bg-[#12A150] text-white"
                            : "bg-[#12A150]/10 text-[#12A150]"
                        }`}
                      >
                        <Icon className="h-4 w-4" aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold">
                          {card.fullLabel}
                        </span>
                      </span>
                      <span
                        className={`text-base font-bold tabular-nums ${
                          card.highlightValue || active
                            ? "text-[#12A150]"
                            : "text-[#102033]"
                        }`}
                      >
                        {card.value}
                      </span>
                    </button>
                  </motion.li>
                );
              })}
            </motion.ul>
          ) : null}
        </AnimatePresence>
      </div>

      {/* Desktop / tablet: card grid */}
      <div className="mb-3 hidden grid-cols-6 gap-2 md:grid">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <StatCard
              key={card.key}
              label={card.label}
              value={card.value}
              icon={<Icon className="h-4 w-4" aria-hidden />}
              highlightValue={card.highlightValue}
              emphasize={card.emphasize}
              active={activeKey === card.key}
              onClick={onStatClick ? () => onStatClick(card.key) : undefined}
            />
          );
        })}
      </div>
    </>
  );
};
