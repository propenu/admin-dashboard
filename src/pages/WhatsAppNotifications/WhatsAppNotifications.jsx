import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { MessageSquare } from "lucide-react";
import { toast } from "sonner";

import {
  geAlltWhatsappLogs,
  getWhatsAppNotificationAnalytics,
  getWhatsAppNotificationByName,
  retryFailedWhatsAppCampaign,
} from "../../features/user/userService";

import WhatsAppShell, { WHATSAPP_SECTIONS } from "./layout/WhatsAppShell";
import OverviewScreen from "./screens/OverviewScreen";
import TemplatesScreen from "./screens/TemplatesScreen";
import CampaignHistoryScreen from "./screens/CampaignHistoryScreen";
import LogsScreen from "./screens/LogsScreen";
import WhatsAppInbox from "./WhatsAppInbox";

import { Modal } from "./modals/Modal";
import { ViewModal } from "./modals/ViewModal";
import { DeleteConfirm } from "./modals/DeleteConfirm";
import { SendWhatsAppModal } from "./modals/SendWhatsAppModal";
import { SendBulkWhatsAppModal } from "./modals/SendBulkWhatsAppModal";
import { CrmCampaignModal } from "./modals/CrmCampaignModal";
import { CsvCampaignModal } from "./modals/CsvCampaignModal";
import { CampaignViewModal } from "./modals/CampaignViewModal";
import { TemplateComposerModal } from "./modals/TemplateComposerModal";
import { componentsToForm } from "./utils/formMapper";
import { EMPTY_FORM } from "./common/EmptyForm";
import { useWhatsAppNotificationsTemplate } from "./hooks/useWhatsAppTemplates";

const VALID_SECTIONS = new Set(WHATSAPP_SECTIONS.map((s) => s.id));

