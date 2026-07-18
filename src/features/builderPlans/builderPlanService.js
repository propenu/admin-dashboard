import { apiClient } from "../../api/apiClient";
import { SERVICES } from "../../config/services";

const BASE_URL = `${SERVICES.PAYMENT}/builder-plans`;
const INVOICE_URL = `${SERVICES.PAYMENT}/builder-invoices`;

export const builderPlanService = {
  list: (params = {}) => apiClient.get(BASE_URL, { params }).then((response) => response.data),
  get: (id) => apiClient.get(`${BASE_URL}/${id}`).then((response) => response.data),
  create: (payload) => apiClient.post(BASE_URL, payload).then((response) => response.data),
  update: (id, payload) => apiClient.patch(`${BASE_URL}/${id}`, payload).then((response) => response.data),
  remove: (id) => apiClient.delete(`${BASE_URL}/${id}`).then((response) => response.data),
  builders: () => apiClient.get("/api/users/auth/search?role=builder").then((response) => response.data?.results || []),
  builderProjects: (builderId) => apiClient.get("/api/properties/featured-project", { params: { createdBy: builderId, limit: 100, promotionStatus: "all" } }).then((response) => response.data?.items || []),
  createInvoice: (payload) => apiClient.post(INVOICE_URL, payload).then((response) => response.data),
  invoices: (params = {}) => apiClient.get(INVOICE_URL, { params }).then((response) => response.data),
  invoicePdf: (id, download = false) => apiClient.get(`${INVOICE_URL}/${id}/pdf`, {
    params: download ? { download: true } : {}, responseType: "blob",
  }).then((response) => response.data),
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
