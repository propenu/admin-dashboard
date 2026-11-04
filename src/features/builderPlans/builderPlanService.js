import { apiClient } from "../../api/apiClient";
import { SERVICES } from "../../config/services";

const BASE_URL = `${SERVICES.PAYMENT}/builder-plans`;
const INVOICE_URL = `${SERVICES.PAYMENT}/builder-invoices`;
const PROFORMA_URL = `${SERVICES.PAYMENT}/builder-proformas`;
const UPLOAD_TIMEOUT = 120000;

const filesForm = (field, files = [], extra = {}) => {
  const form = new FormData();
  files.forEach((file) => form.append(field, file));
  Object.entries(extra).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") form.append(key, typeof value === "string" ? value : JSON.stringify(value));
  });
  return form;
};

export const builderPlanService = {
  list: (params = {}) => apiClient.get(BASE_URL, { params }).then((response) => response.data),
  get: (id) => apiClient.get(`${BASE_URL}/${id}`).then((response) => response.data),
  create: (payload) => apiClient.post(BASE_URL, payload).then((response) => response.data),
  update: (id, payload) => apiClient.patch(`${BASE_URL}/${id}`, payload).then((response) => response.data),
  remove: (id) => apiClient.delete(`${BASE_URL}/${id}`).then((response) => response.data),
  /** Paginated audit trail; `code` limits it to one plan. */
  history: ({ code = "", action = "", page = 1, limit = 20 } = {}) =>
    apiClient
      .get(`${BASE_URL}/history`, { params: { page, limit, ...(code ? { code } : {}), ...(action ? { action } : {}) } })
      .then((response) => response.data),
  removeHistory: ({ code = "", action = "" } = {}) =>
    apiClient
      .delete(`${BASE_URL}/history`, { params: { ...(code ? { code } : {}), ...(action ? { action } : {}) } })
      .then((response) => response.data),
  removeHistoryEntry: (id) => apiClient.delete(`${BASE_URL}/history/${id}`).then((response) => response.data),
  builders: () =>
    apiClient
      .get("/api/users/auth/search", {
        params: { role: "builder", page: 1, limit: 20 },
      })
      .then((response) => response.data?.results || response.data?.data || []),
  /** One page of builders filtered on the server, plus the location values available for the filters. */
  searchBuilders: ({ q = "", state = "", city = "", locality = "", pincode = "", page = 1, limit = 20 } = {}, signal) =>
    apiClient
      .get("/api/users/auth/search", {
        params: {
          role: "builder", page, limit,
          ...(q.trim() ? { q: q.trim() } : {}),
          ...(state ? { state } : {}),
          ...(city ? { city } : {}),
          ...(locality ? { locality } : {}),
          ...(pincode ? { pincode } : {}),
        },
        signal,
      })
      .then((response) => {
        const body = response.data || {};
        const meta = body.meta || {};
        return {
          items: body.results || body.data || [],
          page: Number(meta.page || page),
          total: Number(meta.total || 0),
          hasMore: Boolean(meta.hasMore ?? meta.hasNextPage),
          facets: {
            state: body.facets?.states || [],
            city: body.facets?.cities || [],
            locality: body.facets?.localities || [],
            pincode: body.facets?.pincodes || [],
          },
        };
      }),
  builderProjects: (builderId) => apiClient.get("/api/properties/featured-project", { params: { createdBy: builderId, limit: 100, promotionStatus: "all" } }).then((response) => response.data?.items || []),
  createInvoice: (payload) => apiClient.post(INVOICE_URL, payload).then((response) => response.data),
  updateInvoice: (id, payload) => apiClient.patch(`${INVOICE_URL}/${id}`, payload).then((response) => response.data),
  /** One builder's subscriptions grouped by project: `{ projects, totals, meta }`. */
  builderSubscriptionProjects: (userId, params = {}, signal) =>
    apiClient
      .get(`${INVOICE_URL}/builder/${userId}/projects`, {
        params: Object.fromEntries(Object.entries({ page: 1, limit: 10, ...params }).filter(([, value]) => value !== "" && value != null)),
        signal,
      })
      .then((response) => response.data),
  /** Copy an old invoice (same project + plan) into a renewal that starts after the current paid period. */
  renewInvoice: (id, payload) => apiClient.post(`${INVOICE_URL}/${id}/renew`, payload).then((response) => response.data),
  removeInvoice: (id) => apiClient.delete(`${INVOICE_URL}/${id}`).then((response) => response.data),
  invoices: (params = {}) => apiClient.get(INVOICE_URL, { params }).then((response) => response.data),
  /** Server-paged list: `{ invoices, meta: { total, page, limit, pages }, facets }`. */
  builderSpendSummary: (userId, signal) =>
    apiClient.get(`${INVOICE_URL}/builder/${userId}/spend`, { signal }).then((response) => response.data),
  invoicePage: (params = {}, signal) => apiClient.get(INVOICE_URL, {
    params: Object.fromEntries(Object.entries({ page: 1, limit: 12, ...params }).filter(([, value]) => value !== "" && value != null)),
    signal,
  }).then((response) => response.data),
  /** Ask the property service to start / extend / end the plan promotion right away. */
  syncProjectPromotion: (projectId) =>
    projectId
      ? apiClient
          .post(`/api/properties/featured-project/${projectId}/plan-sync`)
          .then((response) => response.data)
          .catch(() => null)
      : Promise.resolve(null),
  invoicePdf: (id, download = false) => apiClient.get(`${INVOICE_URL}/${id}/pdf`, {
    params: download ? { download: true } : {}, responseType: "blob",
  }).then((response) => response.data),
  /** Record one receipt (cash / cheque / UPI / card / net banking / other) with optional proof files. */
  recordPayment: (invoiceId, entry, proofs = []) =>
    apiClient
      .post(`${INVOICE_URL}/${invoiceId}/payments`, filesForm("proofs", proofs, { payload: entry }), { timeout: UPLOAD_TIMEOUT })
      .then((response) => response.data),
  updatePayment: (invoiceId, paymentId, changes, proofs = []) =>
    apiClient
      .patch(`${INVOICE_URL}/${invoiceId}/payments/${paymentId}`, filesForm("proofs", proofs, { payload: changes }), { timeout: UPLOAD_TIMEOUT })
      .then((response) => response.data),
  removePayment: (invoiceId, paymentId) =>
    apiClient.delete(`${INVOICE_URL}/${invoiceId}/payments/${paymentId}`).then((response) => response.data),

  proformaPage: (params = {}, signal) =>
    apiClient
      .get(PROFORMA_URL, {
        params: Object.fromEntries(Object.entries({ page: 1, limit: 12, ...params }).filter(([, value]) => value !== "" && value != null)),
        signal,
      })
      .then((response) => response.data),
  getProforma: (id) => apiClient.get(`${PROFORMA_URL}/${id}`).then((response) => response.data),
  createProforma: (payload) => apiClient.post(PROFORMA_URL, payload).then((response) => response.data),
  updateProforma: (id, payload) => apiClient.patch(`${PROFORMA_URL}/${id}`, payload).then((response) => response.data),
  removeProforma: (id) => apiClient.delete(`${PROFORMA_URL}/${id}`).then((response) => response.data),
  proformaPdf: (id, download = false) =>
    apiClient
      .get(`${PROFORMA_URL}/${id}/pdf`, { params: download ? { download: true } : {}, responseType: "blob" })
      .then((response) => response.data),
  uploadProformaFiles: (id, files, label = "") =>
    apiClient
      .post(`${PROFORMA_URL}/${id}/attachments`, filesForm("files", files, { label }), { timeout: UPLOAD_TIMEOUT })
      .then((response) => response.data),
  removeProformaFile: (id, attachmentId) =>
    apiClient.delete(`${PROFORMA_URL}/${id}/attachments/${attachmentId}`).then((response) => response.data),
  convertProforma: (id, payload = {}) => apiClient.post(`${PROFORMA_URL}/${id}/convert`, payload).then((response) => response.data),
  assign: async (plan, builderId, projectIds) => {
    const payload = {
      builder: builderId,
      code: plan.code,
      title: plan.title,
      price: Number(plan.price),
      discount: Number(plan.discount || 0),
      description: plan.description,
      promotionType: plan.promotionType,
      durationDays: Number(plan.durationDays || 30),
      isActive: Boolean(plan.isActive),
    };
    const results = await Promise.allSettled(
      projectIds.map((project) => apiClient.post(BASE_URL, { ...payload, project })),
    );
    const failed = results.filter((result) => result.status === "rejected");
    if (failed.length) {
      const error = failed[0].reason;
      error.assignmentSummary = { created: results.length - failed.length, failed: failed.length };
      throw error;
    }
    return { success: true, created: results.length };
  },
};
