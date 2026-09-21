import DashboardRouter from "./DashboardRouter";
import { useAuthUserProfile } from "../../hooks/useAuthUser";

/**
 * Home dashboard — session already warmed by Layout shell.
 * No extra spinner here (avoids double loading).
 */
const Dashboard = () => {
  const { user, permissions, roleName, isError, error } = useAuthUserProfile();

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

  if (!user) return null;

  return (
    <DashboardRouter
      role={roleName || user?.roleName}
      permissions={permissions}
    />
  );
};

export default Dashboard;
