// src/store/Residential/residentialUiSlice.js
import { createSlice } from "@reduxjs/toolkit";

const residentialUiSlice = createSlice({
  name: "residentialUi",
  initialState: {
    reviewStatus: "",
  },
  reducers: {
    setReviewStatus: (state, action) => {
      state.reviewStatus = action.payload;
    },
  },
});

export const { setReviewStatus } = residentialUiSlice.actions;
export default residentialUiSlice.reducer;
