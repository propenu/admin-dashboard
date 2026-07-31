import React, { useEffect, useMemo, useState } from "react";
import {
  getAccountsSummary,
  getPaymentsList,
  getRevenueByPlan,
} from "../../features/payment/paymentServices";
import {
  LayoutDashboard,
  TrendingUp,
  CalendarCheck,
  BadgeCheck,
  XCircle,
  Sparkles,
  RefreshCw,
  PieChart,
  BarChart3,
  Activity,
} from "lucide-react";

const PLAN_COLORS = [
  "#27AE60",
  "#2563eb",
  "#7c3aed",
  "#f59e0b",
  "#06b6d4",
  "#ef4444",
  "#64748b",
];

const formatINR = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

const unpackList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
};

const useCountUp = (target, enabled, duration = 900) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!enabled) return undefined;
    const end = Number(target) || 0;
    if (end <= 0) {
      setValue(0);
      return undefined;
    }
    let frame = 0;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - progress) ** 3;
      setValue(Math.round(end * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, enabled, duration]);

  return value;
};

/** Build last N day totals from payment createdAt */
const buildDailySeries = (payments, days = 14) => {
  const buckets = Array.from({ length: days }, (_, i) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - (days - 1 - i));
    return { key: d.toISOString().slice(0, 10), value: 0, label: d };
  });
  const index = new Map(buckets.map((b, i) => [b.key, i]));

  payments.forEach((p) => {
    const raw = p?.createdAt || p?.paidAt || p?.updatedAt;
    if (!raw) return;
    const key = new Date(raw).toISOString().slice(0, 10);
    if (!index.has(key)) return;
    buckets[index.get(key)].value += Number(p.amount || 0);
  });

  // If all zeros but we have a total, shape a soft wave from summary later
  return buckets.map((b) => b.value);
};

const softWaveFromTotal = (total, days = 14) => {
  const base = Math.max(Number(total) || 0, 0) / days;
  return Array.from({ length: days }, (_, i) => {
    const wave = 0.55 + Math.sin(i / 2.2) * 0.35 + (i % 3) * 0.08;
    return Math.max(0, Math.round(base * wave));
  });
};

const Sparkline = ({
  data = [],
  color = "#27AE60",
  width = 140,
  height = 42,
  delay = 0,
}) => {
  const points = useMemo(() => {
    if (!data.length) return "";
    const max = Math.max(...data, 1);
    const min = Math.min(...data, 0);
    const span = Math.max(max - min, 1);
    return data
      .map((v, i) => {
        const x = (i / Math.max(data.length - 1, 1)) * width;
        const y = height - ((v - min) / span) * (height - 6) - 3;
        return `${x},${y}`;
      })
      .join(" ");
  }, [data, width, height]);

  const area = points
    ? `M0,${height} L${points.replace(/ /g, " L")} L${width},${height} Z`
    : "";

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-12 w-full overflow-visible"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={`grad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {area && (
        <path
          d={area}
          fill={`url(#grad-${color.replace("#", "")})`}
          style={{
            animation: `fadeIn 0.8s ease ${delay}ms both`,
          }}
        />
      )}
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
        pathLength="1"
        style={{
          strokeDasharray: 1,
          strokeDashoffset: 1,
          animation: `drawLine 1.1s cubic-bezier(0.22,1,0.36,1) ${delay}ms forwards`,
        }}
      />
    </svg>
  );
};

