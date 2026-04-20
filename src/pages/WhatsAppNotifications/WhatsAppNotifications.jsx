// src/pages/WhatsAppNotifications/WhatsUpNotifications.jsx
import { useState, useEffect, useMemo } from "react";
import {
  MessageSquare,
  Plus,
  X,
  Search,
  Loader2,
  ChevronDown,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  FileSpreadsheet,
  FileText,
  Activity,
  RefreshCw,
} from "lucide-react";

import {
  getWhatsAppNotificationByName,
  geAlltWhatsappLogs,
  getWhatsAppNotificationAnalytics,
} from "../../features/user/userService";

import { Topbar } from "./common/Topbar";
import { Modal } from "./modals/Modal";
import { TemplateForm } from "./WhatAppNotificationComponent/TemplateForm";
import { ViewModal } from "./modals/ViewModal";
import { DeleteConfirm } from "./modals/DeleteConfirm";
import { SendWhatsAppModal } from "./modals/SendWhatsAppModal";
import { SendBulkWhatsAppModal } from "./modals/SendBulkWhatsAppModal";
import { componentsToForm } from "./utils/formMapper";
import { CATEGORIES, STATUS_META } from "./utils/constants";
import { TemplateCard } from "./cards/TemplateCard";
import { useWhatsAppNotificationsTemplate } from "./hooks/useWhatsAppTemplates";
import { EMPTY_FORM } from "./common/EmptyForm";
import { formatDate } from "./utils/helper";

// ════════════════════════════════════════════════════════
// StatCard
// ════════════════════════════════════════════════════════
const StatCard = ({ label, value, icon: Icon, bg, border }) => (
  <div
    className={`bg-white border ${border || "border-gray-200"} rounded-2xl p-3 sm:p-4 flex items-center gap-3 hover:shadow-sm transition-shadow`}
  >
    <div
      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}
    >
      <Icon size={16} />
    </div>
    <div className="min-w-0">
      <p className="text-lg sm:text-xl font-extrabold text-gray-900 leading-none">
        {value}
      </p>
      <p className="text-[10px] sm:text-xs text-gray-400 font-semibold uppercase tracking-wide mt-0.5 truncate">
        {label}
      </p>
    </div>
  </div>
);

