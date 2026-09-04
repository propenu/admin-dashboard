// propenuadmindashborad/src/features/ticket/ticket_system.js
import { apiClient } from "../../api/apiClient";
import { SERVICES } from "../../config/services";

const DASHBOARD_BASE = "/api/ticket-dashboard";
const TICKETS_BASE = "/api/tickets";

const legacyStatusMap = {
  waiting_for_customer: "awaiting_user_response",
  waiting_for_internal_team: "under_review",
};

const normalizeTicketStatus = (ticket) =>
  ticket
    ? { ...ticket, status: legacyStatusMap[ticket.status] || ticket.status }
    : ticket;
const COMMENTS_BASE = "/api/ticket-comments";
const ATTACHMENTS_BASE = "/api/ticket-attachments";
const CATEGORIES_BASE = "/api/ticket-categories";
const DEPARTMENTS_BASE = "/api/ticket-departments";
const PROPERTY_CATEGORIES = ["residential", "commercial", "land", "agricultural"];

const unwrapData = (response) => response.data?.data ?? response.data;

const cleanParams = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== "" && value !== null && value !== undefined),
  );

const getItems = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.users)) return payload.users;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.data?.users)) return payload.data.users;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  return [];
};

const normalizeRoleKey = (role) =>
  String(role || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const REQUESTER_ROLE_ALIASES = {
  owner: "user",
  buyer: "user",
  tenant: "user",
  propenu_user: "user",
  builderstaff: "builder_staff",
  builder_staffs: "builder_staff",
  sales_agent: "sales_executive",
  sales_executives: "sales_executive",
  customer_care: "customer_care_executive",
  customer_care_executives: "customer_care_executive",
  team_lead: "customer_support_team_lead",
  team_leads: "customer_support_team_lead",
  customer_support_team_leads: "customer_support_team_lead",
  relationship_managers: "relationship_manager",
  regional_managers: "regional_manager",
  operation_head: "operations_head",
  technical_support: "technical_support_team",
};

const canonicalRequesterRole = (role) => {
  const key = normalizeRoleKey(role);
  return REQUESTER_ROLE_ALIASES[key] || key;
};

const getRequesterRole = (user) => {
  const raw =
    user?.roleName ||
    user?.role?.name ||
    user?.role?.label ||
    user?.roleId?.name ||
    user?.roleId?.label ||
    (typeof user?.role === "string" ? user.role : user?.role?.name || user?.role?.label) ||
    "";
  if (raw && typeof raw === "object") {
    return canonicalRequesterRole(raw.name || raw.label || "");
  }
  return canonicalRequesterRole(raw);
};

const CORE_REQUESTER_ROLES = new Set(["user", "agent", "builder", "builder_staff"]);
const EXCLUDED_ASSIGNEE_ROLES = new Set(["user", "agent", "builder", "builder_staff"]);

const isStaffRequesterRole = (role) => {
  const value = canonicalRequesterRole(role);
  if (!value || value === "all") return false;
  if (value === "staff") return true;
  return !CORE_REQUESTER_ROLES.has(value);
};

const matchesRequesterRole = (user, role) => {
  const value = getRequesterRole(user);
  const wanted = canonicalRequesterRole(role);
  if (!wanted || wanted === "all") return CORE_REQUESTER_ROLES.has(value);
  if (wanted === "staff") return Boolean(value) && !CORE_REQUESTER_ROLES.has(value);
  return Boolean(value) && value === wanted;
};

const matchesRequesterQuery = (user, query) => {
  const normalized = query?.trim().toLowerCase();
  if (!normalized) return true;
  return [
    user?.name,
    user?.companyName,
    user?.email,
    user?.phone,
    user?.userCode,
    user?.locality,
    user?.city,
    user?.state,
    user?.pincode,
  ]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(normalized));
};

const matchesAssigneeLocation = (user, location = {}) => {
  if (location.state && String(user?.state || "") !== String(location.state)) return false;
  if (location.city && String(user?.city || "") !== String(location.city)) return false;
  if (location.locality && String(user?.locality || "") !== String(location.locality)) return false;
  if (location.pincode && String(user?.pincode || "") !== String(location.pincode)) return false;
  return true;
};

const normalizeRequester = (user) => {
  const role = getRequesterRole(user);
  return {
    ...user,
    userId: user?.userId || user?._id || user?.id,
    role,
    roleName: role || user?.roleName,
  };
};

