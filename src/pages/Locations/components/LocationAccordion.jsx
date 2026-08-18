// locations/components/LocationAccordion.jsx
import { useMemo, useState, useEffect } from "react";
import {
  ChevronDown,
  MapPin,
  Pencil,
  Plus,
  Trash2,
  MapPinned,
  Search,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getListingCounts } from "../utils/locationHelpers";

function normalize(value = "") {
  return String(value).trim().toLowerCase();
}

const springSoft = { type: "spring", stiffness: 380, damping: 28 };
const springPin = { type: "spring", stiffness: 520, damping: 18 };

/** Separate project / property / combined chips */
function ListingCountLine({ counts, className = "" }) {
  const projects = Number(counts?.projects) || 0;
  const properties = Number(counts?.properties) || 0;
  const total = Number(counts?.total) || projects + properties;
  if (!projects && !properties) {
    return (
      <span className={`text-[10px] font-medium text-gray-400 ${className}`}>
        0 proj · 0 prop
      </span>
    );
  }
  return (
    <span className={`inline-flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[10px] font-semibold ${className}`}>
      <span className="text-sky-700">{projects} proj</span>
      <span className="text-gray-300">·</span>
      <span className="text-violet-700">{properties} prop</span>
      <span className="text-gray-300">·</span>
      <span className="text-emerald-700">{total} all</span>
    </span>
  );
}

function CompactSearch({
  value,
  onChange,
  placeholder,
  className = "",
}) {
  return (
    <div className={`relative ${className}`}>
      <Search
        size={13}
        className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-200 bg-white py-1.5 pl-8 pr-7 text-xs text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-[#27AE60] focus:ring-2 focus:ring-[#27AE60]/15"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-gray-400 hover:bg-gray-100"
          aria-label="Clear search"
        >
          <X size={12} />
        </button>
      ) : null}
    </div>
  );
}

