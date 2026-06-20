// src/features/property/components/shared/PropertyCard.jsx
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import {
  salesmanagerApproveAProject,
  salesmanagerRejectAProject,
  editFeaturedProject,
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
  Phone,
  User,
  BarChart3,
} from "lucide-react";
import { updateProjectRank } from "../../../../../features/property/propertyService";
import { projectAnalytics } from "../../../../../features/property/propertyService";
import { toast } from "sonner";

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

  const [openLeads, setOpenLeads] = useState(false);

  const { data: leadsData, isLoading: leadsLoading } = useQuery({
    queryKey: ["projectLeads", p?._id],
    queryFn: async () => {
      const res = await projectAnalytics(p?._id);
      return res.data;
    },
    enabled: !!p?._id,
  });

  const leads = Array.isArray(leadsData?.data) ? leadsData.data : [];
  const totalLeads = typeof leadsData?.count === "number" ? leadsData.count : leads.length;


  const approveMutation = useMutation({
    mutationFn: salesmanagerApproveAProject,

    onSuccess: () => {
      toast.success("Project Approved");
      queryClient.invalidateQueries({
        queryKey: ["pending-projects"],
      });
    },

    onError: () => {
      toast.error("Approval Failed");
    },
  });


  const rejectMutation = useMutation({
    mutationFn: salesmanagerRejectAProject,

    onSuccess: () => {
      toast.success("Project Rejected");
      queryClient.invalidateQueries({
        queryKey: ["pending-projects"],
      });
    },

    onError: () => {
      toast.error("Reject Failed");
    },
  });

  const downloadCSV = () => {
    const rows = leads.map((lead, i) => ({
      SNo: i + 1, Name: lead.name, Phone: lead.phone,
      Email: lead.email, Status: lead.status,
      Date: new Date(lead.createdAt).toLocaleString("en-IN"),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const csv = XLSX.utils.sheet_to_csv(ws);
    saveAs(new Blob([csv], { type: "text/csv;charset=utf-8;" }), `project-leads-${p?._id}.csv`);
  };

  const downloadExcel = () => {
    const rows = leads.map((lead, i) => ({
      SNo: i + 1, Name: lead.name, Phone: lead.phone,
      Email: lead.email, Status: lead.status,
      Date: new Date(lead.createdAt).toLocaleString("en-IN"),
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

  const startDate = p?.promotion?.startDate
    ? new Date(p.promotion.startDate)
    : null;

  const expiryDate = p?.promotion?.boostExpiry
    ? new Date(p.promotion.boostExpiry)
    : null;

  const today = new Date();

  const daysLeft = expiryDate
    ? Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24))
    : 0;

  const promotionStatus =
    !startDate || !expiryDate
      ? null
      : today < startDate
        ? "scheduled"
        : today > expiryDate
          ? "expired"
          : daysLeft <= 3
            ? "expiringSoon"
            : "active";

  const formatDate = (date) =>
    date?.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    });


    const handleRenew = async () => {
      try {
        const currentExpiry = p?.promotion?.boostExpiry
          ? new Date(p.promotion.boostExpiry)
          : new Date();

        currentExpiry.setDate(currentExpiry.getDate() + 10);

        await editFeaturedProject(p._id, {
          promotion: {
            type: p.promotion.type,
            boostExpiry: currentExpiry,
          },
        });

        toast.success("Promotion extended by 10 days");

        onRankUpdated?.();
      } catch (err) {
        toast.error("Failed to renew promotion");
      }
    };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div
      className="relative bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-slate-100 overflow-hidden group cursor-pointer"
      onClick={handleCardClick}
    >
      {/* ── HORIZONTAL FLEX LAYOUT ─────────────────────────────────────── */}
      <div className="flex flex-row">
        {/* ── LEFT: IMAGE (fixed width, full card height) ─────────────── */}
        <div className="relative w-28  flex-shrink-0 overflow-hidden bg-slate-100">
          {heroImage ? (
            <img
              src={heroImage}
              alt={p.title}
              className={`w-full h-28 object-cover group-hover:scale-105 transition-transform duration-500`}
            />
          ) : (
            <div className="w-full h-full min-h-[110px] flex items-center justify-center text-slate-300">
              <MapPin className="w-7 h-7" />
            </div>
          )}

          {/* Sale / Type badge */}
          <div
            className={`absolute top-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full border capitalize ${
              TYPE_STYLES[type] || TYPE_STYLES.normal
            }`}
          >
            {type === "normal" ? "Sale" : type}
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
        <div className="flex-1 min-w-0 p-2.5 flex flex-col justify-between">
          {/* Top row: title + menu icon */}
          <div className="flex items-start justify-between gap-1">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-slate-900 text-xs leading-tight line-clamp-1">
                {p.title}
              </h3>
              {/* Location */}
              <div className="flex items-center gap-1 text-slate-500 text-[10px] mt-0.5">
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
                <MenuItem
                  icon={RefreshCw}
                  iconClass="text-[#27AE60]"
                  label="Reset"
                  onClick={onReset}
                />
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
          {(p.priceFrom || p.priceTo) && (
            <div className="flex items-center gap-0.5 text-[10px] text-slate-700 font-bold mt-1">
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

          {p?.promotion && p.promotion.type !== "normal" && (
            <div className="flex items-center justify-evenly gap-1 text-[9px] space-y-0.5  ">
              <div className="text-slate-500">
                Started: {formatDate(startDate)}
              </div>

              <div className="text-slate-500">
                Ends: {formatDate(expiryDate)}
              </div>

              {promotionStatus === "active" && (
                <div className="text-green-600 font-semibold">
                  🟢 {daysLeft} days left
                </div>
              )}

              {/* {promotionStatus === "expiringSoon" && (
                <div className="text-orange-600 font-semibold">
                  ⚠ Expires in {daysLeft} day{daysLeft > 1 ? "s" : ""}
                </div>
              )} */}

              {promotionStatus === "expiringSoon" && (
                <div className="flex items-center gap-2">
                  <span className="text-orange-600 font-semibold">
                    ⚠ Expires in {daysLeft} day{daysLeft > 1 ? "s" : ""}
                  </span>

                  {/* {daysLeft <= 2 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRenew();
                      }}
                      className="px-2 py-1 rounded bg-green-600 text-white text-[9px] font-bold"
                    >
                      Renew +10 Days
                    </button>
                  )} */}
                </div>
              )}

              {/* {promotionStatus === "expired" && (
                <div className="text-red-600 font-semibold">
                  🔴 Promotion expired
                </div>
              )} */}
              {promotionStatus === "expired" && (
                <div className="flex items-center gap-2">
                  <span className="text-red-600 font-semibold">
                    🔴 Promotion expired
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRenew();
                    }}
                    className="px-2 py-1 rounded bg-green-600 text-white text-[9px] font-bold"
                  >
                    Renew +10 Days
                  </button>
                </div>
              )}

              {promotionStatus === "scheduled" && (
                <div className="text-blue-600 font-semibold">🔵 Scheduled</div>
              )}
            </div>
          )}

          {/* Bottom row: status + action buttons */}
          <div
            className="flex items-center justify-between gap-1 mt-1.5 flex-wrap"
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

            <div className="flex items-center gap-1">
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
                className="text-[9px] text-[#27AE60] font-medium hover:underline flex items-center gap-0.5"
              >
                Visit Microsite <ChevronRight className="w-2.5 h-2.5" />
              </button>

              {/* Edit */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/post-property/${p._id}`);
                }}
                className="text-[9px] text-[#27AE60] font-medium hover:underline flex items-center gap-0.5"
              >
                Edit <ChevronRight className="w-2.5 h-2.5" />
              </button>

              {/* Leads */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenLeads(true);
                }}
                className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg border border-[#27AE60]/20 bg-green-50 text-[#27AE60] text-[9px] font-bold hover:bg-green-100 transition"
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
          <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Project Leads
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Total Leads: {totalLeads}
                </p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={downloadCSV}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-green-50 border border-green-100 text-[#27AE60] text-xs font-bold"
                  >
                    <Download className="w-4 h-4" /> CSV
                  </button>
                  <button
                    onClick={downloadExcel}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold"
                  >
                    <Download className="w-4 h-4" /> Excel
                  </button>
                </div>
              </div>
              <button
                onClick={() => setOpenLeads(false)}
                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {leadsLoading ? (
                <div className="py-10 text-center text-slate-400">
                  Loading leads...
                </div>
              ) : leads.length === 0 ? (
                <div className="py-10 text-center text-slate-400">
                  No leads found
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-100">
                  <table className="w-full min-w-[1000px]">
                    <thead>
                      <tr className="bg-slate-50 border-b">
                        <th className="px-4 py-3 text-left text-xs font-bold">
                          #
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold">
                          Name
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold">
                          Contact
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {leads.map((lead, index) => (
                        <tr
                          key={lead._id}
                          className="border-b hover:bg-slate-50"
                        >
                          <td className="px-4 py-4">{index + 1}</td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                <User className="w-4 h-4 text-[#27AE60]" />
                              </div>
                              <div>
                                <p className="font-semibold text-slate-700">
                                  {lead.name}
                                </p>
                                <p className="text-xs text-slate-400">
                                  {lead.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <a
                              href={`tel:${lead.phone}`}
                              className="flex items-center gap-2 text-slate-700"
                            >
                              <Phone className="w-4 h-4 text-[#27AE60]" />
                              {lead.phone}
                            </a>
                          </td>
                          <td className="px-4 py-4">
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 capitalize">
                              {lead.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-sm text-slate-500">
                            {new Date(lead.createdAt).toLocaleString("en-IN")}
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
    </div>
  );
}