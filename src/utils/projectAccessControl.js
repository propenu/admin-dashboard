/** Hierarchy-based project create / approve access (mirrors property-service policy). */

const ROLE_ALIASES = {
  customer_care: "customer_care_executive",
  customer_care_executives: "customer_care_executive",
  relationship_managers: "relationship_manager",
  sales_executives: "sales_executive",
  team_lead: "customer_support_team_lead",
  team_leads: "customer_support_team_lead",
  operation_head: "operations_head",
};

const ROLE_RANK = {
  customer_care_executive: 10,
  relationship_manager: 12,
  sales_agent: 10,
  sales_executive: 10,
  agent: 10,
  user: 5,
  customer_support_team_lead: 20,
  team_lead: 20,
  customer_support_head: 30,
  sales_manager: 40,
  regional_manager: 50,
  business_development_manager: 45,
  business_development_head: 60,
  operations_head: 70,
  ceo: 80,
  founder: 85,
  admin: 90,
  super_admin: 100,
  builder: 15,
  builder_staff: 12,
};

const APPROVER_ROLES = new Set([
  "regional_manager",
  "sales_manager",
  "business_development_head",
  "business_development_manager",
  "operations_head",
  "ceo",
  "founder",
  "admin",
  "super_admin",
]);

export const normalizeProjectRole = (roleName = "") => {
  const key = String(roleName || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return ROLE_ALIASES[key] || key;
};

export const getProjectRoleRank = (roleName) =>
  ROLE_RANK[normalizeProjectRole(roleName)] ?? 0;

const hasPerm = (permissions = [], key) => {
  if (!Array.isArray(permissions)) return false;
  return permissions.includes("*") || permissions.includes(key);
};

/** Create Project button — hierarchy + project:create */
export const canCreateProject = (user) => {
  const role = normalizeProjectRole(user?.roleName || user?.role);
  const permissions = user?.permissions || [];
  if (role === "super_admin" || role === "admin") return true;
  if (hasPerm(permissions, "project:create")) return true;
  return [
    "builder",
    "sales_manager",
    "sales_agent",
    "sales_executive",
    "customer_care_executive",
    "relationship_manager",
    "regional_manager",
    "operations_head",
    "business_development_head",
    "ceo",
    "customer_support_team_lead",
    "team_lead",
  ].includes(role);
};

/** View pending approval queue */
export const canViewPendingProjectApprovals = (user) => {
  const role = normalizeProjectRole(user?.roleName || user?.role);
  const permissions = user?.permissions || [];
  if (role === "super_admin" || role === "admin") return true;
  if (hasPerm(permissions, "project:approve") || hasPerm(permissions, "project:reject")) {
    return true;
  }
  return APPROVER_ROLES.has(role);
};

/** Approve / reject a specific pending project */
export const canApproveProject = (user, project) => {
  if (!canViewPendingProjectApprovals(user)) return false;

  const actorRole = normalizeProjectRole(user?.roleName || user?.role);
  const actorId = String(user?._id || user?.id || user?.userId || "");
  const creator =
    project?.createdBy && typeof project.createdBy === "object"
      ? project.createdBy
      : null;
  const creatorRole = normalizeProjectRole(
    creator?.roleName || project?.postedBy?.roleName || "",
  );
  const creatorId = String(
    creator?._id || creator?.id || project?.createdBy || project?.postedBy?.userId || "",
  );

  if (
    actorId &&
    creatorId &&
    actorId === creatorId &&
    actorRole !== "super_admin" &&
    actorRole !== "admin"
  ) {
    return false;
  }

  if (actorRole === "super_admin" || actorRole === "admin") return true;

  const actorRank = getProjectRoleRank(actorRole);
  const creatorRank = getProjectRoleRank(creatorRole);

  if (creatorRole && actorRank <= creatorRank) return false;

  if (
    actorRank < getProjectRoleRank("regional_manager") &&
    creatorRank <= getProjectRoleRank("customer_care_executive")
  ) {
    const smMayApprove = new Set([
      "sales_agent",
      "sales_executive",
      "agent",
      "user",
      "builder",
      "builder_staff",
    ]);
    if (actorRole === "sales_manager" && smMayApprove.has(creatorRole)) {
      return true;
    }
    if (
      creatorRole === "customer_care_executive" ||
      creatorRole === "relationship_manager"
    ) {
      return false;
    }
    return false;
  }

  return APPROVER_ROLES.has(actorRole) || hasPerm(user?.permissions, "project:approve");
};

/** Permanent DB delete — Super Admin + Business Development Head only. */
export const canPermanentlyDeleteProject = (user) => {
  const role = normalizeProjectRole(user?.roleName || user?.role);
  return role === "super_admin" || role === "business_development_head";
};
