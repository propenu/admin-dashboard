import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  getAllUsers,
  getUserSearch,
} from "../../../../features/user/userService";

const emptyMeta = { total: 0, page: 1, limit: 20, pages: 1 };
const emptyStats = {
  total: 0,
  active: 0,
  kycVerified: 0,
  phoneVerified: 0,
  locPending: 0,
  joinedToday: 0,
};
const emptyRoleCounts = {
  all: 0,
  user: 0,
  builder: 0,
  builder_staff: 0,
  agent: 0,
};

/**
 * Normalize all-users API:
 * - legacy: bare array
 * - paginated: { data, meta, stats, roleCounts }
 */
export const normalizeUsersResponse = (payload) => {
  if (Array.isArray(payload)) {
    return {
      data: payload,
      meta: {
        ...emptyMeta,
        total: payload.length,
        pages: 1,
        limit: payload.length || 20,
      },
      stats: emptyStats,
      roleCounts: emptyRoleCounts,
      legacy: true,
    };
  }
  const data = Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload?.users)
      ? payload.users
      : [];
  const meta = {
    total: Number(payload?.meta?.total ?? data.length) || 0,
    page: Math.max(1, Number(payload?.meta?.page) || 1),
    limit: Math.max(1, Number(payload?.meta?.limit) || 20),
    pages: Math.max(1, Number(payload?.meta?.pages) || 1),
  };
  return {
    data,
    meta,
    stats: { ...emptyStats, ...(payload?.stats || {}) },
    roleCounts: { ...emptyRoleCounts, ...(payload?.roleCounts || {}) },
    legacy: false,
  };
};

/* ===============================
   🔹 GET ALL USERS (paginated)
================================ */
export const useUsers = (params, options = {}) => {
  const enabled = options.enabled !== false;
  return useQuery({
    queryKey: ["users", params || null],
    queryFn: async () => {
      const res = await getAllUsers(params);
      return normalizeUsersResponse(res?.data);
    },
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

/* ===============================
   🔹 SEARCH USERS
================================ */
export const useSearchUsers = (query) => {
  return useQuery({
    queryKey: ["searchUsers", query],
    queryFn: async () => {
      const res = await getUserSearch(query);
      return res.data;
    },
    enabled: !!query,
  });
};
