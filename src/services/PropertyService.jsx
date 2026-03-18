 

// frontend/admin-dashboard/src/services/PropertyService.jsx
import { API_ENDPOINTS, API_CONFIG } from "../config/api";
const apiRequest = async (url, options = {}) => {
  const finalOptions = {
    ...options,
    headers: {
      ...API_CONFIG.HEADERS,
      ...(options.headers || {}),
    },
  };

  const response = await fetch(url, finalOptions);

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`API Error: ${response.status} - ${message}`);
  }

  return response.json();
};

/* ------------------------------------------------------------
   FEATURED PROJECT SERVICES
------------------------------------------------------------ */
export const fetchFeaturedProperties = async () =>
  apiRequest(API_ENDPOINTS.FEATURED_PROPERTIES, { method: "GET" });

export const fetchPropertyById = async (id) =>
  apiRequest(API_ENDPOINTS.PROPERTY_DETAILS(id), { method: "GET" });

export const searchProperties = async (query) =>
  apiRequest(
    `${API_ENDPOINTS.FEATURED_PROPERTIES}?search=${encodeURIComponent(query)}`,
    { method: "GET" }
  );

export const createFeaturedProperty = async (data) =>
  apiRequest(API_ENDPOINTS.FEATURED_PROPERTIES, {
    method: "POST",
    body: JSON.stringify(data),
  });


  // HighlightProjects
  export const fetchHighlightProjects = async () =>
  apiRequest(API_ENDPOINTS.HIGHLIGHTED_PROPERTIES, { method: "GET" });

  export const fetchHighlightProjectById = async (id) =>
  apiRequest(API_ENDPOINTS.Highlighted_Properties_Details(id), { method: "GET" });

export const updateFeaturedProperty = async (id, data) =>
  apiRequest(API_ENDPOINTS.PROPERTY_DETAILS(id), {
    method: "PATCH",
    body: JSON.stringify(data),
  });

export const deleteFeaturedProperty = async (id) =>
  apiRequest(API_ENDPOINTS.PROPERTY_DETAILS(id), {
    method: "DELETE",
  });


/* ------------------------------------------------------------
   TOP PROJECT
------------------------------------------------------------ */
export const topProject = async () =>
  apiRequest(API_ENDPOINTS.Top_Project, { method: "GET" });

export const agent = async () =>
  apiRequest(API_ENDPOINTS.ALL_PROPERTIES, { method: "GET" });

/* AGRICULTURAL */
export const fetchAgricultural = async () =>
  apiRequest(API_ENDPOINTS.AGRICULTURAL, { method: "GET" });

export const fetchAgriculturalById = async (id) =>
  apiRequest(API_ENDPOINTS.AGRICULTURAL_DETAILS(id), { method: "GET" });

export const createAgricultural = async (data) =>
  apiRequest(API_ENDPOINTS.AGRICULTURAL, {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateAgricultural = async (id, data) =>
  apiRequest(API_ENDPOINTS.AGRICULTURAL_DETAILS(id), {
    method: "PATCH",
    body: JSON.stringify(data),
  });

export const deleteAgricultural = async (id) =>
  apiRequest(API_ENDPOINTS.AGRICULTURAL_DETAILS(id), {
    method: "DELETE",
  });

/* COMMERCIAL */
export const fetchCommercial = async () =>
  apiRequest(API_ENDPOINTS.COMMERCIAL, { method: "GET" });

export const fetchCommercialById = async (id) =>
  apiRequest(API_ENDPOINTS.COMMERCIAL_DETAILS(id), { method: "GET" });

export const createCommercial = async (data) =>
  apiRequest(API_ENDPOINTS.COMMERCIAL, {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateCommercial = async (id, data) =>
  apiRequest(API_ENDPOINTS.COMMERCIAL_DETAILS(id), {
    method: "PATCH",
    body: JSON.stringify(data),
  });

export const deleteCommercial = async (id) =>
  apiRequest(API_ENDPOINTS.COMMERCIAL_DETAILS(id), {
    method: "DELETE",
  });

/* RESIDENTIAL */
export const fetchResidential = async({ page = 1, limit = 20 } = {}) =>
  apiRequest(
    `${API_ENDPOINTS.RESIDENTIAL}?page=${page}&limit=${limit}`,
    { method: "GET" }
  );

export const fetchResidentialById = async (id) =>
  apiRequest(API_ENDPOINTS.RESIDENTIAL_DETAILS(id), { method: "GET" });


export const createResidential = async (data) =>
  apiRequest(API_ENDPOINTS.RESIDENTIAL, {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateResidential = async (id, data) =>
  apiRequest(API_ENDPOINTS.RESIDENTIAL_DETAILS(id), {
    method: "PATCH",
    body: JSON.stringify(data),
  });
export const editResidential = async (id, data) =>
  apiRequest(API_ENDPOINTS.RESIDENTIAL_DETAILS(id), {
    method: "PATCH",
    body: JSON.stringify(data),
  });


export const deleteResidential = async (id) =>
  apiRequest(API_ENDPOINTS.RESIDENTIAL_DETAILS(id), {
    method: "DELETE",
  });

/* AGENTS */
export const agentsList = async () =>
  apiRequest(API_ENDPOINTS.Agent, { method: "GET" });

export const fetchAgents = agentsList; // alias (optional)

export const fetchAgentById = async (id) =>
  apiRequest(API_ENDPOINTS.Agent_Details(id), { method: "GET" });

export const createAgent = async (data) =>
  apiRequest(API_ENDPOINTS.Agent, {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateAgent = async (id, data) =>
  apiRequest(API_ENDPOINTS.Agent_Details(id), {
    method: "PATCH",
    body: JSON.stringify(data),
  });

export const deleteAgent = async (id) =>
  apiRequest(API_ENDPOINTS.Agent_Details(id), {
    method: "DELETE",
  });




  /*  Land */
export const fetchLand = async () =>
  apiRequest(API_ENDPOINTS.LAND, { method: "GET" });

export const fetchLandById = async (id) =>
  apiRequest(API_ENDPOINTS.LAND_DETAILS(id), { method: "GET" });

export const createLand = async (data) =>
  apiRequest(API_ENDPOINTS.LAND, {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateLand = async (id, data) =>
  apiRequest(API_ENDPOINTS.LAND_DETAILS(id), {
    method: "PATCH",
    body: JSON.stringify(data),
  });

export const deleteLand = async (id) =>
  apiRequest(API_ENDPOINTS.LAND_DETAILS(id), {
    method: "DELETE",
  });