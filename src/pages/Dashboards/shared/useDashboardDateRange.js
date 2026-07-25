import { useMemo, useState } from "react";
import { filtersFromRange, rangeFromPreset, todayIso } from "./dashboardDateRange";

/**
 * Shared date-range state for role dashboards (presets + custom from/to).
 * @param {string} [defaultPreset="30d"]
 * @param {Array<{key:string,label:string}>} [presets]
 */
export function useDashboardDateRange(defaultPreset = "30d", presets) {
  const [preset, setPreset] = useState(defaultPreset);
  const initial = rangeFromPreset(defaultPreset);
  const [customFrom, setCustomFrom] = useState(() => initial.from || todayIso());
  const [customTo, setCustomTo] = useState(() => initial.to || todayIso());
  const [appliedCustom, setAppliedCustom] = useState(() => ({
    from: initial.from || todayIso(),
    to: initial.to || todayIso(),
  }));

  const range = useMemo(
    () => rangeFromPreset(preset, preset === "custom" ? appliedCustom : undefined),
    [appliedCustom, preset],
  );

  const filters = useMemo(() => filtersFromRange(range), [range]);

  const selectPreset = (nextPreset) => {
    if (nextPreset === "custom") {
      // Keep current period until user edits dates + clicks Search.
      const current = rangeFromPreset(preset, preset === "custom" ? appliedCustom : undefined);
      const from = current.from || todayIso();
      const to = current.to || todayIso();
      setCustomFrom(from);
      setCustomTo(to);
      setAppliedCustom({ from, to });
      setPreset("custom");
      return;
    }
    setPreset(nextPreset);
  };

  const applyCustomRange = () => {
    if (!customFrom || !customTo) return;
    const next =
      customFrom <= customTo
        ? { from: customFrom, to: customTo }
        : { from: customTo, to: customFrom };
    setAppliedCustom(next);
    setCustomFrom(next.from);
    setCustomTo(next.to);
    setPreset("custom");
  };

  return {
    preset,
    setPreset: selectPreset,
    customFrom,
    customTo,
    setCustomFrom,
    setCustomTo,
    applyCustomRange,
    range,
    filters,
    rangeLabel: range.label,
    presets: presets || undefined,
  };
}
