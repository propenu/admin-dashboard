// Property edit Location — same save rules as Post Property Step 2:
// PIN = manual 6 digits only | State/City/Locality = dropdown or map pin
import { useEffect, useState, useCallback, useRef, memo, useMemo } from "react";
import {
  MapPin,
  Building2,
  Globe2,
  Navigation,
  Landmark,
  Save,
  CheckCircle2,
  ChevronDown,
  Check,
  Loader2,
} from "lucide-react";
import { City, State } from "country-state-city";
import MapplsPinMap from "../components/location/MapplsPinMap";
import NearbyPlacesInput from "../components/location/NearbyPlacesInput";
import {
  getCitySuggestions as getSharedCitySuggestions,
  getSavedCityNamesForState,
  getSavedLocalitySuggestions,
  isKnownCityName,
  unwrapLocationList,
  mergeSavedLocationSources,
  locationsFromFeaturedOptions,
  titleCase as sharedTitleCase,
  normalizeComparisonValue as sharedNormalize,
  canAddCustomLocation,
} from "../../../../components/common/location/searchableLocationUtils";
import { fetchSearchableLocationsService } from "../../../../services/LocationsServices/LocationServices";
import { fetchListingLocationOptions } from "../../../../services/PostAPropertyService";
import { fetchLoggedInUser } from "../../../../services/UserServices/userServices";

const titleCase = (str) => {
  if (!str) return "";
  return str
    .toLowerCase()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

const normalizeComparisonValue = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

const matchesSearchPrefix = (label, query) => {
  const normalizedLabel = normalizeComparisonValue(label);
  const normalizedQuery = normalizeComparisonValue(query);
  if (!normalizedLabel || !normalizedQuery) return false;
  if (normalizedLabel.startsWith(normalizedQuery)) return true;
  const labelSegments = normalizedLabel.split(" ").filter(Boolean);
  const querySegments = normalizedQuery.split(" ").filter(Boolean);
  if (!querySegments.length) return false;
  return querySegments.every((qs) =>
    labelSegments.some((ls) => ls.startsWith(qs)),
  );
};

const INDIA_BBOX = "68.1766451354,7.96553477623,97.4025614766,35.4940095078";

function getStateSuggestions(query) {
  return State.getStatesOfCountry("IN")
    .map((state) => ({ label: state.name, isoCode: state.isoCode }))
    .filter((state) =>
      query.trim() ? matchesSearchPrefix(state.label, query) : true,
    );
}

function getCitySuggestions(stateName, query, savedCities = []) {
  return getSharedCitySuggestions(stateName, query, {
    includeOther: false,
    savedCities,
  }).map((city) => ({
    label: city.label,
    state: city.state || stateName,
    stateCode: city.stateCode,
    isSaved: Boolean(city.isSaved),
  }));
}

async function searchLocalitiesWithPhoton(
  query,
  signal,
  activeState,
  activeCity,
  searchText,
) {
  if (!query?.trim()) return [];
  try {
    const fullQuery = [query, activeCity, activeState].filter(Boolean).join(", ");
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(fullQuery)}&lang=en&limit=12&bbox=${INDIA_BBOX}`;
    const res = await fetch(url, { signal });
    if (!res.ok) return [];
    const data = await res.json();
    const features = data?.features || [];
    const seen = new Set();
    const suggestions = [];
    const wardPattern = /ward\s*\d+/i;

    for (const feature of features) {
      const p = feature.properties || {};
      if (p.country && p.country !== "India") continue;
      const rawSource = p.suburb || p.locality || p.name || "";
      if (wardPattern.test(rawSource) || wardPattern.test(p.name || "")) continue;
      const localityName = titleCase(rawSource.replace(/^ward\s*\d+[a-z]?\s+/i, "").trim());
      if (!localityName || wardPattern.test(localityName)) continue;
      const rawCity = titleCase(
        (p.city || p.district || "").replace(/^ward\s*\d+[a-z]?\s+/i, "").trim(),
      );
      const city = wardPattern.test(rawCity) ? "" : rawCity;
      const state = titleCase(p.state || "");
      if (searchText && !matchesSearchPrefix(localityName, searchText)) continue;
      if (
        activeCity &&
        city &&
        normalizeComparisonValue(city) !== normalizeComparisonValue(activeCity)
      ) {
        continue;
      }
      if (
        activeState &&
        state &&
        normalizeComparisonValue(state) !== normalizeComparisonValue(activeState)
      ) {
        continue;
      }
      const key = normalizeComparisonValue(`${localityName}|${city}|${state}`);
      if (seen.has(key)) continue;
      seen.add(key);
      const coords = feature.geometry?.coordinates;
      if (!Array.isArray(coords) || coords.length !== 2) continue;
      suggestions.push({ label: localityName, city, state, coordinates: coords });
    }
    return suggestions;
  } catch (err) {
    if (err?.name !== "AbortError") console.error("Photon locality search:", err);
    return [];
  }
}

async function geocodeLocationWithPhoton(query, signal) {
  if (!query?.trim()) return null;
  try {
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&lang=en&limit=1&bbox=${INDIA_BBOX}`;
    const res = await fetch(url, { signal });
    if (!res.ok) return null;
    const data = await res.json();
    const coordinates = data?.features?.[0]?.geometry?.coordinates;
    return coordinates?.length === 2 ? coordinates : null;
  } catch (err) {
    if (err?.name !== "AbortError") console.error("Photon geocode:", err);
    return null;
  }
}

