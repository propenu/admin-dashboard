// src/features/property/common/propertyService.js
import { apiClient } from "../../api/apiClient";
import { SERVICES } from "../../config/services";
import { requestSidebarRefresh } from "../../utils/sidebarActivity";

const withSidebarRefresh = (promise) =>
  Promise.resolve(promise).then((result) => {
    requestSidebarRefresh();
    return result;
  });

const BASE = `${SERVICES.PROPERTY}/featured-project`;

export const getFeaturedProjectsByType = (
  type,
  page = 1,
  limit = 20,
  params = {},
) => {
  const query = new URLSearchParams();

  if (type) query.set("type", type);
  if (params.promotionStatus) {
    query.set("promotionStatus", params.promotionStatus);
  }
  if (params.search?.trim()) {
    query.set("search", params.search.trim());
  }
  if (params.status) query.set("status", params.status);
  if (params.from) query.set("from", params.from);
  if (params.to) query.set("to", params.to);
  if (params.createdFrom) query.set("createdFrom", params.createdFrom);
  if (params.createdTo) query.set("createdTo", params.createdTo);

  query.set("page", String(page));
  query.set("limit", String(limit));

  return apiClient.get(`${BASE}?${query.toString()}`);
};

export const getFeaturedProjectById = (id) => apiClient.get(`${BASE}/${id}`);

// ── POST ─────────────────────────────────────────────────────────────────────
export const getAllFeaturedProjects = (id) => apiClient.get(`${BASE}`);
export const createFeaturedProject = (formData, config = {}) =>
  withSidebarRefresh(apiClient.post(BASE, formData, config));

/** Draft create — builder assignment can be pending */
export const createFeaturedProjectDraft = (formData, config = {}) =>
  withSidebarRefresh(apiClient.post(`${BASE}/draft`, formData, config));

export const lookupFeaturedBuilders = (params = {}) => {
  const query = new URLSearchParams();
  if (params.email) query.set("email", params.email);
  if (params.phone) query.set("phone", params.phone);
  if (params.q) query.set("q", params.q);
  return apiClient.get(`${BASE}/builders/lookup?${query.toString()}`);
};

export const assignExistingBuilderToProject = (projectId, builderId) =>
  apiClient.post(`${BASE}/${projectId}/builder/assign-existing`, { builderId });

export const sendBuilderInviteEmail = (projectId, payload) =>
  apiClient.post(`${BASE}/${projectId}/builder/invite`, payload);

export const requestBuilderDirectOtp = (projectId, payload) =>
  apiClient.post(`${BASE}/${projectId}/builder/direct-otp/request`, payload);

export const verifyBuilderDirectOtp = (projectId, payload) =>
  apiClient.post(`${BASE}/${projectId}/builder/direct-otp/verify`, payload);

export const saveProjectContacts = (projectId, contacts) =>
  apiClient.put(`${BASE}/${projectId}/project-contacts`, { contacts });

export const submitProjectForApproval = (projectId) =>
  apiClient.post(`${BASE}/${projectId}/submit-for-approval`);

export const getBuilderOnboardingState = (projectId) =>
  apiClient.get(`${BASE}/${projectId}/builder-onboarding`);

// ── PATCH ────────────────────────────────────────────────────────────────────
export const editFeaturedProject = (id, formData) =>
  apiClient.patch(`${BASE}/${id}`, formData);

/** Promote a project → set type (prime | featured | normal | sponsored) */
export const promoteProject = (id, type) =>
  apiClient.patch(`${BASE}/${id}/promote`, { type });

export const RenevaleProject = (id) =>
  apiClient.patch(`${BASE}/${id}/renew`, { days: 10 });

/** Expire a project */
export const expireProject = (id) => apiClient.patch(`${BASE}/${id}/expire`);

/** Reset a project back to default/active */
export const resetProject = (id) => apiClient.patch(`${BASE}/${id}/reset`);

/** Promote a project */
export const promoteProjectWithRank = (id, data) =>
  apiClient.patch(`${BASE}/${id}/promote`, data);

/** Update rank */
export const updateProjectRank = (id, rank) =>
  apiClient.patch(`${BASE}/${id}`, { rank });

// ── DELETE ───────────────────────────────────────────────────────────────────
export const deleteFeaturedProject = (id) => apiClient.delete(`${BASE}/${id}`);

export const deleteFeaturedProjectGalleryImage = (id, index) =>
  apiClient.delete(`${BASE}/${id}/gallery/${index}`);


//Properties Draft Residential, Commertial, Land and Agricultural
export const createPropertyDraft = (category) => {
  return apiClient.post(`${SERVICES.PROPERTY}/${category}/draft`);
};



