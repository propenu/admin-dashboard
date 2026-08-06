const COUNTS_KEY = "propenu:sidebar-counts";
const SEEN_PREFIX = "propenu:sidebar-seen:";

export const SIDEBAR_ACTIVITY_EVENT = "propenu:sidebar-counts";
export const SIDEBAR_ACK_EVENT = "propenu:sidebar-ack";
export const SIDEBAR_REFRESH_EVENT = "propenu:sidebar-refresh";

export const SIDEBAR_ACTIVITY_PATHS = {
  projects: "/projects",
  properties: "/properties",
  leads: "/leads",
  tickets: "/tickets",
  users: "/users",
  owners: "/owners",
  builders: "/builders",
  agents: "/all-agents",
  builderStaff: "/builder-staff",
  /** Admin-created staff (CCE, leads, ops, etc.) — Team Directory */
  teamDirectory: "/propenu-team-members",
  /** Client Progress Queue (users onboarding + property pending; projects ignored) */
  followUpTracking: "/follow-up-tracking",
};

/** Sidebar paths whose badges mean "accounts created today" (not inventory activity). */
export const SIDEBAR_ACCOUNT_PATHS = new Set([
  SIDEBAR_ACTIVITY_PATHS.users,
  SIDEBAR_ACTIVITY_PATHS.owners,
  SIDEBAR_ACTIVITY_PATHS.builders,
  SIDEBAR_ACTIVITY_PATHS.agents,
  SIDEBAR_ACTIVITY_PATHS.builderStaff,
  SIDEBAR_ACTIVITY_PATHS.teamDirectory,
]);

const todayKey = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const startOfTodayMs = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

const safeParse = (raw, fallback) => {
  try {
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

export const getSidebarUserKey = (user) =>
  String(user?._id || user?.id || user?.userId || user?.email || "anon");

export const readSidebarSeen = (userKey) => {
  if (typeof window === "undefined") return {};
  const payload = safeParse(window.localStorage.getItem(`${SEEN_PREFIX}${userKey}`), {});
  if (payload?.day !== todayKey()) return {};
  return payload?.paths && typeof payload.paths === "object" ? payload.paths : {};
};

export const writeSidebarSeen = (userKey, paths) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    `${SEEN_PREFIX}${userKey}`,
    JSON.stringify({ day: todayKey(), paths }),
  );
};

/** Acknowledge current snapshot so badge clears until newer activity arrives. */
export const markSidebarPathSeen = (userKey, path, snapshot = {}) => {
  const paths = { ...readSidebarSeen(userKey) };
  paths[path] = {
    at: Date.now(),
    snapshot: {
      total: Number(snapshot.total || 0),
      active: Number(snapshot.active || 0),
      pending: Number(snapshot.pending || 0),
      inactive: Number(snapshot.inactive || 0),
      login: Number(snapshot.login || 0),
      onboarding: Number(snapshot.onboarding || 0),
    },
  };
  writeSidebarSeen(userKey, paths);
  return paths;
};

export const emptySidebarCounts = (extras = {}) => ({
  ready: false,
  projectsToday: 0,
  activeProjects: 0,
  propertiesToday: 0,
  ticketsToday: 0,
  leadsToday: 0,
  usersToday: 0,
  ownersToday: 0,
  buildersToday: 0,
  agentsToday: 0,
  builderStaffToday: 0,
  teamDirectoryToday: 0,
  usersGroupToday: 0,
  followUpToday: 0,
  byPath: {},
  raw: null,
  day: todayKey(),
  ...extras,
});

export const publishSidebarCounts = (counts) => {
  if (typeof window === "undefined") return;
  const payload = counts || emptySidebarCounts();
  window.localStorage.setItem(COUNTS_KEY, JSON.stringify(payload));
  window.dispatchEvent(new CustomEvent(SIDEBAR_ACTIVITY_EVENT, { detail: payload }));
};

