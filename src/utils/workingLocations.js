/** Frontend mirror of user-service workingLocations territory matching. */

export const normalizeLocPart = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

/** Common Indian state aliases so AP vs Andhra Pradesh still match. */
const STATE_ALIASES = {
  ap: "andhra pradesh",
  "andhra pradesh": "andhra pradesh",
  "andhra-pradesh": "andhra pradesh",
  tg: "telangana",
  ts: "telangana",
  telangana: "telangana",
};

export const normalizeState = (value) => {
  const raw = normalizeLocPart(value);
  if (!raw) return "";
  return STATE_ALIASES[raw] || raw;
};

export const cleanLocDisplay = (value) =>
  String(value || "")
    .trim()
    .replace(/\s+/g, " ");

export const formatTerritoryLabel = (row) => {
  const state = cleanLocDisplay(row?.state);
  const city = cleanLocDisplay(row?.city);
  const locality = cleanLocDisplay(row?.locality);
  if (!state) return "—";
  if (!city) return `${state} (entire state)`;
  if (!locality) return `${city}, ${state} (entire city)`;
  return `${locality}, ${city}, ${state}`;
};

export const territoryCovers = (territory, target) => {
  const tState = normalizeState(territory?.state);
  const aState = normalizeState(target?.state);
  if (!tState || !aState || tState !== aState) return false;

  const tCity = normalizeLocPart(territory?.city);
  if (!tCity) return true;

  const aCity = normalizeLocPart(target?.city);
  if (!aCity || tCity !== aCity) return false;

  const tLoc = normalizeLocPart(territory?.locality);
  if (!tLoc) return true;

  const aLoc = normalizeLocPart(target?.locality);
  return Boolean(aLoc && tLoc === aLoc);
};

export const anyTerritoryCovers = (territories, target) => {
  if (!Array.isArray(territories) || !territories.length) return false;
  return territories.some((row) => territoryCovers(row, target));
};

export const isCustomerCareExecutiveRole = (roleName = "") => {
  const key = String(roleName)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_");
  return (
    key === "customer_care" ||
    key === "customer_care_executive" ||
    key === "customer_care_executives" ||
    key.includes("customer_care")
  );
};

/** Hierarchy field roles that use workingLocations territories (CCE + BD/Sales). */
export const isTerritoryRole = (roleName = "") => {
  const key = String(roleName)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return (
    isCustomerCareExecutiveRole(key) ||
    key === "relationship_manager" ||
    key === "relationship_managers" ||
    key === "operations_head" ||
    key === "operation_head" ||
    key === "business_development_head" ||
    key === "regional_manager" ||
    key === "regional_managers" ||
    key === "business_development_manager" ||
    key === "sales_manager" ||
    key === "sales_managers" ||
    key === "sales_executive" ||
    key === "sales_executives" ||
    key === "sales_agent"
  );
};

export const locationFromUserLike = (user) => ({
  state: user?.state || user?.workState || user?.address?.state || "",
  city: user?.city || user?.workCity || user?.address?.city || "",
  locality:
    user?.locality ||
    user?.workLocality ||
    user?.area ||
    user?.address?.locality ||
    "",
});

export const sanitizeWorkingLocations = (rows) => {
  if (!Array.isArray(rows)) return [];
  const seen = new Set();
  const out = [];
  for (const row of rows) {
    const state = cleanLocDisplay(row?.state);
    if (!state) continue;
    const city = cleanLocDisplay(row?.city) || undefined;
    const locality = city ? cleanLocDisplay(row?.locality) || undefined : undefined;
    const key = `${normalizeState(state)}|${normalizeLocPart(city)}|${normalizeLocPart(locality)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      state,
      ...(city ? { city } : {}),
      ...(locality ? { locality } : {}),
    });
  }
  return out;
};
