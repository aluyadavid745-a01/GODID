import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../state/AuthContext";
import type { Role } from "../../types/domain";

export const ProtectedRoute = ({ role }: { role?: Role }) => {
  const { user, isReady } = useAuth();
  const location = useLocation();
  if (!isReady) return <div className="min-h-screen bg-cream" />;
  if (!user) return <Navigate to={role === "admin" ? "/admin/login" : "/login"} replace state={{ from: location.pathname }} />;
  if (role && user.role !== role) return <Navigate to={role === "admin" ? "/admin/login" : "/"} replace />;
  return <Outlet />;
};
