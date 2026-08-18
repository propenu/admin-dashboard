// propenuadmindashborad/src/pages/UpsertProperties/components/UpsertIndetailsProject/PropertyIndetails.jsx
import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import GalleryLightbox from "../../../../components/common/GalleryLightbox";
import { updateResidentialDocumentStatus } from "../../../../services/ResidentialServices/ResidentialServices";
import { updateCommercialDocumentStatus } from "../../../../services/CommercialServices/CommercialServices";
import { updateAgriculturalDocumentStatus } from "../../../../services/AgricuturalServices/AgricuturalServices";
import { updateLandDocumentStatus } from "../../../../services/LandServices/LandServices";
import { verifyAgentPropertyVerification } from "../../../../features/property/propertyService";
import { getUserDetails } from "../../../../features/user/userService";
import {
  canApproveProperty,
  isPropertyAwaitingApproval,
  isPropertyReverification,
} from "../../../../utils/propertyAccessControl";
import { getPropertyCreatorTag } from "../../../../utils/propertyCreatorRole";
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

const capitalize = (str) => {
  if (str == null || str === "") return "—";
  const text =
    typeof str === "string"
      ? str
      : typeof str === "object"
        ? String(str.name || str.label || str.roleName || "")
        : String(str);
  if (!text) return "—";
  return text.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

/** Labels for slug enums used on details pages */
const PROPERTY_AGE_LABELS = {
  "0-1-year": "0-1 Year",
  "1-5-years": "1-5 Years",
  "5-10-years": "5-10 Years",
  "10-20-years": "10+ Years",
  "20-plus-years": "20+ Years",
  "under-construction": "Under Construction",
};

const CONSTRUCTION_STATUS_LABELS = {
  "ready-to-move": "Ready to Move",
  "under-construction": "Under Construction",
};

const formatPropertyAge = (value) => {
  if (!value) return "—";
  const key = String(value).trim().toLowerCase();
  if (PROPERTY_AGE_LABELS[key]) return PROPERTY_AGE_LABELS[key];
  // Fallback: keep numeric ranges like 5-10, only humanize the trailing word(s)
  const rangeMatch = key.match(/^(\d+)\s*-\s*(\d+)\s*-?\s*(years?|yrs?)?$/i);
  if (rangeMatch) {
    const unit = (rangeMatch[3] || "year").toLowerCase().startsWith("year")
      ? Number(rangeMatch[2]) === 1
        ? "Year"
        : "Years"
      : "Years";
    return `${rangeMatch[1]}-${rangeMatch[2]} ${unit}`;
  }
  const plusMatch = key.match(/^(\d+)\s*-?\s*plus\s*-?\s*(years?|yrs?)?$/i);
  if (plusMatch) return `${plusMatch[1]}+ Years`;
  return capitalize(value);
};

const formatConstructionStatus = (value) => {
  if (!value) return "—";
  const key = String(value).trim().toLowerCase();
  return CONSTRUCTION_STATUS_LABELS[key] || capitalize(value);
};

const formatRoleName = (role) => {
  const key =
    typeof role === "string"
      ? role
      : typeof role === "object" && role
        ? String(role.name || role.label || role.roleName || "")
        : String(role || "");
  const roles = {
    sales_agent: "Sales Executive",
    sales_executive: "Sales Executive",
  };
  return roles[key] || capitalize(key);
};

const pickRoleName = (...candidates) => {
  for (const value of candidates) {
    if (!value) continue;
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "object") {
      const nested = value.name || value.label || value.roleName;
      if (typeof nested === "string" && nested.trim()) return nested.trim();
    }
  }
  return undefined;
};

const normalizeAuditPerson = (person, fallbackDate) => {
  if (!person) return null;
  if (typeof person === "string") return { _id: person, updatedAt: fallbackDate };

  const user = person.userId && typeof person.userId === "object" ? person.userId : {};
  const id = person._id || person.userId || user._id || person.id || user.id;

  return {
    ...person,
    _id: id,
    name: person.name || user.name,
    email: person.email || user.email,
    phone: person.phone || person.contact || user.phone || user.contact,
    roleName: pickRoleName(
      person.roleName,
      person.role,
      user.roleName,
      user.role,
      user.roleId,
      person.roleId,
    ),
    createdAt: person.createdAt || fallbackDate,
    postedAt: person.postedAt || fallbackDate,
    updatedAt: person.updatedAt || fallbackDate,
  };
};

