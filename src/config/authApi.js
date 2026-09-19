// D:\propenu\frontend\admin-dashboard\src\config\authApi.js
import axios from "axios";
import { AUTH_API_BASE_URL } from "./UserDeatilsApi";
import { clearAuthToken, getAuthToken } from "../utils/authToken";

const authAxios = axios.create({
  baseURL: AUTH_API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

let handlingUnauthorized = false;

authAxios.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

authAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      const path = window.location.pathname || "";
      if (
        !handlingUnauthorized &&
        !path.includes("/signin") &&
        !path.includes("/login")
      ) {
        handlingUnauthorized = true;
        clearAuthToken();
        window.location.assign("/signin");
      }
    }
    if (error?.code === "ECONNABORTED" && !error.message) {
      error.message = "Request timed out. Please try again.";
    }
    return Promise.reject(error);
  },
);

export default authAxios;
