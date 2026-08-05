import { apiClient } from "../../api/apiClient";

export const getAllUsersActivity = async (params = {}, config = {}) => {
  const response = await apiClient.get(
    "/api/properties/interactions/all-users-activity",
    { params, ...config },
  );
  return response.data?.data ?? response.data;
};

/** Super Admin: website/app clicks + actions for dashboard date range. */
export const getPlatformEngagement = async (params = {}, config = {}) => {
  const response = await apiClient.get(
    "/api/properties/interactions/platform-engagement",
    { params, ...config },
  );
  return response.data?.data ?? response.data;
};

/**
 * Paginated flat event timeline for one user (admin drawer).
 */
export const getUserActivityTimeline = async (
  userId,
  { page = 1, limit = 40, hours = 720, signal } = {},
) => {
  if (!userId) return { items: [], pagination: { page: 1, total: 0, totalPages: 1 } };
  const response = await apiClient.get(
    "/api/properties/interactions/all-users-activity",
    {
      params: {
        userId,
        groupBy: "event",
        hours,
        limit,
        page,
        action: "all",
        role: "all",
      },
      signal,
    },
  );
  return response.data?.data ?? response.data;
};

/**
 * CCE/oversight: activity for one assigned user (indexed + paginated).
 * Ranges: today | 7d | 30d | 12mo | custom(+from/to)
 */
export const getAssignedUserActivity = async (
  userId,
  { range = "today", from, to, page = 1, limit = 25, signal } = {},
) => {
  if (!userId) return { items: [], pagination: { page: 1, total: 0, totalPages: 1 } };
  const response = await apiClient.get(
    `/api/properties/interactions/assigned-user-activity/${userId}`,
    {
      params: {
        range,
        from: from || undefined,
        to: to || undefined,
        page,
        limit,
      },
      signal,
    },
  );
  return response.data?.data ?? response.data;
};
