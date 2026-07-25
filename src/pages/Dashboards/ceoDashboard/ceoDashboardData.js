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

export const formatINR = (value) => `₹${asNumber(value).toLocaleString("en-IN")}`;

export { DATE_PRESETS, rangeFromPreset } from "../shared/dashboardDateRange";

const unpackList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.users)) return payload.users;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.blogs)) return payload.blogs;
  return [];
};

const overviewBucket = (overview = {}) => {
  const active = asNumber(overview.activeProjects ?? overview.activeProperties ?? overview.active);
  const pending = asNumber(overview.pendingProjects ?? overview.pendingProperties ?? overview.pending);
  const draft = asNumber(
    overview.draftProjects ?? overview.draftProperties ?? overview.inactive ?? overview.draft,
  );
  const total =
    asNumber(overview.totalProjects ?? overview.totalProperties ?? overview.total) ||
    active + pending + draft;
  const views = asNumber(overview.totalViews ?? overview.views);
  return { total, active, pending, draft, views };
};

const statusTone = (score) => {
  if (score == null) return { status: "N/A", tone: "slate" };
  if (score >= 80) return { status: "Strong", tone: "emerald" };
  if (score >= 60) return { status: "Stable", tone: "blue" };
  if (score >= 40) return { status: "Watch", tone: "amber" };
  return { status: "Critical", tone: "rose" };
};

const buildPriorities = (ctx) => {
  const items = [];
  if (ctx.failedPayCount > 0) {
    items.push({
      id: "cash",
      rank: 1,
      title: "Protect cash collection",
      why: `${ctx.failedPayCount} failed payments threaten recurring revenue.`,
      owner: "Accounts",
      href: "/payments-list",
      severity: "high",
    });
  }
  if (ctx.overdueTickets > 0) {
    items.push({
      id: "cx",
      rank: 2,
      title: "Clear support SLA risk",
      why: `${ctx.overdueTickets} overdue tickets can damage brand trust.`,
      owner: "Customer Support Head",
      href: "/tickets",
      severity: "high",
    });
  }
  if (ctx.pendingListings > 8) {
    items.push({
      id: "supply",
      rank: 3,
      title: "Unblock listing supply",
      why: `${ctx.pendingListings} properties awaiting approval slow GTM.`,
      owner: "Operations",
      href: "/properties",
      severity: "medium",
    });
  }
  if (ctx.totalLeads > 0 && (ctx.qualifyRate == null || ctx.qualifyRate < 25)) {
    items.push({
      id: "quality",
      rank: 4,
      title: "Improve lead quality",
      why: `Qualify rate at ${ctx.qualifyRate ?? "N/A"}% — acquisition efficiency is weak.`,
      owner: "Marketing Head",
      href: "/leads",
      severity: "medium",
    });
  }
  if (ctx.todayRevenue === 0 && ctx.activeSubs > 0) {
    items.push({
      id: "renewals",
      rank: 5,
      title: "Review renewal engine",
      why: "Active subscriptions but no collections today.",
      owner: "Accounts + Sales",
      href: "/active-subscriptions",
      severity: "medium",
    });
  }
  if (ctx.convertedLeads > 0 && ctx.qualifyRate != null && ctx.qualifyRate >= 30) {
    items.push({
      id: "scale",
      rank: 6,
      title: "Scale winning acquisition",
      why: `${ctx.convertedLeads} conversions with healthy qualification — double down.`,
      owner: "Marketing + BD",
      href: "/leads",
      severity: "opportunity",
    });
  }
  if (!items.length) {
    items.push({
      id: "steady",
      rank: 1,
      title: "Maintain growth cadence",
      why: "No critical blockers — focus on inventory depth and channel mix.",
      owner: "CEO office",
      href: "/",
      severity: "opportunity",
    });
  }
  return items.slice(0, 5).map((item, index) => ({ ...item, rank: index + 1 }));
};

export function mapCeoData({
  currentUser = null,
  summary = {},
  revenueByPlan = [],
  subscriptions = [],
  paidPayments = [],
  failedPayments = [],
  platformAnalytics = {},
  projectsAnalytics = {},
  propertiesAnalytics = {},
  leadSummary = {},
  ticketOverview = {},
  blogsPayload = {},
  usersPayload = [],
  range = {},
}) {
  const totalRevenue = asNumber(summary.totalRevenue);
  const todayRevenue = asNumber(summary.todayRevenue);
  const activeSubs =
    asNumber(summary.activeSubscriptions) || unpackList(subscriptions).length;
  const failedPayCount =
    asNumber(summary.failedPayments) || unpackList(failedPayments).length;

  const paidList = unpackList(paidPayments);
  const failedList = unpackList(failedPayments);
  const paidCount = paidList.length || asNumber(paidPayments?.total);
  const failedCount = failedList.length || failedPayCount;
  const paymentSuccess = pct(paidCount, paidCount + failedCount);

  // Period revenue from paid list
  const fromMs = range?.from ? new Date(`${range.from}T00:00:00`).getTime() : 0;
  const periodPaid = paidList.filter((p) => {
    if (!fromMs) return true;
    const t = safeDate(p.createdAt || p.paidAt)?.getTime();
    return t && t >= fromMs;
  });
  const periodRevenue = periodPaid.reduce((sum, p) => sum + asNumber(p.amount), 0);

  // Daily revenue trend
  const dayMap = {};
  periodPaid.forEach((p) => {
    const d = safeDate(p.createdAt || p.paidAt);
    if (!d) return;
    const key = d.toISOString().slice(0, 10);
    if (!dayMap[key]) dayMap[key] = { date: key.slice(5), revenue: 0, deals: 0 };
    dayMap[key].revenue += asNumber(p.amount);
    dayMap[key].deals += 1;
  });
  const revenueTrend = Object.keys(dayMap)
    .sort()
    .slice(-14)
    .map((k) => dayMap[k]);

  const projectCounts = overviewBucket(projectsAnalytics.overview || projectsAnalytics);
  const propertyCounts = overviewBucket(propertiesAnalytics.overview || propertiesAnalytics);
  if (!propertyCounts.total) {
    propertyCounts.total = asNumber(platformAnalytics.totalProperties);
    propertyCounts.active = asNumber(platformAnalytics.active);
    propertyCounts.pending = asNumber(platformAnalytics.pending);
    propertyCounts.draft = asNumber(platformAnalytics.draft);
    propertyCounts.views = asNumber(platformAnalytics.totalViews);
  }

  const byStatus = leadSummary.byStatus || {};
  const bySource = leadSummary.bySource || {};
  const byCategory = leadSummary.byCategory || {};
  const totalLeads = asNumber(leadSummary.total);
  const newLeads = asNumber(byStatus.new_lead);
  const qualifiedLeads = ["qualified", "site_visit", "negotiation", "sale", "booked"].reduce(
    (sum, key) => sum + asNumber(byStatus[key]),
    0,
  );
  const convertedLeads = ["sale", "booked", "closed"].reduce(
    (sum, key) => sum + asNumber(byStatus[key]),
    0,
  );
  const qualifyRate = pct(qualifiedLeads, totalLeads);
  const convertRate = pct(convertedLeads, totalLeads);

  const dailyTrend = Array.isArray(leadSummary.dailyTrend) ? leadSummary.dailyTrend : [];
  const leadTrend = dailyTrend.slice(-14).map((row) => ({
    date: String(row.date || "").slice(5),
    leads: asNumber(row.leads),
    converted: asNumber(row.converted),
  }));

  const openTickets = asNumber(ticketOverview.open ?? ticketOverview.openTickets);
  const overdueTickets = asNumber(ticketOverview.overdue);
  const unassignedTickets = asNumber(ticketOverview.unassigned);
  const totalTickets = asNumber(ticketOverview.totals ?? ticketOverview.total);

  const blogs = unpackList(blogsPayload);
  const publishedBlogs = blogs.filter((b) => b.published).length;
  const draftBlogs = blogs.filter((b) => !b.published).length;

  const users = unpackList(usersPayload);
  const platformUsers = asNumber(platformAnalytics.users) || users.length;
  const onboardingUsers = users.filter((u) =>
    ["location_pending", "kyc_pending", "pending", "incomplete"].includes(
      String(u.accountStatus || "").toLowerCase(),
    ),
  ).length;
  const usersToday = users.filter((u) => {
    const t = safeDate(u.createdAt)?.getTime();
    return t && t >= startOfTodayMs();
  }).length;

  const planRows = (Array.isArray(revenueByPlan) ? revenueByPlan : unpackList(revenueByPlan))
    .map((row) => ({
      id: String(row._id || row.planId || Math.random()),
      label: row.plan?.name || "Plan",
      revenue: asNumber(row.totalRevenue),
      count: asNumber(row.count),
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const sourceRows = Object.entries(bySource)
    .map(([key, count]) => ({ key, label: titleCase(key), value: asNumber(count) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const categoryRows = Object.entries(byCategory)
    .map(([key, count]) => ({ key, label: titleCase(key), value: asNumber(count) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // Department scorecards
  const financeScore = Math.max(0, Math.min(100, Math.round((paymentSuccess ?? 100) - failedPayCount * 3)));
  const growthScore = Math.round(
    ((qualifyRate ?? 0) * 0.4 + (convertRate ?? 0) * 0.4 + Math.min(totalLeads, 100) * 0.2),
  );
  const supplyScore = propertyCounts.total
    ? Math.round((propertyCounts.active / propertyCounts.total) * 100)
    : null;
  const cxScore =
    totalTickets > 0
      ? Math.max(0, Math.round(100 - (overdueTickets / Math.max(totalTickets, 1)) * 120))
      : 90;
  const brandScore = blogs.length
    ? Math.round((publishedBlogs / blogs.length) * 100)
    : null;
  const peopleScore = users.length
    ? Math.round(100 - (onboardingUsers / users.length) * 50)
    : null;

  const departments = [
    {
      key: "revenue",
      label: "Revenue engine",
      score: financeScore,
      metric: formatINR(periodRevenue || totalRevenue),
      detail: `${activeSubs} subs · pay success ${paymentSuccess ?? "N/A"}%`,
      href: "/accounts-summary",
      ...statusTone(financeScore),
    },
    {
      key: "growth",
      label: "Growth & demand",
      score: growthScore,
      metric: String(totalLeads),
      detail: `Qualify ${qualifyRate ?? "N/A"}% · book ${convertRate ?? "N/A"}%`,
      href: "/leads",
      ...statusTone(growthScore),
    },
    {
      key: "supply",
      label: "Supply & inventory",
      score: supplyScore,
      metric: String(propertyCounts.total),
      detail: `${propertyCounts.active} live · ${projectCounts.active} projects`,
      href: "/properties",
      ...statusTone(supplyScore),
    },
    {
      key: "cx",
      label: "Customer experience",
      score: cxScore,
      metric: String(openTickets),
      detail: `${overdueTickets} overdue · ${unassignedTickets} unassigned`,
      href: "/tickets",
      ...statusTone(cxScore),
    },
    {
      key: "brand",
      label: "Brand & content",
      score: brandScore,
      metric: String(publishedBlogs),
      detail: `${draftBlogs} drafts in pipeline`,
      href: "/blogs",
      ...statusTone(brandScore),
    },
    {
      key: "people",
      label: "Organisation",
      score: peopleScore,
      metric: String(platformUsers),
      detail: `${onboardingUsers} onboarding · ${usersToday} joined today`,
      href: onboardingUsers > 0 ? "/users?filter=onboarding" : "/users?joined=today",
      ...statusTone(peopleScore),
    },
  ];

  const scored = departments.filter((d) => d.score != null).map((d) => d.score);
  const companyScore = scored.length
    ? Math.round(scored.reduce((a, b) => a + b, 0) / scored.length)
    : null;
  const companyHealth = statusTone(companyScore);

  const northStars = [
    {
      key: "company",
      label: "Company health",
      value: companyScore == null ? "N/A" : `${companyScore}`,
      suffix: companyScore == null ? "" : "/100",
      hint: companyHealth.status,
      tone: companyHealth.tone,
    },
    {
      key: "revenue",
      label: "Lifetime revenue",
      value: formatINR(totalRevenue),
      hint: `Period ${formatINR(periodRevenue)}`,
      tone: "emerald",
      href: "/accounts-summary",
    },
    {
      key: "today",
      label: "Today's cash-in",
      value: formatINR(todayRevenue),
      hint: "Same-day collections",
      tone: "blue",
      href: "/payments-list",
    },
    {
      key: "arrish",
      label: "Active subscriptions",
      value: activeSubs,
      hint: "Recurring book",
      tone: "violet",
      href: "/active-subscriptions",
    },
    {
      key: "demand",
      label: "Leads (period)",
      value: totalLeads,
      hint: `${convertedLeads} converted`,
      tone: "amber",
      href: "/leads",
    },
    {
      key: "market",
      label: "Live inventory",
      value: propertyCounts.active,
      hint: `${propertyCounts.total} total listings`,
      tone: "emerald",
      href: "/properties?status=active",
    },
    {
      key: "cx",
      label: "Open tickets",
      value: openTickets,
      hint: `${overdueTickets} SLA risk`,
      tone: "rose",
      href: "/tickets",
    },
    {
      key: "people",
      label: "Platform users",
      value: platformUsers,
      hint: `${usersToday} joined today · ${onboardingUsers} onboarding`,
      tone: "blue",
      href: usersToday > 0 ? "/users?joined=today" : "/users?filter=onboarding",
    },
  ];

  const funnel = [
    { key: "leads", label: "Leads", volume: totalLeads },
    { key: "qualified", label: "Qualified", volume: qualifiedLeads },
    { key: "converted", label: "Booked / sold", volume: convertedLeads },
    { key: "subs", label: "Active subs", volume: activeSubs },
  ].map((stage, index, list) => {
    const prev = index === 0 ? stage.volume : list[index - 1].volume;
    return {
      ...stage,
      conversion: index === 0 ? 100 : pct(stage.volume, prev),
    };
  });

  const risks = [];
  if (failedPayCount > 0) {
    risks.push({
      id: "r1",
      severity: "high",
      title: "Collection leakage",
      impact: `${failedPayCount} failed payments`,
      action: "Mandate daily failed-payment recovery.",
      href: "/payments-list",
    });
  }
  if (overdueTickets > 0) {
    risks.push({
      id: "r2",
      severity: "high",
      title: "CX reputation risk",
      impact: `${overdueTickets} overdue support tickets`,
      action: "Escalate to Support Head with SLA war-room.",
      href: "/tickets",
    });
  }
  if (propertyCounts.pending > 10) {
    risks.push({
      id: "r3",
      severity: "medium",
      title: "Supply bottleneck",
      impact: `${propertyCounts.pending} listings pending`,
      action: "Accelerate listing QA / approvals.",
      href: "/properties",
    });
  }
  if (qualifyRate != null && qualifyRate < 20 && totalLeads > 20) {
    risks.push({
      id: "r4",
      severity: "medium",
      title: "Acquisition inefficiency",
      impact: `Only ${qualifyRate}% of leads qualify`,
      action: "Reallocate spend to high-intent channels.",
      href: "/leads",
    });
  }
  if (companyScore != null && companyScore >= 75) {
    risks.push({
      id: "r5",
      severity: "opportunity",
      title: "Platform ready to scale",
      impact: `Company health ${companyScore}/100`,
      action: "Invest in top cities and winning plans.",
      href: "/projects",
    });
  }

  const priorities = buildPriorities({
    failedPayCount,
    overdueTickets,
    pendingListings: propertyCounts.pending,
    totalLeads,
    qualifyRate,
    todayRevenue,
    activeSubs,
    convertedLeads,
  });

  const brief = {
    headline:
      companyScore == null
        ? "Gathering executive signals…"
        : companyScore >= 75
          ? "Business is in a strong operating position."
          : companyScore >= 55
            ? "Business is stable with clear improvement levers."
            : "Business needs focused executive intervention.",
    narrative: [
      `Revenue book stands at ${formatINR(totalRevenue)} lifetime with ${formatINR(periodRevenue)} in the selected window.`,
      `${totalLeads} leads generated · qualify ${qualifyRate ?? "N/A"}% · convert ${convertRate ?? "N/A"}%.`,
      `Inventory: ${propertyCounts.active}/${propertyCounts.total} listings live across ${projectCounts.active} active projects.`,
      `Support load: ${openTickets} open · ${overdueTickets} overdue. Organisation: ${platformUsers} users · ${onboardingUsers} still onboarding.`,
    ].join(" "),
  };

  return {
    currentUserName: currentUser?.name || currentUser?.fullName || "CEO",
    rangeLabel: range.label || (range.days === 1 ? "Today" : `Last ${range.days || 30} days`),
    refreshedAt: new Date(),
    northStars,
    departments,
    companyScore,
    companyHealth,
    brief,
    funnel,
    revenueTrend,
    leadTrend,
    planRows,
    sourceRows,
    categoryRows,
    risks: risks.slice(0, 6),
    priorities,
    summary: {
      totalRevenue,
      periodRevenue,
      todayRevenue,
      activeSubs,
      failedPayCount,
      paymentSuccess,
      totalLeads,
      newLeads,
      qualifiedLeads,
      convertedLeads,
      qualifyRate,
      convertRate,
      openTickets,
      overdueTickets,
      propertyCounts,
      projectCounts,
      platformUsers,
      onboardingUsers,
      usersToday,
      publishedBlogs,
      draftBlogs,
    },
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
