import { describe, expect, it } from "vitest";
import {
  getBuilderInvoiceAccess,
  getBuilderPlansUiFlags,
  getPlanAccess,
  hasPermission,
  resolveUserPermissions,
} from "./planAccessControl.js";

describe("resolveUserPermissions", () => {
  it("reads nested and flat permission bags", () => {
    const keys = resolveUserPermissions({
      permissions: ["plan:view", { key: "builder_invoice:create" }],
      role: { permissions: ["builder_invoice:view"] },
    });
    expect(keys).toContain("plan:view");
    expect(keys).toContain("builder_invoice:create");
    expect(keys).toContain("builder_invoice:view");
  });
});

describe("hasPermission", () => {
  it("grants all access to super_admin and admin", () => {
    expect(hasPermission({ roleName: "super_admin" }, "builder_invoice:create")).toBe(true);
    expect(hasPermission({ roleName: "admin" }, "plan:delete")).toBe(true);
  });

  it("requires exact permission for staff", () => {
    const user = {
      roleName: "business_development_head",
      permissions: ["builder_invoice:view", "plan:create"],
    };
    expect(hasPermission(user, "builder_invoice:view")).toBe(true);
    expect(hasPermission(user, "builder_invoice:create")).toBe(false);
    expect(hasPermission(user, "plan:create")).toBe(true);
  });

  it("supports module wildcard", () => {
    const user = {
      roleName: "custom_role",
      permissions: ["builder_invoice:*"],
    };
    expect(hasPermission(user, "builder_invoice:create")).toBe(true);
    expect(hasPermission(user, "builder_invoice:delete")).toBe(true);
    expect(hasPermission(user, "plan:create")).toBe(false);
  });
});

describe("getBuilderPlansUiFlags", () => {
  it("shows Create invoice only when builder_invoice:create is present", () => {
    const flags = getBuilderPlansUiFlags({
      roleName: "bdh",
      permissions: [
        "plan:view",
        "plan:create",
        "builder_invoice:view",
        "builder_invoice:create",
        "builder_invoice:update",
        "builder_invoice:delete",
      ],
    });

    expect(flags.showViewInvoicesButton).toBe(true);
    expect(flags.showCreateInvoiceButton).toBe(true);
    expect(flags.showNewPlanButton).toBe(true);
    expect(flags.showPlanCards).toBe(true);
    expect(flags.showPlanEditButton).toBe(false);
    expect(flags.showPlanDeleteButton).toBe(false);
  });

  it("hides Create invoice when create is off even if view is on", () => {
    const flags = getBuilderPlansUiFlags({
      roleName: "bdh",
      permissions: ["plan:view", "plan:create", "builder_invoice:view"],
    });

    expect(flags.showViewInvoicesButton).toBe(true);
    expect(flags.showCreateInvoiceButton).toBe(false);
    expect(flags.showNewPlanButton).toBe(true);
  });

  it("maps plan CRUD buttons in correct order rules", () => {
    const flags = getBuilderPlansUiFlags({
      roleName: "staff",
      permissions: ["plan:view", "plan:update", "plan:delete"],
    });

    expect(flags.showPlanCards).toBe(true);
    expect(flags.showPlanViewButton).toBe(true);
    expect(flags.showPlanEditButton).toBe(true);
    expect(flags.showPlanDeleteButton).toBe(true);
    expect(flags.showNewPlanButton).toBe(false);
    expect(flags.showCreateInvoiceButton).toBe(false);
  });

  it("hides agent plan edit pencils when plan:update is off", () => {
    const access = getPlanAccess({
      roleName: "bdh",
      permissions: ["plan:view", "plan:assign"],
    });
    expect(access.canView).toBe(true);
    expect(access.canUpdate).toBe(false);
    expect(access.canAssign).toBe(true);
  });
});

describe("access helpers", () => {
  it("exposes plan and invoice access objects", () => {
    const user = {
      roleName: "staff",
      permissions: ["plan:view", "builder_invoice:create"],
    };
    expect(getPlanAccess(user).canView).toBe(true);
    expect(getPlanAccess(user).canCreate).toBe(false);
    expect(getBuilderInvoiceAccess(user).canCreate).toBe(true);
    expect(getBuilderInvoiceAccess(user).canView).toBe(false);
  });
});
