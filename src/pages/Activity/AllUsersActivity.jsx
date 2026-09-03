import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CalendarDays,
  ChartNoAxesCombined,
  CheckCircle2,
  ChevronRight,
  Info,
  Loader2,
  RefreshCw,
  Search,
  UserRound,
  UserRoundPlus,
  Zap,
} from "lucide-react";
import AnimatedPills from "../../components/common/AnimatedPills";
import { getAllUsersActivity } from "../../features/activity/allUsersActivityService";
import ActivityDetailDrawer from "./components/ActivityDetailDrawer";
import ActivityMobileBottomNav from "./components/ActivityMobileBottomNav";
import ActivityFilterSelect from "./components/ActivityFilterSelect";
import {
  ACTION_FILTERS,
  ROLE_FILTERS,
  TIME_FILTERS,
  buildActivityQueryParams,
  initialsFromName,
  normalizeActivityRow,
  outcomeBadgeClass,
} from "./utils/activityFormatters";

const TIME_PILLS = [
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yday" },
  { key: "7d", label: "7D" },
  { key: "30d", label: "30D" },
  { key: "custom", label: "Custom" },
];

const MetricSkeleton = () => (
  <div className="flex h-[52px] animate-pulse flex-col items-center justify-center rounded-lg border border-[#e5eee8] bg-white px-1 py-1.5 shadow-sm sm:h-[56px]">
    <div className="mb-0.5 h-4 w-4 rounded-full bg-[#EAF8F0]" />
    <div className="h-2.5 w-5 rounded bg-slate-100" />
    <div className="mt-0.5 h-1.5 w-8 rounded bg-slate-100" />
  </div>
);

