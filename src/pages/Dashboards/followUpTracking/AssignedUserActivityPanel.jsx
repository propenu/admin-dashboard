import { useEffect, useMemo, useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { Activity, ChevronRight, Loader2 } from "lucide-react";
import { getAssignedUserActivity } from "../../../features/activity/allUsersActivityService";
import {
  formatActivityTime,
  formatExactTime,
  outcomeBadgeClass,
  truncateText,
} from "../../Activity/utils/activityFormatters";
import {
  FOLLOW_UP_DATE_PRESETS,
  rangeFromPreset,
  todayIso,
} from "../shared/dashboardDateRange";

const PAGE_SIZE = 25;

const toIstBound = (day, end = false) =>
  end ? `${day}T23:59:59.999+05:30` : `${day}T00:00:00+05:30`;

/**
 * Day-wise (or range) actions for one Client Progress Queue user.
 * Default range = Today. Does not alter assignment / queue list logic.
 */
export default function AssignedUserActivityPanel({ userId, enabled = true }) {
  const [preset, setPreset] = useState("today");
  const [customFrom, setCustomFrom] = useState(todayIso());
  const [customTo, setCustomTo] = useState(todayIso());
  const [page, setPage] = useState(1);

  // New person → reset to Today so clicks always start clean.
  useEffect(() => {
    setPreset("today");
    setCustomFrom(todayIso());
    setCustomTo(todayIso());
    setPage(1);
  }, [userId]);

  const resolved = useMemo(() => {
    if (preset === "custom") {
      return rangeFromPreset("custom", { from: customFrom, to: customTo });
    }
    return rangeFromPreset(preset);
  }, [preset, customFrom, customTo]);

  const apiRange =
    preset === "custom"
      ? "custom"
      : preset === "30d"
        ? "30d"
        : preset === "12mo"
          ? "12mo"
          : preset === "7d"
            ? "7d"
            : "today";

  useEffect(() => {
    setPage(1);
  }, [preset, resolved.from, resolved.to]);

  const query = useQuery({
    queryKey: [
      "assigned-user-activity",
      userId,
      apiRange,
      resolved.from,
      resolved.to,
      page,
    ],
    enabled: Boolean(enabled && userId && resolved.from && resolved.to),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
    queryFn: () =>
      getAssignedUserActivity(userId, {
        range: apiRange,
        // Always send bounds so Today / 7d / Month / Year / Custom match UI labels.
        from: toIstBound(resolved.from, false),
        to: toIstBound(resolved.to, true),
        page,
        limit: PAGE_SIZE,
      }),
  });

  const items = query.data?.items || [];
  const pagination = query.data?.pagination || {
    page: 1,
    total: 0,
    totalPages: 1,
    rangeStart: 0,
    rangeEnd: 0,
  };

  if (!userId) return null;

  return (
    <div className="rounded-xl border border-emerald-100 bg-white p-2.5">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Activity className="h-3.5 w-3.5 text-emerald-600" />
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
            User activity
          </p>
        </div>
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold tabular-nums text-slate-400">
          {query.isFetching ? (
            <Loader2 className="h-3 w-3 animate-spin text-emerald-600" />
          ) : null}
          {pagination.total || 0} actions
        </span>
      </div>

      <div className="mb-2 flex flex-wrap gap-1">
        {FOLLOW_UP_DATE_PRESETS.map((item) => {
          const active = preset === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                if (item.key === "custom") {
                  setCustomFrom(resolved.from || todayIso());
                  setCustomTo(resolved.to || todayIso());
                }
                setPreset(item.key);
              }}
              className={`rounded-md px-2 py-1 text-[10px] font-semibold transition ${
                active
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-50 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {preset === "custom" ? (
        <div className="mb-2 flex flex-wrap items-center gap-1.5">
          <input
            type="date"
            value={customFrom || ""}
            onChange={(e) => setCustomFrom(e.target.value)}
            className="h-7 rounded-md border border-slate-200 px-1.5 text-[10px]"
          />
          <span className="text-[10px] text-slate-400">to</span>
          <input
            type="date"
            value={customTo || ""}
            min={customFrom || undefined}
            onChange={(e) => setCustomTo(e.target.value)}
            className="h-7 rounded-md border border-slate-200 px-1.5 text-[10px]"
          />
        </div>
      ) : null}

      <p className="mb-2 text-[10px] text-slate-400">
        {resolved.label || "Today"} · all actions this user did in range
      </p>

      {query.isLoading && !query.data ? (
        <div className="flex items-center justify-center gap-2 py-6 text-[11px] text-slate-400">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-600" />
          Loading activity…
        </div>
      ) : query.isError ? (
        <div className="space-y-2 py-3 text-center">
          <p className="text-[11px] font-medium text-rose-600">
            {query.error?.response?.data?.message || "Could not load activity"}
          </p>
          <button
            type="button"
            onClick={() => query.refetch()}
            className="text-[11px] font-semibold text-emerald-700"
          >
            Retry
          </button>
        </div>
      ) : items.length === 0 ? (
        <p className="py-5 text-center text-[11px] text-slate-400">
          No actions in this date range.
        </p>
      ) : (
        <ul
          className={`max-h-[280px] space-y-1.5 overflow-y-auto pr-0.5 [scrollbar-width:thin] ${
            query.isFetching ? "opacity-70" : ""
          }`}
        >
          {items.map((row) => (
            <li
              key={row.id}
              className="rounded-lg border border-slate-100 bg-slate-50/60 px-2.5 py-2"
            >
              <div className="flex items-start justify-between gap-2">
                <p
                  className="text-[12px] font-semibold leading-snug text-slate-900"
                  title={row.what}
                >
                  {truncateText(row.what, 56)}
                </p>
                <div className="shrink-0 text-right">
                  <p className="text-[10px] font-semibold text-slate-500">
                    {formatActivityTime(row.when)}
                  </p>
                  <p className="text-[9px] text-slate-400">
                    {formatExactTime(row.when)}
                  </p>
                </div>
              </div>
              {row.entity?.title || row.entity?.location ? (
                <p className="mt-0.5 truncate text-[10px] text-slate-500">
                  {row.entity?.title || row.entity?.location}
                </p>
              ) : null}
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <span
                  className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold ${outcomeBadgeClass(row.got?.type)}`}
                >
                  {row.got?.label || "—"}
                </span>
                {row.eventType ? (
                  <span className="text-[9px] text-slate-400">
                    {String(row.eventType).replace(/_/g, " ")}
                  </span>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}

      {pagination.total > PAGE_SIZE ? (
        <div className="mt-2 flex items-center justify-between gap-2 border-t border-slate-100 pt-2">
          <span className="text-[10px] text-slate-400">
            {pagination.rangeStart}–{pagination.rangeEnd} of {pagination.total}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={page <= 1 || query.isFetching}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-md border border-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-600 disabled:opacity-40"
            >
              Prev
            </button>
            <span className="min-w-[2.5rem] text-center text-[10px] font-bold tabular-nums text-slate-500">
              {page}/{pagination.totalPages}
            </span>
            <button
              type="button"
              disabled={page >= pagination.totalPages || query.isFetching}
              onClick={() => setPage((p) => p + 1)}
              className="inline-flex items-center gap-0.5 rounded-md border border-slate-200 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 disabled:opacity-40"
            >
              Next <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
