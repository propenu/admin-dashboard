// D:\propenu\frontend\admin-dashboard\src\config\authApi.js
import axios from "axios";
import Cookies from "js-cookie";
import { AUTH_API_BASE_URL } from "./UserDeatilsApi";

const authAxios = axios.create({
  baseURL: AUTH_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Automatically attach token for every request
authAxios.interceptors.request.use((config) => {
  const token = Cookies.get("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default authAxios;
