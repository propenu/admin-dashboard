// src/features/users/useUserDetail.js
import { useQuery } from "@tanstack/react-query";
import {
  getUserById,
  getUserPayments,
  getUserSubscriptions,
  getUserSubscriptionHistory,
  getUserFeaturedProjects,
  getUserProperties,
} from "../../features/user/userDetailService";

// ── User Profile ──────────────────────────────────────────────────────────────
export const useUserById = (userId) =>
  useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      const res = await getUserById(userId);
      const data = res.data?.data || res.data;

      // ✅ FIX: filter by id
      if (Array.isArray(data)) {
        return data.find((u) => u._id === userId);
      }

      return data;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });

// ── User Payments ─────────────────────────────────────────────────────────────
export const useUserPayments = (userId, status = "paid") =>
  useQuery({
    queryKey: ["user-payments", userId, status],
    queryFn: () =>
      getUserPayments(userId, status).then((r) => r.data?.data || r.data || []),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  });

// ── User Subscriptions ────────────────────────────────────────────────────────
export const useUserSubscriptions = (userId) =>
  useQuery({
    queryKey: ["user-subscriptions", userId],
    queryFn: () =>
      getUserSubscriptions(userId).then((r) => r.data?.data || r.data || []),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  });

// ── Subscription History ──────────────────────────────────────────────────────
export const useUserSubscriptionHistory = (userId) =>
  useQuery({
    queryKey: ["user-subscription-history", userId],
    queryFn: () =>
      getUserSubscriptionHistory(userId).then(
        (r) => r.data?.data || r.data || [],
      ),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });

// ── Featured Projects ─────────────────────────────────────────────────────────
export const useUserFeaturedProjects = (userId, type = "featured") =>
  useQuery({
    queryKey: ["user-featured-projects", userId, type],
    queryFn: () =>
      getUserFeaturedProjects(userId, type).then(
        (r) => r.data?.data || r.data || [],
      ),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });

// ── Featured Project Counts ─────────────────────────────────────────
export const useUserFeaturedProjectCounts = (userId) => {
  const featured = useUserFeaturedProjects(userId, "featured");
  const prime = useUserFeaturedProjects(userId, "prime");
  const normal = useUserFeaturedProjects(userId, "normal");
  const sponsored = useUserFeaturedProjects(userId, "sponsored");

  const getCount = (data) => {
    if (Array.isArray(data)) return data.length;
    if (Array.isArray(data?.data)) return data.data.length;
    if (Array.isArray(data?.items)) return data.items.length;
    if (Array.isArray(data?.projects)) return data.projects.length;
    return 0;
  };

  return {
    featured: getCount(featured.data),
    prime: getCount(prime.data),
    normal: getCount(normal.data),
    sponsored: getCount(sponsored.data),

    isLoading:
      featured.isLoading ||
      prime.isLoading ||
      normal.isLoading ||
      sponsored.isLoading,
  };
};

// ── Properties (all categories) ──────────────────────────────────────────────
export const useUserProperties = (userId, category = "residential") =>
  useQuery({
    queryKey: ["user-properties", userId, category],
    queryFn: () =>
      getUserProperties(userId, category).then(
        (r) => r.data?.items || r.data?.data || r.data || [],
      ),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });



  // ── Property Counts (All Categories) ─────────────────────────────────────────
export const useUserPropertyCounts = (userId) => {
  const residential = useUserProperties(userId, "residential");
  const commercial = useUserProperties(userId, "commercial");
  const land = useUserProperties(userId, "land");
  const agricultural = useUserProperties(userId, "agricultural");

  const getCount = (data) => {
    if (Array.isArray(data)) return data.length;
    if (Array.isArray(data?.items)) return data.items.length;
    if (Array.isArray(data?.data)) return data.data.length;
    return 0;
  };

  return {
    residential: getCount(residential.data),
    commercial: getCount(commercial.data),
    land: getCount(land.data),
    agricultural: getCount(agricultural.data),

    isLoading:
      residential.isLoading ||
      commercial.isLoading ||
      land.isLoading ||
      agricultural.isLoading,
  };
};