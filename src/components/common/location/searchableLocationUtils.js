// src/components/common/location/searchableLocationUtils.js
import { City, State } from "country-state-city";

export const CITY_OTHER = "__other__";
export const INDIA_BBOX = "68.1766451354,7.96553477623,97.4025614766,35.4940095078";

/** Who may add a brand-new city / locality (typed "Other" / custom). */
export const CUSTOM_LOCATION_ROLES = new Set([
  "super_admin",
  "business_development_head",
  "operations_head",
  "operation_head",
  "customer_support_head",
  "sales_executive",
  "sales_executives",
  "sales_agent",
]);

/** Category / property-type edit on featured projects — keep Super Admin & BDH only. */
export const CATEGORY_EDIT_ROLES = new Set([
  "super_admin",
  "business_development_head",
]);

export function normalizeRoleName(role) {
  return String(role || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function canAddCustomLocation(role) {
  return CUSTOM_LOCATION_ROLES.has(normalizeRoleName(role));
}

export function canEditFeaturedCategory(role) {
  return CATEGORY_EDIT_ROLES.has(normalizeRoleName(role));
}

export const titleCase = (str) => {
  if (!str) return "";
  return String(str)
    .toLowerCase()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

export const stripWard = (s) =>
  s ? String(s).replace(/^ward\s*\d+[a-z]?\s+/i, "").trim() : "";

export const normalizeComparisonValue = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

export const matchesSearchPrefix = (label, query) => {
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

/** Broader match for city/locality search (prefix OR contains) */
export const matchesSearchText = (label, query) => {
  const normalizedLabel = normalizeComparisonValue(label);
  const normalizedQuery = normalizeComparisonValue(query);
  if (!normalizedLabel || !normalizedQuery) return false;
  if (normalizedLabel.includes(normalizedQuery)) return true;
  return matchesSearchPrefix(label, query);
};

export function getStateSuggestions(query) {
  return State.getStatesOfCountry("IN")
    .map((state) => ({ label: state.name, isoCode: state.isoCode }))
    .filter((state) =>
      query?.trim() ? matchesSearchPrefix(state.label, query) : true,
    );
}

export function getCitySuggestions(
  stateName,
  query,
  { includeOther = true, savedCities = [] } = {},
) {
  if (!stateName) return [];
  const selectedState = State.getStatesOfCountry("IN").find(
    (state) =>
      normalizeComparisonValue(state.name) ===
      normalizeComparisonValue(stateName),
  );

  const cities = [];
  const seen = new Set();

  const pushCity = (entry) => {
    const key = normalizeComparisonValue(entry.label);
    if (!key || seen.has(key)) return;
    if (query?.trim() && !matchesSearchText(entry.label, query)) return;
    seen.add(key);
    cities.push(entry);
  };

  if (selectedState) {
    City.getCitiesOfState("IN", selectedState.isoCode).forEach((city) => {
      pushCity({
        label: city.name,
        value: city.name,
        state: selectedState.name,
        stateCode: selectedState.isoCode,
        isSaved: false,
      });
    });
  }

  // Previously saved custom / Location DB cities for this state
  (Array.isArray(savedCities) ? savedCities : []).forEach((name) => {
    const cityName = titleCase(String(name || "").trim());
    if (!cityName) return;
    pushCity({
      label: cityName,
      value: cityName,
      state: stateName,
      isSaved: true,
      isCustom: true,
    });
  });

  if (includeOther) {
    const otherLabel = "Other (custom city)";
    const q = String(query || "").trim();
    // Keep Other always when not searching; when searching, only if it matches or no cities found
    if (!q || matchesSearchText(otherLabel, q) || cities.length === 0) {
      cities.push({
        label: otherLabel,
        value: CITY_OTHER,
        isOther: true,
      });
    }
  }
  return cities;
}

/** Normalize Location API / featured options → flat location-like docs */
export function unwrapLocationList(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.locations)) return payload.locations;
  if (Array.isArray(payload?.data?.locations)) return payload.data.locations;
  if (Array.isArray(payload?.data?.cities)) {
    // Featured location-options shape
    return payload.data.cities.map((c) => ({
      city: c.city,
      state: c.state,
      localities: [],
    }));
  }
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.cities)) {
    return payload.cities.map((c) => ({
      city: c.city,
      state: c.state,
      localities: [],
    }));
  }
  return [];
}

/**
 * Convert featured location-options payload into location-like docs
 * with localities nested under cities.
 */
