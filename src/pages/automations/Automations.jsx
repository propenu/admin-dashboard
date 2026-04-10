// src/pages/automations/Automations.jsx

import { useState, useEffect, useCallback } from "react";
import {
  Mail,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Loader2,
  Activity,
  Zap,
  AlertCircle,
} from "lucide-react";
import { getEmailCampaignStatus } from "../../features/user/userService";
import { CampaignDetail } from "./automationcampaingcomponents/CampaignDetail";
import { CampaignCard } from "./automationcampaingcomponents/CampaignCard";

// ─── Main Page ────────────────────────────────────────────────────────────────
const Automations = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAll = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      const res = await getEmailCampaignStatus();
      const result = res?.data?.data ?? res?.data;
      const list = Array.isArray(result) ? result : result ? [result] : [];
      setCampaigns(list);
    } catch (err) {
      setError(err?.message || "Failed to load campaigns");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  if (selected) {
    return (
      <CampaignDetail campaignId={selected} onBack={() => setSelected(null)} />
    );
  }

  const totalCampaigns = campaigns.length;
  const totalEmails = campaigns.reduce((s, c) => s + (c.total || 0), 0);
  const totalCompleted = campaigns.reduce((s, c) => s + (c.completed || 0), 0);
  const totalFailed = campaigns.reduce((s, c) => s + (c.failed || 0), 0);

  return (
    <div className="min-h-screen  bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-1 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center justify-between gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#27AE60] flex items-center justify-center shrink-0">
              <Zap size={14} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-800 leading-tight">
                Automations
              </h1>
              <p className="text-[10px] text-gray-400 leading-none">
                Email campaigns
              </p>
            </div>
          </div>
          <button
            onClick={() => fetchAll(true)}
            disabled={refreshing}
            className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-[#27AE60]/5 hover:border-[#27AE60]/30 disabled:opacity-50 transition-colors group"
          >
            <RefreshCw
              size={13}
              className={`text-gray-500 group-hover:text-[#27AE60] transition-colors ${refreshing ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-4 space-y-4">
        {/* Summary tiles */}
        {!loading && campaigns.length > 0 && (
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 ">
            {[
              {
                label: "Campaigns",
                value: totalCampaigns,
                icon: Mail,
                color: "text-[#27AE60]",
                bg: "bg-[#27AE60]/10",
              },
              {
                label: "Total Sent",
                value: totalEmails,
                icon: Activity,
                color: "text-blue-600",
                bg: "bg-blue-50",
              },
              {
                label: "Completed",
                value: totalCompleted,
                icon: CheckCircle2,
                color: "text-[#27AE60]",
                bg: "bg-[#27AE60]/10",
              },
              {
                label: "Failed",
                value: totalFailed,
                icon: XCircle,
                color: "text-red-500",
                bg: "bg-red-50",
              },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div
                key={label}
                className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm"
              >
                <div
                  className={`w-7 h-7 rounded-lg ${bg} flex items-center justify-center mb-1.5`}
                >
                  <Icon size={13} className={color} />
                </div>
                <p className="text-lg font-bold text-gray-800 leading-none">
                  {value}
                </p>
                <p className="text-[11px] text-gray-400 mt-1">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 size={28} className="text-[#27AE60] animate-spin" />
            <p className="text-sm text-gray-500">Loading campaigns…</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-2.5">
            <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-700">
                Could not load campaigns
              </p>
              <p className="text-xs text-red-500 mt-0.5 mb-2.5">{error}</p>
              <button
                onClick={() => fetchAll()}
                className="text-xs font-semibold text-red-600 border border-red-300 rounded-lg px-3 py-1.5 hover:bg-red-100 transition-colors"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && campaigns.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#27AE60]/10 flex items-center justify-center">
              <Mail size={22} className="text-[#27AE60]" />
            </div>
            <p className="text-sm font-semibold text-gray-700">
              No campaigns yet
            </p>
            <p className="text-xs text-gray-400 text-center max-w-[220px]">
              Email campaigns will appear here once sent.
            </p>
          </div>
        )}

        {/* Campaign Cards */}
        {!loading && campaigns.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2.5">
              All Campaigns
            </p>
            <div className="space-y-2.5 grid grid-cols-2 gap-2.5 sm:grid-cols-2">
              {campaigns.map((campaign) => (
                <CampaignCard
                  key={campaign.campaignId}
                  campaign={campaign}
                  onClick={(c) => setSelected(c.campaignId)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Automations;
