import { useMemo } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { apiClient } from "../../../api/apiClient";
import {
  getAccountsSummary,
  getPaymentsList,
  getRevenueByPlan,
} from "../../../features/payment/paymentServices";
import {
  getAllProjectsAnalytics,
  getAllPropertiesAnalytics,
  getBlogsPage,
  getSuperAdimnAnalytics,
} from "../../../features/property/propertyService";
import {
  getDashboardUserCounts,
  getUserCountSnapshot,
} from "../../../features/user/userService";
import { useAuthUserProfile } from "../../../hooks/useAuthUser";
import { getTicketDashboardOverview } from "../../../features/ticket/ticket_system";
import { getPlatformEngagement } from "../../../features/activity/allUsersActivityService";
import { useDashboardDateRange } from "../shared/useDashboardDateRange";
import { DATE_PRESETS, todayIso } from "../shared/dashboardDateRange";
import { mapSuperAdminData } from "./superAdminDashboardData";

const unpackAnalytics = (response) => response?.data?.data || response?.data || {};

const emptyUserCounts = {
  periodTotal: 0,
  todayTotal: 0,
  loginToday: 0,
  active: 0,
  locPending: 0,
  kycPending: 0,
  kycRejected: 0,
  onboarding: 0,
  roles: { user: 0, builder: 0, builder_staff: 0, agent: 0 },
};

const asCount = (snapshot) => Number(snapshot?.total) || 0;

function normalizeUserCounts(payload = {}) {
  return {
    periodTotal: Number(payload.periodTotal) || 0,
    todayTotal: Number(payload.todayTotal) || 0,
    loginToday: Number(payload.loginToday) || 0,
    active: Number(payload.active) || 0,
    locPending: Number(payload.locPending) || 0,
    kycPending: Number(payload.kycPending) || 0,
    kycRejected: Number(payload.kycRejected) || 0,
    onboarding: Number(payload.onboarding) || 0,
    roles: {
      user: Number(payload.roles?.user) || 0,
      agent: Number(payload.roles?.agent) || 0,
      builder: Number(payload.roles?.builder) || 0,
      builder_staff: Number(payload.roles?.builder_staff) || 0,
    },
  };
}

async function loadUserCounts(filters, signal) {
  const cfg = { signal };
  try {
    const snapshot = await getDashboardUserCounts(filters, cfg);
    if (snapshot && typeof snapshot === "object" && snapshot.periodTotal != null) {
      return normalizeUserCounts(snapshot);
    }
  } catch (error) {
    const status = error?.response?.status;
    if (error?.code === "ERR_CANCELED" || error?.name === "CanceledError") {
      throw error;
    }
    if (status && status !== 404) throw error;
  }

  const range = {
    createdFrom: filters.from || undefined,
    createdTo: filters.to || undefined,
  };
  const today = todayIso();
  const [period, todayCreated, loginToday] = await Promise.all([
    getUserCountSnapshot(range, cfg),
    getUserCountSnapshot({ createdFrom: today, createdTo: today }, cfg),
    getUserCountSnapshot({ lastLoginFrom: today, lastLoginTo: today }, cfg),
  ]);

  return {
    ...emptyUserCounts,
    periodTotal: asCount(period),
    todayTotal: asCount(todayCreated),
    loginToday: asCount(loginToday),
    roles: {
      user: Number(period?.roleCounts?.user) || 0,
      agent: Number(period?.roleCounts?.agent) || 0,
      builder: Number(period?.roleCounts?.builder) || 0,
      builder_staff: Number(period?.roleCounts?.builder_staff) || 0,
    },
  };
}

const sharedQuery = {
  staleTime: 60_000,
  gcTime: 15 * 60_000,
  placeholderData: keepPreviousData,
  refetchOnWindowFocus: false,
  refetchIntervalInBackground: false,
  retry: 1,
};

