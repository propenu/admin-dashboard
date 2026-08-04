import { useEffect, useState } from "react";
import { ChevronRight, Loader2, X } from "lucide-react";
import { getUserActivityTimeline } from "../../../features/activity/allUsersActivityService";
import {
  formatExactTime,
  initialsFromName,
  normalizeActivityRow,
  outcomeBadgeClass,
} from "../utils/activityFormatters";

const PAGE_SIZE = 40;

export default function ActivityDetailDrawer({ open, activity, onClose }) {
  const [timeline, setTimeline] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loadingTimeline, setLoadingTimeline] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [timelineError, setTimelineError] = useState("");

  useEffect(() => {
    if (!open || !activity?.userId) {
      setTimeline([]);
      setPage(1);
      setTotalPages(1);
      setTotal(0);
      setTimelineError("");
      return undefined;
    }

    const controller = new AbortController();
    setLoadingTimeline(true);
    setTimelineError("");
    setPage(1);

    getUserActivityTimeline(activity.userId, {
      page: 1,
      limit: PAGE_SIZE,
      hours: 720,
      signal: controller.signal,
    })
      .then((result) => {
        const rows = (result?.items || []).map(normalizeActivityRow);
        setTimeline(rows.length ? rows : activity.recentActions?.length
          ? activity.recentActions
          : [activity]);
        setTotal(result?.pagination?.total || rows.length);
        setTotalPages(result?.pagination?.totalPages || 1);
      })
      .catch((err) => {
        if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED") return;
        setTimeline(
          activity.recentActions?.length ? activity.recentActions : [activity],
        );
        setTimelineError(
          err?.response?.data?.message || "Could not load full activity history.",
        );
      })
      .finally(() => setLoadingTimeline(false));

    return () => controller.abort();
  }, [open, activity]);

  const loadMore = async () => {
    if (!activity?.userId || page >= totalPages || loadingMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const result = await getUserActivityTimeline(activity.userId, {
        page: nextPage,
        limit: PAGE_SIZE,
        hours: 720,
      });
      const rows = (result?.items || []).map(normalizeActivityRow);
      setTimeline((prev) => {
        const seen = new Set(prev.map((row) => row.id));
        return [...prev, ...rows.filter((row) => row.id && !seen.has(row.id))];
      });
      setPage(nextPage);
      setTotalPages(result?.pagination?.totalPages || nextPage);
      setTotal(result?.pagination?.total || total);
    } catch (err) {
      setTimelineError(
        err?.response?.data?.message || "Could not load more activity.",
      );
    } finally {
      setLoadingMore(false);
    }
  };

  if (!open || !activity) return null;

  return (
    <div className="fixed inset-0 z-[80] flex justify-end bg-slate-950/35 backdrop-blur-[1px]">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close detail"
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="activity-detail-title"
        className="relative z-[81] flex h-full w-full max-w-lg flex-col border-l border-[#d9ebe0] bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-[#e7f2eb] px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            {activity.userAvatar ? (
              <img
                src={activity.userAvatar}
                alt=""
                className="h-11 w-11 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#EAF8F0] text-xs font-bold text-[#12A150]">
                {initialsFromName(activity.userName)}
              </div>
            )}
            <div className="min-w-0">
              <h3
                id="activity-detail-title"
                className="truncate text-base font-bold text-[#101820]"
              >
                {activity.userName}
              </h3>
              <p className="truncate text-xs text-slate-500">
                {activity.role}
                {activity.city ? ` · ${activity.city}` : ""}
                {!activity.resolved ? " · account missing" : ""}
              </p>
              <p className="mt-0.5 text-[11px] font-semibold text-[#12A150]">
                {activity.actionCount || total || timeline.length} actions in period
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#12A150]/30"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          <section className="grid grid-cols-2 gap-3 text-xs">
            {activity.email ? (
              <div className="rounded-xl border border-slate-100 bg-white p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Email
                </p>
                <p className="mt-1 break-all font-medium text-[#101820]">{activity.email}</p>
              </div>
            ) : null}
            {activity.phone ? (
              <div className="rounded-xl border border-slate-100 bg-white p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Phone
                </p>
                <p className="mt-1 font-medium text-[#101820]">{activity.phone}</p>
              </div>
            ) : null}
            <div className="rounded-xl border border-slate-100 bg-white p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Latest activity
              </p>
              <p className="mt-1 font-medium text-[#101820]">{activity.whenLabel}</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-white p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Latest outcome
              </p>
              <span
                className={`mt-1 inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold ${outcomeBadgeClass(activity.gotType)}`}
              >
                {activity.gotLabel}
              </span>
            </div>
          </section>

          <section>
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                All actions · separate times
              </p>
              {loadingTimeline ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-[#12A150]" />
              ) : (
                <span className="text-[11px] font-semibold text-slate-400">
                  Showing {timeline.length}
                  {total ? ` of ${total}` : ""}
                </span>
              )}
            </div>

            {timelineError ? (
              <p className="mb-2 text-[11px] text-amber-600">{timelineError}</p>
            ) : null}

            <ul className="space-y-2">
              {timeline.map((row, index) => (
                <li
                  key={row.id || `${row.when}-${row.what}-${index}`}
                  className="rounded-xl border border-[#eef2f0] bg-white px-3 py-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-[13px] font-semibold leading-snug text-[#101820]">
                      {row.what}
                    </p>
                    <div className="shrink-0 text-right">
                      <p className="text-[11px] font-semibold text-slate-500">
                        {row.whenLabel}
                      </p>
                      <p className="mt-0.5 text-[10px] text-slate-400">
                        {row.exactWhen || formatExactTime(row.when)}
                      </p>
                    </div>
                  </div>
                  {row.entity?.title || row.entity?.location ? (
                    <p className="mt-1 truncate text-[11px] text-slate-500">
                      {row.entity?.title || row.entity?.location}
                    </p>
                  ) : null}
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold ${outcomeBadgeClass(row.gotType)}`}
                    >
                      {row.gotLabel}
                    </span>
                    {row.eventType ? (
                      <span className="text-[10px] text-slate-400">
                        {String(row.eventType).replace(/_/g, " ")}
                      </span>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>

            {page < totalPages ? (
              <button
                type="button"
                onClick={loadMore}
                disabled={loadingMore}
                className="mt-3 inline-flex w-full items-center justify-center gap-1 rounded-xl border border-[#d9ebe0] bg-white px-3 py-2.5 text-xs font-semibold text-[#12A150] hover:bg-[#EAF8F0] disabled:opacity-50"
              >
                {loadingMore ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5" />
                )}
                Load more actions
              </button>
            ) : null}
          </section>

          <section className="rounded-xl border border-slate-100 bg-slate-50 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Technical
            </p>
            <dl className="mt-2 space-y-1.5 text-[11px] text-slate-600">
              <div className="flex justify-between gap-3">
                <dt>User ID</dt>
                <dd className="break-all text-right font-medium">{activity.userId || "—"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Latest event</dt>
                <dd className="text-right font-medium">{activity.eventType || "—"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Latest page</dt>
                <dd className="max-w-[65%] break-all text-right font-medium" title={activity.pageUrl}>
                  {activity.pageUrl || "—"}
                </dd>
              </div>
            </dl>
          </section>
        </div>
      </aside>
    </div>
  );
}
