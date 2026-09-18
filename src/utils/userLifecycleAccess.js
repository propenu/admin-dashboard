/**
 * Who may activate / deactivate / permanently delete / edit staff accounts.
 * Super Admin / Admin: broad access.
 * Business Development Head: owners, builders, builder staff, agents only.
 * CSH / Team Lead / Ops Head: hierarchy descendant roles only.
 */

export const normalizeLifecycleRole = (value = "") =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const ROLE_ALIASES = {
  team_lead: "customer_support_team_lead",
  team_leads: "customer_support_team_lead",
  customer_support_team_leads: "customer_support_team_lead",
  customer_care: "customer_care_executive",
  customer_care_executives: "customer_care_executive",
  relationship_managers: "relationship_manager",
  operation_head: "operations_head",
  sales_agent: "sales_executive",
  sales_executives: "sales_executive",
};

export const canonicalLifecycleRole = (value = "") => {
  const key = normalizeLifecycleRole(value);
  return ROLE_ALIASES[key] || key;
};

/** Roles BDH may activate / deactivate / delete. */
export const BDH_LIFECYCLE_TARGET_ROLES = new Set([
  "user",
  "builder",
  "builder_staff",
  "agent",
]);

/** Hierarchy managers → roles they may manage on Team Directory. */
export const HIERARCHY_LIFECYCLE_TARGETS = {
  customer_support_head: new Set([
    "customer_support_team_lead",
    "customer_care_executive",
    "relationship_manager",
  ]),
  customer_support_team_lead: new Set([
    "customer_care_executive",
    "relationship_manager",
  ]),
  operations_head: new Set([
    "customer_support_head",
    "customer_support_team_lead",
    "customer_care_executive",
    "relationship_manager",
    "business_development_head",
    "regional_manager",
    "business_development_manager",
    "sales_manager",
    "sales_executive",
    "marketing_head",
    "digital_marketing",
    "social_media",
    "content_team",
    "creative_team",
    "performance_marketing",
    "accounts",
    "legal_compliance",
    "hr_administration",
    "technical_support_head",
    "technical_support_team",
  ]),
};

export const canManageUserLifecycle = ({
  actorRole = "",
  targetRole = "",
  isSelf = false,
} = {}) => {
  if (isSelf) return false;
  const actor = canonicalLifecycleRole(actorRole);
  const target = canonicalLifecycleRole(targetRole);
  if (!actor || target === "super_admin") return false;
  if (actor === "super_admin" || actor === "admin") return true;
  if (actor === "business_development_head") {
    return BDH_LIFECYCLE_TARGET_ROLES.has(target);
  }
  const allowed = HIERARCHY_LIFECYCLE_TARGETS[actor];
  return Boolean(allowed && allowed.has(target));
};

export const canUseLifecycleActions = (actorRole = "") => {
  const actor = canonicalLifecycleRole(actorRole);
  return (
    actor === "super_admin" ||
    actor === "admin" ||
    actor === "business_development_head" ||
    Boolean(HIERARCHY_LIFECYCLE_TARGETS[actor])
  );
};

/** Edit profile: Super Admin / Admin / same hierarchy managers as lifecycle. */
export const canEditStaffProfile = ({
  actorRole = "",
  targetRole = "",
  isSelf = false,
} = {}) => canManageUserLifecycle({ actorRole, targetRole, isSelf });
