import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
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
import { useAuthUserProfile } from "../../../../../hooks/useAuthUser";
import { canForceManualPromotion } from "../../../../../utils/projectAccessControl";
import PromotionLocationCoverage from "./PromotionLocationCoverage";
import {
  cloneSponsoredAd,
  describeCoverage,
  isCoverageEmpty,
} from "./promotionCoverageUtils";
import { formatPromotionDate, formatPromotionDateTime } from "./promotionTracking";

const DAY_MS = 24 * 60 * 60 * 1000;
const DURATION_PRESETS = [7, 10, 15, 30, 60];
const DEMO_PRESETS = [7, 15, 20];
const MAX_DAYS = 365;
const DEFAULT_VISIBLE_LEADS = 5000;

const PLACEMENTS = [
  {
    key: "prime",
    type: "prime",
    sponsored: false,
    label: "Prime",
    desc: "Top of the homepage Prime section in the project's own city. Highest visibility.",
    icon: Crown,
    iconTone: "text-amber-500",
  },
  {
    key: "featured",
    type: "featured",
    sponsored: false,
    label: "Top Selling",
    desc: "Top Selling projects section in the project's own city.",
    icon: TrendingUp,
    iconTone: "text-sky-500",
  },
  {
    key: "sponsored",
    type: "sponsored",
    sponsored: false,
    label: "Sponsored",
    desc: "Only as a Sponsored ad in search results for the locations you pick.",
    icon: Megaphone,
    iconTone: "text-violet-500",
  },
  {
    key: "prime+sponsored",
    type: "prime",
    sponsored: true,
    label: "Prime + Sponsored",
    desc: "Prime in the project's own city plus a Sponsored ad in the locations you pick. Both end together.",
    icon: Crown,
    iconTone: "text-amber-500",
  },
  {
    key: "featured+sponsored",
    type: "featured",
    sponsored: true,
    label: "Top Selling + Sponsored",
    desc: "Top Selling in the project's own city plus a Sponsored ad in the locations you pick. Both end together.",
    icon: TrendingUp,
    iconTone: "text-sky-500",
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

const SECTION_INNER_CARD = "border-emerald-200 bg-gradient-to-br from-emerald-50/60 via-white to-white";

function Section({ step, title, hint, done, children }) {
  return (
    <section className="rounded-2xl bg-white p-4">
      <div className="mb-3 flex items-start gap-3">
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold shadow-sm ${
            done
              ? "bg-gradient-to-br from-[#0f3d2e] to-[#27AE60] text-white"
              : "border border-[#27AE60] bg-white text-[#27AE60]"
          }`}
        >
          {done ? <CheckCircle2 className="h-4 w-4" /> : step}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
            <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Step {step}
            </span>
          </div>
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
                ? "bg-[#27AE60] text-white"
                : "border border-[#27AE60] bg-white text-[#27AE60]"
            }`}
          >
            {s.done ? <CheckCircle2 className="h-3 w-3" /> : index + 1}
          </span>
          <span
            className={`truncate text-[10px] font-semibold ${
              s.done ? "text-[#0f3d2e]" : "text-slate-500"
            }`}
          >
            {s.label}
          </span>
          {index < steps.length - 1 ? (
            <span
              className={`h-0.5 min-w-2 flex-1 rounded-full ${
                s.done ? "bg-[#27AE60]" : "bg-emerald-200"
              }`}
            />
          ) : null}
        </li>
      ))}
    </ol>
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
  initialBasis = "invoice",
  isLoading,
  onConfirm,
  onCancel,
}) {
  const plan = planStatus?.plan || null;
  const planMode = Boolean(plan);
  const [selected, setSelected] = useState(null);
  const [withSponsored, setWithSponsored] = useState(false);
  const [sponsoredModeChoice, setSponsoredMode] = useState("same");
  // Outside plan mode, Prime / Top Selling always use the project's own city;
  // locations are picked only for the Sponsored ad.
  const sponsoredMode = planMode ? sponsoredModeChoice : "separate";
  const [mainCoverage, setMainCoverage] = useState({});
  const [sponsoredAd, setSponsoredAd] = useState({});
  const [scheduleMode, setScheduleMode] = useState("now");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [durationDays, setDurationDays] = useState(30);
  const [customDays, setCustomDays] = useState("");
  const [basis, setBasis] = useState("invoice");
  const [leadCountInput, setLeadCountInput] = useState("");
  const [totalLeads, setTotalLeads] = useState(null);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [leadsError, setLeadsError] = useState("");
  const [countTouched, setCountTouched] = useState(false);

  const [entered, setEntered] = useState(false);
  const { user } = useAuthUserProfile();
  const canBypassInvoice = canForceManualPromotion(user);

  const projectIsApproved =
    canBypassInvoice || canPromoteProject(projectStatus, approvalStatus);
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
      setDurationDays(30);
      setCustomDays("");
      setBasis("invoice");
      setLeadCountInput("");
      setTotalLeads(null);
      setLeadsError("");
      setCountTouched(false);
      return;
    }
    if (!plan && initialBasis === "demo") {
      setBasis("demo");
      setDurationDays(DEMO_PRESETS[0]);
      setCustomDays("");
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
      setSponsoredAd(
        cloneSponsoredAd(
          promo.sponsoredSameAsMain && isCoverageEmpty(promo.sponsoredAd) ? promo.mainCoverage : promo.sponsoredAd,
        ),
      );
      setWithSponsored(Boolean(promo.sponsoredEnabled));
      setSponsoredMode(promo.sponsoredSameAsMain === false ? "separate" : "same");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open || !projectId || !canSetLeadCount) return;

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

    if (plan) {
      const fromPlan = plan.runningVisibleLeadLimit ?? plan.package?.visibleLeadLimit ?? 0;
      setLeadCountInput(String(Math.max(0, Math.trunc(Number(fromPlan) || 0))));
      return;
    }

    const existing = Number(currentVisibleLeadLimit);
    setLeadCountInput(
      String(Number.isFinite(existing) && existing > 0 ? Math.trunc(existing) : DEFAULT_VISIBLE_LEADS),
    );
  }, [
    open,
    selected,
    currentVisibleLeadLimit,
    countTouched,
    plan,
  ]);

  const isNormal = selected === "normal";
  const isDemo = canBypassInvoice && !planMode && basis === "demo";
  const durationPresets = isDemo ? DEMO_PRESETS : DURATION_PRESETS;
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
  const needsLeadCount = canSetLeadCount && selected && !isNormal;
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
    if (!selected) return "Choose where this project should appear (including Normal).";
    if (isNormal && liveType === "normal") {
      return "This project is already a normal listing.";
    }
    if (addOnOn && sponsoredMode === "same" && isCoverageEmpty(mainCoverage)) {
      return `Pick at least one location for ${mainLabel} + Sponsored, or switch to Separate locations.`;
    }
    if ((addOnOn || isSponsoredOnly) && isCoverageEmpty(effectiveSponsoredAd)) {
      return addOnOn
        ? planMode
          ? "Pick at least one location in ② Sponsored locations."
          : "Pick at least one Sponsored location."
        : "Pick at least one Sponsored location.";
    }
    if (durationInvalid) return `Duration must be 1 to ${MAX_DAYS} days.`;
    if (scheduleInvalid) return "Pick a future date and time for the scheduled start.";
    if (leadCountInvalid) {
      return "Enter a whole number ≥ 0 for visible leads (can be higher than current leads).";
    }
    return "";
  }, [
    planMode,
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

  const choosePlacement = (option) => {
    if (planMode) return;
    if (option.type !== selected) setCountTouched(false);
    setSelected(option.type);
    setWithSponsored(option.sponsored);
  };
  const selectedPlacement =
    PLACEMENTS.find((o) => o.type === selected && o.sponsored === (isMainPlacement && withSponsored)) || null;
  const livePlacementKey =
    liveType && liveType !== "normal"
      ? `${liveType}${currentPromotion?.sponsoredEnabled && liveType !== "sponsored" ? "+sponsored" : ""}`
      : "";

  const chooseSponsoredMode = (mode) => setSponsoredMode(mode);

  const handleConfirm = () => {
    if (!canPromote) return;
    if (planMode) {
      onConfirm(selected, {
        visibleLeadLimit: canSetLeadCount ? Math.max(0, Math.trunc(Number(leadCountInput) || 0)) : undefined,
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
      basis: !isNormal && isDemo ? "demo" : undefined,
      startAt:
        !isNormal && scheduleMode === "later" && scheduleStart
          ? scheduleStart.toISOString()
          : undefined,
      mainCoverage: {},
      sponsoredEnabled: addOnOn,
      sponsoredSameAsMain: false,
      sponsoredAd: isSponsoredOnly || addOnOn ? sponsoredAd : {},
    });
  };

  const showLocations = planMode ? isMainPlacement || isSponsoredOnly : addOnOn || isSponsoredOnly;
  const mainCoverageText =
    (planMode && describeCoverage(mainCoverage)) ||
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
      : isDemo
        ? scheduleMode === "later"
          ? "Schedule demo"
          : `Start ${durationDays || 0}-day demo`
        : scheduleMode === "later"
          ? "Schedule promotion"
          : isUpdate
            ? "Update promotion"
            : "Start promotion";

  const locationsDone =
    !(addOnOn && sponsoredMode === "same" && isCoverageEmpty(mainCoverage)) &&
    !((addOnOn || isSponsoredOnly) && isCoverageEmpty(effectiveSponsoredAd));
  const trackerSteps = planMode ? [
    { label: "Plan", done: true },
    { label: "Locations", done: locationsDone },
    ...(canSetLeadCount ? [{ label: "Leads", done: !leadCountInvalid }] : []),
  ] : [
    { label: "Placement", done: Boolean(selected) },
    ...(showLocations
      ? [{ label: "Locations", done: locationsDone }]
      : []),
    ...(canSetLeadCount && selected && !isNormal
      ? [{ label: "Leads", done: !leadCountInvalid }]
      : []),
    ...(selected && !isNormal
      ? [
          {
            label: "Schedule",
            done: !scheduleInvalid && !durationInvalid,
          },
        ]
      : []),
  ];
  const leadsStep = 1 + (showLocations ? 1 : 0) + 1;
  const scheduleStep = leadsStep + (canSetLeadCount ? 1 : 0);
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
        <div className="border-b border-emerald-100 border-t-[3px] border-t-[#27AE60] bg-emerald-50 px-4 py-2.5 text-[#0f3d2e]">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <span className="rounded-md bg-[#27AE60] p-1 text-white">
                <TrendingUp className="h-3.5 w-3.5" />
              </span>
              <h2 className="shrink-0 text-sm font-bold">{planMode ? "Start from plan" : "Promote"}</h2>
              {isDemo ? (
                <span
                  className="shrink-0 rounded-full border border-emerald-200 bg-white px-2 py-0.5 text-[10px] font-bold text-[#219653]"
                  title="Free trial, no invoice. Shows a Demo badge on the card and ends on its own."
                >
                  Demo · free trial
                </span>
              ) : null}
              <span className="truncate text-xs text-slate-500">
                {projectTitle ? `· ${projectTitle}` : ""}
              </span>
              {liveType !== "normal" ? (
                <span
                  className="hidden shrink-0 items-center gap-1 rounded-full border border-emerald-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-emerald-800 sm:inline-flex"
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
              className="shrink-0 rounded-lg p-1 text-slate-500 transition hover:bg-white hover:text-[#27AE60]"
              aria-label="Close"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <StepTracker steps={trackerSteps} />
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
                    Subscription · {plan.invoiceNumber || "paid invoice"}
                  </p>
                  <p className="mt-0.5 truncate text-sm font-bold text-slate-800">
                    {plan.planName || plan.label || "Builder plan"}
                    {plan.planName && plan.label && plan.label !== plan.planName ? ` · ${plan.label}` : ""}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-500">
                    <CalendarClock className="h-3 w-3" />
                    {formatPromotionDateTime(liveFrom)} → {formatPromotionDateTime(liveUntil)} · {planDays} days
                    {plan.renewals ? ` · ${plan.renewals} renewal${plan.renewals > 1 ? "s" : ""}` : ""}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-700">Paid</span>
              </div>
              {plan.coverageMessage ? (
                <p className="mt-1.5 text-[11px] font-medium text-amber-700">{plan.coverageMessage}</p>
              ) : null}
            </div>
          )}

          {!planMode && (
          <Section
            step={1}
            done={Boolean(selected)}
            title="Where should this project appear?"
            hint="Pick one. Sponsored and the combined options ask for Sponsored locations next."
          >
            <div role="radiogroup" className="grid grid-cols-2 gap-1.5 sm:grid-cols-6">
              {PLACEMENTS.map((option) => {
                const Icon = option.icon;
                const isActive = selectedPlacement?.key === option.key;
                return (
                  <button
                    key={option.key}
                    type="button"
                    role="radio"
                    aria-checked={isActive}
                    title={option.desc}
                    onClick={() => choosePlacement(option)}
                    className={`flex h-9 min-w-0 items-center gap-1.5 rounded-lg border px-2 text-left text-xs font-semibold transition ${
                      option.sponsored ? "sm:col-span-3" : "sm:col-span-2"
                    } ${
                      isActive
                        ? "border-[#27AE60] bg-emerald-50 text-[#0f3d2e] ring-1 ring-[#27AE60]"
                        : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300"
                    }`}
                  >
                    <span
                      className={`grid h-3.5 w-3.5 shrink-0 place-items-center rounded-full border ${
                        isActive ? "border-[#27AE60]" : "border-slate-300"
                      }`}
                    >
                      {isActive ? <span className="h-2 w-2 rounded-full bg-[#27AE60]" /> : null}
                    </span>
                    <Icon className={`h-3.5 w-3.5 shrink-0 ${option.iconTone}`} />
                    {option.sponsored ? <Megaphone className="h-3.5 w-3.5 shrink-0 text-violet-500" /> : null}
                    <span className="truncate">{option.label}</span>
                    {livePlacementKey === option.key ? (
                      <span className="ml-auto shrink-0 rounded-full bg-emerald-100 px-1 py-px text-[8px] font-bold uppercase text-emerald-700">
                        Current
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </Section>
          )}

          {showLocations && (
            <Section
              step={planMode ? 1 : 2}
              done={locationsDone}
              title={planMode ? "Choose locations" : "Sponsored locations"}
              hint={
                !planMode || isSponsoredOnly
                  ? null
                  : addOnOn
                    ? `Use one location list for ${mainLabel} and Sponsored, or set each one separately.`
                    : `Where the project appears in the ${mainLabel} section. Leave empty to use the project's own city.`
              }
            >
              {addOnOn && planMode && (
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

              {isMainPlacement && planMode && (
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
                  accentClass={SECTION_INNER_CARD}
                  showRefresh={false}
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
                  title={planMode ? "② Sponsored locations" : "Sponsored locations"}
                  subtitle={planMode ? `Only for the Sponsored ad. Independent of the ${mainLabel} list.` : ""}
                  accentClass={SECTION_INNER_CARD}
                  showRefresh={false}
                  hideEmptySummary={!planMode}
                />
              )}

              {isSponsoredOnly && (
                <PromotionLocationCoverage
                  enabled
                  value={sponsoredAd}
                  onChange={setSponsoredAd}
                  title="Sponsored locations"
                  subtitle={planMode ? "Tick states, cities or localities for the Sponsored ad." : ""}
                  accentClass={SECTION_INNER_CARD}
                  showRefresh={false}
                  hideEmptySummary={!planMode}
                />
              )}
            </Section>
          )}

          {canSetLeadCount && selected && !isNormal && (
            <Section
              step={planMode ? 2 : leadsStep}
              done={!leadCountInvalid}
              title="Lead visibility"
              hint={
                planMode ? "Prefilled from the plan. Change it only if this builder needs a different number." : null
              }
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
                placeholder={String(DEFAULT_VISIBLE_LEADS)}
                className="mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none focus:border-[#27AE60] disabled:bg-slate-100 disabled:text-slate-400"
              />
              <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-emerald-700">
                <Eye className="h-3 w-3" />
                Allow {allowance} · now {visibleNow} of {total} visible · {maskedNow} masked
              </p>
            </Section>
          )}

          {selected && !isNormal && !planMode && (
            <Section
              step={scheduleStep}
              done={!scheduleInvalid && !durationInvalid}
              title="When and how long?"
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

              <p className="mt-3 text-xs font-semibold text-slate-700">{isDemo ? "Demo duration" : "Duration"}</p>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                {durationPresets.map((d) => (
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
                  tone="bg-emerald-100 text-emerald-800"
                  text={`${mainLabel}: ${mainCoverageText}`}
                />
              )}
              {(addOnOn || isSponsoredOnly) && (
                <ReviewChip
                  icon={Megaphone}
                  tone="bg-emerald-100 text-emerald-800"
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
