import { useMemo } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { apiClient } from "../../../api/apiClient";
import { SERVICES } from "../../../config/services";
import {
  getAllProjectsAnalytics,
  getAllPropertiesAnalytics,
} from "../../../features/property/propertyService";
import { getAllUsers } from "../../../features/user/userService";
import { mapTlClientProgressReport } from "../customerSupportTeamLeadDashboard/tlClientProgressReportData";

const safe = async (fn, fallback) => {
  try {
    return await fn();
  } catch {
    return fallback;
  }
};

const unpackAnalytics = (response) => response?.data?.data || response?.data || {};

const unpackUsers = (response) => {
  const payload = response?.data ?? response;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.users)) return payload.users;
  return [];
};

/** Head sees staff under Support Head (TLs + CCEs + RMs). */
const fetchTeamDirectory = async () => {
  try {
    const response = await apiClient.get(`${SERVICES.USER}/auth/all-users`, {
      params: { scope: "team_directory" },
    });
    return unpackUsers(response);
  } catch {
    return [];
  }
};

/**
 * Department-wide Client Progress for Support Head (same mapper as TL, wider team).
 */
export function useCshClientProgressReport(range = {}, filters = {}, options = {}) {
  const enabled = options.enabled !== false;

  const usersQuery = useQuery({
    queryKey: ["csh-client-progress-report", "users"],
    queryFn: () =>
      safe(async () => {
        const response = await getAllUsers();
        return unpackUsers(response);
      }, []),
    enabled,
    staleTime: 180_000,
    refetchInterval: enabled ? 180_000 : false,
    placeholderData: keepPreviousData,
  });

  const teamUsersQuery = useQuery({
    queryKey: ["customer-support-head-dashboard", "team-directory"],
    queryFn: fetchTeamDirectory,
    enabled,
    staleTime: 120_000,
    refetchInterval: enabled ? 120_000 : false,
    placeholderData: keepPreviousData,
  });

  const propertiesQuery = useQuery({
    queryKey: ["csh-client-progress-report", "properties", filters],
    queryFn: () =>
      safe(async () => {
        const response = await getAllPropertiesAnalytics(filters);
        return unpackAnalytics(response);
      }, {}),
    enabled,
    staleTime: 120_000,
    placeholderData: keepPreviousData,
  });

  const projectsQuery = useQuery({
    queryKey: ["csh-client-progress-report", "projects", filters],
    queryFn: () =>
      safe(async () => {
        const response = await getAllProjectsAnalytics(filters);
        return unpackAnalytics(response);
      }, {}),
    enabled,
    staleTime: 120_000,
    placeholderData: keepPreviousData,
  });

  const report = useMemo(
    () =>
      mapTlClientProgressReport({
        usersPayload: usersQuery.data || [],
        teamMembersPayload: teamUsersQuery.data || [],
        propertiesAnalytics: propertiesQuery.data || {},
        projectsAnalytics: projectsQuery.data || {},
        range,
      }),
    [
      usersQuery.data,
      teamUsersQuery.data,
      propertiesQuery.data,
      projectsQuery.data,
      range,
    ],
  );

  return {
    report,
    teamDirectory: teamUsersQuery.data || [],
    isLoading:
      usersQuery.isLoading ||
      teamUsersQuery.isLoading ||
      propertiesQuery.isLoading ||
      projectsQuery.isLoading,
    isFetching:
      usersQuery.isFetching ||
      teamUsersQuery.isFetching ||
      propertiesQuery.isFetching ||
      projectsQuery.isFetching,
    refetch: async () => {
      await Promise.all([
        usersQuery.refetch(),
        teamUsersQuery.refetch(),
        propertiesQuery.refetch(),
        projectsQuery.refetch(),
      ]);
    },
  };
}
