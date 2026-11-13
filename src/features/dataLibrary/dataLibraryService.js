import { apiClient } from "../../api/apiClient";
import { SERVICES } from "../../config/services";

const BASE = `${SERVICES.PROPERTY}/data-library`;
const LONG_TIMEOUT = 5 * 60 * 1000;

export const listDataLibrary = async (filters = {}) => {
  const params = {};
  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "" || value === "all") return;
    params[key] = value;
  });
  const res = await apiClient.get(BASE, { params });
  return res.data;
};

/** payload: { file?, link?, title, category, project, notes, recordDate } */
export const createDataLibraryItem = (payload, onProgress) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    formData.append(key, value);
  });
  return apiClient.post(BASE, formData, {
    timeout: LONG_TIMEOUT,
    onUploadProgress: (event) => {
      if (!onProgress || !event.total) return;
      onProgress(Math.round((event.loaded / event.total) * 100));
    },
  });
};

export const updateDataLibraryItem = (id, payload) =>
  apiClient.patch(`${BASE}/${id}`, payload);

export const deleteDataLibraryItem = (id) => apiClient.delete(`${BASE}/${id}`);

export const listDeletedDataLibrary = async () => (await apiClient.get(`${BASE}/deleted`)).data;

export const restoreDataLibraryItem = (id) => apiClient.post(`${BASE}/${id}/restore`);

export const listDataLibraryActivity = async (params = {}) =>
  (await apiClient.get(`${BASE}/activity`, { params })).data;

export const getDataLibraryItem = async (id) => (await apiClient.get(`${BASE}/${id}`)).data;

export const getDataLibraryTable = async (id, params = {}) =>
  (await apiClient.get(`${BASE}/${id}/table`, { params })).data;

export const exportDataLibraryTable = async (id, title) => {
  const res = await apiClient.get(`${BASE}/${id}/table/export`, {
    responseType: "blob",
    timeout: LONG_TIMEOUT,
  });
  const url = URL.createObjectURL(res.data);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${title || "data"}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export const downloadDataLibraryFile = async (item) => {
  const res = await apiClient.get(`${BASE}/${item._id}/download`, {
    responseType: "blob",
    timeout: LONG_TIMEOUT,
  });
  const url = URL.createObjectURL(res.data);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = item.file?.originalName || item.title || "download";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
