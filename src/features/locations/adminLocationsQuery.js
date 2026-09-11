import { fetchLocationsService } from "../../services/LocationsServices/LocationServices";

/** Shared React Query key — Locations page + Promote coverage */
export const ADMIN_LOCATIONS_QUERY_KEY = ["admin-locations"];

/**
 * Same payload as Locations sidebar/page (all saved cities, not home-only).
 * Requires auth so backend returns full manage list.
 */
export async function fetchAdminLocationsList() {
  const res = await fetchLocationsService();
  const body = res?.data && typeof res.data === "object" ? res.data : res;
  if (Array.isArray(body?.locations)) return body.locations;
  if (Array.isArray(body?.data?.locations)) return body.data.locations;
  if (Array.isArray(body)) return body;
  return [];
}

const normLoc = (v) =>
  String(v || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

/**
 * Hierarchy from Locations admin saved docs (exact names for promote + banners):
 * { [state]: { [city]: string[] localities } }
 */
export function buildHierarchyFromAdminLocations(locations = []) {
  const hierarchy = {};
  for (const loc of Array.isArray(locations) ? locations : []) {
    const state = String(loc?.state || "").trim();
    const city = String(loc?.city || "").trim();
    if (!state || !city) continue;
    if (!hierarchy[state]) hierarchy[state] = {};
    if (!hierarchy[state][city]) hierarchy[state][city] = [];

    const locs = Array.isArray(loc?.localities) ? loc.localities : [];
    for (const item of locs) {
      const name = String(item?.name || item || "").trim();
      if (!name) continue;
      if (!hierarchy[state][city].some((x) => normLoc(x) === normLoc(name))) {
        hierarchy[state][city].push(name);
      }
    }
  }

  const sorted = {};
  for (const state of Object.keys(hierarchy).sort((a, b) => a.localeCompare(b))) {
    sorted[state] = {};
    for (const city of Object.keys(hierarchy[state]).sort((a, b) =>
      a.localeCompare(b),
    )) {
      sorted[state][city] = [...hierarchy[state][city]].sort((a, b) =>
        a.localeCompare(b),
      );
    }
  }
  return sorted;
}

/** Call after create / edit / delete so Promote picks up changes immediately. */
export function invalidateAdminLocations(queryClient) {
  if (!queryClient) return;
  queryClient.invalidateQueries({ queryKey: ADMIN_LOCATIONS_QUERY_KEY });
  queryClient.invalidateQueries({ queryKey: ["location-listing-counts"] });
}
