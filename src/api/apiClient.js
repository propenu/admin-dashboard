//One network layer
//src/api/apiClient.js
import axios from "axios";
import { ENV } from "../config/env";
import { clearAuthToken, getAuthToken } from "../utils/authToken";

export const apiClient = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: 15000,
  headers: {
    Accept: "application/json",
  },
});

let handlingUnauthorized = false;

function redirectToSignIn() {
  if (handlingUnauthorized) return;
  const path = window.location.pathname || "";
  if (path.includes("/signin") || path.includes("/login")) return;
  handlingUnauthorized = true;
  clearAuthToken();
  window.location.assign("/signin");
}

// Auth Interceptor — do not overwrite an explicit Authorization (e.g. SE user onboarding token)
apiClient.interceptors.request.use((config) => {
  const existing =
    config.headers?.Authorization ||
    config.headers?.authorization ||
    (typeof config.headers?.get === "function"
      ? config.headers.get("Authorization") || config.headers.get("authorization")
      : null);
  if (existing) return config;
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      redirectToSignIn();
    }

    const backendMessage = error?.response?.data?.message;
    if (typeof backendMessage === "string" && backendMessage.trim()) {
      error.message = backendMessage;
    } else if (error?.code === "ECONNABORTED") {
      error.message = "Request timed out. Please try again.";
    }
    return Promise.reject(error);
  },
);