// ════════════════════════════════════════════════════════
// LogsTab
// ════════════════════════════════════════════════════════
const LogsTab = ({ logs, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={24} className="animate-spin text-[#25D366]" />
      </div>
    );
  }
  if (!logs.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
          <MessageSquare size={24} className="text-gray-300" />
        </div>
        <p className="text-sm font-semibold text-gray-400">No logs yet</p>
      </div>
    );
  }
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
        {logs.map((log) => (
          <div
            key={log._id}
            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                log.status === "success"
                  ? "bg-green-50"
                  : log.status === "failed"
                    ? "bg-red-50"
                    : "bg-amber-50"
              }`}
            >
              {log.status === "success" ? (
                <CheckCircle2 size={14} className="text-green-600" />
              ) : log.status === "failed" ? (
                <XCircle size={14} className="text-red-500" />
              ) : (
                <Clock size={14} className="text-amber-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-semibold text-gray-800 truncate">
                {log.to}
              </p>
              <p className="text-[10px] text-gray-400 font-mono truncate">
                {log.templateName}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  log.status === "success"
                    ? "bg-green-50 text-green-700 border-green-200"
                    : log.status === "failed"
                      ? "bg-red-50 text-red-600 border-red-200"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                }`}
              >
                {log.status}
              </span>
              <span className="text-[10px] text-gray-400">
                {formatDate(log.createdAt)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════
// MAIN PAGE - FULL UPDATED CODE
// ════════════════════════════════════════════════════════
const WhatsUpNotifications = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [viewItem, setViewItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [editItem, setEditItem] = useState(null); // Added missing state

  // Send Modals
  const [sendItem, setSendItem] = useState(null);         // Location-based
  const [bulkSendItem, setBulkSendItem] = useState(null); // CSV Bulk

  // New: Template Selector for Main Campaign Buttons
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [selectedTemplateForCampaign, setSelectedTemplateForCampaign] = useState(null);
  const [campaignType, setCampaignType] = useState(""); // "template" or "csv"

  // Logs & Stats
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const {
    templates,
    loading,
    submitting,
    deleting,
    handleCreate,
    handleDelete,
    refetch,
  } = useWhatsAppNotificationsTemplate();

  const approvedTemplates = templates.filter((t) => t.status === "APPROVED");

  const fetchLogs = async () => {
    try {
      setLoadingLogs(true);
      const [logsRes, statsRes] = await Promise.all([
        geAlltWhatsappLogs(),
        getWhatsAppNotificationAnalytics(),
      ]);
      setLogs(logsRes?.data?.data || logsRes?.data || []);
      setStats(statsRes?.data?.data || statsRes?.data || null);
    } catch (error) {
      console.error("Error fetching logs and stats:", error);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const openView = async (item) => {
    try {
      const res = await getWhatsAppNotificationByName(item.name);
      const data = res?.data?.data || res?.data || item;
      setViewItem(data);
    } catch {
      setViewItem(item);
    }
  };

  const openEdit = async (item) => {
    setViewItem(null);
    try {
      const res = await getWhatsAppNotificationByName(item.name);
      const data = res?.data?.data || res?.data || item;
      setEditItem(componentsToForm(data));
    } catch {
      setEditItem(componentsToForm(item));
    }
  };

  const filtered = useMemo(() => {
    return (templates || []).filter((t) => {
      const q = search.toLowerCase();
      const normalizedName = (t.name || "").replace(/_/g, " ").toLowerCase();
      return (
        normalizedName.includes(q) &&
        (statusFilter ? t.status === statusFilter : true) &&
        (categoryFilter ? t.category === categoryFilter : true)
      );
    });
  }, [templates, search, statusFilter, categoryFilter]);

  // Handle Main "Send Campaign" Buttons
  const handleCampaignClick = (type) => {
    if (approvedTemplates.length === 0) {
      alert("No approved templates available. Please create and approve a template first.");
      return;
    }
    setCampaignType(type);
    setShowTemplateSelector(true);
    setSelectedTemplateForCampaign(null);
  };

  // Proceed after selecting template from dropdown
  const handleTemplateSelectForCampaign = () => {
    if (!selectedTemplateForCampaign) return;

    if (campaignType === "template") {
      setSendItem(selectedTemplateForCampaign);
    } else if (campaignType === "csv") {
      setBulkSendItem(selectedTemplateForCampaign);
    }

    setShowTemplateSelector(false);
    setSelectedTemplateForCampaign(null);
    setCampaignType("");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ==================== ALL MODALS ==================== */}

      {/* Template Selector Modal for Main Campaign */}
      {showTemplateSelector && (
        <Modal
          title={`Select Template for ${campaignType === "template" ? "Template Send" : "CSV Upload"}`}
          icon={<MessageSquare size={16} />}
          onClose={() => {
            setShowTemplateSelector(false);
            setSelectedTemplateForCampaign(null);
          }}
        >
          <div className="flex flex-col gap-4 p-1">
            <p className="text-sm text-gray-600">Choose a template:</p>
            
            <select
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366]"
              value={selectedTemplateForCampaign?.name || ""}
              onChange={(e) => {
                const selected = approvedTemplates.find((t) => t.name === e.target.value);
                setSelectedTemplateForCampaign(selected);
              }}
            >
              <option value="">-- Select Template --</option>
              {approvedTemplates.map((template) => (
                <option key={template.name} value={template.name}>
                  {template.name}
                </option>
              ))}
            </select>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => {
                  setShowTemplateSelector(false);
                  setSelectedTemplateForCampaign(null);
                }}
                className="flex-1 py-3 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleTemplateSelectForCampaign}
                disabled={!selectedTemplateForCampaign}
                className="flex-1 py-3 bg-[#25D366] text-white font-bold rounded-xl hover:bg-[#1EAF54] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        </Modal>
      )}

      

      {showCreate && (
        <Modal
          title="Create WhatsApp Template"
          icon={<MessageSquare size={16} />}
          wide
          onClose={() => setShowCreate(false)}
        >
          <TemplateForm
            initial={EMPTY_FORM}
            onSubmit={async (payload) => {
              const success = await handleCreate(payload);
              if (success) setShowCreate(false);
            }}
            submitting={submitting}
          />
        </Modal>
      )}

      {viewItem && (
        <ViewModal
          item={viewItem}
          onClose={() => setViewItem(null)}
          onEdit={() => openEdit(viewItem)}
        />
      )}

      {deleteItem && (
        <DeleteConfirm
          item={deleteItem}
          onClose={() => setDeleteItem(null)}
          onConfirm={async () => {
            await handleDelete(deleteItem.name);
            setDeleteItem(null);
          }}
          deleting={deleting}
        />
      )}

      {sendItem && (
        <SendWhatsAppModal
          template={sendItem}
          onClose={() => {
            setSendItem(null);
            fetchLogs();
          }}
        />
      )}

      {bulkSendItem && (
        <SendBulkWhatsAppModal
          template={bulkSendItem}
          onClose={() => {
            setBulkSendItem(null);
            fetchLogs();
          }}
        />
      )}

      {/* Topbar */}
      <Topbar
        templates={templates}
        loading={loading}
        fetchAll={refetch}
        setShowCreate={setShowCreate}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Message Stats */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { label: "Messages Sent", value: stats.total ?? 0, icon: Send, bg: "bg-[#E8F8EF] text-[#25D366]", border: "border-[#C2EDD6]" },
              { label: "Delivered", value: stats.success ?? 0, icon: CheckCircle2, bg: "bg-green-50 text-green-600", border: "border-green-100" },
              { label: "Failed", value: stats.failed ?? 0, icon: XCircle, bg: "bg-red-50 text-red-500", border: "border-red-100" },
              { label: "Pending", value: stats.pending ?? 0, icon: Clock, bg: "bg-amber-50 text-amber-600", border: "border-amber-100" },
            ].map((s) => <StatCard key={s.label} {...s} />)}
          </div>
        )}

        {/* Send Campaign + Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Send Campaign */}
          <div className="flex flex-col gap-3 bg-white border border-gray-200 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-[#E8F8EF] flex items-center justify-center">
                <Send size={14} className="text-[#25D366]" />
              </div>
              <p className="text-sm font-bold text-gray-800">Send Campaign</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleCampaignClick("template")}
                disabled={approvedTemplates.length === 0}
                className="group flex flex-col items-center justify-center gap-2 py-6 px-4 rounded-2xl border-2 border-dashed border-gray-200 bg-white hover:border-[#25D366] hover:bg-[#E8F8EF] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <div className="w-10 h-10 rounded-xl bg-gray-100 group-hover:bg-[#25D366] flex items-center justify-center transition-colors">
                  <MessageSquare size={18} className="text-gray-400 group-hover:text-white transition-colors" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-gray-700 group-hover:text-[#25D366] transition-colors">Template Send</p>
                  <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed hidden sm:block">
                    Send by location<br />to matched users
                  </p>
                </div>
              </button>

              <button
                onClick={() => handleCampaignClick("csv")}
                disabled={approvedTemplates.length === 0}
                className="group flex flex-col items-center justify-center gap-2 py-6 px-4 rounded-2xl border-2 border-dashed border-gray-200 bg-white hover:border-purple-400 hover:bg-purple-50 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <div className="w-10 h-10 rounded-xl bg-gray-100 group-hover:bg-purple-500 flex items-center justify-center transition-colors">
                  <FileSpreadsheet size={18} className="text-gray-400 group-hover:text-white transition-colors" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-gray-700 group-hover:text-purple-600 transition-colors">CSV Upload</p>
                  <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed hidden sm:block">
                    Bulk send<br />from file
                  </p>
                </div>
              </button>
            </div>

            <div className="flex items-start gap-2 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-xl mt-1">
              <FileText size={13} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 leading-relaxed">
                <strong>Template Send</strong> — targets users by state / city / locality.<br />
                <strong>CSV Upload</strong> — bulk sends to every row in your file.
              </p>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="flex flex-col gap-3 bg-white border border-gray-200 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                <Activity size={14} className="text-blue-600" />
              </div>
              <p className="text-sm font-bold text-gray-800">Recent Activity</p>
              <button
                onClick={() => { refetch(); fetchLogs(); }}
                className="ml-auto w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:text-[#25D366] hover:border-green-200 transition-colors"
              >
                {loadingLogs ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
              </button>
            </div>

            {loadingLogs ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={20} className="animate-spin text-[#25D366]" />
              </div>
            ) : logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2">
                <MessageSquare size={22} className="text-gray-200" />
                <p className="text-sm text-gray-400 font-semibold">No messages sent yet</p>
              </div>
            ) : (
              <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
                {logs.slice(0, 5).map((log) => (
                  <div key={log._id} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 border border-gray-100">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${log.status === "success" ? "bg-green-50" : "bg-red-50"}`}>
                      {log.status === "success" ? <CheckCircle2 size={12} className="text-green-600" /> : <XCircle size={12} className="text-red-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate">{log.to}</p>
                      <p className="text-[10px] text-gray-400 font-mono truncate">{log.templateName}</p>
                    </div>
                    <span className="text-[10px] text-gray-400 flex-shrink-0">{formatDate(log.createdAt)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-5">
          <div className="relative flex-1 min-w-[160px] max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:border-transparent placeholder-gray-300"
              placeholder="Search templates…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="relative">
            <select
              className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#25D366] cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              {Object.keys(STATUS_META).map((s) => (
                <option key={s} value={s}>{STATUS_META[s].label}</option>
              ))}
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#25D366] cursor-pointer"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {(search || statusFilter || categoryFilter) && (
            <button
              onClick={() => {
                setSearch("");
                setStatusFilter("");
                setCategoryFilter("");
              }}
              className="px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors"
            >
              <X size={13} /> Clear
            </button>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-[#25D366]" />
          </div>
        )}

        {/* Empty State */}
        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center">
              <MessageSquare size={36} className="text-gray-300" />
            </div>
            <p className="text-sm font-semibold text-gray-400">
              {templates.length === 0
                ? "No templates yet. Create your first one!"
                : "No templates match your filters."}
            </p>
            {templates.length === 0 && (
              <button
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#25D366] text-white text-sm font-bold rounded-xl hover:bg-[#1EAF54] transition-colors"
              >
                <Plus size={15} /> Create Template
              </button>
            )}
          </div>
        )}

        {/* Template Cards */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {filtered.map((item) => (
              <div key={item.name || item._id} className="relative group/card">
                <TemplateCard
                  item={item}
                  onView={openView}
                  onEdit={openEdit}
                  onDelete={setDeleteItem}
                />

                {/* Per-card Send Buttons */}
                <div
                  className="absolute bottom-[52px] right-3 flex items-center gap-1.5 opacity-0 group-hover/card:opacity-100 transition-opacity z-10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => setSendItem(item)}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-[#25D366] text-white text-[10px] font-bold rounded-lg hover:bg-[#1EAF54] transition-colors"
                    style={{ boxShadow: "0 2px 8px rgba(37,211,102,.35)" }}
                  >
                    <Send size={9} /> Send
                  </button>
                  <button
                    onClick={() => setBulkSendItem(item)}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-purple-500 text-white text-[10px] font-bold rounded-lg hover:bg-purple-600 transition-colors"
                  >
                    <FileSpreadsheet size={9} /> CSV
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Logs Section */}
        <div className="flex flex-col gap-3">
          <div className="flex gap-1 p-1 bg-gray-100 rounded-2xl w-fit">
            <div className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-white text-gray-900 shadow-sm">
              <Clock size={13} />
              WhatsApp Logs
              {logs.length > 0 && (
                <span className="text-[10px] font-bold bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">
                  {logs.length}
                </span>
              )}
            </div>
          </div>
          <LogsTab logs={logs} loading={loadingLogs} />
        </div>
      </div>
    </div>
  );
};

export default WhatsUpNotifications;