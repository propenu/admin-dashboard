// frontend/admin-dashboard/src/config/locationApi.js
export const AUTH_API_BASE_URL = import.meta.env.VITE_API_BASE_URL_TWO;

export const LOCATION_API_ENDPOINTS = {
  //Locations
  ALL_LOCATIONS: `${AUTH_API_BASE_URL}/location`, //Locations
  EDITLOCATION_BY_ID: (id) => `${AUTH_API_BASE_URL}/location/${id}`,
  //Delete cities
  DELETELOCATION_BY_ID: (id) => `${AUTH_API_BASE_URL}/location/${id}`,
  //Delete Localities
  DELETELOCALITY_BY_ID: (locationId, localityName) =>
    `${AUTH_API_BASE_URL}/location/${locationId}/locality/${encodeURIComponent(
      localityName,
    )}`,
};

export const LOCATION_API_CONFIG = {
  TIMEOUT: 30000,
  HEADERS: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
};
