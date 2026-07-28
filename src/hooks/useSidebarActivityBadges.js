import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { getAllProjectsAnalytics, getAllPropertiesAnalytics } from "../features/property/propertyService";
import { getTicketDashboardOverview } from "../features/ticket/ticket_system";
import { getAllUsers, getUserDetails } from "../features/user/userService";
import { apiClient } from "../api/apiClient";
import {
  SIDEBAR_ACK_EVENT,
  SIDEBAR_ACTIVITY_PATHS,
  SIDEBAR_REFRESH_EVENT,
  emptySidebarCounts,
  getSidebarUserKey,
  inventoryOnboardingCount,
  isCreatedToday,
  isOnboardingStatus,
  markSidebarPathSeen,
  overviewToStatusBucket,
  publishSidebarCounts,
  readSidebarSeen,
  roleBucket,
  statusBucketFromRows,
  todayKey,
  unreadFromSnapshot,
} from "../utils/sidebarActivity";

const emptyAccountBucket = () => ({
  total: 0,
  active: 0,
  pending: 0,
  inactive: 0,
  login: 0,
  onboarding: 0,
});

const sumAccountBuckets = (...buckets) =>
  buckets.reduce(
    (acc, bucket) => ({
      total: acc.total + Number(bucket?.total || 0),
      active: acc.active + Number(bucket?.active || 0),
      pending: acc.pending + Number(bucket?.pending || 0),
      inactive: acc.inactive + Number(bucket?.inactive || 0),
      login: acc.login + Number(bucket?.login || 0),
      onboarding: acc.onboarding + Number(bucket?.onboarding || 0),
    }),
    emptyAccountBucket(),
  );

const REFRESH_MS = 45_000;

const GLOBAL_SCOPE_ROLES = new Set(["super_admin", "admin", "business_development_head"]);

/** Region-wide inventory badges (state only — city/locality was hiding CC creates). */
const STATE_SCOPE_ROLES = new Set([
  "regional_manager",
  "operations_head",
  "operation_head",
  "ceo",
  "founder",
]);

/** Leadership / heads: sidebar ticket badge = all tickets created today. */
const TICKET_ALL_NOTIFICATION_ROLES = new Set([
  "super_admin",
  "admin",
  "ceo",
  "founder",
  "operations_head",
  "operation_head",
  "customer_support_head",
  "customer_care_head",
]);

const normalizeRole = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const getUserId = (user) => String(user?._id || user?.id || user?.userId || "").trim();

const canView = (permissions, module) => {
  if (!Array.isArray(permissions)) return false;
  if (permissions.includes("*")) return true;
  return permissions.map((p) => String(p).toLowerCase()).includes(`${module}:view`);
};

const hasAnyView = (permissions, modules) => modules.some((m) => canView(permissions, m));

const unpackAnalytics = (response) => response?.data?.data || response?.data || {};

const unpackUsers = (response) => {
  const payload = response?.data;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.users)) return payload.users;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const unpackMe = (response) => response?.data?.user || response?.data || null;

/** Location filters for regional / field roles; global admins stay unscoped. */
const buildUserScopeParams = (user) => {
  const role = normalizeRole(user?.roleName || user?.role);
  if (GLOBAL_SCOPE_ROLES.has(role)) return {};
  const params = {};
  if (user?.state) params.state = user.state;
  // Regional / ops leaders see whole state (CC may create in another city).
  if (STATE_SCOPE_ROLES.has(role)) return params;
  if (user?.city) params.city = user.city;
  if (user?.locality) params.locality = user.locality;
  return params;
};

/**
 * Sidebar ticket badge scope:
 * - Super Admin / Admin / CEO / Operations Head / Customer Care Head → all tickets today
 * - Everyone else → only tickets assigned to the logged-in user
 */
