import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Ban,
  CalendarClock,
  CheckCircle2,
  Copy,
  Crown,
  Eye,
  EyeOff,
  Link2,
  Megaphone,
  PackageCheck,
  SplitSquareHorizontal,
  TrendingUp,
  X,
} from "lucide-react";
import { projectAnalytics } from "../../../../../features/property/propertyService";
import PromotionLocationCoverage from "./PromotionLocationCoverage";
import {
  cloneSponsoredAd,
  describeCoverage,
  isCoverageEmpty,
} from "./promotionCoverageUtils";
import { formatPromotionDate, formatPromotionDateTime } from "./promotionTracking";

const DAY_MS = 24 * 60 * 60 * 1000;
const DURATION_PRESETS = [7, 10, 15, 30, 60];
const MAX_DAYS = 365;

const TYPES = [
  {
    value: "prime",
    label: "Prime",
    desc: "Top of the homepage Prime section. Highest visibility.",
    icon: Crown,
    active:
      "border-amber-400 bg-gradient-to-br from-amber-50 to-yellow-100 ring-2 ring-amber-200 shadow-md",
    iconWrap: "bg-amber-100 text-amber-600",
  },
  {
    value: "featured",
    label: "Top Selling",
    desc: "Shown in the Top Selling projects section.",
    icon: TrendingUp,
    active:
      "border-sky-400 bg-gradient-to-br from-sky-50 to-cyan-100 ring-2 ring-sky-200 shadow-md",
    iconWrap: "bg-sky-100 text-sky-600",
  },
  {
    value: "sponsored",
    label: "Sponsored only",
    desc: "Only as a Sponsored ad in search results for chosen locations.",
    icon: Megaphone,
    active:
      "border-violet-400 bg-gradient-to-br from-violet-50 to-fuchsia-100 ring-2 ring-violet-200 shadow-md",
    iconWrap: "bg-violet-100 text-violet-600",
  },
  {
    value: "normal",
    label: "Normal",
    desc: "Remove all promotion. Leads stay masked.",
    icon: Ban,
    active: "border-slate-400 bg-slate-50 ring-2 ring-slate-200",
    iconWrap: "bg-slate-100 text-slate-500",
  },
];

const TYPE_LABEL = {
  prime: "Prime",
  featured: "Top Selling",
  sponsored: "Sponsored",
  normal: "Normal",
};

const normalizeStatus = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const isApprovedActiveStatus = (status) => {
  const key = normalizeStatus(status);
  return (
    key === "active" ||
    key === "approved" ||
    key === "live" ||
    key === "published"
  );
};

/** True when project can be promoted (aligned with dashboard "Approved" filter). */
const canPromoteProject = (projectStatus, approvalStatus) => {
  if (
    isApprovedActiveStatus(projectStatus) ||
    isApprovedActiveStatus(approvalStatus)
  ) {
    return true;
  }
  const raw = normalizeStatus(projectStatus);
  const blocked = new Set([
    "draft",
    "pending",
    "onboarding",
    "incomplete",
    "inactive",
    "deleted",
    "rejected",
    "archived",
  ]);
  // If status is missing/unknown but not explicitly blocked, allow promote.
  if (!raw) return true;
  return !blocked.has(raw);
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

const SECTION_ACCENTS = {
  emerald: {
    bar: "from-[#27AE60] to-emerald-300",
    badge: "from-[#0f3d2e] to-[#27AE60]",
  },
  violet: { bar: "from-violet-500 to-fuchsia-300", badge: "from-violet-700 to-violet-500" },
  amber: { bar: "from-amber-500 to-yellow-300", badge: "from-amber-600 to-amber-400" },
  sky: { bar: "from-sky-500 to-cyan-300", badge: "from-sky-700 to-sky-500" },
  teal: { bar: "from-teal-500 to-emerald-300", badge: "from-teal-700 to-teal-500" },
};

function Section({ step, title, hint, accent = "emerald", done, children }) {
  const tone = SECTION_ACCENTS[accent] || SECTION_ACCENTS.emerald;
  return (
    <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 pl-5 shadow-sm">
      <span className={`absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b ${tone.bar}`} />
      <div className="mb-3 flex items-start gap-3">
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-[11px] font-bold text-white shadow ${tone.badge}`}
        >
          {done ? <CheckCircle2 className="h-4 w-4" /> : step}
        </span>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
          {hint ? (
            <p className="mt-0.5 text-[11px] leading-4 text-slate-500">{hint}</p>
          ) : null}
        </div>
      </div>
      {children}
    </section>
  );
}

function StepTracker({ steps }) {
  return (
    <ol className="mt-2 flex items-center gap-1.5">
      {steps.map((s, index) => (
        <li key={s.label} className="flex min-w-0 flex-1 items-center gap-1.5">
          <span
            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold transition ${
              s.done
                ? "bg-white text-[#0f3d2e]"
                : "border border-white/60 text-white/90"
            }`}
          >
            {s.done ? <CheckCircle2 className="h-3 w-3" /> : index + 1}
          </span>
          <span
            className={`truncate text-[10px] font-semibold ${
              s.done ? "text-white" : "text-white/70"
            }`}
          >
            {s.label}
          </span>
          {index < steps.length - 1 ? (
            <span
              className={`h-0.5 min-w-2 flex-1 rounded-full ${
                s.done ? "bg-white/80" : "bg-white/25"
              }`}
            />
          ) : null}
        </li>
      ))}
    </ol>
  );
}

