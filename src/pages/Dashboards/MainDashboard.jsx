import React, { useEffect, useState } from "react";
import { fetchLoggedInUser } from "../../services/UserServices/userServices";
import DashboardRouter from "./DashboardRouter";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLoggedInUser()
      .then((res) => {
        setUser(res);
      })
      .catch((err) => {
        console.error("User Fetch Error", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return <DashboardRouter role={user?.roleName} />;
};

export default Dashboard;