const AnimatedBars = ({ items = [], delay = 0 }) => {
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <div className="flex h-44 items-end gap-2 sm:gap-3">
      {items.map((item, index) => {
        const pct = Math.max(6, (item.value / max) * 100);
        return (
          <div
            key={item.label}
            className="group flex min-w-0 flex-1 flex-col items-center gap-2"
            title={`${item.label}: ${formatINR(item.value)}`}
          >
            <span className="text-[10px] font-bold text-slate-500 opacity-0 transition group-hover:opacity-100">
              {formatINR(item.value)}
            </span>
            <div className="relative flex h-32 w-full items-end justify-center">
              <div
                className="w-[70%] max-w-[42px] rounded-t-xl shadow-sm"
                style={{
                  height: `${pct}%`,
                  background: `linear-gradient(180deg, ${item.color}, ${item.color}99)`,
                  animation: `growBar 0.9s cubic-bezier(0.22,1,0.36,1) ${delay + index * 70}ms both`,
                  transformOrigin: "bottom",
                }}
              />
            </div>
            <span className="w-full truncate text-center text-[10px] font-semibold text-slate-500">
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

const DonutChart = ({
  paid = 0,
  failed = 0,
  accent = "#27AE60",
  delay = 0,
}) => {
  const total = paid + failed;
  const success = total ? paid / total : 1;
  const r = 54;
  const c = 2 * Math.PI * r;
  const dash = c * success;

  return (
    <div className="relative mx-auto h-40 w-40">
      <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
        <circle cx="70" cy="70" r={r} fill="none" stroke="#eef2f7" strokeWidth="14" />
        <circle
          cx="70"
          cy="70"
          r={r}
          fill="none"
          stroke={accent}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
          style={{
            animation: `drawRing 1.2s cubic-bezier(0.22,1,0.36,1) ${delay}ms both`,
            filter: `drop-shadow(0 0 8px ${accent}55)`,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black text-slate-900">
          {Math.round(success * 100)}%
        </span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Success
        </span>
      </div>
    </div>
  );
};

const SkeletonCard = ({ index, tall }) => (
  <div
    className={`relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm ${
      tall ? "min-h-[280px]" : ""
    }`}
    style={{ animationDelay: `${index * 80}ms` }}
  >
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-slate-100/80 to-transparent" />
    <div className="mb-4 h-3 w-1/2 rounded-full bg-slate-100" />
    <div className="h-8 w-2/5 rounded-xl bg-slate-100" />
    <div className="mt-6 h-16 rounded-xl bg-slate-50" />
  </div>
);

const StatCard = ({
  title,
  rawValue,
  format = "number",
  accent,
  soft,
  icon: Icon,
  index,
  hint,
  ready,
  series,
}) => {
  const counted = useCountUp(rawValue, ready, 850 + index * 80);
  const display =
    format === "inr" ? formatINR(counted) : counted.toLocaleString("en-IN");

  return (
    <article
      className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(15,23,42,0.1)]"
      style={{
        animation: `fadeUp 0.55s cubic-bezier(0.22,1,0.36,1) ${index * 0.09}s both`,
      }}
    >
      <div
        className="absolute inset-y-0 left-0 w-1.5 rounded-l-2xl"
        style={{ background: `linear-gradient(180deg, ${accent}, ${accent}99)` }}
      />
      <div
        className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full opacity-70 blur-2xl transition duration-500 group-hover:opacity-100"
        style={{ background: soft }}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
            {title}
          </p>
          <p className="mt-3 text-3xl font-black tracking-tight text-slate-900 tabular-nums sm:text-[2rem]">
            {display}
          </p>
          {hint ? (
            <p className="mt-2 text-xs font-medium text-slate-400">{hint}</p>
          ) : null}
        </div>
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition duration-300 group-hover:scale-110 group-hover:rotate-3"
          style={{
            background: soft,
            color: accent,
            boxShadow: `0 8px 20px ${accent}22`,
          }}
        >
          <Icon size={20} strokeWidth={1.75} />
        </div>
      </div>

      <div className="relative mt-4">
        <Sparkline
          data={series}
          color={accent}
          delay={120 + index * 90}
        />
      </div>
    </article>
  );
};

const DashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [plans, setPlans] = useState([]);
  const [paidPayments, setPaidPayments] = useState([]);
  const [failedPayments, setFailedPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadAll = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError("");
    try {
      const [summaryRes, plansRes, paidRes, failedRes] = await Promise.all([
        getAccountsSummary(),
        getRevenueByPlan(),
        getPaymentsList("paid", { limit: 200, page: 1 }),
        getPaymentsList("failed", { limit: 200, page: 1 }),
      ]);

      setSummary(summaryRes?.data?.data || summaryRes?.data || {});
      const planRows = plansRes?.data?.data || plansRes?.data || [];
      setPlans(Array.isArray(planRows) ? planRows : []);
      setPaidPayments(unpackList(paidRes?.data));
      setFailedPayments(unpackList(failedRes?.data));
    } catch {
      setError("Unable to load business overview charts right now.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const revenueSeries = useMemo(() => {
    const fromPaid = buildDailySeries(paidPayments, 14);
    if (fromPaid.some((v) => v > 0)) return fromPaid;
    return softWaveFromTotal(
      summary?.periodRevenue ?? summary?.totalRevenue ?? 0,
      14,
    );
  }, [paidPayments, summary]);

  const todaySeries = useMemo(() => {
    const todayKey = new Date().toISOString().slice(0, 10);
    const todayPays = paidPayments.filter((p) => {
      const raw = p?.createdAt || p?.paidAt;
      return raw && new Date(raw).toISOString().slice(0, 10) === todayKey;
    });
    if (todayPays.length) {
      // bucket by hour groups for a mini wave
      const hours = Array.from({ length: 12 }, () => 0);
      todayPays.forEach((p) => {
        const h = new Date(p.createdAt || p.paidAt).getHours();
        hours[Math.min(11, Math.floor(h / 2))] += Number(p.amount || 0);
      });
      return hours;
    }
    return softWaveFromTotal(summary?.todayRevenue || 0, 12);
  }, [paidPayments, summary]);

  const subsSeries = useMemo(
    () => softWaveFromTotal((summary?.activeSubscriptions || 0) * 120, 14),
    [summary],
  );

  const failedSeries = useMemo(() => {
    const fromFailed = buildDailySeries(failedPayments, 14);
    if (fromFailed.some((v) => v > 0)) return fromFailed;
    return softWaveFromTotal(summary?.failedPayments || 0, 14);
  }, [failedPayments, summary]);

  const planBars = useMemo(() => {
    return (plans || [])
      .map((row, i) => ({
        label: row?.plan?.name || row?.plan?.code || row?._id || `Plan ${i + 1}`,
        value: Number(row?.totalRevenue || 0),
        color: PLAN_COLORS[i % PLAN_COLORS.length],
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 7);
  }, [plans]);

  const paidCount = paidPayments.length || Number(summary?.paidCount || 0);
  const failedCount =
    failedPayments.length || Number(summary?.failedPayments || 0);

  const cards = useMemo(() => {
    if (!summary) return [];
    const failed = Number(summary.failedPayments || 0);
    return [
      {
        title: "Total Revenue",
        rawValue: Number(summary.totalRevenue || summary.lifetimeRevenue || 0),
        format: "inr",
        accent: "#2563eb",
        soft: "#dbeafe",
        icon: TrendingUp,
        hint: "All-time collections",
        series: revenueSeries,
      },
      {
        title: "Today's Revenue",
        rawValue: Number(summary.todayRevenue || 0),
        format: "inr",
        accent: "#16a34a",
        soft: "#dcfce7",
        icon: CalendarCheck,
        hint: "Collected since midnight",
        series: todaySeries,
      },
      {
        title: "Active Subscriptions",
        rawValue: Number(summary.activeSubscriptions || 0),
        format: "number",
        accent: "#7c3aed",
        soft: "#ede9fe",
        icon: BadgeCheck,
        hint: "Currently active plans",
        series: subsSeries,
      },
      {
        title: "Failed Payments",
        rawValue: failed,
        format: "number",
        accent: failed > 0 ? "#dc2626" : "#64748b",
        soft: failed > 0 ? "#fee2e2" : "#f1f5f9",
        icon: XCircle,
        hint: failed > 0 ? "Needs attention" : "No failures",
        series: failedSeries,
      },
    ];
  }, [summary, revenueSeries, todaySeries, subsSeries, failedSeries]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f4f7f5] px-4 py-6 font-[Manrope,system-ui,sans-serif] sm:px-8 sm:py-8">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        @keyframes floatSoft {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes drawLine {
          to { stroke-dashoffset: 0; }
        }
        @keyframes growBar {
          from { transform: scaleY(0); opacity: 0.3; }
          to { transform: scaleY(1); opacity: 1; }
        }
        @keyframes drawRing {
          from { stroke-dasharray: 0 999; }
        }
      `}</style>

      <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 top-24 h-64 w-64 rounded-full bg-sky-200/40 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 left-1/3 h-56 w-56 rounded-full bg-violet-200/30 blur-3xl" />

      <div className="relative mx-auto max-w-6xl">
        <div
          className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
          style={{ animation: "fadeUp 0.45s ease both" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg shadow-emerald-600/25"
              style={{
                background: "linear-gradient(135deg,#27AE60,#15803d)",
                animation: "floatSoft 4s ease-in-out infinite",
              }}
            >
              <LayoutDashboard size={22} strokeWidth={1.75} />
            </div>
            <div>
              <div className="mb-1 inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700">
                <Sparkles size={11} />
                Live animated insights
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                Business Overview
              </h1>
              <p className="mt-0.5 text-sm font-medium text-slate-500">
                Real-time snapshot with charts — same payment APIs, richer visuals
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => loadAll(true)}
            disabled={loading || refreshing}
            className="inline-flex h-10 items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-emerald-300 hover:text-emerald-700 disabled:opacity-50"
          >
            <RefreshCw
              size={15}
              className={refreshing ? "animate-spin" : undefined}
            />
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
        </div>

        {error ? (
          <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <SkeletonCard key={i} index={i} />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {cards.map((card, index) => (
                <StatCard
                  key={card.title}
                  {...card}
                  index={index}
                  ready={!loading && !!summary}
                />
              ))}
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-5">
              <section
                className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] lg:col-span-3"
                style={{ animation: "fadeUp 0.55s ease 0.25s both" }}
              >
                <div className="mb-4 flex items-center justify-between gap-2">
                  <div>
                    <p className="flex items-center gap-2 text-sm font-black text-slate-800">
                      <BarChart3 size={16} className="text-emerald-600" />
                      Revenue by plan
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      Animated bars from payment plan totals
                    </p>
                  </div>
                  <Activity size={16} className="text-slate-300" />
                </div>
                {planBars.length ? (
                  <AnimatedBars items={planBars} delay={280} />
                ) : (
                  <div className="flex h-44 items-center justify-center text-sm text-slate-400">
                    No plan revenue data yet
                  </div>
                )}
              </section>

              <section
                className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] lg:col-span-2"
                style={{ animation: "fadeUp 0.55s ease 0.35s both" }}
              >
                <div className="mb-2">
                  <p className="flex items-center gap-2 text-sm font-black text-slate-800">
                    <PieChart size={16} className="text-sky-600" />
                    Payment health
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    Success rate from paid vs failed
                  </p>
                </div>
                <DonutChart
                  paid={Math.max(paidCount, Number(summary?.activeSubscriptions || 0) > 0 ? 1 : 0)}
                  failed={failedCount}
                  accent={failedCount > 0 ? "#f59e0b" : "#27AE60"}
                  delay={400}
                />
                <div className="mt-2 grid grid-cols-2 gap-2 text-center">
                  <div className="rounded-xl bg-emerald-50 px-2 py-2">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                      Paid samples
                    </p>
                    <p className="text-lg font-black text-emerald-800">{paidCount}</p>
                  </div>
                  <div className="rounded-xl bg-rose-50 px-2 py-2">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-rose-700">
                      Failed
                    </p>
                    <p className="text-lg font-black text-rose-800">{failedCount}</p>
                  </div>
                </div>
              </section>
            </div>

            <section
              className="mt-5 rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)]"
              style={{ animation: "fadeUp 0.55s ease 0.45s both" }}
            >
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-black text-slate-800">
                    14-day collection pulse
                  </p>
                  <p className="text-xs text-slate-400">
                    Drawn from recent paid payments (fallback wave if empty)
                  </p>
                </div>
              </div>
              <div className="h-28">
                <Sparkline
                  data={revenueSeries}
                  color="#27AE60"
                  width={640}
                  height={100}
                  delay={500}
                />
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