const buildTicketScopeParams = (user) => {
  const role = normalizeRole(user?.roleName || user?.role);
  if (TICKET_ALL_NOTIFICATION_ROLES.has(role)) return {};

  const userId = getUserId(user);
  // Fail closed: never show department-wide counts for personal roles.
  if (!userId) return { assignedTo: "__none__" };
  return { assignedTo: userId };
};

const normalizeInventoryBucket = (bucket = {}, options = {}) => {
  const inactive = Number(bucket.inactive || 0);
  const onboarding = inventoryOnboardingCount(bucket, options);
  return {
    total: Number(bucket.total || 0),
    active: Number(bucket.active || 0),
    pending: Number(bucket.pending || 0),
    inactive,
    login: Number(bucket.login || 0),
    onboarding,
  };
};

const buildBadge = (unread, extras = {}) => {
  const { kind, ...rest } = extras;
  const total = Number(unread.total || 0);
  const onboarding = inventoryOnboardingCount(unread, kind ? { kind } : {});
  const login = Number(unread.login || 0);
  if (total <= 0 && onboarding <= 0 && login <= 0) {
    return {
      primary: 0,
      active: 0,
      pending: 0,
      inactive: 0,
      login: 0,
      onboarding: 0,
      ...rest,
    };
  }
  return {
    primary: kind === "properties" ? Number(unread.pending || onboarding || 0) : Math.max(total, onboarding),
    active: Number(unread.active || 0),
    pending: Number(unread.pending || 0),
    inactive: Number(unread.inactive || 0),
    login,
    onboarding: kind === "properties" ? Number(unread.pending || 0) : onboarding,
    ...rest,
  };
};

const pathForLocation = (pathname = "") => {
  const exact = Object.values(SIDEBAR_ACTIVITY_PATHS).find((p) => p === pathname);
  if (exact) return exact;
  // nested ticket/lead routes still clear the parent badge
  if (pathname.startsWith("/tickets")) return SIDEBAR_ACTIVITY_PATHS.tickets;
  if (pathname.startsWith("/leads")) return SIDEBAR_ACTIVITY_PATHS.leads;
  if (pathname.startsWith("/projects")) return SIDEBAR_ACTIVITY_PATHS.projects;
  if (pathname.startsWith("/properties")) return SIDEBAR_ACTIVITY_PATHS.properties;
  if (pathname.startsWith("/builder-staff")) return SIDEBAR_ACTIVITY_PATHS.builderStaff;
  if (pathname.startsWith("/owners")) return SIDEBAR_ACTIVITY_PATHS.owners;
  if (pathname.startsWith("/builders")) return SIDEBAR_ACTIVITY_PATHS.builders;
  if (pathname.startsWith("/all-agents")) return SIDEBAR_ACTIVITY_PATHS.agents;
  if (pathname.startsWith("/users")) return SIDEBAR_ACTIVITY_PATHS.users;
  if (pathname.startsWith("/propenu-team-members")) return SIDEBAR_ACTIVITY_PATHS.teamDirectory;
  return null;
};

/** Fill today's create/login bucket from a user list. */
const countCreatedToday = (users = []) => {
  const bucket = emptyAccountBucket();
  (Array.isArray(users) ? users : []).forEach((u) => {
    if (!isCreatedToday(u?.createdAt)) return;
    const onboarding = isOnboardingStatus(u.accountStatus);
    bucket.total += 1;
    if (u.isActive === false || String(u.accountStatus || "").toLowerCase() === "inactive") {
      bucket.inactive += 1;
    } else if (onboarding) {
      bucket.pending += 1;
      bucket.onboarding += 1;
    } else {
      bucket.active += 1;
    }
    if (isCreatedToday(u.lastLoginAt)) bucket.login += 1;
  });
  return bucket;
};

