const DAY = 1000 * 60 * 60 * 24;
const BOOSTED_TYPES = new Set(["prime", "featured", "sponsored"]);

const toDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

/** Canonical promotion type for filters / badges (`featured` = Top Selling). */
export const normalizePromoType = (value) => {
  const key = String(value || "normal")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");
  if (key === "topselling" || key === "featured") return "featured";
  if (key === "prime" || key === "sponsored" || key === "normal") return key;
  return "normal";
};

export const titlePromotionType = (value) => {
  const type = normalizePromoType(value);
  if (type === "featured") return "Top Selling";
  return type.charAt(0).toUpperCase() + type.slice(1);
};

/** Current boost type from listing payload (handles displayType fallback). */
export const resolvePromotionType = (property) => {
  const tracking = getPromotionTracking(property);
  return normalizePromoType(
    property?.promotion?.type ||
      property?.displayType ||
      tracking.currentType ||
      "normal",
  );
};

/** True when listing was auto/manual expired back to normal (or still past expiry). */
export const isPromotionExpiredListing = (property) => {
  const tracking = getPromotionTracking(property);
  if (tracking.lifecycle === "expired") return true;

  const type = resolvePromotionType(property);
  if (type !== "normal") return false;

  return getPromotionHistory(property).some((entry) => {
    const from = normalizePromoType(entry?.fromType);
    const to = normalizePromoType(entry?.toType);
    return (
      BOOSTED_TYPES.has(from) &&
      to === "normal" &&
      /expired/i.test(String(entry?.reason || ""))
    );
  });
};

/**
 * Client-side PROPERTY PROMOTIONS chip matching (type + lifecycle).
 * Type chip uses current boost; lifecycle includes history-based expired.
 */
export const matchesPropertyPromotionFilters = (
  property,
  promotionType = "all",
  trackingFilter = "all",
) => {
  const tracking = getPromotionTracking(property);
  const type = resolvePromotionType(property);
  const wantedType = normalizePromoType(promotionType);

  if (promotionType !== "all" && type !== wantedType) return false;

  if (trackingFilter === "all") return true;
  if (trackingFilter === "promoted") {
    return (
      Boolean(tracking.hasHistory) ||
      BOOSTED_TYPES.has(type) ||
      BOOSTED_TYPES.has(normalizePromoType(property?.lastPromotionType))
    );
  }
  if (trackingFilter === "active") {
    return BOOSTED_TYPES.has(type) && tracking.lifecycle === "active";
  }
  if (trackingFilter === "expiringSoon") {
    return (
      BOOSTED_TYPES.has(type) &&
      (tracking.lifecycle === "expiringSoon" ||
        tracking.lifecycle === "critical")
    );
  }
  if (trackingFilter === "expired") return isPromotionExpiredListing(property);
  return true;
};

export const formatPromotionDate = (value, withYear = false) => {
  const date = toDate(value);
  if (!date) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    ...(withYear ? { year: "numeric" } : {}),
  });
};

export const getPromotionHistory = (project) =>
  Array.isArray(project?.promotionHistory) ? project.promotionHistory : [];

export const getLatestPromotionRecord = (project) => {
  const history = getPromotionHistory(project);
  if (!history.length) return null;
  return [...history].sort(
    (a, b) =>
      new Date(b?.startedAt || b?.createdAt || 0).getTime() -
      new Date(a?.startedAt || a?.createdAt || 0).getTime(),
  )[0];
};

export const getActivePromotionRecord = (project) => {
  const history = getPromotionHistory(project);
  if (!history.length) return null;
  return (
    [...history]
      .filter((item) => !item?.endedAt)
      .sort(
        (a, b) =>
          new Date(b?.startedAt || b?.createdAt || 0).getTime() -
          new Date(a?.startedAt || a?.createdAt || 0).getTime(),
      )[0] || getLatestPromotionRecord(project)
  );
};

export const getPromotionTracking = (project) => {
  const activeRecord = getActivePromotionRecord(project);
  const latestRecord = getLatestPromotionRecord(project);
  const promotion = project?.promotion || {};
  // Live type only — do not fall back to lastPromotionType (that would mislabel expired → normal).
  const currentType = normalizePromoType(
    promotion?.type ||
      project?.displayType ||
      activeRecord?.toType ||
      latestRecord?.toType ||
      "normal",
  );
  const startedAt =
    activeRecord?.startedAt || promotion?.startDate || latestRecord?.startedAt;
  const expiresAt =
    activeRecord?.expiresAt || promotion?.boostExpiry || promotion?.expiresAt;
  const endedAt = activeRecord?.endedAt || latestRecord?.endedAt;
  const startDate = toDate(startedAt);
  const expiryDate = toDate(expiresAt);
  const now = new Date();
  const daysLeft = expiryDate ? Math.ceil((expiryDate - now) / DAY) : null;

  let lifecycle = "normal";
  if (currentType !== "normal") {
    if (startDate && now < startDate) lifecycle = "scheduled";
    else if (expiryDate && now > expiryDate) lifecycle = "expired";
    else if (typeof daysLeft === "number" && daysLeft <= 2) lifecycle = "critical";
    else if (typeof daysLeft === "number" && daysLeft <= 7) lifecycle = "expiringSoon";
    else lifecycle = "active";
  }

  return {
    history: getPromotionHistory(project),
    activeRecord,
    latestRecord,
    currentType,
    previousType: normalizePromoType(
      activeRecord?.fromType ||
        project?.lastPromotionType ||
        latestRecord?.fromType ||
        "normal",
    ),
    startedAt,
    expiresAt,
    endedAt,
    daysLeft,
    lifecycle,
    hasHistory: getPromotionHistory(project).length > 0,
  };
};

export const promotionLifecycleCopy = (tracking) => {
  if (!tracking || tracking.currentType === "normal") return "Normal listing";
  if (tracking.lifecycle === "expired") return "Promotion expired";
  if (tracking.lifecycle === "scheduled") return "Scheduled promotion";
  if (tracking.lifecycle === "critical") {
    if (tracking.daysLeft <= 0) return "Expires today";
    return `Expires in ${tracking.daysLeft} day${tracking.daysLeft === 1 ? "" : "s"}`;
  }
  if (tracking.lifecycle === "expiringSoon") {
    return `Expires in ${tracking.daysLeft} days`;
  }
  if (typeof tracking.daysLeft === "number") {
    return `${tracking.daysLeft} days left`;
  }
  return "Promotion active";
};

export const promotionLifecycleClass = (lifecycle) => {
  if (lifecycle === "expired") return "bg-red-50 text-red-700 border-red-200";
  if (lifecycle === "critical") return "bg-orange-50 text-orange-700 border-orange-200";
  if (lifecycle === "expiringSoon") return "bg-amber-50 text-amber-700 border-amber-200";
  if (lifecycle === "scheduled") return "bg-blue-50 text-blue-700 border-blue-200";
  if (lifecycle === "active") return "bg-green-50 text-green-700 border-green-200";
  return "bg-slate-50 text-slate-600 border-slate-200";
};
