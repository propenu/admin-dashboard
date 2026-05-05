// src/features/users/userDetailService.js
import { apiClient } from "../../api/apiClient";
import { SERVICES } from "../../config/services";

const PAYMENT_BASE = `${SERVICES.PAYMENT}/accounts`;
const PROPERTY_BASE = `${SERVICES.PROPERTY}/featured-project`;

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
export const getUserFeaturedProjects = (userId, type = "featured") =>
  apiClient.get(`${PROPERTY_BASE}?type=${type}&createdBy=${userId}`);

// ── Properties (residential / commercial / land / agricultural) ───────────────
export const getUserProperties = (userId, category = "residential") =>
  apiClient.get(`${SERVICES.PROPERTY}/${category}?createdBy=${userId}`);
