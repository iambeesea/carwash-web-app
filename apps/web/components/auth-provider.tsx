"use client";

import { ClerkProvider, useAuth, useUser } from "@clerk/nextjs";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiBase } from "@/lib/api";

export type AppUser = {
  id: string;
  name: string;
  email: string;
  imageUrl?: string;
  role: "customer" | "admin";
};

type AuthContextValue = {
  user: AppUser | null;
  isLoaded: boolean;
  isSignedIn: boolean;
  isDemo: false;
  getToken: () => Promise<string | null>;
  signIn: (email: string, password: string) => Promise<AppUser>;
  signUp: (name: string, email: string, password: string) => Promise<AppUser>;
  signInWithGoogle: (credential: string) => Promise<AppUser>;
  signOut: () => Promise<void>;
};

type AuthResponse = { token: string; user: AppUser; error?: string };

const AuthContext = createContext<AuthContextValue | null>(null);
const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const tokenStorageKey = "washwise-auth-token";

async function unavailable(): Promise<never> {
  throw new Error("This sign-in method is not available.");
}

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
            imageUrl: user.imageUrl,
            role: "customer"
          }
        : null,
      isLoaded,
      isSignedIn: Boolean(isSignedIn),
      isDemo: false,
      getToken,
      signIn: unavailable,
      signUp: unavailable,
      signInWithGoogle: unavailable,
      signOut: async () => signOut({ redirectUrl: "/" })
    }),
    [getToken, isLoaded, isSignedIn, signOut, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function NativeAuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const clearSession = useCallback(() => {
    window.localStorage.removeItem(tokenStorageKey);
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const savedToken = window.localStorage.getItem(tokenStorageKey);
    if (!savedToken) {
      setIsLoaded(true);
      return;
    }

    fetch(`${apiBase}/auth/me`, {
      headers: { Authorization: `Bearer ${savedToken}` },
      cache: "no-store"
    })
      .then(async (response) => {
        const body = await response.json() as { user?: AppUser };
        if (!response.ok || !body.user) throw new Error("Session expired");
        setToken(savedToken);
        setUser(body.user);
      })
      .catch(clearSession)
      .finally(() => setIsLoaded(true));
  }, [clearSession]);

  const authenticate = useCallback(async (path: string, body: Record<string, string>) => {
    const response = await fetch(`${apiBase}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const result = await response.json().catch(() => ({})) as Partial<AuthResponse>;
    if (!response.ok || !result.token || !result.user) {
      throw new Error(result.error || "Unable to authenticate. Please try again.");
    }
    window.localStorage.setItem(tokenStorageKey, result.token);
    setToken(result.token);
    setUser(result.user);
    return result.user;
  }, []);

  const signIn = useCallback(
    (email: string, password: string) => authenticate("/auth/login", { email, password }),
    [authenticate]
  );
  const signUp = useCallback(
    (name: string, email: string, password: string) => authenticate("/auth/register", { name, email, password }),
    [authenticate]
  );
  const signInWithGoogle = useCallback(
    (credential: string) => authenticate("/auth/google", { credential }),
    [authenticate]
  );
  const getToken = useCallback(async () => token, [token]);
  const signOut = useCallback(async () => {
    clearSession();
    window.location.href = "/";
  }, [clearSession]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isLoaded,
    isSignedIn: Boolean(user && token),
    isDemo: false,
    getToken,
    signIn,
    signUp,
    signInWithGoogle,
    signOut
  }), [getToken, isLoaded, signIn, signInWithGoogle, signOut, signUp, token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function AppAuthProvider({ children }: { children: React.ReactNode }) {
  if (!clerkKey) return <NativeAuthProvider>{children}</NativeAuthProvider>;
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
export const hasGoogle = Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
