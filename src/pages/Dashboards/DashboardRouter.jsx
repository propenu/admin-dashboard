import React from "react";
import SuperAdminDashboard from "./SuperAdminDashboard";
import AdminDashboard from "./AdminDashboard";
import SalesManagerDashboard from "./SalesManagerDashboard";
import SalesAgentDashboard from "./SalesAgentDashboard";
import AccountsDashboard from "./AccountsDashboard";
import DigitalMarket from "./DigitalMarket";
import OperationsDashboard from "./OperationsDashboard";
import RegionalManagerDashboard from "./RegionalManagerDashboard";
import CustomerCareDashboard from "./CustomerCareDashboard";
import CustomerSupportHeadDashboard from "./CustomerSupportHeadDashboard";
import CustomerSupportTeamLeadDashboard from "./CustomerSupportTeamLeadDashboard";
import MarketingHeadDashboard from "./MarketingHeadDashboard";
import ContentTeamDashboard from "./ContentTeamDashboard";
import CeoDashboard from "./CeoDashboard";

const DashboardRouter = ({ role, permissions = [] }) => {
  if (!permissions.includes("dashboard:view")) {
    return <div className="rounded-2xl border border-amber-200 bg-amber-50 p-10 text-amber-900">This role does not include dashboard access.</div>;
  }

  switch (role) {
    case "super_admin":
      return <SuperAdminDashboard />;

    case "ceo":
    case "founder":
      return <CeoDashboard />;

    case "admin":
      return <AdminDashboard />;

    case "sales_manager":
      return <SalesManagerDashboard />;

    case "sales_agent":
    case "sales_executive":
    case "sales_executives":
      return <SalesAgentDashboard />;

    case "accounts":
      return <AccountsDashboard />;

    case "marketing_head":
      return <MarketingHeadDashboard />;

    case "content_team":
      return <ContentTeamDashboard />;

    case "digital_marketing":
    case "performance_marketing":
      return <DigitalMarket />;

    case "operations_head":
    case "operation_head":
      return <OperationsDashboard />;

    case "business_development_head":
      return <OperationsDashboard businessDevelopmentMode />;

    case "regional_manager":
      return <RegionalManagerDashboard />;

    case "customer_support_head":
      return <CustomerSupportHeadDashboard />;

    case "team_lead":
    case "team_leads":
    case "customer_support_team_lead":
    case "customer_support_team_leads":
      return <CustomerSupportTeamLeadDashboard />;

    case "customer_care":
    case "customer_care_executive":
    case "customer_care_executives":
      return <CustomerCareDashboard />;

    default:
      return <AdminDashboard />;
  }
};

export default DashboardRouter;
