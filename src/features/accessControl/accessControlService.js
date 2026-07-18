import axios from "axios";
import { apiClient } from "../../api/apiClient";
import { ENV } from "../../config/env";
import { SERVICES } from "../../config/services";

const ROLES = `${SERVICES.USER}/roles`;

export const getPermissionCatalog = async () =>
  (await apiClient.get(`${ROLES}/permissions/catalog`)).data;

export const getAssignableRoles = async () =>
  (await apiClient.get(`${ROLES}/assignable`)).data;

export const getTeamDirectoryRoles = async () =>
  (await apiClient.get(`${ROLES}/team-directory`)).data;

export const createAccessRole = async (payload) =>
  (await apiClient.post(ROLES, payload)).data;

export const getAccessRole = async (roleId) =>
  (await apiClient.get(`${ROLES}/${roleId}`)).data;

export const updateAccessRolePermissions = async (roleId, permissions) =>
  (await apiClient.patch(`${ROLES}/${roleId}/permissions`, { permissions })).data;

export const getAccessUsers = async () =>
  (await apiClient.get(`${SERVICES.USER}/auth/all-users`)).data;

export const requestCredentialOtp = async (email) =>
  (await apiClient.post(`${SERVICES.USER}/auth/admin-credentials/request-otp`, { email })).data;

export const verifyCredentialOtp = async (payload) =>
  (await apiClient.post(`${SERVICES.USER}/auth/admin-credentials/verify-otp`, payload)).data;

export const completeCredentialLocation = async (payload, onboardingToken) =>
  (
    await axios.post(
      `${ENV.API_BASE_URL}${SERVICES.USER}/auth/update-location/admin-create`,
      payload,
      { headers: { Authorization: `Bearer ${onboardingToken}` } },
    )
  ).data;
