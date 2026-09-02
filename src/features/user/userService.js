// src/features/property/common/userService.js
import { apiClient } from "../../api/apiClient";
import { SERVICES } from "../../config/services";
import { ENV } from "../../config/env";
import axios from "axios";
import { getAuthToken } from "../../utils/authToken";

///////////////////////////////////////////////////////////////////////////////
///      User Services                   
///////////////////////////////////////////////////////////////////////////////
export const requestOtp = async (email) => {
  try {
    const res = await apiClient.post(
      `${SERVICES.USER}/auth/request-otp`,
      { email },
    );
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "OTP sending failed" };
  } 
}

export const verifyOtpService = async ({otp, email}) => {
  try {
    const res = await apiClient.post(
      `${SERVICES.USER}/auth/verify-otp`,
      { otp, email },
    );
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "Invalid OTP" };
  } 
}


/////////////////////////////////////////////////////////////////////
// Super admin create role user For dash board 
/////////////////////////////////////////////////////////////////////

export const createRequestOtp = async (email) => {
  try {
    const res = await apiClient.post(
      `${SERVICES.USER}/auth/request-otp/admin-create`,
      { email },
    );
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "OTP sending failed" };
  }
};

export const createVerifyOtpService = async (payload) => {
  try {
    const res = await apiClient.post(
      `${SERVICES.USER}/auth/verify-otp/admin-create`,
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
      `${ENV.API_BASE_URL}${SERVICES.USER}/auth/update-location/admin-create`,
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

///////////////////////////////
  {/* User Services */}
//////////////////////////////
//All Users
export const getAllUsers = (params) => {
  return apiClient.get(`${SERVICES.USER}/auth/all-users`, { params });
};

/** Public user signup OTP (propenu.com path) — used by SE client onboarding */
export const seCreateRequestOtp = (payload) =>
  apiClient.post(`${SERVICES.USER}/auth/request-otp/create`, payload);

export const seCreateVerifyOtp = (payload) =>
  apiClient.post(`${SERVICES.USER}/auth/verify-otp/create`, payload);

/** Complete location with the NEW user's token (do not replace staff session cookie). */
export const seCreateUpdateLocation = (payload, onboardingToken) =>
  apiClient.post(`${SERVICES.USER}/auth/update-location/create`, payload, {
    headers: { Authorization: `Bearer ${onboardingToken}` },
  });

/** DigiLocker KYC start — uses NEW user's onboarding token (not staff session). */
export const seStartKyc = (onboardingToken) =>
  apiClient.get(`${SERVICES.USER}/kyc/start`, {
    headers: { Authorization: `Bearer ${onboardingToken}` },
  });

/** Poll client account / KYC status with onboarding token. */
export const seGetOnboardingMe = (onboardingToken) =>
  apiClient.get(`${SERVICES.USER}/auth/me`, {
    headers: { Authorization: `Bearer ${onboardingToken}` },
  });

/** Assign marketplace client (user/agent/builder) → Sales Executive */
export const seClaimClient = (payload) =>
  apiClient.post(`${SERVICES.USER}/auth/se-claim-client`, payload);

/** Clients owned by a Sales Executive */
export const getSeClients = (salesExecutiveId) =>
  getAllUsers({ managerId: salesExecutiveId });

/** CCE / Team Lead: update follow-up work process (assigned | in_progress | completed). */
export const updateFollowUpWorkStatus = (id, followUpWorkStatus) => {
  return apiClient.patch(`${SERVICES.USER}/auth/${id}/follow-up-work-status`, {
    followUpWorkStatus,
  });
};

// User search — `role` may be a string, or params object ({ role, createdFrom, createdTo })
export const getUserSearch = (queryOrParams, extraParams = {}) => {
  const params =
    queryOrParams && typeof queryOrParams === "object"
      ? { ...queryOrParams, ...extraParams }
      : { role: queryOrParams, ...extraParams };
  return apiClient.get(`${SERVICES.USER}/auth/search`, { params });
};

//User Details
export const getUserDetails = () => {
  return apiClient.get(`${SERVICES.USER}/auth/me`);
};

/** Heartbeat: "we heard from them" while admin tab is open. */
export const pingPresence = () => {
  return apiClient.post(`${SERVICES.USER}/auth/presence/ping`);
};

//////////////////////////////////////////////////////////////////////////////////////

//TransferCredentials
export const transferCredentials = (id, formData) => {
  return apiClient.patch(`${SERVICES.USER}/auth/${id}/role`, formData);
};

/** Eligible person-level managers for a target role (hierarchy-aware). */
export const getEligibleReportsTo = (params = {}) => {
  return apiClient.get(`${SERVICES.USER}/auth/eligible-reports-to`, { params });
};

/** Above / below / reports-to roles for a role name. */
export const getRoleHierarchyGuide = (role) => {
  return apiClient.get(`${SERVICES.USER}/auth/role-hierarchy`, { params: { role } });
};

/** Generalized assign reports-to (any hierarchy pair). */
export const assignReportsTo = (formData) => {
  return apiClient.post(`${SERVICES.USER}/auth/assign-reports-to`, formData);
};

//Agent Verifcation Status Edit
export const editAgentVerificationStatus = (id, formData) => {
  return apiClient.patch(`${SERVICES.USER}/agent/admin/verify/${id}`, formData);
};



/* agentedit */
export const editAgent = (id, formData) => {
  return apiClient.patch(`${SERVICES.USER}/agent/${id}`, formData);
};

export const postRegisteredAgent = (formData) => {
  return apiClient.post(`${SERVICES.USER}/agent`, formData);
};


//Manage Team Members
export const getManagerAndTeamMembers = (id) => {
  return apiClient.get(`${SERVICES.USER}/auth/manager-team-details/${id}`);
};

//AssignMangered
export const assignManager = (formData) => {
  return apiClient.post(`${SERVICES.USER}/auth/assign-manager`, formData);
};

//Custom Notification (multipart: title, body, audience, state, city, locality, image)
export const adminCustomNotification = (formData) => {
  return apiClient.post(
    `${SERVICES.USER}/notifications/admin/notify/custom`,
    formData,
  );
};

/** Campaign history + platform admin alerts */
export const getAdminNotificationFeed = (params = {}) => {
  return apiClient.get(`${SERVICES.USER}/notifications/admin/feed`, { params });
};

export const markAdminNotificationsSeen = () => {
  return apiClient.post(`${SERVICES.USER}/notifications/admin/feed/seen`);
};

//All email notifications
export const getAllEmailNotifications = () => {
  return apiClient.get(`${SERVICES.USER}/email`);
};
//Email Notifications
export const createEmailNotification = (formData) => {
  return apiClient.post(`${SERVICES.USER}/email`, formData);
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
  return apiClient.delete(`${SERVICES.USER}/email/${id}`);
}

export const sentEmailNotification = (formData) => {
  return apiClient.post(`${SERVICES.USER}/email/send-email`, formData);
}

///////////////////////////////////////////////////////////////
{/* Whatsapp Notification */}

export const geAlltWhatsappLogs = () => {
  return apiClient.get(`${SERVICES.USER}/whatsapp/whatsapp-logs`);
}

export const getWhatsAppNotificationAnalytics = () => {
  return apiClient.get(`${SERVICES.USER}/whatsapp/whatsapp-logs/stats`);
}



export const createWhatsAppNotification = (formData) => {
  return apiClient.post(
    `${SERVICES.USER}/whatsapp`,
    formData,
  );
}

export const getAllWhatsAppNotifications = () => {
  return apiClient.get(`${SERVICES.USER}/whatsapp`);
}

export const getWhatsAppNotificationByName = (name) => {
  return apiClient.get(
    `${SERVICES.USER}/whatsapp/${name}`,
  );
}

export const deleteWhatsAppNotificationByName = (name) => {
  return apiClient.delete(
    `${SERVICES.USER}/whatsapp/${name}`,
  );
}

export const sentWhatsAppNotification = (formData) => {
  return apiClient.post(`${SERVICES.USER}/whatsapp/send-whatsapp`, formData);
}

export const sentBulkWhatsAppNotification = (formData) => {
  return apiClient.post(
    `${SERVICES.USER}/whatsapp/send-csv-bulk-whatsapp`,
    formData,
  );
};

///////////////////////////////////////////////////////////////
{/* WhatsApp Inbox */}

export const getWhatsAppInboxConversations = (params = {}) => {
  return apiClient.get(`${SERVICES.USER}/whatsapp/inbox/conversations`, {
    params,
  });
};

export const getWhatsAppInboxMessages = (waId, params = {}) => {
  return apiClient.get(
    `${SERVICES.USER}/whatsapp/inbox/conversations/${encodeURIComponent(waId)}/messages`,
    { params },
  );
};

export const sendWhatsAppInboxMessage = (waId, text) => {
  return apiClient.post(
    `${SERVICES.USER}/whatsapp/inbox/conversations/${encodeURIComponent(waId)}/messages`,
    { text },
  );
};

export const markWhatsAppInboxRead = (waId) => {
  return apiClient.post(
    `${SERVICES.USER}/whatsapp/inbox/conversations/${encodeURIComponent(waId)}/read`,
  );
};

export const startWhatsAppInboxConversation = (payload) => {
  return apiClient.post(
    `${SERVICES.USER}/whatsapp/inbox/conversations`,
    payload,
  );
};

export const syncWhatsAppInboxFromLogs = () => {
  return apiClient.post(`${SERVICES.USER}/whatsapp/inbox/sync`);
};

export const updateWhatsAppInboxConversation = (waId, payload) => {
  return apiClient.patch(
    `${SERVICES.USER}/whatsapp/inbox/conversations/${encodeURIComponent(waId)}`,
    payload,
  );
};

export const searchWhatsAppInboxAssignableAgents = (params = {}) => {
  return apiClient.get(`${SERVICES.USER}/whatsapp/inbox/assignable-agents`, {
    params,
  });
};

export const getWhatsAppInboxAssignableRoles = () => {
  return apiClient.get(`${SERVICES.USER}/whatsapp/inbox/assignable-roles`);
};

export const getWhatsAppInboxHealth = () => {
  return apiClient.get(`${SERVICES.USER}/whatsapp/inbox/health`);
};

export const getWhatsAppInboxStreamUrl = () => {
  return `${ENV.API_BASE_URL}${SERVICES.USER}/whatsapp/inbox/stream`;
};

/**
 * Subscribe to WhatsApp Cloud inbox SSE (Bearer auth — EventSource cannot set headers).
 * onEvent receives parsed { type, waId, ... } from `event: inbox` frames.
 */
export const subscribeWhatsAppInboxStream = ({
  onEvent,
  onConnected,
  onError,
  signal,
} = {}) => {
  const url = getWhatsAppInboxStreamUrl();
  const token = getAuthToken();

  const run = async () => {
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "text/event-stream",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        signal,
        credentials: "include",
      });

      if (!response.ok || !response.body) {
        throw new Error(`Inbox stream failed (${response.status})`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let sep;
        while ((sep = buffer.indexOf("\n\n")) >= 0) {
          const chunk = buffer.slice(0, sep);
          buffer = buffer.slice(sep + 2);

          let eventName = "message";
          const dataLines = [];
          for (const line of chunk.split("\n")) {
            if (line.startsWith("event:")) {
              eventName = line.slice(6).trim();
            } else if (line.startsWith("data:")) {
              dataLines.push(line.slice(5).trim());
            }
          }
          if (!dataLines.length) continue;
          let payload = null;
          try {
            payload = JSON.parse(dataLines.join("\n"));
          } catch {
            payload = { raw: dataLines.join("\n") };
          }

          if (eventName === "connected") {
            onConnected?.(payload);
          } else if (eventName === "inbox") {
            onEvent?.(payload);
          }
        }
      }

      if (!signal?.aborted) {
        onError?.(new Error("Inbox stream closed"));
      }
    } catch (err) {
      if (signal?.aborted) return;
      onError?.(err);
    }
  };

  run();
};

///////////////////////////////////////////////////////////////////

export const getEmailCampaignStatus = (campaignId) => {
  return apiClient.get(
    `${SERVICES.USER}/email/send-email-campaign-status`,
    {
      params: campaignId ? { campaignId } : {}, 
    },
  );
};
///////////////////////////////////////////////////////////////////


export const editBuilderProfile = (id, formData) => {
  return apiClient.patch(`${SERVICES.USER}/builder/profile/${id}`, formData);
};

export const getBuilderProfileById = (id) => {
  return apiClient.get(`${SERVICES.USER}/builder/profile/${id}`);
};

export const editUserProfile = (id, formData) => {
  return apiClient.patch(`${SERVICES.USER}/auth/${id}/profile`, formData);
};

export const requestOtpBuilderPhoneNumber = (id, formData) => {
  return apiClient.post(
    `${SERVICES.USER}/auth/${id}/profile/phone/request-otp`,
    formData,
  );
};

export const verifyBuilderPhoneNumberOTP = (id, formData) => {
  return apiClient.patch(`${SERVICES.USER}/auth/${id}/profile`, formData);
};

export const requestOtpUserPhoneNumber = (id, formData) => {
  return apiClient.post(
    `${SERVICES.USER}/auth/${id}/profile/phone/request-otp`,
    formData,
  );
};

export const verifyUserPhoneNumberOTP = (id, formData) => {
  return apiClient.patch(`${SERVICES.USER}/auth/${id}/profile`, formData);
};







