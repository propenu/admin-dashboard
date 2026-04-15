// src/pages/EmailNotifications/EmailNotificationComponents/LogsTab.jsx
import { Mail, Loader2 } from "lucide-react";
import { StatusBadge } from "./StatusBadge.jsx";

const fmt = (d) =>
  d
    ? new Date(d).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const LogRow = ({ log }) => (
  <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
    {/* Icon */}
    <td className="px-3 py-3 w-10">
      <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
        <Mail size={14} className="text-gray-400" />
      </div>
    </td>

    {/* Recipient + Subject */}
    <td className="px-3 py-3 min-w-0 max-w-[180px]">
      <p className="text-sm font-semibold text-gray-800 truncate">{log.to}</p>
      <p className="text-xs text-gray-400 truncate">{log.subject}</p>
    </td>

    {/* Campaign ID — hidden on small screens */}
    <td className="px-3 py-3 hidden md:table-cell max-w-[160px]">
      <span className="font-mono text-[10px] text-gray-400 truncate block">
        {log.campaignId}
      </span>
    </td>

    {/* Status */}
    <td className="px-3 py-3 whitespace-nowrap">
      <StatusBadge status={log.status} />
    </td>

    {/* Time — hidden on small screens */}
    <td className="px-3 py-3 hidden lg:table-cell whitespace-nowrap">
      <span className="text-[10px] text-gray-400">{fmt(log.createdAt)}</span>
    </td>
  </tr>
);

export const LogsTab = ({ logs, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 ">
        <Loader2 size={32} className="animate-spin text-green-500" />
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center">
          <Mail size={36} className="text-gray-300" />
        </div>
        <p className="text-sm font-semibold text-gray-400">No email logs found</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      {/* Horizontally scrollable on mobile */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[320px] border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {/* blank icon column */}
              <th className="px-3 py-3 w-10" />

              <th className="px-3 py-3 text-left">
                <span className="text-[10px] font-bold uppercase tracking-wide text-gray-500">
                  Recipient / Subject
                </span>
              </th>

              <th className="px-3 py-3 text-left hidden md:table-cell">
                <span className="text-[10px] font-bold uppercase tracking-wide text-gray-500">
                  Campaign ID
                </span>
              </th>

              <th className="px-3 py-3 text-left">
                <span className="text-[10px] font-bold uppercase tracking-wide text-gray-500">
                  Status
                </span>
              </th>

              <th className="px-3 py-3 text-left hidden lg:table-cell">
                <span className="text-[10px] font-bold uppercase tracking-wide text-gray-500">
                  Time
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <LogRow key={log._id} log={log} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};