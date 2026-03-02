// src/features/property/common/propertyService.js
import { apiClient } from "../../api/apiClient";
import { SERVICES } from "../../config/services";

//Featured Projects
export const getFeaturedProjects = (id) => {
  return apiClient.get(`${SERVICES.PROPERTY}/featured-project/${id}`);
}
export const editFeaturedProject = (id, formData) => {
  return apiClient.patch(`${SERVICES.PROPERTY}/featured-project/${id}`, formData);
}

export const createPropertyDraft = (category) => {
  return apiClient.post(`${SERVICES.PROPERTY}/${category}/draft`);
};


export const getMyPropertyDrafts = (category) => {
  return apiClient.get(`${SERVICES.PROPERTY}/${category}/draft/me`);
};


export const updatePropertyBasic = (category, id, formData) => {
  return apiClient.patch(
    `${SERVICES.PROPERTY}/${category}/${id}/basic`,
    formData,
  );
};


export const updatePropertyLocation = (category, id, payload) => {
  return apiClient.patch(
    `${SERVICES.PROPERTY}/${category}/${id}/location`,
    payload,
  );
};


export const updatePropertyDetails = (category, id, formData) => {
  return apiClient.patch(
    `${SERVICES.PROPERTY}/${category}/${id}/details`,
    formData,
  );
};


export const updatePropertyVerification = (category, id, formData) => {
  return apiClient.patch(
    `${SERVICES.PROPERTY}/${category}/${id}/verification`,
    formData,
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





