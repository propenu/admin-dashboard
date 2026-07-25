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
import { mapCeoData } from "./ceoDashboardData";

const safe = async (fn, fallback) => {
  try {
    return await fn();
  } catch {
    return fallback;
  }
};

const unpackAnalytics = (response) => response?.data?.data || response?.data || {};

export function useCeoDashboard() {
  const dateRange = useDashboardDateRange("30d", DATE_PRESETS);
  const { range, filters } = dateRange;

  const currentUserQuery = useQuery({
    queryKey: ["ceo-dashboard", "me"],
    queryFn: async () => {
      const response = await getUserDetails();
      return response?.data?.user || response?.data || null;
    },
    staleTime: 120_000,
  });

  const summaryQuery = useQuery({
    queryKey: ["ceo-dashboard", "summary", filters],
    queryFn: () =>
      safe(async () => {
        const response = await getAccountsSummary(filters);
        return response?.data?.data || response?.data || {};
      }, {}),
    staleTime: 60_000,
    refetchInterval: 120_000,
  });

  const plansQuery = useQuery({
    queryKey: ["ceo-dashboard", "plans", filters],
    queryFn: () =>
      safe(async () => {
        const response = await getRevenueByPlan(filters);
        return response?.data?.data || response?.data || [];
      }, []),
    staleTime: 90_000,
  });

  const subsQuery = useQuery({
    queryKey: ["ceo-dashboard", "subs"],
    queryFn: () =>
      safe(async () => {
        const response = await getActiveSubscriptions({ status: "active" });
        return response?.data?.data || response?.data || [];
      }, []),
    staleTime: 90_000,
  });

  const paidQuery = useQuery({
    queryKey: ["ceo-dashboard", "paid", filters],
    queryFn: () =>
      safe(async () => {
        const response = await getPaymentsList("paid", { ...filters, limit: 500, page: 1 });
        return response?.data || {};
      }, {}),
    staleTime: 60_000,
  });

  const failedQuery = useQuery({
    queryKey: ["ceo-dashboard", "failed", filters],
    queryFn: () =>
      safe(async () => {
        const response = await getPaymentsList("failed", { ...filters, limit: 500, page: 1 });
        return response?.data || {};
      }, {}),
    staleTime: 60_000,
  });

  const platformQuery = useQuery({
    queryKey: ["ceo-dashboard", "platform"],
    queryFn: () =>
      safe(async () => {
        const response = await getSuperAdimnAnalytics();
        return response?.data?.data || response?.data || {};
      }, {}),
    staleTime: 60_000,
  });

  const projectsQuery = useQuery({
    queryKey: ["ceo-dashboard", "projects", filters],
    queryFn: () =>
      safe(async () => {
        const response = await getAllProjectsAnalytics(filters);
        return unpackAnalytics(response);
      }, {}),
    staleTime: 60_000,
  });

  const propertiesQuery = useQuery({
    queryKey: ["ceo-dashboard", "properties", filters],
    queryFn: () =>
      safe(async () => {
        const response = await getAllPropertiesAnalytics(filters);
        return unpackAnalytics(response);
      }, {}),
    staleTime: 60_000,
  });

  const leadsQuery = useQuery({
    queryKey: ["ceo-dashboard", "leads", filters],
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
    queryKey: ["ceo-dashboard", "tickets", filters],
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
    queryKey: ["ceo-dashboard", "blogs"],
    queryFn: () =>
      safe(async () => {
        const response = await getBlogs();
        return response?.data || {};
      }, {}),
    staleTime: 90_000,
  });

  const usersQuery = useQuery({
    queryKey: ["ceo-dashboard", "users"],
    queryFn: () =>
      safe(async () => {
        const response = await getAllUsers();
        return response?.data || [];
      }, []),
    staleTime: 90_000,
  });

  const mapped = useMemo(
    () =>
      mapCeoData({
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

  const queries = [
    currentUserQuery,
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
  ];

  return {
    ...mapped,
    ...dateRange,
    isLoading: summaryQuery.isLoading || platformQuery.isLoading || currentUserQuery.isLoading,
    isFetching: queries.some((q) => q.isFetching),
    refetch: async () => {
      await Promise.allSettled(queries.map((q) => q.refetch()));
    },
  };
}
