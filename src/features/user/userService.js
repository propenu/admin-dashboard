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

//TransferCredentials
export const transferCredentials = (id, formData) => {
  return apiClient.patch(`${SERVICES.USER}/auth/${id}/role`, formData);
};

//Agent Verifcation Status Edit
export const editAgentVerificationStatus = (id, formData) => {
  return apiClient.patch(`${SERVICES.USER}/agent/admin/verify/${id}`, formData);
};

//Manage Team Members
export const getManagerAndTeamMembers = (id) => {
  return apiClient.get(`${SERVICES.USER}/auth/manager-team-details/${id}`);
};

//AssignMangered
export const assignManager = (formData) => {
  return apiClient.post(`${SERVICES.USER}/auth/assign-manager`, formData);
};

//Custom Notification
export const adminCustomNotification = (formData) => {
  return apiClient.post(
    `${SERVICES.USER}/notifications/admin/notify/custom`,
    formData,
  );
};



//All email notifications
export const getAllEmailNotifications = () => {
  return apiClient.get(`${SERVICES.USER}/email`);
};
//Email Notifications
export const createEmailNotification = (formData) => {
  return apiClient.post(`${SERVICES.USER}/notifications/email`, formData);
}
export const getEmailNotification = (id) => {
  return apiClient.get(`${SERVICES.USER}/email/${id}`);
}

export const getSentEmailNotification = () => {
  return apiClient.get(`${SERVICES.USER}/email/email-logs`);
}

export const getSentEmailNotificationAnalytics = () => {
  return apiClient.get(`${SERVICES.USER}/email/email-logs/stats`);
}


export const getCanpaingsAnalytics = () => {
  return apiClient.get(`${SERVICES.USER}/email/email-logs/campaigns`);
}

export const getCanpaingsAnalyticsByCampaignId = (campaignId) => {
  return apiClient.get(
    `${SERVICES.USER}/email/email-logs/campaign/${campaignId}`,
  );
};

export const resentCanpaingByCampaignId = (campaignId) => {
  return apiClient.post(
    `${SERVICES.USER}/email/email-logs/retry-failed/${campaignId}`,
  );
};

export const getRunningCampaigns = () => {
  return apiClient.get(`${SERVICES.USER}/email/email-logs/campaign-running`);
}


export const sentBulkEmailNotification = (formData) => {
  return apiClient.post(
    `${SERVICES.USER}/email/send-csv-bulk-email`,
    formData,
  );
}


export const updateEmailNotification = (id, formData) => {
  return apiClient.put(`${SERVICES.USER}/email/${id}`, formData);
}

export const deleteEmailNotification = (id) => {
  return apiClient.delete(`${SERVICES.USER}/notifications/email/${id}`);
}

export const sentEmailNotification = (formData) => {
  return apiClient.post(`${SERVICES.USER}/email/send-email`, formData);
}


{/* Whatsapp Notification */}
export const createWhatsAppNotification = (formData) => {
  return apiClient.post(
    `${SERVICES.USER}/notifications/whatsapp/template`,
    formData,
  );
}

export const updateWhatsAppNotification = (formData) => {
  return apiClient.put(
    `${SERVICES.USER}/notifications/whatsapp/template`,
    formData,
  );
};

export const getAllWhatsAppNotifications = () => {
  return apiClient.get(`${SERVICES.USER}/notifications/whatsapp/template`);
}

export const getWhatsAppNotificationByName = (name) => {
  return apiClient.get(
    `${SERVICES.USER}/notifications/whatsapp/template/${name}`,
  );
}

export const deleteWhatsAppNotificationByName = (name) => {
  return apiClient.delete(
    `${SERVICES.USER}/notifications/whatsapp/template/${name}`,
  );
}



export const getEmailCampaignStatus = (campaignId) => {
  return apiClient.get(
    `${SERVICES.USER}/notifications/send-email-campaign-status`,
    {
      params: campaignId ? { campaignId } : {}, 
    },
  );
};




