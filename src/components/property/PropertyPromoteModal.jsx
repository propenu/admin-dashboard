import { useEffect, useMemo, useState } from "react";
import {
  TrendingUp,
  Sparkles,
  Crown,
  Megaphone,
  CircleDot,
  AlertCircle,
  Zap,
} from "lucide-react";

export const PROPERTY_PROMO_TYPES = [
  {
    value: "prime",
    label: "Prime",
    desc: "Top slot — maximum reach across property feeds.",
    color: "border-amber-400 bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-800",
    chip: "bg-amber-400 text-amber-950",
    icon: Crown,
  },
  {
    value: "featured",
    label: "Featured",
    desc: "Highlighted in featured property sections.",
    color: "border-sky-400 bg-gradient-to-r from-sky-50 to-blue-50 text-sky-800",
    chip: "bg-sky-500 text-white",
    icon: Sparkles,
  },
  {
    value: "sponsored",
    label: "Sponsored",
    desc: "Marked as sponsored / paid placement.",
    color: "border-violet-400 bg-gradient-to-r from-violet-50 to-fuchsia-50 text-violet-800",
    chip: "bg-violet-500 text-white",
    icon: Megaphone,
  },
  {
    value: "normal",
    label: "Normal",
    desc: "Standard organic listing (no boost).",
    color: "border-slate-300 bg-slate-50 text-slate-600",
    chip: "bg-slate-400 text-white",
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

  useEffect(() => {
    if (!open) {
      setSelected(null);
      setDays("10");
    }
  }, [open]);

  const approved = isPromotableStatus(propertyStatus);
  const available = PROPERTY_PROMO_TYPES.filter((t) => t.value !== currentType);
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
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-[2px]">
      <div
        className="w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 px-6 py-5 text-white">
          <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-10 left-10 h-24 w-24 rounded-full bg-amber-300/20" />
          <div className="relative flex items-start gap-3">
            <span className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25">
              <TrendingUp className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-100">
                Property promotion · {String(category || "").toUpperCase()}
              </p>
              <h2 className="mt-1 truncate text-lg font-black">Boost listing</h2>
              <p className="mt-0.5 truncate text-xs text-emerald-50/90">
                {propertyTitle || "Untitled property"}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 p-5 sm:p-6">
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
                  onClick={() => setSelected(t.value)}
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

          {blockedReason ? (
            <p className="text-right text-xs text-slate-500">{blockedReason}</p>
          ) : null}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
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
                });
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-200 transition hover:from-emerald-700 hover:to-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <TrendingUp className="h-4 w-4" />
              {isLoading ? "Applying…" : "Apply promotion"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
