// src/features/property/common/propertyService.js
import { apiClient } from "../../api/apiClient";
import { SERVICES } from "../../config/services";

const BASE = `${SERVICES.PROPERTY}/featured-project`;

export const getFeaturedProjectsByType = (
  type,
  page = 1,
  limit = 20,
  params = {},
) => {
  const query = new URLSearchParams();

  if (type) query.set("type", type);
  if (params.promotionStatus) {
    query.set("promotionStatus", params.promotionStatus);
  }
  if (params.search?.trim()) {
    query.set("search", params.search.trim());
  }

  query.set("page", String(page));
  query.set("limit", String(limit));

  return apiClient.get(`${BASE}?${query.toString()}`);
};

export const getFeaturedProjectById = (id) => apiClient.get(`${BASE}/${id}`);

// ── POST ─────────────────────────────────────────────────────────────────────
export const getAllFeaturedProjects = (id) => apiClient.get(`${BASE}`);
export const createFeaturedProject = (formData, config = {}) =>
  apiClient.post(BASE, formData, config);

// ── PATCH ────────────────────────────────────────────────────────────────────
export const editFeaturedProject = (id, formData) =>
  apiClient.patch(`${BASE}/${id}`, formData);

/** Promote a project → set type (prime | featured | normal | sponsored) */
export const promoteProject = (id, type) =>
  apiClient.patch(`${BASE}/${id}/promote`, { type });

export const RenevaleProject = (id) =>
  apiClient.patch(`${BASE}/${id}/renew`, { days: 10 });

/** Expire a project */
export const expireProject = (id) => apiClient.patch(`${BASE}/${id}/expire`);

/** Reset a project back to default/active */
export const resetProject = (id) => apiClient.patch(`${BASE}/${id}/reset`);

/** Promote a project */
export const promoteProjectWithRank = (id, data) =>
  apiClient.patch(`${BASE}/${id}/promote`, data);

/** Update rank */
export const updateProjectRank = (id, rank) =>
  apiClient.patch(`${BASE}/${id}`, { rank });

// ── DELETE ───────────────────────────────────────────────────────────────────
export const deleteFeaturedProject = (id) => apiClient.delete(`${BASE}/${id}`);

export const deleteFeaturedProjectGalleryImage = (id, index) =>
  apiClient.delete(`${BASE}/${id}/gallery/${index}`);


//Properties Draft Residential, Commertial, Land and Agricultural
export const createPropertyDraft = (category) => {
  return apiClient.post(`${SERVICES.PROPERTY}/${category}/draft`);
};



export const getMyPropertyDrafts = (category) => {
  return apiClient.get(`${SERVICES.PROPERTY}/${category}/draft/me`);
};


export const editPropertyBasic = (category, id, formData) => {
  return apiClient.patch(
    `${SERVICES.PROPERTY}/${category}/${id}/basic`,
    formData,
  );
};


export const editPropertyLocation = (category, id, payload) => {
  return apiClient.patch(
    `${SERVICES.PROPERTY}/${category}/${id}/location`,
    payload,
  );
};


export const editPropertyDetails = (category, id, formData) => {
  return apiClient.patch(
    `${SERVICES.PROPERTY}/${category}/${id}/details`,
    formData,
  );
};


export const editPropertyVerification = (category, id, formData) => {
  return apiClient.patch(
    `${SERVICES.PROPERTY}/${category}/${id}/verification`,
    formData,
  );
};

export const deletePropertyGalleryImagesIndex = (category, id, index) => {
  return apiClient.delete(
    `${SERVICES.PROPERTY}/${category}/${id}/gallery/${index}`,
  );
}

export const getPropertyById = (category, id) => {
  return apiClient.get(`${SERVICES.PROPERTY}/${category}/${id}`);
};



export const verifyAgentPropertyVerification = (category, id, payload) => {
  return apiClient.patch(
    `${SERVICES.PROPERTY}/${category}/${id}/verify-document`,
    payload,
  );
};


