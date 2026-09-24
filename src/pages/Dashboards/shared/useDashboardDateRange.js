import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  filtersFromRange,
  rangeFromPreset,
  toDashboardDateModel,
  todayIso,
} from "./dashboardDateRange";

const PRESET_KEYS = new Set(["today", "7d", "30d", "90d", "12mo", "custom", "all"]);

/**
 * Shared date-range state for role dashboards (presets + custom from/to).
 * @param {string} [defaultPreset="30d"]
 * @param {Array<{key:string,label:string}>} [presets]
 * @param {{ syncUrl?: boolean }} [options]
 */
export function useDashboardDateRange(defaultPreset = "30d", presets, options = {}) {
  const syncUrl = options.syncUrl === true;
  const [searchParams, setSearchParams] = useSearchParams();
  const urlPreset = String(searchParams.get("period") || "").trim();
  const initialPreset = PRESET_KEYS.has(urlPreset) ? urlPreset : defaultPreset;
  const [preset, setPreset] = useState(initialPreset);
  const initial = rangeFromPreset(
    initialPreset,
    initialPreset === "custom"
      ? {
          from: searchParams.get("from") || searchParams.get("startDate") || "",
          to: searchParams.get("to") || searchParams.get("endDate") || "",
        }
      : undefined,
  );
  const [customFrom, setCustomFrom] = useState(() => initial.from || todayIso());
  const [customTo, setCustomTo] = useState(() => initial.to || todayIso());
  const [appliedCustom, setAppliedCustom] = useState(() => ({
    from: initial.from || todayIso(),
    to: initial.to || todayIso(),
  }));
  const allowUrlWrite = useRef(!syncUrl);

  const range = useMemo(
    () => rangeFromPreset(preset, preset === "custom" ? appliedCustom : undefined),
    [appliedCustom, preset],
  );

  const filters = useMemo(() => filtersFromRange(range), [range]);
  const dateModel = useMemo(
    () => toDashboardDateModel(range, preset),
    [preset, range],
  );

  useEffect(() => {
    if (!syncUrl) return;
    if (!allowUrlWrite.current) {
      allowUrlWrite.current = true;
      return;
    }
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        if (preset && preset !== defaultPreset) next.set("period", preset);
        else next.delete("period");
        if (preset === "custom" && range.from) next.set("from", range.from);
        else next.delete("from");
        if (preset === "custom" && range.to) next.set("to", range.to);
        else next.delete("to");
        next.delete("startDate");
        next.delete("endDate");
        return next;
      },
      { replace: true },
    );
  }, [defaultPreset, preset, range.from, range.to, setSearchParams, syncUrl]);

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
    dateModel,
    rangeLabel: range.label,
    presets: presets || undefined,
  };
}
