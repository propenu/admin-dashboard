export const MAIN_PLACEMENTS = [
  { value: "prime", label: "Prime", desc: "The first and biggest spot on the homepage." },
  { value: "featured", label: "Top Selling", desc: "Shown in the Top Selling projects row." },
];

export const LOCATION_RULES = [
  { value: "all_india", label: "All India", desc: "Shown to buyers in every city we cover." },
  { value: "team_picks", label: "Team chooses", desc: "Our team picks the cities when starting the promotion." },
  { value: "fixed", label: "Selected cities", desc: "Pick the exact cities and areas below." },
];

export const START_MODES = [
  { value: "auto", label: "As soon as payment is done", short: "Auto start" },
  { value: "team", label: "When our team starts it", short: "Team start" },
];

/** No longer offered; older plans and invoices may still carry it and keep running on it. */
const LEGACY_RULE = "project_city";

const LEGACY = {
  prime: { mainPlacement: "prime", sponsoredEnabled: false },
  featured: { mainPlacement: "featured", sponsoredEnabled: false },
  sponsored: { mainPlacement: "none", sponsoredEnabled: true },
  normal: { mainPlacement: "none", sponsoredEnabled: false },
};

/** Plan or invoice snapshot → full package; older plans only have promotionType. */
export function normalizePlanPackage(source = {}) {
  const hasPlacement = ["none", "prime", "featured"].includes(source.mainPlacement);
  const legacy = LEGACY[String(source.promotionType || "normal").toLowerCase()] || LEGACY.normal;
  return {
    mainPlacement: hasPlacement ? source.mainPlacement : legacy.mainPlacement,
    sponsoredEnabled: hasPlacement ? Boolean(source.sponsoredEnabled) : legacy.sponsoredEnabled,
    locationRule: LOCATION_RULES.some((r) => r.value === source.locationRule) || source.locationRule === LEGACY_RULE
      ? source.locationRule
      : hasPlacement ? "fixed" : LEGACY_RULE,
    mainCoverage: source.mainCoverage && typeof source.mainCoverage === "object" ? source.mainCoverage : {},
    sponsoredSameAsMain: source.sponsoredSameAsMain !== false,
    sponsoredAd: source.sponsoredAd && typeof source.sponsoredAd === "object" ? source.sponsoredAd : {},
    visibleLeadLimit: Math.max(0, Math.trunc(Number(source.visibleLeadLimit) || 0)),
    startMode: source.startMode === "team" ? "team" : "auto",
    durationDays: Number(source.durationDays) || 30,
  };
}

export function describePlanPackage(source = {}) {
  const pkg = normalizePlanPackage(source);
  const main = pkg.mainPlacement === "prime" ? "Prime" : pkg.mainPlacement === "featured" ? "Top Selling" : "";
  if (main) return pkg.sponsoredEnabled ? `${main} + Sponsored` : main;
  return pkg.sponsoredEnabled ? "Sponsored" : "Listing only";
}

export function planHasPromotion(source = {}) {
  const pkg = normalizePlanPackage(source);
  return pkg.mainPlacement !== "none" || pkg.sponsoredEnabled;
}

export const locationRuleLabel = (rule) =>
  LOCATION_RULES.find((r) => r.value === rule)?.label || (rule === LEGACY_RULE ? "Project's own city (old)" : "Not set");

export const startModeLabel = (mode) =>
  START_MODES.find((m) => m.value === mode)?.short || "Auto start";

export const PROMOTION_STATUS = {
  not_started: { label: "Not started", tone: "bg-slate-100 text-slate-600" },
  waiting_payment: { label: "Waiting for payment", tone: "bg-amber-50 text-amber-700" },
  waiting_approval: { label: "Waiting for approval", tone: "bg-amber-50 text-amber-700" },
  waiting_team: { label: "Waiting for team", tone: "bg-sky-50 text-sky-700" },
  scheduled: { label: "Scheduled", tone: "bg-indigo-50 text-indigo-700" },
  running: { label: "Running", tone: "bg-emerald-50 text-emerald-700" },
  ended: { label: "Ended", tone: "bg-slate-100 text-slate-500" },
  cancelled: { label: "Cancelled", tone: "bg-rose-50 text-rose-700" },
};

export const promotionStatusMeta = (status) =>
  PROMOTION_STATUS[status] || PROMOTION_STATUS.not_started;