export const getMyPropertyDrafts = (category) => {
  return apiClient.get(`${SERVICES.PROPERTY}/${category}/draft/me`);
};


export const editPropertyBasic = (category, id, formData) => {
  return apiClient.patch(
    `${SERVICES.PROPERTY}/${category}/${id}/basic`,
    formData,
  );
};


export const editPropertyLocation = (category, id, payload) => {
  return apiClient.patch(
    `${SERVICES.PROPERTY}/${category}/${id}/location`,
    payload,
  );
};


export const editPropertyDetails = (category, id, formData) => {
  return apiClient.patch(
    `${SERVICES.PROPERTY}/${category}/${id}/details`,
    formData,
  );
};


export const editPropertyVerification = (category, id, formData) => {
  return apiClient.patch(
    `${SERVICES.PROPERTY}/${category}/${id}/verification`,
    formData,
  );
};

export const deletePropertyGalleryImagesIndex = (category, id, index) => {
  return apiClient.delete(
    `${SERVICES.PROPERTY}/${category}/${id}/gallery/${index}`,
  );
}

export const getPropertyById = (category, id) => {
  return apiClient.get(`${SERVICES.PROPERTY}/${category}/${id}`);
};



export const verifyAgentPropertyVerification = (category, id, payload) => {
  return apiClient.patch(
    `${SERVICES.PROPERTY}/${category}/${id}/verify-document`,
    payload,
  );
};


// Roles Analytics
export const getSuperAdimnAnalytics = () => {
  return apiClient.get(`${SERVICES.PROPERTY}/analytics/superadmin`);
};

export const getAdminAnalytics = () => {
  return apiClient.get(`${SERVICES.PROPERTY}/analytics/admin`);
};


export const getSalesManagerAnalytics = (params = {}) => {
  const query = new URLSearchParams();
  if (params.from) query.set("from", params.from);
  if (params.to) query.set("to", params.to);
  const qs = query.toString();
  return apiClient.get(
    `${SERVICES.PROPERTY}/analytics/salemanager${qs ? `?${qs}` : ""}`,
  );
};

export const getSalesAgentAnalytics = (params = {}) => {
  const query = new URLSearchParams();
  if (params.from) query.set("from", params.from);
  if (params.to) query.set("to", params.to);
  const qs = query.toString();
  return apiClient.get(
    `${SERVICES.PROPERTY}/analytics/saleagent${qs ? `?${qs}` : ""}`,
  );
};



///////

export const projectAnalytics = (id) => {
  return apiClient.get(`${SERVICES.PROPERTY}/leads/project/${id}/leads`);
};

export const deleteProjectLead = (id) => {
  return apiClient.delete(`${SERVICES.PROPERTY}/leads/${id}`);
};

export const deleteAllProjectLeads = (id) => {
  return apiClient.delete(`${SERVICES.PROPERTY}/leads/project/${id}/leads`);
};

export const projectExternalFileAddLeads = (id, payload) => {
  return apiClient.post(
    `${SERVICES.PROPERTY}/leads/project/${id}/leads/import`,
    payload,
  );
}

export const propertiesAnalytics = (id) =>{
  return apiClient.get(`${SERVICES.PROPERTY}/leads?projectId=${id}`);
}

// Sales Manager
export const getSalesManagerPeddingProjects = () => {
  return apiClient.get(`${SERVICES.PROPERTY}/pending-projects`);
}

export const salesmanagerApproveAProject = (id) =>
  withSidebarRefresh(apiClient.patch(`${SERVICES.PROPERTY}/${id}/approve`));

export const salesmanagerRejectAProject = (id, body = {}) =>
  withSidebarRefresh(apiClient.patch(`${SERVICES.PROPERTY}/${id}/reject`, body));



export const getAllProjectsAnalytics = (params = {}) => {
  const query = new URLSearchParams();
  if (params.state) query.set("state", params.state);
  if (params.city) query.set("city", params.city);
  if (params.locality) query.set("locality", params.locality);
  if (params.from) query.set("from", params.from);
  if (params.to) query.set("to", params.to);
  if (params.creatorIds) query.set("creatorIds", params.creatorIds);
  const qs = query.toString();
  return apiClient.get(
    `${SERVICES.PROPERTY}/analytics/project${qs ? `?${qs}` : ""}`,
  );
};


