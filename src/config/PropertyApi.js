// frontend/admin-dashboard/src/config/PropertyApi.js
import axios from "axios";
import Cookies from "js-cookie";
import { API_BASE_URL } from "./api";

const propertyApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: "application/json",
  },
});

propertyApi.interceptors.request.use(
  (config) => {
    const token = Cookies.get("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default propertyApi;
