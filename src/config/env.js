//src/config/env.js
const trimEnv = (value) => String(value || "").trim();

/** Prefer Vite env; fall back to local gateway so axios never gets an empty baseURL. */
const API_BASE_URL =
  trimEnv(import.meta.env.VITE_PROPERIES_API_BASE_URL) ||
  "http://localhost:4000";

const stripTrailingSlash = (value) => String(value || "").replace(/\/+$/, "");

const isLocalHost = (hostname) => {
  const host = String(hostname || "")
    .trim()
    .toLowerCase();
  if (!host) return false;
  return (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "::1" ||
    host.endsWith(".local") ||
    /^192\.168\.\d+\.\d+$/.test(host) ||
    /^10\.\d+\.\d+\.\d+$/.test(host) ||
    /^172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+$/.test(host)
  );
};

/**
 * Web app origin for SuperAdmin read-only view-as.
 * - Local/LAN admin → localhost web (never propenu.com)
 * - Production admin → propenu.com (never localhost, even if env is wrong)
 */
export function resolveWebAppUrl() {
  const configured = stripTrailingSlash(trimEnv(import.meta.env.VITE_WEB_APP_URL));
  const browserHost =
    typeof window !== "undefined" ? window.location.hostname : "";
  const browserIsLocal = Boolean(browserHost && isLocalHost(browserHost));

  let configuredIsLocal = false;
  if (configured) {
    try {
      configuredIsLocal = isLocalHost(new URL(configured).hostname);
    } catch {
      /* ignore invalid env URL */
    }
  }

  if (browserIsLocal) {
    if (configured && configuredIsLocal) return configured;
    return "http://localhost:3000";
  }

  // Public / production admin host — never open localhost
  if (configured && !configuredIsLocal) return configured;
  return "https://propenu.com";
}

/** Build-time / static fallback (prefer resolveWebAppUrl() at click time). */
const WEB_APP_URL = stripTrailingSlash(
  trimEnv(import.meta.env.VITE_WEB_APP_URL) || "http://localhost:3000",
);

export const ENV = {
  API_BASE_URL,
  WEB_APP_URL,
  MAPPLS_API_KEY: trimEnv(import.meta.env.VITE_MAPPLS_MAP_SDK_KEY),
};
