import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CheckSquare,
  MapPin,
  Search,
  Square,
  ChevronDown,
  ChevronRight,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  ADMIN_LOCATIONS_QUERY_KEY,
  buildHierarchyFromAdminLocations,
  fetchAdminLocationsList,
} from "../../../../../features/locations/adminLocationsQuery";
import {
  buildSponsoredAdFromSelection,
  summarizeSponsoredAd,
} from "./promotionCoverageUtils";

const norm = (v) =>
  String(v || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

function matchesQuery(label, query) {
  const q = norm(query);
  if (!q) return true;
  return norm(label).includes(q);
}

/**
 * Build hierarchy only from Locations admin saved docs:
 * { [state]: { [city]: string[] localities } }
 */
function buildHierarchyFromLocations(locations = []) {
  return buildHierarchyFromAdminLocations(locations);
}

function CheckboxRow({ checked, onChange, label }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition hover:bg-slate-50">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          onChange(!checked);
        }}
        className="shrink-0 text-[#27AE60]"
        aria-pressed={checked}
      >
        {checked ? (
          <CheckSquare size={16} />
        ) : (
          <Square size={16} className="text-slate-400" />
        )}
      </button>
      <span className="min-w-0 flex-1 truncate text-slate-700">{label}</span>
    </label>
  );
}

/**
 * Promotion location coverage — uses ONLY Locations page saved data
 * (same auth API as /locations). Refetches when modal opens / cache invalidated.
 */
