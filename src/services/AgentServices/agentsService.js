// src/services/AgentServices/agentsService.js

import authAxios from "../../config/authApi";
import { USER_API_ENDPOINTS } from "../../config/UserDeatilsApi";

export const fetchAgents = async () => {
  try {
    const res = await authAxios.get(USER_API_ENDPOINTS.AGENTS);
   
    return {
      items: res.data.items || [],
      meta: res.data.meta || { page: 1, limit: 20, total: 0 },
    };
  } catch (err) {
    console.error("Failed to fetch agents:", err);
    throw new Error(err.response?.data?.message || "Failed to load agents");
  }
};


export const createAgent = async (data) => {
  try {
    const res = await authAxios.post(USER_API_ENDPOINTS.AGENTS, data, {
      headers: {
        "Content-Type": undefined, 
      },
    });
    return res.data;
  } catch (err) {
    console.error("Failed to create agent:", err);
    throw new Error(err.response?.data?.message || "Failed to create agent");
  }
};

// src/services/AgentServices/agentsService.js
export const updateAgent = async (id, data) => {
  try {
    const res = await authAxios.patch(
      `${USER_API_ENDPOINTS.UPDATEAGENTBYID(id)}`, 
      data, 
      {
        headers: {
          "Content-Type": undefined, 
        },
      }
    );
    return res.data;
  } catch (err) {
    console.error(`Failed to update agent with id ${id}:`, err);
    throw new Error(err.response?.data?.message || "Failed to update agent");
  }
};

export const deleteAgent = async (id) => {
  try {
    const res = await authAxios.delete(`${USER_API_ENDPOINTS.DELETEAGENTBYID(id)}`);
    return res.data;
  } catch (err) {
    console.error(`Failed to delete agent with id ${id}:`, err);
    throw new Error(err.response?.data?.message || "Failed to delete agent");
  }
};
