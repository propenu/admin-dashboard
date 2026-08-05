const fmt = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const normalizeRole = (value = "") =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_");

const isTeamLeadRole = (role = "") => {
  const key = normalizeRole(role);
  return (
    key === "team_lead" ||
    key === "team_leads" ||
    key === "customer_support_team_lead" ||
    key === "customer_support_team_leads" ||
    (key.includes("team_lead") && !key.includes("head"))
  );
};

const isCceRole = (role = "") => {
  const key = normalizeRole(role);
  return key.includes("customer_care");
};

const REPORT_STORAGE_KEY = "csh-command-overview-ops-report";

export const readLastOpsReport = () => {
  try {
    const raw = sessionStorage.getItem(REPORT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const writeLastOpsReport = (payload) => {
  try {
    sessionStorage.setItem(REPORT_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* ignore */
  }
};

/**
 * Map Head ticket + client-progress payloads into Command Overview UI model.
 * Grain = Team Lead pods (above CCE), department-wide.
 */
export function mapCshCommandOverviewData({
  summary = {},
  journey = {},
  byExecutive = [],
  teamMembers = [],
  inventory = {},
  performanceWeek = [],
  lastOpsReport = null,
} = {}) {
  const spark = (Array.isArray(performanceWeek) ? performanceWeek : []).map((d) =>
    fmt(d.resolved),
  );

  const members = Array.isArray(teamMembers) ? teamMembers : [];
  const teamLeads = members.filter((m) => isTeamLeadRole(m.roleKey || m.role));
  const cces = members.filter((m) => isCceRole(m.roleKey || m.role));
  const execById = new Map(
    (Array.isArray(byExecutive) ? byExecutive : []).map((row) => [String(row.id), row]),
  );

  const unboundCces = cces.filter((c) => !c.managerId);
  const singleTlFallback = teamLeads.length === 1;

  const tlPods = teamLeads
    .map((tl) => {
      const linkedCces = cces.filter((c) => String(c.managerId || "") === String(tl.id));
      // Only share unbound CCEs when there is exactly one Team Lead (avoid double-count).
      const podCces = linkedCces.length
        ? linkedCces
        : singleTlFallback
          ? unboundCces
          : [];

      let assigned = 0;
      let inProgress = 0;
      let completed = 0;
      let stuckCases = fmt(tl.overdue);
      let openTickets = fmt(tl.open);

      podCces.forEach((cce) => {
        const row = execById.get(String(cce.id));
        if (row) {
          assigned += fmt(row.assigned);
          inProgress += fmt(row.inProgress);
          completed += fmt(row.completed);
        }
        stuckCases += fmt(cce.overdue);
        openTickets += fmt(cce.open);
      });

      const memberIds = [String(tl.id), ...podCces.map((c) => String(c.id))];
      const totalCases = assigned + inProgress + completed;
      return {
        id: String(tl.id),
        name: tl.name || "Team Lead",
        email: tl.email || "",
        role: tl.role || "Team Lead",
        assigned,
        inProgress,
        completed,
        totalCases,
        stuckCases,
        openTickets,
        cceCount: podCces.length,
        memberIds,
        cceIds: podCces.map((c) => String(c.id)),
        isOnline: Boolean(tl.isOnline),
        averageResponseMinutes: fmt(summary.firstResponseMinutes),
        trend: spark.length ? spark : [0, 0, 0, 0, 0, 0, totalCases],
      };
    })
    .sort((a, b) => b.openTickets - a.openTickets || b.totalCases - a.totalCases);

  // If no TL rows but CCEs exist, show department CCE rollup as one pod
  if (!tlPods.length && cces.length) {
    let assigned = 0;
    let inProgress = 0;
    let completed = 0;
    cces.forEach((cce) => {
      const row = execById.get(String(cce.id));
      if (row) {
        assigned += fmt(row.assigned);
        inProgress += fmt(row.inProgress);
        completed += fmt(row.completed);
      }
    });
    tlPods.push({
      id: "department",
      name: "All Care Executives",
      email: "",
      role: "Department",
      assigned,
      inProgress,
      completed,
      totalCases: assigned + inProgress + completed,
      stuckCases: cces.reduce((s, c) => s + fmt(c.overdue), 0),
      openTickets: cces.reduce((s, c) => s + fmt(c.open), 0),
      cceCount: cces.length,
      memberIds: cces.map((c) => String(c.id)),
      cceIds: cces.map((c) => String(c.id)),
      isOnline: cces.some((c) => c.isOnline),
      averageResponseMinutes: fmt(summary.firstResponseMinutes),
      trend: spark.length ? spark : [0, 0, 0, 0, 0, 0, 0],
    });
  }

  const location = fmt(journey.stuckLocation);
  const kyc = fmt(journey.stuckKyc) + fmt(journey.kycRejected);
  const inventoryOpen =
    fmt(inventory?.properties?.assigned) +
    fmt(inventory?.properties?.inProgress) +
    fmt(inventory?.projects?.assigned) +
    fmt(inventory?.projects?.inProgress);
  const journeyTotal = location + kyc + inventoryOpen;
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
      meaning: "Property / project listings awaiting care work",
      okWhenZero: true,
    },
  ];

  const blockers = fmt(summary.unassignedCount) + fmt(summary.overdueCount);
  const overloadedPods = tlPods.filter(
    (p) => p.openTickets >= 8 || p.stuckCases >= 3 || p.assigned + p.inProgress >= 10,
  ).length;

  const leadershipItems = [
    {
      id: "unassigned",
      label: "Unassigned tickets",
      description: "Need Team Lead / CCE assignment",
      count: fmt(summary.unassignedCount),
      available: fmt(summary.unassignedCount) > 0,
      hrefKind: "tickets_unassigned",
    },
    {
      id: "sla",
      label: "SLA risk",
      description: "Past-due tickets across department",
      count: fmt(summary.overdueCount),
      available: fmt(summary.overdueCount) > 0,
      hrefKind: "tickets_overdue",
    },
    {
      id: "journey",
      label: "Journey stuck",
      description: "Location + KYC blockers in period",
      count: location + kyc,
      available: location + kyc > 0,
      hrefKind: "stuck_location",
    },
    {
      id: "pods",
      label: "TL pod load alert",
      description: "Team Lead pods with high open load",
      count: overloadedPods,
      available: overloadedPods > 0,
      hrefKind: "directory",
    },
  ];

  const actionable = leadershipItems.filter((i) => i.available).length;
  const submittedRecently = Boolean(lastOpsReport?.submittedAt);

  let workflowStage = "tl_review";
  if (actionable > 0) workflowStage = "head_action";
  if (submittedRecently) workflowStage = "ops_inbox";

  return {
    summary: {
      openTickets: fmt(summary.openTickets),
      unassignedTickets: fmt(summary.unassignedCount),
      slaRisk: fmt(summary.overdueCount),
      assigned: fmt(journey.assigned),
      inProgress: fmt(journey.inProgress),
      completed: fmt(journey.completed),
      activeTeamLeads: fmt(teamLeads.filter((t) => t.isOnline).length || teamLeads.length),
      teamSize: fmt(summary.teamSize),
      teamOnline: fmt(summary.teamOnline),
      firstResponseMinutes: fmt(summary.firstResponseMinutes),
      pendingOpsReports: submittedRecently ? 0 : actionable,
      blockers,
    },
    spark,
    tlPods,
    journeyMix,
    journeyTotal,
    leadershipPack: {
      items: leadershipItems,
      lastSubmittedAt: lastOpsReport?.submittedAt || null,
      submittedBy: lastOpsReport?.submittedBy || null,
      status: submittedRecently ? "submitted" : actionable > 0 ? "pending" : "clear",
      reportTextReady: true,
    },
    workflow: { currentStage: workflowStage },
    directory: {
      teamLeads,
      cces,
      all: members,
    },
  };
}

export function buildOpsReportText({ overview, rangeLabel, headName }) {
  const s = overview?.summary || {};
  const pods = overview?.tlPods || [];
  const pack = overview?.leadershipPack || {};
  return [
    "Customer Support Head → Operations report",
    `From: ${headName || "Support Head"}`,
    `Period: ${rangeLabel || "selected period"}`,
    `Generated: ${new Date().toLocaleString("en-IN")}`,
    "",
    "— Department overview —",
    `Open tickets: ${s.openTickets}`,
    `Unassigned: ${s.unassignedTickets}`,
    `SLA risk: ${s.slaRisk}`,
    `Client process A/P/D: ${s.assigned}/${s.inProgress}/${s.completed}`,
    `Active Team Leads: ${s.activeTeamLeads}`,
    "",
    "— Leadership focus —",
    ...(pack.items || []).map(
      (i) => `${i.label}: ${i.count}${i.available ? "" : " (none)"}`,
    ),
    "",
    "— Team Lead pods —",
    ...pods.map(
      (p) =>
        `${p.name}: A${p.assigned} P${p.inProgress} D${p.completed} tickets:${p.openTickets} stuck:${p.stuckCases} CCEs:${p.cceCount}`,
    ),
  ].join("\n");
}
