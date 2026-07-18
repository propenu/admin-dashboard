//One network layer
//src/api/apiClient.js
import axios from "axios";
import { ENV } from "../config/env";
import { getAuthToken } from "../utils/authToken";

export const apiClient = axios.create({
  baseURL: ENV.API_BASE_URL,
  headers: {
    Accept: "application/json",
  },
});

// Auth Interceptor
apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const backendMessage = error?.response?.data?.message;
    if (typeof backendMessage === "string" && backendMessage.trim()) {
      error.message = backendMessage;
    }
    return Promise.reject(error);
  },
);
