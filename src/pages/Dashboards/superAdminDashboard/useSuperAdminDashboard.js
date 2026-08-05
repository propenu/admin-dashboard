import { useMemo } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
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
import { getPlatformEngagement } from "../../../features/activity/allUsersActivityService";
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
  const dateRange = useDashboardDateRange("today", DATE_PRESETS);
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

  // Active subs created/started within the selected date window (Today by default).
  const subsQuery = useQuery({
    queryKey: ["super-admin-dashboard", "subs", filters],
    queryFn: () =>
      safe(async () => {
        const response = await getActiveSubscriptions({
          status: "active",
          ...filters,
        });
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

  // Fetch users once for journey tracking (login/stuck need full set; period filter in mapper).
  const usersQuery = useQuery({
    queryKey: ["super-admin-dashboard", "users"],
    queryFn: () =>
      safe(async () => {
        const response = await getAllUsers();
        return response?.data || [];
      }, []),
    staleTime: 90_000,
  });

  const emptyEngagement = (granularity = "day") => ({
    summary: { clicks: 0, views: 0, actions: 0, clickRate: null },
    daily: [],
    actionMix: [],
    topEvents: [],
    granularity,
  });

  const engagementQuery = useQuery({
    queryKey: ["super-admin-dashboard", "engagement", filters, dateRange.preset],
    queryFn: async () => {
      const params = {
        range: dateRange.preset === "custom" ? "custom" : dateRange.preset,
        ...filters,
      };
      try {
        return await getPlatformEngagement(params);
      } catch (error) {
        const status = error?.response?.status;
        if (status === 401 || status === 403) throw error;
        return emptyEngagement(dateRange.preset === "today" ? "hour" : "day");
      }
    },
    staleTime: 60_000,
    refetchInterval: 120_000,
    placeholderData: keepPreviousData,
    retry: false,
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
        preset: dateRange.preset,
      }),
    [
      blogsQuery.data,
      currentUserQuery.data,
      dateRange.preset,
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
    engagementQuery,
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
      engagementQuery.refetch(),
    ]);
  };

  return {
    ...mapped,
    ...dateRange,
    engagement: engagementQuery.data,
    engagementLoading: engagementQuery.isLoading,
    engagementError: engagementQuery.isError,
    isLoading,
    isFetching,
    refetch,
  };
}