async function collectRawSnapshots(user) {
  const permissions = user?.permissions || [];
  const isSuper = normalizeRole(user?.roleName || user?.role) === "super_admin";
  const allow = (module) => isSuper || canView(permissions, module);
  const allowProperty =
    isSuper || hasAnyView(permissions, ["residential", "commercial", "land", "agricultural"]);

  const today = todayKey();
  const locationScope = buildUserScopeParams(user);
  const ticketScope = buildTicketScopeParams(user);
  const tasks = [];
  const raw = {
    projects: { total: 0, active: 0, pending: 0, inactive: 0 },
    properties: { total: 0, active: 0, pending: 0, inactive: 0 },
    leads: { total: 0, active: 0, pending: 0, inactive: 0 },
    tickets: { total: 0, active: 0, pending: 0, inactive: 0 },
    users: emptyAccountBucket(),
    owners: emptyAccountBucket(),
    builders: emptyAccountBucket(),
    agents: emptyAccountBucket(),
    builderStaff: emptyAccountBucket(),
    teamDirectory: emptyAccountBucket(),
  };

  if (allow("project")) {
    tasks.push(
      getAllProjectsAnalytics({ from: today, to: today, ...locationScope })
        .then((res) => {
          const data = unpackAnalytics(res);
          const fromStatus = statusBucketFromRows(data.statusWise);
          const fromOverview = overviewToStatusBucket(data.overview || {});
          // Prefer richer status breakdown; always keep onboarding (= draft/inactive)
          const base = fromStatus.total > 0 ? fromStatus : fromOverview;
          raw.projects = normalizeInventoryBucket({
            ...base,
            onboarding: Math.max(
              Number(base.onboarding || 0),
              Number(base.inactive || 0),
              Number(fromOverview.onboarding || 0),
            ),
          });
        })
        .catch(() => {}),
    );
  }

  if (allowProperty) {
    tasks.push(
      getAllPropertiesAnalytics({ from: today, to: today, ...locationScope })
        .then((res) => {
          const data = unpackAnalytics(res);
          const fromStatus = statusBucketFromRows(data.statusWise);
          const fromOverview = overviewToStatusBucket(data.overview || {});
          const base = fromStatus.total > 0 ? fromStatus : fromOverview;
          raw.properties = normalizeInventoryBucket(
            {
              ...base,
              pending: Number(base.pending || fromOverview.pending || 0),
            },
            { kind: "properties" },
          );
        })
        .catch(() => {}),
    );
  }

  if (allow("lead")) {
    tasks.push(
      apiClient
        .get("/api/properties/leads/admin/overview", {
          params: { page: 1, limit: 100, from: today, to: today, ...locationScope },
        })
        .then((res) => {
          const summary = res?.data?.data?.summary || res?.data?.summary || {};
          const byStatus = summary.byStatus || {};
          const total = Number(summary.total || 0);
          const pending = Number(byStatus.new_lead || byStatus.pending || 0);
          const active = Number(byStatus.qualified || byStatus.contacted || 0);
          const inactive = Math.max(0, total - pending - active);
          raw.leads = { total, active, pending, inactive };
        })
        .catch(() => {}),
    );
  }

  if (allow("ticket")) {
    tasks.push(
      getTicketDashboardOverview({
        from: `${today}T00:00:00.000Z`,
        to: `${today}T23:59:59.999Z`,
        ...ticketScope,
      })
        .then((data) => {
          const total = Number(data?.totals || 0);
          const byStatus = Array.isArray(data?.byStatus) ? data.byStatus : [];
          let pending = 0;
          let active = 0;
          let inactive = 0;
          byStatus.forEach((row) => {
            const key = String(row?._id || "").toLowerCase();
            const n = Number(row?.count || 0);
            if (["open", "assigned", "reopened"].includes(key)) pending += n;
            else if (
              ["in_progress", "under_review", "awaiting_user_response", "escalated"].includes(key)
            ) {
              active += n;
            } else if (["resolved", "closed"].includes(key)) inactive += n;
          });
          raw.tickets = { total, active, pending, inactive };
        })
        .catch(() => {}),
    );
  }

  // Propenu.com marketplace accounts (user / agent / builder / builder_staff) → Users sidebar
  const needMarketplaceUsers =
    allow("user") || allow("builder") || allow("builder_staff") || allow("agent") || isSuper;
  if (needMarketplaceUsers) {
    tasks.push(
      getAllUsers()
        .then((res) => {
          const users = unpackUsers(res);
          const buckets = {
            owners: emptyAccountBucket(),
            builders: emptyAccountBucket(),
            agents: emptyAccountBucket(),
            builderStaff: emptyAccountBucket(),
          };

          users.forEach((u) => {
            const roleLabel =
              u.roleName ||
              (typeof u.role === "string" ? u.role : u.role?.name) ||
              "";
            const bucket = roleBucket(roleLabel);
            // Marketplace roles only — staff never inflate Users badges
            if (!bucket || !buckets[bucket]) return;
            if (!isCreatedToday(u.createdAt)) return;

            const target = buckets[bucket];
            const onboarding = isOnboardingStatus(u.accountStatus);
            target.total += 1;
            if (u.isActive === false || String(u.accountStatus || "").toLowerCase() === "inactive") {
              target.inactive += 1;
            } else if (onboarding) {
              target.pending += 1;
              target.onboarding += 1;
            } else {
              target.active += 1;
            }
            if (isCreatedToday(u.lastLoginAt)) target.login += 1;
          });

          raw.owners = buckets.owners;
          raw.builders = buckets.builders;
          raw.agents = buckets.agents;
          raw.builderStaff = buckets.builderStaff;
          raw.users = sumAccountBuckets(
            buckets.owners,
            buckets.builders,
            buckets.agents,
            buckets.builderStaff,
          );
        })
        .catch(() => {}),
    );
  }

  // Admin-dashboard credential creates (staff) → Team Directory sidebar (separate)
  const needStaffUsers = isSuper || allow("team") || allow("user");
  if (needStaffUsers) {
    tasks.push(
      getAllUsers({ scope: "team_directory" })
        .then((res) => {
          raw.teamDirectory = countCreatedToday(unpackUsers(res));
        })
        .catch(() => {}),
    );
  }

  await Promise.all(tasks);
  return raw;
}

