import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CheckSquare,
  ChevronDown,
  ChevronRight,
  Loader2,
  MapPin,
  Minus,
  RefreshCw,
  Search,
  Square,
  X,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  ADMIN_LOCATIONS_QUERY_KEY,
  buildHierarchyFromAdminLocations,
  fetchAdminLocationsList,
} from "../../features/locations/adminLocationsQuery";
import {
  buildSponsoredAdFromSelection,
  countSponsoredAdCoverage,
} from "../features/property/components/shared/promotionCoverageUtils";

const norm = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

function matchesQuery(label, query) {
  const q = norm(query);
  if (!q) return true;
  return norm(label).includes(q);
}

function TriCheck({ state }) {
  if (state === "on") {
    return <CheckSquare size={18} className="text-[#27AE60]" />;
  }
  if (state === "partial") {
    return (
      <span className="flex h-[18px] w-[18px] items-center justify-center rounded-[4px] bg-[#27AE60] text-white">
        <Minus size={12} strokeWidth={3} />
      </span>
    );
  }
  return <Square size={18} className="text-slate-300" />;
}

function coveredLocalities(hierarchy, selectedCities, selectedLocs, state, city) {
  const all = hierarchy[state]?.[city] || [];
  const cityOn = (selectedCities[state] || []).includes(city);
  if (!cityOn) return [];
  const picked = selectedLocs[state]?.[city] || [];
  if (!picked.length && all.length) return [...all];
  return picked;
}

function cityMode(hierarchy, selectedCities, selectedLocs, state, city) {
  const cityOn = (selectedCities[state] || []).includes(city);
  if (!cityOn) return "off";
  const all = hierarchy[state]?.[city] || [];
  if (!all.length) return "on";
  const picked = selectedLocs[state]?.[city] || [];
  if (!picked.length) return "on";
  const pickedNorm = new Set(picked.map(norm));
  const allOn = all.every((loc) => pickedNorm.has(norm(loc)));
  return allOn ? "on" : "partial";
}

function stateMode(hierarchy, selectedCities, selectedLocs, state) {
  const cities = Object.keys(hierarchy[state] || {});
  if (!cities.length) return "off";
  const modes = cities.map((city) =>
    cityMode(hierarchy, selectedCities, selectedLocs, state, city),
  );
  if (modes.every((mode) => mode === "on")) return "on";
  if (modes.every((mode) => mode === "off")) return "off";
  return "partial";
}

/**
 * Banner coverage picker.
 * Tick a state to include every city and locality under it.
 * Open a row to keep only particular cities or localities.
 * A partial mark means only some children are included.
 */
