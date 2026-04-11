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
  <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
    <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
      <Mail size={14} className="text-gray-400" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-gray-800 truncate">{log.to}</p>
      <p className="text-xs text-gray-400 truncate">{log.subject}</p>
    </div>
    <div className="flex items-center gap-2 flex-shrink-0">
      <span className="font-mono text-[10px] text-gray-400 hidden md:block truncate max-w-[150px]">
        {log.campaignId}
      </span>
      <StatusBadge status={log.status} />
      <span className="text-[10px] text-gray-400 hidden lg:block whitespace-nowrap">
        {fmt(log.createdAt)}
      </span>
    </div>
  </div>
);

export const LogsTab = ({ logs, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
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
        <p className="text-sm font-semibold text-gray-400">
          No email logs found
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      {/* Table header */}
      <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 px-4 py-3 border-b border-gray-200 bg-gray-50">
        <span className="text-[10px] font-bold uppercase tracking-wide text-gray-500">
          Recipient / Subject
        </span>
        <span className="text-[10px] font-bold uppercase tracking-wide text-gray-500 hidden md:block">
          Campaign ID
        </span>
        <span className="text-[10px] font-bold uppercase tracking-wide text-gray-500">
          Status
        </span>
        <span className="text-[10px] font-bold uppercase tracking-wide text-gray-500 hidden lg:block">
          Time
        </span>
      </div>
      <div className="divide-y divide-gray-100">
        {logs.map((log) => (
          <LogRow key={log._id} log={log} />
        ))}
      </div>
    </div>
  );
};
