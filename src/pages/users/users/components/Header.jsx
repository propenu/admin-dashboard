import { UsersIcon } from "lucide-react"


export const Header = ({ IsLoading, users, filtered, onRefresh }) => {
  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#27AE60] flex items-center justify-center shadow-lg shadow-[#27AE60]/25 flex-shrink-0">
            <UsersIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-[#27AE60] tracking-tight">
              User Management
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Monitor and manage your platform users
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 bg-white border border-gray-100 shadow-sm px-3 py-1.5 rounded-full font-medium">
            {IsLoading
              ? "Loading…"
              : `${filtered.length} of ${users.length} users`}
          </span>
          <button
            onClick={onRefresh}
            className="text-xs text-[#27AE60] bg-[#27AE60]/10 hover:bg-[#27AE60]/20 px-3 py-1.5 rounded-full font-semibold transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
};