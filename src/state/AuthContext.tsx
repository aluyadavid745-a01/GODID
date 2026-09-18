import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Role } from "../types/domain";
import { authApi, apiConfigured } from "../services/api";

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string, role?: Role) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  isReady: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("godid-auth");
    return saved ? JSON.parse(saved) as User : null;
  });
  const isReady = true;
  const persist = (next: User | null) => {
    setUser(next);
    if (next) localStorage.setItem("godid-auth", JSON.stringify(next));
    else localStorage.removeItem("godid-auth");
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAdmin: user?.role === "admin",
      isReady,
      login: async (email, password, role = "customer") => {
        if (apiConfigured && import.meta.env.VITE_DEMO_MODE !== "true") {
          if (role !== "admin") throw new Error("Customer accounts are not enabled on this demo backend yet.");
          const result = await authApi.login(email, password);
          localStorage.setItem("godid-api-token", result.token);
          persist(result.user);
          return;
        }
        if (import.meta.env.VITE_DEMO_MODE !== "true") throw new Error("Admin/customer login is disabled until a secure non-Firebase auth server is configured.");
        if (password.length < 8) throw new Error("Password must be at least 8 characters.");
        persist({ id: role === "admin" ? "admin-demo" : "customer-demo", name: role === "admin" ? "Store Owner" : "GODID Customer", email: email.trim().toLowerCase(), role });
      },
      register: async (name, email, password) => {
        if (import.meta.env.VITE_DEMO_MODE !== "true") throw new Error("Customer registration is disabled until a secure non-Firebase auth server is configured.");
        if (password.length < 8) throw new Error("Password must be at least 8 characters.");
        persist({ id: "customer-demo", name: name.trim(), email: email.trim().toLowerCase(), role: "customer" });
      },
      logout: () => { localStorage.removeItem("godid-api-token"); persist(null); },
    }),
    [isReady, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
};
