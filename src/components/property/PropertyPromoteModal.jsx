import { useEffect, useMemo, useState } from "react";
import {
  TrendingUp,
  Sparkles,
  Crown,
  Megaphone,
  CircleDot,
  AlertCircle,
  Zap,
  X,
} from "lucide-react";
import PromotionLocationCoverage from "../../pages/features/property/components/shared/PromotionLocationCoverage";

export const PROPERTY_PROMO_TYPES = [
  {
    value: "prime",
    label: "Prime",
    desc: "Top slot — maximum reach across property feeds.",
    color: "border-amber-400 bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-800",
    chip: "bg-[#f59e0b] text-white",
    icon: Crown,
  },
  {
    value: "featured",
    label: "Top Selling",
    desc: "Highlighted in top selling property sections.",
    color: "border-sky-400 bg-gradient-to-r from-sky-50 to-blue-50 text-sky-800",
    chip: "bg-[#0284c7] text-white",
    icon: Sparkles,
  },
  {
    value: "sponsored",
    label: "Sponsored",
    desc: "Marked as sponsored / paid placement.",
    color: "border-violet-400 bg-gradient-to-r from-violet-50 to-fuchsia-50 text-violet-800",
    chip: "bg-[#7c3aed] text-white",
    icon: Megaphone,
  },
  {
    value: "normal",
    label: "Normal",
    desc: "Standard organic listing (no boost).",
    color: "border-[#27AE60] bg-[#d1fae5] text-[#0f3d2e]",
    chip: "bg-[#0f3d2e] text-white",
    icon: CircleDot,
  },
];

const normalizeStatus = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const isPromotableStatus = (status) => {
  const key = normalizeStatus(status);
  return key === "active" || key === "approved";
};

export const propertyPromoTypeMeta = (type) =>
  PROPERTY_PROMO_TYPES.find((t) => t.value === type) || PROPERTY_PROMO_TYPES[3];

/**
 * Colorful promote modal for residential / commercial / land / agricultural.
 * Same lifecycle concept as project PromoteModal.
 */
