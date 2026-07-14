// src/features/property/components/shared/PropertyCard.jsx
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import {
  salesmanagerApproveAProject,
  deleteAllProjectLeads,
  deleteProjectLead,
  projectExternalFileAddLeads,
  salesmanagerRejectAProject,
  RenevaleProject,
} from "../../../../../features/property/propertyService";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  MapPin,
  Trash2,
  TrendingUp,
  Clock,
  RefreshCw,
  ChevronRight,
  Star,
  IndianRupee,
  MoreVertical,
  Pencil,
  Check,
  X,
  Minus,
  Plus,
  Download,
  Upload,
  Search,
  Phone,
  User,
  BarChart3,
  AlertTriangle,
} from "lucide-react";
import { updateProjectRank } from "../../../../../features/property/propertyService";
import { projectAnalytics } from "../../../../../features/property/propertyService";
import { toast } from "sonner";
import {
  formatPromotionDate,
  getPromotionTracking,
  promotionLifecycleClass,
  promotionLifecycleCopy,
  titlePromotionType,
} from "./promotionTracking";

// ─────────────────────────────────────────────────────────────────────────────
const STATUS_STYLES = {
  active:   "bg-green-100 text-green-700",
  inactive: "bg-slate-100 text-slate-600",
  expired:  "bg-red-100 text-red-600",
  pending:  "bg-yellow-100 text-yellow-700",
};

const TYPE_STYLES = {
  prime:     "bg-yellow-50 text-yellow-700 border-yellow-200",
  featured:  "bg-blue-50 text-blue-700 border-blue-200",
  normal:    "bg-slate-50 text-slate-600 border-slate-200",
  sponsored: "bg-purple-50 text-purple-700 border-purple-200",
};

