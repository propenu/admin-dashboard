import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getAccountsSummary,
  getActiveSubscriptions,
  getPaymentsList,
  getRevenueByPlan,
  getSubscriptionHistory,
} from "../../../features/payment/paymentServices";
import { getUserDetails } from "../../../features/user/userService";
import { useDashboardDateRange } from "../shared/useDashboardDateRange";
import { DATE_PRESETS, mapAccountsData } from "./accountsDashboardData";

const safe = async (fn, fallback) => {
  try {
    return await fn();
  } catch {
    return fallback;
  }
};

export function useAccountsDashboard() {
  const dateRange = useDashboardDateRange("30d", DATE_PRESETS);
  const { range, filters } = dateRange;

  const currentUserQuery = useQuery({
    queryKey: ["accounts-dashboard", "me"],
    queryFn: async () => {
      const response = await getUserDetails();
      return response?.data?.user || response?.data || null;
    },
    staleTime: 120_000,
  });

  const summaryQuery = useQuery({
    queryKey: ["accounts-dashboard", "summary", filters],
    queryFn: () =>
      safe(async () => {
        const response = await getAccountsSummary(filters);
        return response?.data?.data || response?.data || {};
      }, {}),
    staleTime: 60_000,
    refetchInterval: 120_000,
  });

  const paidQuery = useQuery({
    queryKey: ["accounts-dashboard", "payments-paid", filters],
    queryFn: () =>
      safe(async () => {
        const response = await getPaymentsList("paid", { ...filters, limit: 500 });
        return response?.data?.data || response?.data || [];
      }, []),
    staleTime: 60_000,
  });

  const failedQuery = useQuery({
    queryKey: ["accounts-dashboard", "payments-failed", filters],
    queryFn: () =>
      safe(async () => {
        const response = await getPaymentsList("failed", { ...filters, limit: 500 });
        return response?.data?.data || response?.data || [];
      }, []),
    staleTime: 60_000,
  });

  const subsQuery = useQuery({
    queryKey: ["accounts-dashboard", "subscriptions"],
    queryFn: () =>
      safe(async () => {
        const response = await getActiveSubscriptions({ status: "active" });
        return response?.data?.data || response?.data || [];
      }, []),
    staleTime: 90_000,
  });

  const historyQuery = useQuery({
    queryKey: ["accounts-dashboard", "subscription-history"],
    queryFn: () =>
      safe(async () => {
        const response = await getSubscriptionHistory();
        return response?.data?.data || response?.data || [];
      }, []),
    staleTime: 90_000,
  });

  const plansQuery = useQuery({
    queryKey: ["accounts-dashboard", "revenue-by-plan", filters],
    queryFn: () =>
      safe(async () => {
        const response = await getRevenueByPlan(filters);
        return response?.data?.data || response?.data || [];
      }, []),
    staleTime: 90_000,
  });

  const mapped = useMemo(
    () =>
      mapAccountsData({
        summary: summaryQuery.data || {},
        paidPayments: paidQuery.data || [],
        failedPayments: failedQuery.data || [],
        subscriptions: subsQuery.data || [],
        history: historyQuery.data || [],
        revenueByPlan: plansQuery.data || [],
        currentUser: currentUserQuery.data,
        range,
        apiFiltered: Boolean(filters.from || filters.to),
      }),
    [
      currentUserQuery.data,
      failedQuery.data,
      filters.from,
      filters.to,
      historyQuery.data,
      paidQuery.data,
      plansQuery.data,
      range,
      subsQuery.data,
      summaryQuery.data,
    ],
  );

  const queries = [
    currentUserQuery,
    summaryQuery,
    paidQuery,
    failedQuery,
    subsQuery,
    historyQuery,
    plansQuery,
  ];

  return {
    ...mapped,
    ...dateRange,
    isLoading: summaryQuery.isLoading || currentUserQuery.isLoading,
    isFetching: queries.some((q) => q.isFetching),
    isError: summaryQuery.isError,
    refetch: async () => {
      await Promise.allSettled(queries.map((q) => q.refetch()));
    },
  };
}
