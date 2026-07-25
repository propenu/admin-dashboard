const COUNTS_KEY = "propenu:sidebar-counts";
const SEEN_PREFIX = "propenu:sidebar-seen:";

export const SIDEBAR_ACTIVITY_EVENT = "propenu:sidebar-counts";
export const SIDEBAR_ACK_EVENT = "propenu:sidebar-ack";

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
};

/** Sidebar paths whose badges mean "accounts created today" (not inventory activity). */
export const SIDEBAR_ACCOUNT_PATHS = new Set([
  SIDEBAR_ACTIVITY_PATHS.users,
  SIDEBAR_ACTIVITY_PATHS.owners,
  SIDEBAR_ACTIVITY_PATHS.builders,
  SIDEBAR_ACTIVITY_PATHS.agents,
  SIDEBAR_ACTIVITY_PATHS.builderStaff,
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
  usersGroupToday: 0,
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

/** Inventory onboarding = draft/inactive (and explicit onboarding when present). */
export const inventoryOnboardingCount = (bucket = {}) =>
  Math.max(
    Number(bucket.onboarding || 0),
    Number(bucket.inactive || 0),
  );

export const unreadFromSnapshot = (current = {}, path, seenMap = {}) => {
  const seen = seenMap?.[path];
  const dayStart = startOfTodayMs();
  const baseline = seen?.snapshot || null;
  const seenAt = Number(seen?.at || 0);
  const curOnboarding = inventoryOnboardingCount(current);
  const baseOnboarding = inventoryOnboardingCount(baseline || {});

  // Never opened today → show full present-day totals
  if (!seen || !baseline || seenAt < dayStart) {
    return {
      total: Number(current.total || 0),
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
    total: delta("total"),
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
    else if (key === "pending" || key === "under_review" || key === "review") out.pending += n;
    else if (
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
  if (!out.onboarding) out.onboarding = out.inactive;
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
    onboarding: inactive,
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

export const roleBucket = (roleName = "") => {
  const role = String(roleName || "")
    .trim()
    .toLowerCase();
  if (role === "builder_staff" || role === "builderstaff" || role === "builder_staffs") {
    return "builderStaff";
  }
  if (role === "builder" || role === "builders") return "builder";
  if (role === "agent" || role === "agents") return "agent";
  if (role === "user" || role === "owner" || role === "owners" || role === "buyer" || role === "tenant") {
    return "owner";
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
  const onboarding = inventoryOnboardingCount(detail);
  // Prefer onboarding/draft filter when unread onboarding is present
  if (onboarding > 0) {
    params.set("status", path === SIDEBAR_ACTIVITY_PATHS.projects ? "inactive" : "draft");
  }
  return `${path}?${params.toString()}`;
};

/** Ask the sidebar badge hook to clear a path immediately (click / open). */
export const requestSidebarPathAck = (path) => {
  if (typeof window === "undefined" || !path) return;
  window.dispatchEvent(new CustomEvent(SIDEBAR_ACK_EVENT, { detail: { path } }));
};

export { todayKey, startOfTodayMs };