export function useSuperAdminDashboard() {
  const dateRange = useDashboardDateRange("today", DATE_PRESETS, {
    syncUrl: true,
  });
  const { range, filters } = dateRange;
  const { user: currentUser } = useAuthUserProfile();

  const summaryQuery = useQuery({
    ...sharedQuery,
    queryKey: ["super-admin-dashboard", "summary", filters],
    queryFn: async ({ signal }) => {
      const response = await getAccountsSummary(filters, { signal });
      return response?.data?.data || response?.data || {};
    },
    refetchInterval: 120_000,
  });

  const plansQuery = useQuery({
    ...sharedQuery,
    staleTime: 90_000,
    queryKey: ["super-admin-dashboard", "plans", filters],
    queryFn: async ({ signal }) => {
      const response = await getRevenueByPlan(filters, { signal });
      return response?.data?.data || response?.data || [];
    },
  });

  const paidQuery = useQuery({
    ...sharedQuery,
    queryKey: ["super-admin-dashboard", "paid-count", filters],
    queryFn: async ({ signal }) => {
      const response = await getPaymentsList(
        "paid",
        { ...filters, limit: 1, page: 1 },
        { signal },
      );
      const payload = response?.data || {};
      return { total: Number(payload.total) || 0 };
    },
  });

  const platformQuery = useQuery({
    ...sharedQuery,
    queryKey: ["super-admin-dashboard", "platform"],
    queryFn: async ({ signal }) => {
      const response = await getSuperAdimnAnalytics({ signal });
      return response?.data?.data || response?.data || {};
    },
  });

  const projectsQuery = useQuery({
    ...sharedQuery,
    queryKey: ["super-admin-dashboard", "projects", filters],
    queryFn: async ({ signal }) => {
      const response = await getAllProjectsAnalytics(filters, { signal });
      return unpackAnalytics(response);
    },
  });

  const propertiesQuery = useQuery({
    ...sharedQuery,
    queryKey: ["super-admin-dashboard", "properties", filters],
    queryFn: async ({ signal }) => {
      const response = await getAllPropertiesAnalytics(filters, { signal });
      return unpackAnalytics(response);
    },
  });

  const leadsQuery = useQuery({
    ...sharedQuery,
    queryKey: ["super-admin-dashboard", "leads", filters],
    queryFn: async ({ signal }) => {
      const response = await apiClient.get("/api/properties/leads/admin/overview", {
        params: { page: 1, limit: 1, summaryOnly: 1, ...filters },
        signal,
      });
      const payload = response?.data?.data || response?.data || {};
      return payload.summary || payload;
    },
  });

  const ticketsQuery = useQuery({
    ...sharedQuery,
    queryKey: ["super-admin-dashboard", "tickets", filters],
    queryFn: ({ signal }) =>
      getTicketDashboardOverview(
        {
          from: filters.from ? `${filters.from}T00:00:00.000+05:30` : undefined,
          to: filters.to ? `${filters.to}T23:59:59.999+05:30` : undefined,
        },
        { signal },
      ),
  });

  const blogsQuery = useQuery({
    ...sharedQuery,
    staleTime: 90_000,
    queryKey: ["super-admin-dashboard", "blogs-counts"],
    queryFn: async ({ signal }) => {
      const [published, drafts] = await Promise.all([
        getBlogsPage({ published: true, page: 1, limit: 1 }, { signal }),
        getBlogsPage({ published: false, page: 1, limit: 1 }, { signal }),
      ]);
      return {
        published: Number(published?.total) || 0,
        drafts: Number(drafts?.total) || 0,
      };
    },
  });

  const usersQuery = useQuery({
    ...sharedQuery,
    staleTime: 90_000,
    queryKey: ["super-admin-dashboard", "user-counts", filters],
    queryFn: ({ signal }) => loadUserCounts(filters, signal),
  });

  const engagementQuery = useQuery({
    ...sharedQuery,
    queryKey: ["super-admin-dashboard", "engagement", filters, dateRange.preset],
    queryFn: async ({ signal }) => {
      const params = {
        range: dateRange.preset === "custom" ? "custom" : dateRange.preset,
        ...filters,
      };
      return getPlatformEngagement(params, { signal });
    },
    refetchInterval: 120_000,
  });

  const mapped = useMemo(
    () =>
      mapSuperAdminData({
        currentUser,
        summary: summaryQuery.data || {},
        revenueByPlan: plansQuery.data || [],
        subscriptions: [],
        paidPayments: paidQuery.data || {},
        failedPayments: {},
        platformAnalytics: platformQuery.data || {},
        projectsAnalytics: projectsQuery.data || {},
        propertiesAnalytics: propertiesQuery.data || {},
        leadSummary: leadsQuery.data || {},
        ticketOverview: ticketsQuery.data || {},
        blogsPayload: blogsQuery.data || {},
        userCounts: usersQuery.data || emptyUserCounts,
        range,
        preset: dateRange.preset,
      }),
    [
      blogsQuery.data,
      currentUser,
      dateRange.preset,
      leadsQuery.data,
      paidQuery.data,
      plansQuery.data,
      platformQuery.data,
      projectsQuery.data,
      propertiesQuery.data,
      range,
      summaryQuery.data,
      ticketsQuery.data,
      usersQuery.data,
    ],
  );

  const sectionLoading = {
    summary: summaryQuery.isLoading,
    users: usersQuery.isLoading,
    inventory: propertiesQuery.isLoading || projectsQuery.isLoading,
    leads: leadsQuery.isLoading,
    tickets: ticketsQuery.isLoading,
    finance: summaryQuery.isLoading || plansQuery.isLoading || paidQuery.isLoading,
    blogs: blogsQuery.isLoading,
    engagement: engagementQuery.isLoading,
  };

  const sectionError = {
    summary: summaryQuery.isError,
    users: usersQuery.isError,
    inventory: propertiesQuery.isError || projectsQuery.isError,
    leads: leadsQuery.isError,
    tickets: ticketsQuery.isError,
    finance: summaryQuery.isError,
    blogs: blogsQuery.isError,
    engagement: engagementQuery.isError,
  };

  const kpiLoading = {
    revenue: summaryQuery.isLoading && !summaryQuery.data,
    users: usersQuery.isLoading && !usersQuery.data,
    listings: propertiesQuery.isLoading && !propertiesQuery.data,
    projects: projectsQuery.isLoading && !projectsQuery.data,
    leads: leadsQuery.isLoading && !leadsQuery.data,
    tickets: ticketsQuery.isLoading && !ticketsQuery.data,
    subs: summaryQuery.isLoading && !summaryQuery.data,
  };

  const kpisReady = Object.values(kpiLoading).every((loading) => !loading);

  const isFetching = [
    summaryQuery,
    plansQuery,
    paidQuery,
    platformQuery,
    projectsQuery,
    propertiesQuery,
    leadsQuery,
    ticketsQuery,
    blogsQuery,
    usersQuery,
    engagementQuery,
  ].some((q) => q.isFetching);

  const refetch = async () => {
    await Promise.allSettled([
      summaryQuery.refetch(),
      plansQuery.refetch(),
      paidQuery.refetch(),
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

  const retrySection = (section) => {
    const map = {
      summary: summaryQuery.refetch,
      users: usersQuery.refetch,
      inventory: () =>
        Promise.allSettled([propertiesQuery.refetch(), projectsQuery.refetch()]),
      leads: leadsQuery.refetch,
      tickets: ticketsQuery.refetch,
      finance: () =>
        Promise.allSettled([
          summaryQuery.refetch(),
          plansQuery.refetch(),
          paidQuery.refetch(),
        ]),
      blogs: blogsQuery.refetch,
      engagement: engagementQuery.refetch,
    };
    return map[section]?.();
  };

  return {
    ...mapped,
    ...dateRange,
    engagement: engagementQuery.data,
    engagementLoading: engagementQuery.isLoading,
    engagementError: engagementQuery.isError,
    kpisReady,
    kpiLoading,
    sectionLoading,
    sectionError,
    retrySection,
    isLoading: summaryQuery.isLoading && !summaryQuery.data,
    isFetching,
    refetch,
  };
}
