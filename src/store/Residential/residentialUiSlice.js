// src/store/Residential/residentialUiSlice.js
import { createSlice } from "@reduxjs/toolkit";

const residentialUiSlice = createSlice({
  name: "residentialUi",
  initialState: {
    reviewStatus: "draft", 
    viewMode: "list", 
  },
  reducers: {
    /**
     * Sets the current review status filter.
     * @param {string} action.payload - Expects 'ready' or 'draft'
     */
    setReviewStatus: (state, action) => {
      state.reviewStatus = action.payload;
    },
    /**
     * Toggles the UI between list view and grid view.
     * @param {string} action.payload - Expects 'list' or 'grid'
     */
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
    },
    resetResidentialUi: (state) => {
      state.reviewStatus = "draft";
      state.viewMode = "list";
    },
  },
});

export const { setReviewStatus, setViewMode, resetResidentialUi } = residentialUiSlice.actions;
export default residentialUiSlice.reducer;