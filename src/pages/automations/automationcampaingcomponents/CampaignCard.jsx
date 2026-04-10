import { CheckCircle2, ChevronRight, Clock, Mail, TrendingUp, XCircle } from "lucide-react";
import { ProgressBar } from "./ProgressBar";

export const CampaignCard = ({ campaign, onClick }) => {
  const { campaignId, total, completed, failed, waiting, progress } = campaign;
  const shortId = campaignId?.slice(0, 8) + "…";

  return (
    <button
      onClick={() => onClick(campaign)}
      className="w-full text-left bg-white border border-gray-100 rounded-xl p-3.5 shadow-sm hover:shadow-md hover:border-[#27AE60]/30 transition-all duration-200 group"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#27AE60]/10 flex items-center justify-center shrink-0">
            <Mail size={13} className="text-[#27AE60]" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-mono leading-none mb-0.5">
              Campaign ID
            </p>
            <p className="text-xs font-semibold text-gray-700 font-mono">
              {shortId}
            </p>
          </div>
        </div>
        <div
          className="flex items-center gap-1 text-[#27AE60] rounded-full px-2 py-0.5 text-[10px] font-semibold shrink-0"
          style={{ backgroundColor: "rgba(39,174,96,0.07)" }}
        >
          <TrendingUp size={10} />
          {progress}
        </div>
      </div>

      {/* Stat badges */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div
          className="flex flex-col items-center rounded-lg py-2 px-1 gap-0.5 border border-[#27AE60]/15"
          style={{ backgroundColor: "rgba(39,174,96,0.07)" }}
        >
          <CheckCircle2 size={13} className="text-[#27AE60]" />
          <span className="text-sm font-bold text-[#27AE60] leading-none">
            {completed}
          </span>
          <span
            className="text-[10px] font-medium"
            style={{ color: "rgba(39,174,96,0.75)" }}
          >
            Done
          </span>
        </div>
        <div className="flex flex-col items-center bg-red-50 border border-red-100 rounded-lg py-2 px-1 gap-0.5">
          <XCircle size={13} className="text-red-500" />
          <span className="text-sm font-bold text-red-500 leading-none">
            {failed}
          </span>
          <span className="text-[10px] text-red-400 font-medium">Failed</span>
        </div>
        <div className="flex flex-col items-center bg-yellow-50 border border-yellow-100 rounded-lg py-2 px-1 gap-0.5">
          <Clock size={13} className="text-yellow-500" />
          <span className="text-sm font-bold text-yellow-500 leading-none">
            {waiting}
          </span>
          <span className="text-[10px] text-yellow-500/75 font-medium">
            Waiting
          </span>
        </div>
      </div>

      {/* Progress */}
      <ProgressBar
        progress={progress}
        completed={completed}
        failed={failed}
        total={total}
      />

      {/* Footer */}
      <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-gray-50">
        <span className="text-[11px] text-gray-400">
          {total} total email{total !== 1 ? "s" : ""}
        </span>
        <span className="text-[11px] text-[#27AE60] font-medium flex items-center gap-0.5 group-hover:gap-1.5 transition-all">
          View detail <ChevronRight size={12} />
        </span>
      </div>
    </button>
  );
};