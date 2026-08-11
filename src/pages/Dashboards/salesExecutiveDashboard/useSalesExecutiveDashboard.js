import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../../api/apiClient";
import { getSalesAgentAnalytics } from "../../../features/property/propertyService";
import { getTicketDashboardOverview, getTickets } from "../../../features/ticket/ticket_system";
import { getUserDetails } from "../../../features/user/userService";
import { useDashboardDateRange } from "../shared/useDashboardDateRange";
import { DATE_PRESETS } from "../shared/dashboardDateRange";
import { mapSalesExecutiveData } from "./salesExecutiveDashboardData";

const unpackAnalytics = (response) =>
  response?.data?.data || response?.data?.[0] || response?.data || {};

const unpackTickets = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.tickets)) return payload.tickets;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
};

const getUserId = (user) =>
  String(user?._id || user?.id || user?.userId || "").trim();

export function useSalesExecutiveDashboard() {
  const dateRange = useDashboardDateRange("today", DATE_PRESETS);
  const { range, filters, preset, setPreset, customFrom, customTo, setCustomFrom, setCustomTo, applyCustomRange } =
    dateRange;

  const currentUserQuery = useQuery({
    queryKey: ["sales-executive-dashboard", "current-user"],
    queryFn: async () => {
      const response = await getUserDetails();
      return response?.data?.user || response?.data || null;
    },
    staleTime: 120_000,
  });

  const executiveId = getUserId(currentUserQuery.data);

  const analyticsQuery = useQuery({
    queryKey: ["sales-executive-dashboard", "analytics", filters],
    queryFn: async () => unpackAnalytics(await getSalesAgentAnalytics(filters)),
    staleTime: 45_000,
    refetchInterval: 60_000,
  });

  const ticketsQuery = useQuery({
    queryKey: ["sales-executive-dashboard", "tickets", executiveId],
    enabled: Boolean(executiveId),
    queryFn: async () => {
      const response = await getTickets({
        page: 1,
        limit: 100,
        sortBy: "updatedAt",
        sortOrder: "desc",
        ...(executiveId ? { assignedTo: executiveId } : {}),
      });
      return unpackTickets(response);
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  const ticketOverviewQuery = useQuery({
    queryKey: ["sales-executive-dashboard", "ticket-overview", filters, executiveId],
    enabled: Boolean(executiveId),
    queryFn: () =>
      getTicketDashboardOverview({
        ...filters,
        ...(executiveId ? { assignedTo: executiveId } : {}),
      }),
    staleTime: 60_000,
  });

  const leadsQuery = useQuery({
    queryKey: ["sales-executive-dashboard", "leads", filters, executiveId],
    enabled: Boolean(executiveId),
    queryFn: async () => {
      try {
        const response = await apiClient.get("/api/properties/leads/admin/overview", {
          params: {
            page: 1,
            limit: 50,
            ...filters,
            ...(executiveId ? { creatorIds: executiveId } : {}),
          },
        });
        const payload = response.data?.data || response.data || {};
        const leads = payload.leads || payload.items || [];
        const total =
          Number(payload.summary?.total ?? payload.pagination?.total ?? leads.length) || 0;
        return { leads, total };
      } catch {
        return { leads: [], total: 0 };
      }
    },
    staleTime: 60_000,
  });

  const mapped = useMemo(
    () =>
      mapSalesExecutiveData({
        analytics: analyticsQuery.data || {},
        tickets: ticketsQuery.data || [],
        leads: leadsQuery.data?.leads || [],
        leadsTotal: leadsQuery.data?.total,
        currentUser: currentUserQuery.data,
        range,
      }),
    [analyticsQuery.data, ticketsQuery.data, leadsQuery.data, currentUserQuery.data, range],
  );

  const isLoading =
    currentUserQuery.isLoading ||
    analyticsQuery.isLoading ||
    (Boolean(executiveId) && ticketsQuery.isLoading);

  const isFetching =
    analyticsQuery.isFetching ||
    ticketsQuery.isFetching ||
    leadsQuery.isFetching ||
    ticketOverviewQuery.isFetching;

  const refetch = async () => {
    await Promise.all([
      currentUserQuery.refetch(),
      analyticsQuery.refetch(),
      ticketsQuery.refetch(),
      leadsQuery.refetch(),
      ticketOverviewQuery.refetch(),
    ]);
  };

  return {
    ...mapped,
    range,
    rangeLabel: range?.label || "",
    filters,
    preset,
    setPreset,
    customFrom,
    customTo,
    setCustomFrom,
    setCustomTo,
    applyCustomRange,
    isLoading,
    isFetching,
    refetch,
    currentUserQuery,
    ticketOverview: ticketOverviewQuery.data?.data || ticketOverviewQuery.data || {},
  };
}