const roleOptionLabel = (value) =>
  String(value || "")
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const buildRoleOptionsFromUsers = (items) => {
  const roleMap = new Map();
  roleMap.set("all", { label: "All Roles", value: "all" });

  items
    .map(normalizeRequester)
    .filter((user) => !EXCLUDED_ASSIGNEE_ROLES.has(getRequesterRole(user)))
    .forEach((user) => {
      const value = getRequesterRole(user);
      if (!value || roleMap.has(value)) return;
      roleMap.set(value, {
        value,
        label: roleOptionLabel(value),
      });
    });

  return Array.from(roleMap.values());
};

const sortNewestFirst = (users) =>
  [...users].sort(
    (a, b) =>
      new Date(b?.createdAt || b?.updatedAt || 0).getTime() -
      new Date(a?.createdAt || a?.updatedAt || 0).getTime(),
  );

const filterRequesters = (items, { query, role, limit }) =>
  sortNewestFirst(
    items
      .map(normalizeRequester)
      .filter((user) => matchesRequesterRole(user, role))
      .filter((user) => matchesRequesterQuery(user, query)),
  ).slice(0, limit);

const filterAssignableUsers = (items, { query, role, limit, location } = {}) =>
  sortNewestFirst(
    items
      .map(normalizeRequester)
      .filter((user) => !EXCLUDED_ASSIGNEE_ROLES.has(getRequesterRole(user)))
      .filter((user) => {
        if (!role || role === "all") return true;
        return getRequesterRole(user) === canonicalRequesterRole(role);
      })
      .filter((user) => matchesRequesterQuery(user, query))
      .filter((user) => matchesAssigneeLocation(user, location)),
  ).slice(0, limit);

const getPageCount = (payload) =>
  Math.max(1, Number(payload?.meta?.pages || payload?.meta?.totalPages || payload?.pagination?.totalPages || 1));

const getCreatorValues = (item) => {
  const creator = item?.createdBy || item?.owner || item?.user;
  if (!creator) return [];
  if (typeof creator !== "object") return [creator];
  return [
    creator._id,
    creator.id,
    creator.userId,
    creator.name,
    creator.username,
    creator.companyName,
    creator.email,
    creator.phone,
  ].filter(Boolean);
};

const getRequesterMatchValues = (user) =>
  [
    user?._id,
    user?.id,
    user?.userId,
    user?.agentId,
    user?.name,
    user?.companyName,
    user?.email,
    user?.phone,
    user?.userCode,
  ]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase());

const matchesRequester = (item, requester) => {
  const requesterValues = getRequesterMatchValues(requester);
  if (!requesterValues.length) return false;
  return getCreatorValues(item).some((value) => requesterValues.includes(String(value).toLowerCase()));
};

const getAllCreatedByRequester = async (url, query, requester) => {
  const firstResponse = await apiClient.get(url, { params: cleanParams(query) });
  const firstPayload = firstResponse.data;
  const pages = getPageCount(firstPayload);

  const remainingResponses =
    pages > 1
      ? await Promise.all(
          Array.from({ length: Math.min(pages - 1, 4) }, (_, index) =>
            apiClient.get(url, {
              params: cleanParams({
                ...query,
                page: index + 2,
              }),
            }),
          ),
        )
      : [];

  const seenIds = new Set();
  return [firstResponse, ...remainingResponses]
    .flatMap((response) => getItems(response.data))
    .filter((item) => matchesRequester(item, requester))
    .filter((item) => {
      const id = String(item?._id || "");
      if (!id) return true;
      if (seenIds.has(id)) return false;
      seenIds.add(id);
      return true;
    });
};

export const getTicketDashboardOverview = async (params) => {
  const response = await apiClient.get(`${DASHBOARD_BASE}/overview`, {
    params: cleanParams(params),
  });
  return unwrapData(response);
};

export const getTicketDashboardTrends = async (params) => {
  const response = await apiClient.get(`${DASHBOARD_BASE}/trends`, {
    params: cleanParams(params),
  });
  return unwrapData(response);
};

export const getTicketAgentPerformance = async (params) => {
  const response = await apiClient.get(`${DASHBOARD_BASE}/agents`, {
    params: cleanParams(params),
  });
  return unwrapData(response);
};

