import { useEffect, useState, useCallback } from "react";
import {
  getCanpaingsAnalyticsByCampaignId,
  getEmailCampaignStatus,
} from "../../../features/user/userService";
import {
  AlertCircle,
  ArrowLeft,
  BarChart3,
  Loader2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Mail,
  Activity,
} from "lucide-react";
import { ProgressBar } from "./ProgressBar";
import { normalizeCampaign, unpackOne } from "../campaignUtils";

export const CampaignDetail = ({ campaignId, onBack }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchDetail = useCallback(async () => {
    try {
      setError(null);

      const [historyRes, liveRes] = await Promise.allSettled([
        getCanpaingsAnalyticsByCampaignId(campaignId),
        getEmailCampaignStatus(campaignId),
      ]);

      const history =
        historyRes.status === "fulfilled"
          ? unpackOne(historyRes.value?.data ?? historyRes.value)
          : null;
      const live =
        liveRes.status === "fulfilled"
          ? unpackOne(liveRes.value?.data?.data ?? liveRes.value?.data)
          : null;

      if (!history && !live) {
        throw (
          (historyRes.status === "rejected" && historyRes.reason) ||
          (liveRes.status === "rejected" && liveRes.reason) ||
          new Error("Campaign not found")
        );
      }

      const base = normalizeCampaign(history || live || {});
      const overlay = live ? normalizeCampaign(live) : null;
      const merged = overlay
        ? normalizeCampaign({
            ...base,
            waiting: Math.max(base.waiting, overlay.waiting),
            active: Math.max(base.active, overlay.active),
            processing: Math.max(base.processing, overlay.processing),
            completed: Math.max(base.completed, overlay.completed),
            failed: Math.max(base.failed, overlay.failed),
            total: Math.max(base.total, overlay.total),
            lastUpdated: overlay.lastUpdated || base.lastUpdated,
          })
        : base;

      setData(merged);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load campaign details",
      );
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    setLoading(true);
    fetchDetail();
  }, [fetchDetail]);

  const shortId = campaignId?.slice(0, 12) + "…";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={14} className="text-gray-600" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-gray-400 font-mono">Campaign</p>
            <p className="text-xs font-bold text-gray-800 font-mono truncate">
              {shortId}
            </p>
          </div>
          <button
            onClick={fetchDetail}
            className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-[#27AE60]/5 hover:border-[#27AE60]/30 transition-colors group"
          >
            <RefreshCw
              size={13}
              className="text-gray-500 group-hover:text-[#27AE60]"
            />
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-4 space-y-4">
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 size={24} className="text-[#27AE60] animate-spin" />
            <p className="text-sm text-gray-500">Loading…</p>
          </div>
        )}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-2.5">
            <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-700">
                Failed to load
              </p>
              <p className="text-xs text-red-500 mt-0.5">{error}</p>
            </div>
          </div>
        )}
        {data && !loading && (
          <>
            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <BarChart3 size={14} className="text-[#27AE60]" />
                  <span className="text-xs font-semibold text-gray-700">
                    Campaign Progress
                  </span>
                </div>
                <span className="text-xl font-bold text-[#27AE60]">
                  {data.progress}
                </span>
              </div>
              <ProgressBar
                progress={data.progress}
                completed={data.completed}
                failed={data.failed}
                total={data.total}
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {[
                {
                  label: "Completed",
                  value: data.completed,
                  sub: "emails sent",
                  icon: CheckCircle2,
                  color: "text-[#27AE60]",
                },
                {
                  label: "Failed",
                  value: data.failed,
                  sub: "delivery errors",
                  icon: XCircle,
                  color: "text-red-500",
                },
                {
                  label: "Waiting",
                  value: data.waiting,
                  sub: "pending / in queue",
                  icon: Clock,
                  color: "text-yellow-500",
                },
                {
                  label: "Processing",
                  value: data.processing ?? 0,
                  sub: "in progress",
                  icon: Loader2,
                  color: "text-blue-500",
                },
                {
                  label: "Active",
                  value: data.active ?? 0,
                  sub: "currently active",
                  icon: Activity,
                  color: "text-purple-500",
                },
                {
                  label: "Total",
                  value: data.total,
                  sub: "recipients",
                  icon: Mail,
                  color: "text-gray-500",
                },
              ].map(({ label, value, sub, icon: Icon, color }) => (
                <div
                  key={label}
                  className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm"
                >
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Icon size={13} className={color} />
                    <span className="text-[11px] text-gray-500 font-medium">
                      {label}
                    </span>
                  </div>
                  <p className={`text-xl font-bold ${color}`}>
                    {Number(value || 0).toLocaleString("en-IN")}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm space-y-2.5">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                Details
              </p>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Campaign ID</span>
                  <span className="text-xs font-mono font-medium text-gray-700 text-right max-w-[55%] truncate">
                    {data.campaignId}
                  </span>
                </div>
                {data.lastUpdated && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Last Updated</span>
                    <span className="text-xs text-gray-700">
                      {new Date(data.lastUpdated).toLocaleString()}
                    </span>
                  </div>
                )}
                {lastUpdated && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Fetched At</span>
                    <span className="text-xs text-gray-700">{lastUpdated}</span>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
