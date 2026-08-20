 

// pages/locations/utils/locationHelpers.js

/* =========================================
   BUILD PAYLOAD
========================================= */
export const buildPayload = (form, type = "LOCALITY") => {
  if (type === "STATE") {
    return {
      state: form.state.trim(),
    };
  }

  /* =========================================
     CITY
  ========================================= */
  if (type === "CITY") {
    return {
      state: form.state.trim(),
      city: form.city.trim(),
      category: form.category || "city",
      isHome: form.isHome === true,
    };
  }

  const localityName = String(form.localityName || "").trim();
  const originalLocalityName = String(form.originalLocalityName || "").trim();
  const base = {
    state: form.state.trim(),
    city: form.city.trim(),
    category: form.category || "city",
    isHome: form.isHome === true,
  };

  // Edit city/Home only — no locality block if name empty
  if (form._editWithoutLocality || !localityName) {
    return base;
  }

  return {
    ...base,
    ...(originalLocalityName
      ? { originalLocalityName }
      : {}),
    locality: {
      name: localityName,
      isHome: form.localityIsHome === true,
      location: {
        type: "Point",
        coordinates: [Number(form.lng) || 0, Number(form.lat) || 0],
      },
    },
  };
};

/* =========================================
   GROUP BY STATE
========================================= */
export const groupByState = (locations = []) =>
  locations.reduce((acc, loc) => {
    acc[loc.state] = acc[loc.state] || [];
    acc[loc.state].push(loc);
    return acc;
  }, {});

/** Normalized hierarchy key for listing-count maps (matches backend). */
export const listingCountKey = (...parts) =>
  parts
    .map((part) => String(part || "").trim().toLowerCase())
    .filter(Boolean)
    .join("|");

export const emptyListingCounts = () => ({
  projects: 0,
  properties: 0,
  total: 0,
});

/**
 * Exact unique lookup only — never aliases, fuzzy names, or cross-place mixing.
 * - 1 part  → state
 * - 2 parts → state|city
 * - 3 parts → state|city|locality
 */
export const getListingCounts = (maps, ...parts) => {
  if (!maps) return emptyListingCounts();

  let key = "";
  let bucket = null;

  if (parts.length === 1) {
    key = listingCountKey(parts[0]);
    bucket = maps.byState?.[key] || null;
  } else if (parts.length === 2) {
    key = listingCountKey(parts[0], parts[1]);
    bucket = maps.byCity?.[key] || null;
  } else if (parts.length >= 3) {
    key = listingCountKey(parts[0], parts[1], parts[2]);
    bucket = maps.byLocality?.[key] || null;
  }

  if (!bucket) return emptyListingCounts();
  return {
    projects: Number(bucket.projects) || 0,
    properties: Number(bucket.properties) || 0,
    total:
      Number(bucket.total) ||
      (Number(bucket.projects) || 0) + (Number(bucket.properties) || 0),
  };
};

export const listingCountsHaveData = (maps) => {
  if (!maps) return false;
  return (
    Object.keys(maps.byState || {}).length > 0 ||
    Object.keys(maps.byCity || {}).length > 0 ||
    Object.keys(maps.byLocality || {}).length > 0
  );
};
/* =========================================
   GET POPULAR CITIES
========================================= */
export const getPopularCities = (locations = []) => {
  return locations
    // ONLY POPULAR CATEGORY
    .filter((loc) => loc.category === "popular")

    // FORMAT
    .map((loc) => ({
      city: loc.city,
      state: loc.state,
      count: loc.localities?.length || 0,
    }))

    // SORT BY LOCALITY COUNT
    .sort((a, b) => b.count - a.count);
};