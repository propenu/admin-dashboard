// src/pages/EmailNotifications/EmailNotifications.jsx
import { useEffect, useState } from "react";
import {
  Plus,
  X,
  Search,
  Edit2,
  Mail,
  Check,
  AlertCircle,
  Loader2,
  Tag,
  BarChart2,
  RefreshCw,
  Clock,
  Activity,
} from "lucide-react";
import { getEmailNotification } from "../../features/user/userService";
import { useEmailNotifications } from "./hooks/useEmailNotifications";
import { useEmailLogs } from "./hooks/useEmailLogs";
import TemplateCard from "./EmailNotificationComponents/TemplateCard.jsx";
import NotificationForm from "./EmailNotificationComponents/NotificationForm.jsx";
import { Modal } from "./modals/CreateModal.jsx";
import { ViewModal } from "./modals/ViewModal.jsx";
import { DeleteConfirm } from "./modals/DeleteConfirm.jsx";
import { SendCampaignModal } from "./modals/SendCampaignModal.jsx";
import { getCatMeta } from "./utils/helpers";
import { StatCard } from "./EmailNotificationComponents/StatCard.jsx";
import { RunningBanner } from "./EmailNotificationComponents/RunningBanner.jsx";
import { CampaignTab } from "./EmailNotificationComponents/CampaignTab.jsx";
import { LogsTab } from "./EmailNotificationComponents/LogsTab.jsx";

const EMPTY_FORM = {
  name: "",
  slug: "",
  subject: "",
  content: "",
  variables: [],
  category: "festival",
  status: "active",
};

const PAGE_TABS = [
  { id: "templates", label: "Templates", icon: Mail },
  { id: "campaigns", label: "Campaigns", icon: BarChart2 },
  { id: "logs", label: "Email Logs", icon: Clock },
];

