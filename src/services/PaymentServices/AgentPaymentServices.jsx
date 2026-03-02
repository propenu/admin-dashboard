import authAxios from "../../config/authApi";
import { PAYMENT_API_ENDPOINTS } from "../../config/PaymentServicesApi";
import { USER_API_CONFIG } from "../../config/UserDeatilsApi";

export const getAgentPaymentServices = async () => {
  const res = await authAxios.get(
    PAYMENT_API_ENDPOINTS.AGENT_PAYMENT_SERVICES,
    USER_API_CONFIG,
  );
  return res.data;
};

export const getOwnerBuyPaymentServices = async () => {
  const res = await authAxios.get(
    PAYMENT_API_ENDPOINTS.OWNER_PAYMENT_BUY,
    USER_API_CONFIG,
  );
  return res.data;
};

export const getOwnerSellPaymentServices = async () => {
  const res = await authAxios.get(
    PAYMENT_API_ENDPOINTS.OWNER_PAYMENT_SELL,
    USER_API_CONFIG,
  );
  return res.data;
};

export const getOwnerRentPaymentServices = async () => {
  const res = await authAxios.get(
    PAYMENT_API_ENDPOINTS.OWNER_PAYMENT_RENT,
    USER_API_CONFIG,
  );
  return res.data;
};

export const getOwnerRentViewPaymentServices = async () => {
  const res = await authAxios.get(
    PAYMENT_API_ENDPOINTS.OWNER_PAYMENT_RENT_VIEW,
    USER_API_CONFIG,
  );
  return res.data;
};

export const patchPaymentPlan = async (code, updatedData) => {
  const res = await authAxios.patch(
    `${PAYMENT_API_ENDPOINTS.PAYMENT_PLAN_EDIT}${code}`,
    updatedData,
    USER_API_CONFIG,
  );
  return res.data;
};