export function locationsFromFeaturedOptions(payload) {
  const root = payload?.data || payload || {};
  const cities = Array.isArray(root.cities) ? root.cities : [];
  const localities = Array.isArray(root.localities) ? root.localities : [];

  const byKey = new Map();
  for (const c of cities) {
    const city = titleCase(String(c?.city || "").trim());
    if (!city) continue;
    const state = String(c?.state || "").trim();
    const key = `${normalizeComparisonValue(city)}|${normalizeComparisonValue(state)}`;
    byKey.set(key, { city, state, localities: [] });
  }
  for (const loc of localities) {
    const city = titleCase(String(loc?.city || "").trim());
    const name = titleCase(String(loc?.name || "").trim());
    if (!city || !name) continue;
    const state = String(loc?.state || "").trim();
    const key = `${normalizeComparisonValue(city)}|${normalizeComparisonValue(state)}`;
    const entry = byKey.get(key) || { city, state, localities: [] };
    if (
      !entry.localities.some(
        (l) =>
          normalizeComparisonValue(l.name) === normalizeComparisonValue(name),
      )
    ) {
      entry.localities.push({ name });
    }
    byKey.set(key, entry);
  }
  return Array.from(byKey.values());
}

/**
 * Merge Location docs + featured project cities into one list of { city, state, localities }.
 */
export function mergeSavedLocationSources(...sources) {
  const byKey = new Map();
  for (const list of sources) {
    for (const loc of Array.isArray(list) ? list : []) {
      const city = titleCase(String(loc?.city || "").trim());
      if (!city) continue;
      const state = String(loc?.state || "").trim();
      const key = `${normalizeComparisonValue(city)}|${normalizeComparisonValue(state)}`;
      const existing = byKey.get(key) || {
        city,
        state,
        localities: [],
      };
      const locNames = Array.isArray(loc?.localities) ? loc.localities : [];
      for (const item of locNames) {
        const name = titleCase(String(item?.name || item || "").trim());
        if (!name) continue;
        if (
          !existing.localities.some(
            (l) =>
              normalizeComparisonValue(l.name) ===
              normalizeComparisonValue(name),
          )
        ) {
          existing.localities.push({ name });
        }
      }
      byKey.set(key, existing);
    }
  }
  return Array.from(byKey.values());
}

/** Distinct city names saved for a state (also includes blank-state rows) */
export function getSavedCityNamesForState(locations, stateName) {
  if (!stateName || !Array.isArray(locations)) return [];
  const seen = new Set();
  const out = [];
  for (const loc of locations) {
    const locState = String(loc?.state || "").trim();
    const stateOk =
      !locState ||
      normalizeComparisonValue(locState) ===
        normalizeComparisonValue(stateName);
    if (!stateOk) continue;
    const city = titleCase(String(loc?.city || "").trim());
    const key = normalizeComparisonValue(city);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(city);
  }
  return out;
}

/** Saved localities for city (+ optional state) from merged location docs */
export function getSavedLocalitySuggestions(
  locations,
  stateName,
  cityName,
  query = "",
) {
  if (!cityName || !Array.isArray(locations)) return [];
  const q = String(query || "").trim();
  const seen = new Set();
  const out = [];

  for (const loc of locations) {
    if (
      normalizeComparisonValue(loc?.city) !==
      normalizeComparisonValue(cityName)
    ) {
      continue;
    }
    const locState = String(loc?.state || "").trim();
    if (
      stateName &&
      locState &&
      normalizeComparisonValue(locState) !==
        normalizeComparisonValue(stateName)
    ) {
      continue;
    }
    const list = Array.isArray(loc?.localities) ? loc.localities : [];
    for (const item of list) {
      const name = titleCase(String(item?.name || item || "").trim());
      const key = normalizeComparisonValue(name);
      if (!key || seen.has(key)) continue;
      if (q && !matchesSearchText(name, q)) continue;
      seen.add(key);
      out.push({
        label: name,
        city: titleCase(String(cityName).trim()),
        state: String(stateName || locState || "").trim(),
        isSaved: true,
      });
    }
  }
  return out;
}

/** True if city is in package list or saved Location cities for that state */
export function isKnownCityName(stateName, cityName, savedCities = []) {
  const city = String(cityName || "").trim();
  if (!stateName || !city) return false;
  return getCitySuggestions(stateName, "", {
    includeOther: false,
    savedCities,
  }).some(
    (c) =>
      normalizeComparisonValue(c.label) === normalizeComparisonValue(city),
  );
}

export async function searchLocalitiesWithPhoton(
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
      if (
        wardPattern.test(rawSource) ||
        wardPattern.test(p.name || "") ||
        wardPattern.test(p.suburb || "") ||
        wardPattern.test(p.locality || "")
      ) {
        continue;
      }

      const localityName = titleCase(stripWard(rawSource));
      if (!localityName || wardPattern.test(localityName)) continue;

      const rawCity = titleCase(stripWard(p.city || p.district || ""));
      const city = wardPattern.test(rawCity) ? "" : rawCity;
      const state = titleCase(p.state || "");

      if (searchText && !matchesSearchText(localityName, searchText)) continue;
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

      suggestions.push({
        label: localityName,
        city,
        state,
        coordinates: coords,
      });
    }
    return suggestions;
  } catch (err) {
    if (err?.name !== "AbortError") console.error("Photon locality search:", err);
    return [];
  }
}
