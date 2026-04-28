// src/features/property/common/propertyService.js
import { apiClient } from "../../api/apiClient";
import { SERVICES } from "../../config/services";





// //Featured Projects
// // Only API call (no progress logic)
// export const createFeaturedProperty = (formData, config = {}) => {
//   return apiClient.post(
//     `${SERVICES.PROPERTY}/featured-project`,
//     formData,
//     config
//   );
// };

// export const getFeaturedProjects = (id) => {
//   return apiClient.get(`${SERVICES.PROPERTY}/featured-project/${id}`);
// }


// export const editFeaturedProject = (id, formData) => {
//   return apiClient.patch(`${SERVICES.PROPERTY}/featured-project/${id}`, formData);
// }

// export const deleteFeaturedProjectGallery = (id,index) => {
//   return apiClient.delete(
//     `${SERVICES.PROPERTY}/featured-project/${id}/gallery/${index}`,
//   );
// }


const BASE = `${SERVICES.PROPERTY}/featured-project`;

// ── GET ──────────────────────────────────────────────────────────────────────
export const getFeaturedProjectsByType = (type) =>
  apiClient.get(`${BASE}?type=${type}`);

export const getFeaturedProjectById = (id) => apiClient.get(`${BASE}/${id}`);

// ── POST ─────────────────────────────────────────────────────────────────────
export const createFeaturedProject = (formData, config = {}) =>
  apiClient.post(BASE, formData, config);

// ── PATCH ────────────────────────────────────────────────────────────────────
export const editFeaturedProject = (id, formData) =>
  apiClient.patch(`${BASE}/${id}`, formData);

/** Promote a project → set type (prime | featured | normal | sponsored) */
export const promoteProject = (id, type) =>
  apiClient.patch(`${BASE}/${id}/promote`, { type });

/** Expire a project */
export const expireProject = (id) => apiClient.patch(`${BASE}/${id}/expire`);

/** Reset a project back to default/active */
export const resetProject = (id) => apiClient.patch(`${BASE}/${id}/reset`);

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





