//frontend/admin-dashboard/src/store/PropertyProgress/propertyProgressSlice.js
import { createSlice } from "@reduxjs/toolkit";

import {
  fetchResidentialPropertyProgressThunk,
  fetchCommercialPropertyProgressThunk,
  fetchLandPropertyProgressThunk,
  fetchAgriculturalPropertyProgressThunk,
} from "./propertyProgressThunck";
const initialState = {
  residential: {
    items: [],  
    loading: false,
    error: null,
  },
    commercial: {
    items: [],  
    loading: false,
    error: null,
    },
    agricultural: {
    items: [],  
    loading: false,
    error: null,
    },
    land: {
    items: [],
    loading: false,
    error: null,
    },
};


const propertyProgressSlice = createSlice({
  name: "propertyProgress",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
        /* -------- FETCH RESIDENTIAL PROPERTY PROGRESS -------- */
        .addCase(fetchResidentialPropertyProgressThunk.pending, (state) => {
            state.residential.loading = true;
            state.residential.error = null;
        })
        .addCase(fetchResidentialPropertyProgressThunk.fulfilled, (state, action) => {
            state.residential.loading = false;
            state.residential.items = action.payload;
        })
        .addCase(fetchResidentialPropertyProgressThunk.rejected, (state, action) => {
            state.residential.loading = false;
            state.residential.error = action.payload;
        })
        /* -------- FETCH COMMERCIAL PROPERTY PROGRESS -------- */
        .addCase(fetchCommercialPropertyProgressThunk.pending, (state) => {
            state.commercial.loading = true;
            state.commercial.error = null;
        })
        .addCase(fetchCommercialPropertyProgressThunk.fulfilled, (state, action) => {
            state.commercial.loading = false;
            state.commercial.items = action.payload;
        })
        .addCase(fetchCommercialPropertyProgressThunk.rejected, (state, action) => {
            state.commercial.loading = false;
            state.commercial.error = action.payload;
        })
        /* -------- FETCH AGRICULTURAL PROPERTY PROGRESS -------- */
        .addCase(fetchAgriculturalPropertyProgressThunk.pending, (state) => {
            state.agricultural.loading = true;
            state.agricultural.error = null;
        }
        )
        .addCase(fetchAgriculturalPropertyProgressThunk.fulfilled, (state, action) => {
            state.agricultural.loading = false;
            state.agricultural.items = action.payload;
        })
        .addCase(fetchAgriculturalPropertyProgressThunk.rejected, (state, action) => {
            state.agricultural.loading = false;
            state.agricultural.error = action.payload;
        })
        /* -------- FETCH LAND PROPERTY PROGRESS -------- */
        .addCase(fetchLandPropertyProgressThunk.pending, (state) => {
            state.land.loading = true;
            state.land.error = null;
        })
        .addCase(fetchLandPropertyProgressThunk.fulfilled, (state, action) => {
            state.land.loading = false;
            state.land.items = action.payload;
        })
        .addCase(fetchLandPropertyProgressThunk.rejected, (state, action) => {
            state.land.loading = false;
            state.land.error = action.payload;
        });
    },
});

export default propertyProgressSlice.reducer;   