export default function AllUsersActivity() {
  const [role, setRole] = useState("all");
  const [timeKey, setTimeKey] = useState("today");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [action, setAction] = useState("all");
  const [query, setQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [liveState, setLiveState] = useState("live");
  const [data, setData] = useState(null);
  const [selected, setSelected] = useState(null);
  const [newCount, setNewCount] = useState(0);
  /** Mobile content tabs under KPIs: live | results | attention | top */
  const [mobileSection, setMobileSection] = useState("live");
  const abortRef = useRef(null);
  const tableScrollRef = useRef(null);
  const firstIdRef = useRef("");

  useEffect(() => {
    const timer = setTimeout(() => setQuery(searchInput.trim()), 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [role, timeKey, action, query, pageSize, customFrom, customTo]);

  const canFetchCustom = timeKey !== "custom" || (customFrom && customTo);

  const load = async ({ soft = false } = {}) => {
    if (!canFetchCustom) return;
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    if (soft) {
      setRefreshing(true);
      setLiveState((prev) => (prev === "offline" ? "reconnecting" : prev));
    } else {
      setLoading(true);
    }
    setError("");

    try {
      const result = await getAllUsersActivity(
        buildActivityQueryParams({
          action,
          role,
          timeKey,
          customFrom,
          customTo,
          query,
          page,
          limit: pageSize,
          groupBy: "user",
        }),
        { signal: controller.signal },
      );

      const nextFirst = result?.items?.[0]?.id || "";
      const scrolled =
        tableScrollRef.current && tableScrollRef.current.scrollTop > 80;
      const hasNewAtTop =
        soft &&
        scrolled &&
        Boolean(nextFirst) &&
        Boolean(firstIdRef.current) &&
        nextFirst !== firstIdRef.current;

      if (hasNewAtTop) {
        setNewCount((n) => n + 1);
        setData((prev) =>
          prev
            ? {
                ...result,
                items: prev.items,
                pagination: prev.pagination,
              }
            : result,
        );
      } else {
        setData(result);
        firstIdRef.current = nextFirst;
        setNewCount(0);
      }

      setLiveState("live");
    } catch (err) {
      if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED") return;
      setError(err?.response?.data?.message || err?.message || "Failed to load activity");
      setLiveState("offline");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
    const timer = setInterval(() => load({ soft: true }), 12_000);
    return () => {
      clearInterval(timer);
      if (abortRef.current) abortRef.current.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, timeKey, action, query, page, pageSize, customFrom, customTo, canFetchCustom]);

  const rows = useMemo(
    () => (data?.items || []).map(normalizeActivityRow),
    [data?.items],
  );
  const kpis = data?.kpis || {};
  const topActive = data?.topActive || [];
  const needsAttention = data?.needsAttention || [];
  const pagination = data?.pagination || {
    page: 1,
    pageSize,
    total: 0,
    totalPages: 1,
    rangeStart: 0,
    rangeEnd: 0,
  };

  const results = [
    { label: "Leads", value: kpis.leadsGot ?? 0, filter: "leads" },
    { label: "Visits", value: kpis.visitsGot ?? 0, filter: "visits" },
    { label: "Contacts", value: kpis.contactsGot ?? 0, filter: "contacts" },
    { label: "Brochures", value: kpis.brochuresGot ?? 0, filter: "brochures" },
  ];

  const metrics = [
    { key: "active", label: "Active now", value: kpis.activeNow ?? 0, icon: UserRound, filter: "all" },
    { key: "actions", label: "Actions", value: kpis.actionsToday ?? 0, icon: ChartNoAxesCombined, filter: "all" },
    { key: "leads", label: "Leads", value: kpis.leadsGot ?? 0, icon: UserRoundPlus, filter: "leads" },
    { key: "visits", label: "Visits", value: kpis.visitsGot ?? 0, icon: CalendarDays, filter: "visits" },
  ];

  const livePill =
    liveState === "live"
      ? "border-[#12A150]/25 bg-[#EAF8F0] text-[#0B7A3A]"
      : liveState === "reconnecting"
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : "border-slate-200 bg-slate-50 text-slate-500";

  const liveLabel =
    liveState === "live" ? "Live" : liveState === "reconnecting" ? "Reconnecting" : "Offline";

  const applyFreshData = () => {
    setNewCount(0);
    if (tableScrollRef.current) tableScrollRef.current.scrollTop = 0;
    load({ soft: false });
  };

  const clearFilters = () => {
    setRole("all");
    setTimeKey("today");
    setCustomFrom("");
    setCustomTo("");
    setAction("all");
    setSearchInput("");
    setQuery("");
  };

  return (
    <div className="w-full max-w-full pb-[calc(5.75rem+env(safe-area-inset-bottom,0px))] text-[#101820] lg:pb-8">
      <header className="mb-3 px-0 sm:mb-4">
        <h1 className="text-[24px] font-bold leading-tight tracking-tight text-[#101820] sm:text-[28px]">
          All Users Activity
        </h1>
        <p className="mt-1 text-[13px] text-slate-500 sm:mt-1.5 sm:text-[14px]">
          See what users do, when they do it, and what they get
        </p>
      </header>

      {/* Mobile: animated time tabs + compact controls */}
      <div className="mb-3 space-y-2.5 lg:hidden">
        <div className="flex items-center gap-2">
          <AnimatedPills
            items={TIME_PILLS}
            value={timeKey}
            onChange={setTimeKey}
            ariaLabel="Time range"
            size="sm"
            fullWidth
            className="min-w-0 flex-1"
          />
          <span
            className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-2.5 text-[11px] font-bold ${livePill}`}
            aria-live="polite"
          >
            <span
              className={`h-2 w-2 rounded-full ${
                liveState === "live"
                  ? "animate-pulse bg-[#12A150]"
                  : liveState === "reconnecting"
                    ? "bg-amber-500"
                    : "bg-slate-400"
              }`}
            />
            {liveLabel}
          </span>
          <button
            type="button"
            onClick={() => load({ soft: true })}
            aria-label="Refresh activity"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#d9ebe0] bg-white text-[#12A150]"
          >
            {refreshing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          </button>
        </div>

        {timeKey === "custom" ? (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="h-10 min-w-0 flex-1 rounded-xl border border-[#d9ebe0] bg-white px-3 text-[13px] font-semibold"
            />
            <input
              type="date"
              value={customTo}
              min={customFrom || undefined}
              onChange={(e) => setCustomTo(e.target.value)}
              className="h-10 min-w-0 flex-1 rounded-xl border border-[#d9ebe0] bg-white px-3 text-[13px] font-semibold"
            />
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-2">
          <ActivityFilterSelect
            label="Role"
            value={role}
            onChange={setRole}
            options={ROLE_FILTERS}
            icon={UserRound}
          />
          <ActivityFilterSelect
            label="Action"
            value={action}
            onChange={setAction}
            options={ACTION_FILTERS}
            icon={Zap}
          />
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search user or property"
            aria-label="Search user or property"
            className="h-11 w-full rounded-2xl border border-[#d9ebe0] bg-white pl-9 pr-3 text-[14px] text-[#101820] placeholder:text-slate-400 focus:border-[#12A150] focus:outline-none focus:ring-4 focus:ring-[#12A150]/10"
          />
        </div>
      </div>

      {/* Desktop filters */}
      <div className="mb-4 hidden w-full flex-col gap-3 lg:flex lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2.5">
          <ActivityFilterSelect
            label="Role"
            value={role}
            onChange={setRole}
            options={ROLE_FILTERS}
            icon={UserRound}
            className="w-full sm:w-[168px]"
          />
          <ActivityFilterSelect
            label="Time"
            value={timeKey}
            onChange={setTimeKey}
            options={TIME_FILTERS}
            icon={CalendarDays}
            className="w-full sm:w-[178px]"
          />

          {timeKey === "custom" ? (
            <div className="flex flex-wrap items-center gap-2">
              <label className="sr-only" htmlFor="activity-from">
                From date
              </label>
              <input
                id="activity-from"
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="h-10 rounded-xl border border-[#d9ebe0] bg-white px-3 text-[13px] font-semibold text-[#101820] focus:border-[#12A150] focus:outline-none focus:ring-4 focus:ring-[#12A150]/10"
              />
              <label className="sr-only" htmlFor="activity-to">
                To date
              </label>
              <input
                id="activity-to"
                type="date"
                value={customTo}
                min={customFrom || undefined}
                onChange={(e) => setCustomTo(e.target.value)}
                className="h-10 rounded-xl border border-[#d9ebe0] bg-white px-3 text-[13px] font-semibold text-[#101820] focus:border-[#12A150] focus:outline-none focus:ring-4 focus:ring-[#12A150]/10"
              />
            </div>
          ) : null}

          <ActivityFilterSelect
            label="Action"
            value={action}
            onChange={setAction}
            options={ACTION_FILTERS}
            icon={Zap}
            className="w-full sm:w-[188px]"
          />

          <span
            className={`inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border px-3 text-[12px] font-bold ${livePill}`}
            aria-live="polite"
          >
            <span
              className={`h-2 w-2 rounded-full ${
                liveState === "live"
                  ? "animate-pulse bg-[#12A150]"
                  : liveState === "reconnecting"
                    ? "bg-amber-500"
                    : "bg-slate-400"
              }`}
            />
            {liveLabel}
          </span>

          <button
            type="button"
            onClick={() => load({ soft: true })}
            aria-label="Refresh activity"
            className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl border border-[#d9ebe0] bg-white px-3 text-[12px] font-semibold text-[#12A150] hover:bg-[#EAF8F0] focus:outline-none focus:ring-2 focus:ring-[#12A150]/30"
          >
            {refreshing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            Refresh
          </button>
        </div>

        <div className="relative w-full shrink-0 lg:w-[300px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search user or property"
            aria-label="Search user or property"
            className="h-10 w-full rounded-xl border border-[#d9ebe0] bg-white pl-9 pr-3 text-[13px] text-[#101820] placeholder:text-slate-400 focus:border-[#12A150] focus:outline-none focus:ring-4 focus:ring-[#12A150]/10"
          />
        </div>
      </div>

      {/* KPI cards — compact one-row metrics */}
      <div className="mb-3 grid w-full grid-cols-4 gap-1.5 sm:gap-2 lg:mb-3">
        {loading && !data
          ? Array.from({ length: 4 }).map((_, i) => <MetricSkeleton key={i} />)
          : metrics.map((card) => (
              <button
                key={card.key}
                type="button"
                onClick={() => setAction(card.filter)}
                className={`flex h-[52px] w-full flex-col items-center justify-center rounded-lg border border-[#e5eee8] bg-white px-1 py-1 text-center shadow-sm transition hover:border-[#12A150]/35 hover:shadow focus:outline-none focus:ring-2 focus:ring-[#12A150]/25 active:scale-[0.98] sm:h-[56px] sm:px-1.5 ${
                  action === card.filter && card.filter !== "all"
                    ? "border-[#12A150] ring-2 ring-[#12A150]/15"
                    : ""
                }`}
              >
                <span className="mb-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#EAF8F0] text-[#12A150] sm:h-5 sm:w-5">
                  <card.icon className="h-2.5 w-2.5 sm:h-3 sm:w-3" strokeWidth={2.25} />
                </span>
                <span className="text-[13px] font-black leading-none tabular-nums text-[#101820] sm:text-[15px]">
                  {card.value}
                </span>
                <span className="mt-0.5 truncate px-0.5 text-[8px] font-semibold leading-tight text-slate-500 sm:text-[10px]">
                  {card.label}
                </span>
              </button>
            ))}
      </div>

      {/* Left: Live activity · Right: side panels — full width */}
      <div className="flex w-full flex-col items-stretch gap-4 lg:flex-row lg:items-start">
        <section
          className={`min-w-0 flex-1 overflow-hidden rounded-2xl border border-[#e5eee8] bg-white shadow-sm motion-safe:animate-[tlFadeUp_280ms_ease-out] ${
            mobileSection !== "live" ? "hidden lg:block" : ""
          }`}
        >          <div className="flex items-center justify-between gap-3 border-b border-[#eef2f0] px-5 py-4">
            <h2 className="text-[16px] font-bold text-[#101820]">Live activity</h2>
            {newCount > 0 ? (
              <button
                type="button"
                onClick={applyFreshData}
                className="rounded-full border border-[#12A150]/25 bg-[#EAF8F0] px-3 py-1 text-[11px] font-bold text-[#0B7A3A]"
              >
                New activity available
              </button>
            ) : null}
          </div>

          {timeKey === "custom" && !canFetchCustom ? (
            <div className="px-5 py-14 text-center text-sm text-slate-500">
              Select a start and end date to load activity.
            </div>
          ) : error ? (
            <div className="px-5 py-14 text-center">
              <p className="text-sm font-semibold text-red-600">{error}</p>
              <button
                type="button"
                onClick={() => load()}
                className="mt-3 rounded-xl bg-[#12A150] px-4 py-2 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[#12A150]/30"
              >
                Retry
              </button>
            </div>
          ) : loading && !rows.length ? (
            <div className="space-y-0 px-2 py-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse border-b border-[#eef2f0] px-3 py-4">
                  <div className="flex gap-3">
                    <div className="h-9 w-9 rounded-full bg-slate-100" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-1/3 rounded bg-slate-100" />
                      <div className="h-3 w-2/3 rounded bg-slate-100" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : rows.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <p className="text-sm font-semibold text-slate-600">No activity found</p>
              <p className="mt-1 text-xs text-slate-400">
                No user activity matches the selected filters.
              </p>
              <div className="mt-3 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs font-semibold text-[#12A150]"
                >
                  Clear filters
                </button>
                <button
                  type="button"
                  onClick={() => load()}
                  className="text-xs font-semibold text-slate-500"
                >
                  Refresh
                </button>
              </div>
            </div>
          ) : (
            <>
              <div
                ref={tableScrollRef}
                className="hidden max-h-[min(62vh,620px)] overflow-x-auto overflow-y-auto md:block"
              >
                <table className="w-full table-fixed border-collapse text-left">
                  <colgroup>
                    <col className="w-[26%]" />
                    <col className="w-[42%]" />
                    <col className="w-[16%]" />
                    <col className="w-[16%]" />
                  </colgroup>
                  <thead className="sticky top-0 z-10 bg-white">
                    <tr className="border-b border-[#e8eee9]">
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500">
                        Who
                      </th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500">
                        Latest action
                      </th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500">
                        When
                      </th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500">
                        Got
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, idx) => (
                      <tr
                        key={row.id}
                        tabIndex={0}
                        role="button"
                        onClick={() => setSelected(row)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setSelected(row);
                          }
                        }}
                        className={`h-14 cursor-pointer border-b border-[#eef2f0] transition hover:bg-[#F4FBF7] focus:bg-[#F4FBF7] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#12A150]/25 ${
                          idx % 5 === 0 ? "bg-[#FAFDFB]" : "bg-white"
                        }`}
                      >
                        <td className="overflow-hidden px-4 py-2.5 align-middle">
                          <div className="flex min-w-0 items-center gap-2.5">
                            {row.userAvatar ? (
                              <img
                                src={row.userAvatar}
                                alt=""
                                className="h-8 w-8 shrink-0 rounded-full object-cover"
                              />
                            ) : (
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EAF8F0] text-[10px] font-bold text-[#12A150]">
                                {initialsFromName(row.userName)}
                              </div>
                            )}
                            <div className="min-w-0 flex-1 overflow-hidden">
                              <p
                                className="truncate text-[13px] font-semibold leading-tight text-[#101820]"
                                title={row.email || row.userId}
                              >
                                {row.userName}
                              </p>
                              <p
                                className="truncate text-[11px] leading-tight text-slate-500"
                                title={
                                  !row.resolved
                                    ? `${row.role} · account missing`
                                    : row.city
                                      ? `${row.role} · ${row.city}`
                                      : row.role
                                }
                              >
                                {row.role}
                                {!row.resolved
                                  ? " · account missing"
                                  : row.city
                                    ? ` · ${row.city}`
                                    : ""}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="overflow-hidden px-4 py-2.5 align-middle">
                          <p
                            className="truncate text-[13px] font-medium leading-tight text-[#101820]"
                            title={row.what}
                          >
                            {row.whatPreview || row.what}
                          </p>
                          {row.actionCount > 1 ? (
                            <p className="mt-0.5 truncate text-[11px] font-semibold text-[#12A150]">
                              +{row.actionCount - 1} more action{row.actionCount - 1 === 1 ? "" : "s"}
                            </p>
                          ) : null}
                        </td>
                        <td className="overflow-hidden px-4 py-2.5 align-middle">
                          <span
                            className="block truncate text-[12px] leading-tight text-slate-500"
                            title={row.whenLabel}
                          >
                            {row.whenLabel}
                          </span>
                        </td>
                        <td className="overflow-hidden px-4 py-2.5 align-middle">
                          <div className="flex min-w-0 flex-col items-start gap-1">
                            <span
                              className={`inline-flex max-w-full truncate rounded-full border px-2.5 py-1 text-[11px] font-bold ${outcomeBadgeClass(row.gotType)}`}
                              title={row.gotLabel}
                            >
                              {row.gotLabel}
                            </span>
                            {row.actionCount > 1 ? (
                              <span className="text-[10px] font-semibold tabular-nums text-slate-400">
                                {row.actionCount} total
                              </span>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-2.5 p-3 md:hidden">
                {rows.map((row) => (
                  <button
                    key={row.id}
                    type="button"
                    onClick={() => setSelected(row)}
                    className="w-full rounded-2xl border border-[#e7f2eb] bg-white p-3.5 text-left shadow-sm transition active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-[#12A150]/25"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EAF8F0] text-[12px] font-bold text-[#12A150]">
                          {initialsFromName(row.userName)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-[15px] font-bold text-[#101820]">{row.userName}</p>
                          <p className="text-[12px] text-slate-500">{row.role}</p>
                        </div>
                      </div>
                      <span className="shrink-0 text-[11px] font-semibold text-slate-400">{row.whenLabel}</span>
                    </div>
                    <p className="mt-2.5 text-[13px] font-medium leading-snug text-[#101820]" title={row.what}>
                      {row.whatPreview || row.what}
                    </p>
                    {row.actionCount > 1 ? (
                      <p className="mt-1 text-[12px] font-bold text-[#12A150]">
                        +{row.actionCount - 1} more actions
                      </p>
                    ) : null}
                    <span
                      className={`mt-2.5 inline-flex max-w-full truncate rounded-full border px-2.5 py-1 text-[11px] font-bold ${outcomeBadgeClass(row.gotType)}`}
                    >
                      {row.gotLabel}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}

          <div className="flex flex-col gap-3 border-t border-[#eef2f0] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <p className="hidden items-center gap-1.5 text-[12px] text-slate-500 sm:inline-flex">
              <Info className="h-3.5 w-3.5 text-[#12A150]" />
              Tip: click a user to see all actions with separate times
            </p>

            {pagination.total > 0 ? (
              <div className="flex w-full flex-wrap items-center justify-between gap-2 sm:w-auto sm:justify-end">
                <span className="text-xs text-slate-500">
                  <span className="font-semibold text-[#101820]">
                    {pagination.rangeStart}–{pagination.rangeEnd}
                  </span>
                  {" / "}
                  <span className="font-semibold text-[#101820]">{pagination.total}</span>
                </span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  aria-label="Rows per page"
                  className="rounded-lg border border-[#d9ebe0] bg-white px-2 py-1.5 text-xs font-semibold"
                >
                  {[10, 20, 50, 100].map((size) => (
                    <option key={size} value={size}>
                      {size}/page
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  disabled={pagination.page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-xl border border-[#d9ebe0] px-3 py-1.5 text-xs font-semibold text-[#12A150] disabled:opacity-40"
                >
                  Prev
                </button>
                <span className="min-w-[4.5rem] rounded-xl border border-[#d9ebe0] bg-[#F7FBF8] px-2.5 py-1.5 text-center text-xs font-bold tabular-nums">
                  {pagination.page}/{pagination.totalPages}
                </span>
                <button
                  type="button"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  className="inline-flex items-center gap-1 rounded-xl border border-[#d9ebe0] px-3 py-1.5 text-xs font-semibold text-[#12A150] disabled:opacity-40"
                >
                  Next
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : null}
          </div>
        </section>

        <aside
          className={`w-full shrink-0 space-y-3 motion-safe:animate-[tlFadeUp_280ms_ease-out] lg:sticky lg:top-20 lg:block lg:w-[280px] ${
            mobileSection === "live" ? "hidden lg:block" : ""
          }`}
        >
          <div
            className={`rounded-2xl border border-[#e5eee8] bg-white p-4 shadow-sm lg:rounded-xl ${
              mobileSection !== "results" ? "hidden lg:block" : ""
            }`}
          >
            <div className="mb-3 flex items-center gap-2">
              <Activity className="h-4 w-4 text-[#12A150]" />
              <h3 className="text-[13px] font-bold text-[#101820]">Today’s results</h3>
            </div>
            {loading && !data ? (
              <div className="animate-pulse space-y-3 py-1">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <div className="h-3 w-16 rounded bg-slate-100" />
                    <div className="h-3 w-8 rounded bg-slate-100" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 lg:block lg:divide-y lg:divide-[#eef2f0]">
                {results.map((row) => (
                  <button
                    key={row.label}
                    type="button"
                    onClick={() => {
                      setAction(row.filter);
                      setMobileSection("live");
                    }}
                    className={`rounded-xl border border-[#eef2f0] bg-[#F7FBF8] p-3 text-left transition active:scale-[0.98] focus:outline-none lg:flex lg:w-full lg:items-center lg:justify-between lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:py-2.5 ${
                      action === row.filter ? "border-[#12A150] ring-2 ring-[#12A150]/15 lg:ring-0" : ""
                    }`}
                  >
                    <span className="block text-[12px] font-semibold text-slate-500 lg:text-[13px] lg:font-medium lg:text-slate-600">
                      {row.label}
                    </span>
                    <span className="mt-1 block text-[22px] font-black tabular-nums text-[#12A150] lg:mt-0 lg:text-[13px] lg:font-bold">
                      {row.value}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div
            className={`rounded-2xl border border-[#e5eee8] bg-white p-4 shadow-sm lg:rounded-xl ${
              mobileSection !== "attention" ? "hidden lg:block" : ""
            }`}
          >
            <div className="mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-[#12A150]" />
              <h3 className="text-[13px] font-bold text-[#101820]">Needs attention</h3>
            </div>
            {needsAttention.length ? (
              <ul className="space-y-2.5">
                {needsAttention.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 rounded-xl bg-[#F7FBF8] p-3 text-[13px] text-slate-600 lg:bg-transparent lg:p-0">
                    <span
                      className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                        item.tone === "amber" ? "bg-amber-500" : "bg-[#12A150]"
                      }`}
                    />
                    {item.text}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="inline-flex items-center gap-2 rounded-xl bg-[#F7FBF8] p-3 text-[13px] text-slate-500 lg:bg-transparent lg:p-0">
                <CheckCircle2 className="h-4 w-4 text-[#12A150]" />
                All clear for now
              </p>
            )}
          </div>

          <div
            className={`rounded-2xl border border-[#e5eee8] bg-white p-4 shadow-sm lg:rounded-xl ${
              mobileSection !== "top" ? "hidden lg:block" : ""
            }`}
          >
            <div className="mb-3 flex items-center gap-2">
              <UserRound className="h-4 w-4 text-[#12A150]" />
              <h3 className="text-[13px] font-bold text-[#101820]">Top active</h3>
            </div>
            <div className="space-y-2.5 lg:space-y-3">
              {topActive.length ? (
                topActive.slice(0, 5).map((user) => (
                  <button
                    key={user.userId}
                    type="button"
                    onClick={() => {
                      const term = user.name?.startsWith("User ·")
                        ? user.userId
                        : user.name || user.userId || "";
                      setSearchInput(term);
                      setQuery(term);
                      setMobileSection("live");
                    }}
                    className="flex w-full items-center justify-between gap-2 rounded-xl border border-[#eef2f0] bg-[#F7FBF8] p-3 text-left focus:outline-none focus:ring-2 focus:ring-[#12A150]/25 lg:rounded-lg lg:border-0 lg:bg-transparent lg:p-0"
                  >
                    <span className="flex min-w-0 items-center gap-2.5">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EAF8F0] text-[10px] font-bold text-[#12A150] lg:h-8 lg:w-8">
                        {initialsFromName(user.name)}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-[13px] font-semibold text-[#101820]">
                          {user.name}
                        </span>
                        <span className="text-[11px] text-slate-500">{user.role}</span>
                      </span>
                    </span>
                    <span className="shrink-0 text-[15px] font-black tabular-nums text-[#12A150] lg:text-[13px] lg:font-bold">
                      {user.count}
                    </span>
                  </button>
                ))
              ) : (
                <p className="text-[13px] text-slate-500">No active users yet</p>
              )}
            </div>
          </div>
        </aside>
      </div>

      <ActivityMobileBottomNav
        activeTab={mobileSection}
        onTabChange={setMobileSection}
        badges={{
          live: newCount,
          attention: needsAttention.length,
        }}
      />

      <ActivityDetailDrawer
        open={Boolean(selected)}
        activity={selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
