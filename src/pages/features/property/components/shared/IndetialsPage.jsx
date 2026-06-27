// src\pages\features\property\components\shared\IndetialsPage.jsx
import { useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  MapPin,
  ArrowLeft,
  Phone,
  User,
  TrendingUp,
  Eye,
  Star,
  BadgeCheck,
  Layers,
  Clock,
  GripVertical,
  ChevronRight,
  Bed,
  Trees,
  ShieldCheck,
  CreditCard,
  Youtube,
  Download,
  CheckCircle2,
  XCircle,
  Zap,
  BarChart3,
  Navigation,
  AlertCircle,
  Hash,
  MousePointerClick,
  RefreshCw,
  Send,
  PencilLine,
  UserPlus,
  History,
  Building2,
  Users,
  Upload,
  Search,
} from "lucide-react";
import {
  projectAnalytics,
  projectExternalFileAddLeads,
} from "../../../../../features/property/propertyService";
import {
  fetchFeaturedProperties,
} from "../../../../../services/PropertyService";
import { getFeaturedProjectById } from "../../../../../features/property/propertyService";
import LoadingSpinner from "../../../../../components/common/LoadingSpinner";
import Fallback from "../../../../../assets/fallback.svg";
import {
  formatPromotionDate,
  getPromotionTracking,
  promotionLifecycleClass,
  promotionLifecycleCopy,
  titlePromotionType,
} from "./promotionTracking";

// ─── Helpers ─────────────────────────────────────────────────────────────────
// export const formatPrice = (price) =>
//   new Intl.NumberFormat("en-IN", {
//     style: "currency",
//     currency: "INR",
//     maximumFractionDigits: 0,
//   }).format(price);

export const formatPrice = (price) => {
  const num = Number(price);

  if (!num || isNaN(num)) return "N/A";

  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed()} Cr`;
  }

  if (num >= 100000) {
    return `₹${(num / 100000).toFixed()} L`;
  }

  if (num >= 1000) {
    return `₹${(num / 1000).toFixed()} T`;
  }

  return `₹${num}`;
};

const formatDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

const formatDateTime = (iso) =>
  iso
    ? new Date(iso).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const formatTime = (iso) =>
  iso
    ? new Date(iso).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

// const getYouTubeEmbedId = (url) => {
//   if (!url) return null;
//   const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
//   return match ? match[1] : null;
// };/

const getYouTubeEmbedId = (url) => {
  if (!url) return null;

  const regExp =
    /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?v=)|(\&v=))([^#\&\?]*).*/;

  const match = url.match(regExp);

  return match && match[8].length === 11 ? match[8] : null;
};

const nearbyTypeLabel = {
  supermarket: "Supermarket",
  restaurant: "Restaurant",
  educational_institution: "School / College",
  hospital: "Hospital",
  station: "Station",
  primary: "Road",
  secondary: "Road",
  residential: "Residential Area",
  apartments: "Mall / Apartments",
  yes: "Landmark",
};

const promotionColor = {
  featured: "bg-amber-100 text-amber-700 border-amber-200",
  prime: "bg-purple-100 text-purple-700 border-purple-200",
  normal: "bg-slate-100 text-slate-600 border-slate-200",
};

const leadStatusClass = (status = "") => {
  const normalized = String(status).toLowerCase();
  if (normalized.includes("new")) return "bg-emerald-50 text-emerald-700 border-emerald-100";
  if (normalized.includes("contact")) return "bg-blue-50 text-blue-700 border-blue-100";
  if (normalized.includes("convert") || normalized.includes("closed")) {
    return "bg-purple-50 text-purple-700 border-purple-100";
  }
  return "bg-slate-50 text-slate-600 border-slate-100";
};

const formatLeadText = (value) => {
  if (value === null || value === undefined || value === "") return "-";
  return String(value)
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatRoleName = (role) => {
  const roles = {
    sales_agent: "Sales Executive",
  };

  return roles[role] || role?.replace(/_/g, " ");
};

const formatLeadDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getLeadSearchText = (lead) =>
  [
    lead.name,
    lead.phone,
    lead.email,
    lead.sourceCreatedAt,
    lead.createdAt,
    lead.purchaseTimeline,
    lead.budgetRange,
    lead.status,
  ]
    .map((value) => formatLeadText(value))
    .join(" ")
    .toLowerCase();

// ─── Sub-components ───────────────────────────────────────────────────────────
function SectionCard({ children, className = "" }) {
  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden ${className}`}
    >
      {children}
    </div>
  );
}

