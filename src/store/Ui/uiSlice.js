// frontend/admin-dashboard/src/store/Ui/uiSlice.js
import { createSlice } from "@reduxjs/toolkit";
const uiSlice = createSlice({
  name: "ui",
  initialState: {
    activeCategory: "",
  },
  reducers: {
    setActiveCategory: (state, action) => {
      state.activeCategory = action.payload;
    },
  },
});

export const { setActiveCategory } = uiSlice.actions;

export default uiSlice.reducer;
