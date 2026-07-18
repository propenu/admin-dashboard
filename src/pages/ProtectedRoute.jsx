import { Navigate, Outlet } from "react-router-dom";
import { getAuthToken } from "../utils/authToken";

const ProtectedRoute = () => {
  const token = getAuthToken();

  // If token not found → redirect to signin
  if (!token) {
    return <Navigate to="/signin" replace />;
  }

  // Token exists → allow access
  return <Outlet />;
};

export default ProtectedRoute;
