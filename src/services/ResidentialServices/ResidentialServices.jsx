// src/services/ResidentialServices/ResidentialServices.jsx
import authAxios from "../../config/authApi";
import { API_ENDPOINTS } from "../../config/api";
import { PROPERTY_VERIFICATION_API_ENDPOINTS } from "../../config/propertyVerificationApi";

/**
 * CREATE COMMERCIAL PROPERTY (POST)
 */
export const createResidential = async (data) => {
  try {
    const response = await authAxios.post(API_ENDPOINTS.RESIDENTIAL, data);
    return response.data;
  } catch (error) {
    console.error("Error creating residential property:", error);
    throw error;
  }
};

/**
 * FETCH COMMERCIAL PROPERTIES (GET)
 * Aligned with Infinite Scroll logic
 */
export const fetchResidential = async ({ page = 1, limit = 20 }) => {
  try {
    const response = await authAxios.get(API_ENDPOINTS.RESIDENTIAL, {
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
export const fetchResidentialById = async (id) => {
  try {
    const response = await authAxios.get(API_ENDPOINTS.RESIDENTIAL_DETAILS(id));
    return response.data;
  } catch (error) {
    console.error("Error fetching residential details:", error);
    throw error;
  }
};

/**
 * UPDATE COMMERCIAL PROPERTY (PATCH)
 */
/**
 * UPDATE RESIDENTIAL PROPERTY (PATCH - multipart/form-data)
 */
export const editResidential = async (id, data) => {
  try {
    let payload = data;

    // ✅ If data is not FormData, convert it
    if (!(data instanceof FormData)) {
      payload = new FormData();

      Object.entries(data || {}).forEach(([key, value]) => {
        if (value === undefined || value === null) return;

        // 🔹 Arrays / Objects → JSON
        if (typeof value === "object" && !(value instanceof File)) {
          payload.append(key, JSON.stringify(value));
        } 
        // 🔹 Files
        else if (value instanceof File) {
          payload.append(key, value);
        } 
        // 🔹 Primitive values
        else {
          payload.append(key, value);
        }
      });
    }

    const response = await authAxios.patch(
      `${API_ENDPOINTS.RESIDENTIAL}/${id}`,
      payload,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error editing residential property:", error);
    throw error;
  }
};


/**
 * DELETE COMMERCIAL PROPERTY (DELETE)
 */
export const deleteResidential = async (id) => {
  try {
    const response = await authAxios.delete(
      `${API_ENDPOINTS.RESIDENTIAL}/${id}`,
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting residential property:", error);
    throw error;
  }
};

/**
 * UPDATE DOCUMENT STATUS (PATCH)
 */
export const updateResidentialDocumentStatus = async (id, payload) => {
  try {
    const response = await authAxios.patch(
      PROPERTY_VERIFICATION_API_ENDPOINTS.RESIDENTIAL_PROPERTY_VERIFICATION_DETAILS(
        id,
      ),
      payload,
    );
    return response.data;
  } catch (error) {
    console.error("Error updating residential document status:", error);
    throw error;
  }
};

