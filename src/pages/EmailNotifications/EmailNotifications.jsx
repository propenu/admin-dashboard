// // src/pages/EmailNotifications/EmailNotifications.jsx
// import { useEffect, useState } from "react";
// import {Plus, X, Search, Edit2, Mail,Check, AlertCircle, Loader2, Tag, } from "lucide-react";
// import { getEmailNotification} from "../../features/user/userService";
// import { useEmailNotifications} from "./hooks/useEmailNotifications";
// import TemplateCard from "./EmailNotificationComponents/TemplateCard.jsx";
// import NotificationForm from "./EmailNotificationComponents/NotificationForm.jsx";
// import { Modal } from "./modals/CreateModal.jsx";
// import { ViewModal } from "./modals/ViewModal.jsx";
// import { DeleteConfirm } from "./modals/DeleteConfirm.jsx";
// import { SendCampaignModal } from "./modals/SendCampaignModal.jsx";
// import { getCatMeta } from "./utils/helpers";
// const EMPTY_FORM = {
//   name: "", slug: "", subject: "", content: "",
//   variables: [], category: "festival", status: "active",
// };

// const EmailNotifications = () => {
//   const {
//     notifications,
//     loading,
//     submitting,
//     deleting,
//     fetchAll,
//     handleCreate,
//     handleUpdate,
//     handleDelete,
//     handleSendCampaign,
//   } = useEmailNotifications();
//   const [search,         setSearch]         = useState("");
//   const [categoryFilter, setCategoryFilter] = useState("");
//   const [statusFilter,   setStatusFilter]   = useState("");
//   const [showCreate,     setShowCreate]     = useState(false);
//   const [editItem,       setEditItem]       = useState(null);
//   const [viewItem,       setViewItem]       = useState(null);
//   const [deleteItem,     setDeleteItem]     = useState(null);
//   const [sendItem, setSendItem] = useState(null); 

//   useEffect(() => { fetchAll(); }, []);
//   const openEdit = async (item) => {
//     setViewItem(null);
//     try {
//       const res = await getEmailNotification(item.slug);
//       const data = res?.data?.data || res?.data || item;
//       setEditItem(data);
//     } catch {
//       setEditItem(item);
//     }
//   };

//   const openView = async (item) => {
//     try {
//       const res = await getEmailNotification(item._id);
//       setViewItem(res?.data?.data || res?.data || item);
//     } catch {
//       setViewItem(item);
//     }
//   };

//   const filtered = notifications.filter((n) => {
//     const q = search.toLowerCase();
//     return (
//       (n.name.toLowerCase().includes(q) || (n.slug || "").toLowerCase().includes(q)) &&
//       (categoryFilter ? n.category === categoryFilter : true) &&
//       (statusFilter   ? n.status   === statusFilter   : true)
//     );
//   });

