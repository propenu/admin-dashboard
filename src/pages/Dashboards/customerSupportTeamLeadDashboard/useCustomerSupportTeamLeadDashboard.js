import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../../api/apiClient";
import {
  getTicketAgentPerformance,
  getTicketDashboardOverview,
  getTicketDashboardTrends,
  getTickets,
} from "../../../features/ticket/ticket_system";
import { getUserDetails } from "../../../features/user/userService";
import { SERVICES } from "../../../config/services";
import { useDashboardDateRange } from "../shared/useDashboardDateRange";
import { mapCustomerSupportTeamLeadData } from "./customerSupportTeamLeadDashboardData";

const CUSTOMER_CARE_DEPARTMENT = "customer-care";

const safeList = async (fn, fallback = []) => {
  try {
    return await fn();
  } catch {
    return fallback;
  }
};

/** Staff under the team lead (hierarchy), not platform end-users. */
const fetchTeamMembers = async () => {
  try {
    const response = await apiClient.get(`${SERVICES.USER}/auth/all-users`, {
      params: { scope: "team_directory" },
    });
    const payload = response?.data;
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.users)) return payload.users;
    return [];
  } catch {
    return [];
  }
};

export function useCustomerSupportTeamLeadDashboard() {
  const dateRange = useDashboardDateRange("30d");
  const { range, filters } = dateRange;
  const trendDays = range.days || 7;

  const overviewQuery = useQuery({
    queryKey: [
      "customer-support-team-lead-dashboard",
      "overview",
      CUSTOMER_CARE_DEPARTMENT,
      filters,
    ],
    queryFn: () =>
      getTicketDashboardOverview({
        from: filters.from,
        to: filters.to,
        scope: "customer_care",
        department: CUSTOMER_CARE_DEPARTMENT,
      }),
    staleTime: 60_000,
    refetchInterval: 60_000,
  });

  const ticketsQuery = useQuery({
    queryKey: ["customer-support-team-lead-dashboard", "tickets", CUSTOMER_CARE_DEPARTMENT],
    queryFn: () =>
      getTickets({
        page: 1,
        limit: 80,
        sortBy: "updatedAt",
        sortOrder: "desc",
        department: CUSTOMER_CARE_DEPARTMENT,
      }),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  const agentsQuery = useQuery({
    queryKey: [
      "customer-support-team-lead-dashboard",
      "agents",
      CUSTOMER_CARE_DEPARTMENT,
      filters,
    ],
    queryFn: () =>
      safeList(async () => {
        const data = await getTicketAgentPerformance({
          department: CUSTOMER_CARE_DEPARTMENT,
          from: filters.from,
          to: filters.to,
        });
        return Array.isArray(data) ? data : data?.data || [];
      }, []),
    staleTime: 60_000,
    refetchInterval: 60_000,
  });

  const teamUsersQuery = useQuery({
    queryKey: ["customer-support-team-lead-dashboard", "team-users"],
    queryFn: fetchTeamMembers,
    staleTime: 60_000,
    refetchInterval: 60_000,
  });

  const currentUserQuery = useQuery({
    queryKey: ["customer-support-team-lead-dashboard", "current-user"],
    queryFn: async () => {
      const response = await getUserDetails();
      return response?.data?.user || response?.data || null;
    },
    staleTime: 120_000,
  });

  const trendsQuery = useQuery({
    queryKey: [
      "customer-support-team-lead-dashboard",
      "trends",
      CUSTOMER_CARE_DEPARTMENT,
      filters,
      trendDays,
    ],
    queryFn: () =>
      getTicketDashboardTrends({
        days: trendDays,
        from: filters.from,
        to: filters.to,
        scope: "customer_care",
        department: CUSTOMER_CARE_DEPARTMENT,
      }),
    staleTime: 120_000,
  });

  const tickets = ticketsQuery.data?.data || ticketsQuery.data || [];

  const derived = useMemo(
    () =>
      mapCustomerSupportTeamLeadData({
        overview: overviewQuery.data?.data || overviewQuery.data || {},
        tickets,
        teamUsers: teamUsersQuery.data || [],
        agentPerformance: agentsQuery.data || [],
        currentUser: currentUserQuery.data,
        trends: trendsQuery.data?.data || trendsQuery.data || {},
      }),
    [
      agentsQuery.data,
      currentUserQuery.data,
      overviewQuery.data,
      teamUsersQuery.data,
      tickets,
      trendsQuery.data,
    ],
  );

  return {
    ...derived,
    ...dateRange,
    tickets,
    overviewQuery,
    ticketsQuery,
    agentsQuery,
    teamUsersQuery,
    currentUserQuery,
    trendsQuery,
    isLoading: overviewQuery.isLoading || ticketsQuery.isLoading || currentUserQuery.isLoading,
    isFetching:
      overviewQuery.isFetching ||
      ticketsQuery.isFetching ||
      agentsQuery.isFetching ||
      teamUsersQuery.isFetching ||
      currentUserQuery.isFetching ||
      trendsQuery.isFetching,
    isError: overviewQuery.isError || ticketsQuery.isError || currentUserQuery.isError,
    error: overviewQuery.error || ticketsQuery.error || currentUserQuery.error,
    refetch: async () => {
      await Promise.allSettled([
        overviewQuery.refetch(),
        ticketsQuery.refetch(),
        agentsQuery.refetch(),
        teamUsersQuery.refetch(),
        currentUserQuery.refetch(),
        trendsQuery.refetch(),
      ]);
    },
  };
}
