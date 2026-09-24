/** Shared date-range helpers for all role dashboards. */

export const DASHBOARD_TIMEZONE = "Asia/Kolkata";

export const DATE_PRESETS = [
  { key: "today", label: "Today" },
  { key: "7d", label: "7 days" },
  { key: "30d", label: "30 days" },
  { key: "90d", label: "90 days" },
  { key: "custom", label: "Custom" },
];

/** Follow-up tracking page: Today / 7 days / Month / Year / Custom */
export const FOLLOW_UP_DATE_PRESETS = [
  { key: "today", label: "Today" },
  { key: "7d", label: "7 days" },
  { key: "30d", label: "Month" },
  { key: "12mo", label: "Year" },
  { key: "custom", label: "Custom" },
];

const isoDay = (d, timeZone = DASHBOARD_TIMEZONE) =>
  d.toLocaleDateString("en-CA", { timeZone });

export const todayIso = () => isoDay(new Date());

/** Normalized filter model used by dashboard APIs. */
export const toDashboardDateModel = (range = {}, preset = "30d") => ({
  startDate: range.from || "",
  endDate: range.to || "",
  timezone: DASHBOARD_TIMEZONE,
  preset,
  from: range.from || "",
  to: range.to || "",
  days: range.days ?? null,
  label: range.label || "",
});

const isIsoDay = (value) => /^\d{4}-\d{2}-\d{2}$/.test(String(value || ""));

const addDaysIso = (iso, delta) => {
  const base = isIsoDay(iso) ? iso : todayIso();
  const utc = new Date(`${base}T00:00:00.000Z`);
  utc.setUTCDate(utc.getUTCDate() + Number(delta || 0));
  return utc.toISOString().slice(0, 10);
};

const daySpan = (from, to) => {
  if (!isIsoDay(from) || !isIsoDay(to)) return 1;
  const a = new Date(`${from}T00:00:00.000Z`).getTime();
  const b = new Date(`${to}T00:00:00.000Z`).getTime();
  return Math.max(1, Math.round(Math.abs(b - a) / 86400000) + 1);
};

/**
 * Resolve a preset (or custom bounds) into { from, to, days, label }.
 * Calendar days are Asia/Kolkata so they match backend IST bounds.
 * @param {string} preset
 * @param {{ from?: string, to?: string }} [custom]
 */
export const rangeFromPreset = (preset = "30d", custom = {}) => {
  const toDay = todayIso();

  if (preset === "today") {
    return { from: toDay, to: toDay, days: 1, label: "Today" };
  }

  if (preset === "all") {
    return { from: "", to: "", days: null, label: "All time" };
  }

  if (preset === "custom") {
    const rawFrom = isIsoDay(custom.from) ? custom.from : toDay;
    const rawTo = isIsoDay(custom.to) ? custom.to : toDay;
    const from = rawFrom <= rawTo ? rawFrom : rawTo;
    const to = rawFrom <= rawTo ? rawTo : rawFrom;
    return {
      from,
      to,
      days: daySpan(from, to),
      label: `${from} → ${to}`,
    };
  }

  const days =
    preset === "7d" ? 7 : preset === "90d" || preset === "quarter" ? 90 : preset === "12mo" ? 365 : 30;
  const from = addDaysIso(toDay, -(days - 1));
  return {
    from,
    to: toDay,
    days,
    label: days === 365 ? "Last 12 months" : `Last ${days} days`,
  };
};

/** Filter API params — omit empty from/to for "all time". */
export const filtersFromRange = (range = {}) => {
  const params = {};
  if (range.from) {
    params.from = range.from;
    params.startDate = range.from;
  }
  if (range.to) {
    params.to = range.to;
    params.endDate = range.to;
  }
  return params;
};

export const inDateRange = (value, range = {}) => {
  if (!range?.from && !range?.to) return true;
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const t = date.getTime();
  if (range.from) {
    const from = new Date(`${range.from}T00:00:00.000+05:30`).getTime();
    if (Number.isFinite(from) && t < from) return false;
  }
  if (range.to) {
    const to = new Date(`${range.to}T23:59:59.999+05:30`).getTime();
    if (Number.isFinite(to) && t > to) return false;
  }
  return true;
};
