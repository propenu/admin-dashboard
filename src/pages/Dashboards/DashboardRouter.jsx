import React from "react";
import SuperAdminDashboard from "./SuperAdminDashboard";
import AdminDashboard from "./AdminDashboard";
import SalesManagerDashboard from "./SalesManagerDashboard";
import SalesAgentDashboard from "./SalesAgentDashboard";
import AccountsDashboard from "./AccountsDashboard";
import DigitalMarket from "./DigitalMarket";
import OperationsDashboard from "./OperationsDashboard";
import RegionalManagerDashboard from "./RegionalManagerDashboard";

const DashboardRouter = ({ role, permissions = [] }) => {
  if (!permissions.includes("dashboard:view")) {
    return <div className="rounded-2xl border border-amber-200 bg-amber-50 p-10 text-amber-900">This role does not include dashboard access.</div>;
  }

  switch (role) {
    case "super_admin":
      return <SuperAdminDashboard />;

    case "admin":
      return <AdminDashboard />;

    case "sales_manager":
      return <SalesManagerDashboard />;

    case "sales_agent":
      return <SalesAgentDashboard />;

    case "accounts":
      return <AccountsDashboard />;

    case "digital_marketing":
      return <DigitalMarket />;

    case "operations_head":
    case "operation_head":
      return <OperationsDashboard />;

    case "business_development_head":
      return <OperationsDashboard businessDevelopmentMode />;

    case "regional_manager":
      return <RegionalManagerDashboard />;

    default:
      return <AdminDashboard />;
  }
};

export default DashboardRouter;
