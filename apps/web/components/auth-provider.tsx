"use client";

import { ClerkProvider, useAuth, useUser } from "@clerk/nextjs";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type AppUser = {
  id: string;
  name: string;
  email: string;
  imageUrl?: string;
  demoRole?: "customer" | "admin";
};

type AuthContextValue = {
  user: AppUser | null;
  isLoaded: boolean;
  isSignedIn: boolean;
  isDemo: boolean;
  getToken: () => Promise<string | null>;
  demoSignIn: (role: "customer" | "admin") => void;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

function ClerkBridge({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn, getToken, signOut } = useAuth();
  const { user } = useUser();
  const value = useMemo<AuthContextValue>(
    () => ({
      user: user
        ? {
            id: user.id,
            name: user.fullName || user.firstName || "WashWise Customer",
            email: user.primaryEmailAddress?.emailAddress || "",
            imageUrl: user.imageUrl
          }
        : null,
      isLoaded,
      isSignedIn: Boolean(isSignedIn),
      isDemo: false,
      getToken,
      demoSignIn: () => undefined,
      signOut: async () => signOut({ redirectUrl: "/" })
    }),
    [getToken, isLoaded, isSignedIn, signOut, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function DemoProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<"customer" | "admin" | null>(null);

  useEffect(() => {
    const stored = window.sessionStorage.getItem("washwise-demo-role");
    if (stored === "customer" || stored === "admin") setRole(stored);
  }, []);

  const demoSignIn = useCallback((nextRole: "customer" | "admin") => {
    window.sessionStorage.setItem("washwise-demo-role", nextRole);
    setRole(nextRole);
  }, []);

  const signOut = useCallback(async () => {
    window.sessionStorage.removeItem("washwise-demo-role");
    setRole(null);
    window.location.href = "/";
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: role
        ? role === "admin"
          ? { id: "demo-admin", name: "Alex Admin", email: "admin@washwise.demo", demoRole: "admin" }
          : { id: "demo-customer", name: "Jamie Cruz", email: "customer@washwise.demo", demoRole: "customer" }
        : null,
      isLoaded: true,
      isSignedIn: Boolean(role),
      isDemo: true,
      getToken: async () => null,
      demoSignIn,
      signOut
    }),
    [demoSignIn, role, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function AppAuthProvider({ children }: { children: React.ReactNode }) {
  if (!clerkKey) return <DemoProvider>{children}</DemoProvider>;
  return (
    <ClerkProvider publishableKey={clerkKey}>
      <ClerkBridge>{children}</ClerkBridge>
    </ClerkProvider>
  );
}

export function useAppAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAppAuth must be used inside AppAuthProvider");
  return context;
}

export const hasClerk = Boolean(clerkKey);
