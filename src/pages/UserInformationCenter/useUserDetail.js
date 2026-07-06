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

    queryFn: async () => {
      const res = await getUserPayments(userId, status);

      const raw = res.data?.data || res.data?.items || res.data || [];

      const payments = Array.isArray(raw) ? raw : [];

      // ✅ FILTER CURRENT USER ONLY
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



// ── User Subscriptions ────────────────────────────────────────────────────────
export const useUserSubscriptions = (userId) =>
  useQuery({
    queryKey: ["user-subscriptions", userId],

    queryFn: async () => {
      const res = await getUserSubscriptions(userId);

      const raw = res.data?.data || res.data || [];

      const subscriptions = Array.isArray(raw) ? raw : [];

      // ✅ FILTER CURRENT USER ONLY
      return subscriptions.filter((s) => {
        const subscriptionUserId = s.userId?._id || s.userId;

        return (
          subscriptionUserId &&
          String(subscriptionUserId) === String(userId)
        );
      });
    },

    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  });


// ── Subscription History ──────────────────────────────────────────────────────
export const useUserSubscriptionHistory = (userId) =>
  useQuery({
    queryKey: ["user-subscription-history", userId],

    queryFn: async () => {
      const res = await getUserSubscriptionHistory(userId);

      const raw = res.data?.data || res.data || [];

      const history = Array.isArray(raw) ? raw : [];

      // ✅ FILTER CURRENT USER ONLY
      return history.filter((h) => {
        const historyUserId = h.userId?._id || h.userId;

        return (
          historyUserId &&
          String(historyUserId) === String(userId)
        );
      });
    },

    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });



export const useUserFeaturedProjects = (
  userId,
  type = "featured",
  page = 1,
  limit = 20,
) =>
  useQuery({
    queryKey: ["user-featured-projects", userId, type, page, limit],

    queryFn: async () => {
      const res = await getUserFeaturedProjects(userId, type, page, limit);
      const items = res.data?.items || [];
      const total = items.length;
      const totalPages = Math.max(1, Math.ceil(total / limit));
      const start = (page - 1) * limit;

      return {
        items: items.slice(start, start + limit),
        meta: {
          ...(res.data?.meta || {}),
          total,
          page,
          limit,
          pages: totalPages,
          totalPages,
        },
      };
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });

// ── Featured Project Counts ─────────────────────────────────────────
// export const useUserFeaturedProjectCounts = (userId) => {
  
//   const featured = useUserFeaturedProjects(userId, "featured");
//   const prime = useUserFeaturedProjects(userId, "prime");
//   const normal = useUserFeaturedProjects(userId, "normal");
//   const sponsored = useUserFeaturedProjects(userId, "sponsored");


//   const getCount = (data) => {
//     const items = Array.isArray(data)
//       ? data
//       : Array.isArray(data?.items)
//         ? data.items
//         : Array.isArray(data?.data)
//           ? data.data
//           : [];

//     return items.filter((p) => String(p.createdBy?._id || p.createdBy) === String(userId))
// .length;
//   };

//   return {
//     featured: getCount(featured.data),
//     prime: getCount(prime.data),
//     normal: getCount(normal.data),
//     sponsored: getCount(sponsored.data),

//     isLoading:
//       featured.isLoading ||
//       prime.isLoading ||
//       normal.isLoading ||
//       sponsored.isLoading,
//   };
// };

export const useUserFeaturedProjectCounts = (userId) => {
  const featured = useUserFeaturedProjects(userId, "featured");
  const prime = useUserFeaturedProjects(userId, "prime");
  const normal = useUserFeaturedProjects(userId, "normal");
  const sponsored = useUserFeaturedProjects(userId, "sponsored");

  return {
    featured: featured.data?.meta?.promotionCounts?.featured ?? 0,
    prime: prime.data?.meta?.promotionCounts?.prime ?? 0,
    normal: normal.data?.meta?.promotionCounts?.normal ?? 0,
    sponsored: sponsored.data?.meta?.promotionCounts?.sponsored ?? 0,

    isLoading:
      featured.isLoading ||
      prime.isLoading ||
      normal.isLoading ||
      sponsored.isLoading,
  };
};

// ── Properties (all categories) ──────────────────────────────────────────────
// export const useUserProperties = (userId, category = "residential") =>
//   useQuery({
//     queryKey: ["user-properties", userId, category],
//     queryFn: () =>
//       getUserProperties(userId, category).then(
//         (r) => r.data?.items || r.data?.data || r.data || [],
//       ),
//     enabled: !!userId,
//     staleTime: 5 * 60 * 1000,
//   });


export const useUserProperties = (
  userId,
  category = "residential",
  page = 1,
  limit = 20,
) =>
  useQuery({
    queryKey: ["user-properties", userId, category, page, limit],

    queryFn: async () => {
      const res = await getUserProperties(userId, category, page, limit);
      const items = res.data?.items || [];
      const total = items.length;
      const totalPages = Math.max(1, Math.ceil(total / limit));
      const start = (page - 1) * limit;

      return {
        items: items.slice(start, start + limit),
        meta: {
          ...(res.data?.meta || {}),
          total,
          page,
          limit,
          pages: totalPages,
          totalPages,
        },
      };
    },

    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });


  // ── Property Counts (All Categories) ─────────────────────────────────────────
// export const useUserPropertyCounts = (userId) => {
//   const residential = useUserProperties(userId, "residential");
//   const commercial = useUserProperties(userId, "commercial");
//   const land = useUserProperties(userId, "land");
//   const agricultural = useUserProperties(userId, "agricultural");

  
//   const getCount = (data) => {
//     const items = Array.isArray(data)
//       ? data
//       : Array.isArray(data?.items)
//         ? data.items
//         : Array.isArray(data?.data)
//           ? data.data
//           : [];

//     return items.filter((p) => String(p.createdBy?._id || p.createdBy) === String(userId))
//       .length;
//   };

//   return {
//     residential: getCount(residential.data),
//     commercial: getCount(commercial.data),
//     land: getCount(land.data),
//     agricultural: getCount(agricultural.data),

//     isLoading:
//       residential.isLoading ||
//       commercial.isLoading ||
//       land.isLoading ||
//       agricultural.isLoading,
//   };
// }; 


// ── Property Counts (All Categories) ─────────────────────────────────────────
export const useUserPropertyCounts = (userId) => {
  const residential = useUserProperties(userId, "residential");
  const commercial = useUserProperties(userId, "commercial");
  const land = useUserProperties(userId, "land");
  const agricultural = useUserProperties(userId, "agricultural");

  return {
    residential: residential.data?.meta?.total ?? 0,
    commercial: commercial.data?.meta?.total ?? 0,
    land: land.data?.meta?.total ?? 0,
    agricultural: agricultural.data?.meta?.total ?? 0,

    isLoading:
      residential.isLoading ||
      commercial.isLoading ||
      land.isLoading ||
      agricultural.isLoading,
  };
};
