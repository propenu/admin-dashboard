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
import { StatCard } from "./StatCard.jsx";

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
    <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white hover:shadow-sm transition-all">
      {/* Row header */}
      <div
        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={handleExpand}
      >
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

        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-800 truncate font-mono mb-1.5">
            {campaign.campaignId}
          </p>
          <ProgressBar
            success={campaign.success}
            failed={campaign.failed}
            total={campaign.total}
          />
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="hidden sm:flex gap-3 text-[10px] font-bold">
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
          <span className="font-mono text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-lg">
            {campaign.progress}
          </span>
          {campaign.failed > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRetry(campaign.campaignId);
              }}
              disabled={retrying === campaign.campaignId}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-red-50 text-red-600 border border-red-200 text-[10px] font-bold rounded-xl hover:bg-red-600 hover:text-white hover:border-red-600 transition-all disabled:opacity-50"
            >
              {retrying === campaign.campaignId ? (
                <Loader2 size={11} className="animate-spin" />
              ) : (
                <RotateCcw size={11} />
              )}
              Retry Failed
            </button>
          )}
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-gray-100 p-4 bg-gray-50/60">
          <div className="grid grid-cols-4 gap-3 mb-3">
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
      {/* Email delivery stats */}
      {emailStats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: "Total Emails",
              value: emailStats.total ?? 0,
              icon: BarChart2,
              bg: "bg-blue-50 text-blue-600",
            },
            {
              label: "Sent",
              value: emailStats.success ?? 0,
              icon: CheckCircle2,
              bg: "bg-green-50 text-green-600",
            },
            {
              label: "Failed",
              value: emailStats.failed ?? 0,
              icon: AlertCircle,
              bg: "bg-red-50 text-red-500",
            },
            {
              label: "Pending",
              value: emailStats.pending ?? 0,
              icon: Clock,
              bg: "bg-amber-50 text-amber-600",
            },
          ].map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>
      )}

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

// import { useState } from "react";
// import {
//   BarChart2,
//   ChevronDown,
//   CheckCircle2,
//   AlertCircle,
//   Clock,
//   RotateCcw,
//   Loader2,
//   ExternalLink
// } from "lucide-react";
// import { getCanpaingsAnalyticsByCampaignId } from "../../../features/user/userService";
// import { ProgressBar } from "./Progressbar.jsx";
// import { StatCard } from "./StatCard.jsx";

// // ─── Modern Grid Card ──────────────────────────────────────
// const CampaignCard = ({ campaign, onRetry, retrying }) => {
//   const [expanded, setExpanded] = useState(false);
//   const [detail, setDetail] = useState(null);
//   const [loadingDetail, setLoading] = useState(false);

//   const handleExpand = async () => {
//     if (!expanded && !detail) {
//       try {
//         setLoading(true);
//         const res = await getCanpaingsAnalyticsByCampaignId(campaign.campaignId);
//         setDetail(res?.data?.data || res?.data || campaign);
//       } catch {
//         setDetail(campaign);
//       } finally {
//         setLoading(false);
//       }
//     }
//     setExpanded((p) => !p);
//   };

//   const d = detail || campaign;
//   const pct = d.total ? Math.round((d.success / d.total) * 100) : 0;

//   return (
//     <div
//       className={`group relative bg-white border border-gray-100 rounded-3xl transition-all duration-500 ${
//         expanded ? "shadow-2xl ring-1 ring-green-500/20 z-10" : "hover:shadow-xl hover:-translate-y-1"
//       }`}
//     >
//       {/* Top Decoration Line */}
//       <div className={`absolute top-0 left-10 right-10 h-1 rounded-b-full transition-colors ${pct === 100 ? 'bg-green-500' : 'bg-amber-400'}`} />

//       <div className="p-5">
//         <div className="flex justify-between items-start mb-4">
//           <div className="flex items-center gap-3">
//             <div className="relative">
//               {/* Pulsing effect for active campaigns */}
//               {campaign.pending > 0 && (
//                 <span className="absolute inset-0 rounded-full bg-amber-400 animate-ping opacity-20"></span>
//               )}
//               <div className="w-10 h-10 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-green-600 transition-colors">
//                 <BarChart2 size={20} />
//               </div>
//             </div>
//             <div>
//               <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Campaign ID</h3>
//               <p className="text-sm font-bold text-gray-800 font-mono">{campaign.campaignId}</p>
//             </div>
//           </div>

//           <button
//             onClick={handleExpand}
//             className="p-2 hover:bg-gray-50 rounded-xl transition-colors text-gray-400"
//           >
//             {loadingDetail ? <Loader2 size={18} className="animate-spin" /> : <ExternalLink size={18} />}
//           </button>
//         </div>

//         {/* Success Score Ring (Text version) */}
//         <div className="flex items-baseline gap-2 mb-4">
//           <span className="text-3xl font-black text-gray-900">{pct}%</span>
//           <span className="text-[10px] font-bold text-green-600 uppercase">Success Rate</span>
//         </div>

