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

const dedupeItems = (items) => {
  const seenIds = new Set();
  return items.filter((item) => {
    const recordId = String(item?._id || "");
    if (recordId && seenIds.has(recordId)) return false;
    if (recordId) seenIds.add(recordId);
    return true;
  });
};

const wrapItems = (items) => ({
  data: {
    items,
    meta: {
      total: items.length,
      page: 1,
      limit: items.length || 20,
      pages: 1,
      totalPages: 1,
    },
  },
});

/**
 * Fetch inventory owned (createdBy) or posted (postedBy) by a user.
 * SE posts use postedBy; builder ownership stays on createdBy.
 * Always requests status=all so draft/pending/active all return.
 */
const getAllForUser = async (url, query, userIds, { isProject = false } = {}) => {
  const validUserIds = normalizeUserIds(userIds);
  const [primaryUserId = ""] = validUserIds;
  if (!primaryUserId) return wrapItems([]);

  const baseQuery = new URLSearchParams(query);
  baseQuery.set("status", "all");
  if (isProject) baseQuery.set("promotionStatus", "all");
  baseQuery.set("page", "1");
  baseQuery.set("limit", String(Math.max(Number(baseQuery.get("limit")) || 100, 100)));

  const fetchScoped = async (key) => {
    const scoped = new URLSearchParams(baseQuery);
    scoped.delete("createdBy");
    scoped.delete("postedBy");
    scoped.set(key, primaryUserId);
    try {
      const response = await apiClient.get(`${url}?${scoped.toString()}`);
      return getItems(response.data).filter((item) => matchesUserId(item, validUserIds));
    } catch {
      return [];
    }
  };

  const [byCreated, byPosted] = await Promise.all([
    fetchScoped("createdBy"),
    fetchScoped("postedBy"),
  ]);

  let items = dedupeItems([...byCreated, ...byPosted]);
  if (items.length > 0) return wrapItems(items);

  // Legacy fallback: unscoped pages + client match (capped).
  const effectiveQuery = new URLSearchParams(baseQuery);
  effectiveQuery.delete("createdBy");
  effectiveQuery.delete("postedBy");
  const firstResponse = await apiClient.get(`${url}?${effectiveQuery.toString()}`);
  const firstPayload = firstResponse.data;
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

  items = dedupeItems(
    [
      ...getItems(firstPayload),
      ...remainingResponses.flatMap((response) => getItems(response.data)),
    ].filter((item) => matchesUserId(item, validUserIds)),
  );

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

// ── Featured Projects by createdBy / postedBy userId ─────────────────────────
// types: featured | prime | normal | sponsored
export const getUserFeaturedProjects = (
  userIds,
  type = "featured",
  page = 1,
  limit = 20,
) => {
  const query = new URLSearchParams({
    page: "1",
    limit: String(Math.max(limit, 100)),
  });
  if (type) query.set("type", type);
  return getAllForUser(PROPERTY_BASE, query, userIds, { isProject: true });
};

// ── Properties (residential / commercial / land / agricultural) ───────────────
export const getUserProperties = (
  userIds,
  category = "residential",
  page = 1,
  limit = 20,
) => {
  const query = new URLSearchParams({
    page: "1",
    limit: String(Math.max(limit, 100)),
  });
  return getAllForUser(`${SERVICES.PROPERTY}/${category}`, query, userIds);
};
