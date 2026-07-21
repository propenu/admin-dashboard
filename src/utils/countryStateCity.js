// src/utils/countryStateCity.js

import { State, City } from "country-state-city";

export const INDIAN_STATES = State.getStatesOfCountry("IN");

export const getCitiesByState = (stateName) => {
  const state = INDIAN_STATES.find(
    (s) => s.name === stateName || s.isoCode === stateName,
  );

  return state ? City.getCitiesOfState("IN", state.isoCode) : [];
};
