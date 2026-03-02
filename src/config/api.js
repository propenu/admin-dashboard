// src/config/api.js
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
export const API_ENDPOINTS = {
  // FEATURED PROPERTIES
  FEATURED_PROPERTIES: `${API_BASE_URL}/featured-project`,
  ALL_PROPERTIES: `${API_BASE_URL}/featured-project`,
  PROPERTY_DETAILS: (id) => `${API_BASE_URL}/featured-project/${id}`,

  // Hightlighted Properties
  HIGHLIGHTED_PROPERTIES: `${API_BASE_URL}/highlight-projects`,
  Highlighted_Properties_Details: (id) => `${API_BASE_URL}/highlight-projects/${id}`,

  // Owner Properties Details
  Owner_Properties: `${API_BASE_URL}/owners-properties`,
  Owner_Properties_Details: (id) => `${API_BASE_URL}/owners-properties/${id}`,

  // TOP PROJECT
  Top_Project: `${API_BASE_URL}/top-project`,
  Top_Project_Details: (id) => `${API_BASE_URL}/top-project/${id}`,

  //Agricultural
  AGRICULTURAL: `${API_BASE_URL}/agricultural`,
  AGRICULTURAL_DETAILS: (id) => `${API_BASE_URL}/agricultural/${id}`,

  //Commercial
  COMMERCIAL: `${API_BASE_URL}/commercial`,
  COMMERCIAL_DETAILS: (id) => `${API_BASE_URL}/commercial/${id}`,

  //Land
  LAND: `${API_BASE_URL}/land`,
  LAND_DETAILS: (id) => `${API_BASE_URL}/land/${id}`,

  //Residential
  RESIDENTIAL: `${API_BASE_URL}/residential`,
  RESIDENTIAL_DETAILS: (id) => `${API_BASE_URL}/residential/${id}`,

  // Stats
  DASHBOARD_STATS: `${API_BASE_URL}/dashboard/stats`,
};

export const API_CONFIG = {
  TIMEOUT: 30000,
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
}
