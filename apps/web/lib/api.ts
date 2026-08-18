import type { Booking, Capacity, Service, Vehicle } from "./types";

export const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

type AuthOptions = {
  getToken: () => Promise<string | null>;
  demoUserId?: string;
};

export async function apiRequest<T>(path: string, auth?: AuthOptions, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json");
  if (auth) {
    const token = await auth.getToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
    if (auth.demoUserId) headers.set("x-demo-user-id", auth.demoUserId);
  }
  const response = await fetch(`${apiBase}${path}`, { ...init, headers, cache: "no-store" });
  const body = (await response.json().catch(() => ({}))) as T & { error?: string };
  if (!response.ok) throw new Error(body.error || "Request failed. Please try again.");
  return body;
}

export type CustomerOverview = {
  user: { _id: string; name: string; email: string; role: "customer" | "admin" };
  loyalty: { stamps: number; lifetimeStamps: number; rewardsRedeemed: number };
  vehicleCount: number;
  completedWashes: number;
};

export type AdminDashboardData = {
  revenue: {
    week: { total: number; count: number };
    month: { total: number; count: number };
    year: { total: number; count: number };
  };
  capacity: Capacity;
  todayBookings: number;
  pendingBookings: number;
  dailyRevenue: { _id: string; total: number }[];
  recent: Booking[];
};

export type { Booking, Capacity, Service, Vehicle };
