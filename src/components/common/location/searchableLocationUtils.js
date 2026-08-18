// src/components/common/location/searchableLocationUtils.js
import { City, State } from "country-state-city";

export const CITY_OTHER = "__other__";
export const INDIA_BBOX = "68.1766451354,7.96553477623,97.4025614766,35.4940095078";

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

export function getStateSuggestions(query) {
  return State.getStatesOfCountry("IN")
    .map((state) => ({ label: state.name, isoCode: state.isoCode }))
    .filter((state) =>
      query?.trim() ? matchesSearchPrefix(state.label, query) : true,
    );
}

export function getCitySuggestions(stateName, query, { includeOther = true } = {}) {
  if (!stateName) return [];
  const selectedState = State.getStatesOfCountry("IN").find(
    (state) =>
      normalizeComparisonValue(state.name) ===
      normalizeComparisonValue(stateName),
  );
  if (!selectedState) {
    return includeOther
      ? [{ label: "Other (custom city)", value: CITY_OTHER, isOther: true }]
      : [];
  }

  const cities = City.getCitiesOfState("IN", selectedState.isoCode)
    .map((city) => ({
      label: city.name,
      value: city.name,
      state: selectedState.name,
      stateCode: selectedState.isoCode,
    }))
    .filter((city) =>
      query?.trim() ? matchesSearchPrefix(city.label, query) : true,
    );

  if (includeOther) {
    cities.push({
      label: "Other (custom city)",
      value: CITY_OTHER,
      isOther: true,
    });
  }
  return cities;
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
