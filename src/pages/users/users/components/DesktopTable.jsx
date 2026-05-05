import { Highlight } from "../utils/highlight";
import { useNavigate } from "react-router-dom";
import { AccountBadge, Avatar, KycBadge, PhoneBadge } from "./ReusableComaponents";
import { Calendar, MapPin, Users as UsersIcon,Phone, Mail } from "lucide-react";

const SkeletonRows = () =>
  Array.from({ length: 5 }).map((_, i) => (
    <tr key={i} className="border-t border-gray-50 animate-pulse">
      {[6, 36, 28, 20, 20, 16, 22, 20].map((w, j) => (
        <td key={j} className="px-5 py-4">
          <div
            className={`h-3.5 bg-gray-100 rounded`}
            style={{ width: `${w * 4}px` }}
          />
        </td>
      ))}
    </tr>
  ));

  const EmptyState = ({ colSpan, hasFilters }) => (
    <tr>
      <td colSpan={colSpan} className="py-20 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center">
            <UsersIcon className="w-7 h-7 text-gray-300" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500">
              No users found
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {hasFilters
                ? "Try adjusting your search or filters"
                : "No users available"}
            </p>
          </div>
        </div>
      </td>
    </tr>
  );

   

export const DesktopTable = ( { filtered, loading, hasFilters, formatLocation, locQuery }) => {

  const navigate = useNavigate();
  const handleRowClick = (u) => {
    const uid = u._id;
    if (uid) {
      navigate(`/dashboard/users/${uid}`);
    }
  };

    return (
      <div className="hidden md:block overflow-x-auto  ">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-green-100 border-b ">
              {[
                "No.",
                "User",
                "Contact",
                "Account",
                "KYC",
                "Phone",
                "Location",
                "Joined",
              ].map((h) => (
                <th
                  key={h}
                  className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#27AE60] whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody >
            {loading ? (
              <SkeletonRows />
            ) : filtered.length === 0 ? (
              <EmptyState colSpan={8} hasFilters={!!hasFilters} />
            ) : (
              filtered.map((u, idx) => {
                const locParts = formatLocation(u);
                return (
                  <tr
                    key={u._id}
                    onClick={() => handleRowClick(u)}
                    className="border-t cursor-pointer  border-green-200 hover:bg-green-50/40 transition-colors duration-150"
                  >
                    {/* No. */}
                    <td className="px-5 py-4">
                      <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-1 rounded-md">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                    </td>

                    {/* User */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {/* <Avatar name={u.name} /> */}
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-800 leading-tight">
                            {u.name
                              ?.split(" ")
                              .map(
                                (n) => n.charAt(0).toUpperCase() + n.slice(1),
                              )
                              .join(" ")}
                          </p>

                          <p className="text-[10px] text-[#27AE60] font-mono leading-tight mt-0.5 truncate max-w-[130px]">
                            {u.userCode || u._id}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-5 py-4">
                      <div className="space-y-1">
                        {u.phone ? (
                          <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <Phone className="w-3 h-3 text-gray-300 flex-shrink-0" />
                            {u.phone}
                          </div>
                        ) : null}
                        {u.email ? (
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 max-w-[160px]">
                            <Mail className="w-3 h-3 text-gray-300 flex-shrink-0" />
                            <span className="truncate">{u.email}</span>
                          </div>
                        ) : null}
                        {!u.phone && !u.email && (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </div>
                    </td>

                    {/* Account Status */}
                    <td className="px-5 py-4">
                      <AccountBadge status={u.accountStatus} />
                    </td>

                    {/* KYC */}
                    {/* <td className="px-5 py-4">
                                <KycBadge kyc={u.kyc} />

                                {u.kyc?.verifiedAt && (
                                  <div className="relative group w-[50px] mt-1 text-[11px] text-[#27AE60]">
                                    
                                    <div className="truncate whitespace-nowrap cursor-pointer">
                                      {Array.isArray(u.kyc.documents) &&
                                        u.kyc.documents.join(", ")}
                                    </div>

                                    
                                    {Array.isArray(u.kyc.documents) && (
                                      <div
                                        className="absolute left-0 top-full mt-1 hidden group-hover:block z-50 
                        bg-white border shadow-lg rounded p-2 w-max min-w-[150px]"
                                      >
                                        <ul className="list-disc list-inside text-[11px] text-black">
                                          {u.kyc.documents.map((doc, index) => (
                                            <li key={index}>{doc}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </td> */}

                    {/* KYC */}
                    <td className="px-5 py-4">
                      <KycBadge kyc={u.kyc} />
                      {/* {u.kyc?.verifiedAt && (
                                  <p className="text-[10px] text-gray-400 mt-1">
                                    {new Date(
                                      u.kyc.verifiedAt,
                                    ).toLocaleDateString("en-GB", {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    })}
                                  </p>
                                )} */}
                    </td>

                    {/* Phone Verified */}
                    <td className="px-5 py-4">
                      <PhoneBadge verified={u.phoneVerified} />
                    </td>

                    {/* Location — with highlight */}
                    <td className="px-5 py-4">
                      {locParts ? (
                        <div className="flex items-start gap-1.5">
                          <MapPin className="w-3 h-3 text-[#27AE60] mt-0.5 flex-shrink-0" />
                          <div className="text-xs text-gray-700 space-y-0.5">
                            {u.locality && (
                              <div className="capitalize font-medium">
                                <Highlight text={u.locality} query={locQuery} />
                              </div>
                            )}
                            <div className="capitalize text-gray-500">
                              {[u.city, u.state]
                                .filter(Boolean)
                                .map((part, i, arr) => (
                                  <span key={i}>
                                    <Highlight text={part} query={locQuery} />
                                    {i < arr.length - 1 && ", "}
                                  </span>
                                ))}
                            </div>
                            {u.pincode && (
                              <div className="text-gray-400 font-mono text-[11px]">
                                <Highlight text={u.pincode} query={locQuery} />
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
                          <MapPin className="w-3 h-3" /> Not set
                        </span>
                      )}
                    </td>

                    {/* Joined */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 whitespace-nowrap">
                        <Calendar className="w-3.5 h-3.5 text-gray-300" />
                        {new Date(u.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    );
};