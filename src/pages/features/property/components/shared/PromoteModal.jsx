import { useEffect, useMemo, useState } from "react";
import { TrendingUp, Eye, EyeOff, AlertCircle } from "lucide-react";
import { projectAnalytics } from "../../../../../features/property/propertyService";

const TYPES = [
  {
    value: "prime",
    label: "Prime",
    desc: "Highest visibility. Top of all listings.",
    color: "border-yellow-400 bg-yellow-50 text-yellow-700",
    dot: "bg-yellow-400",
  },
  {
    value: "featured",
    label: "Top Selling Projects",
    desc: "Highlighted in featured sections.",
    color: "border-blue-400 bg-blue-50 text-blue-700",
    dot: "bg-blue-400",
  },
  {
    value: "sponsored",
    label: "Sponsored",
    desc: "Marked as sponsored content.",
    color: "border-purple-400 bg-purple-50 text-purple-700",
    dot: "bg-purple-400",
  },
  {
    value: "normal",
    label: "Normal",
    desc: "Standard listing — leads stay masked.",
    color: "border-slate-300 bg-slate-50 text-slate-600",
    dot: "bg-slate-400",
  },
];

const normalizeStatus = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const isApprovedActiveStatus = (status) => {
  const key = normalizeStatus(status);
  return key === "active" || key === "approved";
};

const resolveLeadTotal = (res) => {
  const body = res?.data ?? res ?? {};
  const candidates = [
    body.count,
    body.total,
    Array.isArray(body.data) ? body.data.length : null,
    Array.isArray(body.leads) ? body.leads.length : null,
    Array.isArray(body?.data?.data) ? body.data.data.length : null,
    body?.data?.count,
  ];
  for (const value of candidates) {
    const n = Number(value);
    if (Number.isFinite(n) && n >= 0) return n;
  }
  return 0;
};

