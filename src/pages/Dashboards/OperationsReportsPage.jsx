import { useEffect, useState } from "react";
import { fetchLoggedInUser } from "../../services/UserServices/userServices";
import OperationsDashboard from "./OperationsDashboard";

export default function OperationsReportsPage() {
  const [role, setRole] = useState(null);

  useEffect(() => {
    fetchLoggedInUser()
      .then((user) => setRole(user?.roleName || "unknown"))
      .catch(() => setRole("unknown"));
  }, []);

  if (!role) {
    return <div className="grid min-h-[50vh] place-items-center text-sm font-semibold text-slate-500">Loading report scope...</div>;
  }

  return <OperationsDashboard reportMode businessDevelopmentMode={role === "business_development_head"} />;
}
