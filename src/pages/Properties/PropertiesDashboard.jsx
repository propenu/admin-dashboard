//propenuadmindashborad/src/pages/Properties/PropertiesDashboard.jsx

import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  Activity,
  BadgeCheck,
  BarChart3,
  Building2,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Download,
  Eye,
  Filter,
  Globe,
  Layers,
  Mail,
  MapPin,
  MessageSquare,
  MousePointerClick,
  PieChart,
  Phone,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Trash2,
  UserRound,
  X,
  Zap,
} from "lucide-react";

import PropertyCardThumb from "../../components/common/PropertyCardThumb";
import { saInset, saSurface, saSurfaceHover } from "../Dashboards/superAdminDashboard/dashboardSurface";
import PropertyPromoteModal, {
  propertyPromoTypeMeta,
} from "../../components/property/PropertyPromoteModal";
import ConfirmModal from "../features/property/components/shared/ConfirmModal";
import {
  getPromotionTracking,
  promotionLifecycleClass,
  promotionLifecycleCopy,
  titlePromotionType,
} from "../features/property/components/shared/promotionTracking";
import {
  promotePropertyListing,
  renewPropertyListing,
  expirePropertyListing,
} from "../../services/Common/propertyPromotionService";
import { setActiveCategory } from "../../store/Ui/uiSlice";
import { navigateToPropertyEdit } from "../../utils/openPropertyEdit";
import { useCurrentUser } from "../../store/properties/useCurrentUser";
import {
  getAdminPropertyListings,
  getAllPropertiesAnalytics,
  propertiesAnalytics,
} from "../../features/property/propertyService";
import { deleteResidential } from "../../services/ResidentialServices/ResidentialServices";
import { deleteCommercial } from "../../services/CommercialServices/CommercialServices";
import { deleteAgricultural } from "../../services/AgricuturalServices/AgricuturalServices";
import { deleteLand } from "../../services/LandServices/LandServices";
import {
  getCreatedByDisplayName,
  getCreatedByRoleLabel,
  isAgentCreatedProperty,
} from "../../utils/propertyCreatorRole";
import { canReviewPropertyListing, canEditPendingProperty } from "../../utils/propertyAccessControl";
import { todayIso } from "../Dashboards/shared/dashboardDateRange";

const CATEGORIES = [
  { value: "all", label: "All properties" },
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
  { value: "agricultural", label: "Agricultural" },
  { value: "land", label: "Land" },
];
const PROPERTY_CATEGORIES = CATEGORIES.filter((item) => item.value !== "all");

/** Scalable listing-type sub-filters (Sale / Rent). Add values here as needed. */
const LISTING_TYPE_FILTERS = [
  { value: "all", label: "All", match: null },
  { value: "sale", label: "Sale", match: ["sale", "sell"] },
  { value: "rent", label: "Rent", match: ["rent", "rental", "lease"] },
];

const normalizeListingType = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");

const getPropertyListingType = (property) =>
  normalizeListingType(property?.listingType || property?.lookingTo || "sale");

const STATUSES = [
  { value: "all", label: "All status" },
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "draft", label: "Draft" },
  { value: "rejected", label: "Rejected" },
];

const PROMOTION_TYPE_FILTERS = [
  { value: "all", label: "All boosts", tone: "slate" },
  { value: "prime", label: "Prime", tone: "amber" },
  { value: "featured", label: "Top Selling", tone: "sky" },
  { value: "sponsored", label: "Sponsored", tone: "violet" },
  { value: "normal", label: "Normal", tone: "slate" },
];

const PROMOTION_TRACKING_FILTERS = [
  { value: "all", label: "All lifecycle" },
  { value: "promoted", label: "Ever promoted" },
  { value: "active", label: "Boost active" },
  { value: "expiringSoon", label: "Expiring soon" },
  { value: "expired", label: "Expired" },
];

const promoFilterChipClass = (tone, active) => {
  if (!active) {
    return "border-emerald-100 bg-white text-[#0f3d2e] hover:border-emerald-300";
  }
  if (tone === "amber") return "border-amber-400 bg-amber-400 text-amber-950 shadow-[0_4px_10px_rgba(245,158,11,0.25)]";
  if (tone === "sky") return "border-emerald-400 bg-[#27AE60] text-white shadow-[0_4px_10px_rgba(39,174,96,0.25)]";
  if (tone === "violet") return "border-emerald-600 bg-[#27AE60] text-white shadow-[0_4px_10px_rgba(18,161,80,0.24)]";
  return "border-[#27AE60] bg-[#27AE60] text-white shadow-[0_4px_10px_rgba(39,174,96,0.25)]";
};

const normalizeStatusParam = (value = "") => {
  const key = String(value || "").trim().toLowerCase();
  if (key === "onboarding" || key === "incomplete") return "draft";
  return key || "all";
};

const PAGE_SIZE = 12;

const DELETE_PROPERTY = {
  residential: deleteResidential,
  commercial: deleteCommercial,
  agricultural: deleteAgricultural,
  land: deleteLand,
};

const VERIFICATION_ROUTES = {
  residential: (id) => `/residential-property-verification/${id}`,
  commercial: (id) => `/commercial-property-verification/${id}`,
  agricultural: (id) => `/agricultural-property-verification/${id}`,
  land: (id) => `/land-property-verification/${id}`,
};

const fmtNum = (value) => {
  const number = Number(value) || 0;
  if (number >= 1_00_000) return `${(number / 1_00_000).toFixed(1)}L`;
  if (number >= 1_000) return `${(number / 1_000).toFixed(1)}K`;
  return String(number);
};

const titleCase = (value) =>
  String(value || "Unknown")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const pct = (part, total) => (!total ? 0 : Math.round((Number(part || 0) / total) * 100));

const cleanRows = (rows = []) =>
  rows
    .filter((row) => row?._id && row._id !== "unknown")
    .sort((a, b) => (b.total || 0) - (a.total || 0));

const buildAnalyticsParams = (filters, dateRange = {}) => {
  const params = {};
  if (filters.state) params.state = filters.state;
  if (filters.city) params.city = filters.city;
  if (filters.locality) params.locality = filters.locality;
  if (dateRange.from) params.from = dateRange.from;
  if (dateRange.to) params.to = dateRange.to;
  return params;
};

