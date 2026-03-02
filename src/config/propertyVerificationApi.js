// frontend/admin-dashboard/src/config/propertyVerificationApi.js
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const PROPERTY_VERIFICATION_API_ENDPOINTS = {
  // RESIDENTIAL
  RESIDENTIAL_PROPERTY_VERIFICATION_DETAILS: (id) =>
    `${API_BASE_URL}/residential/${id}/verify-document`,

  // COMMERCIAL
  COMMERCIAL_PROPERTY_VERIFICATION_DETAILS: (id) =>
    `${API_BASE_URL}/commercial/${id}/verify-document`,

  // AGRICULTURAL
  AGRICULTURAL_PROPERTY_VERIFICATION_DETAILS: (id) =>
    `${API_BASE_URL}/agricultural/${id}/verify-document`,

  // LAND
  LAND_PROPERTY_VERIFICATION_DETAILS: (id) =>
    `${API_BASE_URL}/land/${id}/verify-document`,
};





