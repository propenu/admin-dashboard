import { useEffect, useState } from "react";
import { ShieldX } from "lucide-react";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { fetchLoggedInUser } from "../services/UserServices/userServices";

export default function PermissionRoute({ permission, anyPermissions = [], children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLoggedInUser().then(setUser).catch(() => setUser(null)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="grid min-h-[420px] place-items-center"><LoadingSpinner size="lg" /></div>;

  const bypass = user?.roleName === "super_admin" || user?.roleName === "admin";
  const required = [permission, ...anyPermissions].filter(Boolean);
  const allowed = bypass || user?.permissions?.includes("*") || required.some((item) => user?.permissions?.includes(item));

  if (!allowed) return <div className="grid min-h-[520px] place-items-center p-6"><div className="max-w-lg rounded-3xl border border-amber-200 bg-amber-50 p-9 text-center text-amber-950 shadow-sm"><ShieldX className="mx-auto mb-4 text-amber-600" size={42} /><h1 className="text-2xl font-black">Access not available</h1><p className="mt-2 text-sm leading-6">You do not have permission for this page. Please request <strong>{required.join(" or ")}</strong> from a Super Admin.</p></div></div>;

  return children;
}