const WhatsAppNotifications = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const sectionParam = searchParams.get("section") || "inbox";
  const section = VALID_SECTIONS.has(sectionParam) ? sectionParam : "inbox";

  const setSection = (next) => {
    const params = new URLSearchParams(searchParams);
    params.set("section", next);
    setSearchParams(params, { replace: true });
  };

  const [showCreate, setShowCreate] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [sendItem, setSendItem] = useState(null);
  const [bulkSendItem, setBulkSendItem] = useState(null);
  const [showCrmCampaign, setShowCrmCampaign] = useState(false);
  const [showCsvCampaign, setShowCsvCampaign] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [selectedTemplateForCampaign, setSelectedTemplateForCampaign] =
    useState(null);
  const [campaignType, setCampaignType] = useState("");
  const [campaignView, setCampaignView] = useState(null);
  const [retryingId, setRetryingId] = useState("");

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

  const approvedTemplates = useMemo(
    () => (templates || []).filter((t) => t.status === "APPROVED"),
    [templates],
  );

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
      setViewItem(res?.data?.data || res?.data || item);
    } catch {
      setViewItem(item);
    }
  };

  const openEditCopy = async (item) => {
    try {
      const res = await getWhatsAppNotificationByName(item.name);
      const full = res?.data?.data || res?.data || item;
      const form = componentsToForm(full);
      setEditForm({
        ...form,
        name: `${form.name}_copy`.replace(/__+/g, "_").slice(0, 512),
      });
    } catch {
      const form = componentsToForm(item);
      setEditForm({
        ...form,
        name: `${form.name}_copy`.replace(/__+/g, "_").slice(0, 512),
      });
    }
  };

  const handleCampaignClick = (type) => {
    if (approvedTemplates.length === 0) {
      toast.warning(
        "No approved templates available. Create and approve a template first.",
      );
      setSection("templates");
      return;
    }
    if (type === "template") {
      setShowCrmCampaign(true);
      return;
    }
    if (type === "csv") {
      setShowCsvCampaign(true);
      return;
    }
    setCampaignType(type);
    setShowTemplateSelector(true);
    setSelectedTemplateForCampaign(null);
  };

  const handleTemplateSelectForCampaign = () => {
    if (!selectedTemplateForCampaign) return;
    if (campaignType === "template") setSendItem(selectedTemplateForCampaign);
    if (campaignType === "csv") setBulkSendItem(selectedTemplateForCampaign);
    setShowTemplateSelector(false);
    setSelectedTemplateForCampaign(null);
    setCampaignType("");
  };

  const handleRetry = async (campaignId) => {
    if (!campaignId) return;
    setRetryingId(campaignId);
    try {
      const res = await retryFailedWhatsAppCampaign(campaignId);
      toast.success(res?.data?.message || "Retry started");
      await fetchLogs();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Retry failed");
    } finally {
      setRetryingId("");
    }
  };

  return (
    <WhatsAppShell
      section={section}
      onSectionChange={setSection}
      fullBleed={section === "inbox"}
    >
      {showTemplateSelector ? (
        <Modal
          title={`Select Template for ${
            campaignType === "template" ? "CRM / location send" : "CSV upload"
          }`}
          icon={<MessageSquare size={16} />}
          onClose={() => {
            setShowTemplateSelector(false);
            setSelectedTemplateForCampaign(null);
          }}
        >
          <div className="flex flex-col gap-4 p-1">
            <select
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366]"
              value={selectedTemplateForCampaign?.name || ""}
              onChange={(e) => {
                const selected = approvedTemplates.find(
                  (t) => t.name === e.target.value,
                );
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
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowTemplateSelector(false)}
                className="flex-1 py-3 border border-gray-300 rounded-xl font-semibold text-gray-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleTemplateSelectForCampaign}
                disabled={!selectedTemplateForCampaign}
                className="flex-1 py-3 bg-[#25D366] text-white font-bold rounded-xl disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          </div>
        </Modal>
      ) : null}

      {showCreate ? (
        <TemplateComposerModal
          mode="create"
          initial={EMPTY_FORM}
          submitting={submitting}
          onClose={() => setShowCreate(false)}
          onSubmit={async (payload) => {
            await handleCreate(payload);
            setShowCreate(false);
            refetch?.();
          }}
        />
      ) : null}

      {editForm ? (
        <TemplateComposerModal
          mode="edit"
          initial={editForm}
          submitting={submitting}
          onClose={() => setEditForm(null)}
          onSubmit={async (payload) => {
            await handleCreate(payload);
            setEditForm(null);
            refetch?.();
          }}
        />
      ) : null}

      {viewItem ? (
        <ViewModal item={viewItem} onClose={() => setViewItem(null)} />
      ) : null}

      {deleteItem ? (
        <DeleteConfirm
          item={deleteItem}
          deleting={deleting}
          onClose={() => setDeleteItem(null)}
          onConfirm={async () => {
            await handleDelete(deleteItem?.name || deleteItem);
            setDeleteItem(null);
            refetch?.();
          }}
        />
      ) : null}

      {showCrmCampaign ? (
        <CrmCampaignModal
          templates={approvedTemplates}
          onClose={() => {
            setShowCrmCampaign(false);
            fetchLogs();
          }}
        />
      ) : null}

      {showCsvCampaign ? (
        <CsvCampaignModal
          templates={approvedTemplates}
          onClose={() => {
            setShowCsvCampaign(false);
            fetchLogs();
          }}
        />
      ) : null}

      {sendItem ? (
        <SendWhatsAppModal
          template={sendItem}
          onClose={() => {
            setSendItem(null);
            fetchLogs();
          }}
        />
      ) : null}

      {bulkSendItem ? (
        <SendBulkWhatsAppModal
          template={bulkSendItem}
          onClose={() => {
            setBulkSendItem(null);
            fetchLogs();
          }}
        />
      ) : null}

      {campaignView ? (
        <CampaignViewModal
          campaign={campaignView}
          retrying={retryingId === campaignView.campaignId}
          onClose={() => setCampaignView(null)}
          onRetry={async (id) => {
            await handleRetry(id);
          }}
        />
      ) : null}

      {section === "overview" ? (
        <OverviewScreen
          stats={stats}
          logs={logs}
          templates={templates}
          loading={loadingLogs}
          onRefresh={fetchLogs}
          onOpenCrmCampaign={() => handleCampaignClick("template")}
          onOpenCsvCampaign={() => handleCampaignClick("csv")}
        />
      ) : null}

      {section === "templates" ? (
        <TemplatesScreen
          templates={templates}
          loading={loading}
          onCreate={() => setShowCreate(true)}
          onView={openView}
          onEdit={openEditCopy}
          onDuplicate={openEditCopy}
          onDelete={setDeleteItem}
        />
      ) : null}

      {section === "inbox" ? (
        <div className="flex min-h-0 flex-1 flex-col h-full">
          <WhatsAppInbox embedded />
        </div>
      ) : null}

      {section === "campaigns" ? (
        <CampaignHistoryScreen
          logs={logs}
          loading={loadingLogs}
          retryingId={retryingId}
          onRetry={handleRetry}
          onView={setCampaignView}
        />
      ) : null}

      {section === "logs" ? (
        <LogsScreen
          logs={logs}
          stats={stats}
          loading={loadingLogs}
          onRefresh={fetchLogs}
        />
      ) : null}
    </WhatsAppShell>
  );
};

export default WhatsAppNotifications;
