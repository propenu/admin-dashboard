/**
 * Build / normalize promotion.sponsoredAd nested coverage:
 * { [state]: { [city]: string[] localities } }
 */

export function emptySponsoredAd() {
  return {};
}

/** Deep-clone a sponsoredAd map safely. */
export function cloneSponsoredAd(src = {}) {
  const out = {};
  if (!src || typeof src !== "object" || Array.isArray(src)) return out;
  for (const [state, cities] of Object.entries(src)) {
    if (!state || !cities || typeof cities !== "object" || Array.isArray(cities)) continue;
    out[state] = {};
    for (const [city, locs] of Object.entries(cities)) {
      if (!city) continue;
      out[state][city] = Array.isArray(locs)
        ? [...new Set(locs.map((l) => String(l || "").trim()).filter(Boolean))]
        : [];
    }
  }
  return out;
}

/**
 * Build sponsoredAd from UI selection maps.
 * @param {string[]} selectedStates
 * @param {Record<string, string[]>} selectedCitiesByState - state -> checked cities
 * @param {Record<string, Record<string, string[]>>} selectedLocalitiesByCity - state -> city -> checked localities
 */
export function buildSponsoredAdFromSelection(
  selectedStates = [],
  selectedCitiesByState = {},
  selectedLocalitiesByCity = {},
) {
  const out = {};
  for (const state of selectedStates) {
    const st = String(state || "").trim();
    if (!st) continue;
    const cities = selectedCitiesByState[st] || [];
    if (!cities.length) continue;
    out[st] = {};
    for (const city of cities) {
      const c = String(city || "").trim();
      if (!c) continue;
      const locs = selectedLocalitiesByCity?.[st]?.[c] || [];
      out[st][c] = [...new Set(locs.map((l) => String(l || "").trim()).filter(Boolean))];
    }
  }
  return out;
}

export function countSponsoredAdCoverage(sponsoredAd = {}) {
  let states = 0;
  let cities = 0;
  let localities = 0;
  for (const cityMap of Object.values(sponsoredAd || {})) {
    if (!cityMap || typeof cityMap !== "object") continue;
    states += 1;
    for (const locs of Object.values(cityMap)) {
      cities += 1;
      localities += Array.isArray(locs) ? locs.length : 0;
    }
  }
  return { states, cities, localities };
}

export function isCoverageEmpty(map) {
  return !map || typeof map !== "object" || Object.keys(map).length === 0;
}

/** Human label: "Hyderabad (Gachibowli, Kondapur), Warangal (whole city) +2 more". */
export function describeCoverage(map = {}, maxCities = 2) {
  const parts = [];
  for (const cityMap of Object.values(map || {})) {
    if (!cityMap || typeof cityMap !== "object") continue;
    for (const [city, locs] of Object.entries(cityMap)) {
      const list = Array.isArray(locs) ? locs : [];
      if (!list.length) parts.push(`${city} (whole city)`);
      else if (list.length <= 2) parts.push(`${city} (${list.join(", ")})`);
      else parts.push(`${city} (${list.length} localities)`);
    }
  }
  if (!parts.length) return "";
  const shown = parts.slice(0, maxCities).join(", ");
  return parts.length > maxCities ? `${shown} +${parts.length - maxCities} more` : shown;
}

export function summarizeSponsoredAd(sponsoredAd = {}) {
  const { states, cities, localities } = countSponsoredAdCoverage(sponsoredAd);
  if (!states) return "No locations selected (all India if left empty)";
  return `${states} state(s) · ${cities} city(ies) · ${localities} localit${localities === 1 ? "y" : "ies"}`;
}
