/**
 * Team Lead Client Progress report (additive).
 * Uses user-service follow-up ownership + property/project analytics only.
 * Does not touch ticket-service.
 */

import {
  followUpTrackHref,
  inventoryPeriodHref,
} from "../superAdminDashboard/superAdminDashboardData";

const asNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const PLATFORM_ROLES = new Set([
  "user",
  "users",
  "owner",
  "buyer",
  "tenant",
  "propenu_user",
  "agent",
  "agents",
  "builder",
  "builders",
  "builder_staff",
  "builderstaff",
  "builder_staffs",
]);

const ONBOARDING = new Set([
  "location_pending",
  "kyc_pending",
  "kyc_rejected",
  "pending",
  "incomplete",
]);

const normalizeRole = (value = "") =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_");

const roleOf = (user = {}) =>
  normalizeRole(
    user?.roleName || user?.role || user?.roleId?.name || user?.roleId?.label || "",
  );

const isPlatformUser = (user) => PLATFORM_ROLES.has(roleOf(user));

const isCceMember = (member) => {
  const key = normalizeRole(member?.roleName || member?.roleKey || member?.role || "");
  return (
    key.includes("customer_care") ||
    key === "customer_care" ||
    key === "customer_care_executive" ||
    key === "customer_care_executives"
  );
};

const accountStatusOf = (user) => String(user?.accountStatus || "").toLowerCase();

const assigneeIdOf = (user) => {
  const raw = user?.followUpAssignedTo;
  return String(raw?._id || raw || "").trim();
};

/** CCE process status (manual). Defaults to assigned when case has an owner. */
const workStatusOf = (user) => {
  const key = String(user?.followUpWorkStatus || "")
    .trim()
    .toLowerCase();
  if (key === "in_progress" || key === "completed" || key === "assigned") return key;
  return assigneeIdOf(user) ? "assigned" : "";
};

const inCreatedPeriod = (value, range = {}) => {
  if (!range?.from && !range?.to) return true;
  if (!value) return false;
  const ms = new Date(value).getTime();
  if (!Number.isFinite(ms)) return false;
  if (range.from && ms < new Date(`${range.from}T00:00:00`).getTime()) return false;
  if (range.to && ms > new Date(`${range.to}T23:59:59.999`).getTime()) return false;
  return true;
};

/** Case counts for a period: created, assigned, or work-updated in range. */
const inActivityPeriod = (user, range = {}) => {
  if (!range?.from && !range?.to) return true;
  return (
    inCreatedPeriod(user?.createdAt, range) ||
    inCreatedPeriod(user?.followUpAssignedAt, range) ||
    inCreatedPeriod(user?.followUpWorkUpdatedAt, range) ||
    inCreatedPeriod(user?.updatedAt, range)
  );
};

const unpackList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.users)) return payload.users;
  return [];
};

const overviewBucket = (overview = {}) => {
  const pending =
    Number(
      overview.pendingProjects ?? overview.pendingProperties ?? overview.pending ?? 0,
    ) || 0;
  const active =
    Number(overview.activeProjects ?? overview.activeProperties ?? overview.active ?? 0) ||
    0;
  const draft =
    Number(
      overview.draftProjects ??
        overview.draftProperties ??
        overview.inactive ??
        overview.draft ??
        0,
    ) || 0;
  const rejected =
    Number(
      overview.rejectedProjects ?? overview.rejectedProperties ?? overview.rejected ?? 0,
    ) || 0;
  const total =
    Number(overview.total || 0) || active + pending + draft + rejected;
  return { total, active, pending, draft, rejected };
};

const statusWiseCount = (statusWise, key) => {
  if (!Array.isArray(statusWise)) return 0;
  const row = statusWise.find(
    (item) => String(item?._id || item?.status || "").toLowerCase() === key,
  );
  return Number(row?.count || 0) || 0;
};

const pct = (part, whole) => {
  if (!whole) return null;
  return Math.round((part / whole) * 1000) / 10;
};

/**
 * Build TL Client Progress buckets from existing user + inventory payloads.
 */
