//src/config/env.js
const trimEnv = (value) => String(value || "").trim();

/** Prefer Vite env; fall back to local gateway so axios never gets an empty baseURL. */
const API_BASE_URL =
  trimEnv(import.meta.env.VITE_PROPERIES_API_BASE_URL) ||
  "http://localhost:4000";

export const ENV = {
  API_BASE_URL,
  MAPPLS_API_KEY: trimEnv(import.meta.env.VITE_MAPPLS_MAP_SDK_KEY),
};