function CityLocalitiesPanel({
  city,
  listingCounts,
  onEditLocality,
  onDeleteLocality,
  onAddLocality,
}) {
  const [query, setQuery] = useState("");
  const localities = Array.isArray(city.localities) ? city.localities : [];

  useEffect(() => {
    setQuery("");
  }, [city._id]);

  const filtered = useMemo(() => {
    const q = normalize(query);
    if (!q) return localities;
    return localities.filter((loc) => normalize(loc.name).includes(q));
  }, [localities, query]);

  return (
    <div className="flex flex-col border-t border-dashed border-green-100 bg-[radial-gradient(ellipse_at_top,_#ecfdf5_0%,_#ffffff_55%)]">
      {/* Sticky toolbar — stays outside the scroll region so cards aren't clipped under it */}
      <div className="sticky top-0 z-10 flex shrink-0 items-center justify-between gap-2 border-b border-green-50/80 bg-white/95 px-2.5 py-2 backdrop-blur-sm">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
          {filtered.length === localities.length
            ? `${localities.length} localities`
            : `${filtered.length}/${localities.length}`}
        </p>
        <CompactSearch
          value={query}
          onChange={setQuery}
          placeholder="Search locality…"
          className="max-w-[160px] flex-1 sm:max-w-[180px]"
        />
      </div>

      {localities.length === 0 ? (
        <div className="mx-2.5 my-2 rounded-lg border border-dashed border-gray-200 bg-white/80 py-4 text-center">
          <div className="mx-auto mb-1 inline-flex">
            <MapPin size={20} className="text-gray-300" />
          </div>
          <p className="text-[11px] text-gray-400">No localities yet</p>
          <button
            type="button"
            onClick={() => onAddLocality(city)}
            className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#27AE60] px-2.5 py-1 text-[11px] font-bold text-white"
          >
            <Plus size={12} />
            Add
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <p className="mx-2.5 my-2 rounded-lg border border-dashed border-gray-200 py-3 text-center text-[11px] text-gray-400">
          No match for “{query}”
        </p>
      ) : (
        <div
          className="min-h-0 max-h-[min(48vh,360px)] overflow-y-auto overscroll-contain px-2.5 py-2 [-webkit-overflow-scrolling:touch]"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#86efac transparent",
          }}
        >
          {/* No Framer layout/popLayout here — those clip cards while scrolling */}
          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {filtered.map((loc, idx) => {
              const locCounts = getListingCounts(
                listingCounts,
                city.state,
                city.city,
                loc.name,
              );
              return (
                <div
                  key={`${loc.name}-${idx}`}
                  className="group flex min-h-[44px] items-center justify-between gap-1.5 rounded-lg border border-gray-100 bg-white px-2 py-1.5 shadow-sm hover:border-green-200 hover:bg-green-50/60"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-1.5">
                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md bg-green-100 text-green-700">
                      <MapPin size={11} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-medium text-gray-800">
                        {loc.name}
                      </span>
                      <ListingCountLine counts={locCounts} />
                    </div>
                  </div>
                  <div className="flex flex-shrink-0 gap-0.5">
                    <button
                      type="button"
                      onClick={() => onEditLocality(city, loc)}
                      className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-50 text-blue-600 active:bg-blue-100"
                      aria-label={`Edit ${loc.name}`}
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteLocality(city, loc)}
                      className="flex h-7 w-7 items-center justify-center rounded-md bg-red-50 text-red-600 active:bg-red-100"
                      aria-label={`Delete ${loc.name}`}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function CityRow({
  city,
  isOpen,
  index,
  listingCounts,
  onToggle,
  onEditCity,
  onDeleteCity,
  onAddLocality,
  onEditLocality,
  onDeleteLocality,
}) {
  const localityCount = city.localities?.length || 0;
  const cityCounts = getListingCounts(listingCounts, city.state, city.city);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.97 }}
      transition={{ ...springSoft, delay: Math.min(index * 0.04, 0.28) }}
      className={`overflow-hidden rounded-xl border transition-colors ${
        isOpen
          ? "border-[#27AE60]/45 bg-white shadow-sm shadow-green-100/60"
          : "border-gray-100 bg-white"
      }`}
    >
      <div className="flex items-stretch gap-0">
        <button
          type="button"
          onClick={onToggle}
          className="flex min-w-0 flex-1 items-center gap-2 px-2.5 py-2 text-left active:bg-green-50/50"
        >
          <div className="relative flex-shrink-0">
            <motion.div
              animate={
                isOpen
                  ? { scale: 1, backgroundColor: "#27AE60", color: "#fff" }
                  : { scale: 1, backgroundColor: "#dcfce7", color: "#15803d" }
              }
              transition={springPin}
              className="flex h-8 w-8 items-center justify-center rounded-lg"
            >
              <motion.span
                animate={isOpen ? { y: [0, -3, 0] } : { y: 0 }}
                transition={
                  isOpen
                    ? { repeat: 1, duration: 0.45, ease: "easeOut" }
                    : { duration: 0.2 }
                }
              >
                <MapPinned size={15} />
              </motion.span>
            </motion.div>
            {isOpen ? (
              <motion.span
                className="absolute inset-0 rounded-lg border border-[#27AE60]"
                initial={{ scale: 1, opacity: 0.55 }}
                animate={{ scale: 1.55, opacity: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              />
            ) : null}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1">
              <h3 className="truncate text-sm font-semibold text-gray-900">
                {city.city}
              </h3>
              <span
                className={`rounded-full px-1.5 py-px text-[9px] font-bold uppercase ${
                  city.isHome === true
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-red-50 text-red-500"
                }`}
              >
                {city.isHome === true ? "Home" : "Hidden"}
              </span>
            </div>
            <p className="text-[10px] font-medium text-gray-400">
              {localityCount} {localityCount === 1 ? "locality" : "localities"}
              {city.category ? ` · ${city.category}` : ""}
            </p>
            <ListingCountLine counts={cityCounts} className="mt-0.5" />
          </div>

          <motion.span
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={springSoft}
            className={`flex-shrink-0 ${isOpen ? "text-[#27AE60]" : "text-gray-300"}`}
          >
            <ChevronDown size={16} />
          </motion.span>
        </button>

        {/* Compact icon actions */}
        <div
          className="flex items-center gap-0.5 border-l border-gray-50 px-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => onEditCity(city)}
            className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-50 text-blue-600"
            title="Edit city"
          >
            <Pencil size={12} />
          </button>
          <button
            type="button"
            onClick={() => onAddLocality(city)}
            className="flex h-7 w-7 items-center justify-center rounded-md bg-green-50 text-green-700"
            title="Add locality"
          >
            <Plus size={12} />
          </button>
          <button
            type="button"
            onClick={() => onDeleteCity(city)}
            className="flex h-7 w-7 items-center justify-center rounded-md bg-red-50 text-red-600"
            title="Delete city"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="localities"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <CityLocalitiesPanel
              city={city}
              listingCounts={listingCounts}
              onEditLocality={onEditLocality}
              onDeleteLocality={onDeleteLocality}
              onAddLocality={onAddLocality}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function filterGroupedByGlobalQuery(data, query) {
  const q = normalize(query);
  if (!q) return data;

  const result = {};

  Object.entries(data).forEach(([state, cities]) => {
    const stateMatch = normalize(state).includes(q);

    const matchedCities = [];

    (cities || []).forEach((city) => {
      const cityMatch = normalize(city.city).includes(q);
      const localityHits = (city.localities || []).filter((loc) =>
        normalize(loc.name).includes(q),
      );

      if (stateMatch || cityMatch) {
        matchedCities.push(city);
        return;
      }

      if (localityHits.length > 0) {
        matchedCities.push({
          ...city,
          localities: localityHits,
          _searchFilteredLocalities: true,
        });
      }
    });

    if (matchedCities.length > 0) {
      result[state] = matchedCities;
    }
  });

  return result;
}

function StateBlock({
  state,
  cities,
  isOpen,
  openCityId,
  setOpenState,
  setOpenCityId,
  listingCounts,
  onEditCity,
  onDeleteCity,
  onAddLocality,
  onEditLocality,
  onDeleteLocality,
  index,
  globalQuery,
}) {
  const [cityQuery, setCityQuery] = useState("");
  const stateCounts = getListingCounts(listingCounts, state);

  useEffect(() => {
    if (!isOpen) setCityQuery("");
  }, [isOpen]);

  const filteredCities = useMemo(() => {
    const q = normalize(cityQuery);
    if (!q) return cities;
    return cities.filter((c) => {
      if (normalize(c.city).includes(q)) return true;
      return (c.localities || []).some((loc) =>
        normalize(loc.name).includes(q),
      );
    });
  }, [cities, cityQuery]);

  useEffect(() => {
    if (!isOpen || !normalize(cityQuery)) return;
    if (filteredCities.length === 1) {
      setOpenCityId(filteredCities[0]._id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cityQuery, isOpen]);

  const localityTotal = cities.reduce(
    (sum, c) => sum + (c.localities?.length || 0),
    0,
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ ...springSoft, delay: Math.min(index * 0.04, 0.28) }}
      className={`overflow-hidden rounded-xl border bg-white ${
        isOpen
          ? "col-span-1 border-[#27AE60]/35 shadow-md shadow-green-50/80 sm:col-span-2 lg:col-span-3"
          : "border-gray-100 hover:border-green-200 hover:shadow-sm"
      }`}
    >
      <button
        type="button"
        onClick={() => setOpenState(isOpen ? null : state)}
        className="group flex w-full items-center gap-2.5 px-3 py-2.5 text-left active:bg-green-50/40"
      >
        <div className="relative flex-shrink-0">
          <motion.div
            animate={
              isOpen
                ? { scale: [1, 1.08, 1], backgroundColor: "#27AE60" }
                : { scale: 1, backgroundColor: "#dcfce7" }
            }
            transition={springPin}
            className={`flex h-8 w-8 items-center justify-center rounded-lg ${
              isOpen ? "text-white" : "text-green-700"
            }`}
          >
            <MapPin size={15} />
          </motion.div>
          {isOpen ? (
            <motion.span
              className="pointer-events-none absolute -inset-1 rounded-xl border border-green-400/50"
              animate={{ scale: [1, 1.25], opacity: [0.5, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
            />
          ) : null}
        </div>

        <div className="min-w-0 flex-1">
          <span className="block truncate text-sm font-bold text-gray-900">
            {state}
          </span>
          <span className="text-[10px] font-semibold text-green-700">
            {cities.length} {cities.length === 1 ? "city" : "cities"}
            {" · "}
            {localityTotal} loc
          </span>
          <div className="mt-0.5">
            <ListingCountLine counts={stateCounts} />
          </div>
          {globalQuery ? (
            <span className="ml-1 text-[10px] font-medium text-amber-600">
              · match
            </span>
          ) : null}
        </div>

        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={springSoft}
          className={isOpen ? "text-[#27AE60]" : "text-gray-300"}
        >
          <ChevronDown size={18} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="cities"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-gray-50 bg-gradient-to-b from-gray-50/90 to-green-50/20 px-2 pb-2.5 pt-2">
              <div className="mb-2 flex items-center gap-2">
                <CompactSearch
                  value={cityQuery}
                  onChange={setCityQuery}
                  placeholder="Search city or locality…"
                  className="flex-1"
                />
                <span className="whitespace-nowrap text-[10px] font-semibold text-gray-400">
                  {filteredCities.length}/{cities.length}
                </span>
              </div>

              <div
                className="max-h-[min(62vh,560px)] space-y-1.5 overflow-y-auto overscroll-contain pr-0.5 [-webkit-overflow-scrolling:touch]"
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor: "#86efac transparent",
                }}
              >
                {filteredCities.length === 0 ? (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="rounded-lg border border-dashed border-gray-200 bg-white py-4 text-center text-[11px] text-gray-400"
                  >
                    No cities match “{cityQuery}”
                  </motion.p>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {filteredCities.map((city, i) => (
                      <CityRow
                        key={city._id}
                        city={city}
                        index={i}
                        listingCounts={listingCounts}
                        isOpen={openCityId === city._id}
                        onToggle={() =>
                          setOpenCityId(
                            openCityId === city._id ? null : city._id,
                          )
                        }
                        onEditCity={onEditCity}
                        onDeleteCity={onDeleteCity}
                        onAddLocality={onAddLocality}
                        onEditLocality={onEditLocality}
                        onDeleteLocality={onDeleteLocality}
                      />
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function LocationAccordion({
  data,
  listingCounts,
  openState,
  setOpenState,
  openCityId,
  setOpenCityId,
  onEditCity,
  onDeleteCity,
  onAddLocality,
  onEditLocality,
  onDeleteLocality,
}) {
  const [globalQuery, setGlobalQuery] = useState("");

  const filteredData = useMemo(
    () => filterGroupedByGlobalQuery(data, globalQuery),
    [data, globalQuery],
  );

  const entries = Object.entries(filteredData);
  const totalStates = Object.keys(data || {}).length;

  // Auto-expand single state match from global search
  useEffect(() => {
    if (!normalize(globalQuery)) return;
    if (entries.length === 1) {
      const [onlyState, cities] = entries[0];
      setOpenState(onlyState);
      if (cities.length === 1) setOpenCityId(cities[0]._id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalQuery]);

  return (
    <div className="space-y-2.5">
      {/* Global state / city / locality search */}
      <div className="rounded-xl border border-gray-100 bg-white p-2.5 shadow-sm sm:p-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#27AE60]"
            />
            <input
              type="search"
              value={globalQuery}
              onChange={(e) => setGlobalQuery(e.target.value)}
              placeholder="Search state, city or locality…"
              className="w-full rounded-xl border border-gray-200 bg-gray-50/80 py-2.5 pl-9 pr-9 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-[#27AE60] focus:bg-white focus:ring-2 focus:ring-[#27AE60]/15"
            />
            {globalQuery ? (
              <button
                type="button"
                onClick={() => setGlobalQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1 text-gray-400 hover:bg-gray-100"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            ) : null}
          </div>
          <p className="shrink-0 text-[11px] font-semibold text-gray-400 sm:text-right">
            {normalize(globalQuery)
              ? `${entries.length} state${entries.length === 1 ? "" : "s"} found`
              : `${totalStates} states`}
          </p>
        </div>
      </div>

      {entries.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl border border-dashed border-gray-200 bg-white py-10 text-center text-sm text-gray-400"
        >
          No state, city or locality matches “{globalQuery}”
        </motion.div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence mode="popLayout">
            {entries.map(([state, cities], index) => (
              <StateBlock
                key={state}
                state={state}
                cities={cities}
                index={index}
                listingCounts={listingCounts}
                isOpen={openState === state}
                openCityId={openCityId}
                setOpenState={setOpenState}
                setOpenCityId={setOpenCityId}
                onEditCity={onEditCity}
                onDeleteCity={onDeleteCity}
                onAddLocality={onAddLocality}
                onEditLocality={onEditLocality}
                onDeleteLocality={onDeleteLocality}
                globalQuery={globalQuery}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
