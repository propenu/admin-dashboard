// src/features/property/common/userService.js

import { apiClient } from "../../api/apiClient";
import { SERVICES } from "../../config/services";
import { ENV } from "../../config/env";
import axios from "axios";

export const createRequestOtp = async (phone) => {
  try {
    const res = await apiClient.post(
      `${SERVICES.USER}/auth/request-otp/create`,
      { phone },
    );
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "OTP sending failed" };
  }
};

export const createVerifyOtpService = async (payload) => {
  try {
    const res = await apiClient.post(
      `${SERVICES.USER}/auth/verify-otp/create`,
      payload,
    );
    return res.data; // Expected: { success: true, token: "...", user: {...} }
  } catch (err) {
    throw err.response?.data || { message: "OTP verification failed" };
  }
};

// Pass the token explicitly for the final step
export const createUserLocationDetails = async (formData) => {
  try {
    // 1. Get the specific token from storage
    const locationToken = localStorage.getItem("locationToken");

    // 2. Use 'axios' directly instead of 'apiClient'
    const res = await axios.post(
      `${ENV.API_BASE_URL}${SERVICES.USER}/auth/update-location/create`,
      formData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${locationToken}`,
        },
      },
    );

    return res.data;
  } catch (err) {
    // Since we aren't using the interceptor, we handle the error directly
    throw err.response?.data || { message: "Location update failed" };
  }
};


//All Users
export const getAllUsers = () => {
    return apiClient.get(`${SERVICES.USER}/auth/all-users`);
};

//UserSerach
export const getUserSearch = (query) => {
    return apiClient.get(`${SERVICES.USER}/auth/search?role=${query}`);
};

//Agent Verifcation Status Edit 
export const editAgentVerificationStatus = (id, formData) => {
    return apiClient.patch(
      `${SERVICES.USER}/agent/admin/verify/${id}`,
      formData,
    );
}

//Manage Team Members
export const getManagerAndTeamMembers = (id) => {
    return apiClient.get(
      `${SERVICES.USER}/auth/manager-team-details/${id}`,
    );
}

//AssignMangered
export const assignManager = (formData) => {
    return apiClient.post(
      `${SERVICES.USER}/auth/assign-manager`,
      formData,
    );
}

//Custom Notification
export const adminCustomNotification = (formData) => {
    return apiClient.post(
      `${SERVICES.USER}/notifications/admin/notify/custom`,
      formData,
    );
}

