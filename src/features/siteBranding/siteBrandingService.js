import { apiClient } from "../../api/apiClient";
import { SERVICES } from "../../config/services";

const BASE = `${SERVICES.PROPERTY}/site-branding`;

export const getSiteLogo = () => apiClient.get(`${BASE}/logo`);

export const createSiteLogo = (file) => {
  const form = new FormData();
  form.append("logo", file);
  return apiClient.post(`${BASE}/logo`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const patchSiteLogo = (file) => {
  const form = new FormData();
  form.append("logo", file);
  return apiClient.patch(`${BASE}/logo`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const upsertSiteLogo = (file, { preferCreate = false } = {}) =>
  preferCreate ? createSiteLogo(file) : patchSiteLogo(file);

export const listSiteBanners = () => apiClient.get(`${BASE}/banners`);

export const getSiteBanner = (id) => apiClient.get(`${BASE}/banners/${id}`);

/** Create banner shell (title + priority only). */
export const createSiteBanner = (payload) =>
  apiClient.post(`${BASE}/banners`, payload);

export const updateSiteBannerMeta = (id, payload) =>
  apiClient.patch(`${BASE}/banners/${id}`, payload);

/** Save one device slot (desktop|laptop|tablet|mobile). */
export const upsertSiteBannerDevice = (id, slot, formData) =>
  apiClient.patch(`${BASE}/banners/${id}/devices/${slot}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const clearSiteBannerDevice = (id, slot) =>
  apiClient.delete(`${BASE}/banners/${id}/devices/${slot}`);

export const deleteSiteBanner = (id) =>
  apiClient.delete(`${BASE}/banners/${id}`);
