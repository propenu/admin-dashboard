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

/** Call after create / edit / delete so Promote picks up changes immediately. */
export function invalidateAdminLocations(queryClient) {
  if (!queryClient) return;
  queryClient.invalidateQueries({ queryKey: ADMIN_LOCATIONS_QUERY_KEY });
  queryClient.invalidateQueries({ queryKey: ["location-listing-counts"] });
}
