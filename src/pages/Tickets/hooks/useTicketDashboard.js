import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getTicketDashboardOverview,
  getTicketDashboardTrends,
} from "../../../features/ticket/ticket_system";
import { normalizeTicketOverview, normalizeTicketTrends } from "../utils/ticketNormalizers";

const toOverviewParams = (filters = {}, scope = {}) => {
  const params = {};
  if (filters.from) params.from = `${filters.from}T00:00:00.000`;
  if (filters.to) params.to = `${filters.to}T23:59:59.999`;
  if (scope.ownedBy) params.ownedBy = scope.ownedBy;
  else if (scope.assignedTo) params.assignedTo = scope.assignedTo;
  if (scope.department) params.department = scope.department;
  return params;
};

export function useTicketDashboard(enabled = true, dateFilters = {}, scope = {}) {
  const overviewParams = useMemo(
    () => toOverviewParams(dateFilters, scope),
    [dateFilters, scope.ownedBy, scope.assignedTo, scope.department],
  );
  const trendDays = useMemo(() => {
    if (!dateFilters.from || !dateFilters.to) return 90;
    const from = new Date(`${dateFilters.from}T00:00:00`);
    const to = new Date(`${dateFilters.to}T23:59:59`);
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return 90;
    const days = Math.round((to.getTime() - from.getTime()) / 86400000) + 1;
    return Math.min(90, Math.max(1, days));
  }, [dateFilters.from, dateFilters.to]);

  const overviewQuery = useQuery({
    queryKey: ["ticket-dashboard", "overview", overviewParams],
    queryFn: () => getTicketDashboardOverview(overviewParams),
    enabled,
    refetchInterval: 60_000,
    staleTime: 20_000,
    placeholderData: (previous) => previous,
  });

  const trendsQuery = useQuery({
    queryKey: ["ticket-dashboard", "trends", trendDays, overviewParams],
    queryFn: () =>
      getTicketDashboardTrends({
        days: trendDays,
        ...(scope.ownedBy
          ? { ownedBy: scope.ownedBy }
          : scope.assignedTo
            ? { assignedTo: scope.assignedTo }
            : {}),
        ...(scope.department ? { department: scope.department } : {}),
      }),
    enabled,
    refetchInterval: 60_000,
    staleTime: 20_000,
    placeholderData: (previous) => previous,
  });

  const overview = useMemo(
    () => normalizeTicketOverview(overviewQuery.data),
    [overviewQuery.data],
  );

  const trends = useMemo(() => {
    const rows = normalizeTicketTrends(trendsQuery.data);
    // When a custom/bounded range is set, keep only days inside it.
    if (!dateFilters.from && !dateFilters.to) return rows;
    return rows.filter((row) => {
      if (dateFilters.from && row.day < dateFilters.from) return false;
      if (dateFilters.to && row.day > dateFilters.to) return false;
      return true;
    });
  }, [trendsQuery.data, dateFilters.from, dateFilters.to]);

  return {
    overview,
    trends,
    isLoading: overviewQuery.isLoading,
    isFetching: overviewQuery.isFetching || trendsQuery.isFetching,
    isError: overviewQuery.isError,
    refetch: async () => {
      await Promise.all([overviewQuery.refetch(), trendsQuery.refetch()]);
    },
  };
}
