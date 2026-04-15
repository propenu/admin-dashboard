// src/pages/EmailNotifications/EmailNotificationComponents/CampaignTab.jsx
import { useState } from "react";
import {
  BarChart2,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { getCanpaingsAnalyticsByCampaignId } from "../../../features/user/userService";
import { ProgressBar } from "./Progressbar.jsx";

// ─── Single Campaign Row ──────────────────────────────────
const CampaignRow = ({ campaign, onRetry, retrying }) => {
  const [expanded, setExpanded] = useState(false);
  const [detail, setDetail] = useState(null);
  const [loadingDetail, setLoading] = useState(false);

  const handleExpand = async () => {
    if (!expanded && !detail) {
      try {
        setLoading(true);
        const res = await getCanpaingsAnalyticsByCampaignId(
          campaign.campaignId,
        );
        setDetail(res?.data?.data || res?.data || campaign);
      } catch {
        setDetail(campaign);
      } finally {
        setLoading(false);
      }
    }
    setExpanded((p) => !p);
  };

  const d = detail || campaign;
  const pct = d.total ? Math.round((d.success / d.total) * 100) : 0;

  return (
    <div className="border  border-[#27AE60] rounded-2xl overflow-hidden bg-white hover:shadow-sm transition-all">
      {/* ── Row Header ── */}
      <div
        className="flex items-center gap-3 p-3 sm:p-4 max-sm:p-2 max-sm:gap-1 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={handleExpand}
      >
        {/* Expand toggle */}
        <div
          className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
            expanded ? "bg-green-600 text-white" : "bg-gray-100 text-gray-500"
          }`}
        >
          {loadingDetail ? (
            <Loader2 size={14} className="animate-spin" />
          ) : expanded ? (
            <ChevronDown size={14} />
          ) : (
            <ChevronRight size={14} />
          )}
        </div>

        {/* Campaign ID + progress bar */}
        <div className="flex-1 min-w-0 max-sm:max-w-[200px]">
          <p className="text-xs sm:text-sm  font-bold text-gray-800 truncate font-mono max-sm:w-[100px] mb-1.5">
            {campaign.campaignId}
          </p>
          <ProgressBar
            success={campaign.success}
            failed={campaign.failed}
            total={campaign.total}
          />
        </div>

        {/* Right-side meta */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Counts — hidden on xs */}
          <div className="hidden sm:flex gap-2 text-[10px] font-bold">
            <span className="text-green-700 flex items-center gap-1">
              <CheckCircle2 size={10} />
              {campaign.success}
            </span>
            <span className="text-red-600 flex items-center gap-1">
              <AlertCircle size={10} />
              {campaign.failed}
            </span>
            <span className="text-amber-600 flex items-center gap-1">
              <Clock size={10} />
              {campaign.pending}
            </span>
          </div>

          {/* Progress % tag */}
          <span className="font-mono text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-lg whitespace-nowrap">
            {campaign.progress}
          </span>

          {/* Retry button */}
          {campaign.failed > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRetry(campaign.campaignId);
              }}
              disabled={retrying === campaign.campaignId}
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 bg-red-50 text-red-600 border border-red-200 text-[10px] font-bold rounded-xl hover:bg-red-600 hover:text-white hover:border-red-600 transition-all disabled:opacity-50 whitespace-nowrap"
            >
              {retrying === campaign.campaignId ? (
                <Loader2 size={11} className="animate-spin" />
              ) : (
                <RotateCcw size={11} />
              )}
              <span className="hidden xs:inline sm:inline">Retry Failed</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Expanded Detail ── */}
      {expanded && (
        <div className="border-t border-gray-100 p-3 sm:p-4 max-sm:p-5  bg-green-100">
          {/* Stats grid: 4 cols on sm+, 2 cols on mobile */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-3">
            {[
              {
                label: "Total",
                value: d.total,
                color: "text-gray-700",
                bg: "bg-white",
              },
              {
                label: "Sent",
                value: d.success,
                color: "text-green-700",
                bg: "bg-green-50",
              },
              {
                label: "Failed",
                value: d.failed,
                color: "text-red-600",
                bg: "bg-red-50",
              },
              {
                label: "Pending",
                value: d.pending,
                color: "text-amber-600",
                bg: "bg-amber-50",
              },
            ].map((s) => (
              <div
                key={s.label}
                className={`${s.bg} rounded-xl p-3 text-center border border-gray-200`}
              >
                <p className={`text-xl font-extrabold ${s.color}`}>{s.value}</p>
                <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mt-0.5">
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          {/* Delivery progress bar */}
          <div>
            <div className="flex justify-between text-[10px] font-bold text-gray-500 mb-1">
              <span>Delivery Progress</span>
              <span className="text-green-600">{pct}%</span>
            </div>
            <ProgressBar
              success={d.success}
              failed={d.failed}
              total={d.total}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Campaign Tab ─────────────────────────────────────────
export const CampaignTab = ({
  campaigns,
  emailStats,
  loading,
  onRetry,
  retrying,
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-green-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {campaigns.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center">
            <BarChart2 size={36} className="text-gray-300" />
          </div>
          <p className="text-sm font-semibold text-gray-400">
            No campaigns found
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {campaigns.map((c) => (
            <CampaignRow
              key={c.campaignId}
              campaign={c}
              onRetry={onRetry}
              retrying={retrying}
            />
          ))}
        </div>
      )}
    </div>
  );
};
