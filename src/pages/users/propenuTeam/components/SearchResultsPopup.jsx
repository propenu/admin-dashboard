import { X, Search, UserX } from "lucide-react";
import { useEffect, useRef } from "react";
import {
  Avatar,
  AccountBadge,
  KycBadge,
  PhoneBadge,
} from "./ReusableComponents";
import { Highlight } from "../utils/highlight";


export const SearchResultsPopup = ({ users, query, totalCount, onClose }) => {
  const popupRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Trap focus inside popup (accessibility)
  useEffect(() => {
    popupRef.current?.focus();
  }, []);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center
                 bg-black/30 backdrop-blur-[2px] transition-all duration-200"
      onMouseDown={handleBackdropClick}
      aria-modal="true"
      role="dialog"
      aria-label="Search results"
    >
      {/* Popup sheet */}
      <div
        ref={popupRef}
        tabIndex={-1}
        className="bg-white w-full sm:max-w-lg sm:mx-4
                   rounded-t-2xl sm:rounded-2xl
                   max-h-[75vh] sm:max-h-[70vh]
                   flex flex-col
                   shadow-2xl shadow-black/20
                   outline-none
                   animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200"
      >
        {/* Drag handle (mobile only) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-bold text-gray-800">
              {users.length} result{users.length !== 1 ? "s" : ""}
            </span>
            {totalCount && (
              <span className="text-xs text-gray-400">
                of {totalCount} users
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400
                       hover:text-gray-600 transition-colors duration-150"
            aria-label="Close results"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results body */}
        <div className="overflow-y-auto flex-1 overscroll-contain">
          {users.length === 0 ? (
            // Empty state
            <div className="flex flex-col items-center justify-center py-14 px-6 gap-3 text-center">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center">
                <UserX className="w-6 h-6 text-gray-300" />
              </div>
              <p className="text-sm font-semibold text-gray-500">
                No users found
              </p>
              <p className="text-xs text-gray-400 max-w-xs">
                Try adjusting your search or clearing some filters to see more
                results.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {users.map((user) => (
                <li key={user.id || user.phone}>
                  <ResultRow user={user} query={query} />
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer hint */}
        {users.length > 0 && (
          <div className="border-t border-gray-50 px-4 py-2.5 flex-shrink-0">
            <p className="text-[11px] text-gray-400 text-center">
              Tap a user to view their profile
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Individual result row ───────────────────────────────────────────────────
const ResultRow = ({ user, query }) => {
  return (
    <button
      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#27AE60]/5
                 active:bg-[#27AE60]/10 transition-colors duration-100 text-left"
      onClick={() => {
        // Navigate to user detail — replace with your router logic
        // e.g. navigate(`/users/${user.id}`)
        console.log("Navigate to user:", user.id);
      }}
    >
      {/* Avatar */}
      <Avatar name={user.name} />

      {/* Main info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">
          <Highlight text={user.name} query={query} />
        </p>
        <p className="text-xs text-gray-400 truncate mt-0.5">
          <Highlight text={user.phone} query={query} />
          {" · "}
          <Highlight text={user.email} query={query} />
        </p>
        {/* Location line */}
        {(user.city || user.state) && (
          <p className="text-[11px] text-gray-300 truncate mt-0.5">
            {[user.locality, user.city, user.state, user.pincode]
              .filter(Boolean)
              .join(", ")}
          </p>
        )}
      </div>

      {/* Badges (stacked, right side) */}
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <AccountBadge status={user.account_status} />
        <PhoneBadge verified={user.phone_verified} />
      </div>
    </button>
  );
};