function Switch({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${
        checked ? "bg-violet-600" : "bg-slate-300"
      } disabled:opacity-50`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
          checked ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

function ReviewChip({ icon: Icon, tone, text, title }) {
  return (
    <span
      className={`inline-flex max-w-full items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${tone}`}
      title={title || text}
    >
      <Icon className="h-2.5 w-2.5 shrink-0" />
      <span className="truncate">{text}</span>
    </span>
  );
}

export default function PromoteModal({
  open,
  projectId,
  projectTitle,
  projectCity,
  projectStatus,
  approvalStatus,
  currentType,
  currentPromotion,
  currentVisibleLeadLimit,
  canSetLeadCount = true,
  planStatus = null,
  isLoading,
  onConfirm,
  onCancel,
}) {
  const plan = planStatus?.plan || null;
  const planMode = Boolean(plan);
  const [selected, setSelected] = useState(null);
  const [withSponsored, setWithSponsored] = useState(false);
  const [sponsoredMode, setSponsoredMode] = useState("same");
  const [mainCoverage, setMainCoverage] = useState({});
  const [sponsoredAd, setSponsoredAd] = useState({});
  const [scheduleMode, setScheduleMode] = useState("now");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [durationDays, setDurationDays] = useState(10);
  const [customDays, setCustomDays] = useState("");
  const [leadCountInput, setLeadCountInput] = useState("");
  const [totalLeads, setTotalLeads] = useState(null);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [leadsError, setLeadsError] = useState("");
  const [countTouched, setCountTouched] = useState(false);

  const [entered, setEntered] = useState(false);

  const projectIsApproved = canPromoteProject(projectStatus, approvalStatus);
  const liveType = currentPromotion?.type || currentType || "normal";

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

  // Prefill from the running promotion so a location change is one click away.
  useEffect(() => {
    if (!open) {
      setSelected(null);
      setWithSponsored(false);
      setSponsoredMode("same");
      setMainCoverage({});
      setSponsoredAd({});
      setScheduleMode("now");
      setScheduleDate("");
      setScheduleTime("");
      setDurationDays(10);
      setCustomDays("");
      setLeadCountInput("");
      setTotalLeads(null);
      setLeadsError("");
      setCountTouched(false);
      return;
    }
    const promo = currentPromotion || {};
    if (plan) {
      const pkg = plan.package || {};
      const coverage = plan.coverage || {};
      const sameAsRunning =
        promo.source === "subscription" && String(promo.plan?.invoiceId || "") === String(plan.invoiceId);
      setSelected(plan.mainType);
      setWithSponsored(Boolean(pkg.sponsoredEnabled));
      setMainCoverage(cloneSponsoredAd(sameAsRunning ? promo.mainCoverage : coverage.mainCoverage));
      setSponsoredAd(cloneSponsoredAd(sameAsRunning ? promo.sponsoredAd : coverage.sponsoredAd));
      setSponsoredMode(
        (sameAsRunning ? promo.sponsoredSameAsMain : coverage.sponsoredSameAsMain ?? pkg.sponsoredSameAsMain) === false
          ? "separate"
          : "same",
      );
      return;
    }
    if (liveType && liveType !== "normal") {
      setSelected(liveType);
      setMainCoverage(cloneSponsoredAd(promo.mainCoverage));
      setSponsoredAd(cloneSponsoredAd(promo.sponsoredAd));
      setWithSponsored(Boolean(promo.sponsoredEnabled));
      setSponsoredMode(promo.sponsoredSameAsMain === false ? "separate" : "same");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open || !projectId || !canSetLeadCount || planMode) return;

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
  }, [open, projectId, canSetLeadCount, planMode]);

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

  const isNormal = selected === "normal";
  const isMainPlacement = selected === "prime" || selected === "featured";
  const isSponsoredOnly = selected === "sponsored";
  const addOnOn = isMainPlacement && withSponsored;
  const mainLabel = TYPE_LABEL[selected] || "";

  const effectiveSponsoredAd = isSponsoredOnly
    ? sponsoredAd
    : addOnOn
      ? sponsoredMode === "same"
        ? mainCoverage
        : sponsoredAd
      : {};

  const total = Number.isFinite(totalLeads) ? totalLeads : 0;
  const parsedCount = Number(leadCountInput);
  const allowance =
    leadCountInput === "" || !Number.isFinite(parsedCount)
      ? 0
      : Math.max(0, Math.trunc(parsedCount));
  const visibleNow = Math.min(total, allowance);
  const maskedNow = Math.max(0, total - visibleNow);
  const countEnabled =
    canSetLeadCount && Boolean(selected) && !isNormal && !isLoading;
  const needsLeadCount = canSetLeadCount && selected && !isNormal && !planMode;
  // Allowance is NOT capped by existing leads (e.g. 100 exist → allow 5000).
  const leadCountInvalid =
    needsLeadCount &&
    (leadCountInput === "" ||
      !Number.isFinite(parsedCount) ||
      parsedCount < 0 ||
      !Number.isInteger(parsedCount));

  const scheduleStart = useMemo(() => {
    if (scheduleMode !== "later" || !scheduleDate || !scheduleTime) return null;
    const start = new Date(`${scheduleDate}T${scheduleTime}`);
    return Number.isNaN(start.getTime()) ? null : start;
  }, [scheduleMode, scheduleDate, scheduleTime]);
  const scheduleInvalid =
    !planMode &&
    selected &&
    !isNormal &&
    scheduleMode === "later" &&
    (!scheduleStart || scheduleStart.getTime() <= Date.now());

  const durationInvalid =
    !planMode &&
    selected &&
    !isNormal &&
    (!Number.isInteger(durationDays) || durationDays < 1 || durationDays > MAX_DAYS);

  const planStart = plan?.periodStart ? new Date(plan.periodStart) : null;
  const liveFrom = planMode
    ? planStart && planStart.getTime() > Date.now()
      ? planStart
      : new Date()
    : scheduleStart || new Date();
  const liveUntil = planMode && plan?.periodEnd
    ? new Date(plan.periodEnd)
    : new Date(liveFrom.getTime() + (durationDays || 0) * DAY_MS);
  const planDays = Math.max(1, Math.round((liveUntil.getTime() - liveFrom.getTime()) / DAY_MS));

  const blockedReason = useMemo(() => {
    if (!projectIsApproved) {
      return "Approve the project first. Only Active / Approved projects can be promoted.";
    }
    if (!selected) return "Choose where this project should appear.";
    if (isNormal && liveType === "normal") {
      return "This project is already a normal listing.";
    }
    if (addOnOn && sponsoredMode === "same" && isCoverageEmpty(mainCoverage)) {
      return `Pick at least one location for ${mainLabel} + Sponsored, or switch to Separate locations.`;
    }
    if ((addOnOn || isSponsoredOnly) && isCoverageEmpty(effectiveSponsoredAd)) {
      return addOnOn
        ? "Pick at least one location in ② Sponsored locations."
        : "Pick at least one Sponsored location.";
    }
    if (durationInvalid) return `Duration must be 1 to ${MAX_DAYS} days.`;
    if (scheduleInvalid) return "Pick a future date and time for the scheduled start.";
    if (leadCountInvalid) {
      return "Enter a whole number ≥ 0 for visible leads (can be higher than current leads).";
    }
    return "";
  }, [
    projectIsApproved,
    selected,
    isNormal,
    liveType,
    addOnOn,
    sponsoredMode,
    mainCoverage,
    mainLabel,
    isSponsoredOnly,
    effectiveSponsoredAd,
    durationInvalid,
    scheduleInvalid,
    leadCountInvalid,
  ]);

  const canPromote = !blockedReason && !isLoading;

  if (!open) return null;

  const chooseType = (value) => {
    if (planMode) return;
    setSelected(value);
    setCountTouched(false);
    if (value === "normal") setScheduleMode("now");
    if (value !== "prime" && value !== "featured") setWithSponsored(false);
  };

  const chooseSponsoredMode = (mode) => setSponsoredMode(mode);

  const handleConfirm = () => {
    if (!canPromote) return;
    if (planMode) {
      onConfirm(selected, {
        mainCoverage: isMainPlacement ? mainCoverage : {},
        sponsoredSameAsMain: addOnOn && sponsoredMode === "same",
        sponsoredAd:
          isSponsoredOnly || (addOnOn && sponsoredMode === "separate") ? sponsoredAd : {},
      });
      return;
    }
    const visibleLeadLimit = isNormal
      ? 0
      : canSetLeadCount
        ? Math.max(0, Math.trunc(Number(leadCountInput) || 0))
        : undefined;
    onConfirm(selected, {
      visibleLeadLimit,
      days: isNormal ? undefined : durationDays,
      startAt:
        !isNormal && scheduleMode === "later" && scheduleStart
          ? scheduleStart.toISOString()
          : undefined,
      mainCoverage: isMainPlacement ? mainCoverage : {},
      sponsoredEnabled: addOnOn,
      sponsoredSameAsMain: addOnOn && sponsoredMode === "same",
      sponsoredAd:
        isSponsoredOnly || (addOnOn && sponsoredMode === "separate")
          ? sponsoredAd
          : {},
    });
  };

  const mainCoverageText =
    describeCoverage(mainCoverage) ||
    `Project's own location${projectCity ? ` (${projectCity})` : ""}`;
  const sponsoredCoverageText = describeCoverage(effectiveSponsoredAd) || "No locations yet";
  const isUpdate = selected && selected === liveType && !isNormal;
  const planScheduled = planMode && liveFrom.getTime() > Date.now() + 30_000;
  const confirmLabel = isLoading
    ? "Saving…"
    : planMode
      ? planStatus?.linkedToPlan
        ? "Update plan promotion"
        : planScheduled
          ? "Schedule from plan"
          : "Start from plan"
    : isNormal
      ? "Remove promotion"
      : scheduleMode === "later"
        ? "Schedule promotion"
        : isUpdate
          ? "Update promotion"
          : "Start promotion";

  const locationsDone =
    !(addOnOn && sponsoredMode === "same" && isCoverageEmpty(mainCoverage)) &&
    !((addOnOn || isSponsoredOnly) && isCoverageEmpty(effectiveSponsoredAd));
  const trackerSteps = planMode ? [
    { label: "Plan package", done: true },
    { label: "Locations", done: locationsDone },
    { label: "Plan dates", done: true },
  ] : [
    { label: "Placement", done: Boolean(selected) },
    ...(isMainPlacement
      ? [{ label: "Sponsored", done: true }]
      : []),
    ...(isMainPlacement || isSponsoredOnly
      ? [{ label: "Locations", done: locationsDone }]
      : []),
    ...(selected && !isNormal
      ? [
          {
            label: "Schedule",
            done: !scheduleInvalid && !durationInvalid,
          },
        ]
      : []),
    ...(canSetLeadCount && selected && !isNormal
      ? [{ label: "Leads", done: !leadCountInvalid }]
      : []),
  ];
  const locationAccent =
    selected === "prime" ? "amber" : selected === "featured" ? "sky" : "violet";

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Close promote panel"
        onClick={onCancel}
        className={`absolute inset-0 bg-slate-900/50 backdrop-blur-[2px] transition-opacity duration-300 ${
          entered ? "opacity-100" : "opacity-0"
        }`}
      />
      <aside
        role="dialog"
        aria-modal="true"
        className={`relative flex h-full w-full max-w-2xl flex-col overflow-hidden bg-gradient-to-b from-emerald-50/70 via-slate-50 to-slate-50 shadow-2xl transition-transform duration-300 ease-out ${
          entered ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0f3d2e] via-[#17643f] to-[#27AE60] px-4 py-2.5 text-white">
          <span className="pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full bg-white/10" />
          <div className="relative flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <span className="rounded-md bg-white/15 p-1">
                <TrendingUp className="h-3.5 w-3.5" />
              </span>
              <h2 className="shrink-0 text-sm font-bold">{planMode ? "Start from plan" : "Promote"}</h2>
              <span className="truncate text-xs text-emerald-50/90">
                {projectTitle ? `· ${projectTitle}` : ""}
              </span>
              {liveType !== "normal" ? (
                <span
                  className="hidden shrink-0 items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold ring-1 ring-white/25 sm:inline-flex"
                  title={
                    currentPromotion?.boostExpiry
                      ? `Ends ${formatPromotionDateTime(currentPromotion.boostExpiry)}`
                      : undefined
                  }
                >
                  <CheckCircle2 className="h-2.5 w-2.5" />
                  {TYPE_LABEL[liveType]}
                  {currentPromotion?.sponsoredEnabled ? " + Sponsored" : ""}
                  {currentPromotion?.boostExpiry
                    ? ` · ends ${formatPromotionDate(currentPromotion.boostExpiry)}`
                    : ""}
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
          <div className="relative">
            <StepTracker steps={trackerSteps} />
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
          {!projectIsApproved && (
            <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-900">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="font-semibold">Project is not Active / Approved</p>
                <p className="mt-0.5">
                  Status:{" "}
                  <span className="font-semibold">
                    {normalizeStatus(projectStatus) || "unknown"}
                  </span>
                  {approvalStatus ? (
                    <>
                      {" "}· Approval:{" "}
                      <span className="font-semibold">
                        {normalizeStatus(approvalStatus)}
                      </span>
                    </>
                  ) : null}
                  . Approve it first, then promote.
                </p>
              </div>
            </div>
          )}

          {planMode && (
            <div className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-sky-50 p-3 shadow-sm">
              <div className="flex items-start gap-2.5">
                <span className="rounded-xl bg-gradient-to-br from-[#0f3d2e] to-[#27AE60] p-2 text-white shadow">
                  <PackageCheck className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
                    Builder plan · {plan.invoiceNumber || "paid invoice"}
                  </p>
                  <p className="mt-0.5 truncate text-sm font-bold text-slate-800">
                    {plan.planName || "Builder plan"} · {plan.label}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    {formatPromotionDate(plan.periodStart)} → {formatPromotionDate(plan.periodEnd)}
                    {plan.renewals ? ` · includes ${plan.renewals} renewal${plan.renewals > 1 ? "s" : ""}` : ""}
                    {" · "}
                    {plan.package?.visibleLeadLimit ?? 0} visible leads
                  </p>
                </div>
              </div>
              <p className="mt-2 rounded-lg bg-white/80 px-2.5 py-1.5 text-[11px] text-slate-600 ring-1 ring-emerald-100">
                Placement, Sponsored, dates and leads come from the plan. Locations are filled from the plan rule
                {plan.package?.locationRule === "team_picks" ? " (team picks)" : ""}; change them only if needed.
                It ends with the plan, and a renewal invoice extends it.
              </p>
              {plan.coverageMessage ? (
                <p className="mt-1.5 text-[11px] font-medium text-amber-700">{plan.coverageMessage}</p>
              ) : null}
            </div>
          )}

          <Section
            step={1}
            accent="emerald"
            done={Boolean(selected)}
            title={planMode ? "Placement from the plan" : "Where should this project appear?"}
            hint={
              planMode
                ? "Locked by the builder plan."
                : "Prime and Top Selling are separate sections. Pick one. You can add Sponsored on top in the next step."
            }
          >
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {TYPES.filter((t) => !planMode || t.value === selected).map((t) => {
                const Icon = t.icon;
                const isActive = selected === t.value;
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => chooseType(t.value)}
                    className={`relative flex items-start gap-3 rounded-xl border p-3 text-left transition ${
                      isActive ? t.active : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <span className={`rounded-lg p-2 ${t.iconWrap}`}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                        {t.label}
                        {planMode ? (
                          <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-emerald-700">
                            From plan
                          </span>
                        ) : liveType === t.value && t.value !== "normal" ? (
                          <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-emerald-700">
                            Current
                          </span>
                        ) : null}
                      </span>
                      <span className="mt-0.5 block text-[11px] leading-4 text-slate-500">
                        {t.desc}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </Section>

          {isMainPlacement && (
            <Section
              step={2}
              accent="violet"
              done={withSponsored}
              title="Add Sponsored ads too?"
              hint="Runs the same project as a Sponsored ad in search results. Same start and end, so both come down together."
            >
              <div
                className={`flex items-center justify-between gap-3 rounded-xl border p-3 transition ${
                  withSponsored ? "border-violet-300 bg-violet-50" : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex items-start gap-2">
                  <Megaphone
                    className={`mt-0.5 h-4 w-4 ${withSponsored ? "text-violet-600" : "text-slate-400"}`}
                  />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Also show this {mainLabel} project as Sponsored
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {withSponsored
                        ? `${mainLabel} + Sponsored will run as one promotion.`
                        : `Only the ${mainLabel} section.`}
                    </p>
                  </div>
                </div>
                <Switch checked={withSponsored} onChange={setWithSponsored} disabled={planMode} />
              </div>
            </Section>
          )}

          {(isMainPlacement || isSponsoredOnly) && (
            <Section
              step={isMainPlacement ? 3 : 2}
              accent={locationAccent}
              done={locationsDone}
              title="Choose locations"
              hint={
                isSponsoredOnly
                  ? "The Sponsored ad shows to people searching in these locations."
                  : addOnOn
                    ? `Use one location list for ${mainLabel} and Sponsored, or set each one separately.`
                    : `Where the project appears in the ${mainLabel} section. Leave empty to use the project's own city.`
              }
            >
              {addOnOn && (
                <div className="mb-3 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => chooseSponsoredMode("same")}
                    className={`flex items-start gap-2 rounded-xl border px-3 py-2.5 text-left text-xs font-semibold transition ${
                      sponsoredMode === "same"
                        ? "border-emerald-400 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-200"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <Link2 className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>
                      Same locations for both
                      <span className="block text-[10px] font-normal text-slate-500">
                        One list → {mainLabel} + Sponsored
                      </span>
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => chooseSponsoredMode("separate")}
                    className={`flex items-start gap-2 rounded-xl border px-3 py-2.5 text-left text-xs font-semibold transition ${
                      sponsoredMode === "separate"
                        ? "border-emerald-400 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-200"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <SplitSquareHorizontal className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>
                      Separate locations
                      <span className="block text-[10px] font-normal text-slate-500">
                        {mainLabel} list + Sponsored list
                      </span>
                    </span>
                  </button>
                </div>
              )}

              {isMainPlacement && (
                <PromotionLocationCoverage
                  enabled
                  value={mainCoverage}
                  onChange={setMainCoverage}
                  title={
                    addOnOn && sponsoredMode === "same"
                      ? `${mainLabel} + Sponsored locations`
                      : addOnOn
                        ? `① ${mainLabel} locations`
                        : `${mainLabel} locations`
                  }
                  subtitle={
                    addOnOn && sponsoredMode === "same"
                      ? `Saved for both: the ${mainLabel} section and the Sponsored ad.`
                      : `Only for the ${mainLabel} section. Leave empty to use the project's own city.`
                  }
                  accentClass={
                    selected === "prime"
                      ? "border-amber-200 bg-gradient-to-br from-amber-50/80 via-white to-white"
                      : "border-sky-200 bg-gradient-to-br from-sky-50/80 via-white to-white"
                  }
                />
              )}

              {addOnOn && sponsoredMode === "same" && (
                <div className="flex items-start gap-2 rounded-xl border border-dashed border-violet-300 bg-white px-3 py-2.5 text-[11px] text-slate-600">
                  <Copy className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-500" />
                  {isCoverageEmpty(mainCoverage)
                    ? `Tick at least one location. It is saved for ${mainLabel} and Sponsored.`
                    : `${mainLabel} and Sponsored will both use: ${describeCoverage(mainCoverage, 4)}`}
                </div>
              )}

              {addOnOn && sponsoredMode === "separate" && (
                <PromotionLocationCoverage
                  enabled
                  value={sponsoredAd}
                  onChange={setSponsoredAd}
                  title="② Sponsored locations"
                  subtitle={`Only for the Sponsored ad. Independent of the ${mainLabel} list.`}
                  accentClass="border-violet-200 bg-gradient-to-br from-violet-50/80 via-white to-white"
                />
              )}

              {isSponsoredOnly && (
                <PromotionLocationCoverage
                  enabled
                  value={sponsoredAd}
                  onChange={setSponsoredAd}
                  title="Sponsored locations"
                  subtitle="Tick states, cities or localities for the Sponsored ad."
                  accentClass="border-violet-200 bg-gradient-to-br from-violet-50/80 via-white to-white"
                />
              )}
            </Section>
          )}

          {planMode && (
            <Section
              step={isMainPlacement ? 4 : 3}
              accent="emerald"
              done
              title="Plan dates and leads"
              hint="Set by the paid invoice. Ends with the plan; a renewal invoice extends it."
            >
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {[
                  ["Goes live", formatPromotionDateTime(liveFrom)],
                  ["Ends", formatPromotionDateTime(liveUntil)],
                  ["Visible leads", String(plan.package?.visibleLeadLimit ?? 0)],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl bg-slate-100 px-3 py-2">
                    <p className="text-[10px] uppercase tracking-wide text-slate-400">{label}</p>
                    <p className="mt-0.5 text-xs font-semibold text-slate-700">{value}</p>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {selected && !isNormal && !planMode && (
            <Section
              step={isMainPlacement ? 4 : 3}
              accent="emerald"
              done={!scheduleInvalid && !durationInvalid}
              title="When and how long?"
              hint={
                addOnOn
                  ? `${mainLabel} and Sponsored share this schedule and end at the same time.`
                  : "The promotion ends on its own and the project goes back to normal."
              }
            >
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: "now", label: "Start now" },
                  { key: "later", label: "Schedule for later" },
                ].map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setScheduleMode(opt.key)}
                    className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                      scheduleMode === opt.key
                        ? "border-[#27AE60] bg-[#27AE60] text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {scheduleMode === "later" && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <label className="block space-y-1">
                    <span className="text-xs font-semibold text-slate-700">Start date</span>
                    <input
                      type="date"
                      value={scheduleDate}
                      min={new Date().toISOString().slice(0, 10)}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none focus:border-[#27AE60]"
                    />
                  </label>
                  <label className="block space-y-1">
                    <span className="text-xs font-semibold text-slate-700">Start time</span>
                    <input
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none focus:border-[#27AE60]"
                    />
                  </label>
                </div>
              )}

              <p className="mt-3 text-xs font-semibold text-slate-700">Duration</p>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                {DURATION_PRESETS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => {
                      setDurationDays(d);
                      setCustomDays("");
                    }}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                      durationDays === d && !customDays
                        ? "border-[#0f3d2e] bg-[#0f3d2e] text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    {d} days
                  </button>
                ))}
                <input
                  type="number"
                  min={1}
                  max={MAX_DAYS}
                  value={customDays}
                  placeholder="Custom"
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/^0+(?=\d)/, "");
                    setCustomDays(raw);
                    const n = Number(raw);
                    setDurationDays(Number.isFinite(n) ? Math.trunc(n) : 0);
                  }}
                  className="h-7 w-24 rounded-full border border-slate-200 bg-white px-3 text-xs font-semibold outline-none focus:border-[#27AE60]"
                />
              </div>

              <div className="mt-3 flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-[11px] text-slate-600">
                <CalendarClock className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                {scheduleMode === "later" && !scheduleStart
                  ? "Pick a start date and time."
                  : `Live ${formatPromotionDateTime(liveFrom)} → ${formatPromotionDateTime(liveUntil)}`}
              </div>
            </Section>
          )}

          {canSetLeadCount && selected && !isNormal && !planMode && (
            <Section
              step={isMainPlacement ? 5 : 4}
              accent="teal"
              done={!leadCountInvalid}
              title="Lead visibility"
              hint="How many leads the builder can see unmasked while this promotion runs."
            >
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Visible lead allowance</span>
                <span>{leadsLoading ? "Loading leads…" : `Total leads: ${total}`}</span>
              </div>
              {leadsError ? (
                <p className="mt-1 text-xs text-amber-700">{leadsError}</p>
              ) : null}
              <input
                type="number"
                min={0}
                step={1}
                disabled={!countEnabled}
                value={leadCountInput}
                onFocus={(e) => e.target.select()}
                onChange={(e) => {
                  setCountTouched(true);
                  setLeadCountInput(e.target.value.replace(/^0+(?=\d)/, ""));
                }}
                placeholder="e.g. 5000"
                className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none focus:border-[#27AE60] disabled:bg-slate-100 disabled:text-slate-400"
              />
              <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-emerald-700">
                <Eye className="h-3 w-3" />
                Allow {allowance} · now {visibleNow} of {total} visible · {maskedNow} masked
              </p>
            </Section>
          )}

          {isNormal && (
            <div className="flex items-start gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-600">
              <EyeOff className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              The project leaves Prime, Top Selling and Sponsored right away. All leads stay masked.
            </div>
          )}
        </div>

        {/* Review + actions */}
        <div className="border-t border-emerald-100 bg-white/95 px-4 py-2 shadow-[0_-6px_16px_-10px_rgba(15,61,46,0.25)] backdrop-blur">
          {selected && !isNormal ? (
            <div className="mb-1.5 flex flex-wrap gap-1">
              {isMainPlacement && (
                <ReviewChip
                  icon={selected === "prime" ? Crown : TrendingUp}
                  tone={selected === "prime" ? "bg-amber-100 text-amber-800" : "bg-sky-100 text-sky-800"}
                  text={`${mainLabel}: ${mainCoverageText}`}
                />
              )}
              {(addOnOn || isSponsoredOnly) && (
                <ReviewChip
                  icon={Megaphone}
                  tone="bg-violet-100 text-violet-800"
                  text={
                    addOnOn && sponsoredMode === "same"
                      ? `Sponsored: same as ${mainLabel}`
                      : `Sponsored: ${sponsoredCoverageText}`
                  }
                />
              )}
              <ReviewChip
                icon={CalendarClock}
                tone="bg-emerald-100 text-emerald-800"
                text={
                  planMode
                    ? `Plan · ${planDays}d · ${formatPromotionDate(liveFrom)} → ${formatPromotionDate(liveUntil)}`
                    : scheduleMode === "later" && !scheduleStart
                      ? `${durationDays || 0} days · start not set`
                      : `${durationDays || 0}d · ${formatPromotionDate(liveFrom)} → ${formatPromotionDate(liveUntil)}`
                }
                title={`${formatPromotionDateTime(liveFrom)} → ${formatPromotionDateTime(liveUntil)}${
                  addOnOn ? " · both end together" : ""
                }`}
              />
            </div>
          ) : null}

          <div className="flex items-center justify-between gap-2">
            <p
              className={`min-w-0 truncate text-[11px] ${blockedReason ? "text-slate-500" : "text-emerald-700"}`}
              title={blockedReason || undefined}
            >
              {blockedReason || "Ready to confirm."}
            </p>
            <div className="flex shrink-0 gap-1.5">
              <button
                type="button"
                onClick={onCancel}
                className="rounded-lg border px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!canPromote}
                onClick={handleConfirm}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold text-white shadow transition disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none ${
                  isNormal
                    ? "bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-700 hover:to-rose-600"
                    : "bg-gradient-to-r from-[#0f3d2e] to-[#27AE60] hover:from-[#0c3326] hover:to-[#219653]"
                }`}
              >
                {confirmLabel}
              </button>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
