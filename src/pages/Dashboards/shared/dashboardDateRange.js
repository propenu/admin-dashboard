/** Shared date-range helpers for all role dashboards. */

export const DATE_PRESETS = [
  { key: "today", label: "Today" },
  { key: "7d", label: "7 days" },
  { key: "30d", label: "30 days" },
  { key: "90d", label: "90 days" },
  { key: "custom", label: "Custom" },
];

const isoDay = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const todayIso = () => isoDay(new Date());

/**
 * Resolve a preset (or custom bounds) into { from, to, days, label }.
 * @param {string} preset
 * @param {{ from?: string, to?: string }} [custom]
 */
export const rangeFromPreset = (preset = "30d", custom = {}) => {
  const to = new Date();
  to.setHours(23, 59, 59, 999);
  const from = new Date(to);
  from.setHours(0, 0, 0, 0);

  if (preset === "today") {
    return { from: isoDay(from), to: isoDay(to), days: 1, label: "Today" };
  }

  if (preset === "all") {
    return { from: "", to: "", days: null, label: "All time" };
  }

  if (preset === "custom") {
    const customFrom = custom.from || isoDay(from);
    const customTo = custom.to || isoDay(to);
    const start = new Date(`${customFrom}T00:00:00`);
    const end = new Date(`${customTo}T23:59:59`);
    const safeStart = Number.isNaN(start.getTime()) ? from : start;
    const safeEnd = Number.isNaN(end.getTime()) ? to : end;
    const orderedFrom = safeStart <= safeEnd ? safeStart : safeEnd;
    const orderedTo = safeStart <= safeEnd ? safeEnd : safeStart;
    const days = Math.max(
      1,
      Math.round((orderedTo.getTime() - orderedFrom.getTime()) / 86400000) + 1,
    );
    return {
      from: isoDay(orderedFrom),
      to: isoDay(orderedTo),
      days,
      label: `${isoDay(orderedFrom)} → ${isoDay(orderedTo)}`,
    };
  }

  const days =
    preset === "7d" ? 7 : preset === "90d" || preset === "quarter" ? 90 : preset === "12mo" ? 365 : 30;
  from.setDate(from.getDate() - (days - 1));
  return {
    from: isoDay(from),
    to: isoDay(to),
    days,
    label: days === 365 ? "Last 12 months" : `Last ${days} days`,
  };
};

/** Filter API params — omit empty from/to for "all time". */
export const filtersFromRange = (range = {}) => {
  const params = {};
  if (range.from) params.from = range.from;
  if (range.to) params.to = range.to;
  return params;
};

export const inDateRange = (value, range = {}) => {
  if (!range?.from && !range?.to) return true;
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const t = date.getTime();
  if (range.from) {
    const from = new Date(`${range.from}T00:00:00`).getTime();
    if (Number.isFinite(from) && t < from) return false;
  }
  if (range.to) {
    const to = new Date(`${range.to}T23:59:59.999`).getTime();
    if (Number.isFinite(to) && t > to) return false;
  }
  return true;
};
