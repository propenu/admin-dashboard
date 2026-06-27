// src/pages/UpsertProperties/components/UpsertIndetailsProperty/IndetailsProperty.jsx
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { updateResidentialDocumentStatus } from "../../../../services/ResidentialServices/ResidentialServices";
import { updateCommercialDocumentStatus } from "../../../../services/CommercialServices/CommercialServices";
import { updateAgriculturalDocumentStatus } from "../../../../services/AgricuturalServices/AgricuturalServices";
import { updateLandDocumentStatus } from "../../../../services/LandServices/LandServices";
import { verifyAgentPropertyVerification } from "../../../../features/property/propertyService";
import {
  MapPin,
  ArrowLeft,
  Phone,
  User,
  Eye,
  Star,
  Clock,
  ChevronRight,
  Bed,
  Bath,
  Trees,
  ShieldCheck,
  CreditCard,
  Download,
  CheckCircle2,
  XCircle,
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
  Move,
  Home,
  Flame,
  Droplets,
  Zap,
  Leaf,
  Layers,
  BadgeCheck,
  Mail,
  CalendarDays,
  MessageSquare,
  TrendingUp,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { propertiesAnalytics } from "../../../../features/property/propertyService";
import { getPropertyById } from "../../../../features/property/propertyService";
import LoadingSpinner from "../../../../components/common/LoadingSpinner";
import Fallback from "../../../../assets/fallback.svg";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { toast } from "sonner";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatPrice = (price) => {
  if (!price || isNaN(price)) return "N/A";
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
  return `₹${price.toLocaleString("en-IN")}`;
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

const capitalize = (str) =>
  str ? str.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "—";
const formatRoleName = (role) => {
  const roles = {
    sales_agent: "Sales Executive",
  };

  return roles[role] || capitalize(role);
};
// Detect category from property data
const detectCategory = (property) => {
  if (!property) return "residential";
  if (
    property.soilType ||
    property.irrigationType ||
    property.waterSource ||
    property.currentCrop
  )
    return "agricultural";
  if (
    property.plotArea ||
    property.landUseZone ||
    property.surveyNumber ||
    property.layoutType
  )
    return "land";
  if (
    property.seats ||
    property.cabins ||
    property.tenantInfo ||
    property.buildingManagement ||
    property.zoning ||
    [
      "office",
      "shop",
      "showroom",
      "warehouse",
      "industrial",
      "coworking",
    ].includes(property.propertyType)
  )
    return "commercial";
  return "residential";
};


const isAgentProperty =
  localStorage.getItem("LitsedByAgentResidentailProperty") === "true";

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

function StatCard({ icon: Icon, label, value, color = "green" }) {
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
      </div>
    </div>
  );
}

function MetaItem({ label, value, highlight = false }) {
  if (value === null || value === undefined || value === "" || value === "—")
    return null;
  return (
    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
        {label}
      </p>
      <p
        className={`text-sm font-bold mt-1 capitalize ${
          highlight ? "text-[#27AE60]" : "text-slate-700"
        }`}
      >
        {String(value)}
      </p>
    </div>
  );
}

function BoolBadge({ label, value }) {
  if (value === null || value === undefined) return null;
  return (
    <div
      className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${
        value
          ? "bg-green-50 text-green-700 border-green-100"
          : "bg-red-50 text-red-500 border-red-100"
      }`}
    >
      {value ? (
        <CheckCircle2 className="w-3.5 h-3.5" />
      ) : (
        <XCircle className="w-3.5 h-3.5" />
      )}
      {label}
    </div>
  );
}

function StatusBadge({ status }) {
  const isActive = status === "active";
  return (
    <span
      className={`text-[11px] font-bold px-2.5 py-1 rounded-full shadow ${
        isActive ? "bg-[#27AE60] text-white" : "bg-red-500 text-white"
      }`}
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}

function CategoryBadge({ category }) {
  const map = {
    residential: {
      bg: "bg-blue-50 text-blue-700 border-blue-100",
      label: "Residential",
    },
    commercial: {
      bg: "bg-purple-50 text-purple-700 border-purple-100",
      label: "Commercial",
    },
    land: { bg: "bg-amber-50 text-amber-700 border-amber-100", label: "Land" },
    agricultural: {
      bg: "bg-green-50 text-green-700 border-green-100",
      label: "Agricultural",
    },
  };
  const c = map[category] || map.residential;
  return (
    <span
      className={`text-[11px] font-bold px-2.5 py-1 rounded-full border capitalize ${c.bg}`}
    >
      {c.label}
    </span>
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

// ─── CreatedByCard ────────────────────────────────────────────────────────────
function CreatedByCard({ person }) {
  if (!person) return null;
  return (
    <SectionCard>
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-100 bg-green-50">
        <UserPlus className="w-3.5 h-3.5 text-[#27AE60]" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#27AE60]">
          Created By
        </span>
      </div>
      <div className="p-4 flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#27AE60]/10 flex items-center justify-center">
            <User className="w-4 h-4 text-[#27AE60]" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800 capitalize">
              {person.name || "—"}
            </p>
            <p className="text-[9px] text-slate-400 font-mono">
              ID: ...{(person._id || "").slice(-4)}
            </p>
          </div>
        </div>
        {person.email && (
          <div className="bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
            <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider mb-0.5">
              Email
            </p>
            <p className="text-[11px] font-semibold text-slate-700 truncate">
              {person.email}
            </p>
          </div>
        )}
        {person.phone && (
          <div className="bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
            <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider mb-0.5">
              Phone
            </p>
            <p className="text-[11px] font-semibold text-slate-700">
              {person.phone}
            </p>
          </div>
        )}
      </div>
    </SectionCard>
  );
}

// ─── LeadRow ──────────────────────────────────────────────────────────────────
function UpdateHistoryPanel({ property }) {
  const history = Array.isArray(property?.updateHistory)
    ? [...property.updateHistory].sort(
        (a, b) => new Date(b?.updatedAt || 0) - new Date(a?.updatedAt || 0),
      )
    : [];
  const lastUpdated = property?.lastUpdatedBy || history[0];
  const updateCount = property?.updateCount ?? history.length;

  return (
    <SectionCard>
      <SectionHeader
        icon={History}
        title="Update History"
        sub="Track who changed this property and when"
      />

      <div className="grid gap-4 p-5 lg:grid-cols-[0.9fr_1.4fr]">
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Total Updates
              </p>
              <p className="mt-1 text-3xl font-extrabold text-slate-800">
                {updateCount || 0}
              </p>
            </div>
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#27AE60]/10 text-[#27AE60]">
              <RefreshCw className="h-5 w-5" />
            </span>
          </div>

          <div className="mt-4 rounded-xl bg-white p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Last Updated By
            </p>
            {lastUpdated ? (
              <div className="mt-2 space-y-1">
                <p className="text-sm font-bold capitalize text-slate-800">
                  {lastUpdated.name || "Unknown user"}
                </p>
                <p className="text-xs text-slate-500">
                  {formatRoleName(lastUpdated.roleName) || "Unknown role"}
                </p>
                {lastUpdated.email && (
                  <p className="truncate text-xs text-slate-400">
                    {lastUpdated.email}
                  </p>
                )}
                <p className="pt-1 text-xs font-semibold text-[#27AE60]">
                  {formatDateTime(lastUpdated.updatedAt)}
                </p>
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-400">
                No update data found
              </p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-sm font-bold text-slate-700">
              Activity Timeline
            </p>
            {history.length > 0 && (
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
                {history.length} records
              </span>
            )}
          </div>

          {history.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center">
              <History className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-2 text-sm font-semibold text-slate-500">
                No update history recorded
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Future edits will appear here.
              </p>
            </div>
          ) : (
            <div className="max-h-72 space-y-3 overflow-auto pr-1">
              {history.map((item, index) => (
                <div
                  key={item._id || `${item.updatedAt}-${index}`}
                  className="flex gap-3"
                >
                  <div className="flex flex-col items-center">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#27AE60]/10 text-[#27AE60]">
                      <PencilLine className="h-3.5 w-3.5" />
                    </span>
                    {index !== history.length - 1 && (
                      <span className="mt-1 h-full min-h-8 w-px bg-slate-100" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold capitalize text-slate-800">
                          {item.name || "Unknown user"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatRoleName(item.roleName) || "Unknown role"}
                        </p>
                      </div>
                      <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                        Update #{history.length - index}
                      </span>
                    </div>
                    {item.email && (
                      <p className="mt-1 truncate text-xs text-slate-400">
                        {item.email}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-400">
                      <span>{formatDate(item.updatedAt)}</span>
                      <span>{formatTime(item.updatedAt)}</span>
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
function LeadRow({ lead, index }) {
  const badge = {
    new: "bg-green-100 text-green-700",
    contacted: "bg-blue-100 text-blue-700",
    closed: "bg-slate-100 text-slate-600",
    converted: "bg-purple-100 text-purple-700",
  };
  return (
    <tr className="border-b border-slate-50 hover:bg-slate-50/70 transition-colors">
      <td className="py-3 px-4 text-xs text-slate-400 font-mono">
        {index + 1}
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#27AE60]/10 flex items-center justify-center flex-shrink-0">
            <User className="w-3.5 h-3.5 text-[#27AE60]" />
          </div>
          <span className="text-sm font-semibold text-slate-700">
            {lead.name}
          </span>
        </div>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-1.5 text-sm text-slate-600">
          <Phone className="w-3.5 h-3.5 text-[#27AE60] flex-shrink-0" />
          {lead.phone}
        </div>
      </td>
      <td className="py-3 px-4 text-xs text-slate-500">{lead.email || "—"}</td>
      <td className="py-3 px-4">
        <span
          className={`text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize ${
            badge[lead.status] || "bg-slate-100 text-slate-600"
          }`}
        >
          {lead.status}
        </span>
      </td>
      <td className="py-3 px-4 text-xs text-slate-400 whitespace-nowrap">
        {formatDateTime(lead.createdAt)}
      </td>
    </tr>
  );
}

// ─── LeadsSection ─────────────────────────────────────────────────────────────
function LeadsSection({
  leads,
  totalLeads,
  newLeads,
  contactedLeads,
  analyticsError,
  propertyId,
}) {
  const downloadCSV = () => {
    const rows = leads.map((lead, i) => ({
      SNo: i + 1,
      Name: lead.name,
      Phone: lead.phone,
      Email: lead.email || "",
      Status: lead.status,
      Date: new Date(lead.createdAt).toLocaleString("en-IN"),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const csv = XLSX.utils.sheet_to_csv(ws);
    saveAs(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
      `leads-${propertyId}.csv`,
    );
  };

  const downloadExcel = () => {
    const rows = leads.map((lead, i) => ({
      SNo: i + 1,
      Name: lead.name,
      Phone: lead.phone,
      Email: lead.email || "",
      Status: lead.status,
      Date: new Date(lead.createdAt).toLocaleString("en-IN"),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Leads");
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([buf], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      `leads-${propertyId}.xlsx`,
    );
  };

  return (
    <SectionCard>
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100">
        <div className="p-2 rounded-xl bg-blue-50">
          <Users className="w-4 h-4 text-blue-600" />
        </div>
        <h2 className="text-sm font-bold text-slate-700">Leads</h2>
        <span className="ml-auto text-[10px] font-semibold bg-slate-100 text-slate-500 border border-slate-200 px-2.5 py-1 rounded-full">
          {totalLeads} total
        </span>
        {leads.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={downloadCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-50 border border-green-100 text-[#27AE60] text-[11px] font-bold hover:bg-green-100 transition"
            >
              <Download className="w-3.5 h-3.5" />
              CSV
            </button>
            <button
              onClick={downloadExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 text-[11px] font-bold hover:bg-blue-100 transition"
            >
              <Download className="w-3.5 h-3.5" />
              Excel
            </button>
          </div>
        )}
      </div>

      <div className="p-5">
        {/* Mini stats */}
        <div className="flex gap-3 mb-5">
          {[
            { label: "Total", value: totalLeads, color: "text-slate-800" },
            { label: "New", value: newLeads, color: "text-[#27AE60]" },
            {
              label: "Contacted",
              value: contactedLeads,
              color: "text-blue-600",
            },
            {
              label: "Converted",
              value: leads.filter((l) => l.status === "converted").length,
              color: "text-purple-600",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-slate-50 rounded-xl border border-slate-100 px-4 py-3 text-center min-w-[72px]"
            >
              <p className={`text-xl font-extrabold ${s.color}`}>{s.value}</p>
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
            <p className="text-sm font-medium">
              No leads yet for this property
            </p>
            <p className="text-xs text-slate-300">
              Leads will appear here once enquiries come in
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {["#", "Name", "Phone", "Email", "Status", "Date"].map(
                    (h) => (
                      <th
                        key={h}
                        className="py-3 px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {leads.map((lead, i) => (
                  <LeadRow key={lead._id || i} lead={lead} index={i} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </SectionCard>
  );
}

// ─── CATEGORY-SPECIFIC DETAIL SECTIONS ───────────────────────────────────────

// Residential Details
function ResidentialDetails({ property }) {
  return (
    <SectionCard>
      <SectionHeader
        icon={Home}
        title="Residential Details"
        sub="Apartment / Villa / Property specifics"
      />
      <div className="p-5 space-y-4">
        {/* Core specs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <MetaItem
            label="Property Type"
            value={capitalize(property.propertyType)}
          />
          <MetaItem
            label="Listing Type"
            value={capitalize(property.listingType)}
          />
          <MetaItem
            label="Transaction Type"
            value={capitalize(property.transactionType)}
          />
          <MetaItem
            label="Construction Status"
            value={capitalize(property.constructionStatus)}
          />
          <MetaItem
            label="Property Age"
            value={capitalize(property.propertyAge)}
          />
          <MetaItem
            label="Furnishing"
            value={capitalize(property.furnishing)}
          />
          <MetaItem label="Facing" value={capitalize(property.facing)} />
          <MetaItem label="Floor Number" value={property.floorNumber} />
          <MetaItem label="Total Floors" value={property.totalFloors} />
          <MetaItem
            label="Flooring Type"
            value={capitalize(property.flooringType)}
          />
          <MetaItem
            label="Kitchen Type"
            value={capitalize(property.kitchenType)}
          />
          <MetaItem label="Building Name" value={property.buildingName} />
        </div>

        {/* Area & Size */}
        <div>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            Area & Size
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-green-50 border border-green-100 rounded-xl p-3 flex items-center gap-3">
              <Bed className="w-5 h-5 text-[#27AE60]" />
              <div>
                <p className="text-xs text-slate-500">Bedrooms</p>
                <p className="text-lg font-extrabold text-slate-800">
                  {property.bedrooms || 0} BHK
                </p>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-center gap-3">
              <Bath className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-xs text-slate-500">Bathrooms</p>
                <p className="text-lg font-extrabold text-slate-800">
                  {property.bathrooms || 0}
                </p>
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center gap-3">
              <Move className="w-5 h-5 text-slate-500" />
              <div>
                <p className="text-xs text-slate-500">Carpet Area</p>
                <p className="text-lg font-extrabold text-slate-800">
                  {property.carpetArea?.toLocaleString() || 0}{" "}
                  <span className="text-xs font-normal">sqft</span>
                </p>
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center gap-3">
              <Move className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500">Built-up Area</p>
                <p className="text-lg font-extrabold text-slate-800">
                  {property.builtUpArea?.toLocaleString() || 0}{" "}
                  <span className="text-xs font-normal">sqft</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Parking */}
        {property.parkingDetails && (
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Parking
            </p>
            <div className="flex flex-wrap gap-2">
              <MetaItem
                label="Parking Type"
                value={capitalize(property.parkingType)}
              />
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  Two Wheeler
                </p>
                <p className="text-sm font-bold text-slate-700 mt-1">
                  {property.parkingDetails.twoWheeler ?? 0}
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  Four Wheeler
                </p>
                <p className="text-sm font-bold text-slate-700 mt-1">
                  {property.parkingDetails.fourWheeler ?? 0}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              <BoolBadge
                label="Visitor Parking"
                value={property.parkingDetails.visitorParking}
              />
              <BoolBadge
                label="Modular Kitchen"
                value={property.isModularKitchen}
              />
              <BoolBadge
                label="Negotiable"
                value={property.isPriceNegotiable}
              />
            </div>
          </div>
        )}

        {/* Balconies */}
        {property.balconies > 0 && (
          <MetaItem label="Balconies" value={property.balconies} />
        )}

        {/* Description */}
        {property.description && (
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5">
              Description
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              {property.description}
            </p>
          </div>
        )}
      </div>
    </SectionCard>
  );
}

// Commercial Details
function CommercialDetails({ property }) {
  return (
    <SectionCard>
      <SectionHeader
        icon={Building2}
        title="Commercial Details"
        sub="Office / Shop / Commercial Space specifics"
      />
      <div className="p-5 space-y-4">
        {/* Core specs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <MetaItem
            label="Property Type"
            value={capitalize(property.propertyType)}
          />
          <MetaItem
            label="Property Sub Type"
            value={capitalize(property.propertySubType)}
          />
          <MetaItem
            label="Listing Type"
            value={capitalize(property.listingType)}
          />
          <MetaItem
            label="Transaction Type"
            value={capitalize(property.transactionType)}
          />
          <MetaItem
            label="Construction Status"
            value={capitalize(property.constructionStatus)}
          />
          <MetaItem
            label="Furnished Status"
            value={capitalize(property.furnishedStatus)}
          />
          <MetaItem
            label="Property Age"
            value={capitalize(property.propertyAge)}
          />
          <MetaItem label="Floor Number" value={property.floorNumber} />
          <MetaItem label="Total Floors" value={property.totalFloors} />
          <MetaItem
            label="Flooring Type"
            value={capitalize(property.flooringType)}
          />
          <MetaItem
            label="Wall Finish Status"
            value={capitalize(property.wallFinishStatus)}
          />
          <MetaItem label="Zoning" value={property.zoning} />
          <MetaItem label="Building Name" value={property.buildingName} />
        </div>

        {/* Area & Capacity */}
        <div>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            Area & Capacity
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
              <p className="text-xs text-slate-500">Carpet Area</p>
              <p className="text-lg font-extrabold text-slate-800">
                {property.carpetArea?.toLocaleString() || 0}{" "}
                <span className="text-xs font-normal">sqft</span>
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
              <p className="text-xs text-slate-500">Built-up Area</p>
              <p className="text-lg font-extrabold text-slate-800">
                {property.builtUpArea?.toLocaleString() || 0}{" "}
                <span className="text-xs font-normal">sqft</span>
              </p>
            </div>
            {property.seats > 0 && (
              <div className="bg-purple-50 border border-purple-100 rounded-xl p-3">
                <p className="text-xs text-slate-500">Seats</p>
                <p className="text-lg font-extrabold text-slate-800">
                  {property.seats}
                </p>
              </div>
            )}
            {property.cabins > 0 && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                <p className="text-xs text-slate-500">Cabins</p>
                <p className="text-lg font-extrabold text-slate-800">
                  {property.cabins}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Financial */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {property.maintenanceCharges > 0 && (
            <MetaItem
              label="Maintenance Charges"
              value={formatPrice(property.maintenanceCharges)}
            />
          )}
          {property.powerCapacityKw > 0 && (
            <MetaItem
              label="Power Capacity (kW)"
              value={property.powerCapacityKw}
            />
          )}
        </div>

        {/* Pantry */}
        {property.pantry && property.pantry.type !== "none" && (
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Pantry
            </p>
            <div className="flex flex-wrap gap-2">
              <MetaItem label="Type" value={capitalize(property.pantry.type)} />
              <BoolBadge
                label="Inside Premises"
                value={property.pantry.insidePremises}
              />
              <BoolBadge label="Shared" value={property.pantry.shared} />
            </div>
          </div>
        )}

        {/* Parking */}
        {property.parkingDetails && (
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Parking
            </p>
            <div className="flex flex-wrap gap-2">
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  Two Wheeler
                </p>
                <p className="text-sm font-bold text-slate-700 mt-1">
                  {property.parkingDetails.twoWheeler ?? 0}
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  Four Wheeler
                </p>
                <p className="text-sm font-bold text-slate-700 mt-1">
                  {property.parkingDetails.fourWheeler ?? 0}
                </p>
              </div>
              <BoolBadge
                label="Visitor Parking"
                value={property.parkingDetails.visitorParking}
              />
            </div>
          </div>
        )}

        {/* Building Management */}
        {property.buildingManagement && (
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Building Management
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <MetaItem
                label="Managed By"
                value={property.buildingManagement.managedBy}
              />
              <MetaItem
                label="Contact"
                value={property.buildingManagement.contact}
              />
              <BoolBadge
                label="Security"
                value={property.buildingManagement.security}
              />
            </div>
          </div>
        )}

        {/* Fire Safety */}
        {property.fireSafety && (
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-red-500" /> Fire Safety
            </p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(property.fireSafety).map(([key, val]) => (
                <BoolBadge
                  key={key}
                  label={key
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (s) => s.toUpperCase())}
                  value={val}
                />
              ))}
            </div>
          </div>
        )}

        {/* Tenant Info */}
        {Array.isArray(property.tenantInfo) &&
          property.tenantInfo.length > 0 && (
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Tenant Information
              </p>
              {property.tenantInfo.map((t, i) => (
                <div
                  key={i}
                  className="bg-amber-50 rounded-xl p-4 border border-amber-100 mb-2"
                >
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <MetaItem label="Current Tenant" value={t.currentTenant} />
                    <MetaItem label="Rent" value={formatPrice(t.rent)} />
                    <MetaItem
                      label="Lease Start"
                      value={formatDate(t.leaseStart)}
                    />
                    <MetaItem
                      label="Lease End"
                      value={formatDate(t.leaseEnd)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

        {/* Description */}
        {property.description && (
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5">
              Description
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              {property.description}
            </p>
          </div>
        )}
      </div>
    </SectionCard>
  );
}

// Land Details
function LandDetails({ property }) {
  return (
    <SectionCard>
      <SectionHeader
        icon={Trees}
        title="Land Details"
        sub="Plot / Land specifics"
      />
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <MetaItem
            label="Property Type"
            value={capitalize(property.propertyType)}
          />
          <MetaItem
            label="Property Sub Type"
            value={capitalize(property.propertySubType)}
          />
          <MetaItem
            label="Listing Type"
            value={capitalize(property.listingType)}
          />
          <MetaItem label="Land Name" value={property.landName} />
          <MetaItem label="Facing" value={capitalize(property.facing)} />
          <MetaItem label="Land Use Zone" value={property.landUseZone} />
          <MetaItem
            label="Layout Type"
            value={capitalize(property.layoutType)}
          />
          <MetaItem label="Survey Number" value={property.surveyNumber} />
          <MetaItem
            label="Road Width"
            value={property.roadWidthFt ? `${property.roadWidthFt} ft` : null}
          />
        </div>

        {/* Area */}
        <div>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            Plot Area
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-green-50 border border-green-100 rounded-xl p-4">
              <p className="text-xs text-slate-500">Plot Area</p>
              <p className="text-2xl font-extrabold text-[#27AE60]">
                {property.plotArea?.toLocaleString() || 0}
                <span className="text-sm font-normal ml-1">sqft</span>
              </p>
            </div>
            {property.dimensions && (
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                <p className="text-xs text-slate-500">Dimensions (L × W)</p>
                <p className="text-xl font-extrabold text-slate-800">
                  {property.dimensions.length} × {property.dimensions.width}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Boolean Features */}
        <div className="flex flex-wrap gap-2">
          <BoolBadge label="Corner Plot" value={property.cornerPlot} />
          <BoolBadge
            label="Ready to Construct"
            value={property.readyToConstruct}
          />
          <BoolBadge label="Negotiable" value={property.isPriceNegotiable} />
        </div>

        {/* Approved By */}
        {Array.isArray(property.approvedByAuthority) &&
          property.approvedByAuthority.length > 0 && (
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Approved By
              </p>
              <div className="flex flex-wrap gap-2">
                {property.approvedByAuthority.map((auth, i) => (
                  <span
                    key={i}
                    className="text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1.5 rounded-full"
                  >
                    {auth}
                  </span>
                ))}
              </div>
            </div>
          )}

        {property.description && (
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5">
              Description
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              {property.description}
            </p>
          </div>
        )}
      </div>
    </SectionCard>
  );
}

// Agricultural Details
function AgriculturalDetails({ property }) {
  return (
    <SectionCard>
      <SectionHeader
        icon={Leaf}
        title="Agricultural Details"
        sub="Farm Land specifics"
      />
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <MetaItem
            label="Property Type"
            value={capitalize(property.propertyType)}
          />
          <MetaItem
            label="Property Sub Type"
            value={capitalize(property.propertySubType)}
          />
          <MetaItem
            label="Listing Type"
            value={capitalize(property.listingType)}
          />
          <MetaItem label="Land Name" value={property.landName} />
          <MetaItem label="Soil Type" value={capitalize(property.soilType)} />
          <MetaItem
            label="Irrigation Type"
            value={capitalize(property.irrigationType)}
          />
          <MetaItem
            label="Water Source"
            value={capitalize(property.waterSource)}
          />
          <MetaItem
            label="Access Road Type"
            value={capitalize(property.accessRoadType)}
          />
          <MetaItem label="Land Shape" value={property.landShape} />
          <MetaItem label="Current Crop" value={property.currentCrop} />
          <MetaItem
            label="Road Width"
            value={
              property.roadWidth
                ? `${property.roadWidth.value} ${property.roadWidth.unit}`
                : null
            }
          />
          <MetaItem
            label="State Purchase Restrictions"
            value={property.statePurchaseRestrictions}
          />
        </div>

        {/* Total Area */}
        {property.totalArea && (
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Total Area
            </p>
            <div className="bg-green-50 border border-green-100 rounded-xl p-4 inline-block">
              <p className="text-xs text-slate-500">Total Area</p>
              <p className="text-2xl font-extrabold text-[#27AE60]">
                {property.totalArea.value?.toLocaleString()}
                <span className="text-sm font-normal ml-1">
                  {property.totalArea.unit}
                </span>
              </p>
            </div>
          </div>
        )}

        {/* Borewell */}
        {property.numberOfBorewells > 0 && (
          <MetaItem
            label="Number of Borewells"
            value={property.numberOfBorewells}
          />
        )}

        {/* Boolean Features */}
        <div className="flex flex-wrap gap-2">
          <BoolBadge label="Boundary Wall" value={property.boundaryWall} />
          <BoolBadge
            label="Electricity Connection"
            value={property.electricityConnection}
          />
          <BoolBadge label="Negotiable" value={property.isPriceNegotiable} />
        </div>

        {property.description && (
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5">
              Description
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              {property.description}
            </p>
          </div>
        )}
      </div>
    </SectionCard>
  );
}

// ─── NearbySection ────────────────────────────────────────────────────────────
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

function NearbySection({ places }) {
  if (!Array.isArray(places) || places.length === 0) return null;
  return (
    <SectionCard>
      <SectionHeader
        icon={Navigation}
        title="Nearby Places"
        sub={`${places.length} locations`}
      />
      <div className="p-5 space-y-2">
        {places.map((place, i) => (
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
        ))}
      </div>
    </SectionCard>
  );
}

// ─── AmenitiesSection ─────────────────────────────────────────────────────────
function AmenitiesSection({ amenities }) {
  if (!Array.isArray(amenities) || amenities.length === 0) return null;
  return (
    <SectionCard>
      <SectionHeader
        icon={Star}
        title="Amenities"
        sub={`${amenities.length} amenities`}
      />
      <div className="p-5">
        <div className="flex flex-wrap gap-2">
          {amenities.map((a, i) => (
            <div
              key={i}
              className="flex items-center gap-1.5 text-sm bg-green-50 text-[#27AE60] border border-green-100 px-3 py-1.5 rounded-full font-medium"
            >
              <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
              {a.title}
            </div>
          ))}
        </div>
      </div>
    </SectionCard>
  );
}

// ─── SpecificationsSection ────────────────────────────────────────────────────
function SpecificationsSection({ specs }) {
  if (!Array.isArray(specs) || specs.length === 0) return null;
  return (
    <SectionCard>
      <SectionHeader icon={Layers} title="Specifications" />
      <div className="p-5 space-y-3">
        {specs.map((spec, si) => (
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
        ))}
      </div>
    </SectionCard>
  );
}

// ─── VerificationDocs ─────────────────────────────────────────────────────────
function VerificationDocs({ docs }) {
  if (!Array.isArray(docs) || docs.length === 0) return null;
  const statusStyle = {
    verified: "bg-green-50 text-green-700 border-green-100",
    pending: "bg-amber-50 text-amber-700 border-amber-100",
    rejected: "bg-red-50 text-red-600 border-red-100",
  };
  return (
    <SectionCard>
      <SectionHeader
        icon={ShieldCheck}
        title="Verification Documents"
        sub={`${docs.length} document(s)`}
      />
      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {docs.map((doc, i) => (
          <div
            key={i}
            className="border border-slate-100 rounded-xl overflow-hidden"
          >
            {doc.mimetype?.startsWith("image") ? (
              <img
                src={doc.url}
                alt={doc.filename}
                className="w-full h-32 object-cover"
                onError={(e) => {
                  e.target.src = Fallback;
                }}
              />
            ) : (
              <div className="h-32 bg-slate-50 flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-slate-300" />
              </div>
            )}
            <div className="p-3 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-700 truncate">
                  {doc.filename || doc.title}
                </p>
                <p className="text-[10px] text-slate-400 capitalize">
                  {doc.type?.replace(/_/g, " ")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-bold px-2 py-1 rounded-full border capitalize ${
                    statusStyle[doc.status] ||
                    "bg-slate-100 text-slate-600 border-slate-200"
                  }`}
                >
                  {doc.status}
                </span>
                {doc.url && (
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noreferrer"
                    className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function IndetailsProperty({
  propertyData,
  category: propCategory,
}) {
  const navigate = useNavigate();
  const [activeImage, setActiveImage] = useState(0);


  const { category, id } = useParams();

  console.log("category", category);
  console.log("id", id);

  
const {
  data: propertyResponse,
  isLoading,
  error: analyticsError,
} = useQuery({
  queryKey: ["property", category, id],

  queryFn: async () => {
    const res = await getPropertyById(category, id);
    return res.data;
  },

  enabled: !!category && !!id,
});




const analyticsLoading = isLoading;

  const property = propertyResponse?.data;
  const analyticsData = propertyResponse?.data?.analytics;


  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (analyticsLoading) {
    return <div>Failed to load property</div>;
  }

  if (!property) {
    return <div>Property Not Found</div>;
  }
  

  // if (!property) {
  //   return (
  //     <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
  //       <XCircle className="w-12 h-12 text-red-300" />
  //       <p className="text-slate-600 font-medium">Property not found.</p>
  //       <button
  //         onClick={() => navigate(-1)}
  //         className="text-sm text-[#27AE60] underline underline-offset-2"
  //       >
  //         Go back
  //       </button>
  //     </div>
  //   );
  // }

  // Leads extraction
  const extractLeads = (raw) => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw.data)) return raw.data;
    if (raw.data && typeof raw.data === "object") return extractLeads(raw.data);
    if (Array.isArray(raw.items)) return raw.items;
    if (Array.isArray(raw.leads)) return raw.leads;
    return [];
  };
  const leads = extractLeads(analyticsData);
  const totalLeads =
    typeof analyticsData?.count === "number"
      ? analyticsData.count
      : leads.length;
  const newLeads = leads.filter((l) => l.status === "new").length;
  const contactedLeads = leads.filter((l) => l.status === "contacted").length;

  // Images
  const images = property.gallery || [];
  const displayImage = images[activeImage]?.url || Fallback;
  const isActive = property.status === "active";
  const completion = property.completion?.percent || 0;

  // Category label for display
  const categoryLabels = {
    residential: "Residential",
    commercial: "Commercial",
    land: "Land",
    agricultural: "Agricultural",
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-slate-500 flex-wrap">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-[#27AE60] hover:text-green-700 font-semibold transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Properties
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <span className="text-slate-700 font-medium line-clamp-1 max-w-xs">
          {property.title || "Property Details"}
        </span>
      </div>

      {/* ── TOP STATS ROW ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          icon={Eye}
          label="Page Views"
          value={property.meta?.views ?? 0}
          color="green"
        />
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
          icon={Users}
          label="Total Leads"
          value={analyticsLoading ? "..." : totalLeads}
          color="purple"
        />
      </div>

      {/* ── HERO PANEL ────────────────────────────────────────────────── */}
      <SectionCard>
        <div className="grid grid-cols-1 lg:grid-cols-5">
          {/* Image column */}
          <div className="lg:col-span-2 relative">
            <div className="h-64 sm:h-80 lg:h-full min-h-[200px] max-h-[400px] bg-slate-100 relative overflow-hidden">
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
                <StatusBadge status={property.status} />
                <CategoryBadge category={category} />
              </div>
              {/* Completion bar */}
              <div className="absolute bottom-0 left-0 right-0 px-4 pb-3">
                <div className="flex items-center justify-between text-white text-[10px] mb-1">
                  <span className="font-semibold">Profile Completion</span>
                  <span className="font-bold">{completion}%</span>
                </div>
                <div className="h-1.5 bg-white/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full"
                    style={{ width: `${completion}%` }}
                  />
                </div>
              </div>
              {/* Photo count */}
              <div className="absolute top-3 right-3 px-2 py-1 bg-black/50 backdrop-blur-sm text-white text-[10px] rounded-lg flex items-center gap-1">
                <ImageIcon className="w-3 h-3" /> {images.length}
              </div>
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
            <div className="flex items-center gap-2">
              {completion === 70 && (
                <div className="mt-3 flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
                  <div>
                    <p className="text-sm font-bold text-blue-700">
                      This property is listed by an Agent
                    </p>

                    <p className="text-xs text-blue-500 mt-1">
                      Please check all details and approve verification.
                    </p>
                  </div>

                  <BadgeCheck className="w-8 h-8 text-blue-600" />
                </div>
              )}

              {completion === 70 && (
                <button
                  onClick={async () => {
                    try {
                      // if (category === "residential"){
                      //   await verifyAgentPropertyVerification(
                      //     category,
                      //     property._id,
                      //     {
                      //       // documentIndex: 0,
                      //       status: "verified",
                      //     },
                      //   );
                      // }else if(category === "commercial"){
                      //   await updateCommercialDocumentStatus(property._id, {
                      //     documentIndex: 0,
                      //     status: "verified",
                      //   });
                      // }else if(category === "land"){
                      //   await updateLandDocumentStatus(property._id, {
                      //     documentIndex: 0,
                      //     status: "verified",
                      //   });
                      // }else if(category === "agricutural"){
                      //   await updateAgriculturalDocumentStatus(property._id, {
                      //     documentIndex: 0,
                      //     status: "verified",
                      //   });
                      // }

                      await verifyAgentPropertyVerification(
                        category,
                        property._id,
                        {
                          status: "verified",
                        },
                      );

                      toast.success(
                        "Property verified successfully and published live",
                      );
                      navigate(`/${category}`);
                    } catch (err) {
                      toast.error("Verification failed");
                    }
                  }}
                  className="
                    mt-4
                    flex items-center gap-2
                    rounded-xl
                    bg-green-600
                    px-5
                    py-3
                    text-white
                    font-bold
                    hover:bg-green-700
                    transition
                  "
                >
                  <BadgeCheck className="w-5 h-5" />
                  Approve Verification
                </button>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CategoryBadge category={category} />
                <span
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-full border capitalize ${
                    property.approval?.status === "pending"
                      ? "bg-amber-50 text-amber-700 border-amber-100"
                      : "bg-green-50 text-green-700 border-green-100"
                  }`}
                >
                  {property.approval?.status || "Pending"}
                </span>
                {property.listingSource && (
                  <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-slate-100 text-slate-500 capitalize">
                    {property.listingSource.replace(/_/g, " ")}
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 leading-tight">
                {property.title || "Untitled Property"}
              </h1>

              <div className="flex items-start gap-1.5 text-sm text-slate-500 mt-2">
                <MapPin className="w-4 h-4 text-[#27AE60] flex-shrink-0 mt-0.5" />
                <span>
                  {[
                    property.address,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                  {/* {property.pincode && ` - ${property.pincode}`} */}
                </span>
                {/* <span>
                  {[
                    property.locality,
                    property.city,
                    property.state,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </span> */}
              </div>
            </div>

            {/* Price */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-100">
              <p className="text-[11px] font-bold text-[#27AE60] uppercase tracking-widest">
                Price
              </p>
              <p className="text-2xl font-extrabold text-[#27AE60] mt-1">
                {formatPrice(property.price)}
              </p>
              {property.pricePerSqft && (
                <p className="text-xs text-slate-500 mt-0.5">
                  ₹{property.pricePerSqft?.toLocaleString()} / sqft
                </p>
              )}
            </div>

            {/* Quick meta grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <MetaItem
                label="Listing Type"
                value={capitalize(property.listingType)}
              />
              {/* Residential */}
              {category === "residential" && (
                <>
                  <MetaItem
                    label="Bedrooms"
                    value={
                      property.bedrooms ? `${property.bedrooms} BHK` : null
                    }
                  />
                  <MetaItem label="Bathrooms" value={property.bathrooms} />
                  <MetaItem
                    label="Carpet Area"
                    value={
                      property.carpetArea ? `${property.carpetArea} sqft` : null
                    }
                  />
                  <MetaItem
                    label="Furnishing"
                    value={capitalize(property.furnishing)}
                  />
                  <MetaItem
                    label="Construction"
                    value={capitalize(property.constructionStatus)}
                  />
                </>
              )}
              {/* Commercial */}
              {category === "commercial" && (
                <>
                  <MetaItem
                    label="Property Type"
                    value={capitalize(property.propertyType)}
                  />
                  <MetaItem
                    label="Carpet Area"
                    value={
                      property.carpetArea ? `${property.carpetArea} sqft` : null
                    }
                  />
                  <MetaItem label="Seats" value={property.seats} />
                  <MetaItem label="Cabins" value={property.cabins} />
                  <MetaItem
                    label="Construction"
                    value={capitalize(property.constructionStatus)}
                  />
                </>
              )}
              {/* Land */}
              {category === "land" && (
                <>
                  <MetaItem
                    label="Property Type"
                    value={capitalize(property.propertyType)}
                  />
                  <MetaItem
                    label="Plot Area"
                    value={
                      property.plotArea
                        ? `${property.plotArea?.toLocaleString()} sqft`
                        : null
                    }
                  />
                  <MetaItem
                    label="Land Use Zone"
                    value={property.landUseZone}
                  />
                  <MetaItem
                    label="Layout Type"
                    value={capitalize(property.layoutType)}
                  />
                  <MetaItem
                    label="Facing"
                    value={capitalize(property.facing)}
                  />
                </>
              )}
              {/* Agricultural */}
              {category === "agricultural" && (
                <>
                  <MetaItem
                    label="Property Type"
                    value={capitalize(property.propertyType)}
                  />
                  {property.totalArea && (
                    <MetaItem
                      label="Total Area"
                      value={`${property.totalArea.value} ${property.totalArea.unit}`}
                    />
                  )}
                  <MetaItem
                    label="Soil Type"
                    value={capitalize(property.soilType)}
                  />
                  <MetaItem
                    label="Irrigation Type"
                    value={capitalize(property.irrigationType)}
                  />
                  <MetaItem
                    label="Water Source"
                    value={capitalize(property.waterSource)}
                  />
                </>
              )}
            </div>

            {/* Banks Approved */}
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

            {/* Slug & RERA */}
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
          </div>
        </div>
      </SectionCard>

      {/* ── CREATED BY ────────────────────────────────────────────────── */}
      {property.createdBy && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <CreatedByCard person={property.createdBy} />
        </div>
      )}

      <UpdateHistoryPanel property={property} />

      {/* ── CATEGORY-SPECIFIC DETAILS ─────────────────────────────────── */}
      {category === "residential" && <ResidentialDetails property={property} />}
      {category === "commercial" && <CommercialDetails property={property} />}
      {category === "land" && <LandDetails property={property} />}
      {category === "agricultural" && (
        <AgriculturalDetails property={property} />
      )}

      {/* ── AMENITIES ─────────────────────────────────────────────────── */}
      <AmenitiesSection amenities={property.amenities} />

      {/* ── NEARBY PLACES ─────────────────────────────────────────────── */}
      <NearbySection places={property.nearbyPlaces} />

      {/* ── SPECIFICATIONS ────────────────────────────────────────────── */}
      <SpecificationsSection specs={property.specifications} />

      {/* ── VERIFICATION DOCS ─────────────────────────────────────────── */}
      <VerificationDocs docs={property.verificationDocuments} />

      {/* ── LEADS SECTION ─────────────────────────────────────────────── */}
      <LeadsSection
        leads={leads}
        totalLeads={totalLeads}
        newLeads={newLeads}
        contactedLeads={contactedLeads}
        analyticsError={analyticsError}
        propertyId={property._id}
      />

      {/* ── RECORD META ───────────────────────────────────────────────── */}
      <RecordMeta property={property} />
    </div>
  );
}


