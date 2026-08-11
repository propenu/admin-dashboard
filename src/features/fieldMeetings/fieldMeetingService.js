import { apiClient } from "../../api/apiClient";
import { SERVICES } from "../../config/services";

const BASE = `${SERVICES.USER}/field-meetings`;

const unwrap = (response) => response?.data?.data ?? response?.data ?? response;

export const listFieldMeetings = async (params = {}) => {
  const response = await apiClient.get(BASE, { params });
  return unwrap(response);
};

export const getFieldMeeting = async (id) => {
  const response = await apiClient.get(`${BASE}/${id}`);
  return unwrap(response);
};

export const createFieldMeeting = async (payload) => {
  const response = await apiClient.post(BASE, payload);
  return unwrap(response);
};

export const updateFieldMeeting = async (id, payload) => {
  const response = await apiClient.patch(`${BASE}/${id}`, payload);
  return unwrap(response);
};

export const updateFieldMeetingPrepTask = async (meetingId, taskId, completed) => {
  const response = await apiClient.patch(`${BASE}/${meetingId}/prep/${taskId}`, {
    completed,
  });
  return unwrap(response);
};

/** Complete or skip CRM next action (due 15 min after punch-out). */
export const completeFieldMeetingNextAction = async (
  meetingId,
  payload = { status: "done" },
) => {
  const response = await apiClient.patch(`${BASE}/${meetingId}/next-action`, payload);
  return unwrap(response);
};

export const getFieldMeetingTerritory = async (ownerUserId) => {
  const response = await apiClient.get(`${BASE}/territory`, {
    params: ownerUserId ? { ownerUserId } : {},
  });
  return unwrap(response);
};

export const getFieldMeetingTeamSummary = async (params = {}) => {
  const response = await apiClient.get(`${BASE}/team-summary`, { params });
  return unwrap(response);
};

/** Meeting-book contacts only (not platform Users / credentials). */
export const searchFieldMeetingContacts = async (q, params = {}) => {
  const response = await apiClient.get(`${BASE}/contacts/search`, {
    params: { q, ...params },
  });
  return unwrap(response);
};
