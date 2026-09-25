//src\features\user\userDetailService.js
import { apiClient } from "../../api/apiClient";
import { SERVICES } from "../../config/services";

const PAYMENT_BASE = `${SERVICES.PAYMENT}/accounts`;
const PROPERTY_BASE = `${SERVICES.PROPERTY}/featured-project`;
export const USER_DETAIL_PAGE_SIZE = 12;

const getItems = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const getMeta = (payload, page, limit) => {
  const meta = payload?.meta || payload?.data?.meta || {};
  const total = Number(meta.total ?? 0) || 0;
  const pageSize = Number(meta.limit ?? limit) || limit;
  const pages = Math.max(
    1,
    Number(meta.pages ?? meta.totalPages) ||
      Math.max(1, Math.ceil(total / pageSize) || 1),
  );
  const current = Math.max(1, Number(meta.page) || page);
  return {
    total,
    page: current,
    limit: pageSize,
    pages,
    totalPages: pages,
    hasNextPage: Boolean(meta.hasNextPage ?? current < pages),
    hasPreviousPage: Boolean(meta.hasPreviousPage ?? current > 1),
  };
};

const normalizeUserIds = (userIds) =>
  [
    ...new Set(
      (Array.isArray(userIds) ? userIds : [userIds])
        .flatMap((value) =>
          value && typeof value === "object"
            ? [value._id, value.userId, value.id]
            : [value],
        )
        .filter(Boolean)
        .map(String),
    ),
  ];

const wrapPayload = (payload, page, limit) => {
  const items = getItems(payload);
  const meta = getMeta(payload, page, limit);
  return {
    data: {
      items,
      meta,
    },
  };
};

/**
 * One server page of inventory owned or posted by the user.
 * Uses ownerUserId so createdBy and postedBy are OR'd on the backend.
 */
const getAllForUser = async (
  url,
  { page = 1, limit = USER_DETAIL_PAGE_SIZE, extra } = {},
  userIds,
) => {
  const validUserIds = normalizeUserIds(userIds);
  const [primaryUserId = ""] = validUserIds;
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(
    USER_DETAIL_PAGE_SIZE,
    Math.max(1, Number(limit) || USER_DETAIL_PAGE_SIZE),
  );
  if (!primaryUserId) {
    return wrapPayload(
      { items: [], meta: { total: 0, page: 1, limit: safeLimit, pages: 1 } },
      1,
      safeLimit,
    );
  }

  const query = new URLSearchParams({
    page: String(safePage),
    limit: String(safeLimit),
    status: "all",
    ownerUserId: primaryUserId,
  });
  if (extra) {
    Object.entries(extra).forEach(([key, value]) => {
      if (value != null && value !== "") query.set(key, String(value));
    });
  }

  const response = await apiClient.get(`${url}?${query.toString()}`);
  return wrapPayload(response.data, safePage, safeLimit);
};

export const getUserById = (userId) =>
  apiClient.get(`${SERVICES.USER}/auth/all-users`, {
    params: { userId, page: 1, limit: 1 },
  });

export const getUserPayments = (userId, status = "paid") =>
  apiClient.get(`${PAYMENT_BASE}/payments?status=${status}&userId=${userId}`);

export const getUserSubscriptions = (userId) =>
  apiClient.get(`${PAYMENT_BASE}/subscriptions?userId=${userId}`);

export const getUserSubscriptionHistory = (userId) =>
  apiClient.get(`${PAYMENT_BASE}/subscription-history?userId=${userId}`);

export const getUserFeaturedProjects = (
  userIds,
  type = "featured",
  page = 1,
  limit = USER_DETAIL_PAGE_SIZE,
) =>
  getAllForUser(
    PROPERTY_BASE,
    {
      page,
      limit,
      extra: {
        ...(type ? { type } : {}),
        promotionStatus: "all",
      },
    },
    userIds,
  );

export const getUserProperties = (
  userIds,
  category = "residential",
  page = 1,
  limit = USER_DETAIL_PAGE_SIZE,
) =>
  getAllForUser(
    `${SERVICES.PROPERTY}/${category}`,
    { page, limit },
    userIds,
  );
