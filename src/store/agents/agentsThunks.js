// src/store/agents/agentsThunks.js
import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  fetchAgents,
  updateAgent,
  createAgent,
  deleteAgent,
} from "../../services/AgentServices/agentsService";

/* ---------------- GET AGENTS ---------------- */
export const fetchAgentsThunk = createAsyncThunk(
  "agents/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await fetchAgents();
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);
///* ---------------- CREATE AGENT ---------------- */
export const createAgentThunk = createAsyncThunk(
  "agents/create",
  async (data, { rejectWithValue }) => {
    try {
      return await createAgent(data);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

/* ---------------- UPDATE AGENT ---------------- */
export const updateAgentThunk = createAsyncThunk(
  "agents/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await updateAgent(id, data);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

/* ---------------- DELETE AGENT ---------------- */
export const deleteAgentThunk = createAsyncThunk(
  "agents/delete",
  async (id, { rejectWithValue }) => {
    try {
      await deleteAgent(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);
