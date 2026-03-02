import React from "react";
import SuperAdminDashboard from "./SuperAdminDashboard";
import AdminDashboard from "./AdminDashboard";
import SalesManagerDashboard from "./SalesManagerDashboard";
import SalesAgentDashboard from "./SalesAgentDashboard";
import AccountsDashboard from "./AccountsDashboard";

const DashboardRouter = ({ role }) => {
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

    default:
      return <div className="p-10">Unauthorized</div>;
  }
};

export default DashboardRouter;
