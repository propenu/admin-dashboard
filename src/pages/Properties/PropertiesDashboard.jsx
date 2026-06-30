//src/pages/Properties/PropertiesDashboard.jsx

import { useEffect, useMemo, useState } from "react";
import { useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
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
  TrendingUp,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

import LoadingSpinner from "../../components/common/LoadingSpinner";
import ConfirmModal from "../features/property/components/shared/ConfirmModal";
import { setActiveCategory } from "../../store/Ui/uiSlice";
import { useCurrentUser } from "../../store/properties/useCurrentUser";
import {
  getAllPropertiesAnalytics,
  propertiesAnalytics,
} from "../../features/property/propertyService";
import {
  deleteResidential,
  fetchResidential,
} from "../../services/ResidentialServices/ResidentialServices";
import {
  deleteCommercial,
  fetchCommercial,
} from "../../services/CommercialServices/CommercialServices";
import {
  deleteAgricultural,
  fetchAgricultural,
} from "../../services/AgricuturalServices/AgricuturalServices";
import {
  deleteLand,
  fetchLand,
} from "../../services/LandServices/LandServices";
import {
  getPropertyCreatorTag,
  isAgentCreatedProperty,
} from "../../Utils/propertyCreatorRole";

const CATEGORIES = [
  { value: "all", label: "All properties" },
  { value: "residential", label: "Residential", fetcher: fetchResidential },
  { value: "commercial", label: "Commercial", fetcher: fetchCommercial },
  { value: "agricultural", label: "Agricultural", fetcher: fetchAgricultural },
  { value: "land", label: "Land", fetcher: fetchLand },
];

const STATUSES = [
  { value: "all", label: "All status" },
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "draft", label: "Draft" },
  { value: "rejected", label: "Rejected" },
];

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=500&q=75";

const PAGE_SIZE = 20;

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

const buildAnalyticsParams = (filters) => {
  const params = {};
  if (filters.state) params.state = filters.state;
  if (filters.city) params.city = filters.city;
  if (filters.locality) params.locality = filters.locality;
  return params;
};

