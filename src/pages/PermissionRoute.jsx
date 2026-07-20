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

  const normalizedRole = String(user?.roleName || user?.role?.name || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  const userPermissions = Array.isArray(user?.permissions) ? user.permissions : [];
  const bypass = normalizedRole === "super_admin" || normalizedRole === "admin";
  const required = [permission, ...anyPermissions].filter(Boolean);
  const allowed = bypass || userPermissions.includes("*") || required.some((item) => userPermissions.includes(item));

  if (!user) return <div className="grid min-h-[520px] place-items-center p-6"><div className="max-w-lg rounded-3xl border border-red-200 bg-red-50 p-9 text-center text-red-950 shadow-sm"><ShieldX className="mx-auto mb-4 text-red-600" size={42} /><h1 className="text-2xl font-black">Unable to verify your session</h1><p className="mt-2 text-sm leading-6">Your account details could not be loaded. Please sign in again or check that the user service is running.</p></div></div>;

  if (!allowed) return <div className="grid min-h-[520px] place-items-center p-6"><div className="max-w-lg rounded-3xl border border-amber-200 bg-amber-50 p-9 text-center text-amber-950 shadow-sm"><ShieldX className="mx-auto mb-4 text-amber-600" size={42} /><h1 className="text-2xl font-black">Access not available</h1><p className="mt-2 text-sm leading-6">You do not have permission for this page. Please request <strong>{required.join(" or ")}</strong> from a Super Admin.</p></div></div>;

  return children;
}
