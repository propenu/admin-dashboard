// frontend/admin-dashboard/src/pages/Locations/components/LocationStats.jsx

import { MapPin, Star, Pencil, Flame, Building2, Landmark } from "lucide-react";
import { motion } from "framer-motion";

const summaryCards = [
  {
    key: "states",
    label: "States",
    icon: Landmark,
    tone: "from-emerald-50 to-green-100 text-green-700",
  },
  {
    key: "cities",
    label: "Cities",
    icon: Building2,
    tone: "from-sky-50 to-blue-100 text-blue-700",
  },
  {
    key: "localities",
    label: "Localities",
    icon: MapPin,
    tone: "from-amber-50 to-orange-100 text-amber-700",
  },
];

export default function LocationStats({
  stateCount = 0,
  cityCount = 0,
  localityCount = 0,
  popularCities = [],
  onEditPopularCity,
  onSelectPopularCity,
}) {
  const values = {
    states: stateCount,
    cities: cityCount,
    localities: localityCount,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 360, damping: 28 }}
      className="mb-2 space-y-3 sm:mb-3"
    >
      {/* Compact summary chips — size to content, no empty stretch */}
      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        {summaryCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-100 bg-white px-2 py-1.5 shadow-sm"
            >
              <div
                className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-gradient-to-br ${card.tone}`}
              >
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0 leading-tight">
                <p className="text-[9px] font-semibold uppercase tracking-wide text-gray-400">
                  {card.label}
                </p>
                <p className="text-sm font-bold text-gray-800">
                  {values[card.key]}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {popularCities.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1">
            <Flame className="h-3 w-3 text-orange-500" />
            <p className="text-[11px] font-bold text-gray-600">Popular Cities</p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {popularCities.map((c, idx) => (
              <motion.div
                key={`${c.state}-${c.city}-${idx}`}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.03 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-1.5 py-1 shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => onSelectPopularCity?.(c)}
                  className="inline-flex max-w-[140px] items-center gap-1 text-left"
                >
                  <Star className="h-2.5 w-2.5 flex-shrink-0 fill-[#27AE60] text-[#27AE60]" />
                  <span className="truncate text-[11px] font-semibold text-gray-800">
                    {c.city}
                  </span>
                </button>

                <span className="rounded-full bg-green-100 px-1.5 py-px text-[9px] font-bold text-green-700">
                  {c.count}
                </span>

                <button
                  type="button"
                  onClick={() => onEditPopularCity?.(c)}
                  className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded bg-blue-50 text-blue-600"
                  aria-label={`Edit ${c.city}`}
                  title={c.state}
                >
                  <Pencil size={10} />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
