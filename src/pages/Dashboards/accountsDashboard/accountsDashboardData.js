import {
  DATE_PRESETS as SHARED_DATE_PRESETS,
  inDateRange,
  rangeFromPreset,
} from "../shared/dashboardDateRange";

const asNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const titleCase = (value = "") =>
  String(value || "")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const safeDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const pct = (part, whole) => {
  if (!whole) return null;
  return Math.round((part / whole) * 1000) / 10;
};

const startOfTodayMs = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

const daysAgoMs = (days) => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - days);
  return d.getTime();
};

export const formatINR = (value) => {
  const amount = asNumber(value);
  return `₹${amount.toLocaleString("en-IN")}`;
};

/** Shared presets + All time (Accounts historically supported it). */
export const DATE_PRESETS = [
  ...SHARED_DATE_PRESETS.filter((item) => item.key !== "custom"),
  { key: "all", label: "All time" },
  { key: "custom", label: "Custom" },
];

export { rangeFromPreset, inDateRange };

const unpackList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.payments)) return payload.payments;
  if (Array.isArray(payload?.subscriptions)) return payload.subscriptions;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
};

const paymentUserLabel = (payment) =>
  payment?.userId?.name ||
  payment?.user?.name ||
  payment?.customerName ||
  payment?.email ||
  "Customer";

const planLabel = (row) =>
  row?.plan?.name ||
  row?.planId?.name ||
  row?.planName ||
  (row?._id ? `Plan ${String(row._id).slice(-6)}` : "Unknown plan");

const buildAlerts = ({
  failedCount,
  failedAmount,
  todayRevenue,
  activeSubs,
  expiredSoon,
  planRows,
  successRate,
}) => {
  const alerts = [];

  if (failedCount > 0) {
    alerts.push({
      id: "failed-payments",
      severity: "high",
      title: `${failedCount} failed payment${failedCount > 1 ? "s" : ""}`,
      impact: `${formatINR(failedAmount)} at risk of collection loss.`,
      action: "Retry failed charges and contact customers with overdue dues.",
    });
  }

  if (successRate != null && successRate < 85) {
    alerts.push({
      id: "low-success",
      severity: "medium",
      title: "Payment success rate below target",
      impact: `Only ${successRate}% of recent payment attempts succeeded.`,
      action: "Review gateway errors and card/UPI failure reasons.",
    });
  }

  if (todayRevenue === 0 && activeSubs > 0) {
    alerts.push({
      id: "no-today-revenue",
      severity: "medium",
      title: "No revenue collected today",
      impact: `${activeSubs} active subscriptions but ₹0 collected so far today.`,
      action: "Check renewal schedule and pending payment queue.",
    });
  }

  if (expiredSoon.length) {
    alerts.push({
      id: "expiring-subs",
      severity: "medium",
      title: "Subscriptions nearing expiry",
      impact: `${expiredSoon.length} active plan(s) end within 7 days.`,
      action: `Start with ${expiredSoon[0].name} — confirm renewal.`,
    });
  }

  const topPlan = planRows[0];
  if (topPlan && topPlan.share != null && topPlan.share >= 60) {
    alerts.push({
      id: "plan-concentration",
      severity: "low",
      title: `Revenue concentrated in ${topPlan.label}`,
      impact: `${topPlan.share}% of paid revenue comes from one plan.`,
      action: "Promote mid-tier plans to diversify subscription mix.",
    });
  }

  if (topPlan && topPlan.totalRevenue > 0) {
    alerts.push({
      id: "top-plan",
      severity: "opportunity",
      title: `Top earner: ${topPlan.label}`,
      impact: `${formatINR(topPlan.totalRevenue)} across ${topPlan.count} payments.`,
      action: "Protect this plan’s pricing and upsell add-ons around it.",
    });
  }

  if (!activeSubs && !failedCount) {
    alerts.push({
      id: "empty-books",
      severity: "low",
      title: "No active subscriptions yet",
      impact: "Accounts pipeline is idle.",
      action: "Coordinate with sales on builder/agent plan onboarding.",
    });
  }

  return alerts.slice(0, 6);
};

