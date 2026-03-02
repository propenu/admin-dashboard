// src/services/CommercialServices/CommercialServices.jsx
import authAxios from "../../config/authApi";
import { API_ENDPOINTS } from "../../config/api";
import { PROPERTY_VERIFICATION_API_ENDPOINTS } from "../../config/propertyVerificationApi";

/**
 * FETCH COMMERCIAL PROPERTIES (GET)
 * Aligned with Infinite Scroll logic
 */
export const fetchCommercial = async ({ page = 1, limit = 20 }) => {
  try {
    const response = await authAxios.get(API_ENDPOINTS.COMMERCIAL, {
      params: { page, limit },
    });
    return response.data; // Expecting { items: [], meta: { total, page, limit } }
  } catch (error) {
    console.error("Error fetching commercial properties:", error);
    throw error;
  }
};

/**
 * FETCH SINGLE COMMERCIAL BY ID (GET)
 */
export const fetchCommercialById = async (id) => {
  try {
    const response = await authAxios.get(API_ENDPOINTS.COMMERCIAL_DETAILS(id));
    return response.data;
  } catch (error) {
    console.error("Error fetching commercial details:", error);
    throw error;
  }
};

/**
 * DELETE COMMERCIAL PROPERTY (DELETE)
 */
export const deleteCommercial = async (id) => {
  try {
    const response = await authAxios.delete(
      `${API_ENDPOINTS.COMMERCIAL}/${id}`,
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting commercial property:", error);
    throw error;
  }
};

/**
 * UPDATE DOCUMENT STATUS (PATCH)
 */
export const updateCommercialDocumentStatus = async (id, payload) => {
  try {
    const response = await authAxios.patch(
      PROPERTY_VERIFICATION_API_ENDPOINTS.COMMERCIAL_PROPERTY_VERIFICATION_DETAILS(
        id,
      ),
      payload,
    );
    return response.data;
  } catch (error) {
    console.error("Error updating commercial document status:", error);
    throw error;
  }
};