export function mapTlClientProgressReport({
  usersPayload = [],
  teamMembersPayload = [],
  propertiesAnalytics = {},
  projectsAnalytics = {},
  range = {},
} = {}) {
  const usersAll = unpackList(usersPayload).filter(isPlatformUser);
  const inPeriod = usersAll.filter((u) => inActivityPeriod(u, range));

  const incomplete = inPeriod.filter((u) => ONBOARDING.has(accountStatusOf(u)));
  const withAssignee = inPeriod.filter((u) => Boolean(assigneeIdOf(u)));
  const unassigned = incomplete.filter((u) => !assigneeIdOf(u));

  /** CCE process buckets (dropdown) — Team Lead checks what CCE is doing. */
  const processAssigned = withAssignee.filter((u) => workStatusOf(u) === "assigned");
  const processInProgress = withAssignee.filter((u) => workStatusOf(u) === "in_progress");
  const processCompleted = withAssignee.filter((u) => workStatusOf(u) === "completed");

  /** Journey stage (system) — still useful context. */
  const assignedProcess = incomplete.filter((u) =>
    ["location_pending", "pending", "incomplete"].includes(accountStatusOf(u)),
  );
  const journeyInProgress = incomplete.filter((u) =>
    ["kyc_pending", "kyc_rejected"].includes(accountStatusOf(u)),
  );
  const journeyCompleted = inPeriod.filter((u) => accountStatusOf(u) === "active");

  const stuckLocation = assignedProcess.filter(
    (u) => accountStatusOf(u) === "location_pending",
  ).length;
  const stuckKyc = journeyInProgress.filter((u) => accountStatusOf(u) === "kyc_pending").length;
  const kycRejected = journeyInProgress.filter(
    (u) => accountStatusOf(u) === "kyc_rejected",
  ).length;

  const teamMembers = unpackList(teamMembersPayload);
  const cceMembers = teamMembers.filter(isCceMember);

  const byExecutive = cceMembers
    .map((member) => {
      const id = String(member?._id || member?.id || "").trim();
      if (!id) return null;
      const owned = inPeriod.filter((u) => assigneeIdOf(u) === id);
      const ownedAssigned = owned.filter((u) => workStatusOf(u) === "assigned");
      const ownedInProgress = owned.filter((u) => workStatusOf(u) === "in_progress");
      const ownedCompleted = owned.filter((u) => workStatusOf(u) === "completed");
      return {
        id,
        name: member?.name || member?.email || "CCE",
        email: member?.email || "",
        assigned: ownedAssigned.length,
        assignedProcess: ownedAssigned.length,
        inProgress: ownedInProgress.length,
        completed: ownedCompleted.length,
        completionRate: pct(
          ownedCompleted.length,
          ownedAssigned.length + ownedInProgress.length + ownedCompleted.length,
        ),
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.assigned - a.assigned || b.inProgress - a.inProgress);

  const propertyCounts = overviewBucket(
    propertiesAnalytics.overview || propertiesAnalytics,
  );
  if (!propertyCounts.rejected) {
    propertyCounts.rejected = statusWiseCount(propertiesAnalytics.statusWise, "rejected");
  }

  const projectCounts = overviewBucket(projectsAnalytics.overview || projectsAnalytics);
  if (!projectCounts.rejected) {
    projectCounts.rejected = statusWiseCount(projectsAnalytics.statusWise, "rejected");
  }

  const inventory = {
    properties: {
      assigned: propertyCounts.pending,
      inProgress: propertyCounts.draft,
      completed: propertyCounts.active,
      rejected: propertyCounts.rejected,
      hrefAssigned: followUpTrackHref("property_pending", range),
      hrefInProgress: followUpTrackHref("property_draft", range),
      hrefCompleted: followUpTrackHref("property_active", range),
      listAssigned: inventoryPeriodHref("/properties", range, { status: "pending" }),
      listCompleted: inventoryPeriodHref("/properties", range, { status: "active" }),
    },
    projects: {
      assigned: projectCounts.pending,
      inProgress: projectCounts.draft,
      completed: projectCounts.active,
      rejected: projectCounts.rejected,
      hrefAssigned: followUpTrackHref("project_pending", range),
      hrefInProgress: followUpTrackHref("project_draft", range),
      hrefCompleted: followUpTrackHref("project_active", range),
      listAssigned: inventoryPeriodHref("/projects", range, { status: "pending" }),
      listCompleted: inventoryPeriodHref("/projects", range, { status: "active" }),
    },
  };

  const journeyHref = {
    assigned: followUpTrackHref("process_assigned", range),
    inProgress: followUpTrackHref("process_in_progress", range),
    stuckLocation: followUpTrackHref("stuck_location", range),
    stuckKyc: followUpTrackHref("stuck_kyc", range),
    completed: followUpTrackHref("process_completed", range),
    all: followUpTrackHref("onboarding_all", range),
  };

  const openCases = processAssigned.length + processInProgress.length;
  const completionRate = pct(
    processCompleted.length,
    openCases + processCompleted.length,
  );

  return {
    journey: {
      assigned: processAssigned.length,
      assignedProcess: assignedProcess.length,
      inProgress: processInProgress.length,
      completed: processCompleted.length,
      unassigned: unassigned.length,
      stuckLocation,
      stuckKyc,
      kycRejected,
      completionRate,
      journeyActive: journeyCompleted.length,
      href: journeyHref,
    },
    inventory,
    byExecutive,
    cceCount: cceMembers.length,
  };
}

export { asNumber, isCceMember };
