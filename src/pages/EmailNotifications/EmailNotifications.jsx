// src/pages/EmailNotifications/EmailNotifications.jsx
import { useEffect, useState } from "react";
import {Plus, X, Search, Edit2, Mail,Check, AlertCircle, Loader2, Tag, } from "lucide-react";
import { getEmailNotification} from "../../features/user/userService";
import { useEmailNotifications} from "./hooks/useEmailNotifications";
import TemplateCard from "./emailNotificationComponents/TemplateCard";
import NotificationForm from "./emailNotificationComponents/NotificationForm";
import { Modal } from "./modals/CreateModal.jsx";
import { ViewModal } from "./modals/ViewModal.jsx";
import { DeleteConfirm } from "./modals/DeleteConfirm.jsx";
import { SendCampaignModal } from "./modals/SendCampaignModal.jsx";
import { getCatMeta } from "./utils/helpers";
const EMPTY_FORM = {
  name: "", slug: "", subject: "", content: "",
  variables: [], category: "festival", status: "active",
};

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
  const [search,         setSearch]         = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter,   setStatusFilter]   = useState("");
  const [showCreate,     setShowCreate]     = useState(false);
  const [editItem,       setEditItem]       = useState(null);
  const [viewItem,       setViewItem]       = useState(null);
  const [deleteItem,     setDeleteItem]     = useState(null);
  const [sendItem, setSendItem] = useState(null); 

  useEffect(() => { fetchAll(); }, []);
  const openEdit = async (item) => {
    setViewItem(null);
    try {
      const res = await getEmailNotification(item.slug);
      const data = res?.data?.data || res?.data || item;
      setEditItem(data);
    } catch {
      setEditItem(item);
    }
  };

  const openView = async (item) => {
    try {
      const res = await getEmailNotification(item.slug);
      setViewItem(res?.data?.data || res?.data || item);
    } catch {
      setViewItem(item);
    }
  };

  const filtered = notifications.filter((n) => {
    const q = search.toLowerCase();
    return (
      (n.name.toLowerCase().includes(q) || (n.slug || "").toLowerCase().includes(q)) &&
      (categoryFilter ? n.category === categoryFilter : true) &&
      (statusFilter   ? n.status   === statusFilter   : true)
    );
  });

  const activeCount = notifications.filter((n) => n.status === "active").length;
  const categories  = [...new Set(notifications.map((n) => n.category))];

  return (
    <div className="min-h-screen bg-gray-50">
      {showCreate && (
        <Modal
          title="Create New Template"
          icon={<Mail size={16} />}
          wide
          onClose={() => setShowCreate(false)}
        >
          <NotificationForm
            initial={EMPTY_FORM}
            onSubmit={(payload) =>
              handleCreate(payload, () => setShowCreate(false))
            }
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
            onSubmit={(payload) => handleUpdate(editItem._id, payload)}
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

      {/* Topbar */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 h-16 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-green-600 flex items-center justify-center flex-shrink-0">
            <Mail size={18} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">Email Templates</p>
            <p className="text-xs text-gray-400">
              Manage notification templates
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 transition-colors shadow-sm shadow-green-200"
        >
          <Plus size={15} /> New Template
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
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
        <div className="flex flex-wrap gap-2 mb-5">
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
    </div>
  );
};

export default EmailNotifications;