const LocInput = memo(function LocInput({
  label,
  value,
  onChange,
  placeholder,
  icon,
  maxLength,
  inputMode,
}) {
  return (
    <div className="min-w-0 flex-1 space-y-1.5">
      <label className="ml-0.5 text-[9px] font-black uppercase tracking-[0.14em] text-slate-500">
        {label}
      </label>
      <div className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/70 px-3 transition-all hover:border-emerald-300 focus-within:border-[#27AE60] focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-100">
        {icon && <span className="shrink-0 text-slate-400">{icon}</span>}
        <input
          type="text"
          value={value || ""}
          maxLength={maxLength}
          inputMode={inputMode}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          placeholder={placeholder}
          className="min-w-0 w-full bg-transparent text-xs font-semibold text-slate-800 outline-none placeholder:font-medium placeholder:text-slate-300"
          style={{ caretColor: "#27AE60" }}
        />
      </div>
    </div>
  );
});

function SearchableSelect({
  label,
  value,
  placeholder,
  disabled = false,
  open,
  onToggle,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  loading = false,
  options = [],
  onSelect,
  emptyHint,
  dropdownRef,
  optionKey = (opt, idx) => `${opt.label}-${idx}`,
  renderOption,
}) {
  return (
    <div className="min-w-0 space-y-1.5">
      <label className="ml-0.5 text-[9px] font-black uppercase tracking-[0.14em] text-slate-500">
        {label}
      </label>
      <div
        ref={dropdownRef}
        className={`relative w-full ${open ? "z-[60]" : "z-10"}`}
      >
        <button
          type="button"
          disabled={disabled}
          onClick={onToggle}
          className={`flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50/70 px-3 text-left text-xs font-semibold transition-all hover:border-emerald-300 ${
            open ? "border-[#27AE60] bg-white ring-2 ring-emerald-100" : ""
          } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
        >
          <span
            className={`min-w-0 flex-1 truncate ${
              value ? "text-slate-800" : "text-slate-300"
            }`}
          >
            {value || placeholder}
          </span>
          <ChevronDown
            size={14}
            className={`shrink-0 text-slate-400 transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>
        {open && (
          <div className="absolute left-0 right-0 top-full z-[70] mt-1 max-h-60 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
            <div className="relative border-b border-slate-100 p-2">
              <input
                autoFocus
                type="text"
                value={searchValue}
                placeholder={searchPlaceholder}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs outline-none focus:border-[#27AE60] focus:ring-2 focus:ring-emerald-100"
              />
              {loading && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2">
                  <Loader2 size={12} className="animate-spin text-slate-400" />
                </span>
              )}
            </div>
            <div className="max-h-48 overflow-y-auto py-1">
              {options.length > 0 ? (
                options.map((opt, idx) => {
                  const isSelected =
                    normalizeComparisonValue(value) ===
                    normalizeComparisonValue(opt.label);
                  return (
                    <button
                      key={optionKey(opt, idx)}
                      type="button"
                      onClick={() => onSelect(opt)}
                      className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-xs ${
                        isSelected
                          ? "bg-emerald-50 text-[#27AE60]"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {renderOption ? (
                        renderOption(opt)
                      ) : (
                        <span className="truncate">{opt.label}</span>
                      )}
                      {isSelected && <Check size={12} className="shrink-0" />}
                    </button>
                  );
                })
              ) : !loading ? (
                <p className="px-3 py-3 text-xs text-slate-400">{emptyHint}</p>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function StepLocationDetails({ data, onChange, onSave }) {
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const upd = useCallback((field, value) => {
    onChangeRef.current(field, value, "location");
  }, []);

  const skipNextFieldGeocodeRef = useRef(false);
  const fieldGeocodeAbortRef = useRef(null);

  const [stateOpen, setStateOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const [localityOpen, setLocalityOpen] = useState(false);
  const [stateSearch, setStateSearch] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const [localitySearch, setLocalitySearch] = useState("");
  const [stateSuggestions, setStateSuggestions] = useState([]);
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [localitySuggestions, setLocalitySuggestions] = useState([]);
  const [stateLoading, setStateLoading] = useState(false);
  const [cityLoading, setCityLoading] = useState(false);
  const [localityLoading, setLocalityLoading] = useState(false);
  const [savedLocations, setSavedLocations] = useState([]);
  const [canAddCustomCity, setCanAddCustomCity] = useState(false);

  const stateDropdownRef = useRef(null);
  const cityDropdownRef = useRef(null);
  const localityDropdownRef = useRef(null);

  const savedCitiesForState = useMemo(
    () => getSavedCityNamesForState(savedLocations, data.state),
    [savedLocations, data.state],
  );

  const citySuggestionExtras = useMemo(() => {
    const current = sharedTitleCase(String(data.city || "").trim());
    if (!current || !data.state) return savedCitiesForState;
    if (isKnownCityName(data.state, current, savedCitiesForState)) {
      return savedCitiesForState;
    }
    return [...savedCitiesForState, current];
  }, [savedCitiesForState, data.city, data.state]);

  useEffect(() => {
    let cancelled = false;
    fetchLoggedInUser()
      .then((user) => {
        if (cancelled) return;
        setCanAddCustomCity(
          canAddCustomLocation(user?.roleName || user?.role?.name),
        );
      })
      .catch(() => {
        if (!cancelled) setCanAddCustomCity(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetchSearchableLocationsService().catch(() => null),
      fetchListingLocationOptions().catch(() => null),
    ]).then(([locRes, listingRes]) => {
      if (cancelled) return;
      setSavedLocations(
        mergeSavedLocationSources(
          unwrapLocationList(locRes),
          locationsFromFeaturedOptions(listingRes),
        ),
      );
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handlePinChange = useCallback(
    ({ coordinates, locality, city, state }) => {
      skipNextFieldGeocodeRef.current = true;
      upd("location", { type: "Point", coordinates });
      // PIN stays manual — only State / City / Locality from map
      if (locality) upd("locality", locality);
      if (city) upd("city", city);
      if (state) upd("state", state);
    },
    [upd],
  );

  const handleAddressChange = useCallback((v) => upd("address", v), [upd]);
  const handleBuildingChange = useCallback((v) => upd("buildingName", v), [upd]);
  const handleLandNameChange = useCallback((v) => upd("landName", v), [upd]);
  const handleNearbyChange = useCallback((v) => upd("nearbyPlaces", v), [upd]);
  const handlePincodeChange = useCallback(
    (value) => {
      upd("pincode", value.replace(/\D/g, "").slice(0, 6));
    },
    [upd],
  );

  useEffect(() => {
    if (!stateOpen && !cityOpen && !localityOpen) return;
    const onDown = (event) => {
      if (stateOpen && stateDropdownRef.current && !stateDropdownRef.current.contains(event.target)) {
        setStateOpen(false);
      }
      if (cityOpen && cityDropdownRef.current && !cityDropdownRef.current.contains(event.target)) {
        setCityOpen(false);
      }
      if (localityOpen && localityDropdownRef.current && !localityDropdownRef.current.contains(event.target)) {
        setLocalityOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [stateOpen, cityOpen, localityOpen]);

  useEffect(() => {
    if (!stateOpen) {
      setStateSuggestions([]);
      return;
    }
    const tid = setTimeout(() => {
      setStateLoading(true);
      setStateSuggestions(getStateSuggestions(stateSearch));
      setStateLoading(false);
    }, 250);
    return () => clearTimeout(tid);
  }, [stateOpen, stateSearch]);

  useEffect(() => {
    if (!cityOpen) {
      setCitySuggestions([]);
      return;
    }
    const query = citySearch.trim();
    const tid = setTimeout(() => {
      if (!data.state) {
        setCitySuggestions([]);
        return;
      }
      setCityLoading(true);
      setCitySuggestions(
        getCitySuggestions(data.state, query || undefined, citySuggestionExtras),
      );
      setCityLoading(false);
    }, 200);
    return () => clearTimeout(tid);
  }, [cityOpen, citySearch, data.state, citySuggestionExtras]);

  useEffect(() => {
    if (!localityOpen) {
      setLocalitySuggestions([]);
      return;
    }
    const trimmed = localitySearch.trim();
    if (!data.city) {
      setLocalitySuggestions([]);
      return;
    }

    const saved = getSavedLocalitySuggestions(
      savedLocations,
      data.state,
      data.city,
      trimmed,
    );

    if (trimmed.length < 2) {
      const current = sharedTitleCase(String(data.locality || "").trim());
      const list = [...saved];
      if (
        current &&
        !list.some(
          (r) => sharedNormalize(r.label) === sharedNormalize(current),
        )
      ) {
        list.unshift({
          label: current,
          city: data.city,
          state: data.state,
          isSaved: true,
        });
      }
      setLocalitySuggestions(list);
      return;
    }

    const ctrl = new AbortController();
    const tid = setTimeout(async () => {
      setLocalityLoading(true);
      const results = await searchLocalitiesWithPhoton(
        trimmed,
        ctrl.signal,
        data.state || undefined,
        data.city || undefined,
        trimmed,
      );
      const seen = new Set(saved.map((s) => sharedNormalize(s.label)));
      const merged = [...saved];
      for (const r of results) {
        const key = sharedNormalize(r.label);
        if (!key || seen.has(key)) continue;
        seen.add(key);
        merged.push(r);
      }
      if (
        canAddCustomCity &&
        !merged.some(
          (r) => sharedNormalize(r.label) === sharedNormalize(trimmed),
        )
      ) {
        merged.push({
          label: sharedTitleCase(trimmed),
          isCustom: true,
          city: data.city,
          state: data.state,
        });
      }
      setLocalitySuggestions(merged);
      setLocalityLoading(false);
    }, 350);
    return () => {
      ctrl.abort();
      clearTimeout(tid);
      setLocalityLoading(false);
    };
  }, [
    localityOpen,
    localitySearch,
    data.city,
    data.state,
    data.locality,
    savedLocations,
    canAddCustomCity,
  ]);

  useEffect(() => {
    if (skipNextFieldGeocodeRef.current) {
      skipNextFieldGeocodeRef.current = false;
      return;
    }
    if (!data.locality) return;

    fieldGeocodeAbortRef.current?.abort();
    const ctrl = new AbortController();
    fieldGeocodeAbortRef.current = ctrl;

    const run = async () => {
      const candidates = [
        [data.locality, data.city, data.state].filter(Boolean).join(", "),
        [data.locality, data.state].filter(Boolean).join(", "),
        [data.city, data.state].filter(Boolean).join(", "),
        String(data.locality),
      ].filter(Boolean);

      for (const query of candidates) {
        const coordinates = await geocodeLocationWithPhoton(query, ctrl.signal);
        if (!coordinates) continue;
        upd("location", { type: "Point", coordinates });
        return;
      }
    };
    run();
    return () => ctrl.abort();
  }, [data.locality, data.city, data.state, upd]);

  const applyStateSelection = useCallback(
    (suggestion) => {
      skipNextFieldGeocodeRef.current = true;
      upd("state", suggestion.label);
      const cities = getCitySuggestions(
        suggestion.label,
        undefined,
        getSavedCityNamesForState(savedLocations, suggestion.label),
      );
      if (
        data.city &&
        !cities.some(
          (c) =>
            normalizeComparisonValue(c.label) ===
            normalizeComparisonValue(data.city),
        )
      ) {
        upd("city", "");
        upd("locality", "");
      }
      setStateSearch("");
      setStateOpen(false);
    },
    [data.city, upd, savedLocations],
  );

  const applyCitySelection = useCallback(
    (suggestion) => {
      skipNextFieldGeocodeRef.current = true;
      upd("city", suggestion.label);
      if (suggestion.state) upd("state", suggestion.state);
      setCitySearch("");
      setCityOpen(false);
    },
    [upd],
  );

  const applyLocalitySelection = useCallback(
    (suggestion) => {
      skipNextFieldGeocodeRef.current = true;
      upd("locality", suggestion.label);
      if (suggestion.city) upd("city", suggestion.city);
      if (suggestion.state) upd("state", suggestion.state);
      if (
        Array.isArray(suggestion.coordinates) &&
        suggestion.coordinates.length === 2
      ) {
        upd("location", { type: "Point", coordinates: suggestion.coordinates });
      }
      setLocalitySearch("");
      setLocalityOpen(false);
      setLocalitySuggestions([]);
    },
    [upd],
  );

  useEffect(
    () => () => {
      fieldGeocodeAbortRef.current?.abort();
    },
    [],
  );

  const pinnedCoordinates = data.location?.coordinates ?? null;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-[#27AE60]">
            <MapPin className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#27AE60]">
              Property location
            </p>
            <h2 className="mt-0.5 text-sm font-black text-slate-900">
              Address, map pin and nearby landmarks
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-1.5 self-start rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[9px] font-bold text-slate-500 sm:self-auto">
          <CheckCircle2 className="h-3 w-3 text-[#27AE60]" />
          Same as create · PIN manual · dropdowns / map for address
        </div>
      </div>

      <div
        className="relative z-30 overflow-visible rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]"
        style={{
          border: "1.5px solid #fde68a40",
          background: "linear-gradient(135deg,#fffbeb08,#fff)",
        }}
      >
        <div
          className="h-0.5"
          style={{
            background: "linear-gradient(90deg,#F59E0B80,#F59E0B20,transparent)",
          }}
        />
        <div className="space-y-3 p-3 sm:p-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <MapPin className="h-3.5 w-3.5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-700">
              Physical Address
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <LocInput
                label="Street Address / House No."
                placeholder="Plot No. 123, Sector 4, Main Road"
                value={data.address}
                onChange={handleAddressChange}
                icon={<Navigation className="h-3.5 w-3.5" />}
              />
            </div>

            {(data.propertyCategory === "residential" ||
              data.propertyCategory === "commercial") && (
              <LocInput
                label="Building / Society"
                placeholder="Green Valley Apartments"
                value={data.buildingName}
                onChange={handleBuildingChange}
                icon={<Building2 className="h-3.5 w-3.5" />}
              />
            )}
            {(data.propertyCategory === "land" ||
              data.propertyCategory === "agricultural") && (
              <LocInput
                label="Land / Layout Name"
                placeholder="Green Valley Layout"
                value={data.landName}
                onChange={handleLandNameChange}
                icon={<Building2 className="h-3.5 w-3.5" />}
              />
            )}

            <LocInput
              label="Pincode"
              placeholder="6-digit pincode"
              value={data.pincode}
              maxLength={6}
              inputMode="numeric"
              onChange={handlePincodeChange}
              icon={<Globe2 className="h-3.5 w-3.5" />}
            />

            <div className="sm:col-span-2 rounded-lg border border-amber-200 bg-amber-50/70 px-3 py-2">
              <p className="text-[9px] font-semibold leading-4 text-amber-700">
                PIN Code is manual (6 digits only). Select State → City → Locality
                from dropdowns, or click the map to fill them from the pin.
              </p>
            </div>

            <SearchableSelect
              label="State"
              value={data.state || ""}
              placeholder="Select state"
              open={stateOpen}
              onToggle={() => {
                setStateOpen((o) => !o);
                setCityOpen(false);
                setLocalityOpen(false);
                if (!stateOpen) setStateSearch("");
              }}
              searchValue={stateSearch}
              onSearchChange={setStateSearch}
              searchPlaceholder="Search state..."
              loading={stateLoading}
              options={stateSuggestions}
              onSelect={applyStateSelection}
              emptyHint="Type to search Indian states"
              dropdownRef={stateDropdownRef}
              optionKey={(opt) => opt.isoCode || opt.label}
            />

            <SearchableSelect
              label="City"
              value={data.city || ""}
              placeholder={data.state ? "Select city" : "Select state first"}
              disabled={!data.state}
              open={cityOpen}
              onToggle={() => {
                if (!data.state) return;
                setCityOpen((o) => !o);
                setStateOpen(false);
                setLocalityOpen(false);
                if (!cityOpen) setCitySearch("");
              }}
              searchValue={citySearch}
              onSearchChange={setCitySearch}
              searchPlaceholder="Search city…"
              loading={cityLoading}
              options={citySuggestions}
              onSelect={applyCitySelection}
              emptyHint={
                citySearch.trim().length >= 1
                  ? "No city found — check spelling or pick another state"
                  : data.state
                    ? "Package + saved cities for this state"
                    : "Select state first"
              }
              dropdownRef={cityDropdownRef}
              optionKey={(opt, idx) =>
                `${opt.label}-${opt.isSaved ? "s" : "p"}-${opt.stateCode || idx}`
              }
              renderOption={(opt) => (
                <span className="min-w-0 flex-1 truncate">
                  {opt.label}
                  {opt.isSaved ? (
                    <span className="ml-1 text-[10px] font-semibold text-[#27AE60]">
                      (saved)
                    </span>
                  ) : null}
                </span>
              )}
            />

            <div className="sm:col-span-2">
              <SearchableSelect
                label="Locality"
                value={data.locality || ""}
                placeholder={
                  data.city ? "Search locality..." : "Select city first"
                }
                disabled={!data.city}
                open={localityOpen}
                onToggle={() => {
                  if (!data.city) return;
                  setLocalityOpen((o) => !o);
                  setStateOpen(false);
                  setCityOpen(false);
                  if (!localityOpen) {
                    setLocalitySearch("");
                    setLocalitySuggestions([]);
                  }
                }}
                searchValue={localitySearch}
                onSearchChange={setLocalitySearch}
                searchPlaceholder="Search locality..."
                loading={localityLoading}
                options={localitySuggestions}
                onSelect={applyLocalitySelection}
                emptyHint={
                  !data.city
                    ? "Select city first"
                    : localitySearch.trim().length >= 2
                      ? canAddCustomCity
                        ? "No locality found — keep typing to use a custom name"
                        : "No locality found — pick a saved or suggested locality"
                      : "Saved localities for this city, or type to search"
                }
                dropdownRef={localityDropdownRef}
                optionKey={(opt, idx) =>
                  `${opt.label}-${opt.isSaved ? "s" : "p"}-${idx}`
                }
                renderOption={(opt) => (
                  <span className="min-w-0 flex-1 truncate">
                    {opt.label}
                    {opt.isSaved ? (
                      <span className="ml-1 text-[10px] font-semibold text-[#27AE60]">
                        (saved)
                      </span>
                    ) : null}
                    {opt.isCustom ? (
                      <span className="ml-1 text-[10px] text-slate-400">
                        (use typed)
                      </span>
                    ) : null}
                  </span>
                )}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
        <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2.5 sm:px-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Navigation className="h-3.5 w-3.5" />
            </div>
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-700">
                Map location
              </h3>
              <p className="mt-0.5 text-[10px] text-slate-400">
                Click map → State, City, Locality fill from pin (PIN stays manual)
              </p>
            </div>
          </div>
          <span className="rounded-md border border-blue-100 bg-blue-50 px-2 py-1 text-[8px] font-black uppercase tracking-wider text-blue-600">
            Mappls
          </span>
        </div>

        <div className="group relative h-[260px] overflow-hidden sm:h-[320px]">
          <MapplsPinMap
            coordinates={data.location?.coordinates}
            onPinChange={handlePinChange}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-4">
        <div className="mb-3 flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
            <Landmark className="h-3.5 w-3.5" />
          </div>
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-700">
              Nearby Landmarks
            </h3>
            <p className="mt-0.5 text-[10px] text-slate-400">
              Manual distance saved as typed (no auto KM)
            </p>
          </div>
        </div>

        <NearbyPlacesInput
          value={data.nearbyPlaces || []}
          onChange={handleNearbyChange}
          coordinates={pinnedCoordinates}
        />
      </div>

      <div className="flex justify-end border-t border-slate-200 pt-4">
        <button
          type="button"
          onClick={onSave}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#27AE60] px-5 text-[10px] font-black uppercase tracking-[0.14em] text-white shadow-[0_8px_22px_rgba(39,174,96,0.22)] transition hover:bg-[#219653] active:scale-[0.98] sm:w-auto"
        >
          <Save className="h-4 w-4" /> Synchronize Location
        </button>
      </div>
    </div>
  );
}
