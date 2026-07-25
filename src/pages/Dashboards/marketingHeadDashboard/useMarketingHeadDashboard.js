import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../../api/apiClient";
import { getAllProjectsAnalytics, getAllPropertiesAnalytics } from "../../../features/property/propertyService";
import {
  getCanpaingsAnalytics,
  getRunningCampaigns,
  getUserDetails,
} from "../../../features/user/userService";
import { SERVICES } from "../../../config/services";
import { useDashboardDateRange } from "../shared/useDashboardDateRange";
import { DATE_PRESETS, mapMarketingHeadData } from "./marketingHeadDashboardData";

const safe = async (fn, fallback) => {
  try {
    return await fn();
  } catch {
    return fallback;
  }
};

const unpackAnalytics = (response) => response?.data?.data || response?.data || {};

export function useMarketingHeadDashboard() {
  const dateRange = useDashboardDateRange("30d", DATE_PRESETS);
  const [city, setCity] = useState("");
  const { range, filters: dateFilters } = dateRange;

  const filters = useMemo(
    () => ({
      ...dateFilters,
      ...(city ? { city } : {}),
    }),
    [city, dateFilters],
  );

  const currentUserQuery = useQuery({
    queryKey: ["marketing-head-dashboard", "me"],
    queryFn: async () => {
      const response = await getUserDetails();
      return response?.data?.user || response?.data || null;
    },
    staleTime: 120_000,
  });

  const leadsQuery = useQuery({
    queryKey: ["marketing-head-dashboard", "leads", filters],
    queryFn: () =>
      safe(async () => {
        const response = await apiClient.get("/api/properties/leads/admin/overview", {
          params: { page: 1, limit: 50, ...filters },
        });
        return response?.data?.data || response?.data || {};
      }, {}),
    staleTime: 60_000,
    refetchInterval: 120_000,
  });

  const projectsQuery = useQuery({
    queryKey: ["marketing-head-dashboard", "projects", filters],
    queryFn: () =>
      safe(async () => {
        const response = await getAllProjectsAnalytics(filters);
        return unpackAnalytics(response);
      }, {}),
    staleTime: 60_000,
    refetchInterval: 120_000,
  });

  const propertiesQuery = useQuery({
    queryKey: ["marketing-head-dashboard", "properties", filters],
    queryFn: () =>
      safe(async () => {
        const response = await getAllPropertiesAnalytics(filters);
        return unpackAnalytics(response);
      }, {}),
    staleTime: 60_000,
    refetchInterval: 120_000,
  });

  const campaignsQuery = useQuery({
    queryKey: ["marketing-head-dashboard", "email-campaigns"],
    queryFn: () =>
      safe(async () => {
        const response = await getCanpaingsAnalytics();
        return response?.data?.data || response?.data || [];
      }, []),
    staleTime: 90_000,
  });

  const runningCampaignsQuery = useQuery({
    queryKey: ["marketing-head-dashboard", "running-campaigns"],
    queryFn: () =>
      safe(async () => {
        const response = await getRunningCampaigns();
        return response?.data?.data || response?.data || [];
      }, []),
    staleTime: 90_000,
  });

  const whatsappQuery = useQuery({
    queryKey: ["marketing-head-dashboard", "whatsapp-stats"],
    queryFn: () =>
      safe(async () => {
        const response = await apiClient.get(`${SERVICES.USER}/whatsapp/whatsapp-logs/stats`);
        return response?.data?.data || response?.data || {};
      }, {}),
    staleTime: 90_000,
  });

  const leadPayload = leadsQuery.data || {};
  const leadSummary = leadPayload.summary || leadPayload;
  const facets = leadPayload.facets || {};

  const mapped = useMemo(
    () =>
      mapMarketingHeadData({
        leadSummary,
        projectsAnalytics: projectsQuery.data || {},
        propertiesAnalytics: propertiesQuery.data || {},
        emailCampaigns: campaignsQuery.data || [],
        whatsappStats: whatsappQuery.data || {},
        runningCampaigns: runningCampaignsQuery.data || [],
        currentUser: currentUserQuery.data,
        range,
      }),
    [
      campaignsQuery.data,
      currentUserQuery.data,
      leadSummary,
      projectsQuery.data,
      propertiesQuery.data,
      range,
      runningCampaignsQuery.data,
      whatsappQuery.data,
    ],
  );

  const queries = [
    currentUserQuery,
    leadsQuery,
    projectsQuery,
    propertiesQuery,
    campaignsQuery,
    runningCampaignsQuery,
    whatsappQuery,
  ];

  return {
    ...mapped,
    ...dateRange,
    city,
    setCity,
    cities: Array.isArray(facets.cities) ? facets.cities : [],
    isLoading: leadsQuery.isLoading || projectsQuery.isLoading || currentUserQuery.isLoading,
    isFetching: queries.some((q) => q.isFetching),
    isError: leadsQuery.isError && projectsQuery.isError,
    refetch: async () => {
      await Promise.allSettled(queries.map((q) => q.refetch()));
    },
    leadsQuery,
    projectsQuery,
  };
}
