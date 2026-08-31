// frontend/admin-dashboard/src/config/locationApi.js
const trimEnv = (value) => String(value || "").trim();

export const AUTH_API_BASE_URL =
  trimEnv(import.meta.env.VITE_API_BASE_URL_TWO) ||
  "http://localhost:4000/api/users";

export const LOCATION_API_ENDPOINTS = {
  ALL_LOCATIONS: `${AUTH_API_BASE_URL}/location`,
  SEARCHABLE_LOCATIONS: `${AUTH_API_BASE_URL}/location/searchable`,
  EDITLOCATION_BY_ID: (id) => `${AUTH_API_BASE_URL}/location/${id}`,
  DELETELOCATION_BY_ID: (id) => `${AUTH_API_BASE_URL}/location/${id}`,
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
