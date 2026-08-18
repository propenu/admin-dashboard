 

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