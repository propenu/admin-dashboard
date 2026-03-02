// frontend/admin-dashboard/src/services/userServices.js
import authAxios from "../../config/authApi";
import { USER_API_ENDPOINTS } from "../../config/UserDeatilsApi";

/**
 * Fetch logged-in user details using /me endpoint
 */
export const fetchLoggedInUser = async () => {
  try {
    const res = await authAxios.get(USER_API_ENDPOINTS.USER_DETAILS);
    return res.data.user;    
  } catch (err) {
    console.error("Failed to fetch user:", err);
    throw new Error(err.response?.data?.message || "Failed to load user");
  }
};

/**
 * Optional: fetch the entire /me response
 */
export const fetchMe = async () => {
  try {
    const res = await authAxios.get(USER_API_ENDPOINTS.USER_DETAILS);
    return res.data;   
  } catch (err) {
    console.error("Failed to fetch profile:", err);
    throw new Error(err.response?.data?.message || "Failed to load profile");
  }
};
