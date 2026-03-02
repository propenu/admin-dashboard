// src/pages/Agents/components/AgentCard.jsx
import { useMemo } from "react";
import {
  MapPin,
  Briefcase,
  CheckCircle2,
  XCircle,
  Building2,
  Edit2,
  Trash2,
  View,
} from "lucide-react";

export default function AgentCard({ agent, onEdit, onDelete, onView }) {
  const {
    avatar,
    coverImage,
    name,
    agencyName,
    licenseNumber,
    city,
    experienceYears,
    rera,
    stats,
    verificationStatus,
  } = agent;

  const isVerified = useMemo(
    () => rera?.isVerified || verificationStatus === "approved",
    [rera?.isVerified, verificationStatus],
  );

  const displayName = name || "Unknown Agent";
  const displayAgency = agencyName || "Independent Agent";

  return (
    <article className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-md transition-all group relative">
      {/* ACTION BUTTONS - Smaller & Subtle */}
      <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(agent)}
          className="p-1.5  text-white rounded-md bg-[#27AE60] hover:text-white shadow-sm border border-slate-200 transition-all"
          title="Edit"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onDelete(agent._id)}
          className="p-1.5 bg-white/90 text-red-600 rounded-md hover:bg-red-600 hover:text-white shadow-sm border border-slate-200 transition-all"
          title="Delete"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onView(agent)}
          className="p-1.5  text-white rounded-md bg-[#27AE60] hover:text-white shadow-sm border border-slate-200 transition-all"
          title="View Details"
        >
          <View className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* COMPACT COVER IMAGE */}
      <div className="relative h-20 w-full overflow-hidden bg-slate-100">
        {coverImage?.url ? (
          <img
            src={coverImage.url}
            alt={coverImage.url}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-r from-slate-200 to-slate-300" />
        )}

        {/* SMALL VERIFIED BADGE */}
        <div className="absolute bottom-2 right-2">
          {isVerified ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-white" />
          ) : (
            <XCircle className="w-5 h-5 text-amber-500 fill-white" />
          )}
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="px-4 pb-3">
        {/* SMALLER AVATAR */}
        <div className="w-14 h-14 rounded-lg border-2 border-white shadow-md overflow-hidden bg-slate-50 -mt-7 relative z-10 mb-2">
          {avatar?.url ? (
            <img
              src={avatar.url}
              alt={displayName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#27AE60] font-bold text-lg">
              {displayName[0]}
            </div>
          )}
        </div>

        {/* MAIN INFO */}
        <div className="space-y-0.5">
          <h2 className="text-base font-bold text-[#27AE60] truncate">
            {displayName}
          </h2>
          <div className="flex items-center gap-1.5 text-xs text-[#6B7280]">
            <Building2 className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{displayAgency}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#6B7280]">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span>{city || "Location N/A"}</span>
          </div>
        </div>

        {/* STATS BADGES - Inline */}
        <div className="flex items-center gap-2 mt-3">
          {experienceYears > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-green-50 text-[10px] font-bold text-[#27AE60] border border-[#27AE60]">
              <Briefcase className="w-3 h-3" />
              {experienceYears}Y EXP
            </span>
          )}
          {rera?.reraAgentId && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-bold text-[#27AE60] border border-[#27AE60]">
              RERA: {rera.reraAgentId}
            </span>
          )}
        </div>
      </div>

      {/* MINIMAL FOOTER */}
      <div className="mt-auto border-t border-slate-100 px-4 py-2 flex items-center justify-between bg-slate-50/50">
        <div>
          <p className="text-[10px] text-[#27AE60] uppercase font-semibold">
            License
          </p>
          <p className="text-xs font-bold text-slate-700">
            {licenseNumber || "N/A"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-[#27AE60] uppercase font-semibold">
            Properties
          </p>
          <p className="text-xs font-bold text-slate-700">
            {stats?.totalProperties ?? 0}
          </p>
        </div>
      </div>
    </article>
  );
}
