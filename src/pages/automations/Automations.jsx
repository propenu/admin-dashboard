// src/pages/automations/Automations.jsx

import { useState, useEffect, useCallback } from "react";
import {
  Mail,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Loader2,
  Activity,
  Zap,
  AlertCircle,
} from "lucide-react";
import {
  getCanpaingsAnalytics,
  getEmailCampaignStatus,
} from "../../features/user/userService";
import { CampaignDetail } from "./automationcampaingcomponents/CampaignDetail";
import { CampaignTable } from "./automationcampaingcomponents/CampaignTable";
import { normalizeCampaign, unpackList } from "./campaignUtils";

const Automations = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");

  const fetchAll = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const [historyRes, liveRes] = await Promise.allSettled([
        getCanpaingsAnalytics(),
        getEmailCampaignStatus(),
      ]);

      if (historyRes.status === "rejected" && liveRes.status === "rejected") {
        throw (
          historyRes.reason ||
          liveRes.reason ||
          new Error("Failed to load campaigns")
        );
      }

      const historyRaw =
        historyRes.status === "fulfilled"
          ? unpackList(historyRes.value?.data ?? historyRes.value)
          : [];
      const liveRaw =
        liveRes.status === "fulfilled"
          ? unpackList(liveRes.value?.data?.data ?? liveRes.value?.data)
          : [];

      const liveById = new Map(
        liveRaw
          .map(normalizeCampaign)
          .filter((c) => c.campaignId)
          .map((c) => [c.campaignId, c]),
      );

      const history = historyRaw
        .map(normalizeCampaign)
        .filter((c) => c.campaignId);

      const merged = history.map((row) => {
        const live = liveById.get(row.campaignId);
        if (!live) return row;
        return normalizeCampaign({
          ...row,
          waiting: Math.max(row.waiting, live.waiting),
          active: Math.max(row.active, live.active),
          processing: Math.max(row.processing, live.processing),
          completed: Math.max(row.completed, live.completed),
          failed: Math.max(row.failed, live.failed),
          total: Math.max(row.total, live.total),
        });
      });

      liveById.forEach((live, id) => {
        if (!merged.some((c) => c.campaignId === id)) merged.unshift(live);
      });

      setCampaigns(merged);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load campaigns",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    setPage(1);
  }, [search, pageSize, campaigns.length]);

  if (selected) {
    return (
      <CampaignDetail campaignId={selected} onBack={() => setSelected(null)} />
    );
  }

  const totalCampaigns = campaigns.length;
  const totalEmails = campaigns.reduce((s, c) => s + (c.total || 0), 0);
  const totalCompleted = campaigns.reduce((s, c) => s + (c.completed || 0), 0);
  const totalFailed = campaigns.reduce((s, c) => s + (c.failed || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-10 border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-1 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#27AE60]">
              <Zap size={14} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold leading-tight text-gray-800">
                Automations
              </h1>
              <p className="text-[10px] leading-none text-gray-400">
                Email campaigns
              </p>
            </div>
          </div>
          <button
            onClick={() => fetchAll(true)}
            disabled={refreshing}
            className="group flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 transition-colors hover:border-[#27AE60]/30 hover:bg-[#27AE60]/5 disabled:opacity-50"
          >
            <RefreshCw
              size={13}
              className={`text-gray-500 transition-colors group-hover:text-[#27AE60] ${
                refreshing ? "animate-spin" : ""
              }`}
            />
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-4 px-4 py-4">
        {!loading && campaigns.length > 0 && (
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {[
              {
                label: "Campaigns",
                value: totalCampaigns,
                icon: Mail,
                color: "text-[#27AE60]",
                bg: "bg-[#27AE60]/10",
              },
              {
                label: "Total Sent",
                value: totalEmails,
                icon: Activity,
                color: "text-blue-600",
                bg: "bg-blue-50",
              },
              {
                label: "Completed",
                value: totalCompleted,
                icon: CheckCircle2,
                color: "text-[#27AE60]",
                bg: "bg-[#27AE60]/10",
              },
              {
                label: "Failed",
                value: totalFailed,
                icon: XCircle,
                color: "text-red-500",
                bg: "bg-red-50",
              },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div
                key={label}
                className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm"
              >
                <div
                  className={`mb-1.5 flex h-7 w-7 items-center justify-center rounded-lg ${bg}`}
                >
                  <Icon size={13} className={color} />
                </div>
                <p className="text-lg font-bold leading-none text-gray-800">
                  {value.toLocaleString("en-IN")}
                </p>
                <p className="mt-1 text-[11px] text-gray-400">{label}</p>
              </div>
            ))}
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <Loader2 size={28} className="animate-spin text-[#27AE60]" />
            <p className="text-sm text-gray-500">Loading campaigns…</p>
          </div>
        )}

        {error && !loading && (
          <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-4">
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-500" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-700">
                Could not load campaigns
              </p>
              <p className="mb-2.5 mt-0.5 text-xs text-red-500">{error}</p>
              <button
                onClick={() => fetchAll()}
                className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {!loading && !error && campaigns.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#27AE60]/10">
              <Mail size={22} className="text-[#27AE60]" />
            </div>
            <p className="text-sm font-semibold text-gray-700">
              No campaigns yet
            </p>
            <p className="max-w-[240px] text-center text-xs text-gray-400">
              Email campaigns from Email Notifications will appear here after
              they are sent.
            </p>
          </div>
        )}

        {!loading && campaigns.length > 0 && (
          <CampaignTable
            campaigns={campaigns}
            page={page}
            pageSize={pageSize}
            search={search}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            onSearchChange={setSearch}
            onView={(c) => setSelected(c.campaignId)}
          />
        )}
      </div>
    </div>
  );
};

export default Automations;