//   const activeCount = notifications.filter((n) => n.status === "active").length;
//   const categories  = [...new Set(notifications.map((n) => n.category))];

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {showCreate && (
//         <Modal
//           title="Create New Template"
//           icon={<Mail size={16} />}
//           wide
//           onClose={() => setShowCreate(false)}
//         >
//           <NotificationForm
//             initial={EMPTY_FORM}
//             onSubmit={(payload) =>
//               handleCreate(payload, () => setShowCreate(false))
//             }
//             submitting={submitting}
//           />
//         </Modal>
//       )}
//       {editItem && (
//         <Modal
//           title="Edit Template"
//           icon={<Edit2 size={16} />}
//           wide
//           onClose={() => setEditItem(null)}
//         >
//           <NotificationForm
//             initial={editItem}
//             onSubmit={(payload) => handleUpdate(editItem._id, payload)}
//             submitting={submitting}
//           />
//         </Modal>
//       )}
//       {viewItem && (
//         <ViewModal
//           item={viewItem}
//           onClose={() => setViewItem(null)}
//           onEdit={() => openEdit(viewItem)}
//         />
//       )}
//       {deleteItem && (
//         <DeleteConfirm
//           item={deleteItem}
//           onClose={() => setDeleteItem(null)}
//           onConfirm={() =>
//             handleDelete(deleteItem._id, () => setDeleteItem(null))
//           }
//           deleting={deleting}
//         />
//       )}

//       {sendItem && (
//         <SendCampaignModal
//           item={sendItem}
//           onClose={() => setSendItem(null)}
//           sending={submitting}
//           onSend={handleSendCampaign}
//         />
//       )}

//       {/* Topbar */}
//       <div className="bg-white border-b border-gray-200 px-4 sm:px-6 h-16 flex items-center justify-between sticky top-0 z-40">
//         <div className="flex items-center gap-3">
//           <div className="w-9 h-9 rounded-xl bg-green-600 flex items-center justify-center flex-shrink-0">
//             <Mail size={18} className="text-white" />
//           </div>
//           <div>
//             <p className="text-sm font-bold text-gray-900">Email Templates</p>
//             <p className="text-xs text-gray-400">
//               Manage notification templates
//             </p>
//           </div>
//         </div>
//         <button
//           onClick={() => setShowCreate(true)}
//           className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 transition-colors shadow-sm shadow-green-200"
//         >
//           <Plus size={15} /> New Template
//         </button>
//       </div>

//       <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
//         {/* Stats */}
//         <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
//           {[
//             {
//               label: "Total",
//               value: notifications.length,
//               icon: <Mail size={18} />,
//               bg: "bg-blue-50 text-blue-600",
//             },
//             {
//               label: "Active",
//               value: activeCount,
//               icon: <Check size={18} />,
//               bg: "bg-green-50 text-green-600",
//             },
//             {
//               label: "Categories",
//               value: categories.length,
//               icon: <Tag size={18} />,
//               bg: "bg-amber-50 text-amber-600",
//             },
//             {
//               label: "Inactive",
//               value: notifications.length - activeCount,
//               icon: <AlertCircle size={18} />,
//               bg: "bg-gray-100 text-gray-400",
//             },
//           ].map((s) => (
//             <div
//               key={s.label}
//               className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-3 hover:shadow-sm transition-shadow"
//             >
//               <div
//                 className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${s.bg}`}
//               >
//                 {s.icon}
//               </div>
//               <div>
//                 <p className="text-xl font-extrabold text-gray-900 leading-none">
//                   {s.value}
//                 </p>
//                 <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mt-0.5">
//                   {s.label}
//                 </p>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Filters */}
//         <div className="flex flex-wrap gap-2 mb-5">
//           <div className="relative flex-1 min-w-[160px] max-w-xs">
//             <Search
//               size={14}
//               className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
//             />
//             <input
//               type="text"
//               className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-300"
//               placeholder="Search templates…"
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//             />
//           </div>
//           <select
//             className="px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer"
//             value={categoryFilter}
//             onChange={(e) => setCategoryFilter(e.target.value)}
//           >
//             <option value="">All Categories</option>
//             {categories.map((c) => (
//               <option key={c} value={c}>
//                 {getCatMeta(c).label}
//               </option>
//             ))}
//           </select>
//           <select
//             className="px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer"
//             value={statusFilter}
//             onChange={(e) => setStatusFilter(e.target.value)}
//           >
//             <option value="">All Status</option>
//             <option value="active">Active</option>
//             <option value="inactive">Inactive</option>
//           </select>
//           {(search || categoryFilter || statusFilter) && (
//             <button
//               onClick={() => {
//                 setSearch("");
//                 setCategoryFilter("");
//                 setStatusFilter("");
//               }}
//               className="px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors"
//             >
//               <X size={13} /> Clear
//             </button>
//           )}
//         </div>

//         {loading && (
//           <div className="flex items-center justify-center py-20">
//             <Loader2 size={32} className="animate-spin text-green-500" />
//           </div>
//         )}

//         {!loading && filtered.length === 0 && (
//           <div className="flex flex-col items-center justify-center py-20 gap-3">
//             <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center">
//               <Mail size={36} className="text-gray-300" />
//             </div>
//             <p className="text-sm font-semibold text-gray-400">
//               {notifications.length === 0
//                 ? "No templates yet. Create your first one!"
//                 : "No templates match your filters."}
//             </p>
//             {notifications.length === 0 && (
//               <button
//                 onClick={() => setShowCreate(true)}
//                 className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 transition-colors"
//               >
//                 <Plus size={15} /> Create Template
//               </button>
//             )}
//           </div>
//         )}

//         {!loading && filtered.length > 0 && (
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             {filtered.map((item) => (
//               <TemplateCard
//                 key={item._id}
//                 item={item}
//                 onView={openView}
//                 onEdit={openEdit}
//                 onDelete={setDeleteItem}
//                 onSend={setSendItem}
//               />
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default EmailNotifications;

// src/pages/EmailNotifications/EmailNotifications.jsx
import { useEffect, useState, useRef } from "react";
import {
  Plus, X, Search, Edit2, Mail, Check, AlertCircle, Loader2, Tag,
  BarChart2, RefreshCw, CheckCircle2, Clock, ChevronDown, ChevronRight,
  RotateCcw, Upload, FileSpreadsheet, Users, FileText, Send, Activity,
  TrendingUp, Phone, MapPin, Building2, User, PartyPopper, Zap,
} from "lucide-react";
import { toast } from "sonner";
import { State, City } from "country-state-city";

import {
  getEmailNotification,
  createEmailNotification,
  deleteEmailNotification,
  getAllEmailNotifications,
  sentEmailNotification,
  updateEmailNotification,
  getSentEmailNotification,
  getSentEmailNotificationAnalytics,
  getCanpaingsAnalytics,
  getCanpaingsAnalyticsByCampaignId,
  resentCanpaingByCampaignId,
  getRunningCampaigns,
  sentBulkEmailNotification,
  getUserSearch,
} from "../../features/user/userService";

import TemplateCard from "./EmailNotificationComponents/TemplateCard.jsx";
import NotificationForm from "./EmailNotificationComponents/NotificationForm.jsx";
import { Modal } from "./modals/CreateModal.jsx";
import { ViewModal } from "./modals/ViewModal.jsx";
import { DeleteConfirm } from "./modals/DeleteConfirm.jsx";
import { getCatMeta } from "./utils/helpers";

// ─── Constants ─────────────────────────────────────────────────────────────
const IN_STATES = State.getStatesOfCountry("IN");
const getCitiesByState = (stateCode) =>
  stateCode ? City.getCitiesOfState("IN", stateCode) : [];

const EMPTY_FORM = {
  name: "", slug: "", subject: "", content: "",
  variables: [], category: "festival", status: "active",
};

const PAGE_TABS = [
  { id: "templates", label: "Templates",  icon: <Mail size={14} /> },
  { id: "campaigns", label: "Campaigns",  icon: <BarChart2 size={14} /> },
  { id: "logs",      label: "Email Logs", icon: <FileText size={14} /> },
];

const STATUS_META = {
  success: { label: "Sent",    color: "bg-green-50 text-green-700 border-green-200", dot: "bg-green-500",              icon: <CheckCircle2 size={11} /> },
  failed:  { label: "Failed",  color: "bg-red-50 text-red-600 border-red-200",       dot: "bg-red-500",                icon: <AlertCircle  size={11} /> },
  pending: { label: "Pending", color: "bg-amber-50 text-amber-600 border-amber-200", dot: "bg-amber-400 animate-pulse", icon: <Clock        size={11} /> },
};

// ─── Small shared components ────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const m = STATUS_META[status] || STATUS_META.pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${m.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  );
};

const ProgressBar = ({ success = 0, failed = 0, total = 0 }) => {
  const s = total ? Math.round((success / total) * 100) : 0;
  const f = total ? Math.round((failed  / total) * 100) : 0;
  return (
    <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden flex">
      <div className="h-full bg-green-500 transition-all" style={{ width: `${s}%` }} />
      <div className="h-full bg-red-400  transition-all" style={{ width: `${f}%` }} />
      <div className="h-full bg-amber-300 flex-1" />
    </div>
  );
};

const StatCard = ({ label, value, icon, bg }) => (
  <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-3 hover:shadow-sm transition-shadow">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>{icon}</div>
    <div>
      <p className="text-xl font-extrabold text-gray-900 leading-none">{value}</p>
      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mt-0.5">{label}</p>
    </div>
  </div>
);

const fmt = (d) =>
  d ? new Date(d).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }) : "—";

// ─── Running Campaign Banner ─────────────────────────────────────────────────
const RunningBanner = ({ data, onRetry, retrying }) => {
  if (!data?.campaignId) return null;
  return (
    <div className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-200 rounded-2xl">
      <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
        <Activity size={18} className="text-white animate-pulse" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-sm font-bold text-blue-900">Campaign Running</p>
          <span className="font-mono text-[10px] bg-blue-100 border border-blue-200 px-2 py-0.5 rounded-lg text-blue-700 truncate max-w-[180px]">
            {data.campaignId}
          </span>
        </div>
        <ProgressBar success={data.success} failed={data.failed} total={data.total} />
        <div className="flex gap-4 mt-1.5 text-[10px] font-semibold">
          <span className="text-green-700">{data.success} sent</span>
          <span className="text-red-600">{data.failed} failed</span>
          <span className="text-amber-600">{data.pending} pending</span>
          <span className="text-blue-600 ml-auto">{data.progress}</span>
        </div>
      </div>
      {data.failed > 0 && (
        <button
          onClick={() => onRetry(data.campaignId)}
          disabled={retrying}
          className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex-shrink-0"
        >
          {retrying ? <Loader2 size={13} className="animate-spin" /> : <RotateCcw size={13} />}
          Retry
        </button>
      )}
    </div>
  );
};

// ─── Campaign Row (expandable) ───────────────────────────────────────────────
const CampaignRow = ({ campaign, onRetry, retrying }) => {
  const [expanded, setExpanded]       = useState(false);
  const [detail, setDetail]           = useState(null);
  const [loadingDetail, setLoading]   = useState(false);

  const handleExpand = async () => {
    if (!expanded && !detail) {
      try {
        setLoading(true);
        const res = await getCanpaingsAnalyticsByCampaignId(campaign.campaignId);
        setDetail(res?.data?.data || res?.data || campaign);
      } catch { setDetail(campaign); }
      finally { setLoading(false); }
    }
    setExpanded(p => !p);
  };

  const d = detail || campaign;
  const pct = d.total ? Math.round((d.success / d.total) * 100) : 0;

  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white hover:shadow-sm transition-shadow">
      <div className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors" onClick={handleExpand}>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${expanded ? "bg-green-600 text-white" : "bg-gray-100 text-gray-500"}`}>
          {loadingDetail
            ? <Loader2 size={14} className="animate-spin" />
            : expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-800 truncate font-mono">{campaign.campaignId}</p>
          <ProgressBar success={campaign.success} failed={campaign.failed} total={campaign.total} />
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="hidden sm:flex gap-3 text-[10px] font-bold">
            <span className="text-green-700 flex items-center gap-1"><CheckCircle2 size={10} />{campaign.success}</span>
            <span className="text-red-600   flex items-center gap-1"><AlertCircle  size={10} />{campaign.failed}</span>
            <span className="text-amber-600 flex items-center gap-1"><Clock        size={10} />{campaign.pending}</span>
          </div>
          <span className="font-mono text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-lg">{campaign.progress}</span>
          {campaign.failed > 0 && (
            <button
              onClick={e => { e.stopPropagation(); onRetry(campaign.campaignId); }}
              disabled={retrying === campaign.campaignId}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-red-50 text-red-600 border border-red-200 text-[10px] font-bold rounded-xl hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors disabled:opacity-50"
            >
              {retrying === campaign.campaignId ? <Loader2 size={11} className="animate-spin" /> : <RotateCcw size={11} />}
              Retry Failed
            </button>
          )}
        </div>
      </div>
      {expanded && (
        <div className="border-t border-gray-100 p-4 bg-gray-50/50">
          <div className="grid grid-cols-4 gap-3 mb-3">
            {[
              { label: "Total",   value: d.total,   color: "text-gray-700",  bg: "bg-gray-100" },
              { label: "Sent",    value: d.success, color: "text-green-700", bg: "bg-green-50" },
              { label: "Failed",  value: d.failed,  color: "text-red-600",   bg: "bg-red-50"   },
              { label: "Pending", value: d.pending, color: "text-amber-600", bg: "bg-amber-50" },
            ].map(s => (
              <div key={s.label} className={`${s.bg} rounded-xl p-3 text-center border border-gray-200`}>
                <p className={`text-xl font-extrabold ${s.color}`}>{s.value}</p>
                <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
          <div>
            <div className="flex items-center justify-between text-[10px] font-bold text-gray-500 mb-1">
              <span>Delivery Progress</span>
              <span className="text-green-600">{pct}%</span>
            </div>
            <ProgressBar success={d.success} failed={d.failed} total={d.total} />
          </div>
        </div>
      )}
    </div>
  );
};

// ─── CSV Upload Panel ────────────────────────────────────────────────────────
const CsvUploadPanel = ({ item, sending, onClose }) => {
  const [file, setFile]       = useState(null);
  const [dragging, setDrag]   = useState(false);
  const [busy, setBusy]       = useState(false);
  const inputRef              = useRef();

  const handleDrop = (e) => {
    e.preventDefault(); setDrag(false);
    const f = e.dataTransfer.files[0];
    if (f && (f.name.endsWith(".csv") || f.name.endsWith(".xlsx"))) setFile(f);
    else toast.error("Please upload a .csv or .xlsx file");
  };

  const handleSend = async () => {
    if (!file) { toast.error("Please upload a file first"); return; }
    try {
      setBusy(true);
      const fd = new FormData();
      fd.append("file", file);
      fd.append("templateId", item._id);
      await sentBulkEmailNotification(fd);
      toast.success("Bulk email campaign started! 🚀");
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Bulk send failed");
    } finally { setBusy(false); }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-2.5 px-3 py-2.5 bg-blue-50 border border-blue-200 rounded-xl">
        <FileText size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-blue-700 leading-relaxed">
          Upload a <span className="font-bold">.csv</span> or <span className="font-bold">.xlsx</span> file.
          Template <span className="font-mono bg-blue-100 px-1 rounded">{item.slug}</span> will be sent to each row. Columns must match template variables.
        </p>
      </div>
      <div
        onDragOver={e => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
          dragging || file ? "border-[#27AE60] bg-[#E8F8EF]" : "border-gray-200 bg-gray-50 hover:border-[#27AE60] hover:bg-[#F4FDF8]"
        }`}
      >
        <input ref={inputRef} type="file" accept=".csv,.xlsx" className="hidden" onChange={e => setFile(e.target.files[0])} />
        {file ? (
          <>
            <div className="w-14 h-14 rounded-2xl bg-[#27AE60] flex items-center justify-center">
              <FileSpreadsheet size={28} className="text-white" />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-[#0F5230]">{file.name}</p>
              <p className="text-xs text-[#27AE60] mt-0.5">{(file.size / 1024).toFixed(1)} KB — ready to send</p>
            </div>
            <button type="button" onClick={e => { e.stopPropagation(); setFile(null); }}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors">
              <X size={11} /> Remove
            </button>
          </>
        ) : (
          <>
            <div className="w-14 h-14 rounded-2xl bg-gray-200 flex items-center justify-center">
              <Upload size={28} className="text-gray-400" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-600">Drop your CSV / Excel here</p>
              <p className="text-xs text-gray-400 mt-0.5">or click to browse — .csv, .xlsx supported</p>
            </div>
          </>
        )}
      </div>
      <button
        onClick={handleSend}
        disabled={busy || !file}
        className="w-full py-3 bg-[#27AE60] text-white font-bold text-sm rounded-2xl hover:bg-[#1A7A43] active:scale-[.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        style={{ boxShadow: "0 4px 14px rgba(39,174,96,.3)" }}
      >
        {busy ? <><Loader2 size={16} className="animate-spin" /> Sending…</> : <><Send size={15} />{file ? "Send Bulk Campaign" : "Upload File First"}</>}
      </button>
    </div>
  );
};

// ─── Select Users Panel ──────────────────────────────────────────────────────
const SelectUsersPanel = ({ item, onSend, sending, onClose }) => {
  const [nameSearch, setNameSearch] = useState("");
  const [locality,   setLocality]   = useState("");
  const [stateCode,  setStateCode]  = useState("");
  const [cityName,   setCityName]   = useState("");
  const [users,      setUsers]      = useState([]);
  const [loadingU,   setLoadingU]   = useState(false);
  const [fetched,    setFetched]    = useState(false);
  const [selectedIds,setSelected]  = useState([]);

  const cities = getCitiesByState(stateCode);

  useEffect(() => {
    (async () => {
      try {
        setLoadingU(true);
        const res = await getUserSearch("user");
        setUsers(res?.data?.results || res?.data || []);
        setFetched(true);
      } catch { toast.error("Failed to load users"); }
      finally { setLoadingU(false); }
    })();
  }, []);

  useEffect(() => { setCityName(""); }, [stateCode]);

  const filtered = users.filter(u => {
    const mName  = nameSearch.trim() ? (u.name||"").toLowerCase().includes(nameSearch.toLowerCase()) : true;
    const mLoc   = locality.trim()   ? (u.locality||"").toLowerCase().includes(locality.toLowerCase()) : true;
    const sName  = stateCode ? (IN_STATES.find(s=>s.isoCode===stateCode)?.name||"").toLowerCase() : "";
    const mState = stateCode ? (u.state||"").toLowerCase()===sName : true;
    const mCity  = cityName  ? (u.city||"").toLowerCase()===cityName.toLowerCase() : true;
    return mName && mLoc && mState && mCity;
  });

  const localityOpts = [...new Set(users.map(u=>u.locality).filter(Boolean))];
  const isAll = filtered.length>0 && filtered.every(u=>selectedIds.includes(u._id));
  const toggleUser = id => setSelected(p => p.includes(id) ? p.filter(x=>x!==id) : [...p,id]);
  const toggleAll  = () => {
    const ids = filtered.map(u=>u._id);
    isAll ? setSelected(p=>p.filter(id=>!ids.includes(id))) : setSelected(p=>[...new Set([...p,...ids])]);
  };
  const hasFilters = nameSearch||locality||stateCode||cityName;

  const handleSend = async () => {
    if (!selectedIds.length) { toast.error("Select at least one recipient"); return; }
    if (onSend) onSend({ slug: item.slug, userIds: selectedIds });
    else {
      try { await sentEmailNotification({ slug: item.slug, userIds: selectedIds }); toast.success("Campaign sent!"); onClose(); }
      catch(err) { toast.error(err?.message||"Failed"); }
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Filters */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Filter Recipients</p>
          {hasFilters && (
            <button onClick={()=>{setNameSearch("");setLocality("");setStateCode("");setCityName("");}}
              className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors">
              <X size={11}/> Clear all
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
            <input className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#27AE60] focus:border-transparent placeholder-gray-300 bg-white"
              placeholder="Search by name…" value={nameSearch} onChange={e=>setNameSearch(e.target.value)}/>
          </div>
          <div className="relative">
            <Building2 size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
            <input list="loc-opts" className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#27AE60] focus:border-transparent placeholder-gray-300 bg-white"
              placeholder="Filter by locality…" value={locality} onChange={e=>setLocality(e.target.value)}/>
            <datalist id="loc-opts">{localityOpts.map(l=><option key={l} value={l}/>)}</datalist>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="relative">
            <select className="w-full appearance-none px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#27AE60] bg-white text-gray-700 cursor-pointer pr-8"
              value={stateCode} onChange={e=>setStateCode(e.target.value)}>
              <option value="">All States</option>
              {IN_STATES.map(s=><option key={s.isoCode} value={s.isoCode}>{s.name}</option>)}
            </select>
            <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
          </div>
          <div className="relative">
            <select className="w-full appearance-none px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#27AE60] bg-white text-gray-700 cursor-pointer pr-8 disabled:opacity-40"
              value={cityName} onChange={e=>setCityName(e.target.value)} disabled={!stateCode}>
              <option value="">{stateCode?"All Cities":"Select state first"}</option>
              {cities.map(c=><option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
            <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
          </div>
        </div>
      </div>

      {/* User list */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
            Recipients {fetched && <span className="ml-1.5 font-mono text-[#27AE60]">{filtered.length} found</span>}
          </p>
          {filtered.length>0 && (
            <button onClick={toggleAll} className="text-xs font-semibold text-[#27AE60] hover:text-[#1A7A43] transition-colors">
              {isAll?"Deselect all":"Select all"}
            </button>
          )}
        </div>
        <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
          {loadingU ? (
            <div className="flex items-center justify-center py-10"><Loader2 size={24} className="animate-spin text-[#27AE60]"/></div>
          ) : filtered.length===0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <User size={28} className="text-gray-200"/>
              <p className="text-sm font-semibold text-gray-400">{users.length===0?"No users found":"No users match filters"}</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 max-h-52 overflow-y-auto">
              {filtered.map(u => {
                const sel = selectedIds.includes(u._id);
                return (
                  <div key={u._id} onClick={()=>toggleUser(u._id)}
                    className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors select-none ${sel?"bg-[#E8F8EF]":"hover:bg-gray-50"}`}>
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${sel?"bg-[#27AE60] border-[#27AE60]":"border-gray-300 bg-white"}`}>
                      {sel && <Check size={11} className="text-white" strokeWidth={3}/>}
                    </div>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${sel?"bg-[#27AE60] text-white":"bg-gray-100 text-gray-500"}`}>
                      {(u.name||"?")[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{u.name||"—"}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        {u.phone    && <span className="flex items-center gap-1 text-[10px] text-gray-400"><Phone size={9}/>{u.phone}</span>}
                        {u.locality && <span className="flex items-center gap-1 text-[10px] text-gray-400"><Building2 size={9}/>{u.locality}</span>}
                        {(u.city||u.state) && <span className="flex items-center gap-1 text-[10px] text-gray-400"><MapPin size={9}/>{[u.city,u.state].filter(Boolean).join(", ")}</span>}
                      </div>
                    </div>
                    {u.city && <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg flex-shrink-0 ${sel?"bg-[#C2EDD6] text-[#1A7A43]":"bg-gray-100 text-gray-500"}`}>{u.city}</span>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {selectedIds.length>0 && (
        <div className="flex items-center gap-2 px-3 py-2.5 bg-[#E8F8EF] border border-[#C2EDD6] rounded-xl">
          <Check size={14} className="text-[#27AE60] flex-shrink-0"/>
          <p className="text-sm font-semibold text-[#1A7A43]">{selectedIds.length} user{selectedIds.length>1?"s":""} selected</p>
          <button onClick={()=>setSelected([])} className="ml-auto text-xs text-[#27AE60] hover:text-red-500 transition-colors flex items-center gap-1"><X size={11}/>Clear</button>
        </div>
      )}

      <button onClick={handleSend} disabled={sending||!selectedIds.length}
        className="w-full py-3 bg-[#27AE60] text-white font-bold text-sm rounded-2xl hover:bg-[#1A7A43] active:scale-[.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        style={{boxShadow:"0 4px 14px rgba(39,174,96,.3)"}}>
        {sending ? <><Loader2 size={16} className="animate-spin"/>Sending…</> : <><Send size={15}/>{selectedIds.length>0?`Send to ${selectedIds.length} User${selectedIds.length>1?"s":""}` :"Select Recipients First"}</>}
      </button>
    </div>
  );
};

// ─── Send Campaign Modal ─────────────────────────────────────────────────────
const SEND_TABS = [
  { id: "users", label: "Select Users",    icon: <Users size={13}/> },
  { id: "csv",   label: "Bulk CSV Upload", icon: <FileSpreadsheet size={13}/> },
];

const SendCampaignModal = ({ item, onClose, onSend, sending }) => {
  const [activeTab, setTab] = useState("users");
  return (
    <Modal title="Send Email Campaign" icon={<Send size={16}/>} onClose={onClose}>
      <div className="flex flex-col gap-0">
        {/* Template banner */}
        <div className="flex items-center gap-3 p-3 bg-[#E8F8EF] border border-[#C2EDD6] rounded-xl mb-4">
          <div className="w-9 h-9 rounded-lg bg-[#27AE60] flex items-center justify-center flex-shrink-0"><Send size={16} className="text-white"/></div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-[#1A7A43] uppercase tracking-wide">Template</p>
            <p className="text-sm font-semibold text-[#0F5230] truncate">{item.name}</p>
          </div>
          <span className="font-mono text-xs text-[#27AE60] bg-white border border-[#C2EDD6] px-2 py-0.5 rounded-lg flex-shrink-0">{item.slug}</span>
        </div>
        {/* Tab toggle */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-2xl mb-5">
          {SEND_TABS.map(t => (
            <button key={t.id} onClick={()=>setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${activeTab===t.id?"bg-white text-gray-900 shadow-sm":"text-gray-500 hover:text-gray-700"}`}>
              {t.icon}{t.label}
            </button>
          ))}
        </div>
        {activeTab==="users"
          ? <SelectUsersPanel item={item} onSend={onSend} sending={sending} onClose={onClose}/>
          : <CsvUploadPanel   item={item} sending={sending} onClose={onClose}/>}
      </div>
    </Modal>
  );
};

// ─── Log Row ─────────────────────────────────────────────────────────────────
const LogRow = ({ log }) => (
  <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
    <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
      <Mail size={14} className="text-gray-400"/>
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-gray-800 truncate">{log.to}</p>
      <p className="text-xs text-gray-400 truncate">{log.subject}</p>
    </div>
    <div className="flex items-center gap-2 flex-shrink-0">
      <span className="font-mono text-[10px] text-gray-400 hidden md:block truncate max-w-[140px]">{log.campaignId}</span>
      <StatusBadge status={log.status}/>
      <span className="text-[10px] text-gray-400 hidden lg:block">{fmt(log.createdAt)}</span>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════
// ─── MAIN PAGE ──────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════
const EmailNotifications = () => {
  // ── page tab ──────────────────────────────────────────────────────────────
  const [pageTab, setPageTab] = useState("templates");

  // ── template state ────────────────────────────────────────────────────────
  const [notifications, setNotifications] = useState([]);
  const [loadingTpl,    setLoadingTpl]    = useState(true);
  const [submitting,    setSubmitting]    = useState(false);
  const [deleting,      setDeleting]      = useState(false);
  const [search,        setSearch]        = useState("");
  const [catFilter,     setCatFilter]     = useState("");
  const [statusFilter,  setStatusFilter]  = useState("");
  const [showCreate,    setShowCreate]    = useState(false);
  const [editItem,      setEditItem]      = useState(null);
  const [viewItem,      setViewItem]      = useState(null);
  const [deleteItem,    setDeleteItem]    = useState(null);
  const [sendItem,      setSendItem]      = useState(null);

  // ── logs/campaign state ───────────────────────────────────────────────────
  const [logs,       setLogs]       = useState([]);
  const [emailStats, setEmailStats] = useState(null);
  const [campaigns,  setCampaigns]  = useState([]);
  const [running,    setRunning]    = useState(null);
  const [loadingLogs,setLoadingLogs]= useState(false);
  const [retrying,   setRetrying]   = useState(null);

  // ── fetch templates ───────────────────────────────────────────────────────
  const fetchAll = async () => {
    try {
      setLoadingTpl(true);
      const res  = await getAllEmailNotifications();
      const list = Array.isArray(res?.data?.data) ? res.data.data
                 : Array.isArray(res?.data)        ? res.data : [];
      setNotifications(list);
    } catch { toast.error("Failed to fetch templates"); setNotifications([]); }
    finally  { setLoadingTpl(false); }
  };

  // ── fetch logs + campaigns ────────────────────────────────────────────────
  const fetchLogs = async () => {
    try {
      setLoadingLogs(true);
      const [logsR, statsR, campR, runR] = await Promise.allSettled([
        getSentEmailNotification(),
        getSentEmailNotificationAnalytics(),
        getCanpaingsAnalytics(),
        getRunningCampaigns(),
      ]);
      if (logsR.status==="fulfilled") {
        const d = logsR.value?.data;
        setLogs(Array.isArray(d)?d : Array.isArray(d?.data)?d.data:[]);
      }
      if (statsR.status==="fulfilled") setEmailStats(statsR.value?.data?.data || statsR.value?.data || null);
      if (campR.status==="fulfilled") {
        const d = campR.value?.data;
        setCampaigns(Array.isArray(d)?d : Array.isArray(d?.data)?d.data:[]);
      }
      if (runR.status==="fulfilled") {
        const d = runR.value?.data?.data || runR.value?.data || null;
        setRunning(d?.campaignId ? d : null);
      }
    } catch { toast.error("Failed to load logs"); }
    finally  { setLoadingLogs(false); }
  };

  useEffect(() => { fetchAll(); fetchLogs(); }, []);

  // ── template CRUD ─────────────────────────────────────────────────────────
  const handleCreate = async (payload, onSuccess) => {
    try {
      setSubmitting(true);
      await createEmailNotification(payload);
      toast.success("Template created!"); fetchAll(); onSuccess?.();
    } catch(err) { toast.error(err?.response?.data?.message||"Failed to create"); }
    finally { setSubmitting(false); }
  };

  const handleUpdate = async (id, payload) => {
    try {
      setSubmitting(true);
      await updateEmailNotification(id, payload);
      toast.success("Template updated!"); fetchAll();
    } catch(err) { toast.error(err?.response?.data?.message||"Failed to update"); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id, onSuccess) => {
    try {
      setDeleting(true);
      const res = await deleteEmailNotification(id);
      if (res?.data?.success) { toast.success(res.data.message||"Deleted!"); fetchAll(); onSuccess?.(); }
      else throw new Error(res?.data?.message||"Delete failed");
    } catch(err) { toast.error(err?.response?.data?.message||err?.message||"Failed to delete"); }
    finally { setDeleting(false); }
  };

  const handleSendCampaign = async (payload) => {
    try {
      setSubmitting(true);
      const res = await sentEmailNotification(payload);
      if (res?.data?.success) { toast.success(res.data.message||"Campaign sent 🚀"); fetchLogs(); }
      else throw new Error(res?.data?.message||"Failed");
    } catch(err) { toast.error(err?.response?.data?.message||err?.message||"Failed to send"); }
    finally { setSubmitting(false); }
  };

  const handleRetry = async (campaignId) => {
    try {
      setRetrying(campaignId);
      await resentCanpaingByCampaignId(campaignId);
      toast.success("Retry triggered!"); fetchLogs();
    } catch(err) { toast.error(err?.response?.data?.message||"Retry failed"); }
    finally { setRetrying(null); }
  };

  // ── template helpers ──────────────────────────────────────────────────────
  const openEdit = async (item) => {
    setViewItem(null);
    try {
      const res  = await getEmailNotification(item.slug);
      const data = res?.data?.data || res?.data || item;
      setEditItem(data);
    } catch { setEditItem(item); }
  };

  const openView = async (item) => {
    try {
      const res = await getEmailNotification(item._id);
      setViewItem(res?.data?.data || res?.data || item);
    } catch { setViewItem(item); }
  };

  const filtered = notifications.filter(n => {
    const q = search.toLowerCase();
    return (
      (n.name.toLowerCase().includes(q) || (n.slug||"").toLowerCase().includes(q)) &&
      (catFilter    ? n.category===catFilter    : true) &&
      (statusFilter ? n.status===statusFilter   : true)
    );
  });

  const activeCount = notifications.filter(n=>n.status==="active").length;
  const categories  = [...new Set(notifications.map(n=>n.category))];

  // ── combined stats (shown always on topbar area) ──────────────────────────
  const totalCampaigns = campaigns.length;
  const pendingEmails  = emailStats?.pending ?? 0;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Modals ── */}
      {showCreate && (
        <Modal title="Create New Template" icon={<Mail size={16}/>} wide onClose={()=>setShowCreate(false)}>
          <NotificationForm initial={EMPTY_FORM} onSubmit={p=>handleCreate(p,()=>setShowCreate(false))} submitting={submitting}/>
        </Modal>
      )}
      {editItem && (
        <Modal title="Edit Template" icon={<Edit2 size={16}/>} wide onClose={()=>setEditItem(null)}>
          <NotificationForm initial={editItem} onSubmit={p=>handleUpdate(editItem._id,p)} submitting={submitting}/>
        </Modal>
      )}
      {viewItem   && <ViewModal   item={viewItem}  onClose={()=>setViewItem(null)}  onEdit={()=>openEdit(viewItem)}/>}
      {deleteItem && (
        <DeleteConfirm item={deleteItem} onClose={()=>setDeleteItem(null)}
          onConfirm={()=>handleDelete(deleteItem._id,()=>setDeleteItem(null))} deleting={deleting}/>
      )}
      {sendItem && (
        <SendCampaignModal item={sendItem} onClose={()=>setSendItem(null)} sending={submitting} onSend={handleSendCampaign}/>
      )}

      {/* ── Topbar ── */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 h-16 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-green-600 flex items-center justify-center flex-shrink-0">
            <Mail size={18} className="text-white"/>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">Email Notifications</p>
            <p className="text-xs text-gray-400">Templates · Campaigns · Logs</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={()=>{fetchAll();fetchLogs();}}
            className="flex items-center gap-2 px-3 py-2 border border-gray-200 text-gray-500 text-sm font-bold rounded-xl hover:bg-gray-50 transition-colors">
            <RefreshCw size={13} className={(loadingTpl||loadingLogs)?"animate-spin":""}/>
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button onClick={()=>setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 transition-colors shadow-sm shadow-green-200">
            <Plus size={15}/> <span className="hidden sm:inline">New Template</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-5">

        {/* ── Combined overview stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Templates"  value={notifications.length} icon={<Mail size={18}/>}         bg="bg-blue-50 text-blue-600"/>
          <StatCard label="Active"     value={activeCount}          icon={<Check size={18}/>}        bg="bg-green-50 text-green-600"/>
          <StatCard label="Campaigns"  value={totalCampaigns}       icon={<BarChart2 size={18}/>}    bg="bg-purple-50 text-purple-600"/>
          <StatCard label="Pending"    value={pendingEmails}        icon={<Clock size={18}/>}        bg="bg-amber-50 text-amber-600"/>
        </div>

        {/* ── Running campaign banner (always visible when active) ── */}
        {running && (
          <RunningBanner data={running} onRetry={handleRetry} retrying={!!retrying}/>
        )}

        {/* ── Page Tabs ── */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-2xl w-fit">
          {PAGE_TABS.map(t => (
            <button key={t.id} onClick={()=>setPageTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl transition-all ${pageTab===t.id?"bg-white text-gray-900 shadow-sm":"text-gray-500 hover:text-gray-700"}`}>
              {t.icon}{t.label}
              {t.id==="campaigns" && campaigns.length>0 && (
                <span className="text-[10px] font-bold bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded-full">{campaigns.length}</span>
              )}
              {t.id==="logs" && logs.length>0 && (
                <span className="text-[10px] font-bold bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">{logs.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* ════════════════════════════════════════════ */}
        {/* ── TAB: TEMPLATES ── */}
        {/* ════════════════════════════════════════════ */}
        {pageTab==="templates" && (
          <>
            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              <div className="relative flex-1 min-w-[160px] max-w-xs">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                <input type="text"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-300"
                  placeholder="Search templates…" value={search} onChange={e=>setSearch(e.target.value)}/>
              </div>
              <select className="px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer"
                value={catFilter} onChange={e=>setCatFilter(e.target.value)}>
                <option value="">All Categories</option>
                {categories.map(c=><option key={c} value={c}>{getCatMeta(c).label}</option>)}
              </select>
              <select className="px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer"
                value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}>
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              {(search||catFilter||statusFilter) && (
                <button onClick={()=>{setSearch("");setCatFilter("");setStatusFilter("");}}
                  className="px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors">
                  <X size={13}/>Clear
                </button>
              )}
            </div>

            {loadingTpl && <div className="flex items-center justify-center py-20"><Loader2 size={32} className="animate-spin text-green-500"/></div>}

            {!loadingTpl && filtered.length===0 && (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center">
                  <Mail size={36} className="text-gray-300"/>
                </div>
                <p className="text-sm font-semibold text-gray-400">
                  {notifications.length===0?"No templates yet. Create your first one!":"No templates match your filters."}
                </p>
                {notifications.length===0 && (
                  <button onClick={()=>setShowCreate(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 transition-colors">
                    <Plus size={15}/>Create Template
                  </button>
                )}
              </div>
            )}

            {!loadingTpl && filtered.length>0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filtered.map(item=>(
                  <TemplateCard key={item._id} item={item}
                    onView={openView} onEdit={openEdit} onDelete={setDeleteItem} onSend={setSendItem}/>
                ))}
              </div>
            )}
          </>
        )}

        {/* ════════════════════════════════════════════ */}
        {/* ── TAB: CAMPAIGNS ── */}
        {/* ════════════════════════════════════════════ */}
        {pageTab==="campaigns" && (
          <>
            {/* Email delivery stats */}
            {emailStats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard label="Total Emails" value={emailStats.total??0}   icon={<Mail size={18}/>}         bg="bg-blue-50 text-blue-600"/>
                <StatCard label="Sent"         value={emailStats.success??0} icon={<CheckCircle2 size={18}/>} bg="bg-green-50 text-green-600"/>
                <StatCard label="Failed"       value={emailStats.failed??0}  icon={<AlertCircle size={18}/>}  bg="bg-red-50 text-red-500"/>
                <StatCard label="Pending"      value={emailStats.pending??0} icon={<Clock size={18}/>}        bg="bg-amber-50 text-amber-600"/>
              </div>
            )}

            {loadingLogs && <div className="flex items-center justify-center py-20"><Loader2 size={32} className="animate-spin text-green-500"/></div>}

            {!loadingLogs && campaigns.length===0 && (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center">
                  <BarChart2 size={36} className="text-gray-300"/>
                </div>
                <p className="text-sm font-semibold text-gray-400">No campaigns found</p>
              </div>
            )}

            {!loadingLogs && campaigns.length>0 && (
              <div className="flex flex-col gap-3">
                {campaigns.map(c=>(
                  <CampaignRow key={c.campaignId} campaign={c} onRetry={handleRetry} retrying={retrying}/>
                ))}
              </div>
            )}
          </>
        )}

        {/* ════════════════════════════════════════════ */}
        {/* ── TAB: EMAIL LOGS ── */}
        {/* ════════════════════════════════════════════ */}
        {pageTab==="logs" && (
          <>
            {loadingLogs && <div className="flex items-center justify-center py-20"><Loader2 size={32} className="animate-spin text-green-500"/></div>}

            {!loadingLogs && logs.length===0 && (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center">
                  <Mail size={36} className="text-gray-300"/>
                </div>
                <p className="text-sm font-semibold text-gray-400">No email logs found</p>
              </div>
            )}

            {!loadingLogs && logs.length>0 && (
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                {/* Header */}
                <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 px-4 py-3 border-b border-gray-200 bg-gray-50">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-gray-500">Recipient / Subject</span>
                  <span className="text-[10px] font-bold uppercase tracking-wide text-gray-500 hidden md:block">Campaign ID</span>
                  <span className="text-[10px] font-bold uppercase tracking-wide text-gray-500">Status</span>
                  <span className="text-[10px] font-bold uppercase tracking-wide text-gray-500 hidden lg:block">Time</span>
                </div>
                {logs.map(log=><LogRow key={log._id} log={log}/>)}
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
};

export default EmailNotifications;



