 

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

      // IMPORTANT
      category: form.category || "city",
    };
  }

  /* =========================================
     LOCALITY
  ========================================= */
  return {
    state: form.state.trim(),
    city: form.city.trim(),

    // IMPORTANT
    category: form.category || "city",

    locality: {
      name: form.localityName.trim(),

      location: {
        type: "Point",

        coordinates: [
          Number(form.lng) || 0,
          Number(form.lat) || 0,
        ],
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