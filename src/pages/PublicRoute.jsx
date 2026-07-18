import { Navigate, Outlet } from "react-router-dom";
import { getAuthToken } from "../utils/authToken";

const PublicRoute = () => {
  const token = getAuthToken();

  // If already logged in → redirect to dashboard
  if (token) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
