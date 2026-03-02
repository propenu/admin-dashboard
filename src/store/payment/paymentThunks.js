import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  getAgentPaymentServices,
  getOwnerRentPaymentServices,
  getOwnerSellPaymentServices,
  getOwnerBuyPaymentServices,
  getOwnerRentViewPaymentServices,
  patchPaymentPlan,
} from "../../services/PaymentServices/AgentPaymentServices";




/* ================= FETCH ================= */
export const fetchPaymentPlans = createAsyncThunk(
  "payment/fetchPaymentPlans",
  async ({ userType, category }, { rejectWithValue }) => {
    try {
      // -------- AGENT --------
      if (userType === "agent") {
        return await getAgentPaymentServices();
      }

      // -------- OWNER --------
      if (userType === "owner" && category === "buy") {
        return await getOwnerBuyPaymentServices();
      }

      if (userType === "owner" && category === "rent") {
        return await getOwnerRentPaymentServices();
      }

      if (userType === "owner" && category === "sell") {
        return await getOwnerSellPaymentServices();
      }

      if (userType === "owner" && category === "rent_view") {
        return await getOwnerRentViewPaymentServices();
      }

      return [];
    } catch (error) {
      return rejectWithValue("Failed to load plans");
    }
  },
);

/* ================= PATCH (ALL MEMBERS) ================= */
export const patchPaymentPlanThunk = createAsyncThunk(
  "payment/patchPaymentPlan",
  async ({ code, updatedFields }, { rejectWithValue }) => {
    try {
      const res = await patchPaymentPlan(code, updatedFields);
      return res.plan;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Update failed");
    }
  },
);
