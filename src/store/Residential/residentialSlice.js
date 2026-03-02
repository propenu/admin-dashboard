// src/store/residential/residentialSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { calculateCompletion } from "../../pages/Residential/ResidentialEdit/components/editable/residentialCompletion";

import {
  createResidentialThunk,
  fetchResidentialThunk,
  fetchResidentialByIdThunk,
  editResidentialThunk,
  deleteResidentialThunk,
} from "./residentialThunks";

const initialState = {
  list: [],
  meta: {},
  current: null, // edit page data
  loading: false,
  error: null,
};

const residentialSlice = createSlice({
  name: "residential",
  initialState,
  reducers: {
    clearCurrentResidential(state) {
      state.current = null;
    },

    // ✅ ADD THIS (LOCAL STATE UPDATE – NO API)
    updateCurrentField(state, action) {
      const { key, value } = action.payload;
      if (!state.current) return;
      state.current[key] = value;
      state.current.completion = calculateCompletion(state.current);
    },
  },
  extraReducers: (builder) => {
    builder

      /* ---------- FETCH LIST ---------- */
      .addCase(fetchResidentialThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchResidentialThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.items;
        state.meta = action.payload.meta;
      })
      .addCase(fetchResidentialThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ---------- FETCH BY ID (EDIT PREFILL) ---------- */
      .addCase(fetchResidentialByIdThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchResidentialByIdThunk.fulfilled, (state, action) => {
        state.loading = false;

        const data = action.payload.data;

        state.current = {
          ...data,

          // preview helpers
          galleryFiles: [],
          documentsFiles: [],

          // ✅ ADD THIS LINE
          completion: calculateCompletion(data),
        };
      })

      .addCase(fetchResidentialByIdThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ---------- PATCH (AUTO SAVE FIELD) ---------- */
      .addCase(editResidentialThunk.fulfilled, (state, action) => {
        if (!state.current) return;

        state.current = {
          ...state.current,
          ...action.payload.data,

          // ✅ DO NOT LET API WIPE FILES
          galleryFiles: state.current.galleryFiles || [],
          documentsFiles: state.current.documentsFiles || [],
        };
      })

      /* ---------- CREATE ---------- */
      .addCase(createResidentialThunk.fulfilled, (state, action) => {
        state.list.unshift(action.payload.data);
      })

      /* ---------- DELETE ---------- */
      .addCase(deleteResidentialThunk.fulfilled, (state, action) => {
        state.list = state.list.filter((item) => item._id !== action.meta.arg);
      });
  },
});

export const {
  clearCurrentResidential,
  updateCurrentField, // ✅ EXPORT THIS
} = residentialSlice.actions;

export default residentialSlice.reducer;
