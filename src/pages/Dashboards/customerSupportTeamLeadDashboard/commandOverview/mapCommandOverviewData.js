const fmt = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const REPORT_STORAGE_KEY = "tl-command-overview-report";

export const readLastHeadReport = () => {
  try {
    const raw = sessionStorage.getItem(REPORT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const writeLastHeadReport = (payload) => {
  try {
    sessionStorage.setItem(REPORT_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* ignore quota */
  }
};

/**
 * Map existing TL + Client Progress payloads into Command Overview UI model.
 * No invented operational numbers — only derived from live hooks.
 */
export function mapCommandOverviewData({
  summary = {},
  journey = {},
  byExecutive = [],
  teamMembers = [],
  inventory = {},
  performanceWeek = [],
  lastReport = null,
} = {}) {
  const spark = (Array.isArray(performanceWeek) ? performanceWeek : []).map((d) =>
    fmt(d.resolved),
  );

  const staffPerformance = (Array.isArray(byExecutive) ? byExecutive : []).map((row) => {
    const member = (teamMembers || []).find((m) => String(m.id) === String(row.id)) || {};
    const assigned = fmt(row.assigned);
    const inProgress = fmt(row.inProgress);
    const completed = fmt(row.completed);
    const totalCases = assigned + inProgress + completed;
    const stuckCases = fmt(member.overdue);
    return {
      id: String(row.id),
      name: row.name || member.name || "CCE",
      email: row.email || member.email || "",
      assigned,
      inProgress,
      completed,
      totalCases,
      averageResponseMinutes: fmt(summary.firstResponseMinutes),
      stuckCases,
      openTickets: fmt(member.open),
      isOnline: Boolean(member.isOnline),
      trend: spark.length ? spark : [0, 0, 0, 0, 0, 0, totalCases],
    };
  });

  const location = fmt(journey.stuckLocation);
  const kyc = fmt(journey.stuckKyc) + fmt(journey.kycRejected);
  const inventoryOpen =
    fmt(inventory?.properties?.assigned) +
    fmt(inventory?.properties?.inProgress) +
    fmt(inventory?.projects?.assigned) +
    fmt(inventory?.projects?.inProgress);
  const journeyTotal = location + kyc + inventoryOpen;
  /** Always show all 3 stages so TL can see clear (0) vs needs attention. */
  const journeyMix = [
    {
      key: "location",
      label: "Location stuck",
      shortLabel: "Location",
      value: location,
      percentage: journeyTotal ? Math.round((location / journeyTotal) * 100) : 0,
      track: "stuck_location",
      meaning: "Users waiting on address / territory step",
      okWhenZero: true,
    },
    {
      key: "kyc",
      label: "KYC stuck",
      shortLabel: "KYC",
      value: kyc,
      percentage: journeyTotal ? Math.round((kyc / journeyTotal) * 100) : 0,
      track: "stuck_kyc",
      meaning: "Users pending or rejected on KYC",
      okWhenZero: true,
    },
    {
      key: "inventory",
      label: "Inventory open",
      shortLabel: "Inventory",
      value: inventoryOpen,
      percentage: journeyTotal ? Math.round((inventoryOpen / journeyTotal) * 100) : 0,
      track: "property_pending",
      meaning: "Property / project listings awaiting CCE work",
      okWhenZero: true,
    },
  ];

  const overloaded = staffPerformance.filter(
    (s) => s.assigned + s.inProgress >= 3 || s.openTickets >= 5 || s.stuckCases >= 2,
  ).length;
  const blockers = fmt(summary.unassignedCount) + fmt(summary.overdueCount);
  const territoryGaps = location;
  const topStuckCases = fmt(summary.overdueCount) + fmt(journey.stuckLocation) + fmt(journey.stuckKyc);
  const staffLoadAlerts = overloaded;

  const reportItems = [
    {
      id: "blockers",
      label: "Blockers",
      description: "Open issues preventing progress",
      count: blockers,
      available: blockers > 0,
      hrefKind: "tickets_unassigned",
    },
    {
      id: "territory",
      label: "Territory gaps",
      description: "Zones with low coverage or delays",
      count: territoryGaps,
      available: territoryGaps > 0,
      hrefKind: "stuck_location",
    },
    {
      id: "stuck",
      label: "Top stuck cases",
      description: "Cases stuck beyond SLA threshold",
      count: topStuckCases,
      available: topStuckCases > 0,
      hrefKind: "tickets_overdue",
    },
    {
      id: "load",
      label: "Staff load alert",
      description: "High load or imbalance detected",
      count: staffLoadAlerts,
      available: staffLoadAlerts > 0,
      hrefKind: "directory",
    },
  ];

  const actionable = reportItems.filter((i) => i.available).length;
  const submittedRecently = Boolean(lastReport?.submittedAt);
  const pendingHeadReports = submittedRecently ? 0 : actionable;

  let workflowStage = "staff_action";
  if (actionable > 0) workflowStage = "team_lead_review";
  if (submittedRecently) workflowStage = "head_inbox";

  return {
    summary: {
      assigned: fmt(journey.assigned),
      inProgress: fmt(journey.inProgress),
      completed: fmt(journey.completed),
      slaRisk: fmt(summary.overdueCount),
      activeCCE: fmt(
        staffPerformance.filter((s) => s.isOnline).length ||
          summary.teamOnline ||
          staffPerformance.length,
      ),
      pendingHeadReports,
      unassignedTickets: fmt(summary.unassignedCount),
      firstResponseMinutes: fmt(summary.firstResponseMinutes),
      avgResolutionMinutes: fmt(summary.avgResolutionMinutes),
      teamSize: fmt(summary.teamSize),
      teamOnline: fmt(summary.teamOnline),
    },
    spark,
    staffPerformance,
    journeyMix,
    journeyTotal,
    reportPack: {
      items: reportItems,
      lastSubmittedAt: lastReport?.submittedAt || null,
      submittedBy: lastReport?.submittedBy || null,
      status: submittedRecently ? "submitted" : actionable > 0 ? "pending" : "draft",
      reportTextReady: true,
    },
    workflow: { currentStage: workflowStage },
  };
}

export function buildHeadReportText({
  overview,
  rangeLabel,
  leadName,
}) {
  const s = overview?.summary || {};
  const staff = overview?.staffPerformance || [];
  const pack = overview?.reportPack || {};
  return [
    "Customer Support Team Lead → Support Head report",
    `From: ${leadName || "Team Lead"}`,
    `Period: ${rangeLabel || "selected period"}`,
    `Generated: ${new Date().toLocaleString("en-IN")}`,
    "",
    "— Command Overview —",
    `Assigned: ${s.assigned}`,
    `In progress: ${s.inProgress}`,
    `Completed: ${s.completed}`,
    `SLA risk: ${s.slaRisk}`,
    `Active CCE: ${s.activeCCE}`,
    `Unassigned tickets: ${s.unassignedTickets}`,
    "",
    "— Report pack —",
    ...(pack.items || []).map(
      (i) => `${i.label}: ${i.count}${i.available ? "" : " (none)"}`,
    ),
    "",
    "— Staff —",
    ...staff.map(
      (r) =>
        `${r.name}: A${r.assigned} P${r.inProgress} D${r.completed} stuck:${r.stuckCases} tickets:${r.openTickets}`,
    ),
  ].join("\n");
}
