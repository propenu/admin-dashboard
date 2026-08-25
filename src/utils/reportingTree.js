const idOf = (value) => {
  if (!value) return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (value._id) return String(value._id);
  if (value.id) return String(value.id);
  return String(value);
};

const managerIdOf = (user) =>
  idOf(user?.managerId) || idOf(user?.reportsTo?._id) || idOf(user?.reportsTo);

/**
 * Staff who report to this manager (directly or through their own reports).
 * Another RM's team and unassigned members are excluded.
 */
export function filterUsersInReportingTree(users = [], actorId = "") {
  const actor = String(actorId || "").trim();
  if (!actor) return [];

  const byId = new Map();
  users.forEach((user) => {
    const id = idOf(user?._id || user?.id);
    if (id) byId.set(id, user);
  });

  const cache = new Map();

  const reportsToActor = (userId, seen = new Set()) => {
    if (!userId || userId === actor) return false;
    if (cache.has(userId)) return Boolean(cache.get(userId));
    if (seen.has(userId)) {
      cache.set(userId, false);
      return false;
    }
    seen.add(userId);

    const user = byId.get(userId);
    const managerId = managerIdOf(user);
    if (!managerId) {
      cache.set(userId, false);
      return false;
    }
    if (managerId === actor) {
      cache.set(userId, true);
      return true;
    }

    const ok = reportsToActor(managerId, seen);
    cache.set(userId, ok);
    return ok;
  };

  return users.filter((user) => {
    const id = idOf(user?._id || user?.id);
    if (!id || id === actor) return false;
    return reportsToActor(id);
  });
}

export function shouldScopeTeamToReports(roleName = "") {
  const role = String(roleName || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_");
  return role !== "super_admin" && role !== "admin";
}

const reportsToManager = (userId, managerId, byId, cache, seen = new Set()) => {
  const uid = String(userId || "");
  const mid = String(managerId || "");
  if (!uid || !mid || uid === mid) return false;
  const key = `${uid}->${mid}`;
  if (cache.has(key)) return Boolean(cache.get(key));
  if (seen.has(uid)) {
    cache.set(key, false);
    return false;
  }
  seen.add(uid);
  const user = byId.get(uid);
  const parentId = managerIdOf(user);
  if (!parentId) {
    cache.set(key, false);
    return false;
  }
  if (parentId === mid) {
    cache.set(key, true);
    return true;
  }
  const ok = reportsToManager(parentId, mid, byId, cache, seen);
  cache.set(key, ok);
  return ok;
};

/**
 * Nest staff under each Regional Manager for BDH Team Floor.
 * Returns [{ manager, staff }] plus unassigned (no RM in chain).
 */
export function buildRegionalManagerPods(members = []) {
  const list = Array.isArray(members) ? members : [];
  const byId = new Map();
  list.forEach((m) => {
    const id = idOf(m?.id || m?._id);
    if (id) byId.set(id, m);
  });

  const rms = list.filter(
    (m) =>
      String(m.group || "").toLowerCase() === "regional_manager" ||
      String(m.roleName || "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_") === "regional_manager",
  );

  const cache = new Map();
  const pods = rms.map((rm) => {
    const rmId = idOf(rm.id || rm._id);
    const staff = list.filter((m) => {
      const id = idOf(m.id || m._id);
      if (!id || id === rmId) return false;
      return reportsToManager(id, rmId, byId, cache);
    });
    return { manager: rm, staff };
  });

  const claimed = new Set();
  pods.forEach((pod) => {
    claimed.add(idOf(pod.manager.id || pod.manager._id));
    pod.staff.forEach((s) => claimed.add(idOf(s.id || s._id)));
  });

  let unassigned = list.filter((m) => !claimed.has(idOf(m.id || m._id)));

  // Soft fallback: if only one RM and some staff aren't linked via reports-to yet,
  // show them under that RM so BD Head still sees the team together.
  if (pods.length === 1 && unassigned.length) {
    const orphans = unassigned.filter(
      (m) =>
        String(m.group || "").toLowerCase() !== "regional_manager" &&
        String(m.roleName || "")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "_") !== "regional_manager",
    );
    if (orphans.length) {
      pods[0] = { ...pods[0], staff: [...pods[0].staff, ...orphans] };
      const orphanIds = new Set(orphans.map((s) => idOf(s.id || s._id)));
      unassigned = unassigned.filter((m) => !orphanIds.has(idOf(m.id || m._id)));
    }
  }

  return { pods, unassigned };
}

/**
 * Nest staff under their direct manager (reportsTo / managerId).
 * Used by Super Admin Staff Floor — who works under who across all roles.
 * Returns [{ manager, staff }] plus unassigned (no manager link in this list).
 */
export function buildManagerReportingPods(members = []) {
  const list = Array.isArray(members) ? members : [];
  const byId = new Map();
  list.forEach((m) => {
    const id = idOf(m?.id || m?._id);
    if (id) byId.set(id, m);
  });

  const directReports = new Map();
  list.forEach((m) => {
    const id = idOf(m?.id || m?._id);
    const mid = managerIdOf(m);
    if (!id || !mid || mid === id || !byId.has(mid)) return;
    const arr = directReports.get(mid) || [];
    arr.push(m);
    directReports.set(mid, arr);
  });

  const groupOrder = [
    "leadership",
    "regional_manager",
    "support_lead",
    "marketing",
    "bdm",
    "sales_manager",
    "cce",
    "relationship_manager",
    "ops_functions",
    "tech",
    "sales_executive",
    "other",
  ];

  const pods = [...directReports.keys()]
    .map((mid) => ({
      manager: byId.get(mid),
      staff: [...(directReports.get(mid) || [])].sort((a, b) =>
        String(a?.name || "").localeCompare(String(b?.name || "")),
      ),
    }))
    .filter((pod) => pod.manager)
    .sort((a, b) => {
      const ia = groupOrder.indexOf(String(a.manager.group || "other"));
      const ib = groupOrder.indexOf(String(b.manager.group || "other"));
      const ra = ia === -1 ? 99 : ia;
      const rb = ib === -1 ? 99 : ib;
      if (ra !== rb) return ra - rb;
      return String(a.manager.name || "").localeCompare(String(b.manager.name || ""));
    });

  const claimedAsStaff = new Set();
  const managerIds = new Set(pods.map((p) => idOf(p.manager.id || p.manager._id)));
  pods.forEach((pod) => {
    pod.staff.forEach((s) => claimedAsStaff.add(idOf(s.id || s._id)));
  });

  const unassigned = list.filter((m) => {
    const id = idOf(m?.id || m?._id);
    if (!id) return false;
    if (managerIds.has(id)) return false;
    if (claimedAsStaff.has(id)) return false;
    return true;
  });

  return { pods, unassigned };
}

