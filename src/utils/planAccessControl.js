const normalizeRole = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const normalizePermission = (value) => String(value || "").trim().toLowerCase();

/** Collect permission keys from common /me + login payload shapes. */
export const resolveUserPermissions = (user) => {
  if (!user || typeof user !== "object") return [];

  const bags = [
    user.permissions,
    user.permission,
    user.role?.permissions,
    user.roleId?.permissions,
    user.user?.permissions,
  ];

  const keys = [];
  bags.forEach((bag) => {
    if (!Array.isArray(bag)) return;
    bag.forEach((item) => {
      if (typeof item === "string") keys.push(normalizePermission(item));
      else if (item && typeof item === "object") {
        keys.push(normalizePermission(item.key || item.permission || item.name));
      }
    });
  });

  return [...new Set(keys.filter(Boolean))];
};

export const hasPermission = (user, key) => {
  const roleName = normalizeRole(
    user?.roleName || user?.role?.name || user?.role || user?.roleLabel,
  );
  if (roleName === "super_admin" || roleName === "admin") return true;

  const permissions = resolveUserPermissions(user);
  if (permissions.includes("*")) return true;

  const required = normalizePermission(key);
  if (permissions.includes(required)) return true;

  // Module wildcard: builder_invoice:* grants builder_invoice:create, etc.
  const [moduleName] = required.split(":");
  if (moduleName && permissions.includes(`${moduleName}:*`)) return true;

  return false;
};

export const getPlanAccess = (user) => ({
  canView: hasPermission(user, "plan:view"),
  canCreate: hasPermission(user, "plan:create"),
  canUpdate: hasPermission(user, "plan:update"),
  canDelete: hasPermission(user, "plan:delete"),
  canActivate: hasPermission(user, "plan:activate"),
  canDeactivate: hasPermission(user, "plan:deactivate"),
  canAssign: hasPermission(user, "plan:assign"),
});

export const getBuilderInvoiceAccess = (user) => ({
  canView: hasPermission(user, "builder_invoice:view"),
  canCreate: hasPermission(user, "builder_invoice:create"),
  canUpdate: hasPermission(user, "builder_invoice:update"),
  canDelete: hasPermission(user, "builder_invoice:delete"),
});

/**
 * Pure UI flags for Builder Plans header + cards.
 * Used by the page and by unit tests.
 */
export const getBuilderPlansUiFlags = (user) => {
  const plan = getPlanAccess(user);
  const invoice = getBuilderInvoiceAccess(user);
  return {
    showNewPlanButton: plan.canCreate,
    showPlanCards: plan.canView,
    showPlanViewButton: plan.canView,
    showPlanEditButton: plan.canUpdate,
    showPlanDeleteButton: plan.canDelete,
    showViewInvoicesButton: invoice.canView,
    showCreateInvoiceButton: invoice.canCreate,
    showInvoiceEditButton: invoice.canUpdate,
    showInvoiceDeleteButton: invoice.canDelete,
    plan,
    invoice,
  };
};
