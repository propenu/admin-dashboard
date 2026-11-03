import { apiClient } from "../../api/apiClient";
import { SERVICES } from "../../config/services";

/**
 * Paid subscription plans for admin/telesales payment links.
 * Owner/user → owner plans only. Agent → agent plans only.
 * Buyer / builder / other types are never returned.
 */
export const getSubscriptionPlansForLink = async (userType) => {
  const allowed = String(userType || "").trim().toLowerCase();
  if (allowed !== "owner" && allowed !== "agent") {
    return [];
  }

  const { data } = await apiClient.get(`${SERVICES.PAYMENT}/plans`, {
    params: { userType: allowed },
  });
  const plans = Array.isArray(data) ? data : data?.plans || [];

  return plans
    .filter((plan) => {
      const planType = String(plan?.userType || "")
        .trim()
        .toLowerCase();
      if (planType !== allowed) return false;
      if (Number(plan?.price) <= 0) return false;
      // Owner/user links: listing owner plans only (not buyer "buy" catalog).
      if (allowed === "owner") {
        const category = String(plan?.category || "")
          .trim()
          .toLowerCase();
        if (category === "buy") return false;
      }
      return true;
    })
    .sort((a, b) => Number(a?.price || 0) - Number(b?.price || 0));
};

/**
 * Create a 7-day dynamic checkout URL for an owner/agent.
 * Matches POST /api/payments/admin-links
 */
export const createSubscriptionPaymentLink = async ({
  userId,
  planId,
  discountPercent = 0,
}) => {
  const { data } = await apiClient.post(`${SERVICES.PAYMENT}/admin-links`, {
    userId,
    planId,
    discountPercent: Number(discountPercent) || 0,
  });
  return data;
};
