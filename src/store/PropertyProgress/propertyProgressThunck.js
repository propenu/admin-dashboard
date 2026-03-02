//frontend/admin-dashboard/src/store/PropertyProgress/propertyProgressThunck.js
import { createAsyncThunk } from "@reduxjs/toolkit";

import {fetchResidentialPropertyProgress,fetchCommercialPropertyProgress , fetchLandPropertyProgress,fetchAgriculturalPropertyProgress } from "../../services/PropertyProgessServices/PropertyProgess";

/* ---------------- FETCH RESIDENTIAL PROPERTY PROGRESS ---------------- */
export const fetchResidentialPropertyProgressThunk = createAsyncThunk(
  "propertyProgress/fetchResidential",
  async () => {
    const response = await fetchResidentialPropertyProgress();
    return response;
  }
);

/* ---------------- FETCH COMMERCIAL PROPERTY PROGRESS ---------------- */
export const fetchCommercialPropertyProgressThunk = createAsyncThunk(
  "propertyProgress/fetchCommercial",
  async () => {
    const response = await fetchCommercialPropertyProgress();
    return response;
  }
);

/* ---------------- FETCH AGRICULTURAL PROPERTY PROGRESS ---------------- */
export const fetchAgriculturalPropertyProgressThunk = createAsyncThunk(
  "propertyProgress/fetchAgricultural",
  async () => {
    const response = await fetchAgriculturalPropertyProgress();
    return response;
  }
);

/* ---------------- FETCH LAND PROPERTY PROGRESS ---------------- */
export const fetchLandPropertyProgressThunk = createAsyncThunk(
  "propertyProgress/fetchLand",
  async () => {
    const response = await fetchLandPropertyProgress();
    return response;
  }
);

