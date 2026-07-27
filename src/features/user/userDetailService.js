//src\features\user\userDetailService.js
import { apiClient } from "../../api/apiClient";
import { SERVICES } from "../../config/services";

const PAYMENT_BASE = `${SERVICES.PAYMENT}/accounts`;
const PROPERTY_BASE = `${SERVICES.PROPERTY}/featured-project`;

const getItems = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const getPageCount = (payload) =>
  Math.max(
    1,
    Number(payload?.meta?.pages || payload?.meta?.totalPages || 1),
  );

const getCreatorId = (item) =>
  item?.createdBy?._id ||
  item?.createdBy?.userId ||
  item?.createdBy?.id ||
  item?.createdBy ||
  item?.postedBy?.userId?._id ||
  item?.postedBy?.userId ||
  item?.postedBy?._id ||
  item?.postedBy?.id ||
  item?.agentId?._id ||
  item?.agentId ||
  item?.userId?._id ||
  item?.userId ||
  null;

const matchesUserId = (item, validUserIds) => {
  const candidates = [
    getCreatorId(item),
    item?.createdBy?._id,
    item?.createdBy,
    item?.postedBy?.userId?._id,
    item?.postedBy?.userId,
    item?.lastUpdatedBy?.userId?._id,
    item?.lastUpdatedBy?.userId,
  ]
    .filter(Boolean)
    .map(String);
  return candidates.some((id) => validUserIds.includes(id));
};

const normalizeUserIds = (userIds) =>
  [...new Set((Array.isArray(userIds) ? userIds : [userIds])
    .flatMap((value) =>
      value && typeof value === "object"
        ? [value._id, value.userId, value.id]
        : [value],
    )
    .filter(Boolean)
    .map(String))];

/**
 * The property APIs do not consistently apply the createdBy query before
 * pagination. Prefer createdBy query when backend supports it; always
 * match creator / postedBy IDs client-side so sales-exec posts are not missed.
 */
const getAllCreatedBy = async (url, query, userIds) => {
  const validUserIds = normalizeUserIds(userIds);
  const baseQuery = new URLSearchParams(query);
  const [primaryUserId = ""] = validUserIds;

  // Try scoped fetch first (much faster when backend honors createdBy).
  const scopedQuery = new URLSearchParams(baseQuery);
  if (primaryUserId) scopedQuery.set("createdBy", primaryUserId);
  scopedQuery.set("page", "1");
  scopedQuery.set("limit", String(Math.max(Number(baseQuery.get("limit")) || 100, 100)));

  let scopedItems = [];
  try {
    const scopedResponse = await apiClient.get(`${url}?${scopedQuery.toString()}`);
    scopedItems = getItems(scopedResponse.data).filter((item) => matchesUserId(item, validUserIds));
  } catch {
    scopedItems = [];
  }

  // Fallback: unscoped pages (legacy behaviour) when scoped returns nothing.
  if (scopedItems.length > 0) {
    const seenIds = new Set();
    const items = scopedItems.filter((item) => {
      const recordId = String(item?._id || "");
      if (recordId && seenIds.has(recordId)) return false;
      if (recordId) seenIds.add(recordId);
      return true;
    });
    return {
      data: {
        items,
        meta: { total: items.length, page: 1, limit: items.length || 20, pages: 1, totalPages: 1 },
      },
    };
  }

  const effectiveQuery = new URLSearchParams(baseQuery);
  effectiveQuery.delete("createdBy");
  effectiveQuery.set("page", "1");
  effectiveQuery.set("limit", "100");
  const firstResponse = await apiClient.get(`${url}?${effectiveQuery.toString()}`);
  const firstPayload = firstResponse.data;
  // Cap pages to avoid loading the entire inventory for one member view.
  const pages = Math.min(getPageCount(firstPayload), 10);

  const remainingResponses =
    pages > 1
      ? await Promise.all(
          Array.from({ length: pages - 1 }, (_, index) => {
            const pageQuery = new URLSearchParams(effectiveQuery);
            pageQuery.set("page", String(index + 2));
            return apiClient.get(`${url}?${pageQuery.toString()}`);
          }),
        )
      : [];

  const allItems = [
    ...getItems(firstPayload),
    ...remainingResponses.flatMap((response) => getItems(response.data)),
  ];
  const seenIds = new Set();
  const items = allItems.filter((item) => {
    if (!matchesUserId(item, validUserIds)) return false;
    const recordId = String(item?._id || "");
    if (recordId && seenIds.has(recordId)) return false;
    if (recordId) seenIds.add(recordId);
    return true;
  });

  return {
    ...firstResponse,
    data: {
      items,
      meta: {
        ...(firstPayload?.meta || {}),
        total: items.length,
        page: 1,
        limit: items.length || Number(query.get("limit")) || 20,
        pages: 1,
        totalPages: 1,
      },
    },
  };
};

// ── User ─────────────────────────────────────────────────────────────────────
export const getUserById = (userId) =>
  apiClient.get(`${SERVICES.USER}/auth/all-users?userId=${userId}`);

// ── Payments (paid / failed) for a specific user ─────────────────────────────
export const getUserPayments = (userId, status = "paid") =>
  apiClient.get(`${PAYMENT_BASE}/payments?status=${status}&userId=${userId}`);

// ── Active Subscriptions for a user ──────────────────────────────────────────
export const getUserSubscriptions = (userId) =>
  apiClient.get(`${PAYMENT_BASE}/subscriptions?userId=${userId}`);

// ── Subscription history for a user ──────────────────────────────────────────
export const getUserSubscriptionHistory = (userId) =>
  apiClient.get(`${PAYMENT_BASE}/subscription-history?userId=${userId}`);

// ── Featured Projects by createdBy userId ─────────────────────────────────────
// types: featured | prime | normal | sponsored
export const getUserFeaturedProjects = (
  userIds,
  type = "featured",
  page = 1,
  limit = 20,
) => {
  const [primaryUserId = ""] = normalizeUserIds(userIds);
  const query = new URLSearchParams({
    createdBy: primaryUserId,
    page: "1",
    limit: String(Math.max(limit, 100)),
  });
  if (type) query.set("type", type);
  return getAllCreatedBy(PROPERTY_BASE, query, userIds);
};

// ── Properties (residential / commercial / land / agricultural) ───────────────
export const getUserProperties = (
  userIds,
  category = "residential",
  page = 1,
  limit = 20,
) => {
  const [primaryUserId = ""] = normalizeUserIds(userIds);
  const query = new URLSearchParams({
    createdBy: primaryUserId,
    page: "1",
    limit: String(Math.max(limit, 100)),
  });
  return getAllCreatedBy(`${SERVICES.PROPERTY}/${category}`, query, userIds);
};
