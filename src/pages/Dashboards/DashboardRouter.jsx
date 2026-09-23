import { lazy, Suspense } from "react";
import { ContentSkeleton } from "../../components/common/RouteFallback";

const SuperAdminDashboard = lazy(() => import("./SuperAdminDashboard"));
const AdminDashboard = lazy(() => import("./AdminDashboard"));
const SalesManagerDashboard = lazy(() => import("./SalesManagerDashboard"));
const SalesAgentDashboard = lazy(() => import("./SalesAgentDashboard"));
const AccountsDashboard = lazy(() => import("./AccountsDashboard"));
const DigitalMarket = lazy(() => import("./DigitalMarket"));
const OperationsDashboard = lazy(() => import("./OperationsDashboard"));
const RegionalManagerDashboard = lazy(() =>
  import("./RegionalManagerDashboard"),
);
const BusinessDevelopmentHeadDashboard = lazy(() =>
  import("./BusinessDevelopmentHeadDashboard"),
);
const CustomerCareDashboard = lazy(() => import("./CustomerCareDashboard"));
const CustomerSupportHeadDashboard = lazy(() =>
  import("./CustomerSupportHeadDashboard"),
);
const CustomerSupportTeamLeadDashboard = lazy(() =>
  import("./CustomerSupportTeamLeadDashboard"),
);
const MarketingHeadDashboard = lazy(() => import("./MarketingHeadDashboard"));
const ContentTeamDashboard = lazy(() => import("./ContentTeamDashboard"));
const CeoDashboard = lazy(() => import("./CeoDashboard"));

const canViewDashboard = (role, permissions = []) => {
  if (permissions.includes("*") || permissions.includes("dashboard:view")) {
    return true;
  }
  const normalized = String(role || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_");
  return normalized === "super_admin" || normalized === "admin";
};

const DashboardRouter = ({ role, permissions = [] }) => {
  if (!canViewDashboard(role, permissions)) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-10 text-amber-900">
        This role does not include dashboard access.
      </div>
    );
  }

  let Page = AdminDashboard;

  switch (role) {
    case "super_admin":
      Page = SuperAdminDashboard;
      break;
    case "ceo":
    case "founder":
      Page = CeoDashboard;
      break;
    case "admin":
      Page = AdminDashboard;
      break;
    case "sales_manager":
      Page = SalesManagerDashboard;
      break;
    case "sales_agent":
    case "sales_executive":
    case "sales_executives":
      Page = SalesAgentDashboard;
      break;
    case "accounts":
      Page = AccountsDashboard;
      break;
    case "marketing_head":
      Page = MarketingHeadDashboard;
      break;
    case "content_team":
      Page = ContentTeamDashboard;
      break;
    case "digital_marketing":
    case "performance_marketing":
      Page = DigitalMarket;
      break;
    case "operations_head":
    case "operation_head":
      Page = OperationsDashboard;
      break;
    case "business_development_head":
      Page = BusinessDevelopmentHeadDashboard;
      break;
    case "regional_manager":
      Page = RegionalManagerDashboard;
      break;
    case "customer_support_head":
      Page = CustomerSupportHeadDashboard;
      break;
    case "team_lead":
    case "team_leads":
    case "customer_support_team_lead":
    case "customer_support_team_leads":
      Page = CustomerSupportTeamLeadDashboard;
      break;
    case "customer_care":
    case "customer_care_executive":
    case "customer_care_executives":
      Page = CustomerCareDashboard;
      break;
    default:
      Page = AdminDashboard;
  }

  return (
    <Suspense fallback={<ContentSkeleton rows={4} />}>
      <Page />
    </Suspense>
  );
};

export default DashboardRouter;