function MetricCard({ label, value, sub, icon: Icon, tone = "emerald", active, onClick, percent = 0 }) {
  const toneClass = {
    emerald: "from-emerald-500 to-green-600 text-white",
    amber: "from-amber-400 to-orange-500 text-white",
    sky: "from-sky-500 to-blue-600 text-white",
    slate: "from-emerald-600 to-emerald-800 text-white",
  }[tone];
  const ringColor = {
    emerald: "#27AE60",
    amber: "#F59E0B",
    sky: "#0EA5E9",
    slate: "#334155",
  }[tone];
  const safePercent = Math.max(0, Math.min(100, percent));

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl p-3 text-left hover:-translate-y-0.5 ${saSurfaceHover} ${
        active
          ? "border-[#27AE60] bg-[#e8f8ee] shadow-[0_8px_18px_-6px_rgba(39,174,96,0.45)]"
          : saSurface
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-semibold uppercase tracking-[0.06em] text-emerald-600">{label}</p>
          <p className="mt-1 text-xl font-semibold text-[#0f3d2e]">{fmtNum(value)}</p>
          {sub && <p className="mt-0.5 truncate text-[11px] font-medium text-[#5c7d6d]">{sub}</p>}
        </div>
        <div
          className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full"
          style={{
            background: `conic-gradient(${ringColor} ${safePercent * 3.6}deg, #e8f5ee 0deg)`,
          }}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
            <span className={`rounded-xl bg-gradient-to-br ${toneClass} p-2 shadow-sm`}>
              <Icon className="h-4 w-4" />
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

function BreakdownRow({ row, total, color = "bg-emerald-500", onClick, selected }) {
  const width = pct(row.total, total);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-xl p-2.5 text-left transition ${
        selected ? "bg-emerald-50 ring-1 ring-emerald-200" : "hover:bg-emerald-50/60"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold text-[#0f3d2e]">{titleCase(row._id)}</p>
          <p className="truncate text-[10.5px] text-[#5c7d6d]">
            Active {row.active || 0} • Pending {row.pending || 0} • Draft {row.draft || 0}
          </p>
        </div>
        <span className="text-sm font-semibold text-[#0f3d2e]">{fmtNum(row.total)}</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-emerald-50">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${width}%` }} />
      </div>
    </button>
  );
}

function Panel({ title, sub, icon: Icon, children, action, className = "" }) {
  return (
    <section className={`min-w-0 max-w-full overflow-hidden rounded-2xl p-3 sm:p-4 ${saSurface} ${className}`}>
      <div className="mb-3 flex min-w-0 flex-col items-start justify-between gap-2 sm:flex-row sm:gap-3">
        <div className="min-w-0 max-w-full">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="h-4 w-4 text-emerald-600" />}
            <h2 className="text-[13px] font-semibold uppercase tracking-[0.06em] text-[#0f3d2e]">{title}</h2>
          </div>
          {sub && <p className="mt-0.5 break-words text-[11px] text-[#5c7d6d]">{sub}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function StatusDonut({ overview, total }) {
  const active = pct(overview.activeProperties, total);
  const pending = pct(overview.pendingProperties, total);
  const draft = pct(overview.draftProperties, total);
  const activeDeg = active * 3.6;
  const pendingDeg = pending * 3.6;
  const draftDeg = draft * 3.6;

  return (
    <div className="mb-3 flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/40 p-3">
      <div
        className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full"
        style={{
          background: `conic-gradient(#27AE60 0deg ${activeDeg}deg, #F59E0B ${activeDeg}deg ${activeDeg + pendingDeg}deg, #5c7d6d ${activeDeg + pendingDeg}deg ${activeDeg + pendingDeg + draftDeg}deg, #e8f5ee ${activeDeg + pendingDeg + draftDeg}deg 360deg)`,
        }}
      >
        <div className="flex h-12 w-12 flex-col items-center justify-center rounded-full bg-white">
          <span className="text-sm font-semibold text-[#0f3d2e]">{fmtNum(total)}</span>
          <span className="text-[9px] font-medium text-[#5c7d6d]">Total</span>
        </div>
      </div>
      <div className="grid flex-1 gap-1 text-[11px] font-medium text-[#5c7d6d]">
        <span className="flex items-center justify-between gap-2">
          <span><i className="mr-1.5 inline-block h-2 w-2 rounded-full bg-emerald-500" />Active</span>
          <b>{active}%</b>
        </span>
        <span className="flex items-center justify-between gap-2">
          <span><i className="mr-1.5 inline-block h-2 w-2 rounded-full bg-amber-500" />Pending</span>
          <b>{pending}%</b>
        </span>
        <span className="flex items-center justify-between gap-2">
          <span><i className="mr-1.5 inline-block h-2 w-2 rounded-full bg-[#5c7d6d]" />Draft</span>
          <b>{draft}%</b>
        </span>
      </div>
    </div>
  );
}

function MiniLineChart({ values = [], color = "#27AE60" }) {
  const numericValues = (Array.isArray(values) ? values : []).map((value) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  });
  const series = numericValues.length ? numericValues : [0, 0];
  const max = Math.max(...series, 1);
  const points = series
    .map((value, index) => {
      const x = (index / Math.max(series.length - 1, 1)) * 100;
      const y = 34 - (value / max) * 28;
      return `${Number.isFinite(x) ? x : 0},${Number.isFinite(y) ? y : 34}`;
    })
    .join(" ");

  return (
    <svg viewBox="0 0 100 38" className="mt-2 h-9 w-full overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline
        points={`0,36 ${points} 100,36`}
        fill={`${color}18`}
        stroke="none"
      />
    </svg>
  );
}

function useDebounce(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timeout);
  }, [value, delay]);

  return debounced;
}

const formatPrice = (price) => {
  if (typeof price !== "number") return "Price on request";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    notation: price >= 100000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(price);
};

const BADGE_BASE =
  "inline-flex h-5 max-w-full items-center gap-0.5 overflow-hidden whitespace-nowrap rounded-full border border-[#c0c4cc] px-2 text-[9px] font-bold uppercase tracking-wide shadow-[0_2px_8px_rgba(192,192,192,0.55)]";

const CARD_CHROME =
  "border border-[#c0c4cc] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_10px_22px_-8px_rgba(192,192,192,0.7)] transition hover:border-[#a8adb6] hover:shadow-[0_2px_4px_rgba(15,23,42,0.06),0_14px_26px_-8px_rgba(192,192,192,0.8)]";

const CATEGORY_BADGE = {
  residential: "bg-[#27AE60] text-white",
  commercial: "bg-[#1e8f4d] text-white",
  agricultural: "bg-[#0f3d2e] text-white",
  land: "bg-[#16a34a] text-white",
};

const STATUS_BADGE = {
  active: "bg-[#27AE60] text-white",
  rejected: "bg-[#e11d48] text-white",
  pending: "bg-[#f59e0b] text-white",
  draft: "bg-[#f59e0b] text-white",
};

const formatPostedAt = (value) => {
  if (!value) return "Posting time unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Posting time unavailable";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const getStatus = (property) => {
  if (property?.status === "draft" && property?.rejectedReason) return "rejected";
  return property?.status || "draft";
};

const PropertyGridCard = memo(function PropertyGridCard({
  property,
  canReview,
  canEditPending,
  promoteBusy,
  index,
  onOpen,
  onEdit,
  onReview,
  onDelete,
  onPromote,
  onRenew,
  onExpire,
}) {
  return (
    <PropertyCard
      property={property}
      category={property._category}
      canReview={canReview}
      canEditPending={canEditPending}
      index={index}
      promoteBusy={promoteBusy}
      onOpen={() => onOpen(property)}
      onEdit={() => onEdit(property)}
      onReview={() => onReview(property)}
      onDelete={() => onDelete(property)}
      onPromote={onPromote}
      onRenew={onRenew}
      onExpire={onExpire}
    />
  );
});

function PropertyCard({
  property,
  category,
  canReview,
  canEditPending,
  onOpen,
  onEdit,
  onReview,
  onDelete,
  onPromote,
  onRenew,
  onExpire,
  promoteBusy,
  index = 0,
}) {
  const [openLeads, setOpenLeads] = useState(false);
  const status = getStatus(property);
  const creatorRole = getCreatedByRoleLabel(property);
  const creator = getCreatedByDisplayName(property) || "Unknown user";
  const propertyName =
    category === "residential" || category === "commercial"
      ? property?.buildingName
      : property?.landName;
  const location = [property?.locality, property?.city, property?.state]
    .filter(Boolean)
    .join(", ");
  const tracking = getPromotionTracking(property);
  const promoType = tracking.currentType || property?.promotion?.type || "normal";
  const promoMeta = propertyPromoTypeMeta(promoType);
  const PromoIcon = promoMeta.icon;
  const canPromoteListing = status === "active";
  const isBoosted = promoType !== "normal";

  const { data: leadsData, isLoading: leadsLoading } = useQuery({
    queryKey: ["property-leads", property?._id],
    queryFn: async () => {
      const res = await propertiesAnalytics(property?._id);
      return res.data;
    },
    enabled: Boolean(openLeads && property?._id),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const leads = Array.isArray(leadsData?.data) ? leadsData.data : [];
  const totalLeads =
    typeof leadsData?.count === "number" ? leadsData.count : leads.length;

  const exportLeads = (type) => {
    const rows = leads.map((lead, index) => ({
      SNo: index + 1,
      Name: lead.name,
      Phone: lead.phone,
      Email: lead.email,
      Status: lead.status,
      Remarks: lead.remarks,
      Date: lead.createdAt ? new Date(lead.createdAt).toLocaleString("en-IN") : "",
    }));

    const ws = XLSX.utils.json_to_sheet(rows);

    if (type === "csv") {
      saveAs(
        new Blob([XLSX.utils.sheet_to_csv(ws)], {
          type: "text/csv;charset=utf-8;",
        }),
        `property-leads-${property?._id}.csv`,
      );
      return;
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Property Leads");
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([buf], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
      }),
      `property-leads-${property?._id}.xlsx`,
    );
  };

  return (
    <>
      <article
        onClick={onOpen}
        style={{
          animation: "propertyRowIn 360ms ease both",
          animationDelay: `${Math.min(index * 35, 280)}ms`,
        }}
        className={`group flex h-full w-full min-w-0 max-w-full cursor-pointer flex-col overflow-hidden rounded-2xl text-left sm:flex-row sm:items-stretch ${CARD_CHROME}`}
      >
      <PropertyCardThumb
        property={property}
        variant="dashboard"
      >
        <div className="absolute left-1.5 top-1.5 z-[3] flex max-w-[calc(100%-12px)] flex-wrap gap-1">
          <span
            className={`${BADGE_BASE} ${
              CATEGORY_BADGE[category] || "bg-[#0f3d2e] text-white"
            }`}
          >
            {category}
          </span>
          <span
            className={`${BADGE_BASE} ${
              getPropertyListingType(property) === "rent" ||
              getPropertyListingType(property) === "lease" ||
              getPropertyListingType(property) === "rental"
                ? "bg-[#0f3d2e] text-white"
                : "bg-[#27AE60] text-white"
            }`}
          >
            {getPropertyListingType(property) === "rent" ||
            getPropertyListingType(property) === "lease" ||
            getPropertyListingType(property) === "rental"
              ? "Rent"
              : "Sale"}
          </span>
          <span
            className={`${BADGE_BASE} ${
              STATUS_BADGE[status] || "bg-[#f59e0b] text-white"
            }`}
          >
            {status}
          </span>
        </div>
        <div className="absolute inset-x-2 bottom-2 z-[3] flex items-center justify-between gap-1">
          {creatorRole ? (
            <span
              title={creatorRole}
              className={`${BADGE_BASE} min-w-0 max-w-[58%] text-white ${
                /agent/i.test(creatorRole) ? "bg-[#0f3d2e]" : "bg-[#27AE60]"
              }`}
            >
              <ShieldCheck className="h-2.5 w-2.5 shrink-0 text-white" />
              <span className="truncate">{creatorRole}</span>
            </span>
          ) : (
            <span />
          )}
          <span
            className={`${BADGE_BASE} max-w-[42%] shrink-0 ${promoMeta.chip}`}
          >
            <PromoIcon className="h-2.5 w-2.5 shrink-0" />
            <span className="truncate">{titlePromotionType(promoType)}</span>
          </span>
        </div>
      </PropertyCardThumb>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col p-3 sm:p-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="line-clamp-2 min-h-[2.4em] text-[13px] font-semibold leading-snug text-[#0f3d2e] group-hover:text-emerald-700 sm:text-sm">
              {property?.title || "Unnamed property"}
            </h3>
            <p
              className={`mt-1 flex h-4 items-center gap-1 text-[11px] font-medium text-[#5c7d6d] ${
                propertyName?.trim() ? "" : "invisible"
              }`}
            >
              <Building2 className="h-3 w-3 shrink-0 text-emerald-600" />
              <span className="truncate">{propertyName?.trim() || "—"}</span>
            </p>
            <p className="mt-1 flex h-4 items-center gap-1 text-[11px] text-[#5c7d6d]">
              <MapPin className="h-3 w-3 shrink-0 text-emerald-600" />
              <span className="truncate">{location || "Location unavailable"}</span>
            </p>
          </div>
          <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300 transition group-hover:translate-x-0.5 group-hover:text-emerald-600" />
        </div>

        <p className="mt-2 text-sm font-medium text-emerald-700">
          {formatPrice(property?.price)}
        </p>

        {/* Promotion lifecycle strip — same concept as projects */}
        <div
          className={`mt-2 flex flex-wrap items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-[10px] font-semibold ${promotionLifecycleClass(
            tracking.lifecycle,
          )}`}
        >
          <Zap className="h-3 w-3 shrink-0" />
          <span>{promotionLifecycleCopy(tracking)}</span>
          {isBoosted && tracking.daysLeft != null ? (
            <span className="ml-auto rounded-full bg-white px-1.5 py-0.5 text-[9px] font-bold tabular-nums text-[#0f3d2e]">
              {tracking.daysLeft}d
            </span>
          ) : null}
        </div>

        <div className="mt-2 grid gap-x-3 gap-y-1 border-t border-emerald-50 pt-2 text-[10px] text-[#5c7d6d] sm:grid-cols-2">
          <span className="flex min-w-0 items-center gap-1.5">
            <UserRound className="h-3 w-3 shrink-0" />
            <span className="truncate" title={creator}>
              {creator}
            </span>
          </span>
          <span className="flex min-w-0 items-center gap-1.5">
            <Clock3 className="h-3 w-3 shrink-0" />
            <span className="truncate">{formatPostedAt(property?.createdAt)}</span>
          </span>
          <span className="truncate font-mono text-[9.5px] text-[#5c7d6d] sm:col-span-2">
            ID: {property?._id || "Unavailable"}
            {property?.propertyCode ? (
              <span className="ml-2 inline-flex items-center gap-1 border-l border-emerald-100 pl-2 text-[#5c7d6d]">
                <span className="font-sans text-[9px] font-semibold text-emerald-600">
                  Property Code
                </span>
                <span className="font-semibold text-emerald-700">
                  {property.propertyCode}
                </span>
              </span>
            ) : null}
          </span>
          <span
            className={`flex h-4 min-w-0 items-center gap-1.5 text-[10px] font-medium sm:col-span-2 ${
              status === "pending" ? "text-amber-700" : "invisible"
            }`}
          >
            <ShieldCheck className="h-3 w-3 shrink-0" />
            <span className="truncate">Document verification pending</span>
          </span>
        </div>

        <div className="mt-auto grid grid-cols-2 gap-2 pt-3 sm:flex sm:flex-wrap sm:items-center sm:gap-1.5 sm:pt-2">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setOpenLeads(true);
            }}
            className="inline-flex min-w-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-2 text-[10px] font-medium text-emerald-700 transition hover:bg-emerald-100 sm:py-1"
          >
            <BarChart3 className="h-3 w-3" />
            Leads{openLeads ? (leadsLoading ? " ..." : ` ${totalLeads}`) : ""}
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onOpen();
            }}
            className="inline-flex min-w-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-emerald-100 px-2.5 py-2 text-[10px] font-medium text-[#0f3d2e] transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 sm:py-1"
          >
            View <ChevronRight className="h-3 w-3" />
          </button>
          {status === "pending" ? (
            <>
              {canEditPending || canReview ? (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onEdit();
                  }}
                  className="inline-flex min-w-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-emerald-100 bg-white px-2.5 py-2 text-[10px] font-medium text-emerald-700 transition hover:bg-emerald-50 sm:py-1"
                >
                  Edit
                </button>
              ) : null}
              {canReview ? (
                <span className="relative inline-flex min-w-0">
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 animate-ping rounded-full bg-emerald-400/70"
                  />
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -inset-0.5 animate-pulse rounded-full bg-emerald-500/25"
                  />
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onReview();
                    }}
                    title="Action needed — approve or review this listing"
                    className="relative z-10 inline-flex min-w-0 items-center justify-center gap-1 overflow-hidden rounded-full bg-[#27AE60] px-2.5 py-2 text-[10px] font-semibold text-white shadow-[0_4px_10px_rgba(18,161,80,0.28)] ring-2 ring-emerald-300/80 transition hover:bg-[#1e8f4d] sm:py-1"
                  >
                    {Number(property?.completion?.percent) === 70 ||
                    isAgentCreatedProperty(property)
                      ? "Approve"
                      : "Review"}{" "}
                    <ChevronRight className="h-3 w-3 shrink-0" />
                  </button>
                </span>
              ) : null}
            </>
          ) : (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onEdit();
              }}
              className="inline-flex min-w-0 items-center justify-center gap-1 overflow-hidden rounded-full bg-[#27AE60] px-2.5 py-2 text-[10px] font-medium text-white transition hover:bg-[#1e8f4d] sm:py-1"
            >
              Edit
            </button>
          )}
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onDelete();
            }}
            className="inline-flex min-w-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-rose-200 bg-rose-50 px-2.5 py-2 text-[10px] font-medium text-rose-700 transition hover:border-rose-300 hover:bg-rose-100 sm:ml-auto sm:py-1"
          >
            <Trash2 className="h-3 w-3" />
            Delete
          </button>
          {canPromoteListing ? (
            <>
              <button
                type="button"
                disabled={promoteBusy}
                onClick={(event) => {
                  event.stopPropagation();
                  onPromote?.(property);
                }}
                className="inline-flex min-w-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-amber-200 bg-amber-50 px-2.5 py-2 text-[10px] font-bold text-amber-800 transition hover:bg-amber-100 disabled:opacity-50 sm:py-1"
              >
                <Sparkles className="h-3 w-3" />
                Promote
              </button>
              {isBoosted ? (
                <>
                  <button
                    type="button"
                    disabled={promoteBusy}
                    onClick={(event) => {
                      event.stopPropagation();
                      onRenew?.(property);
                    }}
                    className="inline-flex min-w-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-2 text-[10px] font-bold text-emerald-800 transition hover:bg-emerald-100 disabled:opacity-50 sm:py-1"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Renew
                  </button>
                  <button
                    type="button"
                    disabled={promoteBusy}
                    onClick={(event) => {
                      event.stopPropagation();
                      onExpire?.(property);
                    }}
                    className="inline-flex min-w-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-emerald-200 bg-white px-2.5 py-2 text-[10px] font-bold text-[#0f3d2e] transition hover:bg-emerald-50 disabled:opacity-50 sm:py-1"
                  >
                    Expire
                  </button>
                </>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </article>

      {openLeads && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-2 sm:p-4"
          onClick={(event) => {
            event.stopPropagation();
            setOpenLeads(false);
          }}
        >
          <div
            className="w-full max-w-5xl overflow-hidden rounded-[28px] border border-emerald-100 bg-[#f7fbf8] shadow-[0_24px_80px_rgba(16,185,129,0.16)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-emerald-50 p-3 sm:gap-4 sm:p-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-emerald-600">
                  Property leads
                </p>
                <h3 className="mt-1 text-xl font-semibold text-[#0f3d2e]">
                  {property?.title || "Unnamed property"}
                </h3>
                <p className="mt-1 text-sm text-[#5c7d6d]">
                  Total Leads: {totalLeads}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={!leads.length}
                    onClick={() => exportLeads("csv")}
                    className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Download className="h-4 w-4" /> CSV
                  </button>
                  <button
                    type="button"
                    disabled={!leads.length}
                    onClick={() => exportLeads("excel")}
                    className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-white px-3 py-2 text-xs font-medium text-[#0f3d2e] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Download className="h-4 w-4" /> Excel
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpenLeads(false)}
                className="rounded-full border border-emerald-100 bg-white p-2 text-[#5c7d6d] transition hover:bg-emerald-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-auto p-3 sm:max-h-[60vh] sm:p-5">
              {leadsLoading ? (
                <div className="py-10 text-center text-[#5c7d6d]">Loading leads...</div>
              ) : leads.length === 0 ? (
                <div className="py-10 text-center text-[#5c7d6d]">No leads found</div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-emerald-100">
                  <table className="w-full min-w-[780px]">
                    <thead>
                      <tr className="border-b border-emerald-50 bg-emerald-50/50">
                        {["#", "Lead Profile", "Contact", "Status", "Remarks", "Approval", "Created", "Actions"].map((head) => (
                          <th key={head} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.06em] text-emerald-600">
                            {head}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {leads.map((lead, index) => (
                        <tr key={lead._id || index} className="border-b border-emerald-50 hover:bg-emerald-50/40">
                          <td className="px-4 py-4 text-sm text-[#5c7d6d]">{index + 1}</td>
                          <td className="px-4 py-4">
                            <p className="text-sm font-semibold text-[#0f3d2e]">{lead.name || "Unknown"}</p>
                            <p className="mt-1 text-xs text-[#5c7d6d]">ID: {lead._id?.slice(-6) || "N/A"}</p>
                          </td>
                          <td className="px-4 py-4">
                            {lead.phone && (
                              <a href={`tel:${lead.phone}`} className="flex items-center gap-2 text-sm font-medium text-[#0f3d2e] hover:text-emerald-700">
                                <Phone className="h-4 w-4 text-emerald-600" /> {lead.phone}
                              </a>
                            )}
                            {lead.email && (
                              <a href={`mailto:${lead.email}`} className="mt-1 flex items-center gap-2 text-xs text-blue-600 hover:underline">
                                <Mail className="h-3 w-3" /> {lead.email}
                              </a>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium capitalize text-emerald-700">
                              {lead.status || "new"}
                            </span>
                          </td>
                          <td className="max-w-[220px] px-4 py-4">
                            <div className="flex items-start gap-1.5 text-xs text-[#5c7d6d]">
                              <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                              <span className="line-clamp-2">{lead.remarks || "No remarks"}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            {lead.approvedByManager ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                                <BadgeCheck className="h-3 w-3" /> Approved
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700">
                                <Clock3 className="h-3 w-3" /> Pending
                              </span>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-4 py-4 text-xs text-[#5c7d6d]">
                            {lead.createdAt ? formatPostedAt(lead.createdAt) : "N/A"}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex gap-1.5">
                              {lead.phone && (
                                <a href={`tel:${lead.phone}`} className="rounded-xl bg-emerald-50 p-2 text-emerald-700 hover:bg-emerald-100">
                                  <Phone className="h-3.5 w-3.5" />
                                </a>
                              )}
                              {lead.phone && (
                                <a
                                  href={`https://wa.me/${lead.phone?.replace(/\D/g, "")}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="rounded-xl bg-emerald-50 p-2 text-emerald-700 hover:bg-emerald-100"
                                >
                                  WA
                                </a>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function PropertiesDashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { data: userData } = useCurrentUser();
  const [category, setCategory] = useState(
    () => searchParams.get("category") || "all",
  );
  const [listingType, setListingType] = useState(() => {
    const raw = String(searchParams.get("listingType") || "all")
      .trim()
      .toLowerCase();
    return LISTING_TYPE_FILTERS.some((item) => item.value === raw) ? raw : "all";
  });
  const [status, setStatus] = useState(
    () => normalizeStatusParam(searchParams.get("status") || "all"),
  );
  const [locationFilters, setLocationFilters] = useState({
    state: searchParams.get("state") || "",
    city: searchParams.get("city") || "",
    locality: searchParams.get("locality") || "",
  });
  const [locationSearch, setLocationSearch] = useState(
    () => searchParams.get("locationSearch") || "",
  );
  const [search, setSearch] = useState(
    () => searchParams.get("search") || "",
  );
  const debouncedSearch = useDebounce(search, 400);
  const [promotionType, setPromotionType] = useState(
    () => searchParams.get("promotion") || "all",
  );
  const [trackingFilter, setTrackingFilter] = useState(
    () => searchParams.get("tracking") || "all",
  );
  const [promoteTarget, setPromoteTarget] = useState(null);
  const [promoteLoading, setPromoteLoading] = useState(false);
  const [sort, setSort] = useState(
    () => searchParams.get("sort") || "newest",
  );
  const [createdFrom, setCreatedFrom] = useState(
    () => searchParams.get("createdFrom") || searchParams.get("from") || "",
  );
  const [createdTo, setCreatedTo] = useState(
    () => searchParams.get("createdTo") || searchParams.get("to") || "",
  );
  const [createOpen, setCreateOpen] = useState(false);
  const [page, setPage] = useState(() => {
    const savedPage = Number(searchParams.get("page"));
    return Number.isInteger(savedPage) && savedPage > 0 ? savedPage : 1;
  });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const isTodayRange =
    Boolean(createdFrom) &&
    Boolean(createdTo) &&
    createdFrom === createdTo &&
    createdFrom === todayIso();

  const applyTodayRange = () => {
    const day = todayIso();
    setCreatedFrom(day);
    setCreatedTo(day);
  };

  const clearDateRange = () => {
    setCreatedFrom("");
    setCreatedTo("");
  };

  // Keep the card filters on the dashboard URL. The browser restores this
  // exact entry when returning from details, including Pending/search/page.
  useEffect(() => {
    const next = new URLSearchParams();
    if (category !== "all") next.set("category", category);
    if (listingType !== "all") next.set("listingType", listingType);
    if (status !== "all") next.set("status", status);
    if (locationFilters.state) next.set("state", locationFilters.state);
    if (locationFilters.city) next.set("city", locationFilters.city);
    if (locationFilters.locality) next.set("locality", locationFilters.locality);
    if (locationSearch.trim()) next.set("locationSearch", locationSearch);
    if (debouncedSearch.trim()) next.set("search", debouncedSearch);
    if (promotionType !== "all") next.set("promotion", promotionType);
    if (trackingFilter !== "all") next.set("tracking", trackingFilter);
    if (sort !== "newest") next.set("sort", sort);
    if (createdFrom) next.set("createdFrom", createdFrom);
    if (createdTo) next.set("createdTo", createdTo);
    if (page > 1) next.set("page", String(page));
    setSearchParams(next, { replace: true });
  }, [
    category,
    createdFrom,
    createdTo,
    listingType,
    locationFilters,
    locationSearch,
    page,
    debouncedSearch,
    promotionType,
    trackingFilter,
    setSearchParams,
    sort,
    status,
  ]);

  // Support drill-downs like /properties?status=onboarding&createdFrom=...
  useEffect(() => {
    const nextStatus = normalizeStatusParam(searchParams.get("status") || "all");
    if (nextStatus !== status) setStatus(nextStatus);
    const nextFrom = searchParams.get("createdFrom") || searchParams.get("from") || "";
    const nextTo = searchParams.get("createdTo") || searchParams.get("to") || "";
    if (nextFrom !== createdFrom) setCreatedFrom(nextFrom);
    if (nextTo !== createdTo) setCreatedTo(nextTo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const analyticsQuery = useQuery({
    queryKey: ["properties-analytics", locationFilters, createdFrom, createdTo],
    queryFn: async ({ signal }) => {
      const res = await getAllPropertiesAnalytics(
        buildAnalyticsParams(locationFilters, { from: createdFrom, to: createdTo }),
        { signal },
      );
      return res.data?.data || res.data;
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const listingScope = useMemo(
    () => ({
      category,
      listingType,
      status,
      state: locationFilters.state,
      city: locationFilters.city,
      locality: locationFilters.locality,
      q: debouncedSearch.trim(),
      promotionType,
      tracking: trackingFilter,
      sort,
      createdFrom,
      createdTo,
      limit: PAGE_SIZE,
    }),
    [
      category,
      createdFrom,
      createdTo,
      debouncedSearch,
      listingType,
      locationFilters,
      promotionType,
      sort,
      status,
      trackingFilter,
    ],
  );
  const listingScopeKey = JSON.stringify(listingScope);
  const listingScopeKeyRef = useRef(listingScopeKey);
  const listingMetaRef = useRef({
    total: 0,
    pages: 1,
    facets: {},
    hasCount: false,
    scopeKey: listingScopeKey,
  });
  const scopeChanged = listingScopeKeyRef.current !== listingScopeKey;
  if (scopeChanged && listingMetaRef.current.scopeKey !== listingScopeKey) {
    listingMetaRef.current = {
      total: 0,
      pages: 1,
      facets: {},
      hasCount: false,
      scopeKey: listingScopeKey,
    };
  }
  const listingPage = scopeChanged ? 1 : page;
  const listingFilters = useMemo(
    () => ({
      ...listingScope,
      page: listingPage,
      includeFacets: listingPage === 1 ? 1 : 0,
      includeCount: listingPage === 1 || !listingMetaRef.current.hasCount ? 1 : 0,
    }),
    [listingPage, listingScope],
  );

  const listingsQuery = useQuery({
    queryKey: ["properties-dashboard-listings", listingFilters],
    queryFn: async ({ signal }) => {
      const res = await getAdminPropertyListings(listingFilters, { signal });
      return res.data || {};
    },
    placeholderData: keepPreviousData,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  const analytics = analyticsQuery.data || {};
  const overview = analytics.overview || {};
  const analyticsTotal = Number(overview.totalProperties || 0);
  const listItems = Array.isArray(listingsQuery.data?.items)
    ? listingsQuery.data.items
    : Array.isArray(listingsQuery.data?.data)
      ? listingsQuery.data.data
      : [];
  const listMeta = listingsQuery.data?.meta || listingsQuery.data?.pagination || {};
  const listCounted = listMeta.counted !== false && listMeta.total != null;
  if (
    listingsQuery.data?.facets?.promotionType &&
    !listingsQuery.isPlaceholderData
  ) {
    listingMetaRef.current.facets = listingsQuery.data.facets;
  }
  if (listCounted && !listingsQuery.isPlaceholderData) {
    const countedTotal = Number(listMeta.total || 0);
    listingMetaRef.current.total = countedTotal;
    listingMetaRef.current.pages = Math.max(
      1,
      Number(listMeta.pages || listMeta.totalPages) ||
        Math.ceil(countedTotal / PAGE_SIZE) ||
        1,
    );
    listingMetaRef.current.hasCount = true;
  }
  const listTotal = listingMetaRef.current.hasCount
    ? listingMetaRef.current.total
    : 0;
  const totalPages = listingMetaRef.current.hasCount
    ? Math.max(
        1,
        listingMetaRef.current.pages || Math.ceil(listTotal / PAGE_SIZE) || 1,
      )
    : Math.max(1, listingPage);
  const safePage = Math.max(1, listingPage);
  const hasNextPage = listingMetaRef.current.hasCount
    ? safePage < totalPages
    : Boolean(listMeta.hasNextPage) || listItems.length >= PAGE_SIZE;
  const pagerLast = listingMetaRef.current.hasCount
    ? totalPages
    : Math.max(safePage, hasNextPage ? safePage + 1 : safePage);
  const pageNumbers = Array.from({ length: pagerLast }, (_, index) => index + 1).filter(
    (pageNumber) =>
      pageNumber === 1 ||
      pageNumber === pagerLast ||
      Math.abs(pageNumber - safePage) <= 1,
  );
  const paginatedProperties = listItems.slice(0, PAGE_SIZE);
  const visibleCount = listTotal;
  const listFacets =
    listingPage === 1 && listingsQuery.data?.facets?.promotionType
      ? listingsQuery.data.facets
      : listingMetaRef.current.facets || {};
  const promotionTypeCounts = {
    all: 0,
    prime: 0,
    featured: 0,
    sponsored: 0,
    normal: 0,
    ...(listFacets.promotionType || {}),
  };
  const trackingFilterCounts = {
    all: 0,
    promoted: 0,
    active: 0,
    expiringSoon: 0,
    expired: 0,
    ...(listFacets.tracking || {}),
  };

  const activeLocationLabel =
    locationFilters.locality ||
    locationFilters.city ||
    locationFilters.state ||
    "All India";
  const locationSearchTerm = locationSearch.trim().toLowerCase();
  const matchesLocationSearch = (row) => {
    if (!locationSearchTerm) return true;
    return String(row?._id || "").toLowerCase().includes(locationSearchTerm);
  };
  const stateRows = useMemo(
    () => cleanRows(analytics.stateWise).filter(matchesLocationSearch),
    [analytics.stateWise, locationSearchTerm],
  );
  const cityRows = useMemo(
    () => cleanRows(analytics.cityWise).filter(matchesLocationSearch),
    [analytics.cityWise, locationSearchTerm],
  );
  const localityRows = useMemo(
    () => cleanRows(analytics.localityWise).filter(matchesLocationSearch),
    [analytics.localityWise, locationSearchTerm],
  );

  const isInitialListLoading = listingsQuery.isLoading && listItems.length === 0;
  const isListRefreshing = listingsQuery.isFetching && listItems.length > 0;
  const listFailed = listingsQuery.isError;

  useEffect(() => {
    if (!scopeChanged) return;
    listingScopeKeyRef.current = listingScopeKey;
    if (page !== 1) setPage(1);
  }, [listingScopeKey, page, scopeChanged]);

  useEffect(() => {
    if (!listingMetaRef.current.hasCount) return;
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);
  const activeFilterCount = [
    category !== "all",
    listingType !== "all",
    status !== "all",
    !!locationFilters.state,
    !!locationFilters.city,
    !!locationFilters.locality,
    !!locationSearch.trim(),
    !!search.trim(),
    !!createdFrom,
    !!createdTo,
    promotionType !== "all",
    trackingFilter !== "all",
  ].filter(Boolean).length;

  const selectLocation = (type, value) => {
    setLocationFilters((previous) => {
      if (type === "state") return { state: value, city: "", locality: "" };
      if (type === "city") return { ...previous, city: value, locality: "" };
      if (type === "locality") return { ...previous, locality: value };
      return previous;
    });
  };

  const clearFilters = () => {
    setCategory("all");
    setListingType("all");
    setStatus("all");
    setSearch("");
    setLocationSearch("");
    setSort("newest");
    setLocationFilters({ state: "", city: "", locality: "" });
    setPromotionType("all");
    setTrackingFilter("all");
    clearDateRange();
  };

  const rememberCategory = useCallback((nextCategory) => {
    localStorage.setItem("activeCategory", nextCategory);
    dispatch(setActiveCategory(nextCategory));
  }, [dispatch]);

  const startCreateProperty = (nextCategory) => {
    rememberCategory(nextCategory);
    setCreateOpen(false);
    navigate("/post-property");
  };

  const openPropertyDetails = useCallback((property) => {
    rememberCategory(property._category);
    navigate(`/property/${property._category}/${property._id}`);
  }, [navigate, rememberCategory]);

  const editProperty = useCallback((property) => {
    navigateToPropertyEdit({
      navigate,
      dispatch,
      property,
      category: property._category,
    });
  }, [dispatch, navigate]);

  const invalidatePropertyLists = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ["properties-dashboard-listings"] }),
      queryClient.invalidateQueries({ queryKey: ["properties-analytics"] }),
    ]);

  const openPromote = useCallback((property) => setPromoteTarget(property), []);

  const handlePromoteConfirm = async (type, { days, sponsoredAd } = {}) => {
    if (!promoteTarget?._id || !promoteTarget?._category) return;
    setPromoteLoading(true);
    try {
      await promotePropertyListing(promoteTarget._category, promoteTarget._id, {
        type,
        ...(days ? { days } : {}),
        ...(sponsoredAd && typeof sponsoredAd === "object"
          ? { sponsoredAd }
          : {}),
      });
      toast.success(`Promoted to ${titlePromotionType(type)}`);
      setPromoteTarget(null);
      await invalidatePropertyLists();
    } catch (err) {
      const status = err?.response?.status;
      const data = err?.response?.data;
      const raw =
        typeof data === "string"
          ? data
          : data?.message || data?.error || err?.message;
      const msg =
        status === 401
          ? "Please sign in again, then retry promote"
          : typeof raw === "string" && raw.includes("Cannot PATCH")
            ? "Promote route missing on the API this dashboard calls — check VITE_API_BASE_URL points to this machine’s gateway (localhost:4000)"
            : raw || "Promotion failed";
      toast.error(msg);
    } finally {
      setPromoteLoading(false);
    }
  };

  const handleRenewPromotion = useCallback(async (property) => {
    if (!property?._id || !property?._category) return;
    setPromoteLoading(true);
    try {
      await renewPropertyListing(property._category, property._id, { days: 10 });
      toast.success("Promotion renewed (+10 days)");
      await invalidatePropertyLists();
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Renew failed",
      );
    } finally {
      setPromoteLoading(false);
    }
  }, [queryClient]);

  const handleExpirePromotion = useCallback(async (property) => {
    if (!property?._id || !property?._category) return;
    setPromoteLoading(true);
    try {
      await expirePropertyListing(property._category, property._id);
      toast.success("Promotion expired → Normal");
      await invalidatePropertyLists();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Expire failed");
    } finally {
      setPromoteLoading(false);
    }
  }, [queryClient]);

  const currentUser = userData?.user || userData || null;

  const canReviewProperty = (property) => {
    if (!canReviewPropertyListing(currentUser, property)) return false;
    // Agent path (70%): open details for Approve → Live
    // Docs path (80% pending): open verification page
    return true;
  };

  const reviewProperty = useCallback((property) => {
    rememberCategory(property._category);
    const percent = Number(property?.completion?.percent || 0);
    if (percent === 70 || isAgentCreatedProperty(property)) {
      navigate(`/property/${property._category}/${property._id}`);
      return;
    }
    const buildRoute = VERIFICATION_ROUTES[property._category];
    if (buildRoute) navigate(buildRoute(property._id));
    else navigate(`/property/${property._category}/${property._id}`);
  }, [navigate, rememberCategory]);

  const deleteProperty = async () => {
    if (!deleteTarget?._id || deleteLoading) return;

    const deleteRequest = DELETE_PROPERTY[deleteTarget._category];
    if (!deleteRequest) {
      toast.error("Property category is not supported");
      return;
    }

    try {
      setDeleteLoading(true);
      await deleteRequest(deleteTarget._id);
      toast.success("Property deleted successfully");
      setDeleteTarget(null);
      await invalidatePropertyLists();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to delete property",
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <main className="min-h-full w-full min-w-0 max-w-full overflow-x-hidden bg-[#f7fbf8] p-2 text-[#0f3d2e] sm:p-4">
      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Property"
        message={`Delete "${deleteTarget?.title || "this property"}"? This action cannot be undone.`}
        confirmLabel={deleteLoading ? "Deleting..." : "Delete"}
        confirmClass="bg-red-600 hover:bg-red-700 text-white"
        icon={<Trash2 className="h-5 w-5" />}
        iconClass="text-red-600"
        onConfirm={deleteProperty}
        onCancel={() => {
          if (!deleteLoading) setDeleteTarget(null);
        }}
        isLoading={deleteLoading}
      />
      <PropertyPromoteModal
        open={!!promoteTarget}
        propertyTitle={promoteTarget?.title}
        propertyStatus={promoteTarget?.status}
        currentType={
          promoteTarget?.promotion?.type ||
          getPromotionTracking(promoteTarget).currentType ||
          "normal"
        }
        category={promoteTarget?._category}
        isLoading={promoteLoading}
        onConfirm={handlePromoteConfirm}
        onCancel={() => {
          if (!promoteLoading) setPromoteTarget(null);
        }}
      />
      <style>
        {`
          @keyframes propertyRowIn {
            from { opacity: 0; transform: translateY(8px) scale(0.99); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
        `}
      </style>
      <section className="mx-auto w-full min-w-0 max-w-7xl">
        <header className={`flex min-w-0 max-w-full flex-col gap-4 rounded-2xl p-3 sm:p-4 lg:flex-row lg:items-center lg:justify-between ${saSurface}`}>
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-emerald-700">
              <Building2 className="h-4 w-4" /> Property workspace
            </div>
            {/* <h1 className="mt-1 text-xl font-medium text-slate-900 sm:text-2xl">All properties, one place</h1> */}
            <h1 className="mt-1 text-xl font-semibold text-[#0f3d2e] sm:text-2xl">
              Properties
            </h1>
            <p className="mt-0.5 break-words text-sm text-[#5c7d6d]">
              Browse every category by location, status, poster, and posting
              time.
            </p>
          </div>
          <div className="grid w-full min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 lg:flex lg:w-auto lg:flex-wrap">
            <div className="relative min-w-0">
              <button
                type="button"
                onClick={() => setCreateOpen((open) => !open)}
                className="inline-flex h-full w-full items-center justify-center gap-2 rounded-full border border-emerald-100 bg-white px-3 py-2.5 text-xs font-semibold text-[#0f3d2e] shadow-[0_4px_12px_rgba(16,185,129,0.08)] transition hover:bg-emerald-50 sm:px-4"
              >
                <Plus className="h-4 w-4" /> Create property
              </button>
              {createOpen && (
                <div className="absolute left-0 z-20 mt-2 w-64 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-emerald-100 bg-white p-2 shadow-[0_16px_40px_rgba(16,185,129,0.16)] lg:left-auto lg:right-0">
                  <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-emerald-600">
                    Select category
                  </p>
                  {PROPERTY_CATEGORIES.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => startCreateProperty(item.value)}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-[#0f3d2e] transition hover:bg-emerald-50 hover:text-emerald-700"
                    >
                      {item.label}
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => navigate("/agent-project")}
              className="inline-flex min-w-0 items-center justify-center gap-2 rounded-full bg-[#27AE60] px-3 py-2.5 text-xs font-semibold text-white shadow-[0_6px_14px_rgba(18,161,80,0.24)] transition hover:bg-[#1e8f4d] sm:px-4"
            >
              <ShieldCheck className="h-4 w-4" /> Create agent project
            </button>
          </div>
        </header>

        <Panel
          title="Start by Location"
          sub="Choose the business area first. All analytics and cards below update for that scope."
          icon={Globe}
          className="mt-5"
          action={
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium">
              <span className="rounded-full bg-[#27AE60] px-3 py-1 text-white">
                {activeLocationLabel}
              </span>
              {(locationFilters.state ||
                locationFilters.city ||
                locationFilters.locality) && (
                <button
                  type="button"
                  onClick={() => {
                    setLocationSearch("");
                    setLocationFilters({ state: "", city: "", locality: "" });
                  }}
                  className="rounded-full border border-emerald-100 bg-white px-3 py-1 text-[#0f3d2e] transition hover:bg-emerald-50"
                >
                  Reset location
                </button>
              )}
            </div>
          }
        >
          <div className="mb-3 flex flex-col gap-2 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-2.5 sm:flex-row sm:items-center sm:justify-between">
            <label className="relative block w-full sm:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-600" />
              <input
                type="search"
                value={locationSearch}
                onChange={(event) => setLocationSearch(event.target.value)}
                placeholder="Search state, city or locality"
                className="h-10 w-full rounded-xl border border-emerald-100 bg-white pl-9 pr-9 text-sm text-[#0f3d2e] outline-none transition placeholder:text-[#5c7d6d] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25"
              />
              {locationSearch && (
                <button
                  type="button"
                  onClick={() => setLocationSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5c7d6d] transition hover:text-[#0f3d2e]"
                  aria-label="Clear location search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </label>
            <p className="text-[11px] text-[#5c7d6d]">
              {analyticsQuery.isError
                ? "Unable to load location counts"
                : `Showing ${stateRows.length} states, ${cityRows.length} cities, ${localityRows.length} localities`}
              {analyticsQuery.isError && (
                <button
                  type="button"
                  onClick={() => analyticsQuery.refetch()}
                  className="ml-2 font-medium text-emerald-700 underline"
                >
                  Retry
                </button>
              )}
            </p>
          </div>

          <div className="grid items-start gap-3 lg:grid-cols-[160px_repeat(3,minmax(0,1fr))]">
            <button
              type="button"
              onClick={() => {
                setLocationSearch("");
                setLocationFilters({ state: "", city: "", locality: "" });
              }}
              className={`h-fit rounded-2xl p-3 text-left ${saSurfaceHover} ${
                !locationFilters.state
                  ? "border-[#27AE60] bg-[#e8f8ee] shadow-[0_8px_18px_-6px_rgba(39,174,96,0.45)]"
                  : saSurface
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#27AE60] text-white">
                  <Globe className="h-4 w-4" />
                </span>
                <span className="text-xl font-semibold text-[#0f3d2e]">
                  {fmtNum(analyticsTotal)}
                </span>
              </div>
              <p className="mt-2 text-[13px] font-semibold text-[#0f3d2e]">
                All India
              </p>
              <p className="mt-0.5 text-[11px] text-[#5c7d6d]">
                National CRM view
              </p>
            </button>

            <div className={`rounded-2xl p-2.5 ${saInset}`}>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-emerald-600">
                  1. Select State
                </p>
                <span className="text-[10px] font-medium text-[#5c7d6d]">
                  {stateRows.length}
                </span>
              </div>
              <div className="max-h-48 space-y-1 overflow-auto pr-1">
                {stateRows.map((row) => (
                  <BreakdownRow
                    key={row._id}
                    row={row}
                    total={analyticsTotal}
                    selected={locationFilters.state === row._id}
                    onClick={() => selectLocation("state", row._id)}
                  />
                ))}
                {stateRows.length === 0 && (
                  <p className="rounded-xl bg-emerald-50/50 p-4 text-center text-sm text-[#5c7d6d]">
                    {locationSearch
                      ? "No matching state found"
                      : "No state data found"}
                  </p>
                )}
              </div>
            </div>

            <div className={`rounded-2xl p-2.5 ${saInset}`}>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-emerald-600">
                  2. Select City
                </p>
                <span className="text-[10px] font-medium text-[#5c7d6d]">
                  {cityRows.length}
                </span>
              </div>
              <div className="max-h-48 space-y-1 overflow-auto pr-1">
                {cityRows.map((row) => (
                  <BreakdownRow
                    key={row._id}
                    row={row}
                    total={analyticsTotal}
                    selected={locationFilters.city === row._id}
                    onClick={() => selectLocation("city", row._id)}
                  />
                ))}
                {cityRows.length === 0 && (
                  <p className="rounded-xl bg-emerald-50/50 p-4 text-center text-sm text-[#5c7d6d]">
                    {locationSearch
                      ? "No matching city found"
                      : "Select a state to narrow cities"}
                  </p>
                )}
              </div>
            </div>

            <div className={`rounded-2xl p-2.5 ${saInset}`}>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-emerald-600">
                  3. Select Locality
                </p>
                <span className="text-[10px] font-medium text-[#5c7d6d]">
                  {localityRows.length}
                </span>
              </div>
              <div className="max-h-48 space-y-1 overflow-auto pr-1">
                {localityRows.map((row) => (
                  <BreakdownRow
                    key={row._id}
                    row={row}
                    total={analyticsTotal}
                    selected={locationFilters.locality === row._id}
                    onClick={() => selectLocation("locality", row._id)}
                  />
                ))}
                {localityRows.length === 0 && (
                  <p className="rounded-xl bg-emerald-50/50 p-4 text-center text-sm text-[#5c7d6d]">
                    {locationSearch
                      ? "No matching locality found"
                      : "Select a city to narrow localities"}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
            <span className="font-medium text-[#5c7d6d]">Current scope:</span>
            <button
              type="button"
              onClick={() => {
                setLocationSearch("");
                setLocationFilters({ state: "", city: "", locality: "" });
              }}
              className={`rounded-full px-3 py-1 font-medium ${
                !locationFilters.state
                  ? "bg-[#27AE60] text-white"
                  : "border border-emerald-100 bg-white text-[#0f3d2e]"
              }`}
            >
              India
            </button>
            {locationFilters.state && (
              <button
                type="button"
                onClick={() =>
                  setLocationFilters({
                    state: locationFilters.state,
                    city: "",
                    locality: "",
                  })
                }
                className="rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-700"
              >
                {locationFilters.state}
              </button>
            )}
            {locationFilters.city && (
              <button
                type="button"
                onClick={() =>
                  setLocationFilters((previous) => ({
                    ...previous,
                    locality: "",
                  }))
                }
                className="rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-700"
              >
                {locationFilters.city}
              </button>
            )}
            {locationFilters.locality && (
              <span className="rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-700">
                {locationFilters.locality}
              </span>
            )}
          </div>
        </Panel>

        <div className="mt-4 grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-4">
          <MetricCard
            label="Total Properties"
            value={overview.totalProperties ?? 0}
            sub={`${activeLocationLabel} inventory`}
            icon={Building2}
            tone="emerald"
            percent={100}
            active={category === "all" && status === "all" && !createdFrom && !createdTo}
            onClick={() => {
              setCategory("all");
              setStatus("all");
              clearDateRange();
            }}
          />
          <MetricCard
            label="Active"
            value={overview.activeProperties}
            sub={`${pct(overview.activeProperties, analyticsTotal)}% live`}
            icon={CheckCircle2}
            tone="sky"
            percent={pct(overview.activeProperties, analyticsTotal)}
            active={status === "active"}
            onClick={() => setStatus(status === "active" ? "all" : "active")}
          />
          <MetricCard
            label="Pending Review"
            value={overview.pendingProperties}
            sub="Needs document action"
            icon={ShieldCheck}
            tone="amber"
            percent={pct(overview.pendingProperties, analyticsTotal)}
            active={status === "pending"}
            onClick={() => setStatus(status === "pending" ? "all" : "pending")}
          />
          <MetricCard
            label="Draft"
            value={overview.draftProperties}
            sub="Incomplete listings — click to filter cards"
            icon={Activity}
            tone="slate"
            percent={pct(overview.draftProperties, analyticsTotal)}
            active={status === "draft"}
            onClick={() => setStatus(status === "draft" ? "all" : "draft")}
          />
        </div>

        <div className="mt-3 grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
          <Panel
            title="CRM Performance"
            sub="Pipeline health, engagement and listing mix"
            icon={BarChart3}
            action={
              analyticsQuery.isFetching && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-medium text-emerald-700">
                  <RefreshCw className="h-3 w-3 animate-spin" /> Syncing
                </span>
              )
            }
          >
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-3">
                <p className="flex items-center gap-2 text-xs font-semibold text-[#5c7d6d]">
                  <Eye className="h-4 w-4 text-emerald-600" /> Views
                </p>
                <p className="mt-1 text-xl font-semibold text-[#0f3d2e]">
                  {fmtNum(overview.totalViews)}
                </p>
                <MiniLineChart
                  values={[
                    overview.activeProperties,
                    overview.pendingProperties,
                    overview.draftProperties,
                    overview.totalViews,
                  ]}
                />
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-3">
                <p className="flex items-center gap-2 text-xs font-semibold text-[#5c7d6d]">
                  <MousePointerClick className="h-4 w-4 text-emerald-600" />{" "}
                  Clicks
                </p>
                <p className="mt-1 text-xl font-semibold text-[#0f3d2e]">
                  {fmtNum(overview.totalClicks)}
                </p>
                <MiniLineChart
                  values={[
                    overview.totalClicks,
                    overview.activeProperties,
                    overview.pendingProperties,
                    overview.totalClicks,
                  ]}
                  color="#27AE60"
                />
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-3">
                <p className="flex items-center gap-2 text-xs font-semibold text-[#5c7d6d]">
                  <MessageSquare className="h-4 w-4 text-emerald-600" />{" "}
                  Inquiries
                </p>
                <p className="mt-1 text-xl font-semibold text-[#0f3d2e]">
                  {fmtNum(overview.totalInquiries)}
                </p>
                <MiniLineChart
                  values={[
                    overview.totalInquiries,
                    overview.pendingProperties,
                    overview.activeProperties,
                    overview.totalInquiries,
                  ]}
                  color="#F59E0B"
                />
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className={`rounded-2xl p-4 ${saInset}`}>
                <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-emerald-600">
                  Listing Type
                </p>
                <div className="mt-3 space-y-2">
                  {cleanRows(analytics.listingTypeWise).map((row) => (
                    <BreakdownRow
                      key={row._id}
                      row={row}
                      total={analyticsTotal}
                      color="bg-blue-500"
                    />
                  ))}
                  {cleanRows(analytics.listingTypeWise).length === 0 && (
                    <p className="text-sm text-[#5c7d6d]">
                      No listing data yet
                    </p>
                  )}
                </div>
              </div>
              <div className={`rounded-2xl p-4 ${saInset}`}>
                <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-emerald-600">
                  Promotion Mix
                </p>
                <div className="mt-3 space-y-2">
                  {cleanRows(analytics.promotionWise).map((row) => (
                    <BreakdownRow
                      key={row._id}
                      row={row}
                      total={analyticsTotal}
                      color="bg-emerald-500"
                    />
                  ))}
                  {cleanRows(analytics.promotionWise).length === 0 && (
                    <p className="text-sm text-[#5c7d6d]">
                      No promotion data yet
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Panel>

          <Panel
            title="Status Control"
            sub="Click a row to filter cards below"
            icon={PieChart}
          >
            <StatusDonut overview={overview} total={analyticsTotal} />
            <div className="space-y-2">
              {cleanRows(analytics.statusWise).map((row) => (
                <BreakdownRow
                  key={row._id}
                  row={row}
                  total={analyticsTotal}
                  color={
                    row._id === "active"
                      ? "bg-emerald-500"
                      : row._id === "pending"
                        ? "bg-amber-500"
                        : row._id === "draft"
                          ? "bg-[#5c7d6d]"
                          : "bg-rose-500"
                  }
                  selected={status === row._id}
                  onClick={() =>
                    setStatus(status === row._id ? "all" : row._id)
                  }
                />
              ))}
            </div>
          </Panel>
        </div>

        <div className="mt-3 grid gap-3 lg:grid-cols-[0.9fr_1.1fr]">
          <Panel
            title="Category Inventory"
            sub="Residential, commercial, land and agricultural"
            icon={Layers}
          >
            <div className="space-y-2">
              <BreakdownRow
                row={{
                  _id: "all properties",
                  total: analyticsTotal,
                  active: overview.activeProperties,
                  pending: overview.pendingProperties,
                  draft: overview.draftProperties,
                }}
                total={analyticsTotal}
                selected={category === "all"}
                onClick={() => setCategory("all")}
              />
              {cleanRows(analytics.categoryWise).map((row) => (
                <BreakdownRow
                  key={row._id}
                  row={row}
                  total={analyticsTotal}
                  selected={category === row._id}
                  onClick={() =>
                    setCategory(category === row._id ? "all" : row._id)
                  }
                />
              ))}
            </div>
          </Panel>

          <Panel
            title="Property Type Demand"
            sub="Best performing inventory buckets"
            icon={TrendingUp}
          >
            <div className="max-h-[420px] space-y-2 overflow-auto pr-1">
              {cleanRows(analytics.propertyTypeWise)
                .slice(0, 12)
                .map((row) => (
                  <button
                    key={`${row.category}-${row._id}`}
                    type="button"
                    onClick={() => setCategory(row.category || "all")}
                    className={`w-full rounded-2xl p-3 text-left hover:bg-[#f4fbf7] ${saInset} ${saSurfaceHover}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-[#0f3d2e]">
                          {titleCase(row._id)}
                        </p>
                        <p className="text-[11px] font-medium capitalize text-emerald-700">
                          {row.category || "Unknown category"}
                        </p>
                      </div>
                      <span className="text-lg font-semibold text-[#0f3d2e]">
                        {fmtNum(row.total)}
                      </span>
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-1 text-center text-[10px] font-medium">
                      <span className="rounded-lg bg-emerald-50 py-1 text-emerald-700">
                        A {row.active || 0}
                      </span>
                      <span className="rounded-lg bg-amber-50 py-1 text-amber-700">
                        P {row.pending || 0}
                      </span>
                      <span className="rounded-lg bg-emerald-50 py-1 text-[#5c7d6d]">
                        D {row.draft || 0}
                      </span>
                    </div>
                  </button>
                ))}
            </div>
          </Panel>
        </div>

        <div className={`mt-3 rounded-2xl p-3 sm:p-4 ${saSurface}`}>
          <div className="mb-3 flex min-h-[40px] items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.06em] text-[#0f3d2e]">
                <Filter className="h-4 w-4 shrink-0 text-emerald-600" /> Filter property
                cards
              </p>
              <p className="mt-1 text-xs text-[#5c7d6d]">
                Cards below follow location, category, sale/rent, status, date, search and sort.
              </p>
            </div>
            <button
              type="button"
              onClick={clearFilters}
              disabled={activeFilterCount === 0}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                activeFilterCount > 0
                  ? "border border-emerald-100 bg-white text-[#0f3d2e] hover:bg-emerald-50"
                  : "invisible border border-emerald-50 bg-white text-[#5c7d6d]"
              }`}
            >
              Clear all filters
            </button>
          </div>

          <div className="mb-3 space-y-2">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {CATEGORIES.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setCategory(item.value)}
                  className={`shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-medium transition ${
                    category === item.value
                      ? "border-[#27AE60] bg-[#27AE60] text-white"
                      : "border-emerald-100 bg-white text-[#0f3d2e] hover:border-emerald-300 hover:text-emerald-700"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Sub-filter: Sale / Rent — works with every category (scalable config) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
              <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-emerald-600">
                Listing
              </span>
              <div className="flex gap-1.5">
                {LISTING_TYPE_FILTERS.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setListingType(item.value)}
                    className={`shrink-0 rounded-full border px-3 py-1 text-[11px] font-medium transition ${
                      listingType === item.value
                        ? "border-[#27AE60] bg-[#27AE60] text-white"
                        : "border-emerald-100 bg-white text-[#0f3d2e] hover:border-emerald-300 hover:bg-emerald-50"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_160px]">
            <label className="relative min-w-0">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5c7d6d]" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search title, location, posted by, approved by, ID…"
                className="h-11 w-full rounded-xl border border-emerald-100 bg-white pl-10 pr-9 text-sm text-[#0f3d2e] outline-none transition placeholder:text-[#5c7d6d] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25"
              />
              {search ? (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5c7d6d]"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </label>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="h-11 w-full rounded-xl border border-emerald-100 bg-white px-3 text-sm text-[#0f3d2e] outline-none focus:border-emerald-500"
            >
              {STATUSES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="h-11 w-full rounded-xl border border-emerald-100 bg-white px-3 text-sm text-[#0f3d2e] outline-none focus:border-emerald-500"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>

          {/* Promotion filters — same concept as projects */}
          <div className="mt-3 space-y-2 rounded-2xl border border-amber-100 bg-gradient-to-r from-amber-50/80 via-white to-violet-50/60 p-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-600" />
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-800">
                Property promotions
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {PROMOTION_TYPE_FILTERS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => {
                    setPromotionType(item.value);
                    document
                      .getElementById("property-cards-grid")
                      ?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className={`rounded-full border px-3 py-1.5 text-[11px] font-bold transition ${promoFilterChipClass(
                    item.tone,
                    promotionType === item.value,
                  )}`}
                >
                  {item.label}
                  <span className="ml-1.5 opacity-80">
                    {promotionTypeCounts[item.value] ?? 0}
                  </span>
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {PROMOTION_TRACKING_FILTERS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => {
                    setTrackingFilter(item.value);
                    document
                      .getElementById("property-cards-grid")
                      ?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold transition ${
                    trackingFilter === item.value
                      ? "border-[#27AE60] bg-[#27AE60] text-white shadow-[0_4px_10px_rgba(39,174,96,0.25)]"
                      : "border-emerald-100 bg-white text-[#0f3d2e] hover:border-emerald-300"
                  }`}
                >
                  {item.label}
                  <span className="ml-1.5 opacity-80">
                    {trackingFilterCounts[item.value] ?? 0}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50/40 p-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div className="min-w-0 flex-1">
                <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-emerald-600">
                  <CalendarClock className="h-3.5 w-3.5 text-emerald-600" />
                  Custom date range
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block min-w-0">
                    <span className="mb-1 block text-[11px] font-medium text-[#5c7d6d]">
                      From
                    </span>
                    <input
                      type="date"
                      value={createdFrom}
                      max={createdTo || undefined}
                      onChange={(event) => setCreatedFrom(event.target.value)}
                      className="h-11 w-full min-w-[11.5rem] rounded-xl border border-emerald-100 bg-white px-3 text-sm text-[#0f3d2e] outline-none focus:border-emerald-500"
                    />
                  </label>
                  <label className="block min-w-0">
                    <span className="mb-1 block text-[11px] font-medium text-[#5c7d6d]">
                      To
                    </span>
                    <input
                      type="date"
                      value={createdTo}
                      min={createdFrom || undefined}
                      onChange={(event) => setCreatedTo(event.target.value)}
                      className="h-11 w-full min-w-[11.5rem] rounded-xl border border-emerald-100 bg-white px-3 text-sm text-[#0f3d2e] outline-none focus:border-emerald-500"
                    />
                  </label>
                </div>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => (isTodayRange ? clearDateRange() : applyTodayRange())}
                  className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${
                    isTodayRange
                      ? "border-[#27AE60] bg-[#27AE60] text-white"
                      : "border-emerald-100 bg-white text-[#0f3d2e] hover:border-emerald-300 hover:text-emerald-700"
                  }`}
                >
                  Today properties
                </button>
                <button
                  type="button"
                  onClick={clearDateRange}
                  disabled={!createdFrom && !createdTo}
                  className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${
                    createdFrom || createdTo
                      ? "border-emerald-100 bg-white text-[#0f3d2e] hover:bg-emerald-50"
                      : "cursor-not-allowed border-emerald-50 bg-white text-emerald-200"
                  }`}
                >
                  Clear dates
                </button>
              </div>
            </div>
            <p className="mt-2 min-h-[18px] text-xs text-[#5c7d6d]">
              {createdFrom || createdTo
                ? `${isTodayRange ? "Today" : "Selected"}: ${createdFrom || "—"} → ${createdTo || "—"}`
                : "Pick From / To, or use Today properties."}
            </p>
          </div>

          <div className="mt-3 flex flex-col gap-2 text-xs text-[#5c7d6d] sm:flex-row sm:items-center sm:justify-between">
            <span className="inline-flex flex-wrap items-center gap-1.5">
              <Filter className="h-4 w-4 shrink-0" /> {visibleCount} cards
              match current filters • {activeFilterCount} filters active
              {isListRefreshing ? " • refreshing" : ""}
              {(promotionType !== "all" || trackingFilter !== "all") && (
                <span className="rounded-full bg-amber-50 px-2 py-0.5 font-semibold text-amber-800">
                  {promotionType === "all"
                    ? "All boosts"
                    : PROMOTION_TYPE_FILTERS.find((item) => item.value === promotionType)
                        ?.label}{" "}
                  ·{" "}
                  {PROMOTION_TRACKING_FILTERS.find((item) => item.value === trackingFilter)
                    ?.label}
                </span>
              )}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarClock className="h-4 w-4 shrink-0" /> Analytics source:
              `/analytics/properties`
            </span>
            {listFailed && (
              <span className="font-medium text-amber-700">
                Unable to load property cards
              </span>
            )}
          </div>
        </div>

        {listFailed && !paginatedProperties.length ? (
          <div
            id="property-cards-grid"
            className="mt-4 flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-rose-200 bg-white text-center"
          >
            <MapPin className="h-9 w-9 text-rose-300" />
            <p className="mt-3 font-semibold text-[#0f3d2e]">Unable to load properties</p>
            <p className="mt-1 max-w-sm text-sm text-[#5c7d6d]">
              The card list failed. Analytics above are unchanged.
            </p>
            <button
              type="button"
              onClick={() => listingsQuery.refetch()}
              className="mt-4 rounded-full bg-[#27AE60] px-4 py-2 text-sm font-semibold text-white shadow-[0_6px_14px_rgba(18,161,80,0.24)]"
            >
              Retry
            </button>
          </div>
        ) : isInitialListLoading ? (
          <div
            id="property-cards-grid"
            className="mt-3 grid items-stretch gap-3 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3"
          >
            {Array.from({ length: Math.min(PAGE_SIZE, 6) }).map((_, index) => (
              <div
                key={`property-skel-${index}`}
                className="h-48 animate-pulse rounded-2xl border border-emerald-100 bg-white"
              >
                <div className="flex h-full gap-3 p-3">
                  <div className="w-40 shrink-0 rounded-xl bg-emerald-50" />
                  <div className="flex flex-1 flex-col justify-between py-1">
                    <div className="h-4 w-2/3 rounded bg-emerald-50" />
                    <div className="h-3 w-1/2 rounded bg-emerald-50" />
                    <div className="h-3 w-1/3 rounded bg-emerald-50" />
                    <div className="h-8 w-full rounded bg-emerald-50" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : paginatedProperties.length ? (
          <>
            <div
              id="property-cards-grid"
              className={`mt-3 grid items-stretch gap-3 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 ${
                isListRefreshing ? "opacity-70" : ""
              }`}
            >
              {paginatedProperties.map((property, index) => (
                <PropertyGridCard
                  key={`${property._category}-${property._id}`}
                  property={property}
                  canReview={canReviewProperty(property)}
                  canEditPending={canEditPendingProperty(currentUser, property)}
                  index={index}
                  promoteBusy={promoteLoading}
                  onOpen={openPropertyDetails}
                  onEdit={editProperty}
                  onReview={reviewProperty}
                  onDelete={setDeleteTarget}
                  onPromote={openPromote}
                  onRenew={handleRenewPromotion}
                  onExpire={handleExpirePromotion}
                />
              ))}
            </div>
            {(visibleCount > 0 || safePage > 1 || listItems.length > 0) && (
            <div className={`mt-4 flex flex-col gap-3 rounded-2xl p-3 text-xs sm:flex-row sm:items-center sm:justify-between ${saSurface}`}>
              <span className="font-medium text-[#5c7d6d]">
                {listingMetaRef.current.hasCount
                  ? `Showing ${visibleCount === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}-${Math.min(safePage * PAGE_SIZE, visibleCount)} of ${visibleCount}`
                  : `Page ${safePage}`}
              </span>
              <div className="flex max-w-full items-center gap-1.5 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
                <button
                  type="button"
                  disabled={safePage === 1}
                  onClick={() => setPage(Math.max(1, safePage - 1))}
                  className="rounded-full border border-emerald-100 px-3 py-1.5 font-medium text-[#0f3d2e] transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>
                {pageNumbers.flatMap((pageNumber, index) => {
                  const prev = pageNumbers[index - 1];
                  const gap = prev && pageNumber - prev > 1;
                  return [
                    gap ? (
                      <span key={`gap-${pageNumber}`} className="px-1 text-[#5c7d6d]">
                        …
                      </span>
                    ) : null,
                    <button
                      key={`${pageNumber}-${index}`}
                      type="button"
                      onClick={() => setPage(pageNumber)}
                      className={`h-8 min-w-8 rounded-lg px-2 font-medium transition ${
                        safePage === pageNumber
                          ? "bg-[#27AE60] text-white"
                          : "border border-emerald-100 text-[#0f3d2e] hover:border-emerald-300 hover:text-emerald-700"
                      }`}
                    >
                      {pageNumber}
                    </button>,
                  ];
                })}
                <button
                  type="button"
                  disabled={!hasNextPage}
                  onClick={() =>
                    setPage(
                      listingMetaRef.current.hasCount
                        ? Math.min(totalPages, safePage + 1)
                        : safePage + 1,
                    )
                  }
                  className="rounded-full border border-emerald-100 px-3 py-1.5 font-medium text-[#0f3d2e] transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
            )}
          </>
        ) : (
          <div
            id="property-cards-grid"
            className="mt-4 flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-emerald-100 bg-white text-center"
          >
            <MapPin className="h-9 w-9 text-emerald-200" />
            <p className="mt-3 font-semibold text-[#0f3d2e]">
              No matching properties
            </p>
            <p className="mt-1 max-w-sm text-sm text-[#5c7d6d]">
              {promotionType !== "all" || trackingFilter !== "all"
                ? `No cards for ${
                    promotionType === "all"
                      ? "All boosts"
                      : PROMOTION_TYPE_FILTERS.find((item) => item.value === promotionType)
                          ?.label
                  } · ${
                    PROMOTION_TRACKING_FILTERS.find((item) => item.value === trackingFilter)
                      ?.label
                  }. Try All boosts / All lifecycle.`
                : "Try another category, location, or status."}
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