// Roles Analytics
export const getSuperAdimnAnalytics = () => {
  return apiClient.get(`${SERVICES.PROPERTY}/analytics/superadmin`);
};

export const getAdminAnalytics = () => {
  return apiClient.get(`${SERVICES.PROPERTY}/analytics/admin`);
};


export const getSalesManagerAnalytics = () => {
  return apiClient.get(`${SERVICES.PROPERTY}/analytics/salemanager`);
};

export const getSalesAgentAnalytics = () => {
  return apiClient.get(`${SERVICES.PROPERTY}/analytics/saleagent`);
};



///////

export const projectAnalytics = (id) => {
  return apiClient.get(`${SERVICES.PROPERTY}/leads/project/${id}/leads`);
};

export const deleteProjectLead = (id) => {
  return apiClient.delete(`${SERVICES.PROPERTY}/leads/${id}`);
};

export const deleteAllProjectLeads = (id) => {
  return apiClient.delete(`${SERVICES.PROPERTY}/leads/project/${id}/leads`);
};

export const projectExternalFileAddLeads = (id, payload) => {
  return apiClient.post(
    `${SERVICES.PROPERTY}/leads/project/${id}/leads/import`,
    payload,
  );
}

export const propertiesAnalytics = (id) =>{
  return apiClient.get(`${SERVICES.PROPERTY}/leads?projectId=${id}`);
}

// Sales Manager
export const getSalesManagerPeddingProjects = () => {
  return apiClient.get(`${SERVICES.PROPERTY}/pending-projects`);
}

export const salesmanagerApproveAProject = (id) => {
  return apiClient.patch(`${SERVICES.PROPERTY}/${id}/approve`);
}

export const salesmanagerRejectAProject = (id) => {
  return apiClient.patch(`${SERVICES.PROPERTY}/${id}/reject`);
}



export const getAllProjectsAnalytics = (params = {}) => {
  const query = new URLSearchParams();
  if (params.state) query.set("state", params.state);
  if (params.city) query.set("city", params.city);
  if (params.locality) query.set("locality", params.locality);
  if (params.from) query.set("from", params.from);
  if (params.to) query.set("to", params.to);
  if (params.creatorIds) query.set("creatorIds", params.creatorIds);
  const qs = query.toString();
  return apiClient.get(
    `${SERVICES.PROPERTY}/analytics/project${qs ? `?${qs}` : ""}`,
  );
};


export const getAllPropertiesAnalytics = (params = {}) => {
  const query = new URLSearchParams();
  if (params.state) query.set("state", params.state);
  if (params.city) query.set("city", params.city);
  if (params.locality) query.set("locality", params.locality);
  if (params.from) query.set("from", params.from);
  if (params.to) query.set("to", params.to);
  if (params.creatorIds) query.set("creatorIds", params.creatorIds);
  const qs = query.toString();
  return apiClient.get(
    `${SERVICES.PROPERTY}/analytics/properties${qs ? `?${qs}` : ""}`,
  );
};


//src/features/property/propertyService.js
{/* Blogs */ }
export const getBlogs = () => {
  return apiClient.get(`${SERVICES.PROPERTY}/blogs`);
};

export const getBlogById = (id) => {
  return apiClient.get(`${SERVICES.PROPERTY}/blogs/${id}`);
};

export const getBlogBySlug = (slug) => {
  return apiClient.get(`${SERVICES.PROPERTY}/blogs/slug/${slug}`);
};

export const deleteBlog = (id) => {
  return apiClient.delete(`${SERVICES.PROPERTY}/blogs/${id}`);
};

export const createBlog = (payload) => {
  return apiClient.post(`${SERVICES.PROPERTY}/blogs`, payload);
};

export const updateBlog = (id, payload) => {
  return apiClient.patch(`${SERVICES.PROPERTY}/blogs/${id}`, payload);
};

export const shareBlog = (id, payload) => {
  return apiClient.post(`${SERVICES.PROPERTY}/blogs/${id}/share`, payload);
};

export const likesBlog = (id) => apiClient.post(`${SERVICES.PROPERTY}/blogs/${id}/like`);
