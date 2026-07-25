import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../../api/apiClient";
import {
  getAdminAnalytics,
  getAllProjectsAnalytics,
  getAllPropertiesAnalytics,
} from "../../../features/property/propertyService";
import { getAllUsers, getUserDetails } from "../../../features/user/userService";
import { getTicketDashboardOverview } from "../../../features/ticket/ticket_system";
import { useDashboardDateRange } from "../shared/useDashboardDateRange";
import { DATE_PRESETS } from "../shared/dashboardDateRange";
import { mapAdminData } from "./adminDashboardData";

const safe = async (fn, fallback) => {
  try {
    return await fn();
  } catch {
    return fallback;
  }
};

const unpackAnalytics = (response) => response?.data?.data || response?.data || {};

export function useAdminDashboard() {
  const dateRange = useDashboardDateRange("30d", DATE_PRESETS);
  const { range, filters } = dateRange;

  const currentUserQuery = useQuery({
    queryKey: ["admin-ops-dashboard", "me"],
    queryFn: async () => {
      const response = await getUserDetails();
      return response?.data?.user || response?.data || null;
    },
    staleTime: 120_000,
  });

  const adminAnalyticsQuery = useQuery({
    queryKey: ["admin-ops-dashboard", "legacy-admin"],
    queryFn: () =>
      safe(async () => {
        const response = await getAdminAnalytics();
        return response?.data?.data || response?.data || {};
      }, {}),
    staleTime: 60_000,
  });

  const projectsQuery = useQuery({
    queryKey: ["admin-ops-dashboard", "projects", filters],
    queryFn: () =>
      safe(async () => {
        const response = await getAllProjectsAnalytics(filters);
        return unpackAnalytics(response);
      }, {}),
    staleTime: 60_000,
    refetchInterval: 120_000,
  });

  const propertiesQuery = useQuery({
    queryKey: ["admin-ops-dashboard", "properties", filters],
    queryFn: () =>
      safe(async () => {
        const response = await getAllPropertiesAnalytics(filters);
        return unpackAnalytics(response);
      }, {}),
    staleTime: 60_000,
    refetchInterval: 120_000,
  });

  const leadsQuery = useQuery({
    queryKey: ["admin-ops-dashboard", "leads", filters],
    queryFn: () =>
      safe(async () => {
        const response = await apiClient.get("/api/properties/leads/admin/overview", {
          params: { page: 1, limit: 50, ...filters },
        });
        const payload = response?.data?.data || response?.data || {};
        return payload.summary || payload;
      }, {}),
    staleTime: 60_000,
  });

  const ticketsQuery = useQuery({
    queryKey: ["admin-ops-dashboard", "tickets", filters],
    queryFn: () =>
      safe(
        async () =>
          getTicketDashboardOverview({
            from: filters.from,
            to: filters.to,
          }),
        {},
      ),
    staleTime: 60_000,
  });

  const usersQuery = useQuery({
    queryKey: ["admin-ops-dashboard", "users"],
    queryFn: () =>
      safe(async () => {
        const response = await getAllUsers();
        return response?.data || [];
      }, []),
    staleTime: 90_000,
  });

  const mapped = useMemo(
    () =>
      mapAdminData({
        currentUser: currentUserQuery.data,
        adminAnalytics: adminAnalyticsQuery.data || {},
        projectsAnalytics: projectsQuery.data || {},
        propertiesAnalytics: propertiesQuery.data || {},
        leadSummary: leadsQuery.data || {},
        ticketOverview: ticketsQuery.data || {},
        usersPayload: usersQuery.data || [],
        range,
      }),
    [
      adminAnalyticsQuery.data,
      currentUserQuery.data,
      leadsQuery.data,
      projectsQuery.data,
      propertiesQuery.data,
      range,
      ticketsQuery.data,
      usersQuery.data,
    ],
  );

  const queries = [
    currentUserQuery,
    adminAnalyticsQuery,
    projectsQuery,
    propertiesQuery,
    leadsQuery,
    ticketsQuery,
    usersQuery,
  ];

  return {
    ...mapped,
    ...dateRange,
    isLoading: propertiesQuery.isLoading || adminAnalyticsQuery.isLoading || currentUserQuery.isLoading,
    isFetching: queries.some((q) => q.isFetching),
    refetch: async () => {
      await Promise.allSettled(queries.map((q) => q.refetch()));
    },
  };
}
