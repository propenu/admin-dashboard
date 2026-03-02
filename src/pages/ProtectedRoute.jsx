import { Navigate, Outlet } from "react-router-dom";
import Cookies from "js-cookie";

const ProtectedRoute = () => {
  const token = Cookies.get("token");

  // If token not found → redirect to signin
  if (!token) {
    return <Navigate to="/signin" replace />;
  }

  // Token exists → allow access
  return <Outlet />;
};

export default ProtectedRoute;
