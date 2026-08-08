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

export const getVisibleHierarchyRoles = async () =>
  (await apiClient.get(`${ROLES}/team-directory`)).data;

export const createAccessRole = async (payload) =>
  (await apiClient.post(ROLES, payload)).data;

export const getAccessRole = async (roleId) =>
  (await apiClient.get(`${ROLES}/${roleId}`)).data;

export const getAccessRoles = async () =>
  (await apiClient.get(ROLES)).data;

/** Safe delete: optional transferToRoleId moves assigned users + child roles first */
export const deleteAccessRole = async (roleId, payload = {}) =>
  (await apiClient.delete(`${ROLES}/${roleId}`, { data: payload })).data;

export const updateAccessRoleStatus = async (roleId, isActive) =>
  (await apiClient.patch(`${ROLES}/${roleId}/status`, { isActive })).data;

export const updateAccessRolePermissions = async (roleId, permissions) =>
  (await apiClient.patch(`${ROLES}/${roleId}/permissions`, { permissions })).data;

export const updateAccessRole = async (roleId, payload) =>
  (await apiClient.patch(`${ROLES}/${roleId}`, payload)).data;

export const getAccessUsers = async (params = { scope: "team_directory" }) =>
  (await apiClient.get(`${SERVICES.USER}/auth/all-users`, { params })).data;

export const updateAccessUserStatus = async (userId, isActive) =>
  (await apiClient.patch(`${SERVICES.USER}/auth/${userId}/status`, { isActive })).data;

export const deleteAccessUser = async (userId, reason) =>
  (
    await apiClient.delete(`${SERVICES.USER}/auth/${userId}`, {
      data: reason ? { reason } : undefined,
    })
  ).data;

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

export const getUserWorkingLocations = async (userId) =>
  (await apiClient.get(`${SERVICES.USER}/auth/${userId}/working-locations`)).data;

export const updateUserWorkingLocations = async (userId, workingLocations) =>
  (
    await apiClient.put(`${SERVICES.USER}/auth/${userId}/working-locations`, {
      workingLocations,
    })
  ).data;
