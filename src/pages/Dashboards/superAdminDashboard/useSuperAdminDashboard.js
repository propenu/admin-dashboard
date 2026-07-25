import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../../api/apiClient";
import {
  getAccountsSummary,
  getActiveSubscriptions,
  getPaymentsList,
  getRevenueByPlan,
} from "../../../features/payment/paymentServices";
import {
  getAllProjectsAnalytics,
  getAllPropertiesAnalytics,
  getBlogs,
  getSuperAdimnAnalytics,
} from "../../../features/property/propertyService";
import { getAllUsers, getUserDetails } from "../../../features/user/userService";
import { getTicketDashboardOverview } from "../../../features/ticket/ticket_system";
import { useDashboardDateRange } from "../shared/useDashboardDateRange";
import { DATE_PRESETS } from "../shared/dashboardDateRange";
import { mapSuperAdminData } from "./superAdminDashboardData";

const safe = async (fn, fallback) => {
  try {
    return await fn();
  } catch {
    return fallback;
  }
};

const unpackAnalytics = (response) => response?.data?.data || response?.data || {};

export function useSuperAdminDashboard() {
  const dateRange = useDashboardDateRange("30d", DATE_PRESETS);
  const { range, filters } = dateRange;

  const currentUserQuery = useQuery({
    queryKey: ["super-admin-dashboard", "me"],
    queryFn: async () => {
      const response = await getUserDetails();
      return response?.data?.user || response?.data || null;
    },
    staleTime: 120_000,
  });

  const summaryQuery = useQuery({
    queryKey: ["super-admin-dashboard", "summary", filters],
    queryFn: () =>
      safe(async () => {
        const response = await getAccountsSummary(filters);
        return response?.data?.data || response?.data || {};
      }, {}),
    staleTime: 60_000,
    refetchInterval: 120_000,
  });

  const plansQuery = useQuery({
    queryKey: ["super-admin-dashboard", "plans", filters],
    queryFn: () =>
      safe(async () => {
        const response = await getRevenueByPlan(filters);
        return response?.data?.data || response?.data || [];
      }, []),
    staleTime: 90_000,
  });

  // Active subs are a live snapshot (not period-created); keep unfiltered.
  const subsQuery = useQuery({
    queryKey: ["super-admin-dashboard", "subs"],
    queryFn: () =>
      safe(async () => {
        const response = await getActiveSubscriptions({ status: "active" });
        return response?.data?.data || response?.data || [];
      }, []),
    staleTime: 90_000,
  });

  const paidQuery = useQuery({
    queryKey: ["super-admin-dashboard", "paid", filters],
    queryFn: () =>
      safe(async () => {
        const response = await getPaymentsList("paid", { ...filters, limit: 500, page: 1 });
        return response?.data || {};
      }, {}),
    staleTime: 60_000,
  });

  const failedQuery = useQuery({
    queryKey: ["super-admin-dashboard", "failed", filters],
    queryFn: () =>
      safe(async () => {
        const response = await getPaymentsList("failed", { ...filters, limit: 500, page: 1 });
        return response?.data || {};
      }, {}),
    staleTime: 60_000,
  });

  const platformQuery = useQuery({
    queryKey: ["super-admin-dashboard", "platform"],
    queryFn: () =>
      safe(async () => {
        const response = await getSuperAdimnAnalytics();
        return response?.data?.data || response?.data || {};
      }, {}),
    staleTime: 60_000,
  });

  const projectsQuery = useQuery({
    queryKey: ["super-admin-dashboard", "projects", filters],
    queryFn: () =>
      safe(async () => {
        const response = await getAllProjectsAnalytics(filters);
        return unpackAnalytics(response);
      }, {}),
    staleTime: 60_000,
  });

  const propertiesQuery = useQuery({
    queryKey: ["super-admin-dashboard", "properties", filters],
    queryFn: () =>
      safe(async () => {
        const response = await getAllPropertiesAnalytics(filters);
        return unpackAnalytics(response);
      }, {}),
    staleTime: 60_000,
  });

  const leadsQuery = useQuery({
    queryKey: ["super-admin-dashboard", "leads", filters],
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
    queryKey: ["super-admin-dashboard", "tickets", filters],
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

  const blogsQuery = useQuery({
    queryKey: ["super-admin-dashboard", "blogs"],
    queryFn: () =>
      safe(async () => {
        const response = await getBlogs();
        return response?.data || {};
      }, {}),
    staleTime: 90_000,
  });

  // Users API has no date params — fetch once, filter by range in mapSuperAdminData.
  const usersQuery = useQuery({
    queryKey: ["super-admin-dashboard", "users"],
    queryFn: () =>
      safe(async () => {
        const response = await getAllUsers();
        return response?.data || [];
      }, []),
    staleTime: 90_000,
  });

  const mapped = useMemo(
    () =>
      mapSuperAdminData({
        currentUser: currentUserQuery.data,
        summary: summaryQuery.data || {},
        revenueByPlan: plansQuery.data || [],
        subscriptions: subsQuery.data || [],
        paidPayments: paidQuery.data || {},
        failedPayments: failedQuery.data || {},
        platformAnalytics: platformQuery.data || {},
        projectsAnalytics: projectsQuery.data || {},
        propertiesAnalytics: propertiesQuery.data || {},
        leadSummary: leadsQuery.data || {},
        ticketOverview: ticketsQuery.data || {},
        blogsPayload: blogsQuery.data || {},
        usersPayload: usersQuery.data || [],
        range,
      }),
    [
      blogsQuery.data,
      currentUserQuery.data,
      failedQuery.data,
      leadsQuery.data,
      paidQuery.data,
      plansQuery.data,
      platformQuery.data,
      projectsQuery.data,
      propertiesQuery.data,
      range,
      subsQuery.data,
      summaryQuery.data,
      ticketsQuery.data,
      usersQuery.data,
    ],
  );

  const isLoading = summaryQuery.isLoading || platformQuery.isLoading || currentUserQuery.isLoading;
  const isFetching = [
    summaryQuery,
    plansQuery,
    subsQuery,
    paidQuery,
    failedQuery,
    platformQuery,
    projectsQuery,
    propertiesQuery,
    leadsQuery,
    ticketsQuery,
    blogsQuery,
    usersQuery,
    currentUserQuery,
  ].some((q) => q.isFetching);

  const refetch = async () => {
    await Promise.allSettled([
      currentUserQuery.refetch(),
      summaryQuery.refetch(),
      plansQuery.refetch(),
      subsQuery.refetch(),
      paidQuery.refetch(),
      failedQuery.refetch(),
      platformQuery.refetch(),
      projectsQuery.refetch(),
      propertiesQuery.refetch(),
      leadsQuery.refetch(),
      ticketsQuery.refetch(),
      blogsQuery.refetch(),
      usersQuery.refetch(),
    ]);
  };

  return {
    ...mapped,
    ...dateRange,
    isLoading,
    isFetching,
    refetch,
  };
}
