/**
 * Who may activate / deactivate / permanently delete accounts.
 * Super Admin: any non–super_admin target.
 * Business Development Head: owners (user), builders, builder staff, agents only.
 */

export const normalizeLifecycleRole = (value = "") =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

/** Roles BDH may activate / deactivate / delete. */
export const BDH_LIFECYCLE_TARGET_ROLES = new Set([
  "user",
  "builder",
  "builder_staff",
  "agent",
]);

export const canManageUserLifecycle = ({
  actorRole = "",
  targetRole = "",
  isSelf = false,
} = {}) => {
  if (isSelf) return false;
  const actor = normalizeLifecycleRole(actorRole);
  const target = normalizeLifecycleRole(targetRole);
  if (!actor || target === "super_admin") return false;
  if (actor === "super_admin") return true;
  if (actor === "business_development_head") {
    return BDH_LIFECYCLE_TARGET_ROLES.has(target);
  }
  return false;
};

export const canUseLifecycleActions = (actorRole = "") => {
  const actor = normalizeLifecycleRole(actorRole);
  return actor === "super_admin" || actor === "business_development_head";
};
