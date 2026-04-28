// src/features/property/components/shared/PropertyCard.jsx
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
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
} from "lucide-react";
import { updateProjectRank } from "../../../../../features/property/propertyService";
import { toast } from "react-hot-toast";

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

// ─────────────────────────────────────────────────────────────────────────────
// Portal-based dropdown menu — renders directly into document.body so it is
// never clipped by any ancestor's overflow:hidden or z-index context.
// ─────────────────────────────────────────────────────────────────────────────
function PortalMenu({ anchorRef, open, onClose, children }) {
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!open || !anchorRef.current) return;

    const recalc = () => {
      const rect = anchorRef.current.getBoundingClientRect();
      const menuWidth = 176; // w-44 = 11rem = 176px
      const viewportWidth = window.innerWidth;

      let left = rect.right - menuWidth;
      // Keep inside viewport
      if (left < 8) left = 8;
      if (left + menuWidth > viewportWidth - 8) left = viewportWidth - menuWidth - 8;

      setPos({
        top:  rect.bottom + window.scrollY + 4,
        left: left + window.scrollX,
      });
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
      {/* Click-away backdrop */}
      <div
        className="fixed inset-0"
        style={{ zIndex: 9998 }}
        onClick={onClose}
      />

      {/* Menu panel */}
      <div
        className="absolute bg-white border border-slate-200 shadow-2xl rounded-xl overflow-hidden"
        style={{
          zIndex:   9999,
          top:      pos.top,
          left:     pos.left,
          width:    176,
          animation: "menuIn 0.12s ease",
        }}
      >
        {children}
      </div>

      <style>{`
        @keyframes menuIn {
          from { opacity: 0; transform: translateY(-4px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
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
  const menuBtnRef = useRef(null);
  const inputRef   = useRef(null);

  // ── States ────────────────────────────────────────────────────────────────
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [rankOpen,    setRankOpen]    = useState(false);
  const [rankValue,   setRankValue]   = useState(p.rank ?? "");
  const [rankLoading, setRankLoading] = useState(false);

  const heroImage = p.heroImage || p.gallerySummary?.[0]?.url;
  const accent    = TYPE_RANK_ACCENT[type] || TYPE_RANK_ACCENT.normal;

  // ── Card click ────────────────────────────────────────────────────────────
  const handleCardClick = (e) => {
    if (e.target.closest("[data-action]")) return;
    if (rankOpen) { setRankOpen(false); return; }
    navigate(`/featured-project/${p._id}`);
  };

  // ── Rank helpers ──────────────────────────────────────────────────────────
  const openRankDrawer = () => {
    setRankValue(p.rank ?? "");
    setRankOpen(true);
    setMenuOpen(false);
    setTimeout(() => inputRef.current?.select(), 80);
  };

  const stepRank = (delta) => {
    setRankValue((prev) => {
      const n    = parseInt(prev, 10);
      const next = isNaN(n) ? 1 : Math.max(1, n + delta);
      return next;
    });
  };

  const handleRankSave = async () => {
    const parsed = parseInt(rankValue, 10);
    if (isNaN(parsed) || parsed < 1) {
      toast.error("Enter a valid rank (number ≥ 1)");
      return;
    }
    try {
      setRankLoading(true);
      await updateProjectRank(p._id, parsed);
      toast.success("Rank updated");
      setRankOpen(false);
      onRankUpdated?.();
    } catch {
      toast.error("Failed to update rank");
    } finally {
      setRankLoading(false);
    }
  };

  const handleRankCancel = () => {
    setRankValue(p.rank ?? "");
    setRankOpen(false);
  };

  // ── Menu item helper ──────────────────────────────────────────────────────
  const MenuItem = ({ icon: Icon, iconClass = "", label, labelClass = "text-slate-700", onClick }) => (
    <button
      onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onClick?.(); }}
      className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-xs hover:bg-slate-50 transition ${labelClass}`}
    >
      <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${iconClass}`} />
      {label}
    </button>
  );

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div
      className="relative bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-slate-100 overflow-hidden group cursor-pointer"
      onClick={handleCardClick}
    >
      {/* ── IMAGE ─────────────────────────────────────────────────────────── */}
      <div className="relative h-44 sm:h-48 overflow-hidden bg-slate-100">
        {heroImage ? (
          <img
            src={heroImage}
            alt={p.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <MapPin className="w-10 h-10" />
          </div>
        )}

        {/* ── RANK PILL ─────────────────────────────────────────────────── */}
        <div
          className="absolute top-3 left-3"
          data-action
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={openRankDrawer}
            style={{
              background: p.rank != null ? accent.bg : "rgba(0,0,0,0.65)",
              border: `1.5px solid ${p.rank != null ? accent.ring : "transparent"}`,
              color: p.rank != null ? accent.text : "#fff",
            }}
            className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full transition-all hover:scale-105 active:scale-95"
            title="Edit rank"
          >
            <Star
              className="w-3 h-3"
              style={{
                fill: p.rank != null ? accent.ring : "#FACC15",
                color: p.rank != null ? accent.ring : "#FACC15",
              }}
            />
            {p.rank != null ? `#${p.rank}` : "Set rank"}
            <Pencil className="w-2.5 h-2.5 opacity-60 ml-0.5" />
          </button>
        </div>

        {/* Type badge */}
        <div
          className={`absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${
            TYPE_STYLES[type] || TYPE_STYLES.normal
          }`}
        >
          {type}
        </div>

        {/* ── RANK DRAWER ───────────────────────────────────────────────── */}
        <div
          data-action
          onClick={(e) => e.stopPropagation()}
          className="absolute inset-x-0 bottom-0 transition-transform duration-300 ease-in-out"
          style={{
            transform: rankOpen ? "translateY(0)" : "translateY(100%)",
            background: "rgba(255,255,255,0.97)",
            backdropFilter: "blur(4px)",
            borderTop: `2px solid ${accent.ring}`,
            padding: "10px 12px",
          }}
        >
          <p
            className="text-xs font-semibold mb-2 flex items-center gap-1.5"
            style={{ color: accent.text }}
          >
            <Star
              className="w-3.5 h-3.5"
              style={{ fill: accent.ring, color: accent.ring }}
            />
            Set Display Rank
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => stepRank(-1)}
              className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 hover:bg-slate-100 text-slate-500 transition flex-shrink-0"
            >
              <Minus className="w-3.5 h-3.5" />
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
              className="flex-1 min-w-0 text-center text-sm font-bold outline-none rounded-lg py-1.5 border"
              style={{
                borderColor: accent.ring,
                color: accent.text,
                background: accent.bg,
              }}
              placeholder="1"
            />

            <button
              onClick={() => stepRank(+1)}
              className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 hover:bg-slate-100 text-slate-500 transition flex-shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleRankSave}
              disabled={rankLoading}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white transition flex-shrink-0 disabled:opacity-50"
              style={{ background: accent.ring }}
              title="Save"
            >
              {rankLoading ? (
                <span className="text-xs animate-pulse">…</span>
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
            </button>

            <button
              onClick={handleRankCancel}
              className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 hover:bg-red-50 text-slate-400 hover:text-red-500 transition flex-shrink-0"
              title="Cancel"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-xs text-slate-400 mt-1.5">
            ↑↓ arrow keys · Enter to save · Esc to cancel
          </p>
        </div>
      </div>

      {/* ── CONTENT ───────────────────────────────────────────────────────── */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-slate-900 text-sm leading-tight line-clamp-2 flex-1">
            {p.title}
          </h3>

          {/* ── ⋮ MENU BUTTON ─────────────────────────────────────────────── */}
          <div className="relative flex-shrink-0" data-action>
            <button
              ref={menuBtnRef}
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((o) => !o);
              }}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {/* ── PORTAL MENU ─────────────────────────────────────────────── */}
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

        {/* Location */}
        <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-3">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-[#27AE60]" />
          <span className="truncate">
            {p.address ? `${p.address}, ` : ""}
            {p.city}
          </span>
        </div>

        {/* Price */}
        {(p.priceFrom || p.priceTo) && (
          <div className="flex items-center gap-1 text-xs text-slate-700 font-semibold mb-3">
            <IndianRupee className="w-3.5 h-3.5 text-[#27AE60]" />
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

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span
            className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${
              STATUS_STYLES[p.status] || STATUS_STYLES.inactive
            }`}
          >
            {p.status || "unknown"}
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/featured-project/${p._id}`);
            }}
            className="flex items-center gap-1 text-xs text-[#27AE60] font-medium hover:underline"
            data-action
          >
            View <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/post-property/${p._id}`);
            }}
            className="flex items-center gap-1 text-xs text-[#27AE60] font-medium hover:underline"
            data-action
          >
            Edit <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}