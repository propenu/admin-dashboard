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
} from "lucide-react";

import {
  getWhatsAppNotificationByName,
} from "../../features/user/userService";

import { Topbar } from "./common/Topbar";
import { Modal } from "./modals/Modal";
import { TemplateForm } from "./WhatAppNotificationComponent/TemplateForm";
import { ViewModal } from "./modals/ViewModal";
import { DeleteConfirm } from "./modals/DeleteConfirm";
import { componentsToForm } from "./utils/formMapper";
import { CATEGORIES, STATUS_META } from "./utils/constants";
import { TemplateCard } from "./cards/TemplateCard";

import { useWhatsAppNotificationsTemplate } from "./hooks/useWhatsAppTemplates";
import { EMPTY_FORM } from "./common/EmptyForm";

const WhatsUpNotifications = () => {
  const [search, setSearch] = useState("");
  const [editItem, setEditItem] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [viewItem, setViewItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);

  const {
    templates,
    loading,
    submitting,
    deleting,
    handleCreate,
    handleDelete,
    refetch,
  } = useWhatsAppNotificationsTemplate();

  

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

  const approvedCount = templates.filter((t) => t.status === "APPROVED").length;
  const rejectedCount = templates.filter((t) => t.status === "REJECTED").length;
  const pendingCount = templates.filter((t) => t.status === "PENDING").length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modals */}
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
              if (success) {
                setShowCreate(false); // ✅ close only on success
              }
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

      {/* Topbar */}
      <Topbar
        templates={templates}
        loading={loading}
        fetchAll={refetch}
        setShowCreate={setShowCreate}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            {
              label: "Total",
              value: templates.length,
              icon: <MessageSquare size={18} />,
              bg: "bg-blue-50 text-blue-600",
            },
            {
              label: "Approved",
              value: approvedCount,
              icon: <CheckCircle2 size={18} />,
              bg: "bg-green-50 text-green-600",
            },
            {
              label: "Pending",
              value: pendingCount,
              icon: <Clock size={18} />,
              bg: "bg-amber-50 text-amber-600",
            },
            {
              label: "Rejected",
              value: rejectedCount,
              icon: <XCircle size={18} />,
              bg: "bg-red-50 text-red-500",
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
              className="absolute right-6 left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#27AE60] focus:border-transparent placeholder-gray-300"
              placeholder="Search templates…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="relative">
            <select
              className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#27AE60] cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              {Object.keys(STATUS_META).map((s) => (
                <option key={s} value={s}>
                  {STATUS_META[s].label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={13}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>
          <div className="relative">
            <select
              className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#27AE60] cursor-pointer"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <ChevronDown
              size={13}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
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
            <Loader2 size={32} className="animate-spin text-[#27AE60]" />
          </div>
        )}

        {/* Empty */}
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
                className="flex items-center gap-2 px-4 py-2 bg-[#27AE60] text-white text-sm font-bold rounded-xl hover:bg-[#1A7A43] transition-colors"
              >
                <Plus size={15} /> Create Template
              </button>
            )}
          </div>
        )}

        {/* Cards */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((item) => (
              <TemplateCard
                key={item.id || item._id || item.name}
                item={item}
                onView={openView}
                onEdit={openEdit}
                onDelete={setDeleteItem}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WhatsUpNotifications;
