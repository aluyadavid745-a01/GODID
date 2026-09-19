'use client'
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import type { Role } from "../types/domain";
import { firebaseConfig, firebaseConfigured } from "../services/firebaseConfig";

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
    if (typeof window === "undefined") return null;
    const saved = localStorage.getItem("godid-auth");
    return saved ? JSON.parse(saved) as User : null;
  });
  const [isReady, setIsReady] = useState(!firebaseConfigured);
  const auth = useMemo(() => {
    if (!firebaseConfigured) return null;
    const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    return getAuth(app);
  }, []);

  const persist = (next: User | null) => {
    setUser(next);
    if (typeof window !== "undefined") {
      if (next) localStorage.setItem("godid-auth", JSON.stringify(next));
      else localStorage.removeItem("godid-auth");
    }
  };

  useEffect(() => {
    if (!auth) return undefined;
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        if (typeof window !== "undefined") localStorage.removeItem("godid-api-token");
        persist(null);
        setIsReady(true);
        return;
      }
      const token = await firebaseUser.getIdToken();
      const claims = await firebaseUser.getIdTokenResult();
      if (typeof window !== "undefined") localStorage.setItem("godid-api-token", token);
      persist({
        id: firebaseUser.uid,
        name: firebaseUser.displayName ?? firebaseUser.email ?? "GODID Admin",
        email: firebaseUser.email ?? "",
        role: claims.claims.admin === true ? "admin" : "customer",
      });
      setIsReady(true);
    });
  }, [auth]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAdmin: user?.role === "admin",
      isReady,
      login: async (email, password, role = "customer") => {
        if (firebaseConfigured && process.env.NEXT_PUBLIC_DEMO_MODE !== "true") {
          const credential = await signInWithEmailAndPassword(auth!, email.trim(), password);
          const tokenResult = await credential.user.getIdTokenResult(true);
          if (role === "admin" && tokenResult.claims.admin !== true) {
            await signOut(auth!);
            throw new Error("This Firebase account does not have the GODID admin claim.");
          }
          if (typeof window !== "undefined") localStorage.setItem("godid-api-token", await credential.user.getIdToken());
          persist({
            id: credential.user.uid,
            name: credential.user.displayName ?? credential.user.email ?? "GODID Admin",
            email: credential.user.email ?? email.trim().toLowerCase(),
            role,
          });
          return;
        }
        if (process.env.NEXT_PUBLIC_DEMO_MODE !== "true") throw new Error("Admin/customer login is disabled until a secure non-Firebase auth server is configured.");
        if (password.length < 8) throw new Error("Password must be at least 8 characters.");
        persist({ id: role === "admin" ? "admin-demo" : "customer-demo", name: role === "admin" ? "Store Owner" : "GODID Customer", email: email.trim().toLowerCase(), role });
      },
      register: async (name, email, password) => {
        if (process.env.NEXT_PUBLIC_DEMO_MODE !== "true") throw new Error("Customer registration is disabled until a secure non-Firebase auth server is configured.");
        if (password.length < 8) throw new Error("Password must be at least 8 characters.");
        persist({ id: "customer-demo", name: name.trim(), email: email.trim().toLowerCase(), role: "customer" });
      },
      logout: () => {
        if (typeof window !== "undefined") localStorage.removeItem("godid-api-token");
        if (auth) void signOut(auth);
        persist(null);
      },
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
