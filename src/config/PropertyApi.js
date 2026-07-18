// frontend/admin-dashboard/src/config/PropertyApi.js
import axios from "axios";
import { API_BASE_URL } from "./api";
import { getAuthToken } from "../utils/authToken";

const propertyApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: "application/json",
  },
});

propertyApi.interceptors.request.use(
  (config) => {
    const token = getAuthToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default propertyApi;