export const searchTicketRequesters = async ({ query, role = "all", limit = 50 } = {}) => {
  const staffScope = isStaffRequesterRole(role);
  const roleKey = canonicalRequesterRole(role);
  const response = await apiClient.get(`${SERVICES.USER}/auth/all-users`, {
    params: cleanParams({
      scope: staffScope ? "ticket_assignees" : "ticket_requesters",
    }),
  });
  const localMatches = filterRequesters(getItems(response.data), {
    query,
    role: roleKey,
    limit,
  });
  if (localMatches.length) return localMatches;

  // Specific staff role with no local hits — query by role so newly created staff still appear
  if (staffScope && roleKey && roleKey !== "all" && roleKey !== "staff") {
    try {
      const searchedResponse = await apiClient.get(`${SERVICES.USER}/auth/search`, {
        params: cleanParams({
          role: roleKey,
          q: query?.trim() || undefined,
        }),
      });
      return filterRequesters(getItems(searchedResponse.data), {
        query,
        role: roleKey,
        limit,
      });
    } catch (_error) {
      /* fall through */
    }
  }

  if (!query?.trim()) return localMatches;

  try {
    const searchedResponse = await apiClient.get(`${SERVICES.USER}/auth/search`, {
      params: cleanParams({
        q: query,
        role:
          !roleKey || roleKey === "all" || roleKey === "staff"
            ? undefined
            : roleKey,
      }),
    });
    return filterRequesters(getItems(searchedResponse.data), {
      query,
      role: roleKey,
      limit,
    });
  } catch (error) {
    return localMatches;
  }
};

export const searchTicketAssignees = async ({
  query,
  role = "all",
  limit = 20,
  state = "",
  city = "",
  locality = "",
  pincode = "",
} = {}) => {
  const location = { state, city, locality, pincode };
  const response = await apiClient.get(`${SERVICES.USER}/auth/all-users`, {
    params: cleanParams({
      scope: "ticket_assignees",
    }),
  });
  const localMatches = filterAssignableUsers(getItems(response.data), {
    query,
    role,
    limit,
    location,
  });
  if (localMatches.length || !query?.trim()) return localMatches;

  try {
    const searchedResponse = await apiClient.get(`${SERVICES.USER}/auth/search`, {
      params: cleanParams({
        q: query,
        role: role === "all" ? undefined : role,
      }),
    });
    return filterAssignableUsers(getItems(searchedResponse.data), {
      query,
      role,
      limit,
      location,
    });
  } catch (error) {
    return localMatches;
  }
};

export const getTicketAssigneeRoleOptions = async () => {
  const response = await apiClient.get(`${SERVICES.USER}/auth/all-users`, {
    params: cleanParams({
      scope: "ticket_assignees",
    }),
  });
  return buildRoleOptionsFromUsers(getItems(response.data));
};

export const getRequesterRelatedAssets = async (requester, params = {}) => {
  if (!requester) return [];

  const query = {
    page: 1,
    limit: params.limit || 100,
  };

  const [propertiesByCategory, featuredProjects] = await Promise.all([
    Promise.all(
      PROPERTY_CATEGORIES.map(async (category) => {
        const items = await getAllCreatedByRequester(`${SERVICES.PROPERTY}/${category}`, query, requester);
        return items.map((item) => ({
          ...item,
          ticketAssetType: "property",
          ticketAssetCategory: category,
        }));
      }),
    ),
    getAllCreatedByRequester(`${SERVICES.PROPERTY}/featured-project`, query, requester).then((items) =>
      items.map((item) => ({
        ...item,
        ticketAssetType: "featured_project",
        ticketAssetCategory: "featured_project",
      })),
    ),
  ]);

  return [...propertiesByCategory.flat(), ...featuredProjects];
};

export const getTickets = async (params) => {
  const response = await apiClient.get(TICKETS_BASE, {
    params: cleanParams(params),
  });
  return {
    ...response.data,
    data: Array.isArray(response.data?.data)
      ? response.data.data.map(normalizeTicketStatus)
      : response.data?.data,
  };
};

export const getTicketById = async (id) => {
  const response = await apiClient.get(`${TICKETS_BASE}/${id}`);
  return normalizeTicketStatus(unwrapData(response));
};

export const createTicket = async (payload) => {
  const response = await apiClient.post(TICKETS_BASE, payload);
  return unwrapData(response);
};

