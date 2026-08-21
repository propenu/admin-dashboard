import { CalendarRange, Filter, Search } from "lucide-react";
import { DATE_PRESETS } from "./dashboardDateRange";

/**
 * Reusable date-range control: Today / 7d / 30d / 90d / Custom (+ optional extras).
 */
export default function DashboardDateFilter({
  preset,
  onPresetChange,
  customFrom,
  customTo,
  onCustomFromChange,
  onCustomToChange,
  onApplyCustom,
  presets = DATE_PRESETS,
  trailing = null,
  activeClassName = "bg-emerald-600 text-white shadow-sm",
  idleClassName = "bg-slate-50 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700",
  label = "Date range",
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-[14px] border border-slate-200 bg-white p-2 shadow-sm">
      <span className="inline-flex items-center gap-1 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
        <Filter className="h-3.5 w-3.5" />
        {label}
      </span>

      {presets.map((item) => {
        const active = preset === item.key;
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onPresetChange?.(item.key)}
            className={`rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition ${
              active ? activeClassName : idleClassName
            }`}
          >
            {item.label}
          </button>
        );
      })}

      {preset === "custom" && (
        <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-emerald-100 bg-emerald-50/50 px-2 py-1">
          <CalendarRange className="h-3.5 w-3.5 text-emerald-600" />
          <label className="flex items-center gap-1 text-[10px] font-semibold text-slate-500">
            From
            <input
              type="date"
              value={customFrom || ""}
              max={customTo || undefined}
              onChange={(event) => onCustomFromChange?.(event.target.value)}
              className="rounded-md border border-slate-200 bg-white px-1.5 py-1 text-[11px] font-semibold text-slate-700 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100"
            />
          </label>
          <label className="flex items-center gap-1 text-[10px] font-semibold text-slate-500">
            To
            <input
              type="date"
              value={customTo || ""}
              min={customFrom || undefined}
              onChange={(event) => onCustomToChange?.(event.target.value)}
              className="rounded-md border border-slate-200 bg-white px-1.5 py-1 text-[11px] font-semibold text-slate-700 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100"
            />
          </label>
          <button
            type="button"
            onClick={onApplyCustom}
            className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-700"
          >
            <Search className="h-3 w-3" />
            Search
          </button>
        </div>
      )}

      {trailing ? (
        <span className="ml-auto inline-flex items-center text-[10px] text-slate-400">
          {trailing}
        </span>
      ) : null}
    </div>
  );
}