const getCreatedBy = (property) =>
  normalizeAuditPerson(property?.createdBy, property?.createdAt);

const getPostedBy = (property) =>
  normalizeAuditPerson(
    property?.postedBy,
    property?.postedBy?.postedAt || property?.createdAt,
  );

const getUpdateHistory = (property) => {
  const history = Array.isArray(property?.updateHistory)
    ? property.updateHistory
        .map((item) => normalizeAuditPerson(item, item?.updatedAt || property?.updatedAt))
        .filter(Boolean)
    : [];

  if (history.length === 0 && property?.lastUpdatedBy) {
    history.push(normalizeAuditPerson(property.lastUpdatedBy, property?.updatedAt));
  }

  return history.sort(
    (a, b) => new Date(b?.updatedAt || 0) - new Date(a?.updatedAt || 0),
  );
};

const getLastUpdatedBy = (property) => {
  const latest =
    normalizeAuditPerson(property?.lastUpdatedBy, property?.updatedAt) ||
    getUpdateHistory(property)[0];

  if (latest) return latest;

  const postedBy = getPostedBy(property);
  if (!property?.updatedAt && !postedBy) return null;

  return {
    ...(postedBy || {}),
    name: postedBy?.name || "Unknown user",
    updatedAt: property?.updatedAt,
  };
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

/** Backend area-unit enums → display labels */
const AREA_UNIT_LABELS = {
  sqft: "Sqft",
  sqmt: "Sq.mt",
  sqyd: "Sq.yd",
  acre: "Acre",
  guntha: "Guntha",
  cent: "Cent",
  kanal: "Kanal",
  hectare: "Hectare",
};

const normalizeAreaUnit = (unit) =>
  String(unit || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/\./g, "")
    .replace("acres", "acre")
    .replace("acer", "acre")
    .replace("sqfeet", "sqft")
    .replace("squarefeet", "sqft")
    .replace("squareyards", "sqyd")
    .replace("squareyard", "sqyd");

const formatAreaUnit = (unit, fallback = "sqft") => {
  const key = normalizeAreaUnit(unit || fallback) || fallback;
  return AREA_UNIT_LABELS[key] || capitalize(unit || fallback);
};

/** Resolve rate/area unit from live property payload by category. */
const resolvePropertyAreaUnit = (property, category) => {
  if (!property) return "sqft";
  const cat = category || detectCategory(property);

  if (cat === "land") {
    return property.plotAreaUnit || property.areaUnit || "sqft";
  }
  if (cat === "agricultural") {
    return (
      property.totalArea?.unit ||
      property.areaUnit ||
      property.plotAreaUnit ||
      "acre"
    );
  }
  return (
    property.carpetAreaUnit ||
    property.builtUpAreaUnit ||
    property.areaUnit ||
    property.plotAreaUnit ||
    "sqft"
  );
};

const formatAreaValue = (value, unit, fallbackUnit = "sqft") => {
  if (value === null || value === undefined || value === "") return null;
  const num = Number(value);
  const display = Number.isFinite(num) ? num.toLocaleString("en-IN") : value;
  return `${display} ${formatAreaUnit(unit, fallbackUnit)}`;
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
            Property Code
          </p>
          <p className="font-mono text-[11px] font-semibold text-emerald-700 break-all">
            {property.propertyCode || "—"}
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

// ─── Compact audit person row cards ───────────────────────────────────────────
const AUDIT_CARD_STYLES = {
  created: {
    label: "Created By",
    icon: UserPlus,
    headerBg: "bg-violet-50",
    headerText: "text-violet-600",
    iconBg: "bg-violet-50",
  },
  posted: {
    label: "Posted By",
    icon: Send,
    headerBg: "bg-green-50",
    headerText: "text-[#27AE60]",
    iconBg: "bg-[#27AE60]/10",
  },
  updated: {
    label: "Last Updated By",
    icon: RefreshCw,
    headerBg: "bg-blue-50",
    headerText: "text-blue-600",
    iconBg: "bg-blue-50",
  },
  approved: {
    label: "Approved By",
    icon: ShieldCheck,
    headerBg: "bg-emerald-50",
    headerText: "text-emerald-700",
    iconBg: "bg-emerald-50",
  },
};

function AuditPersonCard({ type, person, when, extra }) {
  if (!person) return null;
  const style = AUDIT_CARD_STYLES[type] || AUDIT_CARD_STYLES.updated;
  const Icon = style.icon || User;
  const idTail = String(person._id || person.userId || "").slice(-4);

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden min-w-0">
      <div
        className={`flex items-center gap-1.5 px-3 py-1.5 border-b border-slate-100 ${style.headerBg}`}
      >
        <Icon className={`w-3 h-3 shrink-0 ${style.headerText}`} />
        <span
          className={`text-[9px] font-bold uppercase tracking-widest ${style.headerText}`}
        >
          {style.label}
        </span>
      </div>
      <div className="px-3 py-2.5 flex items-center gap-2.5 min-w-0">
        <div
          className={`w-7 h-7 rounded-md ${style.iconBg} flex items-center justify-center shrink-0`}
        >
          <User className={`w-3.5 h-3.5 ${style.headerText}`} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="text-xs font-bold text-slate-800 capitalize truncate">
              {person.name || "—"}
            </p>
            {idTail && (
              <span className="text-[9px] text-slate-400 font-mono shrink-0">
                …{idTail}
              </span>
            )}
            {person.roleName && (
              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-slate-50 text-slate-600 border border-slate-100 capitalize shrink-0">
                {formatRoleName(person.roleName)}
              </span>
            )}
          </div>
          <p className="text-[10px] text-slate-500 truncate mt-0.5">
            {[person.email, person.phone].filter(Boolean).join(" · ") || "—"}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5 truncate">
            {when ? formatDateTime(when) : "—"}
            {extra ? ` · ${extra}` : ""}
          </p>
        </div>
      </div>
    </div>
  );
}

function CreatedByCard({ person }) {
  return (
    <AuditPersonCard
      type="created"
      person={person}
      when={person?.createdAt || person?.postedAt || person?.updatedAt}
    />
  );
}

function PostedByCard({ person }) {
  return (
    <AuditPersonCard type="posted" person={person} when={person?.postedAt} />
  );
}

function LastUpdatedByCard({ person, updateCount }) {
  return (
    <AuditPersonCard
      type="updated"
      person={person}
      when={person?.updatedAt}
      extra={`${updateCount || 0} updates`}
    />
  );
}

function ApprovedByCard({ person, when }) {
  return (
    <AuditPersonCard
      type="approved"
      person={person}
      when={when}
      extra="Went live"
    />
  );
}

const getApprovedBy = (property) => {
  const raw = property?.approvedBy;
  if (!raw) return null;
  if (typeof raw === "object") {
    return normalizeAuditPerson(raw, property?.approvedAt || property?.approval?.approvedAt);
  }
  return normalizeAuditPerson(
    { _id: raw, name: "Approver" },
    property?.approvedAt || property?.approval?.approvedAt,
  );
};

function UpdateHistoryPanel({ property }) {
  const history = getUpdateHistory(property);
  const lastUpdated =
    normalizeAuditPerson(property?.lastUpdatedBy, property?.updatedAt) ||
    history[0];
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
  const areaUnit = resolvePropertyAreaUnit(property, "residential");
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
            value={formatConstructionStatus(property.constructionStatus)}
          />
          <MetaItem
            label="Property Age"
            value={formatPropertyAge(property.propertyAge)}
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
                  <span className="text-xs font-normal">
                    {formatAreaUnit(areaUnit)}
                  </span>
                </p>
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center gap-3">
              <Move className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500">Built-up Area</p>
                <p className="text-lg font-extrabold text-slate-800">
                  {property.builtUpArea?.toLocaleString() || 0}{" "}
                  <span className="text-xs font-normal">
                    {formatAreaUnit(areaUnit)}
                  </span>
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
  const areaUnit = resolvePropertyAreaUnit(property, "commercial");
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
            value={formatConstructionStatus(property.constructionStatus)}
          />
          <MetaItem
            label="Furnished Status"
            value={capitalize(property.furnishedStatus)}
          />
          <MetaItem
            label="Property Age"
            value={formatPropertyAge(property.propertyAge)}
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
                <span className="text-xs font-normal">
                  {formatAreaUnit(areaUnit)}
                </span>
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
              <p className="text-xs text-slate-500">Built-up Area</p>
              <p className="text-lg font-extrabold text-slate-800">
                {property.builtUpArea?.toLocaleString() || 0}{" "}
                <span className="text-xs font-normal">
                  {formatAreaUnit(areaUnit)}
                </span>
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
  const areaUnit = resolvePropertyAreaUnit(property, "land");
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
                <span className="text-sm font-normal ml-1">
                  {formatAreaUnit(areaUnit)}
                </span>
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
      <div className="p-3 space-y-2">
        {docs.map((doc, i) => {
          const isImage = Boolean(doc.mimetype?.startsWith("image") || /\.(png|jpe?g|webp|gif)$/i.test(doc.filename || doc.url || ""));
          return (
            <div
              key={doc.key || doc.url || i}
              className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-2.5 py-2"
            >
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-white border border-slate-100 shrink-0 flex items-center justify-center">
                {isImage && doc.url ? (
                  <img
                    src={doc.url}
                    alt={doc.filename || "document"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = Fallback;
                    }}
                  />
                ) : (
                  <ShieldCheck className="w-5 h-5 text-slate-300" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-800 truncate">
                  {doc.filename || doc.title || "Document"}
                </p>
                <div className="mt-0.5 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-400 capitalize">
                    {doc.type?.replace(/_/g, " ") || "Document"}
                  </span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border capitalize ${
                      statusStyle[doc.status] ||
                      "bg-slate-100 text-slate-600 border-slate-200"
                    }`}
                  >
                    {doc.status || "pending"}
                  </span>
                </div>
              </div>

              {doc.url && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg border border-[#27AE60]/30 bg-[#27AE60]/10 text-[#27AE60] text-[11px] font-bold hover:bg-[#27AE60]/15 transition"
                    title="View document"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View
                  </a>
                  <a
                    href={doc.url}
                    download={doc.filename || true}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-slate-600 text-[11px] font-bold hover:bg-slate-100 transition"
                    title="Download document"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}

/** Scroll page to top without fighting nested containers. */
const scrollPageToTop = () => {
  if (typeof window === "undefined") return;
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function IndetailsProperty({
  propertyData,
  category: propCategory,
}) {
  const navigate = useNavigate();
  const [activeImage, setActiveImage] = useState(0);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const pageTopRef = useRef(null);

  const { category, id } = useParams();

  // Always land at top when opening / returning to this property (no mid-page jump)
  useEffect(() => {
    setActiveImage(0);
    setGalleryOpen(false);
    scrollPageToTop();
    // After paint (images/banners) keep top stable
    const t1 = window.requestAnimationFrame(() => scrollPageToTop());
    const t2 = window.setTimeout(() => {
      scrollPageToTop();
      pageTopRef.current?.scrollIntoView?.({ block: "start", behavior: "auto" });
    }, 0);
    return () => {
      window.cancelAnimationFrame(t1);
      window.clearTimeout(t2);
    };
  }, [category, id]);

  const {
    data: propertyResponse,
    isLoading,
    isError,
    error: analyticsError,
  } = useQuery({
    queryKey: ["property", category, id],
    queryFn: async () => {
      const res = await getPropertyById(category, id);
      return res.data;
    },
    enabled: !!category && !!id,
    staleTime: 30_000,
  });

  const { data: meResponse, isLoading: meLoading } = useQuery({
    queryKey: ["current-user"],
    queryFn: getUserDetails,
    staleTime: 60_000,
  });
  const currentUser =
    meResponse?.data?.user || meResponse?.data || meResponse?.user || null;

  const property = propertyResponse?.data;
  const analyticsData = propertyResponse?.data?.analytics;
  // Wait for current user before deciding Approve UI — avoids top banner popping in and shifting layout
  const showApproveActions = Boolean(
    property &&
      !meLoading &&
      isPropertyAwaitingApproval(property) &&
      canApproveProperty(currentUser, property),
  );
  const needsReverification = Boolean(
    property && isPropertyReverification(property),
  );
  const creatorTag = property ? getPropertyCreatorTag(property) : "User";
  const approvedByPerson = property ? getApprovedBy(property) : null;
  const approvedAtValue =
    property?.approvedAt || property?.approval?.approvedAt || null;

  // First visit only — keep previous paint when revisiting so the screen does not jump
  if (isLoading && !property) {
    return <LoadingSpinner />;
  }

  if (isError && !property) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-6 text-sm font-semibold text-rose-700">
        {analyticsError?.response?.data?.message ||
          analyticsError?.message ||
          "Failed to load property"}
      </div>
    );
  }

  if (!property) {
    return <div>Property Not Found</div>;
  }

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
  const createdBy = getCreatedBy(property);
  const postedBy = getPostedBy(property);
  const lastUpdatedBy = getLastUpdatedBy(property);
  const updateCount = property.updateCount ?? getUpdateHistory(property).length;

  // Category label for display
  const categoryLabels = {
    residential: "Residential",
    commercial: "Commercial",
    land: "Land",
    agricultural: "Agricultural",
  };

  return (
    <div ref={pageTopRef} className="space-y-5 pb-12 scroll-mt-20">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-slate-500 flex-wrap">
        <button
          type="button"
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
          value={isLoading ? "..." : totalLeads}
          color="purple"
        />
      </div>

      {/* ── HERO PANEL ────────────────────────────────────────────────── */}
      <SectionCard>
        <div className="grid grid-cols-1 lg:grid-cols-5">
          {/* Image column */}
          <div className="lg:col-span-2 relative">
            <button
              type="button"
              onClick={() => images.length > 0 && setGalleryOpen(true)}
              className="block w-full h-64 sm:h-80 lg:h-full min-h-[200px] max-h-[400px] bg-slate-100 relative overflow-hidden text-left"
              title={images.length ? "Open gallery" : undefined}
            >
              <img
                src={displayImage}
                alt={property.title}
                className="w-full h-full object-cover transition-all duration-500"
                onError={(e) => {
                  e.target.src = Fallback;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
              <div className="absolute top-3 left-3 flex gap-2 flex-wrap pointer-events-none">
                <StatusBadge status={property.status} />
                <CategoryBadge category={category} />
              </div>
              {/* Completion bar */}
              <div className="absolute bottom-0 left-0 right-0 px-4 pb-3 pointer-events-none">
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
              {images.length > 0 && (
                <span className="absolute bottom-10 right-3 px-2.5 py-1 rounded-lg bg-[#27AE60] text-white text-[10px] font-bold shadow">
                  Open gallery
                </span>
              )}
            </button>
            {images.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto bg-slate-50 border-t">
                {images.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setActiveImage(i);
                      setGalleryOpen(true);
                    }}
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
            <div className="flex w-full flex-col gap-2">
              {showApproveActions && (
                <div
                  className={`mt-3 flex w-full items-center justify-between rounded-xl border px-4 py-3 ${
                    needsReverification
                      ? "border-amber-200 bg-amber-50"
                      : "border-blue-200 bg-blue-50"
                  }`}
                >
                  <div>
                    <p
                      className={`text-sm font-bold ${
                        needsReverification ? "text-amber-800" : "text-blue-700"
                      }`}
                    >
                      {needsReverification
                        ? `Re-verification required · Edited after live · ${creatorTag}`
                        : `Pending approval · Created by ${creatorTag}`}
                    </p>
                    <p
                      className={`mt-1 text-xs ${
                        needsReverification ? "text-amber-700" : "text-blue-500"
                      }`}
                    >
                      {needsReverification
                        ? "Data or documents changed after go-live. Only higher hierarchy can approve again. Approve button is hidden for other staff and after live."
                        : "Only higher hierarchy can approve this listing to go live. Once approved, Approve is hidden for everyone."}
                      {!needsReverification &&
                        (completion === 70
                          ? " Agent listing — approve from this details page."
                          : " Review documents, then approve.")}
                    </p>
                  </div>
                  <BadgeCheck
                    className={`h-8 w-8 shrink-0 ${
                      needsReverification ? "text-amber-600" : "text-blue-600"
                    }`}
                  />
                </div>
              )}

              {showApproveActions && (
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await verifyAgentPropertyVerification(
                        category,
                        property._id,
                        {
                          status: "verified",
                        },
                      );

                      toast.success(
                        needsReverification
                          ? "Re-verified — property is live again"
                          : "Property verified successfully and published live",
                      );
                      navigate(`/properties`);
                    } catch (err) {
                      toast.error(
                        err?.response?.data?.message || "Verification failed",
                      );
                    }
                  }}
                  className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 font-bold text-white transition hover:bg-green-700"
                >
                  <BadgeCheck className="h-5 w-5" />
                  {needsReverification ? "Re-approve → Live" : "Approve → Live"}
                </button>
              )}

              {isActive && approvedByPerson ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                  <p className="text-sm font-bold text-emerald-800">
                    Live · Approved by {approvedByPerson.name || "staff"}
                  </p>
                  <p className="mt-1 text-xs text-emerald-700">
                    Approved{" "}
                    {approvedAtValue
                      ? formatDateTime(approvedAtValue)
                      : "—"}{" "}
                    · Created time stays original. Edit will require re-verification.
                  </p>
                </div>
              ) : null}
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

              {property.buildingName?.trim() && (
                <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 mt-2">
                  <Building2 className="w-4 h-4 text-[#27AE60] flex-shrink-0" />
                  <span className="truncate">{property.buildingName.trim()}</span>
                </div>
              )}

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
                  ₹{property.pricePerSqft?.toLocaleString("en-IN")} /{" "}
                  {formatAreaUnit(
                    resolvePropertyAreaUnit(property, category),
                  ).toLowerCase()}
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
                    value={formatAreaValue(
                      property.carpetArea,
                      resolvePropertyAreaUnit(property, category),
                    )}
                  />
                  <MetaItem
                    label="Furnishing"
                    value={capitalize(property.furnishing)}
                  />
                  <MetaItem
                    label="Construction"
                    value={formatConstructionStatus(property.constructionStatus)}
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
                    value={formatAreaValue(
                      property.carpetArea,
                      resolvePropertyAreaUnit(property, category),
                    )}
                  />
                  <MetaItem label="Seats" value={property.seats} />
                  <MetaItem label="Cabins" value={property.cabins} />
                  <MetaItem
                    label="Construction"
                    value={formatConstructionStatus(property.constructionStatus)}
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
                    value={formatAreaValue(
                      property.plotArea,
                      resolvePropertyAreaUnit(property, category),
                    )}
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
                      value={formatAreaValue(
                        property.totalArea.value,
                        property.totalArea.unit ||
                          resolvePropertyAreaUnit(property, category),
                        "acre",
                      )}
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

      {/* ── CREATED / POSTED / APPROVED / LAST UPDATED ─────────────── */}
      {(createdBy || postedBy || lastUpdatedBy || approvedByPerson) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2">
          <CreatedByCard person={createdBy} />
          <PostedByCard person={postedBy} />
          <ApprovedByCard person={approvedByPerson} when={approvedAtValue} />
          <LastUpdatedByCard person={lastUpdatedBy} updateCount={updateCount} />
        </div>
      )}

      <GalleryLightbox
        open={galleryOpen}
        images={images}
        initialIndex={activeImage}
        onClose={() => setGalleryOpen(false)}
        title={property.title || "Property gallery"}
      />

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


