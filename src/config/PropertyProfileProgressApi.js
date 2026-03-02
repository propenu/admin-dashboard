// frontend/admin-dashboard/src/config/PropertyProfileProgressApi.js

import { API_BASE_URL } from "./api";

export const PROPERTY_PROFILE_PROGRESS_API_ENDPOINTS = {
  GET_PROPERTY_PROFILE_PROGRESS_RESIDENTIAL: `${API_BASE_URL}/residential/draft/all`,
  GET_PROPERTY_PROFILE_PROGRESS_COMMERCIAL: `${API_BASE_URL}/commercial/draft/all`,
  GET_PROPERTY_PROFILE_PROGRESS_AGRICULTURAL: `${API_BASE_URL}/agricultural/draft/all`,
  GET_PROPERTY_PROFILE_PROGRESS_LAND: `${API_BASE_URL}/highlighted/draft/all`,
};
    