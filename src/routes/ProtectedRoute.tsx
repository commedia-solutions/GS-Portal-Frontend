import { Navigate, Outlet } from "react-router-dom";
import { getAuthToken } from "../api/http";

export default function ProtectedRoute() {
  const hasToken = !!getAuthToken();
  return hasToken ? <Outlet /> : <Navigate to="/login" replace />;
}