export const getAllPropertiesAnalytics = (params = {}) => {
  const query = new URLSearchParams();
  if (params.state) query.set("state", params.state);
  if (params.city) query.set("city", params.city);
  if (params.locality) query.set("locality", params.locality);
  if (params.from) query.set("from", params.from);
  if (params.to) query.set("to", params.to);
  if (params.creatorIds) query.set("creatorIds", params.creatorIds);
  const qs = query.toString();
  return apiClient.get(
    `${SERVICES.PROPERTY}/analytics/properties${qs ? `?${qs}` : ""}`,
  );
};

/** State / city / locality project + property counts for Locations admin. */
export const getLocationListingCounts = () =>
  apiClient.get(`${SERVICES.PROPERTY}/analytics/location-counts`);


/** CCE / Team Lead: update listing/project follow-up process. */
export const updateListingFollowUpWorkStatus = (entity, id, followUpWorkStatus) => {
  return apiClient.patch(
    `${SERVICES.PROPERTY}/follow-up/${entity}/${id}/work-status`,
    { followUpWorkStatus },
  );
};

//src/features/property/propertyService.js
{/* Blogs */ }

const buildBlogQuery = (filters = {}) => {
  const query = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    query.set(key, String(value));
  });
  return query.toString();
};

const unwrapBlogListPayload = (payload) => {
  if (!payload || typeof payload !== "object") {
    return { items: [], total: 0, page: 1, limit: 100, totalPages: 1 };
  }
  // Support both `{ items, total }` and `{ data: { items, total } }`
  const body =
    payload.items || payload.blogs || Array.isArray(payload.data)
      ? payload
      : payload.data && typeof payload.data === "object"
        ? payload.data
        : payload;

  const items = Array.isArray(body.items)
    ? body.items
    : Array.isArray(body.blogs)
      ? body.blogs
      : Array.isArray(body.data)
        ? body.data
        : [];

  return {
    ...body,
    items,
    total: Number(body.total) || items.length,
    page: Number(body.page) || 1,
    limit: Number(body.limit) || items.length || 100,
    totalPages: Number(body.totalPages) || 1,
  };
};

/** Admin list: load every blog (paginate until complete). */
export const getBlogs = async (filters = {}) => {
  const pageSize = Math.min(Math.max(Number(filters.limit) || 100, 1), 100);
  let page = 1;
  let allItems = [];
  let last = null;

  while (page <= 50) {
    const qs = buildBlogQuery({
      ...filters,
      page,
      limit: pageSize,
    });
    const res = await apiClient.get(
      `${SERVICES.PROPERTY}/blogs${qs ? `?${qs}` : ""}`,
    );
    const parsed = unwrapBlogListPayload(res?.data);
    last = parsed;
    allItems = allItems.concat(parsed.items || []);

    const total = parsed.total || allItems.length;
    const totalPages = Math.max(
      1,
      parsed.totalPages || Math.ceil(total / pageSize),
    );

    if (allItems.length >= total || page >= totalPages || !parsed.items?.length) {
      break;
    }
    page += 1;
  }

  // Dedupe by id (in case pages overlap)
  const byId = new Map();
  for (const blog of allItems) {
    if (!blog || typeof blog !== "object") continue;
    const id = String(blog._id || blog.id || blog.slug || "");
    if (!id) continue;
    if (!byId.has(id)) byId.set(id, blog);
  }
  const items = byId.size ? Array.from(byId.values()) : allItems;

  return {
    data: {
      ...(last || {}),
      items,
      total: last?.total ?? items.length,
      page: 1,
      limit: items.length,
      totalPages: 1,
    },
  };
};

export const getBlogById = (id) => {
  return apiClient.get(`${SERVICES.PROPERTY}/blogs/${id}`);
};

export const getBlogBySlug = (slug) => {
  return apiClient.get(`${SERVICES.PROPERTY}/blogs/slug/${slug}`);
};

export const deleteBlog = (id) => {
  return apiClient.delete(`${SERVICES.PROPERTY}/blogs/${id}`);
};

export const createBlog = (payload) => {
  return apiClient.post(`${SERVICES.PROPERTY}/blogs`, payload);
}

/** TipTap / in-article blog images (field name: image) */
export const uploadBlogContentImage = (file) => {
  const formData = new FormData();
  formData.append("image", file);
  return apiClient.post(
    `${SERVICES.PROPERTY}/blogs/upload-content-image`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
};

export const updateBlog = (id, payload) => {
  return apiClient.patch(`${SERVICES.PROPERTY}/blogs/${id}`, payload);
};

export const shareBlog = (id, payload) => {
  return apiClient.post(`${SERVICES.PROPERTY}/blogs/${id}/share`, payload);
};

export const likesBlog = (id) => apiClient.post(`${SERVICES.PROPERTY}/blogs/${id}/like`);