const EmailNotifications = () => {
  const {
    notifications,
    loading,
    submitting,
    deleting,
    fetchAll,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleSendCampaign,
  } = useEmailNotifications();

  const {
    logs,
    emailStats,
    campaigns,
    running,
    loadingLogs,
    retrying,
    fetchLogs,
    handleRetry,
  } = useEmailLogs();

  const [pageTab, setPageTab] = useState("templates");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [sendItem, setSendItem] = useState(null);

  useEffect(() => {
    fetchAll();
    fetchLogs();
  }, []);

  const openEdit = async (item) => {
    setViewItem(null);
    try {
      const res = await getEmailNotification(item.slug);
      setEditItem(res?.data?.data || res?.data || item);
    } catch {
      setEditItem(item);
    }
  };

  const openView = async (item) => {
    try {
      const res = await getEmailNotification(item._id);
      setViewItem(res?.data?.data || res?.data || item);
    } catch {
      setViewItem(item);
    }
  };

  const filtered = notifications.filter((n) => {
    const q = search.toLowerCase();
    return (
      (n.name.toLowerCase().includes(q) ||
        (n.slug || "").toLowerCase().includes(q)) &&
      (categoryFilter ? n.category === categoryFilter : true) &&
      (statusFilter ? n.status === statusFilter : true)
    );
  });

  const activeCount = notifications.filter((n) => n.status === "active").length;
  const categories = [...new Set(notifications.map((n) => n.category))];

  const isRefreshing = loading || loadingLogs;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Modals ─────────────────────────────────────── */}
      {showCreate && (
        <Modal
          title="Create New Template"
          icon={<Mail size={16} />}
          wide
          onClose={() => setShowCreate(false)}
        >
          <NotificationForm
            initial={EMPTY_FORM}
            onSubmit={(p) => handleCreate(p, () => setShowCreate(false))}
            submitting={submitting}
          />
        </Modal>
      )}
      {editItem && (
        <Modal
          title="Edit Template"
          icon={<Edit2 size={16} />}
          wide
          onClose={() => setEditItem(null)}
        >
          <NotificationForm
            initial={editItem}
            onSubmit={(p) => handleUpdate(editItem._id, p)}
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
          onConfirm={() =>
            handleDelete(deleteItem._id, () => setDeleteItem(null))
          }
          deleting={deleting}
        />
      )}
      {sendItem && (
        <SendCampaignModal
          item={sendItem}
          onClose={() => setSendItem(null)}
          sending={submitting}
          onSend={handleSendCampaign}
        />
      )}

      {/* ── Topbar ─────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 h-16 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-green-600 flex items-center justify-center flex-shrink-0 shadow-sm shadow-green-200">
            <Mail size={18} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">
              Email Notifications
            </p>
            <p className="text-xs text-gray-400">
              Templates · Campaigns · Logs
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              fetchAll();
              fetchLogs();
            }}
            className="flex items-center gap-2 px-3 py-2 border border-gray-200 text-gray-500 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
          >
            <RefreshCw
              size={13}
              className={isRefreshing ? "animate-spin" : ""}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 active:scale-[.98] transition-all shadow-sm shadow-green-200"
          >
            <Plus size={15} />
            <span className="hidden sm:inline">New Template</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-5">
        {/* ── Overview Stats ─────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            label="Templates"
            value={notifications.length}
            icon={Mail}
            bg="bg-blue-50 text-blue-600"
          />
          <StatCard
            label="Active"
            value={activeCount}
            icon={Check}
            bg="bg-green-50 text-green-600"
          />
          <StatCard
            label="Campaigns"
            value={campaigns.length}
            icon={BarChart2}
            bg="bg-purple-50 text-purple-600"
          />
          <StatCard
            label="Pending"
            value={emailStats?.pending ?? 0}
            icon={Clock}
            bg="bg-amber-50 text-amber-600"
          />
        </div>

        {/* ── Running Campaign Banner ─────────────────────── */}
        {running && (
          <RunningBanner
            data={running}
            onRetry={handleRetry}
            retrying={!!retrying}
          />
        )}

        {/* ── Page Tabs ───────────────────────────────────── */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-2xl w-fit">
          {PAGE_TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setPageTab(id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl transition-all ${
                pageTab === id
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon size={14} />
              {label}
              {id === "campaigns" && campaigns.length > 0 && (
                <span className="text-[10px] font-bold bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded-full">
                  {campaigns.length}
                </span>
              )}
              {id === "logs" && logs.length > 0 && (
                <span className="text-[10px] font-bold bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">
                  {logs.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════ */}
        {/* TAB: TEMPLATES                                     */}
        {/* ══════════════════════════════════════════════════ */}
        {pageTab === "templates" && (
          <div className="flex flex-col gap-5">
            {/* Template Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {
                  label: "Total",
                  value: notifications.length,
                  icon: <Mail size={18} />,
                  bg: "bg-blue-50 text-blue-600",
                },
                {
                  label: "Active",
                  value: activeCount,
                  icon: <Check size={18} />,
                  bg: "bg-green-50 text-green-600",
                },
                {
                  label: "Categories",
                  value: categories.length,
                  icon: <Tag size={18} />,
                  bg: "bg-amber-50 text-amber-600",
                },
                {
                  label: "Inactive",
                  value: notifications.length - activeCount,
                  icon: <AlertCircle size={18} />,
                  bg: "bg-gray-100 text-gray-400",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-3 hover:shadow-sm transition-shadow"
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${s.bg}`}
                  >
                    {s.icon}
                  </div>
                  <div>
                    <p className="text-xl font-extrabold text-gray-900 leading-none">
                      {s.value}
                    </p>
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mt-0.5">
                      {s.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              <div className="relative flex-1 min-w-[160px] max-w-xs">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-300"
                  placeholder="Search templates…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <select
                className="px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {getCatMeta(c).label}
                  </option>
                ))}
              </select>
              <select
                className="px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              {(search || categoryFilter || statusFilter) && (
                <button
                  onClick={() => {
                    setSearch("");
                    setCategoryFilter("");
                    setStatusFilter("");
                  }}
                  className="px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors"
                >
                  <X size={13} /> Clear
                </button>
              )}
            </div>

            {/* Template Grid */}
            {loading && (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={32} className="animate-spin text-green-500" />
              </div>
            )}
            {!loading && filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center">
                  <Mail size={36} className="text-gray-300" />
                </div>
                <p className="text-sm font-semibold text-gray-400">
                  {notifications.length === 0
                    ? "No templates yet. Create your first one!"
                    : "No templates match your filters."}
                </p>
                {notifications.length === 0 && (
                  <button
                    onClick={() => setShowCreate(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 transition-colors"
                  >
                    <Plus size={15} /> Create Template
                  </button>
                )}
              </div>
            )}
            {!loading && filtered.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filtered.map((item) => (
                  <TemplateCard
                    key={item._id}
                    item={item}
                    onView={openView}
                    onEdit={openEdit}
                    onDelete={setDeleteItem}
                    onSend={setSendItem}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════ */}
        {/* TAB: CAMPAIGNS                                     */}
        {/* ══════════════════════════════════════════════════ */}
        {pageTab === "campaigns" && (
          <CampaignTab
            campaigns={campaigns}
            emailStats={emailStats}
            loading={loadingLogs}
            onRetry={handleRetry}
            retrying={retrying}
          />
        )}

        {/* ══════════════════════════════════════════════════ */}
        {/* TAB: EMAIL LOGS                                    */}
        {/* ══════════════════════════════════════════════════ */}
        {pageTab === "logs" && <LogsTab logs={logs} loading={loadingLogs} />}
      </div>
    </div>
  );
};

export default EmailNotifications;
