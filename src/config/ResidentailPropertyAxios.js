//frontend/admin-dashboard/src/config/ResidentailPropertyAxios.js

import axios from "axios";
import { API_BASE_URL } from "./api";

const residentailPropertyAxios = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export default residentailPropertyAxios;



