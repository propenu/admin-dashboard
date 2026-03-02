// src/store/agents/agentsSlice.js
import { createSlice } from "@reduxjs/toolkit";
import {
  fetchAgentsThunk,
  updateAgentThunk,
  deleteAgentThunk,
  createAgentThunk,
} from "./agentsThunks";

const initialState = {
  items: [],
  meta: { page: 1, limit: 20, total: 0 },
  loading: false,
  error: null,
};

const agentsSlice = createSlice({
  name: "agents",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder

      /* -------- FETCH -------- */
      .addCase(fetchAgentsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAgentsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.meta = action.payload.meta;
      })
      .addCase(fetchAgentsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Example inside your extraReducers
      .addCase(createAgentThunk.fulfilled, (state, action) => {
        state.items.unshift(action.payload); // Adds the new agent to the top of the list
        state.loading = false;
      })

      /* -------- UPDATE -------- */
      .addCase(updateAgentThunk.fulfilled, (state, action) => {
        const updatedAgent = action.payload.agent;
        const index = state.items.findIndex((a) => a._id === updatedAgent._id);

        if (index !== -1) {
          state.items[index] = updatedAgent;
        }
      })

      /* -------- DELETE -------- */
      .addCase(deleteAgentThunk.fulfilled, (state, action) => {
        state.items = state.items.filter((a) => a._id !== action.payload);
        state.meta.total -= 1;
      });
  },
});

export default agentsSlice.reducer;