const TYPE_RANK_ACCENT = {
  prime:     { ring: "#EAB308", bg: "#FEF9C3", text: "#854D0E" },
  featured:  { ring: "#3B82F6", bg: "#EFF6FF", text: "#1E40AF" },
  normal:    { ring: "#94A3B8", bg: "#F8FAFC", text: "#475569" },
  sponsored: { ring: "#A855F7", bg: "#FAF5FF", text: "#6B21A8" },
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

const getApiErrorMessage = (err, fallback) => {
  const data = err?.response?.data;
  if (typeof data === "string") return data;
  return data?.message || data?.error || err?.message || fallback;
};

const formatLeadText = (value) => {
  if (value === null || value === undefined || value === "") return "-";
  return String(value)
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
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

// ─── Portal Menu ─────────────────────────────────────────────────────────────
function PortalMenu({ anchorRef, open, onClose, children }) {
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!open || !anchorRef.current) return;
    const recalc = () => {
      const rect = anchorRef.current.getBoundingClientRect();
      const menuWidth = 160;
      const viewportWidth = window.innerWidth;
      let left = rect.right - menuWidth;
      if (left < 8) left = 8;
      if (left + menuWidth > viewportWidth - 8) left = viewportWidth - menuWidth - 8;
      setPos({ top: rect.bottom + window.scrollY + 4, left: left + window.scrollX });
    };
    recalc();
    window.addEventListener("scroll", recalc, true);
    window.addEventListener("resize", recalc);
    return () => {
      window.removeEventListener("scroll", recalc, true);
      window.removeEventListener("resize", recalc);
    };
  }, [open, anchorRef]);

  if (!open) return null;

  return createPortal(
    <>
      <div className="fixed inset-0" style={{ zIndex: 9998 }} onClick={onClose} />
      <div
        className="absolute bg-white border border-slate-200 shadow-2xl rounded-xl overflow-hidden"
        style={{ zIndex: 9999, top: pos.top, left: pos.left, width: 160, animation: "menuIn 0.12s ease" }}
      >
        {children}
      </div>
      <style>{`
        @keyframes menuIn {
          from { opacity: 0; transform: translateY(-4px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>,
    document.body
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function PropertyCard({
  property: p,
  type,
  onDelete,
  onPromote,
  onExpire,
  onReset,
  onRankUpdated,
}) {
  const navigate   = useNavigate();

  const queryClient = useQueryClient();

  const menuBtnRef = useRef(null);
  const inputRef   = useRef(null);
  const leadFileRef = useRef(null);

  const [openLeads, setOpenLeads] = useState(false);
  const [leadSearch, setLeadSearch] = useState("");
  const [leadDeleteTarget, setLeadDeleteTarget] = useState(null);

  const { data: leadsData, isLoading: leadsLoading } = useQuery({
    queryKey: ["projectLeads", p?._id],
    queryFn: async () => {
      const res = await projectAnalytics(p?._id);
      return res.data;
    },
    enabled: !!p?._id,
  });

  const leads = (Array.isArray(leadsData?.data) ? leadsData.data : [])
    .slice()
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  const totalLeads = typeof leadsData?.count === "number" ? leadsData.count : leads.length;
  const leadSearchTerm = leadSearch.trim().toLowerCase();
  const filteredLeads = leadSearchTerm
    ? leads.filter((lead) => getLeadSearchText(lead).includes(leadSearchTerm))
    : leads;

  const importLeadsMutation = useMutation({
    mutationFn: (file) => {
      const formData = new FormData();
      formData.append("file", file);
      return projectExternalFileAddLeads(p?._id, formData);
    },
    onSuccess: async () => {
      toast.success("Leads imported successfully");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["projectLeads", p?._id] }),
        queryClient.invalidateQueries({ queryKey: ["projectAnalytics", p?._id] }),
        queryClient.invalidateQueries({ queryKey: ["project-analytics"] }),
        queryClient.invalidateQueries({ queryKey: ["master-project-analytics"] }),
      ]);
      onRankUpdated?.();
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to import leads");
    },
    onSettled: () => {
      if (leadFileRef.current) leadFileRef.current.value = "";
    },
  });

  const handleLeadFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    importLeadsMutation.mutate(file);
  };

  const refreshLeadQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["projectLeads", p?._id] }),
      queryClient.invalidateQueries({ queryKey: ["projectAnalytics", p?._id] }),
      queryClient.invalidateQueries({ queryKey: ["project-analytics"] }),
      queryClient.invalidateQueries({ queryKey: ["master-project-analytics"] }),
    ]);
    onRankUpdated?.();
  };

  const deleteLeadMutation = useMutation({
    mutationFn: (id) => deleteProjectLead(id),
    onSuccess: async () => {
      toast.success("Lead deleted");
      setLeadDeleteTarget(null);
      await refreshLeadQueries();
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Failed to delete lead"));
    },
  });

  const deleteAllLeadsMutation = useMutation({
    mutationFn: () => deleteAllProjectLeads(p?._id),
    onSuccess: async (res) => {
      const count = res?.data?.data?.deletedCount;
      toast.success(
        typeof count === "number"
          ? `${count} project leads deleted`
          : "Project leads deleted"
      );
      setLeadDeleteTarget(null);
      await refreshLeadQueries();
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err, "Failed to delete project leads"));
    },
  });

  const isDeletingLead =
    deleteLeadMutation.isPending || deleteAllLeadsMutation.isPending;


  const approveMutation = useMutation({
    mutationFn: salesmanagerApproveAProject,

    onSuccess: () => {
      toast.success("Project Approved");
      queryClient.invalidateQueries({ queryKey: ["pending-projects"] });
      queryClient.invalidateQueries({ queryKey: ["featured-projects"] });
      queryClient.invalidateQueries({ queryKey: ["project-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["master-project-analytics"] });
      onRankUpdated?.();
    },

    onError: () => {
      toast.error("Approval Failed");
    },
  });


  const rejectMutation = useMutation({
    mutationFn: salesmanagerRejectAProject,

    onSuccess: () => {
      toast.success("Project Rejected");
      queryClient.invalidateQueries({ queryKey: ["pending-projects"] });
      queryClient.invalidateQueries({ queryKey: ["featured-projects"] });
      queryClient.invalidateQueries({ queryKey: ["project-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["master-project-analytics"] });
      onRankUpdated?.();
    },

    onError: () => {
      toast.error("Reject Failed");
    },
  });

  const downloadCSV = () => {
    const rows = leads.map((lead) => ({
      "Full Name": lead.name || "",
      "Phone Number": lead.phone || "",
      Email: lead.email || "",
      "Lead Time": formatLeadDateTime(lead.sourceCreatedAt || lead.createdAt),
      "Planning To Purchase": formatLeadText(lead.purchaseTimeline),
      "Budget Range": formatLeadText(lead.budgetRange),
      Status: formatLeadText(lead.status),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const csv = XLSX.utils.sheet_to_csv(ws);
    saveAs(new Blob([csv], { type: "text/csv;charset=utf-8;" }), `project-leads-${p?._id}.csv`);
  };

  const downloadExcel = () => {
    const rows = leads.map((lead) => ({
      "Full Name": lead.name || "",
      "Phone Number": lead.phone || "",
      Email: lead.email || "",
      "Lead Time": formatLeadDateTime(lead.sourceCreatedAt || lead.createdAt),
      "Planning To Purchase": formatLeadText(lead.purchaseTimeline),
      "Budget Range": formatLeadText(lead.budgetRange),
      Status: formatLeadText(lead.status),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Project Leads");
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8" }),
      `project-leads-${p?._id}.xlsx`
    );
  };

  // ── States ────────────────────────────────────────────────────────────────
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [rankOpen,    setRankOpen]    = useState(false);
  const [rankValue,   setRankValue]   = useState(p.rank ?? "");
  const [rankLoading, setRankLoading] = useState(false);
  const [renewLoading, setRenewLoading] = useState(false);

  const heroImage = p.heroImage || p.gallerySummary?.[0]?.url;
  const accent    = TYPE_RANK_ACCENT[type] || TYPE_RANK_ACCENT.normal;

  const handleCardClick = (e) => {
    if (e.target.closest("[data-action]")) return;
    if (rankOpen) { setRankOpen(false); return; }
    navigate(`/featured-project/${p._id}`);
  };

  const openRankDrawer = () => {
    setRankValue(p.rank ?? "");
    setRankOpen(true);
    setMenuOpen(false);
    setTimeout(() => inputRef.current?.select(), 80);
  };

  const stepRank = (delta) =>
    setRankValue((prev) => {
      const n = parseInt(prev, 10);
      return isNaN(n) ? 1 : Math.max(1, n + delta);
    });

  const handleRankSave = async () => {
    const parsed = parseInt(rankValue, 10);
    if (isNaN(parsed) || parsed < 1) { toast.error("Enter a valid rank (≥ 1)"); return; }
    try {
      setRankLoading(true);
      await updateProjectRank(p._id, parsed);
      toast.success("Rank updated");
      setRankOpen(false);
      onRankUpdated?.();
    } catch { toast.error("Failed to update rank"); }
    finally { setRankLoading(false); }
  };

  const handleRankCancel = () => { setRankValue(p.rank ?? ""); setRankOpen(false); };

  const MenuItem = ({ icon: Icon, iconClass = "", label, labelClass = "text-slate-700", onClick }) => (
    <button
      onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onClick?.(); }}
      className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-slate-50 transition ${labelClass}`}
    >
      <Icon className={`w-3 h-3 flex-shrink-0 ${iconClass}`} />
      {label}
    </button>
  );

  const tracking = getPromotionTracking(p);
  const hasPromotion = tracking.currentType !== "normal";
  const canRenewPromotion = hasPromotion;
  const promotionHeadline =
    tracking.previousType && tracking.previousType !== tracking.currentType
      ? `Promoted to ${titlePromotionType(tracking.currentType)}`
      : `${titlePromotionType(tracking.currentType)} promotion`;
  const promotionSubline =
    tracking.previousType && tracking.previousType !== tracking.currentType
      ? `Was ${titlePromotionType(tracking.previousType)}`
      : "Promotion running";


    const handleRenew = async () => {
      try {
        setRenewLoading(true);
        await RenevaleProject(p._id);
        toast.success("Project renewed successfully");
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["featured-projects"] }),
          queryClient.invalidateQueries({ queryKey: ["pending-projects"] }),
          queryClient.invalidateQueries({ queryKey: ["master-project-analytics"] }),
          queryClient.invalidateQueries({ queryKey: ["project-analytics"] }),
        ]);
        onRankUpdated?.();
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to renew project");
      } finally {
        setRenewLoading(false);
      }
    };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div
      className="relative min-h-[224px] overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 group cursor-pointer hover:border-[#27AE60]/30 hover:shadow-md sm:h-[224px]"
      onClick={handleCardClick}
    >
      {/* ── HORIZONTAL FLEX LAYOUT ─────────────────────────────────────── */}
      <div className="flex h-full flex-row">
        {/* ── LEFT: IMAGE (fixed width, full card height) ─────────────── */}
        <div className="relative min-h-[224px] w-32 flex-shrink-0 overflow-hidden bg-slate-100 sm:h-full sm:w-40 lg:w-44">
          {heroImage ? (
            <img
              src={heroImage}
              alt={p.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-slate-300">
              <MapPin className="w-7 h-7" />
            </div>
          )}

          {/* Sale / Type badge */}
          <div
            className={`absolute top-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full border capitalize ${
              TYPE_STYLES[type] || TYPE_STYLES.normal
            }`}
          >
            {type === "normal" ? "Sale" : titlePromotionType(type)}
          </div>

          {/* Rank pill */}
          <div
            className="absolute bottom-1.5 left-1.5"
            data-action
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={openRankDrawer}
              style={{
                background: p.rank != null ? accent.bg : "rgba(0,0,0,0.65)",
                border: `1px solid ${p.rank != null ? accent.ring : "transparent"}`,
                color: p.rank != null ? accent.text : "#fff",
              }}
              className="flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full transition-all hover:scale-105 active:scale-95"
              title="Edit rank"
            >
              <Star
                className="w-2 h-2"
                style={{
                  fill: p.rank != null ? accent.ring : "#FACC15",
                  color: p.rank != null ? accent.ring : "#FACC15",
                }}
              />
              {p.rank != null ? `#${p.rank}` : "Rank"}
              <Pencil className="w-1.5 h-1.5 opacity-60" />
            </button>
          </div>
        </div>

        {/* ── RIGHT: CONTENT ──────────────────────────────────────────── */}
        <div className="flex min-w-0 flex-1 flex-col p-3 sm:p-3.5">
          {/* Top row: title + menu icon */}
          <div className="flex min-h-[48px] items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="line-clamp-1 text-sm font-semibold leading-tight text-slate-900 sm:text-[15px]">
                {p.title}
              </h3>
              {/* Location */}
              <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
                <MapPin className="w-2.5 h-2.5 flex-shrink-0 text-[#27AE60]" />
                <span className="truncate">
                  {p.address ? `${p.address}, ` : ""}
                  {p.city}
                </span>
              </div>
            </div>

            {/* ⋮ Menu button */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative flex-shrink-0"
              data-action
            >
              <button
                ref={menuBtnRef}
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen((o) => !o);
                }}
                className="p-1 rounded-md hover:bg-slate-100 text-slate-500 transition"
              >
                <MoreVertical className="w-3 h-3" />
              </button>
              <PortalMenu
                anchorRef={menuBtnRef}
                open={menuOpen}
                onClose={() => setMenuOpen(false)}
              >
                <MenuItem
                  icon={Star}
                  iconClass="text-yellow-500 fill-yellow-400"
                  label="Edit Rank"
                  onClick={openRankDrawer}
                />
                <MenuItem
                  icon={TrendingUp}
                  iconClass="text-blue-500"
                  label="Promote"
                  onClick={onPromote}
                />
                <MenuItem
                  icon={Clock}
                  iconClass="text-orange-500"
                  label="Expire"
                  onClick={onExpire}
                />
                {/* <MenuItem
                  icon={RefreshCw}
                  iconClass="text-[#27AE60]"
                  label="Reset"
                  onClick={onReset}
                /> */}
                <div className="border-t border-slate-100" />
                <MenuItem
                  icon={Trash2}
                  iconClass="text-red-500"
                  label="Delete"
                  labelClass="text-red-600 hover:bg-red-50"
                  onClick={onDelete}
                />
              </PortalMenu>
            </div>
          </div>

          {/* Price */}
          <div className="mt-1.5 min-h-[18px]">
            {(p.priceFrom || p.priceTo) && (
            <div className="flex items-center gap-0.5 text-xs font-semibold text-slate-800">
              <IndianRupee className="w-2.5 h-2.5 text-[#27AE60]" />
              <span>
                {p.priceFrom
                  ? new Intl.NumberFormat("en-IN", {
                      style: "currency",
                      currency: "INR",
                      maximumFractionDigits: 0,
                      notation: "compact",
                    }).format(p.priceFrom)
                  : ""}
                {p.priceTo
                  ? ` – ${new Intl.NumberFormat("en-IN", {
                      style: "currency",
                      currency: "INR",
                      maximumFractionDigits: 0,
                      notation: "compact",
                    }).format(p.priceTo)}`
                  : ""}
              </span>
            </div>
            )}
          </div>

          {hasPromotion && (
            <div className="mt-2 min-h-[74px] rounded-xl border border-slate-100 bg-slate-50/80 px-2.5 py-2 text-[10px]">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-700">
                    {promotionHeadline}
                  </p>
                  <p className="mt-0.5 truncate text-slate-400">
                    {promotionSubline}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full border px-1.5 py-0.5 ${promotionLifecycleClass(
                    tracking.lifecycle,
                  )}`}
                >
                  {promotionLifecycleCopy(tracking)}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between gap-2 text-slate-400">
                <span>Started {formatPromotionDate(tracking.startedAt)}</span>
                <span>Ends {formatPromotionDate(tracking.expiresAt)}</span>
              </div>
              {canRenewPromotion && (
                <button
                  type="button"
                  disabled={renewLoading}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRenew();
                  }}
                  className="mt-1 rounded bg-[#27AE60] px-2 py-0.5 text-[9px] font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {renewLoading ? "Renewing..." : "Renew now"}
                </button>
              )}
            </div>
          )}
          {!hasPromotion && (
            <div className="mt-2 flex min-h-[74px] items-center rounded-xl border border-slate-100 bg-slate-50/60 px-2.5 py-2 text-[10px]">
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-600">
                  Standard listing
                </p>
                <p className="mt-1 text-slate-400">
                  No active promotion
                </p>
              </div>
            </div>
          )}
          {/* Bottom row: status + action buttons */}
          <div
            className="mt-auto flex min-h-[32px] flex-wrap items-center justify-between gap-2 pt-2"
            data-action
          >
            <span
              className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full capitalize ${
                STATUS_STYLES[p.status] || STATUS_STYLES.inactive
              }`}
            >
              {p.status || "unknown"}
            </span>

            {p.status === "pending" && (
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    approveMutation.mutate(p._id);
                  }}
                  className="px-2 py-1 bg-green-600 text-white rounded text-xs"
                >
                  Approve
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    rejectMutation.mutate(p._id);
                  }}
                  className="px-2 py-1 bg-red-600 text-white rounded text-xs"
                >
                  Reject
                </button>
              </div>
            )}

            <div className="flex min-w-0 flex-wrap items-center justify-end gap-x-2 gap-y-1">
              {/* Visit */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const routeType =
                    p?.promotion?.type === "prime" ? "prime" : "project";
                  window.open(
                    `https://propenu.com/${routeType}/${p.slug}`,
                    "_blank",
                    "noopener,noreferrer",
                  );
                }}
                className="flex items-center gap-0.5 whitespace-nowrap text-[10px] font-medium text-[#27AE60] hover:underline"
              >
                Visit Microsite <ChevronRight className="w-2.5 h-2.5" />
              </button>

              {/* Edit */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/post-property/${p._id}`);
                }}
                className="flex items-center gap-0.5 whitespace-nowrap text-[10px] font-medium text-[#27AE60] hover:underline"
              >
                Edit <ChevronRight className="w-2.5 h-2.5" />
              </button>

              {/* Leads */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenLeads(true);
                }}
                className="flex items-center gap-1 whitespace-nowrap rounded-lg border border-[#27AE60]/20 bg-green-50 px-2 py-1 text-[10px] font-medium text-[#27AE60] transition hover:bg-green-100"
              >
                <BarChart3 className="w-2.5 h-2.5" />
                {leadsLoading ? "..." : totalLeads}
              </button>
            </div>
          </div>
        </div>
        {/* ── RANK DRAWER (slides up over image) ───────────────────── */}
        <div
          data-action
          onClick={(e) => e.stopPropagation()}
          className="absolute inset-x-0 bottom-0 w-full transition-transform duration-300 ease-in-out"
          style={{
            transform: rankOpen ? "translateY(0)" : "translateY(100%)",
            background: "rgba(255,255,255,0.97)",
            backdropFilter: "blur(4px)",
            borderTop: `2px solid ${accent.ring}`,
            padding: "6px 8px",
          }}
        >
          <p
            className="text-[9px] font-semibold mb-1 flex items-center gap-1"
            style={{ color: accent.text }}
          >
            <Star
              className="w-2.5 h-2.5"
              style={{ fill: accent.ring, color: accent.ring }}
            />
            Set Rank
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => stepRank(-1)}
              className="w-5 h-5 rounded flex items-center justify-center border border-slate-200 hover:bg-slate-100 text-slate-500 flex-shrink-0"
            >
              <Minus className="w-2 h-2" />
            </button>
            <input
              ref={inputRef}
              type="number"
              min="1"
              value={rankValue}
              onChange={(e) => setRankValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRankSave();
                if (e.key === "Escape") handleRankCancel();
                if (e.key === "ArrowUp") {
                  e.preventDefault();
                  stepRank(+1);
                }
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  stepRank(-1);
                }
              }}
              className="flex-1 min-w-0 text-center text-[10px] font-bold outline-none rounded py-0.5 border"
              style={{
                borderColor: accent.ring,
                color: accent.text,
                background: accent.bg,
              }}
              placeholder="1"
            />
            <button
              onClick={() => stepRank(+1)}
              className="w-5 h-5 rounded flex items-center justify-center border border-slate-200 hover:bg-slate-100 text-slate-500 flex-shrink-0"
            >
              <Plus className="w-2 h-2" />
            </button>
            <button
              onClick={handleRankSave}
              disabled={rankLoading}
              className="w-5 h-5 rounded flex items-center justify-center text-white flex-shrink-0 disabled:opacity-50"
              style={{ background: accent.ring }}
            >
              {rankLoading ? (
                <span className="text-[8px] animate-pulse">…</span>
              ) : (
                <Check className="w-2 h-2" />
              )}
            </button>
            <button
              onClick={handleRankCancel}
              className="w-5 h-5 rounded flex items-center justify-center border border-slate-200 hover:bg-red-50 text-slate-400 hover:text-red-500 flex-shrink-0"
            >
              <X className="w-2 h-2" />
            </button>
          </div>
        </div>
      </div>

      {/* ── LEADS MODAL ─────────────────────────────────────────────────── */}
      {openLeads && (
        <div
          className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex flex-col gap-3 border-b px-4 py-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Project Leads
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  Showing full name, contact details, lead time, purchase plan, budget and status.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <input
                    ref={leadFileRef}
                    type="file"
                    accept=".csv,.xls,.xlsx"
                    className="hidden"
                    onChange={handleLeadFileChange}
                  />
                  <button
                    onClick={() => leadFileRef.current?.click()}
                    disabled={importLeadsMutation.isPending}
                    className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    {importLeadsMutation.isPending ? "Importing..." : "Import leads"}
                  </button>
                  <button
                    onClick={downloadCSV}
                    disabled={!leads.length}
                    className="flex items-center gap-1.5 rounded-lg border border-green-100 bg-green-50 px-2.5 py-1.5 text-xs font-bold text-[#27AE60] disabled:opacity-50"
                  >
                    <Download className="h-3.5 w-3.5" /> CSV
                  </button>
                  <button
                    onClick={downloadExcel}
                    disabled={!leads.length}
                    className="flex items-center gap-1.5 rounded-lg border border-blue-100 bg-blue-50 px-2.5 py-1.5 text-xs font-bold text-blue-600 disabled:opacity-50"
                  >
                    <Download className="h-3.5 w-3.5" /> Excel
                  </button>
                  <button
                    type="button"
                    onClick={() => setLeadDeleteTarget({ type: "all" })}
                    disabled={!leads.length || isDeletingLead}
                    className="flex items-center gap-1.5 rounded-lg border border-red-100 bg-red-50 px-2.5 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete all
                  </button>
                </div>
              </div>
              <button
                onClick={() => setOpenLeads(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-sm hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="max-h-[72vh] overflow-y-auto p-3 sm:p-4">
              {leadsLoading ? (
                <div className="py-10 text-center text-slate-400">
                  Loading leads...
                </div>
              ) : leads.length === 0 ? (
                <div className="py-10 text-center text-slate-400">
                  No leads found
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
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

                  {filteredLeads.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-200 py-10 text-center text-sm text-slate-400">
                      No leads match your search.
                    </div>
                  ) : (
                <div className="overflow-hidden rounded-xl border border-slate-100">
                  <div className="max-h-[52vh] overflow-auto">
                  <table className="w-full min-w-[1080px] table-fixed">
                    <thead>
                      <tr className="sticky top-0 z-10 border-b bg-slate-50">
                        <th className="w-[15%] px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">Full Name</th>
                        <th className="w-[12%] px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">Phone Number</th>
                        <th className="w-[18%] px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">Email</th>
                        <th className="w-[14%] px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">Lead Time</th>
                        <th className="w-[13%] px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">Planning</th>
                        <th className="w-[10%] px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">Budget</th>
                        <th className="w-[10%] px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</th>
                        <th className="w-[8%] px-3 py-2 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">Delete</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLeads.map((lead, index) => (
                        <tr
                          key={lead._id || index}
                          className="border-b border-slate-100 transition hover:bg-slate-50"
                        >
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-2">
                              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                                <User className="h-3.5 w-3.5 text-[#27AE60]" />
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-slate-800">
                                  {lead.name || "-"}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-2.5">
                            <a
                              href={`tel:${lead.phone}`}
                              className="flex items-center gap-1.5 whitespace-nowrap text-xs font-medium text-slate-700"
                            >
                              <Phone className="h-3.5 w-3.5 text-[#27AE60]" />
                              {lead.phone || "-"}
                            </a>
                          </td>
                          <td className="px-3 py-2.5 text-xs text-slate-600">
                            <span className="block truncate">
                              {lead.email || "-"}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-2.5 text-xs text-slate-500">
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
                            <span className={`inline-flex max-w-full rounded-full border px-2 py-0.5 text-[11px] font-bold ${leadStatusClass(lead.status)}`}>
                              {formatLeadText(lead.status)}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <button
                              type="button"
                              onClick={() => setLeadDeleteTarget({ type: "one", lead })}
                              disabled={isDeletingLead}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-100 bg-white text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                              title="Delete lead"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {leadDeleteTarget && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
            <div className="flex gap-3">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {leadDeleteTarget.type === "all"
                    ? "Delete all project leads?"
                    : "Delete this lead?"}
                </h3>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  {leadDeleteTarget.type === "all"
                    ? "This deletes only leads for this project. The project/property will not be deleted."
                    : `This deletes only ${leadDeleteTarget.lead?.name || "this lead"}. The project/property will not be deleted.`}
                </p>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setLeadDeleteTarget(null)}
                disabled={isDeletingLead}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (leadDeleteTarget.type === "all") {
                    deleteAllLeadsMutation.mutate();
                    return;
                  }
                  deleteLeadMutation.mutate(leadDeleteTarget.lead?._id);
                }}
                disabled={isDeletingLead}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
              >
                {isDeletingLead ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