export default function BannerLocationPicker({ value, onChange }) {
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
    staleTime: 15_000,
    gcTime: 5 * 60_000,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    retry: 1,
  });

  const hierarchy = useMemo(
    () => buildHierarchyFromAdminLocations(locations),
    [locations],
  );

  useEffect(() => {
    const map =
      value && typeof value === "object" && !Array.isArray(value) ? value : {};
    const key = JSON.stringify(map);
    if (hydratedKeyRef.current === key) return;
    hydratedKeyRef.current = key;

    const nextStates = Object.keys(map);
    const nextCities = {};
    const nextLocs = {};
    const nextExpandedStates = {};
    for (const state of nextStates) {
      const cities = map[state] && typeof map[state] === "object" ? map[state] : {};
      nextCities[state] = Object.keys(cities);
      nextLocs[state] = {};
      nextExpandedStates[state] = true;
      for (const city of nextCities[state]) {
        nextLocs[state][city] = Array.isArray(cities[city]) ? [...cities[city]] : [];
      }
    }
    setSelectedStates(nextStates);
    setSelectedCitiesByState(nextCities);
    setSelectedLocalitiesByCity(nextLocs);
    if (nextStates.length) setExpandedStates(nextExpandedStates);
  }, [value]);

  const emitChange = useCallback((states, citiesByState, locsByCity) => {
    const next = buildSponsoredAdFromSelection(states, citiesByState, locsByCity);
    hydratedKeyRef.current = JSON.stringify(next);
    onChangeRef.current?.(next);
  }, []);

  const didAutoSelectRef = useRef(false);
  useEffect(() => {
    if (didAutoSelectRef.current) return;
    const map =
      value && typeof value === "object" && !Array.isArray(value) ? value : {};
    if (Object.keys(map).length) {
      didAutoSelectRef.current = true;
      return;
    }
    const states = Object.keys(hierarchy).sort((a, b) => a.localeCompare(b));
    if (!states.length) return;

    const citiesByState = {};
    const locsByCity = {};
    for (const state of states) {
      const cities = Object.keys(hierarchy[state] || {}).sort((a, b) =>
        a.localeCompare(b),
      );
      citiesByState[state] = cities;
      locsByCity[state] = Object.fromEntries(
        cities.map((city) => [city, [...(hierarchy[state][city] || [])]]),
      );
    }
    didAutoSelectRef.current = true;
    setSelectedStates(states);
    setSelectedCitiesByState(citiesByState);
    setSelectedLocalitiesByCity(locsByCity);
    emitChange(states, citiesByState, locsByCity);
  }, [hierarchy, value, emitChange]);

  const applySelection = (states, citiesByState, locsByCity) => {
    setSelectedStates(states);
    setSelectedCitiesByState(citiesByState);
    setSelectedLocalitiesByCity(locsByCity);
    emitChange(states, citiesByState, locsByCity);
  };

  const selectWholeState = (stateName) => {
    const byCity = hierarchy[stateName] || {};
    const allCities = Object.keys(byCity).sort((a, b) => a.localeCompare(b));
    const nextStates = selectedStates.includes(stateName)
      ? selectedStates
      : [...selectedStates, stateName];
    const nextCities = { ...selectedCitiesByState, [stateName]: allCities };
    const nextLocs = {
      ...selectedLocalitiesByCity,
      [stateName]: Object.fromEntries(
        allCities.map((city) => [city, [...(byCity[city] || [])]]),
      ),
    };
    setExpandedStates((prev) => ({ ...prev, [stateName]: true }));
    applySelection(nextStates, nextCities, nextLocs);
  };

  const clearState = (stateName) => {
    const nextStates = selectedStates.filter((state) => state !== stateName);
    const nextCities = { ...selectedCitiesByState };
    const nextLocs = { ...selectedLocalitiesByCity };
    delete nextCities[stateName];
    delete nextLocs[stateName];
    applySelection(nextStates, nextCities, nextLocs);
  };

  const toggleState = (stateName) => {
    const mode = stateMode(
      hierarchy,
      selectedCitiesByState,
      selectedLocalitiesByCity,
      stateName,
    );
    if (mode === "on") clearState(stateName);
    else selectWholeState(stateName);
  };

  const toggleCity = (stateName, cityName) => {
    const mode = cityMode(
      hierarchy,
      selectedCitiesByState,
      selectedLocalitiesByCity,
      stateName,
      cityName,
    );
    const currentCities = selectedCitiesByState[stateName] || [];
    const nextLocsForState = { ...(selectedLocalitiesByCity[stateName] || {}) };

    if (mode === "on") {
      const nextCitiesList = currentCities.filter((city) => city !== cityName);
      delete nextLocsForState[cityName];
      const nextCities = { ...selectedCitiesByState, [stateName]: nextCitiesList };
      const nextLocs = { ...selectedLocalitiesByCity, [stateName]: nextLocsForState };
      let nextStates = selectedStates;
      if (!nextCitiesList.length) {
        nextStates = selectedStates.filter((state) => state !== stateName);
        delete nextCities[stateName];
        delete nextLocs[stateName];
      }
      applySelection(nextStates, nextCities, nextLocs);
      return;
    }

    const nextCitiesList = currentCities.includes(cityName)
      ? currentCities
      : [...currentCities, cityName];
    nextLocsForState[cityName] = [...(hierarchy[stateName]?.[cityName] || [])];
    const nextStates = selectedStates.includes(stateName)
      ? selectedStates
      : [...selectedStates, stateName];
    setExpandedCities((prev) => ({
      ...prev,
      [`${stateName}||${cityName}`]: true,
    }));
    applySelection(
      nextStates,
      { ...selectedCitiesByState, [stateName]: nextCitiesList },
      { ...selectedLocalitiesByCity, [stateName]: nextLocsForState },
    );
  };

  const toggleLocality = (stateName, cityName, localityName, checked) => {
    const allLocs = hierarchy[stateName]?.[cityName] || [];
    const cityOn = (selectedCitiesByState[stateName] || []).includes(cityName);
    let current = selectedLocalitiesByCity[stateName]?.[cityName] || [];
    if (cityOn && current.length === 0 && allLocs.length) current = [...allLocs];

    const nextList = checked
      ? current.some((loc) => norm(loc) === norm(localityName))
        ? current
        : [...current, localityName]
      : current.filter((loc) => norm(loc) !== norm(localityName));

    if (!nextList.length) {
      const nextCitiesList = (selectedCitiesByState[stateName] || []).filter(
        (city) => city !== cityName,
      );
      const nextLocsForState = { ...(selectedLocalitiesByCity[stateName] || {}) };
      delete nextLocsForState[cityName];
      const nextCities = { ...selectedCitiesByState, [stateName]: nextCitiesList };
      const nextLocs = { ...selectedLocalitiesByCity, [stateName]: nextLocsForState };
      let nextStates = selectedStates;
      if (!nextCitiesList.length) {
        nextStates = selectedStates.filter((state) => state !== stateName);
        delete nextCities[stateName];
        delete nextLocs[stateName];
      }
      applySelection(nextStates, nextCities, nextLocs);
      return;
    }

    const nextStates = selectedStates.includes(stateName)
      ? selectedStates
      : [...selectedStates, stateName];
    const currentCities = selectedCitiesByState[stateName] || [];
    const nextCitiesList = currentCities.includes(cityName)
      ? currentCities
      : [...currentCities, cityName];
    applySelection(
      nextStates,
      { ...selectedCitiesByState, [stateName]: nextCitiesList },
      {
        ...selectedLocalitiesByCity,
        [stateName]: {
          ...(selectedLocalitiesByCity[stateName] || {}),
          [cityName]: nextList,
        },
      },
    );
  };

  const safeStates = useMemo(
    () => Object.keys(hierarchy).sort((a, b) => a.localeCompare(b)),
    [hierarchy],
  );
  const filteredStates = useMemo(
    () => safeStates.filter((state) => matchesQuery(state, stateQuery)),
    [safeStates, stateQuery],
  );

  const counts = countSponsoredAdCoverage(value || {});
  const selectedStateNames = Object.keys(value || {});

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <MapPin size={16} className="text-[#27AE60]" />
            Banner locations
          </p>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
            Turning this on selects every state, city, and locality. Untick a
            state, city, or locality to leave it out.
          </p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw size={13} className={isFetching ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-3">
        {counts.states ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-emerald-800">
              {counts.states} state{counts.states === 1 ? "" : "s"} · {counts.cities}{" "}
              {counts.cities === 1 ? "city" : "cities"} · {counts.localities}{" "}
              {counts.localities === 1 ? "locality" : "localities"}
            </span>
            {selectedStateNames.map((state) => (
              <button
                key={state}
                type="button"
                onClick={() => clearState(state)}
                className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-red-50 hover:text-red-600 hover:ring-red-100"
              >
                {state}
                <X size={12} />
              </button>
            ))}
          </div>
        ) : (
          <p className="text-xs font-medium text-slate-500">
            Nothing selected. This banner stays all India until you pick places and save.
          </p>
        )}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 px-4 py-8 text-sm text-slate-500">
          <Loader2 size={16} className="animate-spin text-[#27AE60]" />
          Loading saved locations…
        </div>
      ) : isError ? (
        <p className="px-4 py-6 text-sm text-amber-800">
          Could not load Locations page data. Open Locations and try again.
        </p>
      ) : safeStates.length === 0 ? (
        <p className="px-4 py-6 text-sm text-slate-500">
          No saved locations yet. Add states, cities, and localities on the Locations page first.
        </p>
      ) : (
        <>
          <div className="px-4 pt-3">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="search"
                value={stateQuery}
                onChange={(e) => setStateQuery(e.target.value)}
                placeholder="Search states"
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none focus:border-[#27AE60]"
              />
            </div>
          </div>

          <div className="mt-3 max-h-[32rem] overflow-y-auto border-t border-slate-100">
            {filteredStates.length === 0 ? (
              <p className="px-4 py-6 text-sm text-slate-400">No states match that search.</p>
            ) : (
              filteredStates.map((stateName) => {
                const mode = stateMode(
                  hierarchy,
                  selectedCitiesByState,
                  selectedLocalitiesByCity,
                  stateName,
                );
                const expanded = Boolean(expandedStates[stateName]);
                const cityMap = hierarchy[stateName] || {};
                const cityNames = Object.keys(cityMap).sort((a, b) =>
                  a.localeCompare(b),
                );
                const cityQuery = cityQueryByState[stateName] || "";
                const filteredCities = cityNames.filter((city) =>
                  matchesQuery(city, cityQuery),
                );
                const pickedCities = (selectedCitiesByState[stateName] || []).length;

                return (
                  <div key={stateName} className="border-b border-slate-100 last:border-0">
                    <div
                      className={`flex items-center gap-2 px-3 py-2.5 ${
                        mode === "on"
                          ? "bg-emerald-50/70"
                          : mode === "partial"
                            ? "bg-amber-50/60"
                            : "bg-white"
                      }`}
                    >
                      <button
                        type="button"
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-white/80"
                        aria-label={expanded ? `Collapse ${stateName}` : `Expand ${stateName}`}
                        onClick={() =>
                          setExpandedStates((prev) => ({
                            ...prev,
                            [stateName]: !expanded,
                          }))
                        }
                      >
                        {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleState(stateName)}
                        className="flex min-w-0 flex-1 items-center gap-3 rounded-lg py-1 text-left"
                        aria-pressed={mode !== "off"}
                      >
                        <TriCheck state={mode} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-slate-800">
                            {stateName}
                          </span>
                          <span className="block text-xs text-slate-500">
                            {mode === "off"
                              ? `${cityNames.length} ${cityNames.length === 1 ? "city" : "cities"}`
                              : `${pickedCities} of ${cityNames.length} ${
                                  cityNames.length === 1 ? "city" : "cities"
                                }`}
                          </span>
                        </span>
                      </button>
                    </div>

                    {expanded && (
                      <div className="space-y-2 border-t border-slate-100 bg-slate-50/70 px-4 py-3 sm:pl-14">
                        <div className="relative">
                          <Search
                            size={14}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                          />
                          <input
                            type="search"
                            value={cityQuery}
                            onChange={(e) =>
                              setCityQueryByState((prev) => ({
                                ...prev,
                                [stateName]: e.target.value,
                              }))
                            }
                            placeholder={`Search cities in ${stateName}`}
                            className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-[#27AE60]"
                          />
                        </div>

                        {filteredCities.length === 0 ? (
                          <p className="px-1 py-2 text-sm text-slate-400">
                            No cities saved for this state.
                          </p>
                        ) : (
                          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                            {filteredCities.map((cityName) => {
                              const cityKey = `${stateName}||${cityName}`;
                              const cityState = cityMode(
                                hierarchy,
                                selectedCitiesByState,
                                selectedLocalitiesByCity,
                                stateName,
                                cityName,
                              );
                              const cityExpanded = Boolean(expandedCities[cityKey]);
                              const allLocs = cityMap[cityName] || [];
                              const locQuery = locQueryByCity[cityKey] || "";
                              const filteredLocs = allLocs.filter((loc) =>
                                matchesQuery(loc, locQuery),
                              );
                              const selectedLocs = coveredLocalities(
                                hierarchy,
                                selectedCitiesByState,
                                selectedLocalitiesByCity,
                                stateName,
                                cityName,
                              );

                              return (
                                <div
                                  key={cityKey}
                                  className="border-b border-slate-100 last:border-0"
                                >
                                  <div className="flex items-center gap-2 px-2 py-1.5">
                                    <button
                                      type="button"
                                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50"
                                      aria-label={
                                        cityExpanded
                                          ? `Collapse ${cityName}`
                                          : `Expand ${cityName}`
                                      }
                                      onClick={() =>
                                        setExpandedCities((prev) => ({
                                          ...prev,
                                          [cityKey]: !cityExpanded,
                                        }))
                                      }
                                    >
                                      {cityExpanded ? (
                                        <ChevronDown size={16} />
                                      ) : (
                                        <ChevronRight size={16} />
                                      )}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => toggleCity(stateName, cityName)}
                                      className="flex min-w-0 flex-1 items-center gap-3 rounded-lg py-1.5 text-left"
                                      aria-pressed={cityState !== "off"}
                                    >
                                      <TriCheck state={cityState} />
                                      <span className="min-w-0 flex-1 truncate text-sm text-slate-700">
                                        {cityName}
                                      </span>
                                      <span className="shrink-0 pr-2 text-xs text-slate-400">
                                        {allLocs.length
                                          ? cityState === "off"
                                            ? `${allLocs.length} ${
                                                allLocs.length === 1 ? "locality" : "localities"
                                              }`
                                            : `${selectedLocs.length}/${allLocs.length}`
                                          : "Whole city"}
                                      </span>
                                    </button>
                                  </div>

                                  {cityExpanded && (
                                    <div className="border-t border-slate-100 bg-slate-50/80 px-3 py-3 sm:pl-12">
                                      {allLocs.length === 0 ? (
                                        <p className="text-xs text-slate-500">
                                          No localities saved. Ticking this city covers the whole city.
                                        </p>
                                      ) : (
                                        <>
                                          <div className="relative mb-2">
                                            <Search
                                              size={13}
                                              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                            />
                                            <input
                                              type="search"
                                              value={locQuery}
                                              onChange={(e) =>
                                                setLocQueryByCity((prev) => ({
                                                  ...prev,
                                                  [cityKey]: e.target.value,
                                                }))
                                              }
                                              placeholder={`Search localities in ${cityName}`}
                                              className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-sm outline-none focus:border-[#27AE60]"
                                            />
                                          </div>
                                          {filteredLocs.length === 0 ? (
                                            <p className="text-xs text-slate-400">No localities match.</p>
                                          ) : (
                                            <div className="grid gap-1 sm:grid-cols-2">
                                              {filteredLocs.map((loc) => {
                                                const locOn = selectedLocs.some(
                                                  (item) => norm(item) === norm(loc),
                                                );
                                                return (
                                                  <button
                                                    key={`${cityKey}||${loc}`}
                                                    type="button"
                                                    onClick={() =>
                                                      toggleLocality(
                                                        stateName,
                                                        cityName,
                                                        loc,
                                                        !locOn,
                                                      )
                                                    }
                                                    className={`flex items-center gap-2 rounded-lg px-2 py-2 text-left text-sm hover:bg-white ${
                                                      locOn ? "bg-white text-slate-800" : "text-slate-600"
                                                    }`}
                                                    aria-pressed={locOn}
                                                  >
                                                    <TriCheck state={locOn ? "on" : "off"} />
                                                    <span className="min-w-0 truncate">{loc}</span>
                                                  </button>
                                                );
                                              })}
                                            </div>
                                          )}
                                        </>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}
