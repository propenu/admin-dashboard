import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getAllProjectsAnalytics,
  getAllPropertiesAnalytics,
} from "../../../features/property/propertyService";
import { getAllUsers, getUserDetails } from "../../../features/user/userService";
import { useDashboardDateRange } from "../shared/useDashboardDateRange";
import {
  mapRegionalManagerData,
  RM_DATE_PRESETS,
  unpackList,
} from "./regionalManagerDashboardData";

const safe = async (fn, fallback) => {
  try {
    return await fn();
  } catch {
    return fallback;
  }
};

const unpackAnalytics = (response) => response?.data?.data || response?.data || {};

export function useRegionalManagerDashboard() {
  const dateRange = useDashboardDateRange("30d", RM_DATE_PRESETS);
  const { range, filters } = dateRange;
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");

  const currentUserQuery = useQuery({
    queryKey: ["rm-dashboard", "me"],
    queryFn: async () => {
      const response = await getUserDetails();
      return response?.data?.user || response?.data || null;
    },
    staleTime: 120_000,
  });

  const currentUser = currentUserQuery.data;
  const regionState = currentUser?.state || "";

  const analyticsFilters = useMemo(() => {
    const params = { ...filters };
    if (regionState) params.state = regionState;
    if (selectedCity && selectedCity !== "All Cities") params.city = selectedCity;
    return params;
  }, [filters, regionState, selectedCity]);

  const projectsQuery = useQuery({
    queryKey: ["rm-dashboard", "projects", analyticsFilters],
    queryFn: () =>
      safe(async () => unpackAnalytics(await getAllProjectsAnalytics(analyticsFilters)), {}),
    enabled: Boolean(currentUser),
    staleTime: 60_000,
    refetchInterval: 120_000,
  });

  const propertiesQuery = useQuery({
    queryKey: ["rm-dashboard", "properties", analyticsFilters],
    queryFn: () =>
      safe(async () => unpackAnalytics(await getAllPropertiesAnalytics(analyticsFilters)), {}),
    enabled: Boolean(currentUser),
    staleTime: 60_000,
    refetchInterval: 120_000,
  });

  const usersQuery = useQuery({
    queryKey: ["rm-dashboard", "users"],
    queryFn: () =>
      safe(async () => {
        const response = await getAllUsers({ scope: "team_directory" });
        return unpackList(response?.data || response);
      }, []),
    staleTime: 120_000,
  });

  const mapped = useMemo(
    () =>
      mapRegionalManagerData({
        currentUser,
        projectsAnalytics: projectsQuery.data || {},
        propertiesAnalytics: propertiesQuery.data || {},
        usersPayload: usersQuery.data || [],
        range,
        selectedCity,
        selectedStatus,
      }),
    [
      currentUser,
      projectsQuery.data,
      propertiesQuery.data,
      usersQuery.data,
      range,
      selectedCity,
      selectedStatus,
    ],
  );

  const isLoading =
    currentUserQuery.isLoading ||
    (!!currentUser && (projectsQuery.isLoading || propertiesQuery.isLoading));

  const isFetching =
    currentUserQuery.isFetching ||
    projectsQuery.isFetching ||
    propertiesQuery.isFetching ||
    usersQuery.isFetching;

  const refetch = async () => {
    await Promise.all([
      currentUserQuery.refetch(),
      projectsQuery.refetch(),
      propertiesQuery.refetch(),
      usersQuery.refetch(),
    ]);
  };

  const clearFilters = () => {
    setSelectedCity("All Cities");
    setSelectedStatus("All Statuses");
    dateRange.setPreset("30d");
  };

  return {
    ...mapped,
    ...dateRange,
    selectedCity,
    setSelectedCity,
    selectedStatus,
    setSelectedStatus,
    clearFilters,
    isLoading,
    isFetching,
    refetch,
    refreshedAt: propertiesQuery.dataUpdatedAt
      ? new Date(propertiesQuery.dataUpdatedAt)
      : new Date(),
    presets: RM_DATE_PRESETS,
  };
}

export { isKnown, RM_TEAM_ROLES } from "./regionalManagerDashboardData";
