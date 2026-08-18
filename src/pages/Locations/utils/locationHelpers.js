 

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
  if (!maps) return emptyListingCounts();

  const key = listingCountKey(...parts);
  if (!key) return emptyListingCounts();

  let bucket = null;
  if (parts.length === 1) {
    bucket = maps.byState?.[key];
  } else if (parts.length === 2) {
    bucket = maps.byCity?.[key] || maps.byCity?.[listingCountKey(parts[1])];
  } else {
    bucket =
      maps.byLocality?.[key] ||
      maps.byLocality?.[listingCountKey(parts[2])] ||
      maps.byLocality?.[listingCountKey(parts[1], parts[2])];
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

/**
 * Build the same maps from existing /analytics/project + /analytics/properties
 * (stateWise / cityWise / localityWise) — used when dedicated endpoint is empty/unavailable.
 */
export const mergeAnalyticsIntoListingCounts = (
  projectAnalytics,
  propertyAnalytics,
) => {
  const byState = {};
  const byCity = {};
  const byLocality = {};

  const applyRows = (rows, kind, target, mode) => {
    for (const row of rows || []) {
      const total = Number(row?.total) || 0;
      if (!total) continue;
      const rawId = row?._id;
      let key = "";
      if (mode === "state") {
        key = listingCountKey(rawId);
      } else if (mode === "city") {
        if (rawId && typeof rawId === "object") {
          key = listingCountKey(rawId.state, rawId.city) || listingCountKey(rawId.city);
        } else {
          key = listingCountKey(rawId);
        }
      } else {
        if (rawId && typeof rawId === "object") {
          key =
            listingCountKey(rawId.state, rawId.city, rawId.locality) ||
            listingCountKey(rawId.locality);
        } else {
          key = listingCountKey(rawId);
        }
      }
      if (!key) continue;
      const bucket = target[key] || emptyListingCounts();
      bucket[kind] += total;
      bucket.total = bucket.projects + bucket.properties;
      target[key] = bucket;
    }
  };

  applyRows(projectAnalytics?.stateWise, "projects", byState, "state");
  applyRows(propertyAnalytics?.stateWise, "properties", byState, "state");
  applyRows(projectAnalytics?.cityWise, "projects", byCity, "city");
  applyRows(propertyAnalytics?.cityWise, "properties", byCity, "city");
  applyRows(projectAnalytics?.localityWise, "projects", byLocality, "locality");
  applyRows(propertyAnalytics?.localityWise, "properties", byLocality, "locality");

  return { byState, byCity, byLocality };
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