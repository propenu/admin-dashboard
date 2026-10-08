import { lazy, Suspense } from "react";
import { ShieldX } from "lucide-react";
import { ContentSkeleton } from "../../components/common/RouteFallback";
import { getParentRoleLabel } from "../../utils/reportsToHierarchy";

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

const normalizeRole = (role) =>
  String(role || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const canViewDashboard = (role, permissions = []) => {
  if (permissions.includes("*") || permissions.includes("dashboard:view")) {
    return true;
  }
  return normalizeRole(role) === "super_admin";
};

const DashboardAccessDenied = ({ role }) => {
  const parentLabel = getParentRoleLabel(role);
  const ask = parentLabel || "the role above you in the hierarchy";

  return (
    <div className="grid min-h-[420px] place-items-center p-6">
      <div className="max-w-lg rounded-3xl border border-amber-200 bg-amber-50 p-9 text-center text-amber-950 shadow-sm">
        <ShieldX className="mx-auto mb-4 text-amber-600" size={42} />
        <h1 className="text-2xl font-black">Dashboard is not enabled</h1>
        <p className="mt-2 text-sm leading-6">
          Dashboard View is turned off for your role. Please ask {ask} to turn on
          Dashboard → View. The role directly above you in the hierarchy can grant
          this.
        </p>
      </div>
    </div>
  );
};

const DashboardRouter = ({ role, permissions = [] }) => {
  if (!canViewDashboard(role, permissions)) {
    return <DashboardAccessDenied role={role} />;
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
