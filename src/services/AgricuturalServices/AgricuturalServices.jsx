// src/services/AgricuturalServices/AgricuturalServices.jsx
import authAxios from "../../config/authApi";
import { API_ENDPOINTS } from "../../config/api";
import { PROPERTY_VERIFICATION_API_ENDPOINTS } from "../../config/propertyVerificationApi";

/**
 * FETCH AGRICULTURAL PROPERTIES (GET)
 * Aligned with Infinite Scroll logic
 */
export const fetchAgricultural = async ({ page = 1, limit = 20 }) => {
  try {
    const response = await authAxios.get(API_ENDPOINTS.AGRICULTURAL, {
      params: { page, limit },
    });
    return response.data; // Expecting { items: [], meta: { total, page, limit } }
  } catch (error) {
    console.error("Error fetching agricultural properties:", error);
    throw error;
  }
};

/**
 * FETCH SINGLE AGRICULTURAL BY ID (GET)
 */
export const fetchAgriculturalById = async (id) => {
  try {
    const response = await authAxios.get(API_ENDPOINTS.AGRICULTURAL_DETAILS(id));
    return response.data;
  } catch (error) {
    console.error("Error fetching agricultural details:", error);
    throw error;
  }
};

/**
 * DELETE AGRICULTURAL PROPERTY (DELETE)
 */
export const deleteAgricultural = async (id) => {
  try {
    const response = await authAxios.delete(
      `${API_ENDPOINTS.AGRICULTURAL}/${id}`,
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting agricultural property:", error);
    throw error;
  }
};

/**
 * UPDATE DOCUMENT STATUS (PATCH)
 */
export const updateAgriculturalDocumentStatus = async (id, payload) => {
  try {
    const response = await authAxios.patch(
      PROPERTY_VERIFICATION_API_ENDPOINTS.AGRICULTURAL_PROPERTY_VERIFICATION_DETAILS(
        id,
      ),
      payload,
    );
    return response.data;
  } catch (error) {
    console.error("Error updating agricultural document status:", error);
    throw error;
  }
};
