import DashboardRouter from "./DashboardRouter";
import { ContentSkeleton } from "../../components/common/RouteFallback";
import { useAuthUserProfile } from "../../hooks/useAuthUser";

/**
 * Home dashboard entry — uses shared /me cache.
 * No extra LoadingSpinner (Suspense already covered chunk load).
 */
const Dashboard = () => {
  const { user, permissions, roleName, isPending, isError, error } =
    useAuthUserProfile();

  if (isPending && !user) {
    return <ContentSkeleton rows={4} />;
  }

  if (isError && !user) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-950">
        <h1 className="text-xl font-black">Unable to load your session</h1>
        <p className="mt-2 text-sm leading-6">
          {error?.message ||
            "Your account details could not be loaded. Please sign in again."}
        </p>
      </div>
    );
  }

  return (
    <DashboardRouter
      role={roleName || user?.roleName}
      permissions={permissions}
    />
  );
};

export default Dashboard;
