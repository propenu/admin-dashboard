/**
 * Manual nearby place names: one per line.
 * Full line is kept as the place name (including any "— 6.8 km" text).
 * Distance is not stored as a separate field.
 */

/**
 * Split pasted/typed text into unique place names (full line kept as-is).
 * @returns {string[]}
 */
export function parseManualNearbyPlaceNames(text = "") {
  const lines = String(text || "")
    .split(/\r?\n/)
    .map((line) => line.replace(/\s{2,}/g, " ").trim())
    .filter(Boolean);

  const seen = new Set();
  const names = [];
  for (const name of lines) {
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    names.push(name);
  }
  return names;
}
