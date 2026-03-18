// frontend/admin-dashboard/src/services/Common/AllPropertyServices.jsx
import propertyApi from "../../config/PropertyApi";
/**
 * FETCH a single property by ID
 */
export const getPropertyById = async (category, id) => {
  try {
    // 🟢 FIXED: Removed '/properties' because it's already in the Axios baseURL
    const res = await propertyApi.get(`/${category}/${id}`);
    return res.data;
  } catch (error) {
    console.error("Error fetching property by ID:", error);
    throw error;
  }
};

export const upsertProperty = async (category, id, formData) => {
  const url = id ? `/${category}/${id}` : `/${category}`;
  const method = id ? "patch" : "post";

  try {
    const res = await propertyApi({
      method,
      url,
      data: formData,
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (error) {
    // 🟢 FIXED: Use 'error.config' instead of 'res.config'
    console.error(`❌ API Request Failed [${method.toUpperCase()}]:`, error.config?.url);
    
    // Pass the actual error forward so the Thunk can read the 500 status
    throw error;
  }
};


