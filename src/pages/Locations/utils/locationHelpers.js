// pages/locations/utils/locationHelpers.js
export const buildPayload = (form, type = "LOCALITY") => {
  if (type === "STATE") {
    return { state: form.state.trim() };
  }

  if (type === "CITY") {
    return {
      state: form.state.trim(),
      city: form.city.trim(),
      category: "city",
    };
  }

  return {
    state: form.state.trim(),
    city: form.city.trim(),
    category: "city",
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

export const groupByState = (locations = []) =>
  locations.reduce((acc, loc) => {
    acc[loc.state] = acc[loc.state] || [];
    acc[loc.state].push(loc);
    return acc;
  }, {});



export const getPopularCities = (locations = [], limit = 5) => {
  return locations
    .map((loc) => ({
      city: loc.city,
      state: loc.state,
      count: loc.localities?.length || 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
};