/**
 * Inventory onboarding / needs-attention count.
 * Projects: include pending (CC/RM create → approval queue).
 * Properties: pending approvals only (drafts do not notify).
 */
export const inventoryOnboardingCount = (bucket = {}, options = {}) => {
  const kind = options.kind || "default";
  if (kind === "properties") {
    return Number(bucket.pending || 0);
  }
  const includePending = options.includePending !== false;
  return Math.max(
    Number(bucket.onboarding || 0),
    Number(bucket.inactive || 0),
    includePending ? Number(bucket.pending || 0) : 0,
  );
};

const snapshotHasActivity = (snapshot = {}) =>
  Number(snapshot.total || 0) > 0 ||
  Number(snapshot.active || 0) > 0 ||
  Number(snapshot.pending || 0) > 0 ||
  Number(snapshot.inactive || 0) > 0 ||
  Number(snapshot.login || 0) > 0 ||
  Number(snapshot.onboarding || 0) > 0;

export const unreadFromSnapshot = (current = {}, path, seenMap = {}) => {
  const seen = seenMap?.[path];
  const dayStart = startOfTodayMs();
  const baseline = seen?.snapshot || null;
  const seenAt = Number(seen?.at || 0);
  const isProperties = path === SIDEBAR_ACTIVITY_PATHS.properties;
  const countOpts = isProperties ? { kind: "properties" } : {};
  const curOnboarding = inventoryOnboardingCount(current, countOpts);
  const baseOnboarding = inventoryOnboardingCount(baseline || {}, countOpts);

  // Never opened today, or ack happened before data loaded (empty baseline) → full totals
  const baselineEmpty = Boolean(baseline) && !snapshotHasActivity(baseline);
  if (!seen || !baseline || seenAt < dayStart || baselineEmpty) {
    return {
      total: isProperties ? Number(current.pending || 0) : Number(current.total || 0),
      active: Number(current.active || 0),
      pending: Number(current.pending || 0),
      inactive: Number(current.inactive || 0),
      login: Number(current.login || 0),
      onboarding: curOnboarding,
    };
  }

  // Opened earlier today → only counts that arrived after that snapshot
  const delta = (key) => Math.max(0, Number(current[key] || 0) - Number(baseline[key] || 0));
  return {
    total: isProperties ? delta("pending") : delta("total"),
    active: delta("active"),
    pending: delta("pending"),
    inactive: delta("inactive"),
    login: delta("login"),
    onboarding: Math.max(0, curOnboarding - baseOnboarding),
  };
};

export const statusBucketFromRows = (statusWise = []) => {
  const out = { total: 0, active: 0, pending: 0, inactive: 0, onboarding: 0 };
  (Array.isArray(statusWise) ? statusWise : []).forEach((row) => {
    const key = String(row?._id || row?.status || "").toLowerCase();
    const n = Number(row?.total || row?.count || 0) || 0;
    out.total += n;
    if (key === "active" || key === "approved" || key === "live") out.active += n;
    else if (key === "pending" || key === "under_review" || key === "review") {
      out.pending += n;
      out.onboarding += n;
    } else if (
      key === "inactive" ||
      key === "draft" ||
      key === "onboarding" ||
      key === "incomplete" ||
      key === "rejected" ||
      key === "disabled" ||
      key === "expired"
    ) {
      out.inactive += n;
      if (
        key === "inactive" ||
        key === "draft" ||
        key === "onboarding" ||
        key === "incomplete"
      ) {
        out.onboarding += n;
      }
    }
  });
  if (!out.onboarding) out.onboarding = out.inactive + out.pending;
  return out;
};

