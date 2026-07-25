import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getBlogs, getAllProjectsAnalytics, getAllPropertiesAnalytics } from "../../../features/property/propertyService";
import { getUserDetails } from "../../../features/user/userService";
import { useDashboardDateRange } from "../shared/useDashboardDateRange";
import { DATE_PRESETS, mapContentTeamData } from "./contentTeamDashboardData";

const safe = async (fn, fallback) => {
  try {
    return await fn();
  } catch {
    return fallback;
  }
};

const unpackAnalytics = (response) => response?.data?.data || response?.data || {};

export function useContentTeamDashboard() {
  const dateRange = useDashboardDateRange("30d", DATE_PRESETS);
  const { range, filters } = dateRange;

  const currentUserQuery = useQuery({
    queryKey: ["content-team-dashboard", "me"],
    queryFn: async () => {
      const response = await getUserDetails();
      return response?.data?.user || response?.data || null;
    },
    staleTime: 120_000,
  });

  const blogsQuery = useQuery({
    queryKey: ["content-team-dashboard", "blogs"],
    queryFn: () =>
      safe(async () => {
        const response = await getBlogs();
        return response?.data || {};
      }, {}),
    staleTime: 60_000,
    refetchInterval: 120_000,
  });

  const projectsQuery = useQuery({
    queryKey: ["content-team-dashboard", "projects", filters],
    queryFn: () =>
      safe(async () => {
        const response = await getAllProjectsAnalytics(filters);
        return unpackAnalytics(response);
      }, {}),
    staleTime: 120_000,
  });

  const propertiesQuery = useQuery({
    queryKey: ["content-team-dashboard", "properties", filters],
    queryFn: () =>
      safe(async () => {
        const response = await getAllPropertiesAnalytics(filters);
        return unpackAnalytics(response);
      }, {}),
    staleTime: 120_000,
  });

  const mapped = useMemo(
    () =>
      mapContentTeamData({
        blogsPayload: blogsQuery.data,
        projectsAnalytics: projectsQuery.data || {},
        propertiesAnalytics: propertiesQuery.data || {},
        currentUser: currentUserQuery.data,
        range,
      }),
    [
      blogsQuery.data,
      currentUserQuery.data,
      projectsQuery.data,
      propertiesQuery.data,
      range,
    ],
  );

  const queries = [currentUserQuery, blogsQuery, projectsQuery, propertiesQuery];

  return {
    ...mapped,
    ...dateRange,
    isLoading: blogsQuery.isLoading || currentUserQuery.isLoading,
    isFetching: queries.some((q) => q.isFetching),
    isError: blogsQuery.isError,
    refetch: async () => {
      await Promise.allSettled(queries.map((q) => q.refetch()));
    },
  };
}
