import { hasPermission } from "./planAccessControl";

export const getSubscriptionAccess = (user) => ({
  canView: hasPermission(user, "subscription:view"),
  canViewHistory: hasPermission(user, "subscription:view_history"),
  canAssign: hasPermission(user, "subscription:assign"),
  canUpdate: hasPermission(user, "subscription:update"),
  canCancel: hasPermission(user, "subscription:cancel"),
  canRenew: hasPermission(user, "subscription:renew"),
});

export const getPaymentAccess = (user) => ({
  canView: hasPermission(user, "payment:view"),
  canCreate: hasPermission(user, "payment:create"),
  canVerify: hasPermission(user, "payment:verify"),
  canRefund: hasPermission(user, "payment:refund"),
  canViewReports: hasPermission(user, "payment:view_reports"),
  canExport: hasPermission(user, "payment:export"),
});

/** Which Accounts sidebar links a role should see. */
export const getAccountsMenuFlags = (user) => {
  const payment = getPaymentAccess(user);
  const subscription = getSubscriptionAccess(user);
  return {
    showAccountsSummary: payment.canView,
    showPaymentsList: payment.canView,
    showActiveSubscriptions: subscription.canView,
    showSubscriptionHistory: subscription.canViewHistory,
    showRevenueByPlan: payment.canViewReports || payment.canView,
    showAccountsSection:
      payment.canView ||
      payment.canViewReports ||
      subscription.canView ||
      subscription.canViewHistory,
    payment,
    subscription,
  };
};
