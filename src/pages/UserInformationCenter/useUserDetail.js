// src/features/users/useUserDetail.js
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  getUserById,
  getUserPayments,
  getUserSubscriptions,
  getUserSubscriptionHistory,
  getUserFeaturedProjects,
  getUserProperties,
  USER_DETAIL_PAGE_SIZE,
} from "../../features/user/userDetailService";

const unpackList = (payload, page, limit) => {
  const body = payload?.data || payload || {};
  const items = Array.isArray(body.items)
    ? body.items
    : Array.isArray(body.data)
      ? body.data
      : [];
  const meta = body.meta || {};
  const total = Number(meta.total) || 0;
  const pages = Math.max(
    1,
    Number(meta.pages ?? meta.totalPages) ||
      Math.max(1, Math.ceil(total / (Number(meta.limit) || limit)) || 1),
  );
  const current = Number(meta.page) || page;
  return {
    items,
    meta: {
      total,
      page: current,
      limit: Number(meta.limit) || limit,
      pages,
      totalPages: pages,
      hasNextPage: Boolean(meta.hasNextPage ?? current < pages),
      hasPreviousPage: Boolean(meta.hasPreviousPage ?? current > 1),
    },
  };
};

export const useUserById = (userId) =>
  useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      const res = await getUserById(userId);
      const payload = res.data;
      const data = payload?.data ?? payload;
      if (Array.isArray(data)) {
        return (
          data.find((u) => String(u._id) === String(userId)) || data[0] || null
        );
      }
      return data?.user || data || null;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });

export const useUserPayments = (userId, status = "paid") =>
  useQuery({
    queryKey: ["user-payments", userId, status],
    queryFn: async () => {
      const res = await getUserPayments(userId, status);
      const raw = res.data?.data || res.data?.items || res.data || [];
      const payments = Array.isArray(raw) ? raw : [];
      return payments.filter((p) => {
        const paymentUserId = p.userId?._id || p.userId;
        return (
          paymentUserId &&
          String(paymentUserId) === String(userId) &&
          p.status === status
        );
      });
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  });

export const useUserSubscriptions = (userId) =>
  useQuery({
    queryKey: ["user-subscriptions", userId],
    queryFn: async () => {
      const res = await getUserSubscriptions(userId);
      const raw = res.data?.data || res.data || [];
      const subscriptions = Array.isArray(raw) ? raw : [];
      return subscriptions.filter((s) => {
        const subscriptionUserId = s.userId?._id || s.userId;
        return (
          subscriptionUserId && String(subscriptionUserId) === String(userId)
        );
      });
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  });

export const useUserSubscriptionHistory = (userId) =>
  useQuery({
    queryKey: ["user-subscription-history", userId],
    queryFn: async () => {
      const res = await getUserSubscriptionHistory(userId);
      const raw = res.data?.data || res.data || [];
      const history = Array.isArray(raw) ? raw : [];
      return history.filter((h) => {
        const historyUserId = h.userId?._id || h.userId;
        return historyUserId && String(historyUserId) === String(userId);
      });
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });

export const useUserFeaturedProjects = (
  userId,
  type = "featured",
  page = 1,
  limit = USER_DETAIL_PAGE_SIZE,
) =>
  useQuery({
    queryKey: ["user-featured-projects", userId, type, page, limit],
    queryFn: async () => {
      const res = await getUserFeaturedProjects(userId, type, page, limit);
      return unpackList(res.data, page, limit);
    },
    enabled: Boolean(userId && (Array.isArray(userId) ? userId.length : true)),
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData,
  });

export const useUserFeaturedProjectCounts = (userId) => {
  const featured = useUserFeaturedProjects(userId, "featured", 1, 1);
  const prime = useUserFeaturedProjects(userId, "prime", 1, 1);
  const normal = useUserFeaturedProjects(userId, "normal", 1, 1);
  const sponsored = useUserFeaturedProjects(userId, "sponsored", 1, 1);
  const totalOf = (query) => Number(query.data?.meta?.total) || 0;
  return {
    featured: totalOf(featured),
    prime: totalOf(prime),
    normal: totalOf(normal),
    sponsored: totalOf(sponsored),
    isLoading:
      featured.isLoading ||
      prime.isLoading ||
      normal.isLoading ||
      sponsored.isLoading,
  };
};

export const useUserProperties = (
  userId,
  category = "residential",
  page = 1,
  limit = USER_DETAIL_PAGE_SIZE,
) =>
  useQuery({
    queryKey: ["user-properties", userId, category, page, limit],
    queryFn: async () => {
      const res = await getUserProperties(userId, category, page, limit);
      return unpackList(res.data, page, limit);
    },
    enabled: Boolean(userId && (Array.isArray(userId) ? userId.length : true)),
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData,
  });

export const useUserPropertyCounts = (userId) => {
  const residential = useUserProperties(userId, "residential", 1, 1);
  const commercial = useUserProperties(userId, "commercial", 1, 1);
  const land = useUserProperties(userId, "land", 1, 1);
  const agricultural = useUserProperties(userId, "agricultural", 1, 1);
  return {
    residential: Number(residential.data?.meta?.total) || 0,
    commercial: Number(commercial.data?.meta?.total) || 0,
    land: Number(land.data?.meta?.total) || 0,
    agricultural: Number(agricultural.data?.meta?.total) || 0,
    isLoading:
      residential.isLoading ||
      commercial.isLoading ||
      land.isLoading ||
      agricultural.isLoading,
  };
};
