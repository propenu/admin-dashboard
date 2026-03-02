import commercialPropertyAxios from "../../config/ResidentailPropertyAxios";
import { API_ENDPOINTS } from "../../config/api";

/**
 * Sends commercial property data to the server.
 * @param {FormData} formData - The prepared FormData from commercialThunks.js
 */
export const postCommercial = async (formData) => {
  try {
    const res = await commercialPropertyAxios.post(
      API_ENDPOINTS.COMMERCIAL, // 🟢 Ensure this points to /api/properties/commercial
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return res.data;
  } catch (error) {
    // Pass the error back to the thunk for forensic analysis
    throw error;
  }
};
