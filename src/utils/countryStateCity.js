// src/utils/countryStateCity.js

import { State, City } from "country-state-city";

export const INDIAN_STATES = State.getStatesOfCountry("IN");

/** Sentinel value for "Other (custom city)" in selects */
export const CITY_OTHER = "__other__";

export const getCitiesByState = (stateName) => {
  const state = INDIAN_STATES.find(
    (s) => s.name === stateName || s.isoCode === stateName,
  );

  return state ? City.getCitiesOfState("IN", state.isoCode) : [];
};

export function normalizePlaceName(value = "") {
  return String(value).trim().toLowerCase();
}

/** Match a city name against package list (case-insensitive). Returns package spelling or "". */
export function findPackageCityName(packageCities = [], cityName = "") {
  const key = normalizePlaceName(cityName);
  if (!key) return "";
  const match = packageCities.find((c) => normalizePlaceName(c.name) === key);
  return match?.name || "";
}

/** Select value: package city name, CITY_OTHER if custom, or "". */
export function resolveCitySelectValue(packageCities = [], city = "") {
  const match = findPackageCityName(packageCities, city);
  if (match) return match;
  if (String(city || "").trim()) return CITY_OTHER;
  return "";
}

/**
 * State options: India list + inject current value as (custom) if not in list.
 */
export function buildStateOptions(states = [], currentState = "") {
  const list = Array.isArray(states) ? [...states] : [];
  const saved = String(currentState || "").trim();
  if (
    saved &&
    !list.some(
      (s) =>
        normalizePlaceName(s.name) === normalizePlaceName(saved) ||
        normalizePlaceName(s.isoCode) === normalizePlaceName(saved),
    )
  ) {
    list.unshift({
      isoCode: `custom-${saved}`,
      name: saved,
    });
  }
  return list;
}

/**
 * City options for Option C: package cities + optional injected custom (not when in Other mode).
 */
export function buildCityOptions(packageCities = [], city = "", citySelectValue = "") {
  const options = (packageCities || []).map((c) => ({
    name: c.name,
    label: c.name,
    custom: false,
  }));

  const saved = String(city || "").trim();
  if (
    saved &&
    citySelectValue !== CITY_OTHER &&
    !findPackageCityName(packageCities, saved)
  ) {
    options.unshift({
      name: saved,
      label: `${saved} (custom)`,
      custom: true,
    });
  }

  return options;
}

export function toTitleCase(val = "") {
  return String(val)
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
