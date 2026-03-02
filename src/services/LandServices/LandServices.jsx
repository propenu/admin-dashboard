// src/services/LandServices/LandServices.jsx
import authAxios from "../../config/authApi";
import { API_ENDPOINTS } from "../../config/api";
import { PROPERTY_VERIFICATION_API_ENDPOINTS } from "../../config/propertyVerificationApi";

/**
 * FETCH LAND PROPERTIES (GET)
 * Aligned with Infinite Scroll logic
 */
export const fetchLand = async ({ page = 1, limit = 20 }) => {
  try {
    const response = await authAxios.get(API_ENDPOINTS.LAND, {
      params: { page, limit },
    });
    return response.data; // Expecting { items: [], meta: { total, page, limit } }
  } catch (error) {
    console.error("Error fetching land properties:", error);
    throw error;
  }
};

/**
 * FETCH SINGLE LAND BY ID (GET)
 */
export const fetchLandById = async (id) => {
  try {
    const response = await authAxios.get(API_ENDPOINTS.LAND_DETAILS(id));
    return response.data;
  } catch (error) {
    console.error("Error fetching land details:", error);
    throw error;
  }
};

/**
 * DELETE LAND PROPERTY (DELETE)
 */
export const deleteLand = async (id) => {
  try {
    const response = await authAxios.delete(
      `${API_ENDPOINTS.LAND}/${id}`,
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting land property:", error);
    throw error;
  }
};

/**
 * UPDATE DOCUMENT STATUS (PATCH)
 */
export const updateLandDocumentStatus = async (id, payload) => {
  try {
    const response = await authAxios.patch(
      PROPERTY_VERIFICATION_API_ENDPOINTS.LAND_PROPERTY_VERIFICATION_DETAILS(
        id,
      ),
      payload,
    );
    return response.data;
  } catch (error) {
    console.error("Error updating land document status:", error);
    throw error;
  }
};
