// frontend/admin-dashboard/src/config/CommercialPropertyAxios.js

import axios from "axios";
import { API_BASE_URL } from "./api";

const commercialPropertyAxios = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export default commercialPropertyAxios;
