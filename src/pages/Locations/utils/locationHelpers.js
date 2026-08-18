 

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

export const getListingCounts = (maps, ...parts) => {
  const key = listingCountKey(...parts);
  if (!key || !maps) return emptyListingCounts();
  const bucket =
    (parts.length === 1 && maps.byState?.[key]) ||
    (parts.length === 2 && maps.byCity?.[key]) ||
    (parts.length >= 3 && maps.byLocality?.[key]) ||
    null;
  if (!bucket) return emptyListingCounts();
  return {
    projects: Number(bucket.projects) || 0,
    properties: Number(bucket.properties) || 0,
    total: Number(bucket.total) || 0,
  };
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