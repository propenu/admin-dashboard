import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../../api/apiClient";
import { getAllProjectsAnalytics, getAllPropertiesAnalytics } from "../../../features/property/propertyService";
import { getTicketDashboardOverview, getTicketDashboardTrends, getTickets } from "../../../features/ticket/ticket_system";
import { getAllUsers, getUserDetails } from "../../../features/user/userService";
import { useDashboardDateRange } from "../shared/useDashboardDateRange";
import { DATE_PRESETS } from "../shared/dashboardDateRange";
import { mapCustomerCareData } from "./customerCareDashboardData";

const CUSTOMER_CARE_DEPARTMENT = "customer-care";

const safeList = async (fn, fallback = []) => {
  try {
    return await fn();
  } catch {
    return fallback;
  }
};

const unpackTickets = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.tickets)) return payload.tickets;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
};

export function useCustomerCareDashboard() {
  const dateRange = useDashboardDateRange("30d", DATE_PRESETS);
  const { range, filters } = dateRange;
  const trendDays = Math.min(Math.max(range.days || 7, 1), 90);

  const ticketScope = {
    scope: "customer_care",
    department: CUSTOMER_CARE_DEPARTMENT,
  };

  const overviewQuery = useQuery({
    queryKey: ["customer-care-dashboard", "overview", CUSTOMER_CARE_DEPARTMENT, filters],
    queryFn: () =>
      getTicketDashboardOverview({
        ...filters,
        ...ticketScope,
      }),
    staleTime: 60_000,
    refetchInterval: 60_000,
  });

  const ticketsQuery = useQuery({
    queryKey: ["customer-care-dashboard", "tickets", CUSTOMER_CARE_DEPARTMENT, filters],
    queryFn: () =>
      getTickets({
        page: 1,
        limit: 200,
        sortBy: "updatedAt",
        sortOrder: "desc",
        ...ticketScope,
        ...filters,
      }),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  const leadsQuery = useQuery({
    queryKey: ["customer-care-dashboard", "leads", filters],
    queryFn: async () => {
      try {
        const response = await apiClient.get("/api/properties/leads/admin/overview", {
          params: { page: 1, limit: 50, ...filters },
        });
        const payload = response.data?.data || response.data || {};
        return payload.leads || payload.items || [];
      } catch {
        return [];
      }
    },
    staleTime: 60_000,
    refetchInterval: 120_000,
  });

  const usersQuery = useQuery({
    queryKey: ["customer-care-dashboard", "users"],
    queryFn: async () =>
      safeList(async () => {
        const response = await getAllUsers();
        return Array.isArray(response?.data) ? response.data : response?.data?.users || [];
      }, []),
    staleTime: 60_000,
    refetchInterval: 60_000,
  });

  const currentUserQuery = useQuery({
    queryKey: ["customer-care-dashboard", "current-user"],
    queryFn: async () => {
      const response = await getUserDetails();
      return response?.data?.user || response?.data || null;
    },
    staleTime: 120_000,
  });

  const trendsQuery = useQuery({
    queryKey: ["customer-care-dashboard", "trends", CUSTOMER_CARE_DEPARTMENT, filters, trendDays],
    queryFn: () =>
      getTicketDashboardTrends({
        days: trendDays,
        ...filters,
        ...ticketScope,
      }),
    staleTime: 120_000,
  });

  const projectsQuery = useQuery({
    queryKey: ["customer-care-dashboard", "projects", filters],
    queryFn: () =>
      safeList(async () => {
        const response = await getAllProjectsAnalytics(filters);
        return response?.data?.data || response?.data || {};
      }, {}),
    staleTime: 60_000,
    refetchInterval: 120_000,
  });

  const propertiesQuery = useQuery({
    queryKey: ["customer-care-dashboard", "properties", filters],
    queryFn: () =>
      safeList(async () => {
        const response = await getAllPropertiesAnalytics(filters);
        return response?.data?.data || response?.data || {};
      }, {}),
    staleTime: 60_000,
    refetchInterval: 120_000,
  });

  const tickets = unpackTickets(ticketsQuery.data);

  const derived = useMemo(
    () =>
      mapCustomerCareData({
        overview: overviewQuery.data?.data || overviewQuery.data || {},
        tickets,
        users: usersQuery.data || [],
        leads: leadsQuery.data || [],
        currentUser: currentUserQuery.data,
        trends: trendsQuery.data?.data || trendsQuery.data || {},
        projectsToday: projectsQuery.data || {},
        propertiesToday: propertiesQuery.data || {},
        range,
      }),
    [
      currentUserQuery.data,
      leadsQuery.data,
      overviewQuery.data,
      projectsQuery.data,
      propertiesQuery.data,
      range,
      tickets,
      trendsQuery.data,
      usersQuery.data,
    ],
  );

  return {
    ...derived,
    ...dateRange,
    rangeLabel: dateRange.rangeLabel || derived.rangeLabel,
    tickets,
    overviewQuery,
    ticketsQuery,
    leadsQuery,
    usersQuery,
    currentUserQuery,
    trendsQuery,
    projectsTodayQuery: projectsQuery,
    propertiesTodayQuery: propertiesQuery,
    isLoading: overviewQuery.isLoading || ticketsQuery.isLoading || currentUserQuery.isLoading,
    isFetching:
      overviewQuery.isFetching ||
      ticketsQuery.isFetching ||
      leadsQuery.isFetching ||
      usersQuery.isFetching ||
      currentUserQuery.isFetching ||
      projectsQuery.isFetching ||
      propertiesQuery.isFetching ||
      trendsQuery.isFetching,
    isError: overviewQuery.isError || ticketsQuery.isError || currentUserQuery.isError,
    error: overviewQuery.error || ticketsQuery.error || currentUserQuery.error,
    refetch: async () => {
      await Promise.allSettled([
        overviewQuery.refetch(),
        ticketsQuery.refetch(),
        leadsQuery.refetch(),
        usersQuery.refetch(),
        currentUserQuery.refetch(),
        trendsQuery.refetch(),
        projectsQuery.refetch(),
        propertiesQuery.refetch(),
      ]);
    },
  };
}
