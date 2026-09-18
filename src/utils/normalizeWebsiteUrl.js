/**
 * Normalize loose website inputs into an absolute http(s) URL.
 * Accepts typos like "https.propenu.com", bare domains "propenu.com", etc.
 * Returns "" for empty input.
 */
export function normalizeWebsiteUrl(raw) {
  if (raw == null) return "";
  let s = String(raw).trim();
  if (!s) return "";

  // https.propenu.com / http.example.com → https://propenu.com
  const dottedProto = s.match(
    /^(https?)\.([a-z0-9.-]+\.[a-z]{2,}(?:[/:?#].*)?)$/i,
  );
  if (dottedProto) {
    s = `${dottedProto[1].toLowerCase()}://${dottedProto[2]}`;
  }

  // https:/example.com → https://example.com
  s = s.replace(/^(https?):\/(?!\/)/i, "$1://");

  // Bare domain / path without scheme
  if (!/^[a-z][a-z0-9+.-]*:/i.test(s)) {
    s = `https://${s.replace(/^\/+/, "")}`;
  }

  // Collapse accidental https:///
  s = s.replace(/^(https?:)\/{3,}/i, "$1//");

  try {
    const url = new URL(s);
    if (!url.hostname) return "";
    return url.href;
  } catch {
    return "";
  }
}

export function isValidWebsiteUrl(raw) {
  if (raw == null || String(raw).trim() === "") return true;
  return Boolean(normalizeWebsiteUrl(raw));
}