function toPublishedCounts(raw, seenMap, caps, user) {
  const unreadProjects = unreadFromSnapshot(raw.projects, SIDEBAR_ACTIVITY_PATHS.projects, seenMap);
  const unreadProperties = unreadFromSnapshot(
    raw.properties,
    SIDEBAR_ACTIVITY_PATHS.properties,
    seenMap,
  );
  const unreadLeads = unreadFromSnapshot(raw.leads, SIDEBAR_ACTIVITY_PATHS.leads, seenMap);
  const unreadTickets = unreadFromSnapshot(raw.tickets, SIDEBAR_ACTIVITY_PATHS.tickets, seenMap);
  const unreadUsers = unreadFromSnapshot(raw.users, SIDEBAR_ACTIVITY_PATHS.users, seenMap);
  const unreadOwners = unreadFromSnapshot(raw.owners, SIDEBAR_ACTIVITY_PATHS.owners, seenMap);
  const unreadBuilders = unreadFromSnapshot(raw.builders, SIDEBAR_ACTIVITY_PATHS.builders, seenMap);
  const unreadAgents = unreadFromSnapshot(raw.agents, SIDEBAR_ACTIVITY_PATHS.agents, seenMap);
  const unreadBuilderStaff = unreadFromSnapshot(
    raw.builderStaff,
    SIDEBAR_ACTIVITY_PATHS.builderStaff,
    seenMap,
  );
  const unreadTeamDirectory = unreadFromSnapshot(
    raw.teamDirectory,
    SIDEBAR_ACTIVITY_PATHS.teamDirectory,
    seenMap,
  );

  const projects = caps.projects ? buildBadge(unreadProjects) : buildBadge({ total: 0 });
  const properties = caps.properties
    ? buildBadge(unreadProperties, { kind: "properties" })
    : buildBadge({ total: 0 });
  const leads = caps.leads ? buildBadge(unreadLeads) : buildBadge({ total: 0 });
  const tickets = caps.tickets ? buildBadge(unreadTickets) : buildBadge({ total: 0 });
  const users = caps.users ? buildBadge(unreadUsers) : buildBadge({ total: 0 });
  const owners = caps.owners ? buildBadge(unreadOwners) : buildBadge({ total: 0 });
  const builders = caps.builders ? buildBadge(unreadBuilders) : buildBadge({ total: 0 });
  const agents = caps.agents ? buildBadge(unreadAgents) : buildBadge({ total: 0 });
  const builderStaff = caps.builderStaff
    ? buildBadge(unreadBuilderStaff)
    : buildBadge({ total: 0 });
  const teamDirectory = caps.teamDirectory
    ? buildBadge(unreadTeamDirectory)
    : buildBadge({ total: 0 });

  // Group total = marketplace individuals only (staff stays on Team Directory)
  const usersGroupPrimary =
    Number(owners.primary || 0) +
    Number(builders.primary || 0) +
    Number(agents.primary || 0) +
    Number(builderStaff.primary || 0);

  return {
    ready: true,
    userKey: getSidebarUserKey(user),
    // keep legacy keys used by older sidebar badge code
    projectsToday: projects.primary,
    activeProjects: projects.active,
    propertiesToday: properties.primary,
    ticketsToday: tickets.primary,
    leadsToday: leads.primary,
    usersToday: users.primary,
    ownersToday: owners.primary,
    buildersToday: builders.primary,
    agentsToday: agents.primary,
    builderStaffToday: builderStaff.primary,
    teamDirectoryToday: teamDirectory.primary,
    usersGroupToday: usersGroupPrimary,
    byPath: {
      [SIDEBAR_ACTIVITY_PATHS.projects]: projects,
      [SIDEBAR_ACTIVITY_PATHS.properties]: properties,
      [SIDEBAR_ACTIVITY_PATHS.leads]: leads,
      [SIDEBAR_ACTIVITY_PATHS.tickets]: tickets,
      [SIDEBAR_ACTIVITY_PATHS.users]: users,
      [SIDEBAR_ACTIVITY_PATHS.owners]: owners,
      [SIDEBAR_ACTIVITY_PATHS.builders]: builders,
      [SIDEBAR_ACTIVITY_PATHS.agents]: agents,
      [SIDEBAR_ACTIVITY_PATHS.builderStaff]: builderStaff,
      [SIDEBAR_ACTIVITY_PATHS.teamDirectory]: teamDirectory,
    },
    raw,
    day: todayKey(),
  };
}