export default function PromotionLocationCoverage({
  enabled = true,
  value,
  onChange,
  title = "Promotion locations",
  subtitle = "Live from Locations page. Expand ▶ to browse cities/localities even without ticking; tick to select for save.",
  accentClass = "border-emerald-200 bg-gradient-to-br from-emerald-50/80 via-white to-sky-50/60",
}) {
  const [stateQuery, setStateQuery] = useState("");
  const [cityQueryByState, setCityQueryByState] = useState({});
  const [locQueryByCity, setLocQueryByCity] = useState({});
  const [expandedStates, setExpandedStates] = useState({});
  const [expandedCities, setExpandedCities] = useState({});

  const [selectedStates, setSelectedStates] = useState([]);
  const [selectedCitiesByState, setSelectedCitiesByState] = useState({});
  const [selectedLocalitiesByCity, setSelectedLocalitiesByCity] = useState({});
  const hydratedKeyRef = useRef("");

  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const {
    data: locations = [],
    isLoading: loading,
    isFetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: ADMIN_LOCATIONS_QUERY_KEY,
    queryFn: fetchAdminLocationsList,
    enabled: Boolean(enabled),
    staleTime: 15_000,
    gcTime: 5 * 60_000,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    retry: 1,
  });

  const hierarchy = useMemo(
    () => buildHierarchyFromLocations(locations),
    [locations],
  );

  // Hydrate editor from saved coverage when value changes (edit load / after PATCH).
  useEffect(() => {
    if (!enabled) return;
    const map =
      value && typeof value === "object" && !Array.isArray(value) ? value : {};
    const key = JSON.stringify(map);
    if (hydratedKeyRef.current === key) return;
    hydratedKeyRef.current = key;

    const nextStates = Object.keys(map);
    const nextCities = {};
    const nextLocs = {};
    const nextExpandedStates = {};
    const nextExpandedCities = {};
    for (const st of nextStates) {
      const cities = map[st] && typeof map[st] === "object" ? map[st] : {};
      nextCities[st] = Object.keys(cities);
      nextLocs[st] = {};
      nextExpandedStates[st] = true;
      for (const city of nextCities[st]) {
        nextLocs[st][city] = Array.isArray(cities[city])
          ? [...cities[city]]
          : [];
        nextExpandedCities[`${st}||${city}`] = true;
      }
    }
    setSelectedStates(nextStates);
    setSelectedCitiesByState(nextCities);
    setSelectedLocalitiesByCity(nextLocs);
    setExpandedStates(nextExpandedStates);
    setExpandedCities(nextExpandedCities);
  }, [enabled, value]);

  const emitChange = useCallback((states, citiesByState, locsByCity) => {
    const next = buildSponsoredAdFromSelection(
      states,
      citiesByState,
      locsByCity,
    );
    // Keep hydrate key in sync so parent updates don't wipe in-progress edits.
    hydratedKeyRef.current = JSON.stringify(next);
    onChangeRef.current?.(next);
  }, []);

  useEffect(() => {
    if (enabled) return;
    setSelectedStates([]);
    setSelectedCitiesByState({});
    setSelectedLocalitiesByCity({});
    onChangeRef.current?.({});
  }, [enabled]);

  const loadError = isError
    ? "Could not load Locations page data. Open Locations and try again."
    : "";

  const safeStates = useMemo(
    () => Object.keys(hierarchy).sort((a, b) => a.localeCompare(b)),
    [hierarchy],
  );

  const toggleState = (stateName, checked) => {
    const st = String(stateName || "").trim();
    if (!st || !hierarchy[st]) return;

    if (!checked) {
      const nextStates = selectedStates.filter((s) => s !== st);
      const nextCities = { ...selectedCitiesByState };
      const nextLocs = { ...selectedLocalitiesByCity };
      delete nextCities[st];
      delete nextLocs[st];
      setSelectedStates(nextStates);
      setSelectedCitiesByState(nextCities);
      setSelectedLocalitiesByCity(nextLocs);
      setExpandedStates((p) => ({ ...p, [st]: false }));
      emitChange(nextStates, nextCities, nextLocs);
      return;
    }

    const byCity = hierarchy[st] || {};
    const allCities = Object.keys(byCity).sort((a, b) => a.localeCompare(b));
    const nextStates = selectedStates.includes(st)
      ? selectedStates
      : [...selectedStates, st];
    const nextCities = { ...selectedCitiesByState, [st]: allCities };
    const nextLocs = {
      ...selectedLocalitiesByCity,
      [st]: Object.fromEntries(
        allCities.map((c) => [c, [...(byCity[c] || [])]]),
      ),
    };
    setSelectedStates(nextStates);
    setSelectedCitiesByState(nextCities);
    setSelectedLocalitiesByCity(nextLocs);
    setExpandedStates((p) => ({ ...p, [st]: true }));
    emitChange(nextStates, nextCities, nextLocs);
  };

  const toggleCity = (stateName, cityName, checked) => {
    const st = stateName;
    const city = cityName;
    const current = selectedCitiesByState[st] || [];
    const nextLocsForState = { ...(selectedLocalitiesByCity[st] || {}) };
    let nextCitiesList;

    if (checked) {
      nextCitiesList = current.includes(city) ? current : [...current, city];
      nextLocsForState[city] = [...(hierarchy[st]?.[city] || [])];
      setExpandedCities((p) => ({ ...p, [`${st}||${city}`]: true }));
    } else {
      nextCitiesList = current.filter((c) => c !== city);
      delete nextLocsForState[city];
    }

    const nextCities = { ...selectedCitiesByState, [st]: nextCitiesList };
    const nextLocs = { ...selectedLocalitiesByCity, [st]: nextLocsForState };
    let nextStates = selectedStates;
    if (nextCitiesList.length) {
      // Selecting a city while browsing also selects the parent state
      if (!nextStates.includes(st)) nextStates = [...nextStates, st];
    } else {
      nextStates = selectedStates.filter((s) => s !== st);
      delete nextCities[st];
      delete nextLocs[st];
    }
    setSelectedStates(nextStates);
    setSelectedCitiesByState(nextCities);
    setSelectedLocalitiesByCity(nextLocs);
    emitChange(nextStates, nextCities, nextLocs);
  };

  const toggleLocality = (stateName, cityName, localityName, checked) => {
    const st = stateName;
    const city = cityName;
    const current = selectedLocalitiesByCity[st]?.[city] || [];
    const nextList = checked
      ? current.includes(localityName)
        ? current
        : [...current, localityName]
      : current.filter((l) => l !== localityName);

    let nextStates = selectedStates.includes(st)
      ? selectedStates
      : checked
        ? [...selectedStates, st]
        : selectedStates;
    let nextCitiesList = selectedCitiesByState[st] || [];
    if (checked && !nextCitiesList.includes(city)) {
      nextCitiesList = [...nextCitiesList, city];
    }

    const nextCities = { ...selectedCitiesByState, [st]: nextCitiesList };
    const nextLocs = {
      ...selectedLocalitiesByCity,
      [st]: {
        ...(selectedLocalitiesByCity[st] || {}),
        [city]: nextList,
      },
    };

    setSelectedStates(nextStates);
    setSelectedCitiesByState(nextCities);
    setSelectedLocalitiesByCity(nextLocs);
    emitChange(nextStates, nextCities, nextLocs);
  };

  const filteredStates = useMemo(
    () => safeStates.filter((s) => matchesQuery(s, stateQuery)),
    [safeStates, stateQuery],
  );

  const coverageSummary = summarizeSponsoredAd(value || {});

  if (!enabled) return null;

  return (
    <div className={`mb-4 space-y-3 rounded-xl border p-3 ${accentClass}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-emerald-800">
            <MapPin size={12} className="text-[#27AE60]" />
            {title}
          </p>
          <p className="mt-0.5 text-[11px] leading-4 text-slate-600">{subtitle}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <p className="rounded-full bg-emerald-100 px-2 py-0.5 text-right text-[10px] font-bold text-emerald-800">
            {coverageSummary}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-white px-2 py-1 text-[10px] font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
            title="Refresh locations"
          >
            <RefreshCw
              size={11}
              className={isFetching ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-4 text-xs text-slate-500">
          <Loader2 size={14} className="animate-spin text-[#27AE60]" />
          Loading Locations page data…
        </div>
      ) : loadError ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          {loadError}
        </p>
      ) : safeStates.length === 0 ? (
        <p className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-xs text-slate-500">
          No saved locations yet. Add states/cities/localities in the Locations
          page first.
        </p>
      ) : (
        <>
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              value={stateQuery}
              onChange={(e) => setStateQuery(e.target.value)}
              placeholder="Search saved states…"
              className="h-9 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-[#27AE60]"
            />
          </div>

          <div className="max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-white">
            {filteredStates.map((stateName) => {
              const stateOn = selectedStates.includes(stateName);
              const expanded = Boolean(expandedStates[stateName]);
              const cityMap = hierarchy[stateName] || {};
              const cityNames = Object.keys(cityMap);
              const cityQuery = cityQueryByState[stateName] || "";
              const filteredCities = cityNames.filter((c) =>
                matchesQuery(c, cityQuery),
              );

              return (
                <div
                  key={stateName}
                  className="border-b border-slate-100 last:border-0"
                >
                  <div className="flex items-center gap-1 px-1">
                    <button
                      type="button"
                      className="p-1.5 text-slate-400 hover:text-slate-600"
                      onClick={() =>
                        setExpandedStates((p) => ({
                          ...p,
                          [stateName]: !expanded,
                        }))
                      }
                    >
                      {expanded ? (
                        <ChevronDown size={14} />
                      ) : (
                        <ChevronRight size={14} />
                      )}
                    </button>
                    <div className="min-w-0 flex-1">
                      <CheckboxRow
                        checked={stateOn}
                        label={stateName}
                        onChange={(next) => toggleState(stateName, next)}
                      />
                    </div>
                    {stateOn ? (
                      <span className="pr-2 text-[10px] text-slate-400">
                        {(selectedCitiesByState[stateName] || []).length}/
                        {cityNames.length} cities
                      </span>
                    ) : (
                      <span className="pr-2 text-[10px] text-slate-400">
                        {cityNames.length} cities
                      </span>
                    )}
                  </div>

                  {expanded && (
                    <div className="mb-2 ml-6 mr-2 space-y-2 rounded-lg border border-slate-100 bg-slate-50/80 p-2">
                      <div className="relative">
                        <Search
                          size={12}
                          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                          type="search"
                          value={cityQuery}
                          onChange={(e) =>
                            setCityQueryByState((p) => ({
                              ...p,
                              [stateName]: e.target.value,
                            }))
                          }
                          placeholder="Search saved cities…"
                          className="h-8 w-full rounded-lg border border-slate-200 bg-white pl-8 pr-2 text-xs outline-none focus:border-[#27AE60]"
                        />
                      </div>
                      <div className="max-h-40 space-y-0.5 overflow-y-auto">
                        {filteredCities.length === 0 ? (
                          <p className="px-2 py-1 text-[11px] text-slate-400">
                            No cities in Locations for this state
                          </p>
                        ) : (
                          filteredCities.map((cityName) => {
                            const cityOn = (
                              selectedCitiesByState[stateName] || []
                            ).includes(cityName);
                            const cityKey = `${stateName}||${cityName}`;
                            const cityExpanded = Boolean(
                              expandedCities[cityKey],
                            );
                            const allLocs = cityMap[cityName] || [];
                            const locQuery = locQueryByCity[cityKey] || "";
                            const filteredLocs = allLocs.filter((l) =>
                              matchesQuery(l, locQuery),
                            );
                            const selectedLocs =
                              selectedLocalitiesByCity[stateName]?.[cityName] ||
                              [];

                            return (
                              <div key={cityKey} className="rounded-md">
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    className="p-1 text-slate-400"
                                    onClick={() =>
                                      setExpandedCities((p) => ({
                                        ...p,
                                        [cityKey]: !cityExpanded,
                                      }))
                                    }
                                  >
                                    {cityExpanded ? (
                                      <ChevronDown size={12} />
                                    ) : (
                                      <ChevronRight size={12} />
                                    )}
                                  </button>
                                  <div className="min-w-0 flex-1">
                                    <CheckboxRow
                                      checked={cityOn}
                                      label={cityName}
                                      onChange={(next) =>
                                        toggleCity(stateName, cityName, next)
                                      }
                                    />
                                  </div>
                                  {cityOn ? (
                                    <span className="pr-1 text-[10px] text-slate-400">
                                      {selectedLocs.length}/{allLocs.length}
                                    </span>
                                  ) : null}
                                </div>

                                {cityExpanded && (
                                  <div className="mb-1 ml-6 space-y-1 rounded-md border border-slate-100 bg-white p-1.5">
                                    <div className="relative">
                                      <Search
                                        size={11}
                                        className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400"
                                      />
                                      <input
                                        type="search"
                                        value={locQuery}
                                        onChange={(e) =>
                                          setLocQueryByCity((p) => ({
                                            ...p,
                                            [cityKey]: e.target.value,
                                          }))
                                        }
                                        placeholder="Search saved localities…"
                                        className="h-7 w-full rounded-md border border-slate-200 pl-7 pr-2 text-[11px] outline-none focus:border-[#27AE60]"
                                      />
                                    </div>
                                    <div className="max-h-28 overflow-y-auto">
                                      {allLocs.length === 0 ? (
                                        <p className="px-2 py-1 text-[10px] text-slate-400">
                                          No localities saved — city kept as
                                          whole-city coverage
                                        </p>
                                      ) : filteredLocs.length === 0 ? (
                                        <p className="px-2 py-1 text-[10px] text-slate-400">
                                          No match
                                        </p>
                                      ) : (
                                        filteredLocs.map((loc) => (
                                          <CheckboxRow
                                            key={`${cityKey}||${loc}`}
                                            checked={selectedLocs.some(
                                              (x) => norm(x) === norm(loc),
                                            )}
                                            label={loc}
                                            onChange={(next) =>
                                              toggleLocality(
                                                stateName,
                                                cityName,
                                                loc,
                                                next,
                                              )
                                            }
                                          />
                                        ))
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      <p className="text-[10px] text-slate-400">
        Empty selection = all India. Only Locations-page cities/localities
        appear here.
      </p>
    </div>
  );
}