function SectionHeader({ icon: Icon, title, sub }) {
  return (
    <div className="flex items-center gap-3 p-5 border-b border-slate-50">
      <div className="p-2 rounded-xl bg-[#27AE60]/10">
        <Icon className="w-4 h-4 text-[#27AE60]" />
      </div>
      <div>
        <h2 className="text-sm font-bold text-slate-700">{title}</h2>
        {sub && <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color = "green", sub }) {
  const ring = {
    green: "bg-green-50 text-[#27AE60] border-green-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
  };
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center border ${ring[color]}`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-extrabold text-slate-800">{value}</p>
        <p className="text-xs text-slate-400 mt-0.5 font-medium">{label}</p>
        {sub && <p className="text-[10px] text-slate-300 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function MetaItem({ label, value }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
        {label}
      </p>
      <p className="text-sm font-bold text-slate-700 mt-1 capitalize">
        {String(value)}
      </p>
    </div>
  );
}

function LeadRow({ lead }) {
  return (
    <tr className="border-b border-slate-50 hover:bg-slate-50/70 transition-colors">
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#27AE60]/10 flex items-center justify-center flex-shrink-0">
            <User className="w-3.5 h-3.5 text-[#27AE60]" />
          </div>
          <span className="truncate text-sm font-semibold text-slate-800">
            {lead.name || "-"}
          </span>
        </div>
      </td>
      <td className="px-3 py-2.5">
        <a href={`tel:${lead.phone}`} className="flex items-center gap-1.5 whitespace-nowrap text-xs font-medium text-slate-600">
          <Phone className="w-3.5 h-3.5 text-[#27AE60] flex-shrink-0" />
          {lead.phone || "-"}
        </a>
      </td>
      <td className="px-3 py-2.5 text-xs text-slate-600">
        <span className="block truncate">{lead.email || "-"}</span>
      </td>
      <td className="px-3 py-2.5 text-xs text-slate-500 whitespace-nowrap">
        {formatLeadDateTime(lead.sourceCreatedAt || lead.createdAt)}
      </td>
      <td className="px-3 py-2.5 text-xs font-medium text-slate-700">
        {formatLeadText(lead.purchaseTimeline)}
      </td>
      <td className="px-3 py-2.5">
        <span className="inline-flex max-w-full rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
          {formatLeadText(lead.budgetRange)}
        </span>
      </td>
      <td className="px-3 py-2.5">
        <span
          className={`inline-flex max-w-full rounded-full border px-2 py-0.5 text-[11px] font-bold ${leadStatusClass(lead.status)}`}
        >
          {formatLeadText(lead.status)}
        </span>
      </td>
    </tr>
  );
}

// ─── PersonCard (horizontal, 3-up) ────────────────────────────────────────────
function PersonCard({ type, person, postedAt, role }) {
  const config = {
    created: {
      label: "Created By",
      icon: UserPlus,
      headerBg: "bg-green-50",
      headerText: "text-[#27AE60]",
      badgeCls: "bg-green-50 text-green-700 border-green-100",
      dotBg: "bg-[#27AE60]/10",
      dotText: "text-[#27AE60]",
    },
    posted: {
      label: "Posted By",
      icon: Send,
      headerBg: "bg-blue-50",
      headerText: "text-blue-700",
      badgeCls: "bg-blue-50 text-blue-700 border-blue-100",
      dotBg: "bg-blue-50",
      dotText: "text-blue-600",
    },
    updated: {
      label: "Last Updated By",
      icon: PencilLine,
      headerBg: "bg-amber-50",
      headerText: "text-amber-700",
      badgeCls: "bg-amber-50 text-amber-700 border-amber-100",
      dotBg: "bg-amber-50",
      dotText: "text-amber-600",
    },
  };

  const c = config[type];
  const Icon = c.icon;
  const name = person?.name || "—";
  const email = person?.email || person?.email || "—";
  const phone = person?.phone;
  const idTail = (person?._id || person?.userId || "")?.slice(-4);
  const timestamp = postedAt || person?.updatedAt || person?.createdAt;
  const displayRole = role || person?.roleName;

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
      {/* Header stripe */}
      <div
        className={`flex items-center gap-2 px-4 py-2.5 border-b border-slate-100 ${c.headerBg}`}
      >
        <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${c.headerText}`} />
        <span
          className={`text-[10px] font-bold uppercase tracking-widest ${c.headerText}`}
        >
          {c.label}
        </span>
      </div>

      {/* Body */}
      <div className="p-4 flex-1 flex flex-col gap-2">
        {/* Avatar + name */}
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-lg ${c.dotBg} flex items-center justify-center flex-shrink-0`}
          >
            <User className={`w-4 h-4 ${c.dotText}`} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-800 leading-tight truncate">
              {name}
            </p>
            {idTail && (
              <p className="text-[9px] text-slate-400 font-mono">
                ID: ...{idTail}
              </p>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
          <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider mb-0.5">
            Email
          </p>
          <p className="text-[11px] font-semibold text-slate-700 truncate">
            {email}
          </p>
        </div>

        {/* Phone (created by only) */}
        {phone && (
          <div className="bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
            <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider mb-0.5">
              Phone
            </p>
            <p className="text-[11px] font-semibold text-slate-700">{phone}</p>
          </div>
        )}

        {/* Location (created by) */}
        {(person?.city || person?.state) && (
          <div className="bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
            <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider mb-0.5">
              Location
            </p>
            <p className="text-[11px] font-semibold text-slate-700">
              {[person?.locality, person?.city, person?.state]
                .filter(Boolean)
                .join(", ")}
              {person?.pincode && (
                <span className="text-slate-400"> — {person.pincode}</span>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
        {displayRole && (
          <span
            className={`text-[9px] font-bold px-2 py-1 rounded-full border capitalize ${c.badgeCls}`}
          >
            {formatRoleName(displayRole)}
          </span>
        )}
        {timestamp && (
          <span className="text-[9px] text-slate-400 ml-auto whitespace-nowrap">
            {formatDate(timestamp)} · {formatTime(timestamp)}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── PromotionHorizontal ──────────────────────────────────────────────────────
function PromotionHorizontal({ promotion }) {
  if (!promotion || promotion.type === "normal") return null;
  const cells = [
    { label: "Type", value: promotion.type, highlight: true },
    { label: "Priority", value: promotion.priority ?? 0 },
    { label: "Source", value: promotion.source },
    { label: "Start Date", value: formatDate(promotion.startDate) },
    { label: "Boost Expiry", value: formatDate(promotion.boostExpiry), warn: true },
    {
      label: "Enquiry Limit",
      value: promotion.enquiryLimit ? promotion.enquiryLimit : "Unlimited",
    },
    { label: "Enquiries Used", value: promotion.enquiriesUsed ?? 0 },
  ];

  return (
    <SectionCard>
      <div className="flex items-center gap-3 px-5 py-3 border-b border-slate-50">
        <div className="p-2 rounded-xl bg-amber-50">
          <Zap className="w-4 h-4 text-amber-600" />
        </div>
        <h2 className="text-sm font-bold text-slate-700">Promotion Details</h2>
        <span className="ml-1 text-[10px] font-bold px-2.5 py-1 rounded-full border bg-purple-50 text-purple-700 border-purple-100 capitalize">
          ★ {promotion.type}
        </span>
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border bg-green-50 text-green-700 border-green-100">
          Active
        </span>
      </div>
      <div className="grid grid-cols-7 divide-x divide-slate-100">
        {cells.map((cell, i) => (
          <div key={i} className="px-4 py-3">
            <p className="text-[9px] font-semibold uppercase tracking-widest text-slate-400 mb-1.5">
              {cell.label}
            </p>
            <p
              className={`text-[13px] font-bold capitalize ${
                cell.highlight
                  ? "text-purple-700"
                  : cell.warn
                  ? "text-amber-600"
                  : "text-slate-700"
              }`}
            >
              {String(cell.value)}
            </p>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

// ─── UpdateHistoryTimeline ────────────────────────────────────────────────────
function UpdateHistoryTimeline({ history, updateCount }) {
  if (!Array.isArray(history) || history.length === 0) return null;
  return (
    <SectionCard>
      <div className="flex items-center gap-3 px-5 py-3 border-b border-slate-50 ">
        <div className="p-2 rounded-xl bg-slate-100">
          <History className="w-4 h-4 text-slate-500" />
        </div>
        <h2 className="text-sm font-bold text-slate-700">Update History</h2>
        <span className="ml-auto text-[10px] font-semibold bg-slate-100 text-slate-500 border border-slate-200 px-2.5 py-1 rounded-full">
          {updateCount ?? history.length} updates
        </span>
      </div>
      <div className="p-5 overflow-x-auto custom-scrollbar w-[1000px]">
        <div className="flex items-start gap-0 min-w-max ">
          {history.map((h, i) => {
            const isLast = i === history.length - 1;
            return (
              <div key={h._id || i} className="flex items-start">
                {/* Step */}
                <div className="flex flex-col items-center w-40">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border flex-shrink-0 z-10 ${
                      isLast
                        ? "bg-[#27AE60] text-white border-green-400"
                        : "bg-white text-slate-500 border-slate-200"
                    }`}
                  >
                    {i + 1}
                  </div>
                  <div className="mt-2 text-center px-2">
                    <p className="text-[11px] font-semibold text-slate-700 leading-tight">
                      {h.name?.split(" ")[0]} {h.name?.split(" ")[1] ?? ""}
                    </p>
                    <p className="text-[9px] text-slate-400 mt-0.5 capitalize">
                      {formatRoleName(h.roleName)}
                    </p>
                    <p className="text-[9px] text-slate-400 mt-1 font-mono">
                      {formatDate(h.updatedAt)}
                    </p>
                    <p className="text-[9px] text-slate-400 font-mono">
                      {formatTime(h.updatedAt)}
                    </p>
                    {isLast && (
                      <span className="inline-block mt-1 text-[8px] font-bold bg-green-50 text-green-700 border border-green-100 px-1.5 py-0.5 rounded-full">
                        Latest
                      </span>
                    )}
                  </div>
                </div>

                {/* Connector */}
                {!isLast && (
                  <div className="flex items-center mt-3.5 flex-shrink-0">
                    <div className="w-12 h-px bg-slate-200" />
                    <ChevronRight className="w-3 h-3 text-slate-300 -ml-1" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </SectionCard>
  );
}