export default function PromoteModal({
  open,
  projectId,
  projectStatus,
  currentType,
  currentVisibleLeadLimit,
  canSetLeadCount = true,
  isLoading,
  onConfirm,
  onCancel,
}) {
  const [selected, setSelected] = useState(null);
  const [leadCountInput, setLeadCountInput] = useState("");
  const [totalLeads, setTotalLeads] = useState(null);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [leadsError, setLeadsError] = useState("");
  const [countTouched, setCountTouched] = useState(false);

  const projectIsApproved = isApprovedActiveStatus(projectStatus);

  useEffect(() => {
    if (!open) {
      setSelected(null);
      setLeadCountInput("");
      setTotalLeads(null);
      setLeadsError("");
      setCountTouched(false);
      return;
    }

    if (!projectId || !canSetLeadCount) return;

    let cancelled = false;
    setLeadsLoading(true);
    setLeadsError("");

    projectAnalytics(projectId)
      .then((res) => {
        if (cancelled) return;
        setTotalLeads(resolveLeadTotal(res));
      })
      .catch(() => {
        if (cancelled) return;
        setTotalLeads(0);
        setLeadsError("Could not load current lead count.");
      })
      .finally(() => {
        if (!cancelled) setLeadsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, projectId, canSetLeadCount]);

  // When type is chosen + leads loaded, prefill a sensible visible count.
  useEffect(() => {
    if (!open || !selected || countTouched) return;

    if (selected === "normal") {
      setLeadCountInput("0");
      return;
    }

    if (totalLeads == null || leadsLoading) return;

    const existing = Number(currentVisibleLeadLimit);
    if (Number.isFinite(existing) && existing > 0) {
      setLeadCountInput(String(Math.min(existing, Math.max(totalLeads, existing))));
      return;
    }

    // If leads already exist, default visible = total (admin can lower it).
    if (totalLeads > 0) {
      setLeadCountInput(String(totalLeads));
      return;
    }

    setLeadCountInput("0");
  }, [
    open,
    selected,
    totalLeads,
    leadsLoading,
    currentVisibleLeadLimit,
    countTouched,
  ]);

  const available = TYPES.filter((t) => t.value !== currentType);
  const total = Number.isFinite(totalLeads) ? totalLeads : 0;
  const parsedCount = Number(leadCountInput);
  const allowance =
    leadCountInput === "" || !Number.isFinite(parsedCount)
      ? 0
      : Math.max(0, Math.trunc(parsedCount));
  // Existing leads that are open right now (cannot exceed current total)
  const visibleNow = Math.min(total, allowance);
  const maskedNow = Math.max(0, total - visibleNow);
  const isNormal = selected === "normal";
  const countEnabled =
    canSetLeadCount && Boolean(selected) && !isNormal && !isLoading;
  const needsLeadCount = canSetLeadCount && selected && !isNormal;
  // Allowance is NOT capped by existing leads (e.g. 100 exist → allow 5000).
  const leadCountInvalid =
    needsLeadCount &&
    (leadCountInput === "" ||
      !Number.isFinite(parsedCount) ||
      parsedCount < 0 ||
      !Number.isInteger(parsedCount));

  const promoteBlockedReason = useMemo(() => {
    if (!projectIsApproved) {
      return "Project must be Approved / Active before promotion and lead visibility can be applied.";
    }
    if (!selected) return "Select a promotion type above.";
    if (leadCountInvalid) {
      return "Enter a whole number ≥ 0 (can be higher than current leads).";
    }
    return "";
  }, [projectIsApproved, selected, leadCountInvalid]);

  const canPromote =
    Boolean(selected) &&
    !isLoading &&
    !leadCountInvalid &&
    projectIsApproved;

  const summary = useMemo(() => {
    if (!canSetLeadCount || !selected) return null;
    if (isNormal) {
      return {
        tone: "slate",
        text: `Normal listing: all ${total} lead${total === 1 ? "" : "s"} stay masked on the builder dashboard.`,
      };
    }
    return {
      tone: "emerald",
      text: `Allow ${allowance} · now ${visibleNow} of ${total} visible · ${maskedNow} masked`,
    };
  }, [
    canSetLeadCount,
    selected,
    isNormal,
    total,
    allowance,
    visibleNow,
    maskedNow,
  ]);

  if (!open) return null;

  const handleConfirm = () => {
    if (!canPromote) return;
    const visibleLeadLimit = isNormal
      ? 0
      : canSetLeadCount
        ? Math.max(0, Math.trunc(Number(leadCountInput) || 0))
        : undefined;
    onConfirm(selected, { visibleLeadLimit });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold text-blue-600 flex items-center gap-2 mb-1">
          <TrendingUp className="w-5 h-5" /> Promote Property
        </h2>
        <p className="text-slate-500 text-xs mb-4">
          1) Select listing type · 2) Set visible lead count · 3) Promote
        </p>

        {!projectIsApproved && (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-900">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Project is not Approved / Active</p>
              <p className="mt-0.5">
                Current status:{" "}
                <span className="font-semibold">
                  {normalizeStatus(projectStatus) || "unknown"}
                </span>
                . Approve the project first, then set promotion + lead
                visibility.
              </p>
            </div>
          </div>
        )}

        <div className="space-y-2 mb-4">
          {available.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => {
                setSelected(t.value);
                setCountTouched(false);
              }}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition text-left
                ${selected === t.value ? t.color + " border-current" : "border-slate-200 hover:border-slate-300"}`}
            >
              <span className={`w-3 h-3 rounded-full flex-shrink-0 ${t.dot}`} />
              <div>
                <p className="text-sm font-semibold">{t.label}</p>
                <p className="text-xs text-slate-500">{t.desc}</p>
              </div>
            </button>
          ))}
        </div>

        {canSetLeadCount && (
          <div
            className={`mb-4 rounded-xl border p-3 space-y-3 ${
              countEnabled
                ? "border-emerald-200 bg-emerald-50/40"
                : "border-slate-200 bg-slate-50"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-600">
                Lead visibility
              </p>
              <p className="text-xs text-slate-500">
                {leadsLoading
                  ? "Loading leads…"
                  : `Total leads: ${total}`}
              </p>
            </div>

            {!selected && (
              <p className="text-xs text-slate-500">
                Select Prime / Top Selling / Sponsored above to activate the
                visible lead count field.
              </p>
            )}

            {leadsError ? (
              <p className="text-xs text-amber-700">{leadsError}</p>
            ) : null}

            <label className="block space-y-1.5">
              <span className="text-xs font-semibold text-slate-700">
                Visible lead allowance
              </span>
              <input
                type="number"
                min={0}
                step={1}
                disabled={!countEnabled}
                value={isNormal ? "0" : leadCountInput}
                onChange={(e) => {
                  setCountTouched(true);
                  setLeadCountInput(e.target.value);
                }}
                placeholder={selected ? "e.g. 5000" : "Select type first"}
                className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-400"
              />
              <p className="text-[11px] text-slate-500">
                Not limited by current leads. Example: builder has{" "}
                {total || 100} leads → Super Admin sets 5000 → allow up to 5000
                visible (today all existing show; future leads stay open until
                5000).
              </p>
            </label>

            {summary && (
              <div
                className={`flex items-start gap-2 rounded-lg px-3 py-2 text-xs font-medium ${
                  summary.tone === "emerald"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-100"
                    : "bg-slate-100 text-slate-700 border border-slate-200"
                }`}
              >
                {isNormal ? (
                  <EyeOff className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                ) : (
                  <Eye className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                )}
                <span>{summary.text}</span>
              </div>
            )}

            {leadCountInvalid && (
              <p className="text-xs text-red-600">
                Enter a whole number ≥ 0 (e.g. 5000 is allowed even if only{" "}
                {total} leads exist now).
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col items-end gap-2">
          {promoteBlockedReason && (
            <p className="w-full text-xs text-slate-500 text-right">
              {promoteBlockedReason}
            </p>
          )}
          <div className="flex justify-end gap-3 w-full">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-xl border text-slate-600 hover:bg-slate-50 text-sm font-medium transition"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!canPromote}
              onClick={handleConfirm}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Promoting…" : "Promote"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