export const overviewToStatusBucket = (overview = {}) => {
  const active =
    Number(overview.activeProjects || overview.activeProperties || overview.active || 0) || 0;
  const pending =
    Number(overview.pendingProjects || overview.pendingProperties || overview.pending || 0) || 0;
  // Draft + inactive both count as onboarding / incomplete inventory
  const draft =
    Number(
      overview.draftProjects ||
        overview.draftProperties ||
        overview.draft ||
        0,
    ) || 0;
  const inactiveOnly =
    Number(
      overview.inactiveProjects ||
        overview.inactiveProperties ||
        overview.inactive ||
        0,
    ) || 0;
  const inactive = draft + inactiveOnly;
  const total =
    Number(overview.totalProjects || overview.totalProperties || overview.total || 0) ||
    active + pending + inactive;
  return {
    total,
    active,
    pending,
    inactive,
    // Pending approvals are part of today's "needs attention" for projects/properties
    onboarding: inactive + pending,
  };
};

export const isOnboardingStatus = (status) => {
  const key = String(status || "").toLowerCase();
  return (
    key === "location_pending" ||
    key === "kyc_pending" ||
    key === "pending" ||
    key === "incomplete" ||
    key === "onboarding"
  );
};

/**
 * Map marketplace role → sidebar account bucket key.
 * Keys must match SIDEBAR_ACTIVITY_PATHS / raw snapshot keys
 * (owners, builders, agents, builderStaff) — not singular aliases.
 */
export const roleBucket = (roleName = "") => {
  const role = String(roleName || "")
    .trim()
    .toLowerCase();
  if (role === "builder_staff" || role === "builderstaff" || role === "builder_staffs") {
    return "builderStaff";
  }
  if (role === "builder" || role === "builders") return "builders";
  if (role === "agent" || role === "agents") return "agents";
  if (role === "user" || role === "owner" || role === "owners" || role === "buyer" || role === "tenant") {
    return "owners";
  }
  // Internal ops/staff roles are not counted on Users / Owners / Builders / Agents badges
  return null;
};

export const isCreatedToday = (value) => {
  if (!value) return false;
  const t = new Date(value).getTime();
  if (Number.isNaN(t)) return false;
  return t >= startOfTodayMs();
};

/** Open Properties/Projects filtered to today (sidebar badge drill-down). */
export const inventoryTodayHref = (path, detail = {}) => {
  if (path !== SIDEBAR_ACTIVITY_PATHS.properties && path !== SIDEBAR_ACTIVITY_PATHS.projects) {
    return path;
  }
  const day = todayKey();
  const params = new URLSearchParams();
  params.set("createdFrom", day);
  params.set("createdTo", day);

  // Properties badge = pending approvals only.
  // Projects badge = all created today — do NOT force status (pending/inactive),
  // or the list looks empty while the sidebar count shows a total.
  if (path === SIDEBAR_ACTIVITY_PATHS.properties) {
    params.set("status", "pending");
  }

  return `${path}?${params.toString()}`;
};

/** Open Users / Team Directory tabs filtered to accounts created today. */
export const accountTodayHref = (path) => {
  if (!SIDEBAR_ACCOUNT_PATHS.has(path)) return path;
  const day = todayKey();
  const params = new URLSearchParams();
  params.set("createdFrom", day);
  params.set("createdTo", day);
  return `${path}?${params.toString()}`;
};

/** Open Client Progress Queue focused on today's onboarding / pending work. */
export const followUpTodayHref = (path = SIDEBAR_ACTIVITY_PATHS.followUpTracking) => {
  if (path !== SIDEBAR_ACTIVITY_PATHS.followUpTracking) return path;
  const day = todayKey();
  const params = new URLSearchParams();
  params.set("track", "onboarding_all");
  params.set("preset", "today");
  params.set("from", day);
  params.set("to", day);
  return `${path}?${params.toString()}`;
};

/** Ask the sidebar badge hook to clear a path immediately (click / open). */
export const requestSidebarPathAck = (path) => {
  if (typeof window === "undefined" || !path) return;
  window.dispatchEvent(new CustomEvent(SIDEBAR_ACK_EVENT, { detail: { path } }));
};

/** Force an immediate sidebar badge refetch (after create / approve / reject). */
export const requestSidebarRefresh = () => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(SIDEBAR_REFRESH_EVENT));
};

export { todayKey, startOfTodayMs };