/**
 * Permission + user-scope sidebar "new today" badges.
 * Starts empty; publishes only after /auth/me and scoped count APIs resolve.
 * Clears when a path is opened; reappears only for activity after that open (same day).
 */
export function useSidebarActivityBadges() {
  const location = useLocation();
  const userRef = useRef(null);
  const rawRef = useRef(null);
  const capsRef = useRef({});
  const busyRef = useRef(false);
  const pendingAckPathRef = useRef(pathForLocation(location.pathname));
  const lastAckedPathRef = useRef("");

  const acknowledgePath = (path, raw, user) => {
    if (!path || !raw || !user) return readSidebarSeen(getSidebarUserKey(user));
    const snapshotKey = pathKeyFromRoute(path);
    const snapshot = raw[snapshotKey];
    if (!snapshot) return readSidebarSeen(getSidebarUserKey(user));
    const userKey = getSidebarUserKey(user);
    lastAckedPathRef.current = path;
    return markSidebarPathSeen(userKey, path, snapshot);
  };

  useEffect(() => {
    let active = true;

    // Never flash stale localStorage counts from another session/user
    publishSidebarCounts(emptySidebarCounts({ ready: false }));

    const refresh = async () => {
      if (busyRef.current) return;
      busyRef.current = true;
      try {
        let user = userRef.current;
        if (!user) {
          const me = await getUserDetails().catch(() => null);
          user = unpackMe(me);
          if (!active) return;
          userRef.current = user;
        }
        if (!user) {
          publishSidebarCounts(emptySidebarCounts({ ready: false }));
          return;
        }

        const permissions = user.permissions || [];
        const isSuper = normalizeRole(user.roleName || user.role) === "super_admin";
        const caps = {
          projects: isSuper || canView(permissions, "project"),
          properties:
            isSuper ||
            hasAnyView(permissions, ["residential", "commercial", "land", "agricultural"]),
          leads: isSuper || canView(permissions, "lead"),
          tickets: isSuper || canView(permissions, "ticket"),
          users: isSuper || canView(permissions, "user"),
          owners: isSuper || canView(permissions, "user"),
          builders: isSuper || canView(permissions, "builder"),
          agents: isSuper || canView(permissions, "agent"),
          builderStaff:
            isSuper ||
            canView(permissions, "builder_staff") ||
            canView(permissions, "builder"),
          teamDirectory:
            isSuper || canView(permissions, "team") || canView(permissions, "user"),
        };
        capsRef.current = caps;

        const raw = await collectRawSnapshots(user);
        if (!active) return;
        rawRef.current = raw;

        const userKey = getSidebarUserKey(user);
        let seen = readSidebarSeen(userKey);

        // Ack only after scoped data is ready (click / open clears badge for that path)
        const pendingPath = pendingAckPathRef.current;
        if (pendingPath && pendingPath !== lastAckedPathRef.current) {
          seen = acknowledgePath(pendingPath, raw, user);
          pendingAckPathRef.current = null;
        }

        publishSidebarCounts(toPublishedCounts(raw, seen, caps, user));
      } finally {
        busyRef.current = false;
      }
    };

    refresh();
    const timer = window.setInterval(refresh, REFRESH_MS);
    const onFocus = () => refresh();
    const onVisibility = () => {
      if (document.visibilityState === "visible") refresh();
    };
    const onRefreshRequest = () => refresh();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener(SIDEBAR_REFRESH_EVENT, onRefreshRequest);

    return () => {
      active = false;
      window.clearInterval(timer);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener(SIDEBAR_REFRESH_EVENT, onRefreshRequest);
    };
  }, []);

  // When user opens a tracked page, clear badges for that path once.
  // Later creates that day still raise the badge via snapshot delta on refresh.
  useEffect(() => {
    const path = pathForLocation(location.pathname);
    if (!path) {
      lastAckedPathRef.current = "";
      pendingAckPathRef.current = null;
      return;
    }

    pendingAckPathRef.current = path;
    const user = userRef.current;
    const raw = rawRef.current;
    // Wait until user + customer-scoped snapshots exist — don't clear with empty data
    if (!user || !raw) return;

    const seen = acknowledgePath(path, raw, user);
    publishSidebarCounts(toPublishedCounts(raw, seen, capsRef.current, user));
    pendingAckPathRef.current = null;
  }, [location.pathname]);

  // Sidebar click can re-open same path (query only changes) — ack immediately.
  useEffect(() => {
    const onAckRequest = (event) => {
      const path = pathForLocation(event?.detail?.path || "");
      if (!path) return;
      const user = userRef.current;
      const raw = rawRef.current;
      if (!user || !raw) {
        pendingAckPathRef.current = path;
        return;
      }
      const seen = acknowledgePath(path, raw, user);
      publishSidebarCounts(toPublishedCounts(raw, seen, capsRef.current, user));
      pendingAckPathRef.current = null;
    };
    window.addEventListener(SIDEBAR_ACK_EVENT, onAckRequest);
    return () => window.removeEventListener(SIDEBAR_ACK_EVENT, onAckRequest);
  }, []);
}

function pathKeyFromRoute(path) {
  const entry = Object.entries(SIDEBAR_ACTIVITY_PATHS).find(([, value]) => value === path);
  return entry?.[0] || null;
}
