import { describe, expect, it } from "vitest";
import { getAccountsMenuFlags, getPaymentAccess, getSubscriptionAccess } from "./accountsAccessControl.js";

describe("Accounts tab permission mapping", () => {
  it("hides Active Subscriptions when subscription:view is off", () => {
    const flags = getAccountsMenuFlags({
      roleName: "bdh",
      permissions: ["payment:view", "subscription:assign", "subscription:update"],
    });
    expect(flags.showAccountsSummary).toBe(true);
    expect(flags.showPaymentsList).toBe(true);
    expect(flags.showActiveSubscriptions).toBe(false);
    expect(flags.showSubscriptionHistory).toBe(false);
  });

  it("shows Active Subscriptions only with subscription:view", () => {
    const flags = getAccountsMenuFlags({
      roleName: "bdh",
      permissions: ["subscription:view"],
    });
    expect(flags.showActiveSubscriptions).toBe(true);
    expect(flags.showAccountsSummary).toBe(false);
    expect(flags.showSubscriptionHistory).toBe(false);
  });

  it("shows history with subscription:view_history", () => {
    const access = getSubscriptionAccess({
      roleName: "bdh",
      permissions: ["subscription:view_history"],
    });
    expect(access.canViewHistory).toBe(true);
    expect(access.canView).toBe(false);
  });

  it("maps payment pages to payment:view / view_reports", () => {
    const payment = getPaymentAccess({
      roleName: "bdh",
      permissions: ["payment:view_reports"],
    });
    const flags = getAccountsMenuFlags({
      roleName: "bdh",
      permissions: ["payment:view_reports"],
    });
    expect(payment.canViewReports).toBe(true);
    expect(flags.showRevenueByPlan).toBe(true);
    expect(flags.showPaymentsList).toBe(false);
  });
});
