import { apiClient } from "../../api/apiClient";
import { SERVICES } from "../../config/services";

// ===== Dashboard Summary =====
export const getAccountsSummary = async () =>
  apiClient.get(`${SERVICES.PAYMENT}/accounts/summary`);

// ===== Payments List (Paid / Failed) =====
export const getPaymentsList = async (status) =>
  apiClient.get(`${SERVICES.PAYMENT}/accounts/payments?status=${status}`);

// ===== Active Subscriptions =====
export const getActiveSubscriptions = async () =>
  apiClient.get(`${SERVICES.PAYMENT}/accounts/subscriptions`);

// ===== Subscription History =====
export const getSubscriptionHistory = async () =>
  apiClient.get(`${SERVICES.PAYMENT}/accounts/subscription-history`);

// ===== Revenue By Plan =====
export const getRevenueByPlan = async () =>
  apiClient.get(`${SERVICES.PAYMENT}/accounts/revenue/by-plan`);


