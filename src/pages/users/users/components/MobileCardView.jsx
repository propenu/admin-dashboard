
import { Phone, Mail, Calendar, MapPin, Users as UsersIcon } from "lucide-react";
import { AccountBadge, Avatar, KycBadge, MobileChip, PhoneBadge } from "./ReusableComaponents";
import { Highlight } from "../utils/highlight";



export const MobileCardView = ({ filtered, loading, formatLocation, locQuery }) => {
  return (
    <div className="md:hidden divide-y divide-gray-50">
      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16">
          <div className="w-8 h-8 rounded-full border-4 border-[#27AE60]/20 border-t-[#27AE60] animate-spin" />
          <p className="text-sm text-gray-400 font-medium">Loading users…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-16 text-gray-400">
          <UsersIcon className="w-10 h-10 text-gray-200" />
          <p className="text-sm font-medium">No users found</p>
          <p className="text-xs text-gray-300">Try adjusting your filters</p>
        </div>
      ) : (
        filtered.map((u) => {
          const locParts = formatLocation(u);
          return (
            <div
              key={u._id}
              className="p-4 hover:bg-green-50/30 transition-colors"
            >
              {/* Top row */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <Avatar name={u.name} />
                  <div className="min-w-0">
                    <p className="font-bold text-gray-800 text-sm">
                      {u.name
                        ?.split(" ")
                        .map((n) => n.charAt(0).toUpperCase() + n.slice(1))
                        .join(" ")}
                    </p>
                    <p className="text-[10px] font-mono text-gray-400 mt-0.5 truncate max-w-[160px]">
                      {u._id}
                    </p>
                  </div>
                </div>
                <AccountBadge status={u.accountStatus} />
              </div>

              {/* Info chips */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                {u.phone && (
                  <MobileChip
                    icon={<Phone className="w-3.5 h-3.5 text-[#27AE60]" />}
                    label={u.phone}
                  />
                )}
                {u.email && (
                  <MobileChip
                    icon={<Mail className="w-3.5 h-3.5 text-[#27AE60]" />}
                    label={u.email}
                  />
                )}
                <MobileChip
                  icon={<Calendar className="w-3.5 h-3.5 text-[#27AE60]" />}
                  label={new Date(u.createdAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                />
              </div>

              {/* Location chip */}
              {locParts ? (
                <div className="flex items-start gap-2 bg-green-50/60 rounded-xl px-3 py-2 mb-2">
                  <MapPin className="w-3.5 h-3.5 text-[#27AE60] mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-gray-700 min-w-0">
                    {u.locality && (
                      <span className="font-medium capitalize block">
                        <Highlight text={u.locality} query={locQuery} />
                      </span>
                    )}
                    <span className="text-gray-500 capitalize">
                      {[u.city, u.state, u.pincode]
                        .filter(Boolean)
                        .map((p, i, arr) => (
                          <span key={i}>
                            <Highlight text={p} query={locQuery} />
                            {i < arr.length - 1 && " • "}
                          </span>
                        ))}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-xl mb-2">
                  <MapPin className="w-3.5 h-3.5" /> Location not set
                </div>
              )}

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                <KycBadge kyc={u.kyc} />
                <PhoneBadge verified={u.phoneVerified} />
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};