// ─── RecordMeta ───────────────────────────────────────────────────────────────
function RecordMeta({ property }) {
  return (
    <SectionCard>
      <SectionHeader icon={Clock} title="Record Info" />
      <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 col-span-2 sm:col-span-1">
          <p className="text-[9px] font-semibold uppercase tracking-widest text-slate-400 mb-1">
            Property ID
          </p>
          <p className="font-mono text-[11px] text-slate-500 break-all">
            {property._id}
          </p>
        </div>
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
          <p className="text-[9px] font-semibold uppercase tracking-widest text-slate-400 mb-1">
            Slug
          </p>
          <p className="text-[11px] font-semibold text-slate-600 break-all">
            {property.slug}
          </p>
        </div>
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
          <p className="text-[9px] font-semibold uppercase tracking-widest text-slate-400 mb-1">
            Created At
          </p>
          <p className="text-sm font-bold text-slate-700">
            {formatDate(property.createdAt)}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {formatTime(property.createdAt)}
          </p>
        </div>
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
          <p className="text-[9px] font-semibold uppercase tracking-widest text-slate-400 mb-1">
            Last Updated
          </p>
          <p className="text-sm font-bold text-slate-700">
            {formatDate(property.updatedAt)}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {formatTime(property.updatedAt)}
          </p>
        </div>
      </div>
    </SectionCard>
  );
}

