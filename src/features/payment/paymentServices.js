import { apiClient } from "../../api/apiClient";
import { SERVICES } from "../../config/services";

const withRange = (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    query.set(key, String(value));
  });
  const qs = query.toString();
  return qs ? `?${qs}` : "";
};

// ===== Dashboard Summary =====
export const getAccountsSummary = async (params = {}) =>
  apiClient.get(`${SERVICES.PAYMENT}/accounts/summary${withRange(params)}`);

// ===== Payments List (Paid / Failed) =====
export const getPaymentsList = async (status, params = {}) =>
  apiClient.get(
    `${SERVICES.PAYMENT}/accounts/payments${withRange({
      status,
      ...params,
    })}`,
  );

// ===== Active Subscriptions =====
export const getActiveSubscriptions = async (params = {}) =>
  apiClient.get(`${SERVICES.PAYMENT}/accounts/subscriptions${withRange(params)}`);

// ===== Subscription History =====
export const getSubscriptionHistory = async () =>
  apiClient.get(`${SERVICES.PAYMENT}/accounts/subscription-history`);

// ===== Revenue By Plan =====
export const getRevenueByPlan = async (params = {}) =>
  apiClient.get(`${SERVICES.PAYMENT}/accounts/revenue/by-plan${withRange(params)}`);