export default function PropertyPromoteModal({
  open,
  propertyTitle,
  propertyStatus,
  currentType = "normal",
  category,
  isLoading,
  onConfirm,
  onCancel,
}) {
  const [selected, setSelected] = useState(null);
  const [days, setDays] = useState("10");
  const [sponsoredAd, setSponsoredAd] = useState({});
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (!open) {
      setEntered(false);
      return undefined;
    }
    const frame = requestAnimationFrame(() => setEntered(true));
    const onKey = (e) => {
      if (e.key === "Escape") onCancel?.();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onCancel]);

  useEffect(() => {
    if (!open) {
      setSelected(null);
      setDays("10");
      setSponsoredAd({});
      return;
    }
    setSelected("sponsored");
  }, [open]);

  const approved = isPromotableStatus(propertyStatus);
  const available = PROPERTY_PROMO_TYPES.filter((t) => t.value === "sponsored");
  const daysNum = Number(days);
  const daysInvalid =
    selected &&
    selected !== "normal" &&
    (!Number.isFinite(daysNum) || daysNum < 1 || !Number.isInteger(daysNum));

  const blockedReason = useMemo(() => {
    if (!approved) {
      return "Property must be Active before promotion can be applied.";
    }
    if (!selected) return "Select a promotion type.";
    if (daysInvalid) return "Enter whole days ≥ 1 (default 10).";
    return "";
  }, [approved, selected, daysInvalid]);

  const canPromote =
    Boolean(selected) && approved && !isLoading && !daysInvalid;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex justify-end">
      <button
        type="button"
        aria-label="Close promote panel"
        onClick={onCancel}
        className={`absolute inset-0 bg-slate-950/50 backdrop-blur-[2px] transition-opacity duration-300 ${
          entered ? "opacity-100" : "opacity-0"
        }`}
      />
      <aside
        role="dialog"
        aria-modal="true"
        className={`relative flex h-full w-full max-w-xl flex-col overflow-hidden bg-white shadow-2xl transition-transform duration-300 ease-out ${
          entered ? "translate-x-0" : "translate-x-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 px-4 py-2.5 text-white">
          <div className="pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full bg-white/10" />
          <div className="relative flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <span className="rounded-md bg-white/15 p-1">
                <TrendingUp className="h-3.5 w-3.5" />
              </span>
              <h2 className="shrink-0 text-sm font-bold">Boost listing</h2>
              <span className="truncate text-xs text-emerald-50/90">
                · {propertyTitle || "Untitled property"}
              </span>
              {category ? (
                <span className="hidden shrink-0 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold uppercase ring-1 ring-white/25 sm:inline">
                  {category}
                </span>
              ) : null}
            </div>
            <button
              type="button"
              onClick={onCancel}
              className="shrink-0 rounded-lg bg-white/10 p-1 text-white transition hover:bg-white/20"
              aria-label="Close"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
          {!approved && (
            <div className="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-900">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="font-bold">Not active yet</p>
                <p className="mt-0.5">
                  Status:{" "}
                  <span className="font-semibold">
                    {normalizeStatus(propertyStatus) || "unknown"}
                  </span>
                  . Approve / activate the listing first.
                </p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {available.map((t) => {
              const Icon = t.icon;
              const active = selected === t.value;
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => {
                    setSelected(t.value);
                    if (t.value !== "sponsored") setSponsoredAd({});
                  }}
                  className={`group flex w-full items-start gap-3 rounded-2xl border-2 p-3.5 text-left transition ${
                    active
                      ? `${t.color} shadow-md scale-[1.01]`
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                      active ? t.chip : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-bold">{t.label}</span>
                    <span className="mt-0.5 block text-[11px] leading-relaxed text-slate-500">
                      {t.desc}
                    </span>
                  </span>
                  {active ? (
                    <Zap className="ml-auto h-4 w-4 shrink-0 text-emerald-600" />
                  ) : null}
                </button>
              );
            })}
          </div>

          {selected === "sponsored" ? (
            <PromotionLocationCoverage
              enabled
              value={sponsoredAd}
              onChange={setSponsoredAd}
              title="Sponsored locations"
              subtitle="The Sponsored ad shows to people searching in these locations. Use All India, pick individually, or Expand for a bigger view."
              accentClass="border-violet-200 bg-gradient-to-br from-violet-50/80 via-white to-white"
            />
          ) : null}

          {selected && selected !== "normal" ? (
            <label className="block space-y-1.5 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700">
                Boost duration (days)
              </span>
              <input
                type="number"
                min={1}
                step={1}
                value={days}
                onChange={(e) => setDays(e.target.value)}
                className="h-10 w-full rounded-xl border border-emerald-200 bg-white px-3 text-sm font-bold text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
              <span className="text-[11px] text-slate-500">
                Default 10 days — same as project promotions.
              </span>
            </label>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-emerald-100 bg-white/95 px-4 py-2 shadow-[0_-6px_16px_-10px_rgba(15,61,46,0.25)]">
          <p
            className={`min-w-0 truncate text-[11px] ${blockedReason ? "text-slate-500" : "text-emerald-700"}`}
            title={blockedReason || undefined}
          >
            {blockedReason || "Ready to apply."}
          </p>
          <div className="flex shrink-0 gap-1.5">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!canPromote}
              onClick={() => {
                if (!canPromote) return;
                onConfirm(selected, {
                  days: selected === "normal" ? undefined : Math.trunc(daysNum),
                  sponsoredAd: selected === "sponsored" ? sponsoredAd : {},
                });
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1.5 text-xs font-bold text-white shadow transition hover:from-emerald-700 hover:to-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <TrendingUp className="h-3.5 w-3.5" />
              {isLoading ? "Applying…" : "Apply promotion"}
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
