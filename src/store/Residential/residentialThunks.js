// src/store/residential/residentialThunks.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  createResidential,
  fetchResidential,
  fetchResidentialById,
  editResidential,
  deleteResidential,
} from "../../services/ResidentialServices/ResidentialServices";

/* ---------------- CREATE ---------------- */
export const createResidentialThunk = createAsyncThunk(
  "residential/create",
  async (payload, { rejectWithValue }) => {
    try {
      return await createResidential(payload);
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

/* ---------------- LIST ---------------- */
export const fetchResidentialThunk = createAsyncThunk(
  "residential/fetchAll",
  async ({ page = 1, limit = 20 }, { rejectWithValue }) => {
    try {
      return await fetchResidential({ page, limit });
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

/* ---------------- GET BY ID (EDIT PREFILL) ---------------- */
export const fetchResidentialByIdThunk = createAsyncThunk(
  "residential/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      return await fetchResidentialById(id);
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

/* ---------------- PATCH (AUTO SAVE FIELD) ---------------- */
export const editResidentialThunk = createAsyncThunk(
  "residential/edit",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await editResidential(id, data);
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

/* ---------------- DELETE ---------------- */
export const deleteResidentialThunk = createAsyncThunk(
  "residential/delete",
  async (id, { rejectWithValue }) => {
    try {
      return await deleteResidential(id);
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);
