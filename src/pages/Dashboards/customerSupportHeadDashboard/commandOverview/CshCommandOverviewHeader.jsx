import { ClipboardList, RefreshCw, ShieldCheck } from "lucide-react";
import CshAnimatedPills from "../components/CshAnimatedPills";

const DESKTOP_PRESETS = [
  { key: "today", label: "Today" },
  { key: "7d", label: "7D" },
  { key: "30d", label: "30D" },
  { key: "all", label: "All" },
];

const MOBILE_PRESETS = [
  { key: "today", label: "Today" },
  { key: "7d", label: "7D" },
  { key: "30d", label: "30D" },
  { key: "all", label: "All" },
];

export default function CshCommandOverviewHeader({
  rangeLabel,
  preset,
  onPresetChange,
  onOpenQueue,
  onRefresh,
  isFetching,
  activeTab,
  onTabChange,
  compact = false,
}) {
  if (compact) {
    return (
      <header className="space-y-3 motion-safe:animate-[tlFadeUp_350ms_ease-out]">
        <div className="min-w-0">
          <p className="mb-1 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-600">
            <ShieldCheck size={12} aria-hidden />
            Customer Support Head
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Command Overview
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Team Lead pods → your review → escalate to Operations
            {rangeLabel ? (
              <span className="text-slate-400">
                {" "}
                · <span className="font-semibold text-slate-600">{rangeLabel}</span>
              </span>
            ) : null}
          </p>
        </div>

        {/* One row: date segment + actions, equal height, vertically centered */}
        <div className="flex w-full items-center gap-2">
          <CshAnimatedPills
            items={MOBILE_PRESETS}
            value={preset}
            onChange={onPresetChange}
            ariaLabel="Date range"
            size="sm"
            fullWidth
            className="min-w-0 flex-1"
          />
          <button
            type="button"
            onClick={onOpenQueue}
            className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-full bg-emerald-600 px-3 text-[11px] font-bold leading-none text-white shadow-sm transition hover:bg-emerald-700 active:scale-[0.97]"
          >
            <ClipboardList size={14} aria-hidden className="shrink-0" />
            Queue
          </button>
          <button
            type="button"
            onClick={onRefresh}
            disabled={isFetching}
            aria-label="Refresh dashboard"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 disabled:opacity-60"
          >
            <RefreshCw
              size={14}
              className={isFetching ? "animate-spin text-emerald-600" : ""}
              aria-hidden
            />
          </button>
        </div>
      </header>
    );
  }

  return (
    <header className="rounded-2xl border border-slate-200/80 bg-white px-2.5 py-2.5 shadow-sm motion-safe:animate-[tlFadeUp_350ms_ease-out] sm:px-4 sm:py-3">
      <div className="flex flex-col gap-2 min-[1100px]:flex-row min-[1100px]:items-center min-[1100px]:justify-between">
        <div className="min-w-0 shrink">
          <p className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-[0.16em] text-emerald-600 sm:text-[10px]">
            <ShieldCheck size={12} aria-hidden />
            Customer Support Head
          </p>
          <h1 className="mt-0.5 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
            Command Overview
          </h1>
          <p className="mt-0.5 line-clamp-2 text-[10px] text-slate-500 sm:truncate sm:text-[12px]">
            Team Lead pods → your review → escalate to Operations
            {rangeLabel ? (
              <span className="text-slate-400">
                {" "}
                · <span className="font-semibold text-slate-600">{rangeLabel}</span>
              </span>
            ) : null}
          </p>
        </div>

        <div className="flex min-w-0 flex-wrap items-center gap-1.5 min-[1100px]:justify-end">
          <div
            className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-0.5"
            role="group"
            aria-label="Date range"
          >
            {DESKTOP_PRESETS.map((item) => {
              const active = preset === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => onPresetChange?.(item.key)}
                  className={`min-h-[32px] rounded-[10px] px-2 text-[10px] font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 sm:min-h-[34px] sm:px-2.5 sm:text-[11px] ${
                    active
                      ? "bg-white text-emerald-700 shadow-sm ring-1 ring-emerald-200"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="hidden rounded-xl border border-slate-200 bg-slate-50 p-0.5 sm:inline-flex">
            {[
              { id: "overview", label: "Overview" },
              { id: "directory", label: "Directory" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange?.(tab.id)}
                className={`min-h-[34px] rounded-[10px] px-2.5 text-[11px] font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                  activeTab === tab.id
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onOpenQueue}
            className="inline-flex min-h-[32px] items-center gap-1 rounded-xl bg-emerald-600 px-2.5 text-[10px] font-bold text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 sm:min-h-[34px] sm:px-3 sm:text-[11px]"
          >
            <ClipboardList size={14} aria-hidden />
            <span className="sm:hidden">Queue</span>
            <span className="hidden sm:inline">Open queue</span>
          </button>

          <button
            type="button"
            onClick={onRefresh}
            disabled={isFetching}
            aria-label="Refresh dashboard"
            className="grid h-8 w-8 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:opacity-60 sm:h-9 sm:w-9"
          >
            <RefreshCw
              size={14}
              className={isFetching ? "animate-spin text-emerald-600" : ""}
              aria-hidden
            />
          </button>
        </div>
      </div>
    </header>
  );
}