export const updateTicket = async ({ id, payload }) => {
  const response = await apiClient.patch(`${TICKETS_BASE}/${id}`, payload);
  return unwrapData(response);
};

export const deleteTicket = async (id) => {
  const response = await apiClient.delete(`${TICKETS_BASE}/${id}`);
  return response.data;
};

export const changeTicketStatus = async ({ id, payload }) => {
  const response = await apiClient.patch(`${TICKETS_BASE}/${id}/status`, payload);
  return unwrapData(response);
};

export const assignTicket = async ({ id, payload }) => {
  const response = await apiClient.patch(`${TICKETS_BASE}/${id}/assign`, payload);
  return unwrapData(response);
};

export const changeTicketPriority = async ({ id, payload }) => {
  const response = await apiClient.patch(`${TICKETS_BASE}/${id}/priority`, payload);
  return unwrapData(response);
};

export const addTicketComment = async ({ id, payload }) => {
  const response = await apiClient.post(`${TICKETS_BASE}/${id}/comments`, payload);
  return unwrapData(response);
};

export const listTicketComments = async (params) => {
  const response = await apiClient.get(COMMENTS_BASE, { params: cleanParams(params) });
  return response.data;
};

export const updateTicketComment = async ({ ticketId, commentId, payload }) => {
  const response = await apiClient.patch(`${COMMENTS_BASE}/tickets/${ticketId}/${commentId}`, payload);
  return unwrapData(response);
};

export const deleteTicketComment = async ({ ticketId, commentId, actor }) => {
  const response = await apiClient.delete(`${COMMENTS_BASE}/tickets/${ticketId}/${commentId}`, {
    data: { actor },
  });
  return unwrapData(response);
};

export const listTicketAttachments = async (params) => {
  const response = await apiClient.get(ATTACHMENTS_BASE, { params: cleanParams(params) });
  return response.data;
};

export const createTicketAttachment = async ({ ticketId, payload }) => {
  const url = ticketId ? `${ATTACHMENTS_BASE}/tickets/${ticketId}` : ATTACHMENTS_BASE;
  const response = await apiClient.post(url, payload);
  return unwrapData(response);
};

export const updateTicketAttachmentScanStatus = async ({ id, scanStatus }) => {
  const response = await apiClient.patch(`${ATTACHMENTS_BASE}/${id}/scan-status`, { scanStatus });
  return unwrapData(response);
};

export const deleteTicketAttachment = async ({ id, actor }) => {
  const response = await apiClient.delete(`${ATTACHMENTS_BASE}/${id}`, { data: { actor } });
  return unwrapData(response);
};

export const listTicketCategories = async (params) => {
  const response = await apiClient.get(CATEGORIES_BASE, { params: cleanParams(params) });
  return response.data;
};

export const createTicketCategory = async (payload) => {
  const response = await apiClient.post(CATEGORIES_BASE, payload);
  return unwrapData(response);
};

export const updateTicketCategory = async ({ id, payload }) => {
  const response = await apiClient.patch(`${CATEGORIES_BASE}/${id}`, payload);
  return unwrapData(response);
};

export const deleteTicketCategory = async (id) => {
  const response = await apiClient.delete(`${CATEGORIES_BASE}/${id}`);
  return unwrapData(response);
};

export const listTicketDepartments = async (params) => {
  const response = await apiClient.get(DEPARTMENTS_BASE, { params: cleanParams(params) });
  return response.data;
};

export const createTicketDepartment = async (payload) => {
  const response = await apiClient.post(DEPARTMENTS_BASE, payload);
  return unwrapData(response);
};

export const updateTicketDepartment = async ({ id, payload }) => {
  const response = await apiClient.patch(`${DEPARTMENTS_BASE}/${id}`, payload);
  return unwrapData(response);
};

export const deleteTicketDepartment = async (id) => {
  const response = await apiClient.delete(`${DEPARTMENTS_BASE}/${id}`);
  return unwrapData(response);
};

export const addTicketDepartmentMember = async ({ id, payload }) => {
  const response = await apiClient.post(`${DEPARTMENTS_BASE}/${id}/members`, payload);
  return unwrapData(response);
};

export const removeTicketDepartmentMember = async ({ id, userId }) => {
  const response = await apiClient.delete(`${DEPARTMENTS_BASE}/${id}/members/${userId}`);
  return unwrapData(response);
};
