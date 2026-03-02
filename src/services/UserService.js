// frontend/admin-dashboard/src/services/UserService.js
import { API_ENDPOINTS } from "../config/api";

export const fetchUsers = async () => {
  try {
    const response = await fetch(API_ENDPOINTS.USERS, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};
