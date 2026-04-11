// src/pages/EmailNotifications/hooks/useEmailLogs.js
import { useState } from "react";
import { toast } from "sonner";
import {
  getSentEmailNotification,
  getSentEmailNotificationAnalytics,
  getCanpaingsAnalytics,
  getRunningCampaigns,
  resentCanpaingByCampaignId,
} from "../../../features/user/userService";

export const useEmailLogs = () => {
  const [logs, setLogs] = useState([]);
  const [emailStats, setEmailStats] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [running, setRunning] = useState(null);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [retrying, setRetrying] = useState(null);

  const fetchLogs = async () => {
    try {
      setLoadingLogs(true);
      const [logsR, statsR, campR, runR] = await Promise.allSettled([
        getSentEmailNotification(),
        getSentEmailNotificationAnalytics(),
        getCanpaingsAnalytics(),
        getRunningCampaigns(),
      ]);

      if (logsR.status === "fulfilled") {
        const d = logsR.value?.data;
        setLogs(Array.isArray(d) ? d : Array.isArray(d?.data) ? d.data : []);
      }

      if (statsR.status === "fulfilled") {
        setEmailStats(statsR.value?.data?.data || statsR.value?.data || null);
      }

      if (campR.status === "fulfilled") {
        const d = campR.value?.data;
        setCampaigns(
          Array.isArray(d) ? d : Array.isArray(d?.data) ? d.data : [],
        );
      }

      if (runR.status === "fulfilled") {
        const d = runR.value?.data?.data || runR.value?.data || null;
        setRunning(d?.campaignId ? d : null);
      }
    } catch {
      toast.error("Failed to load logs");
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleRetry = async (campaignId) => {
    try {
      setRetrying(campaignId);
      await resentCanpaingByCampaignId(campaignId);
      toast.success("Retry triggered for campaign!");
      fetchLogs();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Retry failed");
    } finally {
      setRetrying(null);
    }
  };

  return {
    logs,
    emailStats,
    campaigns,
    running,
    loadingLogs,
    retrying,
    fetchLogs,
    handleRetry,
  };
};