function MetricCard({ label, value, sub, icon: Icon, tone = "emerald", active, onClick, percent = 0 }) {
  const toneClass = {
    emerald: "from-emerald-500 to-green-600 text-white",
    amber: "from-amber-400 to-orange-500 text-white",
    sky: "from-sky-500 to-blue-600 text-white",
    slate: "from-slate-700 to-slate-900 text-white",
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
      className={`rounded-2xl border p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        active
          ? "border-emerald-300 bg-emerald-50"
          : "border-slate-200 bg-white hover:border-emerald-200"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
          <p className="mt-1 text-xl font-medium text-slate-900">{fmtNum(value)}</p>
          {sub && <p className="mt-0.5 truncate text-[11px] font-medium text-slate-500">{sub}</p>}
        </div>
        <div
          className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full"
          style={{
            background: `conic-gradient(${ringColor} ${safePercent * 3.6}deg, #eef2f7 0deg)`,
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
        selected ? "bg-emerald-50 ring-1 ring-emerald-200" : "hover:bg-slate-50"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[13px] font-medium text-slate-800">{titleCase(row._id)}</p>
          <p className="truncate text-[10.5px] text-slate-400">
            Active {row.active || 0} • Pending {row.pending || 0} • Draft {row.draft || 0}
          </p>
        </div>
        <span className="text-sm font-medium text-slate-900">{fmtNum(row.total)}</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${width}%` }} />
      </div>
    </button>
  );
}

function Panel({ title, sub, icon: Icon, children, action, className = "" }) {
  return (
    <section className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm ${className}`}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            {Icon && <Icon className="h-4 w-4 text-emerald-600" />}
            <h2 className="text-[13px] font-medium uppercase tracking-wide text-slate-800">{title}</h2>
          </div>
          {sub && <p className="mt-0.5 text-[11px] text-slate-400">{sub}</p>}
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
    <div className="mb-3 flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
      <div
        className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full"
        style={{
          background: `conic-gradient(#27AE60 0deg ${activeDeg}deg, #F59E0B ${activeDeg}deg ${activeDeg + pendingDeg}deg, #64748B ${activeDeg + pendingDeg}deg ${activeDeg + pendingDeg + draftDeg}deg, #E2E8F0 ${activeDeg + pendingDeg + draftDeg}deg 360deg)`,
        }}
      >
        <div className="flex h-12 w-12 flex-col items-center justify-center rounded-full bg-white">
          <span className="text-sm font-medium text-slate-900">{fmtNum(total)}</span>
          <span className="text-[9px] font-medium text-slate-400">Total</span>
        </div>
      </div>
      <div className="grid flex-1 gap-1 text-[11px] font-medium text-slate-600">
        <span className="flex items-center justify-between gap-2">
          <span><i className="mr-1.5 inline-block h-2 w-2 rounded-full bg-emerald-500" />Active</span>
          <b>{active}%</b>
        </span>
        <span className="flex items-center justify-between gap-2">
          <span><i className="mr-1.5 inline-block h-2 w-2 rounded-full bg-amber-500" />Pending</span>
          <b>{pending}%</b>
        </span>
        <span className="flex items-center justify-between gap-2">
          <span><i className="mr-1.5 inline-block h-2 w-2 rounded-full bg-slate-500" />Draft</span>
          <b>{draft}%</b>
        </span>
      </div>
    </div>
  );
}

function MiniLineChart({ values = [], color = "#27AE60" }) {
  const max = Math.max(...values, 1);
  const points = values
    .map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * 100;
      const y = 34 - (Number(value || 0) / max) * 28;
      return `${x},${y}`;
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

async function fetchEveryPage(fetcher) {
  const limit = 100;
  const first = await fetcher({ page: 1, limit });
  const total = first?.meta?.total ?? first?.items?.length ?? 0;
  const pages = Math.ceil(total / (first?.meta?.limit || limit));

  if (pages <= 1) return first?.items || [];

  const rest = await Promise.all(
    Array.from({ length: pages - 1 }, (_, index) =>
      fetcher({ page: index + 2, limit }),
    ),
  );

  return [first, ...rest].flatMap((page) => page?.items || []);
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

function PropertyCard({
  property,
  category,
  canReview,
  onOpen,
  onEdit,
  onReview,
  onDelete,
  index = 0,
}) {
  const [openLeads, setOpenLeads] = useState(false);
  const status = getStatus(property);
  const creatorTag = getPropertyCreatorTag(property);
  const creator = property?.createdBy?.name || property?.postedBy?.name || "Unknown user";
  const propertyName =
    category === "residential" || category === "commercial"
      ? property?.buildingName
      : property?.landName;
  const location = [property?.locality, property?.city, property?.state]
    .filter(Boolean)
    .join(", ");

  const { data: leadsData, isLoading: leadsLoading } = useQuery({
    queryKey: ["property-leads", property?._id],
    queryFn: async () => {
      const res = await propertiesAnalytics(property?._id);
      return res.data;
    },
    enabled: !!property?._id,
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
        className="group flex min-h-[172px] overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md cursor-pointer sm:min-h-[182px] xl:min-h-[168px]"
      >
      <div className="relative min-h-[172px] w-28 shrink-0 self-stretch overflow-hidden bg-slate-100 sm:w-36 xl:w-40">
        <img
          src={property?.gallery?.[0]?.url || property?.images?.[0]?.url || FALLBACK_IMAGE}
          alt=""
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute left-2 top-2 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-white/95 px-2 py-0.5 text-[9px] font-medium uppercase tracking-wide text-slate-700 shadow-sm">
            {category}
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-[9px] font-medium uppercase tracking-wide shadow-sm ${
              status === "active"
                ? "bg-emerald-100 text-emerald-700"
                : status === "rejected"
                  ? "bg-rose-100 text-rose-700"
                  : "bg-amber-100 text-amber-700"
            }`}
          >
            {status}
          </span>
        </div>
        {creatorTag && (
          <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-slate-800/90 px-2 py-0.5 text-[9px] font-medium uppercase tracking-wide text-white">
            <ShieldCheck className="h-2.5 w-2.5 text-emerald-400" /> {creatorTag}
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between p-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-[13px] font-medium text-slate-800 group-hover:text-emerald-700 sm:text-sm">
              {property?.title || "Unnamed property"}
            </h3>
            {propertyName?.trim() && (
              <p className="mt-1 flex items-center gap-1 truncate text-[11px] font-medium text-slate-600">
                <Building2 className="h-3 w-3 shrink-0 text-emerald-600" />
                <span className="truncate">{propertyName.trim()}</span>
              </p>
            )}
            <p className="mt-1 flex items-center gap-1 truncate text-[11px] text-slate-500">
              <MapPin className="h-3 w-3 shrink-0 text-emerald-600" />
              {location || "Location unavailable"}
            </p>
          </div>
          <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-emerald-600" />
        </div>

        <p className="mt-2 text-sm font-medium text-emerald-700">
          {formatPrice(property?.price)}
        </p>

        <div className="mt-2 grid gap-x-3 gap-y-1 border-t border-slate-100 pt-2 text-[10px] text-slate-500 sm:grid-cols-2">
          <span className="flex min-w-0 items-center gap-1.5">
            <UserRound className="h-3 w-3 shrink-0" />
            <span className="truncate">{creator}</span>
          </span>
          <span className="flex min-w-0 items-center gap-1.5">
            <Clock3 className="h-3 w-3 shrink-0" />
            <span className="truncate">{formatPostedAt(property?.createdAt)}</span>
          </span>
          <span className="truncate font-mono text-[9.5px] text-slate-400 sm:col-span-2">
            ID: {property?._id || "Unavailable"}
          </span>
          {status === "pending" && (
            <span className="flex min-w-0 items-center gap-1.5 truncate text-[10px] font-medium text-amber-700 sm:col-span-2">
              <ShieldCheck className="h-3 w-3 shrink-0" />
              <span className="truncate">
                Document verification pending
              </span>
            </span>
          )}
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setOpenLeads(true);
            }}
            className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-medium text-emerald-700 transition hover:bg-emerald-100"
          >
            <BarChart3 className="h-3 w-3" />
            Leads {leadsLoading ? "..." : totalLeads}
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onOpen();
            }}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-[10px] font-medium text-slate-600 transition hover:border-emerald-300 hover:text-emerald-700"
          >
            View <ChevronRight className="h-3 w-3" />
          </button>
          {canReview ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onReview();
              }}
              className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-[10px] font-medium text-white transition hover:bg-emerald-700"
            >
              Review <ChevronRight className="h-3 w-3" />
            </button>
          ) : (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onEdit();
              }}
              className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-[10px] font-medium text-white transition hover:bg-emerald-700"
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
            className="ml-auto inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-[10px] font-medium text-rose-700 transition hover:border-rose-300 hover:bg-rose-100"
          >
            <Trash2 className="h-3 w-3" />
            Delete
          </button>
        </div>
      </div>
    </article>

      {openLeads && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
          onClick={(event) => {
            event.stopPropagation();
            setOpenLeads(false);
          }}
        >
          <div
            className="w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
                  Property leads
                </p>
                <h3 className="mt-1 text-xl font-medium text-slate-900">
                  {property?.title || "Unnamed property"}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Total Leads: {totalLeads}
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    disabled={!leads.length}
                    onClick={() => exportLeads("csv")}
                    className="inline-flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Download className="h-4 w-4" /> CSV
                  </button>
                  <button
                    type="button"
                    disabled={!leads.length}
                    onClick={() => exportLeads("excel")}
                    className="inline-flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Download className="h-4 w-4" /> Excel
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpenLeads(false)}
                className="rounded-xl bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-auto p-5">
              {leadsLoading ? (
                <div className="py-10 text-center text-slate-400">Loading leads...</div>
              ) : leads.length === 0 ? (
                <div className="py-10 text-center text-slate-400">No leads found</div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-100">
                  <table className="w-full min-w-[780px]">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50">
                        {["#", "Lead Profile", "Contact", "Status", "Remarks", "Approval", "Created", "Actions"].map((head) => (
                          <th key={head} className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-400">
                            {head}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {leads.map((lead, index) => (
                        <tr key={lead._id || index} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="px-4 py-4 text-sm text-slate-400">{index + 1}</td>
                          <td className="px-4 py-4">
                            <p className="text-sm font-medium text-slate-800">{lead.name || "Unknown"}</p>
                            <p className="mt-1 text-xs text-slate-400">ID: {lead._id?.slice(-6) || "N/A"}</p>
                          </td>
                          <td className="px-4 py-4">
                            {lead.phone && (
                              <a href={`tel:${lead.phone}`} className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-emerald-700">
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
                            <div className="flex items-start gap-1.5 text-xs text-slate-600">
                              <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
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
                          <td className="whitespace-nowrap px-4 py-4 text-xs text-slate-500">
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
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { data: userData } = useCurrentUser();
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [locationFilters, setLocationFilters] = useState({
    state: "",
    city: "",
    locality: "",
  });
  const [locationSearch, setLocationSearch] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [createOpen, setCreateOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const analyticsQuery = useQuery({
    queryKey: ["properties-analytics", locationFilters],
    queryFn: async () => {
      const res = await getAllPropertiesAnalytics(buildAnalyticsParams(locationFilters));
      return res.data?.data || res.data;
    },
    staleTime: 60_000,
  });

  const categoryQueries = useQueries({
    queries: CATEGORIES.filter((item) => item.fetcher).map((item) => ({
      queryKey: ["properties-dashboard", item.value],
      queryFn: () => fetchEveryPage(item.fetcher),
      staleTime: 60_000,
    })),
  });

  const allProperties = useMemo(
    () =>
      CATEGORIES.filter((item) => item.fetcher).flatMap((item, index) =>
        (categoryQueries[index]?.data || []).map((property) => ({
          ...property,
          _category: item.value,
        })),
      ),
    [categoryQueries],
  );

  const analytics = analyticsQuery.data || {};
  const overview = analytics.overview || {};
  const analyticsTotal = overview.totalProperties || allProperties.length || 0;
  const activeLocationLabel =
    locationFilters.locality ||
    locationFilters.city ||
    locationFilters.state ||
    "All India";
  const locationSearchTerm = locationSearch.trim().toLowerCase();
  const relatedLocationMatches = useMemo(() => {
    const matches = {
      states: new Set(),
      cities: new Set(),
      localities: new Set(),
    };

    if (!locationSearchTerm) return matches;

    allProperties.forEach((property) => {
      const state = String(property?.state || "").trim();
      const city = String(property?.city || "").trim();
      const locality = String(property?.locality || "").trim();
      const searchable = [state, city, locality]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (!searchable.includes(locationSearchTerm)) return;

      if (state) matches.states.add(state.toLowerCase());
      if (city) matches.cities.add(city.toLowerCase());
      if (locality) matches.localities.add(locality.toLowerCase());
    });

    return matches;
  }, [allProperties, locationSearchTerm]);
  const matchesLocationSearch = (row, type) => {
    if (!locationSearchTerm) return true;
    const name = String(row?._id || "").toLowerCase();
    if (name.includes(locationSearchTerm)) return true;
    return relatedLocationMatches[type].has(name);
  };
  const stateRows = useMemo(
    () =>
      cleanRows(analytics.stateWise).filter((row) =>
        matchesLocationSearch(row, "states"),
      ),
    [analytics.stateWise, locationSearchTerm, relatedLocationMatches],
  );
  const cityRows = useMemo(
    () =>
      cleanRows(analytics.cityWise).filter((row) =>
        matchesLocationSearch(row, "cities"),
      ),
    [analytics.cityWise, locationSearchTerm, relatedLocationMatches],
  );
  const localityRows = useMemo(
    () =>
      cleanRows(analytics.localityWise).filter((row) =>
        matchesLocationSearch(row, "localities"),
      ),
    [analytics.localityWise, locationSearchTerm, relatedLocationMatches],
  );

  const visibleProperties = useMemo(() => {
    const term = search.trim().toLowerCase();
    return allProperties
      .filter((property) => category === "all" || property._category === category)
      .filter((property) => status === "all" || getStatus(property) === status)
      .filter((property) => !locationFilters.state || property?.state?.trim() === locationFilters.state)
      .filter((property) => !locationFilters.city || property?.city?.trim() === locationFilters.city)
      .filter((property) => !locationFilters.locality || property?.locality?.trim() === locationFilters.locality)
      .filter((property) => {
        if (!term) return true;
        return [
          property?.title,
          property?.city,
          property?.state,
          property?.locality,
          property?._id,
          property?.createdBy?.name,
        ].some((value) => String(value || "").toLowerCase().includes(term));
      })
      .sort((a, b) => {
        const first = new Date(a?.createdAt || 0).getTime();
        const second = new Date(b?.createdAt || 0).getTime();
        return sort === "newest" ? second - first : first - second;
      });
  }, [allProperties, category, locationFilters, search, sort, status]);

  const loading = categoryQueries.some((query) => query.isLoading);
  const failed = categoryQueries.filter((query) => query.isError).length;
  const propertyCategories = CATEGORIES.filter((item) => item.fetcher);
  const userRoleName = userData?.user?.roleName;
  const totalPages = Math.max(1, Math.ceil(visibleProperties.length / PAGE_SIZE));
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1).filter(
    (pageNumber) =>
      pageNumber === 1 ||
      pageNumber === totalPages ||
      Math.abs(pageNumber - page) <= 1,
  );
  const paginatedProperties = visibleProperties.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  useEffect(() => {
    setPage(1);
  }, [category, status, locationFilters, search, sort]);
  const activeFilterCount = [
    category !== "all",
    status !== "all",
    !!locationFilters.state,
    !!locationFilters.city,
    !!locationFilters.locality,
    !!locationSearch.trim(),
    !!search.trim(),
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
    setStatus("all");
    setSearch("");
    setLocationSearch("");
    setSort("newest");
    setLocationFilters({ state: "", city: "", locality: "" });
  };

  const rememberCategory = (nextCategory) => {
    localStorage.setItem("activeCategory", nextCategory);
    dispatch(setActiveCategory(nextCategory));
  };

  const startCreateProperty = (nextCategory) => {
    rememberCategory(nextCategory);
    setCreateOpen(false);
    navigate("/post-property");
  };

  const openPropertyDetails = (property) => {
    rememberCategory(property._category);
    navigate(`/property/${property._category}/${property._id}`);
  };

  const editProperty = (property) => {
    rememberCategory(property._category);
    localStorage.setItem("editPropertyId", property._id);
    localStorage.setItem("editPropertyCategory", property._category);
    navigate(`/edit-property/${property._id}`);
  };

  const canReviewProperty = (property) =>
    property?.status === "pending" &&
    property?.completion?.percent === 80 &&
    !isAgentCreatedProperty(property) &&
    userRoleName === "super_admin";

  const reviewProperty = (property) => {
    rememberCategory(property._category);
    const buildRoute = VERIFICATION_ROUTES[property._category];
    if (buildRoute) navigate(buildRoute(property._id));
  };

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
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["properties-dashboard"] }),
        queryClient.invalidateQueries({ queryKey: ["properties-analytics"] }),
      ]);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to delete property",
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <main className="min-h-full bg-slate-50 p-3 sm:p-4">
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
      <style>
        {`
          @keyframes propertyRowIn {
            from { opacity: 0; transform: translateY(8px) scale(0.99); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
        `}
      </style>
      <section className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-3 rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-emerald-700">
              <Building2 className="h-4 w-4" /> Property workspace
            </div>
            <h1 className="mt-1 text-xl font-medium text-slate-900 sm:text-2xl">All properties, one place</h1>
            <p className="mt-0.5 text-sm text-slate-500">
              Browse every category by location, status, poster, and posting time.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <button
                type="button"
                onClick={() => setCreateOpen((open) => !open)}
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-2.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-50"
              >
                <Plus className="h-4 w-4" /> Create property
              </button>
              {createOpen && (
                <div className="absolute right-0 z-20 mt-2 w-64 overflow-hidden rounded-2xl border border-emerald-100 bg-white p-2 shadow-xl">
                  <p className="px-3 py-2 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    Select category
                  </p>
                  {propertyCategories.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => startCreateProperty(item.value)}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-700"
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
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-medium text-white shadow-sm transition hover:bg-emerald-700"
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
              <span className="rounded-full bg-emerald-600 px-3 py-1 text-white">
                {activeLocationLabel}
              </span>
              {(locationFilters.state || locationFilters.city || locationFilters.locality) && (
                <button
                  type="button"
                  onClick={() => {
                    setLocationSearch("");
                    setLocationFilters({ state: "", city: "", locality: "" });
                  }}
                  className="rounded-full bg-slate-100 px-3 py-1 text-slate-600 transition hover:bg-slate-200"
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
                className="h-10 w-full rounded-xl border border-emerald-100 bg-white pl-9 pr-9 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              />
              {locationSearch && (
                <button
                  type="button"
                  onClick={() => setLocationSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                  aria-label="Clear location search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </label>
            <p className="text-[11px] text-slate-500">
              Showing {stateRows.length} states, {cityRows.length} cities, {localityRows.length} localities
            </p>
          </div>

          <div className="grid items-start gap-3 lg:grid-cols-[160px_repeat(3,minmax(0,1fr))]">
            <button
              type="button"
              onClick={() => {
                setLocationSearch("");
                setLocationFilters({ state: "", city: "", locality: "" });
              }}
              className={`h-fit rounded-2xl border p-3 text-left transition ${
                !locationFilters.state
                  ? "border-emerald-300 bg-emerald-50 shadow-sm"
                  : "border-slate-200 bg-white hover:border-emerald-200"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-600 text-white">
                  <Globe className="h-4 w-4" />
                </span>
                <span className="text-xl font-medium text-slate-900">{fmtNum(analyticsTotal)}</span>
              </div>
              <p className="mt-2 text-[13px] font-medium text-slate-900">All India</p>
              <p className="mt-0.5 text-[11px] text-slate-500">National CRM view</p>
            </button>

            <div className="rounded-2xl border border-slate-200 bg-white p-2.5">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">1. Select State</p>
                <span className="text-[10px] font-medium text-slate-400">{stateRows.length}</span>
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
                  <p className="rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-400">
                    {locationSearch ? "No matching state found" : "No state data found"}
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-2.5">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">2. Select City</p>
                <span className="text-[10px] font-medium text-slate-400">{cityRows.length}</span>
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
                  <p className="rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-400">
                    {locationSearch ? "No matching city found" : "Select a state to narrow cities"}
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-2.5">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">3. Select Locality</p>
                <span className="text-[10px] font-medium text-slate-400">{localityRows.length}</span>
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
                  <p className="rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-400">
                    {locationSearch ? "No matching locality found" : "Select a city to narrow localities"}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
            <span className="font-medium text-slate-400">Current scope:</span>
            <button
              type="button"
              onClick={() => {
                setLocationSearch("");
                setLocationFilters({ state: "", city: "", locality: "" });
              }}
              className={`rounded-full px-3 py-1 font-medium ${
                !locationFilters.state ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              India
            </button>
            {locationFilters.state && (
              <button
                type="button"
                onClick={() => setLocationFilters({ state: locationFilters.state, city: "", locality: "" })}
                className="rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-700"
              >
                {locationFilters.state}
              </button>
            )}
            {locationFilters.city && (
              <button
                type="button"
                onClick={() => setLocationFilters((previous) => ({ ...previous, locality: "" }))}
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

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Total Properties"
            value={overview.totalProperties ?? allProperties.length}
            sub={`${activeLocationLabel} inventory`}
            icon={Building2}
            tone="emerald"
            percent={100}
            active={category === "all" && status === "all"}
            onClick={() => {
              setCategory("all");
              setStatus("all");
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
            label="Draft / Incomplete"
            value={overview.draftProperties}
            sub="Follow-up queue"
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
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="flex items-center gap-2 text-xs font-medium text-slate-500">
                  <Eye className="h-4 w-4 text-emerald-600" /> Views
                </p>
                <p className="mt-1 text-xl font-medium text-slate-900">{fmtNum(overview.totalViews)}</p>
                <MiniLineChart
                  values={[overview.activeProperties, overview.pendingProperties, overview.draftProperties, overview.totalViews]}
                />
              </div>
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="flex items-center gap-2 text-xs font-medium text-slate-500">
                  <MousePointerClick className="h-4 w-4 text-emerald-600" /> Clicks
                </p>
                <p className="mt-1 text-xl font-medium text-slate-900">{fmtNum(overview.totalClicks)}</p>
                <MiniLineChart
                  values={[overview.totalClicks, overview.activeProperties, overview.pendingProperties, overview.totalClicks]}
                  color="#0EA5E9"
                />
              </div>
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="flex items-center gap-2 text-xs font-medium text-slate-500">
                  <MessageSquare className="h-4 w-4 text-emerald-600" /> Inquiries
                </p>
                <p className="mt-1 text-xl font-medium text-slate-900">{fmtNum(overview.totalInquiries)}</p>
                <MiniLineChart
                  values={[overview.totalInquiries, overview.pendingProperties, overview.activeProperties, overview.totalInquiries]}
                  color="#F59E0B"
                />
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-100 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Listing Type</p>
                <div className="mt-3 space-y-2">
                  {cleanRows(analytics.listingTypeWise).map((row) => (
                    <BreakdownRow key={row._id} row={row} total={analyticsTotal} color="bg-blue-500" />
                  ))}
                  {cleanRows(analytics.listingTypeWise).length === 0 && (
                    <p className="text-sm text-slate-400">No listing data yet</p>
                  )}
                </div>
              </div>
              <div className="rounded-2xl border border-slate-100 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Promotion Mix</p>
                <div className="mt-3 space-y-2">
                  {cleanRows(analytics.promotionWise).map((row) => (
                    <BreakdownRow key={row._id} row={row} total={analyticsTotal} color="bg-emerald-500" />
                  ))}
                  {cleanRows(analytics.promotionWise).length === 0 && (
                    <p className="text-sm text-slate-400">No promotion data yet</p>
                  )}
                </div>
              </div>
            </div>
          </Panel>

          <Panel title="Status Control" sub="Click a row to filter cards below" icon={PieChart}>
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
                          ? "bg-slate-500"
                          : "bg-rose-500"
                  }
                  selected={status === row._id}
                  onClick={() => setStatus(status === row._id ? "all" : row._id)}
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
                row={{ _id: "all properties", total: analyticsTotal, active: overview.activeProperties, pending: overview.pendingProperties, draft: overview.draftProperties }}
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
                  onClick={() => setCategory(category === row._id ? "all" : row._id)}
                />
              ))}
            </div>
          </Panel>

          <Panel title="Property Type Demand" sub="Best performing inventory buckets" icon={TrendingUp}>
            <div className="max-h-[420px] space-y-2 overflow-auto pr-1">
              {cleanRows(analytics.propertyTypeWise).slice(0, 12).map((row) => (
                <button
                  key={`${row.category}-${row._id}`}
                  type="button"
                  onClick={() => setCategory(row.category || "all")}
                  className="w-full rounded-2xl border border-slate-100 p-3 text-left transition hover:border-emerald-200 hover:bg-emerald-50/40"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{titleCase(row._id)}</p>
                      <p className="text-[11px] font-medium capitalize text-emerald-700">{row.category || "Unknown category"}</p>
                    </div>
                    <span className="text-lg font-medium text-slate-900">{fmtNum(row.total)}</span>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-1 text-center text-[10px] font-medium">
                    <span className="rounded-lg bg-emerald-50 py-1 text-emerald-700">A {row.active || 0}</span>
                    <span className="rounded-lg bg-amber-50 py-1 text-amber-700">P {row.pending || 0}</span>
                    <span className="rounded-lg bg-slate-100 py-1 text-slate-600">D {row.draft || 0}</span>
                  </div>
                </button>
              ))}
            </div>
          </Panel>
        </div>

        <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-slate-800">
                <Filter className="h-4 w-4 text-emerald-600" /> Filter property cards
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Cards below follow location, category, status, search and sort.
              </p>
            </div>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={clearFilters}
                className="w-fit rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-200"
              >
                Clear all filters
              </button>
            )}
          </div>
          <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setCategory(item.value)}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-medium transition ${
                  category === item.value
                    ? "border-emerald-600 bg-emerald-600 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-700"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(260px,1fr)_180px_160px]">
            <label className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search title, location, poster or ID"
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-9 text-sm outline-none transition focus:border-emerald-400 focus:bg-white"
              />
              {search && (
                <button type="button" onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <X className="h-4 w-4" />
                </button>
              )}
            </label>
            <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-emerald-400">
              {STATUSES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
            <select value={sort} onChange={(event) => setSort(event.target.value)} className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-emerald-400">
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>
          <div className="mt-4 flex flex-col gap-2 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <span className="inline-flex items-center gap-1.5">
              <Filter className="h-4 w-4" /> {visibleProperties.length} cards shown below • {activeFilterCount} filters active
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarClock className="h-4 w-4" /> Analytics source: `/analytics/properties`
            </span>
            {failed > 0 && <span className="font-medium text-amber-700">{failed} category could not be loaded</span>}
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-72 items-center justify-center"><LoadingSpinner /></div>
        ) : visibleProperties.length ? (
          <>
            <div className="mt-3 grid gap-3 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
              {paginatedProperties.map((property, index) => (
                <PropertyCard
                  key={`${property._category}-${property._id}`}
                  property={property}
                  category={property._category}
                  canReview={canReviewProperty(property)}
                  index={index}
                  onOpen={() => openPropertyDetails(property)}
                  onEdit={() => editProperty(property)}
                  onReview={() => reviewProperty(property)}
                  onDelete={() => setDeleteTarget(property)}
                />
              ))}
            </div>
            <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-xs shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <span className="font-medium text-slate-500">
                Showing {(page - 1) * PAGE_SIZE + 1}-
                {Math.min(page * PAGE_SIZE, visibleProperties.length)} of {visibleProperties.length}
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-slate-600 transition hover:border-emerald-300 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>
                {pageNumbers.map((pageNumber, index) => (
                  <button
                    key={`${pageNumber}-${index}`}
                    type="button"
                    onClick={() => setPage(pageNumber)}
                    className={`h-8 min-w-8 rounded-lg px-2 font-medium transition ${
                      page === pageNumber
                        ? "bg-emerald-600 text-white"
                        : "border border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-emerald-700"
                    }`}
                  >
                    {pageNumber}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={page === totalPages}
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-slate-600 transition hover:border-emerald-300 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="mt-4 flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white text-center">
            <MapPin className="h-9 w-9 text-slate-300" />
            <p className="mt-3 font-medium text-slate-700">No matching properties</p>
            <p className="mt-1 text-sm text-slate-400">Try another category, location, or status.</p>
          </div>
        )}
      </section>
    </main>
  );
}
