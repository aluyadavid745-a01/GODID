'use client'
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "../../state/AuthContext";
import type { Role } from "../../types/domain";

interface Props {
  children: React.ReactNode;
  role?: Role;
}

export const ProtectedRoute = ({ children, role }: Props) => {
  const { user, isReady } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isReady) return;
    if (!user) {
      router.push(role === "admin" ? "/admin/login" : "/login");
      return;
    }
    if (role && user.role !== role) {
      router.push(role === "admin" ? "/admin/login" : "/");
    }
  }, [user, isReady, router, role]);

  if (!isReady) return <div className="min-h-screen bg-cream" />;
  if (!user) return null;
  if (role && user.role !== role) return null;
  return <>{children}</>;
};