// ─── LeadsSection ─────────────────────────────────────────────────────────────
function LeadsSection({
  leads,
  totalLeads,
  newLeads,
  contactedLeads,
  analyticsError,
  projectId,
}) {
  const [activeTab, setActiveTab] = useState("leads");
  const [leadSearch, setLeadSearch] = useState("");
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();
  const leadSearchTerm = leadSearch.trim().toLowerCase();
  const filteredLeads = leadSearchTerm
    ? leads.filter((lead) => getLeadSearchText(lead).includes(leadSearchTerm))
    : leads;

  const buildLeadRows = (rows) =>
    rows.map((lead) => ({
      "Full Name": lead.name || "",
      "Phone Number": lead.phone || "",
      Email: lead.email || "",
      "Lead Time": formatLeadDateTime(lead.sourceCreatedAt || lead.createdAt),
      "Planning To Purchase": formatLeadText(lead.purchaseTimeline),
      "Budget Range": formatLeadText(lead.budgetRange),
      Status: formatLeadText(lead.status),
    }));

  const downloadCSV = () => {
    const ws = XLSX.utils.json_to_sheet(buildLeadRows(filteredLeads));
    const csv = XLSX.utils.sheet_to_csv(ws);
    saveAs(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
      `project-leads-${projectId}.csv`,
    );
  };

  const downloadExcel = () => {
    const ws = XLSX.utils.json_to_sheet(buildLeadRows(filteredLeads));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Project Leads");
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([buf], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
      }),
      `project-leads-${projectId}.xlsx`,
    );
  };

  const importLeadsMutation = useMutation({
    mutationFn: (file) => {
      const formData = new FormData();
      formData.append("file", file);
      return projectExternalFileAddLeads(projectId, formData);
    },
    onSuccess: async () => {
      toast.success("Leads imported successfully");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["projectAnalytics", projectId] }),
        queryClient.invalidateQueries({ queryKey: ["projectLeads", projectId] }),
        queryClient.invalidateQueries({ queryKey: ["project-analytics"] }),
        queryClient.invalidateQueries({ queryKey: ["master-project-analytics"] }),
      ]);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to import leads");
    },
    onSettled: () => {
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
  });

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    importLeadsMutation.mutate(file);
  };

  const tabs = [
    { key: "leads", label: `Leads (${totalLeads})` },
    { key: "analytics", label: "Analytics" },
    
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Tab bar */}
      <div className="flex overflow-x-auto border-b border-slate-100">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-shrink-0 px-5 py-3.5 text-sm font-semibold transition-all border-b-2 ${
              activeTab === tab.key
                ? "border-[#27AE60] text-[#27AE60] bg-green-50/40"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-4 sm:p-5">
        {/* Leads tab */}
        {activeTab === "leads" && (
          <div>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-bold text-slate-700">Project leads</p>
                <p className="text-xs text-slate-400">
                  Import an external CSV or Excel file, then review the latest leads here.
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xls,.xlsx"
                className="hidden"
                onChange={handleImportFile}
              />
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={importLeadsMutation.isPending || !projectId}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Upload className="h-3.5 w-3.5" />
                  {importLeadsMutation.isPending ? "Importing..." : "Import leads"}
                </button>
                <button
                  type="button"
                  onClick={downloadCSV}
                  disabled={!filteredLeads.length}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-green-100 bg-green-50 px-3 py-2 text-xs font-bold text-[#27AE60] transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Download className="h-3.5 w-3.5" />
                  CSV
                </button>
                <button
                  type="button"
                  onClick={downloadExcel}
                  disabled={!filteredLeads.length}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-600 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Download className="h-3.5 w-3.5" />
                  Excel
                </button>
              </div>
            </div>

            <div className="mb-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <Search className="h-4 w-4 flex-shrink-0 text-slate-400" />
              <input
                value={leadSearch}
                onChange={(e) => setLeadSearch(e.target.value)}
                placeholder="Search name, phone, email, status..."
                className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
              />
              {leadSearch && (
                <button
                  type="button"
                  onClick={() => setLeadSearch("")}
                  className="rounded-md px-2 py-1 text-xs font-semibold text-slate-400 hover:bg-white hover:text-slate-700"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Mini stats */}
            <div className="mb-4 flex flex-wrap gap-2">
              {[
                { label: "Total", value: totalLeads, color: "text-slate-800" },
                { label: "New", value: newLeads, color: "text-[#27AE60]" },
                { label: "Contacted", value: contactedLeads, color: "text-blue-600" },
                {
                  label: "Converted",
                  value: leads.filter((l) => {
                    const status = String(l.status || "").toLowerCase();
                    return status.includes("converted") || status.includes("closed");
                  }).length,
                  color: "text-purple-600",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="min-w-[70px] rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-center"
                >
                  <p className={`text-lg font-extrabold ${s.color}`}>{s.value}</p>
                  <p className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold mt-0.5">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>

            {analyticsError && (
              <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 rounded-xl p-3 mb-4 border border-red-100">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                Failed to load leads data.
              </div>
            )}

            {leads.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 gap-3 text-slate-400">
                <Users className="w-10 h-10 opacity-20" />
                <p className="text-sm font-medium">No leads yet for this project</p>
                <p className="text-xs text-slate-300">
                  Leads will appear here once enquiries come in
                </p>
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-400">
                No leads match your search.
              </div>
            ) : (
              <>
                <div className="overflow-hidden rounded-xl border border-slate-100">
                  <div className="max-h-[460px] overflow-auto">
                  <table className="w-full min-w-[980px] table-fixed text-left">
                    <thead>
                      <tr className="sticky top-0 z-10 bg-slate-50 border-b border-slate-100">
                        <th className="w-[16%] px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">Full Name</th>
                        <th className="w-[13%] px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">Phone Number</th>
                        <th className="w-[20%] px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">Email</th>
                        <th className="w-[15%] px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">Lead Time</th>
                        <th className="w-[14%] px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">Planning</th>
                        <th className="w-[11%] px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">Budget</th>
                        <th className="w-[11%] px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLeads.map((lead, i) => (
                        <LeadRow key={lead._id || i} lead={lead} />
                      ))}
                    </tbody>
                  </table>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-400 px-1">
                  <span>
                    Showing:{" "}
                    <span className="font-bold text-slate-600">{filteredLeads.length}</span>
                  </span>
                  <div className="flex gap-4">
                    <span>
                      New:{" "}
                      <span className="font-bold text-green-600">{newLeads}</span>
                    </span>
                    <span>
                      Contacted:{" "}
                      <span className="font-bold text-blue-600">{contactedLeads}</span>
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Analytics tab */}
        {activeTab === "analytics" && (
          <div className="grid grid-cols-3 gap-4">
            {[
              {
                label: "Views",
                value: 5,
                pct: 30,
                color: "bg-[#27AE60]",
                icon: Eye,
              },
              {
                label: "Clicks",
                value: 0,
                pct: 0,
                color: "bg-blue-500",
                icon: MousePointerClick,
              },
              {
                label: "Inquiries",
                value: 0,
                pct: 0,
                color: "bg-amber-500",
                icon: BarChart3,
              },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.label}
                  className="bg-slate-50 rounded-xl border border-slate-100 p-4"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className="w-4 h-4 text-slate-400" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      {s.label}
                    </span>
                  </div>
                  <p className="text-2xl font-extrabold text-slate-800">{s.value}</p>
                  <div className="mt-3 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${s.color}`}
                      style={{ width: `${s.pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Related tab */}
        {activeTab === "related" && (
          <div className="flex flex-col items-center justify-center py-14 gap-3 text-slate-400">
            <Building2 className="w-10 h-10 opacity-20" />
            <p className="text-sm font-medium">No related projects linked</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function FeaturedPropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");

  const { data: listData, isLoading: listLoading } = useQuery({
    queryKey: ["getFeaturedProjectById", id],
    queryFn: () => getFeaturedProjectById(id),
    enabled: !!id,
  });


  

  const property = listData?.data?.data || null;
  
  

  const {
    data: analyticsData,
    isLoading: analyticsLoading,
    isError: analyticsError,
  } = useQuery({
    queryKey: ["projectAnalytics", id],
    queryFn: () => projectAnalytics(id),
    enabled: !!id,
  });

  if (listLoading || analyticsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <XCircle className="w-12 h-12 text-red-300" />
        <p className="text-slate-600 font-medium">Property not found.</p>
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-[#27AE60] underline underline-offset-2"
        >
          Go back
        </button>
      </div>
    );
  }

  // Derived
  const isLand = property.categoryType === "land";
  const images = [
    ...(property.heroImage ? [{ url: property.heroImage, title: "Hero" }] : []),
    ...(property.gallerySummary || []),
  ];
  const displayImage = images[activeImage]?.url || Fallback;

  const priceFrom =
    typeof property.priceFrom === "number" ? formatPrice(property.priceFrom) : "N/A";
  const priceTo =
    typeof property.priceTo === "number" ? formatPrice(property.priceTo) : "N/A";
  const status = property.status === "active" ? "Active" : "Inactive";
  const promotionType = property.promotion?.type || "normal";

  const extractLeads = (raw) => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw.data)) return raw.data;
    if (raw.data && typeof raw.data === "object") return extractLeads(raw.data);
    if (Array.isArray(raw.items)) return raw.items;
    if (Array.isArray(raw.leads)) return raw.leads;
    return [];
  };
  const leads = extractLeads(analyticsData)
    .slice()
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  const totalLeads =
    typeof analyticsData?.data?.count === "number"
      ? analyticsData.data.count
      : typeof analyticsData?.count === "number"
        ? analyticsData.count
        : leads.length;
  const newLeads = leads.filter((l) =>
    String(l.status || "").toLowerCase().includes("new"),
  ).length;
  const contactedLeads = leads.filter((l) =>
    String(l.status || "").toLowerCase().includes("contact"),
  ).length;
  const views = property.meta?.views ?? 0;

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "units", label: isLand ? "Plots" : "Units" },
    { key: "amenities", label: "Amenities" },
    { key: "nearby", label: "Nearby" },
    { key: "specs", label: "Specifications" },
    { key: "promotion", label: "Promotion History" },
  ];

  return (
    <div className="space-y-5 pb-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-slate-500 flex-wrap">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-[#27AE60] hover:text-green-700 font-semibold transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Projects
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <span className="text-slate-700 font-medium line-clamp-1 max-w-xs">
          {property.title || "Property Details"}
        </span>
      </div>

      {/* ── TOP STATS ROW ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={Eye} label="Page Views" value={views} color="green" />
        <StatCard
          icon={MousePointerClick}
          label="Clicks"
          value={property.meta?.clicks ?? 0}
          color="blue"
        />
        <StatCard
          icon={TrendingUp}
          label="Inquiries"
          value={property.meta?.inquiries ?? 0}
          color="orange"
        />
        <StatCard
          icon={RefreshCw}
          label="Update Count"
          value={property.updateCount ?? 0}
          color="purple"
        />
      </div>

      {/* ── HERO PANEL ────────────────────────────────────────────────── */}
      <SectionCard>
        <div className="grid grid-cols-1 lg:grid-cols-5">
          {/* Image column */}
          <div className="lg:col-span-2 relative">
            <div className="h-64 sm:h-80 lg:h-full min-h-[100px] max-h-[400px] bg-slate-100 relative overflow-hidden">
              <img
                src={displayImage}
                alt={property.title}
                className="w-full h-full object-cover transition-all duration-500"
                onError={(e) => {
                  e.target.src = Fallback;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
                <span
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-full shadow ${
                    status === "Active"
                      ? "bg-[#27AE60] text-white"
                      : "bg-red-500 text-white"
                  }`}
                >
                  {status}
                </span>
                {promotionType !== "normal" && (
                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-full border capitalize ${promotionColor[promotionType]}`}
                  >
                    ★ {promotionType}
                  </span>
                )}
              </div>
              {property.rank != null && (
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-[#27AE60] text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
                  <GripVertical className="w-3 h-3" />#{property.rank}
                </div>
              )}
              {property.logo?.url && (
                <div className="absolute bottom-3 left-3 w-10 h-10 rounded-xl overflow-hidden bg-white shadow border">
                  <img
                    src={property.logo.url}
                    alt="logo"
                    className="w-full h-full object-contain p-1"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto bg-slate-50 border-t">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`flex-shrink-0 w-14 h-10 rounded-lg overflow-hidden border-2 transition-all ${
                      activeImage === i
                        ? "border-[#27AE60] scale-105"
                        : "border-transparent opacity-60 hover:opacity-90"
                    }`}
                  >
                    <img
                      src={img.url}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = Fallback;
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Meta column */}
          <div className="lg:col-span-3 p-6 flex flex-col gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 leading-tight">
                {property.title || "Untitled Project"}
              </h1>
              <div className="flex items-start gap-1.5 text-sm text-slate-500 mt-2">
                <MapPin className="w-4 h-4 text-[#27AE60] flex-shrink-0 mt-0.5" />
                <span>
                  {[
                    property.address,
                    property.locality,
                    property.city,
                    property.state,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-100">
              <p className="text-[11px] font-bold text-[#27AE60] uppercase tracking-widest">
                Price Range
              </p>
              <p className="text-2xl font-extrabold text-[#27AE60] mt-1">
                {priceFrom}{" "}
                <span className="text-slate-300 font-normal text-xl">–</span>{" "}
                {priceTo}
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <MetaItem
                label="Property Type"
                value={property.propertyType?.replace(/-/g, " ")}
              />
              <MetaItem label="Category" value={property.categoryType} />
              <MetaItem label="Total Units" value={property.totalUnits} />
              <MetaItem
                label="Available Units"
                value={property.availableUnits}
              />
              {property.totalTowers > 0 && (
                <MetaItem label="Towers" value={property.totalTowers} />
              )}
              {property.totalFloors && (
                <MetaItem label="Floors" value={property.totalFloors} />
              )}
              {property.projectArea && (
                <MetaItem
                  label="Project Area (acres)"
                  value={property.projectArea}
                />
              )}
              <MetaItem
                label="Possession"
                value={formatDate(property.possessionDate)}
              />
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              {property.reraNumber && (
                <div className="flex items-center gap-1.5 text-xs bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1.5 rounded-full font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  RERA: {property.reraNumber}
                </div>
              )}
              {property.slug && (
                <div className="flex items-center gap-1.5 text-xs bg-slate-50 text-slate-500 border px-3 py-1.5 rounded-full">
                  <Hash className="w-3 h-3" />
                  {property.slug}
                </div>
              )}
            </div>
            {Array.isArray(property.banksApproved) &&
              property.banksApproved.length > 0 && (
                <div>
                  <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <CreditCard className="w-3 h-3" /> Banks Approved
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {property.banksApproved.map((b, i) => (
                      <span
                        key={i}
                        className="text-[11px] font-semibold bg-white border border-slate-200 text-slate-600 px-2.5 py-1 rounded-lg shadow-sm"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            <div className="flex gap-3 mt-auto pt-1">
              <button
                onClick={() => navigate(`/post-property/${property._id}`)}
                className="flex-1 text-sm font-bold py-2.5 rounded-xl bg-[#27AE60] text-white hover:bg-green-700 transition shadow"
              >
                Edit Property
              </button>
              {property.brochure?.url && (
                <a
                  href={property.brochure.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-sm font-semibold hover:bg-slate-200 transition"
                >
                  <Download className="w-4 h-4" />
                  Brochure
                </a>
              )}
            </div>
          </div>
        </div>
      </SectionCard>

      {/* ── PEOPLE ROW: Created By | Posted By | Last Updated By ──────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {property.createdBy && (
          <PersonCard type="created" person={property.createdBy} />
        )}
        {property.postedBy && (
          <PersonCard
            type="posted"
            person={{
              _id: property.postedBy.userId,
              userId: property.postedBy.userId,
              name: property.postedBy.name,
              email: property.postedBy.email,
              roleName: property.postedBy.roleName,
            }}
            postedAt={property.postedBy.postedAt}
            role={property.postedBy.roleName}
          />
        )}
        {property.lastUpdatedBy && (
          <PersonCard
            type="updated"
            person={{
              _id: property.lastUpdatedBy.userId,
              userId: property.lastUpdatedBy.userId,
              name: property.lastUpdatedBy.name,
              email: property.lastUpdatedBy.email,
              roleName: property.lastUpdatedBy.roleName,
              updatedAt: property.lastUpdatedBy.updatedAt,
            }}
            role={property.lastUpdatedBy.roleName}
          />
        )}
      </div>

      {/* ── PROMOTION DETAILS (horizontal) ───────────────────────────── */}
      <PromotionHorizontal promotion={property.promotion} />

      {/* ── UPDATE HISTORY TIMELINE ───────────────────────────────────── */}
      <UpdateHistoryTimeline
        history={property.updateHistory}
        updateCount={property.updateCount}
      />

      {/* ── TABBED CONTENT SECTION ────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex overflow-x-auto border-b border-slate-100">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-shrink-0 px-5 py-3.5 text-sm font-semibold transition-all border-b-2 ${
                activeTab === tab.key
                  ? "border-[#27AE60] text-[#27AE60] bg-green-50/40"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {/* Overview */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {Array.isArray(property.aboutSummary) &&
                property.aboutSummary.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-slate-600 mb-3 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-[#27AE60]" />
                      About This Project
                    </h3>
                    {property.aboutSummary.map((ab, i) => (
                      <div
                        key={i}
                        className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4"
                      >
                        {ab.url && (
                          <img
                            src={ab.url}
                            alt="about"
                            className="w-full h-44 object-cover rounded-xl border border-slate-100"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        )}
                        <div>
                          {ab.aboutDescription && (
                            <p className="text-sm text-slate-600 leading-relaxed">
                              {ab.aboutDescription}
                            </p>
                          )}
                          {ab.rightContent && (
                            <div
                              className="text-sm text-slate-600 leading-relaxed mt-2 prose prose-sm max-w-none"
                              dangerouslySetInnerHTML={{
                                __html: ab.rightContent || "",
                              }}
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              {(property.heroTagline || property.heroDescription) && (
                <div className="bg-green-50 border border-green-100 rounded-xl p-4 space-y-1">
                  {property.heroTagline && (
                    <p className="text-sm font-bold text-[#27AE60]">
                      {property.heroTagline}
                    </p>
                  )}
                  {property.heroSubTagline && (
                    <p className="text-xs text-slate-500">
                      {property.heroSubTagline}
                    </p>
                  )}
                  {property.heroDescription && (
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {property.heroDescription}
                    </p>
                  )}
                </div>
              )}
              {Array.isArray(property.youtubeVideos) &&
                property.youtubeVideos.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-slate-600 mb-3 flex items-center gap-2">
                      <Youtube className="w-4 h-4 text-red-500" />
                      Videos
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {property.youtubeVideos.map((v, i) => {
                        const vid = getYouTubeEmbedId(v.url);
                        return vid ? (
                          <div
                            key={i}
                            className="rounded-xl overflow-hidden border border-slate-100 shadow-sm"
                          >
                            <iframe
                              src={`https://www.youtube.com/embed/${vid}`}
                              title={v.title || "Video"}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              className="w-full h-44"
                            />
                            {v.title && (
                              <p className="text-xs text-slate-600 font-semibold px-3 py-2 bg-slate-50">
                                {v.title}
                              </p>
                            )}
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
            </div>
          )}

          {/* Units */}
          {activeTab === "units" && (
            <div className="space-y-4">
              {Array.isArray(property.projectSummary) &&
              property.projectSummary.length > 0 ? (
                property.projectSummary.map((group, gi) => (
                  <div
                    key={gi}
                    className="border border-slate-100 rounded-2xl overflow-hidden"
                  >
                    <div className="bg-green-50 px-4 py-3 border-b border-green-100 flex items-center gap-2">
                      {isLand ? (
                        <Trees className="w-4 h-4 text-[#27AE60]" />
                      ) : (
                        <Bed className="w-4 h-4 text-[#27AE60]" />
                      )}
                      <span className="text-sm font-bold text-[#27AE60]">
                        {group.label ||
                          (group.bhk > 0 ? `${group.bhk} BHK` : "Plot")}
                      </span>
                    </div>
                    <div className="divide-y divide-slate-50">
                      {(group.units || []).map((unit, ui) => (
                        <div
                          key={ui}
                          className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 items-start"
                        >
                          {unit.plan?.url && (
                            <div className="sm:row-span-2">
                              <img
                                src={unit.plan.url}
                                alt="Floor plan"
                                className="w-full h-36 object-cover rounded-xl border border-slate-100"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              />
                            </div>
                          )}
                          <div className="grid grid-cols-2 gap-2 col-span-1 lg:col-span-2">
                            {isLand ? (
                              <>
                                {unit.area?.value > 0 && (
                                  <MetaItem
                                    label="Area"
                                    value={`${unit.area.value} ${unit.area.unit} (${unit.area.sqftValue?.toLocaleString()} sq.ft)`}
                                  />
                                )}
                                <MetaItem
                                  label="Min Price"
                                  value={
                                    unit.minPrice
                                      ? formatPrice(unit.minPrice)
                                      : "N/A"
                                  }
                                />
                                <MetaItem
                                  label="Max Price"
                                  value={
                                    unit.maxPrice
                                      ? formatPrice(unit.maxPrice)
                                      : "N/A"
                                  }
                                />
                                <MetaItem
                                  label="Available"
                                  value={unit.availableCount}
                                />
                              </>
                            ) : (
                              <>
                                {unit.minSqft > 0 && (
                                  <MetaItem
                                    label="Size Range"
                                    value={`${unit.minSqft} – ${unit.maxSqft} sq.ft`}
                                  />
                                )}
                                <MetaItem
                                  label="Min Price"
                                  value={
                                    unit.minPrice
                                      ? formatPrice(unit.minPrice)
                                      : "N/A"
                                  }
                                />
                                <MetaItem
                                  label="Max Price"
                                  value={
                                    unit.maxPrice
                                      ? formatPrice(unit.maxPrice)
                                      : "N/A"
                                  }
                                />
                                <MetaItem
                                  label="Available"
                                  value={unit.availableCount}
                                />
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400 text-center py-10">
                  No unit data available.
                </p>
              )}
            </div>
          )}

          {/* Amenities */}
          {activeTab === "amenities" && (
            <div>
              {Array.isArray(property.amenities) &&
              property.amenities.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((a, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-1.5 text-sm bg-green-50 text-[#27AE60] border border-green-100 px-3 py-1.5 rounded-full font-medium"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                      {a.title}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 text-center py-10">
                  No amenities listed.
                </p>
              )}
            </div>
          )}

          {/* Nearby */}
          {activeTab === "nearby" && (
            <div className="space-y-2">
              {Array.isArray(property.nearbyPlaces) &&
              property.nearbyPlaces.length > 0 ? (
                property.nearbyPlaces.map((place, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 hover:bg-green-50/50 transition"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#27AE60]/10 flex items-center justify-center flex-shrink-0">
                      <Navigation className="w-4 h-4 text-[#27AE60]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-700 line-clamp-1">
                        {place.name}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5 capitalize">
                        {nearbyTypeLabel[place.type] || place.type}
                      </p>
                    </div>
                    <span className="flex-shrink-0 text-xs font-bold text-[#27AE60] bg-green-50 border border-green-100 px-2 py-1 rounded-full">
                      {place.distanceText}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400 text-center py-10">
                  No nearby places listed.
                </p>
              )}
            </div>
          )}

          {/* Specifications */}
          {activeTab === "specs" && (
            <div className="space-y-4">
              {Array.isArray(property.specifications) &&
              property.specifications.length > 0 ? (
                property.specifications.map((spec, si) => (
                  <div
                    key={si}
                    className="border border-slate-100 rounded-2xl overflow-hidden"
                  >
                    <div className="bg-slate-50 px-4 py-3 border-b border-slate-100">
                      <p className="text-sm font-bold text-slate-700">
                        {spec.category}
                      </p>
                    </div>
                    <div className="divide-y divide-slate-50">
                      {(spec.items || []).map((item, ii) => (
                        <div key={ii} className="px-4 py-3 flex gap-3">
                          <CheckCircle2 className="w-4 h-4 text-[#27AE60] flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-semibold text-slate-700">
                              {item.title}
                            </p>
                            {item.description && (
                              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400 text-center py-10">
                  No specifications available.
                </p>
              )}
            </div>
          )}

          {activeTab === "promotion" && (
            <PromotionTrackerPanel property={property} />
          )}
        </div>
      </div>

      {/* ── LEADS / ANALYTICS / RELATED TABS ─────────────────────────── */}
      <LeadsSection
        leads={leads}
        totalLeads={totalLeads}
        newLeads={newLeads}
        contactedLeads={contactedLeads}
        analyticsError={analyticsError}
        projectId={property._id}
      />

      {/* ── RECORD META ───────────────────────────────────────────────── */}
      <RecordMeta property={property} />
    </div>
  );
}

function PromotionTrackerPanel({ property }) {
  const tracking = getPromotionTracking(property);
  const history = tracking.history;
  const start = tracking.startedAt ? new Date(tracking.startedAt).getTime() : null;
  const end = tracking.expiresAt ? new Date(tracking.expiresAt).getTime() : null;
  const now = Date.now();
  const progress =
    start && end && end > start
      ? Math.min(100, Math.max(0, Math.round(((now - start) / (end - start)) * 100)))
      : tracking.currentType === "normal"
        ? 0
        : 100;

  return (
    <SectionCard>
      <SectionHeader
        icon={History}
        title="Promotion Tracking"
        sub="Movement, expiry and lifecycle history for this project"
      />
      <div className="grid gap-4 p-5 lg:grid-cols-[1fr_1.2fr]">
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs text-slate-400">Current promotion</p>
              <p className="mt-1 text-lg font-bold text-slate-800">
                {titlePromotionType(tracking.currentType)}
              </p>
            </div>
            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${promotionLifecycleClass(
                tracking.lifecycle,
              )}`}
            >
              {promotionLifecycleCopy(tracking)}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl bg-white p-3">
              <p className="text-slate-400">Started</p>
              <p className="mt-1 font-semibold text-slate-700">
                {formatPromotionDate(tracking.startedAt, true)}
              </p>
            </div>
            <div className="rounded-xl bg-white p-3">
              <p className="text-slate-400">Expires</p>
              <p className="mt-1 font-semibold text-slate-700">
                {formatPromotionDate(tracking.expiresAt, true)}
              </p>
            </div>
          </div>

          {tracking.currentType !== "normal" && (
            <div className="mt-4">
              <div className="mb-1 flex justify-between text-[11px] text-slate-500">
                <span>{titlePromotionType(tracking.previousType)} → {titlePromotionType(tracking.currentType)}</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white">
                <div
                  className="h-full rounded-full bg-[#27AE60] transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-4">
          <p className="mb-3 text-sm font-semibold text-slate-700">Promotion history</p>
          {history.length === 0 ? (
            <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-400">
              No promotion movement recorded yet.
            </div>
          ) : (
            <div className="custom-scrollbar max-h-[360px] space-y-3 overflow-y-auto pr-2">
              {[...history].reverse().map((item, index) => (
                <div key={`${item.startedAt}-${index}`} className="relative flex gap-3">
                  <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#27AE60]/10 text-[#27AE60]">
                    <TrendingUp className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0 flex-1 rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-700">
                        {titlePromotionType(item.fromType)} → {titlePromotionType(item.toType)}
                      </p>
                      <span className="rounded-full bg-white px-2 py-0.5 text-[11px] text-slate-500">
                        {item.source || "manual"}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {item.reason || "Promotion changed"}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-400">
                      <span>Started {formatPromotionDate(item.startedAt, true)}</span>
                      <span>Expires {formatPromotionDate(item.expiresAt, true)}</span>
                      {item.changedByRole && <span>By {item.changedByRole}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </SectionCard>
  );
}

