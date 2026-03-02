// frontend/admin-dashboard/src/store/payment/PaymentSlice.js

import { createSlice } from "@reduxjs/toolkit";
import { fetchPaymentPlans, patchPaymentPlanThunk } from "./paymentThunks";

const initialState = {
  selectedPlan: null,
  plans: [],
  loading: false,
  error: null,
};

const paymentSlice = createSlice({
  name: "payment",
  initialState,

  reducers: {
    setSelectedPlan: (state, action) => {
      state.selectedPlan = action.payload;
    },

    // optional helper (safe to keep)
    clearSelectedPlan: (state) => {
      state.selectedPlan = null;
    },
  },

  extraReducers: (builder) => {
    builder

      /* ================= FETCH ================= */
      .addCase(fetchPaymentPlans.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchPaymentPlans.fulfilled, (state, action) => {
        state.loading = false;
        state.plans = action.payload || [];
      })

      .addCase(fetchPaymentPlans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch payment plans";
      })

      /* ================= PATCH ================= */
      .addCase(patchPaymentPlanThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(patchPaymentPlanThunk.fulfilled, (state, action) => {
        state.loading = false;

        const updatedPlan = action.payload;
        if (!updatedPlan) return;

        // 🔥 Instant UI update
        const index = state.plans.findIndex(
          (plan) => plan.code === updatedPlan.code,
        );

        if (index !== -1) {
          state.plans[index] = updatedPlan;
        }

        if (state.selectedPlan?.code === updatedPlan.code) {
          state.selectedPlan = updatedPlan;
        }
      })

      .addCase(patchPaymentPlanThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to update payment plan";
      });
  },
});

export const { setSelectedPlan, clearSelectedPlan } = paymentSlice.actions;

export default paymentSlice.reducer;