//         <ProgressBar
//           success={campaign.success}
//           failed={campaign.failed}
//           total={campaign.total}
//         />

//         <div className="grid grid-cols-3 gap-2 mt-4">
//           <div className="bg-green-50/50 rounded-2xl p-2 text-center border border-green-100/50">
//             <p className="text-xs font-black text-green-700">{campaign.success}</p>
//             <p className="text-[8px] font-bold text-green-600/60 uppercase">Sent</p>
//           </div>
//           <div className="bg-red-50/50 rounded-2xl p-2 text-center border border-red-100/50">
//             <p className="text-xs font-black text-red-700">{campaign.failed}</p>
//             <p className="text-[8px] font-bold text-red-600/60 uppercase">Fail</p>
//           </div>
//           <div className="bg-gray-50 rounded-2xl p-2 text-center border border-gray-100">
//             <p className="text-xs font-black text-gray-700">{campaign.total}</p>
//             <p className="text-[8px] font-bold text-gray-500 uppercase">Total</p>
//           </div>
//         </div>

//         {/* Expandable Action Area */}
//         {expanded && (
//           <div className="mt-4 pt-4 border-t border-dashed border-gray-100 animate-in fade-in slide-in-from-top-2 duration-300">
//              <div className="flex items-center justify-between mb-4">
//                 <span className="text-[10px] font-bold text-gray-400">Current Progress: {campaign.progress}</span>
//                 {campaign.failed > 0 && (
//                   <button
//                     onClick={() => onRetry(campaign.campaignId)}
//                     disabled={retrying === campaign.campaignId}
//                     className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-[10px] font-black uppercase rounded-xl shadow-lg shadow-red-200 hover:bg-red-700 transition-all disabled:opacity-50"
//                   >
//                     {retrying === campaign.campaignId ? <Loader2 size={12} className="animate-spin" /> : <RotateCcw size={12} />}
//                     Retry Failures
//                   </button>
//                 )}
//              </div>
//              <div className="p-3 bg-gray-50 rounded-2xl text-[11px] text-gray-500 italic">
//                Analytics for this campaign are synced in real-time. Failed emails can be retried once per hour.
//              </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// // ─── Main Tab Component ───────────────────────────────────
// export const CampaignTab = ({ campaigns, emailStats, loading, onRetry, retrying }) => {
//   if (loading) {
//     return (
//       <div className="flex items-center justify-center py-20">
//         <div className="relative w-16 h-16">
//           <div className="absolute inset-0 border-4 border-green-100 rounded-full"></div>
//           <div className="absolute inset-0 border-4 border-green-600 rounded-full border-t-transparent animate-spin"></div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-8 p-1">
//       {/* Dynamic Stats Section */}
//       {emailStats && (
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
//           {[
//             { label: "Total Volume", value: emailStats.total ?? 0, icon: BarChart2, bg: "bg-blue-600 text-white shadow-blue-100" },
//             { label: "Delivered", value: emailStats.success ?? 0, icon: CheckCircle2, bg: "bg-white text-green-600 border border-gray-100 shadow-sm" },
//             { label: "Bounced", value: emailStats.failed ?? 0, icon: AlertCircle, bg: "bg-white text-red-500 border border-gray-100 shadow-sm" },
//             { label: "In Queue", value: emailStats.pending ?? 0, icon: Clock, bg: "bg-white text-amber-600 border border-gray-100 shadow-sm" },
//           ].map((s, idx) => (
//             <div key={s.label} className={`${s.bg} p-6 rounded-[2rem] relative overflow-hidden group`}>
//                <div className="relative z-10">
//                  <s.icon size={20} className="mb-3 opacity-80" />
//                  <p className="text-2xl font-black mb-1">{s.value.toLocaleString()}</p>
//                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">{s.label}</p>
//                </div>
//                {/* Decorative Circle */}
//                <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-current opacity-[0.03] rounded-full group-hover:scale-150 transition-transform duration-700" />
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Campaigns Grid */}
//       <div className="space-y-4">
//         <div className="flex items-end justify-between px-2">
//           <div>
//             <h2 className="text-xl font-black text-gray-800">Campaign Monitor</h2>
//             <p className="text-xs font-bold text-gray-400">Manage and track your delivery performance</p>
//           </div>
//         </div>

//         {campaigns.length === 0 ? (
//           <div className="bg-gray-50 rounded-[3rem] py-24 text-center border-2 border-dashed border-gray-200">
//             <BarChart2 size={48} className="mx-auto text-gray-200 mb-4" />
//             <p className="text-gray-400 font-bold">No campaigns available to display.</p>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
//             {campaigns.map((c) => (
//               <CampaignCard
//                 key={c.campaignId}
//                 campaign={c}
//                 onRetry={onRetry}
//                 retrying={retrying}
//               />
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };
