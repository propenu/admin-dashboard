import { DATE_PRESETS, rangeFromPreset } from "../shared/dashboardDateRange";

export { DATE_PRESETS, rangeFromPreset };

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

const FUNNEL_ORDER = [
  "new_lead",
  "contacted",
  "follow_up",
  "qualified",
  "site_visit",
  "negotiation",
  "sale",
  "booked",
  "closed",
];

const QUALIFIED_STATUSES = new Set([
  "qualified",
  "site_visit",
  "negotiation",
  "sale",
  "booked",
  "closed",
  "hot",
]);

const CONVERTED_STATUSES = new Set(["sale", "booked", "closed"]);

const unpackList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.campaigns)) return payload.campaigns;
  if (Array.isArray(payload?.logs)) return payload.logs;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
};

const pct = (part, whole) => {
  if (!whole) return null;
  return Math.round((part / whole) * 1000) / 10;
};

const safeDiv = (num, den) => {
  if (!den) return null;
  return Math.round((num / den) * 100) / 100;
};

const overviewBucket = (overview = {}) => {
  const active =
    asNumber(overview.activeProjects ?? overview.activeProperties ?? overview.active);
  const pending =
    asNumber(overview.pendingProjects ?? overview.pendingProperties ?? overview.pending);
  const draft = asNumber(
    overview.draftProjects ??
      overview.draftProperties ??
      overview.inactiveProjects ??
      overview.inactiveProperties ??
      overview.draft,
  );
  const total =
    asNumber(overview.totalProjects ?? overview.totalProperties ?? overview.total) ||
    active + pending + draft;
  return { total, active, pending, draft };
};

const mapCampaignRows = (emailCampaigns = [], whatsappStats = {}) => {
  const rows = unpackList(emailCampaigns).map((item, index) => {
    const sent = asNumber(item.sent || item.sentCount || item.totalSent || item.delivered);
    const opened = asNumber(item.opened || item.openCount || item.opens);
    const clicked = asNumber(item.clicked || item.clickCount || item.clicks);
    const failed = asNumber(item.failed || item.failedCount || item.bounces);
    const leads = asNumber(item.leads || item.leadCount || clicked);
    const status = String(item.status || item.state || (item.isRunning ? "active" : "completed")).toLowerCase();
    return {
      id: item._id || item.campaignId || item.id || `email-${index}`,
      name: item.campaignName || item.name || item.subject || `Email campaign ${index + 1}`,
      channel: "Email",
      status,
      sent,
      opened,
      clicked,
      failed,
      leads,
      openRate: pct(opened, sent),
      clickRate: pct(clicked, sent),
      startDate: item.createdAt || item.startedAt || item.startDate || null,
    };
  });

  const waSent = asNumber(whatsappStats.sent || whatsappStats.totalSent || whatsappStats.total);
  const waDelivered = asNumber(whatsappStats.delivered || whatsappStats.success);
  const waFailed = asNumber(whatsappStats.failed);
  if (waSent > 0 || waDelivered > 0) {
    rows.unshift({
      id: "whatsapp-aggregate",
      name: "WhatsApp outreach",
      channel: "WhatsApp",
      status: "active",
      sent: waSent || waDelivered,
      opened: waDelivered,
      clicked: asNumber(whatsappStats.replies || whatsappStats.clicked),
      failed: waFailed,
      leads: asNumber(whatsappStats.leads || whatsappStats.replies),
      openRate: pct(waDelivered, waSent || waDelivered),
      clickRate: pct(asNumber(whatsappStats.replies), waSent || waDelivered),
      startDate: null,
    });
  }

  return rows.slice(0, 12);
};

const mapFunnel = (byStatus = {}) => {
  const known = FUNNEL_ORDER.filter((key) => asNumber(byStatus[key]) > 0);
  const extras = Object.keys(byStatus)
    .filter((key) => !FUNNEL_ORDER.includes(key) && asNumber(byStatus[key]) > 0)
    .sort((a, b) => asNumber(byStatus[b]) - asNumber(byStatus[a]));

  const stages = [...known, ...extras].map((key, index, list) => {
    const volume = asNumber(byStatus[key]);
    const prev = index === 0 ? volume : asNumber(byStatus[list[index - 1]]);
    const next = index < list.length - 1 ? asNumber(byStatus[list[index + 1]]) : null;
    return {
      key,
      label: titleCase(key),
      volume,
      conversionFromPrev: index === 0 ? 100 : pct(volume, prev),
      dropOff: index === 0 ? 0 : Math.max(0, prev - volume),
      dropOffPct: index === 0 ? 0 : pct(Math.max(0, prev - volume), prev),
      nextVolume: next,
    };
  });

  return stages;
};

const mapChannelRows = (bySource = {}, totalLeads = 0) =>
  Object.entries(bySource)
    .map(([source, count]) => {
      const leads = asNumber(count);
      return {
        key: source,
        label: titleCase(source || "Unknown"),
        leads,
        share: pct(leads, totalLeads),
      };
    })
    .sort((a, b) => b.leads - a.leads);

const mapCategoryRows = (byCategory = {}, totalLeads = 0) =>
  Object.entries(byCategory)
    .map(([category, count]) => {
      const leads = asNumber(count);
      return {
        key: category,
        label: titleCase(category || "Other"),
        leads,
        share: pct(leads, totalLeads),
      };
    })
    .sort((a, b) => b.leads - a.leads);

const mapDailyTrend = (dailyTrend = []) =>
  (Array.isArray(dailyTrend) ? dailyTrend : [])
    .slice(-14)
    .map((row) => ({
      date: String(row.date || "").slice(5),
      leads: asNumber(row.leads),
      converted: asNumber(row.converted),
    }));

const buildAlerts = ({
  totalLeads,
  qualifiedLeads,
  convertedLeads,
  channelRows,
  campaignRows,
  projectCounts,
  propertyCounts,
  qualificationRate,
}) => {
  const alerts = [];

  if (totalLeads === 0) {
    alerts.push({
      id: "no-leads",
      severity: "high",
      title: "No leads in selected period",
      impact: "Acquisition pipeline is empty for this window.",
      action: "Review active campaigns and landing pages.",
    });
  }

  if (totalLeads > 0 && qualificationRate != null && qualificationRate < 20) {
    alerts.push({
      id: "low-quality",
      severity: "high",
      title: "Low lead qualification rate",
      impact: `Only ${qualificationRate}% of leads are advancing past inquiry.`,
      action: "Tighten targeting and review form sources.",
    });
  }

  if (totalLeads > 10 && convertedLeads === 0) {
    alerts.push({
      id: "no-conversion",
      severity: "medium",
      title: "Leads generated but no bookings",
      impact: "Funnel is stalling after acquisition.",
      action: "Align with sales on follow-up SLA and site-visit handoff.",
    });
  }

  const topChannel = channelRows[0];
  if (topChannel && topChannel.share != null && topChannel.share >= 60) {
    alerts.push({
      id: "channel-concentration",
      severity: "medium",
      title: `Heavy reliance on ${topChannel.label}`,
      impact: `${topChannel.share}% of leads come from one source.`,
      action: "Diversify paid and organic channels to reduce risk.",
    });
  }

  const weakCampaign = campaignRows.find(
    (row) => row.sent >= 50 && (row.clickRate == null || row.clickRate < 2),
  );
  if (weakCampaign) {
    alerts.push({
      id: "weak-campaign",
      severity: "medium",
      title: `${weakCampaign.name} underperforming`,
      impact: "Low click engagement on a sizable send.",
      action: "Refresh creative or pause and reallocate budget.",
    });
  }

  if (projectCounts.active > 0 && propertyCounts.total === 0) {
    alerts.push({
      id: "inventory-gap",
      severity: "low",
      title: "Projects live with thin listing support",
      impact: "Demand traffic may bounce without matching inventory.",
      action: "Push property onboarding for active project campaigns.",
    });
  }

  if (qualifiedLeads > 0 && convertedLeads > 0) {
    alerts.push({
      id: "scale-winners",
      severity: "opportunity",
      title: "Conversion path is active",
      impact: `${convertedLeads} converted from ${qualifiedLeads} qualified leads.`,
      action: "Scale top channels and duplicate winning creatives.",
    });
  }

  return alerts.slice(0, 6);
};

const buildLeadFlow = (channelRows = [], byStatus = {}, byCategory = {}) => {
  const channels = channelRows.slice(0, 4);
  const midStatuses = ["new_lead", "contacted", "qualified", "site_visit"].filter(
    (key) => asNumber(byStatus[key]) > 0,
  );
  const outcomes = ["sale", "booked", "closed", "negotiation"].filter(
    (key) => asNumber(byStatus[key]) > 0,
  );
  const categories = Object.entries(byCategory)
    .sort((a, b) => asNumber(b[1]) - asNumber(a[1]))
    .slice(0, 4)
    .map(([key, count]) => ({ key, label: titleCase(key), volume: asNumber(count) }));

  return {
    channels: channels.map((c) => ({ key: c.key, label: c.label, volume: c.leads })),
    stages: midStatuses.map((key) => ({
      key,
      label: titleCase(key),
      volume: asNumber(byStatus[key]),
    })),
    categories,
    outcomes: outcomes.map((key) => ({
      key,
      label: titleCase(key),
      volume: asNumber(byStatus[key]),
    })),
  };
};

export function mapMarketingHeadData({
  leadSummary = {},
  projectsAnalytics = {},
  propertiesAnalytics = {},
  emailCampaigns = [],
  whatsappStats = {},
  runningCampaigns = [],
  currentUser = null,
  range = {},
}) {
  const byStatus = leadSummary.byStatus || {};
  const bySource = leadSummary.bySource || {};
  const byCategory = leadSummary.byCategory || {};
  const dailyTrend = leadSummary.dailyTrend || [];

  const totalLeads = asNumber(leadSummary.total);
  const qualifiedLeads = Object.entries(byStatus).reduce((sum, [status, count]) => {
    if (QUALIFIED_STATUSES.has(String(status).toLowerCase())) return sum + asNumber(count);
    return sum;
  }, 0);
  const convertedLeads = Object.entries(byStatus).reduce((sum, [status, count]) => {
    if (CONVERTED_STATUSES.has(String(status).toLowerCase())) return sum + asNumber(count);
    return sum;
  }, 0);
  const newLeads = asNumber(byStatus.new_lead);

  const projectCounts = overviewBucket(projectsAnalytics.overview || projectsAnalytics);
  const propertyCounts = overviewBucket(propertiesAnalytics.overview || propertiesAnalytics);

  const campaignRows = mapCampaignRows(emailCampaigns, whatsappStats);
  const runningCount =
    unpackList(runningCampaigns).length ||
    campaignRows.filter((row) => ["active", "running", "scheduled"].includes(row.status)).length;

  const channelRows = mapChannelRows(bySource, totalLeads);
  const categoryRows = mapCategoryRows(byCategory, totalLeads);
  const funnelStages = mapFunnel(byStatus);
  const trendRows = mapDailyTrend(dailyTrend);

  const qualificationRate = pct(qualifiedLeads, totalLeads);
  const conversionRate = pct(convertedLeads, totalLeads);
  const leadToQualified = qualificationRate;
  const qualifiedToBooking = pct(convertedLeads, qualifiedLeads || 0);

  const totalCampaignSends = campaignRows.reduce((sum, row) => sum + asNumber(row.sent), 0);
  const totalCampaignClicks = campaignRows.reduce((sum, row) => sum + asNumber(row.clicked), 0);

  const kpis = [
    {
      key: "leads",
      label: "Leads generated",
      value: totalLeads,
      hint: "All inquiries in selected period",
      tone: "emerald",
    },
    {
      key: "new",
      label: "New leads",
      value: newLeads,
      hint: "Still in new_lead status",
      tone: "blue",
    },
    {
      key: "qualified",
      label: "Qualified leads",
      value: qualifiedLeads,
      hint: "Advanced past inquiry",
      tone: "violet",
    },
    {
      key: "converted",
      label: "Bookings / sales",
      value: convertedLeads,
      hint: "Sale, booked, or closed",
      tone: "emerald",
    },
    {
      key: "qualifyRate",
      label: "Qualify rate",
      value: leadToQualified == null ? "N/A" : `${leadToQualified}%`,
      hint: "Qualified ÷ total leads",
      tone: "amber",
    },
    {
      key: "convertRate",
      label: "Lead → booking",
      value: conversionRate == null ? "N/A" : `${conversionRate}%`,
      hint: "Converted ÷ total leads",
      tone: "rose",
    },
    {
      key: "campaigns",
      label: "Active campaigns",
      value: runningCount,
      hint: "Email / WhatsApp running",
      tone: "blue",
    },
    {
      key: "inventory",
      label: "Active projects",
      value: projectCounts.active,
      hint: `${propertyCounts.total} listings in market`,
      tone: "violet",
    },
  ];

  const alerts = buildAlerts({
    totalLeads,
    qualifiedLeads,
    convertedLeads,
    channelRows,
    campaignRows,
    projectCounts,
    propertyCounts,
    qualificationRate,
  });

  const leadFlow = buildLeadFlow(channelRows, byStatus, byCategory);

  const topProjects = (Array.isArray(projectsAnalytics.statusWise)
    ? projectsAnalytics.statusWise
    : []
  )
    .slice(0, 6)
    .map((row) => ({
      label: titleCase(row._id || row.status || "Status"),
      value: asNumber(row.total || row.count),
    }));

  return {
    currentUserName: currentUser?.name || currentUser?.fullName || "Marketing Head",
    rangeLabel: range.label || (range.from && range.to ? `${range.from} → ${range.to}` : "Selected period"),
    refreshedAt: new Date(),
    kpis,
    summary: {
      totalLeads,
      newLeads,
      qualifiedLeads,
      convertedLeads,
      qualificationRate,
      conversionRate,
      qualifiedToBooking,
      totalCampaignSends,
      totalCampaignClicks,
      campaignCtr: pct(totalCampaignClicks, totalCampaignSends),
      runningCount,
      projectCounts,
      propertyCounts,
    },
    funnelStages,
    channelRows,
    categoryRows,
    campaignRows,
    trendRows,
    alerts,
    leadFlow,
    topProjects,
    recentLeads: [],
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

export { titleCase, asNumber, safeDiv, pct };
