//frontend/admin-dashboard/src/config/PaymentServicesApi.js
export const PAYMENT_API_BASE_URL = import.meta.env.VITE_API_PAYMENT_SERVICES_URL;

export const PAYMENT_API_ENDPOINTS = {
  // FETCH 
  AGENT_PAYMENT_SERVICES: `${PAYMENT_API_BASE_URL}/plans?userType=agent`,
  OWNER_PAYMENT_BUY: `${PAYMENT_API_BASE_URL}/plans?userType=owner&category=buy`,
  OWNER_PAYMENT_RENT_VIEW: `${PAYMENT_API_BASE_URL}/plans?userType=owner&category=rent_view`,
  OWNER_PAYMENT_SELL: `${PAYMENT_API_BASE_URL}/plans?userType=owner&category=sell`,
  OWNER_PAYMENT_RENT: `${PAYMENT_API_BASE_URL}/plans?userType=owner&category=rent`,

  // EDIT 
  PAYMENT_PLAN_EDIT: `${PAYMENT_API_BASE_URL}/plans/`,
};