export function mapAccountsData({
  summary = {},
  paidPayments = [],
  failedPayments = [],
  subscriptions = [],
  history = [],
  revenueByPlan = [],
  currentUser = null,
  range = {},
  apiFiltered = false,
}) {
  const paidAll = unpackList(paidPayments);
  const failedAll = unpackList(failedPayments);
  const subsAll = unpackList(subscriptions);
  const historyAll = unpackList(history);
  const planAgg = Array.isArray(revenueByPlan) ? revenueByPlan : unpackList(revenueByPlan);

  // Prefer API-scoped lists when date filters were sent; otherwise client-filter.
  const paid = apiFiltered
    ? paidAll
    : paidAll.filter((p) => inDateRange(p.createdAt || p.paidAt, range));
  const failed = apiFiltered
    ? failedAll
    : failedAll.filter((p) => inDateRange(p.createdAt, range));

  const totalRevenue = asNumber(summary.totalRevenue);
  const todayRevenue = asNumber(summary.todayRevenue);
  const activeSubscriptions = asNumber(summary.activeSubscriptions);
  const failedPaymentsCount = asNumber(summary.failedPayments) || failedAll.length;

  const periodRevenue = paid.reduce((sum, p) => sum + asNumber(p.amount), 0);
  const periodFailedAmount = failed.reduce((sum, p) => sum + asNumber(p.amount), 0);
  const periodAttempts = paid.length + failed.length;
  const successRate = pct(paid.length, periodAttempts);
  const avgTicket = paid.length ? Math.round(periodRevenue / paid.length) : null;

  const paidToday = paidAll.filter((p) => {
    const t = safeDate(p.createdAt || p.paidAt)?.getTime();
    return t && t >= startOfTodayMs();
  });

  // Daily revenue trend from paid payments (last 14 calendar days in scope)
  const dayMap = {};
  paid.forEach((p) => {
    const d = safeDate(p.createdAt || p.paidAt);
    if (!d) return;
    const key = d.toISOString().slice(0, 10);
    if (!dayMap[key]) dayMap[key] = { date: key.slice(5), revenue: 0, count: 0 };
    dayMap[key].revenue += asNumber(p.amount);
    dayMap[key].count += 1;
  });
  const trendRows = Object.keys(dayMap)
    .sort()
    .slice(-14)
    .map((key) => dayMap[key]);

  // User type mix
  const typeMap = {};
  paid.forEach((p) => {
    const key = String(p.userType || p.role || "other").toLowerCase();
    if (!typeMap[key]) typeMap[key] = { key, label: titleCase(key), revenue: 0, count: 0 };
    typeMap[key].revenue += asNumber(p.amount);
    typeMap[key].count += 1;
  });
  const typeRows = Object.values(typeMap).sort((a, b) => b.revenue - a.revenue);

  const planTotal = planAgg.reduce((sum, row) => sum + asNumber(row.totalRevenue), 0);
  const planRows = planAgg
    .map((row) => {
      const revenue = asNumber(row.totalRevenue);
      return {
        id: String(row._id || row.planId || planLabel(row)),
        label: planLabel(row),
        totalRevenue: revenue,
        count: asNumber(row.count),
        share: pct(revenue, planTotal || totalRevenue),
        tier: row.plan?.tier || row.planId?.tier || "",
        price: asNumber(row.plan?.price || row.planId?.price),
      };
    })
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 8);

  const recentPayments = [...paidAll, ...failedAll]
    .sort(
      (a, b) =>
        (safeDate(b.createdAt)?.getTime() || 0) - (safeDate(a.createdAt)?.getTime() || 0),
    )
    .slice(0, 12)
    .map((p) => ({
      id: p._id || p.id,
      customer: paymentUserLabel(p),
      plan: p.planId?.name || p.plan?.name || "—",
      amount: asNumber(p.amount),
      status: String(p.status || "unknown").toLowerCase(),
      userType: titleCase(p.userType || "—"),
      createdAt: p.createdAt,
    }));

  const activeSubsList = subsAll.filter(
    (s) => String(s.status || "").toLowerCase() === "active",
  );

  const expiredSoon = activeSubsList
    .filter((s) => {
      const end = safeDate(s.endDate || s.expiresAt || s.validTill)?.getTime();
      if (!end) return false;
      const in7 = daysAgoMs(-7); // 7 days from now — wait, daysAgoMs(-7) adds 7 days
      return end >= Date.now() && end <= in7;
    })
    .map((s) => ({
      id: s._id || s.id,
      name: s.userId?.name || s.user?.name || "Subscriber",
      endDate: s.endDate || s.expiresAt || s.validTill,
    }));

  // Fix expired soon: daysAgoMs(-7) = today + 7 days if we subtract negative... 
  // daysAgoMs(days) does setDate(getDate() - days), so daysAgoMs(-7) = today + 7. Good.

  const subRows = activeSubsList.slice(0, 8).map((s) => ({
    id: s._id || s.id,
    customer: s.userId?.name || s.user?.name || "Subscriber",
    plan: s.planId?.name || s.planName || s.plan?.name || "—",
    status: String(s.status || "active").toLowerCase(),
    amount: asNumber(s.amount || s.price || s.planId?.price),
    startDate: s.startDate || s.createdAt,
    endDate: s.endDate || s.expiresAt || s.validTill,
  }));

  const historyRows = historyAll.slice(0, 8).map((h) => ({
    id: h._id || h.id,
    customer: h.userId?.name || "Customer",
    plan: h.planName || h.planId?.name || "—",
    amount: asNumber(h.amount || h.price),
    purchasedAt: h.purchasedAt || h.createdAt,
    status: String(h.status || "completed").toLowerCase(),
  }));

  const revenueBridge = [
    { key: "gross", label: "Period paid", value: periodRevenue },
    { key: "failed", label: "Failed attempts", value: periodFailedAmount },
    { key: "today", label: "Today collected", value: todayRevenue },
    { key: "lifetime", label: "Lifetime revenue", value: totalRevenue },
  ];

  const alerts = buildAlerts({
    failedCount: failedPaymentsCount,
    failedAmount: periodFailedAmount || failedAll.reduce((s, p) => s + asNumber(p.amount), 0),
    todayRevenue,
    activeSubs: activeSubscriptions,
    expiredSoon,
    planRows,
    successRate,
  });

  const kpis = [
    {
      key: "lifetime",
      label: "Lifetime revenue",
      value: formatINR(totalRevenue),
      hint: "All successful payments",
      tone: "emerald",
    },
    {
      key: "period",
      label: "Period revenue",
      value: formatINR(periodRevenue),
      hint: "Paid in selected window",
      tone: "blue",
    },
    {
      key: "today",
      label: "Today's revenue",
      value: formatINR(todayRevenue),
      hint: `${paidToday.length} payments today`,
      tone: "violet",
    },
    {
      key: "subs",
      label: "Active subscriptions",
      value: activeSubscriptions,
      hint: "Currently billed accounts",
      tone: "emerald",
    },
    {
      key: "failed",
      label: "Failed payments",
      value: failedPaymentsCount,
      hint: "Needs collection follow-up",
      tone: "rose",
    },
    {
      key: "success",
      label: "Success rate",
      value: successRate == null ? "N/A" : `${successRate}%`,
      hint: "Paid ÷ payment attempts in period",
      tone: "amber",
    },
    {
      key: "avg",
      label: "Avg ticket",
      value: avgTicket == null ? "N/A" : formatINR(avgTicket),
      hint: "Average paid amount",
      tone: "blue",
    },
    {
      key: "plans",
      label: "Revenue plans",
      value: planRows.length,
      hint: "Plans contributing revenue",
      tone: "violet",
    },
  ];

  return {
    currentUserName: currentUser?.name || currentUser?.fullName || "Accounts",
    rangeLabel: range.label || "Selected period",
    refreshedAt: new Date(),
    kpis,
    summary: {
      totalRevenue,
      todayRevenue,
      periodRevenue,
      activeSubscriptions,
      failedPayments: failedPaymentsCount,
      successRate,
      avgTicket,
      paidCount: paid.length,
      failedCount: failed.length,
      paidTodayCount: paidToday.length,
    },
    trendRows,
    typeRows,
    planRows,
    recentPayments,
    subRows,
    historyRows,
    revenueBridge,
    alerts,
    expiredSoon,
  };
}

export const formatRelativeClock = (value) => {
  const date = safeDate(value);
  if (!date) return "Just now";
  const minutes = Math.round((Date.now() - date.getTime()) / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
};

export { titleCase, asNumber, pct };
