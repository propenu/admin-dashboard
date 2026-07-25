import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { fetchLoggedInUser } from "../../services/UserServices/userServices";
import OperationsDashboard from "./OperationsDashboard";

/** Roles that use the home dashboard instead of the operations reports page. */
const REPORTS_EXCLUDED_ROLES = new Set(["regional_manager"]);

export default function OperationsReportsPage() {
  const [role, setRole] = useState(null);

  useEffect(() => {
    fetchLoggedInUser()
      .then((user) => setRole(user?.roleName || "unknown"))
      .catch(() => setRole("unknown"));
  }, []);

  if (!role) {
    return (
      <div className="grid min-h-[50vh] place-items-center text-sm font-semibold text-slate-500">
        Loading report scope...
      </div>
    );
  }

  if (REPORTS_EXCLUDED_ROLES.has(role)) {
    return <Navigate to="/" replace />;
  }

  return (
    <OperationsDashboard
      reportMode
      businessDevelopmentMode={role === "business_development_head"}
    />
  );
}
