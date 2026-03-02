 
// frontend/admin-dashboard/src/config/UserDeatilsApi.js
export const AUTH_API_BASE_URL = import.meta.env.VITE_API_BASE_URL_TWO;  

export const USER_API_ENDPOINTS = {
  // Users
  ALL_USERS: `${AUTH_API_BASE_URL}/auth/all-users`, 
  USER_DETAILS: `${AUTH_API_BASE_URL}/auth/me`, 
  SEARCH_USERS: `${AUTH_API_BASE_URL}/auth/search`, 
  //Agents
  AGENTS: `${AUTH_API_BASE_URL}/agent`, //Agents
  UPDATEAGENTBYID: (id)=> `${AUTH_API_BASE_URL}/agent/${id}`,  
  DELETEAGENTBYID: (id)=> `${AUTH_API_BASE_URL}/agent/${id}`,  
  
  //Locations
  Locations: `${AUTH_API_BASE_URL}/location`, //Locations
  UpdtateLocation: (id)=> `${AUTH_API_BASE_URL}/location/${id}`,  
  //cities
  DeleteLocation: (id)=> `${AUTH_API_BASE_URL}/location/${id}`,
  //Localities
  DeleteLocality: (id)=> `${AUTH_API_BASE_URL}/${id}/locality`,
};

export const USER_API_CONFIG = {
  TIMEOUT: 30000,
  HEADERS: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
};


